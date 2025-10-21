/*
Fundraising Tracker - Interactive fundraising data
*/

let allFundraising = [];
let currentFilter = 'all';
let strategyChartInstance = null;
let geographyChartInstance = null;
let vintageChartInstance = null;
let nordicFundsChartInstance = null;
let europeanFundsChartInstance = null;
let cumChartInstance = null;
let europeanInvestmentsChartInstance = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('📈 Fundraising tracker initialized!');
    init();
});

function init() {
    setupFilters();
    setupTabs();
    loadFundraisingData();
    setupModalClose();
}

function setupModalClose() {
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('fundModal');
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            displayFundraising(allFundraising);
        });
    });
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Update tab styles
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show/hide content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`tab-${tabId}`).classList.add('active');
            
            // Initialize charts when tab becomes visible
            setTimeout(() => {
                initializeEuropeanCharts();
            }, 100);
        });
    });
}

async function loadFundraisingData() {
    try {
        const response = await fetch('/api/fundraising');
        const data = await response.json();
        
        if (data.success) {
            allFundraising = data.fundraising;
            displayFundraising(allFundraising);
            updateStats(data);
            createCharts(allFundraising);
        }
    } catch (error) {
        console.error('Error loading fundraising:', error);
    }
}

function displayFundraising(fundraising) {
    const container = document.getElementById('fundraisingTable');
    
    // Filter data
    let filtered = fundraising;
    if (currentFilter !== 'all') {
        filtered = fundraising.filter(f => f.status === currentFilter);
    }
    
    // Sort by progress (active first, then by progress)
    filtered.sort((a, b) => {
        if (a.status === 'Closed' && b.status !== 'Closed') return 1;
        if (a.status !== 'Closed' && b.status === 'Closed') return -1;
        return b.progress - a.progress;
    });
    
    // Build table
    let html = `
        <table class="fundraising-table">
            <thead>
                <tr>
                    <th>Firm</th>
                    <th>Fund Name</th>
                    <th>Target Size</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Expected Close</th>
                    <th>Strategy</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    filtered.forEach(fund => {
        const statusClass = fund.status === 'Closed' ? 'status-closed' : 
                           fund.status === 'Marketing' ? 'status-marketing' : 'status-active';
        
        html += `
            <tr onclick='showFundDetails(${JSON.stringify(fund).replace(/'/g, "&#39;")})' style="cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background=''">
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        ${fund.firm_logo_url ? `<img src="${fund.firm_logo_url}" alt="${fund.firm}" style="width: 32px; height: 32px; object-fit: contain;" onerror="this.style.display='none'">` : ''}
                        <strong>${escapeHtml(fund.firm)}</strong>
                    </div>
                </td>
                <td>${escapeHtml(fund.fund_name)}</td>
                <td class="amount">${escapeHtml(fund.target_size)}</td>
                <td><span class="status-badge ${statusClass}">${escapeHtml(fund.status)}</span></td>
                <td>
                    <div class="progress-container">
                        <div class="progress-bar-table">
                            <div class="progress-fill-table" style="width: ${fund.progress}%"></div>
                        </div>
                        <span class="progress-text">${fund.progress}%</span>
                    </div>
                </td>
                <td>${escapeHtml(fund.final_close)}</td>
                <td><span class="strategy-tag">${escapeHtml(fund.strategy)}</span></td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function updateStats(data) {
    // Update stats cards
    const activeFunds = data.fundraising.filter(f => f.status !== 'Closed').length;
    const recentCloses = data.fundraising.filter(f => f.status === 'Closed' && f.vintage >= 2024).length;
    
    document.getElementById('activeFunds').textContent = activeFunds;
    document.getElementById('recentCloses').textContent = recentCloses;
    document.getElementById('totalRaised').textContent = data.metadata.total_capital_raised;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show fund details in modal
function showFundDetails(fund) {
    const modal = document.getElementById('fundModal');
    const modalFundName = document.getElementById('modalFundName');
    const modalFundDetails = document.getElementById('modalFundDetails');
    
    modalFundName.textContent = `${fund.firm} - ${fund.fund_name}`;
    
    const statusClass = fund.status === 'Closed' ? 'status-closed' : 
                       fund.status === 'Marketing' ? 'status-marketing' : 'status-active';
    
    modalFundDetails.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 30px;">
            <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
                <div style="font-size: 12px; opacity: 0.9; margin-bottom: 8px;">Target Size</div>
                <div style="font-size: 28px; font-weight: 700;">${fund.target_size}</div>
            </div>
            <div style="padding: 20px; background: ${fund.status === 'Closed' ? '#10b981' : '#3b82f6'}; border-radius: 12px; color: white;">
                <div style="font-size: 12px; opacity: 0.9; margin-bottom: 8px;">Status</div>
                <div style="font-size: 28px; font-weight: 700;">${fund.status}</div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px;">
            <div style="padding: 16px; background: #f3f4f6; border-radius: 10px;">
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">Progress</div>
                <div style="font-size: 24px; font-weight: 600; color: #1f2937;">${fund.progress}%</div>
            </div>
            <div style="padding: 16px; background: #f3f4f6; border-radius: 10px;">
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">Vintage</div>
                <div style="font-size: 24px; font-weight: 600; color: #1f2937;">${fund.vintage}</div>
            </div>
            <div style="padding: 16px; background: #f3f4f6; border-radius: 10px;">
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">Geography</div>
                <div style="font-size: 16px; font-weight: 600; color: #1f2937;">${fund.geography}</div>
            </div>
        </div>
        
        <div style="margin-bottom: 24px;">
            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #1a1a2e;">Investment Strategy</h3>
            <div style="padding: 16px; background: #fef3c7; border-radius: 10px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">${fund.strategy}</p>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
                <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 10px; color: #1a1a2e;">First Close</h3>
                <p style="margin: 0; color: #6b7280;">${fund.first_close || 'Not disclosed'}</p>
            </div>
            <div>
                <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 10px; color: #1a1a2e;">Final Close</h3>
                <p style="margin: 0; color: #6b7280;">${fund.final_close}</p>
            </div>
        </div>
        
        ${fund.final_size && fund.final_size !== 'In fundraising' ? `
            <div style="margin-top: 20px; padding: 16px; background: #d1fae5; border-radius: 10px; border-left: 4px solid #10b981;">
                <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #065f46;">Final Fund Size</h3>
                <p style="margin: 0; color: #047857; font-size: 18px; font-weight: 600;">${fund.final_size}</p>
            </div>
        ` : ''}
    `;
    
    modal.style.display = 'block';
}

// Create analytics charts
function createCharts(fundraising) {
    createNordicFundsChart();
    createStrategyChart(fundraising);
    createGeographyChart(fundraising);
    createVintageChart(fundraising);
}

function createNordicFundsChart() {
    const ctx = document.getElementById('nordicFundsChart');
    if (!ctx) return;
    
    if (nordicFundsChartInstance) nordicFundsChartInstance.destroy();
    
    nordicFundsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['2020', '2021', '2022', '2023', '2024'],
            datasets: [{
                label: 'Nordic Funds Raised (€ bn)',
                data: [10, 30, 16, 13, 20],
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
                    bodyFont: { size: 11 }
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

function createStrategyChart(fundraising) {
    // Consolidate strategies into broader categories
    const strategyMapping = {
        'Buyout': ['buyout', 'buyouts', 'mid-market', 'lower mid-market', 'sme', 'large-cap'],
        'Growth & VC': ['growth', 'venture', 'vc', 'early stage', 'early-stage', 'seed'],
        'Specialized PE': ['healthcare', 'technology', 'software', 'tech', 'industrials', 'cleantech', 'digital', 'consumer', 'services'],
        'Real Estate': ['real estate', 'property', 're '],
        'Infrastructure': ['infrastructure', 'infra', 'energy'],
        'Other': ['impact', 'sustainability', 'secondaries', 'continuation', 'diversified', 'balanced']
    };
    
    const strategies = {
        'Buyout': 0,
        'Growth & VC': 0,
        'Specialized PE': 0,
        'Real Estate': 0,
        'Infrastructure': 0,
        'Other': 0
    };
    
    fundraising.forEach(fund => {
        const strategy = fund.strategy.toLowerCase();
        let categorized = false;
        
        for (const [category, keywords] of Object.entries(strategyMapping)) {
            if (keywords.some(keyword => strategy.includes(keyword))) {
                strategies[category]++;
                categorized = true;
                break;
            }
        }
        
        if (!categorized) {
            strategies['Other']++;
        }
    });
    
    // Remove categories with 0 funds
    const filteredStrategies = Object.fromEntries(
        Object.entries(strategies).filter(([_, count]) => count > 0)
    );
    
    const ctx = document.getElementById('strategyChart');
    if (!ctx) return;
    
    if (strategyChartInstance) strategyChartInstance.destroy();
    
    // Deep purple, green, and blue color palette
    const colors = {
        'Buyout': '#6366F1',
        'Growth & VC': '#10B981',
        'Specialized PE': '#3B82F6',
        'Real Estate': '#8B5CF6',
        'Infrastructure': '#059669',
        'Other': '#7C3AED'
    };
    
    strategyChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(filteredStrategies),
            datasets: [{
                data: Object.values(filteredStrategies),
                backgroundColor: Object.keys(filteredStrategies).map(k => colors[k]),
                borderWidth: 3,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 14,
                        padding: 12,
                        font: { size: 12, weight: '600' },
                        color: '#1a1a1a'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    padding: 12,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    borderColor: '#667eea',
                    borderWidth: 1,
                    cornerRadius: 6
                }
            }
        }
    });
}

function createGeographyChart(fundraising) {
    // Consolidate geographies into broader regions
    const geoMapping = {
        'Nordic': ['nordic', 'sweden', 'denmark', 'norway', 'finland', 'iceland'],
        'Europe': ['europe', 'european', 'west europe', 'benelux', 'dach', 'baltics', 'uk', 'france', 'germany'],
        'North America': ['north america', 'us', 'canada', 'united states'],
        'Global': ['global', 'worldwide', 'international']
    };
    
    const geographies = {
        'Nordic': 0,
        'Europe': 0,
        'North America': 0,
        'Global': 0
    };
    
    fundraising.forEach(fund => {
        const geo = fund.geography.toLowerCase();
        let categorized = false;
        
        for (const [region, keywords] of Object.entries(geoMapping)) {
            if (keywords.some(keyword => geo.includes(keyword))) {
                geographies[region]++;
                categorized = true;
                break;
            }
        }
        
        if (!categorized) {
            geographies['Global']++;
        }
    });
    
    // Remove regions with 0 funds
    const filteredGeographies = Object.fromEntries(
        Object.entries(geographies).filter(([_, count]) => count > 0)
    );
    
    const ctx = document.getElementById('geographyChart');
    if (!ctx) return;
    
    if (geographyChartInstance) geographyChartInstance.destroy();
    
    // Deep purple, green, and blue color palette
    const colors = {
        'Nordic': '#6366F1',
        'Europe': '#10B981',
        'North America': '#3B82F6',
        'Global': '#8B5CF6'
    };
    
    geographyChartInstance = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: Object.keys(filteredGeographies),
            datasets: [{
                data: Object.values(filteredGeographies),
                backgroundColor: Object.keys(filteredGeographies).map(k => colors[k]),
                borderWidth: 3,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 14,
                        padding: 12,
                        font: { size: 12, weight: '600' },
                        color: '#1a1a1a'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    padding: 12,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    borderColor: '#667eea',
                    borderWidth: 1,
                    cornerRadius: 6
                }
            },
            scales: {
                r: {
                    ticks: {
                        stepSize: 5,
                        color: '#666',
                        backdropColor: 'transparent'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    });
}

function createVintageChart(fundraising) {
    const vintages = {};
    fundraising.forEach(fund => {
        if (fund.vintage && fund.vintage !== 'Evergreen') {
            vintages[fund.vintage] = (vintages[fund.vintage] || 0) + 1;
        }
    });
    
    // Sort by year
    const sortedVintages = Object.keys(vintages).sort().reduce((obj, key) => {
        obj[key] = vintages[key];
        return obj;
    }, {});
    
    const ctx = document.getElementById('vintageChart');
    if (!ctx) return;
    
    if (vintageChartInstance) vintageChartInstance.destroy();
    
    vintageChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(sortedVintages),
            datasets: [{
                label: 'Funds',
                data: Object.values(sortedVintages),
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
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    padding: 12,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    borderColor: '#667eea',
                    borderWidth: 1,
                    cornerRadius: 6
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        stepSize: 2,
                        color: '#666',
                        font: { weight: '600' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#666',
                        font: { weight: '600' }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// European Analytics Charts
function initializeEuropeanCharts() {
    createEuropeanFundsChart();
    createCUMChart();
    createEuropeanInvestmentsChart();
}

function createEuropeanFundsChart() {
    const ctx = document.getElementById('europeanFundsChart');
    if (!ctx) return;
    
    if (europeanFundsChartInstance) europeanFundsChartInstance.destroy();
    
    const labels = ['H1-20', 'H2-20', 'H1-21', 'H2-21', 'H1-22', 'H2-22', 'H1-23', 'H2-23', 'H1-24'];
    
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'UK & Ireland',
                data: [55, 20, 33, 17, 50, 49, 22, 47, 21],
                backgroundColor: '#6366F1CC',
                borderColor: '#6366F1',
                borderWidth: 0
            },
            {
                label: 'Southern Europe',
                data: [3, 2, 4, 4, 3, 5, 4, 3, 4],
                backgroundColor: '#8B5CF6CC',
                borderColor: '#8B5CF6',
                borderWidth: 0
            },
            {
                label: 'Nordics',
                data: [2, 8, 22, 4, 14, 22, 3, 10, 10],
                backgroundColor: '#7C3AEDCC',
                borderColor: '#7C3AED',
                borderWidth: 0
            },
            {
                label: 'France & Benelux',
                data: [12, 17, 22, 18, 24, 13, 16, 20, 16],
                backgroundColor: '#4F46E5CC',
                borderColor: '#4F46E5',
                borderWidth: 0
            },
            {
                label: 'DACH',
                data: [3, 4, 4, 10, 7, 5, 6, 2, 8],
                backgroundColor: '#5B21B6CC',
                borderColor: '#5B21B6',
                borderWidth: 0
            },
            {
                label: 'CEE',
                data: [1, 0, 2, 1, 1, 1, 0, 0, 0],
                backgroundColor: '#818CF8CC',
                borderColor: '#818CF8',
                borderWidth: 0
            }
        ]
    };
    
    europeanFundsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 14,
                        padding: 12,
                        font: { size: 12, weight: '600' },
                        color: '#1a1a1a'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    padding: 12,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    borderColor: '#667eea',
                    borderWidth: 1,
                    cornerRadius: 6
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: '#666',
                        font: { weight: '600' }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Funds Raised (€ bn)',
                        font: { size: 12, weight: '600' },
                        color: '#666'
                    },
                    ticks: {
                        color: '#666',
                        font: { weight: '600' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

function createCUMChart() {
    const ctx = document.getElementById('cumChart');
    if (!ctx) return;
    
    if (cumChartInstance) cumChartInstance.destroy();
    
    const data = {
        labels: ['UK & Ireland', 'Nordics', 'France & Benelux', 'DACH', 'Southern Europe', 'CEE'],
        datasets: [
            {
                label: 'Capital Under Management',
                data: [595, 125, 272, 97, 54, 12],
                backgroundColor: '#6366F1CC',
                borderColor: '#6366F1',
                borderWidth: 0,
                borderRadius: 8
            },
            {
                label: 'Dry Powder',
                data: [203, 58, 89, 36, 21, 4],
                backgroundColor: '#7C3AEDCC',
                borderColor: '#7C3AED',
                borderWidth: 0,
                borderRadius: 8
            }
        ]
    };
    
    cumChartInstance = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 14,
                        padding: 12,
                        font: { size: 12, weight: '600' },
                        color: '#1a1a1a'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    padding: 12,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    borderColor: '#667eea',
                    borderWidth: 1,
                    cornerRadius: 6,
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            const percentage = context.datasetIndex === 1 ? 
                                ((value / [595, 125, 272, 97, 54, 12][context.dataIndex]) * 100).toFixed(1) + '%' : '';
                            return label + ': €' + value + 'B' + (percentage ? ' (' + percentage + ')' : '');
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#666',
                        font: { weight: '600' }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount (€ bn)',
                        font: { size: 12, weight: '600' },
                        color: '#666'
                    },
                    ticks: {
                        color: '#666',
                        font: { weight: '600' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

function createEuropeanInvestmentsChart() {
    const ctx = document.getElementById('europeanInvestmentsChart');
    if (!ctx) return;
    
    if (europeanInvestmentsChartInstance) europeanInvestmentsChartInstance.destroy();
    
    const labels = ['H1-20', 'H2-20', 'H1-21', 'H2-21', 'H1-22', 'H2-22', 'H1-23', 'H2-23', 'H1-24'];
    
    const data = {
        labels: labels,
        datasets: [
            // Stacked bars for investment value
            {
                label: 'Buyout (Value)',
                data: [31, 31, 50, 39, 49, 36, 37, 25, 23],
                backgroundColor: '#6366F1CC',
                borderColor: '#6366F1',
                borderWidth: 0,
                yAxisID: 'y'
            },
            {
                label: 'Growth (Value)',
                data: [7, 9, 19, 17, 17, 14, 10, 11, 8],
                backgroundColor: '#7C3AEDCC',
                borderColor: '#7C3AED',
                borderWidth: 0,
                yAxisID: 'y'
            },
            {
                label: 'Other (Value)',
                data: [6, 5, 11, 10, 10, 7, 6, 6, 8],
                backgroundColor: '#8B5CF6CC',
                borderColor: '#8B5CF6',
                borderWidth: 0,
                yAxisID: 'y'
            },
            // Lines for volume
            {
                label: 'Venture (Volume)',
                data: [2500, 2500, 3000, 3000, 3000, 2500, 2000, 1500, 1000],
                type: 'line',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: '#6366F1',
                borderWidth: 3,
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 6,
                yAxisID: 'y1'
            },
            {
                label: 'Growth (Volume)',
                data: [1500, 1500, 2000, 2000, 2000, 1500, 1000, 500, 500],
                type: 'line',
                backgroundColor: 'rgba(124, 58, 237, 0.2)',
                borderColor: '#7C3AED',
                borderWidth: 3,
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 6,
                yAxisID: 'y1'
            },
            {
                label: 'Buyout (Volume)',
                data: [1000, 1000, 1500, 1500, 1500, 1000, 500, 250, 250],
                type: 'line',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                borderColor: '#8B5CF6',
                borderWidth: 3,
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 6,
                yAxisID: 'y1'
            }
        ]
    };
    
    europeanInvestmentsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 14,
                        padding: 12,
                        font: { size: 12, weight: '600' },
                        color: '#1a1a1a'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    padding: 12,
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    borderColor: '#667eea',
                    borderWidth: 1,
                    cornerRadius: 6,
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            const unit = context.dataset.yAxisID === 'y' ? '€' + value + 'B' : value + ' companies';
                            return label + ': ' + unit;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: '#666',
                        font: { weight: '600' }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Investment Value (€ bn)',
                        font: { size: 12, weight: '600' },
                        color: '#666'
                    },
                    ticks: {
                        color: '#666',
                        font: { weight: '600' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Companies',
                        font: { size: 12, weight: '600' },
                        color: '#666'
                    },
                    ticks: {
                        color: '#666',
                        font: { weight: '600' }
                    },
                    grid: {
                        drawOnChartArea: false,
                    }
                }
            }
        }
    });
}

console.log('📈 Fundraising tracker ready!');
