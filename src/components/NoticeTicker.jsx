import React from 'react';
import { Link } from 'react-router-dom';
import { useFirestore } from '../hooks/useFirestore';
import { defaultNotices } from '../data/defaultData';

const NoticeTicker = () => {
  const [notices] = useFirestore('admin_notices', defaultNotices);
  const activeNotices = notices.filter(n => n.pinned || new Date(n.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

  if (activeNotices.length === 0) return null;

  const tickerText = activeNotices.map(n => `📌 ${n.title}`).join('   •   ');

  return (
    <div style={{
      background: 'var(--color-primary)',
      color: 'white',
      padding: '12px 0',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        animation: 'marquee 30s linear infinite'
      }}>
        <span style={{ fontWeight: 700, marginRight: '20px', flexShrink: 0 }}>
          📢 LATEST NOTICES:
        </span>
        <span>{tickerText}   •   {tickerText}</span>
      </div>
      <Link to="/notice-board" style={{
        position: 'absolute',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'white',
        color: 'var(--color-primary)',
        padding: '4px 12px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.8rem',
        fontWeight: 700,
        textDecoration: 'none'
      }}>
        View All
      </Link>
      <style>{`
        @media (max-width: 768px) {
          div[style*="position: absolute"] { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default NoticeTicker;