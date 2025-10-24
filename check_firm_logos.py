#!/usr/bin/env python3
"""
Check and update PE firm logos
This script ensures all PE firms have proper logo URLs.
"""

import json

def check_and_update_logos():
    """Check which firms are missing logos and add them"""
    
    # Load the PE firms database
    with open('pe_firms_database.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        firms = data.get('pe_firms', {})
    
    print(f"📊 Total PE firms: {len(firms)}")
    
    # Check which firms have logos
    firms_with_logos = []
    firms_without_logos = []
    
    for firm_key, firm_data in firms.items():
        if 'logo_url' in firm_data and firm_data['logo_url']:
            firms_with_logos.append(firm_key)
        else:
            firms_without_logos.append(firm_key)
    
    print(f"✅ Firms with logos: {len(firms_with_logos)}")
    print(f"❌ Firms without logos: {len(firms_without_logos)}")
    
    if firms_without_logos:
        print(f"\n🔍 Firms missing logos:")
        for firm in firms_without_logos:
            print(f"   • {firm}")
    
    # Add logos for firms that don't have them
    logo_updates = {
        "Summa Equity": "https://logo.clearbit.com/summaequity.com",
        "Verdane": "https://logo.clearbit.com/verdane.com", 
        "Ratos": "https://logo.clearbit.com/ratos.com",
        "Accent Equity": "https://logo.clearbit.com/accentequity.se",
        "IK Partners": "https://logo.clearbit.com/ikpartners.com",
        "Valedo Partners": "https://logo.clearbit.com/valedopartners.com",
        "Alder": "https://logo.clearbit.com/alderpe.com",
        "Bure Equity": "https://logo.clearbit.com/bure.se",
        "CapMan": "https://logo.clearbit.com/capman.com",
        "Nordstjernan": "https://logo.clearbit.com/nordstjernan.se",
        "Polaris Private Equity": "https://logo.clearbit.com/polarisprivateequity.com",
        "Fidelio Capital": "https://logo.clearbit.com/fideliocapital.com",
        "Valedo Partners": "https://logo.clearbit.com/valedopartners.com"
    }
    
    updated_count = 0
    for firm_key, firm_data in firms.items():
        if firm_key in logo_updates and ('logo_url' not in firm_data or not firm_data.get('logo_url')):
            firm_data['logo_url'] = logo_updates[firm_key]
            updated_count += 1
            print(f"✅ Added logo for {firm_key}: {logo_updates[firm_key]}")
    
    if updated_count > 0:
        # Save updated database
        with open('pe_firms_database.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Updated {updated_count} firms with logos!")
    else:
        print(f"\n✅ All firms already have logos!")
    
    # Final check
    print(f"\n🎯 Final Status:")
    final_firms_with_logos = 0
    final_firms_without_logos = 0
    
    for firm_key, firm_data in firms.items():
        if 'logo_url' in firm_data and firm_data['logo_url']:
            final_firms_with_logos += 1
        else:
            final_firms_without_logos += 1
    
    print(f"   • Firms with logos: {final_firms_with_logos}")
    print(f"   • Firms without logos: {final_firms_without_logos}")
    
    return data

if __name__ == "__main__":
    print("🎯 Checking and updating PE firm logos...")
    print("=" * 60)
    check_and_update_logos()
    print("=" * 60)
    print("✅ Logo check completed!")
