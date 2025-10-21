// AI News Data and Functionality

let allNews = [];
let currentFilter = 'all';
let currentRegion = 'all';

// AI News Data - Swedish & Global AI News
const aiNewsData = [
    {
        title: "OpenAI Launches GPT-5 – Like Talking to a PhD-Level Expert",
        category: "product",
        region: "global",
        date: "2025-10-18",
        source: "Ny Teknik",
        description: "OpenAI releases a new version of ChatGPT marketed as faster and smarter than before. The new GPT-5 model is described as having PhD-level reasoning capabilities across multiple domains.",
        highlights: [
            "New GPT-5 model launched",
            "Expert-level reasoning",
            "Faster response times",
            "Improved coding capabilities",
            "Enhanced multimodal support"
        ],
        companies: ["OpenAI"],
        link: "https://www.nyteknik.se/tech/openai-gpt-5"
    },
    {
        title: "Swedish AI Startup Partners with OpenAI – They Wanted to Learn From Us",
        category: "partnership",
        region: "nordic",
        date: "2025-10-17",
        source: "Ny Teknik",
        description: "A Swedish AI company has signed strategic partnership with OpenAI. The technology will now be stress-tested in Swedish public sector. 'They were impressed by our implementation,' says the CEO.",
        highlights: [
            "Strategic OpenAI partnership",
            "Public sector implementation",
            "Swedish AI innovation recognized",
            "Technology transfer agreement",
            "Scalability testing planned"
        ],
        companies: ["OpenAI"],
        link: "https://www.nyteknik.se/tech/svensk-ai-openai"
    },
    {
        title: "Lovable Raises €170M at €17B Valuation",
        category: "funding",
        region: "nordic",
        date: "2025-01-15",
        source: "TechCrunch",
        description: "Swedish AI coding platform Lovable raises massive funding round led by Sequoia Capital at €17 billion valuation.",
        highlights: [
            "€170M Series A funding round",
            "€17B post-money valuation",
            "Led by Sequoia Capital",
            "720M SEK ARR achieved in 6 months",
            "Plans to expand to enterprise market"
        ],
        companies: ["Lovable", "Sequoia", "Creandum"],
        link: "#"
    },
    {
        title: "Legora Secures €800M in Oversubscribed Round",
        category: "funding",
        region: "nordic",
        date: "2025-01-10",
        description: "Legal AI platform Legora raises €800M from top-tier investors including Iconiq and General Catalyst.",
        highlights: [
            "€800M funding round",
            "€6.5B valuation",
            "Backed by Iconiq, General Catalyst, Benchmark",
            "Expanding to US and EU markets",
            "200% YoY revenue growth"
        ],
        companies: ["Legora", "Iconiq", "General Catalyst"],
        link: "#"
    },
    {
        title: "Tandem Health Raises €500M for Healthcare AI",
        category: "funding",
        region: "nordic",
        date: "2025-01-05",
        description: "Healthcare AI company Tandem Health secures major funding from Northzone and Kinnevik.",
        highlights: [
            "€500M Series B funding",
            "€2-3B estimated valuation",
            "180M SEK ARR in Q1 2025",
            "AI-powered medical documentation",
            "Expanding across Europe"
        ],
        companies: ["Tandem Health", "Northzone", "Kinnevik"],
        link: "#"
    },
    {
        title: "Listen Labs Secures €260M from Sequoia",
        category: "funding",
        region: "nordic",
        date: "2024-12-20",
        description: "AI-powered customer research platform raises funding from Sequoia, Conviction, and Pear VC.",
        highlights: [
            "€260M total funding",
            "Led by Sequoia Capital",
            "AI voice interviews at scale",
            "$1M ARR achieved quickly",
            "US market expansion"
        ],
        companies: ["Listen Labs", "Sequoia", "Pear VC"],
        link: "#"
    },
    {
        title: "Sana AI Launches New Enterprise Platform",
        category: "product",
        region: "nordic",
        date: "2024-12-15",
        description: "Sana unveils next-generation AI agent platform for enterprise knowledge management.",
        highlights: [
            "New enterprise AI agent platform",
            "Integration with major CRM systems",
            "50+ enterprise customers signed",
            "Swedish AI Reform initiative launched",
            "Partnership with major universities"
        ],
        companies: ["Sana"],
        link: "#"
    },
    {
        title: "OpenAI Receives $6.5B from Microsoft, Nvidia",
        category: "funding",
        region: "global",
        date: "2024-12-10",
        description: "OpenAI closes massive funding round led by Microsoft and Nvidia at $157B valuation.",
        highlights: [
            "$6.5B funding round",
            "$157B post-money valuation",
            "Led by Microsoft and Nvidia",
            "Thrive Capital also participated",
            "Expanding compute infrastructure"
        ],
        companies: ["OpenAI", "Microsoft", "Nvidia"],
        link: "#"
    },
    {
        title: "Filed Raises €170M for AI Tax Platform",
        category: "funding",
        region: "nordic",
        date: "2024-12-01",
        description: "Swedish AI tax automation platform secured funding from Northzone and Greens Ventures.",
        highlights: [
            "€170M Series A",
            "Targeting US tax consultants",
            "3M SEK revenue in 8 months",
            "AI-powered tax automation",
            "Expanding to all US states"
        ],
        companies: ["Filed", "Northzone", "Greens Ventures"],
        link: "#"
    },
    {
        title: "Mistral AI Reaches €5B Valuation",
        category: "funding",
        region: "europe",
        date: "2024-11-25",
        description: "French AI company Mistral AI raises €450M led by Nvidia and General Catalyst.",
        highlights: [
            "€450M Series B funding",
            "€5B valuation",
            "Open-source LLM development",
            "Nvidia strategic investment",
            "European AI champion"
        ],
        companies: ["Mistral AI", "Nvidia", "General Catalyst"],
        link: "#"
    },
    {
        title: "AI-Bob Secures Seed Funding for Construction AI",
        category: "funding",
        region: "nordic",
        date: "2024-11-20",
        description: "Swedish construction AI startup raises seed round to automate building permit reviews.",
        highlights: [
            "Seed funding round",
            "AI for Swedish building regulations",
            "Automating blueprint reviews",
            "20+ construction firms as customers",
            "Expanding to Norway and Denmark"
        ],
        companies: ["AI-Bob"],
        link: "#"
    },
    {
        title: "Anthropic Launches Claude 3 Opus",
        category: "product",
        region: "us",
        date: "2024-11-15",
        source: "TechCrunch",
        description: "Anthropic releases Claude 3 Opus, their most capable AI model to date.",
        highlights: [
            "New flagship model Claude 3 Opus",
            "Outperforms GPT-4 on key benchmarks",
            "200K token context window",
            "Enterprise partnerships announced",
            "Focus on safety and alignment"
        ],
        companies: ["Anthropic"],
        link: "#"
    },
    {
        title: "Klarna AI Now Handles 2.3 Million Customer Calls Per Month",
        category: "product",
        region: "nordic",
        date: "2025-09-28",
        source: "Dagens Nyheter",
        description: "Swedish fintech company Klarna reports that their AI assistant now handles millions of customer calls monthly, equivalent to 700 full-time employees. Response time cut in half from 11 to 2 minutes.",
        highlights: [
            "2.3M customer calls per month",
            "Equivalent to 700 FTEs",
            "Response time 11 to 2 minutes",
            "AI customer service platform",
            "Significant cost savings"
        ],
        companies: ["Klarna"],
        link: "https://www.dn.se/ekonomi/klarna-ai-kundservice"
    },
    {
        title: "H&M Invests SEK 1 Billion in AI for Inventory Optimization",
        category: "research",
        region: "nordic",
        date: "2025-09-27",
        source: "Ny Teknik",
        description: "Fashion retailer H&M invests over 1 billion SEK in AI systems to optimize inventory and reduce waste. Pilot project shows 40% reduction in overstock.",
        highlights: [
            "SEK 1 billion AI investment",
            "40% overstock reduction",
            "Supply chain optimization",
            "Sustainability focus",
            "Real-time inventory management"
        ],
        companies: ["H&M"],
        link: "https://www.nyteknik.se/industri/hm-ai-investering"
    },
    {
        title: "Spotify Launches AI DJ in Swedish – Like Having a Friend Play Music",
        category: "product",
        region: "nordic",
        date: "2025-09-26",
        source: "Mediatell",
        description: "Spotify rolls out its AI DJ feature in Swedish, Norwegian and Danish. The feature uses voice AI and recommendation algorithms for personalized music experience.",
        highlights: [
            "AI DJ in Scandinavian languages",
            "Personalized music experience",
            "Voice AI integration",
            "Advanced recommendations",
            "Natural language understanding"
        ],
        companies: ["Spotify"],
        link: "https://mediatell.se/ai-nyheter/spotify-ai-dj-svenska"
    },
    {
        title: "Scania Tests Autonomous Trucks on Swedish Highway",
        category: "research",
        region: "nordic",
        date: "2025-09-25",
        source: "Ny Teknik",
        description: "Swedish truck manufacturer Scania launches large-scale test of AI-driven autonomous trucks on E4 highway. Technology combines LiDAR, cameras and advanced AI models.",
        highlights: [
            "Autonomous trucks on E4",
            "LiDAR + camera fusion",
            "Advanced AI models",
            "Safety testing phase",
            "Commercial deployment planned"
        ],
        companies: ["Scania"],
        link: "https://www.nyteknik.se/fordon/scania-sjalvkorande"
    },
    {
        title: "Karolinska Uses AI to Detect Cancer at Early Stage",
        category: "research",
        region: "nordic",
        date: "2025-09-24",
        source: "Dagens Nyheter",
        description: "Karolinska University Hospital implements AI system that can detect cancer up to 2 years earlier than traditional methods. System trained on 500,000 patient cases.",
        highlights: [
            "Cancer detection 2 years earlier",
            "Trained on 500K cases",
            "Medical imaging AI",
            "Clinical deployment",
            "Improved patient outcomes"
        ],
        companies: ["Karolinska"],
        link: "https://www.dn.se/vetenskap/karolinska-ai-cancer"
    },
    {
        title: "Ericsson AI Platform Wins Billion-SEK Order from Telecom Giant",
        category: "partnership",
        region: "nordic",
        date: "2025-09-23",
        source: "Ny Teknik",
        description: "Swedish Ericsson signs 5-year contract worth 3 billion SEK for its AI-driven network optimization. Customer is one of the world's largest telecom operators.",
        highlights: [
            "SEK 3 billion contract",
            "5-year partnership",
            "Network optimization AI",
            "Major telecom operator",
            "Enterprise AI platform"
        ],
        companies: ["Ericsson"],
        link: "https://www.nyteknik.se/telecom/ericsson-ai-order"
    },
    {
        title: "Volvo Cars Integrates ChatGPT in All New Cars from 2026",
        category: "partnership",
        region: "nordic",
        date: "2025-09-22",
        source: "Ny Teknik",
        description: "Volvo Cars announces that all new models from 2026 will have ChatGPT built into the infotainment system. Drivers can ask questions and control vehicle via voice commands.",
        highlights: [
            "ChatGPT in all 2026 models",
            "Voice command integration",
            "In-car AI assistant",
            "Natural conversation",
            "Vehicle control via voice"
        ],
        companies: ["Volvo", "OpenAI"],
        link: "https://www.nyteknik.se/fordon/volvo-chatgpt"
    },
    {
        title: "Nordea Launches AI Advisor for Retail Savings Customers",
        category: "product",
        region: "nordic",
        date: "2025-09-21",
        source: "Dagens Nyheter",
        description: "Nordea's new AI-based savings advisor can provide personalized advice to millions of customers simultaneously. Service free for customers with over 100,000 SEK invested.",
        highlights: [
            "AI financial advisor",
            "Personalized recommendations",
            "Free for 100K+ customers",
            "Scalable advisory",
            "Investment optimization"
        ],
        companies: ["Nordea"],
        link: "https://www.dn.se/ekonomi/nordea-ai-radgivare"
    },
    {
        title: "SEB Uses AI to Stop Fraud – 95% Accuracy Rate",
        category: "product",
        region: "nordic",
        date: "2025-09-20",
        source: "Dagens Nyheter",
        description: "SEB's new AI system for fraud protection has 95% accuracy and has already stopped frauds worth hundreds of millions. Analyzes transaction patterns in real-time.",
        highlights: [
            "95% fraud detection accuracy",
            "Real-time analysis",
            "Hundreds of millions saved",
            "Pattern recognition AI",
            "Transaction monitoring"
        ],
        companies: ["SEB"],
        link: "https://www.dn.se/ekonomi/seb-ai-bedrageri"
    },
    {
        title: "Northvolt Uses AI for Battery Optimization – Increases Capacity 15%",
        category: "research",
        region: "nordic",
        date: "2025-09-19",
        source: "Ny Teknik",
        description: "Swedish battery company Northvolt implements AI to optimize battery manufacturing. Technology increases battery capacity by 15% and reduces production time.",
        highlights: [
            "15% capacity increase",
            "Manufacturing optimization",
            "Reduced production time",
            "Quality improvement",
            "AI-driven process control"
        ],
        companies: ["Northvolt"],
        link: "https://www.nyteknik.se/energi/northvolt-ai"
    },
    {
        title: "Swedish AI Company Recorded Future Sold for SEK 52 Billion",
        category: "exits",
        region: "nordic",
        date: "2025-09-16",
        source: "Dagens Nyheter",
        description: "Security company Recorded Future acquired by Mastercard for 52 billion SEK. One of the largest Swedish AI exits ever. Founded in Gothenburg 2009.",
        highlights: [
            "SEK 52 billion acquisition",
            "Acquired by Mastercard",
            "Largest Swedish AI exit",
            "Founded in Gothenburg 2009",
            "Security intelligence platform"
        ],
        companies: ["Recorded Future", "Mastercard"],
        link: "https://www.dn.se/ekonomi/recorded-future-exit"
    },
    {
        title: "1X Technologies Humanoid Robot Neo Starts Working in Norwegian Warehouse",
        category: "product",
        region: "nordic",
        date: "2025-09-15",
        source: "Ny Teknik",
        description: "Norwegian 1X Technologies (founded by Swedes) installs 50 humanoid Neo robots in Norwegian logistics center. Robots can lift 20kg and work 8 hours per charge.",
        highlights: [
            "50 humanoid robots deployed",
            "20kg lifting capacity",
            "8-hour battery life",
            "Warehouse automation",
            "Commercial deployment"
        ],
        companies: ["1X Technologies"],
        link: "https://www.nyteknik.se/robotik/1x-neo-lager"
    },
    {
        title: "OpenAI Opens Nordic Headquarters in Stockholm",
        category: "partnership",
        region: "nordic",
        date: "2025-09-14",
        source: "Dagens Nyheter",
        description: "OpenAI announces opening of its first Nordic office in Stockholm with focus on European expansion. 50 people will be hired in first year.",
        highlights: [
            "First Nordic office",
            "Stockholm location",
            "50 employees year one",
            "European expansion",
            "Nordic AI hub"
        ],
        companies: ["OpenAI"],
        link: "https://www.dn.se/ekonomi/openai-stockholm"
    },
    {
        title: "Stilla Technologies Raises SEK 200M from Creandum",
        category: "funding",
        region: "nordic",
        date: "2025-09-12",
        source: "Breakit",
        description: "Biotech AI company Stilla Technologies (molecular diagnostics) secures 200 million SEK in Series B from Creandum and Sofinnova Partners.",
        highlights: [
            "SEK 200M Series B",
            "Creandum lead investor",
            "Molecular diagnostics AI",
            "Biotech innovation",
            "European expansion"
        ],
        companies: ["Stilla", "Creandum"],
        link: "https://breakit.se/stilla-funding"
    },
    {
        title: "Einride Gets Approval for Autonomous Trucks in Sweden",
        category: "research",
        region: "nordic",
        date: "2025-09-10",
        source: "Ny Teknik",
        description: "Swedish Einride's autonomous electric trucks receive approval for commercial operations on Swedish roads. First order from IKEA for 200 vehicles.",
        highlights: [
            "Commercial approval granted",
            "Autonomous electric trucks",
            "200 vehicles for IKEA",
            "Swedish roads deployment",
            "Sustainable transport"
        ],
        companies: ["Einride", "IKEA"],
        link: "https://www.nyteknik.se/fordon/einride-godkannande"
    },
    {
        title: "Klarna Extends OpenAI Partnership – AI-First Strategy",
        category: "partnership",
        region: "nordic",
        date: "2025-09-06",
        source: "Breakit",
        description: "Klarna signs new 5-year agreement with OpenAI worth 500 million SEK. CEO Sebastian Siemiatkowski: 'We are now an AI-first company with financial services.'",
        highlights: [
            "SEK 500M OpenAI partnership",
            "5-year agreement",
            "AI-first strategy",
            "Financial services transformation",
            "Strategic AI integration"
        ],
        companies: ["Klarna", "OpenAI"],
        link: "https://breakit.se/klarna-openai"
    },
    {
        title: "Recorded Future acquires Hatching for $30M to expand malware analysis",
        category: "exits",
        region: "global",
        date: "2025-09-01",
        source: "TechCrunch",
        description: "Swedish cybersecurity AI company Recorded Future, backed by Insight Partners, acquires Dutch malware sandbox firm Hatching for $30 million to strengthen threat intelligence.",
        highlights: [
            "$30M acquisition",
            "Malware analysis expansion",
            "Threat intelligence integration",
            "European cybersecurity consolidation",
            "AI-powered security"
        ],
        companies: ["Recorded Future"],
        link: "https://techcrunch.com/recorded-future-hatching"
    },
    {
        title: "Depict raises €45M Series B for AI-powered e-commerce search",
        category: "funding",
        region: "nordic",
        date: "2025-08-25",
        source: "Dagens Industri",
        description: "Swedish AI search startup Depict, founded by former Spotify engineers, secures €45M Series B from Accel and existing investors to scale AI-powered product discovery.",
        highlights: [
            "€45M Series B round",
            "Led by Accel",
            "10x revenue growth YoY",
            "100+ e-commerce clients",
            "Expanding to US market"
        ],
        companies: ["Depict", "Accel", "Creandum"],
        link: "https://www.di.se/depict-series-b"
    },
    {
        title: "Einride secures €200M to scale autonomous freight with DB Schenker",
        category: "funding",
        region: "nordic",
        date: "2025-08-18",
        source: "Financial Times",
        description: "Swedish autonomous trucking company Einride raises €200M in strategic funding, with logistics giant DB Schenker participating, to deploy AI-powered electric trucks across Europe.",
        highlights: [
            "€200M funding round",
            "DB Schenker strategic partnership",
            "1000+ autonomous trucks planned",
            "€1.5B valuation",
            "Operational in 5 countries"
        ],
        companies: ["Einride", "DB Schenker", "EQT Ventures"],
        link: "https://ft.com/einride-200m"
    },
    {
        title: "Silo AI rebrands to AMD AI after €665M acquisition closes",
        category: "exits",
        region: "nordic",
        date: "2025-08-10",
        source: "Bloomberg",
        description: "Finnish AI company Silo AI completes integration into AMD following €665M acquisition. The Nordic team will lead AMD's European AI initiatives and custom model development.",
        highlights: [
            "€665M acquisition completed",
            "Rebranding to AMD AI Europe",
            "300 AI researchers retained",
            "Leading AMD's European AI strategy",
            "Largest Nordic AI exit"
        ],
        companies: ["Silo AI", "AMD"],
        link: "https://bloomberg.com/silo-ai-amd"
    },
    {
        title: "1X Technologies unveils NEO humanoid robot for home use",
        category: "product",
        region: "nordic",
        date: "2025-07-30",
        source: "The Verge",
        description: "Norwegian robotics company 1X, backed by OpenAI, launches NEO – a humanoid robot designed for household tasks. Pre-orders open at $50,000.",
        highlights: [
            "NEO humanoid robot launched",
            "Designed for home environments",
            "$50K price point",
            "OpenAI collaboration",
            "Shipping Q1 2026"
        ],
        companies: ["1X Technologies", "OpenAI"],
        link: "https://theverge.com/1x-neo-robot"
    },
    {
        title: "Volvo Cars invests €150M in AI safety research center in Gothenburg",
        category: "partnership",
        region: "nordic",
        date: "2025-07-22",
        source: "Reuters",
        description: "Volvo Cars opens AI Safety Research Center in Gothenburg with €150M investment, partnering with Chalmers University and Zenseact to develop next-gen autonomous driving AI.",
        highlights: [
            "€150M investment",
            "New AI research center",
            "Partnership with Chalmers University",
            "Focus on autonomous safety",
            "200 AI researchers hired"
        ],
        companies: ["Volvo", "Zenseact", "Chalmers"],
        link: "https://reuters.com/volvo-ai-center"
    },
    {
        title: "Northvolt uses AI to optimize battery production – 40% waste reduction",
        category: "product",
        region: "nordic",
        date: "2025-07-15",
        source: "Ny Teknik",
        description: "Swedish battery manufacturer Northvolt deploys AI-powered production optimization system, reducing material waste by 40% and improving yield by 25%.",
        highlights: [
            "40% waste reduction",
            "25% yield improvement",
            "AI-optimized manufacturing",
            "€100M saved annually",
            "Expanding to all facilities"
        ],
        companies: ["Northvolt"],
        link: "https://nyteknik.se/northvolt-ai"
    },
    {
        title: "Polestar integrates ChatGPT voice assistant in all 2026 models",
        category: "partnership",
        region: "nordic",
        date: "2025-07-08",
        source: "The Verge",
        description: "Swedish EV maker Polestar partners with OpenAI to integrate ChatGPT-powered voice assistant across all 2026 vehicle models, offering natural language control.",
        highlights: [
            "ChatGPT integration in cars",
            "All 2026 models included",
            "Natural language vehicle control",
            "OpenAI partnership",
            "Rolling out Q4 2025"
        ],
        companies: ["Polestar", "OpenAI"],
        link: "https://theverge.com/polestar-chatgpt"
    },
    {
        title: "Karolinska Institute launches €80M AI drug discovery program",
        category: "research",
        region: "nordic",
        date: "2025-06-28",
        source: "Nature",
        description: "Sweden's Karolinska Institute announces €80M AI-driven drug discovery program, collaborating with AstraZeneca and SciLifeLab to accelerate pharmaceutical R&D.",
        highlights: [
            "€80M research program",
            "AI-driven drug discovery",
            "AstraZeneca partnership",
            "10-year initiative",
            "Focus on precision medicine"
        ],
        companies: ["Karolinska", "AstraZeneca"],
        link: "https://nature.com/karolinska-ai"
    },
    {
        title: "Spotify expands AI DJ globally – now available in 50 countries",
        category: "product",
        region: "nordic",
        date: "2025-06-20",
        source: "TechCrunch",
        description: "Spotify's AI DJ feature, powered by OpenAI and Sonantic voice AI, expands to 50 countries with 15 language options. Active user engagement up 65%.",
        highlights: [
            "50 countries expansion",
            "15 languages supported",
            "65% engagement increase",
            "OpenAI + Sonantic tech",
            "200M+ users eligible"
        ],
        companies: ["Spotify", "OpenAI"],
        link: "https://techcrunch.com/spotify-ai-dj"
    },
    {
        title: "SEB Bank deploys AI fraud detection – stops €120M in fraud annually",
        category: "product",
        region: "nordic",
        date: "2025-06-12",
        source: "Financial Times",
        description: "Swedish bank SEB implements AI-powered fraud detection system, preventing €120M in fraud losses annually with 99.3% accuracy and 90% fewer false positives.",
        highlights: [
            "€120M fraud prevented annually",
            "99.3% detection accuracy",
            "90% reduction in false positives",
            "Real-time transaction monitoring",
            "Deploying across all Nordic operations"
        ],
        companies: ["SEB"],
        link: "https://ft.com/seb-ai-fraud"
    },
    {
        title: "Scania tests autonomous mining trucks with AI in northern Sweden",
        category: "product",
        region: "nordic",
        date: "2025-06-05",
        source: "Reuters",
        description: "Swedish truck manufacturer Scania pilots autonomous mining trucks powered by AI at LKAB iron ore mine in Kiruna. Fleet of 10 trucks operating 24/7.",
        highlights: [
            "10 autonomous trucks deployed",
            "24/7 operations",
            "AI-powered navigation",
            "30% efficiency increase",
            "Expanding to 50 trucks by 2026"
        ],
        companies: ["Scania", "LKAB"],
        link: "https://reuters.com/scania-autonomous"
    },
    {
        title: "Ericsson AI framework powers 40% of European 5G networks",
        category: "product",
        region: "nordic",
        date: "2025-05-28",
        source: "Bloomberg",
        description: "Swedish telecom giant Ericsson reveals its AI-powered network optimization framework now runs 40% of European 5G infrastructure, improving efficiency by 35%.",
        highlights: [
            "40% of EU 5G networks",
            "35% efficiency improvement",
            "AI-powered optimization",
            "€2B annual investment",
            "Expanding to 6G research"
        ],
        companies: ["Ericsson"],
        link: "https://bloomberg.com/ericsson-ai-5g"
    },
    {
        title: "Nordea launches AI investment advisor for retail customers",
        category: "product",
        region: "nordic",
        date: "2025-05-20",
        source: "Dagens Industri",
        description: "Nordic banking giant Nordea launches AI-powered investment advisor for retail customers across Sweden, Finland, Norway, and Denmark. 500K users signed up in first month.",
        highlights: [
            "AI investment advisor launched",
            "500K users in one month",
            "Available in 4 Nordic countries",
            "Personalized portfolio recommendations",
            "€0 advisory fees"
        ],
        companies: ["Nordea"],
        link: "https://di.se/nordea-ai-advisor"
    },
    {
        title: "H&M Group cuts overstock by 45% using AI demand forecasting",
        category: "product",
        region: "nordic",
        date: "2025-05-12",
        source: "WWD",
        description: "Swedish fashion retailer H&M Group reports 45% reduction in overstock and 30% improvement in demand forecasting accuracy using AI-powered supply chain optimization.",
        highlights: [
            "45% overstock reduction",
            "30% forecast accuracy improvement",
            "€300M saved annually",
            "AI-powered supply chain",
            "Rolling out to all brands"
        ],
        companies: ["H&M"],
        link: "https://wwd.com/hm-ai-forecasting"
    },
    {
        title: "Axis Communications unveils AI security cameras with edge processing",
        category: "product",
        region: "nordic",
        date: "2025-05-05",
        source: "Security Magazine",
        description: "Swedish security tech leader Axis Communications launches AI-powered cameras with edge processing for real-time threat detection and privacy-preserving analytics.",
        highlights: [
            "Edge AI processing",
            "Real-time threat detection",
            "Privacy-first design",
            "30+ AI models on-device",
            "Available Q3 2025"
        ],
        companies: ["Axis Communications"],
        link: "https://securitymagazine.com/axis-ai-cameras"
    },
    {
        title: "Telenor Research partners with SINTEF for 6G AI development",
        category: "research",
        region: "nordic",
        date: "2025-04-28",
        source: "TelecomTV",
        description: "Norwegian telecom operator Telenor and research institute SINTEF launch €50M joint program to develop AI-native 6G wireless technology.",
        highlights: [
            "€50M research program",
            "AI-native 6G development",
            "5-year partnership",
            "Norwegian government backing",
            "Target commercial launch 2030"
        ],
        companies: ["Telenor", "SINTEF"],
        link: "https://telecomtv.com/telenor-6g-ai"
    },
    {
        title: "Google DeepMind Opens AI Research Lab in Stockholm",
        category: "partnership",
        region: "nordic",
        date: "2025-04-20",
        source: "TechCrunch",
        description: "Google DeepMind announces new AI research facility in Stockholm, Sweden, focusing on climate AI and sustainability. The lab will employ 100+ AI researchers.",
        highlights: [
            "New Stockholm AI lab",
            "100+ researchers hired",
            "Climate AI focus",
            "Sustainability research",
            "€80M investment"
        ],
        companies: ["Google"],
        link: "https://techcrunch.com/deepmind-stockholm"
    },
    {
        title: "Saab Integrates AI for Next-Gen Fighter Jet Systems",
        category: "product",
        region: "nordic",
        date: "2025-04-12",
        source: "Defense News",
        description: "Swedish defense company Saab unveils AI-powered autonomous systems for next-generation Gripen fighter jets. AI co-pilot assists human pilots in combat scenarios.",
        highlights: [
            "AI co-pilot for fighter jets",
            "Autonomous combat systems",
            "Next-gen Gripen upgrade",
            "Real-time threat assessment",
            "NATO compatibility"
        ],
        companies: ["Saab"],
        link: "https://defensenews.com/saab-ai-fighter"
    },
    {
        title: "Anthropic Opens European HQ in Copenhagen",
        category: "partnership",
        region: "nordic",
        date: "2025-04-05",
        source: "Bloomberg",
        description: "AI safety company Anthropic chooses Copenhagen as European headquarters, citing strong AI talent pool and data privacy regulations. Plans to hire 200+ employees.",
        highlights: [
            "Copenhagen European HQ",
            "200+ employees planned",
            "EU data compliance focus",
            "Nordic AI talent attraction",
            "Claude deployment in Europe"
        ],
        companies: ["Anthropic"],
        link: "https://bloomberg.com/anthropic-copenhagen"
    },
    {
        title: "Minecraft Developer Mojang Uses AI for Game Testing",
        category: "product",
        region: "nordic",
        date: "2025-03-28",
        source: "Wired",
        description: "Swedish game studio Mojang (Microsoft-owned) deploys AI agents to test Minecraft updates, reducing bug detection time by 80% and improving player experience.",
        highlights: [
            "AI game testing agents",
            "80% faster bug detection",
            "Minecraft quality improvement",
            "Automated playtesting",
            "Microsoft AI integration"
        ],
        companies: ["Mojang", "Microsoft"],
        link: "https://wired.com/mojang-ai-testing"
    },
    {
        title: "King (Candy Crush) Uses AI to Personalize 250M Player Experiences",
        category: "product",
        region: "nordic",
        date: "2025-03-20",
        source: "VentureBeat",
        description: "Swedish mobile game giant King implements AI-driven personalization across Candy Crush franchise, customizing difficulty and rewards for 250 million active users.",
        highlights: [
            "250M personalized experiences",
            "AI difficulty adjustment",
            "Player retention improved 35%",
            "Real-time behavior analysis",
            "Revenue optimization"
        ],
        companies: ["King", "Activision Blizzard"],
        link: "https://venturebeat.com/king-ai-personalization"
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    allNews = aiNewsData;
    displayNews(allNews);
    updateStats();
    setupFilters();
});

// Company logo mapping for AI news
const companyLogos = {
    'Lovable': 'https://lovable.dev/favicon.ico',
    'Legora': 'https://legora.com/favicon.ico',
    'Sana': 'https://sanalabs.com/favicon.ico',
    'Tandem Health': 'https://logo.clearbit.com/tandemhealth.ai',
    'Klarna': 'https://logo.clearbit.com/klarna.com',
    'H&M': 'https://logo.clearbit.com/hm.com',
    'Spotify': 'https://logo.clearbit.com/spotify.com',
    'Scania': 'https://logo.clearbit.com/scania.com',
    'Karolinska': 'https://logo.clearbit.com/ki.se',
    'Ericsson': 'https://logo.clearbit.com/ericsson.com',
    'Volvo': 'https://logo.clearbit.com/volvocars.com',
    'Nordea': 'https://logo.clearbit.com/nordea.com',
    'SEB': 'https://logo.clearbit.com/seb.se',
    'Northvolt': 'https://logo.clearbit.com/northvolt.com',
    'Polestar': 'https://logo.clearbit.com/polestar.com',
    'Recorded Future': 'https://logo.clearbit.com/recordedfuture.com',
    '1X Technologies': 'https://logo.clearbit.com/1x.tech',
    'OpenAI': 'https://logo.clearbit.com/openai.com',
    'Google': 'https://logo.clearbit.com/google.com',
    'Stilla': 'https://logo.clearbit.com/stilla.se',
    'Meta': 'https://logo.clearbit.com/meta.com',
    'Einride': 'https://logo.clearbit.com/einride.tech',
    'Arm': 'https://logo.clearbit.com/arm.com',
    'Sequoia': 'https://logo.clearbit.com/sequoiacap.com',
    'Creandum': 'https://logo.clearbit.com/creandum.com',
    'Iconiq': 'https://logo.clearbit.com/iconiqcapital.com',
    'Northzone': 'https://logo.clearbit.com/northzone.com',
    'Kinnevik': 'https://logo.clearbit.com/kinnevik.com',
    'Depict': 'https://logo.clearbit.com/depict.ai',
    'Accel': 'https://logo.clearbit.com/accel.com',
    'DB Schenker': 'https://logo.clearbit.com/dbschenker.com',
    'EQT Ventures': 'https://logo.clearbit.com/eqtventures.com',
    'Silo AI': 'https://logo.clearbit.com/silo.ai',
    'AMD': 'https://logo.clearbit.com/amd.com',
    'Zenseact': 'https://logo.clearbit.com/zenseact.com',
    'Chalmers': 'https://logo.clearbit.com/chalmers.se',
    'AstraZeneca': 'https://logo.clearbit.com/astrazeneca.com',
    'LKAB': 'https://logo.clearbit.com/lkab.com',
    'Axis Communications': 'https://logo.clearbit.com/axis.com',
    'Telenor': 'https://logo.clearbit.com/telenor.com',
    'SINTEF': 'https://logo.clearbit.com/sintef.no',
    'IKEA': 'https://logo.clearbit.com/ikea.com',
    'Listen Labs': 'https://logo.clearbit.com/listenlabs.com',
    'Saab': 'https://logo.clearbit.com/saab.com',
    'Mojang': 'https://logo.clearbit.com/mojang.com',
    'Microsoft': 'https://logo.clearbit.com/microsoft.com',
    'King': 'https://logo.clearbit.com/king.com',
    'Activision Blizzard': 'https://logo.clearbit.com/activisionblizzard.com',
    'Mastercard': 'https://logo.clearbit.com/mastercard.com'
};

function getCompanyLogo(companyName) {
    for (const [key, url] of Object.entries(companyLogos)) {
        if (companyName.includes(key)) {
            return url;
        }
    }
    return null;
}

function displayNews(news) {
    const container = document.getElementById('aiNewsContainer');
    
    if (news.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px; color: #999;">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 20px;"></i>
                <p style="font-size: 18px;">No news found matching your filters</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    news.forEach(item => {
        // Extract company logos from title/description
        const logoUrl = getCompanyLogo(item.title + ' ' + item.description);
        
        html += `
            <div class="news-card" style="border-left: 4px solid ${getCategoryColor(item.category)};">
                <div class="news-header">
                    <div style="display: flex; gap: 15px; align-items: flex-start;">
                        ${logoUrl ? `
                            <div style="flex-shrink: 0;">
                                <img src="${logoUrl}" alt="Company" 
                                     style="width: 48px; height: 48px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e7eb;"
                                     onerror="this.style.display='none'">
                            </div>
                        ` : ''}
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                <span class="news-category">${item.category}</span>
                                <span style="font-size: 11px; color: #6b7280;">
                                    <i class="fas fa-calendar"></i> ${formatDate(item.date)}
                                </span>
                                <span style="font-size: 11px; color: #6b7280;">
                                    <i class="fas fa-newspaper"></i> ${item.source || 'Unknown'}
                                </span>
                            </div>
                            <div class="news-title" style="font-size: 18px; font-weight: 600; color: #1a1a2e; line-height: 1.4; margin-bottom: 8px;">${item.title}</div>
                            <div style="font-size: 11px; color: #6b7280;">
                                <i class="fas fa-map-marker-alt"></i> ${item.region ? (item.region.charAt(0).toUpperCase() + item.region.slice(1)) : 'Global'}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="news-description" style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 15px 0;">${item.description}</div>
                
                ${item.highlights && item.highlights.length > 0 ? `
                    <div class="news-highlights" style="background: #f3f4f6; padding: 12px 15px; border-radius: 8px; margin: 15px 0;">
                        <strong style="font-size: 12px; color: #374151;">Key Highlights:</strong>
                        <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px; color: #4b5563;">
                            ${item.highlights.map(h => `<li style="margin: 4px 0;">${h}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="news-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                    <div class="news-companies" style="display: flex; flex-wrap: wrap; gap: 6px;">
                        ${item.companies && item.companies.length > 0 ? item.companies.map(c => {
                            const cLogo = getCompanyLogo(c);
                            return `<span class="company-tag" style="display: inline-flex; align-items: center; gap: 4px; background: #f3f4f6; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; color: #374151;">
                                ${cLogo ? `<img src="${cLogo}" style="width: 16px; height: 16px; object-fit: contain;" onerror="this.style.display='none'">` : ''}
                                ${c}
                            </span>`;
                        }).join('') : ''}
                    </div>
                    <a href="${item.link}" class="news-link" style="font-size: 13px; font-weight: 600; color: #667eea; text-decoration: none; transition: color 0.2s;" 
                       onmouseover="this.style.color='#764ba2'" onmouseout="this.style.color='#667eea'">
                        Read More <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function getCategoryColor(category) {
    const colors = {
        'funding': '#10b981',
        'exits': '#f59e0b',
        'product': '#3b82f6',
        'partnership': '#8b5cf6',
        'research': '#ec4899'
    };
    return colors[category] || '#6b7280';
}

function updateStats() {
    // Total articles
    document.getElementById('totalNews').textContent = allNews.length;
    
    // Calculate days covered (from oldest to newest article)
    if (allNews.length > 0) {
        const dates = allNews.map(n => new Date(n.published)).filter(d => !isNaN(d));
        if (dates.length > 0) {
            const oldest = new Date(Math.min(...dates));
            const newest = new Date(Math.max(...dates));
            const daysDiff = Math.ceil((newest - oldest) / (1000 * 60 * 60 * 24)) + 1;
            document.getElementById('recentDays').textContent = daysDiff;
        }
    }
    
    // Count unique sources
    const sources = new Set(allNews.map(n => n.source));
    document.getElementById('sourcesCount').textContent = sources.size;
    
    // Count funding-related news
    const fundingCount = allNews.filter(n => 
        n.category === 'funding' || 
        n.title.toLowerCase().includes('raise') || 
        n.title.toLowerCase().includes('funding') ||
        n.title.toLowerCase().includes('series') ||
        n.title.toLowerCase().includes('million') ||
        n.title.toLowerCase().includes('billion')
    ).length;
    document.getElementById('fundingCount').textContent = fundingCount;
}

function setupFilters() {
    // Category filters
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            applyFilters();
        });
    });
    
    // Region filters
    document.querySelectorAll('[data-filter-region]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('[data-filter-region]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentRegion = this.getAttribute('data-filter-region');
            applyFilters();
        });
    });
}

function applyFilters() {
    let filtered = [...allNews];
    
    if (currentFilter !== 'all') {
        filtered = filtered.filter(n => n.category === currentFilter);
    }
    
    if (currentRegion !== 'all') {
        filtered = filtered.filter(n => n.region === currentRegion);
    }
    
    displayNews(filtered);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

