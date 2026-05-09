import React, { useState } from 'react';

export default function ArticleCard({ article, index }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return hours + 'h ago';
    return Math.floor(hours / 24) + 'd ago';
  }

  const sentimentColor =
    article.sentiment === 'positive' ? '#27ae60' :
    article.sentiment === 'negative' ? '#c0392b' : '#7f8c8d';

  const sentimentLabel =
    article.sentiment === 'positive' ? '↑ Positive' :
    article.sentiment === 'negative' ? '↓ Negative' : '— Neutral';

  return (
    <div
      className="fade-in"
      onMouseEnter={function() { setHovered(true); }}
      onMouseLeave={function() { setHovered(false); }}
      style={{
        animationDelay: index * 0.04 + 's',
        background: '#ffffff',
        border: '1px solid #d5cfc6',
        borderRadius: '4px',
        marginBottom: '24px',
        overflow: 'hidden',
        boxShadow: hovered
          ? '4px 6px 0px #b0a898'
          : '3px 4px 0px #c8bfb0',
        transform: hovered ? 'translate(-1px, -2px)' : 'translate(0, 0)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
    >
      {article.image_url && index === 0 && (
        <img
          src={article.image_url}
          alt=""
          style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
          onError={function(e) { e.target.style.display = 'none'; }}
        />
      )}

      <div style={{ padding: '16px 18px 20px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#c0392b' }}>
            {article.category}
          </span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#7f8c8d' }}>{timeAgo(article.published_at)}</span>
            <span style={{ fontSize: '10px', fontWeight: '600', color: sentimentColor }}>{sentimentLabel}</span>
          </div>
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'block',
            fontFamily: 'Lora, serif',
            fontSize: index === 0 ? '21px' : '16px',
            fontWeight: '600',
            color: '#1a1a1a',
            lineHeight: '1.35',
            marginBottom: '6px',
          }}
        >
          {article.title}
        </a>

        <p style={{ fontSize: '11px', color: '#9a9080', marginBottom: '12px', fontStyle: 'italic' }}>
          {article.source_name}
        </p>

        {article.summary && (
          <p style={{
            fontSize: '13px',
            color: '#4a4a4a',
            lineHeight: '1.7',
            marginBottom: '12px',
            borderLeft: '3px solid #c0392b',
            paddingLeft: '10px',
            background: '#fdf9f6',
            padding: '8px 10px',
          }}>
            {article.summary}
          </p>
        )}

        {article.key_insights && article.key_insights.length > 0 && (
          <div>
            <button
              onClick={function() { setOpen(!open); }}
              style={{
                background: 'none',
                border: '1px solid #c8bfb0',
                borderRadius: '3px',
                padding: '4px 12px',
                fontSize: '10px',
                color: '#2c3e50',
                fontWeight: '700',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              {open ? '▲ Hide' : '▼ Key Insights (' + article.key_insights.length + ')'}
            </button>
            {open && (
              <ul style={{ margin: '10px 0 0 0', paddingLeft: '18px' }}>
                {article.key_insights.map(function(ins, i) {
                  return (
                    <li key={i} style={{ fontSize: '12px', color: '#4a4a4a', lineHeight: '1.7', marginBottom: '4px' }}>
                      {ins}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}