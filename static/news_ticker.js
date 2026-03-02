// News Ticker - Scrolling news headlines (latest first)

async function loadNewsTicker() {
    try {
        const response = await fetch('/api/investment-news');
        const data = await response.json();
        
        if (data.success && data.news && data.news.length > 0) {
            // Sort by date descending: latest first, oldest last
            const sorted = [...data.news].sort((a, b) => {
                const dateA = new Date(a.date || '2000-01-01');
                const dateB = new Date(b.date || '2000-01-01');
                return dateB - dateA;
            });
            displayNewsTicker(sorted.slice(0, 15));
        }
    } catch (error) {
        console.error('Error loading news ticker:', error);
    }
}

function displayNewsTicker(articles) {
    const ticker = document.getElementById('newsTicker');
    if (!ticker) return;
    
    let html = '';
    
    articles.forEach(article => {
        const badge = getBadgeType(article);
        const link = article.link || '#';
        const escapedTitle = (article.title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html += `
            <a href="${link}" target="_blank" rel="noopener" class="news-ticker-item" title="${escapedTitle}">
                <span class="ticker-badge ${badge.class}">${badge.text}</span>
                ${escapedTitle}
            </a>
        `;
    });
    
    ticker.innerHTML = html + html;
}

function getBadgeType(article) {
    const title = article.title.toLowerCase();
    
    if (title.includes('acquires') || title.includes('acquisition') || title.includes('buys') || title.includes('merger')) {
        return { text: 'M&A', class: 'exit' };
    } else if (title.includes('raises') || title.includes('funding') || title.includes('investment') || title.includes('invests')) {
        return { text: 'FUNDING', class: 'funding' };
    } else if (title.includes('ipo') || title.includes('exit') || title.includes('sells')) {
        return { text: 'EXIT', class: 'exit' };
    } else {
        return { text: 'NEWS', class: 'news' };
    }
}

// Load ticker on page load
document.addEventListener('DOMContentLoaded', loadNewsTicker);

