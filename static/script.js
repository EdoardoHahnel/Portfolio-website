/*
===================================
M&A News Hub - JavaScript
===================================

BEGINNER EXPLANATION:
JavaScript makes your website INTERACTIVE.
- Responds to button clicks
- Updates content without reloading the page
- Communicates with the backend server
- Manipulates the HTML to show/hide elements
*/

// Firm mapping for news articles (PE firms + VCs)
const firmMapping = {
    // Nordic PE Firms
    'nordic capital': 'Nordic Capital',
    'eqt': 'EQT',
    'triton': 'Triton Partners',
    'altor': 'Altor',
    'summa': 'Summa Equity',
    'litorina': 'Litorina',
    'ratos': 'Ratos',
    'adelis': 'Adelis Equity',
    'verdan': 'Verdane',
    'ik partners': 'IK Partners',
    'bure': 'Bure Equity',
    'accent': 'Accent Equity',
    
    // VCs and AI Investors
    'sequoia': 'Sequoia Capital',
    'benchmark': 'Benchmark',
    'general catalyst': 'General Catalyst',
    'iconiq': 'Iconiq Capital',
    'northzone': 'Northzone',
    'kinnevik': 'Kinnevik',
    'balderton': 'Balderton Capital',
    'index ventures': 'Index Ventures',
    'accel': 'Accel',
    'andreessen horowitz': 'Andreessen Horowitz',
    'kleiner perkins': 'Kleiner Perkins',
    'bessemer': 'Bessemer Venture Partners',
    'insight partners': 'Insight Partners',
    'tiger global': 'Tiger Global',
    'softbank': 'SoftBank',
    
    // Well-known AI Startups (for logo display)
    'lovable': 'Lovable',
    'legora': 'Legora',
    'tandem health': 'Tandem Health',
    'listen labs': 'Listen Labs',
    'filed': 'Filed',
    'sana ai': 'Sana AI'
};

// Firm logo URLs with multiple fallbacks
const firmLogos = {
    // Nordic PE Firms
    'Nordic Capital': {
        primary: 'https://logo.clearbit.com/nordiccapital.com',
        fallback: 'https://ui-avatars.com/api/?name=Nordic+Capital&background=4c1d95&color=ffffff&size=64',
        icon: '🏢'
    },
    'EQT': {
        primary: 'https://logo.clearbit.com/eqtgroup.com',
        fallback: 'https://ui-avatars.com/api/?name=EQT&background=7c3aed&color=ffffff&size=64',
        icon: '🏢'
    },
    'Triton Partners': {
        primary: 'https://logo.clearbit.com/triton-partners.com',
        fallback: 'https://ui-avatars.com/api/?name=Triton&background=059669&color=ffffff&size=64',
        icon: '🏢'
    },
    'Altor': {
        primary: 'https://logo.clearbit.com/altor.com',
        fallback: 'https://ui-avatars.com/api/?name=Altor&background=dc2626&color=ffffff&size=64',
        icon: '🏢'
    },
    'Summa Equity': {
        primary: 'https://logo.clearbit.com/summaequity.com',
        fallback: 'https://ui-avatars.com/api/?name=Summa&background=0891b2&color=ffffff&size=64',
        icon: '🏢'
    },
    'Litorina': {
        primary: 'https://logo.clearbit.com/litorina.com',
        fallback: 'https://ui-avatars.com/api/?name=Litorina&background=7c2d12&color=ffffff&size=64',
        icon: '🏢'
    },
    'Ratos': {
        primary: 'https://logo.clearbit.com/ratos.se',
        fallback: 'https://ui-avatars.com/api/?name=Ratos&background=1f2937&color=ffffff&size=64',
        icon: '🏢'
    },
    'Adelis Equity': {
        primary: 'https://logo.clearbit.com/adelisequity.com',
        fallback: 'https://ui-avatars.com/api/?name=Adelis&background=be185d&color=ffffff&size=64',
        icon: '🏢'
    },
    'Verdane': {
        primary: 'https://logo.clearbit.com/verdanecapital.com',
        fallback: 'https://ui-avatars.com/api/?name=Verdane&background=059669&color=ffffff&size=64',
        icon: '🏢'
    },
    'IK Partners': {
        primary: 'https://logo.clearbit.com/ikpartners.com',
        fallback: 'https://ui-avatars.com/api/?name=IK+Partners&background=7c3aed&color=ffffff&size=64',
        icon: '🏢'
    },
    'Ratos AB': {
        primary: 'https://logo.clearbit.com/ratos.se',
        fallback: 'https://ui-avatars.com/api/?name=Ratos+AB&background=1f2937&color=ffffff&size=64',
        icon: '🏢'
    },
    'Adelis Equity Partners': {
        primary: 'https://logo.clearbit.com/adelisequity.com',
        fallback: 'https://ui-avatars.com/api/?name=Adelis+Equity+Partners&background=be185d&color=ffffff&size=64',
        icon: '🏢'
    },
    'Axcel': {
        primary: 'https://logo.clearbit.com/axcel.dk',
        fallback: 'https://ui-avatars.com/api/?name=Axcel&background=dc2626&color=ffffff&size=64',
        icon: '🏢'
    },
    'CapMan': {
        primary: 'https://logo.clearbit.com/capman.com',
        fallback: 'https://ui-avatars.com/api/?name=CapMan&background=059669&color=ffffff&size=64',
        icon: '🏢'
    },
    'FSN Capital': {
        primary: 'https://logo.clearbit.com/fsncapital.com',
        fallback: 'https://ui-avatars.com/api/?name=FSN+Capital&background=0891b2&color=ffffff&size=64',
        icon: '🏢'
    },
    'Valedo Partners': {
        primary: 'https://logo.clearbit.com/valedopartners.com',
        fallback: 'https://ui-avatars.com/api/?name=Valedo+Partners&background=7c2d12&color=ffffff&size=64',
        icon: '🏢'
    },
    'Segulah': {
        primary: 'https://logo.clearbit.com/segulah.com',
        fallback: 'https://ui-avatars.com/api/?name=Segulah&background=1f2937&color=ffffff&size=64',
        icon: '🏢'
    },
    'Procuritas': {
        primary: 'https://logo.clearbit.com/procuritas.com',
        fallback: 'https://ui-avatars.com/api/?name=Procuritas&background=be185d&color=ffffff&size=64',
        icon: '🏢'
    },
    'Bure Equity': {
        primary: 'https://logo.clearbit.com/bure.se',
        fallback: 'https://ui-avatars.com/api/?name=Bure&background=1f2937&color=ffffff&size=64',
        icon: '🏢'
    },
    'Accent Equity': {
        primary: 'https://logo.clearbit.com/accentequity.com',
        fallback: 'https://ui-avatars.com/api/?name=Accent&background=dc2626&color=ffffff&size=64',
        icon: '🏢'
    },
    
    // VCs and AI Investors
    'Sequoia Capital': {
        primary: 'https://logo.clearbit.com/sequoiacap.com',
        fallback: 'https://ui-avatars.com/api/?name=Sequoia&background=1f2937&color=ffffff&size=64',
        icon: '🚀'
    },
    'Benchmark': {
        primary: 'https://logo.clearbit.com/benchmark.com',
        fallback: 'https://ui-avatars.com/api/?name=Benchmark&background=7c3aed&color=ffffff&size=64',
        icon: '🚀'
    },
    'General Catalyst': {
        primary: 'https://logo.clearbit.com/generalcatalyst.com',
        fallback: 'https://ui-avatars.com/api/?name=General+Catalyst&background=059669&color=ffffff&size=64',
        icon: '🚀'
    },
    'Iconiq Capital': {
        primary: 'https://logo.clearbit.com/iconiqcapital.com',
        fallback: 'https://ui-avatars.com/api/?name=Iconiq&background=be185d&color=ffffff&size=64',
        icon: '🚀'
    },
    'Northzone': {
        primary: 'https://logo.clearbit.com/northzone.com',
        fallback: 'https://ui-avatars.com/api/?name=Northzone&background=0891b2&color=ffffff&size=64',
        icon: '🚀'
    },
    'Kinnevik': {
        primary: 'https://logo.clearbit.com/kinnevik.com',
        fallback: 'https://ui-avatars.com/api/?name=Kinnevik&background=1f2937&color=ffffff&size=64',
        icon: '🚀'
    },
    'Balderton Capital': {
        primary: 'https://logo.clearbit.com/balderton.com',
        fallback: 'https://ui-avatars.com/api/?name=Balderton&background=7c3aed&color=ffffff&size=64',
        icon: '🚀'
    },
    'Index Ventures': {
        primary: 'https://logo.clearbit.com/indexventures.com',
        fallback: 'https://ui-avatars.com/api/?name=Index+Ventures&background=dc2626&color=ffffff&size=64',
        icon: '🚀'
    },
    'Accel': {
        primary: 'https://logo.clearbit.com/accel.com',
        fallback: 'https://ui-avatars.com/api/?name=Accel&background=059669&color=ffffff&size=64',
        icon: '🚀'
    },
    'Andreessen Horowitz': {
        primary: 'https://logo.clearbit.com/a16z.com',
        fallback: 'https://ui-avatars.com/api/?name=a16z&background=1f2937&color=ffffff&size=64',
        icon: '🚀'
    },
    'Kleiner Perkins': {
        primary: 'https://logo.clearbit.com/kleinerperkins.com',
        fallback: 'https://ui-avatars.com/api/?name=Kleiner+Perkins&background=7c3aed&color=ffffff&size=64',
        icon: '🚀'
    },
    'Bessemer Venture Partners': {
        primary: 'https://logo.clearbit.com/bvp.com',
        fallback: 'https://ui-avatars.com/api/?name=Bessemer&background=0891b2&color=ffffff&size=64',
        icon: '🚀'
    },
    'Insight Partners': {
        primary: 'https://logo.clearbit.com/insightpartners.com',
        fallback: 'https://ui-avatars.com/api/?name=Insight+Partners&background=be185d&color=ffffff&size=64',
        icon: '🚀'
    },
    'Tiger Global': {
        primary: 'https://logo.clearbit.com/tigerglobal.com',
        fallback: 'https://ui-avatars.com/api/?name=Tiger+Global&background=dc2626&color=ffffff&size=64',
        icon: '🚀'
    },
    'SoftBank': {
        primary: 'https://logo.clearbit.com/softbank.com',
        fallback: 'https://ui-avatars.com/api/?name=SoftBank&background=1f2937&color=ffffff&size=64',
        icon: '🚀'
    },
    
    // AI Startups
    'Lovable': {
        primary: 'https://logo.clearbit.com/lovable.dev',
        fallback: 'https://ui-avatars.com/api/?name=Lovable&background=7c3aed&color=ffffff&size=64',
        icon: '🤖'
    },
    'Legora': {
        primary: 'https://logo.clearbit.com/legora.com',
        fallback: 'https://ui-avatars.com/api/?name=Legora&background=059669&color=ffffff&size=64',
        icon: '🤖'
    },
    'Tandem Health': {
        primary: 'https://logo.clearbit.com/tandemhealth.com',
        fallback: 'https://ui-avatars.com/api/?name=Tandem+Health&background=dc2626&color=ffffff&size=64',
        icon: '🤖'
    },
    'Listen Labs': {
        primary: 'https://logo.clearbit.com/listenlabs.com',
        fallback: 'https://ui-avatars.com/api/?name=Listen+Labs&background=0891b2&color=ffffff&size=64',
        icon: '🤖'
    },
    'Filed': {
        primary: 'https://logo.clearbit.com/filed.com',
        fallback: 'https://ui-avatars.com/api/?name=Filed&background=be185d&color=ffffff&size=64',
        icon: '🤖'
    },
    'Sana AI': {
        primary: 'https://logo.clearbit.com/sana.ai',
        fallback: 'https://ui-avatars.com/api/?name=Sana+AI&background=1f2937&color=ffffff&size=64',
        icon: '🤖'
    }
};

function getFirmFromTitle(title) {
    if (!title) return null;
    
    const titleLower = title.toLowerCase();
    
    // Check for exact matches first (more specific)
    for (let key in firmMapping) {
        if (titleLower.includes(key)) {
            return firmMapping[key];
        }
    }
    
    // Check for partial matches and variations
    const variations = {
        'eqt ventures': 'EQT',
        'eqt partners': 'EQT',
        'nordic capital fund': 'Nordic Capital',
        'triton partners': 'Triton Partners',
        'altor fund': 'Altor',
        'summa equity fund': 'Summa Equity',
        'litorina fund': 'Litorina',
        'ratos group': 'Ratos',
        'adelis equity partners': 'Adelis Equity',
        'verdan capital': 'Verdane',
        'ik partners fund': 'IK Partners',
        'bure equity': 'Bure Equity',
        'accent equity fund': 'Accent Equity',
        'sequoia capital': 'Sequoia Capital',
        'benchmark capital': 'Benchmark',
        'general catalyst partners': 'General Catalyst',
        'iconiq capital': 'Iconiq Capital',
        'northzone ventures': 'Northzone',
        'kinnevik ab': 'Kinnevik',
        'balderton capital': 'Balderton Capital',
        'index ventures': 'Index Ventures',
        'accel partners': 'Accel',
        'andreessen horowitz': 'Andreessen Horowitz',
        'kleiner perkins': 'Kleiner Perkins',
        'bessemer venture partners': 'Bessemer Venture Partners',
        'insight partners': 'Insight Partners',
        'tiger global management': 'Tiger Global',
        'softbank group': 'SoftBank'
    };
    
    for (let key in variations) {
        if (titleLower.includes(key)) {
            return variations[key];
        }
    }
    
    return null;
}

function createRobustLogoHTML(firmName, size = '32px') {
    if (!firmName) return '';
    
    // Try exact match first
    if (firmLogos[firmName]) {
        const logoData = firmLogos[firmName];
        const escapedName = escapeHtml(firmName);
        
        return `
            <div class="news-firm-logo" style="position: relative; display: inline-block; margin-right: 8px;">
                <img src="${logoData.primary}" 
                     alt="${escapedName}" 
                     style="width: ${size}; height: ${size}; border-radius: 6px; object-fit: contain;"
                     onerror="this.onerror=null; this.src='${logoData.fallback}'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='flex';}">
                <div class="logo-fallback" style="display: none; width: ${size}; height: ${size}; background: #4c1d95; color: white; border-radius: 6px; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">
                    ${logoData.icon}
                </div>
            </div>
        `;
    }
    
    // Try partial matches for related companies
    const relatedFirms = {
        'Opti': 'FSN Capital',
        'Opti Group': 'FSN Capital',
        'Optigroup': 'FSN Capital',
        'HENT': 'Ratos AB',
        'LEDiL': 'Ratos AB',
        'Semcon': 'Ratos AB',
        'Aibel': 'Ratos AB',
        'HL Display': 'Ratos AB',
        'Adapteo': 'Ratos AB',
        'Delete': 'Ratos AB',
        'Plantasjen': 'Ratos AB',
        'Expin': 'Ratos AB',
        'NOBA': 'Nordic Capital',
        'Minerva': 'Nordic Capital',
        'Sensio': 'Nordic Capital',
        'Max Matthiessen': 'Nordic Capital',
        'R-GOL': 'Nordic Capital',
        'Unisport': 'Nordic Capital',
        'BRP Systems': 'Nordic Capital',
        'One Inc': 'Nordic Capital',
        'ActiveViam': 'Nordic Capital',
        'Sesol': 'Nordic Capital',
        'Circura': 'Adelis Equity Partners',
        'Nordic BioSite': 'Adelis Equity Partners',
        'SSI Diagnostica': 'Adelis Equity Partners',
        'Kanari': 'Adelis Equity Partners',
        'Nordomatic': 'Adelis Equity Partners',
        'Axentia': 'Adelis Equity Partners',
        'Infobric': 'Summa Equity',
        'Lakers': 'Summa Equity',
        'Pumppulohja': 'Summa Equity',
        'Zengun': 'Segulah',
        'Zengun Group': 'Segulah',
        'Rebellion': 'Triton Partners',
        'Eltel': 'Triton Partners',
        'HiQ': 'Triton Partners',
        'Mecenat': 'IK Partners',
        'Nordic Tyre': 'Axcel',
        'Nordstjernan': 'Axcel',
        'Aidian': 'Axcel',
        'XPartners': 'Axcel',
        'Mirovia': 'Axcel',
        'JM': 'CapMan',
        'Rexel': 'CapMan',
        'Scandic': 'CapMan',
        'Nobia': 'CapMan',
        'Nordlo': 'CapMan',
        'Apax': 'CapMan',
        'team.blue': 'CapMan',
        'Loopia': 'CapMan',
        'NAXS': 'CapMan',
        'Celero': 'CapMan',
        // More CapMan portfolio companies
        'CapMan Real Estate': 'CapMan',
        'CapMan Infra': 'CapMan',
        'CapMan Hotels': 'CapMan',
        'CMH II': 'CapMan',
        'Panattoni': 'CapMan',
        'Mölnlycke': 'CapMan',
        'Karlskrona': 'CapMan',
        'Järfalla': 'CapMan',
        'Stockholm': 'CapMan',
        'bostadsprojekt': 'CapMan',
        'bostadsutvecklingsprojekt': 'CapMan',
        'logistikpark': 'CapMan',
        'logistikfas': 'CapMan',
        'hyresgäst': 'CapMan',
        'takbar': 'CapMan',
        'skärgårdsutsikt': 'CapMan',
        'nyrenoverade': 'CapMan',
        'asset management': 'CapMan',
        'nyckelrekrytering': 'CapMan',
        'datacenterplattform': 'CapMan',
        'högkvalitativa': 'CapMan',
        'förvärv': 'CapMan',
        'hotellaktör': 'CapMan',
        'privat nordisk': 'CapMan',
        'ledande': 'CapMan',
        'slut': 'CapMan',
        'årsstämma': 'CapMan',
        'kallelse': 'CapMan',
        'planerar': 'CapMan',
        'flertalet': 'CapMan',
        'aktiva dialoger': 'CapMan',
        'valberedningen': 'CapMan',
        'föreslår': 'CapMan',
        'val': 'CapMan',
        'nya styrelseledamöter': 'CapMan',
        'omval': 'CapMan',
        'styrelseordförande': 'CapMan',
        'rekommenderat': 'CapMan',
        'kontanterbjudande': 'CapMan',
        'erbjudande': 'CapMan',
        'direkt': 'CapMan',
        'indirekt': 'CapMan',
        'Australien': 'CapMan',
        'Belarus': 'CapMan',
        'Hongkong': 'CapMan',
        'Japan': 'CapMan',
        'strategiskt': 'CapMan',
        'kliv': 'CapMan',
        'väljer': 'CapMan',
        'Cinode': 'CapMan',
        'effektiv': 'CapMan',
        'resursplanering': 'CapMan',
        'bättre': 'CapMan',
        // More Nordic Capital companies
        'Minerva Imaging': 'Nordic Capital',
        'strategisk partner': 'Nordic Capital',
        'stödja': 'Nordic Capital',
        'tillväxt': 'Nordic Capital',
        'Evolution II': 'Nordic Capital',
        'medelstora företag': 'Nordic Capital',
        'miljarder': 'Nordic Capital',
        'Ontario Teachers': 'Nordic Capital',
        'saminvesterar': 'Nordic Capital',
        // More EQT companies
        'EQT AB': 'EQT',
        'Redogörelse': 'EQT',
        'tredje kvartalet': 'EQT',
        'Jean Eric Salata': 'EQT',
        'nominerad': 'EQT',
        'efterträda': 'EQT',
        'grundaren': 'EQT',
        'Conni Jonsson': 'EQT',
        'styrelseordförande': 'EQT',
        'Inbjudan': 'EQT',
        'presentation': 'EQT',
        'valberedning': 'EQT',
        'årsstämman': 'EQT',
        'återköp': 'EQT',
        'aktier': 'EQT',
        'vecka': 'EQT',
        'nuvarande': 'EQT',
        'återköpsprogrammet': 'EQT',
        'avslutats': 'EQT',
        // More Ratos companies
        'Ratos Company': 'Ratos AB',
        'Ratos group': 'Ratos AB',
        'Ratos AB': 'Ratos AB',
        'NOK': 'Ratos AB',
        'miljarder': 'Ratos AB',
        'infrastruktur': 'Ratos AB',
        'kontrakt': 'Ratos AB',
        'passagerarterminal': 'Ratos AB',
        'Bodø': 'Ratos AB',
        'flygplats': 'Ratos AB',
        'Norge': 'Ratos AB',
        'projekt': 'Ratos AB',
        'större': 'Ratos AB',
        'utveckling': 'Ratos AB',
        // More Triton companies
        'Magnus Lindquist': 'Triton Partners',
        'ny styrelseordförande': 'Triton Partners',
        'efterträder': 'Triton Partners',
        'Erik Rune': 'Triton Partners',
        'valts': 'Triton Partners',
        'styrelseledamot': 'Triton Partners',
        'sedan': 'Triton Partners',
        'ma': 'Triton Partners',
        'Eltels': 'Triton Partners',
        'valberedning': 'Triton Partners',
        'inför': 'Triton Partners',
        'årsstämma': 'Triton Partners',
        'Riitta Palomäki': 'Triton Partners',
        'föreslår': 'Triton Partners',
        'ny styrelseledamot': 'Triton Partners',
        'Eltel AB': 'Triton Partners',
        'valberedningen': 'Triton Partners',
        'föreslår val': 'Triton Partners',
        'nya styrelseledamöter': 'Triton Partners',
        'omval': 'Triton Partners',
        'styrelseordförande': 'Triton Partners',
        'styrelseledamöter': 'Triton Partners',
        'Nordahl BidCo': 'Triton Partners',
        'AB': 'Triton Partners',
        'offentliggör': 'Triton Partners',
        'genom': 'Triton Partners',
        'rekommenderat': 'Triton Partners',
        'kontanterbjudande': 'Triton Partners',
        'pressmeddelande': 'Triton Partners',
        'utgör': 'Triton Partners',
        'inte': 'Triton Partners',
        'ett erbjudande': 'Triton Partners',
        'vare sig': 'Triton Partners',
        'direkt': 'Triton Partners',
        'indirekt': 'Triton Partners',
        'Australien': 'Triton Partners',
        'Belarus': 'Triton Partners',
        'Hongkong': 'Triton Partners',
        'Japan': 'Triton Partners',
        'HiQ': 'Triton Partners',
        'tar': 'Triton Partners',
        'strategiskt': 'Triton Partners',
        'kliv': 'Triton Partners',
        'väljer': 'Triton Partners',
        'Cinode': 'Triton Partners',
        'för': 'Triton Partners',
        'effektiv': 'Triton Partners',
        'resursplanering': 'Triton Partners',
        'bättre': 'Triton Partners',
        'kundupplevelse': 'Triton Partners'
    };
    
    // Check if this is a portfolio company - try both exact match and partial match
    let relatedFirm = relatedFirms[firmName];
    
    // If no exact match, try partial matching
    if (!relatedFirm) {
        for (const [keyword, peFirm] of Object.entries(relatedFirms)) {
            if (firmName.toLowerCase().includes(keyword.toLowerCase()) || 
                keyword.toLowerCase().includes(firmName.toLowerCase())) {
                relatedFirm = peFirm;
                break;
            }
        }
    }
    
    if (relatedFirm && firmLogos[relatedFirm]) {
        const logoData = firmLogos[relatedFirm];
        const escapedName = escapeHtml(firmName);
        const escapedRelated = escapeHtml(relatedFirm);
        
        return `
            <div class="news-firm-logo" style="position: relative; display: inline-block; margin-right: 8px;" title="Related to ${escapedRelated}">
                <img src="${logoData.primary}" 
                     alt="${escapedName} (${escapedRelated})" 
                     style="width: ${size}; height: ${size}; border-radius: 6px; object-fit: contain; border: 2px solid #fbbf24;"
                     onerror="this.onerror=null; this.src='${logoData.fallback}'; this.onerror=function(){this.style.display='none'; this.nextElementSibling.style.display='flex';}">
                <div class="logo-fallback" style="display: none; width: ${size}; height: ${size}; background: #fbbf24; color: #1f2937; border-radius: 6px; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid #f59e0b;">
                    ${logoData.icon}
                </div>
                <div style="position: absolute; bottom: -2px; right: -2px; background: #fbbf24; color: #1f2937; border-radius: 50%; width: 12px; height: 12px; font-size: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold;">R</div>
            </div>
        `;
    }
    
    // Fallback: create a generic logo
    const encodedName = encodeURIComponent(firmName);
    const escapedName = escapeHtml(firmName);
    
    return `
        <div class="news-firm-logo" style="position: relative; display: inline-block; margin-right: 8px;">
            <img src="https://ui-avatars.com/api/?name=${encodedName}&background=6b7280&color=ffffff&size=${parseInt(size)}" 
                 alt="${escapedName}" 
                 style="width: ${size}; height: ${size}; border-radius: 6px; object-fit: contain;"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="logo-fallback" style="display: none; width: ${size}; height: ${size}; background: #6b7280; color: white; border-radius: 6px; align-items: center; justify-content: center; font-size: 14px; font-weight: bold;">
                🏢
            </div>
        </div>
    `;
}

// ===== WAIT FOR PAGE TO LOAD =====
// This ensures all HTML is loaded before we run our code
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 M&A News Hub initialized!');
    
    // Initialize the application
    init();
});

// ===== INITIALIZE APPLICATION =====
function init() {
    // Get references to HTML elements
    const refreshBtn = document.getElementById('refreshBtn');
    const searchInput = document.getElementById('searchInput');
    
    // Add event listeners (respond to user actions)
    refreshBtn.addEventListener('click', scrapeNews);
    searchInput.addEventListener('input', handleSearch);
    
    // Load existing news when page loads
    loadNews();
    
    // Auto-load news on first visit if empty
    setTimeout(() => {
        const newsContainer = document.getElementById('newsContainer');
        if (newsContainer && newsContainer.children.length === 0) {
            console.log('Auto-loading news...');
            scrapeNews();
        }
    }, 500);
}

// ===== SCRAPE NEWS FUNCTION =====
// This tells the backend to fetch new articles
async function scrapeNews() {
    const refreshBtn = document.getElementById('refreshBtn');
    const originalText = refreshBtn.innerHTML;
    
    // Disable button and show loading state
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    
    showLoading(true);
    hideStatusMessage();
    
    try {
        // Make a POST request to the backend
        // fetch() is how JavaScript talks to the server
        const response = await fetch('/api/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // Convert the response to JSON format
        const data = await response.json();
        
        if (data.success) {
            showStatusMessage(`✅ Loaded ${data.new_count} articles!`, 'success');
            // Reload the news to display the new articles
            await loadNews();
        } else {
            showStatusMessage(`❌ Error: ${data.message}`, 'error');
        }
        
    } catch (error) {
        console.error('Error loading news:', error);
        showStatusMessage('❌ Failed to load news. Please try again.', 'error');
    } finally {
        // Re-enable the button
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = originalText;
        showLoading(false);
    }
}

// ===== LOAD NEWS FUNCTION =====
// Fetches and displays PE/investment news articles (filters out AI news)
async function loadNews() {
    showLoading(true);
    hideStatusMessage();
    
    try {
        console.log('🔍 Loading investment news with cache-busting...');
        // Force fresh data with multiple cache-busting parameters
        const timestamp = Date.now();
        const response = await fetch('/api/investment-news?_=' + timestamp + '&t=' + Math.random(), {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        const data = await response.json();
        
        console.log('📊 Investment news response:', data);
        console.log('📈 News count:', data.count);
        console.log('📰 First few titles:', data.news?.slice(0, 3).map(n => n.title));
        
        if (data.success && data.news) {
            // Use ALL news (no filtering, no limiting)
            const filteredNews = data.news;
            
            console.log('✅ Displaying', filteredNews.length, 'news items');
            
            // Sort by date (most recent first)
            filteredNews.sort((a, b) => {
                const dateA = new Date(a.date || '2000-01-01');
                const dateB = new Date(b.date || '2000-01-01');
                return dateB - dateA; // Most recent first
            });
            
            // Update the total count
            document.getElementById('totalCount').textContent = filteredNews.length;
            
            // Force display all items - no filtering
            displayNews(filteredNews);
            
            // Show success message
            showStatusMessage(`✅ Loaded ${filteredNews.length} investment news articles!`, 'success');
        } else {
            console.error('❌ API response indicates failure:', data);
            showStatusMessage('❌ Failed to load news', 'error');
        }
        
    } catch (error) {
        console.error('❌ Error loading news:', error);
        showStatusMessage('❌ Failed to load news. Please check if the server is running.', 'error');
    } finally {
        showLoading(false);
    }
}

// ===== DISPLAY NEWS FUNCTION =====
// Creates HTML cards for each news article
function displayNews(newsArray) {
    const newsContainer = document.getElementById('newsContainer');
    const emptyState = document.getElementById('emptyState');
    
    // If no news, show empty state
    if (!newsArray || newsArray.length === 0) {
        newsContainer.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    // Hide empty state
    emptyState.classList.add('hidden');
    
    // Clear existing content
    newsContainer.innerHTML = '';
    
    // Create a card for each article
    newsArray.forEach((article, index) => {
        const card = createNewsCard(article, index);
        newsContainer.appendChild(card);
    });
}

// ===== TRUNCATE TEXT FUNCTION =====
// Truncates text to specified length and adds ellipsis
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

// ===== CREATE NEWS CARD =====
// Creates a single news card element
function createNewsCard(article, index) {
    // Create the card container
    const card = document.createElement('div');
    card.className = 'news-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Format the date nicely
    const date = article.date || 'Unknown date';
    
    // Get source icon
    const sourceIcon = getSourceIcon(article.source);
    
    // Use firm from the news data
    const firmName = article.firm || 'PE Firm';
    const firmLogoHtml = createRobustLogoHTML(firmName, '32px');
    
    // Build the HTML for the card
    card.innerHTML = `
        <div class="news-card-header">
            <div style="display: flex; align-items: center; gap: 8px;">
                ${firmLogoHtml}
                <span class="news-source">
                    ${sourceIcon}
                    ${escapeHtml(article.source || 'Cision')}
                </span>
            </div>
        </div>
        <h3 class="news-title">${escapeHtml(truncateText(article.title, 80))}</h3>
        <p class="news-description">${escapeHtml(truncateText(article.description, 120))}</p>
        <div class="news-footer">
            <span class="news-date">
                <i class="far fa-calendar"></i>
                ${escapeHtml(date)}
            </span>
            <a href="${escapeHtml(article.link)}" target="_blank" class="news-link">
                Read More
                <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;
    
    return card;
}

// ===== SEARCH FUNCTION =====
// Filters news based on search input
let searchTimeout;
async function handleSearch(event) {
    const query = event.target.value.trim();
    
    // Debounce: wait 300ms after user stops typing
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        
        if (query === '') {
            // If search is empty, load all news
            loadNews();
            return;
        }
        
        showLoading(true);
        
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('totalCount').textContent = data.count;
                displayNews(data.results);
                
                if (data.count === 0) {
                    showStatusMessage(`No articles found for "${query}"`, 'error');
                }
            }
            
        } catch (error) {
            console.error('Error searching:', error);
            showStatusMessage('❌ Search failed', 'error');
        } finally {
            showLoading(false);
        }
        
    }, 300);
}

// ===== HELPER FUNCTIONS =====

// Show/hide loading spinner
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.classList.remove('hidden');
    } else {
        spinner.classList.add('hidden');
    }
}

// Show status message
function showStatusMessage(message, type) {
    const messageDiv = document.getElementById('statusMessage');
    messageDiv.textContent = message;
    messageDiv.className = `status-message ${type}`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideStatusMessage();
    }, 5000);
}

// Hide status message
function hideStatusMessage() {
    const messageDiv = document.getElementById('statusMessage');
    messageDiv.classList.add('hidden');
}

// Get source icon based on news source
function getSourceIcon(source) {
    if (!source) return '<i class="fas fa-newspaper"></i>';
    
    const sourceLower = source.toLowerCase();
    const iconMap = {
        'pe news': '<i class="fas fa-briefcase"></i>',
        'seeking alpha': '<i class="fas fa-chart-line"></i>',
        'reuters': '<i class="fas fa-globe"></i>',
        'financial times': '<i class="fas fa-newspaper"></i>',
        'bloomberg': '<i class="fas fa-building"></i>',
        'breakit': '<i class="fas fa-bolt"></i>',
        'crunchbase': '<i class="fas fa-rocket"></i>',
        'crescendo': '<i class="fas fa-chart-bar"></i>',
        'techcrunch': '<i class="fab fa-space-awesome"></i>'
    };
    
    for (let key in iconMap) {
        if (sourceLower.includes(key)) {
            return iconMap[key];
        }
    }
    
    return '<i class="fas fa-newspaper"></i>';
}

// Escape HTML to prevent XSS attacks
// SECURITY: This prevents malicious code from being injected
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== UTILITY: Format date nicely =====
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        return dateString;
    }
}

// Log helpful information for debugging
console.log('📚 Available functions:');
console.log('  - scrapeNews(): Scrape new articles');
console.log('  - loadNews(): Reload all articles');
console.log('  - handleSearch(): Search articles');
console.log('\n💡 Tip: Open DevTools (F12) to see network requests and console logs!');

