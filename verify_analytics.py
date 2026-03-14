#!/usr/bin/env python3
"""
Verification script for Moderation analytics.
Queries the real page_views data from forum.db - NO fake numbers.
Outputs: unique views per day, total views per day, sample raw records.
"""
import os
import sqlite3

FORUM_DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "forum.db")


def main():
    if not os.path.exists(FORUM_DB):
        print("forum.db not found. Run the app at least once to create it.")
        print("Path checked:", FORUM_DB)
        return

    conn = sqlite3.connect(FORUM_DB)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Verify table exists and get row count
    cur.execute(
        "SELECT COUNT(*) as c FROM page_views"
    )
    total = cur.fetchone()["c"]

    print("=" * 60)
    print("ANALYTICS VERIFICATION – Data from forum.db (real, not made up)")
    print("=" * 60)
    print(f"\nTotal page view records in database: {total}")
    if total == 0:
        print("No page views logged yet.")
        conn.close()
        return

    # Unique visitors (by ip_hash) per day – last 30 days
    cur.execute("""
        SELECT date, COUNT(DISTINCT ip_hash) as unique_visitors, COUNT(*) as total_views
        FROM page_views
        WHERE ip_hash IS NOT NULL AND ip_hash != ''
        GROUP BY date
        ORDER BY date DESC
        LIMIT 30
    """)
    rows = cur.fetchall()

    print("\n--- UNIQUE VISITORS & TOTAL VIEWS PER DAY (last 30 days) ---")
    print(f"{'Date':<12} {'Unique':>8} {'Total':>8}")
    print("-" * 30)
    for r in rows:
        print(f"{r['date']:<12} {r['unique_visitors']:>8} {r['total_views']:>8}")

    # Total unique visitors (all time)
    cur.execute(
        "SELECT COUNT(DISTINCT ip_hash) as c FROM page_views WHERE ip_hash IS NOT NULL AND ip_hash != ''"
    )
    unique_all = cur.fetchone()["c"]
    print(f"\nAll-time unique visitors (by IP hash): {unique_all}")

    # Geography (if country column exists)
    try:
        cur.execute("""
            SELECT COALESCE(country, 'Unknown') as country, COUNT(DISTINCT ip_hash) as cnt
            FROM page_views
            WHERE ip_hash IS NOT NULL AND ip_hash != ''
            GROUP BY COALESCE(country, 'Unknown')
            ORDER BY cnt DESC
        """)
        geo = cur.fetchall()
        if geo:
            print("\n--- GEOGRAPHY (unique visitors by country) ---")
            for r in geo:
                print(f"  {r['country']:<20} {r['cnt']}")
    except Exception:
        pass

    # Top paths
    cur.execute("""
        SELECT path, COUNT(*) as cnt FROM page_views
        GROUP BY path ORDER BY cnt DESC LIMIT 15
    """)
    paths = cur.fetchall()
    print("\n--- TOP PAGES BY VIEWS ---")
    for p in paths:
        print(f"  {p['cnt']:>6}  {p['path']}")

    # Sample raw records (last 10) – to show real data
    cur.execute("""
        SELECT path, date, ip_hash, created_at FROM page_views
        ORDER BY created_at DESC LIMIT 10
    """)
    samples = cur.fetchall()
    print("\n--- SAMPLE RAW RECORDS (last 10) ---")
    for s in samples:
        print(f"  {s['created_at'][:19]} | {s['date']} | {s['path']:<40} | ip_hash: {s['ip_hash'] or '(empty)'}")

    print("\n--- NOTE ---")
    print("  Data: path, date, ip_hash, country (from ipapi.co geo lookup).")

    conn.close()


if __name__ == "__main__":
    main()
