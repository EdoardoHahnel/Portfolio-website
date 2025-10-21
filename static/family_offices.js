/*
Family Offices Finder - Nordic family office database
*/

let allFamilyOffices = [];
let currentCountryFilter = 'all';

document.addEventListener('DOMContentLoaded', function() {
    console.log('👥 Family offices finder initialized!');
    init();
});

function init() {
    const searchInput = document.getElementById('familyOfficeSearch');
    searchInput.addEventListener('input', handleSearch);
    
    // Setup country filters
    const filterBtns = document.querySelectorAll('.filter-btn[data-country]');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCountryFilter = btn.dataset.country;
            displayFamilyOffices(allFamilyOffices);
        });
    });
    
    loadFamilyOffices();
}

async function loadFamilyOffices() {
    try {
        console.log('Loading family offices...');
        const response = await fetch('/api/family-offices');
        const data = await response.json();
        
        console.log('Family offices API response:', data);
        
        if (data.success) {
            allFamilyOffices = data.family_offices;
            console.log(`Loaded ${allFamilyOffices.length} family offices`);
            displayFamilyOffices(allFamilyOffices);
        } else {
            console.error('Failed to load family offices:', data.message);
            // Show fallback message
            const container = document.getElementById('familyOfficesList');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 60px; color: #666;">
                        <i class="fas fa-users" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                        <p style="font-size: 18px;">Loading family offices...</p>
                        <p style="font-size: 14px; color: #999;">If this persists, please refresh the page</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading family offices:', error);
    }
}

function displayFamilyOffices(offices) {
    const container = document.getElementById('familyOfficesList');
    const emptyState = document.getElementById('emptyStateFO');
    container.innerHTML = '';
    
    // Apply country filter
    let filtered = offices;
    if (currentCountryFilter !== 'all') {
        filtered = offices.filter(o => o.headquarters.includes(currentCountryFilter));
    }
    
    if (filtered.length === 0) {
        container.style.display = 'none';
        emptyState.classList.remove('hidden');
        return;
    }
    
    container.style.display = 'grid';
    emptyState.classList.add('hidden');
    
    filtered.forEach((office, index) => {
        const card = document.createElement('div');
        card.className = 'family-office-card';
        card.style.animationDelay = `${index * 0.05}s`;
        
        const logoUrl = office.website ? 
            `https://logo.clearbit.com/${extractDomain(office.website)}` : '';
        
        card.innerHTML = `
            <div class="fo-card-header">
                ${office.website && logoUrl ? 
                    `<img src="${logoUrl}" alt="${escapeHtml(office.name)}" class="fo-logo" onerror="this.style.display='none'">` : 
                    '<div class="fo-icon"><i class="fas fa-landmark"></i></div>'
                }
                <h3 class="fo-name">${escapeHtml(office.name)}</h3>
                <span class="fo-type">${escapeHtml(office.type)}</span>
            </div>
            
            <div class="fo-card-body">
                <div class="fo-info-row">
                    <i class="fas fa-crown"></i>
                    <span><strong>Family:</strong> ${escapeHtml(office.founding_family)}</span>
                </div>
                
                <div class="fo-info-row">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${escapeHtml(office.headquarters)}</span>
                </div>
                
                ${office.founded ? `
                <div class="fo-info-row">
                    <i class="fas fa-calendar"></i>
                    <span>Founded: ${office.founded}</span>
                </div>
                ` : ''}
                
                ${office.aum && office.aum !== 'Undisclosed' ? `
                <div class="fo-info-row">
                    <i class="fas fa-dollar-sign"></i>
                    <span><strong>AUM:</strong> ${escapeHtml(office.aum)}</span>
                </div>
                ` : ''}
                
                <div class="fo-description">
                    ${escapeHtml(office.description)}
                </div>
                
                ${office.investment_strategy ? `
                <div class="fo-strategy">
                    <strong><i class="fas fa-bullseye"></i> Strategy:</strong>
                    <p>${escapeHtml(office.investment_strategy)}</p>
                </div>
                ` : ''}
                
                <div class="fo-focus">
                    <strong>Investment Focus:</strong>
                    <div class="tag-list">
                        ${office.investment_focus.map(focus => 
                            `<span class="tag tag-sm">${escapeHtml(focus)}</span>`
                        ).join('')}
                    </div>
                </div>
                
                ${office.notable_holdings && office.notable_holdings.length > 0 ? `
                <div class="fo-holdings">
                    <strong>Notable Holdings:</strong>
                    <div class="holdings-list">
                        ${office.notable_holdings.slice(0, 4).map(holding =>
                            `<span class="holding-item">${escapeHtml(holding)}</span>`
                        ).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${office.recent_activity && office.recent_activity.length > 0 ? `
                <div class="fo-recent-activity">
                    <strong><i class="fas fa-chart-line"></i> Recent Activity:</strong>
                    <ul class="activity-list">
                        ${office.recent_activity.map(activity =>
                            `<li>${escapeHtml(activity)}</li>`
                        ).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${office.recent_news ? `
                <div class="fo-news">
                    <div class="news-badge-inline">Latest</div>
                    <p>${escapeHtml(office.recent_news)}</p>
                </div>
                ` : ''}
            </div>
            
            ${office.website ? `
            <div class="fo-card-footer">
                <a href="${office.website}" target="_blank" class="btn btn-sm btn-secondary">
                    <i class="fas fa-external-link-alt"></i> Visit Website
                </a>
            </div>
            ` : ''}
        `;
        
        container.appendChild(card);
    });
    
    // Update count
    document.getElementById('totalFamilyOffices').textContent = offices.length;
}

let searchTimeout;
function handleSearch(event) {
    const query = event.target.value.trim().toLowerCase();
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        if (query === '') {
            displayFamilyOffices(allFamilyOffices);
            return;
        }
        
        const filtered = allFamilyOffices.filter(office =>
            office.name.toLowerCase().includes(query) ||
            office.founding_family.toLowerCase().includes(query) ||
            office.headquarters.toLowerCase().includes(query) ||
            office.investment_focus.some(f => f.toLowerCase().includes(query))
        );
        
        displayFamilyOffices(filtered);
    }, 300);
}

function extractDomain(url) {
    if (!url) return '';
    return url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('👥 Family offices finder ready!');

