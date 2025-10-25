#!/usr/bin/env python3
"""
Fetch real Nordic PE deals from Cision RSS feeds
Focus on acquisitions, divestments, and transactions only
"""

import requests
import json
import xml.etree.ElementTree as ET
from datetime import datetime
import re
from urllib.parse import urljoin, urlparse

def fetch_rss_feed(url):
    """Fetch and parse RSS feed"""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return ET.fromstring(response.content)
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

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
            'date': date_str,
            'raw_date': pub_date
        }
    except Exception as e:
        print(f"Error parsing item: {e}")
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

def extract_deal_details(title, description):
    """Extract structured deal information"""
    # Extract company names (basic pattern matching)
    companies = []
    
    # Look for "X acquires Y" or "X förvärvar Y" patterns
    acquisition_patterns = [
        r'([A-Z][a-zA-Z\s&]+)\s+(?:acquires?|förvärvar|köper)\s+([A-Z][a-zA-Z\s&]+)',
        r'([A-Z][a-zA-Z\s&]+)\s+(?:invests?|investerar)\s+(?:in\s+)?([A-Z][a-zA-Z\s&]+)',
        r'([A-Z][a-zA-Z\s&]+)\s+(?:sells?|säljer)\s+([A-Z][a-zA-Z\s&]+)',
    ]
    
    for pattern in acquisition_patterns:
        matches = re.findall(pattern, title + " " + description)
        if matches:
            companies.extend(matches[0])
    
    # Extract deal size (look for amounts)
    deal_size = None
    size_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:billion|miljard|B)',
        r'(\d+(?:\.\d+)?)\s*(?:million|miljon|M)',
        r'(\d+(?:\.\d+)?)\s*(?:thousand|tusen|K)',
        r'SEK\s*(\d+(?:\.\d+)?)\s*(?:billion|miljard|million|miljon)',
        r'€(\d+(?:\.\d+)?)\s*(?:billion|miljard|million|miljon)',
        r'\$(\d+(?:\.\d+)?)\s*(?:billion|miljard|million|miljon)'
    ]
    
    text = title + " " + description
    for pattern in size_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            deal_size = match.group(0)
            break
    
    # Determine deal type
    deal_type = "Other"
    if any(word in text.lower() for word in ['acquisition', 'förvärv', 'acquires', 'köper']):
        deal_type = "Acquisition"
    elif any(word in text.lower() for word in ['investment', 'investering', 'invests', 'investerar']):
        deal_type = "Investment"
    elif any(word in text.lower() for word in ['divestment', 'avyttring', 'sells', 'säljer']):
        deal_type = "Divestment"
    elif any(word in text.lower() for word in ['merger', 'fusion', 'sammanslagning']):
        deal_type = "Merger"
    elif any(word in text.lower() for word in ['fundraising', 'kapitalanskaffning', 'fund', 'fond']):
        deal_type = "Fundraising"
    
    return {
        'companies': companies,
        'deal_size': deal_size,
        'deal_type': deal_type
    }

def get_nordic_pe_firms():
    """Get list of Nordic PE firms with their Cision RSS feeds"""
    return {
        'Adelis Equity Partners': 'https://news.cision.com/se/adelis-equity-partners',
        'EQT': 'https://news.cision.com/se/eqt',
        'Nordic Capital': 'https://news.cision.com/se/nordic-capital',
        'Triton Partners': 'https://news.cision.com/se/triton-partners',
        'Altor': 'https://news.cision.com/se/altor',
        'Verdane': 'https://news.cision.com/se/verdane',
        'Summa Equity': 'https://news.cision.com/se/summa-equity',
        'Ratos': 'https://news.cision.com/se/ratos',
        'IK Partners': 'https://news.cision.com/se/ik-partners',
        'Litorina': 'https://news.cision.com/se/litorina',
        'Axcel': 'https://news.cision.com/se/axcel',
        'FSN Capital': 'https://news.cision.com/se/fsn-capital',
        'CapMan': 'https://news.cision.com/se/capman',
        'Investor AB': 'https://news.cision.com/se/investor-ab'
    }

def fetch_all_pe_deals():
    """Fetch deals from all Nordic PE firms"""
    all_deals = []
    pe_firms = get_nordic_pe_firms()
    
    for firm_name, base_url in pe_firms.items():
        print(f"🔍 Fetching deals for {firm_name}...")
        
        # Try to find RSS feed URL
        rss_urls = [
            f"{base_url}/rss",
            f"{base_url}/feed",
            f"{base_url}/rss.xml",
            f"{base_url}/feed.xml"
        ]
        
        # Also try Cision's standard RSS format
        firm_slug = base_url.split('/')[-1]
        rss_urls.extend([
            f"https://news.cision.com/se/{firm_slug}/rss",
            f"https://news.cision.com/se/{firm_slug}/feed"
        ])
        
        rss_found = False
        for rss_url in rss_urls:
            try:
                print(f"  Trying: {rss_url}")
                root = fetch_rss_feed(rss_url)
                if root is not None:
                    print(f"  ✅ Found RSS feed for {firm_name}")
                    rss_found = True
                    break
            except:
                continue
        
        if not rss_found:
            print(f"  ❌ No RSS feed found for {firm_name}")
            continue
        
        # Parse RSS items
        items = root.findall('.//item')
        print(f"  Found {len(items)} items")
        
        for item in items:
            deal_info = extract_deal_info(item)
            if not deal_info:
                continue
            
            # Check if it's deal-related
            if not is_deal_related(deal_info['title'], deal_info['description']):
                continue
            
            # Extract structured deal details
            deal_details = extract_deal_details(deal_info['title'], deal_info['description'])
            
            # Create deal record
            deal = {
                'id': f"{firm_name.lower().replace(' ', '_')}_{len(all_deals)}",
                'company': deal_details['companies'][1] if len(deal_details['companies']) > 1 else deal_details['companies'][0] if deal_details['companies'] else 'Unknown',
                'pe_firm': firm_name,
                'sector': 'Unknown',  # Would need more sophisticated extraction
                'deal_type': deal_details['deal_type'],
                'status': 'Completed',  # Assume completed if in news
                'deal_size': deal_details['deal_size'],
                'date': deal_info['date'],
                'description': deal_info['description'],
                'geography': 'Nordic',  # Assume Nordic for these firms
                'source': 'Cision',
                'url': deal_info['link'],
                'title': deal_info['title']
            }
            
            all_deals.append(deal)
            print(f"    ✅ Added deal: {deal['title'][:50]}...")
    
    return all_deals

def main():
    print("🚀 Fetching real Nordic PE deals from Cision RSS feeds...")
    
    # Fetch all deals
    deals = fetch_all_pe_deals()
    
    print(f"\n📊 Found {len(deals)} real Nordic PE deals")
    
    # Create database structure
    deals_data = {
        "deals": deals,
        "total_deals": len(deals),
        "last_updated": datetime.now().isoformat(),
        "description": "Real Nordic PE deals from Cision RSS feeds",
        "source": "Cision RSS feeds",
        "firms_covered": list(get_nordic_pe_firms().keys())
    }
    
    # Save to file
    with open('deal_flow_database.json', 'w', encoding='utf-8') as f:
        json.dump(deals_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Saved {len(deals)} deals to deal_flow_database.json")
    
    # Show some examples
    if deals:
        print("\n📋 Examples of real deals found:")
        for i, deal in enumerate(deals[:5]):
            print(f"  {i+1}. {deal['title'][:60]}...")
            print(f"     {deal['pe_firm']} - {deal['deal_type']} - {deal['date']}")
    
    return deals

if __name__ == "__main__":
    main()
