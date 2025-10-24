#!/usr/bin/env python3
"""
Force refresh portfolio data to ensure latest changes are visible
"""

import json
from datetime import datetime

def force_refresh_portfolio():
    """Force refresh the portfolio database with current timestamp"""
    
    # Load current database
    with open('portfolio_enriched.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Update metadata with current timestamp
    data['metadata']['last_updated'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data['metadata']['force_refresh'] = True
    
    # Save with new timestamp
    with open('portfolio_enriched.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print("✅ Portfolio database refreshed with new timestamp")
    print(f"📅 Last updated: {data['metadata']['last_updated']}")
    
    # Verify Summa companies
    summa_companies = [c for c in data['companies'] if c.get('source') == 'Summa Equity']
    print(f"🏢 Summa Equity companies: {len(summa_companies)}")
    
    # Show first 5 companies
    print("\n📋 Current Summa Equity Portfolio:")
    for company in summa_companies[:5]:
        print(f"   • {company['company']} ({company.get('sector', 'Unknown')})")
    
    if len(summa_companies) > 5:
        print(f"   ... and {len(summa_companies) - 5} more companies")

if __name__ == "__main__":
    print("🔄 Force refreshing portfolio data...")
    print("=" * 50)
    force_refresh_portfolio()
    print("=" * 50)
    print("✅ Portfolio refresh completed!")
    print("\n💡 If you're still seeing old data:")
    print("   1. Clear your browser cache (Ctrl+F5)")
    print("   2. Hard refresh the page")
    print("   3. Check if you're looking at the correct PE firm")
