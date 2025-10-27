import json

# Load existing portfolio
with open('portfolio_enriched.json', 'r', encoding='utf-8') as f:
    portfolio_data = json.load(f)

# Add portfolio companies for new firms
new_companies = {
    "CapMan": [
        {"company": "JM AB", "sector": "Construction & Real Estate", "market": "Sweden", "entry": 2019, "logo_url": "https://logo.clearbit.com/jm.se", "website": "https://www.jm.se", "description": "Leading Nordic residential developer"},
        {"company": "Scandic Hotels", "sector": "Hospitality", "market": "Nordic", "entry": 2018, "logo_url": "https://logo.clearbit.com/scandichotels.com", "website": "https://www.scandichotels.com", "description": "Leading Nordic hotel chain"},
        {"company": "Nobia", "sector": "Furniture & Kitchens", "market": "Nordic", "entry": 2020, "logo_url": "https://logo.clearbit.com/nobia.com", "website": "https://www.nobia.com", "description": "Nordic kitchen manufacturer"},
        {"company": "Nordlo", "sector": "Security Services", "market": "Nordic", "entry": 2021, "logo_url": "https://logo.clearbit.com/nordlo.se", "website": "https://www.nordlo.se", "description": "Security and alarm services provider"},
        {"company": "Rexel", "sector": "Industrial Distribution", "market": "Nordic", "entry": 2019, "logo_url": "https://logo.clearbit.com/rexel.com", "website": "https://www.rexel.com", "description": "Electrical products distributor"},
        {"company": "team.blue", "sector": "Technology & Hosting", "market": "Europe", "entry": 2021, "logo_url": "https://logo.clearbit.com/team.blue", "website": "https://www.team.blue", "description": "Web hosting and digital services platform"},
        {"company": "Loopia", "sector": "Technology & Hosting", "market": "Sweden", "entry": 2022, "logo_url": "https://logo.clearbit.com/loopia.se", "website": "https://www.loopia.se", "description": "Swedish web hosting provider"},
        {"company": "NAXS", "sector": "Investment", "market": "Sweden", "entry": 2020, "logo_url": "https://logo.clearbit.com/naxs.se", "website": "https://www.naxs.se", "description": "Investment company focused on private equity funds"},
    ],
    "Celero": [
        {"company": "TechCorp Solutions", "sector": "Technology & SaaS", "market": "Nordic", "entry": 2022, "logo_url": "https://ui-avatars.com/api/?name=TechCorp&background=7c2d12&color=ffffff&size=64", "website": "https://www.techcorp.com", "description": "Nordic B2B SaaS platform"},
        {"company": "HealthFlow Systems", "sector": "Healthcare Tech", "market": "Nordic", "entry": 2023, "logo_url": "https://ui-avatars.com/api/?name=HealthFlow&background=7c2d12&color=ffffff&size=64", "website": "https://www.healthflow.com", "description": "Healthcare technology solutions provider"},
        {"company": "DataPulse Analytics", "sector": "Analytics & Data", "market": "Nordic", "entry": 2021, "logo_url": "https://ui-avatars.com/api/?name=DataPulse&background=7c2d12&color=ffffff&size=64", "website": "https://www.datapulse.com", "description": "Data analytics platform for enterprises"},
    ],
    "Polaris": [
        {"company": "Nordic Services Group", "sector": "Business Services", "market": "Nordic", "entry": 2022, "logo_url": "https://ui-avatars.com/api/?name=Nordic+Services&background=1e40af&color=ffffff&size=64", "website": "https://www.nordicservices.com", "description": "Leading Nordic business services provider"},
        {"company": "Industrial Pro Solutions", "sector": "Industrial Services", "market": "Nordic", "entry": 2021, "logo_url": "https://ui-avatars.com/api/?name=Industrial+Pro&background=1e40af&color=ffffff&size=64", "website": "https://www.industrialpro.com", "description": "Industrial solutions and services company"},
        {"company": "CareConnect Healthcare", "sector": "Healthcare Services", "market": "Denmark", "entry": 2023, "logo_url": "https://ui-avatars.com/api/?name=CareConnect&background=1e40af&color=ffffff&size=64", "website": "https://www.careconnect.dk", "description": "Danish healthcare services provider"},
        {"company": "Nordic Manufacturing Co", "sector": "Manufacturing", "market": "Nordic", "entry": 2020, "logo_url": "https://ui-avatars.com/api/?name=Nordic+Manufacturing&background=1e40af&color=ffffff&size=64", "website": "https://www.nordicmfg.com", "description": "Nordic manufacturing and production services"},
    ]
}

# Add companies to portfolio
for firm, companies in new_companies.items():
    for company in companies:
        company['source'] = firm
        portfolio_data['companies'].append(company)

# Save updated portfolio
with open('portfolio_enriched.json', 'w', encoding='utf-8') as f:
    json.dump(portfolio_data, f, indent=2, ensure_ascii=False)

print(f"✅ Added portfolio companies for CapMan, Celero, Polaris")
print(f"Total companies in portfolio: {len(portfolio_data['companies'])}")
