#!/usr/bin/env python3
"""
Show Real News - Display the current real news articles
"""

import json
from datetime import datetime

def show_news():
    """Display current real news articles"""
    try:
        with open('ma_news_database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print("=" * 80)
        print("REAL NEWS DATABASE - CURRENT ARTICLES")
        print("=" * 80)
        
        metadata = data.get('metadata', {})
        print(f"Last Updated: {metadata.get('last_updated', 'Unknown')}")
        print(f"Total Articles: {metadata.get('total_articles', 0)}")
        print(f"PE Articles: {metadata.get('pe_articles', 0)}")
        print(f"AI Articles: {metadata.get('ai_articles', 0)}")
        print(f"Sources: {', '.join(metadata.get('sources', []))}")
        print()
        
        articles = data.get('articles', [])
        
        print("SAMPLE REAL ARTICLES:")
        print("-" * 80)
        
        for i, article in enumerate(articles[:10], 1):
            print(f"{i}. {article.get('title', 'No title')}")
            print(f"   Source: {article.get('source', 'Unknown')} | Date: {article.get('published', 'Unknown')}")
            print(f"   URL: {article.get('url', 'No URL')}")
            print(f"   Category: {article.get('category', 'Unknown')}")
            if article.get('description'):
                desc = article['description'][:100] + '...' if len(article['description']) > 100 else article['description']
                print(f"   Description: {desc}")
            print()
        
        print(f"... and {len(articles) - 10} more articles")
        print("=" * 80)
        
    except Exception as e:
        print(f"Error reading news database: {e}")

if __name__ == "__main__":
    show_news()
