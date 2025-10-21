/**
 * League Tables - Rankings and Analytics
 */

// Tab switching
function switchLeagueTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.league-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active from all buttons
    document.querySelectorAll('.league-tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`league-tab-${tabName}`).classList.add('active');
    
    // Activate button
    event.target.closest('.league-tab-button').classList.add('active');
}

// Top 20 Nordic Investors Data
const nordicInvestorsData = [
    {rank: 1, firm: 'EQT', aum: 220000, type: 'PE/VC Firm', hq: 'Sweden', pe: 180000, vc: 5000, re: 25000, infra: 15000, portfolio: '200+', focus: 'Healthcare, Tech, Industrials'},
    {rank: 2, firm: 'Nordic Capital', aum: 35000, type: 'PE Firm', hq: 'Sweden', pe: 32000, vc: 0, re: 2000, infra: 1000, portfolio: '110+', focus: 'Healthcare, Tech, Financial Services'},
    {rank: 3, firm: 'IK Partners', aum: 14000, type: 'PE Firm', hq: 'UK (Nordic-focused)', pe: 14000, vc: 0, re: 0, infra: 0, portfolio: '125+', focus: 'Nordic/European Mid-market'},
    {rank: 4, firm: 'Triton', aum: 11000, type: 'PE Firm', hq: 'UK (Nordic-focused)', pe: 11000, vc: 0, re: 0, infra: 0, portfolio: '60+', focus: 'Nordic/European Buyouts'},
    {rank: 5, firm: 'Altor', aum: 10000, type: 'PE Firm', hq: 'Sweden', pe: 10000, vc: 0, re: 0, infra: 0, portfolio: '50+', focus: 'Nordic Mid-market'},
    {rank: 6, firm: 'Kinnevik', aum: 8000, type: 'Investment Company', hq: 'Sweden', pe: 5000, vc: 3000, re: 0, infra: 0, portfolio: '30+', focus: 'Consumer, Healthcare, Fintech'},
    {rank: 7, firm: 'Verdane', aum: 7000, type: 'PE/VC Firm', hq: 'Norway', pe: 5500, vc: 1500, re: 0, infra: 0, portfolio: '90+', focus: 'Digital, SaaS, Tech'},
    {rank: 8, firm: 'FSN Capital', aum: 4500, type: 'PE Firm', hq: 'Norway', pe: 4500, vc: 0, re: 0, infra: 0, portfolio: '65+', focus: 'Nordic Mid-market, Services'},
    {rank: 9, firm: 'Summa Equity', aum: 4000, type: 'PE Firm', hq: 'Sweden', pe: 4000, vc: 0, re: 0, infra: 0, portfolio: '25+', focus: 'Sustainable Value Creation'},
    {rank: 10, firm: 'Axcel', aum: 3900, type: 'PE Firm', hq: 'Denmark', pe: 3700, vc: 0, re: 200, infra: 0, portfolio: '68', focus: 'Business Services, Tech, Consumer'},
    {rank: 11, firm: 'Adelis Equity', aum: 3000, type: 'PE Firm', hq: 'Sweden', pe: 3000, vc: 0, re: 0, infra: 0, portfolio: '30+', focus: 'Nordic Essential Services'},
    {rank: 12, firm: 'Valedo Partners', aum: 2200, type: 'PE Firm', hq: 'Sweden', pe: 2200, vc: 0, re: 0, infra: 0, portfolio: '20+', focus: 'Swedish Mid-market'},
    {rank: 13, firm: 'Litorina', aum: 1800, type: 'PE Firm', hq: 'Sweden', pe: 1800, vc: 0, re: 0, infra: 0, portfolio: '25+', focus: 'Consumer, Business Services'},
    {rank: 14, firm: 'Bure Equity', aum: 1800, type: 'Investment Company', hq: 'Sweden', pe: 1800, vc: 0, re: 0, infra: 0, portfolio: '15+', focus: 'Swedish Growth Companies'},
    {rank: 15, firm: 'Northzone', aum: 1500, type: 'VC Firm', hq: 'Sweden', pe: 0, vc: 1500, re: 0, infra: 0, portfolio: '150+', focus: 'Tech, Consumer, AI'},
    {rank: 16, firm: 'Ratos', aum: 1300, type: 'Investment Company', hq: 'Sweden', pe: 1300, vc: 0, re: 0, infra: 0, portfolio: '10+', focus: 'Nordic Industrial, Services'},
    {rank: 17, firm: 'Norrsken Foundation', aum: 1200, type: 'Impact VC', hq: 'Sweden', pe: 0, vc: 1200, re: 0, infra: 0, portfolio: '50+', focus: 'AI for Good, Climate, Health'},
    {rank: 18, firm: 'Alder', aum: 1100, type: 'PE Firm', hq: 'Sweden', pe: 1100, vc: 0, re: 0, infra: 0, portfolio: '18+', focus: 'Swedish Growth Companies'},
    {rank: 19, firm: 'Accent Equity', aum: 900, type: 'PE Firm', hq: 'Sweden', pe: 900, vc: 0, re: 0, infra: 0, portfolio: '12+', focus: 'Swedish Mid-market'},
    {rank: 20, firm: 'Creandum', aum: 800, type: 'VC Firm', hq: 'Sweden', pe: 0, vc: 800, re: 0, infra: 0, portfolio: '100+', focus: 'Consumer Tech, SaaS, Fintech'}
];

// Top 20 Investors Data
const investorsData = [
    {rank: 1, firm: 'Allianz Group', aum: 858896, type: 'Insurance Company', hq: 'Germany', pe: 5824, pd: 128014, re: 22396, infra: 0, nr: 0, hf: 0},
    {rank: 2, firm: 'MetLife Investment Management', aum: 136000, type: 'Asset Manager', hq: 'US', pe: 0, pd: 68000, re: 17200, infra: 34300, nr: 0, hf: 0},
    {rank: 3, firm: 'AXA IM Alts', aum: 210718, type: 'Asset Manager', hq: 'France', pe: 0, pd: 65661, re: 117251, infra: 17588, nr: 0, hf: 0},
    {rank: 4, firm: 'Aviva Life and Pensions', aum: 496813, type: 'Insurance Company', hq: 'UK', pe: 377, pd: 45923, re: 8897, infra: 0, nr: 0, hf: 0},
    {rank: 5, firm: 'Neuberger Berman', aum: 515000, type: 'Asset Manager', hq: 'US', pe: 107000, pd: 38000, re: 0, infra: 0, nr: 0, hf: 23000},
    {rank: 6, firm: 'Pensioenfonds Zorg en Welzijn', aum: 291345, type: 'Public Pension Fund', hq: 'Netherlands', pe: 24710, pd: 27853, re: 35322, infra: 16894, nr: 0, hf: 0},
    {rank: 7, firm: 'Brighthouse Financial', aum: 120747, type: 'Insurance Company', hq: 'US', pe: 6, pd: 24194, re: 671, infra: 0, nr: 0, hf: 0},
    {rank: 8, firm: 'PIMCO Prime Real Estate', aum: 92327, type: 'Asset Manager', hq: 'Germany', pe: 0, pd: 23704, re: 56609, infra: 0, nr: 0, hf: 0},
    {rank: 9, firm: 'Hayfin Capital Management', aum: 38485, type: 'Fund Manager', hq: 'UK', pe: 586, pd: 23450, re: 0, infra: 0, nr: 0, hf: 0},
    {rank: 10, firm: 'PZU Group', aum: 13881, type: 'Insurance Company', hq: 'Poland', pe: 2467, pd: 22203, re: 852, infra: 0, nr: 0, hf: 0},
    {rank: 11, firm: 'CalPERS', aum: 583770, type: 'Public Pension Fund', hq: 'US', pe: 103327, pd: 22183, re: 0, infra: 0, nr: 0, hf: 0},
    {rank: 12, firm: 'Public Sector Pension Investment Board', aum: 209826, type: 'Public Pension Fund', hq: 'Canada', pe: 29158, pd: 21692, re: 19087, infra: 22909, nr: 12849, hf: 0},
    {rank: 13, firm: 'Phoenix Group', aum: 425241, type: 'Insurance Company', hq: 'UK', pe: 0, pd: 20863, re: 6035, infra: 0, nr: 0, hf: 0},
    {rank: 14, firm: 'ICG', aum: 123000, type: 'Fund Manager', hq: 'UK', pe: 24710, pd: 19768, re: 0, infra: 0, nr: 0, hf: 0},
    {rank: 15, firm: 'Bayerische Versorgungskammer', aum: 121674, type: 'Public Pension Fund', hq: 'Germany', pe: 13718, pd: 19035, re: 38686, infra: 5836, nr: 1753, hf: 9392},
    {rank: 16, firm: 'Just Group', aum: 53082, type: 'Private Sector Pension Fund', hq: 'UK', pe: 0, pd: 18795, re: 1085, infra: 0, nr: 0, hf: 0},
    {rank: 17, firm: 'Virginia Retirement System', aum: 122800, type: 'Public Pension Fund', hq: 'US', pe: 21800, pd: 18700, re: 0, infra: 0, nr: 0, hf: 5000},
    {rank: 18, firm: 'BC Investment Management', aum: 206524, type: 'Asset Manager', hq: 'Canada', pe: 24066, pd: 14325, re: 45769, infra: 0, nr: 0, hf: 0},
    {rank: 19, firm: 'OMERS', aum: 102968, type: 'Public Pension Fund', hq: 'Canada', pe: 19148, pd: 13101, re: 15117, infra: 22171, nr: 0, hf: 0},
    {rank: 20, firm: 'Texas County & District Retirement System', aum: 46024, type: 'Public Pension Fund', hq: 'US', pe: 12509, pd: 13096, re: 3958, infra: 0, nr: 0, hf: 2354}
];

// Top 20 Fund Managers Data
const managersData = [
    {rank: 1, firm: 'Blackstone', raised: 496764, fundsInMarket: 77, dryPowder: 62378, assetClass: 'Co-Investment, Buyout +22', sector: 'Diversified, Real Estate +9', geo: 'US, North America +6', hq: 'US'},
    {rank: 2, firm: 'KKR', raised: 300201, fundsInMarket: 41, dryPowder: 53755, assetClass: 'Buyout, Direct Lending +20', sector: 'Diversified, Consumer +9', geo: 'North America, US +10', hq: 'US'},
    {rank: 3, firm: 'Brookfield Asset Management', raised: 263942, fundsInMarket: 20, dryPowder: 57337, assetClass: 'Energy, RE Opportunistic +21', sector: 'Real Estate, Energy +9', geo: 'North America, US +7', hq: 'US'},
    {rank: 4, firm: 'Goldman Sachs Asset Management', raised: 256283, fundsInMarket: 17, dryPowder: 25288, assetClass: 'RE Opportunistic, Buyout +21', sector: 'Diversified, Real Estate +9', geo: 'North America, US +10', hq: 'US'},
    {rank: 5, firm: 'Carlyle Group', raised: 245256, fundsInMarket: 71, dryPowder: 30928, assetClass: 'Buyout, Co-Investment +19', sector: 'Diversified, IT +9', geo: 'US, North America +15', hq: 'US'},
    {rank: 6, firm: 'Ares Management', raised: 239025, fundsInMarket: 70, dryPowder: 53913, assetClass: 'Co-Investment, Secondaries +23', sector: 'Diversified, Real Estate +9', geo: 'North America, US +7', hq: 'US'},
    {rank: 7, firm: 'Apollo Global Management', raised: 235237, fundsInMarket: 59, dryPowder: 41694, assetClass: 'Co-Investment, Buyout +21', sector: 'Diversified, Real Estate +9', geo: 'North America, US +7', hq: 'US'},
    {rank: 8, firm: 'Ardian', raised: 187804, fundsInMarket: 29, dryPowder: 50906, assetClass: 'Co-Investment, Secondaries +18', sector: 'Diversified, Energy +8', geo: 'Europe, West Europe +7', hq: 'France'},
    {rank: 9, firm: 'TPG', raised: 186246, fundsInMarket: 32, dryPowder: 32890, assetClass: 'Buyout, Growth +13', sector: 'Diversified, Healthcare +9', geo: 'US, North America +5', hq: 'US'},
    {rank: 10, firm: 'EQT', raised: 182569, fundsInMarket: 13, dryPowder: 34378, assetClass: 'Buyout, RE Value Added +15', sector: 'Industrials, Healthcare +8', geo: 'Europe, US +6', hq: 'Sweden'},
    {rank: 11, firm: 'Bain Capital', raised: 176505, fundsInMarket: 17, dryPowder: 28679, assetClass: 'Buyout, Venture +12', sector: 'Diversified, Business Services +9', geo: 'North America, US +4', hq: 'US'},
    {rank: 12, firm: 'CVC', raised: 173251, fundsInMarket: 4, dryPowder: 38487, assetClass: 'Buyout, Direct Lending +3', sector: 'Diversified, Consumer +7', geo: 'Europe, West Europe +5', hq: 'Luxembourg'},
    {rank: 13, firm: 'Oaktree Capital Management', raised: 170053, fundsInMarket: 23, dryPowder: 27208, assetClass: 'Distressed Debt, Buyout +18', sector: 'Diversified, Real Estate +9', geo: 'US, North America +8', hq: 'US'},
    {rank: 14, firm: 'Warburg Pincus', raised: 130109, fundsInMarket: 5, dryPowder: 15710, assetClass: 'Balanced, Energy +5', sector: 'Financial Services, Diversified +9', geo: 'North America, US +3', hq: 'US'},
    {rank: 15, firm: 'Thoma Bravo', raised: 128072, fundsInMarket: 26, dryPowder: 30500, assetClass: 'Buyout, Co-Investment +4', sector: 'IT, Diversified +6', geo: 'US, North America +1', hq: 'US'},
    {rank: 16, firm: 'HarbourVest Partners', raised: 124020, fundsInMarket: 38, dryPowder: 23799, assetClass: 'FoF, Secondaries +11', sector: 'Diversified, IT +7', geo: 'North America, US +6', hq: 'US'},
    {rank: 17, firm: 'Advent International', raised: 120697, fundsInMarket: 9, dryPowder: 30536, assetClass: 'Buyout, Co-Investment +3', sector: 'Business Services, Financial +8', geo: 'North America, US +7', hq: 'US'},
    {rank: 18, firm: 'Goldman Sachs XIG', raised: 114278, fundsInMarket: 20, dryPowder: 39739, assetClass: 'FoF, Secondaries +9', sector: 'Diversified, Real Estate +8', geo: 'North America, US +1', hq: 'US'},
    {rank: 19, firm: 'Macquarie Asset Management', raised: 108572, fundsInMarket: 9, dryPowder: 18015, assetClass: 'Energy, Infra Core +14', sector: 'Energy, Industrials +9', geo: 'Europe, Australia +15', hq: 'UK'},
    {rank: 20, firm: 'Hellman & Friedman', raised: 105338, fundsInMarket: 3, dryPowder: 14961, assetClass: 'Co-Investment, Buyout', sector: 'Diversified, Business Services +7', geo: 'North America, US', hq: 'US'}
];

// Top 20 Funds Data
const fundsData = [
    {rank: 1, fund: 'SoftBank Vision Fund', firm: 'SB Investment Advisers', size: 98583, closeDate: '03-Dec-18', vintage: 2017, assetClass: 'Private Equity', strategy: 'Balanced', sector: 'Information Technology', geo: 'North America', hq: 'UK'},
    {rank: 2, firm: 'Blackstone', fund: 'Blackstone Real Estate Partners X', size: 30400, closeDate: '11-Apr-23', vintage: 2022, assetClass: 'Real Estate', strategy: 'RE Opportunistic', sector: 'Real Estate', geo: 'North America', hq: 'US'},
    {rank: 3, firm: 'Lunate', fund: 'ALTÉRRA Acceleration', size: 30000, closeDate: '14-Nov-24', vintage: 2024, assetClass: 'Infrastructure', strategy: 'Infra Core', sector: 'Energy & Utilities', geo: 'North America', hq: 'UAE'},
    {rank: 3, firm: 'Ardian', fund: 'ASF IX', size: 30000, closeDate: '16-Jan-25', vintage: 2022, assetClass: 'Private Equity', strategy: 'Secondaries', sector: 'Diversified', geo: 'Europe', hq: 'France'},
    {rank: 5, firm: 'CVC', fund: 'CVC Capital Partners Fund IX', size: 29797, closeDate: '20-Jul-23', vintage: 2023, assetClass: 'Private Equity', strategy: 'Buyout', sector: 'Diversified', geo: 'Europe', hq: 'Luxembourg'},
    {rank: 6, firm: 'SINO-IC Capital', fund: 'China Integrated Circuit Industry Investment Fund II', size: 29673, closeDate: '26-Jul-19', vintage: 2019, assetClass: 'Private Equity', strategy: 'Growth', sector: 'IT, Telecoms', geo: 'China', hq: 'China'},
    {rank: 7, firm: 'Blackstone', fund: 'Blackstone Capital Partners IX', size: 28000, closeDate: '01-Jul-25', vintage: 2022, assetClass: 'Private Equity', strategy: 'Buyout', sector: 'Diversified', geo: 'North America', hq: 'US'},
    {rank: 7, firm: 'Brookfield', fund: 'Brookfield Infrastructure Fund V', size: 28000, closeDate: '01-Dec-23', vintage: 2022, assetClass: 'Infrastructure', strategy: 'Infra Core Plus', sector: 'Energy & Utilities', geo: 'North America', hq: 'US'},
    {rank: 9, firm: 'Chinese Government', fund: 'China Zhengqi Corporation Fund', size: 27460, closeDate: '04-Mar-16', vintage: 2016, assetClass: 'Private Equity', strategy: 'Fund of Funds', sector: 'Diversified', geo: 'China', hq: 'China'},
    {rank: 10, firm: 'Global Infrastructure Partners', fund: 'Global Infrastructure Partners V', size: 25200, closeDate: '08-Jul-25', vintage: 2023, assetClass: 'Infrastructure', strategy: 'Infra Core Plus', sector: 'Diversified', geo: 'North America', hq: 'US'},
    {rank: 11, firm: 'CVC', fund: 'CVC Capital Partners Fund VIII', size: 25072, closeDate: '03-Jul-20', vintage: 2020, assetClass: 'Private Equity', strategy: 'Buyout', sector: 'Diversified', geo: 'Europe', hq: 'Luxembourg'},
    {rank: 12, firm: 'Advent International', fund: 'Advent International GPE X', size: 25000, closeDate: '23-May-22', vintage: 2022, assetClass: 'Private Equity', strategy: 'Buyout', sector: 'Diversified', geo: 'North America', hq: 'US'},
    {rank: 13, firm: 'Apollo', fund: 'Apollo Investment Fund IX', size: 24714, closeDate: '26-Jul-17', vintage: 2017, assetClass: 'Private Equity', strategy: 'Buyout', sector: 'Diversified', geo: 'North America', hq: 'US'},
    {rank: 14, firm: 'Blackstone', fund: 'Blackstone Capital Partners VIII', size: 24500, closeDate: '29-Oct-19', vintage: 2020, assetClass: 'Private Equity', strategy: 'Buyout', sector: 'Diversified', geo: 'North America', hq: 'US'},
    {rank: 15, firm: 'Hellman & Friedman', fund: 'H&F Capital Partners X', size: 24400, closeDate: '15-Jun-21', vintage: 2021, assetClass: 'Private Equity', strategy: 'Buyout', sector: 'Diversified', geo: 'North America', hq: 'US'},
    {rank: 16, firm: 'Thoma Bravo', fund: 'Thoma Bravo Fund XV', size: 24342, closeDate: '17-Nov-22', vintage: 2022, assetClass: 'Private Equity', strategy: 'Buyout', sector: 'IT', geo: 'North America', hq: 'US'},
    {rank: 17, firm: 'Thoma Bravo', fund: 'Thoma Bravo Fund XVI', size: 24300, closeDate: '03-Jun-25', vintage: 2024, assetClass: 'Private Equity', strategy: 'Buyout', sector: 'IT', geo: 'North America', hq: 'US'},
    {rank: 18, firm: 'Samchully', fund: 'Samchully Midstream Fund No.9', size: 24020, closeDate: '15-Sep-23', vintage: 2023, assetClass: 'Natural Resources', strategy: 'Natural Resources', sector: 'Energy & Utilities', geo: 'US', hq: 'South Korea'},
    {rank: 19, firm: 'Brookfield', fund: 'Brookfield Global Transition Fund', size: 23995, closeDate: '22-Jun-22', vintage: 2021, assetClass: 'Real Estate', strategy: 'RE Value Added', sector: 'Energy & Utilities', geo: 'North America', hq: 'US'},
    {rank: 20, firm: 'CD&R', fund: 'Clayton Dubilier & Rice XII', size: 23550, closeDate: '23-Aug-23', vintage: 2023, assetClass: 'Private Equity', strategy: 'Buyout', sector: 'Diversified', geo: 'North America', hq: 'US'}
];

// Top 20 Law Firms Data
const lawFirmsData = [
    {rank: 1, firm: 'Kirkland & Ellis', hq: 'US', funds: 1548, aum: 2050524, domicile: 'Delaware +24', strategy: 'Buyout +27', sector: 'Diversified +10', managers: 602, managerGeo: 'US +30, North America +7'},
    {rank: 2, firm: 'Addleshaw Goddard', hq: 'UK', funds: 660, aum: 269940, domicile: 'Spain +25', strategy: 'Buyout +25', sector: 'Diversified +10', managers: 374, managerGeo: 'UK +40, Europe +7'},
    {rank: 3, firm: 'Goodwin', hq: 'US', funds: 643, aum: 396507, domicile: 'Delaware +20', strategy: 'Real Estate +26', sector: 'Real Estate +10', managers: 301, managerGeo: 'US +29, North America +7'},
    {rank: 4, firm: 'Simpson Thacher & Bartlett', hq: 'US', funds: 616, aum: 1656874, domicile: 'Delaware +22', strategy: 'Buyout +25', sector: 'Diversified +10', managers: 168, managerGeo: 'US +20, North America +6'},
    {rank: 5, firm: 'Debevoise & Plimpton', hq: 'US', funds: 613, aum: 887081, domicile: 'Delaware +18', strategy: 'Buyout +24', sector: 'Diversified +10', managers: 209, managerGeo: 'US +30, North America +6'},
    {rank: 6, firm: 'Burness Paull', hq: 'UK', funds: 560, aum: 483116, domicile: 'UK +13', strategy: 'Buyout +26', sector: 'Diversified +9', managers: 196, managerGeo: 'UK +12, Europe +7'},
    {rank: 7, firm: 'Proskauer', hq: 'US', funds: 554, aum: 354872, domicile: 'Delaware +16', strategy: 'Buyout +24', sector: 'Diversified +10', managers: 257, managerGeo: 'US +19, North America +7'},
    {rank: 8, firm: 'Clifford Chance', hq: 'UK', funds: 504, aum: 331679, domicile: 'Luxembourg +26', strategy: 'Real Estate +27', sector: 'Diversified +8', managers: 254, managerGeo: 'UK +32, Europe +7'},
    {rank: 9, firm: 'Ropes & Gray', hq: 'US', funds: 499, aum: 534961, domicile: 'Delaware +17', strategy: 'Buyout +25', sector: 'Diversified +10', managers: 193, managerGeo: 'US +19, North America +6'},
    {rank: 10, firm: 'Cooley', hq: 'US', funds: 485, aum: 92840, domicile: 'Delaware +10', strategy: 'Early Stage +17', sector: 'IT +10', managers: 256, managerGeo: 'US +11, North America +6'},
    {rank: 11, firm: 'Schulte Roth & Zabel', hq: 'US', funds: 467, aum: 240289, domicile: 'Delaware +12', strategy: 'Buyout +26', sector: 'Diversified +10', managers: 176, managerGeo: 'US +12, North America +6'},
    {rank: 12, firm: 'Paul Weiss', hq: 'US', funds: 349, aum: 427357, domicile: 'Delaware +11', strategy: 'Buyout +16', sector: 'Diversified +9', managers: 84, managerGeo: 'US +6, North America +4'},
    {rank: 13, firm: 'DLA Piper', hq: 'UK', funds: 331, aum: 70816, domicile: 'Delaware +30', strategy: 'Real Estate +22', sector: 'Real Estate +10', managers: 201, managerGeo: 'US +37, North America +7'},
    {rank: 14, firm: 'Fried Frank', hq: 'US', funds: 304, aum: 740747, domicile: 'Delaware +15', strategy: 'Real Estate +23', sector: 'Diversified +10', managers: 78, managerGeo: 'US +11, North America +4'},
    {rank: 15, firm: 'Gunderson Dettmer', hq: 'US', funds: 274, aum: 47707, domicile: 'Delaware +8', strategy: 'Early Stage +13', sector: 'IT +8', managers: 147, managerGeo: 'US +14, North America +6'},
    {rank: 16, firm: 'Loyens & Loeff', hq: 'Netherlands', funds: 273, aum: 527004, domicile: 'Luxembourg +10', strategy: 'Buyout +25', sector: 'Diversified +8', managers: 129, managerGeo: 'Netherlands +17, Europe +5'},
    {rank: 17, firm: 'Mourant', hq: 'Jersey', funds: 267, aum: 266913, domicile: 'Jersey +19', strategy: 'Buyout +22', sector: 'Diversified +10', managers: 112, managerGeo: 'UK +28, Europe +7'},
    {rank: 18, firm: 'Macfarlanes', hq: 'UK', funds: 256, aum: 117464, domicile: 'UK +9', strategy: 'Buyout +22', sector: 'Diversified +9', managers: 106, managerGeo: 'UK +10, Europe +4'},
    {rank: 19, firm: 'Latham & Watkins', hq: 'US', funds: 246, aum: 199247, domicile: 'Delaware +12', strategy: 'Buyout +20', sector: 'Diversified +9', managers: 132, managerGeo: 'US +13, North America +6'},
    {rank: 20, firm: 'Jones Day', hq: 'US', funds: 219, aum: 78791, domicile: 'Delaware +18', strategy: 'Real Estate +20', sector: 'Real Estate +8', managers: 0, managerGeo: ''}
];

// Initialize tables
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏆 League Tables initialized');
    createNordicInvestorsTable();
    createInvestorsTable();
    createManagersTable();
    createFundsTable();
    createLawFirmsTable();
});

// Create Nordic Investors Table
function createNordicInvestorsTable() {
    const table = document.getElementById('nordicInvestorsTable');
    if (!table) return;
    
    let html = `
        <thead>
            <tr>
                <th style="width: 60px;">Rank</th>
                <th style="width: 50px;"></th>
                <th>Firm Name</th>
                <th style="text-align: right;">AUM (€M)</th>
                <th>Firm Type</th>
                <th>Headquarters</th>
                <th style="text-align: right;">PE Alloc</th>
                <th style="text-align: right;">VC Alloc</th>
                <th>Portfolio</th>
                <th>Focus Areas</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    nordicInvestorsData.forEach(inv => {
        const rankBadge = getRankBadge(inv.rank);
        const rowClass = inv.rank <= 3 ? 'top-3' : '';
        const logoUrl = getCompanyLogoForLeague(inv.firm);
        const flagIcon = getFlagIcon(inv.hq);
        const firmFlagIcon = getFlagIcon(inv.hq, 'firm-flag');
        
        html += `
            <tr class="${rowClass}">
                <td class="rank">${rankBadge}</td>
                <td><img src="${logoUrl}" alt="${inv.firm}" style="width: 32px; height: 32px; border-radius: 6px; object-fit: contain;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(inv.firm.substring(0,2))}&background=667eea&color=fff&size=40'"></td>
                <td class="firm-name">${firmFlagIcon}${inv.firm}</td>
                <td class="number">€${inv.aum.toLocaleString()}M</td>
                <td style="font-size: 12px; color: #666;">${inv.type}</td>
                <td><span style="padding: 4px 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 4px; font-size: 11px; font-weight: 600;">${flagIcon}${inv.hq}</span></td>
                <td class="number">${inv.pe > 0 ? '€' + inv.pe.toLocaleString() + 'M' : '-'}</td>
                <td class="number">${inv.vc > 0 ? '€' + inv.vc.toLocaleString() + 'M' : '-'}</td>
                <td class="number" style="color: #667eea; font-weight: 600;">${inv.portfolio}</td>
                <td style="font-size: 11px; color: #666;">${inv.focus}</td>
            </tr>
        `;
    });
    
    html += '</tbody>';
    table.innerHTML = html;
}

// Create Investors Table
function createInvestorsTable() {
    const table = document.getElementById('investorsTable');
    if (!table) return;
    
    let html = `
        <thead>
            <tr>
                <th style="width: 60px;">Rank</th>
                <th style="width: 50px;"></th>
                <th>Firm Name</th>
                <th style="text-align: right;">AUM ($M)</th>
                <th>Firm Type</th>
                <th>Headquarters</th>
                <th style="text-align: right;">PE Alloc</th>
                <th style="text-align: right;">PD Alloc</th>
                <th style="text-align: right;">RE Alloc</th>
                <th style="text-align: right;">Infra Alloc</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    investorsData.forEach(inv => {
        const rankBadge = getRankBadge(inv.rank);
        const rowClass = inv.rank <= 3 ? 'top-3' : '';
        const logoUrl = getCompanyLogoForLeague(inv.firm);
        const flagIcon = getFlagIcon(inv.hq);
        
        html += `
            <tr class="${rowClass}">
                <td class="rank">${rankBadge}</td>
                <td><img src="${logoUrl}" alt="${inv.firm}" style="width: 32px; height: 32px; border-radius: 6px; object-fit: contain;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(inv.firm.substring(0,2))}&background=667eea&color=fff&size=40'"></td>
                <td class="firm-name">${inv.firm}</td>
                <td class="number">$${inv.aum.toLocaleString()}M</td>
                <td style="font-size: 12px; color: #666;">${inv.type}</td>
                <td><span style="padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-size: 11px; font-weight: 600;">${flagIcon}${inv.hq}</span></td>
                <td class="number">${inv.pe > 0 ? '$' + inv.pe.toLocaleString() + 'M' : '-'}</td>
                <td class="number">${inv.pd > 0 ? '$' + inv.pd.toLocaleString() + 'M' : '-'}</td>
                <td class="number">${inv.re > 0 ? '$' + inv.re.toLocaleString() + 'M' : '-'}</td>
                <td class="number">${inv.infra > 0 ? '$' + inv.infra.toLocaleString() + 'M' : '-'}</td>
            </tr>
        `;
    });
    
    html += '</tbody>';
    table.innerHTML = html;
}

// Create Fund Managers Table
function createManagersTable() {
    const table = document.getElementById('managersTable');
    if (!table) return;
    
    let html = `
        <thead>
            <tr>
                <th style="width: 60px;">Rank</th>
                <th style="width: 50px;"></th>
                <th>Firm Name</th>
                <th style="text-align: right;">Capital Raised ($M)</th>
                <th style="text-align: right;">Funds in Market</th>
                <th style="text-align: right;">Dry Powder ($M)</th>
                <th>Asset Classes</th>
                <th>Core Sectors</th>
                <th>HQ</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    managersData.forEach(mgr => {
        const rankBadge = getRankBadge(mgr.rank);
        const rowClass = mgr.rank <= 3 ? 'top-3' : '';
        const isNordic = mgr.hq === 'Sweden' || mgr.hq === 'Denmark' || mgr.hq === 'Norway' || mgr.hq === 'Finland';
        const logoUrl = getCompanyLogoForLeague(mgr.firm);
        const flagIcon = getFlagIcon(mgr.hq);
        const euBadge = isNordic ? '<span class="fi fi-eu flag-icon" style="width: 18px; height: 13px; margin-left: 4px;"></span>' : '';
        
        html += `
            <tr class="${rowClass}">
                <td class="rank">${rankBadge}</td>
                <td><img src="${logoUrl}" alt="${mgr.firm}" style="width: 32px; height: 32px; border-radius: 6px; object-fit: contain;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(mgr.firm.substring(0,2))}&background=667eea&color=fff&size=40'"></td>
                <td class="firm-name">${mgr.firm}${euBadge}</td>
                <td class="number">$${mgr.raised.toLocaleString()}M</td>
                <td class="number">${mgr.fundsInMarket}</td>
                <td class="number">$${mgr.dryPowder.toLocaleString()}M</td>
                <td style="font-size: 11px; color: #666;">${mgr.assetClass}</td>
                <td style="font-size: 11px; color: #666;">${mgr.sector}</td>
                <td><span style="padding: 4px 8px; background: ${isNordic ? '#667eea' : '#f0f0f0'}; color: ${isNordic ? 'white' : '#666'}; border-radius: 4px; font-size: 11px; font-weight: 600;">${flagIcon}${mgr.hq}</span></td>
            </tr>
        `;
    });
    
    html += '</tbody>';
    table.innerHTML = html;
}

// Create Top Funds Table
function createFundsTable() {
    const table = document.getElementById('fundsTable');
    if (!table) return;
    
    let html = `
        <thead>
            <tr>
                <th style="width: 60px;">Rank</th>
                <th style="width: 50px;"></th>
                <th>Fund Name</th>
                <th>Firm</th>
                <th style="text-align: right;">Final Size ($M)</th>
                <th>Close Date</th>
                <th>Vintage</th>
                <th>Asset Class</th>
                <th>Strategy</th>
                <th>HQ</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    fundsData.forEach(fund => {
        const rankBadge = getRankBadge(fund.rank);
        const rowClass = fund.rank <= 3 ? 'top-3' : '';
        const logoUrl = getCompanyLogoForLeague(fund.firm);
        const flagIcon = getFlagIcon(fund.hq);
        
        html += `
            <tr class="${rowClass}">
                <td class="rank">${rankBadge}</td>
                <td><img src="${logoUrl}" alt="${fund.firm}" style="width: 32px; height: 32px; border-radius: 6px; object-fit: contain;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(fund.firm.substring(0,2))}&background=667eea&color=fff&size=40'"></td>
                <td class="firm-name">${fund.fund}</td>
                <td style="font-weight: 600; color: #667eea;">${fund.firm}</td>
                <td class="number">$${fund.size.toLocaleString()}M</td>
                <td style="font-size: 12px; color: #666;">${fund.closeDate}</td>
                <td class="number">${fund.vintage}</td>
                <td style="font-size: 11px;"><span style="padding: 4px 8px; background: #e3f2fd; color: #1976d2; border-radius: 4px; font-weight: 600;">${fund.assetClass}</span></td>
                <td style="font-size: 11px; color: #666;">${fund.strategy}</td>
                <td><span style="padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-size: 11px; font-weight: 600;">${flagIcon}${fund.hq}</span></td>
            </tr>
        `;
    });
    
    html += '</tbody>';
    table.innerHTML = html;
}

// Create Law Firms Table
function createLawFirmsTable() {
    const table = document.getElementById('lawfirmsTable');
    if (!table) return;
    
    let html = `
        <thead>
            <tr>
                <th style="width: 60px;">Rank</th>
                <th style="width: 50px;"></th>
                <th>Law Firm</th>
                <th>HQ</th>
                <th style="text-align: right;">Funds Serviced</th>
                <th style="text-align: right;">Total AUM ($M)</th>
                <th>Primary Domicile</th>
                <th>Primary Strategy</th>
                <th style="text-align: right;">Managers</th>
            </tr>
        </thead>
        <tbody>
    `;
    
    lawFirmsData.forEach(firm => {
        const rankBadge = getRankBadge(firm.rank);
        const rowClass = firm.rank <= 3 ? 'top-3' : '';
        const logoUrl = getCompanyLogoForLeague(firm.firm);
        const flagIcon = getFlagIcon(firm.hq);
        
        html += `
            <tr class="${rowClass}">
                <td class="rank">${rankBadge}</td>
                <td><img src="${logoUrl}" alt="${firm.firm}" style="width: 32px; height: 32px; border-radius: 6px; object-fit: contain;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(firm.firm.substring(0,2))}&background=667eea&color=fff&size=40'"></td>
                <td class="firm-name">${firm.firm}</td>
                <td><span style="padding: 4px 8px; background: #f0f0f0; border-radius: 4px; font-size: 11px; font-weight: 600;">${flagIcon}${firm.hq}</span></td>
                <td class="number">${firm.funds.toLocaleString()}</td>
                <td class="number">$${firm.aum.toLocaleString()}M</td>
                <td style="font-size: 11px; color: #666;">${firm.domicile}</td>
                <td style="font-size: 11px; color: #666;">${firm.strategy}</td>
                <td class="number">${firm.managers > 0 ? firm.managers : '-'}</td>
            </tr>
        `;
    });
    
    html += '</tbody>';
    table.innerHTML = html;
}

// Get rank badge HTML
function getRankBadge(rank) {
    let badgeClass = 'rank-badge-other';
    if (rank === 1) badgeClass = 'rank-badge-1';
    else if (rank === 2) badgeClass = 'rank-badge-2';
    else if (rank === 3) badgeClass = 'rank-badge-3';
    
    return `<span class="rank-badge ${badgeClass}">${rank}</span>`;
}

// Get country code for flag icon
function getCountryCode(country) {
    // Extract base country name (remove any parenthetical info like "(Nordic-focused)")
    const baseCountry = country.split('(')[0].trim();
    
    const codes = {
        // Nordic Countries
        'Sweden': 'se',
        'Denmark': 'dk',
        'Norway': 'no',
        'Finland': 'fi',
        'Iceland': 'is',
        // Europe
        'UK': 'gb',
        'United Kingdom': 'gb',
        'France': 'fr',
        'Germany': 'de',
        'Netherlands': 'nl',
        'Luxembourg': 'lu',
        'Poland': 'pl',
        'Jersey': 'je',
        'Spain': 'es',
        // North America
        'US': 'us',
        'United States': 'us',
        'USA': 'us',
        'Canada': 'ca',
        // Asia & Other
        'China': 'cn',
        'UAE': 'ae',
        'South Korea': 'kr',
        'Japan': 'jp',
        'Australia': 'au'
    };
    
    return codes[baseCountry] || 'un';
}

// Get flag icon HTML
function getFlagIcon(country, extraClass = '') {
    const code = getCountryCode(country);
    return `<span class="fi fi-${code} flag-icon ${extraClass}"></span>`;
}

// Get company logo with fallback
function getCompanyLogoForLeague(firmName) {
    const logoMappings = {
        // Nordic Investors
        'EQT': 'https://logo.clearbit.com/eqtgroup.com',
        'Nordic Capital': 'https://logo.clearbit.com/nordiccapital.com',
        'Axcel': 'https://logo.clearbit.com/axcel.dk',
        'Norrsken Foundation': 'https://logo.clearbit.com/norrsken.org',
        'Alliance VC': 'https://logo.clearbit.com/alliancevc.com',
        'Creandum': 'https://logo.clearbit.com/creandum.com',
        'Northzone': 'https://logo.clearbit.com/northzone.com',
        'SNÖ Ventures': 'https://ui-avatars.com/api/?name=SNÖ&background=667eea&color=fff&size=40',
        'Inventure': 'https://logo.clearbit.com/inventure.fi',
        'Lifeline Ventures': 'https://logo.clearbit.com/lifelineventures.com',
        'Almi Invest': 'https://logo.clearbit.com/almi.se',
        'Open Ocean': 'https://logo.clearbit.com/openocean.vc',
        'Kinnevik': 'https://logo.clearbit.com/kinnevik.com',
        'Industrifonden': 'https://logo.clearbit.com/industrifonden.com',
        'Verdane': 'https://logo.clearbit.com/verdane.com',
        'Icebreaker VC': 'https://ui-avatars.com/api/?name=IB&background=667eea&color=fff&size=40',
        'Maki.vc': 'https://logo.clearbit.com/maki.vc',
        'Vargas': 'https://ui-avatars.com/api/?name=Vargas&background=667eea&color=fff&size=40',
        'Nineyards Equity': 'https://logo.clearbit.com/nineyards.no',
        'FSN Capital': 'https://logo.clearbit.com/fsncapital.com',
        // Global Investors
        'Allianz Group': 'https://logo.clearbit.com/allianz.com',
        'MetLife Investment Management': 'https://logo.clearbit.com/metlife.com',
        'AXA IM Alts': 'https://logo.clearbit.com/axa.com',
        'Aviva Life and Pensions': 'https://logo.clearbit.com/aviva.com',
        'Neuberger Berman': 'https://logo.clearbit.com/nb.com',
        'Pensioenfonds Zorg en Welzijn': 'https://logo.clearbit.com/pfzw.nl',
        'Brighthouse Financial': 'https://logo.clearbit.com/brighthousefinancial.com',
        'PIMCO Prime Real Estate': 'https://logo.clearbit.com/pimco.com',
        'Hayfin Capital Management': 'https://logo.clearbit.com/hayfin.com',
        'PZU Group': 'https://logo.clearbit.com/pzu.pl',
        'CalPERS': 'https://logo.clearbit.com/calpers.ca.gov',
        'Public Sector Pension Investment Board': 'https://logo.clearbit.com/investpsp.com',
        'Phoenix Group': 'https://logo.clearbit.com/thephoenixgroup.com',
        'ICG': 'https://logo.clearbit.com/icgam.com',
        'Bayerische Versorgungskammer': 'https://ui-avatars.com/api/?name=BVK&background=667eea&color=fff&size=40',
        'Just Group': 'https://logo.clearbit.com/justgroupplc.co.uk',
        'Virginia Retirement System': 'https://ui-avatars.com/api/?name=VRS&background=667eea&color=fff&size=40',
        'BC Investment Management': 'https://logo.clearbit.com/bci.ca',
        'OMERS': 'https://logo.clearbit.com/omers.com',
        'Texas County & District Retirement System': 'https://ui-avatars.com/api/?name=TCDRS&background=667eea&color=fff&size=40',
        'Blackstone': 'https://logo.clearbit.com/blackstone.com',
        'KKR': 'https://logo.clearbit.com/kkr.com',
        'Brookfield Asset Management': 'https://logo.clearbit.com/brookfield.com',
        'Goldman Sachs Asset Management': 'https://logo.clearbit.com/gs.com',
        'Carlyle Group': 'https://logo.clearbit.com/carlyle.com',
        'Ares Management': 'https://logo.clearbit.com/aresmgmt.com',
        'Apollo Global Management': 'https://logo.clearbit.com/apollo.com',
        'Ardian': 'https://logo.clearbit.com/ardian.com',
        'TPG': 'https://logo.clearbit.com/tpg.com',
        'EQT': 'https://logo.clearbit.com/eqtgroup.com',
        'Bain Capital': 'https://logo.clearbit.com/baincapital.com',
        'CVC': 'https://logo.clearbit.com/cvc.com',
        'Oaktree Capital Management': 'https://logo.clearbit.com/oaktreecapital.com',
        'Warburg Pincus': 'https://logo.clearbit.com/warburgpincus.com',
        'Thoma Bravo': 'https://logo.clearbit.com/thomabravo.com',
        'HarbourVest Partners': 'https://logo.clearbit.com/harbourvest.com',
        'Advent International': 'https://logo.clearbit.com/adventinternational.com',
        'Goldman Sachs XIG': 'https://logo.clearbit.com/gs.com',
        'Macquarie Asset Management': 'https://logo.clearbit.com/macquarie.com',
        'Hellman & Friedman': 'https://logo.clearbit.com/hf.com',
        'SB Investment Advisers': 'https://logo.clearbit.com/softbank.com',
        'Lunate': 'https://ui-avatars.com/api/?name=Lunate&background=667eea&color=fff&size=40',
        'SINO-IC Capital': 'https://ui-avatars.com/api/?name=SINO-IC&background=667eea&color=fff&size=40',
        'Brookfield': 'https://logo.clearbit.com/brookfield.com',
        'Chinese Government': 'https://ui-avatars.com/api/?name=China&background=667eea&color=fff&size=40',
        'Global Infrastructure Partners': 'https://ui-avatars.com/api/?name=GIP&background=667eea&color=fff&size=40',
        'Apollo': 'https://logo.clearbit.com/apollo.com',
        'CD&R': 'https://logo.clearbit.com/cdr-inc.com',
        'Samchully': 'https://ui-avatars.com/api/?name=Samchully&background=667eea&color=fff&size=40',
        'Kirkland & Ellis': 'https://logo.clearbit.com/kirkland.com',
        'Addleshaw Goddard': 'https://logo.clearbit.com/addleshawgoddard.com',
        'Goodwin': 'https://logo.clearbit.com/goodwinlaw.com',
        'Simpson Thacher & Bartlett': 'https://logo.clearbit.com/stblaw.com',
        'Debevoise & Plimpton': 'https://logo.clearbit.com/debevoise.com',
        'Burness Paull': 'https://logo.clearbit.com/burnesspaull.com',
        'Proskauer': 'https://logo.clearbit.com/proskauer.com',
        'Clifford Chance': 'https://logo.clearbit.com/cliffordchance.com',
        'Ropes & Gray': 'https://logo.clearbit.com/ropesgray.com',
        'Cooley': 'https://logo.clearbit.com/cooley.com',
        'Schulte Roth & Zabel': 'https://logo.clearbit.com/srz.com',
        'Paul Weiss': 'https://logo.clearbit.com/paulweiss.com',
        'DLA Piper': 'https://logo.clearbit.com/dlapiper.com',
        'Fried Frank': 'https://logo.clearbit.com/friedfrank.com',
        'Gunderson Dettmer': 'https://logo.clearbit.com/gunder.com',
        'Loyens & Loeff': 'https://logo.clearbit.com/loyensloeff.com',
        'Mourant': 'https://logo.clearbit.com/mourant.com',
        'Macfarlanes': 'https://logo.clearbit.com/macfarlanes.com',
        'Latham & Watkins': 'https://logo.clearbit.com/lw.com',
        'Jones Day': 'https://logo.clearbit.com/jonesday.com'
    };
    
    return logoMappings[firmName] || `https://ui-avatars.com/api/?name=${encodeURIComponent(firmName.substring(0, 2))}&background=667eea&color=fff&size=40`;
}

console.log('✅ League Tables loaded');

