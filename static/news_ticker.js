// News Ticker - Scrolling news headlines

async function loadNewsTicker() {
    try {
        // Fetch latest news
        const response = await fetch('/api/news');
        const data = await response.json();
        
        if (data.success && data.news && data.news.length > 0) {
            displayNewsTicker(data.news.slice(0, 15)); // Top 15 news
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
        html += `
            <span class="news-ticker-item">
                <span class="ticker-badge ${badge.class}">${badge.text}</span>
                ${article.title}
            </span>
        `;
    });
    
    // Duplicate for seamless loop
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

