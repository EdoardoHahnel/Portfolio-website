// AI Map - Geographic visualization of AI companies

let map;
let markers = [];
let companies = [];

// City coordinates
const cities = {
    stockholm: { lat: 59.3293, lng: 18.0686, name: 'Stockholm' },
    copenhagen: { lat: 55.6761, lng: 12.5683, name: 'Copenhagen' },
    helsinki: { lat: 60.1699, lng: 24.9384, name: 'Helsinki' },
    oslo: { lat: 59.9139, lng: 10.7522, name: 'Oslo' }
};

document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadCompaniesData();
    setupFilters();
});

function initializeMap() {
    // Initialize Leaflet map centered on Stockholm with even closer zoom
    map = L.map('map').setView([59.3293, 18.0686], 13);
    
    // Use a nicer tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19
    }).addTo(map);
}

async function loadCompaniesData() {
    try {
        const response = await fetch('/api/ai-companies');
        const data = await response.json();
        
        if (data.success) {
            companies = data.companies;
            displayCompaniesOnMap(companies);
            displayCityBreakdown(companies);
            displayCompaniesByCity(companies);
            updateStats(companies);
        }
    } catch (error) {
        console.error('Error loading companies:', error);
    }
}

function displayCompaniesOnMap(companiesToShow) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    companiesToShow.forEach(company => {
        const city = detectCity(company.headquarters);
        if (city && cities[city]) {
            const coords = cities[city];
            // Add small random offset to avoid overlapping markers
            const lat = coords.lat + (Math.random() - 0.5) * 0.02;
            const lng = coords.lng + (Math.random() - 0.5) * 0.02;
            
            // Create custom icon with company logo - use same method as AI Companies
            const isStealthMode = company.name && company.name.toLowerCase().includes('stealth');
            const logoUrls = getCompanyLogoUrls(company);
            
            let markerHtml = '';
            if (isStealthMode) {
                markerHtml = `
                    <div class="marker-logo-container" style="display: flex; align-items: center; justify-content: center; background: #667eea;">
                        <i class="fas fa-user-secret" style="font-size: 24px; color: white;"></i>
                    </div>
                `;
            } else {
                markerHtml = `
                    <div class="marker-logo-container">
                        <img data-logo-urls='${JSON.stringify(logoUrls)}' 
                             data-current-index="0"
                             alt="${company.name}" 
                             class="marker-company-logo"
                             onerror="loadNextLogoUrl(this)">
                    </div>
                `;
            }
            
            const companyIcon = L.divIcon({
                className: 'custom-marker-logo',
                html: markerHtml,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40]
            });
            
            const marker = L.marker([lat, lng], { icon: companyIcon }).addTo(map);
            marker.bindPopup(`
                <div class="popup-company">${company.name}</div>
                <div class="popup-category">${company.category || 'AI Company'}</div>
                <div class="popup-valuation">${company.valuation || 'Early Stage'}</div>
                <div class="popup-activity" style="font-size: 12px; color: #666; margin-top: 5px;">
                    <i class="fas fa-chart-line"></i> ${company.arr || 'Stealth Mode'}
                </div>
            `);
            markers.push(marker);
        }
    });
    
    // Initialize logos after markers are created
    initializeMapLogos();
}

function detectCity(headquarters) {
    if (!headquarters) return null;
    const hq = headquarters.toLowerCase();
    if (hq.includes('stockholm')) return 'stockholm';
    if (hq.includes('copenhagen')) return 'copenhagen';
    if (hq.includes('helsinki')) return 'helsinki';
    if (hq.includes('oslo')) return 'oslo';
    return null;
}

function extractDomain(url) {
    if (!url) return '';
    try {
        const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
        return urlObj.hostname.replace('www.', '');
    } catch {
        return '';
    }
}

function displayCityBreakdown(companies) {
    const cityCounts = {};
    
    companies.forEach(company => {
        const city = detectCity(company.headquarters);
        if (city) {
            cityCounts[city] = (cityCounts[city] || 0) + 1;
        }
    });
    
    const container = document.getElementById('cityBreakdown');
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">';
    
    Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).forEach(([city, count]) => {
        const cityData = cities[city];
        html += `
            <div class="city-card">
                <div class="city-header">
                    <div class="city-name">${cityData.name}</div>
                    <div class="city-count">${count}</div>
                </div>
                <div class="city-stats">
                    <div class="city-stat">
                        <div class="city-stat-value">${Math.round(count / companies.length * 100)}%</div>
                        <div class="city-stat-label">Market Share</div>
                    </div>
                    <div class="city-stat">
                        <div class="city-stat-value">€${Math.round(count * 50)}M</div>
                        <div class="city-stat-label">Est. Funding</div>
                    </div>
                    <div class="city-stat">
                        <div class="city-stat-value">${count * 25}</div>
                        <div class="city-stat-label">Est. Employees</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function displayCompaniesByCity(companies) {
    const companiesByCity = {};
    
    companies.forEach(company => {
        const city = detectCity(company.headquarters);
        if (city) {
            if (!companiesByCity[city]) companiesByCity[city] = [];
            companiesByCity[city].push(company);
        }
    });
    
    const container = document.getElementById('companiesByCity');
    let html = '';
    
    Object.entries(companiesByCity).sort((a, b) => b[1].length - a[1].length).forEach(([city, cityCompanies]) => {
        html += `
            <div style="margin-bottom: 30px;">
                <h3 style="margin-bottom: 15px;">${cities[city].name} (${cityCompanies.length})</h3>
                <div class="company-list">
                    ${cityCompanies.map(c => `
                        <div class="company-chip">
                            <i class="fas fa-building"></i>
                            ${c.name}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function updateStats(companies) {
    const stockholmCompanies = companies.filter(c => detectCity(c.headquarters) === 'stockholm').length;
    document.getElementById('stockholmCount').textContent = stockholmCompanies;
    document.getElementById('nordicCount').textContent = companies.length;
    document.getElementById('marketShare').textContent = `${Math.round(stockholmCompanies / companies.length * 100)}%`;
    document.getElementById('totalEmployees').textContent = '2,500+';
}

function setupFilters() {
    document.querySelectorAll('[data-city]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('[data-city]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const city = this.getAttribute('data-city');
            if (city === 'all') {
                displayCompaniesOnMap(companies);
                map.setView([59.3293, 18.0686], 6);
            } else if (city === 'stockholm') {
                const filtered = companies.filter(c => detectCity(c.headquarters) === city);
                displayCompaniesOnMap(filtered);
                map.setView([cities[city].lat, cities[city].lng], 11);
            } else {
                const filtered = companies.filter(c => detectCity(c.headquarters) === city);
                displayCompaniesOnMap(filtered);
                map.setView([cities[city].lat, cities[city].lng], 11);
            }
        });
    });
}

// Logo handling functions - same as AI Companies for consistency
function getCompanyLogoUrls(company) {
    const urls = [];
    
    // Priority 1: Custom logo URL if provided
    if (company.logo_url && !company.logo_url.includes('logo.clearbit.com')) {
        urls.push(company.logo_url);
    }
    
    // Priority 2: Google Favicon (most reliable)
    if (company.website) {
        try {
            const hostname = new URL(company.website).hostname;
            urls.push(`https://www.google.com/s2/favicons?domain=${hostname}&sz=128`);
        } catch (e) {
            // Invalid URL, skip
        }
    }
    
    // Priority 3: UI Avatars as guaranteed fallback
    urls.push(`https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=667eea&color=fff&size=128&bold=true&format=png`);
    
    return urls;
}

function loadNextLogoUrl(img) {
    try {
        const urls = JSON.parse(img.getAttribute('data-logo-urls'));
        let currentIndex = parseInt(img.getAttribute('data-current-index'));
        
        currentIndex++;
        
        if (currentIndex < urls.length) {
            img.setAttribute('data-current-index', currentIndex);
            img.src = urls[currentIndex];
        } else {
            // All URLs failed, show placeholder
            img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(img.alt)}&background=667eea&color=fff&size=128&bold=true`;
        }
    } catch (e) {
        console.error('Error loading logo:', e);
        img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(img.alt || 'AI')}&background=667eea&color=fff&size=128&bold=true`;
    }
}

// Initialize logo loading for map markers after they're created
function initializeMapLogos() {
    setTimeout(() => {
        document.querySelectorAll('.marker-company-logo[data-logo-urls]').forEach(img => {
            try {
                const urls = JSON.parse(img.getAttribute('data-logo-urls'));
                if (urls && urls.length > 0) {
                    img.src = urls[0];
                }
            } catch (e) {
                console.error('Error setting initial logo:', e);
            }
        });
    }, 500);
}
