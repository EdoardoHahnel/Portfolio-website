#!/usr/bin/env python3
"""Verify portfolio data against expected counts"""
import json

with open('portfolio_enriched.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

companies = data.get('companies', [])

# Count by source and status
sources = {}
for c in companies:
    src = c.get('source', 'Unknown')
    status = c.get('status', 'Active')
    if src not in sources:
        sources[src] = {'Active': [], 'Exited': [], 'Other': []}
    if status == 'Active':
        sources[src]['Active'].append(c.get('company'))
    elif status == 'Exited':
        sources[src]['Exited'].append(c.get('company'))
    else:
        sources[src]['Other'].append(c.get('company'))

# Key firms to verify
for firm in ['MVI', 'Nalka', 'Impilo', 'IK Partners', 'Nordic Capital']:
    if firm in sources:
        active = sources[firm]['Active']
        exited = sources[firm]['Exited']
        print(f"\n{firm}:")
        print(f"  Active: {len(active)}")
        for name in sorted(active):
            print(f"    - {name}")
        if exited:
            print(f"  Exited: {len(exited)}")
            for name in sorted(exited):
                print(f"    - {name}")
