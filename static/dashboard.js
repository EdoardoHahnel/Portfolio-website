/*
Dashboard - Main page interactivity
*/

// Available PE firms with profiles
const availablePEFirms = new Set([
    'EQT', 'Nordic Capital', 'Triton Partners', 'Altor', 'Amplio', 'Litorina', 
    'Adelis Equity', 'Ratos', 'Summa Equity', 'Accent Equity', 'IK Partners', 
    'Verdane', 'Valedo Partners', 'Alder', 'Bure Equity', 'CapMan', 
    'Celero', 'Polaris', 'Nordstjernan', 'Nalka', 'Norvestor', 'Helix Kapital', 'FSN Capital',
    'Impilo', 'Axcel', 'MVI', 'Equip', 'Trill Impact'
]);

// ===== TRUNCATE TEXT FUNCTION =====
// Truncates text to specified length and adds ellipsis
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

function getInitials(name) {
    if (!name) return 'NA';
    const words = String(name).trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return 'NA';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
}

function createInlineLogoHTML(name, primarySrc, size = 32, borderRadius = 6) {
    const safeName = escapeHtml(name || 'Unknown');
    const initials = getInitials(name);
    const encodedName = encodeURIComponent(name || 'Unknown');
    const numericSize = Number.isFinite(Number(size)) ? Number(size) : 32;
    const uiAvatarSrc = `https://ui-avatars.com/api/?name=${encodedName}&background=3f7de8&color=ffffff&size=${Math.max(64, numericSize * 2)}`;
    let faviconSrc = '';
    if (primarySrc && primarySrc.includes('clearbit.com')) {
        try {
            const m = primarySrc.match(/clearbit\.com\/([^/?]+)/);
            if (m && m[1]) faviconSrc = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(m[1])}&sz=128`;
        } catch (_) {}
    }
    const fallbackChain = faviconSrc ? `this.onerror=null; this.src='${faviconSrc}'; this.onerror=function(){this.src='${uiAvatarSrc}'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='flex';};};` : `this.src='${uiAvatarSrc}'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='flex';};`;

    return `<span style="position: relative; display: inline-flex; width:${numericSize}px; height:${numericSize}px; align-items:center; justify-content:center;">
        <img src="${primarySrc || uiAvatarSrc}"
             alt="${safeName}"
             style="width:${numericSize}px; height:${numericSize}px; object-fit:contain; border-radius:${borderRadius}px; background:#fff; flex-shrink:0;"
             onerror="${fallbackChain}">
        <span style="display:none; width:${numericSize}px; height:${numericSize}px; border-radius:${borderRadius}px; background:#3f7de8; color:#fff; font-size:${Math.max(11, Math.floor(numericSize * 0.38))}px; font-weight:700; letter-spacing:0.02em; align-items:center; justify-content:center;">${initials}</span>
    </span>`;
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Dashboard initialized!');
    loadDashboard();
});

// Cache for PE firm logos (from /api/pe-firms)
let peFirmLogosMap = null;
const firmDomainOverrides = {
    'Alder': 'alder.se',
    'Amplio': 'amplio.se',
    'Nalka': 'nalka.com',
    'Celero Capital': 'celerocapital.com',
    'Celero': 'celerocapital.com',
    'FSN Capital': 'fsncapital.com',
    'Polaris': 'polarisequity.dk',
    'Nordstjernan': 'nordstjernan.se',
    'Valedo Partners': 'valedopartners.com',
    'Valedo': 'valedopartners.com',
    'IK Partners': 'ikpartners.com',
    'Adelis Equity': 'adelisequity.com',
    'Altor': 'altor.com',
    'Axcel': 'axcel.dk',
    'CVC': 'cvc.com',
    'CVC Capital Partners': 'cvc.com'
};

async function loadDashboard() {
    try { await ensurePeFirmLogos(); } catch (e) { console.error('Logo map init failed:', e); }
    try { await loadPELogoMarquee(); } catch (e) { console.error('PE logo marquee failed:', e); }
    try { await loadLatestNews(); } catch (e) { console.error('Latest news failed:', e); }
    try { await loadActiveFundraising(); } catch (e) { console.error('Fundraising failed:', e); }
    try { await loadPortfolioTrends(); } catch (e) { console.error('Portfolio trends failed:', e); }
    try { await loadPEFirms(); } catch (e) { console.error('PE firms failed:', e); }
    try { await loadStats(); } catch (e) { console.error('Stats failed:', e); }
}

async function loadStats() {
    try {
        const response = await fetch('/api/analytics/summary');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalCompanies').textContent = data.summary.total_companies || 349;
            document.getElementById('totalNews').textContent = data.summary.total_news || 50;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadLatestNews() {
    try {
        console.log('Loading latest PE investment news...');
        const response = await fetch('/api/investment-news');
        const data = await response.json();
        
        console.log('Investment News API response:', data);
        
        if (data.success && data.news && data.news.length > 0) {
            const container = document.getElementById('latestNews');
            if (!container) {
                console.error('latestNews container not found');
                return;
            }
            
            container.innerHTML = '';
            
            // Limit to first 10 items for dashboard performance
            const peNews = data.news.slice(0, 10);
            
            console.log(`Displaying ${peNews.length} news items on dashboard`);
            
            peNews.forEach((article, index) => {
                try {
                    const item = document.createElement('div');
                    item.className = 'news-item-compact';
                    const sourceIcon = getSourceIcon(article.source);
                    
                    // Use firm from the news data
                    const firmName = article.firm || 'PE Firm';
                    const firmLogoHtml = createRobustLogoHTML(firmName, '24px');
                    
                    item.innerHTML = `
                        <div class="news-item-header">
                            <div style="display: flex; align-items: center;">
                                ${firmLogoHtml}
                                <span class="news-badge">${sourceIcon} ${escapeHtml(article.source || 'Cision')}</span>
                            </div>
                            <span class="news-date-small">${escapeHtml(article.date || 'Today')}</span>
                        </div>
                        <h4 class="news-title-compact">${escapeHtml(truncateText(article.title, 60))}</h4>
                        <a href="${escapeHtml(article.link)}" target="_blank" class="news-link-small">
                            Read more <i class="fas fa-arrow-right"></i>
                        </a>
                    `;
                    container.appendChild(item);
                } catch (itemError) {
                    console.error(`Error creating news item ${index}:`, itemError);
                }
            });
            
            // Add "View All" link
            const viewAllLink = document.createElement('div');
            viewAllLink.style.textAlign = 'center';
            viewAllLink.style.marginTop = '15px';
            viewAllLink.innerHTML = `<a href="/news" class="btn btn-primary btn-sm">View All ${data.news.length} Articles</a>`;
            container.appendChild(viewAllLink);
            
        } else {
            console.log('No news data available');
            // Show fallback message
            const container = document.getElementById('latestNews');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #666;">
                        <i class="fas fa-newspaper" style="font-size: 24px; margin-bottom: 10px; opacity: 0.5;"></i>
                        <p>Loading latest M&A news...</p>
                        <a href="/news" class="btn btn-primary btn-sm">View All News</a>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading news:', error);
        const container = document.getElementById('latestNews');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #dc2626;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px;"></i>
                    <p>Error loading news. Please refresh the page.</p>
                    <a href="/news" class="btn btn-primary btn-sm">View All News</a>
                </div>
            `;
        }
    }
}


async function loadActiveFundraising() {
    try {
        console.log('Loading active fundraising...');
        const response = await fetch('/api/fundraising');
        const data = await response.json();
        
        console.log('Fundraising API response:', data);
        
        if (data.success && data.fundraising && data.fundraising.length > 0) {
            const container = document.getElementById('activeFundraising');
            if (!container) {
                console.error('activeFundraising container not found');
                return;
            }
            
            container.innerHTML = '';
            
            // Mirror fundraising table logic: Nordic funds from Excel import, sorted by vintage/status
            let funds = data.fundraising.slice();
            // Filter to Excel import rows only
            funds = funds.filter(f => (f.source || '').toLowerCase() === 'excel import');
            // Filter to Nordic funds
            funds = funds.filter(isNordicFund);
            // Normalize fields for sorting
            funds = funds.map(f => ({
                ...f,
                _vintageYear: deriveVintageYear(f),
                _displaySize: f.final_size && f.final_size !== 'N/A' ? f.final_size : (f.target_size || 'N/A')
            }));
            // Sort: vintage desc, Marketing first, non-Closed before Closed, then firm
            funds.sort((a, b) => {
                const va = a._vintageYear || 0;
                const vb = b._vintageYear || 0;
                if (vb !== va) return vb - va;
                if (a.status === 'Marketing' && b.status !== 'Marketing') return -1;
                if (a.status !== 'Marketing' && b.status === 'Marketing') return 1;
                if (a.status === 'Closed' && b.status !== 'Closed') return 1;
                if (a.status !== 'Closed' && b.status === 'Closed') return -1;
                return (a.firm || '').localeCompare(b.firm || '');
            });
            // Take top 10
            const topFunds = funds.slice(0, 10);
            
            console.log(`Displaying ${topFunds.length} fundraising items`);
            
            if (topFunds.length > 0) {
                topFunds.forEach((fund, index) => {
                    try {
                        const item = document.createElement('div');
                        item.className = 'fundraising-item-compact';
                        const firm = fund.firm || 'Fund';
                        const firmLogo = (fund.firm_logo_url && fund.firm_logo_url.trim()) || getFirmLogoForName(firm) || guessFirmLogoUrl(firm);
                        const progressVal = Number.isFinite(Number(fund.progress)) ? Number(fund.progress) : null;
                        // Check if firm has a profile
                        const hasProfile = availablePEFirms.has(firm);
                        const logoImgHtml = createInlineLogoHTML(firm, firmLogo, 32, 6);
                        const firmLogoHtml = hasProfile
                            ? `<a href="/pe-firm/${encodeURIComponent(firm)}" style="text-decoration: none; display: inline-block;">${logoImgHtml}</a>`
                            : logoImgHtml;
                        
                        item.innerHTML = `
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                                <div style="display:flex; gap:10px; align-items:center;">
                                    ${firmLogoHtml}
                                    <div class="fund-name-compact">${escapeHtml(firm)} - ${escapeHtml(fund.fund_name)}</div>
                                    <div class="fund-details-compact">Target: ${escapeHtml((fund.final_size && fund.final_size !== 'N/A') ? fund.final_size : (fund.target_size || 'N/A'))} | ${escapeHtml(fund.status)}</div>
                                </div>
                                ${progressVal !== null ? `<span class="progress-badge">${progressVal}%</span>` : ''}
                            </div>
                            ${progressVal !== null ? `<div class=\"progress-bar\"><div class=\"progress-fill\" style=\"width: ${progressVal}%\"></div></div>` : ''}
                        `;
                        container.appendChild(item);
                    } catch (itemError) {
                        console.error(`Error creating fundraising item ${index}:`, itemError);
                    }
                });
                
                // Add "View All" link
                const viewAllLink = document.createElement('div');
                viewAllLink.style.textAlign = 'center';
                viewAllLink.style.marginTop = '15px';
                viewAllLink.innerHTML = `<a href="/fundraising" class="btn btn-primary btn-sm">View All ${data.fundraising.length} Funds</a>`;
                container.appendChild(viewAllLink);
            } else {
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #666;">
                        <i class="fas fa-chart-line" style="font-size: 24px; margin-bottom: 10px; opacity: 0.5;"></i>
                        <p>No fundraising data</p>
                        <a href="/fundraising" class="btn btn-primary btn-sm">View All Funds</a>
                    </div>
                `;
            }
        } else {
            console.log('No fundraising data available');
            const container = document.getElementById('activeFundraising');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: #666;">
                        <i class="fas fa-chart-line" style="font-size: 24px; margin-bottom: 10px; opacity: 0.5;"></i>
                        <p>Loading fundraising data...</p>
                        <a href="/fundraising" class="btn btn-primary btn-sm">View All Funds</a>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading fundraising:', error);
        const container = document.getElementById('activeFundraising');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #dc2626;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px;"></i>
                    <p>Error loading fundraising data. Please refresh the page.</p>
                    <a href="/fundraising" class="btn btn-primary btn-sm">View All Funds</a>
                </div>
            `;
        }
    }
}

// ===== PORTFOLIO TRENDS =====
// Shared with portfolio.js – identical format for circle charts
const DASHBOARD_CHART_COLORS = [
    '#3f7de8', '#2f64c0', '#4a8ef4', '#2563eb',
    '#1e40af', '#3b82f6', '#60a5fa', '#0ea5e9',
    '#0284c7', '#0369a1'
];

let trendsYearChartInstance = null;
let trendsSectorChartInstance = null;
let trendsCountryChartInstance = null;

async function loadPortfolioTrends() {
    try {
        const response = await fetch('/api/portfolio?_=' + Date.now(), { cache: 'no-store' });
        const data = await response.json();
        if (!data.success || !data.companies || data.companies.length === 0) {
            renderTrendsEmpty();
            return;
        }
        const companies = data.companies;

        // Aggregate by entry year
        const yearCounts = {};
        companies.forEach(c => {
            const y = (c.entry || '').toString().trim();
            const year = /^\d{4}$/.test(y) ? parseInt(y, 10) : null;
            if (year && year >= 2010 && year <= 2030) {
                yearCounts[year] = (yearCounts[year] || 0) + 1;
            }
        });
        const yearLabels = Object.keys(yearCounts).map(Number).sort((a, b) => a - b);
        const yearValues = yearLabels.map(y => yearCounts[y]);

        // Aggregate by sector
        const sectorCounts = {};
        companies.forEach(c => {
            const s = (c.sector || 'Other').trim() || 'Other';
            sectorCounts[s] = (sectorCounts[s] || 0) + 1;
        });
        const sectorEntries = Object.entries(sectorCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);
        const sectorLabels = sectorEntries.map(([k]) => k);
        const sectorValues = sectorEntries.map(([, v]) => v);

        // Aggregate by country (market or headquarters)
        const countryCounts = {};
        companies.forEach(c => {
            const country = (c.market || c.headquarters || c.country || 'Other').trim() || 'Other';
            countryCounts[country] = (countryCounts[country] || 0) + 1;
        });
        const countryEntries = Object.entries(countryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);
        const countryLabels = countryEntries.map(([k]) => k);
        const countryValues = countryEntries.map(([, v]) => v);

        createTrendsYearChart(yearLabels, yearValues);
        createTrendsSectorChart(sectorLabels, sectorValues);
        createTrendsCountryChart(countryLabels, countryValues);
        initTrendsChartNavigation();
    } catch (e) {
        console.error('Portfolio trends error:', e);
        renderTrendsEmpty();
    }
}

function initTrendsChartNavigation() {
    document.querySelectorAll('.trends-chart-card[data-chart-link]').forEach(card => {
        const chartKey = card.getAttribute('data-chart-link');
        if (!chartKey) return;
        card.addEventListener('click', () => {
            window.location.href = `/portfolio-insights?chart=${encodeURIComponent(chartKey)}`;
        });
    });
}

function createTrendsYearChart(labels, values) {
    const ctx = document.getElementById('trendsYearChart');
    if (!ctx || typeof Chart === 'undefined') return;
    if (trendsYearChartInstance) trendsYearChartInstance.destroy();
    if (!labels.length || !values.length) return;
    const palette = ['#3f7de8', '#2f64c0', '#2563eb', '#1d4ed8', '#1e40af'];
    trendsYearChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Investments',
                data: values,
                backgroundColor: labels.map((_, i) => palette[i % palette.length]),
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { stepSize: 1 } },
                x: { grid: { display: false } }
            }
        }
    });
}

function createTrendsSectorChart(labels, values) {
    const ctx = document.getElementById('trendsSectorChart');
    if (!ctx || typeof Chart === 'undefined') return;
    if (trendsSectorChartInstance) trendsSectorChartInstance.destroy();
    if (!labels.length || !values.length) return;
    trendsSectorChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
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
                            return ` ${context.label}: ${value} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

function createTrendsCountryChart(labels, values) {
    const ctx = document.getElementById('trendsCountryChart');
    if (!ctx || typeof Chart === 'undefined') return;
    if (trendsCountryChartInstance) trendsCountryChartInstance.destroy();
    if (!labels.length || !values.length) return;
    trendsCountryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
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
                            return ` ${context.label}: ${value} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

function renderTrendsEmpty() {
    // No-op when using charts only
}

// Helpers mirrored from fundraising table to keep ordering consistent
function deriveVintageYear(fund) {
    const candidates = [fund.vintage, fund.vintage_year, fund.vintageYear];
    for (const c of candidates) {
        const n = parseInt(c, 10);
        if (!isNaN(n) && n > 1900 && n < 3000) return n;
    }
    const dateFields = [fund.final_close_date, fund.first_close_date, fund.first_close, fund.final_close];
    for (const d of dateFields) {
        if (!d) continue;
        const m = String(d).match(/(20\d{2}|19\d{2})/);
        if (m) {
            const year = parseInt(m[1], 10);
            if (!isNaN(year)) return year;
        }
    }
    return undefined;
}

function isNordicFund(fund) {
    const geography = (fund.geography || fund.geographic_focus || fund.region || fund.country || '').toLowerCase();
    const firm = (fund.firm || '').toLowerCase();
    const nordicGeos = ['nordic', 'denmark', 'sweden', 'norway', 'finland', 'iceland', 'baltic', 'nordic region', 'nordic countries'];
    const isNordicGeo = nordicGeos.some(geo => geography.includes(geo));
    const nordicFirms = ['nordic', 'adelis', 'altor', 'axcel', 'eqt', 'fsn', 'herkules', 'ik', 'norvestor', 'polaris', 'procuritas', 'summa', 'triton', 'verdane', 'waterland', 'via equity', 'alfa framtak', 'credo', 'evolver', 'invl', 'peq', 'seb', 'triple', 'acathia', 'devco', 'main capital', 'mvi', 'vaaka', 'vendis', 'maj invest', 'trill impact', 'equip', 'impilo', 'helix', 'systematic', 'mentha', 'bny mellon'];
    const isNordicFirm = nordicFirms.some(nf => firm.includes(nf));
    return isNordicGeo || isNordicFirm;
}

// ===== PE firm logos (from /api/pe-firms) =====
async function ensurePeFirmLogos() {
    if (peFirmLogosMap !== null) return;
    try {
        const resp = await fetch('/api/pe-firms');
        const data = await resp.json();
        const firms = data.firms || {};
        const map = {};
        Object.keys(firms).forEach(key => {
            const firm = firms[key] || {};
            const rawLogo = firm.logo_url || firm.logo || '';
            const websiteDomain = (firm.website || '').replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
            const overrideDomain = firmDomainOverrides[firm.name] || firmDomainOverrides[key] || websiteDomain;
            const logo = rawLogo.includes('ui-avatars.com')
                ? (overrideDomain ? `https://logo.clearbit.com/${overrideDomain}` : '')
                : rawLogo;
            const variants = buildFirmNameVariants(key, firm.name);
            variants.forEach(v => { if (logo) map[v] = logo; });
        });
        peFirmLogosMap = map;
    } catch (e) {
        peFirmLogosMap = {};
    }
}

function buildFirmNameVariants(...names) {
    const out = new Set();
    names.filter(Boolean).forEach(n => {
        const base = String(n).trim();
        if (!base) return;
        const lower = base.toLowerCase();
        out.add(lower);
        out.add(lower.replace(/\bpartners\b/g, '').replace(/\s+/g, ' ').trim());
        out.add(lower.replace(/\bcapital\b/g, '').replace(/\s+/g, ' ').trim());
        out.add(lower.replace(/\bequity\b/g, '').replace(/\s+/g, ' ').trim());
        out.add(lower.replace(/\bmanagement\b/g, '').replace(/\s+/g, ' ').trim());
        out.add(lower.replace(/\binvestments?\b/g, '').replace(/\s+/g, ' ').trim());
        out.add(lower.replace(/\basset\b|\bmanagement\b/gi, '').replace(/\s+/g, ' ').trim());
        out.add(lower.replace(/\bprivate\b\s+\bequity\b/gi, ' ').replace(/\s+/g, ' ').trim());
        out.add(lower.replace(/\bpartners?\b|\bcapital\b|\bequity\b|\bmanagement\b|\binvestments?\b|\basset\b/gi, '').replace(/\s+/g, ' ').trim());
    });
    return [...out].filter(Boolean);
}

function domainFromUrl(url) {
    if (!url) return '';
    try {
        const parsed = new URL(url);
        if (parsed.hostname.includes('google.com') && parsed.pathname.includes('favicons')) {
            const domain = parsed.searchParams.get('domain');
            return domain || '';
        }
        if (parsed.hostname.includes('logo.clearbit.com')) {
            return parsed.pathname.replace(/^\/+/, '').split('/')[0];
        }
        return parsed.hostname.replace(/^www\./, '');
    } catch {
        return '';
    }
}

function getFirmLogoForName(name) {
    if (!name || !peFirmLogosMap) return undefined;
    const lower = String(name).toLowerCase().trim();
    if (peFirmLogosMap[lower]) return peFirmLogosMap[lower];
    const variants = buildFirmNameVariants(name);
    for (const v of variants) {
        if (peFirmLogosMap[v]) return peFirmLogosMap[v];
    }
    // curated clearbit domain fallbacks for common firms
    const fallbackDomains = {
        'eqt': 'eqtgroup.com',
        'nordic capital': 'nordiccapital.com',
        'triton': 'triton-partners.com',
        'altor': 'altor.com',
        'summa equity': 'summaequity.com',
        'litorina': 'litorina.com',
        'ratos': 'ratos.se',
        'adelis': 'adelisequity.com',
        'amplio': 'amplio.se',
        'segulah': 'amplio.se',
        'ik partners': 'ikpartners.com',
        'bure': 'bure.se',
        'accent equity': 'accentequity.com',
        'axcel': 'axcel.dk',
        'cvc': 'cvc.com',
        'capman': 'capman.com',
        'fsn capital': 'fsncapital.com',
        'fsn': 'fsncapital.com',
        'polaris': 'polarisequity.dk',
        'verdane': 'verdanecapital.com',
        'procuritas': 'procuritas.com',
        'impilo': 'impilo.se',
        'vaaka partners': 'vaakapartners.fi',
        'alder': 'alder.se',
        'celero': 'celerocapital.com',
        'nordstjernan': 'nordstjernan.se',
        'nalka': 'nalka.com',
        'valedo': 'valedopartners.com',
        'ahlström': 'ahlstromcapital.com',
        'ahlstrom': 'ahlstromcapital.com',
        'bridgepoint': 'bridgepoint.eu',
        'montagu': 'montagu.com',
        'sponsor capital': 'sponsorcapital.fi',
        'via equity': 'viaequity.com',
        'northzone': 'northzone.com',
        'atomico': 'atomico.com',
        'creandum': 'creandum.com',
        'industrifonden': 'industrifonden.com'
    };
    const key = Object.keys(fallbackDomains).find(k => lower.includes(k));
    if (key) return `https://logo.clearbit.com/${fallbackDomains[key]}`;
    return undefined;
}

function guessFirmLogoUrl(name) {
    if (!name) return undefined;
    const normalized = String(name).toLowerCase()
        .replace(/\b(private|equity|partners?|capital|buyout|management)\b/g, '')
        .replace(/[^a-z0-9]/g, '');
    if (!normalized) return undefined;
    return `https://logo.clearbit.com/${normalized}.com`;
}

async function loadPELogoMarquee() {
    const container = document.getElementById('peLogoMarquee');
    if (!container) return;
    try {
        const response = await fetch('/api/pe-firms');
        const data = await response.json();
        if (!data.firms) return;
        const firms = data.firms;
        let html = '';
        Object.keys(firms).forEach(firmKey => {
            const firm = firms[firmKey];
            const websiteDomain = (firm.website || '').replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
            const overrideDomain = firmDomainOverrides[firm.name] || firmDomainOverrides[firmKey] || websiteDomain;
            const apiLogo = firm.logo_url || '';
            const useApiLogo = apiLogo && !apiLogo.includes('ui-avatars.com');
            const clearbitLogo = overrideDomain ? `https://logo.clearbit.com/${overrideDomain}` : '';
            const primaryLogo = useApiLogo ? apiLogo : clearbitLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(firm.name || firmKey)}&background=4c1d95&color=fff&size=64`;
            const fallbackFavicon = overrideDomain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(overrideDomain)}&sz=128` : primaryLogo;
            const encodedKey = encodeURIComponent(firmKey);
            html += `<a href="/pe-firm/${encodedKey}" class="pe-logo-marquee-item" title="${escapeHtml(firm.name || firmKey)}"><img src="${primaryLogo}" alt="${escapeHtml(firm.name || firmKey)}" onerror="this.src='${fallbackFavicon}'; this.onerror=null;"></a>`;
        });
        container.innerHTML = html + html;
    } catch (e) {
        container.innerHTML = '';
    }
}

async function loadPEFirms() {
    try {
        const response = await fetch('/api/pe-firms');
        const data = await response.json();
        
        if (data.success) {
            const container = document.getElementById('peFirmsGrid');
            container.innerHTML = '';
            
            // Show first 8 firms
            Object.keys(data.firms).slice(0, 8).forEach(firmKey => {
                const firm = data.firms[firmKey];
                const card = document.createElement('a');
                card.href = `/pe-firm/${firmKey}`;
                card.className = 'pe-firm-card-compact';
                const websiteDomain = (firm.website || '').replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
                const overrideDomain = firmDomainOverrides[firm.name] || websiteDomain;
                const apiLogo = firm.logo_url || '';
                const useApiLogo = apiLogo && !apiLogo.includes('ui-avatars.com');
                const clearbitLogo = overrideDomain ? `https://logo.clearbit.com/${overrideDomain}` : '';
                const fallbackFavicon = overrideDomain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(overrideDomain)}&sz=128` : '';
                const primaryLogo = useApiLogo ? apiLogo : clearbitLogo;
                card.innerHTML = `
                    <div class="firm-logo-container">
                        <img src="${primaryLogo}" 
                             alt="${escapeHtml(firm.name)}" 
                             onerror="this.onerror=null; this.src='${fallbackFavicon}'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='flex';}">
                        <div class="firm-logo-fallback" style="display: none; width: 60px; height: 60px; background: #4c1d95; color: white; border-radius: 12px; align-items: center; justify-content: center; font-size: 24px; font-weight: bold;">
                            🏢
                        </div>
                    </div>
                    <div class="firm-info-compact">
                        <div class="firm-name-compact">${escapeHtml(firm.name)}</div>
                        <div class="firm-stats-compact">
                            <span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(firm.headquarters.split(',')[0])}</span>
                            <span><i class="fas fa-dollar-sign"></i> ${escapeHtml(firm.aum)}</span>
                        </div>
                    </div>
                    <i class="fas fa-arrow-right firm-arrow"></i>
                `;
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error loading PE firms:', error);
    }
}

// Firm mapping for news articles (PE firms + VCs)
const firmMapping = {
    // Nordic PE Firms
    'nordic capital': 'Nordic Capital',
    'eqt': 'EQT',
    'triton': 'Triton Partners',
    'altor': 'Altor',
    'summa': 'Summa Equity',
    'litorina': 'Litorina',
    'ratos': 'Ratos',
    'adelis': 'Adelis Equity',
    'verdan': 'Verdane',
    'ik partners': 'IK Partners',
    'bure': 'Bure Equity',
    'accent': 'Accent Equity',
    
    // VCs and AI Investors
    'sequoia': 'Sequoia Capital',
    'benchmark': 'Benchmark',
    'general catalyst': 'General Catalyst',
    'iconiq': 'Iconiq Capital',
    'northzone': 'Northzone',
    'kinnevik': 'Kinnevik',
    'balderton': 'Balderton Capital',
    'index ventures': 'Index Ventures',
    'accel': 'Accel',
    'andreessen horowitz': 'Andreessen Horowitz',
    'kleiner perkins': 'Kleiner Perkins',
    'bessemer': 'Bessemer Venture Partners',
    'insight partners': 'Insight Partners',
    'tiger global': 'Tiger Global',
    'softbank': 'SoftBank',
    
    // Well-known AI Startups (for logo display)
    'lovable': 'Lovable',
    'legora': 'Legora',
    'tandem health': 'Tandem Health',
    'listen labs': 'Listen Labs',
    'filed': 'Filed',
    'sana ai': 'Sana AI'
};

// Firm logo URLs with multiple fallbacks
const firmLogos = {
    'Nordic Capital': {
        primary: 'https://logo.clearbit.com/nordiccapital.com',
        fallback: 'https://ui-avatars.com/api/?name=Nordic+Capital&background=4c1d95&color=ffffff&size=64',
        icon: '🏢'
    },
    'EQT': {
        primary: 'https://logo.clearbit.com/eqtgroup.com',
        fallback: 'https://ui-avatars.com/api/?name=EQT&background=7c3aed&color=ffffff&size=64',
        icon: '🏢'
    },
    'Triton Partners': {
        primary: 'https://logo.clearbit.com/triton-partners.com',
        fallback: 'https://ui-avatars.com/api/?name=Triton&background=059669&color=ffffff&size=64',
        icon: '🏢'
    },
    'Altor': {
        primary: 'https://logo.clearbit.com/altor.com',
        fallback: 'https://ui-avatars.com/api/?name=Altor&background=dc2626&color=ffffff&size=64',
        icon: '🏢'
    },
    'Summa Equity': {
        primary: 'https://logo.clearbit.com/summaequity.com',
        fallback: 'https://ui-avatars.com/api/?name=Summa&background=0891b2&color=ffffff&size=64',
        icon: '🏢'
    },
    'Litorina': {
        primary: 'https://logo.clearbit.com/litorina.com',
        fallback: 'https://ui-avatars.com/api/?name=Litorina&background=7c2d12&color=ffffff&size=64',
        icon: '🏢'
    },
    'Ratos AB': {
        primary: 'https://logo.clearbit.com/ratos.se',
        fallback: 'https://ui-avatars.com/api/?name=Ratos+AB&background=1f2937&color=ffffff&size=64',
        icon: '🏢'
    },
    'Adelis Equity Partners': {
        primary: 'https://logo.clearbit.com/adelisequity.com',
        fallback: 'https://ui-avatars.com/api/?name=Adelis+Equity+Partners&background=be185d&color=ffffff&size=64',
        icon: '🏢'
    },
    'Axcel': {
        primary: 'https://logo.clearbit.com/axcel.dk',
        fallback: 'https://ui-avatars.com/api/?name=Axcel&background=dc2626&color=ffffff&size=64',
        icon: '🏢'
    },
    'CapMan': {
        primary: 'https://logo.clearbit.com/capman.com',
        fallback: 'https://ui-avatars.com/api/?name=CapMan&background=059669&color=ffffff&size=64',
        icon: '🏢'
    },
    'FSN Capital': {
        primary: 'https://logo.clearbit.com/fsncapital.com',
        fallback: 'https://ui-avatars.com/api/?name=FSN+Capital&background=0891b2&color=ffffff&size=64',
        icon: '🏢'
    },
    'Valedo Partners': {
        primary: 'https://logo.clearbit.com/valedopartners.com',
        fallback: 'https://ui-avatars.com/api/?name=Valedo+Partners&background=7c2d12&color=ffffff&size=64',
        icon: '🏢'
    },
    'Segulah': {
        primary: 'https://www.google.com/s2/favicons?domain=amplio.se&sz=128',
        fallback: 'https://ui-avatars.com/api/?name=Segulah&background=1f2937&color=ffffff&size=64',
        icon: '🏢'
    },
    'Amplio': {
        primary: 'https://www.google.com/s2/favicons?domain=amplio.se&sz=128',
        fallback: 'https://ui-avatars.com/api/?name=Amplio&background=7c3aed&color=ffffff&size=64',
        icon: '🏢'
    },
    'Nalka': {
        primary: 'https://www.google.com/s2/favicons?domain=nalka.com&sz=128',
        fallback: 'https://ui-avatars.com/api/?name=Nalka&background=059669&color=ffffff&size=64',
        icon: '🏢'
    },
    'Impilo': {
        primary: 'https://www.google.com/s2/favicons?domain=impilo.se&sz=128',
        fallback: 'https://ui-avatars.com/api/?name=Impilo&background=0d9488&color=ffffff&size=64',
        icon: '🏢'
    },
    'Axcel': {
        primary: 'https://www.google.com/s2/favicons?domain=axcel.com&sz=128',
        fallback: 'https://ui-avatars.com/api/?name=Axcel&background=dc2626&color=ffffff&size=64',
        icon: '🏢'
    },
    'MVI': {
        primary: 'https://www.google.com/s2/favicons?domain=mvi.se&sz=128',
        fallback: 'https://ui-avatars.com/api/?name=MVI&background=0891b2&color=ffffff&size=64',
        icon: '🏢'
    },
    'Equip': {
        primary: 'https://www.google.com/s2/favicons?domain=equip.no&sz=128',
        fallback: 'https://ui-avatars.com/api/?name=Equip&background=7c3aed&color=ffffff&size=64',
        icon: '🏢'
    },
    'Trill Impact': {
        primary: 'https://www.google.com/s2/favicons?domain=trillimpact.com&sz=128',
        fallback: 'https://ui-avatars.com/api/?name=Trill+Impact&background=059669&color=ffffff&size=64',
        icon: '🏢'
    },
    'Nordstjernan': {
        primary: 'https://www.google.com/s2/favicons?domain=nordstjernan.se&sz=128',
        fallback: 'https://ui-avatars.com/api/?name=Nordstjernan&background=1e40af&color=ffffff&size=64',
        icon: '🏢'
    },
    'Procuritas': {
        primary: 'https://logo.clearbit.com/procuritas.com',
        fallback: 'https://ui-avatars.com/api/?name=Procuritas&background=be185d&color=ffffff&size=64',
        icon: '🏢'
    },
    'Celero': {
        primary: 'https://logo.clearbit.com/celero.com',
        fallback: 'https://ui-avatars.com/api/?name=Celero&background=0891b2&color=ffffff&size=64',
        icon: '🏢'
    },
    'Polaris': {
        primary: 'https://logo.clearbit.com/polaris.com',
        fallback: 'https://ui-avatars.com/api/?name=Polaris&background=7c2d12&color=ffffff&size=64',
        icon: '🏢'
    },
    'Verdane': {
        primary: 'https://logo.clearbit.com/verdanecapital.com',
        fallback: 'https://ui-avatars.com/api/?name=Verdane&background=059669&color=ffffff&size=64',
        icon: '🏢'
    },
    'IK Partners': {
        primary: 'https://logo.clearbit.com/ikpartners.com',
        fallback: 'https://ui-avatars.com/api/?name=IK+Partners&background=7c3aed&color=ffffff&size=64',
        icon: '🏢'
    },
    'Bure Equity': {
        primary: 'https://logo.clearbit.com/bure.se',
        fallback: 'https://ui-avatars.com/api/?name=Bure&background=1f2937&color=ffffff&size=64',
        icon: '🏢'
    },
    'Accent Equity': {
        primary: 'https://logo.clearbit.com/accentequity.com',
        fallback: 'https://ui-avatars.com/api/?name=Accent&background=dc2626&color=ffffff&size=64',
        icon: '🏢'
    },
    
    // VCs and AI Investors
    'Sequoia Capital': {
        primary: 'https://logo.clearbit.com/sequoiacap.com',
        fallback: 'https://ui-avatars.com/api/?name=Sequoia&background=1f2937&color=ffffff&size=64',
        icon: '🚀'
    },
    'Benchmark': {
        primary: 'https://logo.clearbit.com/benchmark.com',
        fallback: 'https://ui-avatars.com/api/?name=Benchmark&background=7c3aed&color=ffffff&size=64',
        icon: '🚀'
    },
    'General Catalyst': {
        primary: 'https://logo.clearbit.com/generalcatalyst.com',
        fallback: 'https://ui-avatars.com/api/?name=General+Catalyst&background=059669&color=ffffff&size=64',
        icon: '🚀'
    },
    'Iconiq Capital': {
        primary: 'https://logo.clearbit.com/iconiqcapital.com',
        fallback: 'https://ui-avatars.com/api/?name=Iconiq&background=be185d&color=ffffff&size=64',
        icon: '🚀'
    },
    'Northzone': {
        primary: 'https://logo.clearbit.com/northzone.com',
        fallback: 'https://ui-avatars.com/api/?name=Northzone&background=0891b2&color=ffffff&size=64',
        icon: '🚀'
    },
    'Kinnevik': {
        primary: 'https://logo.clearbit.com/kinnevik.com',
        fallback: 'https://ui-avatars.com/api/?name=Kinnevik&background=1f2937&color=ffffff&size=64',
        icon: '🚀'
    },
    'Balderton Capital': {
        primary: 'https://logo.clearbit.com/balderton.com',
        fallback: 'https://ui-avatars.com/api/?name=Balderton&background=7c3aed&color=ffffff&size=64',
        icon: '🚀'
    },
    'Index Ventures': {
        primary: 'https://logo.clearbit.com/indexventures.com',
        fallback: 'https://ui-avatars.com/api/?name=Index+Ventures&background=dc2626&color=ffffff&size=64',
        icon: '🚀'
    },
    'Accel': {
        primary: 'https://logo.clearbit.com/accel.com',
        fallback: 'https://ui-avatars.com/api/?name=Accel&background=059669&color=ffffff&size=64',
        icon: '🚀'
    },
    'Andreessen Horowitz': {
        primary: 'https://logo.clearbit.com/a16z.com',
        fallback: 'https://ui-avatars.com/api/?name=a16z&background=1f2937&color=ffffff&size=64',
        icon: '🚀'
    },
    'Kleiner Perkins': {
        primary: 'https://logo.clearbit.com/kleinerperkins.com',
        fallback: 'https://ui-avatars.com/api/?name=Kleiner+Perkins&background=7c3aed&color=ffffff&size=64',
        icon: '🚀'
    },
    'Bessemer Venture Partners': {
        primary: 'https://logo.clearbit.com/bvp.com',
        fallback: 'https://ui-avatars.com/api/?name=Bessemer&background=0891b2&color=ffffff&size=64',
        icon: '🚀'
    },
    'Insight Partners': {
        primary: 'https://logo.clearbit.com/insightpartners.com',
        fallback: 'https://ui-avatars.com/api/?name=Insight+Partners&background=be185d&color=ffffff&size=64',
        icon: '🚀'
    },
    'Tiger Global': {
        primary: 'https://logo.clearbit.com/tigerglobal.com',
        fallback: 'https://ui-avatars.com/api/?name=Tiger+Global&background=dc2626&color=ffffff&size=64',
        icon: '🚀'
    },
    'SoftBank': {
        primary: 'https://logo.clearbit.com/softbank.com',
        fallback: 'https://ui-avatars.com/api/?name=SoftBank&background=1f2937&color=ffffff&size=64',
        icon: '🚀'
    },
    
    // AI Startups
    'Lovable': {
        primary: 'https://logo.clearbit.com/lovable.dev',
        fallback: 'https://ui-avatars.com/api/?name=Lovable&background=7c3aed&color=ffffff&size=64',
        icon: '🤖'
    },
    'Legora': {
        primary: 'https://logo.clearbit.com/legora.com',
        fallback: 'https://ui-avatars.com/api/?name=Legora&background=059669&color=ffffff&size=64',
        icon: '🤖'
    },
    'Tandem Health': {
        primary: 'https://logo.clearbit.com/tandemhealth.com',
        fallback: 'https://ui-avatars.com/api/?name=Tandem+Health&background=dc2626&color=ffffff&size=64',
        icon: '🤖'
    },
    'Listen Labs': {
        primary: 'https://logo.clearbit.com/listenlabs.com',
        fallback: 'https://ui-avatars.com/api/?name=Listen+Labs&background=0891b2&color=ffffff&size=64',
        icon: '🤖'
    },
    'Filed': {
        primary: 'https://logo.clearbit.com/filed.com',
        fallback: 'https://ui-avatars.com/api/?name=Filed&background=be185d&color=ffffff&size=64',
        icon: '🤖'
    },
    'Sana AI': {
        primary: 'https://logo.clearbit.com/sana.ai',
        fallback: 'https://ui-avatars.com/api/?name=Sana+AI&background=1f2937&color=ffffff&size=64',
        icon: '🤖'
    }
};

function getFirmFromTitle(title) {
    if (!title) return null;
    
    const titleLower = title.toLowerCase();
    
    // Check for exact matches first (more specific)
    for (let key in firmMapping) {
        if (titleLower.includes(key)) {
            return firmMapping[key];
        }
    }
    
    // Check for partial matches and variations
    const variations = {
        'eqt ventures': 'EQT',
        'eqt partners': 'EQT',
        'nordic capital fund': 'Nordic Capital',
        'triton partners': 'Triton Partners',
        'altor fund': 'Altor',
        'summa equity fund': 'Summa Equity',
        'litorina fund': 'Litorina',
        'ratos group': 'Ratos',
        'adelis equity partners': 'Adelis Equity',
        'verdan capital': 'Verdane',
        'ik partners fund': 'IK Partners',
        'bure equity': 'Bure Equity',
        'accent equity fund': 'Accent Equity',
        'sequoia capital': 'Sequoia Capital',
        'benchmark capital': 'Benchmark',
        'general catalyst partners': 'General Catalyst',
        'iconiq capital': 'Iconiq Capital',
        'northzone ventures': 'Northzone',
        'kinnevik ab': 'Kinnevik',
        'balderton capital': 'Balderton Capital',
        'index ventures': 'Index Ventures',
        'accel partners': 'Accel',
        'andreessen horowitz': 'Andreessen Horowitz',
        'kleiner perkins': 'Kleiner Perkins',
        'bessemer venture partners': 'Bessemer Venture Partners',
        'insight partners': 'Insight Partners',
        'tiger global management': 'Tiger Global',
        'softbank group': 'SoftBank'
    };
    
    for (let key in variations) {
        if (titleLower.includes(key)) {
            return variations[key];
        }
    }
    
    return null;
}

function getFirmLogo(firmName) {
    if (!firmName || !firmLogos[firmName]) return null;
    return firmLogos[firmName];
}

function createRobustLogoHTML(firmName, size = '24px') {
    if (!firmName) return '';
    const initials = getInitials(firmName);
    
    // Try exact match first
    if (firmLogos[firmName]) {
        const logoData = firmLogos[firmName];
        const escapedName = escapeHtml(firmName);
        const domain = domainFromUrl(logoData.primary);
        const favicon = domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${Math.max(64, parseInt(size) * 2)}` : logoData.fallback;
        
        return `
            <div class="news-firm-logo" style="position: relative; display: inline-block; margin-right: 8px;">
                <img src="${logoData.primary}" 
                     alt="${escapedName}" 
                     style="width: ${size}; height: ${size}; border-radius: 6px; object-fit: contain;"
                     onerror="this.onerror=null; this.src='${favicon}'; this.onerror=function(){this.onerror=null; this.src='${logoData.fallback}'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='flex';};}">
                <div class="logo-fallback" style="display: none; width: ${size}; height: ${size}; background: #4c1d95; color: white; border-radius: 6px; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">
                    ${initials}
                </div>
            </div>
        `;
    }
    
    // Try partial matches for related companies
    const relatedFirms = {
        'Opti': 'FSN Capital',
        'Opti Group': 'FSN Capital',
        'Optigroup': 'FSN Capital',
        'HENT': 'Ratos AB',
        'LEDiL': 'Ratos AB',
        'Semcon': 'Ratos AB',
        'Aibel': 'Ratos AB',
        'HL Display': 'Ratos AB',
        'Adapteo': 'Ratos AB',
        'Delete': 'Ratos AB',
        'Plantasjen': 'Ratos AB',
        'Expin': 'Ratos AB',
        'NOBA': 'Nordic Capital',
        'Minerva': 'Nordic Capital',
        'Sensio': 'Nordic Capital',
        'Max Matthiessen': 'Nordic Capital',
        'R-GOL': 'Nordic Capital',
        'Unisport': 'Nordic Capital',
        'BRP Systems': 'Nordic Capital',
        'One Inc': 'Nordic Capital',
        'ActiveViam': 'Nordic Capital',
        'Sesol': 'Nordic Capital',
        'Circura': 'Adelis Equity Partners',
        'Nordic BioSite': 'Adelis Equity Partners',
        'SSI Diagnostica': 'Adelis Equity Partners',
        'Kanari': 'Adelis Equity Partners',
        'Nordomatic': 'Trill Impact',
        'Axentia': 'Adelis Equity Partners',
        'Infobric': 'Summa Equity',
        'Lakers': 'Summa Equity',
        'Pumppulohja': 'Summa Equity',
        'Zengun': 'Amplio',
        'Zengun Group': 'Amplio',
        'Rebellion': 'Triton Partners',
        'Eltel': 'Triton Partners',
        'HiQ': 'Triton Partners',
        'Mecenat': 'IK Partners',
        'Nordic Tyre': 'Axcel',
        'Nordic Tyre Group': 'Axcel',
        'XPartners': 'Axcel',
        'Aidian': 'Nordstjernan',
        'JM': 'CapMan',
        'Rexel': 'CapMan',
        'Scandic': 'CapMan',
        'Nobia': 'CapMan',
        'Nordlo': 'CapMan',
        'Apax': 'CapMan',
        'team.blue': 'CapMan',
        'Loopia': 'CapMan',
        'NAXS': 'CapMan',
        'Celero': 'CapMan',
        'CapMan Real Estate': 'CapMan',
        'CapMan Infra': 'CapMan',
        'CapMan Hotels': 'CapMan',
        'CMH II': 'CapMan',
        'Panattoni': 'CapMan'
    };
    
    // Check if this is a portfolio company - try both exact match and partial match
    let relatedFirm = relatedFirms[firmName];
    
    // If no exact match, try partial matching
    if (!relatedFirm) {
        for (const [keyword, peFirm] of Object.entries(relatedFirms)) {
            if (firmName.toLowerCase().includes(keyword.toLowerCase()) || 
                keyword.toLowerCase().includes(firmName.toLowerCase())) {
                relatedFirm = peFirm;
                break;
            }
        }
    }
    
    if (relatedFirm && firmLogos[relatedFirm]) {
        const logoData = firmLogos[relatedFirm];
        const escapedName = escapeHtml(firmName);
        const escapedRelated = escapeHtml(relatedFirm);
        const domain = domainFromUrl(logoData.primary);
        const favicon = domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${Math.max(64, parseInt(size) * 2)}` : logoData.fallback;
        
        return `
            <div class="news-firm-logo" style="position: relative; display: inline-block; margin-right: 8px;" title="Related to ${escapedRelated}">
                <img src="${logoData.primary}" 
                     alt="${escapedName} (${escapedRelated})" 
                     style="width: ${size}; height: ${size}; border-radius: 6px; object-fit: contain; border: 2px solid #fbbf24;"
                     onerror="this.onerror=null; this.src='${favicon}'; this.onerror=function(){this.onerror=null; this.src='${logoData.fallback}'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='flex';};}">
                <div class="logo-fallback" style="display: none; width: ${size}; height: ${size}; background: #fbbf24; color: #1f2937; border-radius: 6px; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid #f59e0b;">
                    ${initials}
                </div>
                <div style="position: absolute; bottom: -2px; right: -2px; background: #fbbf24; color: #1f2937; border-radius: 50%; width: 12px; height: 12px; font-size: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold;">R</div>
            </div>
        `;
    }
    
    // Fallback: create a generic logo
    const encodedName = encodeURIComponent(firmName);
    const escapedName = escapeHtml(firmName);
    
    return `
        <div class="news-firm-logo" style="position: relative; display: inline-block; margin-right: 8px;">
            <img src="https://ui-avatars.com/api/?name=${encodedName}&background=6b7280&color=ffffff&size=${parseInt(size)}" 
                 alt="${escapedName}" 
                 style="width: ${size}; height: ${size}; border-radius: 6px; object-fit: contain;"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="logo-fallback" style="display: none; width: ${size}; height: ${size}; background: #6b7280; color: white; border-radius: 6px; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">
                ${initials}
            </div>
        </div>
    `;
}

function getSourceIcon(source) {
    if (!source) return '<i class="fas fa-newspaper"></i>';
    
    const sourceLower = source.toLowerCase();
    const iconMap = {
        'pe news': '<i class="fas fa-briefcase"></i>',
        'seeking alpha': '<i class="fas fa-chart-line"></i>',
        'reuters': '<i class="fas fa-globe"></i>',
        'financial times': '<i class="fas fa-newspaper"></i>',
        'bloomberg': '<i class="fas fa-building"></i>',
        'breakit': '<i class="fas fa-bolt"></i>',
        'crunchbase': '<i class="fas fa-rocket"></i>',
        'crescendo': '<i class="fas fa-chart-bar"></i>',
        'techcrunch': '<i class="fab fa-space-awesome"></i>'
    };
    
    for (let key in iconMap) {
        if (sourceLower.includes(key)) {
            return iconMap[key];
        }
    }
    
    return '<i class="fas fa-newspaper"></i>';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('📊 Dashboard ready!');

