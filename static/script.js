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
// Fetches and displays all news articles from the backend
async function loadNews() {
    showLoading(true);
    hideStatusMessage();
    
    try {
        // GET request to fetch news
        const response = await fetch('/api/news');
        const data = await response.json();
        
        if (data.success) {
            // Update the total count
            document.getElementById('totalCount').textContent = data.count;
            
            // Display the news articles
            displayNews(data.news);
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
    
    // Build the HTML for the card
    card.innerHTML = `
        <div class="news-card-header">
            <span class="news-source">
                ${sourceIcon}
                ${escapeHtml(article.source || 'Unknown')}
            </span>
        </div>
        <h3 class="news-title">${escapeHtml(article.title)}</h3>
        <p class="news-description">${escapeHtml(article.description)}</p>
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

