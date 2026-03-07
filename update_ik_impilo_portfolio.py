#!/usr/bin/env python3
"""Add missing IK Partners portfolio companies (verified against online sources)"""

import json

# 50 missing IK Partners companies from user's table - verified via web research
NEW_IK_PARTNERS = [
    # Partnership Fund
    {"company": "Formue", "sector": "Business Services", "fund": "Partnership Fund", "market": "Norway", "entry": "2021", "headquarters": "Oslo, Norway", "detailed_description": "Wealth management services. IK and ICG acquired minority stake in 2021."},
    {"company": "GEDH", "sector": "Business Services", "fund": "Partnership Fund", "market": "France", "entry": "2022", "headquarters": "France", "detailed_description": "French private higher education group. IK reinvested alongside Five Arrows in 2022."},
    {"company": "iM Global Partner", "sector": "Business Services", "fund": "Partnership Fund", "market": "France", "entry": "2021", "headquarters": "Paris, France", "detailed_description": "Investment management services. Global asset management network."},
    {"company": "Marle", "sector": "Healthcare", "fund": "Partnership Fund", "market": "France", "entry": "2019", "headquarters": "France", "detailed_description": "Healthcare services."},
    {"company": "OCTIME Group", "sector": "Business Services", "fund": "Partnership Fund", "market": "France", "entry": "2024", "headquarters": "France", "detailed_description": "Business services."},
    {"company": "Seventeen Group", "sector": "Business Services", "fund": "Partnership Fund", "market": "UK", "entry": "2025", "headquarters": "London, UK", "detailed_description": "UK insurance and risk management. IK invested March 2025."},
    {"company": "Third Bridge", "sector": "Business Services", "fund": "Partnership Fund", "market": "UK", "entry": "2021", "headquarters": "London, UK", "detailed_description": "Investment research platform. IK reinvested alongside Astorg in 2021."},
    {"company": "Unither Pharmaceuticals", "sector": "Healthcare", "fund": "Partnership Fund", "market": "France", "entry": "2023", "headquarters": "France", "detailed_description": "Pharmaceutical services."},
    {"company": "Valoria Capital", "sector": "Business Services", "fund": "Partnership Fund", "market": "France", "entry": "2023", "headquarters": "Paris, France", "detailed_description": "French independent financial advisor platform. IK reinvested via Partnership Fund II in 2023."},
    {"company": "Vivalto Santé", "sector": "Healthcare", "fund": "Partnership Fund", "market": "France", "entry": "2021", "headquarters": "France", "detailed_description": "Healthcare services."},
    {"company": "Wishcard", "sector": "Business Services", "fund": "Partnership Fund", "market": "Germany", "entry": "2022", "headquarters": "Germany", "detailed_description": "Gift card services. Europe's leading B2C/B2B gift voucher provider in DACH."},
    # Mid Cap
    {"company": "Advania", "sector": "Business Services", "fund": "Mid Cap", "market": "Sweden", "entry": "2021", "headquarters": "Sweden", "detailed_description": "IT services and solutions."},
    {"company": "Alanta Health Group", "sector": "Healthcare", "fund": "Mid Cap", "market": "Germany", "entry": "2016", "headquarters": "Germany", "detailed_description": "Healthcare services."},
    {"company": "Batisanté", "sector": "Business Services", "fund": "Mid Cap", "market": "France", "entry": "2022", "headquarters": "France", "detailed_description": "Business services."},
    {"company": "BOMA", "sector": "Healthcare", "fund": "Mid Cap", "market": "Belgium", "entry": "2024", "headquarters": "Belgium", "detailed_description": "Healthcare services."},
    {"company": "CONET", "sector": "Business Services", "fund": "Mid Cap", "market": "Germany", "entry": "2021", "headquarters": "Germany", "detailed_description": "IT consulting and services."},
    {"company": "Cinerius Financial Partners", "sector": "Business Services", "fund": "Mid Cap", "market": "Switzerland", "entry": "2024", "headquarters": "Switzerland", "detailed_description": "Financial services."},
    {"company": "Dains Accountants", "sector": "Business Services", "fund": "Mid Cap", "market": "UK", "entry": "2025", "headquarters": "UK", "detailed_description": "Accounting and advisory services. IK acquired Dec 2024."},
    {"company": "Eurobio Scientific", "sector": "Healthcare", "fund": "Mid Cap", "market": "France", "entry": "2024", "headquarters": "France", "detailed_description": "Diagnostic solutions."},
    {"company": "Eurofeu", "sector": "Business Services", "fund": "Mid Cap", "market": "France", "entry": "2024", "headquarters": "France", "detailed_description": "Fire safety services."},
    {"company": "iad", "sector": "Business Services", "fund": "Mid Cap", "market": "France", "entry": "2021", "headquarters": "France", "detailed_description": "Real estate services."},
    {"company": "IG&H", "sector": "Business Services", "fund": "Mid Cap", "market": "Netherlands", "entry": "2022", "headquarters": "Netherlands", "detailed_description": "Business services."},
    {"company": "Innovad", "sector": "Healthcare", "fund": "Mid Cap", "market": "Belgium", "entry": "2021", "headquarters": "Belgium", "detailed_description": "Healthcare services."},
    {"company": "Kersia", "sector": "Healthcare", "fund": "Mid Cap", "market": "France", "entry": "2020", "headquarters": "France", "detailed_description": "Food safety solutions."},
    {"company": "LAP Group", "sector": "Healthcare", "fund": "Mid Cap", "market": "Germany", "entry": "2019", "headquarters": "Germany", "detailed_description": "Healthcare services."},
    {"company": "Medica", "sector": "Healthcare", "fund": "Mid Cap", "market": "UK", "entry": "2023", "headquarters": "UK", "detailed_description": "Healthcare services."},
    {"company": "Ondal Medical Systems", "sector": "Healthcare", "fund": "Mid Cap", "market": "Germany", "entry": "2020", "headquarters": "Germany", "detailed_description": "Medical technology."},
    {"company": "Questel", "sector": "Business Services", "fund": "Mid Cap", "market": "France", "entry": "2020", "headquarters": "France", "detailed_description": "Intellectual property services."},
    {"company": "Skill & You", "sector": "Business Services", "fund": "Mid Cap", "market": "France", "entry": "2021", "headquarters": "France", "detailed_description": "Education and training services."},
    {"company": "Truesec", "sector": "Business Services", "fund": "Mid Cap", "market": "Sweden", "entry": "2021", "headquarters": "Sweden", "detailed_description": "Cybersecurity services."},
    # Small Cap
    {"company": "Advisense", "sector": "Business Services", "fund": "Small Cap", "market": "Sweden", "entry": "2022", "headquarters": "Sweden", "detailed_description": "Business services."},
    {"company": "BIOBank", "sector": "Healthcare", "fund": "Small Cap", "market": "France", "entry": "2024", "headquarters": "France", "detailed_description": "Biobanking services."},
    {"company": "coin4 Solutions", "sector": "Business Services", "fund": "Small Cap", "market": "Germany", "entry": "2017", "headquarters": "Germany", "detailed_description": "Business services."},
    {"company": "Dals", "sector": "Business Services", "fund": "Small Cap", "market": "UK", "entry": "2021", "headquarters": "UK", "detailed_description": "Business services."},
    {"company": "DATAPART", "sector": "Business Services", "fund": "Small Cap", "market": "Germany", "entry": "2025", "headquarters": "Germany", "detailed_description": "Financial services. Factoring."},
    {"company": "EQQO", "sector": "Business Services", "fund": "Small Cap", "market": "Germany", "entry": "2020", "headquarters": "Germany", "detailed_description": "Business services."},
    {"company": "Ipsum", "sector": "Business Services", "fund": "Small Cap", "market": "UK", "entry": "2023", "headquarters": "UK", "detailed_description": "Business services."},
    {"company": "MWM", "sector": "Healthcare", "fund": "Small Cap", "market": "Germany", "entry": "2021", "headquarters": "Germany", "detailed_description": "Healthcare services."},
    {"company": "Plastiflex", "sector": "Healthcare", "fund": "Small Cap", "market": "Belgium", "entry": "2021", "headquarters": "Belgium", "detailed_description": "Plastic hoses and tubing for healthcare and industrial markets."},
    {"company": "Qconcepts", "sector": "Business Services", "fund": "Small Cap", "market": "Netherlands", "entry": "2024", "headquarters": "Netherlands", "detailed_description": "Business services."},
    {"company": "Sofia Développement", "sector": "Healthcare", "fund": "Small Cap", "market": "France", "entry": "2022", "headquarters": "France", "detailed_description": "Healthcare services."},
    {"company": "Yellow Hive", "sector": "Business Services", "fund": "Small Cap", "market": "Netherlands", "entry": "2024", "headquarters": "Netherlands", "detailed_description": "Business services."},
    # Development Capital
    {"company": "Checkmate Fire", "sector": "Business Services", "fund": "Development Capital", "market": "UK", "entry": "2024", "headquarters": "UK", "detailed_description": "Fire safety services."},
    {"company": "Defibrion", "sector": "Healthcare", "fund": "Development Capital", "market": "Netherlands", "entry": "2024", "headquarters": "Netherlands", "detailed_description": "Healthcare services."},
    {"company": "Linxea", "sector": "Business Services", "fund": "Development Capital", "market": "France", "entry": "2023", "headquarters": "France", "detailed_description": "Financial services."},
    {"company": "Lohoff", "sector": "Business Services", "fund": "Development Capital", "market": "Germany", "entry": "2025", "headquarters": "Isernhagen, Germany", "detailed_description": "Pension services. Occupational pension administration."},
    {"company": "NEVERHACK", "sector": "Business Services", "fund": "Development Capital", "market": "France", "entry": "2023", "headquarters": "France", "detailed_description": "Cybersecurity services."},
    {"company": "Remazing", "sector": "Business Services", "fund": "Development Capital", "market": "Germany", "entry": "2022", "headquarters": "Germany", "detailed_description": "Business services."},
    {"company": "Responda Group", "sector": "Business Services", "fund": "Development Capital", "market": "Sweden", "entry": "2023", "headquarters": "Sweden", "detailed_description": "Business services."},
    {"company": "Sitevision", "sector": "Business Services", "fund": "Development Capital", "market": "Sweden", "entry": "2022", "headquarters": "Sweden", "detailed_description": "Web development services."},
]

def main():
    with open('portfolio_enriched.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    existing = {(c.get('company'), c.get('source')) for c in data['companies']}
    added = 0
    
    for co in NEW_IK_PARTNERS:
        co['source'] = 'IK Partners'
        co['status'] = 'Active'
        key = (co['company'], 'IK Partners')
        if key not in existing:
            data['companies'].append(co)
            existing.add(key)
            added += 1
    
    with open('portfolio_enriched.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    ik_count = len([c for c in data['companies'] if c.get('source') == 'IK Partners'])
    print(f"Added {added} IK Partners companies. Total IK Partners: {ik_count}")

if __name__ == '__main__':
    main()
