"""
M&A News Scraper
================
This module handles web scraping for M&A (Mergers & Acquisitions) news.

BEGINNER EXPLANATION:
Web scraping means automatically collecting information from websites.
We use BeautifulSoup to read HTML (the code that makes up web pages)
and extract the specific information we want.
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime
import time
import re
import json
import os


class MAScraper:
    """
    A class to scrape M&A news from various sources
    
    Classes are like blueprints - they let you create objects with specific abilities.
    This class has the ability to scrape news from different websites.
    """
    
    def __init__(self):
        """
        Initialize the scraper
        __init__ is a special method that runs when you create a new scraper
        """
        # Set a User-Agent to identify our scraper (websites like to know who's visiting)
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        
        # M&A News sources
        self.ma_news_urls = {
            'seeking_alpha': 'https://seekingalpha.com/market-news/m-a',
            'reuters': 'https://www.reuters.com/legal/mergers-acquisitions/',
            'bloomberg': 'https://www.bloomberg.com/markets/companies',
            'ft': 'https://www.ft.com/companies',
            'dealbook': 'https://www.nytimes.com/section/business/dealbook',
            'techcrunch': 'https://techcrunch.com/tag/acquisitions/',
            'nordic_business': 'https://www.nbforum.com/category/deals/',
            'breakit': 'https://www.breakit.se/artikel/deals'
        }
        
        # Portfolio sources - Swedish PE firms
        self.portfolio_urls = {
            'eqt': 'https://eqtgroup.com/about/current-portfolio',
            'triton': 'https://www.triton-partners.com/portfolio/',
            'valedo': 'https://www.valedopartners.com/en/investments/',
            'litorina': 'https://litorina.se/investments/',
            'nordic_capital': 'https://www.nordiccapital.com/portfolio',
            'altor': 'https://www.altor.com/portfolio',
            'ratos': 'https://www.ratos.com/companies',
            'summa_equity': 'https://summaequity.com/portfolio',
            'bure': 'https://www.bure.se/en/holdings',
            'verdane': 'https://verdane.com/companies',
            'adelis': 'https://adelisequity.com/portfolio',
            'ik_partners': 'https://ikpartners.com/portfolio',
            'accent': 'https://accentequity.se/portfolio',
            'alder': 'https://alder.se/portfolio'
        }
    
    
    def scrape_generic_ma_news(self):
        """
        Scrape generic M&A news
        This creates sample data for demonstration
        
        In a real application, you would scrape from actual news sites,
        but many sites have anti-scraping measures, so we'll generate sample data.
        """
        articles = []
        
        # Comprehensive M&A news database (realistic deals)
        sample_news = [
            # Nordic AI & Tech Deals
            {
                'title': 'Sana Labs Raises SEK 580M Series B from Menlo Ventures',
                'description': 'Swedish AI learning platform Sana Labs has closed a SEK 580 million Series B led by Menlo Ventures, with participation from EQT Ventures. The company will use funds to expand globally and lead the Swedish AI Reform initiative.',
                'url': 'https://breakit.se/sana-labs-series-b',
                'published': '2024-10-15',
                'source': 'Breakit'
            },
            {
                'title': 'Legora Secures SEK 800M Series B from Iconiq Capital',
                'description': 'Legal AI platform Legora has raised a massive SEK 800 million Series B from Iconiq Capital (early Facebook, Airbnb investor), alongside General Catalyst, Redpoint Ventures, and Benchmark. The funding will fuel US market expansion.',
                'url': 'https://techcrunch.com/legora-series-b',
                'published': '2025-05-20',
                'source': 'TechCrunch'
            },
            {
                'title': 'AMD Acquires Silo AI for $665 Million',
                'description': 'AMD has completed the acquisition of Finnish AI lab Silo AI for $665 million, marking one of the largest AI acquisitions in European history. Silo AI brings 300+ AI experts and strong enterprise customer base.',
                'url': 'https://reuters.com/amd-silo-ai',
                'published': '2024-07-10',
                'source': 'Reuters'
            },
            # Swedish AI News from Mediatell & Ny Teknik
            {
                'title': 'OpenAI lanserar GPT-5 – "Som att prata med en expert på doktorsnivå"',
                'description': 'OpenAI har släppt en ny version av ChatGPT som marknadsförs som snabbare och smartare än tidigare. Den nya modellen GPT-5 beskrivs som "klok som en doktor" och kan resonera på expertnivå inom flera domäner.',
                'url': 'https://www.nyteknik.se/tech/openai-gpt-5',
                'published': '2025-10-18',
                'source': 'Ny Teknik'
            },
            {
                'title': 'Svensk AI-doldis i samarbete med OpenAI – "De ville lära av oss"',
                'description': 'Ett svenskt AI-bolag har ingått strategiskt samarbete med OpenAI. Nu ska tekniken hårdtestas i svensk offentlig sektor. "De var imponerade av vår implementation", säger vd:n.',
                'url': 'https://www.nyteknik.se/tech/svensk-ai-openai',
                'published': '2025-10-17',
                'source': 'Ny Teknik'
            },
            {
                'title': 'Deepseek försenar AI-lansering efter problem med Huawei-chip',
                'description': 'Kinesiska AI-företaget Deepseek skjuter upp lansering av ny AI-modell efter tekniska problem med Huawei-chip. Tidigare använde företaget Nvidia-chip men tvingades byta efter USA:s exportrestriktioner.',
                'url': 'https://www.nyteknik.se/tech/deepseek-huawei',
                'published': '2025-10-16',
                'source': 'Ny Teknik'
            },
            {
                'title': 'Meta värvar ledande AI-forskare från Mira Muratis nya satsning',
                'description': 'Meta anställer nyckelpersoner från Mira Muratis AI-startup. Tidigare OpenAI CTO Mira Murati startade egen AI-satsning men Meta lockar nu bort flera topprankade forskare med lukrativa erbjudanden.',
                'url': 'https://www.nyteknik.se/tech/meta-ai-forskare',
                'published': '2025-10-15',
                'source': 'Ny Teknik'
            },
            {
                'title': 'Apple nära förvärv av AI-startup – även Elon Musk intresserad',
                'description': 'Apple förhandlar om att förvärva personal och teknik från lovande AI-startup. Även Elon Musks xAI har visat intresse för bolaget som utvecklar avancerade språkmodeller.',
                'url': 'https://www.nyteknik.se/tech/apple-ai-forvärv',
                'published': '2025-10-14',
                'source': 'Ny Teknik'
            },
            {
                'title': 'Figure 03: Nya humanoida roboten – "Alla kommer ha en hemma"',
                'description': 'Amerikanska Figure presenterar sin tredje generation humanoid robot som ska konkurrera med svenska 1X Technologies. Företaget spår att humanoida robotar kommer finnas i varje hem inom 10 år.',
                'url': 'https://www.nyteknik.se/tech/figure-03-robot',
                'published': '2025-10-13',
                'source': 'Ny Teknik'
            },
            {
                'title': 'Microsofts hybrid-AI revolutionerar Windows – kombinerar lokal NPU med moln',
                'description': 'Microsoft lanserar banbrytande hybrid-AI-lösning för Windows som dynamiskt växlar mellan lokal beräkning på NPU-chip och molnbaserade AI-modeller. Ger både prestanda och integritet.',
                'url': 'https://mediatell.se/ai-nyheter/microsoft-hybrid-ai',
                'published': '2025-10-12',
                'source': 'Mediatell'
            },
            {
                'title': 'Anthropic lanserar röstläge för Claude – konkurrent till ChatGPT Voice',
                'description': 'AI-företaget Anthropic introducerar röstbaserat läge för sin AI-assistent Claude. Funktionen konkurrerar direkt med OpenAI:s ChatGPT Voice och erbjuder naturlig konversation.',
                'url': 'https://mediatell.se/ai-nyheter/claude-voice',
                'published': '2025-10-11',
                'source': 'Mediatell'
            },
            {
                'title': 'Google Gemini 2.5 Pro får genombrott inom kodning – slår GPT-4',
                'description': 'Googles senaste AI-modell Gemini 2.5 Pro visar överlägsen prestanda inom kodgenerering och problemlösning. I benchmarks presterar modellen bättre än OpenAI:s GPT-4.',
                'url': 'https://mediatell.se/ai-nyheter/gemini-2-5-pro',
                'published': '2025-10-10',
                'source': 'Mediatell'
            },
            {
                'title': 'Sana AI Agents lanseras – svenskt företag lanserar AI-agenter för företag',
                'description': 'Svenska Sana presenterar Sana Agents som låter företag bygga specialiserade AI-agenter. Lösningen integreras med befintliga företagssystem och kan automatisera komplexa arbetsflöden.',
                'url': 'https://mediatell.se/ai-nyheter/sana-agents',
                'published': '2025-10-09',
                'source': 'Mediatell'
            },
            {
                'title': 'Midjourney öppnar för alla – ingen Discord-konto längre krävs',
                'description': 'AI-bildgeneratorn Midjourney gör sin tjänst tillgänglig direkt via webben utan krav på Discord-konto. Steget ses som ett sätt att nå bredare användarbas.',
                'url': 'https://artificialintelligence-news.com/midjourney-web',
                'published': '2025-10-08',
                'source': 'AI News'
            },
            {
                'title': 'Ebba Busch använde falskt AI-citat i Almedalstal – ber om ursäkt',
                'description': 'KD-ledaren citerade kulturjournalisten Elina Pahnke i sitt Almedalstal, men citatet kom från ett AI-verktyg. Busch ber nu om ursäkt på Facebook för misstaget.',
                'url': 'https://www.nyteknik.se/tech/ebba-busch-ai-citat',
                'published': '2025-07-03',
                'source': 'Ny Teknik'
            },
            {
                'title': 'AlphaGenome: DeepMinds AI gör genombrott inom DNA-forskning',
                'description': 'Google DeepMinds nya AI-system AlphaGenome kan förutsäga genetiska mutationer med 95% noggrannhet. Genombrott kan revolutionera personlig medicin och cancerforskning.',
                'url': 'https://mediatell.se/ai-nyheter/alphageno me',
                'published': '2025-10-07',
                'source': 'Mediatell'
            },
            {
                'title': 'Chip-jätten rapporterar vinstlyft – rider på AI-vågen',
                'description': 'Stort halvledarföretag redovisar rekordvinst drivet av exploderande efterfrågan på AI-chips. Aktien stiger 15% efter rapporten som vida översteg analytikernas förväntningar.',
                'url': 'https://www.nyteknik.se/industri/chip-ai-vinst',
                'published': '2025-10-06',
                'source': 'Ny Teknik'
            },
            {
                'title': 'MIT-forskare: ChatGPT påverkar barns digitala vardag signifikant',
                'description': 'Ny MIT-studie visar att barn mellan 8-14 år använder ChatGPT dagligen för läxhjälp. Forskare varnar för påverkan på kritiskt tänkande men ser också positiva effekter på lärande.',
                'url': 'https://mediatell.se/ai-nyheter/chatgpt-barn',
                'published': '2025-10-05',
                'source': 'Mediatell'
            },
            {
                'title': 'Zapier lanserar AI-agenter för automatisering av företagsprocesser',
                'description': 'Automationsplattformen Zapier introducerar intelligenta AI-agenter som kan hantera komplexa arbetsflöden självständigt. Agenter kan fatta beslut och anpassa sig efter kontext.',
                'url': 'https://techcrunch.com/zapier-ai-agents',
                'published': '2025-10-04',
                'source': 'TechCrunch'
            },
            {
                'title': 'HeyGen revolutionerar videoöversättning med AI – 29 språk',
                'description': 'AI-videoföretaget HeyGen lanserar tjänst som översätter videor till 29 språk med synkroniserad läpprörelse. Tekniken använder deepfake-liknande metoder för realistisk dubbing.',
                'url': 'https://mediatell.se/ai-nyheter/heygen-video',
                'published': '2025-10-03',
                'source': 'Mediatell'
            },
            {
                'title': 'Anthropic Claude Gov lanseras för amerikanska myndigheter',
                'description': 'Anthropic introducerar specialversion av Claude för amerikanska regeringen med förstärkta säkerhetsfunktioner och compliance. Första kunder inkluderar Pentagon och CIA.',
                'url': 'https://artificialintelligence-news.com/claude-gov',
                'published': '2025-10-02',
                'source': 'AI News'
            },
            {
                'title': 'Lovart AI: Svenskt företag lanserar AI-konstgenerator för proffs',
                'description': 'Nystartat svenskt företag Lovart tar upp kampen med Midjourney och DALL-E. Fokuserar på professionella designers med finare kontroll över utdata och kommersiella licenser.',
                'url': 'https://mediatell.se/ai-nyheter/lovart-ai',
                'published': '2025-10-01',
                'source': 'Mediatell'
            },
            {
                'title': 'OpenAI Files: Ny funktion låter ChatGPT analysera dokument direkt',
                'description': 'ChatGPT får stöd för filuppladdning som låter användare analysera PDF:er, Excel-filer och dokument. AI:n kan nu sammanfatta, översätta och besvara frågor om uppladdade filer.',
                'url': 'https://techcrunch.com/openai-files',
                'published': '2025-09-30',
                'source': 'TechCrunch'
            },
            # More Swedish & Nordic AI News
            {
                'title': 'Klarna AI hanterar nu 2.3 miljoner kundsamtal i månaden',
                'description': 'Svenska fintechbolaget Klarna rapporterar att deras AI-assistent nu sköter miljontals kundsamtal månatligen, motsvarande 700 heltidsanställda. Svarstiiden halverad från 11 till 2 minuter.',
                'url': 'https://www.dn.se/ekonomi/klarna-ai-kundservice',
                'published': '2025-09-28',
                'source': 'Dagens Nyheter'
            },
            {
                'title': 'H&M investerar miljard i AI för lageroptimering',
                'description': 'Modekedjan H&M satsar över 1 miljard kronor på AI-system för att optimera lagerhållning och minska svinn. Pilotprojekt visar 40% minskning av överlager.',
                'url': 'https://www.nyteknik.se/industri/hm-ai-investering',
                'published': '2025-09-27',
                'source': 'Ny Teknik'
            },
            {
                'title': 'Spotify lanserar AI DJ på svenska – "Som att ha en kompis som spelar musik"',
                'description': 'Spotify rullar ut sin AI DJ-funktion på svenska, norska och danska. Funktionen använder röst-AI och rekommendationsalgoritmer för personlig musikupplevelse.',
                'url': 'https://mediatell.se/ai-nyheter/spotify-ai-dj-svenska',
                'published': '2025-09-26',
                'source': 'Mediatell'
            },
            {
                'title': 'Scania testar självkörande lastbilar på svensk motorväg',
                'description': 'Svenska lastbilstillverkaren Scania inleder storskalig test av AI-styrda självkörande lastbilar på E4:an. Tekniken kombinerar LiDAR, kameror och avancerade AI-modeller.',
                'url': 'https://www.nyteknik.se/fordon/scania-sjalvkorande',
                'published': '2025-09-25',
                'source': 'Ny Teknik'
            },
            {
                'title': 'Karolinska använder AI för att upptäcka cancer i tidigt skede',
                'description': 'Karolinska Universitetssjukhuset implementerar AI-system som kan upptäcka cancer upp till 2 år tidigare än traditionella metoder. System tränat på 500,000 patientfall.',
                'url': 'https://www.dn.se/vetenskap/karolinska-ai-cancer',
                'published': '2025-09-24',
                'source': 'Dagens Nyheter'
            },
            {
                'title': 'Ericsson AI-plattform får miljardorder från telekomjätte',
                'description': 'Svenska Ericsson tecknar 5-årsavtal värt 3 miljarder kronor för sin AI-drivna nätverksoptimering. Kund är en av världens största teleoperatörer.',
                'url': 'https://www.nyteknik.se/telecom/ericsson-ai-order',
                'published': '2025-09-23',
                'source': 'Ny Teknik'
            },
            {
                'title': 'Volvo Cars integrerar ChatGPT i alla nya bilar från 2026',
                'description': 'Volvo Cars meddelar att alla nya modeller från 2026 kommer ha ChatGPT inbyggt i infotainmentsystemet. Förare kan ställa frågor och kontrollera bil via röstkommandon.',
                'url': 'https://www.nyteknik.se/fordon/volvo-chatgpt',
                'published': '2025-09-22',
                'source': 'Ny Teknik'
            },
            {
                'title': 'Nordea lanserar AI-rådgivare för privatsparkunder',
                'description': 'Nordeas nya AI-baserade sparrådgivare kan ge personlig rådgivning till miljontals kunder samtidigt. Tjänsten kostnadsfri för kunder med över 100,000 kr placerat.',
                'url': 'https://www.dn.se/ekonomi/nordea-ai-radgivare',
                'published': '2025-09-21',
                'source': 'Dagens Nyheter'
            },
            {
                'title': 'SEB använder AI för att stoppa bedrägeri – 95% träffsäkerhet',
                'description': 'SEB:s nya AI-system för bedrägeriskydd har 95% träffsäkerhet och har redan stoppat bedrägerier för hundratals miljoner. Analyserar transaktionsmönster i realtid.',
                'url': 'https://www.dn.se/ekonomi/seb-ai-bedrageri',
                'published': '2025-09-20',
                'source': 'Dagens Nyheter'
            },
            {
                'title': 'Northvolt använder AI för batterioptimering – ökar kapacitet 15%',
                'description': 'Svenska batteribolaget Northvolt implementerar AI för att optimera batteritillverkning. Tekniken ökar batterikapacitet med 15% och minskar produktionstid.',
                'url': 'https://www.nyteknik.se/energi/northvolt-ai',
                'published': '2025-09-19',
                'source': 'Ny Teknik'
            },
            {
                'title': 'Svenska skolelever får använda ChatGPT – med nya riktlinjer',
                'description': 'Skolverket presenterar nya nationella riktlinjer för AI-användning i skolan. ChatGPT tillåts men med tydliga ramar för källkritik och egen reflektion.',
                'url': 'https://www.dn.se/sverige/skolverket-chatgpt',
                'published': '2025-09-18',
                'source': 'Dagens Nyheter'
            },
            {
                'title': 'Polestar integrerar NVIDIA AI i nästa generation elbilar',
                'description': 'Svensk-kinesiska Polestar samarbetar med NVIDIA för att integrera avancerad AI i Polestar 5. Inkluderar självkörning nivå 3 och intelligent personalisering.',
                'url': 'https://www.nyteknik.se/fordon/polestar-nvidia',
                'published': '2025-09-17',
                'source': 'Ny Teknik'
            },
            {
                'title': 'Svenskt AI-företag Recorded Future säljs för 52 miljarder kronor',
                'description': 'Säkerhetsbolaget Recorded Future förvärvas av Mastercard för 52 miljarder kronor. En av de största svenska AI-exiterna någonsin. Grundades i Göteborg 2009.',
                'url': 'https://www.dn.se/ekonomi/recorded-future-exit',
                'published': '2025-09-16',
                'source': 'Dagens Nyheter'
            },
            {
                'title': '1X Technologies humanoid robot Neo börjar arbeta i norska lager',
                'description': 'Norska 1X Technologies (grundat av svenskar) installerar 50 humanoida robotar Neo i norskt logistikcenter. Robotar kan lyfta 20kg och arbeta 8 timmar per laddning.',
                'url': 'https://www.nyteknik.se/robotik/1x-neo-lager',
                'published': '2025-09-15',
                'source': 'Ny Teknik'
            },
            {
                'title': 'OpenAI öppnar Nordiskt huvudkontor i Stockholm',
                'description': 'OpenAI meddelar att man öppnar sitt första nordiska kontor i Stockholm med fokus på europeisk expansion. 50 personer ska anställas första året.',
                'url': 'https://www.dn.se/ekonomi/openai-stockholm',
                'published': '2025-09-14',
                'source': 'Dagens Nyheter'
            },
            {
                'title': 'Google DeepMind rekryterar från KTH och Chalmers',
                'description': 'Google DeepMind startar rekryteringsprogram riktat mot svenska AI-talanger från KTH och Chalmers. Erbjuder praktikplatser och direktanställningar till London.',
                'url': 'https://www.nyteknik.se/karriar/deepmind-rekrytering',
                'published': '2025-09-13',
                'source': 'Ny Teknik'
            },
            {
                'title': 'Svenska AI-startup Stilla får 200 MSEK från Creandum',
                'description': 'Biotech AI-företaget Stilla Technologies (molekylär diagnostik) säkrar 200 miljoner kronor i Series B från Creandum och Sofinnova Partners.',
                'url': 'https://breakit.se/stilla-funding',
                'published': '2025-09-12',
                'source': 'Breakit'
            },
            {
                'title': 'Meta AI lanseras på svenska – konkurrerar med ChatGPT',
                'description': 'Metas AI-assistent finns nu tillgänglig på svenska i WhatsApp, Instagram och Facebook Messenger. Gratis för alla användare i Norden.',
                'url': 'https://mediatell.se/ai-nyheter/meta-ai-svenska',
                'published': '2025-09-11',
                'source': 'Mediatell'
            },
            {
                'title': 'Einride får godkännande för självkörande lastbilar i Sverige',
                'description': 'Svenska Einrides autonoma ellastbilar får godkännande för kommersiell drift på svenska vägar. Första beställning från IKEA på 200 fordon.',
                'url': 'https://www.nyteknik.se/fordon/einride-godkannande',
                'published': '2025-09-10',
                'source': 'Ny Teknik'
            },
            {
                'title': 'EU:s AI Act träder i kraft – så påverkas svenska företag',
                'description': 'EU:s nya AI-lagstiftning börjar gälla med övergångsperiod till 2027. Svenska AI-företag måste anpassa sig till nya krav på transparens och säkerhet.',
                'url': 'https://www.dn.se/ekonomi/eu-ai-act',
                'published': '2025-09-09',
                'source': 'Dagens Nyheter'
            },
            {
                'title': 'Arm öppnar AI-chip designcenter i Lund',
                'description': 'Brittiska chipdesignern Arm etablerar AI-designcenter i Lund med 100 ingenjörer. Fokus på nästa generation AI-processorer för smartphones och datorer.',
                'url': 'https://www.nyteknik.se/elektronik/arm-lund',
                'published': '2025-09-08',
                'source': 'Ny Teknik'
            },
            {
                'title': 'Antaros Medical använder AI för läkemedelsutveckling',
                'description': 'Göteborgsbaserade Antaros Medical utvecklar AI som kan förutsäga läkemedelseffekter utan djurförsök. Tekniken godkänd av europeiska läkemedelsmyndigheten.',
                'url': 'https://www.nyteknik.se/medicin/antaros-ai',
                'published': '2025-09-07',
                'source': 'Ny Teknik'
            },
            {
                'title': 'Klarna förlänger samarbete med OpenAI – "AI-first strategi"',
                'description': 'Klarna tecknar nytt 5-årsavtal med OpenAI värt 500 miljoner kronor. VD Sebastian Siemiatkowski: "Vi är nu ett AI-first företag med finansiella tjänster".',
                'url': 'https://breakit.se/klarna-openai',
                'published': '2025-09-06',
                'source': 'Breakit'
            },
            {
                'title': 'AI-genererad musik når 10% av Spotifys totala streams',
                'description': 'Ny rapport visar att AI-genererad musik nu står för 10% av alla streams på Spotify. Plattformen introducerar märkning för att skilja AI-musik från mänsklig.',
                'url': 'https://www.dn.se/kultur-noje/spotify-ai-musik',
                'published': '2025-09-05',
                'source': 'Dagens Nyheter'
            },
            {
                'title': 'Microsoft Acquires AI Startup Inflection for $650M',
                'description': 'Microsoft announced the acquisition of AI startup Inflection AI, bringing advanced conversational AI capabilities to its product suite. The deal includes hiring key talent and licensing technology.',
                'url': 'https://seekingalpha.com/news/microsoft-inflection-acquisition',
                'published': '2024-03-15',
                'source': 'Seeking Alpha M&A'
            },
            {
                'title': 'EQT Completes $3.2B Acquisition of Software Group',
                'description': 'Private equity firm EQT Partners has completed its acquisition of a leading European software company for $3.2 billion, marking one of the largest tech deals this quarter.',
                'url': 'https://reuters.com/legal/mergers-acquisitions/eqt-software',
                'published': '2024-09-12',
                'source': 'Reuters M&A'
            },
            {
                'title': 'Pharmaceutical Giants Merge in $45 Billion Deal',
                'description': 'Two major pharmaceutical companies announced a definitive merger agreement valued at $45 billion, creating one of the worlds largest pharmaceutical companies with combined revenues exceeding $80 billion annually.',
                'url': 'https://seekingalpha.com/news/pharma-mega-merger',
                'published': datetime.now().strftime('%Y-%m-%d'),
                'source': 'Seeking Alpha M&A'
            },
            {
                'title': 'Triton Partners Acquires Industrial Services Company',
                'description': 'Triton Partners has agreed to acquire a leading industrial services provider in Northern Europe for an undisclosed sum. The deal strengthens Tritons portfolio in the business services sector.',
                'url': 'https://reuters.com/legal/triton-industrial-acquisition',
                'published': datetime.now().strftime('%Y-%m-%d'),
                'source': 'Reuters M&A'
            },
            {
                'title': 'Private Equity Firm KKR Completes $2.1B Retail Buyout',
                'description': 'KKR has successfully completed the acquisition of a national retail chain in a deal worth $2.1 billion. The firm plans to invest in digital transformation and expand the retailers online presence.',
                'url': 'https://seekingalpha.com/news/kkr-retail-buyout',
                'published': datetime.now().strftime('%Y-%m-%d'),
                'source': 'Seeking Alpha M&A'
            },
            {
                'title': 'Fintech Unicorn Stripe Acquires Payment Processor',
                'description': 'Stripe announced the acquisition of European payment processing company for $1.1 billion to expand its service offerings and market reach across Europe and strengthen its position in the competitive fintech landscape.',
                'url': 'https://reuters.com/legal/stripe-payment-acquisition',
                'published': datetime.now().strftime('%Y-%m-%d'),
                'source': 'Reuters M&A'
            },
            {
                'title': 'Energy Sector: $28B Cross-Border Merger Announced',
                'description': 'International energy companies join forces in a $28 billion merger deal, creating one of Europes largest renewable energy providers. The combined entity will accelerate renewable energy transition.',
                'url': 'https://seekingalpha.com/news/energy-mega-merger',
                'published': datetime.now().strftime('%Y-%m-%d'),
                'source': 'Seeking Alpha M&A'
            },
            {
                'title': 'Healthcare Tech: Telemedicine Platform Acquired for $890M',
                'description': 'Major healthcare provider acquires leading telemedicine platform in $890 million deal, expanding digital health capabilities and patient reach across multiple markets.',
                'url': 'https://reuters.com/legal/telemedicine-acquisition',
                'published': datetime.now().strftime('%Y-%m-%d'),
                'source': 'Reuters M&A'
            },
            {
                'title': 'Semiconductor Company Announces $5.4B Acquisition',
                'description': 'Leading semiconductor manufacturer announces acquisition of chip design firm for $5.4 billion to strengthen its position in AI and machine learning chip market.',
                'url': 'https://seekingalpha.com/news/semiconductor-acquisition',
                'published': datetime.now().strftime('%Y-%m-%d'),
                'source': 'Seeking Alpha M&A'
            },
            {
                'title': 'Defense Contractor Merger Creates $15B Giant',
                'description': 'Two defense contractors announce merger creating a $15 billion aerospace and defense company. The deal is subject to regulatory approval and expected to close by year-end.',
                'url': 'https://reuters.com/legal/defense-merger',
                'published': datetime.now().strftime('%Y-%m-%d'),
                'source': 'Reuters M&A'
            },
            {
                'title': 'Cloud Computing: Amazon Acquires Data Analytics Firm',
                'description': 'Amazon Web Services announces acquisition of data analytics startup to enhance its cloud computing offerings. The deal strengthens AWS position in enterprise analytics market.',
                'url': 'https://seekingalpha.com/news/aws-analytics-acquisition',
                'published': datetime.now().strftime('%Y-%m-%d'),
                'source': 'Seeking Alpha M&A'
            },
            {
                'title': 'Insurance Sector: $7.2B Merger Consolidates Market',
                'description': 'Two major insurance companies announce $7.2 billion merger, creating one of the largest property and casualty insurers in North America with over 30 million customers.',
                'url': 'https://reuters.com/legal/insurance-merger',
                'published': datetime.now().strftime('%Y-%m-%d'),
                'source': 'Reuters M&A'
            },
            {
                'title': 'Automotive: EV Battery Maker Acquired for $3.8B',
                'description': 'Major automotive manufacturer acquires electric vehicle battery technology company for $3.8 billion to secure supply chain and accelerate EV production targets.',
                'url': 'https://seekingalpha.com/news/ev-battery-acquisition',
                'published': datetime.now().strftime('%Y-%m-%d'),
                'source': 'Seeking Alpha M&A'
            },
            {
                'title': 'Real Estate: REIT Merger Creates $12B Portfolio',
                'description': 'Two real estate investment trusts announce merger creating a $12 billion commercial property portfolio focused on logistics and data center properties.',
                'url': 'https://reuters.com/legal/reit-merger',
                'published': datetime.now().strftime('%Y-%m-%d'),
                'source': 'Reuters M&A'
            },
            {
                'title': 'Biotech Breakthrough: $4.5B Acquisition of Gene Therapy Firm',
                'description': 'Pharmaceutical giant acquires gene therapy biotech company for $4.5 billion, gaining access to breakthrough treatments for rare genetic disorders.',
                'url': 'https://seekingalpha.com/news/gene-therapy-acquisition',
                'published': datetime.now().strftime('%Y-%m-%d'),
                'source': 'Seeking Alpha M&A'
            }
        ]
        
        print(f"📰 Generated {len(sample_news)} sample M&A news articles")
        return sample_news
    
    def scrape_seeking_alpha_ma(self):
        """
        Scrape M&A news from Seeking Alpha
        """
        articles = []
        
        try:
            print("📡 Fetching M&A news from Seeking Alpha...")
            url = self.ma_news_urls['seeking_alpha']
            
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Seeking Alpha uses various HTML structures - try to find article containers
                # Note: Web scraping can be fragile as websites change their structure
                article_elements = soup.find_all('article', limit=10) or soup.find_all('div', class_=re.compile('article', re.I), limit=10)
                
                for elem in article_elements[:5]:
                    try:
                        # Try to extract title
                        title_elem = elem.find(['h2', 'h3', 'a'])
                        if not title_elem:
                            continue
                            
                        title = title_elem.get_text(strip=True)
                        link = title_elem.get('href', '') if title_elem.name == 'a' else ''
                        
                        if link and not link.startswith('http'):
                            link = 'https://seekingalpha.com' + link
                        
                        # Try to extract description
                        desc_elem = elem.find('p')
                        description = desc_elem.get_text(strip=True)[:300] if desc_elem else title
                        
                        if title and len(title) > 10:
                            articles.append({
                                'title': title,
                                'url': link or url,
                                'description': description,
                                'published': datetime.now().strftime('%Y-%m-%d'),
                                'source': 'Seeking Alpha M&A'
                            })
                    except Exception as e:
                        continue
                
                print(f"✅ Found {len(articles)} articles from Seeking Alpha")
            else:
                print(f"⚠️  Seeking Alpha returned status code {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error scraping Seeking Alpha: {str(e)}")
        
        return articles
    
    def scrape_reuters_ma(self):
        """
        Scrape M&A news from Reuters
        """
        articles = []
        
        try:
            print("📡 Fetching M&A news from Reuters...")
            url = self.ma_news_urls['reuters']
            
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Reuters article structure
                article_elements = soup.find_all(['article', 'li'], limit=15)
                
                for elem in article_elements[:5]:
                    try:
                        # Find link and title
                        link_elem = elem.find('a')
                        if not link_elem:
                            continue
                        
                        title = link_elem.get_text(strip=True)
                        link = link_elem.get('href', '')
                        
                        if link and not link.startswith('http'):
                            link = 'https://www.reuters.com' + link
                        
                        # Try to find description
                        desc_elem = elem.find('p')
                        description = desc_elem.get_text(strip=True)[:300] if desc_elem else title
                        
                        if title and len(title) > 15 and 'mergers' in title.lower() or 'acquisition' in title.lower() or 'deal' in title.lower():
                            articles.append({
                                'title': title,
                                'url': link or url,
                                'description': description,
                                'published': datetime.now().strftime('%Y-%m-%d'),
                                'source': 'Reuters M&A'
                            })
                    except Exception as e:
                        continue
                
                print(f"✅ Found {len(articles)} articles from Reuters")
            else:
                print(f"⚠️  Reuters returned status code {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error scraping Reuters: {str(e)}")
        
        return articles
    
    def load_news_from_database(self):
        """
        Load M&A news from pre-built database
        Much more reliable and comprehensive!
        """
        try:
            db_path = 'ma_news_database.json'
            if os.path.exists(db_path):
                with open(db_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    articles = data.get('articles', [])
                    print(f"✅ Loaded {len(articles)} M&A news articles from database")
                    return articles
        except Exception as e:
            print(f"⚠️  Could not load news database: {e}")
        
        return []
    
    def scrape_all_sources(self):
        """
        Load news from database (no scraping needed!)
        Falls back to scraping only if database doesn't exist
        
        Returns:
            A list of all news articles from all sources
        """
        all_articles = []
        
        print("\n" + "="*60)
        print("📰 Loading M&A News...")
        print("="*60 + "\n")
        
        # First, try loading from pre-built database
        db_articles = self.load_news_from_database()
        if len(db_articles) > 0:
            print(f"\n✨ Total articles loaded from database: {len(db_articles)}\n")
            return db_articles
        
        # If database doesn't exist, try web scraping
        print("📡 Database not found, attempting to scrape...")
        
        # Try scraping real sources
        try:
            seeking_alpha_articles = self.scrape_seeking_alpha_ma()
            all_articles.extend(seeking_alpha_articles)
            time.sleep(1)  # Be polite
        except Exception as e:
            print(f"Seeking Alpha scraping failed: {e}")
        
        try:
            reuters_articles = self.scrape_reuters_ma()
            all_articles.extend(reuters_articles)
            time.sleep(1)
        except Exception as e:
            print(f"Reuters scraping failed: {e}")
        
        # If real scraping didn't work, use sample data
        if len(all_articles) == 0:
            print("⚠️  Real scraping didn't return results. Using sample data...")
            sample_articles = self.scrape_generic_ma_news()
            all_articles.extend(sample_articles)
        
        print(f"\n✨ Total articles collected: {len(all_articles)}\n")
        return all_articles
    
    def load_portfolio_from_database(self):
        """
        Load portfolio companies from pre-built JSON database
        Much more reliable than web scraping!
        """
        try:
            # Try comprehensive database first  
            db_path = 'portfolio_complete.json'
            if os.path.exists(db_path):
                with open(db_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    companies = data.get('portfolio_companies', [])
                    print(f"✅ Loaded {len(companies)} companies from comprehensive database")
                    return companies
            
            # Fallback to data_portfolio.json
            db_path = 'data_portfolio.json'
            if os.path.exists(db_path):
                with open(db_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    companies = data.get('portfolio_companies', [])
                    print(f"✅ Loaded {len(companies)} companies from database")
                    return companies
        except Exception as e:
            print(f"⚠️  Could not load database: {e}")
        
        return []
    
    def scrape_portfolio_companies(self):
        """
        Load portfolio companies from database (no scraping needed!)
        Falls back to scraping only if database doesn't exist
        
        Returns:
            A list of portfolio companies with their details
        """
        all_companies = []
        
        print("\n" + "="*60)
        print("🏢 Loading Portfolio Companies...")
        print("="*60 + "\n")
        
        # First, try loading from pre-built database
        db_companies = self.load_portfolio_from_database()
        if len(db_companies) > 0:
            print(f"\n✨ Total companies loaded from database: {len(db_companies)}\n")
            return db_companies
        
        # If database doesn't exist, try web scraping
        print("📡 Database not found, attempting to scrape...")
        print("="*60 + "\n")
        
        # Try EQT
        try:
            eqt_companies = self.scrape_eqt_portfolio()
            all_companies.extend(eqt_companies)
            time.sleep(1)
        except Exception as e:
            print(f"EQT scraping failed: {e}")
        
        # Try Triton
        try:
            triton_companies = self.scrape_triton_portfolio()
            all_companies.extend(triton_companies)
            time.sleep(1)
        except Exception as e:
            print(f"Triton scraping failed: {e}")
        
        # Try Valedo Partners
        try:
            valedo_companies = self.scrape_valedo_portfolio()
            all_companies.extend(valedo_companies)
            time.sleep(1)
        except Exception as e:
            print(f"Valedo scraping failed: {e}")
        
        # Try Litorina
        try:
            litorina_companies = self.scrape_litorina_portfolio()
            all_companies.extend(litorina_companies)
            time.sleep(1)
        except Exception as e:
            print(f"Litorina scraping failed: {e}")
        
        # Try additional Swedish PE firms with generic scraper
        additional_firms = [
            ('nordic_capital', 'Nordic Capital'),
            ('altor', 'Altor'),
            ('ratos', 'Ratos'),
            ('summa_equity', 'Summa Equity'),
            ('bure', 'Bure Equity'),
            ('verdane', 'Verdane'),
            ('adelis', 'Adelis Equity'),
            ('ik_partners', 'IK Partners'),
            ('accent', 'Accent Equity'),
            ('alder', 'Alder')
        ]
        
        for firm_key, firm_name in additional_firms:
            try:
                firm_companies = self.scrape_generic_portfolio(firm_key, firm_name)
                all_companies.extend(firm_companies)
                time.sleep(1)
            except Exception as e:
                print(f"{firm_name} scraping failed: {e}")
        
        # If real scraping didn't get enough data, supplement with sample data
        if len(all_companies) < 20:
            print("⚠️  Limited scraping results. Adding sample data for demonstration...")
            sample_data = self.get_sample_portfolio()
            # Add sample companies that aren't already in the list
            for sample in sample_data:
                if not any(c['company'] == sample['company'] for c in all_companies):
                    all_companies.append(sample)
        
        print(f"\n✨ Total companies collected: {len(all_companies)}\n")
        return all_companies
    
    def scrape_eqt_portfolio(self):
        """
        Scrape portfolio companies from EQT Group website
        """
        companies = []
        
        try:
            print("📡 Fetching portfolio from EQT Group...")
            url = self.portfolio_urls['eqt']
            
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # EQT uses a table structure - look for table rows
                table_rows = soup.find_all('tr')
                
                for row in table_rows[:50]:  # Limit to first 50
                    try:
                        cells = row.find_all('td')
                        if len(cells) >= 4:
                            company_name = cells[0].get_text(strip=True)
                            sector = cells[1].get_text(strip=True) if len(cells) > 1 else ''
                            fund = cells[2].get_text(strip=True) if len(cells) > 2 else ''
                            market = cells[3].get_text(strip=True) if len(cells) > 3 else ''
                            entry = cells[4].get_text(strip=True) if len(cells) > 4 else ''
                            
                            if company_name and len(company_name) > 2:
                                companies.append({
                                    'company': company_name,
                                    'sector': sector,
                                    'fund': fund,
                                    'market': market,
                                    'entry': entry,
                                    'source': 'EQT'
                                })
                    except Exception as e:
                        continue
                
                print(f"✅ Found {len(companies)} companies from EQT")
            else:
                print(f"⚠️  EQT returned status code {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error scraping EQT: {str(e)}")
        
        return companies
    
    def scrape_triton_portfolio(self):
        """
        Scrape portfolio companies from Triton Partners website
        Based on the actual HTML structure from https://www.triton-partners.com/portfolio/
        """
        companies = []
        
        try:
            print("📡 Fetching portfolio from Triton Partners...")
            url = self.portfolio_urls['triton']
            
            response = requests.get(url, headers=self.headers, timeout=15)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Triton uses a specific structure - look for portfolio items
                # Each company typically has sector and location info
                
                # Find all text that contains "Sector" to locate company blocks
                all_text = soup.get_text()
                
                # Method 1: Look for specific patterns in the text
                lines = all_text.split('\n')
                current_company = None
                current_sector = None
                current_location = None
                current_date = None
                
                for i, line in enumerate(lines):
                    line = line.strip()
                    
                    # Check if this looks like a company name (typically before "Sector")
                    if line and len(line) > 3 and not any(x in line.lower() for x in ['sector', 'location', 'investment', 'filter', 'reset', 'go', 'status']):
                        if i + 1 < len(lines) and 'Sector' in lines[i + 1]:
                            current_company = line
                    
                    # Extract sector
                    if line.startswith('Sector') and current_company:
                        current_sector = line.replace('Sector', '').strip()
                    
                    # Extract location
                    if line.startswith('Location') and current_company:
                        current_location = line.replace('Location', '').strip()
                    
                    # Extract investment date
                    if line.startswith('Investment date') and current_company:
                        current_date = line.replace('Investment date', '').strip()
                        
                        # Save the company
                        if current_company and current_company not in [c['company'] for c in companies]:
                            companies.append({
                                'company': current_company,
                                'sector': current_sector or 'Various',
                                'fund': 'Triton',
                                'market': current_location or 'Europe',
                                'entry': current_date or '',
                                'source': 'Triton Partners'
                            })
                        
                        # Reset for next company
                        current_company = None
                        current_sector = None
                        current_location = None
                        current_date = None
                
                print(f"✅ Found {len(companies)} companies from Triton")
            else:
                print(f"⚠️  Triton returned status code {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error scraping Triton: {str(e)}")
        
        return companies
    
    def scrape_valedo_portfolio(self):
        """
        Scrape portfolio companies from Valedo Partners website
        Note: Valedo's site may use JavaScript to load content dynamically
        """
        companies = []
        
        try:
            print("📡 Fetching portfolio from Valedo Partners...")
            url = self.portfolio_urls['valedo']
            
            response = requests.get(url, headers=self.headers, timeout=15)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Valedo's structure - look for company listings
                # The site may use JavaScript, so we'll try to parse what's available
                company_elements = soup.find_all(['div', 'article', 'li'], class_=re.compile('portfolio|company|investment', re.I))
                
                for elem in company_elements[:30]:
                    try:
                        # Try to find company name
                        title_elem = elem.find(['h2', 'h3', 'h4', 'a', 'span'])
                        if not title_elem:
                            continue
                        
                        company_name = title_elem.get_text(strip=True)
                        
                        # Skip navigation/menu items
                        if company_name.lower() in ['current', 'exited', 'investments', 'case studies', 'about', 'news', 'contact']:
                            continue
                        
                        if company_name and len(company_name) > 2 and len(company_name) < 50:
                            companies.append({
                                'company': company_name,
                                'sector': 'Various',
                                'fund': 'Valedo Partners',
                                'market': 'Sweden',
                                'entry': '',
                                'source': 'Valedo Partners'
                            })
                    except Exception as e:
                        continue
                
                # Remove duplicates
                seen = set()
                companies = [c for c in companies if c['company'] not in seen and not seen.add(c['company'])]
                
                print(f"✅ Found {len(companies)} companies from Valedo Partners")
            else:
                print(f"⚠️  Valedo returned status code {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error scraping Valedo: {str(e)}")
        
        return companies
    
    def scrape_litorina_portfolio(self):
        """
        Scrape portfolio companies from Litorina website
        Based on https://litorina.se/investments/
        """
        companies = []
        
        try:
            print("📡 Fetching portfolio from Litorina...")
            url = self.portfolio_urls['litorina']
            
            response = requests.get(url, headers=self.headers, timeout=15)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Litorina has a clear structure with company names, sectors, HQ, etc.
                # Look for the text patterns
                all_text = soup.get_text()
                lines = all_text.split('\n')
                
                current_company = None
                current_sector = None
                current_hq = None
                current_year = None
                current_fund = None
                
                for i, line in enumerate(lines):
                    line = line.strip()
                    
                    # Company names appear before sector/HQ info
                    # Look for patterns like "Brödernas", "Care of Carl", etc.
                    if line and len(line) > 2 and len(line) < 40:
                        # Check if next lines contain "Consumer", "Business services", etc.
                        if i + 1 < len(lines):
                            next_line = lines[i + 1].strip()
                            if next_line in ['Consumer', 'Business services', 'Other']:
                                current_company = line
                                continue
                    
                    # Extract sector
                    if line in ['Consumer', 'Business services', 'Other'] and current_company:
                        current_sector = line
                    
                    # Extract HQ
                    if line.startswith('HQ:') and current_company:
                        current_hq = line.replace('HQ:', '').strip()
                    
                    # Extract investment year
                    if line.startswith('Investment year:') and current_company:
                        current_year = line.replace('Investment year:', '').strip()
                    
                    # Extract fund
                    if line.startswith('Fund:') and current_company:
                        current_fund = line.replace('Fund:', '').strip()
                        
                        # Save the company
                        if current_company and current_company not in [c['company'] for c in companies]:
                            # Extract market from HQ
                            market = 'Sweden'  # Default
                            if current_hq:
                                if 'Denmark' in current_hq:
                                    market = 'Denmark'
                                elif 'Sweden' in current_hq:
                                    market = 'Sweden'
                                else:
                                    market = current_hq.split(',')[-1].strip() if ',' in current_hq else 'Sweden'
                            
                            companies.append({
                                'company': current_company,
                                'sector': current_sector or 'Various',
                                'fund': current_fund or 'Litorina',
                                'market': market,
                                'entry': current_year or '',
                                'source': 'Litorina'
                            })
                        
                        # Reset for next company
                        current_company = None
                        current_sector = None
                        current_hq = None
                        current_year = None
                        current_fund = None
                
                print(f"✅ Found {len(companies)} companies from Litorina")
            else:
                print(f"⚠️  Litorina returned status code {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error scraping Litorina: {str(e)}")
        
        return companies
    
    def scrape_generic_portfolio(self, firm_key, firm_name):
        """
        Generic scraper for PE firm portfolios
        Attempts to extract company names from portfolio pages
        """
        companies = []
        
        try:
            print(f"📡 Fetching portfolio from {firm_name}...")
            url = self.portfolio_urls.get(firm_key)
            
            if not url:
                return companies
            
            response = requests.get(url, headers=self.headers, timeout=15)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Try multiple strategies to find company names
                company_names = set()
                
                # Strategy 1: Look for common class patterns
                for pattern in ['portfolio', 'company', 'investment', 'holding']:
                    elements = soup.find_all(class_=re.compile(pattern, re.I))
                    for elem in elements[:50]:
                        text = elem.get_text(strip=True)
                        if 3 < len(text) < 50 and not any(x in text.lower() for x in ['portfolio', 'read more', 'learn more', 'view', 'contact']):
                            company_names.add(text)
                
                # Strategy 2: Look for heading tags
                for tag in ['h2', 'h3', 'h4']:
                    headings = soup.find_all(tag)
                    for h in headings[:30]:
                        text = h.get_text(strip=True)
                        if 3 < len(text) < 50:
                            company_names.add(text)
                
                # Create company entries
                for name in list(company_names)[:20]:  # Limit to 20 companies
                    companies.append({
                        'company': name,
                        'sector': 'Various',
                        'fund': firm_name,
                        'market': 'Sweden',
                        'entry': '',
                        'source': firm_name
                    })
                
                print(f"✅ Found {len(companies)} companies from {firm_name}")
            else:
                print(f"⚠️  {firm_name} returned status code {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error scraping {firm_name}: {str(e)}")
        
        return companies
    
    def get_sample_portfolio(self):
        """
        Comprehensive sample portfolio companies from all Swedish PE firms
        Used as fallback when scraping doesn't work
        """
        return [
            # Litorina
            {'company': 'Brödernas', 'sector': 'Consumer', 'fund': 'Litorina V', 'market': 'Sweden', 'entry': '2021', 'source': 'Litorina'},
            {'company': 'Care of Carl', 'sector': 'Consumer', 'fund': 'Litorina V', 'market': 'Sweden', 'entry': '2018', 'source': 'Litorina'},
            {'company': 'Digpro', 'sector': 'Business Services', 'fund': 'Litorina V', 'market': 'Sweden', 'entry': '2017', 'source': 'Litorina'},
            {'company': 'Layer Group', 'sector': 'Business Services', 'fund': 'Litorina V', 'market': 'Sweden', 'entry': '2021', 'source': 'Litorina'},
            {'company': "Leo's Lekland", 'sector': 'Consumer', 'fund': 'Litorina IV', 'market': 'Sweden', 'entry': '2014', 'source': 'Litorina'},
            
            # Valedo Partners
            {'company': 'Inwido', 'sector': 'Building Products', 'fund': 'Valedo Partners', 'market': 'Sweden', 'entry': '2014', 'source': 'Valedo Partners'},
            {'company': 'Doro', 'sector': 'Technology', 'fund': 'Valedo Partners', 'market': 'Sweden', 'entry': '2015', 'source': 'Valedo Partners'},
            {'company': 'Paradox Interactive', 'sector': 'Gaming', 'fund': 'Valedo Partners', 'market': 'Sweden', 'entry': '2016', 'source': 'Valedo Partners'},
            
            # Nordic Capital
            {'company': 'Ellab', 'sector': 'Healthcare', 'fund': 'Nordic Capital XI', 'market': 'Denmark', 'entry': '2021', 'source': 'Nordic Capital'},
            {'company': 'Azelis', 'sector': 'Chemicals', 'fund': 'Nordic Capital Fund X', 'market': 'Belgium', 'entry': '2018', 'source': 'Nordic Capital'},
            {'company': 'Chr. Hansen', 'sector': 'Healthcare', 'fund': 'Nordic Capital', 'market': 'Denmark', 'entry': '2023', 'source': 'Nordic Capital'},
            {'company': 'Inexto', 'sector': 'Technology', 'fund': 'Nordic Capital XI', 'market': 'Spain', 'entry': '2021', 'source': 'Nordic Capital'},
            
            # Altor
            {'company': 'Karnov Group', 'sector': 'Information Services', 'fund': 'Altor Fund V', 'market': 'Sweden', 'entry': '2020', 'source': 'Altor'},
            {'company': 'AddSecure', 'sector': 'Technology', 'fund': 'Altor Fund V', 'market': 'Sweden', 'entry': '2018', 'source': 'Altor'},
            {'company': 'Byggmax', 'sector': 'Retail', 'fund': 'Altor Fund IV', 'market': 'Sweden', 'entry': '2021', 'source': 'Altor'},
            {'company': 'Dustin', 'sector': 'IT Distribution', 'fund': 'Altor Fund IV', 'market': 'Sweden', 'entry': '2015', 'source': 'Altor'},
            
            # Ratos
            {'company': 'Bisnode', 'sector': 'Business Services', 'fund': 'Ratos', 'market': 'Sweden', 'entry': '2017', 'source': 'Ratos'},
            {'company': 'LEDiL', 'sector': 'Technology', 'fund': 'Ratos', 'market': 'Finland', 'entry': '2019', 'source': 'Ratos'},
            {'company': 'airteam', 'sector': 'Business Services', 'fund': 'Ratos', 'market': 'Sweden', 'entry': '2020', 'source': 'Ratos'},
            {'company': 'HENT', 'sector': 'Construction', 'fund': 'Ratos', 'market': 'Norway', 'entry': '2021', 'source': 'Ratos'},
            
            # Summa Equity
            {'company': 'Meltwater', 'sector': 'Software', 'fund': 'Summa Equity Fund II', 'market': 'Norway', 'entry': '2019', 'source': 'Summa Equity'},
            {'company': 'Cabonline', 'sector': 'Transport', 'fund': 'Summa Equity Fund I', 'market': 'Sweden', 'entry': '2017', 'source': 'Summa Equity'},
            {'company': 'Mynewsdesk', 'sector': 'Software', 'fund': 'Summa Equity Fund I', 'market': 'Sweden', 'entry': '2018', 'source': 'Summa Equity'},
            
            # Bure Equity
            {'company': 'Cavotec', 'sector': 'Industrial Tech', 'fund': 'Bure Equity', 'market': 'Switzerland', 'entry': '2011', 'source': 'Bure Equity'},
            {'company': 'Vitrolife', 'sector': 'Healthcare', 'fund': 'Bure Equity', 'market': 'Sweden', 'entry': '1994', 'source': 'Bure Equity'},
            {'company': 'Xvivo Perfusion', 'sector': 'Healthcare', 'fund': 'Bure Equity', 'market': 'Sweden', 'entry': '2010', 'source': 'Bure Equity'},
            
            # Verdane
            {'company': 'Unacast', 'sector': 'Data Analytics', 'fund': 'Verdane Capital IX', 'market': 'Norway', 'entry': '2019', 'source': 'Verdane'},
            {'company': 'PSI CRO', 'sector': 'Healthcare', 'fund': 'Verdane Capital VIII', 'market': 'Switzerland', 'entry': '2018', 'source': 'Verdane'},
            {'company': 'Certego', 'sector': 'Security Services', 'fund': 'Verdane Edda II', 'market': 'Sweden', 'entry': '2021', 'source': 'Verdane'},
            
            # Adelis Equity
            {'company': 'Eltel', 'sector': 'Infrastructure Services', 'fund': 'Adelis III', 'market': 'Sweden', 'entry': '2020', 'source': 'Adelis Equity'},
            {'company': 'Polygiene', 'sector': 'Consumer Products', 'fund': 'Adelis II', 'market': 'Sweden', 'entry': '2018', 'source': 'Adelis Equity'},
            
            # IK Partners
            {'company': 'Egmont', 'sector': 'Media', 'fund': 'IK IX', 'market': 'Denmark', 'entry': '2020', 'source': 'IK Partners'},
            {'company': 'Jollyroom', 'sector': 'E-Commerce', 'fund': 'IK VIII', 'market': 'Sweden', 'entry': '2019', 'source': 'IK Partners'},
            
            # Accent Equity
            {'company': 'Hedda.io', 'sector': 'Software', 'fund': 'Accent Fund VI', 'market': 'Sweden', 'entry': '2022', 'source': 'Accent Equity'},
            {'company': 'Tempus Retail', 'sector': 'Retail Tech', 'fund': 'Accent Fund V', 'market': 'Sweden', 'entry': '2020', 'source': 'Accent Equity'},
            
            # Alder
            {'company': 'Cint', 'sector': 'Market Research Tech', 'fund': 'Alder Fund II', 'market': 'Sweden', 'entry': '2017', 'source': 'Alder'},
            {'company': 'NEP', 'sector': 'Broadcast Services', 'fund': 'Alder Fund I', 'market': 'USA', 'entry': '2015', 'source': 'Alder'},
        ]


# Test the scraper if this file is run directly
if __name__ == '__main__':
    print("Testing M&A Scraper...\n")
    scraper = MAScraper()
    articles = scraper.scrape_all_sources()
    
    print("\n📊 Sample Results:")
    print("-" * 60)
    for i, article in enumerate(articles[:3], 1):
        print(f"\n{i}. {article['title']}")
        print(f"   Source: {article['source']}")
        print(f"   Description: {article['description'][:100]}...")

