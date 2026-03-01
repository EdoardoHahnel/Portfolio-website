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
    'Polaris': 'polarisequity.dk'
};
let allPortfolioCompanies = [];

function init() {
    const searchInput = document.getElementById('portfolioSearchInput');
    const sectorFilter = document.getElementById('sectorFilter');
    const marketFilter = document.getElementById('marketFilter');
    const hqFilter = document.getElementById('hqFilter');
    const entryYearFilter = document.getElementById('entryYearFilter');
    const geographyFilter = document.getElementById('geographyFilter');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    if (searchInput) searchInput.addEventListener('input', handlePortfolioSearch);
    [sectorFilter, marketFilter, hqFilter, entryYearFilter, geographyFilter].forEach(el => {
        if (el) el.addEventListener('change', scheduleRenderFilteredPortfolio);
    });
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
    initChartCardNavigation();
    
    // Auto-load portfolio data on page load
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

// Shared dashboard-aligned colour palette for circle charts
const DASHBOARD_CHART_COLORS = [
    '#3f7de8', '#2f64c0', '#4a8ef4', '#2563eb',
    '#1e40af', '#3b82f6', '#60a5fa', '#0ea5e9',
    '#0284c7', '#0369a1'
];

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
    
    sectorChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: labels.map((_, i) => DASHBOARD_CHART_COLORS[i % DASHBOARD_CHART_COLORS.length]),
                borderWidth: 3,
                borderColor: '#ffffff',
                hoverBorderWidth: 4,
                hoverBorderColor: '#ffffff',
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '58%',
            spacing: 2,
            onClick: (event, elements, chart) => {
                if (!elements || elements.length === 0) return;
                const index = elements[0].index;
                const sector = chart.data.labels[index];
                window.location.href = `/portfolio-insights?chart=sector&value=${encodeURIComponent(String(sector))}`;
            },
            onHover: (event, elements) => {
                if (event?.native?.target) {
                    event.native.target.style.cursor = elements?.length ? 'pointer' : 'default';
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 800,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 8,
                        padding: 6,
                        font: { size: 9, weight: '600' },
                        usePointStyle: true,
                        pointStyle: 'circle',
                        color: '#1e293b'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(31, 41, 55, 0.96)',
                    padding: 12,
                    titleFont: { size: 12, weight: 'bold' },
                    bodyFont: { size: 11 },
                    borderColor: '#3f7de8',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    boxPadding: 4,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = ((value / total) * 100).toFixed(1);
                            return ` ${context.label}: ${value} companies (${pct}%)`;
                        }
                    }
                }
            }
        }
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
    
    countryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: labels.map((_, i) => DASHBOARD_CHART_COLORS[i % DASHBOARD_CHART_COLORS.length]),
                borderWidth: 3,
                borderColor: '#ffffff',
                hoverBorderWidth: 4,
                hoverBorderColor: '#ffffff',
                hoverOffset: 6,
                spacing: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '58%',
            onClick: (event, elements, chart) => {
                if (!elements || elements.length === 0) return;
                const index = elements[0].index;
                const market = chart.data.labels[index];
                window.location.href = `/portfolio-insights?chart=country&value=${encodeURIComponent(String(market))}`;
            },
            onHover: (event, elements) => {
                if (event?.native?.target) {
                    event.native.target.style.cursor = elements?.length ? 'pointer' : 'default';
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 800,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 8,
                        padding: 6,
                        font: { size: 9, weight: '600' },
                        usePointStyle: true,
                        pointStyle: 'circle',
                        color: '#1e293b'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(31, 41, 55, 0.96)',
                    padding: 12,
                    titleFont: { size: 12, weight: 'bold' },
                    bodyFont: { size: 11 },
                    borderColor: '#3f7de8',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    boxPadding: 4,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = ((value / total) * 100).toFixed(1);
                            return ` ${context.label}: ${value} companies (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

function normalizeFilterValue(value) {
    return cleanDisplayText(value || '');
}

/** Extract year only from entry (e.g. '2025-05' -> '2025', '2023' -> '2023'). */
function normalizeEntryYear(raw) {
    if (raw == null || raw === '') return '';
    const s = String(raw).trim();
    if (s.includes('-')) {
        const y = s.split('-')[0];
        return (y.length === 4 && /^\d{4}$/.test(y)) ? y : s;
    }
    return (/^\d{4}$/.test(s) || /^\d{4}/.test(s)) ? s.substring(0, 4) : s;
}

function getSelectedValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function getActiveFilters() {
    return {
        query: getSelectedValue('portfolioSearchInput').toLowerCase(),
        sector: getSelectedValue('sectorFilter'),
        market: getSelectedValue('marketFilter'),
        headquarters: getSelectedValue('hqFilter'),
        entry: getSelectedValue('entryYearFilter'),
        geography: getSelectedValue('geographyFilter')
    };
}

function hasActiveFilters(filters) {
    return Boolean(
        filters.query ||
        filters.sector ||
        filters.market ||
        filters.headquarters ||
        filters.entry ||
        filters.geography
    );
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

        const matchesQuery = !filters.query || [
            cleanCompany,
            cleanSector,
            cleanMarket,
            cleanHQ,
            cleanEntry,
            owner
        ].some(val => val.toLowerCase().includes(filters.query));

        return matchesQuery &&
            (!filters.sector || sectorGroup === filters.sector) &&
            (!filters.market || cleanMarket === filters.market) &&
            (!filters.headquarters || cleanHQ === filters.headquarters) &&
            (!filters.entry || cleanEntry === filters.entry) &&
            (!filters.geography || geography === filters.geography);
    });
}

function populateFilterOptions(companies) {
    const sectorFilter = document.getElementById('sectorFilter');
    const marketFilter = document.getElementById('marketFilter');
    const hqFilter = document.getElementById('hqFilter');
    const entryYearFilter = document.getElementById('entryYearFilter');
    if (!sectorFilter || !marketFilter || !hqFilter || !entryYearFilter) return;

    const sectors = [...new Set(
        companies
            .map(c => categorizeSector(normalizeFilterValue(c.sector)))
            .filter(Boolean)
    )].sort();
    const markets = [...new Set(companies.map(c => normalizeFilterValue(c.market)).filter(Boolean))].sort();
    const hqs = [...new Set(companies.map(c => normalizeFilterValue(c.headquarters || c.market)).filter(Boolean))].sort();
    const years = [...new Set(companies.map(c => normalizeFilterValue(normalizeEntryYear(c.entry))).filter(Boolean))].sort((a, b) => Number(b) - Number(a));

    setSelectOptions(sectorFilter, 'All Sector Groups', sectors);
    setSelectOptions(marketFilter, 'All Markets', markets);
    setSelectOptions(hqFilter, 'All HQ', hqs);
    setSelectOptions(entryYearFilter, 'All Entry Years', years);
}

function setSelectOptions(selectEl, placeholder, values) {
    const selected = selectEl.value;
    selectEl.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = placeholder;
    selectEl.appendChild(defaultOption);
    values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        selectEl.appendChild(option);
    });
    selectEl.value = values.includes(selected) ? selected : '';
}

function clearAllFilters() {
    ['portfolioSearchInput', 'sectorFilter', 'marketFilter', 'hqFilter', 'entryYearFilter', 'geographyFilter'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
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

function displayFilteredPortfolioFlat(companies) {
    const container = document.getElementById('portfolioContainer');
    const emptyState = document.getElementById('portfolioEmptyState');
    if (!companies || companies.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    const rows = companies.map(company => {
        const cleanCompany = cleanDisplayText(company.company || 'N/A');
        const cleanSector = cleanDisplayText(company.sector || 'N/A');
        const cleanMarket = cleanDisplayText(company.market || 'N/A');
        const cleanHQ = cleanDisplayText(company.headquarters || company.market || 'N/A');
        const cleanEntry = cleanDisplayText(normalizeEntryYear(company.entry) || 'N/A');
        const cleanOwner = cleanDisplayText(company.source || 'N/A');
        const geography = categorizeGeography(cleanMarket);
        return `
            <tr>
                <td>${escapeHtml(cleanCompany)}</td>
                <td>${escapeHtml(cleanOwner)}</td>
                <td>${escapeHtml(cleanSector)}</td>
                <td>${escapeHtml(cleanMarket)}</td>
                <td>${escapeHtml(cleanHQ)}</td>
                <td>${escapeHtml(cleanEntry)}</td>
                <td>${escapeHtml(geography)}</td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <div class="portfolio-table-wrapper">
            <table class="portfolio-table">
                <thead>
                    <tr>
                        <th>Company</th>
                        <th>Owner (GP)</th>
                        <th>Sector</th>
                        <th>Market</th>
                        <th>Headquarters</th>
                        <th>Entry Year</th>
                        <th>Geography</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

function displayPortfolio(companies) {
    const container = document.getElementById('portfolioContainer');
    const emptyState = document.getElementById('portfolioEmptyState');
    
    if (!companies || companies.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    container.innerHTML = '';
    
    // Group companies by PE firm (source)
    const groupedCompanies = {};
    companies.forEach(company => {
        const source = company.source || 'Other';
        if (!groupedCompanies[source]) {
            groupedCompanies[source] = [];
        }
        groupedCompanies[source].push(company);
    });
    
    // Create a section for each PE firm
    Object.keys(groupedCompanies).sort().forEach(source => {
        const firmCompanies = groupedCompanies[source];
        
        // Create firm section
        const firmSection = document.createElement('div');
        firmSection.className = 'firm-section';
        
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
        
        // Table header
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
                <th>Deal Size</th>
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
            const companyLogoSrc = getCompanyLogoUrl(company, companyDomain, cleanCompany);
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
            const currentYear = 2025;
            const entryYear = company.entry ? parseInt(normalizeEntryYear(company.entry), 10) : null;
            const holdingPeriod = entryYear ? currentYear - entryYear : null;
            
            // Determine status
            const status = company.status || (holdingPeriod && holdingPeriod > 0 ? 'Active' : 'N/A');
            const statusColor = status === 'Active' ? '#10b981' : status === 'Exited' ? '#6b7280' : status === 'IPO' ? '#3b82f6' : '#94a3b8';
            
            // Deal size - only show if we have actual data
            const dealSize = company.deal_size || null;
            
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
                    ${holdingPeriod ? `${holdingPeriod} yrs` : '—'}
                </td>
                <td style="text-align: center;">
                    <span style="background: ${statusColor}15; color: ${statusColor}; padding: 2px 6px; border-radius: 8px; font-size: 0.55rem; font-weight: 600; display: inline-block;">
                        ${status}
                    </span>
                </td>
                <td style="text-align: center; font-size: 0.65rem; color: ${dealSize ? '#1e40af' : '#94a3b8'}; font-weight: ${dealSize ? '600' : 'normal'};">
                    ${dealSize || '—'}
                </td>
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
    // Categorize geography type
    const nordicCountries = ['Sweden', 'Denmark', 'Norway', 'Finland', 'Iceland'];
    const domesticCountry = 'Sweden'; // Assuming Swedish PE firms primarily
    
    if (market === domesticCountry) {
        return 'Domestic';
    } else if (nordicCountries.includes(market)) {
        return 'Nordic';
    } else {
        return 'International';
    }
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

// Company logo: prefer Google Favicon (reliable for .se/.no/.dk) over Clearbit (often missing for Nordic companies)
function getCompanyLogoUrl(company, domain, cleanName) {
    const favicon = domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128` : '';
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName || 'Co')}&background=3f7de8&color=ffffff&size=64`;
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
    if (name && COMPANY_DOMAIN_OVERRIDES[name]) {
        return COMPANY_DOMAIN_OVERRIDES[name];
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
        'Triton Partners': 'triton-partners.com',
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
        'Alder': 'alder.se'
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
    const currentYear = 2025;
    const entryYear = company.entry ? parseInt(company.entry) : null;
    const holdingPeriod = entryYear ? currentYear - entryYear : null;
    const status = company.status || (holdingPeriod && holdingPeriod > 0 ? 'Active' : 'N/A');
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
    document.getElementById('modalBannerHolding').textContent = holdingPeriod ? `${holdingPeriod} yrs` : '—';
    document.getElementById('modalBannerEmployees').textContent = company.employees || '—';
    document.getElementById('modalBannerDeal').textContent = company.deal_size || '—';
    
    // Company Overview - check both description fields
    const descriptionText = company.description || company.detailed_description || 
        `${company.company} is a ${company.sector || 'business'} company based in ${company.headquarters || company.market || 'the Nordic region'}. The company operates in the ${company.sector || 'business services'} sector and is a portfolio company of ${company.source || 'a leading PE firm'}.`;
    document.getElementById('modalDescription').textContent = descriptionText;
    
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
    document.getElementById('modalHoldingPeriod').textContent = holdingPeriod ? `${holdingPeriod} years` : '—';
    
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
            
            // Update overview if we got better data
            if (research.overview && research.overview.length > 100) {
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

