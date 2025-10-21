/*
Investment Companies (Investmentbolag) - Swedish NAV discount tracker
*/

let allInvBolag = [];
let currentFilter = 'all';
let currentSort = 'discount-desc';

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏛️ Investmentbolag page initialized!');
    init();
});

function init() {
    setupFilters();
    setupSearch();
    setupSort();
    loadInvestmentCompanies();
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            displayCompanies(allInvBolag);
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById('invBolagSearch');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = e.target.value.trim().toLowerCase();
            if (query === '') {
                displayCompanies(allInvBolag);
            } else {
                const filtered = allInvBolag.filter(company =>
                    company.name.toLowerCase().includes(query) ||
                    company.holdings.some(h => h.toLowerCase().includes(query)) ||
                    company.investment_focus.some(f => f.toLowerCase().includes(query))
                );
                displayCompanies(filtered);
            }
        }, 300);
    });
}

function setupSort() {
    const sortSelect = document.getElementById('sortSelect');
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        displayCompanies(allInvBolag);
    });
}

async function loadInvestmentCompanies() {
    try {
        const response = await fetch('/api/investment-companies');
        const data = await response.json();
        
        if (data.success) {
            allInvBolag = data.companies;
            displayCompanies(allInvBolag);
            updateStats(allInvBolag);
        }
    } catch (error) {
        console.error('Error loading investment companies:', error);
    }
}

function displayCompanies(companies) {
    const container = document.getElementById('invBolagContainer');
    
    // Apply filters
    let filtered = [...companies];
    
    if (currentFilter === 'investment') {
        filtered = filtered.filter(c => !c.type.toLowerCase().includes('real estate') && !c.type.toLowerCase().includes('fastighet'));
    } else if (currentFilter === 'real-estate') {
        filtered = filtered.filter(c => c.type.toLowerCase().includes('real estate') || c.type.toLowerCase().includes('fastighet'));
    } else if (currentFilter === 'discount') {
        filtered = filtered.filter(c => c.discount_numeric > 0);
    } else if (currentFilter === 'premium') {
        filtered = filtered.filter(c => c.discount_numeric < 0);
    } else if (currentFilter === 'large') {
        filtered = filtered.filter(c => {
            const mcap = c.market_cap.replace(/[^\d.]/g, '');
            return parseFloat(mcap) > 10;
        });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
        if (currentSort === 'discount-desc') {
            return b.discount_numeric - a.discount_numeric;
        } else if (currentSort === 'discount-asc') {
            return a.discount_numeric - b.discount_numeric;
        } else if (currentSort === 'name') {
            return a.name.localeCompare(b.name);
        } else if (currentSort === 'market-cap') {
            const aVal = parseFloat(a.market_cap.replace(/[^\d.]/g, ''));
            const bVal = parseFloat(b.market_cap.replace(/[^\d.]/g, ''));
            return bVal - aVal;
        }
    });
    
    container.innerHTML = '';
    
    filtered.forEach((company, index) => {
        const card = createCompanyCard(company, index);
        container.appendChild(card);
    });
}

function createCompanyCard(company, index) {
    const card = document.createElement('div');
    card.className = 'inv-bolag-card';
    card.style.animationDelay = `${index * 0.05}s`;
    card.style.cursor = 'pointer';
    card.onclick = () => {
        window.location.href = `/investmentbolag-detail?name=${encodeURIComponent(company.name)}`;
    };
    
    // Determine discount class
    const discountClass = company.discount_numeric > 0 ? 'discount' : 'premium';
    const discountLabel = company.discount_numeric > 0 ? 'RABATT' : 'PREMIE';
    
    card.innerHTML = `
        <div class="inv-card-header">
            <div class="inv-logo-section">
                ${company.logo_url ? 
                    `<img src="${company.logo_url}" alt="${escapeHtml(company.name)}" class="inv-logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : 
                    ''
                }
                <div class="inv-icon-fallback" style="${company.logo_url ? 'display:none;' : 'display:flex;'}">
                    <i class="fas fa-landmark"></i>
                </div>
            </div>
            
            <div class="inv-main-info">
                <h3 class="inv-name">${escapeHtml(company.name)}</h3>
                <div class="inv-ticker">${escapeHtml(company.ticker)}</div>
                <div class="inv-type-tag">${escapeHtml(company.type)}</div>
            </div>
            
        </div>
        
        <div class="inv-card-body">
            <div class="inv-description">
                ${escapeHtml(company.description)}
            </div>
            
            <div class="inv-holdings">
                <strong><i class="fas fa-briefcase"></i> Största Innehav:</strong>
                <div class="holdings-grid">
                    ${company.holdings.slice(0, 6).map(holding =>
                        `<span class="holding-badge">${escapeHtml(holding)}</span>`
                    ).join('')}
                    ${company.holdings.length > 6 ? 
                        `<span class="holding-badge more">+${company.holdings.length - 6} fler</span>` : 
                        ''
                    }
                </div>
            </div>
            
            <div class="inv-focus">
                <strong><i class="fas fa-bullseye"></i> Investeringsfokus:</strong>
                <div class="tag-list">
                    ${company.investment_focus.map(focus =>
                        `<span class="tag tag-sm">${escapeHtml(focus)}</span>`
                    ).join('')}
                </div>
            </div>
        </div>
        
        <div class="inv-card-footer">
            ${company.website ? `
            <a href="${company.website}" target="_blank" class="btn btn-sm btn-secondary">
                <i class="fas fa-external-link-alt"></i> Besök Hemsida
            </a>
            ` : ''}
            <a href="https://www.avanza.se/aktier/om-aktien.html/${company.ticker.replace(' ', '-')}" target="_blank" class="btn btn-sm btn-primary">
                <i class="fas fa-chart-line"></i> Se på Avanza
            </a>
        </div>
    `;
    
    return card;
}

function updateStats(companies) {
    // Calculate statistics
    const discountCompanies = companies.filter(c => c.discount_numeric > 0);
    const avgDiscount = companies.reduce((sum, c) => sum + c.discount_numeric, 0) / companies.length;
    
    document.getElementById('totalInvBolag').textContent = companies.length;
    document.getElementById('avgDiscount').textContent = avgDiscount > 0 ? 
        `+${avgDiscount.toFixed(1)}%` : 
        `${avgDiscount.toFixed(1)}%`;
    document.getElementById('discountCount').textContent = discountCompanies.length;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('🏛️ Investmentbolag page ready!');

