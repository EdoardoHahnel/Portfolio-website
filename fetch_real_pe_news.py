#!/usr/bin/env python3
"""
Fetch real Nordic PE news from Cision RSS feeds
"""

import requests
import json
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
import time
import re

def fetch_cision_rss(url, firm_name):
    """Fetch RSS feed from Cision and parse news items"""
    try:
        print(f"Fetching RSS for {firm_name}...")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, timeout=15, headers=headers)
        response.raise_for_status()
        
        # Parse XML
        root = ET.fromstring(response.content)
        
        news_items = []
        
        # Handle different RSS formats
        items = root.findall('.//item')
        if not items:
            items = root.findall('.//entry')  # Atom format
        
        for item in items[:15]:  # Limit to 15 most recent
            try:
                # Extract title
                title_elem = item.find('title')
                if title_elem is None:
                    title_elem = item.find('.//title')
                title = title_elem.text.strip() if title_elem is not None and title_elem.text else "No title"
                
                # Extract description
                desc_elem = item.find('description')
                if desc_elem is None:
                    desc_elem = item.find('.//summary')
                if desc_elem is None:
                    desc_elem = item.find('.//content')
                description = desc_elem.text.strip() if desc_elem is not None and desc_elem.text else ""
                
                # Extract link
                link_elem = item.find('link')
                if link_elem is None:
                    link_elem = item.find('.//link')
                link = link_elem.text.strip() if link_elem is not None and link_elem.text else url
                
                # Extract date
                date_elem = item.find('pubDate')
                if date_elem is None:
                    date_elem = item.find('.//published')
                if date_elem is None:
                    date_elem = item.find('.//updated')
                
                pub_date = date_elem.text.strip() if date_elem is not None and date_elem.text else datetime.now().strftime('%Y-%m-%d')
                
                # Clean up date
                try:
                    # Parse various date formats
                    if 'T' in pub_date:
                        pub_date = pub_date.split('T')[0]
                    elif ',' in pub_date:
                        # Handle "Wed, 19 Dec 2024 10:30:00 CET" format
                        pub_date = pub_date.split(',')[1].strip().split(' ')[:3]
                        pub_date = ' '.join(pub_date)
                        pub_date = datetime.strptime(pub_date, '%d %b %Y').strftime('%Y-%m-%d')
                except:
                    pub_date = datetime.now().strftime('%Y-%m-%d')
                
                # Only include recent news (last 2 years)
                try:
                    news_date = datetime.strptime(pub_date, '%Y-%m-%d')
                    if news_date < datetime.now() - timedelta(days=730):
                        continue
                except:
                    pass
                
                # Clean title and description
                title = re.sub(r'\s+', ' ', title).strip()
                description = re.sub(r'\s+', ' ', description).strip()
                
                # Truncate if too long
                if len(title) > 80:
                    title = title[:77] + "..."
                if len(description) > 200:
                    description = description[:197] + "..."
                
                news_item = {
                    "title": title,
                    "description": description,
                    "link": link,
                    "date": pub_date,
                    "firm": firm_name,
                    "source": "Cision"
                }
                
                news_items.append(news_item)
                
            except Exception as e:
                print(f"Error parsing item for {firm_name}: {e}")
                continue
        
        print(f"Found {len(news_items)} news items for {firm_name}")
        return news_items
        
    except Exception as e:
        print(f"Error fetching RSS for {firm_name}: {e}")
        return []

def main():
    """Main function to fetch all Nordic PE news"""
    
    # Nordic PE firms and their Cision RSS URLs
    pe_firms = {
        "EQT": "https://news.cision.com/se/EQT",
        "Nordic Capital": "https://news.cision.com/se/nordic-capital", 
        "Adelis Equity Partners": "https://news.cision.com/se/adelis-equity-partners",
        "Summa Equity": "https://news.cision.com/se/summa-equity",
        "Ratos AB": "https://news.cision.com/se/ratos-ab",
        "Verdane": "https://news.cision.com/se/verdane-intressenter",
        "Altor": "https://news.cision.com/se/altor",
        "IK Partners": "https://news.cision.com/se/ik-partners",
        "Litorina": "https://news.cision.com/se/?q=litorina",
        "Triton Partners": "https://news.cision.com/se/?q=triton",
        "Axcel": "https://news.cision.com/se/?q=axcel",
        "CapMan": "https://news.cision.com/se/?q=capman",
        "FSN Capital": "https://news.cision.com/se/?q=fsn+capital",
        "Valedo Partners": "https://news.cision.com/se/?q=valedo+partners",
        "Segulah": "https://news.cision.com/se/?q=segulah",
        "Procuritas": "https://news.cision.com/se/?q=procuritas"
    }
    
    all_news = []
    
    print("Fetching real Nordic PE news from Cision RSS feeds...")
    print("=" * 60)
    
    for firm_name, rss_url in pe_firms.items():
        news_items = fetch_cision_rss(rss_url, firm_name)
        all_news.extend(news_items)
        time.sleep(1)  # Be respectful to the server
    
    # Sort by date (newest first)
    all_news.sort(key=lambda x: x['date'], reverse=True)
    
    # Limit to 100 most recent news items
    all_news = all_news[:100]
    
    # Create the database structure
    news_database = {
        "news": all_news,
        "total_news": len(all_news),
        "last_updated": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
        "description": "Real Nordic PE news from Cision RSS feeds",
        "source": "Cision RSS feeds",
        "firms_covered": list(pe_firms.keys())
    }
    
    # Save to file
    with open('pe_news_database.json', 'w', encoding='utf-8') as f:
        json.dump(news_database, f, indent=2, ensure_ascii=False)
    
    print("=" * 60)
    print(f"✅ Successfully fetched {len(all_news)} real Nordic PE news items")
    print(f"📁 Saved to: pe_news_database.json")
    print(f"🏢 Firms covered: {len(pe_firms)}")
    
    # Show sample news
    print("\n📰 Sample news items:")
    for i, item in enumerate(all_news[:5]):
        print(f"{i+1}. {item['firm']} - {item['title']} ({item['date']})")
    
    return news_database

if __name__ == "__main__":
    main()

