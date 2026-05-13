import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useFirestore } from '../hooks/useFirestore';
import { defaultPageContent } from '../data/defaultData';
import { FaAward, FaShieldAlt, FaUsers, FaLightbulb, FaHandshake, FaHeart, FaCheckCircle, FaSchool } from 'react-icons/fa';

const About = () => {
  const { t } = useLanguage();
  const [pageContent] = useFirestore('admin_page_content', defaultPageContent);

  const about = pageContent?.about || defaultPageContent.about;
  const cv = about.coreValues || defaultPageContent.about.coreValues;

  const values = [
    { icon: <FaAward size={32} />,     title: t('excellence'),  desc: cv.excellence  },
    { icon: <FaShieldAlt size={32} />, title: t('integrity'),   desc: cv.integrity   },
    { icon: <FaUsers size={32} />,     title: t('inclusivity'), desc: cv.inclusivity },
    { icon: <FaLightbulb size={32} />, title: t('innovation'),  desc: cv.innovation  },
    { icon: <FaHandshake size={32} />, title: t('discipline'),  desc: cv.discipline  },
    { icon: <FaHeart size={32} />,     title: t('community'),   desc: cv.community   },
  ];

  const features = [
    { icon: <FaSchool size={40} />,       title: about.feature1Title, desc: about.feature1Desc },
    { icon: <FaCheckCircle size={40} />,  title: about.feature2Title, desc: about.feature2Desc },
    { icon: <FaUsers size={40} />,        title: about.feature3Title, desc: about.feature3Desc },
    { icon: <FaAward size={40} />,        title: about.feature4Title, desc: about.feature4Desc },
  ];

  return (
    <main>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%)',
        padding: '100px 0',
        textAlign: 'center',
        color: 'white'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>About Us</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>{about.schoolName}</p>
        </div>
      </div>

      {/* Our Story */}
      <section className="section">
        <div className="container">
          <div className="section-title scroll-animate">
            <h2>{t('ourStory')}</h2>
          </div>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            textAlign: 'center'
          }} className="scroll-animate">
            <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--color-dark)', marginBottom: '24px' }}>
              {about.story1}
            </p>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--color-dark)' }}>
              {about.story2}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section style={{ background: 'var(--color-light)', padding: '80px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px'
          }} className="mission-grid">
            <div className="card scroll-animate" style={{ padding: '40px' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary)', marginBottom: '16px' }}>{t('mission')}</h3>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-dark)' }}>{about.mission}</p>
            </div>
            <div className="card scroll-animate" style={{ padding: '40px' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--color-secondary)', marginBottom: '16px' }}>{t('vision')}</h3>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-dark)' }}>{about.vision}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section">
        <div className="container">
          <div className="section-title scroll-animate">
            <h2>{t('coreValues')}</h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px'
          }} className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="card scroll-animate" style={{
                padding: '32px',
                textAlign: 'center',
                borderTop: '4px solid var(--color-accent)'
              }}>
                <div style={{ color: 'var(--color-secondary)', marginBottom: '16px' }}>{value.icon}</div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '10px', color: 'var(--color-secondary)' }}>{value.title}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{ background: 'var(--color-secondary)', padding: '80px 0', color: 'white' }}>
        <div className="container">
          <div className="section-title scroll-animate">
            <h2 style={{ color: 'white' }}>{t('whyChooseUs')}</h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px'
          }} className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="scroll-animate" style={{
                textAlign: 'center',
                padding: '24px'
              }}>
                <div style={{ color: 'var(--color-accent)', marginBottom: '16px' }}>{feature.icon}</div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{feature.title}</h4>
                <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Affiliation */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <div className="scroll-animate">
            <h2 style={{ fontSize: '2rem', color: 'var(--color-secondary)', marginBottom: '20px' }}>Affiliation</h2>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '20px',
              padding: '30px 50px',
              background: 'var(--color-light)',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--color-accent)'
            }}>
              <FaSchool size={50} style={{ color: 'var(--color-primary)' }} />
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '1.2rem', color: 'var(--color-secondary)', marginBottom: '6px' }}>
                  {about.affiliation}
                </h4>
                <p style={{ color: 'var(--color-muted)' }}>Nepal Government Recognized Institution</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .mission-grid { grid-template-columns: 1fr !important; }
          .values-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .values-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
};

export default About;