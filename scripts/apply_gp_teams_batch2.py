# -*- coding: utf-8 -*-
"""Second batch: Impilo, Litorina, MVI, Nalka, Nordstjernan, Norvestor, Polaris, Ratos, Summa, Trill, Triton."""
import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "pe_firms_database.json"


def mm(name, title, location="", email="", phone="", background=""):
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


IMPILO = [
    mm("Alva Hardeberg", "Investment Intern", "Stockholm", background="Joined 2025. B.Sc. Business & Economics (SSE); exchange at Bocconi. Previously Altor; internships at ABG Sundal Collier, eEquity and Nordic Capital."),
    mm("Anna Ryrberg", "Investment Director", "Stockholm", background="Joined 2025. B.Sc. Financial Economics (Honours), University of St Andrews; sub-honours in Mathematics & Statistics and Management. ~9 years at Summa Equity (healthcare focus), among first investment-team hires. Previously J.P. Morgan investment banking (London)."),
    mm("Camilla Møhl", "Chief People Officer", "Stockholm", background="Joined December 2024. M.Sc. Human Resource Management and B.Sc. Business and Economics (CBS); semester at Wisconsin–Madison. 20+ years in HR and organisation; former CHRO Coloplast; Chief People, Communications & Marketing Officer NNIT; HR roles at Carlsberg and Mars."),
    mm("Carolina Oscarius Dahl", "Partner", "Stockholm", background="Joined 2023. M.Sc. Economics and Business (SSE, 2008), major Accounting & Finance. Investment Director Interogo Holding Long-term Equity (2020–2022); Nordstjernan 2016–2020 with healthcare boards; McKinsey & Company 2008–2016."),
    mm("Cynthia Xinyi Wang", "Investment Intern", "Stockholm", background="Joined 2026. Pursuing B.Sc. Business and Economics (SSE), major Accounting & Finance. Previously Investment Analyst at Broadgate Asset Management; Bioinformatics Analyst at Karolinska Institute."),
    mm("Edvard Hubendick", "Senior Investment Manager", "Stockholm", background="Joined 2019. M.Sc. Industrial Engineering and Management (Linköping, 2017). Former associate McKinsey & Stockholm with substantial healthcare focus."),
    mm("Emilia Staaf", "Investment Manager", "Stockholm", background="Joined 2025. B.Sc. Business and Economics (SSE), finance and accounting; exchange Wharton. Former Analyst, J.P. Morgan investment banking (Stockholm)."),
    mm("Frederikke Beck", "Senior Investment Manager", "Stockholm", background="Joined 2023. M.Sc. Finance and Accounting (CBS); exchange NUS. Two years Polaris; three years KIRKBI (LEGO family office); one year J.P. Morgan Nordic M&A (London)."),
    mm("Fredrik Odin", "Investment Director", "Stockholm", background="Joined 2017. M.Sc. Finance (LSE), B.Sc. Economics, Politics and International Relations (Warwick); Swedish Army Language School. Investment Executive XIO Group (London); Bank of America Merrill Lynch Nordic M&A 2013–2015."),
    mm("Fredrik Strömholm", "Partner", "Stockholm", background="Joined 2016; chairman of the investment committee. M.Sc. Economics (SSE, 1989), finance major at HEC France. Co-founded Impilo after partner role at Altor (co-founded 2003). Goldman Sachs International 1989–1996 and 1999–2002, latterly MD corporate finance."),
    mm("Gustav Jungdalen Lundgren", "Investment Director", "Stockholm", background="Joined 2017. B.Sc. Business and Economics (SSE, 2012). Former partner ABG Sundal Collier investment banking Stockholm from 2012, partner 2016."),
    mm("Henrik Nielsen", "Senior Investment Manager", "Stockholm", background="Joined 2021. M.Sc. Economics (Copenhagen), B.Sc. (Aarhus); exchange Columbia. Consultant BCG Stockholm/Copenhagen, Scandinavian Principal Investors & Private Equity ~2 years."),
    mm("Henry Chen", "Investment Manager", "Stockholm", background="Joined 2025. M.Sc. Finance and B.Sc. Business and Economics (SSE); exchange NUS. Consultant BCG Stockholm, Principal Investors & Private Equity ~3 years."),
    mm("Jeanette Hjelm", "Executive Assistant", "Stockholm", background="Joined October 2017. Former executive assistant Ernst & Young 13 years; PwC and other finance and office administration roles."),
    mm("Jesper Eliasson", "Partner & CFO", "Stockholm", background="Joined 2016; member of the investment committee. Civilekonom (Stockholm University, 1996). CFO and partner Altor 2003–2016; Industri Kapital (now IK) 1996–2003 Stockholm and London."),
    mm("Johan Kårestedt", "Investment Manager", "Stockholm", background="Joined 2024. B.Sc. Business and Economics (SSE), finance and accounting. Former Associate McKinsey & Company Stockholm."),
    mm("Magnus Barken", "Investment Intern", "Stockholm", background="Joined 2025. Pursuing M.Sc. Finance and Strategic Management (CBS), B.Sc. International Business; exchange Yonsei. Former BCG Principal Investors & Private Equity."),
    mm("Magnus Edlund", "Partner", "Stockholm", background="Joined 2017; member of the investment committee. M.Sc. Industrial Management & Engineering (KTH, 2003). Director Altor 2009–2017; BCG Stockholm and London 2004–2009."),
    mm("Malin Sundqvist", "Director of Finance", "Stockholm", background="Joined 2023. M.Sc. Business Administration and Economics (Gothenburg), innovation and industrial management; exchange CBS. KPMG Transaction Services Stockholm from 2014, financial due diligence."),
    mm("Martin Fagerlund", "Partner & COO", "Stockholm", background="Joined 2019; member of the investment committee. LL.M and B.B.A. (Stockholm University, 2006). Lawyer Mannheimer Swartling 2006–2015 (secondments Altor, Ericsson M&A); co-founded boutique M&A law firm 2016–2018."),
    mm("Matilda Hessedahl", "Senior Investment Manager", "Stockholm", background="Joined 2021. M.Sc. and B.Sc. (SSE). Consultant BCG Stockholm; Scandinavian Principal Investors & Private Equity and Healthcare ~2 years."),
    mm("Nicholas Hooge", "Partner", "Stockholm", background="Joined 2020; member of the investment committee. M.Sc. Business Administration and Management Science (CBS, 2004). Senior Director EQT Copenhagen and New York 2006–2019; Deutsche Bank Nordic M&A London 2004–2006."),
    mm("Olga Court-Payen", "Senior Investment Manager", "Stockholm", background="Joined 2023. M.Sc. Applied Economics and Finance (CBS); exchange ESSEC. Two years Polaris; one year Carnegie Copenhagen."),
    mm("Paula Johansson", "Investment Manager", "Stockholm", background="Joined 2022. M.D. (Karolinska Institute), B.Sc. (SSE)."),
    mm("Peter Højmark", "Investment Intern", "Stockholm", background="Joined 2024. Pursuing M.Sc. Applied Economics and Finance (CBS), B.Sc. Economics and Business Administration; President FinanceLab. Student assistant Danmarks Nationalbank."),
    mm("Simon Jaukkuri", "Investment Manager", "Stockholm", background="Joined 2024. B.Sc. Business and Economics (SSE), finance and accounting. Former Analyst Rothschild & Co Stockholm."),
    mm("Stephan Madsen", "Investment Director", "Stockholm", background="Joined 2025. M.Sc. Finance (CBS, 2008). 15+ years PE and IB: MD H.I.G. Capital (Nordic mid-market); BC Partners London 2017–2022; IK Partners 2010–2016; Goldman Sachs London healthcare 2008–2010."),
    mm("Tobias Brix", "Investment Manager", "Stockholm", background="Joined February 2026. M.Sc. Financial Analysis (LBS), B.Sc. Economics and Business Administration (CBS). Consultant BCG Copenhagen, Principal Investors & Private Equity ~2 years; analyst Polaris."),
    mm("Tova Lindahl", "Office Assistant", "Stockholm", background="Joined November 2024."),
    mm("Victor Steien", "Partner", "Stockholm", background="Joined 2018. M.Sc. Economics and Business (SSE, 2008), Finance. Goldman Sachs London 2008–2014; Morgan Stanley Stockholm Executive Director 2014–2018, Nordic M&A and corporate finance."),
]

LITORINA = [
    mm("Amanda Huldt", "Office Manager", "Stockholm"),
    mm("Andreas Nyberg", "Director", "Stockholm"),
    mm("Eric Hegelund", "Associate", "Stockholm"),
    mm("Erik Holmberg", "Interim CFO", "Stockholm"),
    mm("Kristian Holmström", "Senior Advisor", "Stockholm"),
    mm("Lars Verneholt", "Managing Partner", "Stockholm"),
    mm("Ludwig Tarnow", "Associate", "Stockholm"),
    mm("Magnus Ressel", "Partner", "Stockholm"),
    mm("Mattias Letmark", "Partner", "Stockholm"),
    mm("Paul Steene", "Partner", "Stockholm"),
    mm("Tero Merentie", "Director", "Stockholm"),
]

MVI = [
    mm("Daniel Nilsson", "Partner", "Stockholm", "daniel.nilsson@mvi.se", "+46 70 655 78 52"),
    mm("Stefan Karlsson", "Partner", "Stockholm", "stefan.karlsson@mvi.se", "+46 70 601 00 39"),
    mm("Marten Werner", "Partner", "Stockholm", "marten.werner@mvi.se", "+46 70 992 72 24"),
    mm("Falk Wahlstrom", "Director", "Stockholm", "falk.wahlstrom@mvi.se", "+46 76 050 96 51"),
    mm("Christian Bylock", "Director", "Stockholm", "christian.bylock@mvi.se", "+46 73 843 72 32"),
    mm("Adilson Fonseca", "Senior Associate", "Stockholm", "adilson.fonseca@mvi.se", "+46 70 777 29 02"),
    mm("Lisa Reenbom", "Associate", "Stockholm", "lisa.reenbom@mvi.se", "+46 72 236 22 37"),
    mm("Daniela von Koskull", "Associate", "Stockholm", "daniela.von.koskull@mvi.se", "+46 76 775 15 09"),
    mm("Emma Bohlin", "Associate", "Stockholm", "emma.bohlin@mvi.se", "+46 76 775 15 10"),
    mm("Felicia Lindqvist", "Investment and ESG Controller", "Stockholm", "felicia.lindqvist@mvi.se", "+46 72 229 80 44"),
    mm("Liam Claréus", "Analyst", "Stockholm", "liam.clareus@mvi.se", "+46 70 880 30 55"),
    mm("Saga Persson", "Investor Relations Manager", "Stockholm", "saga.persson@mvi.se", "+46 70 341 57 45"),
    mm("Finn Johnsson", "Advisory Board — Chairman", "Stockholm", background="Senior advisor to MVI."),
    mm("Harald Kjessler", "Advisory Board — Member", "Stockholm"),
    mm("Carola Lemne", "Advisory Board — Member", "Stockholm"),
    mm("Kristina Schauman", "Advisory Board — Member", "Stockholm"),
    mm("Håkan Eriksson", "Advisory Board — Member", "Stockholm"),
    mm("Christian Krüeger", "Advisory Board — Member", "Stockholm"),
    mm("Anders Månsson", "Advisory Board — Member", "Stockholm"),
]

NALKA = [
    mm("Annelie Torwald", "Payroll and Accounting Manager", "Nordic"),
    mm("Pontus Boman", "Senior Investment Director", "Nordic"),
    mm("Ludwig Åberg", "Associate", "Nordic"),
    mm("Hanna Höije", "Associate", "Nordic"),
    mm("Louise Tilja", "Investment Director", "Nordic"),
    mm("Mikael Jast", "Senior Investment Director", "Nordic"),
    mm("Sigrid Fjermeros", "Investment Manager", "Nordic"),
    mm("Lena Westergren", "Office Manager & Assistant", "Nordic"),
    mm("Tina Abazari", "Associate", "Nordic"),
    mm("Petra Sjögren", "CFO", "Nordic"),
    mm("Sebastian Johansson", "Associate", "Nordic"),
    mm("Johan Symmons", "Investment Director", "Nordic"),
    mm("Daniel Ahlenius", "Investment Director", "Nordic"),
    mm("Mimmi Hedelin", "Senior Investment Director", "Nordic"),
    mm("Joachim Braun", "Managing Director", "DACH"),
    mm("Martin Lagerblad", "Managing Director", "Nordic"),
    mm("Max Odqvist", "Investment Manager", "Nordic"),
    mm("Christian Thorwid", "Investment Manager", "Nordic"),
    mm("Anders Nyman", "Investment Director", "Nordic"),
    mm("Niklas Schüler", "Associate", "DACH"),
    mm("Carl Lyth Fried", "Communications Manager", "Nordic"),
    mm("Christian Markborn", "Investment Director", "Nordic"),
    mm("Karin Chacón Pezo", "Executive Assistant", "DACH"),
    mm("Yueyi Yin", "Investment Team", "DACH"),
]

NORDSTJERNAN = [
    mm("Johan Lilliehöök", "President and CEO", "Stockholm"),
    mm("Jimmy Renström", "Chief Financial Officer", "Stockholm"),
    mm("Alexander Alm-Pandeya", "Investment Manager", "Stockholm"),
    mm("Emma Hector Begander", "Investment Professional", "Stockholm"),
    mm("Lucas Aras", "Investment Professional", "Stockholm"),
    mm("Simon Seretis", "Managing Director", "Stockholm"),
    mm("Johan Eklund", "Investment Director", "Stockholm"),
    mm("Martin Prage", "Investment Manager", "Stockholm"),
    mm("Ylva Ersvik", "Investment Manager", "Stockholm"),
    mm("Rasmus Wiman", "Investment Manager", "Stockholm"),
    mm("Erik Andersson", "Investment Professional", "Stockholm"),
    mm("Hans De Geer", "Investment Professional", "Stockholm"),
    mm("Jakob Engdahl", "Investment Manager", "Stockholm"),
    mm("Jacqueline Odin", "Investment Manager", "Stockholm"),
    mm("Sofia Samuelsson", "Investment Professional", "Stockholm"),
    mm("Peter Jarvis", "Investment Professional, Credit", "Stockholm"),
    mm("Thomas Naess", "Managing Director, Credit", "Stockholm"),
    mm("Ted Arffman", "Investment Director, Credit", "Stockholm"),
    mm("Helena Grane", "Investment Professional, Credit", "Stockholm"),
    mm("Carl Bergsten", "Head of Capital Markets", "Stockholm"),
    mm("Louisa Lorenius", "Reception", "Stockholm"),
    mm("Paula Röttorp", "General Counsel", "Stockholm"),
    mm("Tor Krusell", "HR and Communications Director", "Stockholm"),
    mm("Elena Sundberg", "HR Administrator", "Stockholm"),
    mm("Gunilla Hansson", "Assistant to the Chairman", "Stockholm"),
    mm("Helena Palmér", "Head of Group Accounting", "Stockholm"),
    mm("Kajsa Andersson", "Communications Manager", "Stockholm"),
    mm("Karin Ek", "Assistant to the CEO", "Stockholm"),
    mm("Katarina Sivander", "Office Manager", "Stockholm"),
    mm("Mats Liljegren", "Controller", "Stockholm"),
    mm("Nils Johan Tjärnlund", "Head of Archives and Research", "Stockholm"),
    mm("Svante Boije af Gennäs", "IT Manager", "Stockholm"),
    mm("Johanna Lisskar", "Real Estate Manager", "Stockholm"),
    mm("Susanne Flamme", "Head of Operations Engelsberg", "Stockholm"),
    mm("Daniel Sörén", "Caretaker Engelsberg", "Stockholm"),
    mm("Elin Fihlén", "Gardener", "Stockholm"),
    mm("Engla Ragnarsson", "Head Gardener Engelsberg", "Stockholm"),
    mm("Ida Olsson", "Gardener and Woodworker", "Stockholm"),
    mm("Peter Ragnarsson", "Gardener Engelsberg", "Stockholm"),
    mm("Sören Öberg", "Caretaker Engelsberg", "Stockholm"),
]

NORVESTOR = [
    mm("Aamina Ghamy", "Senior Accountant", "Oslo"),
    mm("Alexander Bastar", "Investment Associate", "Oslo"),
    mm("Anette Østby", "Accountant & Administrative Assistant", "Oslo"),
    mm("Annie Sundin", "Senior Investment Associate", "Oslo"),
    mm("Anton-Moritz Oliver", "Investment Director", "Oslo"),
    mm("Arfah Chaudry", "Compliance Officer", "Oslo"),
    mm("Attilio Femiano-Chillé", "Risk Manager", "Oslo"),
    mm("Beata Telenga", "Canteen", "Oslo"),
    mm("Charlotte Wallem-Mehn", "Investment Manager", "Oslo"),
    mm("Christian Sontum", "Partner", "Oslo"),
    mm("Dalila Auburtin", "Administrative and Corporate Assistant", "Oslo"),
    mm("Elisabeth Patiño George", "Portfolio Manager", "Oslo"),
    mm("Emma Myresten", "Investor Relations Executive", "Oslo"),
    mm("Erica Hegerin", "General Counsel", "Oslo"),
    mm("Erlend Bondø", "CFO", "Oslo"),
    mm("Fredrik Franke", "Head of Sustainability", "Oslo"),
    mm("Fredrik Gyllenhammar Raaum", "Partner", "Oslo"),
    mm("Fredrik Korterud", "Partner", "Oslo"),
    mm("Georg Enderlein", "Partner", "Oslo"),
    mm("Henning Vold", "Partner", "Oslo"),
    mm("Henrik Ceder", "Chief Digital Officer", "Oslo"),
    mm("Henrik Mjøen Hafstad", "Head of Debt Capital Markets", "Oslo"),
    mm("Henrik Thorsby", "Investment Associate", "Oslo"),
    mm("Henrik Ødegaard", "Head of Talent & Performance Management", "Oslo"),
    mm("Herman Svensk", "Senior Investment Associate", "Oslo"),
    mm("Håvard Berge", "Investment Director", "Oslo"),
    mm("Ian Poppelman", "Partner", "Oslo"),
    mm("Jenny Haapa", "Investment Associate", "Oslo"),
    mm("Johannes Blencke", "Senior Investment Associate", "Oslo"),
    mm("Johannes Eliasson", "Investment Manager", "Oslo"),
    mm("Jonas Kaldahl", "Investment Manager", "Oslo"),
    mm("Julie Hamilton", "Administrative Assistant", "Oslo"),
    mm("Karl Svozilik", "Partner", "Oslo"),
    mm("Katharina Jonas", "Investment Associate", "Oslo"),
    mm("Katrine Helstrup Ovesen", "Senior Investment Associate", "Oslo"),
    mm("Lars Grinde", "Managing Partner", "Oslo"),
    mm("Lauri Tanskanen", "Investment Manager", "Oslo"),
    mm("Lilly Beate Salvesvoll", "Accounting Manager", "Oslo"),
    mm("Lukas Formanek", "Valuation and Financial Analysis Manager", "Oslo"),
    mm("Maria Skodje Bergsten", "Executive Assistant", "Oslo"),
    mm("Marie Fossli Nordheim", "Senior Accountant", "Oslo"),
    mm("Marika af Enehjelm", "Partner", "Oslo"),
    mm("Marius Hol", "Investment Manager", "Oslo"),
    mm("Martin Egeli", "Investment Associate", "Oslo"),
    mm("Martin Kildahl", "Investment Director", "Oslo"),
    mm("Michaela Chebaro", "Office Manager Stockholm", "Stockholm"),
    mm("Niko Stojanovic", "Investor Relations Executive", "Oslo"),
    mm("Nils Halvord", "Sustainability Associate", "Oslo"),
    mm("Olav Osland Vik-Mo", "Partner & COO", "Oslo"),
    mm("Oskar von Brockhusen", "Investment Associate", "Oslo"),
    mm("Outi Kreus", "Investment Manager", "Oslo"),
    mm("Per-Ola Baalerud", "Partner", "Oslo"),
    mm("Peter Tollstadius", "Investment Manager", "Oslo"),
    mm("Petter Björklund", "Investment Associate", "Oslo"),
    mm("Rebecca Farr", "Head of Investor Relations & Fundraising", "Oslo"),
    mm("Sam Jonsson Åslund", "Investment Associate", "Oslo"),
    mm("Sebastian Bugge", "Investment Manager", "Oslo"),
    mm("Simon Bering", "Digital Value Creation Lead", "Oslo"),
    mm("Simon Bodjanski", "Portfolio Manager", "Oslo"),
    mm("Stina Andersson", "Partner", "Oslo"),
    mm("Tara Teymourian", "Senior Investment Associate", "Oslo"),
    mm("Tine Ridder-Nielsen", "Administrative Project Leader", "Oslo"),
    mm("Tone Guran", "Finance and Compliance Manager", "Oslo"),
    mm("Tor Erling Gunnerød", "Partner", "Oslo"),
    mm("Trond Bjørnøy", "Partner and Chair", "Oslo"),
    mm("Xuan Zhuang", "Investment Controller", "Oslo"),
]

POLARIS_RAW = """
Alex Lund Nielsen|Senior Financial Controller
Alexander Kops Wellendorf|Finance Analyst
Allan Bach Pedersen|Partner
Anders Skouenborg|Head of Legal
Andrea Berglund Fuglsang|Office Assistant
Andrea Signe Trolle|Investment Manager
Anne-Caroline Rytter Helstrup|Associate Director
Anton Rohde Bergstrøm|Finance Analyst
Asbjørn Sheller Petersen|Analyst
Asger Svend Brøndholt Thimmer|Analyst
Camilla Ringsted|Director
Carl Brusewitz|Director
Carl Ragnartz|Analyst
Daniel Nejman|Associate Director
Daniel Yderholm Larsen|Financial Controller
Emil Ragnartz|Analyst
Erik Nordwall|Analyst
Frances Owen|Head of Sustainability
Frederik Wodstrup Christiansen|Head of Debt Financing
Gitte Conrad Frederiksen|Accountant
Gustav Brobert|Director
Harald Ekblom|Analyst
Henrik Bonnerup|Partner
Jan Dahlqvist|Senior Advisor
Jan Johan Kühl|Managing Partner
Jari-Niklas Borkowsky|Financial Controller
Jasmin Torreck Ingvardsen|Analyst
Jeanett Elfort|Receptionist
Jesper Langmack|Partner and Head of Polaris Flexible Capital
Joachim Satchwell|Director
Johan Pålsson|Partner
Johan Pernvi|Partner
Jonathan Elofsson|Investment Manager
Jonathan Fransson Höglander|Analyst
Jonathan Stolpe|Investment Manager
Karin Möllborg|Director
Kent Brovn Arp|Partner of Polaris Flexible Capital
Lasse Kjeldsted|Senior Financial Controller
Lene Møller Rønfeldt|CFO
Luyiza Yevhrafova|Associate Director
Magnus Valore|Legal Analyst
Marianne Enevold|Executive Assistant — Office Manager
Martin Godsk Kristensen|Investment Manager
Mie Buch|Investor Relations Manager
Nicolai Gissing Vennekilde|Director
Niels Worning|Senior Advisor
Oskar Andersson|Director
Patrick Robinson|Financial Director
Peter Tøjner Götke|Investment Manager
Rasmus Legind-Hansen Taarup|Finance Analyst
Robert Rosensköld|Director
Roger Hagborg|Partner and Head of Polaris Public Equity
Rune Lillie Gornitzka|Partner
Simon Damkjær Wille|Partner
Stephanie Erev|Interim Head of Sustainability
Stine Sundholm Dørfler|Financial Manager
Susanne Larsson|Head of Investor Relations
Terne Sofie Høy Petersen|KYC Analyst
Thorsten Spurr Madsen|Director
Tobias Valentin Gregers Honoré|Finance Analyst
Trine Bisgaard Lisberg|Head of Risk Management & Compliance
Vibeke Mørch-Hansen|Chief Accountant and HR Manager
Anne Holm Rannaleet|Chairman, Polaris Management Board
Bertil Villard|Board Member, Polaris Management
Peter Høltermand|Investment Advisory Board (Flexible Capital); Board Member, Polaris Management
Marc Antoine Voisard|Advisor to the Board, Polaris Management
"""

POLARIS = []
for line in POLARIS_RAW.strip().split("\n"):
    if "|" not in line:
        continue
    n, t = line.split("|", 1)
    POLARIS.append(mm(n.strip(), t.strip(), "Copenhagen"))

RATOS = [
    mm("Gustaf Salford", "President & CEO", "Stockholm", background="Contact: Firstname.Lastname@ratos.com"),
    mm("Anna Vilogorac", "CFO & IR", "Stockholm", background="Contact: Firstname.Lastname@ratos.com"),
    mm("Katarina Grönwall", "Vice President Communications & Sustainability", "Stockholm", background="Contact: Firstname.Lastname@ratos.com"),
    mm("Wilhelm Montgomery", "Vice President Strategy & Investments", "Stockholm", background="Contact: Firstname.Lastname@ratos.com"),
    mm("Magnus Stephensen", "General Counsel", "Stockholm", background="Contact: Firstname.Lastname@ratos.com"),
]

SUMMA_RAW = """
Reynir Indahl|Founder & Managing Partner|Stockholm
Bertrand Camus|Partner|Stockholm
Matthias Fink|Partner|Stockholm
Stephanie Caspar|Partner, Head of Portfolio & Via Summa|Stockholm
Hannah Gunvor Jacobsen|Partner, COO & Head of Investor Relations|Stockholm
Martin Sjölund|Partner & General Counsel|Stockholm
Jacob Frandsen|Partner|Stockholm
Christian Melby|Partner & Chief Investment Officer|Stockholm
Martin Gjølme|Partner|Stockholm
Gisle Glück Evensen|Partner|Stockholm
Andrew Marino|Partner|Stockholm
Alex Raksin|Partner|Stockholm
Justus Krisch|Investment Associate|Stockholm
Mathias Vollan|Investment Associate|Stockholm
Erik Faye|Investment Associate|Stockholm
André Lagerkvist|Investment Associate|Stockholm
Jonathan Voldberg Hyttemoen|Investment Associate|Stockholm
Niko Michl|Investment Associate|Stockholm
Astrid Lindquist|Investment Manager|Stockholm
Ludvig Guldberg|Investment Associate|Stockholm
Aurélia Carrère|Thematic Chair|Stockholm
Shuayb Ibrahim|Investment Manager|Stockholm
Betty Ålander|Investment Manager|Stockholm
Denny Lekic|Investment Manager|Stockholm
Sercan Samanci|Investment Manager|Stockholm
Johan Pietilä Holmner|Investment Director|Stockholm
Mehdi Lahlou|Investment Director|Stockholm
Maximilian Waldmann|Investment Manager|Stockholm
Vanessa McKay|Investment Manager|Stockholm
Fabian Schmidt-Bähr|Investment Manager|Stockholm
Sebastian Greve Sunde|Investment Director|Stockholm
Peder Qvigstad|Investment Director|Stockholm
Silje Lambrechts|Investment Director|Stockholm
Sundeep Singh|Investment Director|Stockholm
Annette Roth Humlevik|Investment Manager|Stockholm
Tuva Einang Prestegard|Investment Manager|Stockholm
Tuva Greaker|Investment Manager|Stockholm
Gustav Lindberg|Investment Director|Stockholm
Marcus Arvidsson|Risk & Compliance Manager|Stockholm
Johan Carlsson|Senior Legal Counsel|Stockholm
Martin Collin|Senior Tax Manager|Stockholm
Carine Beer|Chief People Officer to Via Summa|Stockholm
Maren Menschik|Manager to Via Summa|Stockholm
Caroline Dehlimarken|Senior Manager to Via Summa|Stockholm
Christian Fuhrhop|CFO to Via Summa|Stockholm
Manuel Klesse|Impact Manager|Stockholm
Emelie Norling|Impact Director|Stockholm
Alexander Bjørklund|Impact Manager|Stockholm
Hannah Elisabeth Berget|Impact Manager|Stockholm
Alexander Häkämies Karlsson|Financial Controller|Stockholm
Adrian Røstad|Senior Accountant|Stockholm
Monika Rusik|Senior Valuation Manager|Stockholm
Mohamad Ali Zahed|Chief Financial Officer|Stockholm
Martin Skough|Senior Finance Manager|Stockholm
Charles Miller-Stirling|Investor Relations Director|Stockholm
Daniel Blaker|Senior Brand & Communication Associate|Stockholm
Helene Varming|Brand & Communication Manager|Stockholm
Rehab Abdelkader|Investor Relations Manager|Stockholm
Erika Alm|Senior Investor Relations Associate|Stockholm
Hannah Goich|Senior Investor Relations Associate|Stockholm
Ludvig Cosma Stålberg|Digital Director in IT|Stockholm
Filippa Fri|Human Resources Associate|Stockholm
Mette Øi|Senior Management Associate|Stockholm
Kristin Warpefelt|Senior Human Resources Manager|Stockholm
Petter Lippestad|Business Development & IT Manager|Stockholm
Janne Davidsen|Human Resources Manager|Stockholm
Martin Skancke|Board Member|Stockholm
Eva Broms|Board Member|Stockholm
Mirja Lehmler-Brown|Board Member|Stockholm
Annika Moman|Industrial Expert (Advisor)|Stockholm
Kees Kruythoff|Thematic Chair (Advisor)|Stockholm
Göran Lindö|Industrial Expert (Advisor)|Stockholm
Conor Kehoe|Advisor|Stockholm
George Serafeim|Advisor|Stockholm
Christoph Waer|Advisor|Stockholm
Jon Hindar|Industrial Expert (Advisor)|Stockholm
Rebecca McVey Gillion|Office Manager Stockholm|Stockholm
Petter Finnema Hegerroll|Administrative Assistant|Stockholm
Lisa Faiss|Executive Assistant & Office Manager Munich|Munich
Andrea Fleischer|Executive Assistant|Stockholm
Janina Strömberg|Executive Assistant|Stockholm
Kimberly Gayle Wijk|Administrative Assistant|Stockholm
Maria Baker|Executive Assistant|Stockholm
Sanna Rolén|Office Manager Oslo|Oslo
Emma Eriksson|Executive Assistant|Stockholm
Anne Myren|Executive Assistant to Managing Partner & COO|Stockholm
Katarina Kahlmann|CEO Summa Foundation|Stockholm
"""

SUMMA = []
for line in SUMMA_RAW.strip().split("\n"):
    if "|" not in line:
        continue
    parts = line.split("|")
    if len(parts) >= 3:
        SUMMA.append(mm(parts[0].strip(), parts[1].strip(), parts[2].strip()))

TRILL = [
    mm("Dominique Alf", "Investment Manager", "Stockholm"),
    mm("Michaela Appelkvist", "Investment Manager", "Stockholm"),
    mm("Pia Gackstatter", "Investment Analyst", "Munich"),
    mm("Ole Gillebo", "Investment Director", "Oslo"),
    mm("Nina Hoffmann von Holten", "Partner", "Copenhagen"),
    mm("Christoffer Johansson", "Investment Associate", "Stockholm"),
    mm("Kristian Klosterkemper", "Partner", "Munich"),
    mm("Korbinian Knoblach", "Partner & Co-Head of Buyout", "Munich"),
    mm("Hannah Larby", "Investment Manager", "New York"),
    mm("Matthew Levine", "Partner & Head of US Buyout", "New York"),
    mm("Ludvig Lundsten", "Investment Director", "Stockholm"),
    mm("Kilian Miessner", "Investment Analyst", "Munich"),
    mm("Moritz Paulus", "Senior Investment Director", "Munich"),
    mm("Isabelle Pilgrim", "Investment Manager", "Munich"),
    mm("Alexander Raza", "Investment Manager", "Stockholm"),
    mm("Steffen Schulze", "Senior Investment Director", "Munich"),
    mm("Kelly Siebert", "Investment Associate", "New York"),
    mm("Linus Wang", "Investment Manager", "Copenhagen"),
    mm("Chee Wei Wong", "Partner", "New York"),
]

TRITON_RAW = """
Graeme Ardus|Head of Sustainability
Mikael Aro|Operating Partner
Sean Clay|Operating Partner
Maximilian Coqui|Partner, Full Potential
David Eliet|Financing Professional
Michael Gahleitner|Managing Partner, Co-Head of Industrial Tech
Sebastian Gocksch|Co-Head Transaction Tax / Legal
Mattias Hindfelt|Digital Operating Partner
Eckhard Hoffmann|Financing Professional
Thomas Jutz|Operating Partner
Arnoud Klerkx|Operating Partner
Philipp Klöcker|Operating Partner
Jonas Köhlin|Managing Partner, Head of Full Potential
Jens Lennertz|Operating Partner
Hans Maret|Senior Industry Expert; TDO Investment Advisory Committee
Ditte Marstrand Wulf|Head of Leadership & Culture
Jonathon Milne|Co-Head Transaction Tax / Legal
Per-Oskar Nordlöf|Financing Professional
Joakim Olsson|Partner
Jasper zu Putlitz|Operating Partner
Carl Johan Renvall|Co-Head of Portfolio Monitoring and Development
Helmut Safar|Head of Global Procurement
Philipp Schäfers|Financing Professional
Cornelius Schleifer|Co-Head of Portfolio Monitoring and Development
Anders Thulin|Partner
Matthew Turner|Senior Partner, Co-Head of Business Services
Helen Williams|Partner, Head of Accelerator Unit
"""

TRITON = []
for line in TRITON_RAW.strip().split("\n"):
    if "|" not in line:
        continue
    n, t = line.split("|", 1)
    TRITON.append(mm(n.strip(), t.strip(), "London"))

BATCH2 = {
    "Impilo": IMPILO,
    "Litorina": LITORINA,
    "MVI": MVI,
    "Nalka": NALKA,
    "Nordstjernan": NORDSTJERNAN,
    "Norvestor": NORVESTOR,
    "Polaris": POLARIS,
    "Ratos": RATOS,
    "Summa Equity": SUMMA,
    "Trill Impact": TRILL,
    "Triton": TRITON,
}


def main():
    data = json.loads(DB_PATH.read_text(encoding="utf-8"))
    firms = data["pe_firms"]
    for key, team in BATCH2.items():
        if key not in firms:
            print("WARN missing", key)
            continue
        firms[key]["team"] = deepcopy(team)
        print(key, len(team))
    DB_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
