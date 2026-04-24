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

    /**
     * Turn snapshot body (after "Registry snapshot (...): ") into label/value rows.
     */
    function snapshotBodyToRows(body) {
        if (!body) return [];
        const segments = body.split(/\s*;\s*/).map(function (s) {
            return s.replace(/\.\s*$/, '').trim();
        }).filter(Boolean);

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
            const colon = seg.match(/^([^:]+):\s*(.+)$/);
            if (colon) {
                rows.push({ label: formatLabel(colon[1]), value: colon[2].trim() });
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

    /**
     * @param {HTMLElement} sectionRoot - element with .key-facts-source-meta, .key-facts-grid
     */
    function renderKeyFactsSection(sectionRoot, company) {
        if (!sectionRoot) return;

        const split = splitOverviewAndSnapshot(company);
        let rows = snapshotBodyToRows(split.snapshotBody);
        if (!rows.length && company.metrics_source) {
            if (company.revenue && !isPlaceholderValue(company.revenue)) {
                rows.push({ label: 'Revenue', value: company.revenue });
            }
            if (company.revenue_growth && !isPlaceholderValue(company.revenue_growth)) {
                rows.push({ label: 'Revenue growth', value: company.revenue_growth });
            }
            if (company.employees && !isPlaceholderValue(company.employees)) {
                rows.push({ label: 'Employees', value: String(company.employees) });
            }
        }
        rows = mergeLeadershipRows(company, rows);
        rows = rows.filter(function (r) {
            return !isPlaceholderValue(r.value);
        });

        /* Only show block when at least one non-placeholder row exists */
        const showSection = rows.length > 0;

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
                split.snapshotTitle || (company.metrics_source ? 'Latest reported figures' : '');
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
    };
})(typeof window !== 'undefined' ? window : this);
