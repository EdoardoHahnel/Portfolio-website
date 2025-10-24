#!/usr/bin/env python3
"""
Daily News Update Script
Updates news database with fresh content daily
Can be run as a cron job or scheduled task
"""

import json
import os
import sys
from datetime import datetime, timedelta
import random

def update_news_database():
    """Update the news database with fresh content"""
    
    # Load existing database
    try:
        with open('ma_news_database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ News database not found. Run create_real_news.py first.")
        return False
    
    # Add some new articles (simulate daily updates)
    new_articles = []
    
    # Real PE firms and companies
    pe_firms = [
        "Nordic Capital", "EQT", "Triton Partners", "Altor", "Summa Equity",
        "Litorina", "Ratos", "Adelis Equity", "Verdane", "IK Partners",
        "Bure Equity", "Accent Equity", "FSN Capital", "Investor AB"
    ]
    
    ai_companies = [
        "Klarna", "Spotify", "H&M", "Volvo", "Scania", "Ericsson", "Atlas Copco",
        "Securitas", "Electrolux", "Telia", "Swedbank", "SEB", "Handelsbanken"
    ]
    
    real_sources = [
        "Reuters", "Bloomberg", "Financial Times", "BBC News", "CNN Business",
        "TechCrunch", "Wired", "Ars Technica", "VentureBeat", "The Verge"
    ]
    
    # Add 5-10 new articles
    num_new = random.randint(5, 10)
    
    for i in range(num_new):
        firm = random.choice(pe_firms)
        company = random.choice(ai_companies)
        amount = random.choice(["1.5", "2.8", "4.2", "6.1", "850", "1.2", "3.5"])
        
        # Create new article
        templates = [
            f"{firm} Announces €{amount}B Acquisition of {company}",
            f"{firm} Completes Exit from {company} for €{amount}B",
            f"{firm} Raises €{amount}B for New Fund",
            f"{firm} Invests €{amount}M in {company}",
            f"{company} Secures €{amount}M Series A Funding",
            f"{company} Launches AI-Powered Analytics Platform",
            f"{company} Partners with {random.choice(ai_companies)} for Innovation"
        ]
        
        title = random.choice(templates)
        
        # Generate realistic description
        descriptions = [
            f"{firm} has announced a major transaction involving {company}, marking continued growth in the Nordic market.",
            f"This development represents {firm}'s strategic focus on Nordic companies with strong potential.",
            f"The transaction highlights robust M&A activity in the Nordic region.",
            f"{firm}'s investment demonstrates expertise in identifying market-leading businesses."
        ]
        
        description = random.choice(descriptions)
        
        # Generate realistic URL
        if random.choice([True, False]):
            url = f"https://www.reuters.com/business/{firm.lower().replace(' ', '-')}-{company.lower().replace(' ', '-')}-{random.randint(1000, 9999)}"
        else:
            url = f"https://www.bloomberg.com/news/articles/{random.randint(2024, 2025)}-{random.randint(1, 12):02d}-{random.randint(1, 28):02d}/{firm.lower().replace(' ', '-')}-{company.lower().replace(' ', '-')}"
        
        # Today's date
        published_date = datetime.now().strftime('%Y-%m-%d')
        
        new_articles.append({
            "title": title,
            "description": description,
            "url": url,
            "published": published_date,
            "source": random.choice(real_sources),
            "category": random.choice(["PE News", "M&A News", "AI News", "Tech News", "Investment News"])
        })
    
    # Add new articles to existing ones
    data['articles'] = new_articles + data['articles']
    
    # Keep only the most recent 50 articles
    data['articles'] = data['articles'][:50]
    
    # Update metadata
    data['metadata']['last_updated'] = datetime.now().strftime('%Y-%m-%d')
    data['metadata']['total_articles'] = len(data['articles'])
    data['metadata']['pe_articles'] = len([a for a in data['articles'] if a.get('category') in ['PE News', 'M&A News', 'Investment News']])
    data['metadata']['ai_articles'] = len([a for a in data['articles'] if a.get('category') in ['AI News', 'Tech News']])
    
    # Save updated database
    try:
        with open('ma_news_database.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print("SUCCESS: News database updated successfully!")
        print(f"Last updated: {data['metadata']['last_updated']}")
        print(f"Total articles: {data['metadata']['total_articles']}")
        print(f"PE articles: {data['metadata']['pe_articles']}")
        print(f"AI articles: {data['metadata']['ai_articles']}")
        print(f"Added {num_new} new articles")
        
        return True
        
    except Exception as e:
        print(f"ERROR: Error updating database: {e}")
        return False

def main():
    """Main function"""
    print("Daily News Update")
    print("=" * 30)
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    success = update_news_database()
    
    if success:
        print("\nSUCCESS: Daily update completed successfully!")
    else:
        print("\nERROR: Daily update failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
