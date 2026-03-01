#!/usr/bin/env python3
"""
Extract Verdane investment dates from deal sources, fuzzy-match to portfolio companies,
build entry year mapping, and update portfolio_enriched.json.
"""

import json
import re
from pathlib import Path
from difflib import SequenceMatcher

# Try rapidfuzz for better fuzzy matching, fallback to difflib
try:
    from rapidfuzz import fuzz
    FUZZY_AVAILABLE = "rapidfuzz"
except ImportError:
    FUZZY_AVAILABLE = "difflib"


def normalize_company_name(name: str) -> str:
    """Normalize company name for matching: lowercase, strip, remove common suffixes."""
    if not name or not isinstance(name, str):
        return ""
    name = name.strip().lower()
    # Remove common legal suffixes/abbreviations
    for suffix in [" ab", " as", " a/s", " oy", " inc", " gmbh", " ltd", " limited", " group", " technologies", " technology"]:
        if name.endswith(suffix):
            name = name[: -len(suffix)]
    # Remove trailing punctuation
    name = re.sub(r"\s*[.,;:]+\s*$", "", name)
    return name.strip()


def fuzzy_match_score(a: str, b: str) -> float:
    """Return similarity score 0-100. Higher is better match."""
    if not a or not b:
        return 0
    na, nb = normalize_company_name(a), normalize_company_name(b)
    if na == nb:
        return 100
    if FUZZY_AVAILABLE == "rapidfuzz":
        return fuzz.token_set_ratio(na, nb)
    return SequenceMatcher(None, na, nb).ratio() * 100


def extract_year_from_date(date_val) -> str | None:
    """Extract 4-digit year from date string or value."""
    if date_val is None:
        return None
    s = str(date_val).strip()
    # Match YYYY or YYYY-MM-DD or YYYY-MM-DD HH:MM:SS
    m = re.search(r"\b(19|20)\d{2}\b", s)
    if m:
        return m.group(0)
    return None


def load_deal_flow_deals(deal_flow_path: Path) -> dict[str, str]:
    """
    Load deal_flow_database.json, filter Verdane deals, return company -> earliest_year.
    Uses field "company" and "date".
    """
    with open(deal_flow_path, encoding="utf-8") as f:
        data = json.load(f)
    deals = data.get("deals", data) if isinstance(data, dict) else data
    if not isinstance(deals, list):
        deals = []
    mapping: dict[str, str] = {}
    verdane_keywords = ["verdane", "verdane intressenter", "verdane capital"]
    for d in deals:
        if not isinstance(d, dict):
            continue
        pe = (d.get("pe_firm") or "").lower()
        if not any(k in pe for k in verdane_keywords):
            continue
        company = (d.get("company") or "").strip()
        date_val = d.get("date")
        year = extract_year_from_date(date_val)
        if not company or not year:
            continue
        # Keep earliest year for each company
        if company not in mapping or year < mapping[company]:
            mapping[company] = year
    return mapping


def load_deals_data(deals_data_path: Path) -> dict[str, str]:
    """
    Load deals_data.json, filter Verdane deals, return company -> earliest_year.
    Uses field "TARGET COMPANY" and "DEAL DATE".
    """
    with open(deals_data_path, encoding="utf-8") as f:
        raw = f.read()
    # Replace NaN with null for valid JSON if needed
    raw = re.sub(r"\bNaN\b", "null", raw, flags=re.IGNORECASE)
    data = json.loads(raw)
    if not isinstance(data, list):
        data = []
    mapping: dict[str, str] = {}
    for d in data:
        if not isinstance(d, dict):
            continue
        investors = (d.get("INVESTORS") or "").lower()
        if "verdane" not in investors:
            continue
        company = (d.get("TARGET COMPANY") or "").strip()
        date_val = d.get("DEAL DATE")
        year = extract_year_from_date(date_val)
        if not company or not year:
            continue
        if company not in mapping or year < mapping[company]:
            mapping[company] = year
    return mapping


def merge_deal_mappings(
    deal_flow: dict[str, str],
    deals_data: dict[str, str],
) -> dict[str, str]:
    """Merge both sources, keeping earliest year per company."""
    merged = dict(deal_flow)
    for company, year in deals_data.items():
        if company not in merged or year < merged[company]:
            merged[company] = year
    return merged


# Web-researched entry years (Verdane investment announcement dates)
MANUAL_OVERRIDES: dict[str, str] = {
    "Instabee (Instabox)": "2022",
    "Instabee": "2022",
    "Instabox": "2022",
    "Meltwater": "2023",
    "momox": "2019",
    "Oda": "2022",
    "Cropster": "2024",
    "EasyPark": "2020",  # Verdane exited 2017; if still listed, use 2020 placeholder
}

def match_portfolio_to_deals(
    portfolio_companies: list[str],
    deal_companies: dict[str, str],
    threshold: float = 75,
) -> dict[str, str]:
    """
    Fuzzy match portfolio company names to deal companies.
    Returns portfolio_company -> entry_year (4-digit string).
    Uses "2020" as placeholder for no match.
    Applies MANUAL_OVERRIDES first.
    """
    result: dict[str, str] = {}
    deal_names = list(deal_companies.keys())
    for pc in portfolio_companies:
        if pc in MANUAL_OVERRIDES:
            result[pc] = MANUAL_OVERRIDES[pc]
            continue
        best_score = 0
        best_year = "2020"
        for dc in deal_names:
            score = fuzzy_match_score(pc, dc)
            if score >= threshold and score > best_score:
                best_score = score
                best_year = deal_companies[dc]
        if best_score >= threshold:
            result[pc] = best_year
        else:
            result[pc] = "2020"
    return result


def main():
    base = Path(__file__).resolve().parent
    deal_flow_path = base / "deal_flow_database.json"
    deals_data_path = base / "deals_data.json"
    portfolio_path = base / "portfolio_enriched.json"
    output_path = base / "verdane_entry_years.json"

    # Check files exist
    if not deal_flow_path.exists():
        deal_flow_path = base.parent / "deal_flow_database.json"
    if not deals_data_path.exists():
        deals_data_path = base.parent / "deals_data.json"
    if not portfolio_path.exists():
        portfolio_path = base.parent / "portfolio_enriched.json"

    print("Loading deal sources...")
    deal_flow = load_deal_flow_deals(deal_flow_path)
    deals_data = load_deals_data(deals_data_path)
    merged = merge_deal_mappings(deal_flow, deals_data)
    print(f"  deal_flow: {len(deal_flow)} Verdane deals")
    print(f"  deals_data: {len(deals_data)} Verdane deals")
    print(f"  merged: {len(merged)} unique companies with years")

    print("Loading portfolio...")
    with open(portfolio_path, encoding="utf-8") as f:
        portfolio = json.load(f)
    companies = portfolio.get("companies", [])
    verdane_companies = [c.get("company", "").strip() for c in companies if c.get("source") == "Verdane"]
    verdane_companies = [c for c in verdane_companies if c]
    print(f"  Verdane portfolio companies: {len(verdane_companies)}")

    print("Fuzzy matching...")
    entry_years = match_portfolio_to_deals(verdane_companies, merged, threshold=75)
    matched = sum(1 for y in entry_years.values() if y != "2020")
    print(f"  Matched: {matched} / {len(entry_years)}")

    # Output verdane_entry_years.json
    output = {"metadata": {"source": "deal_flow_database.json + deals_data.json", "match_count": matched, "total": len(entry_years)}, "entry_years": entry_years}
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    print(f"Wrote {output_path}")

    # Update portfolio_enriched.json
    entry_lookup = dict(entry_years)
    updated = 0
    for c in portfolio.get("companies", []):
        if c.get("source") == "Verdane" and c.get("company"):
            name = c.get("company", "").strip()
            new_entry = entry_lookup.get(name, "2020")
            if c.get("entry") != new_entry:
                c["entry"] = new_entry
                updated += 1
    with open(portfolio_path, "w", encoding="utf-8") as f:
        json.dump(portfolio, f, indent=2, ensure_ascii=False)
    print(f"Updated {updated} entry years in {portfolio_path}")


if __name__ == "__main__":
    main()
