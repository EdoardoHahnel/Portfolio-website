#!/usr/bin/env python3
"""
Real News Scraper - Fetches actual news from RSS feeds
Supports PE/M&A news and AI/tech news with working links
"""

import requests
import json
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import time
import random
from bs4 import BeautifulSoup

class RealNewsScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Real RSS feeds for PE/M&A news
        self.pe_rss_feeds = [
            'https://feeds.reuters.com/reuters/businessNews',
            'https://feeds.bbci.co.uk/news/business/rss.xml',
            'https://rss.cnn.com/rss/money_latest.rss',
            'https://feeds.bloomberg.com/markets/news.rss',
            'https://feeds.finance.yahoo.com/rss/2.0/headline',
        ]
        
        # Real RSS feeds for AI/Tech news
        self.ai_rss_feeds = [
            'https://feeds.feedburner.com/oreilly/radar',
            'https://techcrunch.com/feed/',
            'https://feeds.feedburner.com/venturebeat/SZYF',
            'https://www.wired.com/feed/rss',
            'https://feeds.arstechnica.com/arstechnica/index/',
        ]
        
        # Keywords for filtering
        self.pe_keywords = [
            'private equity', 'pe', 'acquisition', 'merger', 'buyout', 'exit', 'ipo',
            'fundraising', 'investment', 'deal', 'equity', 'capital', 'venture',
            'nordic', 'sweden', 'norway', 'denmark', 'finland', 'europe'
        ]
        
        self.ai_keywords = [
            'artificial intelligence', 'ai', 'machine learning', 'deep learning',
            'neural network', 'llm', 'gpt', 'chatbot', 'automation', 'robotics',
            'startup', 'funding', 'series a', 'series b', 'unicorn', 'tech'
        ]

    def fetch_rss_news(self, rss_url: str, max_articles: int = 20) -> List[Dict]:
        """Fetch news from RSS feed using XML parsing"""
        try:
            print(f"Fetching from: {rss_url}")
            
            # Fetch RSS content
            response = self.session.get(rss_url, timeout=10)
            response.raise_for_status()
            
            # Parse XML
            root = ET.fromstring(response.content)
            
            articles = []
            items = root.findall('.//item')[:max_articles]
            
            for item in items:
                # Extract article data
                title_elem = item.find('title')
                description_elem = item.find('description')
                link_elem = item.find('link')
                pub_date_elem = item.find('pubDate')
                
                title = title_elem.text if title_elem is not None else ''
                description = description_elem.text if description_elem is not None else ''
                link = link_elem.text if link_elem is not None else ''
                published = pub_date_elem.text if pub_date_elem is not None else ''
                
                # Parse date
                try:
                    if published:
                        # Try different date formats
                        for fmt in ['%a, %d %b %Y %H:%M:%S %Z', '%a, %d %b %Y %H:%M:%S', '%Y-%m-%d']:
                            try:
                                pub_date = datetime.strptime(published, fmt)
                                break
                            except:
                                continue
                        else:
                            pub_date = datetime.now()
                    else:
                        pub_date = datetime.now()
                except:
                    pub_date = datetime.now()
                
                # Only include recent articles (last 30 days)
                if (datetime.now() - pub_date).days <= 30:
                    articles.append({
                        'title': title,
                        'description': self.clean_description(description),
                        'url': link,
                        'published': pub_date.strftime('%Y-%m-%d'),
                        'source': self.extract_source(rss_url),
                        'category': self.categorize_article(title, description)
                    })
            
            print(f"Found {len(articles)} recent articles")
            return articles
            
        except Exception as e:
            print(f"Error fetching RSS from {rss_url}: {e}")
            return []

    def clean_description(self, description: str) -> str:
        """Clean HTML from description"""
        if not description:
            return ""
        
        # Remove HTML tags
        clean = re.sub(r'<[^>]+>', '', description)
        # Remove extra whitespace
        clean = re.sub(r'\s+', ' ', clean).strip()
        # Limit length
        if len(clean) > 200:
            clean = clean[:200] + "..."
        
        return clean

    def extract_source(self, rss_url: str) -> str:
        """Extract source name from RSS URL"""
        if 'reuters' in rss_url:
            return 'Reuters'
        elif 'bbc' in rss_url:
            return 'BBC News'
        elif 'cnn' in rss_url:
            return 'CNN Business'
        elif 'bloomberg' in rss_url:
            return 'Bloomberg'
        elif 'yahoo' in rss_url:
            return 'Yahoo Finance'
        elif 'techcrunch' in rss_url:
            return 'TechCrunch'
        elif 'wired' in rss_url:
            return 'Wired'
        elif 'arstechnica' in rss_url:
            return 'Ars Technica'
        else:
            return 'News Source'

    def categorize_article(self, title: str, description: str) -> str:
        """Categorize article based on content"""
        text = (title + ' ' + description).lower()
        
        if any(keyword in text for keyword in self.pe_keywords):
            return 'PE News'
        elif any(keyword in text for keyword in self.ai_keywords):
            return 'AI News'
        else:
            return 'General News'

    def filter_pe_news(self, articles: List[Dict]) -> List[Dict]:
        """Filter articles for PE/M&A relevance"""
        pe_articles = []
        
        for article in articles:
            text = (article['title'] + ' ' + article['description']).lower()
            
            # Must contain PE-related keywords
            if any(keyword in text for keyword in self.pe_keywords):
                # Exclude AI-specific content
                if not any(ai_word in text for ai_word in ['artificial intelligence', 'machine learning', 'ai startup']):
                    pe_articles.append(article)
        
        return pe_articles

    def filter_ai_news(self, articles: List[Dict]) -> List[Dict]:
        """Filter articles for AI/Tech relevance"""
        ai_articles = []
        
        for article in articles:
            text = (article['title'] + ' ' + article['description']).lower()
            
            # Must contain AI/Tech keywords
            if any(keyword in text for keyword in self.ai_keywords):
                ai_articles.append(article)
        
        return ai_articles

    def scrape_all_news(self) -> Dict:
        """Scrape all news sources and return categorized results"""
        print("🚀 Starting real news scraping...")
        
        all_articles = []
        
        # Fetch from PE news sources
        print("\n📈 Fetching PE/M&A news...")
        for rss_url in self.pe_rss_feeds:
            articles = self.fetch_rss_news(rss_url, 15)
            all_articles.extend(articles)
            time.sleep(1)  # Be respectful to servers
        
        # Fetch from AI news sources
        print("\n🤖 Fetching AI/Tech news...")
        for rss_url in self.ai_rss_feeds:
            articles = self.fetch_rss_news(rss_url, 15)
            all_articles.extend(articles)
            time.sleep(1)
        
        # Filter and categorize
        pe_news = self.filter_pe_news(all_articles)
        ai_news = self.filter_ai_news(all_articles)
        
        # Remove duplicates based on title
        pe_news = self.remove_duplicates(pe_news)
        ai_news = self.remove_duplicates(ai_news)
        
        # Combine and limit
        combined_news = (pe_news + ai_news)[:50]
        
        print(f"\n✅ Scraping complete!")
        print(f"📊 Found {len(pe_news)} PE articles")
        print(f"🤖 Found {len(ai_news)} AI articles")
        print(f"📰 Total: {len(combined_news)} articles")
        
        return {
            'metadata': {
                'last_updated': datetime.now().strftime('%Y-%m-%d'),
                'total_articles': len(combined_news),
                'pe_articles': len(pe_news),
                'ai_articles': len(ai_news),
                'sources': list(set([article['source'] for article in combined_news]))
            },
            'articles': combined_news
        }

    def remove_duplicates(self, articles: List[Dict]) -> List[Dict]:
        """Remove duplicate articles based on title similarity"""
        seen_titles = set()
        unique_articles = []
        
        for article in articles:
            title_lower = article['title'].lower()
            if title_lower not in seen_titles:
                seen_titles.add(title_lower)
                unique_articles.append(article)
        
        return unique_articles

    def save_to_database(self, news_data: Dict, filename: str = 'ma_news_database.json'):
        """Save news data to JSON database"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(news_data, f, indent=2, ensure_ascii=False)
            print(f"💾 News saved to {filename}")
            return True
        except Exception as e:
            print(f"❌ Error saving news: {e}")
            return False

def main():
    """Main function to run news scraping"""
    scraper = RealNewsScraper()
    
    print("🌐 Real News Scraper")
    print("=" * 50)
    
    # Scrape all news
    news_data = scraper.scrape_all_news()
    
    # Save to database
    if scraper.save_to_database(news_data):
        print("\n🎉 News update completed successfully!")
        print(f"📅 Last updated: {news_data['metadata']['last_updated']}")
        print(f"📰 Total articles: {news_data['metadata']['total_articles']}")
    else:
        print("\n❌ Failed to save news data")

if __name__ == "__main__":
    main()
