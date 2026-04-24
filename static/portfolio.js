/*
===================================
Portfolio Companies - JavaScript
===================================
Handles portfolio company display and interactions
*/

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏢 Portfolio page initialized!');
    init();
    initModal();
});

const firmDomainOverrides = {
    'Alder': 'alder.se',
    'Celero Capital': 'celerocapital.com',
    'Celero': 'celerocapital.com',
    'FSN Capital': 'fsncapital.com',
    'Polaris': 'polarisequity.dk',
    'CapMan': 'capman.com',
    'Axcel': 'axcel.dk',
    'Amplio': 'amplio.se',
    'Helix Kapital': 'helixkapital.se',
    'Nordstjernan': 'nordstjernan.se',
    'Equip': 'equip.no',
    'Impilo': 'impilo.se',
    'MVI': 'mvi.se',
    'Nalka': 'nalka.com',
    'Triton': 'triton-partners.com',
    'Triton Partners': 'triton-partners.com',
    'Trill Impact': 'trillimpact.com'
};
let allPortfolioCompanies = [];
let portfolioTableSortState = { column: 'company', direction: 'asc' };

function init() {
    const searchInput = document.getElementById('portfolioSearchInput');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    if (searchInput) searchInput.addEventListener('input', handlePortfolioSearch);
    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearAllFilters);
    
    initMultiSelectFilters();
    initChartCardNavigation();
    loadPortfolio();
}

function initChartCardNavigation() {
    const chartMap = {
        yearChart: 'year',
        sectorChart: 'sector',
        countryChart: 'country'
    };
    const cards = document.querySelectorAll('.portfolio-chart-card');
    cards.forEach(card => {
        const canvasId = card.getAttribute('data-chart-canvas');
        const chartKey = chartMap[canvasId];
        if (!chartKey) return;
        card.style.cursor = 'pointer';
        card.addEventListener('click', (event) => {
            if (event.target && event.target.closest('canvas')) return;
            window.location.href = `/portfolio-insights?chart=${encodeURIComponent(chartKey)}`;
        });
    });
}

async function scrapePortfolio() {
    const refreshBtn = document.getElementById('refreshPortfolioBtn');
    if (!refreshBtn) return;
    const originalText = refreshBtn.innerHTML;
    
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    
    showLoading(true);
    hideStatusMessage();
    
    try {
        const response = await fetch('/api/portfolio/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showStatusMessage(`✅ Successfully scraped ${data.new_count} portfolio companies!`, 'success');
            await loadPortfolio();
        } else {
            showStatusMessage(`❌ Error: ${data.message}`, 'error');
        }
        
    } catch (error) {
        console.error('Error scraping portfolio:', error);
        showStatusMessage('❌ Failed to scrape portfolio data. Please try again.', 'error');
    } finally {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = originalText;
        showLoading(false);
    }
}

async function reloadPortfolio() {
    const refreshBtn = document.getElementById('refreshPortfolioBtn');
    if (!refreshBtn) return;
    const originalText = refreshBtn.innerHTML;
    
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Reloading...';
    
    showLoading(true);
    hideStatusMessage();
    
    try {
        const response = await fetch('/api/portfolio/reload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showStatusMessage(`✅ Reloaded ${data.total} companies (Valedo: ${data.valedo_partners}, Verdane: ${data.verdane})`, 'success');
            await loadPortfolio();
        } else {
            showStatusMessage(`❌ Error: ${data.message}`, 'error');
        }
        
    } catch (error) {
        console.error('Error reloading portfolio:', error);
        showStatusMessage('❌ Failed to reload portfolio data. Please try again.', 'error');
    } finally {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = originalText;
        showLoading(false);
    }
}

async function loadPortfolio() {
    showLoading(true);
    hideStatusMessage();
    
    try {
        const response = await fetch('/api/portfolio?_=' + Date.now(), { cache: 'no-store' });
        const data = await response.json();
        
        if (data.success) {
            allPortfolioCompanies = Array.isArray(data.companies) ? data.companies : [];
            populateFilterOptions(allPortfolioCompanies);
            renderFilteredPortfolio();
            calculateStatistics(allPortfolioCompanies);
        } else {
            showStatusMessage('❌ Failed to load portfolio data', 'error');
        }
        
    } catch (error) {
        console.error('Error loading portfolio:', error);
        showStatusMessage('❌ Failed to load portfolio. Please check if the server is running.', 'error');
    } finally {
        showLoading(false);
    }
}

let yearChartInstance = null;
let sectorChartInstance = null;
let countryChartInstance = null;

function calculateStatistics(companies) {
    if (!companies || companies.length === 0) return;
    
    // Update total count
    const totalEl = document.getElementById('totalPortfolioCount');
    if (totalEl) totalEl.textContent = companies.length;
    
    // Calculate sectors
    const sectors = new Set(companies.map(c => c.sector).filter(Boolean));
    const sectorCountEl = document.getElementById('statsSectorCount');
    if (sectorCountEl) sectorCountEl.textContent = sectors.size;
    
    // Calculate markets/countries
    const markets = new Set(companies.map(c => c.market).filter(Boolean));
    const marketCountEl = document.getElementById('statsMarketCount');
    if (marketCountEl) marketCountEl.textContent = markets.size + '+';
    
    // Calculate recent additions (2024-2025)
    const recentCount = companies.filter(c => {
        const y = normalizeEntryYear(c.entry);
        return y === '2024' || y === '2025';
    }).length;
    const recentCountEl = document.getElementById('statsRecentCount');
    if (recentCountEl) recentCountEl.textContent = recentCount;
    
    // Calculate average holding period (only for companies with entry year)
    const currentYear = new Date().getFullYear();
    const companiesWithYear = companies.filter(c => {
        const y = normalizeEntryYear(c.entry);
        return y && /^\d{4}$/.test(y);
    });
    if (companiesWithYear.length > 0) {
        const avgYears = companiesWithYear.reduce((sum, c) => sum + (currentYear - parseInt(normalizeEntryYear(c.entry), 10)), 0) / companiesWithYear.length;
        const avgEl = document.getElementById('statsAvgHoldingPeriod');
        if (avgEl) avgEl.textContent = avgYears.toFixed(1) + ' yrs';
    }
    
    // Generate charts
    createYearChart(companies);
    createSectorChart(companies);
    createCountryChart(companies);
}

function createYearChart(companies) {
    const ctx = document.getElementById('yearChart');
    if (!ctx) return;
    ctx.title = 'Click a year to filter portfolio companies';
    
    // Count by year (normalize e.g. '2025-05' -> '2025')
    const yearCounts = {};
    companies.forEach(c => {
        const y = normalizeEntryYear(c.entry);
        if (y && /^\d{4}$/.test(y)) {
            yearCounts[y] = (yearCounts[y] || 0) + 1;
        }
    });
    
    // Sort years and get data
    const sortedYears = Object.keys(yearCounts).sort();
    const data = sortedYears.map(y => yearCounts[y]);
    
    // Destroy old chart if exists
    if (yearChartInstance) yearChartInstance.destroy();
    
    yearChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedYears,
            datasets: [{
                label: 'Companies Acquired',
                data: data,
                backgroundColor: function(context) {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
                    gradient.addColorStop(0, '#6366F1');
                    gradient.addColorStop(0.5, '#7C3AED');
                    gradient.addColorStop(1, '#4F46E5');
                    return gradient;
                },
                borderRadius: 12,
                borderWidth: 0,
                hoverBackgroundColor: function(context) {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
                    gradient.addColorStop(0, '#4F46E5');
                    gradient.addColorStop(1, '#5B21B6');
                    return gradient;
                },
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (event, elements, chart) => {
                if (!elements || elements.length === 0) return;
                const index = elements[0].index;
                const year = chart.data.labels[index];
                window.location.href = `/portfolio-insights?chart=year&value=${encodeURIComponent(String(year))}`;
            },
            onHover: (event, elements) => {
                if (event && event.native && event.native.target) {
                    event.native.target.style.cursor = elements && elements.length ? 'pointer' : 'default';
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    padding: 10,
                    titleFont: { size: 12, weight: 'bold' },
                    bodyFont: { size: 11 },
                    callbacks: {
                        label: function(context) {
                            return ` ${context.parsed.y} companies`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        stepSize: 5,
                        font: { size: 10 }
                    },
                    grid: { color: '#f3f4f6' }
                },
                x: {
                    ticks: { font: { size: 10, weight: '600' } },
                    grid: { display: false }
                }
            }
        }
    });
}

/**
 * Slice colours: same indigo / violet family as the Investment Year bar chart gradients.
 * No legend on the chart — names on hover (tooltip), like a typical analytics layout.
 */
const PORTFOLIO_PIE_SLICES = [
    '#4F46E5', '#6366F1', '#7C3AED', '#8B5CF6', '#5B21B6',
    '#6D28D9', '#7E22CE', '#818CF8', '#9333EA', '#A78BFA',
    '#A855F7', '#C084FC'
];

function getPortfolioPieSliceColors(count) {
    return Array.from({ length: count }, (_, i) => PORTFOLIO_PIE_SLICES[i % PORTFOLIO_PIE_SLICES.length]);
}

/**
 * Doughnut in a 120×120px cell (see .portfolio-doughnut-sq), same vertical band as the year bar.
 * Aligned with createYearChart: responsive, hidden legend, similar tooltip, crisp HiDPI.
 */
function getPortfolioDoughnutChartOptions(clickBuilder) {
    const dpr = typeof window !== 'undefined' && window.devicePixelRatio
        ? Math.min(window.devicePixelRatio, 2)
        : 1;
    return {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        devicePixelRatio: dpr,
        cutout: '52%',
        layout: { padding: 0 },
        onClick: clickBuilder,
        onHover: (event, elements) => {
            if (event?.native?.target) {
                event.native.target.style.cursor = elements?.length ? 'pointer' : 'default';
            }
        },
        elements: {
            arc: { borderJoinStyle: 'round' }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.85)',
                padding: 10,
                titleFont: { size: 12, weight: 'bold' },
                bodyFont: { size: 11 },
                displayColors: true,
                boxPadding: 4
            }
        }
    };
}

function getPortfolioDoughnutDatasetConfig(data) {
    const n = data.length;
    return {
        data,
        backgroundColor: getPortfolioPieSliceColors(n),
        borderWidth: 1.5,
        borderColor: '#ffffff',
        hoverBorderColor: '#ffffff',
        hoverBorderWidth: 2,
        hoverOffset: 4
    };
}

function createSectorChart(companies) {
    const ctx = document.getElementById('sectorChart');
    if (!ctx) return;
    ctx.title = 'Click a sector to filter portfolio companies';
    
    const sectorCounts = {};
    companies.forEach(c => {
        if (c.sector && c.sector !== '') {
            sectorCounts[c.sector] = (sectorCounts[c.sector] || 0) + 1;
        }
    });
    
    const sortedSectors = Object.entries(sectorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const labels = sortedSectors.map(s => s[0]);
    const data = sortedSectors.map(s => s[1]);
    
    if (sectorChartInstance) sectorChartInstance.destroy();
    if (!data.length) {
        return;
    }
    
    const opts = getPortfolioDoughnutChartOptions((event, elements, chart) => {
        if (!elements || elements.length === 0) return;
        const index = elements[0].index;
        const sector = chart.data.labels[index];
        window.location.href = `/portfolio-insights?chart=sector&value=${encodeURIComponent(String(sector))}`;
    });
    opts.plugins = opts.plugins || {};
    opts.plugins.tooltip = {
        ...opts.plugins.tooltip,
        callbacks: {
            title: (items) => (items[0] ? String(items[0].label) : ''),
            label: function(context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((value / total) * 100).toFixed(1);
                return `${value} companies (${pct}%)`;
            }
        }
    };

    sectorChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [getPortfolioDoughnutDatasetConfig(data)]
        },
        options: opts
    });
}

function createCountryChart(companies) {
    const ctx = document.getElementById('countryChart');
    if (!ctx) return;
    ctx.title = 'Click a market to filter portfolio companies';
    
    const countryCounts = {};
    companies.forEach(c => {
        if (c.market && c.market !== '' && c.market !== 'N/A') {
            countryCounts[c.market] = (countryCounts[c.market] || 0) + 1;
        }
    });
    
    const sortedCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const labels = sortedCountries.map(s => s[0]);
    const data = sortedCountries.map(s => s[1]);
    
    if (countryChartInstance) countryChartInstance.destroy();
    if (!data.length) {
        return;
    }
    
    const countryOpts = getPortfolioDoughnutChartOptions((event, elements, chart) => {
        if (!elements || elements.length === 0) return;
        const index = elements[0].index;
        const market = chart.data.labels[index];
        window.location.href = `/portfolio-insights?chart=country&value=${encodeURIComponent(String(market))}`;
    });
    countryOpts.plugins = countryOpts.plugins || {};
    countryOpts.plugins.tooltip = {
        ...countryOpts.plugins.tooltip,
        callbacks: {
            title: (items) => (items[0] ? String(items[0].label) : ''),
            label: function(context) {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((value / total) * 100).toFixed(1);
                return `${value} companies (${pct}%)`;
            }
        }
    };

    countryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [getPortfolioDoughnutDatasetConfig(data)]
        },
        options: countryOpts
    });
}

function normalizeFilterValue(value) {
    return cleanDisplayText(value || '');
}

/** Extract year only from entry (e.g. '2025-05' -> '2025', '2023' -> '2023', 'Nov 2020' -> '2020'). */
function normalizeEntryYear(raw) {
    if (raw == null || raw === '') return '';
    const s = String(raw).trim();
    if (s.includes('-')) {
        const y = s.split('-')[0];
        return (y.length === 4 && /^\d{4}$/.test(y)) ? y : s;
    }
    // Handle "Nov 2020", "Aug 2023", etc.
    const yearMatch = s.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) return yearMatch[0];
    return (/^\d{4}$/.test(s) || /^\d{4}/.test(s)) ? s.substring(0, 4) : s;
}

function getSelectedCheckboxes(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    return Array.from(container.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.value.trim()).filter(Boolean);
}

function getActiveFilters() {
    return {
        query: (document.getElementById('portfolioSearchInput')?.value || '').toLowerCase().trim(),
        sectors: getSelectedCheckboxes('sectorFilterOptions'),
        markets: getSelectedCheckboxes('marketFilterOptions'),
        hqs: getSelectedCheckboxes('hqFilterOptions'),
        entryYears: getSelectedCheckboxes('entryYearFilterOptions'),
        holdingPeriods: getSelectedCheckboxes('holdingPeriodFilterOptions'),
        gps: getSelectedCheckboxes('gpFilterOptions'),
        geographies: getSelectedCheckboxes('geographyFilterOptions'),
        statuses: getSelectedCheckboxes('statusFilterOptions')
    };
}

function hasActiveFilters(filters) {
    return Boolean(
        filters.query ||
        (filters.sectors && filters.sectors.length > 0) ||
        (filters.markets && filters.markets.length > 0) ||
        (filters.hqs && filters.hqs.length > 0) ||
        (filters.entryYears && filters.entryYears.length > 0) ||
        (filters.holdingPeriods && filters.holdingPeriods.length > 0) ||
        (filters.gps && filters.gps.length > 0) ||
        (filters.geographies && filters.geographies.length > 0) ||
        (filters.statuses && filters.statuses.length > 0)
    );
}

function computeHoldingPeriod(company) {
    const currentYear = new Date().getFullYear();
    const entryYear = company.entry ? parseInt(normalizeEntryYear(company.entry), 10) : null;
    if (!entryYear) return null;
    const isExited = company.status === 'Exited' || company.status === 'IPO';
    const exitYear = (company.exit_year && parseInt(String(company.exit_year).replace(/\D/g, '').slice(0, 4), 10)) || null;
    const endYear = (isExited && exitYear) ? exitYear : currentYear;
    return Math.max(0, endYear - entryYear);
}

function holdingPeriodMatchesRange(years, range) {
    if (!years || !range) return false;
    if (range === '0-1') return years >= 0 && years <= 1;
    if (range === '2-3') return years >= 2 && years <= 3;
    if (range === '4-7') return years >= 4 && years <= 7;
    if (range === '8-12') return years >= 8 && years <= 12;
    if (range === '13+') return years >= 13;
    return false;
}

function applyPortfolioFilters(companies, filters) {
    return companies.filter(company => {
        const cleanCompany = normalizeFilterValue(company.company);
        const cleanSector = normalizeFilterValue(company.sector);
        const sectorGroup = categorizeSector(cleanSector);
        const cleanMarket = normalizeFilterValue(company.market);
        const cleanHQ = normalizeFilterValue(company.headquarters || company.market);
        const cleanEntry = normalizeFilterValue(normalizeEntryYear(company.entry));
        const owner = normalizeFilterValue(company.source);
        const geography = categorizeGeography(cleanMarket);
        const holdingPeriodYears = computeHoldingPeriod(company);
        const currentYear = new Date().getFullYear();
        const entryYear = company.entry ? parseInt(normalizeEntryYear(company.entry), 10) : null;
        const status = company.status || (entryYear && currentYear - entryYear > 0 ? 'Active' : 'N/A');

        const matchesQuery = !filters.query || [
            cleanCompany,
            cleanSector,
            cleanMarket,
            cleanHQ,
            cleanEntry,
            owner
        ].some(val => val.toLowerCase().includes(filters.query));

        const matchesSector = !filters.sectors?.length || filters.sectors.includes(sectorGroup);
        const matchesMarket = !filters.markets?.length || filters.markets.includes(cleanMarket);
        const matchesHQ = !filters.hqs?.length || filters.hqs.includes(cleanHQ);
        const matchesEntry = !filters.entryYears?.length || filters.entryYears.includes(cleanEntry);
        const matchesHolding = !filters.holdingPeriods?.length ||
            filters.holdingPeriods.some(range => holdingPeriodMatchesRange(holdingPeriodYears, range));
        const matchesGP = !filters.gps?.length || filters.gps.includes(owner);
        const matchesGeography = !filters.geographies?.length || filters.geographies.includes(geography);
        const matchesStatus = !filters.statuses?.length || filters.statuses.includes(status);

        return matchesQuery && matchesSector && matchesMarket && matchesHQ &&
            matchesEntry && matchesHolding && matchesGP && matchesGeography && matchesStatus;
    });
}

function populateFilterOptions(companies) {
    const sectors = [...new Set(
        companies.map(c => categorizeSector(normalizeFilterValue(c.sector))).filter(Boolean)
    )].sort();
    const markets = [...new Set(companies.map(c => normalizeFilterValue(c.market)).filter(Boolean))].sort();
    const hqs = [...new Set(companies.map(c => normalizeFilterValue(c.headquarters || c.market)).filter(Boolean))].sort();
    const years = [...new Set(companies.map(c => normalizeFilterValue(normalizeEntryYear(c.entry))).filter(Boolean))].sort((a, b) => Number(b) - Number(a));
    const gps = [...new Set(companies.map(c => normalizeFilterValue(c.source)).filter(Boolean))].sort();

    populateMultiselectOptions('sectorFilterOptions', sectors);
    populateMultiselectOptions('marketFilterOptions', markets);
    populateMultiselectOptions('hqFilterOptions', hqs);
    populateMultiselectOptions('entryYearFilterOptions', years);
    populateMultiselectOptions('gpFilterOptions', gps);
    updateFilterButtonCounts();
}

function populateMultiselectOptions(containerId, values) {
    const container = document.getElementById(containerId);
    if (!container || !values.length) return;
    container.innerHTML = values.map(v => 
        `<label class="filter-option"><input type="checkbox" value="${escapeHtml(v)}"> ${escapeHtml(v)}</label>`
    ).join('');
    container.querySelectorAll('input').forEach(cb => {
        cb.addEventListener('change', scheduleRenderFilteredPortfolio);
    });
}


function initMultiSelectFilters() {
    document.querySelectorAll('.filter-multiselect').forEach(wrapper => {
        const btn = wrapper.querySelector('.filter-multiselect-btn');
        const dropdown = wrapper.querySelector('.filter-multiselect-dropdown');
        if (!btn || !dropdown) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasActive = wrapper.classList.contains('active');
            document.querySelectorAll('.filter-multiselect').forEach(w => w.classList.remove('active'));
            if (!wasActive) {
                wrapper.classList.add('active');
                const rect = btn.getBoundingClientRect();
                dropdown.style.left = rect.left + 'px';
                dropdown.style.top = (rect.bottom + 4) + 'px';
                dropdown.style.minWidth = Math.max(rect.width, 200) + 'px';
            }
        });

        dropdown.addEventListener('change', (e) => {
            if (e.target.matches('input[type="checkbox"]')) {
                scheduleRenderFilteredPortfolio();
                updateFilterButtonCounts();
            }
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.filter-multiselect').forEach(w => w.classList.remove('active'));
    });

    window.addEventListener('scroll', () => {
        document.querySelectorAll('.filter-multiselect.active .filter-multiselect-dropdown').forEach(dd => {
            const btn = dd.closest('.filter-multiselect')?.querySelector('.filter-multiselect-btn');
            if (btn) {
                const rect = btn.getBoundingClientRect();
                dd.style.left = rect.left + 'px';
                dd.style.top = (rect.bottom + 4) + 'px';
            }
        });
    }, true);
}

function updateFilterButtonCounts() {
    const filters = getActiveFilters();
    const counts = {
        sector: filters.sectors?.length || 0,
        market: filters.markets?.length || 0,
        hq: filters.hqs?.length || 0,
        entryYear: filters.entryYears?.length || 0,
        holdingPeriod: filters.holdingPeriods?.length || 0,
        gp: filters.gps?.length || 0,
        geography: filters.geographies?.length || 0,
        status: filters.statuses?.length || 0
    };
    document.querySelectorAll('.filter-multiselect').forEach(wrapper => {
        const filterKey = wrapper.getAttribute('data-filter');
        const countEl = wrapper.querySelector('.filter-btn-count');
        if (countEl && counts[filterKey] !== undefined) {
            countEl.textContent = counts[filterKey] > 0 ? `(${counts[filterKey]})` : '';
        }
    });
}

function clearAllFilters() {
    const searchInput = document.getElementById('portfolioSearchInput');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.filter-options-list input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    updateFilterButtonCounts();
    scheduleRenderFilteredPortfolio();
}

function renderFilteredPortfolio() {
    const filters = getActiveFilters();
    const filteredCompanies = applyPortfolioFilters(allPortfolioCompanies, filters);
    const totalEl = document.getElementById('portfolioTotalCount');
    if (totalEl) totalEl.textContent = filteredCompanies.length;

    if (hasActiveFilters(filters)) {
        displayFilteredPortfolioFlat(filteredCompanies);
    } else {
        displayPortfolio(filteredCompanies);
    }
}

function comparePortfolioCompaniesBySort(a, b) {
    const column = portfolioTableSortState.column;
    const dir = portfolioTableSortState.direction === 'asc' ? 1 : -1;
    const aVal = getPortfolioSortValue(a, column);
    const bVal = getPortfolioSortValue(b, column);
    if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * dir;
    }
    return String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base', numeric: true }) * dir;
}

function getPortfolioSortValue(company, column) {
    const market = normalizeFilterValue(company.market);
    const clean = (v) => normalizeFilterValue(v);
    switch (column) {
        case 'company': return clean(company.company) || 'ZZZ';
        case 'owner': return clean(company.source) || 'ZZZ';
        case 'sector': return clean(company.sector) || 'ZZZ';
        case 'market': return market || 'ZZZ';
        case 'headquarters': return clean(company.headquarters || company.market) || 'ZZZ';
        case 'entry': {
            const y = parseInt(normalizeEntryYear(company.entry), 10);
            return Number.isFinite(y) ? y : -Infinity;
        }
        case 'holdingPeriod': {
            const hp = computeHoldingPeriod(company);
            return hp != null ? hp : -1;
        }
        case 'status': {
            const cy = new Date().getFullYear();
            const ey = company.entry ? parseInt(normalizeEntryYear(company.entry), 10) : null;
            return clean(company.status || (ey && cy - ey > 0 ? 'Active' : 'N/A')) || 'ZZZ';
        }
        case 'geography': return categorizeGeography(market);
        default: return '';
    }
}

function updatePortfolioTableSortUI(table) {
    if (!table) return;
    const headers = table.querySelectorAll('.portfolio-table-sortable');
    headers.forEach(th => {
        const col = th.getAttribute('data-sort');
        th.classList.remove('sorted-asc', 'sorted-desc');
        if (col === portfolioTableSortState.column) {
            th.classList.add(portfolioTableSortState.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
        }
    });
}

function setupPortfolioTableSortHandlers(table) {
    if (!table) return;
    table.querySelectorAll('.portfolio-table-sortable').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.getAttribute('data-sort');
            if (!col) return;
            if (portfolioTableSortState.column === col) {
                portfolioTableSortState.direction = portfolioTableSortState.direction === 'asc' ? 'desc' : 'asc';
            } else {
                portfolioTableSortState.column = col;
                portfolioTableSortState.direction = 'asc';
            }
            scheduleRenderFilteredPortfolio();
        });
    });
}

function displayFilteredPortfolioFlat(companies) {
    const container = document.getElementById('portfolioContainer');
    const emptyState = document.getElementById('portfolioEmptyState');
    const logoStrip = document.getElementById('portfolioFirmLogos');
    if (logoStrip) logoStrip.classList.add('hidden');
    if (!companies || companies.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    const sortedCompanies = [...companies].sort(comparePortfolioCompaniesBySort);
    const currentYear = new Date().getFullYear();

    const premiumBanner = document.createElement('div');
    premiumBanner.className = 'premium-banner-bar';
    premiumBanner.innerHTML = '<i class="fas fa-crown" aria-hidden="true"></i><span>Complete list available for Premium users</span>';

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'portfolio-table-wrapper';
    const table = document.createElement('table');
    table.className = 'portfolio-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th class="portfolio-table-sortable" data-sort="company">Company</th>
                <th class="portfolio-table-sortable" data-sort="owner">Owner (GP)</th>
                <th class="portfolio-table-sortable" data-sort="sector">Sector</th>
                <th class="portfolio-table-sortable" data-sort="market">Market</th>
                <th class="portfolio-table-sortable" data-sort="headquarters">Headquarters</th>
                <th class="portfolio-table-sortable" data-sort="entry">Entry Year</th>
                <th class="portfolio-table-sortable" data-sort="holdingPeriod">Holding Period</th>
                <th class="portfolio-table-sortable" data-sort="status">Status</th>
                <th class="portfolio-table-sortable" data-sort="geography">Geography</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    updatePortfolioTableSortUI(table);
    setupPortfolioTableSortHandlers(table);

    sortedCompanies.forEach((company, index) => {
        const cleanCompany = cleanDisplayText(company.company || 'N/A');
        const cleanSector = cleanDisplayText(company.sector || 'N/A');
        const cleanMarket = cleanDisplayText(company.market || 'N/A');
        const cleanHQ = cleanDisplayText(company.headquarters || company.market || 'N/A');
        const cleanEntry = cleanDisplayText(normalizeEntryYear(company.entry) || 'N/A');
        const cleanOwner = cleanDisplayText(company.source || 'N/A');
        const geography = categorizeGeography(cleanMarket);
        const entryYear = company.entry ? parseInt(normalizeEntryYear(company.entry), 10) : null;
        const status = company.status || (entryYear && currentYear - entryYear > 0 ? 'Active' : 'N/A');
        const isExited = status === 'Exited' || status === 'IPO';
        const exitYear = (company.exit_year && parseInt(String(company.exit_year).replace(/\D/g, '').slice(0, 4), 10)) || null;
        const endYear = (isExited && exitYear) ? exitYear : currentYear;
        const holdingPeriod = entryYear ? Math.max(0, endYear - entryYear) : null;
        const holdingPeriodText = holdingPeriod ? (isExited ? (holdingPeriod === 1 ? 'Held for 1 year' : `Held for ${holdingPeriod} years`) : (holdingPeriod === 1 ? '1 yr' : `${holdingPeriod} yrs`)) : '—';
        const statusColor = status === 'Active' ? '#10b981' : status === 'Exited' ? '#6b7280' : status === 'IPO' ? '#3b82f6' : '#94a3b8';
        const description = company.description || company.detailed_description || '';

        const companyDomain = extractCompanyDomain(company);
        let companyLogoSrc = getCompanyLogoUrl(company, companyDomain, cleanCompany);
        const companyName = (company.company || cleanCompany || '').trim();
        if (['Corteco', 'Reledo', 'Opima'].some(n => companyName === n || companyName.toLowerCase() === n.toLowerCase())) {
            companyLogoSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName || cleanCompany)}&background=7c2d12&color=ffffff&size=64`;
        }
        const companyAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanCompany)}&background=3f7de8&color=ffffff&size=64`;
        const rawLogo = company.logo_url || '';
        const clearbitUrl = (rawLogo && !rawLogo.includes('ui-avatars.com')) ? rawLogo : (companyDomain ? `https://logo.clearbit.com/${companyDomain}` : '');
        const fallback2 = clearbitUrl || companyAvatarUrl;

        const row = document.createElement('tr');
        row.style.animationDelay = `${index * 0.02}s`;
        row.innerHTML = `
            <td class="company-name" title="${escapeHtml(description)}">
                <span class="company-link-modal portfolio-uniform-cell" style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px;" data-slug="${escapeHtml(generateCompanySlug(company))}">
                    <img src="${companyLogoSrc}" alt="${escapeHtml(cleanCompany)}" class="company-logo" style="width: 28px; height: 28px; object-fit: contain; border-radius: 4px;"
                         onerror="this.onerror=null; this.src='${fallback2}'; this.onerror=function(){this.onerror=null; this.src='${companyAvatarUrl}'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='inline';};}">
                    <i class="fas fa-building company-icon-fallback" style="display:none; width: 28px; height: 28px; align-items: center; justify-content: center;"></i>
                    ${escapeHtml(cleanCompany)}
                    <i class="fas fa-info-circle" style="margin-left: 4px; color: #3f7de8; opacity: 0.7; font-size: 0.75rem;"></i>
                </span>
            </td>
            <td>${escapeHtml(cleanOwner)}</td>
            <td>${escapeHtml(cleanSector)}</td>
            <td>${escapeHtml(cleanMarket)}</td>
            <td>${escapeHtml(cleanHQ)}</td>
            <td>${escapeHtml(cleanEntry)}</td>
            <td style="text-align: center; font-weight: 600; color: ${holdingPeriod ? '#3f7de8' : '#94a3b8'}; font-size: 0.65rem;">${holdingPeriodText}</td>
            <td style="text-align: center;"><span style="background: ${statusColor}15; color: ${statusColor}; padding: 2px 6px; border-radius: 8px; font-size: 0.55rem; font-weight: 600;">${escapeHtml(status)}</span></td>
            <td>${escapeHtml(geography)}</td>
        `;

        const companyLinkModal = row.querySelector('.company-link-modal');
        if (companyLinkModal) {
            const slug = generateCompanySlug(company);
            companyLinkModal.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/company/${slug}`;
            });
            companyLinkModal.addEventListener('mouseenter', function() {
                companyLinkModal.style.color = '#667eea';
                companyLinkModal.style.transform = 'translateX(4px)';
                companyLinkModal.style.transition = 'all 0.3s ease';
            });
            companyLinkModal.addEventListener('mouseleave', function() {
                companyLinkModal.style.color = '';
                companyLinkModal.style.transform = 'translateX(0)';
            });
        }
        tbody.appendChild(row);
    });

    tableWrapper.appendChild(table);
    container.innerHTML = '';
    container.appendChild(premiumBanner);
    container.appendChild(tableWrapper);
}

function getFirmSectionId(source) {
    const slug = String(source || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'other';
    return 'firm-section-' + slug;
}

function renderFirmLogoStrip(groupedCompanies) {
    const strip = document.getElementById('portfolioFirmLogos');
    const inner = document.getElementById('portfolioFirmLogosInner');
    if (!strip || !inner) return;
    if (!groupedCompanies || Object.keys(groupedCompanies).length === 0) {
        strip.classList.add('hidden');
        return;
    }
    inner.innerHTML = '';
    const sources = Object.keys(groupedCompanies).sort();
    sources.forEach(source => {
        const firmCompanies = groupedCompanies[source];
        const firmDomain = firmDomainOverrides[source] || getFirmDomain(source);
        const firmLogoUrl = firmDomain ? `https://logo.clearbit.com/${firmDomain}?size=64` : '';
        const firmFaviconUrl = firmDomain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(firmDomain)}&sz=32` : '';
        const firmAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(source)}&background=6366f1&color=ffffff&size=64`;
        const sectionId = getFirmSectionId(source);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'portfolio-firm-logo-btn';
        btn.title = `${source} (${firmCompanies.length} ${firmCompanies.length === 1 ? 'company' : 'companies'}) – click to scroll`;
        btn.setAttribute('aria-label', `Scroll to ${source}`);
        btn.innerHTML = firmLogoUrl
            ? `<img src="${firmLogoUrl}" alt="${escapeHtml(source)}" onerror="this.onerror=null; this.src='${firmFaviconUrl}'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='flex';};"><i class="fas fa-briefcase logo-fallback-icon" style="display:none;"></i>`
            : `<i class="fas fa-briefcase logo-fallback-icon"></i>`;
        btn.addEventListener('click', () => {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        inner.appendChild(btn);
    });
    strip.classList.remove('hidden');
}

function displayPortfolio(companies) {
    const container = document.getElementById('portfolioContainer');
    const emptyState = document.getElementById('portfolioEmptyState');
    const logoStrip = document.getElementById('portfolioFirmLogos');
    
    if (!companies || companies.length === 0) {
        container.innerHTML = '';
        if (logoStrip) logoStrip.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    container.innerHTML = '';

    const premiumBanner = document.createElement('div');
    premiumBanner.className = 'premium-banner-bar';
    premiumBanner.innerHTML = '<i class="fas fa-crown" aria-hidden="true"></i><span>Complete list available for Premium users</span>';
    container.appendChild(premiumBanner);

    // Group companies by PE firm (source)
    const groupedCompanies = {};
    companies.forEach(company => {
        const source = company.source || 'Other';
        if (!groupedCompanies[source]) {
            groupedCompanies[source] = [];
        }
        groupedCompanies[source].push(company);
    });
    
    // Render firm logo strip (click to scroll)
    renderFirmLogoStrip(groupedCompanies);
    
    // Create a section for each PE firm
    Object.keys(groupedCompanies).sort().forEach(source => {
        const firmCompanies = groupedCompanies[source];
        
        // Create firm section with id for scroll target
        const firmSection = document.createElement('div');
        firmSection.className = 'firm-section';
        firmSection.id = getFirmSectionId(source);
        
        // Firm header with logo (clickable to go to firm detail page)
        const firmHeader = document.createElement('div');
        firmHeader.className = 'firm-header';
        
        // Get firm logo from Clearbit
        const firmDomain = firmDomainOverrides[source] || getFirmDomain(source);
        const firmLogoUrl = `https://logo.clearbit.com/${firmDomain}`;
        const firmFaviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(firmDomain)}&sz=128`;
        const firmAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(source)}&background=3f7de8&color=ffffff&size=96`;
        
        // Create clickable header
        const firmLink = document.createElement('a');
        firmLink.href = `/pe-firm/${encodeURIComponent(source)}`;
        firmLink.className = 'firm-header-link';
        firmLink.innerHTML = `
            <h3>
                <img src="${firmLogoUrl}" 
                     alt="${escapeHtml(source)}" 
                     class="firm-logo"
                     onerror="this.onerror=null; this.src='${firmFaviconUrl}'; this.onerror=function(){this.onerror=null; this.src='${firmAvatarUrl}'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='inline';};}">
                <i class="fas fa-briefcase firm-icon-fallback" style="display:none;"></i>
                ${escapeHtml(source)}
                <i class="fas fa-external-link-alt" style="font-size: 1rem; margin-left: 0.5rem; opacity: 0.6;"></i>
            </h3>
        `;
        
        firmHeader.appendChild(firmLink);
        firmHeader.innerHTML += `<span class="firm-count">${firmCompanies.length} ${firmCompanies.length === 1 ? 'company' : 'companies'}</span>`;
        
        firmSection.appendChild(firmHeader);
        
        // Create table for this firm
        const table = document.createElement('table');
        table.className = 'portfolio-table';
        // Remove fixed width - let CSS handle responsive sizing
        console.log('🔧 DEBUG: Created table with class:', table.className);
        
        // Table header - hide Deal Size for Celero
        const isCelero = (source || '').toLowerCase().includes('celero');
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Company</th>
                <th>Sector</th>
                <th>Fund</th>
                <th>Market</th>
                <th>Headquarters</th>
                <th>Entry Year</th>
                <th>Holding Period</th>
                <th>Status</th>
                ${!isCelero ? '<th>Deal Size</th>' : ''}
                <th>Geography</th>
                <th>Description</th>
                <th style="text-align: center;">Website</th>
            </tr>
        `;
        table.appendChild(thead);
        
        // Table body
        const tbody = document.createElement('tbody');
        firmCompanies.forEach((company, index) => {
            const row = document.createElement('tr');
            row.style.animationDelay = `${index * 0.02}s`;
            
            // Make company name clickable with logo (prioritize favicon over Clearbit for Nordic .se/.no/.dk)
            const cleanCompany = cleanDisplayText(company.company || 'N/A');
            const cleanSector = cleanDisplayText(company.sector || 'N/A');
            const cleanFund = cleanDisplayText(company.fund || 'N/A');
            const cleanMarket = cleanDisplayText(company.market || 'N/A');
            const cleanHQ = cleanDisplayText(company.headquarters || 'N/A');
            const cleanEntry = cleanDisplayText(normalizeEntryYear(company.entry) || 'N/A');
            const companyDomain = extractCompanyDomain(company);
            const companyAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanCompany)}&background=3f7de8&color=ffffff&size=64`;
            const rawLogo = company.logo_url || '';
            const clearbitUrl = (rawLogo && !rawLogo.includes('ui-avatars.com')) ? rawLogo
                : (companyDomain ? `https://logo.clearbit.com/${companyDomain}` : '');
            let companyLogoSrc = getCompanyLogoUrl(company, companyDomain, cleanCompany);
            const companyName = (company.company || cleanCompany || '').trim();
            if (['Corteco', 'Reledo', 'Opima'].some(n => companyName === n || companyName.toLowerCase() === n.toLowerCase())) {
                companyLogoSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName || cleanCompany)}&background=7c2d12&color=ffffff&size=64`;
            }
            const fallback2 = clearbitUrl || companyAvatarUrl;
            const companyNameHtml = `<span class="company-link-modal portfolio-uniform-cell" style="cursor: pointer;">
                    <img src="${companyLogoSrc}"
                         alt="${escapeHtml(cleanCompany)}"
                         class="company-logo"
                         onerror="this.onerror=null; this.src='${fallback2}'; this.onerror=function(){this.onerror=null; this.src='${companyAvatarUrl}'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='inline';};}">
                    <i class="fas fa-building company-icon-fallback" style="display:none;"></i>
                    ${escapeHtml(cleanCompany)}
                    <i class="fas fa-info-circle" style="margin-left: 8px; color: #3f7de8; opacity: 0.7;"></i>
                </span>`;
            
            // Add description as tooltip - check both description and detailed_description fields
            const description = company.description || company.detailed_description || '';
            
            // Calculate additional metrics
            const currentYear = new Date().getFullYear();
            const entryYear = company.entry ? parseInt(normalizeEntryYear(company.entry), 10) : null;
            const status = company.status || (entryYear && currentYear - entryYear > 0 ? 'Active' : 'N/A');
            const isExited = status === 'Exited' || status === 'IPO';
            const exitYear = (company.exit_year && parseInt(String(company.exit_year).replace(/\D/g, '').slice(0, 4), 10)) || null;
            const endYear = (isExited && exitYear) ? exitYear : currentYear;
            const holdingPeriod = entryYear ? Math.max(0, endYear - entryYear) : null;
            const holdingPeriodText = holdingPeriod
                ? (isExited ? (holdingPeriod === 1 ? 'Held for 1 year' : `Held for ${holdingPeriod} years`) : (holdingPeriod === 1 ? '1 yr' : `${holdingPeriod} yrs`))
                : '—';
            const statusColor = status === 'Active' ? '#10b981' : status === 'Exited' ? '#6b7280' : status === 'IPO' ? '#3b82f6' : '#94a3b8';
            
            // Deal size - hide for Celero
            const dealSize = isCelero ? null : (company.deal_size || null);
            
            // Categorize geography
            const geography = categorizeGeography(company.market);
            const geographyColor = geography === 'Domestic' ? '#3f7de8' : geography === 'Nordic' ? '#0ea5a8' : '#d8a24c';
            
            row.innerHTML = `
                <td class="company-name portfolio-uniform-cell" title="${escapeHtml(description)}">
                    ${companyNameHtml}
                </td>
                <td>${escapeHtml(cleanSector)}</td>
                <td>
                    <span class="fund-badge">${escapeHtml(cleanFund)}</span>
                </td>
                <td class="portfolio-uniform-cell">${escapeHtml(cleanMarket)}</td>
                <td class="portfolio-uniform-cell">
                    ${escapeHtml(cleanHQ)}
                </td>
                <td class="portfolio-uniform-cell">${escapeHtml(cleanEntry)}</td>
                <td style="text-align: center; font-weight: 600; color: ${holdingPeriod ? '#3f7de8' : '#94a3b8'}; font-size: 0.65rem;">
                    ${holdingPeriodText}
                </td>
                <td style="text-align: center;">
                    <span style="background: ${statusColor}15; color: ${statusColor}; padding: 2px 6px; border-radius: 8px; font-size: 0.55rem; font-weight: 600; display: inline-block;">
                        ${status}
                    </span>
                </td>
                ${!isCelero ? `<td style="text-align: center; font-size: 0.65rem; color: ${dealSize ? '#1e40af' : '#94a3b8'}; font-weight: ${dealSize ? '600' : 'normal'};">
                    ${dealSize || '—'}
                </td>` : ''}
                <td style="text-align: center;">
                    <span style="background: ${geographyColor}15; color: ${geographyColor}; padding: 2px 6px; border-radius: 6px; font-size: 0.55rem; font-weight: 600;">
                        ${geography}
                    </span>
                </td>
                <td style="max-width: 400px; font-size: 0.6rem; color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(description)}">
                    ${description ? escapeHtml(description.substring(0, 120)) + (description.length > 120 ? '...' : '') : '—'}
                </td>
                <td style="text-align: center;">
                    ${company.website ? 
                        `<a href="${escapeHtml(company.website)}" target="_blank" style="color: #3f7de8; font-size: 16px; text-decoration: none;" title="${escapeHtml(company.website)}">
                            <i class="fas fa-external-link-alt"></i>
                        </a>` : 
                        `<span style="color: #cbd5e1;">—</span>`
                    }
                </td>
            `;
            
            tbody.appendChild(row);
            
            // Add click handler to company name to navigate to detail page
            const companyNameCell = row.querySelector('.company-name');
            if (companyNameCell) {
                const companyLinkModal = companyNameCell.querySelector('.company-link-modal');
                if (companyLinkModal) {
                    // Generate slug for URL
                    const slug = generateCompanySlug(company);
                    
                    companyLinkModal.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/company/${slug}`;
                    });
                    
                    // Add hover effect
                    companyLinkModal.addEventListener('mouseenter', function() {
                        companyLinkModal.style.color = '#667eea';
                        companyLinkModal.style.transform = 'translateX(4px)';
                        companyLinkModal.style.transition = 'all 0.3s ease';
                    });
                    
                    companyLinkModal.addEventListener('mouseleave', function() {
                        companyLinkModal.style.color = '';
                        companyLinkModal.style.transform = 'translateX(0)';
                    });
                }
            }
        });
        table.appendChild(tbody);
        
        // Wrap table in scrollable container
        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'portfolio-table-wrapper';
        tableWrapper.appendChild(table);
        
        firmSection.appendChild(tableWrapper);
        container.appendChild(firmSection);
        
        // DEBUG: Check if wrapper has proper overflow
        console.log('🔧 DEBUG: Table wrapper styles:', window.getComputedStyle(tableWrapper));
        console.log('🔧 DEBUG: Table styles:', window.getComputedStyle(table));
    });
}

function cleanDisplayText(value) {
    return String(value || 'N/A').replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

let searchTimeout;
let filterRenderTimeout;
function handlePortfolioSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        scheduleRenderFilteredPortfolio();
    }, 300);
}

function scheduleRenderFilteredPortfolio() {
    clearTimeout(filterRenderTimeout);
    filterRenderTimeout = setTimeout(() => {
        renderFilteredPortfolio();
    }, 80);
}

// ===================================================================
// HELPER FUNCTIONS FOR PORTFOLIO DATA
// ===================================================================

function categorizeGeography(market) {
    const nordicCountries = ['Sweden', 'Denmark', 'Norway', 'Finland', 'Iceland'];
    const m = String(market || '').trim();
    if (m === 'Sweden') return 'Domestic';
    if (nordicCountries.includes(m) || m === 'Nordics') return 'Nordic';
    return 'International';
}

function categorizeSector(sector) {
    const value = String(sector || '').toLowerCase();
    if (!value || value === 'n/a') return 'Other';

    if (/(software|saas|it|tech|digital|data|cyber|cloud|platform|semiconductor)/.test(value)) return 'Technology';
    if (/(industr|manufactur|engineering|machin|automation|construction|building|infrastructure|energy|materials)/.test(value)) return 'Industrials';
    if (/(health|medtech|medical|pharma|biotech|care)/.test(value)) return 'Healthcare';
    if (/(financ|fintech|bank|insurance|asset|payment)/.test(value)) return 'Financial Services';
    if (/(consumer|retail|e-?commerce|fashion|food|beverage|hospitality|travel|leisure)/.test(value)) return 'Consumer';
    if (/(business service|b2b|consult|outsourc|professional service|facility|support service)/.test(value)) return 'Business Services';
    if (/(logistics|transport|shipping|supply chain|distribution)/.test(value)) return 'Logistics & Transport';
    if (/(media|telecom|entertainment|gaming|advertis)/.test(value)) return 'Media & Telecom';

    return 'Other';
}

// Helper functions
function showLoading(show) {
    const spinner = document.getElementById('portfolioLoadingSpinner');
    if (show) {
        spinner.classList.remove('hidden');
    } else {
        spinner.classList.add('hidden');
    }
}

function showStatusMessage(message, type) {
    const messageDiv = document.getElementById('portfolioStatusMessage');
    messageDiv.textContent = message;
    messageDiv.className = `status-message ${type}`;
    
    setTimeout(() => {
        hideStatusMessage();
    }, 5000);
}

function hideStatusMessage() {
    const messageDiv = document.getElementById('portfolioStatusMessage');
    messageDiv.classList.add('hidden');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Helper function to extract domain from URL
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

// Corteco, Reledo, Opima (.nu/.se): Clearbit/favicon often fail - use ui-avatars for reliable display
const FORCE_AVATAR_LOGO = ['Corteco', 'Reledo', 'Opima', 'IT-Total', 'Multisoft', 'SELATEK'];

// Company logo: prefer Google Favicon (reliable for .se/.no/.dk) over Clearbit (often missing for Nordic companies)
function getCompanyLogoUrl(company, domain, cleanName) {
    const name = (company && company.company) ? String(company.company).trim() : cleanName || 'Co';
    if (FORCE_AVATAR_LOGO.some(f => (name || '').toLowerCase() === f.toLowerCase())) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Co')}&background=7c2d12&color=ffffff&size=64`;
    }
    const favicon = domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128` : '';
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Co')}&background=3f7de8&color=ffffff&size=64`;
    const rawLogo = (company && company.logo_url) || '';
    const clearbit = (rawLogo && !rawLogo.includes('ui-avatars.com')) ? rawLogo
        : (domain ? `https://logo.clearbit.com/${domain}` : '');
    return favicon || clearbit || avatar;
}

// Known correct domains when DB has wrong/old URLs (add more as you find them)
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
    'Circura Danmark': 'circura.dk',
    'Circura': 'circuragroup.com',
    'DLVRY': 'dlvry.se',
    'RETTA': 'innagroup.se',
    '3Button Group': '3bg.se',
    'Briab': 'briab.se',
    'EWGroup': 'ewgroup.se',
    'eivis': 'eivis-group.com',
    'SI - Sustainable Intelligence': 'wearesi.se',
    'Umia': 'umia.se',
    'Safe Monitoring Group': 'safemonitoringgroup.com',
    // Amplio portfolio
    'S R Intelligence (SRI)': 'sri.se',
    'Tedge': 'tedge.se',
    'Co-native': 'conative.se',
    'SELATEK': 'selatek.se',
    // Celero portfolio
    'Corteco': 'corteco.nu',
    'Reledo': 'reledo.se',
    'Opima': 'opima.se',
    'Aterion': 'aterion.com',
    'Deltra': 'deltra.se',
    'Sporty': 'sportygroup.no',
    // Axcel portfolio
    'Bekk': 'bekk.no',
    'LS Retail': 'lsretail.com',
    'Nordic Tyre Group': 'nordictyregroup.com',
    'Progrits': 'progrits.com',
    'SuperOffice': 'superoffice.com',
    'Capture One': 'captureone.com',
    'Phase One': 'phaseone.com',
    'GUBI': 'gubi.com',
    'NTI Group': 'ntigroup.dk',
    'XPartners': 'xpartners.se',
    'Edda Group': 'edda.dk',
    'AGRD Partners': 'agrdpartners.com',
    'Accru Partners': 'accrupartners.com',
    'Acurum Group': 'acurumgroup.com',
    'Elcor': 'elcor.dk',
    'Oral Care': 'oralcare.se',
    'The Nutriment Company': 'nutriment.com',
    'itm8': 'itm8.dk',
    'BullWall': 'bullwall.com',
    'Init': 'initgroup.com',
    'DANX Carousel Group': 'danxcarousel.com',
    'Vetopia': 'vetopia.com',
    'emagine': 'emagine.dk',
    'Currentum': 'currentumgroup.com',
    // Altor portfolio
    'Aarke': 'aarke.com',
    'Aira': 'airahome.com',
    'C WorldWide': 'cworldwide.com',
    'CCM Hockey': 'ccmhockey.com',
    'Circulose': 'circulose.com',
    'Dale of Norway': 'daleofnorway.com',
    'Eleda': 'eleda.se',
    'F24': 'f24.com',
    'FLSmidth': 'flsmidth.com',
    'Gunnebo': 'gunnebo.com',
    'Haarslev Industries': 'haarslev.com',
    'Hamlet Protein': 'hamletprotein.com',
    'iDeal of Sweden': 'idealofsweden.com',
    'Imbox': 'imbox.se',
    'Iyuno': 'iyuno.com',
    'KAEFER': 'kaefer.com',
    'Meltwater': 'meltwater.com',
    'Norican group': 'norican.com',
    "O'Learys Group": 'olearys.se',
    'OptiGroup': 'optigroup.com',
    'Orchid Orthopedic Solutions': 'orchid-ortho.com',
    'Permascand': 'permascand.com',
    'QNTM Group': 'qntm.se',
    'Raw Fury': 'rawfury.com',
    'Rillion': 'rillion.com',
    'Rossignol Group': 'rossignol.com',
    'Svea Solar': 'sveasolar.se',
    'Toteme': 'toteme.com',
    'Transcom': 'transcom.com',
    'Trioworld': 'trioworld.com',
    'Vianode': 'vianode.com',
    'VTU': 'vtu.com',
    'Zahneins': 'zahneins.com',
    // Impilo portfolio
    'Immedica': 'immedica.com',
    'Humana': 'humanagroup.se',
    'Euro Accident': 'euroaccident.se',
    'Scantox': 'scantox.com',
    'tandlægen.dk': 'tandlaegen.dk',
    'Lowenco': 'lowenco.com',
    'Pelago Bioscience': 'pelagobioscience.com',
    'VaccinDirekt': 'vaccindirekt.se',
    'Decon': 'decon.se',
    'Avia Pharma': 'aviapharma.se',
    'Stille': 'stillesurgical.com',
    'Qufora': 'qufora.com',
    'Oticon Medical': 'oticon.com',
    // MVI portfolio
    'Nestit Group': 'nestit.com',
    'Ascenco Group': 'ascenco.se',
    'SMP Parts': 'smpparts.se',
    'PS Auction': 'psauktion.se',
    'Art Clinic': 'artclinic.se',
    'Great Security': 'greatsecurity.se',
    'Freedom Group': 'freedomgroup.se',
    // Equip portfolio
    'Activeon': 'activeon.no',
    'Bastard Burgers': 'bastardburgers.se',
    'Busspart': 'busspart.no',
    'Cares': 'cares.no',
    'Cautus Geo': 'cautus.no',
    'Cloud Connection': 'cloudconnection.no',
    'Cure': 'cure.no',
    'Dura': 'duragroup.se',
    'Funplays': 'funplays.com',
    'Holy Greens': 'holygreens.se',
    'House of Discs': 'latitude64.com',
    'iteam': 'iteam.no',
    'Makeup Mekka': 'makeupmekka.no',
    'Miles': 'miles.no',
    'North Travel': 'northtravel.no',
    'River Group': 'river-group.com',
    'Ryde': 'ryde-technology.com',
    'Stenbolaget': 'stenbolaget.se',
    'TIND': 'tind.io',
    // Additional portfolio companies
    'WP Westpack': 'westpack.se',
    'Mobilhouse': 'mobilhouse.dk',
    'Quattro Mikenti Group': 'qmg.fi',
    'Puuilo': 'puuilo.fi',
    'Intersport Sweden': 'intersport.se',
    'Med Group': 'medgroup.fi',
    'Microbas Precision': 'microbas.se',
    'Faun Gruppen': 'faun.no',
    'Flex IT': 'flex-it.dk',
    'Network of Design': 'networkofdesign.com',
    'Nordic Leisure Travel Group': 'nltg.com',
    'Tresu': 'tresu.com',
    'Multisoft': 'multisoft.no',
    'IT-Total': 'it-total.no',
    'Hermes': 'hermesas.no',
    'Pelly Group': 'pellygroup.com',
    'Sofigate': 'sofigate.com',
    'Aste Helsinki': 'astehelsinki.fi',
    'Picosun': 'picosun.com',
    'Avidly': 'avidlyagency.com',
    'Real Machinery': 'realmachinery.com',
    'Touhula': 'touhula.fi',
    'Polystar': 'polystar.com',
    'Fluido': 'fluido.com',
    'Idean Enterprises': 'idean.com',
    'Dechra Pharmaceuticals': 'dechrapharmaceuticals.com',
    'Advanced MedAesthetic Partners': 'advancedmedaesthetic.com',
    'Talentium': 'talentium.fi',
    'Icon Group': 'icongroup.com.au',
    'CFC': 'cfcunderwriting.com',
    'OEM International': 'oeminternational.se',
    'HQ': 'hq.se',
    'Acacium': 'acaciumgroup.com',
    'Lobster': 'lobster.es',
    'VisionSense Technologies': 'visionsense.com',
    'GEDH': 'groupe-edh.com',
    'IM Global': 'imgp.com',
    'IM Global Partner': 'imgp.com',
    'iM Global Partner': 'imgp.com',
    'Seventeen Group': 'seventeengroup.co.uk',
    'IVC Evidensia': 'ivcevidensia.com',
    'Ludvig & Co': 'ludvig.se',
    'Ondal Medical Systems': 'ondal.com',
    'Enerco': 'enerco.se',
    'Wishcard': 'wishcard.de',
    'Atlanda Health Group': 'atlanda.se',
    'Batisante': 'batisante.com',
    'Goodlife Foods': 'goodlifefoods.com',
    'MDT Technologies': 'mdt-technologies.com',
    'Medica': 'medica.co.uk',
    'Mupro': 'mupro.de',
    'Ondal': 'ondal.com',
    'Coin4 Solutions': 'coin4solutions.com',
    'Datapart': 'datapart.fi',
    'Eqqo': 'eqqo.com',
    'Ipsum': 'ipsum.com',
    'Sofia Developpement': 'sofiadeveloppement.com',
    'Remazing': 'remazing.com',
    'Implema': 'implema.fi',
    'Nordic Drives Group': 'nordicdrives.com',
    'Ametal': 'ametal.fi',
    'Flow Fastighetsvärden': 'flowfastigheter.se',
    'Autocirc': 'autocirc.com',
    'Cary Group': 'carygroup.com',
    'Equipe Zorgbedrijven': 'equipezorgbedrijven.nl',
    'Hjo Installation': 'hjoinstallation.se',
    'One Inc': 'oneinc.com',
    'Resman': 'resman.fi',
    'Team Relocations': 'teamrelocations.com',
    'Alligo': 'alligo.se',
    'Momentum Group': 'momentumgroup.se',
    'Nobia': 'nobia.com',
    'Micropower': 'micropower.no',
    'G&O': 'go.no',
    'Stronger': 'stronger.se',
    'Link Logistics': 'linklogistics.no',
    'Hoyer': 'hoyer.com',
    'KVD': 'kvd.no',
    'Presis Infra': 'presisinfra.no',
    'G-CON Manufacturing': 'g-conmanufacturing.com',
    'Myneva': 'myneva.fi',
    'Komet': 'komet.at',
    'Primutec': 'primutec.nl',
    'May Health': 'may-health.com',
    'BFC': 'bfcgroup.com',
    'Bluu Unit': 'bluuunit.com',
    'DYQIDAG': 'dyqidag.no',
    'Geia Group': 'geiagroup.no',
    'Inwerk': 'inwerk.com',
    'Kährs': 'kahrs.com',
    'Kinios': 'kinios.com',
    'Medon': 'medon.no',
    'Nuent': 'nuent.no',
    'Prodriven': 'prodriven.com',
    'Schock': 'schock.com',
    'Unica': 'unica.no',
    'Aleris': 'aleris.com',
    'Arvos Group': 'arvos-group.com',
    'Esperi': 'esperi.com',
    'HiQ': 'hiq.se',
    'Leadec': 'leadec.com',
    'Neprune': 'neprune.com',
    'Nuent Group': 'nuent.no',
    'Lakrids by Bülow': 'lakridsbybulow.com',
    'Origo': 'origo.dk',
    'Restolution': 'restolution.de',
    'Apoteka': 'apoteka.no',
    'Autie': 'autie.com',
    'Bildeler': 'bildeler.no',
    'Carla': 'carla.se',
    'Cleanwatts': 'cleanwatts.energy',
    'Educations Media Group': 'emg.se',
    'Indevis': 'indevis.de',
    'Innonature': 'innonature.com',
    'Instabee': 'instabee.com',
    'Once Upon': 'onceupon.com',
    'Pflegecampus': 'pflegecampus.de',
    'Porterbuddy': 'porterbuddy.com',
    'Press Ganey': 'pressganey.com',
    'Purity': 'purity.no',
    'Remember': 'remember.dk',
    'Ropro': 'ropro.no'
};

function extractCompanyDomain(company) {
    const name = (company && company.company) ? String(company.company).trim() : '';
    if (name) {
        if (COMPANY_DOMAIN_OVERRIDES[name]) return COMPANY_DOMAIN_OVERRIDES[name];
        // Case-insensitive fallback for name variants
        const nameLower = name.toLowerCase();
        for (const key of Object.keys(COMPANY_DOMAIN_OVERRIDES)) {
            if (key.toLowerCase() === nameLower) return COMPANY_DOMAIN_OVERRIDES[key];
        }
    }
    const websiteDomain = extractDomain((company && company.website) || '');
    if (websiteDomain) return websiteDomain;

    const rawLogo = (company && company.logo_url) || '';
    const clearbitPrefix = 'logo.clearbit.com/';
    const idx = rawLogo.indexOf(clearbitPrefix);
    if (idx >= 0) {
        const tail = rawLogo.substring(idx + clearbitPrefix.length);
        const domain = tail.split(/[/?#]/)[0].trim();
        return domain.replace(/^www\./, '');
    }

    return '';
}

// Helper function to generate company slug for URL
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

// Helper function to get PE firm domain
function getFirmDomain(firmName) {
    const firmDomains = {
        'EQT': 'eqtgroup.com',
        'Triton': 'triton-partners.com',
        'Triton Partners': 'triton-partners.com',
        'Trill Impact': 'trillimpact.com',
        'Nordic Capital': 'nordiccapital.com',
        'Litorina': 'litorina.se',
        'Valedo Partners': 'valedopartners.com',
        'Altor': 'altor.com',
        'Ratos': 'ratos.com',
        'Summa Equity': 'summaequity.com',
        'Bure Equity': 'bure.se',
        'Verdane': 'verdane.com',
        'Adelis Equity': 'adelisequity.com',
        'IK Partners': 'ikpartners.com',
        'Accent Equity': 'accentequity.se',
        'Alder': 'alder.se',
        'CapMan': 'capman.com',
        'Axcel': 'axcel.dk',
        'Amplio': 'amplio.se',
        'Helix Kapital': 'helixkapital.se',
        'Nordstjernan': 'nordstjernan.se',
        'Equip': 'equip.no',
        'Impilo': 'impilo.se',
        'MVI': 'mvi.se',
        'Nalka': 'nalka.com'
    };
    return firmDomains[firmName] || '';
}

// ===================================================================
// MODAL FUNCTIONALITY FOR COMPANY DETAILS
// ===================================================================

function initModal() {
    const modal = document.getElementById('companyModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const closeBtn2 = document.getElementById('closeModalBtn2');
    
    // Close modal when clicking close buttons
    closeBtn.addEventListener('click', closeCompanyModal);
    closeBtn2.addEventListener('click', closeCompanyModal);
    
    // Close modal when clicking outside of it
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeCompanyModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeCompanyModal();
        }
    });
}

async function openCompanyModal(company) {
    const modal = document.getElementById('companyModal');
    
    // Calculate metrics
    const currentYear = new Date().getFullYear();
    const entryYear = company.entry ? parseInt(normalizeEntryYear(company.entry), 10) : null;
    const status = company.status || (entryYear && currentYear - entryYear > 0 ? 'Active' : 'N/A');
    const isExited = status === 'Exited' || status === 'IPO';
    const exitYear = (company.exit_year && parseInt(String(company.exit_year).replace(/\D/g, '').slice(0, 4), 10)) || null;
    const endYear = (isExited && exitYear) ? exitYear : currentYear;
    const holdingPeriod = entryYear ? Math.max(0, endYear - entryYear) : null;
    const holdingPeriodText = holdingPeriod ? (isExited ? (holdingPeriod === 1 ? 'Held for 1 year' : `Held for ${holdingPeriod} years`) : (holdingPeriod === 1 ? '1 yr' : `${holdingPeriod} yrs`)) : '—';
    const geography = categorizeGeography(company.market);
    
    // Header Section - use favicon first (reliable for Nordic .se/.no/.dk)
    const modalDomain = extractCompanyDomain(company);
    const modalLogoUrl = getCompanyLogoUrl(company, modalDomain, company.company);
    const modalLogo = document.getElementById('modalCompanyLogo');
    modalLogo.style.display = '';
    modalLogo.src = modalLogoUrl;
    modalLogo.alt = company.company;
    modalLogo.onerror = function() {
        modalLogo.onerror = null;
        const clearbit = modalDomain ? `https://logo.clearbit.com/${modalDomain}` : '';
        modalLogo.src = clearbit || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.company || 'Co')}&background=3f7de8&color=fff&size=96`;
        modalLogo.onerror = function() {
            modalLogo.onerror = null;
            modalLogo.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.company || 'Co')}&background=3f7de8&color=fff&size=96`;
            modalLogo.onerror = function() { modalLogo.style.display = 'none'; };
        };
    };
    document.getElementById('modalCompanyName').textContent = company.company;
    document.getElementById('modalCompanySector').textContent = company.sector || 'N/A';
    document.getElementById('modalStatusHeader').textContent = status;
    
    // Quick Stats Banner
    document.getElementById('modalBannerEntry').textContent = normalizeEntryYear(company.entry) || 'N/A';
    document.getElementById('modalBannerHolding').textContent = holdingPeriodText;
    document.getElementById('modalBannerEmployees').textContent = company.employees || '—';
    document.getElementById('modalBannerDeal').textContent = company.deal_size || '—';
    
    // Company Overview — narrative only; metrics live in "Figures & source"
    const modalDescEl = document.getElementById('modalDescription');
    if (modalDescEl) {
        modalDescEl.textContent = window.companyKeyFacts
            ? companyKeyFacts.getOverviewText(company)
            : (company.description || company.detailed_description ||
                `${company.company} is a ${company.sector || 'business'} company based in ${company.headquarters || company.market || 'the Nordic region'}. The company operates in the ${company.sector || 'business services'} sector and is a portfolio company of ${company.source || 'a leading PE firm'}.`);
    }
    const modalKeyFactsEl = document.getElementById('modalKeyFactsSection');
    if (window.companyKeyFacts && modalKeyFactsEl) {
        companyKeyFacts.renderKeyFactsSection(modalKeyFactsEl, company);
    } else if (modalKeyFactsEl) {
        modalKeyFactsEl.style.display = 'none';
        modalKeyFactsEl.hidden = true;
    }
    
    // Investment Details
    document.getElementById('modalPEFirm').textContent = company.source || 'N/A';
    document.getElementById('modalFund').textContent = company.fund || 'N/A';
    document.getElementById('modalEntryYear').textContent = normalizeEntryYear(company.entry) || 'N/A';
    document.getElementById('modalDealSize').textContent = company.deal_size || '—';
    
    // Geographic & Market Information
    document.getElementById('modalHeadquarters').textContent = company.headquarters || 'N/A';
    document.getElementById('modalMarket').textContent = company.market || 'N/A';
    
    // Geography badge styling
    const geoBadge = document.getElementById('modalGeography');
    geoBadge.textContent = geography;
    if (geography === 'Domestic') {
        geoBadge.style.background = '#8b5cf620';
        geoBadge.style.color = '#7c3aed';
    } else if (geography === 'Nordic') {
        geoBadge.style.background = '#06b6d420';
        geoBadge.style.color = '#0891b2';
    } else {
        geoBadge.style.background = '#f59e0b20';
        geoBadge.style.color = '#d97706';
    }
    
    // Operational Metrics
    document.getElementById('modalEmployees').textContent = company.employees || '—';
    document.getElementById('modalHoldingPeriod').textContent = holdingPeriodText;
    
    // Status badge styling
    const statusBadge = document.getElementById('modalStatus');
    statusBadge.textContent = status;
    if (status === 'Active') {
        statusBadge.style.background = '#10b98120';
        statusBadge.style.color = '#059669';
    } else if (status === 'Exited') {
        statusBadge.style.background = '#6b728020';
        statusBadge.style.color = '#475569';
    } else if (status === 'IPO') {
        statusBadge.style.background = '#3b82f620';
        statusBadge.style.color = '#2563eb';
    } else {
        statusBadge.style.background = '#94a3b820';
        statusBadge.style.color = '#64748b';
    }
    
    // Business Intelligence
    document.getElementById('modalSectorDetail').textContent = company.sector || 'N/A';
    
    // Determine growth stage based on holding period and employees
    let growthStage = 'Expansion';
    if (company.employees) {
        const empStr = company.employees.toLowerCase();
        if (empStr.includes('500') || empStr.includes('1000')) {
            growthStage = 'Scale-up';
        } else if (empStr.includes('50-100') || empStr.includes('100-150')) {
            growthStage = 'Growth';
        }
    }
    if (holdingPeriod && holdingPeriod < 2) {
        growthStage = 'Early Stage';
    }
    document.getElementById('modalGrowthStage').textContent = growthStage;
    
    // Business Model
    document.getElementById('modalBusinessModel').textContent = determinBusinessModel(company);
    
    // Website button
    const websiteBtn = document.getElementById('modalWebsiteBtn');
    if (company.website) {
        websiteBtn.href = company.website;
        websiteBtn.style.display = 'inline-flex';
    } else {
        websiteBtn.style.display = 'none';
    }
    
    // Show modal with animation
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Hide optional sections initially
    hideOptionalSections();
    
    // Show loading indicator
    document.getElementById('modalLoadingIndicator').style.display = 'block';
    
    // Fetch enriched data from research API
    await fetchCompanyResearchData(company);
}

function hideOptionalSections() {
    document.getElementById('modalFundingSection').style.display = 'none';
    document.getElementById('modalLeadershipSection').style.display = 'none';
    document.getElementById('modalProductsSection').style.display = 'none';
    document.getElementById('modalNewsSection').style.display = 'none';
    document.getElementById('modalMarketSection').style.display = 'none';
}

async function fetchCompanyResearchData(company) {
    try {
        console.log(`🔍 Fetching research data for: ${company.company}`);
        
        const response = await fetch(`/api/portfolio/research/${encodeURIComponent(company.company)}`);
        const data = await response.json();
        
        // Hide loading indicator
        document.getElementById('modalLoadingIndicator').style.display = 'none';
        
        if (data.success && data.research_data) {
            const research = data.research_data;
            
            // Update overview if we got better data (do not replace curated registry-split profiles)
            if (
                research.overview &&
                research.overview.length > 100 &&
                !company.metrics_source
            ) {
                document.getElementById('modalDescription').textContent = research.overview;
            }
            
            // Populate funding section if available
            if (research.total_funding || research.valuation || research.funding_history.length > 0) {
                populateFundingSection(research);
            }
            
            // Populate leadership section if available
            if (research.leadership && research.leadership.length > 0) {
                populateLeadershipSection(research.leadership);
            }
            
            // Populate products section if available
            if (research.products && research.products.length > 0) {
                populateProductsSection(research.products, research.technology);
            }
            
            // Populate news section if available
            if (research.recent_news && research.recent_news.length > 0) {
                populateNewsSection(research.recent_news);
            }
            
            // Populate market position section if available
            if (research.target_market || research.market_position || research.competitive_advantages.length > 0) {
                populateMarketSection(research);
            }
            
            console.log('✅ Research data loaded successfully');
        } else {
            console.log('⚠️ No additional research data available');
        }

        if (window.companyKeyFacts && company) {
            const kfEl = document.getElementById('modalKeyFactsSection');
            companyKeyFacts.renderKeyFactsSection(kfEl, company);
        }
        
    } catch (error) {
        console.error('❌ Error fetching research data:', error);
        document.getElementById('modalLoadingIndicator').style.display = 'none';
    }
}

function determinBusinessModel(company) {
    const sector = (company.sector || '').toLowerCase();
    if (sector.includes('software') || sector.includes('saas')) return 'SaaS/Enterprise';
    if (sector.includes('retail') || sector.includes('ecommerce')) return 'B2C/Retail';
    if (sector.includes('healthcare') || sector.includes('medical')) return 'Healthcare Services';
    if (sector.includes('finance') || sector.includes('fintech')) return 'Financial Services';
    if (sector.includes('manufacturing') || sector.includes('industrial')) return 'B2B/Manufacturing';
    return 'Enterprise/B2B';
}

function populateFundingSection(research) {
    document.getElementById('modalTotalFunding').textContent = research.total_funding || '—';
    document.getElementById('modalValuation').textContent = research.valuation || '—';
    document.getElementById('modalFundingStage').textContent = research.funding_history.length > 0 ? 
        research.funding_history[research.funding_history.length - 1].stage : '—';
    
    // Show funding history if available
    if (research.funding_history && research.funding_history.length > 0) {
        const historyHtml = research.funding_history.map(round => `
            <div style="padding: 0.75rem; background: #faf5ff; border-radius: 8px; margin-bottom: 0.75rem;">
                <div style="font-weight: 700; color: #5b21b6; margin-bottom: 0.25rem;">${round.stage} - ${round.amount}</div>
                <div style="font-size: 0.875rem; color: #7c3aed;">${round.date} • ${round.investors.join(', ')}</div>
            </div>
        `).join('');
        document.getElementById('modalFundingHistory').innerHTML = historyHtml;
    }
    
    document.getElementById('modalFundingSection').style.display = 'block';
}

function populateLeadershipSection(leadership) {
    const leadershipHtml = leadership.map(leader => `
        <div class="modal-leader-card">
            <div class="modal-leader-avatar"><i class="fas fa-user"></i></div>
            <div class="modal-leader-info">
                <div class="modal-leader-name">${escapeHtml(leader.name)}</div>
                <div class="modal-leader-role">${escapeHtml(leader.role)}</div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('modalLeadership').innerHTML = leadershipHtml;
    document.getElementById('modalLeadershipSection').style.display = 'block';
}

function populateProductsSection(products, technology) {
    const productsHtml = products.map(product => `
        <div class="modal-product-item">
            <div class="modal-product-name">${escapeHtml(product.name)}</div>
            <div class="modal-product-desc">${escapeHtml(product.description)}</div>
        </div>
    `).join('');
    
    document.getElementById('modalProducts').innerHTML = productsHtml;
    
    if (technology && technology.length > 0) {
        const techHtml = technology.map(tech => `
            <span class="modal-tech-tag">${escapeHtml(tech)}</span>
        `).join('');
        document.getElementById('modalTechnology').innerHTML = techHtml;
    }
    
    document.getElementById('modalProductsSection').style.display = 'block';
}

function populateNewsSection(news) {
    const newsHtml = news.map(item => `
        <div class="modal-news-item">
            <div class="modal-news-date">${item.date}</div>
            <div class="modal-news-title">${escapeHtml(item.title)}</div>
            <div class="modal-news-content">${escapeHtml(item.content)}</div>
        </div>
    `).join('');
    
    document.getElementById('modalNews').innerHTML = newsHtml;
    document.getElementById('modalNewsSection').style.display = 'block';
}

function populateMarketSection(research) {
    document.getElementById('modalTargetMarket').textContent = research.target_market || '—';
    document.getElementById('modalMarketPosition').textContent = research.market_position || '—';
    
    if (research.competitive_advantages && research.competitive_advantages.length > 0) {
        const advantagesHtml = research.competitive_advantages.map(adv => `
            <div class="modal-advantage-item">
                <div class="modal-advantage-icon"><i class="fas fa-check-circle"></i></div>
                <div class="modal-advantage-text">${escapeHtml(adv)}</div>
            </div>
        `).join('');
        document.getElementById('modalAdvantages').innerHTML = advantagesHtml;
    }
    
    document.getElementById('modalMarketSection').style.display = 'block';
}

function closeCompanyModal() {
    const modal = document.getElementById('companyModal');
    modal.classList.remove('show');
    // Restore body scroll
    document.body.style.overflow = '';
}

console.log('📊 Portfolio page ready with logos!');

