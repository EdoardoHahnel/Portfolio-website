# Portföljbolagen - Nordic Private Equity & AI Investment Platform

A comprehensive web platform for tracking Nordic private equity firms, their portfolio companies, AI investments, and M&A news.

## 🌟 Features

- **Portfolio Companies**: Browse 400+ companies from leading Nordic PE firms
- **PE Firms Database**: Detailed information on Nordic private equity firms
- **AI Companies**: Track Swedish AI ecosystem and global AI investments
- **AI Investors**: Database of investors active in AI sector
- **Deal Flow**: Monitor active deals and transactions
- **Fundraising Tracker**: Track fundraising activities
- **League Tables**: Rankings and analytics
- **Family Offices**: Nordic family office directory
- **M&A News**: Latest merger and acquisition news

## 🚀 Quick Start

### Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```

3. Open your browser to `http://localhost:5000`

## 📁 Project Structure

```
Website/
├── app.py                          # Main Flask application
├── scraper.py                      # News scraping functionality
├── requirements.txt                # Python dependencies
├── templates/                      # HTML templates
├── static/                         # CSS, JavaScript, images
└── *_database.json                 # Data files
```

## 🛠️ Technology Stack

- **Backend**: Python Flask
- **Frontend**: HTML, CSS, JavaScript
- **Data**: JSON databases
- **Web Scraping**: BeautifulSoup, Requests

## 📊 Database Files

- `portfolio_enriched.json` - Portfolio companies data
- `pe_firms_database.json` - PE firms information
- `ai_companies_database.json` - AI companies
- `ai_investors_database.json` - AI investors
- `deal_flow_database.json` - Active deals
- `fundraising_database.json` - Fundraising activities
- `family_offices_database.json` - Family offices
- `ma_news_database.json` - M&A news articles

## 📝 License

Private project - All rights reserved

