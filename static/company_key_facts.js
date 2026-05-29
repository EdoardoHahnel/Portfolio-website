/**
 * Split company.description / detailed_description into narrative vs registry-style snapshot,
 * and render a structured "Figures & source" block (company detail + portfolio modal).
 */
(function (global) {
    'use strict';

    function pickLonger(a, b) {
        if (!a) return b || '';
        if (!b) return a;
        return a.length >= b.length ? a : b;
    }

    /**
     * @returns {{ overview: string, snapshotTitle: string, snapshotBody: string }}
     */
    function splitOverviewAndSnapshot(company) {
        const descExpanded = (company.description || '').trim();
        const descDetailed = (company.detailed_description || '').trim();
        const full = pickLonger(descExpanded, descDetailed);
        const fallback =
            `${company.company} is a ${company.sector || 'business'} company based in ${company.headquarters || company.market || 'the Nordic region'}. The company operates in the ${company.sector || 'business services'} sector and is a portfolio company of ${company.source || 'a leading PE firm'}.`;

        if (!full) {
            return { overview: fallback, snapshotTitle: '', snapshotBody: '' };
        }

        const snapRe =
            /(Registry snapshot|Portfolio snapshot|Compiled snapshot)\s*(\([^)]+\))\s*:\s*([\s\S]*)$/;
        const m = full.match(snapRe);
        if (!m) {
            return { overview: full, snapshotTitle: '', snapshotBody: '' };
        }
        const overview = full.slice(0, m.index).trim();
        return {
            overview: overview || full.slice(0, m.index).trim(),
            snapshotTitle: m[1] + m[2],
            snapshotBody: (m[3] || '').trim(),
        };
    }

    function formatLabel(raw) {
        if (!raw) return '';
        const s = raw.trim();
        if (/^ebitda$/i.test(s)) return 'EBITDA';
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    /** Registry placeholders (e.g. Adelis portfolio) — omit from the figures grid */
    function isPlaceholderValue(v) {
        if (v == null) return true;
        const s = String(v).trim();
        if (!s) return true;
        if (/^to be researched\.?$/i.test(s)) return true;
        if (/^(tbd|tbc)$/i.test(s)) return true;
        return false;
    }

    /** Split e.g. "EBITDA SEK x. Legal form: aktiebolag" into separate snapshot fragments */
    function expandFusedSnapshotSegments(rawSegments) {
        const fuseRe = /^(.+?\.)\s+([A-Za-zÅÄÖåäöÜüÆæØøß][^:]{0,140}:\s*.+)$/;
        const out = [];
        rawSegments.forEach(function (seg) {
            seg = seg.trim();
            if (!seg) return;
            const fused = seg.match(fuseRe);
            if (fused) {
                out.push(fused[1].trim().replace(/\.\s*$/, ''));
                out.push(fused[2].trim().replace(/\.\s*$/, ''));
            } else {
                out.push(seg.replace(/\.\s*$/, '').trim());
            }
        });
        return out;
    }

    function isLegalFormRow(label) {
        return /^legal form$/i.test(String(label || '').trim());
    }

    /** UC table amounts are tSEK; cell may use Unicode minus */
    function thousandsCellToSek(cellStr) {
        if (cellStr == null || cellStr === '—') return null;
        const raw = String(cellStr).trim();
        if (!raw) return null;
        let s = raw.replace(/\s/g, '');
        const neg = /^[\u2212−-]/.test(s);
        if (neg) s = s.replace(/^[\u2212−-]+/, '');
        s = s.replace(/,/g, '');
        const n = parseInt(s, 10);
        if (isNaN(n)) return null;
        return (neg ? -n : n) * 1000;
    }

    /** Full SEK, thin-space style grouping simplified to locale */
    function formatSekFromAbsoluteSek(sek) {
        const neg = sek < 0;
        const abs = Math.round(Math.abs(sek));
        const formatted = abs.toLocaleString('sv-SE');
        return (neg ? '−' : '') + 'SEK ' + formatted;
    }

    /** Resultaträkning table reference (titles may vary slightly) */
    function findResultatrakningTable(f) {
        const tables = f && f.tables ? f.tables : [];
        for (let i = 0; i < tables.length; i++) {
            const ttl = normFinancialLabel(tables[i].title || '');
            if (ttl.indexOf('resultat') !== -1 && ttl.indexOf('balans') === -1) {
                return tables[i];
            }
        }
        return null;
    }

    function plCell(pl, labelSv, periodIndex) {
        if (!pl || !pl.rows) return null;
        const want = normFinancialLabel(labelSv);
        for (let i = 0; i < pl.rows.length; i++) {
            if (normFinancialLabel(pl.rows[i].label || '') === want) {
                const vals = pl.rows[i].values;
                if (vals && vals[periodIndex] != null) return vals[periodIndex];
            }
        }
        return null;
    }

    /**
     * Period column for Figures & source headline numbers (Revenue, Net result…).
     * Default 0 = first entry in period_labels / values[] (Belid: FY2024 column).
     * Set financials.figures_period_index to override if your values[] order differs.
     */
    function financialsHeadlinePeriodIndex(f) {
        if (f && typeof f.figures_period_index === 'number') {
            const n = Math.floor(f.figures_period_index);
            if (!isNaN(n) && n >= 0) return n;
        }
        return 0;
    }

    /**
     * Override Revenue / Net result / EBITDA from structured financials.
     * Revenue = Nettoomsättning (net sales) when present, else Omsättning (includes övrig omsättning).
     * Uses financials.period_labels[0] (same column as tables' values[0]).
     */
    function mergeFigureRowsWithFinancials(company, rows) {
        let out = (rows || []).filter(function (r) {
            return !isLegalFormRow(r.label);
        });
        if (!hasFinancialsPayload(company.financials)) {
            return out;
        }
        const pl = findResultatrakningTable(company.financials);
        if (!pl) return out;

        const stripHeadlines = { revenue: true, 'net result': true, ebitda: true };
        out = out.filter(function (r) {
            const k = (r.label || '').trim().toLowerCase();
            return !stripHeadlines[k];
        });

        const idx = financialsHeadlinePeriodIndex(company.financials);
        const head = [];
        const netto = plCell(pl, 'Nettoomsättning', idx);
        const brutto = plCell(pl, 'Omsättning', idx);
        const revRaw = netto != null ? netto : brutto;
        const net = plCell(pl, 'Årets resultat', idx);
        const ebd = plCell(pl, 'EBITDA', idx);

        if (revRaw != null) {
            const sek = thousandsCellToSek(revRaw);
            if (sek != null) head.push({ label: 'Revenue', value: formatSekFromAbsoluteSek(sek) });
        }
        if (ebd != null) {
            const sek = thousandsCellToSek(ebd);
            if (sek != null) head.push({ label: 'EBITDA', value: formatSekFromAbsoluteSek(sek) });
        }
        if (net != null) {
            const sek = thousandsCellToSek(net);
            if (sek != null) head.push({ label: 'Net result', value: formatSekFromAbsoluteSek(sek) });
        }

        return head.concat(out);
    }

    /**
     * Turn snapshot body (after "Registry snapshot (...): ") into label/value rows.
     */
    function snapshotBodyToRows(body) {
        if (!body) return [];
        const split = body.split(/\s*;\s*/).map(function (s) {
            return s.trim();
        }).filter(Boolean);
        const segments = expandFusedSnapshotSegments(split);

        const rows = [];
        const labelPatterns = [
            [/^revenue growth\b/i, 'Revenue growth'],
            [/^net result\b/i, 'Net result'],
            [/^ebit\b/i, 'EBIT'],
            [/^operating profit\b/i, 'Operating profit'],
            [/^operating margin\b/i, 'Operating margin'],
            [/^equity ratio\b/i, 'Equity ratio'],
            [/^ebitda\b/i, 'EBITDA'],
            [/^revenue\b/i, 'Revenue'],
            [/^legal form\b/i, 'Legal form'],
            [/^founded\b/i, 'Founded'],
            [/^chairman\b/i, 'Chairman'],
            [/^ceos\b/i, 'CEOs'],
            [/^ceo\b/i, 'CEO'],
        ];

        segments.forEach(function (seg) {
            seg = seg.replace(/\.\s*$/, '').trim();
            if (!seg) return;
            const colon = seg.match(/^([^:]+):\s*(.+)$/);
            if (colon) {
                const lab = formatLabel(colon[1]);
                if (isLegalFormRow(lab)) return;
                rows.push({ label: lab, value: colon[2].trim() });
                return;
            }
            const low = seg.toLowerCase();
            if (low.indexOf('note:') === 0) {
                rows.push({ label: 'Note', value: seg.replace(/^note:\s*/i, '').trim() });
                return;
            }
            for (let i = 0; i < labelPatterns.length; i++) {
                const re = labelPatterns[i][0];
                const lab = labelPatterns[i][1];
                if (re.test(seg)) {
                    if (isLegalFormRow(lab)) return;
                    rows.push({ label: lab, value: seg.replace(re, '').trim() });
                    return;
                }
            }
            rows.push({ label: '', value: seg });
        });
        return rows;
    }

    function mergeLeadershipRows(company, rows) {
        const have = function (lab) {
            return rows.some(function (r) {
                return (r.label || '').toLowerCase() === lab.toLowerCase();
            });
        };
        const out = rows.slice();
        if (company.chairman && !have('chairman') && !isPlaceholderValue(company.chairman)) {
            out.push({ label: 'Chairman', value: company.chairman });
        }
        if (company.ceo && !have('ceo') && !isPlaceholderValue(company.ceo)) {
            out.push({ label: 'CEO', value: company.ceo });
        }
        return out;
    }

    function hasFinancialsPayload(f) {
        if (!f || typeof f !== 'object') return false;
        return Boolean(
            (f.tables && f.tables.length) ||
                (f.book_year && f.book_year.rows && f.book_year.rows.length) ||
                (f.legal_entity && String(f.legal_entity).trim()) ||
                (f.org_nr && String(f.org_nr).trim())
        );
    }

    /** Lowercase + trim for stable matching (Swedish labels). */
    function normFinancialLabel(s) {
        return String(s || '')
            .trim()
            .replace(/\s+/g, ' ')
            .toLowerCase();
    }

    /**
     * Bold + row tint for key P&L / balance lines only (not Bokslut / löner tables).
     * @returns {'financials-row--grand'|'financials-row--mid'|''}
     */
    /** "2024-12" → "2024" for chart axis */
    function formatPeriodChartLabel(periodKey) {
        const s = String(periodKey || '').trim();
        const m = s.match(/^(\d{4})/);
        if (m) return m[1];
        return s || '—';
    }

    /**
     * Revenue (Nettoomsättning or Omsättning) + Årets resultat by period, oldest → newest.
     * Values in thousands SEK (tSEK) for chart scale.
     */
    function buildFinancialsChartData(f) {
        const pl = findResultatrakningTable(f);
        const periods = (f && f.period_labels) || [];
        if (!pl || periods.length < 2) return null;

        const order = periods
            .map(function (_, i) {
                return i;
            })
            .sort(function (a, b) {
                return String(periods[a]).localeCompare(String(periods[b]));
            });

        const labels = [];
        const revenue = [];
        const netResult = [];

        order.forEach(function (i) {
            const netto = plCell(pl, 'Nettoomsättning', i);
            const brutto = plCell(pl, 'Omsättning', i);
            const revSek = thousandsCellToSek(netto != null ? netto : brutto);
            const netSek = thousandsCellToSek(plCell(pl, 'Årets resultat', i));
            labels.push(formatPeriodChartLabel(periods[i]));
            revenue.push(revSek != null ? revSek / 1000 : null);
            netResult.push(netSek != null ? netSek / 1000 : null);
        });

        const hasRev = revenue.some(function (v) {
            return v != null;
        });
        const hasNet = netResult.some(function (v) {
            return v != null;
        });
        if (!hasRev && !hasNet) return null;

        return {
            labels: labels,
            revenue: revenue,
            netResult: netResult,
            unitNote: (f.amounts_note || 'Belopp i 1000 SEK').trim(),
        };
    }

    function formatTsekChartValue(tsek) {
        if (tsek == null || isNaN(tsek)) return '—';
        const abs = Math.abs(tsek);
        if (abs >= 1000) {
            return (tsek / 1000).toLocaleString('sv-SE', { maximumFractionDigits: 1 }) + ' MSEK';
        }
        return tsek.toLocaleString('sv-SE', { maximumFractionDigits: 0 }) + ' tSEK';
    }

    function financialsAxisTick(value) {
        const n = Number(value);
        if (!isFinite(n)) return value;
        if (Math.abs(n) >= 1000) {
            return (n / 1000).toLocaleString('sv-SE', { maximumFractionDigits: 0 }) + 'k';
        }
        return n.toLocaleString('sv-SE', { maximumFractionDigits: 0 });
    }

    function financialsNetAxisUsesZeroBaseline(values) {
        const nums = (values || []).filter(function (v) {
            return v != null && !isNaN(v);
        });
        if (!nums.length) return true;
        return nums.every(function (v) {
            return v >= 0;
        });
    }

    function destroyFinancialsChart(innerEl) {
        if (!innerEl) return;
        if (innerEl._financialsChartRo) {
            try {
                innerEl._financialsChartRo.disconnect();
            } catch (e) {
                /* ignore */
            }
            innerEl._financialsChartRo = null;
        }
        if (innerEl._financialsChart) {
            try {
                innerEl._financialsChart.destroy();
            } catch (e) {
                /* ignore */
            }
            innerEl._financialsChart = null;
        }
    }

    function renderFinancialsChartBlock(innerEl, f) {
        if (!innerEl || typeof global.Chart === 'undefined') return;
        const series = buildFinancialsChartData(f);
        if (!series) return;

        const wrap = document.createElement('div');
        wrap.className = 'financials-chart-block';
        const title = document.createElement('h4');
        title.className = 'financials-chart-title';
        title.textContent = 'Revenue & net income';
        wrap.appendChild(title);
        const canvasWrap = document.createElement('div');
        canvasWrap.className = 'financials-chart-canvas-wrap';
        const canvas = document.createElement('canvas');
        canvas.className = 'financials-trend-chart';
        canvas.setAttribute('role', 'img');
        canvas.setAttribute(
            'aria-label',
            'Chart of revenue and net result over ' + series.labels.join(', ')
        );
        canvasWrap.appendChild(canvas);
        wrap.appendChild(canvasWrap);
        innerEl.appendChild(wrap);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        destroyFinancialsChart(innerEl);

        const FONT =
            "'Inter', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
        const COLOR_REVENUE = '#4F46E5';
        const COLOR_REVENUE_DEEP = '#3730A3';
        const COLOR_NET = '#0F766E';
        const COLOR_NET_LIGHT = '#14B8A6';
        const COLOR_AXIS = '#64748B';
        const COLOR_GRID = 'rgba(148, 163, 184, 0.22)';
        const COLOR_TICK = '#475569';

        function revenueBarFill(chart) {
            const h = chart.height || 300;
            const g = chart.ctx.createLinearGradient(0, 0, 0, h);
            g.addColorStop(0, '#6366F1');
            g.addColorStop(1, COLOR_REVENUE_DEEP);
            return g;
        }

        function resizeFinancialsChart() {
            const chart = innerEl._financialsChart;
            if (!chart) return;
            try {
                chart.resize();
            } catch (e) {
                /* ignore */
            }
        }

        innerEl._financialsChart = new global.Chart(ctx, {
            type: 'bar',
            data: {
                labels: series.labels,
                datasets: [
                    {
                        type: 'bar',
                        label: 'Revenue',
                        data: series.revenue,
                        backgroundColor: function (context) {
                            return revenueBarFill(context.chart);
                        },
                        hoverBackgroundColor: COLOR_REVENUE_DEEP,
                        borderRadius: 4,
                        maxBarThickness: 56,
                        categoryPercentage: 0.68,
                        barPercentage: 0.88,
                        borderSkipped: false,
                        order: 2,
                        yAxisID: 'y',
                    },
                    {
                        type: 'line',
                        label: 'Net income',
                        data: series.netResult,
                        yAxisID: 'y1',
                        borderColor: COLOR_NET,
                        backgroundColor: 'rgba(20, 184, 166, 0.08)',
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: COLOR_NET_LIGHT,
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        tension: 0.15,
                        fill: false,
                        order: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: { top: 4, right: 12, bottom: 2, left: 4 },
                },
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: {
                        position: 'top',
                        align: 'end',
                        labels: {
                            usePointStyle: true,
                            pointStyleWidth: 10,
                            boxWidth: 8,
                            boxHeight: 8,
                            padding: 16,
                            font: {
                                family: FONT,
                                size: 11,
                                weight: '500',
                            },
                            color: COLOR_TICK,
                            generateLabels: function (chart) {
                                const defaults =
                                    global.Chart.defaults.plugins.legend.labels
                                        .generateLabels;
                                const items = defaults(chart);
                                items.forEach(function (item, i) {
                                    if (i === 0) item.pointStyle = 'rectRounded';
                                    else item.pointStyle = 'circle';
                                });
                                return items;
                            },
                        },
                    },
                    tooltip: {
                        backgroundColor: '#ffffff',
                        titleColor: '#0f172a',
                        bodyColor: '#334155',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 6,
                        cornerRadius: 6,
                        titleFont: {
                            family: FONT,
                            size: 12,
                            weight: '600',
                        },
                        bodyFont: { family: FONT, size: 11, weight: '500' },
                        displayColors: true,
                        callbacks: {
                            title: function (items) {
                                if (!items || !items.length) return '';
                                return items[0].label || '';
                            },
                            label: function (context) {
                                const v = context.parsed.y;
                                return (
                                    ' ' +
                                    context.dataset.label +
                                    ': ' +
                                    formatTsekChartValue(v)
                                );
                            },
                            footer: function () {
                                return series.unitNote ? [series.unitNote] : [];
                            },
                        },
                        footerFont: {
                            family: FONT,
                            size: 10,
                            weight: '400',
                            style: 'italic',
                        },
                        footerColor: '#94a3b8',
                    },
                },
                scales: {
                    y: {
                        type: 'linear',
                        position: 'left',
                        beginAtZero: true,
                        grace: '8%',
                        border: { display: false },
                        title: {
                            display: true,
                            text: 'Revenue',
                            font: {
                                family: FONT,
                                size: 10,
                                weight: '600',
                            },
                            color: COLOR_REVENUE,
                            padding: { bottom: 4 },
                        },
                        ticks: {
                            maxTicksLimit: 6,
                            font: { family: FONT, size: 10 },
                            color: COLOR_AXIS,
                            padding: 8,
                            callback: financialsAxisTick,
                        },
                        grid: {
                            color: COLOR_GRID,
                            drawBorder: false,
                        },
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        beginAtZero: financialsNetAxisUsesZeroBaseline(
                            series.netResult
                        ),
                        grace: '8%',
                        border: { display: false },
                        title: {
                            display: true,
                            text: 'Net income',
                            font: {
                                family: FONT,
                                size: 10,
                                weight: '600',
                            },
                            color: COLOR_NET,
                            padding: { bottom: 4 },
                        },
                        ticks: {
                            maxTicksLimit: 6,
                            font: { family: FONT, size: 10 },
                            color: COLOR_AXIS,
                            padding: 8,
                            callback: financialsAxisTick,
                        },
                        grid: {
                            drawOnChartArea: false,
                            drawBorder: false,
                        },
                    },
                    x: {
                        border: { display: false },
                        ticks: {
                            font: {
                                family: FONT,
                                size: 11,
                                weight: '500',
                            },
                            color: COLOR_TICK,
                            padding: 6,
                        },
                        grid: { display: false },
                    },
                },
            },
        });

        requestAnimationFrame(resizeFinancialsChart);
        setTimeout(resizeFinancialsChart, 50);
        if (typeof global.ResizeObserver === 'function') {
            if (innerEl._financialsChartRo) {
                try {
                    innerEl._financialsChartRo.disconnect();
                } catch (e) {
                    /* ignore */
                }
            }
            innerEl._financialsChartRo = new global.ResizeObserver(resizeFinancialsChart);
            innerEl._financialsChartRo.observe(canvasWrap);
        }
    }

    function financialRowEmphasisClass(tableTitle, rowLabel) {
        const t = normFinancialLabel(tableTitle);
        const lab = normFinancialLabel(rowLabel);
        if (!lab) return '';

        const isBS = t.indexOf('balans') !== -1;
        const isPL = t.indexOf('resultat') !== -1 && !isBS;
        if (!isBS && !isPL) return '';

        if (isPL) {
            if (lab === 'årets resultat') return 'financials-row--grand';
            return '';
        }

        if (lab === 'summa tillgångar' || lab === 'summa eget kapital och skulder') {
            return 'financials-row--grand';
        }
        if (
            lab === 'anläggningstillgångar' ||
            lab === 'omsättningstillgångar' ||
            lab === 'eget kapital'
        ) {
            return 'financials-row--mid';
        }
        return '';
    }

    /**
     * @param {HTMLElement} innerEl - .company-financials-inner
     * @param {object} f - company.financials
     */
    function renderFinancialsInner(innerEl, f) {
        if (!innerEl) return;
        destroyFinancialsChart(innerEl);
        innerEl.innerHTML = '';
        if (!hasFinancialsPayload(f)) return;

        renderFinancialsChartBlock(innerEl, f);

        if (f.legal_entity || f.org_nr || f.phone || f.address || f.corporate_note) {
            const ent = document.createElement('div');
            ent.className = 'financials-entity';
            if (f.legal_entity) {
                const nameEl = document.createElement('div');
                nameEl.className = 'financials-entity-name';
                nameEl.textContent = f.legal_entity;
                ent.appendChild(nameEl);
            }
            const dl = document.createElement('dl');
            dl.className = 'financials-entity-dl';
            function addDlRow(label, val) {
                if (!val) return;
                const dt = document.createElement('dt');
                dt.textContent = label;
                const dd = document.createElement('dd');
                dd.textContent = val;
                dl.appendChild(dt);
                dl.appendChild(dd);
            }
            addDlRow('Org.nr', f.org_nr);
            addDlRow('Telefon', f.phone);
            addDlRow('Adress', f.address);
            ent.appendChild(dl);
            if (f.corporate_note) {
                const note = document.createElement('p');
                note.className = 'financials-entity-note';
                note.textContent = f.corporate_note;
                ent.appendChild(note);
            }
            innerEl.appendChild(ent);
        }

        const periods = f.period_labels || [];

        function appendTable(title, unitNote, rows) {
            const tableTitle = title || '';
            const block = document.createElement('div');
            block.className = 'financials-table-block';
            const tHead = document.createElement('h4');
            tHead.className = 'financials-table-title';
            tHead.textContent = tableTitle;
            block.appendChild(tHead);
            if (unitNote) {
                const nu = document.createElement('p');
                nu.className = 'financials-unit-note';
                nu.textContent = unitNote;
                block.appendChild(nu);
            }
            const scroll = document.createElement('div');
            scroll.className = 'financials-scroll';
            const table = document.createElement('table');
            table.className = 'financials-grid';

            const colgroup = document.createElement('colgroup');
            const colLabel = document.createElement('col');
            colLabel.className = 'financials-col-label';
            colgroup.appendChild(colLabel);
            for (let ci = 0; ci < periods.length; ci++) {
                const cp = document.createElement('col');
                cp.className = 'financials-col-period';
                colgroup.appendChild(cp);
            }
            table.appendChild(colgroup);

            const thead = document.createElement('thead');
            const trh = document.createElement('tr');
            const thCorner = document.createElement('th');
            thCorner.scope = 'col';
            thCorner.textContent = '';
            trh.appendChild(thCorner);
            periods.forEach(function (p) {
                const cl = document.createElement('th');
                cl.scope = 'col';
                cl.textContent = p;
                trh.appendChild(cl);
            });
            thead.appendChild(trh);
            table.appendChild(thead);
            const tbody = document.createElement('tbody');
            (rows || []).forEach(function (row) {
                const tr = document.createElement('tr');
                const emph = financialRowEmphasisClass(tableTitle, row.label || '');
                if (emph) tr.classList.add(emph);
                const thRow = document.createElement('th');
                thRow.scope = 'row';
                thRow.textContent = row.label || '';
                tr.appendChild(thRow);
                const vals = row.values || [];
                for (let c = 0; c < periods.length; c++) {
                    const td = document.createElement('td');
                    const raw = vals[c];
                    td.textContent = raw === null || raw === undefined ? '—' : String(raw);
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            scroll.appendChild(table);
            block.appendChild(scroll);
            innerEl.appendChild(block);
        }

        if (f.book_year && f.book_year.rows && f.book_year.rows.length) {
            appendTable(f.book_year.title || 'Bokslutsperiod', null, f.book_year.rows);
        }
        if (f.tables && f.tables.length) {
            f.tables.forEach(function (tbl) {
                appendTable(
                    tbl.title || 'Tabell',
                    tbl.unit_note || f.amounts_note,
                    tbl.rows
                );
            });
        }

        if (f.source) {
            const src = document.createElement('p');
            src.className = 'financials-source-line';
            src.textContent = f.source;
            innerEl.appendChild(src);
        }
    }

    /**
     * Standalone Financials section (same card treatment as Figures & source).
     * @param {HTMLElement} sectionRoot - #companyFinancialsSection or #modalFinancialsSection
     * @param {object} company
     */
    function renderFinancialsSection(sectionRoot, company) {
        if (!sectionRoot) return;
        if (!company || typeof company !== 'object') {
            sectionRoot.style.display = 'none';
            sectionRoot.hidden = true;
            return;
        }
        const innerEl = sectionRoot.querySelector('.company-financials-inner');
        const f = company && company.financials;
        const headingEl = sectionRoot.querySelector('.financials-section-heading');

        sectionRoot.style.display = '';
        sectionRoot.hidden = false;
        if (headingEl) {
            headingEl.textContent =
                (f && f.section_title && String(f.section_title).trim()) || 'Financials';
        }

        const hasData = hasFinancialsPayload(f);

        if (hasData) {
            renderFinancialsInner(innerEl, f);
            return;
        }

        sectionRoot.style.display = 'none';
        sectionRoot.hidden = true;
    }
    /**
     * @param {HTMLElement} sectionRoot - element with .key-facts-source-meta, .key-facts-grid
     */
    function renderKeyFactsSection(sectionRoot, company) {
        if (!sectionRoot) return;

        const split = splitOverviewAndSnapshot(company);
        let rows = snapshotBodyToRows(split.snapshotBody);
        if (hasFinancialsPayload(company.financials)) {
            rows = mergeFigureRowsWithFinancials(company, rows);
        }
        const hasMetricsLink =
            company.metrics_url && typeof company.metrics_url === 'string' && company.metrics_url.trim();
        const hasMetricsBadge =
            company.metrics_source &&
            typeof company.metrics_source === 'string' &&
            company.metrics_source.trim();
        if (!rows.length && (company.metrics_source || company.metrics_url)) {
            if (company.revenue && !isPlaceholderValue(company.revenue)) {
                rows.push({ label: 'Revenue', value: company.revenue });
            }
            if (company.revenue_growth && !isPlaceholderValue(company.revenue_growth)) {
                rows.push({ label: 'Revenue growth', value: company.revenue_growth });
            }
            if (company.employees && !isPlaceholderValue(company.employees)) {
                rows.push({ label: 'Employees', value: String(company.employees) });
            }
        } else if (company.metrics_source || company.metrics_url) {
            const haveLab = function (want) {
                return rows.some(function (r) {
                    return (r.label || '').toLowerCase() === want;
                });
            };
            if (company.employees && !isPlaceholderValue(company.employees) && !haveLab('employees')) {
                rows.push({ label: 'Employees', value: String(company.employees) });
            }
            if (
                !hasFinancialsPayload(company.financials) &&
                company.revenue &&
                !isPlaceholderValue(company.revenue) &&
                !haveLab('revenue')
            ) {
                rows.push({ label: 'Revenue', value: company.revenue });
            }
        }
        rows = mergeLeadershipRows(company, rows);
        rows = rows.filter(function (r) {
            return !isPlaceholderValue(r.value);
        });

        const showSection = rows.length > 0 || !!hasMetricsLink || !!hasMetricsBadge;

        if (!showSection) {
            sectionRoot.style.display = 'none';
            sectionRoot.hidden = true;
            return;
        }

        sectionRoot.style.display = '';
        sectionRoot.hidden = false;

        const meta = sectionRoot.querySelector('.key-facts-source-meta');
        const grid = sectionRoot.querySelector('.key-facts-grid');
        if (grid) grid.innerHTML = '';

        if (meta) {
            meta.innerHTML = '';
            if (company.metrics_source) {
                const badge = document.createElement('span');
                badge.className = 'key-facts-badge';
                badge.textContent = company.metrics_source;
                meta.appendChild(badge);
            }
            if (company.metrics_url) {
                const a = document.createElement('a');
                a.className = 'key-facts-source-link';
                a.href = company.metrics_url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.innerHTML = 'View source <i class="fas fa-external-link-alt" aria-hidden="true"></i>';
                meta.appendChild(a);
            }
            meta.style.display = meta.children.length ? '' : 'none';
        }

        if (grid && rows.length) {
            rows.forEach(function (r) {
                const card = document.createElement('div');
                card.className = 'key-fact-card' + (r.label ? '' : ' key-fact-card--value-only');
                if (r.label) {
                    const lb = document.createElement('div');
                    lb.className = 'key-fact-label';
                    lb.textContent = r.label;
                    card.appendChild(lb);
                }
                const val = document.createElement('div');
                val.className = 'key-fact-value';
                val.textContent = r.value;
                card.appendChild(val);
                grid.appendChild(card);
            });
        }

        const subtitle = sectionRoot.querySelector('.key-facts-subtitle');
        if (subtitle) {
            subtitle.textContent =
                split.snapshotTitle ||
                (hasMetricsBadge || hasMetricsLink ? 'Latest reported figures' : '');
            subtitle.style.display = subtitle.textContent ? '' : 'none';
        }
    }

    function getOverviewText(company) {
        const split = splitOverviewAndSnapshot(company);
        if (split.overview) return split.overview;
        const descExpanded = (company.description || '').trim();
        const descDetailed = (company.detailed_description || '').trim();
        const full = pickLonger(descExpanded, descDetailed);
        return (
            full ||
            `${company.company} is a ${company.sector || 'business'} company based in ${company.headquarters || company.market || 'the Nordic region'}. The company operates in the ${company.sector || 'business services'} sector and is a portfolio company of ${company.source || 'a leading PE firm'}.`
        );
    }

    global.companyKeyFacts = {
        splitOverviewAndSnapshot: splitOverviewAndSnapshot,
        getOverviewText: getOverviewText,
        renderKeyFactsSection: renderKeyFactsSection,
        renderFinancialsSection: renderFinancialsSection,
    };
})(typeof window !== 'undefined' ? window : this);
