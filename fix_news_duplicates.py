import json

# Load news
with open('pe_news_database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Remove duplicates by title
seen_titles = set()
unique_news = []

for article in data['news']:
    title_lower = article['title'].lower()
    if title_lower not in seen_titles:
        unique_news.append(article)
        seen_titles.add(title_lower)
    else:
        print(f"Removing duplicate: {article['title']}")

# Update database
data['news'] = unique_news
data['total_news'] = len(unique_news)

# Save
with open('pe_news_database.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"✅ Removed duplicates. Total news: {len(unique_news)}")

# Check Nutris
nutris = [a for a in unique_news if 'nutris' in a['title'].lower()]
print(f"\nNutris articles: {len(nutris)}")
for article in nutris:
    print(f"  - {article['title']} (Firm: {article.get('firm', 'Unknown')})")
