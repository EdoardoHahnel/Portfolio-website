#!/usr/bin/env python3
import requests
import json

try:
    response = requests.get('http://localhost:5000/api/portfolio')
    print('Status:', response.status_code)
    
    if response.status_code == 200:
        data = response.json()
        summa_companies = [c for c in data.get('companies', []) if c.get('source') == 'Summa Equity']
        print(f'API Summa companies: {len(summa_companies)}')
        for company in summa_companies[:5]:
            print(f'- {company["company"]}')
    else:
        print('API not responding')
        
except Exception as e:
    print(f'Error: {e}')
    print('Server might not be running')
