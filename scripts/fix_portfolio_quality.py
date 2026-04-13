#!/usr/bin/env python3
"""
One-off data quality fixes for portfolio_enriched.json (portfolio tab / API).
Run from repo root: python scripts/fix_portfolio_quality.py
"""
from __future__ import annotations

import json
import os
from copy import deepcopy

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "portfolio_enriched.json")


def patch_company(c: dict, updates: dict) -> None:
    for k, v in updates.items():
        if v is None:
            continue
        c[k] = v


def main() -> None:
    with open(PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    companies: list = data["companies"]
    original_len = len(companies)

    # --- Remove duplicate / bad rows ---
    filtered: list = []
    for c in companies:
        if c.get("source") == "Triton" and c.get("fund") == "Triton Fund":
            continue  # Duplicate batch with wrong generic data
        if c.get("source") == "Adelis Equity" and c.get("company") in (
            "SÄKRA",
            "KANARI",
            "AXENTIA",
        ):
            continue  # Duplicates of Säkra, Kanari, Axentia
        if (
            c.get("source") == "Verdane"
            and c.get("company") == "Meltwater"
        ):
            continue  # Investment via Fountain Venture; Altor holds operating co
        filtered.append(c)
    companies = filtered
    data["companies"] = companies

    # Key: (company, source) -> field updates
    patches: dict[tuple[str, str], dict] = {}

    def add(company: str, source: str, **kwargs) -> None:
        patches[(company, source)] = {k: v for k, v in kwargs.items() if v is not None}

    # JSON field "company" cannot be set via add() — use renames after patches
    company_renames: list[tuple[str, str, str]] = [
        ("EasyPark", "Verdane", "Arrive (formerly EasyPark Group)"),
    ]

    # ----- ALTOR -----
    add(
        "Stegra",
        "Altor",
        sector="Industrial / Climate Tech",
        fund="Fund V, Fund VI & ACT",
        headquarters="Boden, Sweden",
        detailed_description=(
            "Stegra (formerly H2 Green Steel) is building a large-scale green steel plant in Boden, northern Sweden, "
            "using green hydrogen to decarbonise steel production. Altor backs the company across Fund V, Fund VI and ACT. "
            "The project targets industrial-scale fossil-free steel for automotive, energy and construction customers."
        ),
    )
    add(
        "Vianode",
        "Altor",
        headquarters="Herøya / Kristiansand area, Norway",
        market="Norway",
        detailed_description=(
            "Vianode produces synthetic anode graphite for lithium-ion batteries at industrial scale, with operations "
            "centred on Herøya, Norway. The company is jointly owned by Altor (~30%), Elkem (~40%) and Hydro (~30%) — "
            "a minority PE position for Altor alongside strategic industrial partners."
        ),
    )
    add(
        "CCM Hockey",
        "Altor",
        detailed_description=(
            "CCM Hockey is an iconic global hockey equipment brand: the company traces its roots to 1899 (hockey equipment "
            "from 1905). Altor partnered with CCM in 2024 to support the brand's growth and geographic expansion. "
            "The group equips players worldwide with skates, sticks, protective gear and apparel."
        ),
    )
    add(
        "Gunnebo",
        "Altor",
        detailed_description=(
            "Gunnebo provides security solutions for cash management, safe storage, entrance control and integrated security. "
            "The company was taken private in 2020 jointly by Altor and Stena Adactum (co-owners). "
            "Gunnebo serves banks, retail, critical infrastructure and the public sector globally."
        ),
    )
    add(
        "Meltwater",
        "Altor",
        headquarters="San Francisco, California, USA",
        market="United States / Global",
        fund="Fund III & Fund VI",
        detailed_description=(
            "Meltwater is a global media intelligence and social listening platform (listed; Altor participated in the "
            "2019 take-private alongside other investors, with Fund III and Fund VI involvement in the capital structure). "
            "Headquartered in San Francisco. The company serves PR, marketing and insights teams worldwide."
        ),
    )
    add(
        "Haarslev Industries",
        "Altor",
        headquarters="Harslev, Denmark",
        detailed_description=(
            "Haarslev Industries designs and manufactures processing equipment for the food, feed and waste industries. "
            "Headquartered in Harslev, Denmark (near Odense). The company supplies rendering, pet food, fish meal and biomass solutions."
        ),
    )
    add(
        "Norican group",
        "Altor",
        headquarters="Taastrup, Denmark",
        detailed_description=(
            "Norican Group is a global supplier of metallurgical equipment (foundry, metal surface treatment, additive manufacturing). "
            "Headquartered in Taastrup, Denmark. Brands include DISA, Wheelabrator, Italpresse Gauss and StrikoWestphal."
        ),
    )
    add(
        "Flex IT",
        "Altor",
        market="Netherlands",
        headquarters="Leiden, Netherlands",
        detailed_description=(
            "Flex IT (formerly Infotheek) is a Dutch IT lifecycle and circular-economy company: refurbishment, reuse and "
            "responsible recycling of hardware. Founded in 1991 and headquartered in Leiden, Netherlands."
        ),
    )
    add(
        "FLSmidth",
        "Altor",
        status="Active (minority)",
        detailed_description=(
            "FLSmidth is a publicly listed company on Nasdaq Copenhagen (global mining and cement equipment). "
            "Altor holds an approximate ~15% minority stake — a strategic minority investment, not a traditional buyout portfolio company."
        ),
    )
    add(
        "Iyuno",
        "Altor",
        headquarters="Burbank, California, USA",
        detailed_description=(
            "Iyuno is a global media localisation and dubbing company. Global headquarters in Burbank, California. "
            "The group grew in part from the legacy of BTI Studios (Sweden); Altor's investment dates from 2017 (Fund IV)."
        ),
    )
    add(
        "Orchid Orthopedic Solutions",
        "Altor",
        status="Minority (majority sold 2019)",
        detailed_description=(
            "Orchid Orthopedic Solutions manufactures orthopaedic implants and instruments. Nordic Capital acquired a majority "
            "stake from Altor in 2019; Altor retained a minority position. US operations with global OEM customers."
        ),
    )
    add(
        "Rossignol Group",
        "Altor",
        detailed_description=(
            "Rossignol Group is a global winter sports company. Its brand portfolio includes Rossignol, Dynastar, Lange, Look, "
            "Kerma and other ski, boot and binding brands — equipping skiers and snowboarders worldwide."
        ),
    )

    # ----- EQT -----
    add(
        "Anticimex",
        "EQT",
        fund="EQT VI (2012); EQT Future (from 2021)",
        entry="2012",
        detailed_description=(
            "Anticimex is a leading global pest control and property-care group, founded in Sweden. EQT first invested in 2012 "
            "via EQT VI; the holding later moved into EQT Future (from 2021). The company operates SMART digital monitoring and "
            "traditional services across 20+ countries."
        ),
    )
    add(
        "Trescal",
        "EQT",
        sector="Testing, Inspection & Calibration",
        detailed_description=(
            "Trescal is the world's largest independent calibration and measurement-services company — not transport or logistics. "
            "It ensures test and measurement equipment meets accuracy and regulatory standards across pharma, aerospace, automotive "
            "and other industries. EQT invested in 2023 to support global consolidation."
        ),
    )

    # ----- NORDIC CAPITAL -----
    add(
        "Orchid Orthopedic Solutions",
        "Nordic Capital",
        entry="2019",
        fund="Nordic Capital Fund IX",
        detailed_description=(
            "Orchid Orthopedic Solutions — Nordic Capital acquired the majority stake from Altor in 2019 (Fund IX), not 2021. "
            "Contract manufacturer of orthopaedic implants and instruments for OEMs and hospitals."
        ),
    )
    add(
        "Cary Group",
        "Nordic Capital",
        sector="Automotive services",
        detailed_description=(
            "Cary Group is the European market leader in vehicle glass repair and replacement (windscreens), with brands such as "
            "Ryds Bilglas and National Windscreens. CVC co-owns Cary Group alongside Nordic Capital from 2022 — a joint control structure."
        ),
    )
    add(
        "Trustly",
        "Nordic Capital",
        fund="Nordic Capital Fund IX",
    )
    add(
        "Autocirc",
        "Nordic Capital",
        sector="Automotive / Circular economy",
        detailed_description=(
            "Autocirc is a circular automotive aftermarket company: it dismantles end-of-life vehicles and resells used parts, "
            "extending component life and reducing waste. Not an industrial automation business."
        ),
    )

    # ----- TRITON (after duplicate removal): fix wrong first-pass narratives -----
    add(
        "LeDap",
        "Triton",
        sector="Consumer / Sports",
        market="Europe",
        description=(
            "LeDap is Europe's leading padel group — indoor and outdoor padel clubs, events and related services. "
            "Triton invested in 2021 to consolidate and grow the padel market across Europe."
        ),
        detailed_description=(
            "LeDap is Europe's leading padel platform — operating and franchising padel venues and building the sport's infrastructure. "
            "Triton backed the group in 2021. (Not related to Nordic HR/payroll providers with a similar name.)"
        ),
    )
    add(
        "SITS",
        "Triton",
        sector="Technology / Cybersecurity",
        market="DACH & Benelux",
        description=(
            "SITS is a leading independent cyber security services platform in the DACH and Benelux regions — not a furniture manufacturer."
        ),
        detailed_description=(
            "SITS Group delivers managed security services, consulting and SOC capabilities for mid-market and enterprise clients "
            "in the DACH and Benelux markets. Triton invested in 2021."
        ),
    )
    add(
        "Geia Group",
        "Triton",
        sector="Industrial / Infrastructure services",
        description=(
            "Geia Group is a leading Nordic provider of infrastructure and technical services for telecommunications, energy and "
            "industrial customers (fiber, mobile, electrical grids) — not a food distributor."
        ),
        detailed_description=(
            "Geia Group provides installation, maintenance and construction services for telecom, energy and industrial infrastructure "
            "across the Nordics — supporting fibre roll-out, 5G and related projects."
        ),
    )
    add(
        "Inwerk GmbH",
        "Triton",
        sector="Industrial / Office furniture",
    )
    add(
        "Sunweb Group",
        "Triton",
        sector="Consumer / Travel",
    )

    # ----- VERDANE — HQ corrections (explicit overrides) -----
    verdane_hq = {
        "momox": "Berlin, Germany",
        "Booksy": "Warsaw, Poland (HQ); US office Chicago",
        "smava": "Berlin, Germany",
        "fiskaly": "Vienna, Austria",
        "indevis": "Munich, Germany",
        "Pflegecampus": "Germany",
        "Wunderflats": "Berlin, Germany",
        "Urban Sports Club": "Berlin, Germany",
        "Muegge": "Reichelsheim, Germany",
        "Baum und Pferdgarten": "Copenhagen, Denmark",
    }
    for name, hq in verdane_hq.items():
        add(name, "Verdane", headquarters=hq)

    add(
        "EasyPark",
        "Verdane",
        headquarters="Stockholm, Sweden (group HQ; global brand Arrive from 2025)",
        detailed_description=(
            "EasyPark Group rebranded to Arrive in 2025 as a unified global mobility platform. Verdane backs the group "
            "for digital parking and mobility; Nordic HQ with international operations."
        ),
    )

    # ----- SUMMA EQUITY -----
    add(
        "Axion Biosystems",
        "Summa Equity",
        headquarters="Atlanta, Georgia, USA",
        detailed_description=(
            "Axion Biosystems develops live-cell analysis instruments for drug discovery and cell therapy — headquartered in Atlanta, Georgia, USA."
        ),
    )
    add(
        "LOGEX",
        "Summa Equity",
        headquarters="Amsterdam, Netherlands",
        detailed_description=(
            "LOGEX provides healthcare data analytics and financial solutions for hospitals. Headquartered in Amsterdam, Netherlands. "
            "Thoma Bravo invested alongside Summa in 2023 as a significant co-investor."
        ),
    )
    add(
        "FAST LTA",
        "Summa Equity",
        headquarters="Munich, Germany",
        detailed_description=(
            "FAST LTA provides long-term digital archiving and preservation solutions for regulated industries; headquartered in Munich, Germany."
        ),
    )
    add(
        "Bollegraaf",
        "Summa Equity",
        headquarters="Appingedam, Netherlands",
        detailed_description=(
            "Bollegraaf is a leading recycling and waste-handling equipment manufacturer, headquartered in Appingedam, Groningen province, Netherlands."
        ),
    )
    add(
        "Tibber",
        "Summa Equity",
        headquarters="Førde, Norway",
        detailed_description=(
            "Tibber is a Norwegian digital energy retailer and smart-home energy app, headquartered in Førde, Norway."
        ),
    )
    add(
        "Logpoint",
        "Summa Equity",
        headquarters="Copenhagen, Denmark",
        detailed_description=(
            "Logpoint is a Danish cybersecurity/SIEM software company headquartered in Copenhagen. Thoma Bravo is a major co-investor alongside Summa."
        ),
    )

    # ----- RATOS -----
    add(
        "kvd",
        "Ratos",
        market="Sweden",
        headquarters="Stockholm, Sweden",
        detailed_description=(
            "kvd (Kvarndammen / KVD) is a Swedish online marketplace for used cars and related services — headquartered in Stockholm, Sweden, not Oslo."
        ),
    )
    add(
        "Plantasjen",
        "Ratos",
        status="Active (post-restructuring)",
        detailed_description=(
            "Plantasjen is a Nordic garden retail chain. The group entered court-supervised reconstruction in August 2024; "
            "proceedings concluded in February 2025 — verify latest financial disclosures when assessing the holding."
        ),
    )
    add(
        "ALEIDO",
        "Ratos",
        entry="2023",
        detailed_description=(
            "ALEIDO was spun out from Semcon in October 2023 after Ratos acquired Semcon in 2022 — it was not acquired separately by Ratos; "
            "it is the former Product Information & Technical Communication division."
        ),
    )

    # ----- AXCEL -----
    add(
        "Bekk",
        "Axcel",
        entry="2025",
        detailed_description=(
            "Bekk is a leading Norwegian technology consultancy (digital transformation, software, agile delivery). "
            "Entry year shown as 2025 pending final public disclosure — verify against Axcel announcements."
        ),
    )

    # Apply patches
    for c in companies:
        key = (c.get("company"), c.get("source"))
        if key in patches:
            patch_company(c, patches[key])

    for old_name, source, new_name in company_renames:
        for c in companies:
            if c.get("company") == old_name and c.get("source") == source:
                c["company"] = new_name
                break

    removed = original_len - len(companies)
    data["metadata"]["last_updated"] = "2026-04-13"
    data["metadata"]["portfolio_quality_fix"] = (
        f"Removed {removed} duplicate/erroneous rows; curated descriptions, HQs, funds"
    )
    data["metadata"]["total_companies"] = len(companies)

    with open(PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Done. Companies: {original_len} -> {len(companies)} (removed {removed})")


if __name__ == "__main__":
    main()
