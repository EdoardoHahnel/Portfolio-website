import json

# Load existing data
with open('pe_firms_database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# New firms to add
new_firms = {
    "CapMan": {
        "name": "CapMan",
        "logo_url": "https://logo.clearbit.com/capman.com",
        "website": "https://www.capman.com",
        "headquarters": "Helsinki, Finland",
        "founded": 1989,
        "aum": "€4.5 billion",
        "employees": "200+",
        "offices": ["Helsinki", "Stockholm", "Copenhagen", "Oslo", "London"],
        "description": "CapMan is a leading Nordic private equity firm managing assets across Buyout, Growth Equity, Infrastructure, Real Estate, and Russian-focused strategies.",
        "investment_focus": {
            "sectors": ["Services", "Technology", "Healthcare", "Industrial"],
            "geography": ["Nordic region", "Eastern Europe"],
            "deal_size": "€30M - €500M",
            "investment_type": ["Mid-market buyouts", "Growth equity", "Real estate", "Infrastructure"]
        },
        "team": [
            {"name": "Joakim Simonen", "title": "Chairman and Senior Managing Partner", "location": "Helsinki"},
            {"name": "Petri Suuronen", "title": "Managing Partner, Buyout", "location": "Helsinki"},
            {"name": "Tom Lindström", "title": "Managing Partner, Growth", "location": "Stockholm"},
            {"name": "Hannu Törmänen", "title": "Managing Partner, Real Estate", "location": "Helsinki"},
            {"name": "Erik Lekander", "title": "Managing Partner, Infrastructure", "location": "Stockholm"}
        ],
        "recent_activity": "Q3 2024: CapMan Buyout XI launched and oversubscribed. Recent exits: Scandic Hotels sale (€2.1B), JM AB divestment. New investments: Healthcare services platform (€200M), Technology SaaS company (€150M). CapMan Real Estate acquires logistics portfolio (€300M). Infrastructure fund invests in renewable energy projects. Strong portfolio performance across all strategies."
    },
    "Celero": {
        "name": "Celero",
        "logo_url": "https://ui-avatars.com/api/?name=Celero&background=7c2d12&color=ffffff&size=64",
        "website": "https://www.celero.eu",
        "headquarters": "Stockholm, Sweden",
        "founded": 2015,
        "aum": "€500 million",
        "employees": "15+",
        "offices": ["Stockholm", "Oslo"],
        "description": "Celero is a specialized Nordic private equity firm focused on growth capital investments in technology and services companies with proven business models and international expansion potential.",
        "investment_focus": {
            "sectors": ["Technology", "Services", "B2B Software", "SaaS"],
            "geography": ["Nordic region"],
            "deal_size": "€20M - €150M",
            "investment_type": ["Growth capital", "Minority stakes", "Buy-and-build"]
        },
        "team": [
            {"name": "Lennart Altmann", "title": "Managing Partner", "location": "Stockholm"},
            {"name": "Johan Fredriksson", "title": "Partner", "location": "Stockholm"},
            {"name": "Erik Viklund", "title": "Principal", "location": "Oslo"},
            {"name": "Marcus Johansson", "title": "Principal", "location": "Stockholm"}
        ],
        "recent_activity": "Q3 2024: Active investment period with 3 new platform investments. Recent portfolio additions: Nordic SaaS leader (€45M), Healthtech platform (€30M). Strong portfolio performance with organic growth across portfolio. Exploring AI and vertical SaaS opportunities."
    },
    "Polaris": {
        "name": "Polaris",
        "logo_url": "https://ui-avatars.com/api/?name=Polaris&background=1e40af&color=ffffff&size=64",
        "website": "https://www.polarisprivateequity.com",
        "headquarters": "Copenhagen, Denmark",
        "founded": 1998,
        "aum": "€1.5 billion",
        "employees": "25+",
        "offices": ["Copenhagen", "Oslo"],
        "description": "Polaris Private Equity is a Nordic private equity firm investing in mid-market companies with strong market positions and growth potential.",
        "investment_focus": {
            "sectors": ["Services", "Industrial", "Healthcare", "Business Services"],
            "geography": ["Nordic region"],
            "deal_size": "€50M - €400M",
            "investment_type": ["Mid-market buyouts", "Management buyouts", "Corporate carve-outs"]
        },
        "team": [
            {"name": "Lars Fischer", "title": "Managing Partner", "location": "Copenhagen"},
            {"name": "Jan Juul Hansen", "title": "Partner", "location": "Copenhagen"},
            {"name": "Anders Sundström", "title": "Partner", "location": "Oslo"},
            {"name": "Karsten Knudsen", "title": "Senior Advisor", "location": "Copenhagen"}
        ],
        "recent_activity": "Q3 2024: Polaris IV Fund active deployment phase. Recent investments: Nordic services leader (€250M), Manufacturing platform (€180M). Successful exits generating strong returns. Portfolio companies showing robust operational improvements."
    }
}

# Add new firms
data['pe_firms'].update(new_firms)

# Save updated data
with open('pe_firms_database.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("✅ Added new PE firms: CapMan, Celero, Polaris")
print(f"Total PE firms: {len(data['pe_firms'])}")
