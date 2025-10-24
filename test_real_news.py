#!/usr/bin/env python3
"""
Test Real News System
Quick test to verify the real news scraper works
"""

import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

from real_news_scraper import RealNewsScraper

def test_news_scraper():
    """Test the real news scraper"""
    print("🧪 Testing Real News Scraper")
    print("=" * 50)
    
    try:
        # Create scraper instance
        scraper = RealNewsScraper()
        
        # Test with just one RSS feed first
        print("📡 Testing RSS feed parsing...")
        test_articles = scraper.fetch_rss_news('https://feeds.reuters.com/reuters/businessNews', 5)
        
        if test_articles:
            print(f"✅ Successfully fetched {len(test_articles)} test articles")
            print("\n📰 Sample article:")
            sample = test_articles[0]
            print(f"   Title: {sample['title'][:80]}...")
            print(f"   Source: {sample['source']}")
            print(f"   Date: {sample['published']}")
            print(f"   URL: {sample['url'][:60]}...")
        else:
            print("❌ No articles fetched")
            return False
        
        # Test full scraping (limited)
        print("\n🔄 Testing full news scraping...")
        news_data = scraper.scrape_all_news()
        
        if news_data and news_data.get('articles'):
            print(f"✅ Full scraping successful!")
            print(f"   Total articles: {len(news_data['articles'])}")
            print(f"   PE articles: {news_data['metadata'].get('pe_articles', 0)}")
            print(f"   AI articles: {news_data['metadata'].get('ai_articles', 0)}")
            print(f"   Sources: {news_data['metadata'].get('sources', [])}")
            
            # Save test data
            if scraper.save_to_database(news_data, 'test_news_database.json'):
                print("💾 Test data saved successfully")
            else:
                print("❌ Failed to save test data")
                return False
        else:
            print("❌ Full scraping failed")
            return False
        
        print("\n🎉 All tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

if __name__ == "__main__":
    success = test_news_scraper()
    sys.exit(0 if success else 1)
