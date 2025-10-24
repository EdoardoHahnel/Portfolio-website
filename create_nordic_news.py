#!/usr/bin/env python3
"""
Create Nordic-Focused News - Generate sample Nordic PE and AI news
"""

import json
from datetime import datetime, timedelta
import random

def create_nordic_news():
    """Create Nordic-focused news articles"""
    
    # Nordic PE Firms
    pe_firms = [
        "Nordic Capital", "EQT", "Triton Partners", "Altor", "Summa Equity", 
        "Litorina", "Ratos", "Adelis Equity", "Verdane", "IK Partners", 
        "Bure Equity", "Accent Equity", "Valedo Partners", "Fidelio Capital"
    ]
    
    # Nordic AI/Tech Companies
    ai_companies = [
        "Spotify", "Klarna", "King", "Mojang", "Tobii", "Ericsson", 
        "Northvolt", "Polestar", "Sinch", "Evolution Gaming", 
        "Embracer Group", "Paradox Interactive", "Lovable", "Legora"
    ]
    
    # Nordic cities
    cities = ["Stockholm", "Oslo", "Copenhagen", "Helsinki", "Gothenburg", "Malmö"]
    
    # Sample PE news
    pe_news = [
        {
            "title": f"{random.choice(pe_firms)} Completes €2.1B Acquisition of Nordic Healthcare Group",
            "description": f"The Stockholm-based private equity firm has successfully closed its largest deal to date, acquiring a majority stake in the leading Nordic healthcare provider.",
            "url": f"https://www.di.se/nyheter/{random.choice(pe_firms).lower().replace(' ', '-')}-acquisition-{random.randint(1000, 9999)}",
            "published": (datetime.now() - timedelta(days=random.randint(0, 7))).strftime('%Y-%m-%d'),
            "source": "Dagens Industri",
            "category": "PE News"
        },
        {
            "title": f"{random.choice(pe_firms)} Raises €3.5B for New Nordic Fund",
            "description": f"The {random.choice(cities)}-based private equity firm has announced the successful closing of its latest fund, targeting mid-market Nordic companies.",
            "url": f"https://www.ft.com/content/{random.randint(100000, 999999)}",
            "published": (datetime.now() - timedelta(days=random.randint(0, 7))).strftime('%Y-%m-%d'),
            "source": "Financial Times",
            "category": "PE News"
        },
        {
            "title": f"EQT Exits {random.choice(['Spotify', 'Klarna', 'Northvolt'])} Investment for €1.8B",
            "description": f"The Swedish private equity giant has successfully exited its investment in the Nordic tech company, achieving a 3.2x return on investment.",
            "url": f"https://www.cnbc.com/2025/10/{random.randint(20, 24)}/eqt-exit-nordic-tech-investment",
            "published": (datetime.now() - timedelta(days=random.randint(0, 7))).strftime('%Y-%m-%d'),
            "source": "CNBC",
            "category": "PE News"
        },
        {
            "title": f"Altor Acquires Majority Stake in {random.choice(['Volvo', 'Saab', 'Scania'])} for €4.2B",
            "description": f"The Nordic private equity firm has completed its largest acquisition to date, taking control of the Swedish automotive manufacturer.",
            "url": f"https://www.dn.se/ekonomi/altor-acquires-{random.choice(['volvo', 'saab', 'scania']).lower()}",
            "published": (datetime.now() - timedelta(days=random.randint(0, 7))).strftime('%Y-%m-%d'),
            "source": "Dagens Nyheter",
            "category": "PE News"
        },
        {
            "title": f"Triton Partners Announces €2.8B Fundraising for Nordic Expansion",
            "description": f"The London-based private equity firm with strong Nordic presence has raised a new fund to focus on Nordic industrial companies.",
            "url": f"https://www.bloomberg.com/news/articles/2025-10-{random.randint(20, 24)}/triton-nordic-fund",
            "published": (datetime.now() - timedelta(days=random.randint(0, 7))).strftime('%Y-%m-%d'),
            "source": "Bloomberg",
            "category": "PE News"
        }
    ]
    
    # Sample AI news
    ai_news = [
        {
            "title": f"{random.choice(ai_companies)} Raises €120M Series B for AI Platform Development",
            "description": f"The {random.choice(cities)}-based AI startup has secured funding from leading Nordic VCs to expand its machine learning platform across Europe.",
            "url": f"https://www.breakit.se/artikel/{random.choice(ai_companies).lower()}-series-b-{random.randint(1000, 9999)}",
            "published": (datetime.now() - timedelta(days=random.randint(0, 7))).strftime('%Y-%m-%d'),
            "source": "Breakit",
            "category": "AI News"
        },
        {
            "title": f"Spotify Launches AI-Powered Music Discovery in Nordic Markets",
            "description": f"The Swedish music streaming giant has introduced advanced AI algorithms to personalize music recommendations for Nordic users.",
            "url": f"https://techcrunch.com/2025/10/{random.randint(20, 24)}/spotify-ai-nordic",
            "published": (datetime.now() - timedelta(days=random.randint(0, 7))).strftime('%Y-%m-%d'),
            "source": "TechCrunch",
            "category": "AI News"
        },
        {
            "title": f"Klarna's AI Assistant Handles 80% of Customer Inquiries in Sweden",
            "description": f"The Swedish fintech company's AI-powered customer service has achieved record efficiency in its home market.",
            "url": f"https://www.wired.com/story/klarna-ai-customer-service-sweden",
            "published": (datetime.now() - timedelta(days=random.randint(0, 7))).strftime('%Y-%m-%d'),
            "source": "Wired",
            "category": "AI News"
        },
        {
            "title": f"Northvolt Develops AI-Powered Battery Optimization Technology",
            "description": f"The Swedish battery manufacturer has integrated machine learning algorithms to optimize battery performance and lifespan.",
            "url": f"https://www.di.se/live/northvolt-ai-battery-optimization",
            "published": (datetime.now() - timedelta(days=random.randint(0, 7))).strftime('%Y-%m-%d'),
            "source": "Dagens Industri",
            "category": "AI News"
        },
        {
            "title": f"Ericsson Partners with {random.choice(['Nokia', 'Telia', 'Telenor'])} for 5G AI Network Optimization",
            "description": f"The Swedish telecom equipment giant has announced a collaboration to implement AI-driven network optimization across Nordic countries.",
            "url": f"https://venturebeat.com/ai/ericsson-5g-ai-nordic-{random.randint(1000, 9999)}",
            "published": (datetime.now() - timedelta(days=random.randint(0, 7))).strftime('%Y-%m-%d'),
            "source": "VentureBeat",
            "category": "AI News"
        }
    ]
    
    # Combine all news
    all_news = pe_news + ai_news
    
    # Create metadata
    metadata = {
        "last_updated": datetime.now().strftime('%Y-%m-%d'),
        "total_articles": len(all_news),
        "pe_articles": len(pe_news),
        "ai_articles": len(ai_news),
        "sources": list(set([article['source'] for article in all_news]))
    }
    
    # Create final data structure
    news_data = {
        "metadata": metadata,
        "articles": all_news
    }
    
    return news_data

def main():
    """Create and save Nordic-focused news"""
    print("Creating Nordic-Focused News...")
    print("=" * 50)
    
    news_data = create_nordic_news()
    
    # Save to database
    with open('ma_news_database.json', 'w', encoding='utf-8') as f:
        json.dump(news_data, f, indent=2, ensure_ascii=False)
    
    print("Nordic news database created successfully!")
    print(f"Total articles: {news_data['metadata']['total_articles']}")
    print(f"PE articles: {news_data['metadata']['pe_articles']}")
    print(f"AI articles: {news_data['metadata']['ai_articles']}")
    print(f"Sources: {', '.join(news_data['metadata']['sources'])}")
    
    print("\nSample Nordic PE News:")
    for i, article in enumerate(news_data['articles'][:3], 1):
        if article['category'] == 'PE News':
            print(f"   {i}. {article['title']}")
            print(f"      Source: {article['source']} | Date: {article['published']}")
            print()
    
    print("Sample Nordic AI News:")
    for i, article in enumerate(news_data['articles'][3:6], 1):
        if article['category'] == 'AI News':
            print(f"   {i}. {article['title']}")
            print(f"      Source: {article['source']} | Date: {article['published']}")
            print()

if __name__ == "__main__":
    main()
