/**
 * AI Companies Page - JavaScript
 * Handles Swedish AI ecosystem and global AI investments
 */

let allCompanies = [];
let currentFilter = {
    category: 'all',
    stage: 'all',
    tech: 'all',
    search: ''
};

// Investor logo mapping (major Nordic and global VCs)
const investorLogos = {
    'Creandum': 'https://logo.clearbit.com/creandum.com',
    'EQT Ventures': 'https://logo.clearbit.com/eqtventures.com',
    'Sequoia': 'https://logo.clearbit.com/sequoiacap.com',
    'Sequoia Capital': 'https://logo.clearbit.com/sequoiacap.com',
    'Accel': 'https://logo.clearbit.com/accel.com',
    'Iconiq Capital': 'https://logo.clearbit.com/iconiqcapital.com',
    'General Catalyst': 'https://logo.clearbit.com/generalcatalyst.com',
    'Benchmark': 'https://logo.clearbit.com/benchmark.com',
    'Redpoint Ventures': 'https://logo.clearbit.com/redpoint.com',
    'Index Ventures': 'https://logo.clearbit.com/indexventures.com',
    'Andreessen Horowitz': 'https://logo.clearbit.com/a16z.com',
    'a16z': 'https://logo.clearbit.com/a16z.com',
    'Atomico': 'https://logo.clearbit.com/atomico.com',
    'Northzone': 'https://logo.clearbit.com/northzone.com',
    'Emblem VC': 'https://logo.clearbit.com/emblem.vc',
    'Y Combinator': 'https://logo.clearbit.com/ycombinator.com',
    'Menlo Ventures': 'https://logo.clearbit.com/menlovc.com',
    'Lightspeed': 'https://logo.clearbit.com/lsvp.com',
    'Lakestar': 'https://logo.clearbit.com/lakestar.com',
    'Balderton Capital': 'https://logo.clearbit.com/balderton.com',
    'Khosla Ventures': 'https://logo.clearbit.com/khoslaventures.com',
    'Founders Fund': 'https://logo.clearbit.com/foundersfund.com',
    'Bessemer Venture Partners': 'https://logo.clearbit.com/bvp.com',
    'GGV Capital': 'https://logo.clearbit.com/ggvc.com',
    'NEA': 'https://logo.clearbit.com/nea.com',
    'Insight Partners': 'https://logo.clearbit.com/insightpartners.com',
    'Zenith Ventures': 'https://logo.clearbit.com/zenith.vc',
    'Kinnevik': 'https://logo.clearbit.com/kinnevik.com',
    'Conviction': 'https://logo.clearbit.com/conviction.com',
    'Pear VC': 'https://logo.clearbit.com/pear.vc',
    'Greens Ventures': 'https://logo.clearbit.com/greens.vc',
    'Inception Fund': 'https://logo.clearbit.com/inception.vc'
};

// Family office & individual investor mappings
const familyOfficeLogos = {
    'H&M family': 'https://logo.clearbit.com/hm.com',
    'H&M': 'https://logo.clearbit.com/hm.com',
    'Persson family': 'https://logo.clearbit.com/hm.com',
    'Daniel Ek': 'https://logo.clearbit.com/spotify.com',
    'Spotify money': 'https://logo.clearbit.com/spotify.com',
    'Martin Lorentzon': 'https://logo.clearbit.com/spotify.com',
    'Niklas Zennström': 'https://logo.clearbit.com/skype.com',
    'Klaus Hommels': 'https://logo.clearbit.com/lakestar.com',
    'Avanza founder': 'https://logo.clearbit.com/avanza.se',
    'Sven Hagströmer': 'https://logo.clearbit.com/avanza.se',
    'Klarna': 'https://logo.clearbit.com/klarna.com',
    'Tink': 'https://logo.clearbit.com/tink.com'
};

/**
 * Check if investor name is an individual (not a firm)
 */
function isIndividualInvestor(investorName) {
    const firmKeywords = ['capital', 'ventures', 'venture', 'partners', 'fund', 'vc', 'investment', 
                          'equity', 'group', 'holdings', 'labs', 'family office'];
    const lowerName = investorName.toLowerCase();
    
    // If it contains firm keywords, it's a firm
    for (const keyword of firmKeywords) {
        if (lowerName.includes(keyword)) {
            return false;
        }
    }
    
    // If it has typical name patterns (First Last, multiple words with capitals)
    const words = investorName.trim().split(' ');
    if (words.length >= 2 && words.length <= 4) {
        // Check if looks like a person name (Title case words)
        const looksLikeName = words.every(word => word.length > 0 && word[0] === word[0].toUpperCase());
        if (looksLikeName) return true;
    }
    
    return false;
}

/**
 * Get investor logo URL or icon
 */
function getInvestorLogo(investorName) {
    // Remove common suffixes like (lead), etc.
    const cleanName = investorName.replace(/\s*\([^)]*\)/g, '').trim();
    
    // Check family office mappings first
    for (const [key, url] of Object.entries(familyOfficeLogos)) {
        if (cleanName.toLowerCase().includes(key.toLowerCase())) {
            return { type: 'logo', url: url };
        }
    }
    
    // Check if we have a VC/firm mapping
    for (const [key, url] of Object.entries(investorLogos)) {
        if (cleanName.toLowerCase().includes(key.toLowerCase()) || 
            key.toLowerCase().includes(cleanName.toLowerCase())) {
            return { type: 'logo', url: url };
        }
    }
    
    // Check if it's an individual
    if (isIndividualInvestor(cleanName)) {
        return { type: 'person', url: null };
    }
    
    return null;
}

/**
 * Initialize the page
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧠 AI Companies page initializing...');
    
    // Load data
    loadAICompanies();
    loadAnalytics();
    
    // Setup event listeners
    setupSearch();
});

/**
 * Load AI companies from API
 */
async function loadAICompanies() {
    try {
        const response = await fetch('/api/ai-companies');
        const data = await response.json();
        
        if (data.success) {
            allCompanies = data.companies;
            
            // Update header stats
            updateHeaderStats(data.companies, data.metadata);
            
            // Create logo grid
            createLogoGrid(allCompanies);
            
            // Display companies in list view (hidden initially)
            displayCompanies(allCompanies);
            
            console.log(`✅ Loaded ${allCompanies.length} AI companies`);
        } else {
            showError('Failed to load AI companies');
        }
    } catch (error) {
        console.error('Error loading AI companies:', error);
        showError('Error loading AI companies: ' + error.message);
    }
}

/**
 * Load analytics data
 */
async function loadAnalytics() {
    try {
        const response = await fetch('/api/ai-companies/analytics');
        const data = await response.json();
        
        if (data.success) {
            displayAnalytics(data.analytics);
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

/**
 * Create logo grid for quick navigation
 */
function createLogoGrid(companies) {
    console.log('🎨 Creating logo grid for', companies.length, 'companies');
    const logoGrid = document.getElementById('logoGrid');
    
    if (!logoGrid) {
        console.error('❌ Logo grid element not found!');
        return;
    }
    
    logoGrid.innerHTML = '';
    
    companies.forEach((company, index) => {
        try {
            const logoBox = document.createElement('div');
            logoBox.className = 'logo-box';
            
            // Navigate to dedicated company page
            const companyNameUrl = company.name.replace(/\s+/g, '-').replace(/[()]/g, '').toLowerCase();
            logoBox.onclick = () => window.location.href = `/ai-companies/${companyNameUrl}`;
            
            const isStealthMode = company.name && company.name.toLowerCase().includes('stealth');
            
            // Get both country flag AND industry category
            const industry = company.industry || null;
            const countryFlag = getCountryFlag(company.headquarters || '');
            
            if (isStealthMode) {
                logoBox.innerHTML = `
                    ${countryFlag ? `<div class="logo-box-flag" title="${company.headquarters || ''}">${countryFlag}</div>` : ''}
                    ${industry ? `<div class="logo-box-industry" title="Industry: ${industry}">${industry}</div>` : ''}
                    <i class="fas fa-user-secret" style="font-size: 50px; color: #667eea; opacity: 0.6;"></i>
                    <div class="logo-box-name">${company.name}</div>
                `;
            } else {
                // Multi-tier logo fallback system
                const logoUrls = getCompanyLogoUrls(company);
                
                logoBox.innerHTML = `
                    ${countryFlag ? `<div class="logo-box-flag" title="${company.headquarters || ''}">${countryFlag}</div>` : ''}
                    ${industry ? `<div class="logo-box-industry" title="Industry: ${industry}">${industry}</div>` : ''}
                    <div class="logo-img-container" style="width: 100%; height: 90px; display: flex; align-items: center; justify-content: center;">
                        <img data-logo-urls='${JSON.stringify(logoUrls)}' 
                             data-current-index="0"
                             alt="${company.name}"
                             style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    </div>
                    <div class="logo-box-name">${company.name}</div>
                `;
                
                // Set up the image with fallback logic
                const img = logoBox.querySelector('img');
                setupImageFallback(img);
            }
            
            logoGrid.appendChild(logoBox);
            
            if (index < 3) {
                console.log(`✅ Added logo for ${company.name}`);
            }
        } catch (error) {
            console.error(`❌ Error creating logo box for ${company.name}:`, error);
        }
    });
    
    console.log(`✅ Logo grid complete: ${companies.length} companies added`);
    
    // Convert only flag emojis to images using Twemoji (for Windows compatibility)
    setTimeout(() => {
        if (typeof twemoji !== 'undefined') {
            // Only convert flags in the logo-box-flag badges
            document.querySelectorAll('.logo-box-flag, .country-flag-badge').forEach(el => {
                twemoji.parse(el, {
                    folder: 'svg',
                    ext: '.svg',
                    base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/'
                });
            });
            console.log('✅ Converted flag emojis to colorful images');
        }
    }, 100);
}

function getCompanyLogoUrls(company) {
    const urls = [];
    
    // Priority 1: Custom logo URL if provided and looks valid
    if (company.logo_url && !company.logo_url.includes('logo.clearbit.com')) {
        urls.push(company.logo_url);
    }
    
    // Priority 2: Google Favicon (most reliable for real domains)
    if (company.website) {
        try {
            const hostname = new URL(company.website).hostname;
            urls.push(`https://www.google.com/s2/favicons?domain=${hostname}&sz=128`);
        } catch (e) {
            // Invalid URL, skip
        }
    }
    
    // Priority 3: UI Avatars as guaranteed fallback (always works)
    urls.push(`https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=667eea&color=fff&size=200&bold=true&format=png`);
    
    return urls;
}

function setupImageFallback(img) {
    const urls = JSON.parse(img.getAttribute('data-logo-urls'));
    let currentIndex = 0;
    let loadTimeout;
    
    function tryNextUrl() {
        if (currentIndex < urls.length) {
            // Clear any existing timeout
            if (loadTimeout) {
                clearTimeout(loadTimeout);
            }
            
            img.src = urls[currentIndex];
            
            // Auto-fallback after 2 seconds if image doesn't load
            loadTimeout = setTimeout(() => {
                if (!img.complete || img.naturalWidth === 0) {
                    currentIndex++;
                    if (currentIndex < urls.length) {
                        console.log(`⏱️ Logo timeout, trying fallback ${currentIndex + 1}/${urls.length}`);
                        tryNextUrl();
                    }
                }
            }, 2000);
        }
    }
    
    img.onerror = function() {
        if (loadTimeout) {
            clearTimeout(loadTimeout);
        }
        currentIndex++;
        if (currentIndex < urls.length) {
            console.log(`❌ Logo failed, trying fallback ${currentIndex + 1}/${urls.length}`);
            tryNextUrl();
        }
    };
    
    img.onload = function() {
        if (loadTimeout) {
            clearTimeout(loadTimeout);
        }
        // Check if image actually loaded (not 0x0 or very small)
        if (this.naturalWidth === 0 || this.naturalHeight === 0 || this.naturalWidth < 10) {
            currentIndex++;
            if (currentIndex < urls.length) {
                console.log(`⚠️ Invalid logo size, trying fallback ${currentIndex + 1}/${urls.length}`);
                tryNextUrl();
            }
        }
    };
    
    // Start loading the first URL
    tryNextUrl();
}

/**
 * Show detailed company profile
 */
function showCompanyProfile(company) {
    const container = document.getElementById('companyProfileContainer');
    const companiesContainer = document.getElementById('companiesContainer');
    const analyticsPanel = document.getElementById('analyticsPanel');
    
    // Hide list view and analytics
    companiesContainer.style.display = 'none';
    analyticsPanel.style.display = 'none';
    container.style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const isUnicorn = company.category && company.category.toLowerCase().includes('unicorn');
    const isStealthMode = company.name && company.name.toLowerCase().includes('stealth');
    
    let logoHtml = '';
    if (isStealthMode) {
        logoHtml = `<div class="profile-logo" style="display: flex; align-items: center; justify-content: center; background: #f8f9fa;">
            <i class="fas fa-user-secret" style="font-size: 60px; color: #667eea; opacity: 0.6;"></i>
        </div>`;
    } else {
        const logoUrl = company.logo_url || `https://logo.clearbit.com/${company.website ? new URL(company.website).hostname : company.name.toLowerCase().replace(/\s+/g, '') + '.com'}`;
        logoHtml = `<img src="${logoUrl}" 
                     alt="${escapeHtml(company.name)}"
                     class="profile-logo"
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/120x120/667eea/white?text=${encodeURIComponent(company.name.substring(0,2))}';">`;
    }
    
    let html = `
        <div class="company-profile">
            <div class="profile-header">
                ${logoHtml}
                <div class="profile-info">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                        <h1 style="margin: 0; font-size: 36px; font-weight: 700; color: #1a1a1a;">${escapeHtml(company.name)}</h1>
                        ${isUnicorn ? '<span class="unicorn-badge">🦄 Unicorn Track</span>' : ''}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <span class="ai-company-category">${escapeHtml(company.category || 'AI Company')}</span>
                        ${company.valuation ? `<span class="valuation-badge" style="margin-left: 10px;">${escapeHtml(company.valuation)}</span>` : ''}
                    </div>
                    <div style="color: #666; font-size: 16px; margin-bottom: 15px;">
                        <i class="fas fa-map-marker-alt"></i> ${escapeHtml(company.headquarters || 'Stockholm, Sweden')}
                        ${company.founded ? ` • Founded ${escapeHtml(company.founded)}` : ''}
                    </div>
                    <div class="profile-actions">
                        <button class="action-btn action-btn-primary" onclick="window.open('${company.website || '#'}', '_blank')">
                            <i class="fas fa-globe"></i> Visit Website
                        </button>
                        <button class="action-btn action-btn-secondary" onclick="hideCompanyProfile()">
                            <i class="fas fa-arrow-left"></i> Back to List
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="ai-company-description" style="font-size: 18px; line-height: 1.8; padding: 20px; background: #f8f9fa; border-radius: 12px; margin-bottom: 25px;">
                ${escapeHtml(company.description || 'No description available')}
            </div>
    `;
    
    // Key Metrics
    html += '<div class="ai-metrics">';
    if (company.arr) {
        html += `
            <div class="ai-metric">
                <div class="ai-metric-label">ARR</div>
                <div class="ai-metric-value">${escapeHtml(company.arr)}</div>
            </div>
        `;
    }
    if (company.employees) {
        html += `
            <div class="ai-metric">
                <div class="ai-metric-label">Employees</div>
                <div class="ai-metric-value">${escapeHtml(company.employees)}</div>
            </div>
        `;
    }
    if (company.customers) {
        html += `
            <div class="ai-metric">
                <div class="ai-metric-label">Customers</div>
                <div class="ai-metric-value">${escapeHtml(company.customers)}</div>
            </div>
        `;
    }
    if (company.growth) {
        html += `
            <div class="ai-metric">
                <div class="ai-metric-label">Growth Rate</div>
                <div class="ai-metric-value">${escapeHtml(company.growth)}</div>
            </div>
        `;
    }
    html += '</div>';
    
    // Funding History
    if (company.funding_rounds && company.funding_rounds.length > 0) {
        html += `
            <div class="funding-history">
                <h3 style="margin: 0 0 20px 0; font-size: 20px; color: #1a1a1a;">
                    <i class="fas fa-chart-line"></i> Funding History
                </h3>
        `;
        
        company.funding_rounds.forEach(round => {
            html += `
                <div class="funding-round">
                    <div class="funding-round-header">
                        <div class="funding-round-type">${escapeHtml(round.round_type || 'Funding Round')}</div>
                        <div class="funding-amount">${escapeHtml(round.amount || 'Undisclosed')}</div>
                    </div>
                    <div class="funding-date">
                        <i class="far fa-calendar"></i> ${escapeHtml(round.date || 'Date unknown')}
                    </div>
                    ${round.investors ? `
                        <div class="funding-investors">
                            <i class="fas fa-users"></i> <strong>Investors:</strong> ${escapeHtml(round.investors)}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += '</div>';
    }
    
    // Technology Stack
    if (company.technologies && company.technologies.length > 0) {
        html += `
            <div style="margin-top: 25px;">
                <h3 style="margin-bottom: 15px; font-size: 18px; color: #1a1a1a;">
                    <i class="fas fa-code"></i> Technology Stack
                </h3>
                <div class="technology-tags">
        `;
        
        company.technologies.forEach(tech => {
            html += `<span class="tech-tag">${escapeHtml(tech)}</span>`;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    // Team Members
    if (company.team && company.team.length > 0) {
        html += `
            <div class="team-section">
                <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #1a1a1a;">
                    <i class="fas fa-users"></i> Team
                </h3>
                <div class="team-grid">
        `;
        
        company.team.forEach(member => {
            html += `
                <div class="team-member">
                    <div class="team-member-name">${escapeHtml(member.name || member)}</div>
                    <div class="team-member-title">${escapeHtml(member.title || member.role || 'Team Member')}</div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    // Investors
    if (company.investors) {
        const investors = Array.isArray(company.investors) ? company.investors : [company.investors];
        html += `
            <div class="investors-section">
                <div class="investors-label">
                    <i class="fas fa-hand-holding-usd"></i> Investors
                </div>
                <div class="investor-tags">
        `;
        
        investors.forEach(investor => {
            html += `<span class="investor-tag">${escapeHtml(investor)}</span>`;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    // Recent Activity
    if (company.recent_activity) {
        html += `
            <div class="recent-activity">
                <div class="recent-activity-label">🔥 Recent Activity</div>
                <div class="recent-activity-text">${escapeHtml(company.recent_activity)}</div>
            </div>
        `;
    }
    
    html += `</div>`;
    
    container.innerHTML = html;
}

/**
 * Hide company profile and show list view
 */
function hideCompanyProfile() {
    const container = document.getElementById('companyProfileContainer');
    const companiesContainer = document.getElementById('companiesContainer');
    const analyticsPanel = document.getElementById('analyticsPanel');
    
    container.style.display = 'none';
    companiesContainer.style.display = 'block';
    analyticsPanel.style.display = 'block';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Update header statistics
 */
function updateHeaderStats(companies, metadata) {
    // Total companies
    document.getElementById('totalCompanies').textContent = companies.length;
    
    // Total funding
    document.getElementById('totalFunding').textContent = metadata.total_funding || 'SEK 50B+';
    
    // Unicorns count
    const unicorns = companies.filter(c => {
        const catLower = (c.category || '').toLowerCase();
        const valLower = (c.valuation || '').toLowerCase();
        return catLower.includes('unicorn') || valLower.includes('billion') || valLower.includes('milliard');
    });
    document.getElementById('unicornsCount').textContent = unicorns.length;
    
    // Y Combinator alumni
    const ycAlumni = companies.filter(c => {
        if (!c.investors) return false;
        const investorStr = Array.isArray(c.investors) ? JSON.stringify(c.investors) : String(c.investors);
        return investorStr.toLowerCase().includes('y combinator');
    });
    document.getElementById('ycAlumniCount').textContent = ycAlumni.length;
    
    // Average valuation (approximate from those with valuations)
    const valuations = companies.filter(c => c.valuation).length;
    const avgVal = valuations > 0 ? Math.round(companies.length / valuations * 150) + 'M' : 'N/A';
    document.getElementById('avgValuation').textContent = 'SEK ' + avgVal;
    
    // Total employees (estimate)
    let totalEmployees = 0;
    companies.forEach(c => {
        if (c.employees) {
            // Parse employee ranges like "50-100" or "100+"
            const empStr = String(c.employees);
            if (empStr.includes('-')) {
                const parts = empStr.split('-').map(p => parseInt(p.replace(/\D/g, '')));
                totalEmployees += Math.round((parts[0] + parts[1]) / 2);
            } else if (empStr.includes('+')) {
                totalEmployees += parseInt(empStr.replace(/\D/g, ''));
            } else {
                totalEmployees += parseInt(empStr.replace(/\D/g, '')) || 0;
            }
        }
    });
    document.getElementById('totalEmployees').textContent = totalEmployees > 1000 ? 
        Math.round(totalEmployees / 1000) + 'K+' : totalEmployees + '+';
    
    // Recently founded (2023+)
    const recentlyFounded = companies.filter(c => c.founded && parseInt(c.founded) >= 2023);
    document.getElementById('foundedRecent').textContent = recentlyFounded.length;
    
    // Countries count
    const countries = new Set();
    companies.forEach(c => {
        if (c.headquarters) {
            // Extract country from headquarters string
            const parts = c.headquarters.split(',');
            if (parts.length > 0) {
                const country = parts[parts.length - 1].trim();
                countries.add(country);
            }
        }
    });
    document.getElementById('countriesCount').textContent = countries.size;
}

/**
 * Display analytics
 */
function displayAnalytics(analytics) {
    const container = document.getElementById('analyticsContent');
    
    // Group categories into broader segments
    const groupedCategories = {
        'Swedish AI Leaders': 0,
        'Nordic AI Companies': 0,
        'Global AI Giants': 0,
        'AI Startups': 0
    };
    
    // Categorize companies into broader groups
    for (const [category, count] of Object.entries(analytics.categories)) {
        if (category.includes('Swedish AI') || category.includes('Unicorn')) {
            groupedCategories['Swedish AI Leaders'] += count;
        } else if (category.includes('Finnish') || category.includes('Norwegian') || category.includes('Danish')) {
            groupedCategories['Nordic AI Companies'] += count;
        } else if (category.includes('Global') || category.includes('OpenAI') || category.includes('Anthropic')) {
            groupedCategories['Global AI Giants'] += count;
        } else {
            groupedCategories['AI Startups'] += count;
        }
    }
    
    // Group stages into broader categories
    const groupedStages = {
        'Unicorn Track': 0,
        'Growth Stage': 0,
        'Early Stage': 0,
        'Established': 0
    };
    
    for (const [stage, count] of Object.entries(analytics.stages)) {
        if (stage.includes('Unicorn') || stage.includes('Series C') || stage.includes('Series B')) {
            groupedStages['Unicorn Track'] += count;
        } else if (stage.includes('Growth') || stage.includes('Series A')) {
            groupedStages['Growth Stage'] += count;
        } else if (stage.includes('Seed') || stage.includes('Early')) {
            groupedStages['Early Stage'] += count;
        } else {
            groupedStages['Established'] += count;
        }
    }
    
    // Group technologies into broader categories
    const groupedTechs = {
        'Machine Learning': 0,
        'Computer Vision': 0,
        'Natural Language': 0,
        'Autonomous Systems': 0,
        'Enterprise AI': 0
    };
    
    for (const [tech, count] of Object.entries(analytics.top_technologies)) {
        if (tech.includes('Machine Learning') || tech.includes('Deep Learning') || tech.includes('Neural')) {
            groupedTechs['Machine Learning'] += count;
        } else if (tech.includes('Computer Vision') || tech.includes('Image') || tech.includes('Visual')) {
            groupedTechs['Computer Vision'] += count;
        } else if (tech.includes('NLP') || tech.includes('Language') || tech.includes('Text') || tech.includes('LLM')) {
            groupedTechs['Natural Language'] += count;
        } else if (tech.includes('Autonomous') || tech.includes('Robotics') || tech.includes('Vehicle')) {
            groupedTechs['Autonomous Systems'] += count;
        } else if (tech.includes('Enterprise') || tech.includes('Business') || tech.includes('SaaS')) {
            groupedTechs['Enterprise AI'] += count;
        }
    }
    
    // Filter out zero-count categories
    const nonZeroCategories = Object.entries(groupedCategories).filter(([_, count]) => count > 0);
    const nonZeroStages = Object.entries(groupedStages).filter(([_, count]) => count > 0);
    const nonZeroTechs = Object.entries(groupedTechs).filter(([_, count]) => count > 0);
    
    let html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
            <!-- Company Segments -->
            <div class="chart-container" style="background: white; padding: 18px; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
                <h3 style="margin-bottom: 14px; color: #111827; display: flex; align-items: center; gap: 8px; font-size: 15px;">
                    <i class="fas fa-layer-group" style="color: #667eea; font-size: 14px;"></i>
                    Company Segments
                </h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
    `;
    
    const maxSegmentCount = Math.max(...nonZeroCategories.map(([_, count]) => count));
    for (const [segment, count] of nonZeroCategories) {
        const percentage = (count / maxSegmentCount) * 100;
        const color = segment === 'Swedish AI Leaders' ? '#667eea' : 
                     segment === 'Nordic AI Companies' ? '#10b981' :
                     segment === 'Global AI Giants' ? '#f59e0b' : '#8b5cf6';
        
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                <span style="font-weight: 600; color: #374151; font-size: 13px;">${segment}</span>
                <span style="font-weight: 800; color: ${color}; font-size: 16px;">${count}</span>
            </div>
            <div style="background: #f1f5f9; height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, ${color}, ${color}dd); height: 100%; width: ${percentage}%; border-radius: 3px; transition: width 0.3s ease;"></div>
            </div>
        `;
    }
    
    html += `
                </div>
            </div>
            
            <!-- Development Stage -->
            <div class="chart-container" style="background: white; padding: 18px; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
                <h3 style="margin-bottom: 14px; color: #111827; display: flex; align-items: center; gap: 8px; font-size: 15px;">
                    <i class="fas fa-chart-line" style="color: #10b981; font-size: 14px;"></i>
                    Development Stage
                </h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
    `;
    
    const maxStageCount = Math.max(...nonZeroStages.map(([_, count]) => count));
    for (const [stage, count] of nonZeroStages) {
        const percentage = (count / maxStageCount) * 100;
        const color = stage === 'Unicorn Track' ? '#f59e0b' : 
                     stage === 'Growth Stage' ? '#10b981' :
                     stage === 'Early Stage' ? '#8b5cf6' : '#6b7280';
        
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                <span style="font-weight: 600; color: #374151; font-size: 13px;">${stage}</span>
                <span style="font-weight: 800; color: ${color}; font-size: 16px;">${count}</span>
            </div>
            <div style="background: #f1f5f9; height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, ${color}, ${color}dd); height: 100%; width: ${percentage}%; border-radius: 3px; transition: width 0.3s ease;"></div>
            </div>
        `;
    }
    
    html += `
                </div>
            </div>
            
            <!-- Technology Focus -->
            <div class="chart-container" style="background: white; padding: 18px; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
                <h3 style="margin-bottom: 14px; color: #111827; display: flex; align-items: center; gap: 8px; font-size: 15px;">
                    <i class="fas fa-microchip" style="color: #8b5cf6; font-size: 14px;"></i>
                    Technology Focus
                </h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
    `;
    
    const maxTechCount = Math.max(...nonZeroTechs.map(([_, count]) => count));
    for (const [tech, count] of nonZeroTechs) {
        const percentage = (count / maxTechCount) * 100;
        const color = tech === 'Machine Learning' ? '#667eea' : 
                     tech === 'Computer Vision' ? '#10b981' :
                     tech === 'Natural Language' ? '#f59e0b' :
                     tech === 'Autonomous Systems' ? '#ef4444' : '#8b5cf6';
        
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                <span style="font-weight: 600; color: #374151; font-size: 13px;">${tech}</span>
                <span style="font-weight: 800; color: ${color}; font-size: 16px;">${count}</span>
            </div>
            <div style="background: #f1f5f9; height: 6px; border-radius: 3px; overflow: hidden;">
                <div style="background: linear-gradient(90deg, ${color}, ${color}dd); height: 100%; width: ${percentage}%; border-radius: 3px; transition: width 0.3s ease;"></div>
            </div>
        `;
    }
    
    html += `
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Display companies
 */
function displayCompanies(companies) {
    const container = document.getElementById('companiesContainer');
    
    if (companies.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px; color: #999;">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;"></i>
                <p style="font-size: 18px;">No companies match your filters</p>
                <p style="font-size: 14px;">Try adjusting your filters or search query</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    companies.forEach(company => {
        html += createCompanyCard(company);
    });
    
    container.innerHTML = html;
    
    // Convert only flag emojis to images using Twemoji (for Windows compatibility)
    setTimeout(() => {
        if (typeof twemoji !== 'undefined') {
            // Only convert flags in badge elements
            document.querySelectorAll('.country-flag-badge, .flag-badge-inline').forEach(el => {
                twemoji.parse(el, {
                    folder: 'svg',
                    ext: '.svg',
                    base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/'
                });
            });
        }
    }, 100);
}

/**
 * Strip nationality from category name
 */
function stripNationality(category) {
    if (!category) return 'AI Company';
    
    // Remove nationality words
    return category
        .replace(/Swedish\s+/gi, '')
        .replace(/Finnish\s+/gi, '')
        .replace(/Norwegian\s+/gi, '')
        .replace(/Danish\s+/gi, '')
        .replace(/Nordic\s+/gi, '')
        .replace(/International\s+/gi, '')
        .replace(/Global\s+/gi, '')
        .replace(/European\s+/gi, '')
        .trim();
}

/**
 * Create company card HTML
 */
function createCompanyCard(company) {
    const isUnicorn = company.category && company.category.toLowerCase().includes('unicorn');
    const companyNameUrl = company.name.replace(/\s+/g, '-').replace(/[()]/g, '').toLowerCase();
    
    // Get country flag based on headquarters
    const countryFlag = getCountryFlag(company.headquarters || '');
    
    // Strip nationality from category
    const cleanCategory = stripNationality(company.category);
    
    // Get logo URL
    const logoUrls = getCompanyLogoUrls(company);
    const primaryLogoUrl = logoUrls.length > 0 ? logoUrls[0] : '';
    
    // Build clean, modern card structure
    let card = `
        <div class="company-card-redesign" onclick="window.location.href='/ai-companies/${companyNameUrl}'">
            <!-- Top Row: Badges and Valuation -->
            <div class="card-top-row ${primaryLogoUrl ? 'card-top-row-with-logo' : ''}">
                <div class="card-badges">
                    ${countryFlag ? `<span class="flag-badge-inline">${countryFlag}</span>` : ''}
                    ${isUnicorn ? '<span class="badge-unicorn">🦄 Unicorn</span>' : `<span class="badge-category">${cleanCategory}</span>`}
                </div>
                ${company.valuation ? `<div class="card-valuation">${company.valuation}</div>` : ''}
                ${primaryLogoUrl ? `<img src="${primaryLogoUrl}" alt="${company.name}" class="card-logo" onerror="this.style.display='none';">` : ''}
            </div>
            
            <!-- Title and Meta -->
            <div class="card-title-row">
                <h3 class="card-company-name">${company.name}</h3>
                <div class="card-meta">Founded ${company.founded || 'Recently'} • ${company.headquarters || 'Stockholm, Sweden'}</div>
            </div>
            
            <!-- Description -->
            <p class="card-description">${company.description || 'No description available'}</p>
            
            <!-- Technology Tags -->
            ${company.technology && company.technology.length > 0 ? `
                <div class="card-tech-row">
                    ${company.technology.slice(0, 5).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    ${company.technology.length > 5 ? `<span class="tech-tag-more">+${company.technology.length - 5}</span>` : ''}
                </div>
            ` : ''}
            
            <!-- Bottom Stats -->
            <div class="card-bottom-row">
                <div class="card-stats">
                    ${company.employees ? `<span class="stat-compact"><span class="stat-icon-mini">👥</span> ${company.employees}</span>` : ''}
                    ${company.stage && !company.stage.includes('Unicorn') ? `<span class="stat-compact"><span class="stat-icon-mini">📊</span> ${company.stage}</span>` : ''}
                </div>
                <div class="card-action">
                    <span class="view-profile-link">View Profile →</span>
                </div>
            </div>
            
            <!-- Investors (if available) -->
            ${company.investors && Array.isArray(company.investors) && company.investors.length > 0 ? `
                <div class="card-investors">
                    <div class="investors-header">💰 Investors</div>
                    <div class="investors-list">
                        ${company.investors.slice(0, 5).map(inv => {
                            const logoData = getInvestorLogo(inv);
                            let iconHtml = '';
                            if (logoData) {
                                if (logoData.type === 'logo') {
                                    iconHtml = `<img src="${logoData.url}" alt="${inv}" class="investor-logo" onerror="this.style.display='none'">`;
                                } else if (logoData.type === 'person') {
                                    iconHtml = `<i class="fas fa-user" style="font-size: 12px; opacity: 0.8;"></i>`;
                                }
                            }
                            return `<span class="investor-pill">
                                ${iconHtml}
                                ${inv}
                            </span>`;
                        }).join('')}
                        ${company.investors.length > 5 ? `<span class="investor-pill-more">+${company.investors.length - 5}</span>` : ''}
                    </div>
                </div>
            ` : ''}
            
            <!-- Recent Activity (if available) -->
            ${company.recent_activity ? `
                <div class="card-activity">
                    <span class="activity-label">🔥</span>
                    <span class="activity-text">${company.recent_activity.length > 120 ? company.recent_activity.substring(0, 120) + '...' : company.recent_activity}</span>
                </div>
            ` : ''}
            
            <!-- Website Link (if available) -->
            ${company.website ? `
                <div class="card-website">
                    <a href="${company.website}" target="_blank" rel="noopener" onclick="event.stopPropagation();" class="website-link">
                        🌐 Visit Website
                    </a>
                </div>
            ` : ''}
        </div>
    `;
    
    return card;
}

/**
 * Display Nvidia investments
 */
function displayNvidiaInvestments(nvidiaData) {
    const container = document.getElementById('nvidiaInvestments');
    
    let html = '';
    
    if (nvidiaData.major_investments) {
        nvidiaData.major_investments.forEach(investment => {
            html += `
                <div class="nvidia-investment-card">
                    <h3 style="margin: 0 0 10px 0; font-size: 22px;">${investment.company}</h3>
                    ${investment.amount ? `<p style="margin: 5px 0; font-size: 18px; font-weight: 700;">💰 ${investment.amount}</p>` : ''}
                    ${investment.valuation ? `<p style="margin: 5px 0; opacity: 0.9;">Valuation: ${investment.valuation}</p>` : ''}
                    ${investment.round_size ? `<p style="margin: 5px 0; opacity: 0.9;">Round: ${investment.round_size}</p>` : ''}
                    ${investment.date ? `<p style="margin: 5px 0; font-size: 13px; opacity: 0.8;">${investment.date}</p>` : ''}
                </div>
            `;
        });
    }
    
    html += `
        <div class="nvidia-investment-card" style="grid-column: 1 / -1; background: rgba(255, 255, 255, 0.2);">
            <h3 style="margin: 0 0 10px 0;">📊 Nvidia's AI Strategy</h3>
            <p style="margin: 5px 0; font-size: 15px; line-height: 1.6;">
                ${nvidiaData.strategy || 'Building AI ecosystem by backing game changers and market makers'}
            </p>
            <p style="margin: 15px 0 0 0; font-size: 14px; font-weight: 600;">
                💸 Total Commitment: ${nvidiaData.total_commitment || 'SEK 1.1+ trillion'}
            </p>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Setup filter buttons
 */
function setupFilters() {
    // Category filters
    document.querySelectorAll('#categoryFilters .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            document.querySelectorAll('#categoryFilters .filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update filter
            currentFilter.category = this.dataset.category;
            applyFilters();
        });
    });
    
    // Stage filters
    document.querySelectorAll('#stageFilters .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#stageFilters .filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter.stage = this.dataset.stage;
            applyFilters();
        });
    });
    
    // Tech filters
    document.querySelectorAll('#techFilters .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#techFilters .filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter.tech = this.dataset.tech;
            applyFilters();
        });
    });
}

/**
 * Setup search
 */
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', function() {
        currentFilter.search = this.value.toLowerCase();
        applyFilters();
    });
}

/**
 * Apply all filters
 */
function applyFilters() {
    let filtered = allCompanies;
    
    // Search filter
    if (currentFilter.search) {
        filtered = filtered.filter(company => {
            const searchText = (
                (company.name || '') + ' ' +
                (company.description || '') + ' ' +
                (company.category || '') + ' ' +
                (JSON.stringify(company.investors || '')) + ' ' +
                (JSON.stringify(company.technologies || ''))
            ).toLowerCase();
            
            return searchText.includes(currentFilter.search);
        });
    }
    
    // Update both logo grid and list view
    createLogoGrid(filtered);
    displayCompanies(filtered);
}

/**
 * Apply all filters
 */
function applyFilters() {
    let filtered = allCompanies;
    
    // Category filter
    if (currentFilter.category !== 'all') {
        filtered = filtered.filter(c => 
            c.category && c.category.toLowerCase().includes(currentFilter.category.toLowerCase())
        );
    }
    
    // Stage filter
    if (currentFilter.stage !== 'all') {
        if (currentFilter.stage === 'YC Alumni') {
            filtered = filtered.filter(c => {
                if (!c.investors) return false;
                const investorStr = Array.isArray(c.investors) ? JSON.stringify(c.investors) : String(c.investors);
                return investorStr.toLowerCase().includes('y combinator');
            });
        } else {
            filtered = filtered.filter(c => 
                c.stage && c.stage.toLowerCase().includes(currentFilter.stage.toLowerCase())
            );
        }
    }
    
    // Tech filter
    if (currentFilter.tech !== 'all') {
        filtered = filtered.filter(c => 
            c.technology && c.technology.some(t => 
                t.toLowerCase().includes(currentFilter.tech.toLowerCase())
            )
        );
    }
    
    // Search filter
    if (currentFilter.search) {
        filtered = filtered.filter(c => {
            const searchStr = currentFilter.search;
            return (
                (c.name && c.name.toLowerCase().includes(searchStr)) ||
                (c.description && c.description.toLowerCase().includes(searchStr)) ||
                (c.category && c.category.toLowerCase().includes(searchStr)) ||
                (c.technology && c.technology.some(t => t.toLowerCase().includes(searchStr))) ||
                (c.investors && (Array.isArray(c.investors) ? 
                    c.investors.some(i => i && i.toLowerCase().includes(searchStr)) : 
                    String(c.investors).toLowerCase().includes(searchStr)))
            );
        });
    }
    
    // Update both logo grid and list view
    createLogoGrid(filtered);
    displayCompanies(filtered);
    
    console.log(`Filtered: ${filtered.length} / ${allCompanies.length} companies`);
}

/**
 * Show error message
 */
function showError(message) {
    const container = document.getElementById('companiesContainer');
    container.innerHTML = `
        <div style="text-align: center; padding: 60px; color: #d32f2f;">
            <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px;"></i>
            <p style="font-size: 18px;">${message}</p>
        </div>
    `;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Get country flag emoji based on headquarters location
 */
function getCountryFlag(headquarters) {
    if (!headquarters) return '';
    
    const location = headquarters.toLowerCase();
    
    // Nordic countries
    if (location.includes('sweden')) return '🇸🇪';
    if (location.includes('finland')) return '🇫🇮';
    if (location.includes('norway')) return '🇳🇴';
    if (location.includes('denmark')) return '🇩🇰';
    if (location.includes('iceland')) return '🇮🇸';
    
    // Other European countries
    if (location.includes('uk') || location.includes('united kingdom') || location.includes('london')) return '🇬🇧';
    if (location.includes('germany') || location.includes('berlin')) return '🇩🇪';
    if (location.includes('france') || location.includes('paris')) return '🇫🇷';
    if (location.includes('netherlands') || location.includes('amsterdam')) return '🇳🇱';
    if (location.includes('switzerland')) return '🇨🇭';
    if (location.includes('estonia')) return '🇪🇪';
    if (location.includes('poland')) return '🇵🇱';
    
    // North America
    if (location.includes('usa') || location.includes('united states') || 
        location.includes('san francisco') || location.includes('new york') || 
        location.includes('california') || location.includes('boston')) return '🇺🇸';
    if (location.includes('canada')) return '🇨🇦';
    
    // Asia
    if (location.includes('china') || location.includes('beijing') || location.includes('shanghai')) return '🇨🇳';
    if (location.includes('japan') || location.includes('tokyo')) return '🇯🇵';
    if (location.includes('singapore')) return '🇸🇬';
    if (location.includes('india')) return '🇮🇳';
    if (location.includes('israel')) return '🇮🇱';
    
    return '🌍'; // Default globe for other countries
}

console.log('✅ AI Companies JavaScript loaded');

