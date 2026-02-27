import os
import sqlite3
from datetime import datetime, timezone
from functools import wraps

from flask import (
    Blueprint,
    jsonify,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from werkzeug.security import check_password_hash, generate_password_hash


FORUM_DB_PATH = os.path.join(os.getcwd(), "forum.db")
DEFAULT_CATEGORIES = [
    "Investment Banking",
    "Private Equity",
    "Corporate Finance",
    "M&A",
    "Recruiting",
    "Salaries",
    "Technical Help",
    "Career",
    "Work-Life Balance",
    "Industry Insights",
]

forum_bp = Blueprint("forum", __name__)


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


def _get_db():
    conn = sqlite3.connect(FORUM_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_forum_db():
    conn = _get_db()
    cur = conn.cursor()

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'Analyst',
            experience_level TEXT NOT NULL DEFAULT '0-2 years',
            is_admin INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS threads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT NOT NULL,
            tags TEXT NOT NULL DEFAULT '',
            upvotes INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            is_deleted INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            thread_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            parent_id INTEGER,
            content TEXT NOT NULL,
            upvotes INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            is_deleted INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY (thread_id) REFERENCES threads (id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (parent_id) REFERENCES comments (id)
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS thread_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            thread_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(thread_id, user_id),
            FOREIGN KEY (thread_id) REFERENCES threads (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS comment_votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            comment_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(comment_id, user_id),
            FOREIGN KEY (comment_id) REFERENCES comments (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reporter_user_id INTEGER NOT NULL,
            content_type TEXT NOT NULL,
            content_id INTEGER NOT NULL,
            reason TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'open',
            created_at TEXT NOT NULL,
            resolved_at TEXT,
            resolved_by INTEGER,
            FOREIGN KEY (reporter_user_id) REFERENCES users (id),
            FOREIGN KEY (resolved_by) REFERENCES users (id)
        )
        """
    )
    cur.execute("CREATE INDEX IF NOT EXISTS idx_threads_created ON threads(created_at DESC)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_threads_category ON threads(category)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_comments_thread ON comments(thread_id)")

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS email_signups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL
        )
        """
    )
    cur.execute("CREATE INDEX IF NOT EXISTS idx_email_signups_created ON email_signups(created_at DESC)")

    conn.commit()
    conn.close()

    _seed_forum_data()


def _seed_forum_data():
    """Seed forum with Admin Post, Swedish threads and comments if DB is empty."""
    conn = _get_db()
    cur = conn.cursor()
    row = cur.execute("SELECT COUNT(*) AS c FROM threads").fetchone()
    if row["c"] > 0:
        conn.close()
        return

    now = _now_iso()

    seed_users = [
        ("Portfoljbolagen", "changeme123", "Admin", "10+ years", 1),
        ("Erik_Lindqvist", "changeme123", "Associate", "2-4 years", 0),
        ("Sofia_Andersson", "changeme123", "Analyst", "0-2 years", 0),
        ("Marcus_Berg", "changeme123", "VP", "5-8 years", 0),
        ("Anna_Karlsson", "changeme123", "Analyst", "0-2 years", 0),
        ("Johan_Nilsson", "changeme123", "Principal", "8-10 years", 0),
    ]

    user_ids = {}
    for username, pw, role, exp, is_admin in seed_users:
        cur.execute(
            "INSERT OR IGNORE INTO users (username, password_hash, role, experience_level, is_admin, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (username, generate_password_hash(pw), role, exp, is_admin, now),
        )
        r = cur.execute("SELECT id FROM users WHERE LOWER(username)=LOWER(?)", (username,)).fetchone()
        if r:
            user_ids[username] = r["id"]

    admin_id = user_ids.get("Portfoljbolagen") or list(user_ids.values())[0]

    threads_data = [
        (
            admin_id,
            "Admin Post: Gratis modelleringsmaterial – LBO, DCF & PDF-föreläsningar",
            """Hej,

Portföljbolagen erbjuder nu gratis modelleringsmaterial till alla som vill förbättra sina färdigheter inom investment banking och private equity.

**Vad du får:**
• Excel-mallar: LBO-modeller, DCF-modeller och 3-statement-modeller
• PDF-föreläsningar om finansiell modellering (grundläggande till avancerad nivå)
• Praktiska fallstudier och övningsfiler

Fyll i din e-postadress i formuläret nedan så skickar vi materialet till dig. Inget krav på registrering eller betalning – det är helt gratis.

Välkommen!
/ Portföljbolagen""",
            "Technical Help",
            "admin-signup, modelling, LBO, DCF, excel, resources",
            12,
        ),
        (
            user_ids.get("Erik_Lindqvist", admin_id),
            "Nordisk PE-marknad 2025 – era åsikter?",
            "Jag jobbar som associate på en nordisk PE-fond och undrar vad andra tycker om marknadsläget just nu. Exit-möjligheterna har blivit svårare, räntan påverkar värderingarna – hur ser ni på kommande 12–18 månader? Särskilt intresserad av erfarenheter från både buy- och sell-side.",
            "Industry Insights",
            "private equity, nordic, outlook",
            8,
        ),
        (
            user_ids.get("Sofia_Andersson", admin_id),
            "LBO-case till intervju – tips på bra källor",
            "Ska snart göra LBO-case under intervju. Har ni bra tips på var man hittar övningsfall eller mallar? Brukar ni använda någon specifik struktur (Sources & Uses, Debt schedule etc.)? Tack på förhand!",
            "Recruiting",
            "LBO, case, intervju, recruiting",
            5,
        ),
        (
            user_ids.get("Marcus_Berg", admin_id),
            "Erfarenheter från M&A-process – säljare vs köpare",
            "Har varit med i flera M&A-processer från båda sidor. Vill dela några lärdomar om hur man strukturerar en due diligence, vad köpare ofta missar och vad säljare bör vara förberedda på. Är det intresse kan jag skriva ett längre inlägg med konkreta punkter.",
            "M&A",
            "M&A, due diligence, process",
            14,
        ),
        (
            user_ids.get("Anna_Karlsson", admin_id),
            "Lönenivåer för analyst i Stockholm – 2025",
            "Någon som har koll på typiska base + bonus för förstaårs analyst i Stockholm (IB/PE)? Hört olika siffror och undrar vad som är rimligt nu. Antar att Big 4 och boutiquer skiljer sig åt.",
            "Salaries",
            "lön, analyst, stockholm, 2025",
            22,
        ),
        (
            user_ids.get("Johan_Nilsson", admin_id),
            "DCF vs multipler – när väljer ni vad?",
            "I min erfarenhet används DCF mer i growth-bolag och multipler i tillgångstunga/cykliska. Men det varierar mycket mellan bolag och förvaltare. Hur resonerar ni när ni väljer valueringsmetod? Några tumregler som fungerar bra?",
            "Corporate Finance",
            "DCF, valuation, multipler",
            9,
        ),
    ]

    for user_id, title, content, category, tags, upvotes in threads_data:
        cur.execute(
            """INSERT INTO threads (user_id, title, content, category, tags, upvotes, created_at, updated_at, is_deleted)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)""",
            (user_id, title, content, category, tags, upvotes, now, now),
        )

    cur.execute("SELECT id FROM threads ORDER BY id")
    thread_ids = [r["id"] for r in cur.fetchall()]
    admin_post_id = thread_ids[0] if thread_ids else None
    nordic_id = thread_ids[1] if len(thread_ids) > 1 else None
    lbo_id = thread_ids[2] if len(thread_ids) > 2 else None
    ma_id = thread_ids[3] if len(thread_ids) > 3 else None
    salary_id = thread_ids[4] if len(thread_ids) > 4 else None
    dcf_id = thread_ids[5] if len(thread_ids) > 5 else None

    comments_data = [
        (admin_post_id, user_ids.get("Erik_Lindqvist", admin_id), None, "Stort tack! Ser fram emot att få materialet."),
        (admin_post_id, user_ids.get("Sofia_Andersson", admin_id), None, "Perfekt timing inför mina intervjuer. Tack!"),
        (nordic_id, user_ids.get("Marcus_Berg", admin_id), None, "Håller med – det känns som att 2025 blir ett väntande år. Mycket kapital som sitter stilla. Jag tror att add-on acquisitions blir viktigare för att skapa värde."),
        (nordic_id, user_ids.get("Johan_Nilsson", admin_id), None, "Exit via strategisk köpare känns mer realistiskt nu än via secondary. IPO-marknaden är fortfarande död i Norden."),
        (lbo_id, user_ids.get("Marcus_Berg", admin_id), None, "Rekommenderar Rosenbaum – det finns bra Excel-mallar som följer med boken. Annars kan du kolla M&I eller WSO, de har ofta övningsfall."),
        (lbo_id, user_ids.get("Erik_Lindqvist", admin_id), None, "Strukturera tydligt: Deal overview → Investment thesis → Sources & Uses → Returns. Håll Debt schedule enkel – senior + mezz räcker för de flesta case."),
        (ma_id, user_ids.get("Erik_Lindqvist", admin_id), None, "Bra initiativ! DD-checklistor som köpare använder skulle vara superhjälpsamt. Särskilt commercial DD och synergy-modellering."),
        (salary_id, user_ids.get("Marcus_Berg", admin_id), None, "På större housen i Stockholm: Base runt 65–75k, bonus 50–80% första året. Boutiquer ofta lägre base men högre bonuspotential."),
        (salary_id, user_ids.get("Erik_Lindqvist", admin_id), None, "Bekräftar ungefär samma spann. Stor skillnad mellan BB och MM – MM ger ofta mer ansvar tidigt men lägre total comp första åren."),
        (dcf_id, user_ids.get("Marcus_Berg", admin_id), None, "Vi använder ofta båda – DCF som anchor och multipler som sanity check. Terminal value gör DCF känslig; multipler ger snabb marknadsjämförelse."),
    ]

    for thread_id, user_id, parent_id, content in comments_data:
        if thread_id and user_id:
            cur.execute(
                """INSERT INTO comments (thread_id, user_id, parent_id, content, upvotes, created_at, updated_at, is_deleted)
                VALUES (?, ?, ?, ?, 0, ?, ?, 0)""",
                (thread_id, user_id, parent_id or None, content, now, now),
            )

    conn.commit()
    conn.close()


def _current_user():
    user_id = session.get("forum_user_id")
    if not user_id:
        return None
    conn = _get_db()
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def _login_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if not _current_user():
            return redirect(url_for("forum.forum_login", next=request.path))
        return fn(*args, **kwargs)

    return wrapper


def _admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = _current_user()
        if not user or not user.get("is_admin"):
            return redirect(url_for("forum.forum_index"))
        return fn(*args, **kwargs)

    return wrapper


def _thread_rows(q="", category="", sort="latest"):
    conn = _get_db()
    params = []
    where = ["t.is_deleted = 0"]
    if q:
        where.append("(LOWER(t.title) LIKE ? OR LOWER(t.content) LIKE ? OR LOWER(t.tags) LIKE ? OR LOWER(u.username) LIKE ?)")
        like = f"%{q.lower()}%"
        params.extend([like, like, like, like])
    if category:
        where.append("t.category = ?")
        params.append(category)

    order_clause = "t.created_at DESC"
    if sort == "upvoted":
        order_clause = "t.upvotes DESC, t.created_at DESC"

    rows = conn.execute(
        f"""
        SELECT
            t.*,
            u.username,
            u.role AS user_role,
            (
                SELECT COUNT(*)
                FROM comments c
                WHERE c.thread_id = t.id AND c.is_deleted = 0
            ) AS comment_count
        FROM threads t
        JOIN users u ON u.id = t.user_id
        WHERE {' AND '.join(where)}
        ORDER BY {order_clause}
        """,
        tuple(params),
    ).fetchall()

    conn.close()
    items = [dict(r) for r in rows]

    if sort == "trending":
        now = datetime.now(timezone.utc)

        def trend_score(item):
            created = datetime.fromisoformat(item["created_at"])
            age_hours = max((now - created).total_seconds() / 3600.0, 1.0)
            engagement = (item.get("upvotes", 0) * 2) + item.get("comment_count", 0)
            return engagement / (age_hours ** 0.5)

        items.sort(key=trend_score, reverse=True)

    return items


@forum_bp.route("/forum")
def forum_index():
    q = (request.args.get("q") or "").strip()
    category = (request.args.get("category") or "").strip()
    sort = (request.args.get("sort") or "latest").strip().lower()
    if sort not in {"latest", "upvoted", "trending"}:
        sort = "latest"

    threads = _thread_rows(q=q, category=category, sort=sort)
    return render_template(
        "forum.html",
        threads=threads,
        categories=DEFAULT_CATEGORIES,
        selected_category=category,
        selected_sort=sort,
        query=q,
        current_user=_current_user(),
    )


@forum_bp.route("/forum/register", methods=["GET", "POST"])
def forum_register():
    if request.method == "GET":
        return render_template("forum_register.html", current_user=_current_user(), error="")

    username = (request.form.get("username") or "").strip()
    password = (request.form.get("password") or "").strip()
    role = (request.form.get("role") or "Analyst").strip()
    experience_level = (request.form.get("experience_level") or "0-2 years").strip()
    if not username or not password:
        return render_template("forum_register.html", current_user=_current_user(), error="Username and password are required.")

    conn = _get_db()
    existing = conn.execute("SELECT id FROM users WHERE LOWER(username)=LOWER(?)", (username,)).fetchone()
    if existing:
        conn.close()
        return render_template("forum_register.html", current_user=_current_user(), error="Username already exists.")

    user_count = conn.execute("SELECT COUNT(*) AS c FROM users").fetchone()["c"]
    admin_seed = (os.environ.get("FORUM_ADMIN_USERNAME") or "").strip().lower()
    is_admin = int(user_count == 0 or (admin_seed and username.lower() == admin_seed))

    cur = conn.execute(
        """
        INSERT INTO users (username, password_hash, role, experience_level, is_admin, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (username, generate_password_hash(password), role, experience_level, is_admin, _now_iso()),
    )
    conn.commit()
    user_id = cur.lastrowid
    conn.close()

    session["forum_user_id"] = user_id
    return redirect(url_for("forum.forum_index"))


@forum_bp.route("/forum/login", methods=["GET", "POST"])
def forum_login():
    if request.method == "GET":
        return render_template("forum_login.html", current_user=_current_user(), error="")

    username = (request.form.get("username") or "").strip()
    password = (request.form.get("password") or "").strip()
    conn = _get_db()
    user = conn.execute("SELECT * FROM users WHERE LOWER(username)=LOWER(?)", (username,)).fetchone()
    conn.close()
    if not user or not check_password_hash(user["password_hash"], password):
        return render_template("forum_login.html", current_user=_current_user(), error="Invalid credentials.")

    session["forum_user_id"] = user["id"]
    return redirect(request.args.get("next") or url_for("forum.forum_index"))


@forum_bp.route("/forum/logout", methods=["POST"])
def forum_logout():
    session.pop("forum_user_id", None)
    return redirect(url_for("forum.forum_index"))


@forum_bp.route("/forum/thread/create", methods=["POST"])
@_login_required
def forum_create_thread():
    user = _current_user()
    title = (request.form.get("title") or "").strip()
    content = (request.form.get("content") or "").strip()
    category = (request.form.get("category") or "").strip()
    tags = (request.form.get("tags") or "").strip()
    if not title or not content or not category:
        return redirect(url_for("forum.forum_index", error="missing_fields"))
    if category not in DEFAULT_CATEGORIES:
        category = "Industry Insights"

    conn = _get_db()
    cur = conn.execute(
        """
        INSERT INTO threads (user_id, title, content, category, tags, upvotes, created_at, updated_at, is_deleted)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?, 0)
        """,
        (user["id"], title, content, category, tags, _now_iso(), _now_iso()),
    )
    conn.commit()
    thread_id = cur.lastrowid
    conn.close()
    return redirect(url_for("forum.forum_thread", thread_id=thread_id))


@forum_bp.route("/forum/thread/<int:thread_id>")
def forum_thread(thread_id):
    conn = _get_db()
    thread = conn.execute(
        """
        SELECT t.*, u.username, u.role AS user_role
        FROM threads t
        JOIN users u ON u.id = t.user_id
        WHERE t.id = ? AND t.is_deleted = 0
        """,
        (thread_id,),
    ).fetchone()
    if not thread:
        conn.close()
        return redirect(url_for("forum.forum_index"))

    comments = conn.execute(
        """
        SELECT c.*, u.username, u.role AS user_role
        FROM comments c
        JOIN users u ON u.id = c.user_id
        WHERE c.thread_id = ? AND c.is_deleted = 0
        ORDER BY c.created_at ASC
        """,
        (thread_id,),
    ).fetchall()
    conn.close()

    comment_map = {c["id"]: {**dict(c), "replies": []} for c in comments}
    root_comments = []
    for c in comment_map.values():
        parent_id = c.get("parent_id")
        if parent_id and parent_id in comment_map:
            comment_map[parent_id]["replies"].append(c)
        else:
            root_comments.append(c)

    thread_dict = dict(thread)
    tags = (thread_dict.get("tags") or "").lower()
    show_email_form = "admin-signup" in tags

    return render_template(
        "forum_thread.html",
        thread=thread_dict,
        comments=root_comments,
        current_user=_current_user(),
        show_email_form=show_email_form,
    )


@forum_bp.route("/forum/email-signup", methods=["POST"])
def forum_email_signup():
    import re
    email = (request.form.get("email") or "").strip().lower()
    if not email:
        return jsonify({"success": False, "error": "E-postadress krävs."})
    if not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
        return jsonify({"success": False, "error": "Ange en giltig e-postadress."})
    conn = _get_db()
    try:
        conn.execute(
            "INSERT INTO email_signups (email, created_at) VALUES (?, ?)",
            (email, _now_iso()),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.rollback()
        return jsonify({"success": False, "error": "Den här e-postadressen är redan registrerad."})
    finally:
        conn.close()
    return jsonify({"success": True, "message": "Tack! Du kommer få material inom kort."})


@forum_bp.route("/forum/thread/<int:thread_id>/comment", methods=["POST"])
@_login_required
def forum_comment(thread_id):
    user = _current_user()
    content = (request.form.get("content") or "").strip()
    parent_id = request.form.get("parent_id")
    parent_id = int(parent_id) if parent_id and parent_id.isdigit() else None
    if not content:
        return redirect(url_for("forum.forum_thread", thread_id=thread_id))

    conn = _get_db()
    conn.execute(
        """
        INSERT INTO comments (thread_id, user_id, parent_id, content, upvotes, created_at, updated_at, is_deleted)
        VALUES (?, ?, ?, ?, 0, ?, ?, 0)
        """,
        (thread_id, user["id"], parent_id, content, _now_iso(), _now_iso()),
    )
    conn.commit()
    conn.close()
    return redirect(url_for("forum.forum_thread", thread_id=thread_id))


def _toggle_vote(table, vote_col, content_table, content_id_col, target_id, user_id):
    conn = _get_db()
    existing = conn.execute(
        f"SELECT id FROM {table} WHERE {content_id_col} = ? AND user_id = ?",
        (target_id, user_id),
    ).fetchone()
    if existing:
        conn.execute(f"DELETE FROM {table} WHERE id = ?", (existing["id"],))
        conn.execute(
            f"UPDATE {content_table} SET {vote_col} = CASE WHEN {vote_col} > 0 THEN {vote_col} - 1 ELSE 0 END WHERE id = ?",
            (target_id,),
        )
    else:
        conn.execute(
            f"INSERT INTO {table} ({content_id_col}, user_id, created_at) VALUES (?, ?, ?)",
            (target_id, user_id, _now_iso()),
        )
        conn.execute(f"UPDATE {content_table} SET {vote_col} = {vote_col} + 1 WHERE id = ?", (target_id,))
    conn.commit()
    score = conn.execute(f"SELECT {vote_col} AS score FROM {content_table} WHERE id = ?", (target_id,)).fetchone()
    conn.close()
    return int(score["score"]) if score else 0


@forum_bp.route("/forum/thread/<int:thread_id>/upvote", methods=["POST"])
@_login_required
def forum_upvote_thread(thread_id):
    user = _current_user()
    score = _toggle_vote("thread_votes", "upvotes", "threads", "thread_id", thread_id, user["id"])
    return jsonify({"success": True, "upvotes": score})


@forum_bp.route("/forum/comment/<int:comment_id>/upvote", methods=["POST"])
@_login_required
def forum_upvote_comment(comment_id):
    user = _current_user()
    score = _toggle_vote("comment_votes", "upvotes", "comments", "comment_id", comment_id, user["id"])
    return jsonify({"success": True, "upvotes": score})


@forum_bp.route("/forum/report", methods=["POST"])
@_login_required
def forum_report_content():
    user = _current_user()
    content_type = (request.form.get("content_type") or "").strip()
    content_id = request.form.get("content_id")
    reason = (request.form.get("reason") or "").strip()
    if content_type not in {"thread", "comment"} or not reason or not content_id or not content_id.isdigit():
        return redirect(url_for("forum.forum_index"))

    content_id_int = int(content_id)
    conn = _get_db()
    conn.execute(
        """
        INSERT INTO reports (reporter_user_id, content_type, content_id, reason, status, created_at)
        VALUES (?, ?, ?, ?, 'open', ?)
        """,
        (user["id"], content_type, content_id_int, reason, _now_iso()),
    )
    conn.commit()
    conn.close()

    if content_type == "thread":
        return redirect(url_for("forum.forum_thread", thread_id=content_id_int))
    return redirect(request.referrer or url_for("forum.forum_index"))


@forum_bp.route("/forum/profile/<username>")
def forum_profile(username):
    conn = _get_db()
    user = conn.execute("SELECT * FROM users WHERE LOWER(username)=LOWER(?)", (username,)).fetchone()
    if not user:
        conn.close()
        return redirect(url_for("forum.forum_index"))

    thread_count = conn.execute("SELECT COUNT(*) AS c FROM threads WHERE user_id = ? AND is_deleted = 0", (user["id"],)).fetchone()["c"]
    comment_count = conn.execute("SELECT COUNT(*) AS c FROM comments WHERE user_id = ? AND is_deleted = 0", (user["id"],)).fetchone()["c"]
    karma = conn.execute(
        """
        SELECT
            COALESCE((SELECT SUM(upvotes) FROM threads WHERE user_id = ? AND is_deleted = 0), 0) +
            COALESCE((SELECT SUM(upvotes) FROM comments WHERE user_id = ? AND is_deleted = 0), 0) AS score
        """,
        (user["id"], user["id"]),
    ).fetchone()["score"]
    conn.close()

    return render_template(
        "forum_profile.html",
        profile_user=dict(user),
        thread_count=thread_count,
        comment_count=comment_count,
        karma=karma,
        current_user=_current_user(),
    )


@forum_bp.route("/forum/admin")
@_admin_required
def forum_admin():
    conn = _get_db()
    reports = conn.execute(
        """
        SELECT r.*, u.username AS reporter
        FROM reports r
        JOIN users u ON u.id = r.reporter_user_id
        ORDER BY r.status ASC, r.created_at DESC
        """
    ).fetchall()
    threads = conn.execute(
        """
        SELECT t.*, u.username
        FROM threads t
        JOIN users u ON u.id = t.user_id
        WHERE t.is_deleted = 0
        ORDER BY t.created_at DESC
        LIMIT 100
        """
    ).fetchall()
    comments = conn.execute(
        """
        SELECT c.*, u.username
        FROM comments c
        JOIN users u ON u.id = c.user_id
        WHERE c.is_deleted = 0
        ORDER BY c.created_at DESC
        LIMIT 100
        """
    ).fetchall()
    conn.close()
    return render_template(
        "forum_admin.html",
        reports=[dict(r) for r in reports],
        threads=[dict(t) for t in threads],
        comments=[dict(c) for c in comments],
        current_user=_current_user(),
    )


@forum_bp.route("/forum/admin/thread/<int:thread_id>/delete", methods=["POST"])
@_admin_required
def forum_admin_delete_thread(thread_id):
    conn = _get_db()
    conn.execute("UPDATE threads SET is_deleted = 1, updated_at = ? WHERE id = ?", (_now_iso(), thread_id))
    conn.commit()
    conn.close()
    return redirect(url_for("forum.forum_admin"))


@forum_bp.route("/forum/admin/comment/<int:comment_id>/delete", methods=["POST"])
@_admin_required
def forum_admin_delete_comment(comment_id):
    conn = _get_db()
    conn.execute("UPDATE comments SET is_deleted = 1, updated_at = ? WHERE id = ?", (_now_iso(), comment_id))
    conn.commit()
    conn.close()
    return redirect(url_for("forum.forum_admin"))


@forum_bp.route("/forum/admin/thread/<int:thread_id>/edit", methods=["POST"])
@_admin_required
def forum_admin_edit_thread(thread_id):
    title = (request.form.get("title") or "").strip()
    content = (request.form.get("content") or "").strip()
    category = (request.form.get("category") or "").strip()
    tags = (request.form.get("tags") or "").strip()
    conn = _get_db()
    conn.execute(
        """
        UPDATE threads
        SET title = ?, content = ?, category = ?, tags = ?, updated_at = ?
        WHERE id = ?
        """,
        (title, content, category if category in DEFAULT_CATEGORIES else "Industry Insights", tags, _now_iso(), thread_id),
    )
    conn.commit()
    conn.close()
    return redirect(url_for("forum.forum_admin"))


@forum_bp.route("/forum/admin/comment/<int:comment_id>/edit", methods=["POST"])
@_admin_required
def forum_admin_edit_comment(comment_id):
    content = (request.form.get("content") or "").strip()
    conn = _get_db()
    conn.execute("UPDATE comments SET content = ?, updated_at = ? WHERE id = ?", (content, _now_iso(), comment_id))
    conn.commit()
    conn.close()
    return redirect(url_for("forum.forum_admin"))


@forum_bp.route("/forum/admin/report/<int:report_id>/resolve", methods=["POST"])
@_admin_required
def forum_admin_resolve_report(report_id):
    user = _current_user()
    conn = _get_db()
    conn.execute(
        "UPDATE reports SET status = 'resolved', resolved_at = ?, resolved_by = ? WHERE id = ?",
        (_now_iso(), user["id"], report_id),
    )
    conn.commit()
    conn.close()
    return redirect(url_for("forum.forum_admin"))
