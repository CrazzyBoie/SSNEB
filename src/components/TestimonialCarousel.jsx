import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaStar, FaChevronLeft, FaChevronRight, FaQuoteLeft } from 'react-icons/fa';
import { useFirestore } from '../hooks/useFirestore';
import { defaultTestimonials } from '../data/defaultData';

const TestimonialCarousel = () => {
  const { t } = useLanguage();
  const [testimonials] = useFirestore('admin_testimonials', defaultTestimonials);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const prev = () => setCurrent(prev => (prev - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent(prev => (prev + 1) % testimonials.length);

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <div style={{ background: '#fef9e7', padding: '80px 0' }}>
      <div className="container">
        <div className="section-title">
          <h2>{t('testimonials')}</h2>
        </div>

        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-lg)',
            padding: '40px',
            boxShadow: 'var(--shadow-card)',
            textAlign: 'center',
            minHeight: '280px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <FaQuoteLeft size={32} style={{ color: 'var(--color-accent)', marginBottom: '20px', opacity: 0.5 }} />

            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'var(--color-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '20px',
              fontFamily: 'var(--font-display)'
            }}>
              {testimonials[current].name.charAt(0)}
            </div>

            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
              {[...Array(testimonials[current].rating || 5)].map((_, i) => (
                <FaStar key={i} size={18} style={{ color: 'var(--color-accent)' }} />
              ))}
            </div>

            <p style={{
              fontSize: '1.1rem',
              fontStyle: 'italic',
              color: 'var(--color-dark)',
              lineHeight: 1.7,
              marginBottom: '20px',
              maxWidth: '600px'
            }}>
              "{testimonials[current].quote}"
            </p>

            <h4 style={{ fontSize: '1.1rem', color: 'var(--color-secondary)', marginBottom: '4px' }}>
              {testimonials[current].name}
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>
              {testimonials[current].grade || testimonials[current].role}
            </p>
          </div>

          {/* Navigation Arrows */}
          <button onClick={prev} style={{
            position: 'absolute',
            left: '-60px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'var(--color-secondary)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-card)'
          }} className="testimonial-nav">
            <FaChevronLeft />
          </button>
          <button onClick={next} style={{
            position: 'absolute',
            right: '-60px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'var(--color-secondary)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-card)'
          }} className="testimonial-nav">
            <FaChevronRight />
          </button>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .testimonial-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default TestimonialCarousel;