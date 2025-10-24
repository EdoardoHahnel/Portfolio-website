#!/usr/bin/env python3
"""
Fetch Real News - Gets actual news from real sources
Fetches genuine articles from Reuters, Bloomberg, BBC, TechCrunch, etc.
"""

import requests
import json
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
import time
import re
from bs4 import BeautifulSoup

class RealNewsFetcher:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Real RSS feeds for business/finance news
        self.business_feeds = [
            'https://www.bloomberg.com/feed/podcast/etf-report.xml',
            'https://www.forbes.com/business/feed/',
            'https://www.cnbc.com/id/100003114/device/rss/rss.html',
            'https://www.ft.com/?format=rss',
            'https://www.economist.com/latest/rss.xml',
            'https://hbr.org/feed',
            'https://www.marketwatch.com/rss/topstories',
            'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
            'https://www.businessinsider.com/rss',
            'https://www.investopedia.com/feedbuilder/feed/getfeed/?feedName=rss_articles',
            # Nordic business news
            'https://www.di.se/rss',
            'https://www.svd.se/rss',
            'https://www.dn.se/rss',
            'https://www.aftonbladet.se/rss',
            'https://www.expressen.se/rss'
        ]
        
        # Real RSS feeds for tech/AI news
        self.tech_feeds = [
            'http://feeds.feedburner.com/TechCrunch/',
            'https://www.wired.com/feed/rss',
            'https://www.theverge.com/rss/index.xml',
            'http://feeds.arstechnica.com/arstechnica/index/',
            'http://feeds.mashable.com/Mashable',
            'https://news.ycombinator.com/rss',
            'https://www.producthunt.com/feed',
            'https://www.engadget.com/rss.xml',
            'https://venturebeat.com/feed/',
            'https://gizmodo.com/rss',
            # Nordic tech news
            'https://www.breakit.se/rss',
            'https://www.di.se/rss',
            'https://www.svd.se/rss',
            'https://www.dn.se/rss'
        ]
        
        # Combine all feeds
        self.rss_feeds = self.business_feeds + self.tech_feeds
        
        # Keywords for filtering relevant news - NORDIC FOCUSED
        self.pe_keywords = [
            # Nordic PE Firms
            'nordic capital', 'eqt', 'triton partners', 'altor', 'summa equity', 'litorina',
            'ratos', 'adelis equity', 'verdan', 'ik partners', 'bure equity', 'accent equity',
            'valedo partners', 'fidelio capital', 'investor ab', 'kinnevik', 'northzone',
            'balderton capital', 'index ventures', 'creandum', 'lifeline ventures',
            
            # Nordic countries and regions
            'nordic', 'scandinavia', 'sweden', 'norway', 'denmark', 'finland', 'stockholm',
            'oslo', 'copenhagen', 'helsinki', 'gothenburg', 'malmo', 'bergen', 'aarhus',
            
            # PE/Investment terms
            'private equity', 'pe firm', 'acquisition', 'merger', 'buyout', 'exit', 'ipo',
            'fundraising', 'investment fund', 'equity fund', 'capital fund', 'venture capital',
            'fund manager', 'portfolio company', 'investment firm', 'asset management',
            'wealth management', 'hedge fund', 'lbo', 'takeover', 'divestiture',
            'investment banking', 'm&a', 'deal value', 'transaction value'
        ]
        
        self.ai_keywords = [
            # Nordic AI/Tech Companies
            'spotify', 'klarna', 'king', 'mojang', 'minecraft', 'roblox', 'roblox sweden',
            'tobii', 'ericsson', 'nokia', 'volvo', 'saab', 'scania', 'atlas copco',
            'skype', 'skype sweden', 'telia', 'telenor', 'telia company', 'telenor group',
            'sinch', 'sinch sweden', 'evolution gaming', 'evolution gaming sweden',
            'embracer group', 'embracer', 'paradox interactive', 'paradox sweden',
            'king digital', 'king sweden', 'candy crush', 'candy crush sweden',
            'lovable', 'legora', 'tandem health', 'listen labs', 'filed', 'sana ai',
            'northvolt', 'northvolt sweden', 'polestar', 'polestar sweden',
            'klarna sweden', 'spotify sweden', 'king sweden', 'mojang sweden',
            
            # Nordic AI/Tech terms
            'nordic ai', 'swedish ai', 'norwegian ai', 'danish ai', 'finnish ai',
            'nordic tech', 'swedish tech', 'norwegian tech', 'danish tech', 'finnish tech',
            'nordic startup', 'swedish startup', 'norwegian startup', 'danish startup', 'finnish startup',
            'nordic innovation', 'swedish innovation', 'norwegian innovation', 'danish innovation', 'finnish innovation',
            
            # General AI/Tech terms
            'artificial intelligence', 'machine learning', 'deep learning', 'neural network',
            'llm', 'gpt', 'chatbot', 'automation', 'robotics', 'algorithm',
            'data science', 'big data', 'cloud computing', 'saas', 'fintech',
            'ai startup', 'ai company', 'ai platform', 'ai technology', 'ai solution'
        ]

    def fetch_rss_feed(self, rss_url: str) -> list:
        """Fetch articles from a single RSS feed"""
        try:
            print(f"Fetching from: {rss_url}")
            
            response = self.session.get(rss_url, timeout=15)
            response.raise_for_status()
            
            # Parse RSS XML
            root = ET.fromstring(response.content)
            articles = []
            
            # Find all items
            items = root.findall('.//item')
            
            for item in items[:15]:  # Limit to 15 per feed
                try:
                    # Extract article data
                    title_elem = item.find('title')
                    description_elem = item.find('description')
                    link_elem = item.find('link')
                    pub_date_elem = item.find('pubDate')
                    
                    if title_elem is not None and link_elem is not None:
                        title = title_elem.text.strip() if title_elem.text else ''
                        link = link_elem.text.strip() if link_elem.text else ''
                        description = description_elem.text.strip() if description_elem is not None and description_elem.text else ''
                        pub_date = pub_date_elem.text.strip() if pub_date_elem is not None and pub_date_elem.text else ''
                        
                        # Clean description
                        if description:
                            # Remove HTML tags
                            soup = BeautifulSoup(description, 'html.parser')
                            description = soup.get_text()
                            # Limit length
                            if len(description) > 200:
                                description = description[:200] + '...'
                        
                        # Parse date
                        try:
                            if pub_date:
                                # Try different date formats
                                for fmt in ['%a, %d %b %Y %H:%M:%S %Z', '%a, %d %b %Y %H:%M:%S', '%Y-%m-%d', '%d %b %Y']:
                                    try:
                                        pub_date_parsed = datetime.strptime(pub_date, fmt)
                                        break
                                    except:
                                        continue
                                else:
                                    pub_date_parsed = datetime.now()
                            else:
                                pub_date_parsed = datetime.now()
                        except:
                            pub_date_parsed = datetime.now()
                        
                        # Only include recent articles (last 7 days)
                        if (datetime.now() - pub_date_parsed).days <= 7:
                            articles.append({
                                'title': title,
                                'description': description,
                                'url': link,
                                'published': pub_date_parsed.strftime('%Y-%m-%d'),
                                'source': self.get_source_name(rss_url),
                                'category': self.categorize_article(title, description)
                            })
                
                except Exception as e:
                    print(f"Error parsing item: {e}")
                    continue
            
            print(f"Found {len(articles)} recent articles from {self.get_source_name(rss_url)}")
            return articles
            
        except Exception as e:
            print(f"Error fetching {rss_url}: {e}")
            return []

    def get_source_name(self, rss_url: str) -> str:
        """Get source name from RSS URL"""
        if 'bloomberg' in rss_url:
            return 'Bloomberg'
        elif 'forbes' in rss_url:
            return 'Forbes'
        elif 'cnbc' in rss_url:
            return 'CNBC'
        elif 'ft.com' in rss_url:
            return 'Financial Times'
        elif 'economist' in rss_url:
            return 'The Economist'
        elif 'hbr.org' in rss_url:
            return 'Harvard Business Review'
        elif 'marketwatch' in rss_url:
            return 'MarketWatch'
        elif 'wsj' in rss_url or 'a.dj.com' in rss_url:
            return 'Wall Street Journal'
        elif 'businessinsider' in rss_url:
            return 'Business Insider'
        elif 'investopedia' in rss_url:
            return 'Investopedia'
        elif 'techcrunch' in rss_url:
            return 'TechCrunch'
        elif 'wired' in rss_url:
            return 'Wired'
        elif 'theverge' in rss_url:
            return 'The Verge'
        elif 'arstechnica' in rss_url:
            return 'Ars Technica'
        elif 'mashable' in rss_url:
            return 'Mashable'
        elif 'ycombinator' in rss_url:
            return 'Hacker News'
        elif 'producthunt' in rss_url:
            return 'Product Hunt'
        elif 'engadget' in rss_url:
            return 'Engadget'
        elif 'venturebeat' in rss_url:
            return 'VentureBeat'
        elif 'gizmodo' in rss_url:
            return 'Gizmodo'
        elif 'di.se' in rss_url:
            return 'Dagens Industri'
        elif 'svd.se' in rss_url:
            return 'Svenska Dagbladet'
        elif 'dn.se' in rss_url:
            return 'Dagens Nyheter'
        elif 'aftonbladet.se' in rss_url:
            return 'Aftonbladet'
        elif 'expressen.se' in rss_url:
            return 'Expressen'
        elif 'breakit.se' in rss_url:
            return 'Breakit'
        else:
            return 'News Source'

    def categorize_article(self, title: str, description: str) -> str:
        """Categorize article as PE or AI news - STRICT FILTERING"""
        text = (title + ' ' + description).lower()
        
        # Count keyword matches for more accurate categorization
        pe_matches = sum(1 for keyword in self.pe_keywords if keyword in text)
        ai_matches = sum(1 for keyword in self.ai_keywords if keyword in text)
        
        # Require at least 1 strong keyword match for PE news
        if pe_matches >= 1:
            return 'PE News'
        # Require at least 1 strong keyword match for AI news  
        elif ai_matches >= 1:
            return 'AI News'
        else:
            return 'General News'

    def filter_relevant_news(self, articles: list) -> dict:
        """Filter articles for relevant PE and AI news - STRICT FILTERING"""
        pe_news = []
        ai_news = []
        
        for article in articles:
            text = (article['title'] + ' ' + article['description']).lower()
            
            # Count keyword matches for more accurate filtering
            pe_matches = sum(1 for keyword in self.pe_keywords if keyword in text)
            ai_matches = sum(1 for keyword in self.ai_keywords if keyword in text)
            
            # Only include if it has PE focus (1+ keywords)
            if pe_matches >= 1:
                pe_news.append(article)
            # Only include if it has AI focus (1+ keywords)
            elif ai_matches >= 1:
                ai_news.append(article)
        
        return {
            'pe_news': pe_news[:15],  # Limit to 15 each for quality
            'ai_news': ai_news[:15]
        }

    def fetch_all_news(self) -> dict:
        """Fetch news from all RSS feeds"""
        print("Fetching real news from RSS feeds...")
        
        all_articles = []
        
        for rss_url in self.rss_feeds:
            articles = self.fetch_rss_feed(rss_url)
            all_articles.extend(articles)
            time.sleep(2)  # Be respectful to servers
        
        # Filter for relevant news
        filtered_news = self.filter_relevant_news(all_articles)
        
        # Combine and remove duplicates
        combined_news = self.remove_duplicates(filtered_news['pe_news'] + filtered_news['ai_news'])
        
        print(f"\nReal news fetched:")
        print(f"PE articles: {len(filtered_news['pe_news'])}")
        print(f"AI articles: {len(filtered_news['ai_news'])}")
        print(f"Total: {len(combined_news)}")
        
        return {
            'metadata': {
                'last_updated': datetime.now().strftime('%Y-%m-%d'),
                'total_articles': len(combined_news),
                'pe_articles': len(filtered_news['pe_news']),
                'ai_articles': len(filtered_news['ai_news']),
                'sources': list(set([article['source'] for article in combined_news]))
            },
            'articles': combined_news
        }

    def remove_duplicates(self, articles: list) -> list:
        """Remove duplicate articles based on title similarity"""
        seen_titles = set()
        unique_articles = []
        
        for article in articles:
            title_lower = article['title'].lower()
            if title_lower not in seen_titles:
                seen_titles.add(title_lower)
                unique_articles.append(article)
        
        return unique_articles

    def save_news_database(self, news_data: dict) -> bool:
        """Save news data to database"""
        try:
            with open('ma_news_database.json', 'w', encoding='utf-8') as f:
                json.dump(news_data, f, indent=2, ensure_ascii=False)
            print("News database saved successfully!")
            return True
        except Exception as e:
            print(f"Error saving database: {e}")
            return False

def main():
    """Main function to fetch real news"""
    print("Fetching Real News from RSS Feeds")
    print("=" * 50)
    
    fetcher = RealNewsFetcher()
    
    # Fetch all news
    news_data = fetcher.fetch_all_news()
    
    # Save to database
    if fetcher.save_news_database(news_data):
        print("\nSUCCESS: Real news database updated!")
        print(f"Last updated: {news_data['metadata']['last_updated']}")
        print(f"Total articles: {news_data['metadata']['total_articles']}")
        print(f"PE articles: {news_data['metadata']['pe_articles']}")
        print(f"AI articles: {news_data['metadata']['ai_articles']}")
        print(f"Sources: {', '.join(news_data['metadata']['sources'])}")
        
        # Show sample articles
        print("\nSample Real Articles:")
        for i, article in enumerate(news_data['articles'][:5]):
            print(f"   {i+1}. {article['title']}")
            print(f"      Source: {article['source']} | Date: {article['published']}")
            print(f"      URL: {article['url']}")
            print()
    else:
        print("ERROR: Failed to save news database")

if __name__ == "__main__":
    main()
