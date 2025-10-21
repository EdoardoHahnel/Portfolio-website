/*
PE Firms List Page
*/

let allFirms = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏢 PE Firms page initialized!');
    init();
});

function init() {
    const searchInput = document.getElementById('firmSearch');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    loadFirms();
}

async function loadFirms() {
    try {
        const response = await fetch('/api/pe-firms');
        const data = await response.json();
        
        if (data.success) {
            allFirms = Object.keys(data.firms).map(key => ({
                key: key,
                ...data.firms[key]
            }));
            displayFirms(allFirms);
        }
    } catch (error) {
        console.error('Error loading firms:', error);
    }
}

function displayFirms(firms) {
    const container = document.getElementById('peFirmsList');
    container.innerHTML = '';
    
    firms.forEach((firm, index) => {
        const card = document.createElement('a');
        card.href = `/pe-firm/${firm.key}`;
        card.className = 'pe-firm-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="pe-firm-card-header">
                <img src="${firm.logo_url}" alt="${escapeHtml(firm.name)}" class="pe-firm-logo"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="pe-firm-icon-fallback" style="display: none;">
                    <i class="fas fa-briefcase"></i>
                </div>
            </div>
            
            <div class="pe-firm-card-body">
                <h3 class="pe-firm-card-title">${escapeHtml(firm.name)}</h3>
                
                <div class="pe-firm-stats">
                    <div class="stat-item-inline">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${escapeHtml(firm.headquarters)}</span>
                    </div>
                    <div class="stat-item-inline">
                        <i class="fas fa-calendar"></i>
                        <span>Est. ${firm.founded}</span>
                    </div>
                    <div class="stat-item-inline">
                        <i class="fas fa-dollar-sign"></i>
                        <span>${escapeHtml(firm.aum)}</span>
                    </div>
                </div>
                
                <p class="pe-firm-description">${escapeHtml(firm.description).substring(0, 150)}...</p>
            </div>
            
            <div class="pe-firm-card-footer">
                <span class="view-details">
                    View Details <i class="fas fa-arrow-right"></i>
                </span>
            </div>
        `;
        
        container.appendChild(card);
    });
}

let searchTimeout;
function handleSearch(event) {
    const query = event.target.value.trim().toLowerCase();
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        if (query === '') {
            displayFirms(allFirms);
            return;
        }
        
        const filtered = allFirms.filter(firm =>
            firm.name.toLowerCase().includes(query) ||
            firm.headquarters.toLowerCase().includes(query) ||
            firm.description.toLowerCase().includes(query)
        );
        
        displayFirms(filtered);
    }, 300);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

console.log('🏢 PE Firms page ready!');

