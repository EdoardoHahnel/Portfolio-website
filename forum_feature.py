import hashlib
import os
import smtplib
import sqlite3
from datetime import datetime, timezone
from email.mime.text import MIMEText
from email.utils import formataddr
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

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS page_views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            path TEXT NOT NULL,
            date TEXT NOT NULL,
            ip_hash TEXT,
            created_at TEXT NOT NULL
        )
        """
    )
    cur.execute("CREATE INDEX IF NOT EXISTS idx_page_views_date ON page_views(date)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path)")

    conn.commit()
    conn.close()

    _ensure_admin_user()
    _seed_forum_data()


def log_page_view(path: str, ip: str | None = None):
    """Log a page view for analytics (path, date, ip_hash)."""
    try:
        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        ip_hash = ""
        if ip:
            ip_hash = hashlib.sha256((ip + "portfoljbolagen_salt").encode()).hexdigest()[:16]
        conn = _get_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO page_views (path, date, ip_hash, created_at) VALUES (?, ?, ?, ?)",
            (path, date_str, ip_hash or None, _now_iso()),
        )
        conn.commit()
        conn.close()
    except Exception:
        pass


def _ensure_admin_user():
    """Ensure Admin@gmail.com exists with password Admin (is_admin=1)."""
    conn = _get_db()
    cur = conn.cursor()
    r = cur.execute("SELECT id FROM users WHERE LOWER(username)=LOWER(?)", ("Admin@gmail.com",)).fetchone()
    if not r:
        cur.execute(
            "INSERT INTO users (username, password_hash, role, experience_level, is_admin, created_at) VALUES (?, ?, ?, ?, 1, ?)",
            ("Admin@gmail.com", generate_password_hash("Admin"), "Admin", "10+ years", _now_iso()),
        )
        conn.commit()
    conn.close()


def _seed_forum_data():
    """Seed forum with realistic usernames, threads and comments if DB is empty.
    To get updated seed content (e.g. after changing usernames/posts), delete forum.db and restart the app.
    """
    conn = _get_db()
    cur = conn.cursor()
    row = cur.execute("SELECT COUNT(*) AS c FROM threads").fetchone()
    if row["c"] > 0:
        conn.close()
        return  # Only seed when empty; use Admin → Reseed to refresh

    now = _now_iso()

    # Forum usernames – casual handles (first name + initial/number)
    seed_users = [
        ("Portfoljbolagen", "changeme123", "Admin", "10+ years", 1),
        ("HenrikD", "changeme123", "Associate", "2-4 years", 0),
        ("Joppe9", "changeme123", "Analyst", "0-2 years", 0),
        ("Siwvers", "changeme123", "VP", "5-8 years", 0),
        ("Erikm", "changeme123", "Analyst", "0-2 years", 0),
        ("MarcusL", "changeme123", "Principal", "8-10 years", 0),
        ("AnnaK2", "changeme123", "Associate", "2-4 years", 0),
        ("JohanS", "changeme123", "VP", "5-8 years", 0),
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

    # Realistic threads – casual tone, abbreviations, how people actually write
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
            user_ids.get("HenrikD", admin_id),
            "Nordisk PE 2025 – hur ser ni på exits?",
            "Jobbar på en mindre fond i Sthlm. Känns som exit-möjligheterna har stängt igen – secondary? strategic? IPO känns ute. Vad hör ni? Vi har 2 bolag vi borde exit:a men budgivningen har varit patetisk.",
            "Industry Insights",
            "private equity, nordic, exits, 2025",
            8,
        ),
        (
            user_ids.get("Joppe9", admin_id),
            "LBO-case inför intervju – var hittar man övningsfall?",
            "Första PE-intervjun om 2 v, LBO case. Tips på övningsmaterial? Rosenbaum? Brukar ni köra S&U först eller direkt in i modellen?",
            "Recruiting",
            "LBO, case, intervju",
            5,
        ),
        (
            user_ids.get("Siwvers", admin_id),
            "Sell-side vs buy-side DD – vad köpare glömmer",
            "Varit med i typ 15 processer, båda sidor. Köpare missar ofta: (1) WC-sving Q3-Q4 (2) capex backlog (3) management alignment post-LBO. Säljare: förbered er på 100+ frågor, inte 20.",
            "M&A",
            "M&A, due diligence, buyside, sellside",
            14,
        ),
        (
            user_ids.get("Erikm", admin_id),
            "Base + bonus analyst Stockholm 2025?",
            "Första jobbet som analyst. Hört 55-80k base, bonus 30-100%. Big4 vs boutique vs BB?",
            "Salaries",
            "lön, analyst, stockholm, 2025, comp",
            22,
        ),
        (
            user_ids.get("MarcusL", admin_id),
            "DCF vs multipler – praktiska tumregler",
            "Vi kör DCF som anchor, multipler som sanity. Men TV gör DCF superkänslig – 0.5% WACC = 20% värdering. Rules of thumb för när man skippar DCF?",
            "Corporate Finance",
            "DCF, valuation, multipler, terminal value",
            9,
        ),
        (
            user_ids.get("AnnaK2", admin_id),
            "Add-on vs organic – vad ger mest nu?",
            "Vår fond satsar hårt på add-ons. Men är integration värt stressen vs organic? Vi hade en add-on som tog 18 mån att integrera, värde = minus.",
            "Industry Insights",
            "add-on, organic growth, integration",
            6,
        ),
        (
            user_ids.get("JohanS", admin_id),
            "Är DCF värd det för cykliska bolag?",
            "Seriöst – modellerar ni industriella bolag med 5y DCF? Vi kör nästan bara EV/EBITDA, historik + peers. DCF = checkbox för styrelsen, ingen tror på TV. Same?",
            "Corporate Finance",
            "DCF, cyclical, valuation",
            11,
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
    addon_id = thread_ids[6] if len(thread_ids) > 6 else None
    dcf_skeptic_id = thread_ids[7] if len(thread_ids) > 7 else None

    comments_data = [
        (admin_post_id, user_ids.get("HenrikD", admin_id), None, "Tack! Behöver uppdatera mina excel-mallar, perfekt timing."),
        (admin_post_id, user_ids.get("Joppe9", admin_id), None, "Perfekt inför intervjuerna. Skickar till min mail!"),
        (nordic_id, user_ids.get("Siwvers", admin_id), None, "Samma här. Mycket dry powder stilla. Add-ons känns som enda sättet just nu. Strategiska har börjat buda igen iaf inom healthcare."),
        (nordic_id, user_ids.get("MarcusL", admin_id), None, "Exit via strateg känns mer realistiskt. Secondary-premierna har varit sjuka. IPO i Norden = dött, kolla hur få som listat."),
        (lbo_id, user_ids.get("Siwvers", admin_id), None, "Rosenbaum bra. M&I och WSO har gratis fall. Struktur: overview → thesis → S&U → returns. Debt schedule enkel, senior + mezz räcker."),
        (lbo_id, user_ids.get("HenrikD", admin_id), None, "Följ den strukturen. Öva 45-min case – det är standard. Ha template i huvudet."),
        (ma_id, user_ids.get("HenrikD", admin_id), None, "DD-listan vore guld. Commercial DD – vi har missat revenue conc risks flera gånger."),
        (salary_id, user_ids.get("Siwvers", admin_id), None, "Stora housen Sthlm: base 65–75k, bonus 50–80% år 1. Boutiquer lägre base, högre bonus. MM ger mer ansvar tidigt men lägre comp första 2 åren."),
        (salary_id, user_ids.get("HenrikD", admin_id), None, "Stämmer. Stor skillnad stated vs paid bonus lol"),
        (dcf_id, user_ids.get("Siwvers", admin_id), None, "Samma. DCF=anchor, multipler=sanity. TV är 70%+ av DCF så WACC är allt. Vi kör base/upside/downside istället för en punkt."),
        (dcf_id, user_ids.get("JohanS", admin_id), None, "För industriella = DCF mest teater. Multipler + precedent ger bättre feel för vad marknaden betalar."),
        (addon_id, user_ids.get("MarcusL", admin_id), None, "Beror på. Add-on som complement = bra. Synergier som kräver 50% cost cut = pain. Vi kör DD på integration innan sign, brukar ta bort 30% av deals."),
        (addon_id, user_ids.get("AnnaK2", admin_id), None, "Haha känner igen. Vi hade en som tog 2 år. Synergies försvann i integration. Nu striktare på fit."),
        (dcf_skeptic_id, user_ids.get("MarcusL", admin_id), None, "100%. DCF för cykliska = GIGO. Peer comps + precedent, LBO-first-money-in som floor. Styrelsen vill ha en siffra så man får hitta på nåt."),
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


def _send_modelling_request_email(to_email: str) -> bool:
    """Send notification email when someone requests modelling material. Returns True if sent."""
    recipient = (os.environ.get("MODELLING_REQUEST_EMAIL") or "").strip()
    if not recipient:
        return False
    server = (os.environ.get("MAIL_SERVER") or "").strip()
    port = int(os.environ.get("MAIL_PORT") or "587")
    user = (os.environ.get("MAIL_USERNAME") or "").strip()
    password = (os.environ.get("MAIL_PASSWORD") or "").strip()
    use_tls = (os.environ.get("MAIL_USE_TLS") or "true").lower() in ("1", "true", "yes")
    sender = (os.environ.get("MAIL_DEFAULT_SENDER") or user or "noreply@portfoljbolagen.se").strip()
    if not server or not user or not password:
        return False
    try:
        msg = MIMEText(
            f"Någon har begärt gratis modelleringsmaterial.\n\nE-postadress: {to_email}\nDatum: {_now_iso()}\n\nSkicka materialet till denna adress.",
            "plain",
            "utf-8",
        )
        msg["Subject"] = f"[Portföljbolagen] Begäran om modelleringsmaterial – {to_email}"
        msg["From"] = formataddr(("Portföljbolagen", sender))
        msg["To"] = recipient
        with smtplib.SMTP(server, port) as smtp:
            if use_tls:
                smtp.starttls()
            smtp.login(user, password)
            smtp.sendmail(sender, recipient, msg.as_string())
        return True
    except Exception as e:
        print(f"[Forum] Email notification failed: {e}")
        return False


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

    _send_modelling_request_email(email)
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
    signups = conn.execute(
        "SELECT * FROM email_signups ORDER BY created_at DESC LIMIT 200"
    ).fetchall()
    # Analytics: page views
    total_views = conn.execute("SELECT COUNT(*) as c FROM page_views").fetchone()["c"]
    unique_visitors = conn.execute(
        "SELECT COUNT(DISTINCT ip_hash) as c FROM page_views WHERE ip_hash IS NOT NULL AND ip_hash != ''"
    ).fetchone()["c"]
    views_by_path = conn.execute(
        """
        SELECT path, COUNT(*) as cnt FROM page_views
        GROUP BY path ORDER BY cnt DESC LIMIT 20
        """
    ).fetchall()
    views_by_date = conn.execute(
        """
        SELECT date, COUNT(*) as cnt FROM page_views
        GROUP BY date ORDER BY date DESC LIMIT 30
        """
    ).fetchall()
    analytics = {
        "total_views": total_views,
        "unique_visitors": unique_visitors,
        "views_by_path": [dict(r) for r in views_by_path],
        "views_by_date": [dict(r) for r in views_by_date],
    }
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
        email_signups=[dict(s) for s in signups],
        analytics=analytics,
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


@forum_bp.route("/forum/admin/reseed", methods=["POST"])
@_admin_required
def forum_admin_reseed():
    """Reset forum to seed state – replaces Name_Surname users with anonymous handles."""
    conn = _get_db()
    try:
        conn.execute("DELETE FROM thread_votes")
        conn.execute("DELETE FROM comment_votes")
        conn.execute("DELETE FROM reports")
        conn.execute("DELETE FROM comments")
        conn.execute("DELETE FROM threads")
        conn.execute("DELETE FROM users WHERE is_admin = 0")
        conn.commit()
    finally:
        conn.close()
    _seed_forum_data()
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
