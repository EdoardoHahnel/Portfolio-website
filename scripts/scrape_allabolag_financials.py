"""
Scrape UC-style financials from Allabolag into portfolio_enriched.json (Belid template).
"""
from __future__ import annotations

import json
import re
import ssl
import time
import urllib.error
import urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
PORTFOLIO = BASE / "portfolio_enriched.json"

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

# Row order and account codes (from Allabolag UC mapping, matches Belid layout)
TABLE_SPECS = [
    {
        "title": "Löner & utdelning",
        "unit_note": "Belopp i 1000 SEK",
        "rows": [
            ("Löner styrelse och VD", "loner_styrelse_vd"),
            ("Löner övriga", "loner_ovriga"),
            ("Föreslagen utdelning", "SUB"),
        ],
    },
    {
        "title": "Resultaträkning",
        "unit_note": "Belopp i 1000 SEK",
        "rows": [
            ("Nettoomsättning", "SI"),
            ("Övrig omsättning", "ADR"),
            ("Omsättning", "SDI"),
            ("Lagerförändring", "BE"),
            ("Rörelsekostnader", "summa_rorelsekostnader"),
            ("Rörelseresultat efter avskrivningar", "resultat_e_avskrivningar"),
            ("Finansiella intäkter", "FI"),
            ("Finansiella kostnader", "FK"),
            ("Resultat efter finansnetto", "resultat_e_finansnetto"),
            ("Resultat före skatt", "ORS"),
            ("Skatt på årets resultat", "SKO"),
            ("Årets resultat", "DR"),
        ],
    },
    {
        "title": "Balansräkning",
        "unit_note": "Belopp i 1000 SEK",
        "rows": [
            ("Immateriella anläggningstillgångar", "SIA"),
            ("Materiella anläggningstillgångar", "SVD"),
            ("Finansiella anläggningstillgångar", "summa_finansiella_anltillg"),
            ("Anläggningstillgångar", "SFA"),
            ("Varulager", "SV"),
            ("Kundfordringar", "SF"),
            ("Kassa och bank", "KBP"),
            ("Omsättningstillgångar", "SOM"),
            ("Summa tillgångar", "SED"),
            ("Fritt eget kapital", "SIK"),
            ("Obeskattade reserver", "UTR"),
            ("Eget kapital", "SEK"),
            ("Avsättningar", "SAP"),
            ("Långfristiga skulder", "summa_langfristiga_skulder"),
            ("Leverantörsskulder", "LG"),
            ("Kortfristiga skulder", "SKG"),
            ("Summa eget kapital och skulder", "SGE"),
        ],
    },
]

COMPANIES = [
    ("3Button Group", "https://www.allabolag.se/5569225567/3button-group-ab"),
    ("3nine", "https://www.allabolag.se/5565745394/3nine-industries-ab"),
    ("Briab", "https://www.allabolag.se/5566307657/verksamhet"),
    (
        "EWGroup",
        "https://www.allabolag.se/foretag/ewgroup-ab/norrk%C3%B6ping/kontorstj%C3%A4nster/2KIODTWI63II9",
    ),
    (
        "Microbas Precision",
        "https://www.allabolag.se/foretag/microbas-precision-ab/h%C3%A4ssleholm/stenarbeten/2K0MRLSI5YH4C",
    ),
    ("Safe Monitoring Group", "https://www.allabolag.se/5592627391/safe-monitoring-group-ab"),
    ("Scanacon", "https://www.allabolag.se/5562158039/scanacon-aktiebolag"),
    (
        "SI - Sustainable Intelligence",
        "https://www.allabolag.se/foretag/si-sustainable-intelligence-group-ab/varberg/kontorstj%C3%A4nster/2KHXJWAI63II9",
    ),
    ("Umia", "https://www.allabolag.se/5569942377/umia-sweden-ab"),
]

def fetch_html(url: str, retries: int = 3) -> str:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    last_err = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": USER_AGENT,
                    "Accept-Language": "sv-SE,sv;q=0.9,en;q=0.8",
                },
            )
            with urllib.request.urlopen(req, timeout=120, context=ctx) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except urllib.error.HTTPError as e:
            last_err = e
            if e.code in (502, 503, 504) and attempt < retries - 1:
                time.sleep(3 * (attempt + 1))
                continue
            raise
        except Exception as e:
            last_err = e
            if attempt < retries - 1:
                time.sleep(2)
                continue
            raise
    raise last_err  # type: ignore


def parse_next_data(html: str) -> dict:
    m = re.search(
        r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',
        html,
        re.DOTALL,
    )
    if not m:
        raise ValueError("No __NEXT_DATA__ found")
    return json.loads(m.group(1))


def extract_label_mapping(html: str) -> dict[str, str]:
    scripts = re.findall(r"<script[^>]*>(.*?)</script>", html, re.DOTALL | re.I)
    for s in scripts:
        if '"SDI"' not in s or "Nettooms" not in s:
            continue
        start = s.find('{"AARS"')
        if start < 0:
            start = s.find('{"ADI"')
        if start < 0:
            continue
        depth = 0
        for i in range(start, min(start + 80000, len(s))):
            if s[i] == "{":
                depth += 1
            elif s[i] == "}":
                depth -= 1
                if depth == 0:
                    return json.loads(s[start : i + 1])
    return {}


def format_amount(raw) -> str:
    if raw is None or raw == "":
        return "—"
    try:
        n = int(float(str(raw).replace(",", ".")))
    except (TypeError, ValueError):
        return "—"
    if n == 0:
        return "0"
    sign = "−" if n < 0 else ""
    n = abs(n)
    s = f"{n:,}".replace(",", " ")
    return sign + s


def build_period_data(company_accounts: list, max_periods: int = 3) -> tuple[list[str], dict[str, dict[str, str]]]:
    """Return period_labels and {period: {code: amount}} for latest N periods."""
    sorted_accounts = sorted(
        company_accounts,
        key=lambda p: p.get("period") or "",
        reverse=True,
    )
    selected = sorted_accounts[:max_periods]
    # display oldest->newest like Belid? Belid has 2024, 2023, 2022 (newest first)
    labels = [p["period"] for p in selected]
    by_period = {}
    for p in selected:
        by_period[p["period"]] = {a["code"]: a.get("amount") for a in p.get("accounts", [])}
    return labels, by_period


def build_book_year(company_accounts: list, period_labels: list[str]) -> dict:
    by_period = {p["period"]: p for p in company_accounts}
    rows = []
    for label, row_label in [
        ("periodStart", "Startdatum"),
        ("periodEnd", "Slutdatum"),
    ]:
        values = []
        for pl in period_labels:
            p = by_period.get(pl, {})
            values.append(p.get(label) or "—")
        rows.append({"label": row_label, "values": values})
    return {"title": "Bokslutsperiod", "rows": rows}


def build_financials(company: dict, metrics_url: str) -> dict:
    accounts = company.get("companyAccounts") or []
    if not accounts:
        raise ValueError("No companyAccounts in page data")

    period_labels, by_period = build_period_data(accounts, 3)
    if not period_labels:
        raise ValueError("No accounting periods")

    tables = []
    for spec in TABLE_SPECS:
        rows = []
        for label, code in spec["rows"]:
            values = []
            for pl in period_labels:
                raw = by_period.get(pl, {}).get(code)
                values.append(format_amount(raw))
            rows.append({"label": label, "values": values})
        tables.append(
            {
                "title": spec["title"],
                "unit_note": spec["unit_note"],
                "rows": rows,
            }
        )

    org = company.get("orgnr") or company.get("customerId") or ""
    org_s = str(org).replace(" ", "")
    if len(org_s) == 10 and "-" not in org_s:
        org_s = f"{org_s[:6]}-{org_s[6:]}"

    va = company.get("visitorAddress") or company.get("legalVisitorAddress") or {}
    address = None
    if isinstance(va, dict) and va.get("addressLine"):
        address = f"{va.get('addressLine', '')}, {va.get('zipCode', '')} {va.get('postPlace', '')}".strip(", ")

    corp = company.get("corporateStructure") or {}
    corporate_note = None
    if corp.get("parentCompanyName"):
        corporate_note = f"Del av {corp['parentCompanyName']}"

    out = {
        "section_title": "Financials",
        "legal_entity": company.get("legalName") or company.get("name") or "",
        "org_nr": org_s,
        "amounts_note": "Belopp i 1000 SEK",
        "period_labels": period_labels,
        "book_year": build_book_year(accounts, period_labels),
        "tables": tables,
        "source": "Källa: UC AB",
    }
    phone = company.get("phone") or company.get("legalPhone")
    if phone:
        out["phone"] = str(phone)
    if address:
        out["address"] = address
    if corporate_note:
        out["corporate_note"] = corporate_note
    return out


def format_revenue_line(fin: dict) -> str | None:
    pl = next((t for t in fin["tables"] if t["title"] == "Resultaträkning"), None)
    if not pl:
        return None
    for row in pl["rows"]:
        if row["label"] == "Nettoomsättning":
            v = row["values"][0]
            if v and v != "—":
                period = fin["period_labels"][0]
                entity = fin.get("legal_entity", "")
                n = int(str(v).replace(" ", "").replace("−", "-"))
                if abs(n) >= 1000:
                    amount = f"SEK {n / 1000:.1f}m".replace(".0m", "m")
                else:
                    amount = f"SEK {n}k"
                return f"{amount} (FY{period[:4]} Nettoomsättning, {entity} per UC)"
    return None


def scrape_url(url: str) -> tuple[dict, dict]:
    html = fetch_html(url)
    data = parse_next_data(html)
    company = data["props"]["pageProps"]["company"]
    fin = build_financials(company, url)
    return fin, company


def main():
    with open(PORTFOLIO, encoding="utf-8") as f:
        db = json.load(f)

    companies_list = db["companies"]
    by_name = {c["company"]: c for c in companies_list}

    results = {}
    for name, url in COMPANIES:
        print(f"Scraping {name}...")
        try:
            fin, comp = scrape_url(url)
            results[name] = {"ok": True, "fin": fin, "url": url, "legal": comp.get("legalName")}
            print(f"  OK {fin['legal_entity']} periods={fin['period_labels']}")
        except Exception as e:
            results[name] = {"ok": False, "error": str(e), "url": url}
            print(f"  FAIL: {e}")
        time.sleep(1)

    debug_path = BASE / "scripts" / "allabolag_scrape_debug.json"
    with open(debug_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    updated = 0
    for name, _url in COMPANIES:
        r = results.get(name)
        if not r or not r.get("ok") or name not in by_name:
            continue
        c = by_name[name]
        c["metrics_source"] = "Allabolag"
        c["metrics_url"] = r["url"]
        c["financials"] = r["fin"]
        rev = format_revenue_line(r["fin"])
        if rev:
            c["revenue"] = rev
        updated += 1

    with open(PORTFOLIO, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"\nUpdated {updated}/{len(COMPANIES)} companies")


if __name__ == "__main__":
    main()
