import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaChild, FaBook, FaSchool, FaGraduationCap, FaAtom, FaBriefcase, FaBed, FaRunning, FaMusic, FaPalette, FaDesktop, FaBookOpen } from 'react-icons/fa';

const Academics = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('early');

  const tabs = [
    { id: 'early', label: 'Early Childhood', icon: <FaChild /> },
    { id: 'primary', label: 'Primary (1-5)', icon: <FaBook /> },
    { id: 'secondary', label: 'Secondary (6-10)', icon: <FaSchool /> },
    { id: 'plus2', label: '+2 Level', icon: <FaGraduationCap /> },
  ];

  const tabContent = {
    early: {
      title: 'Early Childhood Education',
      description: 'Our Nursery and KG programs focus on play-based learning that develops cognitive, social, and motor skills.',
      subjects: ['Alphabet & Phonics', 'Numbers & Counting', 'Drawing & Coloring', 'Rhymes & Music', 'Physical Activities', 'Moral Stories'],
      approach: 'Play-based learning with Montessori-inspired methods',
      classSize: '20-25 students per class',
      icon: <FaChild size={50} style={{ color: 'var(--color-primary)' }} />
    },
    primary: {
      title: 'Primary Education (Grade 1-5)',
      description: 'Building strong foundations in core subjects while nurturing creativity and curiosity.',
      subjects: ['English', 'Nepali', 'Mathematics', 'Science', 'Social Studies', 'Computer Basics', 'Arts & Crafts', 'Physical Education'],
      approach: 'Interactive learning with modern teaching aids',
      classSize: '30-35 students per class',
      icon: <FaBook size={50} style={{ color: 'var(--color-secondary)' }} />
    },
    secondary: {
      title: 'Secondary Education (Grade 6-10)',
      description: 'Comprehensive curriculum preparing students for SEE (Secondary Education Examination).',
      subjects: ['English', 'Nepali', 'Mathematics', 'Science', 'Social Studies', 'Optional Mathematics', 'Computer Science', 'Health & Population'],
      approach: 'Concept-based learning with practical experiments',
      classSize: '35-40 students per class',
      icon: <FaSchool size={50} style={{ color: 'var(--color-accent)' }} />
    },
    plus2: {
      title: '+2 Higher Secondary Education',
      description: 'Advanced secondary education with specialized streams for career preparation.',
      streams: [
        { name: 'Science', subjects: ['Physics', 'Chemistry', 'Biology/Math', 'English', 'Nepali'], icon: <FaAtom /> },
        { name: 'Management', subjects: ['Accountancy', 'Economics', 'Business Studies', 'English', 'Nepali'], icon: <FaBriefcase /> },
        { name: 'Law', subjects: ['Legal Studies', 'Political Science', 'Economics', 'English', 'Nepali'], icon: <FaBookOpen /> },
        { name: 'Humanities', subjects: ['Sociology', 'History', 'Political Science', 'English', 'Nepali'], icon: <FaPalette /> },
      ],
      approach: 'Stream-specific specialized teaching with career counseling',
      classSize: '30-35 students per class',
      icon: <FaGraduationCap size={50} style={{ color: 'var(--color-primary)' }} />
    }
  };

  const extraCurricular = [
    { icon: <FaRunning size={30} />, title: 'Sports', desc: 'Football, Basketball, Volleyball, Cricket, Athletics' },
    { icon: <FaMusic size={30} />, title: 'Music & Dance', desc: 'Classical and modern music, traditional Nepali dance' },
    { icon: <FaPalette size={30} />, title: 'Arts', desc: 'Drawing, Painting, Craft, Sculpture' },
    { icon: <FaDesktop size={30} />, title: 'Computer Lab', desc: 'Modern lab with 40+ computers, coding classes' },
    { icon: <FaBookOpen size={30} />, title: 'Library', desc: '5000+ books, digital library access' },
    { icon: <FaBed size={30} />, title: 'Boarding', desc: 'Hostel facilities with meals and supervision' },
  ];

  const currentContent = tabContent[activeTab];

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
          <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>{t('academics')}</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Comprehensive Education from Nursery to +2</p>
        </div>
      </div>

      {/* Tabs Section */}
      <section className="section">
        <div className="container">
          <div className="section-title scroll-animate">
            <h2>{t('curriculum')}</h2>
          </div>

          {/* Tab Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '40px',
            flexWrap: 'wrap'
          }} className="scroll-animate">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '14px 24px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid',
                  borderColor: activeTab === tab.id ? 'var(--color-primary)' : '#e5e7eb',
                  background: activeTab === tab.id ? 'var(--color-primary)' : 'white',
                  color: activeTab === tab.id ? 'white' : 'var(--color-dark)',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'var(--transition)'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="card scroll-animate" style={{ padding: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              {currentContent.icon}
              <div>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--color-secondary)', marginBottom: '8px' }}>{currentContent.title}</h3>
                <p style={{ color: 'var(--color-muted)', fontSize: '1rem' }}>{currentContent.description}</p>
              </div>
            </div>

            {activeTab === 'plus2' ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px'
              }} className="streams-grid">
                {currentContent.streams.map((stream, idx) => (
                  <div key={idx} style={{
                    padding: '24px',
                    background: 'var(--color-light)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--color-accent)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span style={{ color: 'var(--color-secondary)' }}>{stream.icon}</span>
                      <h4 style={{ color: 'var(--color-secondary)', fontSize: '1.1rem' }}>{stream.name}</h4>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {stream.subjects.map((sub, i) => (
                        <li key={i} style={{ padding: '4px 0', color: 'var(--color-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: 'var(--color-accent)' }}>•</span> {sub}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <h4 style={{ color: 'var(--color-secondary)', marginBottom: '12px' }}>Subjects:</h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                  marginBottom: '24px'
                }} className="subjects-grid">
                  {currentContent.subjects.map((subject, idx) => (
                    <div key={idx} style={{
                      padding: '10px 16px',
                      background: 'var(--color-light)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.9rem',
                      color: 'var(--color-secondary)',
                      fontWeight: 500
                    }}>
                      {subject}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginTop: '24px',
              paddingTop: '24px',
              borderTop: '1px solid #e5e7eb'
            }} className="info-grid">
              <div>
                <h4 style={{ color: 'var(--color-secondary)', marginBottom: '6px' }}>Teaching Approach</h4>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>{currentContent.approach}</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--color-secondary)', marginBottom: '6px' }}>Class Size</h4>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>{currentContent.classSize}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Extra-Curricular */}
      <section style={{ background: 'var(--color-light)', padding: '80px 0' }}>
        <div className="container">
          <div className="section-title scroll-animate">
            <h2>{t('extraCurricular')}</h2>
            <p>Holistic development beyond the classroom</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px'
          }} className="extra-grid">
            {extraCurricular.map((item, index) => (
              <div key={index} className="card scroll-animate" style={{
                padding: '28px',
                textAlign: 'center'
              }}>
                <div style={{ color: 'var(--color-primary)', marginBottom: '14px' }}>{item.icon}</div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--color-secondary)' }}>{item.title}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Boarding Facilities */}
      <section className="section">
        <div className="container">
          <div className="section-title scroll-animate">
            <h2>{t('boardingFacilities')}</h2>
          </div>
          <div className="card scroll-animate" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '20px' }}>
              <FaBed size={40} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
              <div>
                <h3 style={{ color: 'var(--color-secondary)', marginBottom: '12px' }}>Hostel Accommodation</h3>
                <p style={{ color: 'var(--color-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
                  Our boarding facilities provide a safe and nurturing home away from home. With separate hostels for boys and girls, 
                  we ensure proper supervision, nutritious meals, and a disciplined environment conducive to learning.
                </p>
                <ul style={{ color: 'var(--color-muted)', lineHeight: 2 }}>
                  <li>✓ 24/7 Security and Supervision</li>
                  <li>✓ Nutritious Meals (Breakfast, Lunch, Dinner)</li>
                  <li>✓ Study Hours with Teacher Assistance</li>
                  <li>✓ Regular Health Checkups</li>
                  <li>✓ Recreation and Sports Facilities</li>
                  <li>✓ Clean and Spacious Rooms</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .streams-grid { grid-template-columns: 1fr !important; }
          .subjects-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .extra-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .subjects-grid { grid-template-columns: 1fr !important; }
          .extra-grid { grid-template-columns: 1fr !important; }
          .info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
};

export default Academics;