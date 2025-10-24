#!/usr/bin/env python3
"""
Check portfolio company logos
This script ensures portfolio companies have proper logo URLs.
"""

import json

def check_portfolio_logos():
    """Check portfolio companies for logo URLs"""
    
    # Load the portfolio database
    with open('portfolio_enriched.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        companies = data.get('companies', [])
    
    print(f"📊 Total portfolio companies: {len(companies)}")
    
    # Check which companies have logos
    companies_with_logos = []
    companies_without_logos = []
    
    for company in companies:
        if 'logo_url' in company and company['logo_url']:
            companies_with_logos.append(company['company'])
        else:
            companies_without_logos.append(company['company'])
    
    print(f"✅ Companies with logos: {len(companies_with_logos)}")
    print(f"❌ Companies without logos: {len(companies_without_logos)}")
    
    if companies_without_logos:
        print(f"\n🔍 Companies missing logos (first 10):")
        for company in companies_without_logos[:10]:
            print(f"   • {company}")
        if len(companies_without_logos) > 10:
            print(f"   ... and {len(companies_without_logos) - 10} more")
    
    # Add logos for companies that don't have them
    updated_count = 0
    for company in companies:
        if 'logo_url' not in company or not company.get('logo_url'):
            # Generate logo URL based on company name and website
            company_name = company.get('company', '').lower().replace(' ', '').replace('group', '').replace('®', '').replace('®', '')
            website = company.get('website', '')
            
            if website and 'http' in website:
                # Extract domain from website
                domain = website.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
                company['logo_url'] = f"https://logo.clearbit.com/{domain}"
            else:
                # Use company name for logo
                company['logo_url'] = f"https://logo.clearbit.com/{company_name}.com"
            
            updated_count += 1
    
    if updated_count > 0:
        # Save updated database
        with open('portfolio_enriched.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Updated {updated_count} companies with logos!")
    else:
        print(f"\n✅ All companies already have logos!")
    
    # Final check
    print(f"\n🎯 Final Status:")
    final_companies_with_logos = 0
    final_companies_without_logos = 0
    
    for company in companies:
        if 'logo_url' in company and company['logo_url']:
            final_companies_with_logos += 1
        else:
            final_companies_without_logos += 1
    
    print(f"   • Companies with logos: {final_companies_with_logos}")
    print(f"   • Companies without logos: {final_companies_without_logos}")
    
    return data

if __name__ == "__main__":
    print("🎯 Checking and updating portfolio company logos...")
    print("=" * 60)
    check_portfolio_logos()
    print("=" * 60)
    print("✅ Portfolio logo check completed!")
