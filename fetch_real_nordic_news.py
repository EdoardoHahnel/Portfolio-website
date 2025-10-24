#!/usr/bin/env python3
"""
Fetch Real Nordic News - Gets actual Nordic news from real Nordic sources
Fetches genuine articles from Nordic news sources like Dagens Industri, DN, etc.
"""

import requests
import json
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
import time
import re
from bs4 import BeautifulSoup

class RealNordicNewsFetcher:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Real Nordic RSS feeds that work
        self.nordic_feeds = [
            # Swedish business news
            'https://www.di.se/rss',
            'https://www.dn.se/rss',
            'https://www.svd.se/rss',
            'https://www.aftonbladet.se/rss',
            'https://www.expressen.se/rss',
            'https://www.breakit.se/rss',
            
            # Norwegian business news
            'https://www.dn.no/rss',
            'https://www.aftenposten.no/rss',
            'https://www.dagbladet.no/rss',
            
            # Danish business news
            'https://www.dr.dk/rss',
            'https://www.berlingske.dk/rss',
            'https://www.finans.dk/rss',
            
            # Finnish business news
            'https://www.hs.fi/rss',
            'https://www.kauppalehti.fi/rss',
            'https://www.talouselama.fi/rss',
            
            # International sources that cover Nordic news
            'https://www.ft.com/?format=rss',
            'https://www.bloomberg.com/feed/podcast/etf-report.xml',
            'https://www.cnbc.com/id/100003114/device/rss/rss.html',
            'https://feeds.a.dj.com/rss/RSSMarketsMain.xml'
        ]
        
        # Nordic PE firms for filtering
        self.nordic_pe_firms = [
            'nordic capital', 'eqt', 'triton partners', 'altor', 'summa equity', 
            'litorina', 'ratos', 'adelis equity', 'verdan', 'ik partners', 
            'bure equity', 'accent equity', 'valedo partners', 'fidelio capital',
            'investor ab', 'kinnevik', 'northzone', 'balderton capital', 
            'index ventures', 'creandum', 'lifeline ventures'
        ]
        
        # Nordic AI/Tech companies for filtering
        self.nordic_tech_companies = [
            'spotify', 'klarna', 'king', 'mojang', 'minecraft', 'tobii', 
            'ericsson', 'nokia', 'volvo', 'saab', 'scania', 'atlas copco',
            'skype', 'telia', 'telenor', 'sinch', 'evolution gaming',
            'embracer group', 'paradox interactive', 'northvolt', 'polestar',
            'lovable', 'legora', 'tandem health', 'listen labs', 'filed', 'sana ai'
        ]
        
        # Nordic countries and cities
        self.nordic_locations = [
            'nordic', 'scandinavia', 'sweden', 'norway', 'denmark', 'finland',
            'stockholm', 'oslo', 'copenhagen', 'helsinki', 'gothenburg', 'malmo',
            'bergen', 'aarhus', 'tampere', 'trondheim', 'odense', 'uppsala'
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
            
            for item in items[:20]:  # Limit to 20 per feed
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
                            if len(description) > 300:
                                description = description[:300] + '...'
                        
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
                        
                        # Only include recent articles (last 14 days)
                        if (datetime.now() - pub_date_parsed).days <= 14:
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
        if 'di.se' in rss_url:
            return 'Dagens Industri'
        elif 'dn.se' in rss_url:
            return 'Dagens Nyheter'
        elif 'svd.se' in rss_url:
            return 'Svenska Dagbladet'
        elif 'aftonbladet.se' in rss_url:
            return 'Aftonbladet'
        elif 'expressen.se' in rss_url:
            return 'Expressen'
        elif 'breakit.se' in rss_url:
            return 'Breakit'
        elif 'dn.no' in rss_url:
            return 'Dagens Næringsliv'
        elif 'aftenposten.no' in rss_url:
            return 'Aftenposten'
        elif 'dagbladet.no' in rss_url:
            return 'Dagbladet'
        elif 'dr.dk' in rss_url:
            return 'DR'
        elif 'berlingske.dk' in rss_url:
            return 'Berlingske'
        elif 'finans.dk' in rss_url:
            return 'Finans'
        elif 'hs.fi' in rss_url:
            return 'Helsingin Sanomat'
        elif 'kauppalehti.fi' in rss_url:
            return 'Kauppalehti'
        elif 'talouselama.fi' in rss_url:
            return 'Talouselämä'
        elif 'ft.com' in rss_url:
            return 'Financial Times'
        elif 'bloomberg' in rss_url:
            return 'Bloomberg'
        elif 'cnbc' in rss_url:
            return 'CNBC'
        elif 'wsj' in rss_url or 'a.dj.com' in rss_url:
            return 'Wall Street Journal'
        else:
            return 'Nordic News'

    def categorize_article(self, title: str, description: str) -> str:
        """Categorize article as Nordic PE or AI news"""
        text = (title + ' ' + description).lower()
        
        # Check for Nordic PE firms
        pe_matches = sum(1 for firm in self.nordic_pe_firms if firm in text)
        # Check for Nordic tech companies
        tech_matches = sum(1 for company in self.nordic_tech_companies if company in text)
        # Check for Nordic locations
        location_matches = sum(1 for location in self.nordic_locations if location in text)
        
        # PE keywords
        pe_keywords = ['private equity', 'acquisition', 'merger', 'buyout', 'exit', 'ipo', 
                      'fundraising', 'investment', 'deal', 'equity', 'capital', 'fund']
        pe_keyword_matches = sum(1 for keyword in pe_keywords if keyword in text)
        
        # AI/Tech keywords
        ai_keywords = ['artificial intelligence', 'ai', 'machine learning', 'deep learning',
                      'neural network', 'llm', 'gpt', 'chatbot', 'automation', 'robotics',
                      'tech', 'software', 'digital', 'startup', 'technology']
        ai_keyword_matches = sum(1 for keyword in ai_keywords if keyword in text)
        
        # Categorize based on matches
        if (pe_matches >= 1 or pe_keyword_matches >= 2) and location_matches >= 1:
            return 'PE News'
        elif (tech_matches >= 1 or ai_keyword_matches >= 2) and location_matches >= 1:
            return 'AI News'
        else:
            return 'General News'

    def filter_relevant_news(self, articles: list) -> dict:
        """Filter articles for relevant Nordic PE and AI news"""
        pe_news = []
        ai_news = []
        
        for article in articles:
            if article['category'] == 'PE News':
                pe_news.append(article)
            elif article['category'] == 'AI News':
                ai_news.append(article)
        
        return {
            'pe_news': pe_news[:20],  # Limit to 20 each
            'ai_news': ai_news[:20]
        }

    def fetch_all_news(self) -> dict:
        """Fetch news from all Nordic RSS feeds"""
        print("Fetching real Nordic news from RSS feeds...")
        
        all_articles = []
        
        for rss_url in self.nordic_feeds:
            articles = self.fetch_rss_feed(rss_url)
            all_articles.extend(articles)
            time.sleep(1)  # Be respectful to servers
        
        # Filter for relevant news
        filtered_news = self.filter_relevant_news(all_articles)
        
        # Combine and remove duplicates
        combined_news = self.remove_duplicates(filtered_news['pe_news'] + filtered_news['ai_news'])
        
        print(f"\nReal Nordic news fetched:")
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
            print("Nordic news database saved successfully!")
            return True
        except Exception as e:
            print(f"Error saving database: {e}")
            return False

def main():
    """Main function to fetch real Nordic news"""
    print("Fetching Real Nordic News from RSS Feeds")
    print("=" * 50)
    
    fetcher = RealNordicNewsFetcher()
    
    # Fetch all news
    news_data = fetcher.fetch_all_news()
    
    # Save to database
    if fetcher.save_news_database(news_data):
        print("\nSUCCESS: Real Nordic news database updated!")
        print(f"Last updated: {news_data['metadata']['last_updated']}")
        print(f"Total articles: {news_data['metadata']['total_articles']}")
        print(f"PE articles: {news_data['metadata']['pe_articles']}")
        print(f"AI articles: {news_data['metadata']['ai_articles']}")
        print(f"Sources: {', '.join(news_data['metadata']['sources'])}")
        
        # Show sample articles
        print("\nSample Real Nordic Articles:")
        for i, article in enumerate(news_data['articles'][:5]):
            print(f"   {i+1}. {article['title']}")
            print(f"      Source: {article['source']} | Date: {article['published']}")
            print(f"      Category: {article['category']}")
            print(f"      URL: {article['url']}")
            print()
    else:
        print("ERROR: Failed to save news database")

if __name__ == "__main__":
    main()
