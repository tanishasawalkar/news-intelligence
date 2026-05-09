import React from 'react';

function MeterBar({ value, total, color }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 3, background: '#e0d9ce', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.8s ease' }} />
      </div>
      <span style={{ fontSize: 11, color: '#7f8c8d', minWidth: 28, textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

export default function StatsBar({ stats, loading }) {
  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, padding: '20px 0', borderBottom: '1px solid #e0d9ce', marginBottom: 20 }}>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 2 }} />)}
      </div>
    );
  }
  if (!stats) return null;

  const { total, sentiment_breakdown: sb, avg_sentiment_score, top_categories } = stats;
  const avgScore = avg_sentiment_score ?? 0;
  const moodLabel = avgScore > 0.2 ? 'Optimistic' : avgScore < -0.2 ? 'Pessimistic' : 'Mixed';
  const moodColor = avgScore > 0.2 ? '#27ae60' : avgScore < -0.2 ? '#c0392b' : '#7f8c8d';

  return (
    <div style={{ borderBottom: '1px solid #c8bfb0', marginBottom: 20 }}>
      {/* Thin rule */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '0 32px', padding: '16px 0' }}>

        <div style={{ borderRight: '1px solid #e0d9ce', paddingRight: 24 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: '#7f8c8d', marginBottom: 4 }}>Total Articles</p>
          <p style={{ fontSize: 28, fontFamily: 'Lora, serif', fontWeight: 600, color: '#1a1a1a', lineHeight: 1 }}>{total}</p>
          <p style={{ fontSize: 11, color: '#7f8c8d', marginTop: 2 }}>{top_categories?.length || 0} categories</p>
        </div>

        <div style={{ borderRight: '1px solid #e0d9ce', paddingRight: 24 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: '#7f8c8d', marginBottom: 4 }}>Top Category</p>
          <p style={{ fontSize: 20, fontFamily: 'Lora, serif', fontWeight: 600, color: '#2c3e50', lineHeight: 1.2 }}>
            {top_categories?.[0]?.name?.charAt(0).toUpperCase() + top_categories?.[0]?.name?.slice(1) || '–'}
          </p>
          <p style={{ fontSize: 11, color: '#7f8c8d', marginTop: 2 }}>{top_categories?.[0]?.count || 0} articles</p>
        </div>

        <div style={{ borderRight: '1px solid #e0d9ce', paddingRight: 24 }}>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: '#7f8c8d', marginBottom: 4 }}>Overall Mood</p>
          <p style={{ fontSize: 22, fontFamily: 'Lora, serif', fontWeight: 600, color: moodColor, lineHeight: 1 }}>{moodLabel}</p>
          <p style={{ fontSize: 11, color: '#7f8c8d', marginTop: 2 }}>Score: {avgScore.toFixed(2)}</p>
        </div>

        <div>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: '#7f8c8d', marginBottom: 8 }}>Sentiment Split</p>
          {[['positive','#27ae60'],['negative','#c0392b'],['neutral','#7f8c8d']].map(([s, c]) => (
            <div key={s} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                <span style={{ color: c, textTransform: 'capitalize', fontWeight: 500 }}>{s}</span>
                <span style={{ color: '#7f8c8d' }}>{sb?.[s] ?? 0}</span>
              </div>
              <MeterBar value={sb?.[s] ?? 0} total={total} color={c} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}