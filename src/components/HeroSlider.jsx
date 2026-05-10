import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFirestore } from '../hooks/useFirestore';
import { defaultHeroSlides } from '../data/defaultData';

const HeroSlider = () => {
  const { t } = useLanguage();
  const [slides] = useFirestore('admin_hero_slides', defaultHeroSlides);
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);
  const touchEndX   = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrent(prev => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrent(prev => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [slides.length, nextSlide]);

  const handleTouchStart = (e) => { touchStartX.current = e.changedTouches[0].clientX; };
  const handleTouchMove  = (e) => { touchEndX.current   = e.changedTouches[0].clientX; };
  const handleTouchEnd   = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) diff > 0 ? nextSlide() : prevSlide();
    touchStartX.current = null;
    touchEndX.current   = null;
  };

  if (!slides || slides.length === 0) return null;

  return (
    <>
      <style>{`
        .hero-slider {
          position: relative;
          width: 100%;
          height: 600px;
          overflow: hidden;
          background: var(--color-secondary);
        }
        .hero-slide {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transition: opacity 0.8s ease-in-out;
        }
        .hero-slide-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }
        .hero-slide-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(26,58,107,0.85) 0%, rgba(215,38,56,0.6) 100%);
        }
        .hero-slide-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          color: white;
          padding: 0 48px;
          z-index: 2;
        }
        .hero-title {
          font-size: 3.5rem;
          font-weight: 900;
          margin: 0 0 16px;
          max-width: 700px;
          line-height: 1.1;
        }
        .hero-subtitle {
          font-size: 1.3rem;
          margin: 0 0 32px;
          max-width: 600px;
          opacity: 0.95;
        }
        .hero-buttons {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .hero-dots {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 10;
        }
        .hero-dot {
          height: 12px;
          border-radius: 6px;
          border: 2px solid white;
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
        }

        @keyframes heroIn {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .hero-slider        { height: 520px; }
          .hero-title         { font-size: 2.8rem; }
          .hero-slide-content { padding: 0 32px; }
        }
        @media (max-width: 768px) {
          .hero-slider        { height: 500px; }
          .hero-title         { font-size: 1.9rem; max-width: 100%; }
          .hero-subtitle      { font-size: 1rem; max-width: 100%; margin-bottom: 24px; }
          .hero-slide-content { padding: 0 20px; }
          .hero-buttons       { gap: 10px; }
        }
        @media (max-width: 480px) {
          .hero-slider        { height: 460px; }
          .hero-title         { font-size: 1.55rem; }
          .hero-subtitle      { font-size: 0.9rem; margin-bottom: 20px; }
          .hero-buttons       { flex-direction: column; width: 100%; }
          .hero-buttons .btn  { text-align: center; width: 100%; box-sizing: border-box; }
        }
      `}</style>

      <div
        className="hero-slider"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y' }}
      >
        {slides.map((slide, index) => {
          const isActive = current === index;
          return (
            <div
              key={slide.id}
              className="hero-slide"
              style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 1 : 0 }}
            >
              {slide.image && (
                <img
                  className="hero-slide-img"
                  src={slide.image}
                  alt={slide.title || ''}
                  draggable={false}
                />
              )}
              <div className="hero-slide-overlay" />
              <div className="hero-slide-content">
                <h1
                  className="hero-title"
                  style={{ opacity: 0, animation: isActive ? 'heroIn 0.8s ease-out 0s forwards' : 'none' }}
                >
                  {slide.title}
                </h1>
                <p
                  className="hero-subtitle"
                  style={{ opacity: 0, animation: isActive ? 'heroIn 0.8s ease-out 0.2s forwards' : 'none' }}
                >
                  {slide.subtitle}
                </p>
                <div
                  className="hero-buttons"
                  style={{ opacity: 0, animation: isActive ? 'heroIn 0.8s ease-out 0.4s forwards' : 'none' }}
                >
                  <Link to={slide.cta1Link || '/admissions'} className="btn btn-accent">
                    {slide.cta1 || t('applyNow')}
                  </Link>
                  <Link to={slide.cta2Link || '/about'} className="btn btn-outline">
                    {slide.cta2 || t('learnMore')}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {/* Dot indicators only — no arrows */}
        <div className="hero-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className="hero-dot"
              onClick={() => setCurrent(index)}
              aria-label={`Go to slide ${index + 1}`}
              style={{
                width:      current === index ? '28px' : '12px',
                background: current === index ? 'var(--color-accent)' : 'transparent',
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default HeroSlider;