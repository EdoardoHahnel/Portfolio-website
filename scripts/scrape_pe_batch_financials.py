"""
Scrape Allabolag financials (Belid template) for FSN, Fidelio, Helix, IK batches.
Updates pe_firms_database.json (curated firms) and portfolio_enriched.json (Helix).
"""
from __future__ import annotations

import json
import re
import time
from pathlib import Path

from scrape_allabolag_financials import (
    PORTFOLIO,
    format_revenue_line,
    scrape_url,
)

BASE = Path(__file__).resolve().parents[1]
PE_FIRMS = BASE / "pe_firms_database.json"

# (pe_firm or None, portfolio match name, url, alternate names in JSON)
BATCH = [
    # FSN Capital
    ("FSN Capital", "Omegapoint", "https://www.allabolag.se/foretag/ab-omegapoint/stockholm/f%C3%B6retagsutveckling/2KI03QGI5YEHU", []),
    ("FSN Capital", "Optigroup", "https://www.allabolag.se/foretag/optigroup-ab/m%C3%B6lndal/kontorstj%C3%A4nster/2K2JWLJI63II9", ["OptiGroup"]),
    ("FSN Capital", "Fellowmind", "https://www.allabolag.se/foretag/fellowmind-holding-ab/malm%C3%B6/f%C3%B6retagsutveckling/2KH3BPFI5YEHU", []),
    ("FSN Capital", "Holmbergs Safety System", "https://www.allabolag.se/foretag/holmbergs-safety-system-holding-ab/halmstad/kontorstj%C3%A4nster/2K3ZJ16I63II9", []),
    ("FSN Capital", "ViaCon", "https://www.allabolag.se/foretag/viacon-group-ab-publ/-/kontorstj%C3%A4nster/2KHI0QTI63II9", []),
    ("FSN Capital", "Seriline", "https://www.allabolag.se/foretag/seriline-group-ab/bromma/kontorstj%C3%A4nster/2KHUEHPI63II9", []),
    ("FSN Capital", "Nordlo", "https://www.allabolag.se/foretag/nordlo-group-ab/stockholm/kontorstj%C3%A4nster/2KH20G9I63II9", []),
    # Fidelio Capital
    ("Fidelio Capital", "Newsec", "https://www.allabolag.se/foretag/newsec-ab/stockholm/f%C3%B6retagsutveckling/2K246EKI5YEHU", []),
    ("Fidelio Capital", "KEYTO", "https://www.allabolag.se/foretag/keyto-group-ab-publ/stockholm/kontorstj%C3%A4nster/2KI3H34I63II9", []),
    ("Fidelio Capital", "ibinder", "https://www.allabolag.se/foretag/ibinder-ab/stockholm/internet-konsulter-operat%C3%B6rer/2K1OXZCI5YFHL", []),
    ("Fidelio Capital", "Odevo", "https://www.allabolag.se/bokslut/odevo-ab/stockholm/f%C3%B6retagsutveckling/2KH8VJFI5YEHU", []),
    ("Fidelio Capital", "Vimian", "https://www.allabolag.se/foretag/vimian-group-ab/stockholm/kontorstj%C3%A4nster/2KHJG1NI63II9", []),
    ("Fidelio Capital", "Greenfood", "https://www.allabolag.se/foretag/greenfood-ab-publ/helsingborg/f%C3%B6retagsutveckling/2KGCSOWI5YEHU", []),
    ("Fidelio Capital", "AniCura", "https://www.allabolag.se/5568541386/bokslut", []),
    ("Fidelio Capital", "Lyko", "https://www.allabolag.se/5569758229/lyko-group-ab-publ", []),
    # Helix Kapital (portfolio_enriched)
    (None, "L5 Navigation", "https://www.allabolag.se/foretag/l5-navigation-systems-ab/lule%C3%A5/teknikkonsulter/2K3T4N4I5YHXW", []),
    (None, "Trinax", "https://www.allabolag.se/5567994602/bokslut", []),
    (None, "Sacpro", "https://www.allabolag.se/foretag/sacpro-group-ab/falun/kontorstj%C3%A4nster/2KIUAIBI63II9", []),
    (None, "VisionSense Technologies", "https://www.allabolag.se/5592360118/visionsense-technologies-ab", []),
    (None, "Revivo Group", "https://www.allabolag.se/foretag/revivo-group-ab/r%C3%B6nn%C3%A4ng/kontorstj%C3%A4nster/2KIWY09I63II9", []),
    # IK Partners
    ("IK Partners", "Advania", "https://www.allabolag.se/foretag/advania-sverige-ab/stockholm/telekommunikation-teleoperat%C3%B6rer/2JZK6EKI5YI0B", []),
    ("IK Partners", "Truesec", "https://www.allabolag.se/5566908074/bokslut", []),
    ("IK Partners", "Advisense", "https://www.allabolag.se/bokslut/advisense-ab/stockholm/finansbolag-finansiella-tj%C3%A4nster/2KG6C6LI5YE9Q", []),
    ("IK Partners", "Responda Group", "https://www.allabolag.se/foretag/responda-group-ab/kista/kontor-och-teletj%C3%A4nster/2K2RQFNI63II6", []),
    ("IK Partners", "Sitevision", "https://www.allabolag.se/5566247747/bokslut", []),
    ("IK Partners", "Tecomatic", "https://www.allabolag.se/5563806420/tecomatic-ab", []),
]


def norm_name(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def names_match(pc_name: str, target: str, aliases: list[str]) -> bool:
    keys = {norm_name(target)} | {norm_name(a) for a in aliases}
    return norm_name(pc_name) in keys


def apply_to_pe_pc(pc: dict, fin: dict, url: str) -> None:
    pc["metrics_source"] = "Allabolag"
    pc["metrics_url"] = url
    pc["financials"] = fin
    rev = format_revenue_line(fin)
    if rev:
        pc["revenue"] = rev


def apply_to_enriched_company(c: dict, fin: dict, url: str) -> None:
    c["metrics_source"] = "Allabolag"
    c["metrics_url"] = url
    c["financials"] = fin
    rev = format_revenue_line(fin)
    if rev:
        c["revenue"] = rev


def main():
    with open(PE_FIRMS, encoding="utf-8") as f:
        pe_db = json.load(f)

    with open(PORTFOLIO, encoding="utf-8") as f:
        port_db = json.load(f)

    enriched_by_name = {c["company"]: c for c in port_db.get("companies", [])}
    results = {}

    for firm, match_name, url, aliases in BATCH:
        label = f"{firm or 'Helix'}:{match_name}"
        print(f"Scraping {label}...")
        try:
            fin, comp = scrape_url(url)
            final_url = url
            results[label] = {
                "ok": True,
                "legal": fin.get("legal_entity"),
                "periods": fin.get("period_labels"),
                "url": final_url,
            }
            print(f"  OK {fin.get('legal_entity')} {fin.get('period_labels')}")

            if firm:
                pe_firm = pe_db.get("pe_firms", {}).get(firm)
                if not pe_firm:
                    raise ValueError(f"PE firm not found: {firm}")
                found = False
                for pc in pe_firm.get("portfolio_companies", []):
                    if names_match(pc.get("name", ""), match_name, aliases):
                        apply_to_pe_pc(pc, fin, final_url)
                        found = True
                        break
                if not found:
                    raise ValueError(f"Portfolio company not found: {match_name} in {firm}")
            else:
                if match_name not in enriched_by_name:
                    raise ValueError(f"Not in portfolio_enriched: {match_name}")
                apply_to_enriched_company(enriched_by_name[match_name], fin, final_url)

        except Exception as e:
            results[label] = {"ok": False, "error": str(e), "url": url}
            print(f"  FAIL {e}")
        time.sleep(1)

    with open(PE_FIRMS, "w", encoding="utf-8") as f:
        json.dump(pe_db, f, ensure_ascii=False, indent=2)
        f.write("\n")

    with open(PORTFOLIO, "w", encoding="utf-8") as f:
        json.dump(port_db, f, ensure_ascii=False, indent=2)
        f.write("\n")

    debug = BASE / "scripts" / "allabolag_pe_batch_debug.json"
    with open(debug, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    ok = sum(1 for r in results.values() if r.get("ok"))
    print(f"\nDone: {ok}/{len(BATCH)} succeeded")


if __name__ == "__main__":
    main()
