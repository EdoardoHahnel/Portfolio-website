/*
Fundraising Tracker - Interactive fundraising data
*/

let allFundraising = [];
let currentFilter = 'all';
let currentVintageFilter = 'all';
let peFirmLogos = {};
let peFirmNameVariants = new Set();
const fallbackFirmDomainMap = {
    // Core
    'axcel': 'axcel.dk',
    'alfa framtak': 'alfaframtak.is',
    'apax partners': 'apax.com',
    'apax': 'apax.com',
    'bridgepoint': 'bridgepoint.eu',
    'credo partners': 'credopartners.no',
    'credo': 'credopartners.no',
    'cvc': 'cvc.com',
    'cvc capital partners': 'cvc.com',
    'ik partners': 'ikpartners.com',
    'ik investment partners': 'ikpartners.com',
    'nordic capital': 'nordiccapital.com',
    'polaris private equity': 'polarisequity.dk',
    'triton': 'triton-partners.com',
    'triton partners': 'triton-partners.com',
    'vitruvian partners': 'vitruvianpartners.com',
    'norvestor': 'norvestor.com',

    // User-listed missing
    'via equity': 'viaequity.com',
    'waterland private equity investments': 'waterland.pe',
    'waterland': 'waterland.pe',
    'evolver equity': 'evolverequity.se',
    'invl asset management group': 'invl.com',
    'invl': 'invl.com',
    'peq private equity': 'peqab.se',
    'seb asset management': 'sebgroup.com',
    'seb': 'sebgroup.com',
    'triple private equity': 'triple.no',
    'acathia capital': 'acathia.com',
    'devco': 'devco.fi',
    'devco partners': 'devco.fi',
    'main capital partners': 'main.nl',
    'mvi advisors': 'mvi.se',
    'vaaka partners': 'vaakapartners.fi',
    'vendis capital': 'vendiscapital.com',
    'bny mellon investment management': 'im.bnymellon.com',
    'maj invest': 'majinvest.com',
    'trill impact': 'trillimpact.com',
    'equip capital': 'equip.no',
    'impilo': 'impilo.se',
    'helix kapital': 'helixkapital.se',
    'systematic growth': 'systematicgrowth.io',
    'mentor capital': 'menthacapital.com',
    'mentha capital': 'menthacapital.com',
    'fsn capital': 'fsncapital.com',
    'adelis equity': 'adelisequity.com',
    'adelis equity partners': 'adelisequity.com'
};
let nordicFundsChartInstance = null;
let europeanFundsChartInstance = null;
let cumChartInstance = null;
let europeanInvestmentsChartInstance = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('📈 Fundraising tracker initialized!');
    console.log('Chart.js available:', typeof Chart !== 'undefined');
    init();
});

function init() {
    setupFilters();
    setupTabs();
    // Load PE firm logos in parallel; refresh table when available
    loadPeFirmLogos().finally(() => {
        // If table already rendered, enhance logos
        enhanceWithMappedFirmLogos();
        // Re-render to apply firm filtering and links
        if (allFundraising.length) displayFundraising(allFundraising);
    });
    loadFundraisingData();
    setupModalClose();
    
    // Fallback: ensure charts are created after a delay
    setTimeout(() => {
        if (typeof Chart !== 'undefined') {
            console.log('Fallback: Creating charts...');
            createNordicFundsChart();
            initializeEuropeanCharts();
        }
    }, 1000);
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

    // Vintage year filter
    const vintageSelect = document.getElementById('vintageFilter');
    if (vintageSelect) {
        vintageSelect.addEventListener('change', () => {
            currentVintageFilter = vintageSelect.value;
            displayFundraising(allFundraising);
        });
    }
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
        
        if (data.fundraising) {
            // Only include rows that came from the Excel import
            allFundraising = data.fundraising.filter(f => (f.source || '').toLowerCase() === 'excel import');
            // Filter to Nordic funds only (exclude US, Europe, Global, etc.)
            allFundraising = allFundraising.filter(f => isNordicFund(f));
            // Derive normalized fields for display and sorting
            allFundraising = allFundraising.map(f => ({
                ...f,
                _vintageYear: deriveVintageYear(f),
                _displaySize: deriveDisplaySize(f),
                _displayGeography: f.geography || f.geographic_focus || f.region || f.country || 'N/A',
                _displayStrategy: f.strategy || f.core_industries || f.industry_verticals || 'N/A'
            }));
            displayFundraising(allFundraising);
            updateStats(data);
            populateVintageFilter(allFundraising);
            createCharts(allFundraising);
        }
    } catch (error) {
        console.error('Error loading fundraising:', error);
    }
}

// Load PE firms and their canonical logos to ensure correct branding (e.g., EQT)
async function loadPeFirmLogos() {
    try {
        const resp = await fetch('/api/pe-firms');
        const data = await resp.json();
        const firms = data.firms || {};
        const map = {};
        const names = new Set();
        Object.keys(firms).forEach(key => {
            const firm = firms[key] || {};
            const logo = firm.logo_url || firm.logo || '';
            if (!logo) return;
            const variants = buildFirmNameVariants(key, firm.name);
            variants.forEach(v => { map[v] = logo; names.add(v); });
        });
        peFirmLogos = map;
        peFirmNameVariants = names;
    } catch (e) {
        // ignore
    }
}

function buildFirmNameVariants(...names) {
    const out = new Set();
    names.filter(Boolean).forEach(n => {
        const base = String(n).trim();
        if (!base) return;
        const lower = base.toLowerCase();
        out.add(lower);
        // Strip common suffixes
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

function displayFundraising(fundraising) {
    const container = document.getElementById('fundraisingTable');
    
    // Filter data
    let filtered = fundraising;
    if (currentFilter !== 'all') {
        filtered = fundraising.filter(f => f.status === currentFilter);
    }
    if (currentVintageFilter !== 'all') {
        const sel = parseInt(currentVintageFilter, 10);
        filtered = filtered.filter(f => (f._vintageYear || 0) === sel);
    }
    
    // Sort by most recent vintage first, then status (Marketing first), then name
    filtered.sort((a, b) => {
        const va = a._vintageYear || 0;
        const vb = b._vintageYear || 0;
        if (vb !== va) return vb - va; // desc by vintage
        if (a.status === 'Marketing' && b.status !== 'Marketing') return -1;
        if (a.status !== 'Marketing' && b.status === 'Marketing') return 1;
        if (a.status === 'Closed' && b.status !== 'Closed') return 1;
        if (a.status !== 'Closed' && b.status === 'Closed') return -1;
        return (a.firm || '').localeCompare(b.firm || '');
    });
    
    // Build table
    let html = `
        <table class="fundraising-table">
            <thead>
                <tr>
                    <th>Firm</th>
                    <th>Fund Name</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th>Strategy</th>
                    <th>Geography</th>
                    <th>Vintage</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    filtered.forEach(fund => {
        const statusClass = fund.status === 'Closed' ? 'status-closed' : 
                           fund.status === 'Marketing' ? 'status-marketing' : 'status-active';
        
        // Use final_size if available, otherwise target_size
        const displaySize = fund.final_size && fund.final_size !== 'N/A' ? fund.final_size : fund.target_size;
        
        const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(fund.firm || 'Fund')}&background=1e3a8a&color=fff&size=32`;
        const mapped = getMappedFirmLogo(fund.firm);
        const initialLogo = mapped || (fund.firm_logo_url && fund.firm_logo_url.trim() !== '' ? fund.firm_logo_url : fallbackLogo);
        const isKnownFirm = peFirmExists(fund.firm);
        const rowAttrs = isKnownFirm 
            ? `onclick='showFundDetails(${JSON.stringify(fund).replace(/'/g, "&#39;")})' style="cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background=''"`
            : `style="transition: background 0.2s;"`;

        html += `
            <tr ${rowAttrs}>
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${initialLogo}" data-firm="${escapeHtml(fund.firm || '')}" class="fund-logo-img" alt="${escapeHtml(fund.firm || 'Firm')}" style="width: 32px; height: 32px; object-fit: contain; border-radius: 4px; background:#fff" onerror="this.onerror=null;this.src='${fallbackLogo}';">
                        ${isKnownFirm ? `<a href="/pe-firm/${encodeURIComponent(fund.firm)}" style="text-decoration:none; color:inherit; cursor:pointer;" onclick="event.stopPropagation();"><strong>${escapeHtml(fund.firm)}</strong></a>` : `<strong>${escapeHtml(fund.firm)}</strong>`}
                    </div>
                </td>
                <td>${escapeHtml(fund.fund_name || 'N/A')}</td>
                <td class="amount">${escapeHtml((fund._displaySize || displaySize || 'N/A'))}</td>
                <td><span class="status-badge ${statusClass}">${escapeHtml(fund.status || 'N/A')}</span></td>
                <td><span class="strategy-tag">${escapeHtml(fund._displayStrategy)}</span></td>
                <td>${escapeHtml(fund._displayGeography)}</td>
                <td>${escapeHtml((fund._vintageYear || fund.vintage || fund.vintage_year || 'N/A').toString())}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
    // After rendering, try to replace any remaining with mapped firm logos
    enhanceWithMappedFirmLogos();
}

function updateStats(data) {
    // Update stats cards
    const fundraising = data.fundraising || [];
    const activeFunds = fundraising.filter(f => f.status !== 'Closed').length;
    const recentCloses = fundraising.filter(f => f.status === 'Closed' && f.vintage >= 2024).length;
    
    document.getElementById('activeFunds').textContent = activeFunds;
    document.getElementById('recentCloses').textContent = recentCloses;
    document.getElementById('totalRaised').textContent = data.metadata ? data.metadata.total_capital_raised : 'N/A';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function deriveVintageYear(fund) {
    // Prefer explicit numeric vintage
    const candidates = [fund.vintage, fund.vintage_year, fund.vintageYear];
    for (const c of candidates) {
        const n = parseInt(c, 10);
        if (!isNaN(n) && n > 1900 && n < 3000) return n;
    }
    // Try to parse from final_close_date / first_close / final_close like '2024-Q2' or ISO dates
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

function deriveDisplaySize(fund) {
    // Normalize size from different possible fields
    return fund.final_size || fund.fund_size || fund.target_size || fund.final_close_size || 'N/A';
}

function populateVintageFilter(funds) {
    const select = document.getElementById('vintageFilter');
    if (!select) return;
    const years = [...new Set(funds.map(f => f._vintageYear).filter(Boolean))].sort((a,b) => b-a);
    // Clear existing except first option
    while (select.options.length > 1) select.remove(1);
    years.forEach(y => {
        const opt = document.createElement('option');
        opt.value = String(y);
        opt.text = String(y);
        select.add(opt);
    });
}

function getMappedFirmLogo(name) {
    if (!name) return undefined;
    const key = String(name).toLowerCase().trim();
    if (peFirmLogos[key]) return peFirmLogos[key];
    // Try stripped variants
    const variants = buildFirmNameVariants(name);
    for (const v of variants) {
        if (peFirmLogos[v]) return peFirmLogos[v];
    }
    // Try curated domain fallbacks
    if (fallbackFirmDomainMap[key]) return `https://logo.clearbit.com/${fallbackFirmDomainMap[key]}`;
    for (const v of variants) {
        if (fallbackFirmDomainMap[v]) return `https://logo.clearbit.com/${fallbackFirmDomainMap[v]}`;
    }
    return undefined;
}

function enhanceWithMappedFirmLogos() {
    const imgs = document.querySelectorAll('.fund-logo-img');
    imgs.forEach(img => {
        const firm = img.getAttribute('data-firm');
        const mapped = getMappedFirmLogo(firm);
        if (mapped) {
            img.src = mapped;
        }
    });
}

function peFirmExists(name) {
    if (!name) return false;
    const variants = buildFirmNameVariants(name);
    for (const v of variants) {
        if (peFirmNameVariants.has(v)) return true;
    }
    return false;
}

function isNordicFund(fund) {
    const geography = (fund.geography || fund.geographic_focus || fund.region || fund.country || '').toLowerCase();
    const firm = (fund.firm || '').toLowerCase();
    
    // Check if geography indicates Nordic region
    const nordicGeos = ['nordic', 'denmark', 'sweden', 'norway', 'finland', 'iceland', 'baltic', 'nordic region', 'nordic countries'];
    const isNordicGeo = nordicGeos.some(geo => geography.includes(geo));
    
    // Check if firm name suggests Nordic origin
    const nordicFirms = ['nordic', 'adelis', 'altor', 'axcel', 'eqt', 'fsn', 'herkules', 'ik', 'norvestor', 'polaris', 'procuritas', 'summa', 'triton', 'verdane', 'waterland', 'via equity', 'alfa framtak', 'credo', 'evolver', 'invl', 'peq', 'seb', 'triple', 'acathia', 'devco', 'main capital', 'mvi', 'vaaka', 'vendis', 'maj invest', 'trill impact', 'equip', 'impilo', 'helix', 'systematic', 'mentha', 'bny mellon'];
    const isNordicFirm = nordicFirms.some(nf => firm.includes(nf));
    
    return isNordicGeo || isNordicFirm;
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
            <div style="padding: 20px; background: ${fund.status === 'Closed' ? '#059669' : '#1e40af'}; border-radius: 12px; color: white;">
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
            <div style="margin-top: 20px; padding: 16px; background: #d1fae5; border-radius: 10px; border-left: 4px solid #059669;">
                <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #065f46;">Final Fund Size</h3>
                <p style="margin: 0; color: #047857; font-size: 18px; font-weight: 600;">${fund.final_size}</p>
            </div>
        ` : ''}
    `;
    
    modal.style.display = 'block';
}

// Create analytics charts
function createCharts(fundraising) {
    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
        createNordicFundsChart();
        // Initialize European charts immediately
        initializeEuropeanCharts();
    }, 100);
}

function createNordicFundsChart() {
    const ctx = document.getElementById('nordicFundsChart');
    if (!ctx) {
        console.error('Nordic funds chart canvas not found');
        return;
    }
    
    console.log('Creating Nordic funds chart...');
    if (nordicFundsChartInstance) nordicFundsChartInstance.destroy();
    
    // Nordic data from European funds chart
    const labels = ['H1-20', 'H2-20', 'H1-21', 'H2-21', 'H1-22', 'H2-22', 'H1-23', 'H2-23', 'H1-24'];
    const nordicData = [2, 8, 22, 4, 14, 22, 3, 10, 10];
    
    nordicFundsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nordic Funds Raised (€ bn)',
                data: nordicData,
                backgroundColor: function(context) {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
                    gradient.addColorStop(0, '#1e40af');
                    gradient.addColorStop(0.5, '#3b82f6');
                    gradient.addColorStop(1, '#60a5fa');
                    return gradient;
                },
                borderRadius: 12,
                borderWidth: 0,
                hoverBackgroundColor: function(context) {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
                    gradient.addColorStop(0, '#3b82f6');
                    gradient.addColorStop(1, '#1e40af');
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
                    title: {
                        display: true,
                        text: 'Funds Raised (€ bn)',
                        font: { size: 8, weight: '600' },
                        color: '#666'
                    },
                    ticks: { 
                        color: '#666',
                        font: { size: 10, weight: '600' }
                    },
                    grid: { color: '#f3f4f6' }
                },
                x: {
                    ticks: { 
                        color: '#666',
                        font: { size: 10, weight: '600' } 
                    },
                    grid: { display: false }
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
    if (!ctx) {
        console.error('European funds chart canvas not found');
        return;
    }
    
    console.log('Creating European funds chart...');
    if (europeanFundsChartInstance) europeanFundsChartInstance.destroy();
    
    const labels = ['H1-20', 'H2-20', 'H1-21', 'H2-21', 'H1-22', 'H2-22', 'H1-23', 'H2-23', 'H1-24'];
    
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'UK & Ireland',
                data: [55, 20, 33, 17, 50, 49, 22, 47, 21],
                backgroundColor: '#4c1d95CC',
                borderColor: '#4c1d95',
                borderWidth: 0
            },
            {
                label: 'Southern Europe',
                data: [3, 2, 4, 4, 3, 5, 4, 3, 4],
                backgroundColor: '#059669CC',
                borderColor: '#059669',
                borderWidth: 0
            },
            {
                label: 'Nordics',
                data: [2, 8, 22, 4, 14, 22, 3, 10, 10],
                backgroundColor: '#1e40afCC',
                borderColor: '#1e40af',
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
                        boxWidth: 6,
                        padding: 3,
                        font: { size: 6, weight: '600' },
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
                        font: { size: 8, weight: '600' },
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
                backgroundColor: '#4c1d95CC',
                borderColor: '#4c1d95',
                borderWidth: 0,
                borderRadius: 8
            },
            {
                label: 'Dry Powder',
                data: [203, 58, 89, 36, 21, 4],
                backgroundColor: '#1e40afCC',
                borderColor: '#1e40af',
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
                        boxWidth: 6,
                        padding: 3,
                        font: { size: 6, weight: '600' },
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
                backgroundColor: '#4c1d95CC',
                borderColor: '#4c1d95',
                borderWidth: 0,
                yAxisID: 'y'
            },
            {
                label: 'Growth (Value)',
                data: [7, 9, 19, 17, 17, 14, 10, 11, 8],
                backgroundColor: '#1e40afCC',
                borderColor: '#1e40af',
                borderWidth: 0,
                yAxisID: 'y'
            },
            {
                label: 'Other (Value)',
                data: [6, 5, 11, 10, 10, 7, 6, 6, 8],
                backgroundColor: '#059669CC',
                borderColor: '#059669',
                borderWidth: 0,
                yAxisID: 'y'
            },
            // Lines for volume
            {
                label: 'Venture (Volume)',
                data: [2500, 2500, 3000, 3000, 3000, 2500, 2000, 1500, 1000],
                type: 'line',
                backgroundColor: 'rgba(76, 29, 149, 0.2)',
                borderColor: '#4c1d95',
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
                backgroundColor: 'rgba(30, 64, 175, 0.2)',
                borderColor: '#1e40af',
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
                backgroundColor: 'rgba(5, 150, 105, 0.2)',
                borderColor: '#059669',
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
                        boxWidth: 6,
                        padding: 3,
                        font: { size: 6, weight: '600' },
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
                        font: { size: 8, weight: '600' },
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
                        font: { size: 8, weight: '600' },
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
