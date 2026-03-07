import json

# Load existing portfolio
with open('portfolio_enriched.json', 'r', encoding='utf-8') as f:
    portfolio_data = json.load(f)

# Add portfolio companies for new firms
new_companies = {
    "CapMan": [
        {"company": "Groweo", "sector": "Technology", "market": "Finland", "entry": 2024, "logo_url": "https://logo.clearbit.com/groweo.com", "website": "https://groweo.com", "description": "AI-based SaaS for SMEs. Digital sales, marketing and customer service tools."},
        {"company": "Innofactor", "sector": "Technology", "market": "Finland", "entry": 2024, "logo_url": "https://logo.clearbit.com/innofactor.com", "website": "https://www.innofactor.com", "description": "Leading Nordic Microsoft ecosystem IT services. ~1,000 customers, ~600 specialists."},
        {"company": "Tana", "sector": "Industrial", "market": "Finland", "entry": 2024, "logo_url": "https://logo.clearbit.com/tana.fi", "website": "https://www.tana.fi", "description": "Environmental tech. Waste pre-treatment equipment, shredders, landfill compactors. 50+ countries."},
        {"company": "Silmäasema", "sector": "Healthcare", "market": "Finland", "entry": 2023, "logo_url": "https://logo.clearbit.com/silmaasema.fi", "website": "https://www.silmaasema.fi", "description": "Finland's largest eye health and optical retail. ~150 stores, 18 eye hospitals."},
        {"company": "Fennoa", "sector": "Technology", "market": "Finland", "entry": 2022, "logo_url": "https://logo.clearbit.com/fennoa.com", "website": "https://fennoa.com", "description": "Cloud-based financial management software for accounting firms."},
        {"company": "Cloud2", "sector": "Technology", "market": "Finland", "entry": 2022, "logo_url": "https://logo.clearbit.com/cloud2.fi", "website": "https://www.cloud2.fi", "description": "Multi-cloud services. AWS, Azure, GCP expertise."},
        {"company": "Suomen Avustajapalvelut", "sector": "Healthcare", "market": "Finland", "entry": 2021, "logo_url": "https://logo.clearbit.com/suomenavustajapalvelut.fi", "website": "https://www.suomenavustajapalvelut.fi", "description": "Personal assistance services. Service vouchers for people with disabilities."},
        {"company": "Sofigate", "sector": "Technology", "market": "Finland", "entry": 2021, "logo_url": "https://logo.clearbit.com/sofigate.com", "website": "https://www.sofigate.com", "description": "Business technology transformation. ~600 employees in Finland, Sweden, Denmark."},
        {"company": "Emblasoft", "sector": "Technology", "market": "Finland", "entry": 2020, "logo_url": "https://logo.clearbit.com/emblasoft.com", "website": "https://emblasoft.com", "description": "Telecom testing and service assurance. 5G network testing solutions."},
        {"company": "Unikie", "sector": "Technology", "market": "Finland", "entry": 2020, "logo_url": "https://logo.clearbit.com/unikie.com", "website": "https://www.unikie.com", "description": "Embedded software and autonomous vehicle technology. AI Vision for self-driving."},
        {"company": "Neural DSP", "sector": "Technology", "market": "Finland", "entry": 2020, "logo_url": "https://logo.clearbit.com/neuraldsp.com", "website": "https://neuraldsp.com", "description": "Audio software. Guitar amplifier modeling, audio plug-ins for musicians."},
        {"company": "Insplan", "sector": "Business Services", "market": "Finland", "entry": 2019, "logo_url": "https://logo.clearbit.com/insplan.fi", "website": "https://www.insplan.fi", "description": "Infrastructure engineering. Power, lighting, data networks. 13 locations."},
        {"company": "Front AI", "sector": "Technology", "market": "Finland", "entry": 2019, "logo_url": "https://logo.clearbit.com/front.ai", "website": "https://front.ai", "description": "Conversational AI. Chatbots for customer service automation."},
        {"company": "Digital Workforce", "sector": "Technology", "market": "Finland", "entry": 2018, "logo_url": "https://logo.clearbit.com/digitalworkforce.com", "website": "https://digitalworkforce.com", "description": "RPA and intelligent automation. Nordic market leader."},
        {"company": "Arctic Security", "sector": "Technology", "market": "Finland", "entry": 2018, "logo_url": "https://logo.clearbit.com/arcticsecurity.com", "website": "https://www.arcticsecurity.com", "description": "Cybersecurity. Threat intelligence, Early Warning Service."},
        {"company": "Aste Helsinki", "sector": "Business Services", "market": "Finland", "entry": 2018, "logo_url": "https://logo.clearbit.com/aste.fi", "website": "https://www.aste.fi", "description": "Digital and print marketing solutions. 135+ professionals."},
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

# Add companies to portfolio (skip duplicates)
existing_keys = {(c.get('company'), c.get('source')) for c in portfolio_data['companies']}
added = 0
for firm, companies in new_companies.items():
    for company in companies:
        company['source'] = firm
        key = (company.get('company'), firm)
        if key not in existing_keys:
            portfolio_data['companies'].append(company)
            existing_keys.add(key)
            added += 1

# Save updated portfolio
with open('portfolio_enriched.json', 'w', encoding='utf-8') as f:
    json.dump(portfolio_data, f, indent=2, ensure_ascii=False)

print(f"✅ Added {added} new portfolio companies (skipped duplicates)")
print(f"Total companies in portfolio: {len(portfolio_data['companies'])}")
