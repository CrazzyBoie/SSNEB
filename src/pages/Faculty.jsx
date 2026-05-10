import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useFirestore } from '../hooks/useFirestore';
import { defaultFaculty } from '../data/defaultData';
import { FaGraduationCap, FaBriefcase } from 'react-icons/fa';

const Faculty = () => {
  const { t } = useLanguage();
  const [faculty] = useFirestore('admin_faculty', defaultFaculty);
  const [filter, setFilter] = useState('All');

  const filters = ['All', 'Admin', 'Primary', 'Secondary', '+2'];
  const filteredFaculty = filter === 'All' ? faculty : faculty.filter(f => f.department === filter);
  const leadership = filteredFaculty.filter(f => f.isLeadership);
  const teachers = filteredFaculty.filter(f => !f.isLeadership);

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
          <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>{t('faculty')}</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Meet Our Dedicated Team of Educators</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <section className="section" style={{ paddingBottom: '20px' }}>
        <div className="container">
          <div className="scroll-animate" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '20px'
          }}>
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid',
                  borderColor: filter === f ? 'var(--color-primary)' : '#e5e7eb',
                  background: filter === f ? 'var(--color-primary)' : 'white',
                  color: filter === f ? 'white' : 'var(--color-dark)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      {leadership.length > 0 && (
        <section style={{ padding: '20px 0 40px' }}>
          <div className="container">
            <h3 style={{
              textAlign: 'center',
              fontSize: '1.5rem',
              color: 'var(--color-secondary)',
              marginBottom: '30px'
            }} className="scroll-animate">Leadership Team</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
              maxWidth: '900px',
              margin: '0 auto'
            }} className="leadership-grid">
              {leadership.map((member, index) => (
                <div key={member.id} className="card scroll-animate" style={{
                  padding: '28px',
                  textAlign: 'center',
                  borderTop: '4px solid var(--color-accent)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    overflow: 'hidden'
                  }}>
                    {member.photo
                      ? <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      : member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--color-secondary)', marginBottom: '6px' }}>{member.name}</h4>
                  <p style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '10px' }}>{member.subject}</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaGraduationCap size={12} /> {member.qualification}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FaBriefcase size={12} /> {member.experience} yrs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Teachers Grid */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <h3 style={{
            textAlign: 'center',
            fontSize: '1.5rem',
            color: 'var(--color-secondary)',
            marginBottom: '30px'
          }} className="scroll-animate">Our Teachers</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px'
          }} className="teachers-grid">
            {teachers.map((member, index) => (
              <div key={member.id} className="card scroll-animate" style={{
                padding: '24px',
                textAlign: 'center',
                transition: 'var(--transition)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'var(--color-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  color: 'var(--color-secondary)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  overflow: 'hidden'
                }}>
                  {member.photo
                    ? <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <h4 style={{ fontSize: '1rem', color: 'var(--color-secondary)', marginBottom: '4px' }}>{member.name}</h4>
                <p style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>{member.subject}</p>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2px' }}>
                    <FaGraduationCap size={10} /> {member.qualification}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <FaBriefcase size={10} /> {member.experience} years experience
                  </div>
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'var(--color-secondary)',
                  transform: 'scaleX(0)',
                  transition: 'transform 0.3s ease',
                  transformOrigin: 'left'
                }} className="teacher-bar" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .leadership-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .teachers-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .leadership-grid { grid-template-columns: 1fr !important; }
          .teachers-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .teachers-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
};

export default Faculty;