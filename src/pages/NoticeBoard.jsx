import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useFirestore } from '../hooks/useFirestore';
import { defaultNotices } from '../data/defaultData';
import { FaSearch, FaDownload, FaThumbtack, FaTag } from 'react-icons/fa';

const NoticeBoard = () => {
  const { t } = useLanguage();
  const [notices] = useFirestore('admin_notices', defaultNotices);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'Academic', 'Admin', 'Exam', 'Holiday', 'Sports'];

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || notice.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date) - new Date(a.date);
  });

  const categoryColors = {
    Academic: '#3B82F6',
    Admin: '#8B5CF6',
    Exam: '#EF4444',
    Holiday: '#10B981',
    Sports: '#F59E0B'
  };

  return (
    <main>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%)',
        padding: '100px 0',
        textAlign: 'center',
        color: 'white'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>{t('notices')}</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Important Announcements and Updates</p>
        </div>
      </div>

      {/* Search & Filter */}
      <section className="section" style={{ paddingBottom: '20px' }}>
        <div className="container">
          <div className="scroll-animate" style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '30px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <div style={{
              flex: 1,
              minWidth: '250px',
              position: 'relative'
            }}>
              <FaSearch style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-muted)'
              }} />
              <input
                type="text"
                placeholder="Search notices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 42px',
                  border: '2px solid #e5e7eb',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-body)'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid',
                    borderColor: categoryFilter === cat ? 'var(--color-primary)' : '#e5e7eb',
                    background: categoryFilter === cat ? 'var(--color-primary)' : 'white',
                    color: categoryFilter === cat ? 'white' : 'var(--color-dark)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notices List */}
      <section style={{ padding: '20px 0 80px' }}>
        <div className="container">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredNotices.length === 0 ? (
              <div className="card scroll-animate" style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--color-muted)'
              }}>
                <p>No notices found matching your criteria.</p>
              </div>
            ) : (
              filteredNotices.map((notice, index) => (
                <div
                  key={notice.id}
                  className="card scroll-animate"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'flex-start',
                    borderLeft: notice.pinned ? '4px solid var(--color-accent)' : '4px solid transparent',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateX(5px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                  }}
                >
                  {/* Date Badge */}
                  <div style={{
                    minWidth: '60px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      background: 'var(--color-light)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '1.3rem',
                        fontWeight: 900,
                        color: 'var(--color-secondary)',
                        fontFamily: 'var(--font-display)'
                      }}>
                        {new Date(notice.date).getDate()}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        color: 'var(--color-muted)',
                        textTransform: 'uppercase'
                      }}>
                        {new Date(notice.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '8px',
                      flexWrap: 'wrap'
                    }}>
                      {notice.pinned && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 10px',
                          background: 'var(--color-accent)',
                          color: 'var(--color-dark)',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          <FaThumbtack size={10} /> PINNED
                        </span>
                      )}
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 10px',
                        background: categoryColors[notice.category] || '#6B7280',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        <FaTag size={10} /> {notice.category}
                      </span>
                    </div>
                    <h3 style={{
                      fontSize: '1.1rem',
                      color: 'var(--color-secondary)',
                      marginBottom: '8px'
                    }}>{notice.title}</h3>
                    <p style={{
                      fontSize: '0.9rem',
                      color: 'var(--color-muted)',
                      lineHeight: 1.6
                    }}>{notice.description}</p>
                  </div>

                  {/* Download */}
                  {notice.pdfUrl && (
                    <button style={{
                      padding: '10px',
                      background: 'var(--color-light)',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}>
                      <FaDownload size={14} /> PDF
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .card { flex-direction: column !important; gap: 12px !important; }
        }
      `}</style>
    </main>
  );
};

export default NoticeBoard;