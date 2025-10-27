#!/usr/bin/env python3
"""
Audit script to identify and remove fake/sample data from PE firms
"""

import json
from datetime import datetime

def audit_news_data():
    """Audit news database for fake data"""
    print("=== AUDITING NEWS DATABASE ===")
    
    with open('pe_news_database.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Check for fake 2025 data
    fake_2025_articles = []
    for article in data['news']:
        if '2025' in article.get('date', ''):
            fake_2025_articles.append(article)
    
    print(f"Found {len(fake_2025_articles)} articles with 2025 dates (likely fake):")
    for article in fake_2025_articles:
        print(f"  - {article['firm']}: {article['title']} ({article['date']})")
    
    # Check for sample/fake content keywords
    fake_keywords = ['sample', 'fake', 'test', 'example', 'placeholder', 'dummy']
    suspicious_articles = []
    
    for article in data['news']:
        title_lower = article.get('title', '').lower()
        desc_lower = article.get('description', '').lower()
        
        for keyword in fake_keywords:
            if keyword in title_lower or keyword in desc_lower:
                suspicious_articles.append(article)
                break
    
    print(f"\nFound {len(suspicious_articles)} suspicious articles:")
    for article in suspicious_articles:
        print(f"  - {article['firm']}: {article['title']}")
    
    return fake_2025_articles, suspicious_articles

def audit_portfolio_data():
    """Audit portfolio database for fake companies"""
    print("\n=== AUDITING PORTFOLIO DATABASE ===")
    
    with open('portfolio_enriched.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Check for fake company names
    fake_companies = []
    fake_keywords = ['techcorp', 'healthflow', 'datapulse', 'nordic services group', 'industrial pro', 'careconnect', 'nordic manufacturing']
    
    for company in data['companies']:
        company_name = company.get('company', '').lower()
        for keyword in fake_keywords:
            if keyword in company_name:
                fake_companies.append(company)
                break
    
    print(f"Found {len(fake_companies)} potentially fake companies:")
    for company in fake_companies:
        print(f"  - {company['source']}: {company['company']}")
    
    return fake_companies

def audit_pe_firms_data():
    """Audit PE firms database for fake data"""
    print("\n=== AUDITING PE FIRMS DATABASE ===")
    
    with open('pe_firms_database.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Check for fake recent activity
    firms_with_fake_activity = []
    fake_keywords = ['Q3 2024', 'Q4 2024', '2025', 'recent', 'announces', 'launches', 'completes']
    
    for firm_name, firm_data in data['pe_firms'].items():
        recent_activity = firm_data.get('recent_activity', '').lower()
        
        # Check if recent activity contains too many fake-sounding phrases
        fake_count = sum(1 for keyword in fake_keywords if keyword.lower() in recent_activity)
        if fake_count > 3:  # Too many fake-sounding phrases
            firms_with_fake_activity.append(firm_name)
    
    print(f"Found {len(firms_with_fake_activity)} firms with potentially fake recent activity:")
    for firm in firms_with_fake_activity:
        print(f"  - {firm}")
    
    return firms_with_fake_activity

def main():
    """Main audit function"""
    print("Starting comprehensive data audit...")
    
    fake_2025_articles, suspicious_articles = audit_news_data()
    fake_companies = audit_portfolio_data()
    firms_with_fake_activity = audit_pe_firms_data()
    
    print(f"\n=== SUMMARY ===")
    print(f"Fake 2025 articles: {len(fake_2025_articles)}")
    print(f"Suspicious articles: {len(suspicious_articles)}")
    print(f"Fake companies: {len(fake_companies)}")
    print(f"Firms with fake activity: {len(firms_with_fake_activity)}")
    
    return {
        'fake_2025_articles': fake_2025_articles,
        'suspicious_articles': suspicious_articles,
        'fake_companies': fake_companies,
        'firms_with_fake_activity': firms_with_fake_activity
    }

if __name__ == "__main__":
    main()
