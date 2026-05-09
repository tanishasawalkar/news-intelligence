# NewsIQ – AI-Powered News Intelligence Platform

An end-to-end news dashboard that fetches real-time articles, processes them with
**Groq AI (Llama 3.1)**, and displays summaries, sentiment analysis, and key insights.

## Tech Stack

| Layer    | Tool              | Role                              |
|----------|-------------------|-----------------------------------|
| News     | NewsData.io       | Real-time article ingestion       |
| AI       | Groq (Llama 3.1)  | Summarisation, sentiment, insights|
| Database | Supabase          | PostgreSQL data storage           |
| Backend  | Python + Flask    | REST API                          |
| Frontend | React             | Interactive dashboard             |

---

## Setup (under 5 minutes)

### 1. Get your API keys

| Service | Link |
|---|---|
| NewsData.io | https://newsdata.io |
| Groq | https://console.groq.com |
| Supabase | https://supabase.com |

### 2. Create the Supabase table

In your Supabase project → **SQL Editor** → paste and run:

```sql
CREATE TABLE articles (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id      TEXT UNIQUE,
  title           TEXT NOT NULL,
  description     TEXT,
  content         TEXT,
  source_name     TEXT,
  category        TEXT,
  published_at    TIMESTAMPTZ,
  url             TEXT,
  image_url       TEXT,
  summary         TEXT,
  sentiment       TEXT,
  sentiment_score FLOAT,
  key_insights    JSONB,
  ai_processed    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Run the backend

```bash
git clone https://github.com/YOUR_USERNAME/news-intelligence.git
cd news-intelligence/backend

python -m venv venv
venv\Scripts\activate        # Mac/Linux: source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Open .env and fill in your API keys

python pipeline.py           # Fetches and processes articles
python app.py                # Starts API on http://localhost:5000
```

### 4. Run the frontend

```bash
cd ../frontend
npm install
npm start                    # Opens http://localhost:3000
```

Open http://localhost:3000 and click **⚡ Fetch News** to populate data.

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
| GET | `/api/articles` | Paginated articles with search, sentiment, category filters |
| GET | `/api/stats` | Sentiment breakdown and category counts |
| GET | `/api/categories` | All available categories |
| GET | `/api/articles/:id` | Single article detail |
| POST | `/api/run-pipeline` | Trigger pipeline for a given category |

---

## Features

- **Data pipeline** — pagination, cleaning, and deduplication via NewsData.io
- **AI summaries** — 1-2 sentence summaries via Groq (Llama 3.1)
- **Sentiment analysis** — positive / negative / neutral with a score from -1 to +1
- **Key insights** — 3-5 bullet points extracted per article
- **Search & filters** — live search, sentiment filters, and category filters
- **Stats dashboard** — sentiment breakdown, top category, overall mood score
- **Pagination** — 12 articles per page

---

## What I'd add with more time

- Scheduled pipeline runs via cron job or Supabase Edge Functions
- Full-text search using Supabase's pg_trgm extension
- Trending topics chart using Recharts
- Public deployment on Railway (backend) and Vercel (frontend)

---

## Technology decisions

**Why Groq (Llama 3.1)?** Groq offers extremely fast inference and a generous API quota, making it well-suited for batch processing news articles. Originally trialled Google Gemini but encountered quota limitations on the free tier.

**Why Supabase over Firebase?** Supabase uses PostgreSQL, which supports structured queries — filtering by sentiment, category, and pagination — cleanly server-side. Firebase's NoSQL model would push that filtering to the client.

**Why Flask over FastAPI?** For a 5-endpoint API, Flask's simplicity is an advantage. FastAPI's async benefits only matter at higher concurrency.