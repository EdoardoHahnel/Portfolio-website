/*
Dashboard - Main page interactivity
*/

// ===== TRUNCATE TEXT FUNCTION =====
// Truncates text to specified length and adds ellipsis
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Dashboard initialized!');
    loadDashboard();
});

async function loadDashboard() {
    await Promise.all([
        loadLatestNews(),
        loadActiveFundraising(),
        loadPEFirms(),
        loadStats()
    ]);
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
        console.log('Loading latest PE news...');
        const response = await fetch('/api/news');
        const data = await response.json();
        
        console.log('News API response:', data);
        
        if (data.success && data.news && data.news.length > 0) {
            const container = document.getElementById('latestNews');
            container.innerHTML = '';
            
            // Filter for PE/M&A news only (use category field)
            const peNews = data.news.filter(article => {
                const category = (article.category || '').toLowerCase();
                
                // Only show PE News, exclude AI News
                return category === 'pe news';
            });
            
            // Show first 15 PE articles
            peNews.slice(0, 15).forEach(article => {
                const item = document.createElement('div');
                item.className = 'news-item-compact';
                const sourceIcon = getSourceIcon(article.source);
                
                // Get firm info from title and description
                const firmName = getFirmFromTitle(article.title) || getFirmFromTitle(article.description);
                const firmLogoHtml = createRobustLogoHTML(firmName, '24px');
                
                item.innerHTML = `
                    <div class="news-item-header">
                        <div style="display: flex; align-items: center;">
                            ${firmLogoHtml}
                            <span class="news-badge">${sourceIcon} ${escapeHtml(article.source || 'M&A News')}</span>
                        </div>
                        <span class="news-date-small">${escapeHtml(article.published || 'Today')}</span>
                    </div>
                    <h4 class="news-title-compact">${escapeHtml(truncateText(article.title, 60))}</h4>
                    <a href="${escapeHtml(article.url)}" target="_blank" class="news-link-small">
                        Read more <i class="fas fa-arrow-right"></i>
                    </a>
                `;
                container.appendChild(item);
            });
        } else {
            // Show fallback message
            const container = document.getElementById('latestNews');
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #666;">
                    <i class="fas fa-newspaper" style="font-size: 24px; margin-bottom: 10px; opacity: 0.5;"></i>
                    <p>Loading latest M&A news...</p>
                    <a href="/news" class="btn btn-primary btn-sm">View All News</a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading news:', error);
    }
}


async function loadActiveFundraising() {
    try {
        const response = await fetch('/api/fundraising');
        const data = await response.json();
        
        if (data.success) {
            const container = document.getElementById('activeFundraising');
            container.innerHTML = '';
            
            // Filter active fundraising
            const active = data.fundraising.filter(f => f.status !== 'Closed').slice(0, 5);
            
            active.forEach(fund => {
                const item = document.createElement('div');
                item.className = 'fundraising-item-compact';
                item.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                        <div>
                            <div class="fund-name-compact">${escapeHtml(fund.firm)} - ${escapeHtml(fund.fund_name)}</div>
                            <div class="fund-details-compact">Target: ${escapeHtml(fund.target_size)} | ${escapeHtml(fund.status)}</div>
                        </div>
                        <span class="progress-badge">${fund.progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${fund.progress}%"></div>
                    </div>
                `;
                container.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Error loading fundraising:', error);
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
                card.innerHTML = `
                    <div class="firm-logo-container">
                        <img src="${firm.logo_url}" 
                             alt="${escapeHtml(firm.name)}" 
                             onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name='+encodeURIComponent('${escapeHtml(firm.name)}')+'&background=4c1d95&color=ffffff&size=120'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='flex';}">
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
    'Ratos': {
        primary: 'https://logo.clearbit.com/ratos.se',
        fallback: 'https://ui-avatars.com/api/?name=Ratos&background=1f2937&color=ffffff&size=64',
        icon: '🏢'
    },
    'Adelis Equity': {
        primary: 'https://logo.clearbit.com/adelisequity.com',
        fallback: 'https://ui-avatars.com/api/?name=Adelis&background=be185d&color=ffffff&size=64',
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
    if (!firmName || !firmLogos[firmName]) return '';
    
    const logoData = firmLogos[firmName];
    const escapedName = escapeHtml(firmName);
    
    return `
        <div class="news-firm-logo" style="position: relative;">
            <img src="${logoData.primary}" 
                 alt="${escapedName}" 
                 style="width: ${size}; height: ${size}; border-radius: 4px; margin-right: 8px;"
                 onerror="this.onerror=null; this.src='${logoData.fallback}'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='flex';}">
            <div class="logo-fallback" style="display: none; width: ${size}; height: ${size}; background: #4c1d95; color: white; border-radius: 4px; margin-right: 8px; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">
                ${logoData.icon}
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

