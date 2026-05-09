import os
import time
import json
import requests
from groq import Groq
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def fetch_news(category="technology", max_articles=100):
    articles = []
    url = "https://newsdata.io/api/1/news"
    next_page = None
    page_count = 0
    print(f"🔍 Fetching up to {max_articles} articles in category: {category}")

    while len(articles) < max_articles:
        params = {"apikey": os.getenv("NEWSDATA_API_KEY"), "language": "en", "category": category, "size": 10}
        if next_page:
            params["page"] = next_page
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"⚠️ Fetch error: {e}")
            break
        data = response.json()
        if data.get("status") != "success":
            print(f"⚠️ API error: {data.get('message')}")
            break
        articles.extend(data.get("results", []))
        page_count += 1
        next_page = data.get("nextPage")
        if not next_page or len(articles) >= max_articles:
            break
        time.sleep(0.5)

    print(f"✅ Fetched {len(articles)} articles across {page_count} pages")
    return articles[:max_articles]


def clean_article(raw):
    title = (raw.get("title") or "").strip()
    if not title or len(title) < 10:
        return None
    category = raw.get("category")
    if isinstance(category, list):
        category = category[0] if category else "general"
    return {
        "article_id":   raw.get("article_id", ""),
        "title":        title,
        "description":  (raw.get("description") or "")[:500],
        "content":      (raw.get("content") or "")[:3000],
        "source_name":  raw.get("source_name") or "Unknown",
        "category":     category or "general",
        "published_at": raw.get("pubDate"),
        "url":          raw.get("link") or "",
        "image_url":    raw.get("image_url") or "",
    }


def ai_process_article(article):
    body = (article["description"] or article["content"] or "")[:1500]
    prompt = f"""Analyze this news article. Return ONLY a JSON object, no markdown, no explanation.

{{
  "summary": "1-2 sentence summary",
  "sentiment": "positive or negative or neutral",
  "sentiment_score": 0.0,
  "key_insights": ["insight 1", "insight 2", "insight 3"]
}}

sentiment_score must be between -1.0 and 1.0.

Article:
Title: {article['title']}
{body}"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=400,
            temperature=0.3,
        )
        raw_text = response.choices[0].message.content.strip()
        if "```" in raw_text:
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        result = json.loads(raw_text.strip())
        assert result.get("sentiment") in ("positive", "negative", "neutral")
        return result
    except Exception as e:
        print(f"   ⚠️ AI failed: {e}")
        return {"summary": "", "sentiment": "neutral", "sentiment_score": 0.0, "key_insights": []}


def run_pipeline(category="technology", max_articles=50):
    raw_articles = fetch_news(category, max_articles)
    existing_resp = supabase.table("articles").select("article_id").execute()
    existing_ids = {row["article_id"] for row in existing_resp.data}

    new_count = 0
    for i, raw in enumerate(raw_articles):
        cleaned = clean_article(raw)
        if not cleaned or cleaned["article_id"] in existing_ids:
            continue
        print(f"[{i+1}/{len(raw_articles)}] Processing: {cleaned['title'][:60]}...")
        ai_data = ai_process_article(cleaned)
        cleaned.update({
            "summary":         ai_data.get("summary", ""),
            "sentiment":       ai_data.get("sentiment", "neutral"),
            "sentiment_score": float(ai_data.get("sentiment_score", 0.0)),
            "key_insights":    ai_data.get("key_insights", []),
            "ai_processed":    True,
        })
        supabase.table("articles").insert(cleaned).execute()
        existing_ids.add(cleaned["article_id"])
        new_count += 1
        time.sleep(0.5)

    print(f"\n🎉 Done! Added {new_count} new articles.")
    return new_count


if __name__ == "__main__":
    for cat in ["technology", "science", "business"]:
        run_pipeline(category=cat, max_articles=30)