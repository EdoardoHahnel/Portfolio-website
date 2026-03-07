#!/usr/bin/env python3
"""
Enhance company descriptions for Adelis Equity, Amplio, Impilo, and Axcel portfolio companies.
Replaces short or generic descriptions with more informative 2-3 sentence descriptions.
"""

import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'portfolio_enriched.json')

# Minimum length to consider a description "short" (characters)
MIN_DESC_LENGTH = 120

# Improved descriptions: company name -> enhanced description
ENHANCED_DESCRIPTIONS = {
    # === ADELIS EQUITY ===
    'DLVRY': 'DLVRY is a leading Nordic foodservice supplier headquartered in Stockholm. The company provides food and beverage products, equipment, and services to restaurants, hotels, canteens, and institutional customers across Sweden and the Nordics. Adelis acquired the company in 2021 to build a platform in the fragmented foodservice distribution market.',
    'WP Westpack': 'WP Westpack is a European manufacturer of custom-made packaging solutions for the jewelry, watch, and eyewear industries. Headquartered in Antwerp, Belgium, the company produces premium packaging for luxury brands including cases, boxes, and display materials. Adelis invested in 2022.',
    'Pixelz': 'Pixelz is a global provider of AI-powered post-production services for creative assets, with particular focus on the fashion and e-commerce industries. The company offers image retouching, background removal, and product photography automation, helping brands scale their visual content production. Adelis acquired Pixelz in 2022.',
    'Säkra': 'Säkra was a Swedish pension and insurance broker providing advisory services to individuals and businesses. The company offered pension planning, life insurance, and employee benefits solutions. Adelis invested in 2020 and exited in 2022.',
    'Valamis': 'Valamis is a leading global corporate learning platform headquartered in Helsinki. The company provides learning experience platforms (LXP) and learning management systems (LMS) that help organizations deliver, track, and personalize employee training and development. Adelis invested in 2021.',
    'Circura Danmark': 'Circura Danmark provides building rehabilitation and renewal services across Denmark. Part of Circura Group, the Nordic market leader in building renewal, the company specializes in facade renovation, roofing, and comprehensive building maintenance for housing cooperatives and commercial properties. Adelis invested in 2022.',
    'netIP': 'netIP is a leading Danish provider of managed IT services headquartered in Copenhagen. The company delivers IT infrastructure, networking, cloud solutions, and managed services to mid-sized businesses across Denmark. Adelis invested in 2022.',
    'Aderian': 'Aderian is a leading IT services provider to mid-sized customers in Sweden and Norway. The company offers managed IT, cloud migration, digital transformation, and cybersecurity services, helping businesses modernize their technology infrastructure. Adelis invested in 2023.',
    'Diakrit': 'Diakrit is a global provider of digital property marketing content and technology. The Malmö-based company serves real estate developers and property marketers worldwide with 3D visualizations, virtual tours, and marketing technology that helps sell properties before completion. Adelis invested in 2022.',
    'Kanari': 'Kanari is a Nordic software company providing digital solutions. The company supports businesses with technology platforms and services across the Nordic region. Adelis invested in 2021.',

    # === AMPLIO ===
    'S R Intelligence (SRI)': 'S R Intelligence (SRI) is a leading Swedish specialist within regulatory compliance and personnel security. The company provides background checks, security vetting, and compliance services to employers across Sweden. Amplio invested in 2025.',
    'Tedge': 'Tedge is a Swedish platform company within energy optimization. The Örebro-based company helps businesses and property owners reduce energy consumption and costs through smart monitoring and control solutions. Amplio invested in 2023.',
    'Co-native': 'Co-native is a leading Swedish group of cloud specialists. The company helps organizations with cloud migration, Microsoft Azure, and modern software development, combining deep technical expertise with business understanding. Amplio invested in 2022.',
    'SELATEK': 'SELATEK is a leading Nordic provider of security solutions, electrical installation, and automation. Headquartered in Hässleholm, Sweden, the company serves commercial and industrial customers with integrated security systems, electrical contracting, and building automation. Amplio invested in 2021.',
    'Multisoft': 'Multisoft is a Swedish low-code software provider enabling rapid application development. The company\'s platform allows businesses to build custom applications without extensive coding. Under Segulah V, managed by Amplio since 2021.',
    'IT-Total': 'IT-Total is a Nordic IT infrastructure services provider. The company delivers managed IT, cloud services, and infrastructure solutions to mid-market customers. Under Segulah V, managed by Amplio since 2019.',
    'Hermes': 'Hermes is a provider of advanced medical imaging software for the Nordic healthcare sector. The company\'s solutions support radiologists and clinicians with diagnostic imaging and workflow tools. Under Segulah V, managed by Amplio since 2016.',
    'Pelly Group': 'Pelly Group is a manufacturer of functional storage components for the kitchen and wardrobe markets. Headquartered in Jönköping, Sweden, the company produces drawer systems, interior fittings, and storage solutions for furniture manufacturers and retailers. Under Segulah V, managed by Amplio since 2018.',

    # === IMPILO ===
    'Immedica': 'Immedica is a Nordic pharmaceutical company focused on the launch, commercialization, and distribution of orphan and niche specialty pharmaceuticals. The company brings rare disease treatments to patients across the Nordics and Europe. Impilo invested in 2018.',
    'Humana': 'Humana is the leading Nordic private care provider, offering elderly care, disability services, and individual and family care across Sweden. With thousands of employees, the company operates care homes and provides home care services. Impilo invested in 2019.',
    'Euro Accident': 'Euro Accident provides health-related insurance and employee wellbeing solutions in Sweden. The company offers occupational health services, insurance products, and wellness programs to employers. Impilo invested in 2019.',
    'Scantox': 'Scantox is a Nordic pre-clinical contract research organization (CRO) headquartered in Lille Skensved, Denmark. The company provides toxicology, safety pharmacology, and regulatory support services to pharmaceutical and chemical companies. Impilo invested in 2021.',
    'tandlægen.dk': 'tandlægen.dk is a leading Danish dental care chain operating clinics across Denmark. Headquartered in Lyngby, the company provides general and specialist dental care to private patients. Impilo invested in 2021.',
    'Lowenco': 'Lowenco provides ultra-low temperature storage and logistics services for the biopharma industry. Based in Vamdrup, Denmark, the company offers cold chain solutions for biologics, vaccines, and temperature-sensitive pharmaceuticals. Impilo invested in 2022.',
    'Pelago Bioscience': 'Pelago Bioscience is a Swedish drug discovery CRO specializing in CETSA (Cellular Thermal Shift Assay) technology. The Solna-based company helps pharma and biotech companies identify drug targets and validate mechanisms of action. Impilo invested in 2023.',
    'VaccinDirekt': 'VaccinDirekt is the largest Nordic retail vaccination provider, offering travel vaccines and immunization services through pharmacies and healthcare outlets. The company makes vaccinations accessible to the general public. Impilo invested in 2021.',
    'Decon': 'Decon develops and manufactures power-assisted wheelchair solutions in Hyltebruk, Sweden. The company\'s products enhance mobility and independence for wheelchair users. Impilo invested in 2023.',
    'Avia Pharma': 'Avia Pharma is a North European platform for over-the-counter (OTC) and prescription (Rx) pharmaceuticals. The Stockholm-based company focuses on niche products and regional brands. Impilo invested in 2024.',
    'Stille': 'Stille is a Swedish manufacturer of surgical instruments and surgical tables. Based in Eskilstuna, the company has supplied the global healthcare sector since 1848. Impilo acquired the company from Demant in 2024.',
    'Qufora': 'Qufora develops and manufactures transanal irrigation (TAI) products and collecting devices for patients with bowel dysfunction. The Danish MedTech company, based in Allerød, improves quality of life for people with spinal cord injury, multiple sclerosis, and other conditions. Impilo invested in 2024.',
    'Oticon Medical': 'Oticon Medical provides bone-anchored hearing solutions for people with conductive hearing loss, mixed hearing loss, or single-sided deafness. Impilo acquired the business from Demant in 2025.',

    # === AXCEL ===
    'Progrits': 'Progrits is a Swedish technology company providing software solutions for businesses. The company supports organizations with digital tools and platforms to improve operations, efficiency, and growth. Axcel invested in 2023.',
    'XPartners': 'XPartners is a Swedish business services company providing consulting and advisory services. The company supports corporate development, operational excellence, and strategic initiatives. Axcel invested in 2023.',
    'NTI Group': 'NTI Group is a Danish technology company providing IT solutions and services across the Nordic region. The group supports businesses with infrastructure, software, cloud, and digital transformation. Axcel invested in 2022.',
    'Edda Group': 'Edda Group is a Danish business services company providing specialized services across the Nordic region. The group supports corporate operations, growth, and operational excellence. Axcel invested in 2020.',
}

# Additional descriptions for companies that may have slightly longer but still generic text
ADDITIONAL_ENHANCEMENTS = {
    'Circura': 'Circura is the Nordic market leader in building renewal services. The group provides building rehabilitation, facade renovation, roofing, and comprehensive maintenance across Sweden, Denmark, and Norway. With revenue exceeding SEK 10 billion, Circura serves housing cooperatives, property owners, and commercial clients. Adelis invested in 2021.',
    'Kanari': 'Kanari is a Nordic software and technology company. The company provides digital solutions and services to businesses across the Nordic region. Adelis invested in 2021.',
}


def main():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    companies = data.get('companies', [])
    target_sources = ['Adelis Equity', 'Amplio', 'Impilo', 'Axcel']
    updated = 0

    for c in companies:
        source = c.get('source', '')
        if source not in target_sources:
            continue

        name = c.get('company', '')
        existing = (c.get('detailed_description') or c.get('description') or '').strip()

        # Check both main and additional enhancements
        desc = ENHANCED_DESCRIPTIONS.get(name) or ADDITIONAL_ENHANCEMENTS.get(name)
        if desc:
            # Update if: no description, or description is short, or we have a better one
            if not existing or len(existing) < MIN_DESC_LENGTH:
                c['detailed_description'] = desc
                if c.get('description') and len(c['description']) < MIN_DESC_LENGTH:
                    c['description'] = desc
                updated += 1
                print(f"  Enhanced: {name} ({source})")

    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nEnhanced {updated} company descriptions.")


if __name__ == '__main__':
    main()
