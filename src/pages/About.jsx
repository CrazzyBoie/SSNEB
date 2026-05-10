import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaAward, FaShieldAlt, FaUsers, FaLightbulb, FaHandshake, FaHeart, FaCheckCircle, FaSchool } from 'react-icons/fa';

const About = () => {
  const { t } = useLanguage();

  const values = [
    { icon: <FaAward size={32} />, title: t('excellence'), desc: 'Striving for the highest standards in education' },
    { icon: <FaShieldAlt size={32} />, title: t('integrity'), desc: 'Building character through honesty and ethics' },
    { icon: <FaUsers size={32} />, title: t('inclusivity'), desc: 'Embracing diversity and equal opportunities' },
    { icon: <FaLightbulb size={32} />, title: t('innovation'), desc: 'Encouraging creative thinking and new ideas' },
    { icon: <FaHandshake size={32} />, title: t('discipline'), desc: 'Fostering responsibility and self-control' },
    { icon: <FaHeart size={32} />, title: t('community'), desc: 'Building strong bonds within our school family' },
  ];

  const features = [
    { icon: <FaSchool size={40} />, title: 'NEB Affiliated', desc: 'Recognized by National Examinations Board' },
    { icon: <FaCheckCircle size={40} />, title: 'Govt. Recognized', desc: 'Approved by Nepal Government' },
    { icon: <FaUsers size={40} />, title: 'Experienced Faculty', desc: '60+ qualified and dedicated teachers' },
    { icon: <FaAward size={40} />, title: '25+ Years Legacy', desc: 'Established in 2057 B.S. (2000 A.D.)' },
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
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Siddhartha Sishu Niketan English Boarding School</p>
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
              Founded in 2057 B.S. (2000 A.D.), Siddhartha Sishu Niketan English Boarding School has grown from a small 
              local institution to one of the most respected schools in the Siraha district. What started with just a handful 
              of students and teachers has now blossomed into a thriving educational community with over 1200 students and 60+ 
              qualified faculty members.
            </p>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--color-dark)' }}>
              Located in Siraha-1, Nepal, our school has been at the forefront of providing quality English-medium education 
              to the children of the Terai region. Over the past 25+ years, we have consistently produced outstanding academic 
              results while nurturing well-rounded individuals who contribute positively to society.
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
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-dark)' }}>
                To provide quality, holistic education that nurtures every child's potential. We aim to create a learning 
                environment that fosters academic excellence, moral values, and practical skills necessary for success in 
                the modern world.
              </p>
            </div>
            <div className="card scroll-animate" style={{ padding: '40px' }}>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--color-secondary)', marginBottom: '16px' }}>{t('vision')}</h3>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--color-dark)' }}>
                To be the leading school in the Terai region known for academic excellence and character building. We envision 
                a future where every student from SSNEBS becomes a confident, compassionate, and capable leader who makes 
                meaningful contributions to Nepal and the world.
              </p>
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
                  National Examinations Board (NEB)
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