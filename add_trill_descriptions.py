#!/usr/bin/env python3
"""Add company descriptions for Trill Impact portfolio companies."""

import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'portfolio_enriched.json')

# Descriptions for Trill Impact portfolio companies (based on public info)
TRILL_DESCRIPTIONS = {
    'Nordomatic': 'Nordomatic is a Nordic leader in building automation, energy optimization, and smart building solutions. The company provides integrated systems for HVAC, lighting, and energy management, helping commercial and public buildings reduce energy consumption and improve indoor climate. Acquired by Trill Impact from Adelis in 2022.',
    'ILT Education': 'ILT Education is a Swedish provider of vocational and professional training, focusing on skills development for the labor market. The company offers courses and programs in areas such as healthcare, technology, and trades, supporting lifelong learning and workforce readiness.',
    'Mesalvo': 'Mesalvo is a German healthcare company providing medical devices and solutions. The company focuses on innovative products that improve patient outcomes and clinical workflows in healthcare settings across Europe.',
    'Allurity': 'Allurity is a Swedish cybersecurity company offering managed detection and response (MDR) services. The company helps organizations protect against cyber threats through 24/7 monitoring, threat intelligence, and incident response capabilities.',
    'Karriere Tutor': 'Karriere Tutor is a German education technology company offering online tutoring and career coaching services. The platform connects students and professionals with qualified tutors for personalized learning and career development.',
    'Infrakraft': 'Infrakraft is a Swedish infrastructure company specializing in electrical grid solutions and renewable energy integration. The company supports the transition to sustainable energy through grid modernization and smart infrastructure.',
    'Komet': 'Komet is an Austrian agricultural technology company manufacturing precision farming equipment. The company produces seed drills and tillage machinery that help farmers improve efficiency and sustainability in crop production.',
    'Delivery Associates': 'Delivery Associates is a UK-based consultancy that helps governments and public sector organizations deliver results. Founded by Sir Michael Barber, the company supports implementation of major policy initiatives and public service improvements.',
    'Renewtech': 'Renewtech is a Danish technology company focused on renewable energy and sustainability solutions. The company supports the green transition through innovative products and services in the clean tech sector.',
    'TT Medic': 'TT Medic is an Austrian MedTech company developing medical devices and healthcare solutions. The company focuses on products that improve patient care and clinical efficiency.',
    'Primutec': 'Primutec is a Dutch business services company. The company provides specialized services to support industrial and commercial operations in the Benelux region.',
    'Noova Energy Systems': 'Noova Energy Systems is a Norwegian company in the energy and business services sector. The company supports the transition to sustainable energy solutions in the Nordic market.',
    'Cinclus Pharma': 'Cinclus Pharma is a Swedish pharmaceutical company developing treatments for gastrointestinal disorders. The company focuses on innovative therapies for conditions such as gastroesophageal reflux disease (GERD).',
    'May Health': 'May Health is a French MedTech company developing digital health solutions. The company focuses on women\'s health and wellness through technology-enabled care.',
    'Soil Capital': 'Soil Capital is a Belgian agricultural company that helps farmers transition to regenerative practices. The company provides carbon insetting programs and soil health monitoring to support sustainable agriculture.',
    'Rail-Flow': 'Rail-Flow is a German company providing logistics and rail freight services. The company supports sustainable transportation through rail-based freight solutions.',
    'tado°': 'tado° is a German smart home company specializing in intelligent heating and cooling control. The Munich-based company offers smart thermostats and energy management solutions that help homeowners reduce energy consumption.',
    'Open Cosmos': 'Open Cosmos is a UK-based space technology company that designs, builds, and operates satellites. The company provides end-to-end space missions for Earth observation, connectivity, and scientific research.',
    'MinervaX': 'MinervaX is a Danish pharmaceutical company developing vaccines. The company focuses on innovative vaccine candidates for infectious diseases.',
}

def main():
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    companies = data.get('companies', [])
    updated = 0
    
    for c in companies:
        if c.get('source') != 'Trill Impact':
            continue
        name = c.get('company', '')
        desc = TRILL_DESCRIPTIONS.get(name)
        if desc:
            existing = c.get('detailed_description', '') or c.get('description', '')
            if not existing or len(existing) < 50:
                c['detailed_description'] = desc
                updated += 1
                print(f"  Added description for {name}")
    
    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\nUpdated {updated} Trill Impact company descriptions.")

if __name__ == '__main__':
    main()
