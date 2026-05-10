import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useFirestore } from '../hooks/useFirestore';
import { defaultNews, defaultEvents } from '../data/defaultData';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaArrowRight } from 'react-icons/fa';

const NewsEvents = () => {
  const { t } = useLanguage();
  const [news] = useFirestore('admin_news', defaultNews);
  const [events] = useFirestore('admin_events', defaultEvents);
  const [activeTab, setActiveTab] = useState('news');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const currentItems = activeTab === 'news' ? news : events;
  const totalPages = Math.ceil(currentItems.length / itemsPerPage);
  const paginatedItems = currentItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
          <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>{t('news')}</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Stay Updated with School Activities</p>
        </div>
      </div>

      {/* Tabs */}
      <section className="section" style={{ paddingBottom: '20px' }}>
        <div className="container">
          <div className="scroll-animate" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '30px'
          }}>
            <button
              onClick={() => { setActiveTab('news'); setCurrentPage(1); }}
              style={{
                padding: '14px 40px',
                borderRadius: 'var(--radius-md)',
                border: '2px solid',
                borderColor: activeTab === 'news' ? 'var(--color-primary)' : '#e5e7eb',
                background: activeTab === 'news' ? 'var(--color-primary)' : 'white',
                color: activeTab === 'news' ? 'white' : 'var(--color-dark)',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              News
            </button>
            <button
              onClick={() => { setActiveTab('events'); setCurrentPage(1); }}
              style={{
                padding: '14px 40px',
                borderRadius: 'var(--radius-md)',
                border: '2px solid',
                borderColor: activeTab === 'events' ? 'var(--color-primary)' : '#e5e7eb',
                background: activeTab === 'events' ? 'var(--color-primary)' : 'white',
                color: activeTab === 'events' ? 'white' : 'var(--color-dark)',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              Upcoming Events
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '20px 0 80px' }}>
        <div className="container">
          {activeTab === 'news' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px'
            }} className="news-grid">
              {paginatedItems.map((item, index) => (
                <div key={item.id} className="card scroll-animate" style={{ overflow: 'hidden' }}>
                  <div style={{
                    height: '200px',
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'var(--color-accent)',
                      color: 'var(--color-dark)',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {item.category}
                    </span>
                  </div>
                  <div style={{ padding: '24px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--color-muted)',
                      fontSize: '0.85rem',
                      marginBottom: '10px'
                    }}>
                      <FaCalendarAlt size={12} />
                      {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: 'var(--color-secondary)' }}>{item.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
                      {item.excerpt}
                    </p>
                    <button style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--color-primary)',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}>
                      {t('readMore')} <FaArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px'
            }} className="events-grid">
              {paginatedItems.map((event, index) => {
                const eventDate = new Date(event.date);
                return (
                  <div key={event.id} className="card scroll-animate" style={{
                    padding: '28px',
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      minWidth: '70px',
                      height: '70px',
                      background: 'var(--color-primary)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white'
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
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaClock size={12} /> {event.time}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FaMapMarkerAlt size={12} /> {event.location}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '40px'
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid #e5e7eb',
                  background: 'white',
                  color: currentPage === 1 ? '#ccc' : 'var(--color-dark)',
                  fontWeight: 600,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              <span style={{
                padding: '10px 24px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-secondary)',
                color: 'white',
                fontWeight: 700
              }}>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid #e5e7eb',
                  background: 'white',
                  color: currentPage === totalPages ? '#ccc' : 'var(--color-dark)',
                  fontWeight: 600,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .news-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .events-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .news-grid { grid-template-columns: 1fr !important; }
          .events-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
};

export default NewsEvents;