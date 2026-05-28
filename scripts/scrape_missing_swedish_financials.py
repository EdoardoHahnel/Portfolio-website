"""
Auto-lookup Allabolag URLs and scrape Belid-template financials for Swedish
portfolio companies in portfolio_enriched.json that do not yet have UC tables.
"""
from __future__ import annotations

import json
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from scrape_allabolag_financials import PORTFOLIO, format_revenue_line
from scrape_celero_eqt_financials import resolve_and_scrape, search_allabolag, try_scrape

from audit_swedish_missing_financials import (
    firm_matches,
    has_uc_financials,
    is_swedish,
)

BASE = Path(__file__).resolve().parents[1]
CHECKPOINT = BASE / "scripts" / "scrape_missing_swedish_checkpoint.json"
DEBUG_OUT = BASE / "scripts" / "allabolag_missing_swedish_debug.json"

# No meaningful Swedish Allabolag operating entity
SKIP_COMPANIES = frozenset({
    "Vyntra",
    "Restolution",
})


def build_search_query(company: dict) -> str:
    name = (company.get("company") or "").strip()
    name = re.sub(r"\s*\([^)]*\)", "", name).strip()
    name = re.sub(r"\s*formerly\s+.+$", "", name, flags=re.I).strip()
    low = name.lower()
    if low.endswith(" ab") or low.endswith(" group") or low.endswith(" (publ)"):
        return name
    if "group" in low.split():
        return f"{name} ab"
    return f"{name} ab"


def resolve_by_search(name: str, search_q: str) -> dict:
    slug = (search_q.split() or [name])[0]
    urls_to_try: list[str] = []
    try:
        urls_to_try.extend(search_allabolag(search_q, slug))
    except Exception:
        pass
    urls_to_try.sort(
        key=lambda u: (
            "befattningar" in u or u.endswith("/verksamhet"),
            "foretag" not in u,
        ),
    )
    last_err = None
    for url in urls_to_try[:12]:
        try:
            fin, comp, final_url = try_scrape(url)
            return {
                "ok": True,
                "fin": fin,
                "url": final_url,
                "legal": comp.get("legalName"),
            }
        except Exception as e:
            last_err = e
            continue
    return {"ok": False, "error": str(last_err), "url": ""}


def resolve_company(name: str, company: dict, search_q: str) -> dict:
    metrics_url = (company.get("metrics_url") or "").strip()
    if metrics_url and "allabolag.se" in metrics_url:
        r = resolve_and_scrape(name, metrics_url, search_q)
        if r.get("ok"):
            return r
    return resolve_by_search(name, search_q)


def load_checkpoint() -> dict:
    if CHECKPOINT.exists():
        with open(CHECKPOINT, encoding="utf-8") as f:
            return json.load(f)
    return {"results": {}, "done_names": []}


def save_checkpoint(cp: dict) -> None:
    with open(CHECKPOINT, "w", encoding="utf-8") as f:
        json.dump(cp, f, ensure_ascii=False, indent=2)


def save_portfolio(db: dict) -> None:
    db["metadata"]["last_updated"] = time.strftime("%Y-%m-%d")
    with open(PORTFOLIO, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
        f.write("\n")


def apply_one(by_name: dict, name: str, r: dict) -> bool:
    if not r.get("ok") or not r.get("fin"):
        return False
    c = by_name.get(name)
    if not c:
        return False
    c["metrics_source"] = "Allabolag"
    c["metrics_url"] = r["url"]
    c["financials"] = r["fin"]
    rev = format_revenue_line(r["fin"])
    if rev:
        c["revenue"] = rev
    return True




def apply_checkpoint_to_portfolio(db: dict, by_name: dict, results: dict) -> int:
    """Apply checkpoint ok+fin to companies still missing financials.tables."""
    applied = 0
    for name, r in (results or {}).items():
        if not r or not r.get("ok") or not r.get("fin"):
            continue
        c = by_name.get(name)
        if not c or has_uc_financials(c):
            continue
        if apply_one(by_name, name, r):
            applied += 1
    if applied:
        save_portfolio(db)
        print(f"Checkpoint applied fin to {applied} companies", flush=True)
    return applied

def main():
    with open(PORTFOLIO, encoding="utf-8") as f:
        db = json.load(f)

    companies_list = db["companies"]
    by_name = {c["company"]: c for c in companies_list}
    cp = load_checkpoint()
    results: dict = cp.get("results") or {}
    apply_checkpoint_to_portfolio(db, by_name, results)

    targets: list[tuple[str, dict]] = []
    for c in companies_list:
        name = (c.get("company") or "").strip()
        if not name or name in SKIP_COMPANIES:
            continue
        if not firm_matches(c.get("source") or ""):
            continue
        if not is_swedish(c):
            continue
        if has_uc_financials(c):
            continue
        targets.append((name, c))

    print(f"Targets: {len(targets)} Swedish companies without UC financials", flush=True)
    ok_count = 0
    fail_count = 0

    for i, (name, company) in enumerate(targets, 1):
        source = company.get("source") or ""
        search_q = build_search_query(company)
        print(f"[{i}/{len(targets)}] {name} ({source}) q={search_q!r}", flush=True)

        r = resolve_company(name, company, search_q)
        r["source"] = source
        entry: dict = {
            "ok": r.get("ok"),
            "url": r.get("url"),
            "legal": r.get("legal"),
            "error": r.get("error"),
            "source": source,
            "periods": (r.get("fin") or {}).get("period_labels"),
        }
        if r.get("ok") and r.get("fin"):
            entry["fin"] = r["fin"]
        results[name] = entry

        if r.get("ok"):
            if apply_one(by_name, name, r):
                ok_count += 1
                save_portfolio(db)
                ent = r["fin"].get("legal_entity", "")
                print(f"  OK {ent} {r['fin'].get('period_labels')}", flush=True)
            else:
                print(f"  OK scraped but not in by_name: {name}", flush=True)
        else:
            fail_count += 1
            print(f"  FAIL {r.get('error')}", flush=True)

        cp["results"] = results
        save_checkpoint(cp)
        time.sleep(1.2)

    with open(DEBUG_OUT, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    failed = [n for n, v in results.items() if not v.get("ok")]
    print(f"\nDone. OK={ok_count} FAIL={fail_count} (this run targets={len(targets)})", flush=True)
    if failed:
        print(f"Failed ({len(failed)}):", ", ".join(failed[:40]), ("..." if len(failed) > 40 else ""), flush=True)


if __name__ == "__main__":
    main()
