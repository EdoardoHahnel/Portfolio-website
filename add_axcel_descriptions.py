#!/usr/bin/env python3
"""Add company descriptions for Axcel portfolio companies."""

import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'portfolio_enriched.json')

# Descriptions for Axcel portfolio companies (based on public info)
AXCEL_DESCRIPTIONS = {
    'Bekk': 'Bekk is a Norwegian technology consultancy specializing in digital transformation, software development, and agile delivery. The company helps organizations build better digital products and services through expert teams in design, development, and strategy.',
    'LS Retail': 'LS Retail is a leading independent provider of vertical software for retail and hospitality, built on the Microsoft Dynamics platform. Headquartered in Iceland, the company serves retailers and hoteliers worldwide with point-of-sale, inventory management, and business intelligence solutions.',
    'AGRD Partners': 'AGRD Partners is a Swedish legal group formed in 2025 by six leading business law firms: Allié, Born, Morris Law, Next Law, Synch, and TM & Partners. The group operates with around 250 professionals across eight offices, focusing on corporate and commercial legal advice including M&A, banking and finance, technology, real estate, and employment law. Backed by Axcel.',
    'Nordic Tyre Group': 'Nordic Tyre Group is the leading independent tyre wholesaler in the Nordics and Baltics. The technology-driven platform serves over 10,000 customers with a comprehensive range of tyres and related services.',
    'Accru Partners': 'Accru Partners is an alliance of independent accounting, tax, audit, and advisory firms headquartered in Sweden. The company combines the autonomy and local knowledge of independent firms with the stability and economies of scale of a larger organization, with 33 partner firms, over 800 employees, and 45+ offices across Sweden, Denmark, Norway, the UK, and France.',
    'Acurum Group': 'Acurum Group is a Nordic provider of property well-being services headquartered in Sweden. The company offers testing, inspection, and certification (TIC), as well as maintenance and incident management related to indoor air quality, moisture, and piping. Established by Axcel in 2024, the group united 15 companies across Sweden and Norway.',
    'Elcor': 'Elcor is Northern Europe\'s leading full-service supplier of electrical panels and intelligent energy solutions. The Danish company is a precision manufacturer specializing in electrical panels and integrated electrical solutions for industrial applications, with over 1,100 employees across 13 sites in the Nordics serving pharma, data centers, food and beverage, marine, and energy infrastructure.',
    'Progrits': 'Progrits is a Swedish technology company providing software solutions. The company supports businesses with digital tools and platforms for improved operations and growth.',
    'XPartners': 'XPartners is a Swedish business services company. The company provides consulting and advisory services to support corporate development and operational excellence.',
    'Oral Care': 'Oral Care is a Swedish dental care chain founded in 1989, operating 31 dental clinics across Sweden and providing home dental care in 8 regions—the largest home dental care provider in Sweden. The company specializes in quality dental care with particular focus on elderly and disabled individuals through mobile services. Acquired by Axcel in 2022.',
    'The Nutriment Company': 'The Nutriment Company is Europe\'s leading provider of natural premium pet nutrition with Swedish headquarters. The company specializes in raw pet food, treats, chews, and supplements, with 10+ premium brands, 16 production facilities across Europe, and presence in 20 international markets. Committed to sustainability and a UN Global Compact signatory.',
    'NTI Group': 'NTI Group is a Danish technology company providing IT solutions and services. The group supports businesses with infrastructure, software, and digital transformation initiatives across the Nordic region.',
    'itm8': 'itm8 is a Danish IT company with the tagline "Building Today\'s and Tomorrow\'s IT. Together." The company has over 1,700 employees across 4 countries and 19 offices, serving more than 5,000 customers with cloud and infrastructure, cybersecurity, business systems, and IT operations. A top-5 Microsoft partner in Denmark.',
    'BullWall': 'BullWall is a Danish cybersecurity company focused on protecting critical IT infrastructure from ransomware. Founded in 2016 and headquartered in Vejle, the company provides rapid containment of active attacks and prevents unauthorized server intrusion, serving over 1,000 customers across 19 countries.',
    'Init': 'Init is a Danish industrial IT and automation company comprising 16 companies across Scandinavia and Europe. Founded in 2022, the group has over 800 employees in 35 offices across 8 countries, delivering tailored automation solutions including SCADA/PLC/MES, data collection, operational optimization, and facility automation for manufacturing, food & beverage, energy, and life science.',
    'DANX Carousel Group': 'DANX Carousel Group is a leading European logistics specialist focused on time-critical solutions. The group operates across 35 countries with 18 offices, employing over 1,500 professionals and serving 500+ customers. Formed in 2022 through the merger of Danish DANX (founded 1992) and UK-based Carousel Logistics, the group is known for 99.5% on-time performance in spare parts delivery.',
    'Vetopia': 'Vetopia is a leading European veterinary group headquartered in Denmark. Established in 2021 through the merger of Danish VetGruppen and Norwegian EMPET, it has grown to become the third-largest pan-European veterinary group with over 200 clinics and 3,000+ employees across nine countries. The group\'s purpose is to be the best home for veterinary professionals.',
    'emagine': 'emagine is a high-end business and IT consulting company headquartered in Copenhagen, founded in 1986. With over 900 permanent employees across 10 countries and 500+ clients worldwide, the company offers advisory and solutions, staff augmentation, nearshoring, managed services, and training. Specializes in strategy, agile methodologies, cloud, and regulatory compliance.',
    'Edda Group': 'Edda Group is a Danish business services company. The group provides specialized services to support corporate operations and growth across the Nordic region.',
    'Currentum': 'Currentum is a Swedish group of installation companies operating across Sweden, Norway, and Finland. Founded in 1990, the group provides building services including ventilation, electrical installation, plumbing, sprinkler systems, and energy and building automation. The group consists of approximately 80 companies run by independent entrepreneurs, with around 350+ employees.',
    'SuperOffice': 'SuperOffice is a leading provider of CRM software to Northern European SMEs. The Norwegian company offers SaaS solutions for sales, marketing, and customer care, helping businesses manage customer relationships and drive growth.',
    'Phase One': 'Phase One is a Danish company manufacturing medium format cameras and imaging solutions for professional photographers. The company is known for high-resolution digital backs and capture systems used in commercial, fine art, and industrial photography.',
    'Capture One': 'Capture One is a Danish company providing professional photo editing and raw image processing software. The software is widely used by professional photographers for its powerful editing tools, color grading, and tethered shooting capabilities.',
    'GUBI': 'GUBI is a Danish design furniture company founded in 1967. The company creates and curates contemporary furniture and lighting, collaborating with renowned designers and producing iconic pieces for residential and commercial spaces worldwide.',
}

def main():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    companies = data.get('companies', [])
    updated = 0
    
    for c in companies:
        if c.get('source') != 'Axcel':
            continue
        name = c.get('company', '')
        desc = AXCEL_DESCRIPTIONS.get(name)
        if desc:
            existing = c.get('detailed_description', '') or c.get('description', '')
            if not existing or len(existing) < 50:
                c['detailed_description'] = desc
                updated += 1
                print(f"  Added description for {name}")
    
    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\nUpdated {updated} Axcel company descriptions.")

if __name__ == '__main__':
    main()
