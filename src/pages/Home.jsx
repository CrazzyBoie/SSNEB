import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useFirestore } from '../hooks/useFirestore';
import { defaultNews, defaultAchievements } from '../data/defaultData';
import HeroSlider from '../components/HeroSlider';
import StatsCounter from '../components/StatsCounter';
import NoticeTicker from '../components/NoticeTicker';
import TestimonialCarousel from '../components/TestimonialCarousel';
import { FaChild, FaBook, FaSchool, FaGraduationCap, FaAtom, FaBriefcase, FaArrowRight } from 'react-icons/fa';
import { FaFacebook, FaYoutube, FaInstagram, FaTiktok } from 'react-icons/fa';
import { defaultSiteSettings } from '../data/defaultData';



// Logo loaded via useFirestore
// const LOGO_BASE64 = "data:image/jpeg;base64,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";

const Home = () => {
  const { t } = useLanguage();
  const [news] = useFirestore('admin_news', defaultNews);
  const [achievements] = useFirestore('admin_achievements', defaultAchievements);
  const [siteSettings] = useFirestore('admin_site_settings', defaultSiteSettings);

  const academicsCards = [
    { icon: <FaChild size={40} />, title: t('nurseryKg'), desc: t('nurseryDesc'), color: '#FF6B6B' },
    { icon: <FaBook size={40} />, title: t('primary'), desc: t('primaryDesc'), color: '#4ECDC4' },
    { icon: <FaSchool size={40} />, title: t('lowerSecondary'), desc: t('lowerSecondaryDesc'), color: '#45B7D1' },
    { icon: <FaGraduationCap size={40} />, title: t('secondary'), desc: t('secondaryDesc'), color: '#96CEB4' },
    { icon: <FaAtom size={40} />, title: t('plus2Science'), desc: t('plus2ScienceDesc'), color: '#DDA0DD' },
    { icon: <FaBriefcase size={40} />, title: t('plus2Management'), desc: t('plus2ManagementDesc'), color: '#FFD93D' },
  ];

  return (
    <main>
      {/* Hero */}
      <HeroSlider />

      {/* Notice Ticker */}
      <NoticeTicker />

      {/* Stats */}
      <StatsCounter />

      {/* Academics Overview */}
      <section className="section">
        <div className="container">
          <div className="section-title scroll-animate">
            <h2>{t('whatWeOffer')}</h2>
            <p>Comprehensive education from early childhood to higher secondary</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px'
          }} className="academics-grid">
            {academicsCards.map((card, index) => (
              <div key={index} className="card scroll-animate" style={{
                padding: '32px',
                textAlign: 'center',
                borderTop: `4px solid ${card.color}`,
                transition: 'var(--transition)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
                e.currentTarget.style.borderTopWidth = '6px';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                e.currentTarget.style.borderTopWidth = '4px';
              }}>
                <div style={{ color: card.color, marginBottom: '16px' }}>{card.icon}</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--color-secondary)' }}>{card.title}</h3>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principal's Message */}
      <section style={{ background: 'var(--color-light)', padding: '80px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '50px',
            alignItems: 'center'
          }} className="principal-grid">
            <div className="scroll-animate" style={{ textAlign: 'center' }}>
              <div style={{
                width: '250px',
                height: '250px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                boxShadow: '0 10px 40px rgba(26,58,107,0.3)',
                fontSize: '5rem',
                color: 'white',
                fontFamily: 'var(--font-display)',
                fontWeight: 900
              }}>
                P
              </div>
              <h3 style={{ marginTop: '20px', color: 'var(--color-secondary)' }}>{t('principalName')}</h3>
              <p style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{t('principalTitle')}</p>
            </div>
            <div className="scroll-animate">
              <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: 'var(--color-secondary)' }}>{t('principalMessage')}</h2>
              <div style={{
                fontSize: '3rem',
                color: 'var(--color-accent)',
                lineHeight: 0,
                marginBottom: '20px'
              }}>❝</div>
              <p style={{
                fontSize: '1.1rem',
                lineHeight: 1.8,
                color: 'var(--color-dark)',
                fontStyle: 'italic'
              }}>
                {t('principalQuote')}
              </p>
              <div style={{
                fontSize: '3rem',
                color: 'var(--color-accent)',
                lineHeight: 0,
                marginTop: '20px',
                textAlign: 'right'
              }}>❞</div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="section">
        <div className="container">
          <div className="section-title scroll-animate">
            <h2>{t('ourPride')}</h2>
            <p>Celebrating excellence and remarkable achievements</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px'
          }} className="achievements-grid">
            {achievements.slice(0, 6).map((achievement, index) => (
              <div key={achievement.id} className="card scroll-animate" style={{
                padding: '28px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                borderLeft: '4px solid var(--color-accent)'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  flexShrink: 0
                }}>{achievement.icon}</div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '6px', color: 'var(--color-secondary)' }}>{achievement.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '4px' }}>{achievement.student}</p>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 10px',
                    background: 'var(--color-light)',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    color: 'var(--color-secondary)',
                    fontWeight: 600
                  }}>{achievement.year} B.S.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialCarousel />

      {/* Latest News */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <div className="section-title scroll-animate">
            <h2>{t('latestNews')}</h2>
            <p>Stay updated with the latest happenings</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px'
          }} className="news-grid">
            {news.slice(0, 3).map((item, index) => (
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
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: 'var(--color-secondary)' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
                    {item.excerpt}
                  </p>
                  <Link to="/news-events" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textDecoration: 'none'
                  }}>
                    {t('readMore')} <FaArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/news-events" className="btn btn-primary">
              {t('viewAllNews')}
            </Link>
          </div>
        </div>
      </section>

      {/* Social Media Strip */}
      <section style={{ background: 'var(--color-secondary)', padding: '40px 0', color: 'white' }}>
  <div className="container" style={{ textAlign: 'center' }}>
    <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>{t('followUs')}</h3>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
      {[
        { icon: <FaFacebook size={24} />, color: '#1877F2', key: 'facebook', label: 'Facebook' },
        { icon: <FaYoutube size={24} />, color: '#FF0000', key: 'youtube', label: 'YouTube' },
        { icon: <FaInstagram size={24} />, color: '#E4405F', key: 'instagram', label: 'Instagram' },
        { icon: <FaTiktok size={24} />, color: '#000000', key: 'tiktok', label: 'TikTok' },
      ].map((social) => (
        <a
          key={social.label}
          href={siteSettings?.[social.key] || '#'}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: social.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textDecoration: 'none',
            transition: 'var(--transition)',
            opacity: siteSettings?.[social.key] ? 1 : 0.5,
            cursor: siteSettings?.[social.key] ? 'pointer' : 'default'
          }}
          onMouseEnter={e => {
            if (siteSettings?.[social.key]) {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.1)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
          }}
          onClick={e => {
            if (!siteSettings?.[social.key]) {
              e.preventDefault();
            }
          }}
        >
          {social.icon}
        </a>
      ))}
    </div>
  </div>
</section>

      <style>{`
        @media (max-width: 1024px) {
          .academics-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .achievements-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .news-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .principal-grid { grid-template-columns: 1fr !important; gap: 30px !important; }
        }
        @media (max-width: 768px) {
          .academics-grid { grid-template-columns: 1fr !important; }
          .achievements-grid { grid-template-columns: 1fr !important; }
          .news-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
};

export default Home;