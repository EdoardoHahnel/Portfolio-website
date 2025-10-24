#!/usr/bin/env python3
import json

# Load the portfolio database
with open('portfolio_enriched.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    companies = data.get('companies', [])

# Find Summa Equity companies
summa_companies = [c for c in companies if c.get('source') == 'Summa Equity']

print(f"Total companies in database: {len(companies)}")
print(f"Summa Equity companies: {len(summa_companies)}")
print("\nSumma Equity companies:")
for company in summa_companies:
    print(f"- {company['company']} ({company.get('sector', 'Unknown')})")

# Also check for any companies that might have old Summa data
old_companies = ['Meltwater', 'Cabonline', 'Mynewsdesk', 'ISS', 'Norican', 'Polarium']
print(f"\nChecking for old companies:")
for old_company in old_companies:
    found = [c for c in companies if c.get('company') == old_company]
    if found:
        print(f"- {old_company}: Found with source '{found[0].get('source', 'Unknown')}'")
    else:
        print(f"- {old_company}: Not found")
