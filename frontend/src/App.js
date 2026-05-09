import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import StatsBar from './components/StatsBar';
import ArticleCard from './components/ArticleCard';

const API = 'http://localhost:5000/api';

function ArticleSkeleton() {
  return (
    <div style={{ borderTop: '1px solid #e0d9ce', paddingTop: 20, paddingBottom: 20 }}>
      <div className="skeleton" style={{ height: 11, width: '30%', marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 20, width: '85%', marginBottom: 6 }} />
      <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 14 }} />
      <div className="skeleton" style={{ height: 14, width: '100%', marginBottom: 4 }} />
      <div className="skeleton" style={{ height: 14, width: '90%' }} />
    </div>
  );
}

function FilterPill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '4px 14px',
      borderRadius: 99,
      border: `1px solid ${active ? '#2c3e50' : '#c8bfb0'}`,
      background: active ? '#2c3e50' : 'transparent',
      color: active ? '#fff' : '#4a4a4a',
      fontSize: 12, fontWeight: 500,
      transition: 'all 0.15s',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </button>
  );
}

function Toast({ message, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  const bg = type === 'success' ? '#27ae60' : type === 'error' ? '#c0392b' : '#2c3e50';
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 999,
      background: bg, color: '#fff',
      padding: '10px 20px', borderRadius: 4,
      fontWeight: 500, fontSize: 13,
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      animation: 'fadeIn 0.3s ease',
    }}>{message}</div>
  );
}

export default function App() {
  const [articles,   setArticles]   = useState([]);
  const [stats,      setStats]      = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [statsLoad,  setStatsLoad]  = useState(true);
  const [fetching,   setFetching]   = useState(false);
  const [toast,      setToast]      = useState(null);
  const [liveSearch, setLiveSearch] = useState('');
  const [sentiment,  setSentiment]  = useState('');
  const [category,   setCategory]   = useState('');
  const [page,       setPage]       = useState(1);

  const showToast = (message, type = 'info') => setToast({ message, type });

  const loadArticles = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/articles`, {
        params: {
          search:    overrides.search    ?? liveSearch,
          sentiment: overrides.sentiment ?? sentiment,
          category:  overrides.category  ?? category,
          page:      overrides.page      ?? page,
        }
      });
      setArticles(res.data.articles || []);
    } catch { showToast('Failed to load articles', 'error'); }
    setLoading(false);
  }, [liveSearch, sentiment, category, page]);

  const loadStats = useCallback(async () => {
    setStatsLoad(true);
    try { const r = await axios.get(`${API}/stats`); setStats(r.data); } catch {}
    setStatsLoad(false);
  }, []);

  const loadCategories = useCallback(async () => {
    try { const r = await axios.get(`${API}/categories`); setCategories(r.data.categories || []); } catch {}
  }, []);

  useEffect(() => { loadArticles(); loadStats(); loadCategories(); }, [sentiment, category, page]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); loadArticles({ search: liveSearch, page: 1 }); }, 400);
    return () => clearTimeout(t);
  }, [liveSearch]);

  const handlePipelineRun = async (cat = 'technology') => {
    setFetching(true);
    showToast(`Fetching ${cat} news…`, 'info');
    try {
      const r = await axios.post(`${API}/run-pipeline`, { category: cat });
      showToast(`Added ${r.data.new_articles} new articles`, 'success');
      await loadArticles(); await loadStats(); await loadCategories();
    } catch { showToast('Pipeline failed', 'error'); }
    setFetching(false);
  };

  const applyFilter = (key, value) => {
    if (key === 'sentiment') setSentiment(value);
    if (key === 'category')  setCategory(value);
    setPage(1);
    loadArticles({ sentiment: key==='sentiment'?value:sentiment, category: key==='category'?value:category, page: 1 });
  };

  const clearFilters = () => {
    setSentiment(''); setCategory(''); setLiveSearch(''); setPage(1);
    loadArticles({ search: '', sentiment: '', category: '', page: 1 });
  };

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8' }}>

      {/* Top bar */}
      <div style={{ borderBottom: '1px solid #c8bfb0', background: '#2c3e50', padding: '8px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' }}>{today}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              disabled={fetching}
              onChange={e => { if (e.target.value) { handlePipelineRun(e.target.value); e.target.value = ''; } }}
              style={{
                padding: '4px 10px', background: 'transparent',
                color: fetching ? '#64748b' : '#94a3b8',
                border: '1px solid #475569', borderRadius: 3,
                fontSize: 11, cursor: fetching ? 'not-allowed' : 'pointer',
              }}
            >
              <option value="">{fetching ? 'Fetching…' : '+ Fetch News'}</option>
              {['technology','science','business','health','entertainment','sports'].map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div style={{ borderBottom: '3px double #1a1a1a', padding: '20px 0 16px', textAlign: 'center', background: '#f5f0e8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ fontFamily: 'Lora, serif', fontSize: 52, fontWeight: 600, letterSpacing: -1, color: '#1a1a1a', lineHeight: 1 }}>
            NewsIQ
          </h1>
          <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#7f8c8d', marginTop: 6 }}>
            AI-Powered Intelligence Platform
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* Stats */}
        <StatsBar stats={stats} loading={statsLoad} />

        {/* Divider */}
        <div style={{ borderTop: '1px solid #c8bfb0', borderBottom: '1px solid #c8bfb0', padding: '10px 0', margin: '0 0 24px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Search */}
          <input
            value={liveSearch}
            onChange={e => setLiveSearch(e.target.value)}
            placeholder="Search headlines…"
            style={{
              flex: '1 1 200px', padding: '5px 12px',
              background: '#fff', border: '1px solid #c8bfb0',
              borderRadius: 3, fontSize: 13, color: '#1a1a1a',
              outline: 'none',
            }}
          />

          {/* Sentiment pills */}
          {['', 'positive', 'negative', 'neutral'].map(s => (
            <FilterPill
              key={s || 'all'}
              label={s ? s.charAt(0).toUpperCase()+s.slice(1) : 'All'}
              active={sentiment === s}
              onClick={() => applyFilter('sentiment', s)}
            />
          ))}

          {(sentiment || category || liveSearch) && (
            <button onClick={clearFilters} style={{ fontSize: 11, color: '#c0392b', background: 'none', border: 'none', padding: '4px 8px' }}>
              × Clear filters
            </button>
          )}
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
            <FilterPill label="All Topics" active={!category} onClick={() => applyFilter('category', '')} />
            {categories.map(c => (
              <FilterPill key={c} label={c.charAt(0).toUpperCase()+c.slice(1)} active={category===c} onClick={() => applyFilter('category', c)} />
            ))}
          </div>
        )}

        {/* Articles */}
        {loading ? (
          <div>{[...Array(6)].map((_, i) => <ArticleSkeleton key={i} />)}</div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#7f8c8d' }}>
            <p style={{ fontSize: 16, fontFamily: 'Lora, serif', fontStyle: 'italic' }}>No articles found.</p>
            <p style={{ fontSize: 13, marginTop: 8 }}>
              {stats?.total === 0 ? 'Use "+ Fetch News" above to get started.' : 'Try different filters.'}
            </p>
          </div>
        ) : (
          <>
            {/* 3-column newspaper grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0 32px' }}>
              {articles.map((a, i) => <ArticleCard key={a.id} article={a} index={i} />)}
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '40px 0', alignItems: 'center' }}>
              <button
                disabled={page <= 1}
                onClick={() => { setPage(p => p-1); loadArticles({ page: page-1 }); }}
                style={{ padding: '6px 18px', border: '1px solid #c8bfb0', background: page<=1?'#f5f0e8':'#fff', color: page<=1?'#c8bfb0':'#1a1a1a', fontSize: 13, borderRadius: 3 }}
              >← Previous</button>
              <span style={{ fontSize: 12, color: '#7f8c8d' }}>Page {page}</span>
              <button
                disabled={articles.length < 12}
                onClick={() => { setPage(p => p+1); loadArticles({ page: page+1 }); }}
                style={{ padding: '6px 18px', border: '1px solid #c8bfb0', background: articles.length<12?'#f5f0e8':'#fff', color: articles.length<12?'#c8bfb0':'#1a1a1a', fontSize: 13, borderRadius: 3 }}
              >Next →</button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '3px double #1a1a1a', marginTop: 40, padding: '20px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#7f8c8d', letterSpacing: 1, textTransform: 'uppercase' }}>
          NewsIQ · Powered by Groq AI · NewsData.io · Supabase
        </p>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}