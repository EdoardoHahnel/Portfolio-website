/*
Dashboard - Main page interactivity
*/

document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Dashboard initialized!');
    loadDashboard();
});

async function loadDashboard() {
    await Promise.all([
        loadLatestNews(),
        loadLatestAINews(),
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
            
            // Filter for PE/M&A news only (exclude AI-specific news)
            const peNews = data.news.filter(article => {
                const source = (article.source || '').toLowerCase();
                
                // EXCLUDE AI news sources
                if (source.includes('breakit ai') || source.includes('crescendo ai') || 
                    source.includes('crunchbase') || source.includes('ai news') ||
                    source.includes('techcrunch')) {
                    return false;
                }
                
                // ONLY include PE/M&A sources
                if (source.includes('pe news') || source.includes('seeking alpha m&a') || 
                    source.includes('reuters m&a') || source.includes('private equity')) {
                    return true;
                }
                
                return false;
            });
            
            // Show first 15 PE articles
            peNews.slice(0, 15).forEach(article => {
                const item = document.createElement('div');
                item.className = 'news-item-compact';
                const sourceIcon = getSourceIcon(article.source);
                item.innerHTML = `
                    <div class="news-item-header">
                        <span class="news-badge">${sourceIcon} ${escapeHtml(article.source || 'M&A News')}</span>
                        <span class="news-date-small">${escapeHtml(article.published || 'Today')}</span>
                    </div>
                    <h4 class="news-title-compact">${escapeHtml(article.title)}</h4>
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

async function loadLatestAINews() {
    try {
        console.log('Loading latest AI news...');
        // For now, show sample AI news from the main news that contains AI keywords
        const response = await fetch('/api/news');
        const data = await response.json();
        
        if (data.success && data.news && data.news.length > 0) {
            const container = document.getElementById('latestAINews');
            container.innerHTML = '';
            
            // Filter for AI-related news only
            const aiNews = data.news.filter(article => {
                const text = (article.title + ' ' + (article.description || '')).toLowerCase();
                const source = (article.source || '').toLowerCase();
                
                // Include AI-specific news sources
                if (source.includes('breakit ai') || source.includes('crescendo ai') || source.includes('crunchbase')) {
                    return true;
                }
                
                // Only include if it specifically mentions AI/tech keywords
                return text.includes('ai') || text.includes('artificial intelligence') || 
                       text.includes('machine learning') || text.includes('neural network') ||
                       text.includes('deep learning') || text.includes('llm') || text.includes('gpt') ||
                       text.includes('chatbot') || text.includes('robotics') || text.includes('autonomous') ||
                       text.includes('tech') || text.includes('digital') || text.includes('software') ||
                       text.includes('automation') || text.includes('algorithm');
            }).slice(0, 10);
            
            if (aiNews.length === 0) {
                // If no AI-specific news, show tech-related news instead
                const techNews = data.news.filter(article => {
                    const source = (article.source || '').toLowerCase();
                    // Exclude PE-specific news sources
                    return !source.includes('pe news') && !source.includes('seeking alpha m&a') && !source.includes('reuters m&a');
                }).slice(0, 10);
                
                if (techNews.length === 0) {
                    container.innerHTML = `
                        <div style="text-align: center; padding: 20px; color: #666;">
                            <i class="fas fa-robot" style="font-size: 24px; margin-bottom: 10px; opacity: 0.5;"></i>
                            <p>AI news coming soon...</p>
                            <p style="font-size: 0.85rem; margin-top: 0.5rem;">Sources: Breakit, Crescendo AI, Crunchbase</p>
                        </div>
                    `;
                    return;
                }
                
                // Use tech news if no AI-specific news found
                techNews.forEach(article => {
                    const item = document.createElement('div');
                    item.className = 'news-item-compact';
                    item.style.borderLeftColor = '#7c3aed';
                    const sourceIcon = getSourceIcon(article.source);
                    item.innerHTML = `
                        <div class="news-item-header">
                            <span class="news-badge" style="background: #7c3aed;">${sourceIcon} ${escapeHtml(article.source || 'AI News')}</span>
                            <span class="news-date-small">${escapeHtml(article.published || 'Today')}</span>
                        </div>
                        <h4 class="news-title-compact">${escapeHtml(article.title)}</h4>
                        <a href="${escapeHtml(article.url)}" target="_blank" class="news-link-small" style="color: #7c3aed;">
                            Read more <i class="fas fa-arrow-right"></i>
                        </a>
                    `;
                    container.appendChild(item);
                });
                return;
            }
            
            aiNews.forEach(article => {
                const item = document.createElement('div');
                item.className = 'news-item-compact';
                item.style.borderLeftColor = '#7c3aed';
                const sourceIcon = getSourceIcon(article.source);
                item.innerHTML = `
                    <div class="news-item-header">
                        <span class="news-badge" style="background: #7c3aed;">${sourceIcon} ${escapeHtml(article.source || 'AI News')}</span>
                        <span class="news-date-small">${escapeHtml(article.published || 'Today')}</span>
                    </div>
                    <h4 class="news-title-compact">${escapeHtml(article.title)}</h4>
                    <a href="${escapeHtml(article.url)}" target="_blank" class="news-link-small" style="color: #7c3aed;">
                        Read more <i class="fas fa-arrow-right"></i>
                    </a>
                `;
                container.appendChild(item);
            });
        }
    } catch (error) {
        console.error('Error loading AI news:', error);
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
                        <img src="${firm.logo_url}" alt="${escapeHtml(firm.name)}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22><text y=%2250%%25%22 font-size=%2240%22>🏢</text></svg>'">
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

