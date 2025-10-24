/*
===================================
M&A News Hub - JavaScript
===================================

BEGINNER EXPLANATION:
JavaScript makes your website INTERACTIVE.
- Responds to button clicks
- Updates content without reloading the page
- Communicates with the backend server
- Manipulates the HTML to show/hide elements
*/

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
    // Nordic PE Firms
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

function createRobustLogoHTML(firmName, size = '32px') {
    if (!firmName || !firmLogos[firmName]) return '';
    
    const logoData = firmLogos[firmName];
    const escapedName = escapeHtml(firmName);
    
    return `
        <div class="news-firm-logo" style="position: relative; display: inline-block; margin-right: 8px;">
            <img src="${logoData.primary}" 
                 alt="${escapedName}" 
                 style="width: ${size}; height: ${size}; border-radius: 6px; object-fit: contain;"
                 onerror="this.onerror=null; this.src='${logoData.fallback}'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='flex';}">
            <div class="logo-fallback" style="display: none; width: ${size}; height: ${size}; background: #4c1d95; color: white; border-radius: 6px; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">
                ${logoData.icon}
            </div>
        </div>
    `;
}

// ===== WAIT FOR PAGE TO LOAD =====
// This ensures all HTML is loaded before we run our code
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 M&A News Hub initialized!');
    
    // Initialize the application
    init();
});

// ===== INITIALIZE APPLICATION =====
function init() {
    // Get references to HTML elements
    const refreshBtn = document.getElementById('refreshBtn');
    const searchInput = document.getElementById('searchInput');
    
    // Add event listeners (respond to user actions)
    refreshBtn.addEventListener('click', scrapeNews);
    searchInput.addEventListener('input', handleSearch);
    
    // Load existing news when page loads
    loadNews();
    
    // Auto-load news on first visit if empty
    setTimeout(() => {
        const newsContainer = document.getElementById('newsContainer');
        if (newsContainer && newsContainer.children.length === 0) {
            console.log('Auto-loading news...');
            scrapeNews();
        }
    }, 500);
}

// ===== SCRAPE NEWS FUNCTION =====
// This tells the backend to fetch new articles
async function scrapeNews() {
    const refreshBtn = document.getElementById('refreshBtn');
    const originalText = refreshBtn.innerHTML;
    
    // Disable button and show loading state
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    
    showLoading(true);
    hideStatusMessage();
    
    try {
        // Make a POST request to the backend
        // fetch() is how JavaScript talks to the server
        const response = await fetch('/api/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // Convert the response to JSON format
        const data = await response.json();
        
        if (data.success) {
            showStatusMessage(`✅ Loaded ${data.new_count} articles!`, 'success');
            // Reload the news to display the new articles
            await loadNews();
        } else {
            showStatusMessage(`❌ Error: ${data.message}`, 'error');
        }
        
    } catch (error) {
        console.error('Error loading news:', error);
        showStatusMessage('❌ Failed to load news. Please try again.', 'error');
    } finally {
        // Re-enable the button
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = originalText;
        showLoading(false);
    }
}

// ===== LOAD NEWS FUNCTION =====
// Fetches and displays PE/investment news articles (filters out AI news)
async function loadNews() {
    showLoading(true);
    hideStatusMessage();
    
    try {
        // GET request to fetch news
        const response = await fetch('/api/news');
        const data = await response.json();
        
        if (data.success) {
            // Filter to show only PE/investment news (exclude AI news)
            const filteredNews = data.news.filter(article => {
                const category = (article.category || '').toLowerCase();
                
                // Only show PE News, exclude AI News
                return category === 'pe news';
            });
            
            // Update the total count
            document.getElementById('totalCount').textContent = filteredNews.length;
            
            // Display the filtered news articles
            displayNews(filteredNews);
        } else {
            showStatusMessage('❌ Failed to load news', 'error');
        }
        
    } catch (error) {
        console.error('Error loading news:', error);
        showStatusMessage('❌ Failed to load news. Please check if the server is running.', 'error');
    } finally {
        showLoading(false);
    }
}

// ===== DISPLAY NEWS FUNCTION =====
// Creates HTML cards for each news article
function displayNews(newsArray) {
    const newsContainer = document.getElementById('newsContainer');
    const emptyState = document.getElementById('emptyState');
    
    // If no news, show empty state
    if (!newsArray || newsArray.length === 0) {
        newsContainer.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    // Hide empty state
    emptyState.classList.add('hidden');
    
    // Clear existing content
    newsContainer.innerHTML = '';
    
    // Create a card for each article
    newsArray.forEach((article, index) => {
        const card = createNewsCard(article, index);
        newsContainer.appendChild(card);
    });
}

// ===== TRUNCATE TEXT FUNCTION =====
// Truncates text to specified length and adds ellipsis
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

// ===== CREATE NEWS CARD =====
// Creates a single news card element
function createNewsCard(article, index) {
    // Create the card container
    const card = document.createElement('div');
    card.className = 'news-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Format the date nicely
    const date = article.published || article.scraped_at || 'Unknown date';
    
    // Get source icon
    const sourceIcon = getSourceIcon(article.source);
    
    // Get firm info from title and description
    const firmName = getFirmFromTitle(article.title) || getFirmFromTitle(article.description);
    const firmLogoHtml = createRobustLogoHTML(firmName, '32px');
    
    // Build the HTML for the card
    card.innerHTML = `
        <div class="news-card-header">
            <div style="display: flex; align-items: center; gap: 8px;">
                ${firmLogoHtml}
                <span class="news-source">
                    ${sourceIcon}
                    ${escapeHtml(article.source || 'Unknown')}
                </span>
            </div>
        </div>
        <h3 class="news-title">${escapeHtml(truncateText(article.title, 80))}</h3>
        <p class="news-description">${escapeHtml(truncateText(article.description, 120))}</p>
        <div class="news-footer">
            <span class="news-date">
                <i class="far fa-calendar"></i>
                ${escapeHtml(date)}
            </span>
            <a href="${escapeHtml(article.url)}" target="_blank" class="news-link">
                Read More
                <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;
    
    return card;
}

// ===== SEARCH FUNCTION =====
// Filters news based on search input
let searchTimeout;
async function handleSearch(event) {
    const query = event.target.value.trim();
    
    // Debounce: wait 300ms after user stops typing
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        
        if (query === '') {
            // If search is empty, load all news
            loadNews();
            return;
        }
        
        showLoading(true);
        
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('totalCount').textContent = data.count;
                displayNews(data.results);
                
                if (data.count === 0) {
                    showStatusMessage(`No articles found for "${query}"`, 'error');
                }
            }
            
        } catch (error) {
            console.error('Error searching:', error);
            showStatusMessage('❌ Search failed', 'error');
        } finally {
            showLoading(false);
        }
        
    }, 300);
}

// ===== HELPER FUNCTIONS =====

// Show/hide loading spinner
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.classList.remove('hidden');
    } else {
        spinner.classList.add('hidden');
    }
}

// Show status message
function showStatusMessage(message, type) {
    const messageDiv = document.getElementById('statusMessage');
    messageDiv.textContent = message;
    messageDiv.className = `status-message ${type}`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideStatusMessage();
    }, 5000);
}

// Hide status message
function hideStatusMessage() {
    const messageDiv = document.getElementById('statusMessage');
    messageDiv.classList.add('hidden');
}

// Get source icon based on news source
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

// Escape HTML to prevent XSS attacks
// SECURITY: This prevents malicious code from being injected
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== UTILITY: Format date nicely =====
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        return dateString;
    }
}

// Log helpful information for debugging
console.log('📚 Available functions:');
console.log('  - scrapeNews(): Scrape new articles');
console.log('  - loadNews(): Reload all articles');
console.log('  - handleSearch(): Search articles');
console.log('\n💡 Tip: Open DevTools (F12) to see network requests and console logs!');

