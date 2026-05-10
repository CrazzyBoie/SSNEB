import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useFirestore } from '../hooks/useFirestore';
import { defaultNews, defaultEvents } from '../data/defaultData';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaArrowRight, FaTimes, FaTag } from 'react-icons/fa';

/* ─── Detail Modal ───────────────────────────────────────────────────── */
const DetailModal = ({ item, type, onClose }) => {
  if (!item) return null;

  const isNews = type === 'news';
  const eventDate = !isNews ? new Date(item.date) : null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: '20px',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '16px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
          animation: 'modalIn 0.25s ease-out forwards',
        }}
      >
        {/* Image / Event date banner */}
        {isNews && item.image && (
          <div style={{
            height: '240px',
            backgroundImage: `url(${item.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '16px 16px 0 0',
            position: 'relative',
          }}>
            {item.category && (
              <span style={{
                position: 'absolute', top: '16px', left: '16px',
                background: 'var(--color-accent)', color: 'var(--color-dark)',
                padding: '4px 14px', borderRadius: '999px',
                fontSize: '0.75rem', fontWeight: 700,
              }}>
                {item.category}
              </span>
            )}
          </div>
        )}

        {!isNews && (
          <div style={{
            background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%)',
            borderRadius: '16px 16px 0 0',
            padding: '32px',
            display: 'flex', alignItems: 'center', gap: '24px',
            color: 'white',
          }}>
            <div style={{
              minWidth: '80px', height: '80px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(6px)',
            }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>{eventDate.getDate()}</span>
              <span style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {eventDate.toLocaleDateString('en-US', { month: 'short' })}
              </span>
            </div>
            <div>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '0.85rem' }}>Upcoming Event</p>
              <h2 style={{ margin: '4px 0 0', fontSize: '1.4rem', fontWeight: 800 }}>{item.title}</h2>
            </div>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '28px 32px 32px' }}>
          {/* Close button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            {isNews && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>
                  <FaCalendarAlt size={12} />
                  {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--color-secondary)', margin: 0 }}>{item.title}</h2>
              </div>
            )}
            {!isNews && <div />}
            <button
              onClick={onClose}
              style={{
                background: '#f3f4f6', border: 'none', cursor: 'pointer',
                width: '36px', height: '36px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#6b7280', fontSize: '1rem', flexShrink: 0, marginLeft: '12px',
              }}
            >
              <FaTimes />
            </button>
          </div>

          {/* Event meta */}
          {!isNews && (
            <div style={{
              display: 'flex', gap: '20px', flexWrap: 'wrap',
              padding: '14px 16px',
              background: 'var(--color-light)',
              borderRadius: '10px',
              marginBottom: '20px',
            }}>
              {item.time && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
                  <FaClock size={14} style={{ color: 'var(--color-primary)' }} /> {item.time}
                </span>
              )}
              {item.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
                  <FaMapMarkerAlt size={14} style={{ color: 'var(--color-primary)' }} /> {item.location}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
                <FaCalendarAlt size={14} style={{ color: 'var(--color-primary)' }} />
                {eventDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          )}

          {/* News excerpt */}
          {isNews && item.excerpt && (
            <p style={{
              fontSize: '1rem', color: '#4b5563', lineHeight: 1.7,
              fontWeight: 500, marginBottom: '16px',
              borderLeft: '3px solid var(--color-primary)',
              paddingLeft: '14px',
            }}>
              {item.excerpt}
            </p>
          )}

          {/* Full content / description */}
          <p style={{
            fontSize: '0.95rem', color: '#374151',
            lineHeight: 1.8, margin: 0,
            whiteSpace: 'pre-wrap',
          }}>
            {isNews ? (item.content || item.excerpt || 'No additional content.') : (item.description || 'No additional details.')}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────── */
const NewsEvents = () => {
  const { t } = useLanguage();
  const [news]   = useFirestore('admin_news',   defaultNews);
  const [events] = useFirestore('admin_events', defaultEvents);
  const [activeTab,   setActiveTab]   = useState('news');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected,    setSelected]    = useState(null); // { item, type }
  const itemsPerPage = 6;

  const currentItems  = activeTab === 'news' ? news : events;
  const totalPages    = Math.ceil(currentItems.length / itemsPerPage);
  const paginatedItems = currentItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <main>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%)',
        padding: '100px 0', textAlign: 'center', color: 'white',
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>{t('news')}</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Stay Updated with School Activities</p>
        </div>
      </div>

      {/* Tabs */}
      <section className="section" style={{ paddingBottom: '20px' }}>
        <div className="container">
          <div className="scroll-animate" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '30px' }}>
            {['news', 'events'].map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                style={{
                  padding: '14px 40px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid',
                  borderColor: activeTab === tab ? 'var(--color-primary)' : '#e5e7eb',
                  background:  activeTab === tab ? 'var(--color-primary)' : 'white',
                  color:       activeTab === tab ? 'white' : 'var(--color-dark)',
                  fontWeight: 700, fontSize: '1rem',
                  cursor: 'pointer', transition: 'var(--transition)',
                }}
              >
                {tab === 'news' ? 'News' : 'Upcoming Events'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '20px 0 80px' }}>
        <div className="container">
          {activeTab === 'news' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="news-grid">
              {paginatedItems.map(item => (
                <div
                  key={item.id}
                  className="card scroll-animate"
                  style={{ overflow: 'hidden', cursor: 'pointer', transition: 'var(--transition)' }}
                  onClick={() => setSelected({ item, type: 'news' })}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
                >
                  <div style={{
                    height: '200px',
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    position: 'relative',
                  }}>
                    <span style={{
                      position: 'absolute', top: '12px', left: '12px',
                      background: 'var(--color-accent)', color: 'var(--color-dark)',
                      padding: '4px 12px', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem', fontWeight: 700,
                    }}>
                      {item.category}
                    </span>
                  </div>
                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '10px' }}>
                      <FaCalendarAlt size={12} />
                      {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: 'var(--color-secondary)' }}>{item.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
                      {item.excerpt}
                    </p>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem',
                    }}>
                      {t('readMore')} <FaArrowRight size={14} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }} className="events-grid">
              {paginatedItems.map(event => {
                const eventDate = new Date(event.date);
                return (
                  <div
                    key={event.id}
                    className="card scroll-animate"
                    style={{ padding: '28px', display: 'flex', gap: '20px', alignItems: 'flex-start', cursor: 'pointer', transition: 'var(--transition)' }}
                    onClick={() => setSelected({ item: event, type: 'event' })}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
                  >
                    <div style={{
                      minWidth: '70px', height: '70px',
                      background: 'var(--color-primary)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      color: 'white', flexShrink: 0,
                    }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>
                        {eventDate.getDate()}
                      </span>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--color-secondary)' }}>{event.title}</h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', marginBottom: '10px', lineHeight: 1.5 }}>
                        {event.description}
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                        {event.time && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaClock size={12} /> {event.time}
                          </span>
                        )}
                        {event.location && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaMapMarkerAlt size={12} /> {event.location}
                          </span>
                        )}
                      </div>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        marginTop: '12px', color: 'var(--color-primary)',
                        fontWeight: 600, fontSize: '0.85rem',
                      }}>
                        View Details <FaArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '40px' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{ padding: '10px 24px', borderRadius: 'var(--radius-md)', border: '2px solid #e5e7eb', background: 'white', color: currentPage === 1 ? '#ccc' : 'var(--color-dark)', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <span style={{ padding: '10px 24px', borderRadius: 'var(--radius-md)', background: 'var(--color-secondary)', color: 'white', fontWeight: 700 }}>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{ padding: '10px 24px', borderRadius: 'var(--radius-md)', border: '2px solid #e5e7eb', background: 'white', color: currentPage === totalPages ? '#ccc' : 'var(--color-dark)', fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      {selected && (
        <DetailModal
          item={selected.item}
          type={selected.type}
          onClose={() => setSelected(null)}
        />
      )}

      <style>{`
        @media (max-width: 1024px) {
          .news-grid   { grid-template-columns: repeat(2, 1fr) !important; }
          .events-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .news-grid   { grid-template-columns: 1fr !important; }
          .events-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
};

export default NewsEvents;