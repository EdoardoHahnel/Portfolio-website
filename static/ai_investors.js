// AI Investors - Mock data and functionality
// Will load investor data from AI companies database

document.addEventListener('DOMContentLoaded', function() {
    loadAIInvestors();
});

async function loadAIInvestors() {
    try {
        const response = await fetch('/api/ai-investors');
        const data = await response.json();
        
        if (data.success) {
            displayInvestors(data.investors);
            updateStats(data.investors);
        }
    } catch (error) {
        console.error('Error loading investors:', error);
    }
}

function extractInvestors(companies, globalInvestments) {
    const investorMap = new Map();
    
    // Extract from Swedish companies
    companies.forEach(company => {
        const investors = Array.isArray(company.investors) ? company.investors : 
                         (company.investors ? company.investors.split(',').map(i => i.trim()) : []);
        
        investors.forEach(investor => {
            if (!investorMap.has(investor)) {
                investorMap.set(investor, {
                    name: investor,
                    type: getInvestorType(investor),
                    portfolioCompanies: [],
                    totalInvested: 0,
                    avgDealSize: 0
                });
            }
            investorMap.get(investor).portfolioCompanies.push(company.name);
        });
    });
    
    return Array.from(investorMap.values());
}

function getInvestorType(name) {
    if (name.includes('Sequoia') || name.includes('Benchmark') || name.includes('Accel')) return 'vc';
    if (name.includes('EQT') || name.includes('Nordic Capital')) return 'pe';
    if (name.includes('Google') || name.includes('Microsoft') || name.includes('Nvidia')) return 'corporate';
    if (name.includes('Family')) return 'family';
    return 'vc';
}

function displayInvestors(investors) {
    const container = document.getElementById('investorsContainer');
    
    // Sort by total invested
    investors.sort((a, b) => {
        const aVal = parseInvestment(a.total_invested);
        const bVal = parseInvestment(b.total_invested);
        return bVal - aVal;
    });
    
    let html = '<div class="investors-grid">';
    
    investors.forEach(investor => {
        const typeIcon = getInvestorIcon(investor.type);
        const typeColor = getInvestorColor(investor.type);
        const logoUrl = investor.logo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(investor.name) + '&background=667eea&color=fff&size=128';
        
        const investorUrl = `/ai-investors/${cleanInvestorName(investor.name)}`;
        
        html += `
            <div class="investor-card-modern" data-country="${investor.hq}" data-type="${investor.type}" onclick="window.location.href='${investorUrl}'" style="cursor: pointer; transition: all 0.3s;">
                <div class="investor-card-header" style="background: ${typeColor};">
                    <div class="investor-logo-section">
                        <img src="${logoUrl}" alt="${investor.name}" class="investor-logo" 
                             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(investor.name)}&background=667eea&color=fff&size=128'">
                    </div>
                    <div class="investor-type-badge">
                        <i class="${typeIcon}"></i>
                        <span>${investor.type.toUpperCase()}</span>
                    </div>
                    <h3 class="investor-name">${investor.name}</h3>
                    <div style="font-size: 12px; opacity: 0.85; margin-top: 4px;">${investor.hq}</div>
                </div>
                
                <div class="investor-card-body">
                    <div class="investor-stat-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px;">
                        <div class="investor-stat-box" style="text-align: center; padding: 12px; background: #f0f9ff; border-radius: 8px;">
                            <div class="stat-number" style="font-size: 24px; font-weight: 700; color: #0369a1;">${investor.ai_deals_count || investor.portfolio_companies.length}</div>
                            <div class="stat-label" style="font-size: 11px; color: #64748b; margin-top: 4px;">🤖 AI Deals</div>
                        </div>
                        <div class="investor-stat-box" style="text-align: center; padding: 12px; background: #f0fdf4; border-radius: 8px;">
                            <div class="stat-number" style="font-size: 24px; font-weight: 700; color: #047857;">${investor.portfolio_companies.length}</div>
                            <div class="stat-label" style="font-size: 11px; color: #64748b; margin-top: 4px;">Companies</div>
                        </div>
                        <div class="investor-stat-box" style="text-align: center; padding: 12px; background: #fef3c7; border-radius: 8px;">
                            <div class="stat-number" style="font-size: 18px; font-weight: 700; color: #92400e;">${investor.total_invested}</div>
                            <div class="stat-label" style="font-size: 11px; color: #64748b; margin-top: 4px;">Invested</div>
                        </div>
                    </div>
                    
                    ${investor.portfolio_companies_nordic && investor.portfolio_companies_nordic.length > 0 ? `
                    <div class="portfolio-companies-section" style="background: #ecfdf5; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <div class="section-title" style="color: #059669; font-weight: 600; font-size: 12px; margin-bottom: 8px;">
                            <i class="fas fa-map-marker-alt"></i> Nordic AI Portfolio (${investor.portfolio_companies_nordic.length})
                        </div>
                        <div class="portfolio-chips" style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${investor.portfolio_companies_nordic.map(c => `
                                <span class="company-chip-modern" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500;">${c}</span>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="portfolio-companies-section" style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <div class="section-title" style="color: #475569; font-weight: 600; font-size: 12px; margin-bottom: 8px;">Global AI Portfolio (${investor.portfolio_companies.length}):</div>
                        <div class="portfolio-chips" style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${investor.portfolio_companies.slice(0, 12).map(c => `
                                <span class="company-chip-modern" style="background: white; color: #475569; padding: 4px 10px; border-radius: 6px; font-size: 11px; border: 1px solid #e2e8f0; font-weight: 500;">${c}</span>
                            `).join('')}
                            ${investor.portfolio_companies.length > 12 ? `
                                <span class="more-companies" style="background: #64748b; color: white; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;">+${investor.portfolio_companies.length - 12}</span>
                            ` : ''}
                        </div>
                    </div>
                    
                    ${investor.notable_investments && investor.notable_investments.length > 0 ? `
                    <div class="notable-deals">
                        <div class="section-title">Key Deals:</div>
                        ${investor.notable_investments.slice(0, 2).map(inv => `
                            <div class="deal-item">
                                <span class="deal-company">${inv.company}</span>
                                <span class="deal-amount">${inv.amount}</span>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function parseInvestment(str) {
    if (!str) return 0;
    const num = parseFloat(str.replace(/[^0-9.]/g, ''));
    if (str.includes('B') || str.includes('billion')) return num * 1000;
    return num;
}

function getInvestorIcon(type) {
    if (type === 'vc') return 'fas fa-rocket';
    if (type === 'pe') return 'fas fa-building';
    if (type === 'corporate') return 'fas fa-industry';
    if (type === 'angel') return 'fas fa-user-tie';
    if (type === 'family') return 'fas fa-users';
    return 'fas fa-briefcase';
}

function getInvestorColor(type) {
    if (type === 'vc') return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    if (type === 'pe') return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    if (type === 'corporate') return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    if (type === 'angel') return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
    if (type === 'family') return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

function updateStats(investors) {
    document.getElementById('totalInvestors').textContent = investors.length;
    
    // Count unique Nordic companies
    const uniqueNordicCompanies = new Set();
    investors.forEach(inv => {
        if (inv.portfolio_companies_nordic) {
            inv.portfolio_companies_nordic.forEach(c => uniqueNordicCompanies.add(c));
        }
    });
    document.getElementById('totalCompanies').textContent = uniqueNordicCompanies.size + '+';
    
    // Calculate total invested
    let totalInvested = 0;
    investors.forEach(inv => {
        totalInvested += parseInvestment(inv.total_invested);
    });
    document.getElementById('totalInvested').textContent = totalInvested > 1000 ? `€${Math.round(totalInvested/1000)}B+` : `€${Math.round(totalInvested)}M+`;
    
    // Count total AI deals
    let totalDeals = 0;
    investors.forEach(inv => {
        totalDeals += inv.ai_deals_count || 0;
    });
    document.getElementById('avgDealSize').textContent = totalDeals + '+';
}

function cleanInvestorName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/--+/g, '-').replace(/^-|-$/g, '');
}

function getCountryFlag(country) {
    // Map country names to flag emojis
    const flags = {
        'Sweden': '🇸🇪',
        'Denmark': '🇩🇰',
        'Norway': '🇳🇴',
        'Finland': '🇫🇮',
        'Iceland': '🇮🇸'
    };
    
    // Return flag emoji only, no text
    if (!country) return '';
    
    const countryName = String(country).trim();
    return flags[countryName] || '';
}

// Add hover effect styling and filter functionality
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .investor-card-modern:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Add type filter button functionality
    const typeButtons = document.querySelectorAll('.filter-btn');
    typeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            typeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const type = this.getAttribute('data-filter');
            applyFilters();
        });
    });
    
    // Add country filter button functionality
    const countryButtons = document.querySelectorAll('.filter-btn-country');
    countryButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            countryButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            applyFilters();
        });
    });
    
    // Add search functionality
    const searchInput = document.getElementById('investorSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            applyFilters();
        });
    }
});

function applyFilters() {
    const activeTypeBtn = document.querySelector('.filter-btn.active');
    const activeCountryBtn = document.querySelector('.filter-btn-country.active');
    const searchInput = document.getElementById('investorSearch');
    
    const selectedType = activeTypeBtn ? activeTypeBtn.getAttribute('data-filter') : 'all';
    const selectedCountry = activeCountryBtn ? activeCountryBtn.getAttribute('data-country') : 'all';
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    const investorCards = document.querySelectorAll('.investor-card-modern');
    investorCards.forEach(card => {
        const cardType = card.getAttribute('data-type') || '';
        const cardCountry = card.getAttribute('data-country') || '';
        const cardName = card.querySelector('.investor-name') ? 
                         card.querySelector('.investor-name').textContent.toLowerCase() : '';
        
        const typeMatch = selectedType === 'all' || cardType === selectedType;
        const countryMatch = selectedCountry === 'all' || cardCountry === selectedCountry;
        const searchMatch = searchTerm === '' || cardName.includes(searchTerm);
        
        if (typeMatch && countryMatch && searchMatch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterByCountry(country) {
    applyFilters();
}


