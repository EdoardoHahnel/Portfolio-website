#!/usr/bin/env python3
import json

# Load the portfolio database
with open('portfolio_enriched.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    companies = data.get('companies', [])

# Find Ratos companies
ratos_companies = [c for c in companies if c.get('source') == 'Ratos']

print(f"Total companies in database: {len(companies)}")
print(f"Ratos companies: {len(ratos_companies)}")
print("\nRatos companies:")
for company in ratos_companies:
    print(f"- {company['company']} ({company.get('sector', 'Unknown')}) - {company.get('entry', 'Unknown')}")

# Check for old companies that might still be there
old_companies = ['Bisnode', 'LEDiL', 'airteam', 'HENT', 'Speed Group', 'Kvdbil', 'Oase Outdoors']
print(f"\nChecking for old companies:")
for old_company in old_companies:
    found = [c for c in companies if c.get('company') == old_company]
    if found:
        print(f"- {old_company}: Found with source '{found[0].get('source', 'Unknown')}'")
    else:
        print(f"- {old_company}: Not found")
