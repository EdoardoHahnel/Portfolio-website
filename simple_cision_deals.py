#!/usr/bin/env python3
"""
Simple script to fetch Nordic PE deals from Cision RSS feeds
"""

import requests
import json
import xml.etree.ElementTree as ET
from datetime import datetime
import re

def fetch_rss_feed(url):
    """Fetch and parse RSS feed"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return ET.fromstring(response.content)
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def is_deal_related(title, description):
    """Check if the news item is about a deal/transaction"""
    deal_keywords = [
        'förvärv', 'acquisition', 'acquires', 'acquired',
        'avyttring', 'divestment', 'sells', 'sold',
        'investering', 'investment', 'invests', 'invested',
        'partnership', 'partnerskap', 'partner',
        'köper', 'buys', 'bought',
        'säljer', 'sells', 'sold',
        'merger', 'fusion', 'sammanslagning',
        'takeover', 'uppköp',
        'exit', 'utträde',
        'fundraising', 'kapitalanskaffning',
        'fund', 'fond'
    ]
    
    text = (title + " " + description).lower()
    return any(keyword in text for keyword in deal_keywords)

def extract_deal_info(item):
    """Extract deal information from RSS item"""
    try:
        title = item.find('title').text if item.find('title') is not None else ""
        description = item.find('description').text if item.find('description') is not None else ""
        link = item.find('link').text if item.find('link') is not None else ""
        pub_date = item.find('pubDate').text if item.find('pubDate') is not None else ""
        
        # Parse date
        try:
            from dateutil import parser
            parsed_date = parser.parse(pub_date)
            date_str = parsed_date.strftime('%Y-%m-%d')
        except:
            date_str = datetime.now().strftime('%Y-%m-%d')
        
        return {
            'title': title,
            'description': description,
            'link': link,
            'date': date_str
        }
    except Exception as e:
        print(f"Error parsing item: {e}")
        return None

def main():
    print("🚀 Fetching Nordic PE deals from Cision...")
    
    # Try Adelis first (we know this works)
    rss_url = "https://news.cision.com/se/adelis-equity-partners/rss"
    
    print(f"Fetching: {rss_url}")
    root = fetch_rss_feed(rss_url)
    
    if root is None:
        print("❌ Could not fetch RSS feed")
        return
    
    # Parse RSS items
    items = root.findall('.//item')
    print(f"Found {len(items)} items")
    
    deals = []
    for item in items:
        deal_info = extract_deal_info(item)
        if not deal_info:
            continue
        
        # Check if it's deal-related
        if not is_deal_related(deal_info['title'], deal_info['description']):
            continue
        
        # Create deal record
        deal = {
            'id': f"adelis_{len(deals)}",
            'company': 'Portfolio Company',  # Extract from title if possible
            'pe_firm': 'Adelis Equity Partners',
            'sector': 'Unknown',
            'deal_type': 'Investment',
            'status': 'Completed',
            'deal_size': 'Undisclosed',
            'date': deal_info['date'],
            'description': deal_info['description'],
            'geography': 'Nordic',
            'source': 'Cision',
            'url': deal_info['link'],
            'title': deal_info['title']
        }
        
        deals.append(deal)
        print(f"✅ Added: {deal['title'][:50]}...")
    
    print(f"\n📊 Found {len(deals)} deals from Adelis")
    
    # Save to file
    deals_data = {
        "deals": deals,
        "total_deals": len(deals),
        "last_updated": datetime.now().isoformat(),
        "description": "Real Nordic PE deals from Cision RSS feeds",
        "source": "Cision RSS feeds"
    }
    
    with open('deal_flow_database.json', 'w', encoding='utf-8') as f:
        json.dump(deals_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Saved {len(deals)} deals to deal_flow_database.json")
    
    return deals

if __name__ == "__main__":
    main()
