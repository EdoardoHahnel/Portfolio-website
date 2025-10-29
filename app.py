"""
M&A News Website - Main Application
====================================
This is the backend server that runs your website.
It handles requests from your browser and serves web pages.
"""
# Updated: Added 45+ Swedish AI news (Klarna, H&M, Spotify, Scania, Volvo, Nordea, etc.); Enhanced cards with company logos & colored borders

from flask import Flask, render_template, jsonify, request
from datetime import datetime
import json
import os
from scraper import MAScraper
import subprocess
import sys

# Create a Flask application
# Flask is a framework that helps create web applications easily
app = Flask(__name__)

# This will store our news articles in memory
# In a real application, you'd use a database (we'll keep it simple for beginners)
news_storage = []

# This will store portfolio companies
portfolio_storage = []


# Load news from database file at startup
def load_news_database():
    """Load news articles from ma_news_database.json into memory"""
    global news_storage
    try:
        if os.path.exists('ma_news_database.json'):
            with open('ma_news_database.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                if 'articles' in data:
                    news_storage = data['articles']
                    print(f"Loaded {len(news_storage)} news articles from database")
                else:
                    print("No articles found in database file")
        else:
            print("ma_news_database.json not found")
    except Exception as e:
        print(f"Error loading news database: {e}")

# Load portfolio companies from database file at startup
def load_portfolio_database():
    """Load portfolio companies from portfolio_enriched.json into memory"""
    global portfolio_storage
    try:
        # Load from enriched database first
        if os.path.exists('portfolio_enriched.json'):
            with open('portfolio_enriched.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                portfolio_storage = data.get('companies', [])
                print(f"Loaded {len(portfolio_storage)} portfolio companies from enriched database")
                valedo_count = len([c for c in portfolio_storage if c.get('source') == 'Valedo Partners'])
                verdane_count = len([c for c in portfolio_storage if c.get('source') == 'Verdane'])
                print(f"   Valedo Partners: {valedo_count}, Verdane: {verdane_count}")
        # Fallback to old database
        elif os.path.exists('portfolio_complete.json'):
            with open('portfolio_complete.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                if 'portfolio_companies' in data:
                    portfolio_storage = data['portfolio_companies']
                    print(f"Loaded {len(portfolio_storage)} portfolio companies from old database")
                else:
                    print("No portfolio_companies found in database file")
        else:
            print("No portfolio database found")
    except Exception as e:
        print(f"Error loading portfolio database: {e}")

# Load news and portfolio on startup
load_news_database()
load_portfolio_database()


# ROUTES: These are the different pages/endpoints of your website
# Think of routes as different addresses on your website

@app.route('/')
def home():
    """
    Dashboard - Main landing page
    """
    return render_template('dashboard.html')


@app.route('/news')
def news_page():
    """
    M&A News page
    """
    return render_template('news.html')


@app.route('/portfolio')
def portfolio():
    """
    Portfolio page route
    Shows portfolio companies from PE firms
    """
    return render_template('portfolio.html')


@app.route('/company/<company_slug>')
def company_detail(company_slug):
    """
    Individual company detail page
    """
    return render_template('company_detail.html', company_slug=company_slug)


@app.route('/pe-firms')
def pe_firms_list():
    """
    PE Firms overview page
    """
    return render_template('pe_firms_list.html')


@app.route('/pe-firm/<firm_name>')
def pe_firm_detail(firm_name):
    """
    Individual PE firm detail page
    """
    return render_template('pe_firm_detail.html', firm_name=firm_name)


@app.route('/fundraising')
def fundraising():
    """
    Fundraising tracker page
    """
    return render_template('fundraising.html')


@app.route('/league-tables')
def league_tables():
    """
    League Tables - Rankings of investors, fund managers, funds, and law firms
    """
    return render_template('league_tables.html')


@app.route('/family-offices')
def family_offices():
    """
    Nordic family offices finder
    """
    return render_template('family_offices.html')


@app.route('/analytics')
def analytics():
    """
    Analytics dashboard
    """
    return render_template('analytics.html')


@app.route('/deal-flow')
def deal_flow():
    """
    Deal flow tracker
    """
    return render_template('deal_flow.html')


@app.route('/api/deal-flow', methods=['GET'])
def get_deal_flow():
    """
    Get all deals from deal flow database
    """
    try:
        with open('deal_flow_database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return jsonify({
                'success': True,
                'deals': data.get('deals', []),
                'metadata': data.get('metadata', {})
            })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/investment-companies')
def investment_companies():
    """
    Swedish Investment Companies (Investmentbolag)
    """
    return render_template('investment_companies.html')


@app.route('/investmentbolag-detail')
def investmentbolag_detail():
    """
    Individual investmentbolag detail page
    """
    return render_template('investmentbolag_detail.html')


@app.route('/ai-companies')
def ai_companies():
    """
    AI Companies - Swedish AI ecosystem and global AI investments
    """
    return render_template('ai_companies.html')


@app.route('/ai-companies/<company_name>')
def ai_company_detail(company_name):
    """
    Individual AI Company detail page
    """
    # Load AI companies data
    try:
        with open('ai_companies_database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            companies = data.get('ai_companies', [])
            
            # Find the company by name (case-insensitive, URL-safe)
            company_name_decoded = company_name.replace('-', ' ').replace('_', ' ')
            company = None
            for c in companies:
                if c['name'].lower() == company_name_decoded.lower():
                    company = c
                    break
            
            if company:
                return render_template('ai_company_detail.html', company=company)
            else:
                return "Company not found", 404
    except Exception as e:
        return f"Error loading company: {e}", 500


@app.route('/ai-news')
def ai_news():
    """
    AI News - Latest AI investment and technology news
    """
    return render_template('ai_news.html')

@app.route('/ai-investors')
def ai_investors():
    """
    AI Investors - Who invests in AI companies
    """
    return render_template('ai_investors.html')

@app.route('/ai-investors/<investor_name>')
def ai_investor_detail(investor_name):
    """
    Detailed view of a specific AI investor
    """
    return render_template('ai_investor_detail.html', investor_name=investor_name)

@app.route('/ai-trends')
def ai_trends():
    """
    AI Trends & Analysis
    """
    return render_template('ai_trends.html')

@app.route('/ai-map')
def ai_map():
    """
    Nordic AI Map - Geographic distribution of AI companies
    """
    return render_template('ai_map.html')


@app.route('/api/news', methods=['GET'])
def get_news():
    """
    API endpoint to get all stored news
    When the frontend requests news data, this sends it back as JSON
    JSON is a format that JavaScript can easily understand
    """
    return jsonify({
        'success': True,
        'count': len(news_storage),
        'news': news_storage
    })

@app.route('/api/investment-news', methods=['GET'])
def get_investment_news():
    """
    API endpoint to get real Nordic PE investment news from Cision
    """
    try:
        if os.path.exists('pe_news_database.json'):
            with open('pe_news_database.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                return jsonify({
                    'success': True,
                    'count': data.get('total_news', 0),
                    'news': data.get('news', []),
                    'last_updated': data.get('last_updated', ''),
                    'source': data.get('source', 'Cision RSS feeds')
                })
        else:
            return jsonify({
                'success': False,
                'message': 'PE news database not found'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error loading investment news: {str(e)}'
        }), 500


@app.route('/api/scrape', methods=['POST'])
def scrape_news():
    """
    API endpoint to trigger news scraping
    When someone clicks "Scrape News" button, this function runs
    """
    try:
        # Create a scraper object
        scraper = MAScraper()
        
        # Scrape news from various sources
        print("Starting to scrape M&A news...")
        new_articles = scraper.scrape_all_sources()
        
        # Add timestamp to each article
        for article in new_articles:
            article['scraped_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            # Avoid duplicates: only add if URL doesn't exist
            if not any(existing['url'] == article['url'] for existing in news_storage):
                news_storage.append(article)
        
        print(f"Successfully scraped {len(new_articles)} new articles!")
        
        return jsonify({
            'success': True,
            'message': f'Successfully scraped {len(new_articles)} articles',
            'new_count': len(new_articles),
            'total_count': len(news_storage)
        })
    
    except Exception as e:
        # If something goes wrong, send an error message
        print(f"Error during scraping: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


@app.route('/api/news/update-real', methods=['POST'])
def update_real_news():
    """
    API endpoint to update news with real RSS feeds
    """
    try:
        print("🔄 Starting real news update...")
        
        # Run the real news fetcher
        result = subprocess.run([
            sys.executable, 'fetch_real_news.py'
        ], capture_output=True, text=True, cwd=os.getcwd())
        
        if result.returncode == 0:
            # Reload the news database
            load_news_database()
            
            return jsonify({
                'success': True,
                'message': 'Real news updated successfully!',
                'output': result.stdout,
                'total_articles': len(news_storage)
            })
        else:
            return jsonify({
                'success': False,
                'message': f'News update failed: {result.stderr}'
            }), 500
            
    except Exception as e:
        print(f"❌ Error updating real news: {e}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


@app.route('/api/news/<int:news_id>', methods=['DELETE'])
def delete_news(news_id):
    """
    Delete a specific news article by its index
    """
    try:
        if 0 <= news_id < len(news_storage):
            deleted = news_storage.pop(news_id)
            return jsonify({
                'success': True,
                'message': 'Article deleted successfully',
                'deleted': deleted
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Article not found'
            }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@app.route('/api/search', methods=['GET'])
def search_news():
    """
    Search news articles by keyword
    Example: /api/search?q=merger
    """
    query = request.args.get('q', '').lower()
    
    if not query:
        return jsonify({
            'success': True,
            'results': news_storage
        })
    
    # Search in title and description
    results = [
        article for article in news_storage
        if query in article.get('title', '').lower() or 
           query in article.get('description', '').lower()
    ]
    
    return jsonify({
        'success': True,
        'query': query,
        'count': len(results),
        'results': results
    })


# ===== PORTFOLIO ENDPOINTS =====

@app.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    """
    API endpoint to get all portfolio companies
    """
    try:
        # Load from enriched JSON file if portfolio_storage is empty
        if not portfolio_storage:
            # Try enriched database first
            if os.path.exists('portfolio_enriched.json'):
                with open('portfolio_enriched.json', 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    all_companies = data.get('companies', [])
                    # Update global storage
                    portfolio_storage.extend(all_companies)
            # Fallback to old format
            elif os.path.exists('portfolio_complete.json'):
                with open('portfolio_complete.json', 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    all_companies = []
                    
                    # Extract companies from pe_firms structure
                    for firm_name, firm_data in data.get('pe_firms', {}).items():
                        companies = firm_data.get('companies', [])
                        for company in companies:
                            company['source'] = firm_name
                            all_companies.append(company)
                    
                    # Update global storage
                    portfolio_storage.extend(all_companies)
                    print(f"Loaded {len(all_companies)} companies from portfolio_complete.json")
            
            if portfolio_storage:
                print(f"Loaded {len(portfolio_storage)} companies from database")
        
        return jsonify({
            'success': True,
            'count': len(portfolio_storage),
            'companies': portfolio_storage
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e),
            'count': 0,
            'companies': []
        }), 500


@app.route('/api/portfolio/scrape', methods=['POST'])
def scrape_portfolio():
    """
    API endpoint to scrape portfolio companies from PE firms
    """
    try:
        scraper = MAScraper()
        
        print("Starting to scrape portfolio companies...")
        new_companies = scraper.scrape_portfolio_companies()
        
        # Add timestamp to each company
        for company in new_companies:
            company['scraped_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            # Avoid duplicates
            if not any(existing['company'] == company['company'] and 
                      existing['source'] == company['source'] 
                      for existing in portfolio_storage):
                portfolio_storage.append(company)
        
        print(f"Successfully scraped {len(new_companies)} portfolio companies!")
        
        return jsonify({
            'success': True,
            'message': f'Successfully scraped {len(new_companies)} companies',
            'new_count': len(new_companies),
            'total_count': len(portfolio_storage)
        })
    
    except Exception as e:
        print(f"Error during portfolio scraping: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


@app.route('/api/portfolio/search', methods=['GET'])
def search_portfolio():
    """
    Search portfolio companies by keyword
    """
    query = request.args.get('q', '').lower()
    
    if not query:
        return jsonify({
            'success': True,
            'results': portfolio_storage
        })
    
    # Search in company name, sector, and market
    results = [
        company for company in portfolio_storage
        if query in company.get('company', '').lower() or 
           query in company.get('sector', '').lower() or
           query in company.get('market', '').lower()
    ]
    
    return jsonify({
        'success': True,
        'query': query,
        'count': len(results),
        'results': results
    })


@app.route('/api/portfolio/reload', methods=['POST'])
def reload_portfolio():
    """
    Force reload portfolio data from enriched database (clears cache)
    """
    global portfolio_storage
    try:
        # Clear cache
        portfolio_storage.clear()
        print("Clearing portfolio cache...")
        
        # Reload from enriched database
        if os.path.exists('portfolio_enriched.json'):
            with open('portfolio_enriched.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                all_companies = data.get('companies', [])
                portfolio_storage.extend(all_companies)
                print(f"Reloaded {len(all_companies)} companies from portfolio_enriched.json")
                
                # Count by source
                valedo = len([c for c in all_companies if c.get('source') == 'Valedo Partners'])
                verdane = len([c for c in all_companies if c.get('source') == 'Verdane'])
                
                return jsonify({
                    'success': True,
                    'message': 'Portfolio data reloaded successfully',
                    'total': len(all_companies),
                    'valedo_partners': valedo,
                    'verdane': verdane
                })
        else:
            return jsonify({
                'success': False,
                'message': 'portfolio_enriched.json not found'
            }), 404
            
    except Exception as e:
        print(f"Error reloading portfolio: {e}")
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500


# ===== PE FIRMS ENDPOINTS =====

@app.route('/api/pe-firms', methods=['GET'])
def get_pe_firms():
    """
    Get all PE firms with details
    """
    try:
        with open('pe_firms_database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return jsonify({
                'success': True,
                'firms': data.get('pe_firms', {})
            })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/pe-firm/<firm_name>', methods=['GET'])
def get_pe_firm_detail(firm_name):
    """
    Get detailed information about a specific PE firm with real news integration
    """
    try:
        # Get firm metadata from pe_firms_database first
        firm_metadata = {}
        if os.path.exists('pe_firms_database.json'):
            with open('pe_firms_database.json', 'r', encoding='utf-8') as pf:
                pe_data = json.load(pf)
                firm_metadata = pe_data.get('pe_firms', {}).get(firm_name, {})
        
        # For Altor and Adelis Equity, prioritize portfolio_companies from pe_firms_database
        if firm_name in ['Altor', 'Adelis Equity'] and firm_metadata.get('portfolio_companies'):
            firm_companies = []
            for pc in firm_metadata['portfolio_companies']:
                # Convert portfolio_companies format to enriched format
                company_data = {
                    'company': pc.get('name', ''),
                    'sector': pc.get('sector', ''),
                    'market': pc.get('country', ''),
                    'entry': pc.get('entry_year', ''),
                    'status': 'Active',
                    'source': firm_name,
                    'website': pc.get('website', ''),
                    'logo_url': pc.get('logo', ''),
                    'description': pc.get('description', ''),
                    'headquarters': pc.get('country', ''),
                    'deal_size': '',
                    'fund': '',
                    'geography': 'Nordic' if pc.get('country') in ['Sweden', 'Denmark', 'Norway', 'Finland'] else 'International'
                }
                firm_companies.append(company_data)
        else:
            # Try enriched database for other firms
            firm_companies = []
            if os.path.exists('portfolio_enriched.json'):
                with open('portfolio_enriched.json', 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    all_companies = data.get('companies', [])
                    firm_companies = [c for c in all_companies if c.get('source') == firm_name]
        
        if firm_companies or firm_metadata:
            # Get real news for this firm
            real_news = []
            seen_articles = set()  # Track articles we've already added to avoid duplicates
            
            if os.path.exists('pe_news_database.json'):
                with open('pe_news_database.json', 'r', encoding='utf-8') as nf:
                    news_data = json.load(nf)
                    all_news = news_data.get('news', [])
                    
                    # Filter news for this firm (exact match ONLY on firm field)
                    for article in all_news:
                        article_firm = article.get('firm', '')
                        article_title = article.get('title', '')
                        article_desc = article.get('description', '')
                        article_link = article.get('link', '')
                        
                        # Use the link as a unique identifier to avoid duplicates
                        article_id = article_link
                        
                        # PRIORITY 1: Direct firm match from the 'firm' field
                        if article_firm and article_firm.lower() == firm_name.lower():
                            if article_id not in seen_articles:
                                real_news.append(article)
                                seen_articles.add(article_id)
                                continue
                        
                        # PRIORITY 2: Check if article mentions portfolio companies (more selective)
                        for company in firm_companies:
                            company_name = company.get('company', '')
                            if not company_name:
                                continue
                            
                            # More precise matching: company name should be a complete word match
                            # and not just a substring of another company name
                            company_lower = company_name.lower()
                            title_lower = article_title.lower()
                            desc_lower = article_desc.lower()
                            
                            # Check for exact word boundaries to avoid false matches
                            import re
                            pattern = r'\b' + re.escape(company_lower) + r'\b'
                            
                            if (re.search(pattern, title_lower) or re.search(pattern, desc_lower)):
                                # Additional check: make sure it's not about a different company
                                # Skip if the article is clearly about a different firm
                                if article_firm and article_firm.lower() != firm_name.lower():
                                    continue
                                
                                if article_id not in seen_articles:
                                    # Add firm context to the article
                                    article_copy = article.copy()
                                    article_copy['related_firm'] = firm_name
                                    article_copy['related_company'] = company_name
                                    real_news.append(article_copy)
                                    seen_articles.add(article_id)
                                    break  # Only add once per company match
            
            # Sort news by date (most recent first)
            real_news.sort(key=lambda x: x.get('date', ''), reverse=True)
            
            # Build firm data structure with real news
            firm_data = {
                'name': firm_name,
                'companies': firm_companies,
                'company_count': len(firm_companies),
                'real_news': real_news[:10],  # Latest 10 news items
                'total_news_count': len(real_news),
                **firm_metadata  # Add any metadata from database
            }
            
            return jsonify({
                'success': True,
                'firm': firm_data
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Firm not found'
            }), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ===== FUNDRAISING ENDPOINTS =====

@app.route('/api/fundraising', methods=['GET'])
def get_fundraising():
    """
    Get fundraising tracker data
    """
    try:
        with open('fundraising_database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return jsonify({
                'success': True,
                'fundraising': data.get('fundraising_activities', []),
                'metadata': data.get('metadata', {})
            })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ===== FAMILY OFFICES ENDPOINTS =====

@app.route('/api/family-offices', methods=['GET'])
def get_family_offices():
    """
    Get Nordic family offices data
    """
    try:
        with open('family_offices_database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return jsonify({
                'success': True,
                'family_offices': data.get('family_offices', []),
                'metadata': data.get('metadata', {})
            })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/family-offices/search', methods=['GET'])
def search_family_offices():
    """
    Search family offices by keyword
    """
    try:
        query = request.args.get('q', '').lower()
        
        with open('family_offices_database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            all_offices = data.get('family_offices', [])
            
            if not query:
                results = all_offices
            else:
                results = [
                    office for office in all_offices
                    if query in office.get('name', '').lower() or
                       query in office.get('founding_family', '').lower() or
                       query in ' '.join(office.get('investment_focus', [])).lower()
                ]
            
            return jsonify({
                'success': True,
                'query': query,
                'count': len(results),
                'results': results
            })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ===== ANALYTICS ENDPOINTS =====

@app.route('/api/analytics/summary', methods=['GET'])
def get_analytics_summary():
    """
    Get summary analytics for dashboard
    """
    return jsonify({
        'success': True,
        'summary': {
            'total_companies': len(portfolio_storage),
            'total_news': len(news_storage),
            'total_pe_firms': 14,
            'total_family_offices': 35,
            'latest_deals': len([n for n in news_storage if 'Deal' in n.get('category', '')]),
        }
    })


# ===== INVESTMENT COMPANIES ENDPOINTS =====

@app.route('/api/investment-companies', methods=['GET'])
def get_investment_companies():
    """
    Get Swedish investment companies with NAV discount data
    """
    try:
        with open('investmentbolag_database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return jsonify({
                'success': True,
                'companies': data.get('investment_companies', []),
                'metadata': data.get('metadata', {})
            })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/investment-companies/search', methods=['GET'])
def search_investment_companies():
    """
    Search investment companies
    """
    try:
        query = request.args.get('q', '').lower()
        
        with open('investmentbolag_database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            all_companies = data.get('investment_companies', [])
            
            if not query:
                results = all_companies
            else:
                results = [
                    company for company in all_companies
                    if query in company.get('name', '').lower() or
                       query in ' '.join(company.get('holdings', [])).lower() or
                       query in ' '.join(company.get('investment_focus', [])).lower()
                ]
            
            return jsonify({
                'success': True,
                'query': query,
                'count': len(results),
                'results': results
            })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ===== AI COMPANIES ENDPOINTS =====

@app.route('/api/ai-companies', methods=['GET'])
def get_ai_companies():
    """
    Get Swedish AI companies and global AI investments
    """
    try:
        with open('ai_companies_database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return jsonify({
                'success': True,
                'companies': data.get('ai_companies', []),
                'global_investments': data.get('global_ai_investments', []),
                'metadata': data.get('metadata', {})
            })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/ai-companies/search', methods=['GET'])
def search_ai_companies():
    """
    Search AI companies by name, technology, or category
    """
    try:
        query = request.args.get('q', '').lower()
        
        with open('ai_companies_database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            all_companies = data.get('ai_companies', [])
            
            if not query:
                results = all_companies
            else:
                results = [
                    company for company in all_companies
                    if query in company.get('name', '').lower() or
                       query in company.get('description', '').lower() or
                       query in company.get('category', '').lower() or
                       query in ' '.join(company.get('technology', [])).lower() or
                       query in ' '.join(company.get('investors', [])).lower()
                ]
            
            return jsonify({
                'success': True,
                'query': query,
                'count': len(results),
                'results': results
            })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/ai-companies/category/<category>', methods=['GET'])
def get_ai_companies_by_category(category):
    """
    Get AI companies filtered by category
    """
    try:
        with open('ai_companies_database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            all_companies = data.get('ai_companies', [])
            
            filtered = [
                company for company in all_companies
                if category.lower() in company.get('category', '').lower()
            ]
            
            return jsonify({
                'success': True,
                'category': category,
                'count': len(filtered),
                'companies': filtered
            })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/ai-companies/analytics', methods=['GET'])
def get_ai_analytics():
    """
    Get analytics about AI companies ecosystem
    """
    try:
        with open('ai_companies_database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            all_companies = data.get('ai_companies', [])
            
            # Calculate analytics
            categories = {}
            total_funding = 0
            stages = {}
            technologies = {}
            
            for company in all_companies:
                # Category distribution
                cat = company.get('category', 'Unknown')
                categories[cat] = categories.get(cat, 0) + 1
                
                # Stage distribution
                stage = company.get('stage', 'Unknown')
                stages[stage] = stages.get(stage, 0) + 1
                
                # Technology trends
                for tech in company.get('technology', []):
                    technologies[tech] = technologies.get(tech, 0) + 1
            
            return jsonify({
                'success': True,
                'analytics': {
                    'total_companies': len(all_companies),
                    'categories': categories,
                    'stages': stages,
                    'top_technologies': dict(sorted(technologies.items(), key=lambda x: x[1], reverse=True)[:15]),
                    'unicorns': len([c for c in all_companies if 'Unicorn' in c.get('category', '')]),
                    'yc_alumni': len([c for c in all_companies if 'Y Combinator' in str(c.get('investors', []))])
                }
            })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/ai-educational', methods=['GET'])
def get_ai_educational():
    """
    Get AI educational content for investment analysis
    """
    try:
        with open('ai_educational_database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return jsonify({
                'success': True,
                'content': data
            })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/ai-investors', methods=['GET'])
def get_ai_investors():
    """
    Get AI investors database
    """
    try:
        with open('ai_investors_database.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return jsonify({
                'success': True,
                'investors': data.get('investors', []),
                'metadata': data.get('metadata', {})
            })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/company/<company_slug>', methods=['GET'])
def get_company_by_slug(company_slug):
    """
    Get a portfolio company by slug
    """
    try:
        # Load portfolio data
        if not portfolio_storage:
            if os.path.exists('portfolio_enriched.json'):
                with open('portfolio_enriched.json', 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    all_companies = data.get('companies', [])
                    portfolio_storage.extend(all_companies)
            elif os.path.exists('portfolio_complete.json'):
                with open('portfolio_complete.json', 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    all_companies = []
                    for firm_name, firm_data in data.get('pe_firms', {}).items():
                        companies = firm_data.get('companies', [])
                        for company in companies:
                            company['source'] = firm_name
                            all_companies.append(company)
                    portfolio_storage.extend(all_companies)
        
        # Decode slug to find company (slug format: company-name-source)
        import urllib.parse
        decoded_slug = urllib.parse.unquote(company_slug)
        
        # Try to find company by matching slug pattern
        # Slug is typically: company-name-source-firm
        parts = decoded_slug.split('-')
        if len(parts) >= 2:
            # Last part is usually the source
            source_match = '-'.join(parts[-2:]) if len(parts) >= 2 else parts[-1]
            company_name_parts = parts[:-2] if len(parts) > 2 else [parts[0]]
            company_name_match = ' '.join(company_name_parts)
            
            # Try exact match first
            for company in portfolio_storage:
                slug_name = company.get('company', '').lower().replace(' ', '-').replace('&', 'and')
                slug_source = company.get('source', '').lower().replace(' ', '-')
                expected_slug = f"{slug_name}-{slug_source}"
                
                if decoded_slug.lower() == expected_slug:
                    return jsonify({
                        'success': True,
                        'company': company
                    })
            
            # Fallback: try fuzzy matching
            for company in portfolio_storage:
                company_name = company.get('company', '').lower()
                source = company.get('source', '').lower()
                
                if (company_name_match.lower() in company_name and 
                    source_match.lower() in source):
                    return jsonify({
                        'success': True,
                        'company': company
                    })
        
        return jsonify({
            'success': False,
            'message': 'Company not found'
        }), 404
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500


@app.route('/api/portfolio/research/<company_name>', methods=['GET'])
def research_portfolio_company(company_name):
    """
    Research a portfolio company online and return enriched data
    First checks enriched database, then falls back to basic research
    """
    try:
        from datetime import datetime
        
        print(f"🔍 Looking up enriched data for: {company_name}")
        
        # Try to load from enriched database first
        enriched_data = None
        for filename in ['portfolio_enriched.json', 'portfolio_enriched_sample.json']:
            if os.path.exists(filename):
                try:
                    with open(filename, 'r', encoding='utf-8') as f:
                        enriched_db = json.load(f)
                        companies = enriched_db.get('companies', [])
                        
                        # Find matching company
                        for company in companies:
                            if company.get('company', '').lower() == company_name.lower():
                                enriched_data = company
                                print(f"  Found enriched data in {filename}")
                                break
                        
                        if enriched_data:
                            break
                except Exception as e:
                    print(f"  Error loading {filename}: {e}")
        
        # If we found enriched data, format it properly
        if enriched_data and enriched_data.get('enriched'):
            research_data = {
                'company_name': company_name,
                'timestamp': enriched_data.get('research_date', datetime.now().isoformat()),
                'overview': enriched_data.get('detailed_description', enriched_data.get('description', '')),
                'founded': enriched_data.get('founded_year', ''),
                'ceo': enriched_data.get('ceo', ''),
                'leadership': enriched_data.get('leadership_team', []),
                'funding_history': enriched_data.get('funding_rounds', []),
                'total_funding': enriched_data.get('total_funding', ''),
                'valuation': enriched_data.get('valuation', ''),
                'revenue': enriched_data.get('revenue', ''),
                'recent_news': enriched_data.get('recent_news', []),
                'products': enriched_data.get('key_products', []),
                'technology': enriched_data.get('technology_stack', []),
                'headquarters': enriched_data.get('headquarters', ''),
                'employee_count': enriched_data.get('employee_count_detailed', enriched_data.get('employees', '')),
                'website': enriched_data.get('website', ''),
                'key_milestones': enriched_data.get('key_milestones', []),
                'competitive_advantages': enriched_data.get('competitive_advantages', []),
                'market_position': enriched_data.get('market_share', ''),
                'business_model': enriched_data.get('business_model', ''),
                'target_market': enriched_data.get('target_customers', ''),
                'strategic_focus': enriched_data.get('strategic_priorities', []),
                'certifications': enriched_data.get('certifications', []),
                'partnerships': enriched_data.get('partnerships', []),
                'geographic_presence': enriched_data.get('geographic_presence', []),
                'sustainability': enriched_data.get('sustainability_initiatives', []),
                'data_status': 'enriched'
            }
            
            return jsonify({
                'success': True,
                'company': company_name,
                'research_data': research_data,
                'source': 'enriched_database',
                'note': 'Comprehensive researched data from curated database.'
            })
        
        # Fallback: Basic research structure
        print(f"  No enriched data found, using basic structure")
        research_data = {
            'company_name': company_name,
            'timestamp': datetime.now().isoformat(),
            'overview': f"{company_name} is a portfolio company. Detailed information is being researched from public sources including company websites, press releases, and industry databases.",
            'founded': '',
            'leadership': [],
            'funding_history': [],
            'total_funding': '',
            'recent_news': [],
            'products': [],
            'technology': [],
            'key_milestones': [],
            'competitive_advantages': [],
            'market_position': '',
            'target_market': '',
            'data_status': 'preliminary'
        }
        
        return jsonify({
            'success': True,
            'company': company_name,
            'research_data': research_data,
            'source': 'basic',
            'note': 'Basic data structure. Run research script to enrich with comprehensive information.'
        })
        
    except Exception as e:
        print(f"  Research error: {e}")
        return jsonify({
            'success': False,
            'message': str(e),
            'company': company_name
        }), 500


# Run the application
if __name__ == '__main__':
    import os
    
    # Check if running in production or development
    debug_mode = os.environ.get('FLASK_ENV') != 'production'
    port = int(os.environ.get('PORT', 5000))
    
    if debug_mode:
        print("=" * 60)
        print("M&A News Website Starting...")
        print("=" * 60)
        print("\nOpen your browser and go to: http://localhost:5000")
        print("\nTips:")
        print("   - Press Ctrl+C to stop the server")
        print("   - Refresh the browser to see changes in HTML/CSS/JS")
        print("   - Restart the server to see changes in Python code")
        print("\n" + "=" * 60 + "\n")
    
    # Start the Flask server
    # debug=True in development for helpful error messages and auto-reload
    # debug=False in production for security
    app.run(debug=debug_mode, host='0.0.0.0', port=port)


