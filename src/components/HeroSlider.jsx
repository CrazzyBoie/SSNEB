import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFirestore } from '../hooks/useFirestore';
import { defaultHeroSlides } from '../data/defaultData';

const HeroSlider = () => {
  const { t } = useLanguage();
  const [slides] = useFirestore('admin_hero_slides', defaultHeroSlides);
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent(prev => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [slides.length, nextSlide]);

  if (!slides || slides.length === 0) return null;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '600px',
      overflow: 'hidden',
      background: 'var(--color-secondary)'
    }} className="hero-slider">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: current === index ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            zIndex: current === index ? 1 : 0
          }}
        >
          {/* Background Image */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
          {/* Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(26,58,107,0.85) 0%, rgba(215,38,56,0.6) 100%)'
          }} />

          {/* Content */}
          <div className="container" style={{
            position: 'relative',
            zIndex: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            color: 'white',
            padding: '0 20px'
          }}>
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 900,
              marginBottom: '16px',
              maxWidth: '700px',
              lineHeight: 1.1,
              animation: current === index ? 'heroTextReveal 0.8s ease-out forwards' : 'none',
              opacity: 0
            }} className="hero-title">
              {slide.title}
            </h1>
            <p style={{
              fontSize: '1.3rem',
              marginBottom: '32px',
              maxWidth: '600px',
              opacity: 0,
              animation: current === index ? 'heroTextReveal 0.8s ease-out 0.2s forwards' : 'none'
            }} className="hero-subtitle">
              {slide.subtitle}
            </p>
            <div style={{
              display: 'flex',
              gap: '16px',
              opacity: 0,
              animation: current === index ? 'heroTextReveal 0.8s ease-out 0.4s forwards' : 'none'
            }}>
              <Link to={slide.cta1Link || '/admissions'} className="btn btn-accent">
                {slide.cta1 || t('applyNow')}
              </Link>
              <Link to={slide.cta2Link || '/about'} className="btn btn-outline">
                {slide.cta2 || t('learnMore')}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Dots */}
      <div style={{
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        zIndex: 10
      }}>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: '2px solid white',
              background: current === index ? 'var(--color-accent)' : 'transparent',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          />
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-slider { height: 450px !important; }
          .hero-title { font-size: 2rem !important; }
          .hero-subtitle { font-size: 1rem !important; }
        }
      `}</style>
    </div>
  );
};

export default HeroSlider;