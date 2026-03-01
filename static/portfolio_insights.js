/*
Portfolio Insights page
*/

let portfolioCompanies = [];
let activeChartType = 'year';
let activeSelection = '';
let tableSortState = { column: 'company', direction: 'asc' };

const CHART_CONFIG = {
    year: { title: 'Investment Year Distribution', filterLabel: 'Year', field: 'entry', chartType: 'bar' },
    sector: { title: 'Industry Distribution', filterLabel: 'Sector', field: 'sector', chartType: 'pie' },
    country: { title: 'Country Distribution', filterLabel: 'Country', field: 'market', chartType: 'pie' }
};

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    activeChartType = (params.get('chart') || 'year').toLowerCase();
    if (!CHART_CONFIG[activeChartType]) activeChartType = 'year';
    activeSelection = (params.get('value') || '').trim();
    highlightActiveInsightsTab();
    setupTableSorting();

    await loadPortfolioData();
    renderInsightsView();
});

function setupTableSorting() {
    const headers = document.querySelectorAll('.insights-table-sortable');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-sort');
            if (!column) return;
            if (tableSortState.column === column) {
                tableSortState.direction = tableSortState.direction === 'asc' ? 'desc' : 'asc';
            } else {
                tableSortState.column = column;
                tableSortState.direction = 'asc';
            }
            updateTableSortHeaderUI();
            renderCompaniesTable(CHART_CONFIG[activeChartType]);
        });
    });
    updateTableSortHeaderUI();
}

function updateTableSortHeaderUI() {
    const headers = document.querySelectorAll('.insights-table-sortable');
    headers.forEach(header => {
        const column = header.getAttribute('data-sort');
        header.classList.remove('sorted-asc', 'sorted-desc');
        if (column !== tableSortState.column) return;
        header.classList.add(tableSortState.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
    });
}

function highlightActiveInsightsTab() {
    const tabMap = {
        year: 'insightsTabYear',
        sector: 'insightsTabSector',
        country: 'insightsTabCountry'
    };
    Object.values(tabMap).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
    const activeEl = document.getElementById(tabMap[activeChartType]);
    if (activeEl) activeEl.classList.add('active');
}

async function loadPortfolioData() {
    const response = await fetch('/api/portfolio?_=' + Date.now(), { cache: 'no-store' });
    const data = await response.json();
    portfolioCompanies = data.success && Array.isArray(data.companies) ? data.companies : [];
}

function renderInsightsView() {
    const cfg = CHART_CONFIG[activeChartType];
    const chartTitle = document.getElementById('insightsChartTitle');
    if (chartTitle) chartTitle.textContent = cfg.title;

    const grouped = aggregateByField(portfolioCompanies, cfg.field);
    const labels = grouped.map(item => item.label);
    const values = grouped.map(item => item.count);

    if (!activeSelection && labels.length > 0) {
        activeSelection = labels[0];
    }
    if (activeSelection && !labels.includes(activeSelection) && labels.length > 0) {
        activeSelection = labels[0];
    }

    renderInsightsSidePanel(cfg, labels, values);
    renderCompaniesTable(cfg);
    updateSelectionPill(cfg);
}

function aggregateByField(companies, field) {
    const counter = {};
    const normalize = (field === 'entry') ? v => normalizeEntryYear(cleanValue(v)) : v => cleanValue(v);
    companies.forEach(company => {
        const raw = normalize(company[field]);
        if (!raw) return;
        counter[raw] = (counter[raw] || 0) + 1;
    });
    return Object.entries(counter)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
}

function renderInsightsSidePanel(cfg, labels, values) {
    const visibleEl = document.getElementById('insightsVisibleCategories');
    const topEl = document.getElementById('insightsTopSegment');
    const totalEl = document.getElementById('insightsTotalCompanies');
    const listEl = document.getElementById('insightsCategoryList');
    if (!visibleEl || !topEl || !totalEl || !listEl) return;

    const total = values.reduce((a, b) => a + b, 0);
    const maxIdx = values.length ? values.reduce((best, value, idx, arr) => (value > arr[best] ? idx : best), 0) : -1;
    const topText = maxIdx >= 0 ? `${labels[maxIdx]} (${values[maxIdx]})` : '-';

    visibleEl.textContent = String(labels.length);
    topEl.textContent = topText;
    totalEl.textContent = `${total} total`;

    const colorPalette = ['#3f7de8', '#2f64c0', '#4a8ef4', '#2563eb', '#1e40af', '#3b82f6', '#60a5fa', '#0ea5e9', '#0284c7', '#0369a1'];
    listEl.innerHTML = labels.map((label, idx) => {
        const count = Number(values[idx]) || 0;
        const pct = total ? ((count / total) * 100).toFixed(1) : '0.0';
        const activeClass = label === activeSelection ? 'active' : '';
        return `
            <button class="insights-category-item ${activeClass}" data-label="${escapeHtml(label)}" type="button">
                <span class="insights-category-dot" style="background:${colorPalette[idx % colorPalette.length]}"></span>
                <span class="insights-category-text">${escapeHtml(label)}</span>
                <span class="insights-category-meta">${count} (${pct}%)</span>
            </button>
        `;
    }).join('');

    listEl.querySelectorAll('.insights-category-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const label = btn.getAttribute('data-label') || '';
            activeSelection = label;
            syncCategorySelectionUI();
            updateSelectionPill(cfg);
            renderCompaniesTable(cfg);
            const next = new URL(window.location.href);
            next.searchParams.set('chart', activeChartType);
            next.searchParams.set('value', activeSelection);
            window.history.replaceState({}, '', next.toString());
        });
    });
}

function syncCategorySelectionUI() {
    document.querySelectorAll('.insights-category-item').forEach(el => {
        const isActive = (el.getAttribute('data-label') || '') === activeSelection;
        el.classList.toggle('active', isActive);
    });
}

function renderCompaniesTable(cfg) {
    const body = document.getElementById('insightsTableBody');
    const title = document.getElementById('insightsTableTitle');
    const count = document.getElementById('insightsTableCount');
    if (!body || !title || !count) return;

    const getFieldValue = (c, f) => f === 'entry' ? normalizeEntryYear(cleanValue(c[f])) : cleanValue(c[f]);
    const filtered = portfolioCompanies.filter(company => getFieldValue(company, cfg.field) === activeSelection);
    const sorted = [...filtered].sort(compareCompaniesBySort);

    title.textContent = `${cfg.filterLabel}: ${activeSelection || 'None'}`;
    count.textContent = `${sorted.length} companies`;

    if (!sorted.length) {
        body.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#64748b;padding:1rem;">No companies found.</td></tr>`;
        return;
    }

    body.innerHTML = sorted.map(company => {
        const cleanCompany = cleanValue(company.company) || 'N/A';
        const owner = cleanValue(company.source) || 'N/A';
        const sector = cleanValue(company.sector) || 'N/A';
        const market = cleanValue(company.market) || 'N/A';
        const hq = cleanValue(company.headquarters || company.market) || 'N/A';
        const entry = normalizeEntryYear(cleanValue(company.entry)) || 'N/A';
        const geography = categorizeGeography(market);
        const description = company.description || company.detailed_description || '';
        const domain = extractCompanyDomain(company);
        const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanCompany)}&background=3f7de8&color=ffffff&size=64`;
        const logoUrl = getCompanyLogoUrl(company, domain, cleanCompany);
        const fallback2 = (domain ? `https://logo.clearbit.com/${domain}` : '') || avatarUrl;
        const slug = generateCompanySlug(company);
        const companyCell = `
            <span class="company-link-modal portfolio-uniform-cell" style="cursor: pointer;" data-slug="${escapeHtml(slug)}">
                <img src="${logoUrl}"
                     alt="${escapeHtml(cleanCompany)}"
                     class="company-logo"
                     onerror="this.onerror=null; this.src='${fallback2}'; this.onerror=function(){this.onerror=null; this.src='${avatarUrl}'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='inline';};}">
                <i class="fas fa-building company-icon-fallback" style="display:none;"></i>
                ${escapeHtml(cleanCompany)}
                <i class="fas fa-info-circle" style="margin-left: 8px; color: #3f7de8; opacity: 0.7;"></i>
            </span>
        `;
        return `
            <tr>
                <td class="company-name portfolio-uniform-cell" title="${escapeHtml(description)}">${companyCell}</td>
                <td>${escapeHtml(owner)}</td>
                <td>${escapeHtml(sector)}</td>
                <td>${escapeHtml(market)}</td>
                <td>${escapeHtml(hq)}</td>
                <td>${escapeHtml(entry)}</td>
                <td>${escapeHtml(geography)}</td>
            </tr>
        `;
    }).join('');

    body.querySelectorAll('.company-link-modal').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const slug = link.getAttribute('data-slug');
            if (slug) window.location.href = `/company/${slug}`;
        });
        link.addEventListener('mouseenter', () => {
            link.style.color = '#667eea';
            link.style.transform = 'translateX(4px)';
            link.style.transition = 'all 0.3s ease';
        });
        link.addEventListener('mouseleave', () => {
            link.style.color = '';
            link.style.transform = 'translateX(0)';
        });
    });
}

function compareCompaniesBySort(a, b) {
    const column = tableSortState.column;
    const dir = tableSortState.direction === 'asc' ? 1 : -1;
    const aValue = getSortValueForColumn(a, column);
    const bValue = getSortValueForColumn(b, column);
    if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * dir;
    }
    return String(aValue).localeCompare(String(bValue), undefined, { sensitivity: 'base', numeric: true }) * dir;
}

function getSortValueForColumn(company, column) {
    const market = cleanValue(company.market);
    switch (column) {
        case 'company':
            return cleanValue(company.company) || 'ZZZ';
        case 'owner':
            return cleanValue(company.source) || 'ZZZ';
        case 'sector':
            return cleanValue(company.sector) || 'ZZZ';
        case 'market':
            return market || 'ZZZ';
        case 'headquarters':
            return cleanValue(company.headquarters || company.market) || 'ZZZ';
        case 'entry': {
            const y = normalizeEntryYear(cleanValue(company.entry));
            const parsed = Number(y);
            return Number.isFinite(parsed) ? parsed : -Infinity;
        }
        case 'geography':
            return categorizeGeography(market);
        default:
            return '';
    }
}

function updateSelectionPill(cfg) {
    const pill = document.getElementById('insightsSelectionPill');
    if (!pill) return;
    pill.textContent = `${cfg.filterLabel}: ${activeSelection || 'None'}`;
}

function cleanValue(value) {
    return String(value || '').replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeEntryYear(raw) {
    if (raw == null || raw === '') return '';
    const s = String(raw).trim();
    if (s.includes('-')) {
        const y = s.split('-')[0];
        return (y.length === 4 && /^\d{4}$/.test(y)) ? y : s;
    }
    return (/^\d{4}$/.test(s) || /^\d{4}/.test(s)) ? s.substring(0, 4) : s;
}

function categorizeGeography(market) {
    const nordicCountries = ['Sweden', 'Denmark', 'Norway', 'Finland', 'Iceland'];
    if (market === 'Sweden') return 'Domestic';
    if (nordicCountries.includes(market)) return 'Nordic';
    return 'International';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ---- Company logo & detail link helpers (aligned with portfolio.js) ----
function extractDomain(url) {
    if (!url) return '';
    try {
        const u = (url.startsWith('http') ? url : 'https://' + url);
        const urlObj = new URL(u);
        return urlObj.hostname.replace(/^www\./, '');
    } catch (e) {
        return (url || '').replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    }
}

const COMPANY_DOMAIN_OVERRIDES = {
    'Brimer': 'brimer.no',
    'Lunawood': 'lunawood.com',
    'Enerco Group': 'enerco.se',
    'Nordic Grid Solutions': 'triarca.dk',
    'EITCO': 'eitco.de',
    'Cedra': 'cedra.se',
    'Vokstr': 'vokstr.no',
    're:mount': 'remount.fi',
    'netIP': 'netip.dk',
    'Ropo Capital': 'ropo.com',
    'Circura Danmark': 'circuradanmark.dk',
    'Circura': 'circuragroup.com',
    'DLVRY': 'dlvry.se',
    'RETTA': 'innagroup.se',
    '3Button Group': '3bg.se',
    'Briab': 'briab.se',
    'EWGroup': 'ewgroup.se',
    'eivis': 'eivis-group.com',
    'SI - Sustainable Intelligence': 'wearesi.se',
    'Umia': 'umia.se',
    'Safe Monitoring Group': 'safemonitoringgroup.com'
};

function extractCompanyDomain(company) {
    const name = (company && company.company) ? String(company.company).trim() : '';
    if (name && COMPANY_DOMAIN_OVERRIDES[name]) return COMPANY_DOMAIN_OVERRIDES[name];
    const websiteDomain = extractDomain((company && company.website) || '');
    if (websiteDomain) return websiteDomain;
    const rawLogo = (company && company.logo_url) || '';
    const idx = rawLogo.indexOf('logo.clearbit.com/');
    if (idx >= 0) {
        const tail = rawLogo.substring(idx + 18);
        return tail.split(/[/?#]/)[0].trim().replace(/^www\./, '');
    }
    return '';
}

function getCompanyLogoUrl(company, domain, cleanName) {
    const favicon = domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128` : '';
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName || 'Co')}&background=3f7de8&color=ffffff&size=64`;
    const rawLogo = (company && company.logo_url) || '';
    const clearbit = (rawLogo && !rawLogo.includes('ui-avatars.com')) ? rawLogo
        : (domain ? `https://logo.clearbit.com/${domain}` : '');
    return favicon || clearbit || avatar;
}

function generateCompanySlug(company) {
    const companyName = (company.company || 'company').toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/&/g, 'and');
    const source = (company.source || 'firm').toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
    return `${companyName}-${source}`;
}

