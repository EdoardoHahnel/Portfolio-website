"""List Swedish portfolio companies missing Belid-style Allabolag financials."""
from __future__ import annotations

import json
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
PORTFOLIO = BASE / "portfolio_enriched.json"
PE_FIRMS = BASE / "pe_firms_database.json"

FIRMS_OF_INTEREST = {
    "EQT",
    "Verdane",
    "Triton",
    "Triton Partners",
    "Trill Impact",
    "Nordic Capital",
    "Altor",
    "Ratos",
    "Polaris",
    "Valedo Partners",
    "Adelis Equity",
    "Adelis Equity Partners",
    "Accent Equity",
    "IK Partners",
    "FSN Capital",
    "Nordstjernan",
    "Summa Equity",
    "CapMan",
    "Axcel",
    "Amplio",
    "Impilo",
    "Litorina",
    "MVI",
    "Helix Kapital",
    "Equip",
    "Fidelio Capital",
    "Celero",
    "Bure Equity",
    "EQT Ventures",
}


def is_swedish(c: dict) -> bool:
    m = (c.get("market") or "").lower()
    h = (c.get("headquarters") or "").lower()
    if m in ("sweden", "sverige") or "sweden" in h or "sverige" in h:
        return True
    if m == "nordic" and any(
        x in h for x in ("stockholm", "göteborg", "malmö", "sweden", "sverige")
    ):
        return True
    swedish_cities = (
        "stockholm", "göteborg", "gothenburg", "malmö", "malmo", "uppsala",
        "linköping", "västerås", "örebro", "helsingborg", "lund", "borås",
        "norrköping", "växjö", "karlstad", "umeå", "sundsvall", "gävle",
    )
    return any(city in h for city in swedish_cities)


def has_uc_financials(c: dict) -> bool:
    fin = c.get("financials")
    return isinstance(fin, dict) and bool(fin.get("tables"))


def firm_matches(source: str) -> bool:
    if not source:
        return False
    return source in FIRMS_OF_INTEREST or any(
        source.startswith(f) for f in FIRMS_OF_INTEREST
    )


def load_pe_swedish_not_in_enriched(enriched_names: set[str]) -> dict[str, list[str]]:
    """PE-firms DB Swedish cos that may not appear in portfolio_enriched."""
    if not PE_FIRMS.exists():
        return {}
    with open(PE_FIRMS, encoding="utf-8") as f:
        pe = json.load(f).get("pe_firms", {})
    extra: dict[str, list[str]] = {}
    for firm_key, firm in pe.items():
        for pc in firm.get("portfolio_companies") or []:
            name = (pc.get("name") or "").strip()
            country = (pc.get("country") or "").lower()
            if not name or name in enriched_names:
                continue
            if country not in ("sweden", "sverige") and "sweden" not in country:
                continue
            extra.setdefault(firm_key, []).append(name)
    return extra


def main():
    with open(PORTFOLIO, encoding="utf-8") as f:
        db = json.load(f)

    enriched_names = {c.get("company") for c in db["companies"]}
    by_firm: dict[str, dict[str, list[str]]] = {}

    for c in db["companies"]:
        src = c.get("source") or ""
        if not is_swedish(c):
            continue
        by_firm.setdefault(src, {"with_fin": [], "without_fin": []})
        name = c.get("company") or ""
        bucket = "with_fin" if has_uc_financials(c) else "without_fin"
        by_firm[src][bucket].append(name)

    pe_extra = load_pe_swedish_not_in_enriched(enriched_names)

    print("=== Swedish portfolio companies WITHOUT Belid-style Allabolag financials ===\n")
    total_missing = 0
    for firm in sorted(by_firm.keys()):
        missing = sorted(by_firm[firm]["without_fin"])
        if not missing:
            continue
        total_missing += len(missing)
        n_with = len(by_firm[firm]["with_fin"])
        print(f"{firm} ({len(missing)} missing / {len(missing) + n_with} Swedish in enriched):")
        for n in missing:
            print(f"  - {n}")
        print()

    if pe_extra:
        print("=== In pe_firms_database.json (Sweden) but NOT in portfolio_enriched ===\n")
        for firm, names in sorted(pe_extra.items()):
            print(f"{firm}:")
            for n in sorted(names):
                print(f"  - {n}")
            print()

    print(f"TOTAL missing UC financials in portfolio_enriched: {total_missing}")

    # Summary counts with financials
    print("\n=== Coverage summary (Swedish, enriched) ===")
    for firm in sorted(by_firm.keys()):
        w = len(by_firm[firm]["with_fin"])
        wo = len(by_firm[firm]["without_fin"])
        if w + wo == 0:
            continue
        pct = 100 * w / (w + wo) if (w + wo) else 0
        print(f"  {firm}: {w}/{w+wo} have financials ({pct:.0f}%)")


if __name__ == "__main__":
    main()
