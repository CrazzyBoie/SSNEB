import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useFirestore } from '../hooks/useFirestore';
import { defaultGallery } from '../data/defaultData';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Gallery = () => {
  const { t } = useLanguage();
  const [gallery] = useFirestore('admin_gallery', defaultGallery);
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  const categories = ['All', 'Classrooms', 'Events', 'Sports', 'Cultural', 'Hostel'];
  const filteredGallery = filter === 'All' ? gallery : gallery.filter(g => g.category === filter);

  const openLightbox = (index) => setLightbox(index);
  const closeLightbox = () => setLightbox(null);
  const prevImage = () => setLightbox(prev => (prev - 1 + filteredGallery.length) % filteredGallery.length);
  const nextImage = () => setLightbox(prev => (prev + 1) % filteredGallery.length);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightbox === null) return;
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowLeft') setLightbox(prev => (prev - 1 + filteredGallery.length) % filteredGallery.length);
      if (e.key === 'ArrowRight') setLightbox(prev => (prev + 1) % filteredGallery.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox, filteredGallery.length]);

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
          <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>{t('gallery')}</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Moments from Our School Life</p>
        </div>
      </div>

      {/* Filter Buttons */}
      <section className="section" style={{ paddingBottom: '20px' }}>
        <div className="container">
          <div className="scroll-animate" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '20px'
          }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setFilter(cat); setLightbox(null); }}
                style={{
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid',
                  borderColor: filter === cat ? 'var(--color-primary)' : '#e5e7eb',
                  background: filter === cat ? 'var(--color-primary)' : 'white',
                  color: filter === cat ? 'white' : 'var(--color-dark)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section style={{ padding: '20px 0 80px' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px'
          }} className="gallery-grid">
            {filteredGallery.map((item, index) => (
              <div
                key={item.id}
                className="scroll-animate"
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  aspectRatio: '4/3',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'var(--transition)'
                }}
                onClick={() => openLightbox(index)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                }}
              >
                <img
                  src={item.url}
                  alt={item.caption}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'var(--transition)'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  padding: '30px 16px 16px',
                  color: 'white',
                  transform: 'translateY(100%)',
                  transition: 'transform 0.3s ease'
                }} className="gallery-caption">
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{item.caption}</p>
                  <span style={{
                    display: 'inline-block',
                    marginTop: '6px',
                    padding: '2px 10px',
                    background: 'var(--color-accent)',
                    color: 'var(--color-dark)',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.9)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease'
        }} onClick={closeLightbox}>
          <button
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '2rem',
              cursor: 'pointer',
              zIndex: 10001
            }}
          >
            <FaTimes />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            style={{
              position: 'absolute',
              left: '20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001
            }}
          >
            <FaChevronLeft />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            style={{
              position: 'absolute',
              right: '20px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001
            }}
          >
            <FaChevronRight />
          </button>

          <div style={{
            maxWidth: '80%',
            maxHeight: '80%',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <img
              src={filteredGallery[lightbox].url}
              alt={filteredGallery[lightbox].caption}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '-40px',
              left: 0,
              right: 0,
              textAlign: 'center',
              color: 'white'
            }}>
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{filteredGallery[lightbox].caption}</p>
              <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                {lightbox + 1} / {filteredGallery.length}
              </span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .gallery-grid > div:hover .gallery-caption {
          transform: translateY(0) !important;
        }
        @media (max-width: 1024px) {
          .gallery-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </main>
  );
};

export default Gallery;