# -*- coding: utf-8 -*-
"""Merge GP team rosters into pe_firms_database.json. Run from repo root: python scripts/apply_gp_teams.py"""
import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "pe_firms_database.json"


def m(name, title, location="", email="", phone="", background=""):
    o = {"name": name, "title": title}
    if location:
        o["location"] = location
    if email:
        o["email"] = email
    if phone:
        o["phone"] = phone
    if background:
        o["background"] = background
    return o


ACCENT = [
    m("Benny Zakrisson", "Partner and Investment Manager", "Stockholm"),
    m("Carl Fürstenbach", "Partner and Investment Manager", "Stockholm"),
    m("Caroline Brandt Lilja", "Director", "Stockholm"),
    m("Claes Bodell", "Partner and Investment Manager", "Stockholm"),
    m("Daniel Winberg", "Senior Advisor", "Stockholm"),
    m("Frederik Andersen", "Valuation & Reporting Manager", "Stockholm"),
    m("Jesper Björkman", "Director", "Stockholm"),
    m("Johanna Hedman Palm", "Sustainability Manager", "Stockholm"),
    m("Lowe Rehnberg", "Director", "Stockholm"),
    m("Mikael Strand", "Associate Partner", "Stockholm"),
    m("Niklas Sloutski", "CEO and Partner", "Stockholm"),
    m("Oscar Claeson", "Partner and Investment Manager", "Stockholm"),
    m("Patric Grimhall", "CFO", "Stockholm"),
    m("Sofia Nyrén", "Director", "Stockholm"),
    m("Susanne Andersson", "Administrative Assistant", "Stockholm"),
    m("Tina Hammersland", "Associate", "Stockholm"),
    m("Tommy Torwald", "Associate Partner", "Stockholm"),
]

ADELIS = [
    m("Adalbjörn Stefansson", "Investor relations", "Stockholm"),
    m("Andreas Askenbäck", "Finance manager", "Stockholm"),
    m("Anne-Sophie Holst Sanders", "Investment team", "Stockholm"),
    m("Annika Björklund", "Fund accountant", "Stockholm"),
    m("Claud Henze", "Investment team", "Stockholm"),
    m("Dimitri Yakupov", "Investment team", "Stockholm"),
    m("Edward Herslow", "Investment team", "Stockholm"),
    m("Erik Hallert", "Investment team", "Stockholm"),
    m("Franz Reiffenstuel", "Investment team", "Munich"),
    m("Gustav Bard", "Investment team", "Stockholm"),
    m("Hampus Nestius", "Investment team", "Stockholm"),
    m("Hanna Jängnemyr", "Investment team", "Stockholm"),
    m("Hendrik Henatsch", "Investment team", "Stockholm"),
    m("Henrik Klerfelt", "CFO", "Stockholm"),
    m("Jakob Wedenborn", "Investment team", "Stockholm"),
    m("Jan Åkesson", "Investment team", "Stockholm"),
    m("Jesper Bahlke", "Investment team", "Stockholm"),
    m("Joel Russell", "Investment team", "Stockholm"),
    m("Johan Seger", "Senior Advisor", "Stockholm"),
    m("Johan Widén", "Investment team", "Stockholm"),
    m("John-Matias Uuttana", "Investment team", "Stockholm"),
    m("Jørgen Møinichen", "Investment team", "Oslo"),
    m("Kristina Würz", "Executive assistant", "Stockholm"),
    m("Lene Sandvoll Stern", "Investment team", "Oslo"),
    m("Linda Andell", "Office Manager", "Stockholm"),
    m("Linnea Olofsson", "Head of ESG", "Stockholm"),
    m("Lova Lundin", "Financial controller", "Stockholm"),
    m("Lucia Morris", "Investment team", "Stockholm"),
    m("Luciana Lobo Cedstam", "Team assistant", "Stockholm"),
    m("Mads Juel Sørensen", "Investment team", "Copenhagen"),
    m("Martin Welna", "Investment team", "Copenhagen"),
    m("Morten Loft Sørensen", "Investment team", "Copenhagen"),
    m("Nina Källmén", "Investment team", "Stockholm"),
    m("Philip Enckell", "Investment team", "Stockholm"),
    m("Rasmus Molander", "Investment team", "Stockholm"),
    m("Rolf Bräu", "Investment team", "Stockholm"),
    m("Sibel Karina Arnes", "Investment team", "Oslo"),
    m("Simen Abel Engh", "Investment team", "Oslo"),
    m("Sofia Falke (fmr Classon)", "Investment team", "Stockholm"),
    m("Sofia Forsman", "Office Manager", "Stockholm"),
    m("Therese Leksäther", "Team assistant", "Stockholm"),
    m("Waltteri Rautakorpi", "Investment team", "Helsinki"),
    m("Wiebke Buchholz", "Investment team", "Stockholm"),
]

ALDER = [
    m("Susanna Andreasson", "Investment Manager", "Stockholm", "susanna.andreasson@alder.se", "+46 72 142 87 02"),
    m("Fabian Bevanda", "Investment Analyst", "Stockholm", "fabian.bevanda@alder.se", "+46 763 97 93 04"),
    m("Henrik Blomé", "Partner", "Stockholm", "henrik.blome@alder.se", "+46 706 38 01 30"),
    m("Dag Broman", "Partner", "Stockholm", "dag.broman@alder.se", "+46 705 16 40 18"),
    m("Elise Fahlén", "Investment Director", "Stockholm", "elise.fahlen@alder.se", "+46 704 41 88 79"),
    m("Henrik Flygar", "Partner", "Stockholm", "henrik.flygar@alder.se", "+46 706 66 07 79"),
    m("Felicia Jakobsson", "Investment Controller", "Stockholm", "felicia.jakobsson@alder.se", "+46 73 203 92 75"),
    m("Carl-Johan Langenskiöld Folke", "Investment Manager", "Stockholm", "cj.langenskioldfolke@alder.se", "+46 708 45 13 00"),
    m("Henrik Lindholm", "Investment Director", "Stockholm", "henrik.lindholm@alder.se", "+46 704 98 72 81"),
    m("Eva Normell", "Sustainability Officer", "Stockholm", "eva.normell@alder.se", "+46 703 31 42 60"),
    m("Keiward Pham", "Investment Director", "Stockholm", "keiward.pham@alder.se", "+46 725 09 48 48"),
    m("Arash Raisse", "Partner", "Stockholm", "arash.raisse@alder.se", "+46 725 00 62 55"),
    m("Niklas Skytting", "Investment Manager", "Stockholm", "niklas.skytting@alder.se", "+46 721 50 30 15"),
    m("Johanna Strömqvist", "CFO", "Stockholm", "johanna.stromqvist@alder.se", "+46 730 60 11 72"),
    m("Elin Söderlund", "Investment Analyst", "Stockholm", "elin.soderlund@alder.se", "+46 70 818 69 92"),
]

AMPLIO = [
    m("Marcus Planting-Bergloo", "Managing Partner", "Stockholm"),
    m("Percy Calissendorff", "Partner & Executive Chairman", "Stockholm"),
    m("Johan Möllerström", "Partner", "Stockholm"),
    m("Anton Cederling", "Investment Manager", "Stockholm"),
    m("Jacob Andersson", "Investment Manager", "Stockholm"),
    m("Fabian Boberg", "Associate", "Stockholm"),
    m("Håkan Dahlin", "CFO", "Stockholm"),
]

BURE = [
    m("Henrik Blomquist", "CEO", "Stockholm"),
    m("Max Jonson", "CFO", "Stockholm"),
    m("Kristina Wigh", "Office Manager", "Stockholm"),
    m("Gösta Johannesson", "Senior Advisor", "Stockholm"),
    m("Sophie Hagströmer", "Investment Director", "Stockholm"),
    m("Oskar Hörnell", "Investment Manager", "Stockholm"),
    m("Gabriella Öman", "Investment Associate", "Stockholm"),
    m("Ella Kuritzén", "Investment Associate", "Stockholm"),
    m("Leah Engman", "Data & Investment Analyst", "Stockholm"),
    m("Klas Danielsson", "Equity Research Analyst", "Stockholm"),
    m("Kristoffer Östlin", "Investment Analyst", "Stockholm"),
]

CAPMAN = [
    m("Antti Karppinen", "Managing Partner, Buyout", "Helsinki"),
    m("Anders Björkell", "Partner, Buyout", "Helsinki"),
    m("Joonas Korkalainen", "Investment Manager, Buyout", "Helsinki"),
    m("Robin Westberg", "Partner, Buyout", "Helsinki"),
    m("Riikka Wärn", "Executive Assistant, Buyout", "Helsinki"),
]

CELERO = [
    m("Peter Möller", "Managing Partner", "Stockholm", background="21 years of PE experience; previously FSN Capital, Permira and Goldman Sachs (London and New York). MSc in Economics and Business Administration (dual major SSE and Wharton)."),
    m("Kenneth Haavet", "Partner", "Stockholm", background="14 years of PE; former CEO of Orkla Consumer & Financial Investments; FSN Capital and Macquarie Capital (Sydney). Master of Applied Finance (Macquarie), BBus with Distinction (UTS)."),
    m("Viktor Hansson", "Partner", "Stockholm", background="11 years of PE; former Head of M&A at Nordlo; FSN Capital, Munters, Bain & Company. MSc Industrial Engineering and Management (KTH), BSc Business and Economics (Stockholm University)."),
    m("Gustaf von Platen", "Principal", "Stockholm", background="Joined 2023; seven years at FSN Capital; J.P. Morgan Nordic M&A (London). MSc and BSc Business and Management (SSE), BA History (Stockholm University)."),
    m("Oscar Haglund", "Investment Manager", "Stockholm", background="Joined 2024; Litorina and Arkwright consulting. MSc Double Degree Finance (SSE and Bocconi), BSc Business and Economics (SSE)."),
    m("Fredrika Claezon", "Investment Manager", "Stockholm", background="Joined 2023; Nordea Corporate Finance. MSc Strategic Management (RSM), BSc Business Administration (University of Amsterdam)."),
    m("Emil Erbing", "Investment Manager", "Stockholm", background="Joined 2024; Rothschild & Co (Stockholm). BSc Business and Economics (Lund University)."),
    m("Lovisa Severin", "Investment Associate", "Stockholm", background="Joined 2025; Goldman Sachs (London and Frankfurt). BSc International Business (Copenhagen Business School)."),
    m("Pavel Thorn", "Investment Associate", "Stockholm", background="Joined 2026; Litorina, Armada Credit Partners, DNB Markets. BSc Business and Economics (SSE)."),
    m("Johanna Kull", "CFO & Head of ESG", "Stockholm", background="Joined 2024; 17 years in financial services and PE; Urban Partners, Apollo, Nomura, HSBC (London). Chartered accountant; MSc Business Administration (Gothenburg)."),
    m("Hanna Östergren", "Office Manager", "Stockholm", background="Joined 2025; sales and secretary roles, most recently legal secretary at Juristhuset (Stockholm)."),
    m("Erik Lindgren", "Investment Intern", "Stockholm", background="Joined 2026; internships at North Point Securities and ARC Group. BSc Business and Economics (SSE), in progress."),
    m("Victor Bagley", "Investment Intern", "Stockholm", background="Joined 2026; M&A internships at Vimian Group and The Nutriment Company. BSc Business Administration (SSE)."),
    m("Joanna Ansell", "CAM Advisor", "Stockholm", background="20+ years scaling digital businesses; tech and digital consumer (D2C & B2B). BA (Hons) French & European Studies (Keele), MBA (Surrey)."),
    m("Mikael Olander", "CAM Advisor", "Stockholm", background="Nordic e-commerce executive; founder and former CEO of Bygghemma (BHG Group) and CDON Group; Chairman of WeSports. BSc Finance (LSU), MBA (UCLA Anderson)."),
    m("Jarl Uggla", "CAM Advisor", "Stockholm", background="30+ years senior management; organisational change at B2B and B2C companies across Asia, North America, Africa and Central Europe. Industrial engineering (ABB Business School); IMD and IHM programmes."),
]

EQUIP = [
    m("Sverre B. Flåskjer", "Managing Partner", "Oslo", "sf@equip.no", "+47 481 10 466"),
    m("Torkild Hebbert Haukaas", "Partner", "Oslo", "thh@equip.no", "+47 911 41 290"),
    m("Eivind Saga", "Partner", "Oslo", "es@equip.no", "+47 419 22 000"),
    m("Andreas Lysdahl", "Partner", "Oslo", "al@equip.no", "+47 970 64 687"),
    m("Filip Abusdal Engebretsen", "Partner", "Oslo", "fae@equip.no", "+47 977 36 663"),
    m("Karl Magnus Smeby", "Director", "Oslo", "kms@equip.no", "+47 971 54 222"),
    m("Peder Gjerstad", "Director", "Oslo", "pg@equip.no", "+47 909 46 750"),
    m("Sigrid Fosen Wøien", "Investment Manager", "Oslo", "sigrid@equip.no", "+47 976 30 196"),
    m("Hanna Skolt", "Investment Manager", "Oslo", "hs@equip.no", "+47 473 90 733"),
    m("Caroline Lysebo", "Associate", "Oslo", "cl@equip.no", "+47 954 93 939"),
    m("Iver Olai Lade Gjørvad", "Associate", "Oslo", "ig@equip.no", "+47 466 80 086"),
    m("Charlotte Ekanger", "CFO", "Oslo", "ce@equip.no", "+47 906 11 768"),
    m("Martina Solberg", "Controller", "Oslo", "ms@equip.no", "+47 952 73 349"),
    m("Marie Haga", "Group Accounting Manager", "Oslo", "mh@equip.no", "+47 476 69 420"),
    m("Charlotte Zetterqvist", "Office Assistant", "Oslo", "cz@equip.no", "+47 968 37 457"),
]

HELIX = [
    m("Stefan Lambert", "Partner", "Stockholm", "stefan.lambert@helixkapital.se", "+46 70 216 65 69"),
    m("Joakim Karlsson", "Partner", "Stockholm", "joakim.karlsson@helixkapital.se", "+46 73 390 44 35"),
    m("Mattias Ericsson", "Partner", "Stockholm", "mattias.ericsson@helixkapital.se", "+46 70 643 44 60"),
    m("Victor Björk", "Investment Director", "Stockholm", "victor.bjork@helixkapital.se", "+46 73 200 40 45"),
    m("Alexander Wallenberg", "Investment Director", "Stockholm", "alexander.wallenberg@helixkapital.se", "+46 70 581 57 73"),
    m("Alexander Ribrant", "Investment Manager", "Stockholm", "alexander.ribrant@helixkapital.se", "+46 70 253 39 75"),
    m("Amanda Hellström", "Investment Manager", "Stockholm", "amanda.hellstrom@helixkapital.se", "+46 70 032 35 63"),
    m("Dante Haqués", "Investment Associate", "Stockholm", "dante.haques@helixkapital.se", "+46 76 632 20 50"),
    m("Johan Bagger-Jörgensen", "Investment Analyst", "Stockholm", "johan.bagger@helixkapital.se", "+46 70 527 10 88"),
]

# Axcel — Copenhagen HQ; default location Copenhagen unless noted
AXCEL_RAW = """
Agathe Søndergaard Helle|Sustainability Associate
Armin Besic|Valuation & Data Manager
Asbjørn Hyldgaard|Partner
Björn Forslin|Investment Manager
Björn Larsson|Partner
Caroline Lundgaard|Director
Cecilie Breth Graversen|Receptionist
Christian Bamberger Bro|Managing Partner
Christian Cederfeld de Simonsen|Director
Christian Rosenørn-Due|Finance Manager
Christian Schmidt-Jacobsen|Partner
Christoffer Müller|Partner
Cille Walsted Thomassen|Receptionist
Daniel Nørskov Bech|Director
Ekaterina Yaltykova|Senior Fund Controller
Ella Berglund|Investment Manager
Emelie Zhao|Investment Manager
Emma Elisabeth Brenøe|Investment Manager
Emma Vase|Investor Relations Manager
Felix Thelen|Associate Director
Filip Flenhagen|Investment Manager
Frands Brockenhuus-Schack|Associate Director
Frederik Holm Andersen|Investment Manager
Grit Heintze|Accounting Assistant
Gustav Arick-Nielsen|Associate Director
Hanna Lindberg|Executive Assistant
Hans Fechner|Associate
Helena Werner Söderman|Head of People and Culture
Henri Nurmela|Director
Henrik Nyberg|Investment Manager
Jacob Drakenberg Walberg|Partner
Jacob Østergaard Hansen|Analyst
Jan-Nicolas Garbe|Partner
Jeppe Haghfelt|Student Assistant
Jesper Breitenstein|Head of Investor Relations
Jesper Frydensberg Rasmussen|CFO
Johan Lundén|Partner
Johannes Benzing|Director
John Falck|Associate Director
Julie Søder|Executive Assistant
Kajsa Stenlund|Executive Assistant
Karoline Søholt|Finance Manager
Kasper Olesen|Partner
Lars Cordt|Partner
Lovisa Berglund|Analyst
Maria Fiorini Lorenzen|Head of Communications
Mathilde Hylleberg Andersen|Head of Compliance and Legal
Nadine Michel|Executive Assistant & Office Manager
Nehna Møller-Pettersen|Investment Manager
Nils Elmlund|Associate Director
Oscar Freiesleben Hjort|Associate Director
Patrick Kjær|Investment Manager
Pia Barlebo|Head of Office Support
Sarah Hempel|Head of Sustainability
Sebastian Aarosin|Director
Sonja Gerde|Director
Susanne Ardai-Blomberg|Receptionist
Thomas Blomqvist|Partner
Thomas Pedersen|Analyst
Victor Emil Theisen|Associate
Victor Frederik Valentin Rasmussen|Investment Manager
William Carlheim-Gyllenskiöld|Investment Manager
"""

AXCEL = []
for line in AXCEL_RAW.strip().split("\n"):
    if "|" not in line:
        continue
    name, title = line.split("|", 1)
    AXCEL.append(m(name.strip(), title.strip(), "Copenhagen"))


# IK Partners — Leadership list with office
IK_RAW = """
Thierry Aoun|Partner|London
Ingmar Bär|Partner|Hamburg
Julian Bärenfänger|Partner|Hamburg
Arnaud Bosc|Partner|Paris
Morgane Bouhenic|Partner|Paris
Maria Brunow|Partner|Stockholm
Rémi Buttiaux|Managing Partner, Business Services Sector Lead|Paris
Joachim Dettmar|Partner|Munich
Vincent Elriz|Partner|Paris
Pierre Gallix|Managing Partner, Head of Development Capital Strategy|Paris
Henrik Geijer|Partner|Stockholm
Thomas Grob|Managing Partner, Head of Partnership Fund Strategy|Paris
Remko Hilhorst|Managing Partner|Amsterdam
Frances Houweling|Partner|Amsterdam
Mirko Jablonsky|Partner, Industrials Sector Lead|Hamburg
Frederik Jacobs|Partner|Amsterdam
Antoine Jacquemin|Partner|Paris
Carl Jakobsson|Partner|Stockholm
Alexandra Kazi|Partner|London
Kristian Carlsson Kemppinen|Managing Partner, Head of Small Cap Strategy|Stockholm
Diki Korniloff|Partner|Paris
Alice Langley|Partner|London
Mads Ryum Larsen|Managing Partner|Copenhagen
Xavier Lemonnier|Partner|Paris
Christopher Masek|Chief Executive Officer|Paris
Simon May|Partner|London
Anders Petersson|Managing Partner, Healthcare Sector Lead|Hamburg
Nils Pohlmann|Partner|Hamburg
Jérôme Richard|Partner|Paris
Tom Salmon|Partner|London
Dan Soudry|Managing Partner, Head of Mid Cap Strategy|London
Johan Van de Steen|Managing Partner|Luxembourg
Magdalena Svensson|Partner|Paris
Adrian Tanski|Partner|Munich
Onne Tjerkstra|Partner|Amsterdam
Andrew Townend|Partner|Luxembourg
Jakob Treffers|Partner|Amsterdam
David Varet|Partner|Paris
Sander van Vreumingen|Partner|Amsterdam
Pete Wilson|Partner|London
James Yates|Chief Financial Officer and Managing Partner|London
"""

IK_TEAM = []
for line in IK_RAW.strip().split("\n"):
    if "|" not in line:
        continue
    parts = line.split("|")
    if len(parts) >= 3:
        name, title, loc = parts[0], parts[1], parts[2]
        IK_TEAM.append(m(name.strip(), title.strip(), loc.strip()))


# FSN Capital — Oslo-centric; use Oslo unless role suggests otherwise
FSN_RAW = """
Adelina Sirbu|Controller
Agnes Kristinsdóttir|Business Services Coordinator
Ana Drazic|Finance Manager
Anette Fehn|Business Services Manager, IR
Angela Wu|Senior IR Director
Anne Winther|Office Coordinator
Åse Ullmann|Head of People Services & Support
Awais Shafique|Senior Operating Director, Strategy & Operations
Barbara Stolz|Investment Director
Bror Magnus Sand|Investment Associate
Cattis Legelius|Office Manager
Charles de Lezardiere|IR Director
Charlotte Sörnäs|HR Manager
Christian Jelsbech|Investment Director
Christian McCarty|Operating Director, Capital Markets
Clemens Plainer|Principal
Constantin Schloesser|Investment Associate
Daniel Lebe|Digital Manager
Debbie Fellmerk|Investment Manager
Eirik Hjeltnes Wabø|Principal
Emma Currier|Investment Manager
Erik Nelson|Partner
Eskil Koffeld|Partner
Felix Schroeder|Finance Manager
Frederik Dagø|Decarbonization Director
Frida Jónsdóttir|Jr. Operating Director, Strategy & Operations
Gereon Wellmann|Sustainability Specialist
Hanne Iversen|General Counsel
Helene Wekre|Investment Associate
Heline Odqvist|Investment Associate
Herman Anker|Investment Manager
Jacob Freeman|Legal Advisor
Jesper Isaksen|Partner & Head of Talent
Joakim Ytterberg|Investment Associate
Joar Jansson|Investment Manager
Johanna Jaklinder|HR Coordinator
Johanna Wackerbeck|Head of Strategy
Johanne Bremnes Bakken|Team Project Assistant
Johannes Brunner|Senior Operating Director, Finance & Operations
Jonna Thomasson|Office Coordinator
Julie Yu|Communications Specialist
Kim Krog|Head of Fund Operations
Knut Røsjorde|Operating Partner
Kristina Wirén González|Investment Director
Lars Veen Uldal|Sustainability Specialist
Maja Nilsson|Legal Counsel
Marcus Egelstig|Partner
Marcus Wintersø|Principal
Maria Grøner|Investment Manager
Marie-Christine Volkert|Investment Associate
Marie Øymyr Moe|CFO & Head of Operations
Maximilian Weimann|Investment Manager
Mia Boje Andersen|Manager Operating Support
Mia Sørli Wikborg|Sustainability Manager
Michael Gentili|Head of Capital Markets
Miriam Okafor|Investment Manager
Moa Strand|Operating Director, Strategy & Operations
Moritz Hafner|Partner
Moritz Madlener|Investment Manager
Morten Welo|Partner, COO and Head of IR
Mykhailo Sydorenko|Tax & Compliance Manager
Nicholas Hjorth|Principal
Niclas Thiel|Partner
Nikolai Doepel|Investment Manager
Nurcan Krieger|Business Services Manager
Oscar Ottosen|Investment Associate
Pål Dale|Senior Operating Director, Strategy & Operations
Patrice Jabet|Partner
Philipp Steinmeister|Investment Associate
Reginald Seawright|Investment Director
Robin Mürer|Co-Managing Partner
Sara Källstrøm Kreilisheim|Business Services Manager
Sarah Coetzee|Business Services Coordinator
Seran Shanmugathas|Digital Specialist
Severin Loos|Investment Director
Simon Larsson|Principal
Stina Lycik|Business Services Manager
Talitha Eber|Investment Director
Tuva Schiager|IR Coordinator
Ulrik Smith|Co-Managing Partner
Unidon Krasniqi|Data & Analytics Specialist, Finance & Operations
Veronica Gundersen|Office Coordinator
Vincent Wahl|Operating Manager, Digital Strategy
Zarina Saeque|Operating Director, Strategy & Operations
Ziqi Huo|Office Coordinator
Christer Tryggestad|Industrial Advisor
Christian Mangstl|Executive Advisor
Das Narayandas|Executive Advisor
Espen Asheim|Executive Advisor
Eva Elmstedt|Executive Advisor
Frode Strand-Nielsen|Founder and Chairperson
Jeanette Fangel Løgstrup|Senior Sustainability Advisor
Knut Kjær|Senior Advisor
Krishna Palepu|Executive Advisor
Mike Winkel|Executive Advisor
Morten Strand|Executive Advisor
Oliver Bendig|Executive Advisor
Peter Kürstein|Executive Advisor
Søren F. Knudsen|Executive Advisor
"""

FSN_TEAM = []
for line in FSN_RAW.strip().split("\n"):
    if "|" not in line:
        continue
    name, title = line.split("|", 1)
    FSN_TEAM.append(m(name.strip(), title.strip(), "Oslo"))

FIDELIO = [
    m("Gabriel Fitzgerald", "Managing Partner, Founder", "Stockholm", background="Previously Nordic Capital and Carnegie (Stockholm). MSc Finance (Stockholm School of Economics); stage-one medical degree (Linköping University)."),
    m("Alexandra Björklund", "CFO & Head of IR", "Stockholm", background="Joined April 2022; JP Morgan, Blackstone, Areim. MSc Finance (SSE)."),
    m("Theodor Bonnier", "Head of Value Creation", "Stockholm", background="Joined April 2013; Barclays Investment Bank (London), Catella Corporate Finance. BSc Finance and Marketing (SSE)."),
    m("Ann-Louise Smetana", "Operations Manager", "Stockholm", background="Joined February 2022; Carnegie, HDR Partners, Danator. MSc Finance (SSE)."),
    m("Hanna Risberg", "Legal Counsel", "Stockholm", background="Joined September 2021 from Vinge (secondee). LL.M. (Uppsala University)."),
    m("Håkan Håkansson", "Senior Advisor", "Stockholm", background="Partner from October 2017; former CEO of Lyko; Goldman Sachs, TA Associates, Sageview Capital. MSc Finance (SSE)."),
    m("Martin Erleman", "Partner", "Stockholm", background="Joined May 2012; Nordic Capital, Goldman Sachs, SEB Enskilda. MSc Finance (SSE)."),
    m("Hampus Tunhammar", "Partner", "Stockholm", background="Joined January 2017; 3i, L.E.K. Consulting (London). BSc Finance and Economics (SSE)."),
    m("Nick Hewett", "Director", "Stockholm", background="Joined April 2020; Bowmark Capital (London), Nomura. MA Theology (Cambridge, first class)."),
    m("Mattias Malmback", "Director", "Stockholm", background="Joined October 2017; Citi (London), CapMan. BSc Finance and Accounting (SSE)."),
    m("Fredrik Blomberg", "Director", "Stockholm", background="Joined June 2018; Rothschild & Co (London), Carnegie. BSc International Business (CBS)."),
    m("Gustav Furenmo", "Investment Manager", "Stockholm", background="Joined July 2021; Goldman Sachs PIA (London), IK Partners. BSc Statistics & Economics (Lund), MSc Corporate Finance (EDHEC)."),
    m("Jakob Nilsson", "Investment Manager", "Stockholm", background="Joined January 2023; Carnegie, Ericsson, Deloitte. BSc Business and Economics (SSE)."),
    m("David Axelsson", "Investment Manager", "Stockholm", background="Joined March 2025; Carnegie. MSc Finance (SSE), BSc Business and Economics (Uppsala)."),
    m("Daniel Englund", "Investment Manager", "Stockholm", background="Joined June 2025; KLAR Partners (London), Goldman Sachs. BSc and MSc Engineering (Linköping)."),
    m("Theodor Stenmo", "Investment Associate", "Stockholm", background="Joined August 2024; Rothschild & Co, SEB. BSc Business & Economics (SSE), MiM (IE Madrid)."),
    m("Emelie Teglund", "Investment Associate", "Stockholm", background="Joined August 2025; IK Partners, Danske Bank. MSc Corporate Finance & Banking (EDHEC), Master Tax Law (Karlstad)."),
    m("Johanna Olsson", "Office Assistant", "Stockholm", background="Joined February 2022; Luma Finans, SEB (Stockholm)."),
]

FIDELIO_FIRM = {
    "name": "Fidelio Capital",
    "logo_url": "https://logo.clearbit.com/fideliocapital.com",
    "website": "https://www.fideliocapital.com",
    "headquarters": "Stockholm, Sweden",
    "founded": 2010,
    "aum": "—",
    "employees": "25+",
    "offices": ["Stockholm"],
    "description": (
        "Fidelio Capital is a Stockholm-based private equity firm partnering with Nordic companies. "
        "The team combines backgrounds from leading international investors, banks, and advisors with "
        "a hands-on approach to value creation and long-term ownership."
    ),
    "investment_focus": {
        "sectors": ["Technology", "Business services", "Consumer", "Healthcare"],
        "geography": ["Nordic region"],
        "deal_size": "Mid-market",
        "investment_type": ["Buyouts", "Growth", "Majority and minority"],
    },
    "fundraising": {
        "current_fund": "Fidelio Capital III and predecessor funds",
        "next_fund": "Deployment across portfolio",
        "strategy": "Nordic mid-market; operational value creation",
    },
    "team": FIDELIO,
    "timeline": [],
    "company_updates": [],
}

TEAM_UPDATES = {
    "Accent Equity": ACCENT,
    "Adelis Equity": ADELIS,
    "Alder": ALDER,
    "Amplio": AMPLIO,
    "Axcel": AXCEL,
    "Bure Equity": BURE,
    "CapMan": CAPMAN,
    "Celero": CELERO,
    "Equip": EQUIP,
    "FSN Capital": FSN_TEAM,
    "Helix Kapital": HELIX,
    "IK Partners": IK_TEAM,
}


def main():
    data = json.loads(DB_PATH.read_text(encoding="utf-8"))
    firms = data.setdefault("pe_firms", {})

    for key, team in TEAM_UPDATES.items():
        if key not in firms:
            print("WARN: skip missing firm key", key)
            continue
        firms[key]["team"] = deepcopy(team)
        print("Updated team:", key, "n=", len(team))

    if "Fidelio Capital" not in firms:
        firms["Fidelio Capital"] = deepcopy(FIDELIO_FIRM)
        print("Inserted Fidelio Capital")
    else:
        firms["Fidelio Capital"]["team"] = deepcopy(FIDELIO)
        for k, v in FIDELIO_FIRM.items():
            if k != "team":
                firms["Fidelio Capital"].setdefault(k, v)
        print("Updated Fidelio Capital")

    DB_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Wrote", DB_PATH)


if __name__ == "__main__":
    main()
