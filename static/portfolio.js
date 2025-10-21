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

function init() {
    const refreshBtn = document.getElementById('refreshPortfolioBtn');
    const searchInput = document.getElementById('portfolioSearchInput');
    
    refreshBtn.addEventListener('click', reloadPortfolio);
    searchInput.addEventListener('input', handlePortfolioSearch);
    
    // Auto-load portfolio data on page load
    loadPortfolio();
}

async function scrapePortfolio() {
    const refreshBtn = document.getElementById('refreshPortfolioBtn');
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
        const response = await fetch('/api/portfolio');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('portfolioTotalCount').textContent = data.count;
            displayPortfolio(data.companies);
            calculateStatistics(data.companies);
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
    const recentCount = companies.filter(c => c.entry === '2024' || c.entry === '2025').length;
    const recentCountEl = document.getElementById('statsRecentCount');
    if (recentCountEl) recentCountEl.textContent = recentCount;
    
    // Calculate average holding period (only for companies with entry year)
    const currentYear = new Date().getFullYear();
    const companiesWithYear = companies.filter(c => c.entry && c.entry !== '' && !isNaN(c.entry));
    if (companiesWithYear.length > 0) {
        const avgYears = companiesWithYear.reduce((sum, c) => sum + (currentYear - parseInt(c.entry)), 0) / companiesWithYear.length;
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
    
    // Count by year
    const yearCounts = {};
    companies.forEach(c => {
        if (c.entry && c.entry !== '' && !isNaN(c.entry)) {
            yearCounts[c.entry] = (yearCounts[c.entry] || 0) + 1;
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

function createSectorChart(companies) {
    const ctx = document.getElementById('sectorChart');
    if (!ctx) return;
    
    // Count by sector
    const sectorCounts = {};
    companies.forEach(c => {
        if (c.sector && c.sector !== '') {
            sectorCounts[c.sector] = (sectorCounts[c.sector] || 0) + 1;
        }
    });
    
    // Sort by count and take top 10
    const sortedSectors = Object.entries(sectorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const labels = sortedSectors.map(s => s[0]);
    const data = sortedSectors.map(s => s[1]);
    
    // Destroy old chart if exists
    if (sectorChartInstance) sectorChartInstance.destroy();
    
    const colors = [
        '#6366F1', '#4F46E5', '#8B5CF6', '#7C3AED',
        '#3B82F6', '#5B21B6', '#6D28D9', '#4338CA',
        '#818CF8', '#A78BFA'
    ];
    
    sectorChartInstance = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.map(c => c + 'CC'),
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverBorderWidth: 3,
                hoverBorderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1500,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 14,
                        padding: 10,
                        font: { size: 12, weight: '700' },
                        usePointStyle: true,
                        pointStyle: 'rectRounded',
                        color: '#1f2937'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    padding: 14,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    borderColor: '#667eea',
                    borderWidth: 2,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed.r || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return ` ${label}: ${value} companies (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                r: {
                    ticks: {
                        display: false
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

function createCountryChart(companies) {
    const ctx = document.getElementById('countryChart');
    if (!ctx) return;
    
    // Count by country/market
    const countryCounts = {};
    companies.forEach(c => {
        if (c.market && c.market !== '' && c.market !== 'N/A') {
            countryCounts[c.market] = (countryCounts[c.market] || 0) + 1;
        }
    });
    
    // Sort by count and take top 10
    const sortedCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const labels = sortedCountries.map(s => s[0]);
    const data = sortedCountries.map(s => s[1]);
    
    // Destroy old chart if exists
    if (countryChartInstance) countryChartInstance.destroy();
    
    // Blue and purple color palette
    const colors = labels.map((_, i) => {
        const colorPalette = ['#4F46E5', '#6366F1', '#7C3AED', '#8B5CF6', '#3B82F6', '#5B21B6', '#6D28D9', '#4338CA', '#818CF8', '#A78BFA'];
        return colorPalette[i % colorPalette.length];
    });
    
    countryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Companies',
                data: data,
                backgroundColor: colors.map(c => c + 'DD'),
                borderWidth: 4,
                borderColor: '#ffffff',
                hoverBorderWidth: 6,
                hoverBorderColor: '#667eea',
                hoverOffset: 12,
                spacing: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1500,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 14,
                        padding: 10,
                        font: { size: 12, weight: '700' },
                        usePointStyle: true,
                        pointStyle: 'rectRounded',
                        color: '#1f2937'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    padding: 14,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    borderColor: '#667eea',
                    borderWidth: 2,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return ` ${label}: ${value} companies (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
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
        const firmDomain = getFirmDomain(source);
        const firmLogoUrl = `https://logo.clearbit.com/${firmDomain}`;
        
        // Create clickable header
        const firmLink = document.createElement('a');
        firmLink.href = `/pe-firm/${source}`;
        firmLink.className = 'firm-header-link';
        firmLink.innerHTML = `
            <h3>
                <img src="${firmLogoUrl}" 
                     alt="${escapeHtml(source)}" 
                     class="firm-logo"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
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
            
            // Make company name clickable with logo
            const logoUrl = company.logo_url || (company.website ? 
                `https://logo.clearbit.com/${extractDomain(company.website)}` : '');
            
            const companyNameHtml = `<span class="company-link-modal" style="cursor: pointer;">
                    <img src="${logoUrl}" 
                         alt="${escapeHtml(company.company)}" 
                         class="company-logo"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                    <i class="fas fa-building company-icon-fallback" style="display:none;"></i>
                    ${escapeHtml(company.company)}
                    <i class="fas fa-info-circle" style="margin-left: 8px; color: #667eea; opacity: 0.7;"></i>
                </span>`;
            
            // Add description as tooltip - check both description and detailed_description fields
            const description = company.description || company.detailed_description || '';
            
            // Calculate additional metrics
            const currentYear = 2025;
            const entryYear = company.entry ? parseInt(company.entry) : null;
            const holdingPeriod = entryYear ? currentYear - entryYear : null;
            
            // Determine status
            const status = company.status || (holdingPeriod && holdingPeriod > 0 ? 'Active' : 'N/A');
            const statusColor = status === 'Active' ? '#10b981' : status === 'Exited' ? '#6b7280' : status === 'IPO' ? '#3b82f6' : '#94a3b8';
            
            // Deal size - only show if we have actual data
            const dealSize = company.deal_size || null;
            
            // Categorize geography
            const geography = categorizeGeography(company.market);
            const geographyColor = geography === 'Domestic' ? '#8b5cf6' : geography === 'Nordic' ? '#06b6d4' : '#f59e0b';
            
            row.innerHTML = `
                <td class="company-name" title="${escapeHtml(description)}">
                    ${companyNameHtml}
                </td>
                <td>${escapeHtml(company.sector || 'N/A')}</td>
                <td>
                    <span class="fund-badge">${escapeHtml(company.fund || 'N/A')}</span>
                </td>
                <td>${escapeHtml(company.market || 'N/A')}</td>
                <td style="font-size: 0.65rem; color: #64748b;">
                    <i class="fas fa-map-marker-alt" style="color: #667eea; margin-right: 4px;"></i>
                    ${escapeHtml(company.headquarters || 'N/A')}
                </td>
                <td style="color: ${company.entry ? 'inherit' : '#94a3b8'}; font-size: 0.65rem;">${escapeHtml(company.entry || 'N/A')}</td>
                <td style="text-align: center; font-weight: 600; color: ${holdingPeriod ? '#667eea' : '#94a3b8'}; font-size: 0.65rem;">
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
                        `<a href="${escapeHtml(company.website)}" target="_blank" style="color: #667eea; font-size: 16px; text-decoration: none;" title="${escapeHtml(company.website)}">
                            <i class="fas fa-external-link-alt"></i>
                        </a>` : 
                        `<span style="color: #cbd5e1;">—</span>`
                    }
                </td>
            `;
            
            tbody.appendChild(row);
            
            // Add click handler to company name to open modal
            const companyNameCell = row.querySelector('.company-name');
            if (companyNameCell) {
                const companyLinkModal = companyNameCell.querySelector('.company-link-modal');
                if (companyLinkModal) {
                    companyLinkModal.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        openCompanyModal(company);
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
        
        firmSection.appendChild(table);
        container.appendChild(firmSection);
    });
}

let searchTimeout;
async function handlePortfolioSearch(event) {
    const query = event.target.value.trim();
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        
        if (query === '') {
            loadPortfolio();
            return;
        }
        
        showLoading(true);
        
        try {
            const response = await fetch(`/api/portfolio/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('portfolioTotalCount').textContent = data.count;
                displayPortfolio(data.results);
                
                if (data.count === 0) {
                    showStatusMessage(`No companies found for "${query}"`, 'error');
                }
            }
            
        } catch (error) {
            console.error('Error searching portfolio:', error);
            showStatusMessage('❌ Search failed', 'error');
        } finally {
            showLoading(false);
        }
        
    }, 300);
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
        const domain = url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
        return domain;
    } catch (e) {
        return '';
    }
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
    
    // Header Section
    const logoUrl = company.logo_url || (company.website ? 
        `https://logo.clearbit.com/${extractDomain(company.website)}` : '');
    
    document.getElementById('modalCompanyLogo').src = logoUrl;
    document.getElementById('modalCompanyLogo').alt = company.company;
    document.getElementById('modalCompanyName').textContent = company.company;
    document.getElementById('modalCompanySector').textContent = company.sector || 'N/A';
    document.getElementById('modalStatusHeader').textContent = status;
    
    // Quick Stats Banner
    document.getElementById('modalBannerEntry').textContent = company.entry || 'N/A';
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
    document.getElementById('modalEntryYear').textContent = company.entry || 'N/A';
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

