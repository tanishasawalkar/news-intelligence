# NewsIQ – AI-Powered News Intelligence Platform

An end-to-end news dashboard that fetches real-time articles, processes them with
**Google Gemini AI** (free), and displays summaries, sentiment analysis, and key insights.

## Tech Stack (100% Free)

| Layer    | Tool                  | Why free?                          |
|----------|-----------------------|------------------------------------|
| News     | NewsData.io           | 200 free credits/day               |
| AI       | Google Gemini 1.5 Flash | 1,500 free requests/day           |
| Database | Supabase              | 500 MB free tier                   |
| Backend  | Python + Flask        | Open source                        |
| Frontend | React                 | Open source                        |

---

## Setup (under 5 minutes)

### 1. Get your free API keys

| Service | Link | Steps |
|---|---|---|
| NewsData.io | https://newsdata.io | Sign up → Dashboard → API Key |
| Google Gemini | https://aistudio.google.com | Sign in → Get API Key → Create API key |
| Supabase | https://supabase.com | New project → Settings → API → copy URL + anon key |

### 2. Create the Supabase table

In your Supabase project → **SQL Editor** → paste and run:

```sql
CREATE TABLE articles (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id     TEXT UNIQUE,
  title          TEXT NOT NULL,
  description    TEXT,
  content        TEXT,
  source_name    TEXT,
  category       TEXT,
  published_at   TIMESTAMPTZ,
  url            TEXT,
  image_url      TEXT,
  summary        TEXT,
  sentiment      TEXT,
  sentiment_score FLOAT,
  key_insights   JSONB,
  ai_processed   BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Clone & run backend

```bash
git clone https://github.com/YOUR_USERNAME/news-intelligence.git
cd news-intelligence/backend

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Open .env and fill in your three API keys

python pipeline.py              # Fetches & processes articles (takes ~3 min)
python app.py                   # Starts API on http://localhost:5000
```

### 4. Run frontend

```bash
cd ../frontend
npm install
npm start                       # Opens http://localhost:3000
```

That's it. Open http://localhost:3000 and click **⚡ Fetch News** to populate data.

---

## Project Structure

```
news-intelligence/
├── backend/
│   ├── pipeline.py      # Data pipeline: fetch → clean → AI → store
│   ├── app.py           # Flask REST API
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.js                    # Main dashboard
│   │   ├── components/
│   │   │   ├── ArticleCard.js        # Individual article card
│   │   │   └── StatsBar.js           # Stats + sentiment breakdown
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── .gitignore
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles` | Paginated articles (search, sentiment, category filters) |
| GET | `/api/stats` | Sentiment breakdown + category counts |
| GET | `/api/categories` | All available categories |
| GET | `/api/articles/:id` | Single article detail |
| POST | `/api/run-pipeline` | Trigger pipeline for a category |

---

## Features

- **Real-time data pipeline** with pagination and deduplication
- **AI-powered summaries** — 1-2 sentence plain-English summaries via Gemini
- **Sentiment analysis** — positive / negative / neutral with score (-1 to +1)
- **Key insights** — 3-5 bullet insights extracted per article
- **Search & filter** — live search + sentiment and category filters
- **Stats dashboard** — sentiment breakdown, category distribution, overall mood
- **Pagination** — 12 articles per page

---

## What I'd add with more time

- Scheduled pipeline runs (cron job / Supabase Edge Functions)
- Full-text search using Supabase's pg_trgm extension
- Trending topics chart (Recharts)
- Email digest feature
- Deploy backend on Railway, frontend on Vercel

---

## Technology decisions

**Why Gemini over OpenAI?** Gemini 1.5 Flash is completely free with 1,500 requests/day — no credit card required. For a news intelligence tool processing ~100 articles, it's the obvious choice.

**Why Supabase over Firebase?** Supabase uses PostgreSQL, which supports structured queries (filtering by sentiment, category, pagination) cleanly. Firebase's NoSQL model would require client-side filtering.

**Why Flask over FastAPI?** Simpler setup for a 5-endpoint API. FastAPI's async advantages only matter at scale.
