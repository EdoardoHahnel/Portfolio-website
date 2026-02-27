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
    const response = await fetch('/api/portfolio');
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
    companies.forEach(company => {
        const raw = cleanValue(company[field]);
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

    const colorPalette = ['#4F46E5', '#6366F1', '#7C3AED', '#8B5CF6', '#3B82F6', '#5B21B6', '#6D28D9', '#4338CA', '#818CF8', '#A78BFA'];
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

    const filtered = portfolioCompanies.filter(company => cleanValue(company[cfg.field]) === activeSelection);
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
        const entry = cleanValue(company.entry) || 'N/A';
        const geography = categorizeGeography(market);
        return `
            <tr>
                <td>${escapeHtml(cleanCompany)}</td>
                <td>${escapeHtml(owner)}</td>
                <td>${escapeHtml(sector)}</td>
                <td>${escapeHtml(market)}</td>
                <td>${escapeHtml(hq)}</td>
                <td>${escapeHtml(entry)}</td>
                <td>${escapeHtml(geography)}</td>
            </tr>
        `;
    }).join('');
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
            const parsed = Number(cleanValue(company.entry));
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

