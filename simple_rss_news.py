#!/usr/bin/env python3
"""
Simple Real News Scraper - Uses web scraping for real news
Fetches actual news from major financial and tech websites
"""

import requests
import json
import re
from datetime import datetime, timedelta
from typing import List, Dict
import time
from bs4 import BeautifulSoup

class SimpleNewsScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Real news sources with working URLs
        self.news_sources = [
            {
                'name': 'Reuters Business',
                'url': 'https://www.reuters.com/business/',
                'type': 'pe'
            },
            {
                'name': 'BBC Business',
                'url': 'https://www.bbc.com/news/business',
                'type': 'pe'
            },
            {
                'name': 'TechCrunch',
                'url': 'https://techcrunch.com/',
                'type': 'ai'
            },
            {
                'name': 'Wired',
                'url': 'https://www.wired.com/',
                'type': 'ai'
            }
        ]
        
        # Keywords for filtering
        self.pe_keywords = [
            'private equity', 'acquisition', 'merger', 'buyout', 'exit', 'ipo',
            'fundraising', 'investment', 'deal', 'equity', 'capital', 'venture',
            'nordic', 'sweden', 'norway', 'denmark', 'finland', 'europe'
        ]
        
        self.ai_keywords = [
            'artificial intelligence', 'ai', 'machine learning', 'deep learning',
            'neural network', 'llm', 'gpt', 'chatbot', 'automation', 'robotics',
            'startup', 'funding', 'series a', 'series b', 'unicorn', 'tech'
        ]

    def scrape_website(self, source: Dict) -> List[Dict]:
        """Scrape news from a specific website"""
        try:
            print(f"Scraping {source['name']}...")
            
            response = self.session.get(source['url'], timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            articles = []
            
            # Find article links and titles
            if source['name'] == 'Reuters Business':
                articles = self.scrape_reuters(soup)
            elif source['name'] == 'BBC Business':
                articles = self.scrape_bbc(soup)
            elif source['name'] == 'TechCrunch':
                articles = self.scrape_techcrunch(soup)
            elif source['name'] == 'Wired':
                articles = self.scrape_wired(soup)
            
            # Add source info
            for article in articles:
                article['source'] = source['name']
                article['type'] = source['type']
                article['published'] = datetime.now().strftime('%Y-%m-%d')
            
            print(f"Found {len(articles)} articles from {source['name']}")
            return articles
            
        except Exception as e:
            print(f"Error scraping {source['name']}: {e}")
            return []

    def scrape_reuters(self, soup: BeautifulSoup) -> List[Dict]:
        """Scrape Reuters business news"""
        articles = []
        
        # Look for article links
        for link in soup.find_all('a', href=True)[:20]:
            href = link.get('href')
            title = link.get_text(strip=True)
            
            if (href and title and 
                len(title) > 20 and 
                any(keyword in title.lower() for keyword in self.pe_keywords)):
                
                # Make absolute URL
                if href.startswith('/'):
                    href = 'https://www.reuters.com' + href
                
                articles.append({
                    'title': title,
                    'url': href,
                    'description': title[:150] + '...' if len(title) > 150 else title
                })
        
        return articles[:10]  # Limit to 10 articles

    def scrape_bbc(self, soup: BeautifulSoup) -> List[Dict]:
        """Scrape BBC business news"""
        articles = []
        
        # Look for article links
        for link in soup.find_all('a', href=True)[:20]:
            href = link.get('href')
            title = link.get_text(strip=True)
            
            if (href and title and 
                len(title) > 20 and 
                any(keyword in title.lower() for keyword in self.pe_keywords)):
                
                # Make absolute URL
                if href.startswith('/'):
                    href = 'https://www.bbc.com' + href
                
                articles.append({
                    'title': title,
                    'url': href,
                    'description': title[:150] + '...' if len(title) > 150 else title
                })
        
        return articles[:10]

    def scrape_techcrunch(self, soup: BeautifulSoup) -> List[Dict]:
        """Scrape TechCrunch AI/tech news"""
        articles = []
        
        # Look for article links
        for link in soup.find_all('a', href=True)[:20]:
            href = link.get('href')
            title = link.get_text(strip=True)
            
            if (href and title and 
                len(title) > 20 and 
                any(keyword in title.lower() for keyword in self.ai_keywords)):
                
                articles.append({
                    'title': title,
                    'url': href,
                    'description': title[:150] + '...' if len(title) > 150 else title
                })
        
        return articles[:10]

    def scrape_wired(self, soup: BeautifulSoup) -> List[Dict]:
        """Scrape Wired tech news"""
        articles = []
        
        # Look for article links
        for link in soup.find_all('a', href=True)[:20]:
            href = link.get('href')
            title = link.get_text(strip=True)
            
            if (href and title and 
                len(title) > 20 and 
                any(keyword in title.lower() for keyword in self.ai_keywords)):
                
                # Make absolute URL
                if href.startswith('/'):
                    href = 'https://www.wired.com' + href
                
                articles.append({
                    'title': title,
                    'url': href,
                    'description': title[:150] + '...' if len(title) > 150 else title
                })
        
        return articles[:10]

    def scrape_all_news(self) -> Dict:
        """Scrape all news sources"""
        print("🚀 Starting simple news scraping...")
        
        all_articles = []
        
        for source in self.news_sources:
            articles = self.scrape_website(source)
            all_articles.extend(articles)
            time.sleep(2)  # Be respectful to servers
        
        # Filter and categorize
        pe_news = [a for a in all_articles if a.get('type') == 'pe']
        ai_news = [a for a in all_articles if a.get('type') == 'ai']
        
        # Remove duplicates
        pe_news = self.remove_duplicates(pe_news)
        ai_news = self.remove_duplicates(ai_news)
        
        # Combine and limit
        combined_news = (pe_news + ai_news)[:30]
        
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
        """Remove duplicate articles"""
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
    scraper = SimpleNewsScraper()
    
    print("🌐 Simple Real News Scraper")
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
