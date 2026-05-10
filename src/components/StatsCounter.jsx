import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaUserGraduate, FaChalkboardTeacher, FaCalendarAlt, FaTrophy } from 'react-icons/fa';

const StatsCounter = () => {
  const { t } = useLanguage();
  const [counts, setCounts] = useState({ students: 0, teachers: 0, years: 0, awards: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  const stats = [
    { icon: <FaUserGraduate size={36} />, end: 1200, label: t('studentsEnrolled'), suffix: '+' },
    { icon: <FaChalkboardTeacher size={36} />, end: 60, label: t('qualifiedTeachers'), suffix: '+' },
    { icon: <FaCalendarAlt size={36} />, end: 25, label: t('yearsOfExcellence'), suffix: '+' },
    { icon: <FaTrophy size={36} />, end: 50, label: t('awardsWon'), suffix: '+' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setCounts({
        students: Math.floor(1200 * easeOut),
        teachers: Math.floor(60 * easeOut),
        years: Math.floor(25 * easeOut),
        awards: Math.floor(50 * easeOut)
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible]);

  const countValues = [counts.students, counts.teachers, counts.years, counts.awards];

  return (
    <div ref={ref} style={{
      background: 'var(--color-secondary)',
      padding: '60px 0',
      color: 'white'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '30px',
          textAlign: 'center'
        }} className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} style={{ padding: '20px' }}>
              <div style={{
                color: 'var(--color-accent)',
                marginBottom: '16px'
              }}>{stat.icon}</div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                fontFamily: 'var(--font-display)',
                marginBottom: '8px'
              }}>
                {countValues[index]}{stat.suffix}
              </div>
              <div style={{
                fontSize: '0.95rem',
                color: '#cbd5e1'
              }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
};

export default StatsCounter;
