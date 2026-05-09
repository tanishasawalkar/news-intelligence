import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from supabase import create_client
from dotenv import load_dotenv
from pipeline import run_pipeline

load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow React frontend to call this API

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))


# ── Articles ──────────────────────────────────────────────────────────────────
@app.route("/api/articles", methods=["GET"])
def get_articles():
    """
    Query params:
      search    – text search on title / description
      sentiment – filter by positive | negative | neutral
      category  – filter by category string
      page      – pagination (default 1)
    """
    search    = request.args.get("search", "").strip().lower()
    sentiment = request.args.get("sentiment", "").strip()
    category  = request.args.get("category", "").strip()
    page      = max(1, int(request.args.get("page", 1)))
    per_page  = 12

    query = (
        supabase.table("articles")
        .select("*")
        .eq("ai_processed", True)
        .order("published_at", desc=True)
    )

    if sentiment:
        query = query.eq("sentiment", sentiment)
    if category:
        query = query.eq("category", category)

    # Fetch a wider window then filter by search client-side
    # (Supabase free tier doesn't include full-text search)
    fetch_limit = per_page * 5 if search else per_page
    start = (page - 1) * per_page
    query = query.range(start, start + fetch_limit - 1)

    result = query.execute()
    articles = result.data or []

    if search:
        articles = [
            a for a in articles
            if search in (a.get("title") or "").lower()
            or search in (a.get("description") or "").lower()
            or search in (a.get("summary") or "").lower()
        ][:per_page]

    return jsonify({"articles": articles, "page": page, "count": len(articles)})


# ── Stats ─────────────────────────────────────────────────────────────────────
@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Return sentiment breakdown, category counts, and total article count."""
    result = supabase.table("articles").select("sentiment, category, sentiment_score").execute()
    data = result.data or []

    total = len(data)
    sentiment_counts = {"positive": 0, "negative": 0, "neutral": 0}
    category_map = {}
    total_score = 0.0

    for row in data:
        s = row.get("sentiment", "neutral")
        if s in sentiment_counts:
            sentiment_counts[s] += 1
        cat = row.get("category", "general")
        category_map[cat] = category_map.get(cat, 0) + 1
        total_score += float(row.get("sentiment_score") or 0.0)

    avg_sentiment = round(total_score / total, 3) if total else 0.0
    top_categories = sorted(category_map.items(), key=lambda x: -x[1])[:6]

    return jsonify({
        "total":              total,
        "sentiment_breakdown": sentiment_counts,
        "avg_sentiment_score": avg_sentiment,
        "top_categories":     [{"name": k, "count": v} for k, v in top_categories],
    })


# ── Single article ────────────────────────────────────────────────────────────
@app.route("/api/articles/<article_id>", methods=["GET"])
def get_article(article_id):
    result = supabase.table("articles").select("*").eq("id", article_id).execute()
    if not result.data:
        return jsonify({"error": "Not found"}), 404
    return jsonify(result.data[0])


# ── Trigger pipeline ──────────────────────────────────────────────────────────
@app.route("/api/run-pipeline", methods=["POST"])
def trigger_pipeline():
    """Manually trigger the data pipeline from the dashboard."""
    body = request.get_json() or {}
    category = body.get("category", "technology")
    count = run_pipeline(category=category, max_articles=30)
    return jsonify({"status": "success", "new_articles": count})


# ── Available categories ──────────────────────────────────────────────────────
@app.route("/api/categories", methods=["GET"])
def get_categories():
    result = supabase.table("articles").select("category").execute()
    cats = sorted(set(r["category"] for r in (result.data or []) if r.get("category")))
    return jsonify({"categories": cats})


if __name__ == "__main__":
    print("🚀 Starting News Intelligence API on http://localhost:5000")
    app.run(debug=True, port=5000)
