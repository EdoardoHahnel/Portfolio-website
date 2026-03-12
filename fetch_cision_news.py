#!/usr/bin/env python3
"""
Fetch Nordic PE news directly from Cision news pages
"""

import requests
import json
import re
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
import time

def fetch_cision_news_page(url, firm_name):
    """Fetch news directly from Cision news page"""
    try:
        print(f"Fetching news page for {firm_name}...")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
        }
        
        response = requests.get(url, timeout=15, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        news_items = []
        
        # Look for news items in various possible structures
        news_containers = soup.find_all(['div', 'article', 'li'], class_=re.compile(r'news|press|release|item', re.I))
        
        if not news_containers:
            # Try alternative selectors
            news_containers = soup.find_all('div', string=re.compile(r'\d{4}-\d{2}-\d{2}'))
        
        seen_links = set()
        for container in news_containers[:25]:  # Parse more candidates, then dedupe/limit
            try:
                # Extract title
                title_elem = container.find(['h1', 'h2', 'h3', 'h4', 'a'], string=True)
                if not title_elem:
                    continue
                    
                title = title_elem.get_text().strip()
                if len(title) < 10:  # Skip very short titles
                    continue
                
                # Extract link
                link_elem = container.find('a', href=True)
                link = link_elem['href'] if link_elem else url
                if link.startswith('/'):
                    link = 'https://news.cision.com' + link
                
                # Extract description
                desc_elem = container.find(['p', 'div'], string=True)
                description = desc_elem.get_text().strip() if desc_elem else ""
                
                # Extract date and normalize to YYYY-MM-DD format
                date_text = ""
                date_elem = container.find(string=re.compile(r'\d{4}-\d{2}-\d{2}'))
                if date_elem:
                    date_text = re.search(r'\d{4}-\d{2}-\d{2}', str(date_elem)).group()
                else:
                    # Try to find date in various formats
                    date_patterns = [
                        r'\d{1,2}\s+(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)\s+\d{4}',
                        r'\d{1,2}/\d{1,2}/\d{4}',
                        r'\d{4}-\d{1,2}-\d{1,2}',
                        r'\d{1,2}-\d{1,2}-\d{4}'
                    ]
                    
                    for pattern in date_patterns:
                        date_match = re.search(pattern, str(container), re.IGNORECASE)
                        if date_match:
                            date_text = date_match.group()
                            break
                    
                    # If still no date found, skip item to avoid misleading recency
                    if not date_text:
                        continue
                
                # Normalize date to YYYY-MM-DD format
                try:
                    # Handle Swedish month names
                    swedish_months = {
                        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
                        'maj': '05', 'jun': '06', 'jul': '07', 'aug': '08',
                        'sep': '09', 'okt': '10', 'nov': '11', 'dec': '12'
                    }
                    
                    if any(month in date_text.lower() for month in swedish_months.keys()):
                        # Parse Swedish date format: "28 Maj 2019"
                        parts = date_text.split()
                        if len(parts) == 3:
                            day = parts[0].zfill(2)
                            month = swedish_months[parts[1].lower()]
                            year = parts[2]
                            date_text = f"{year}-{month}-{day}"
                    
                    # Validate and reformat if needed
                    from datetime import datetime
                    parsed_date = datetime.strptime(date_text, '%Y-%m-%d')
                    date_text = parsed_date.strftime('%Y-%m-%d')
                    
                except Exception:
                    # Skip unparseable dates to keep timeline trustworthy
                    continue
                
                # Clean up text
                title = re.sub(r'\s+', ' ', title).strip()
                description = re.sub(r'\s+', ' ', description).strip()
                
                # Truncate if too long
                if len(title) > 100:
                    title = title[:97] + "..."
                if len(description) > 300:
                    description = description[:297] + "..."
                
                # Skip if too generic or unwanted content
                if any(word in title.lower() for word in ['cookie', 'privacy', 'terms', 'contact', 'astrazeneca', 'astra zeneca']):
                    continue
                
                news_item = {
                    "title": title,
                    "description": description,
                    "link": link,
                    "date": date_text,
                    "firm": firm_name,
                    "source": "Cision News"
                }
                if link and link in seen_links:
                    continue
                seen_links.add(link)
                news_items.append(news_item)
                
            except Exception as e:
                print(f"Error parsing item for {firm_name}: {e}")
                continue

        # Keep newest 10 real items per firm
        news_items.sort(key=lambda x: x.get('date', ''), reverse=True)
        news_items = news_items[:10]
        print(f"Found {len(news_items)} news items for {firm_name}")
        return news_items
        
    except Exception as e:
        print(f"Error fetching news page for {firm_name}: {e}")
        return []

def balance_news_by_firm(real_news, firm_names, min_per_firm=4, max_per_firm=10, total_limit=120):
    """Balance output using only real news—no sampled/fake articles."""
    by_firm = {firm: [] for firm in firm_names}
    for item in real_news:
        firm = item.get("firm")
        if firm in by_firm:
            by_firm[firm].append(item)

    guaranteed = []
    selected_links = set()
    extras = []

    for firm in firm_names:
        firm_real = sorted(by_firm.get(firm, []), key=lambda x: x.get("date", ""), reverse=True)
        baseline_real = firm_real[:min_per_firm]
        guaranteed.extend(baseline_real)
        selected_links.update(x.get("link", "") for x in baseline_real if x.get("link"))

        for extra in firm_real[min_per_firm:max_per_firm]:
            if extra.get("link") and extra["link"] in selected_links:
                continue
            extras.append(extra)

    extras.sort(key=lambda x: x.get("date", ""), reverse=True)
    guaranteed.sort(key=lambda x: x.get("date", ""), reverse=True)

    final_news = list(guaranteed)
    for item in extras:
        if len(final_news) >= total_limit:
            break
        final_news.append(item)

    final_news.sort(key=lambda x: x.get("date", ""), reverse=True)
    return final_news[:total_limit]

def main():
    """Main function to fetch Nordic PE news"""
    
    # Nordic PE firms and their Cision news page URLs
    pe_firms = {
        "EQT": "https://news.cision.com/se/EQT",
        "Nordic Capital": "https://news.cision.com/se/nordic-capital", 
        "Adelis Equity Partners": "https://news.cision.com/se/adelis-equity-partners",
        "Accent Equity": "https://news.cision.com/se/?q=accent+equity",
        "Summa Equity": "https://news.cision.com/se/summa-equity",
        "Bure Equity": "https://news.cision.com/se/?q=bure+equity",
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
    
    print("Fetching Nordic PE news from Cision news pages...")
    print("=" * 60)
    
    # Try to fetch from actual pages first
    for firm_name, news_url in pe_firms.items():
        news_items = fetch_cision_news_page(news_url, firm_name)
        all_news.extend(news_items)
        time.sleep(2)  # Be respectful to the server
    
    all_news = balance_news_by_firm(
        real_news=all_news,
        firm_names=list(pe_firms.keys()),
        min_per_firm=3,
        max_per_firm=10,
        total_limit=120
    )
    
    # Create the database structure
    news_database = {
        "news": all_news,
        "total_news": len(all_news),
        "last_updated": datetime.now().strftime('%Y-%m-%dT%H:%M:%S'),
        "description": "Nordic PE news from Cision news pages and recent activity",
        "source": "Cision News Pages",
        "firms_covered": list(pe_firms.keys())
    }
    
    # Save to file
    with open('pe_news_database.json', 'w', encoding='utf-8') as f:
        json.dump(news_database, f, indent=2, ensure_ascii=False)
    
    print("=" * 60)
    print(f"Successfully fetched {len(all_news)} Nordic PE news items")
    print("Saved to: pe_news_database.json")
    print(f"Firms covered: {len(pe_firms)}")
    
    # Show sample news
    print("\nSample news items:")
    for i, item in enumerate(all_news[:8]):
        print(f"{i+1}. {item['firm']} - {item['title']} ({item['date']})")
    
    return news_database

if __name__ == "__main__":
    main()
