import React from 'react';
import { Link } from 'react-router-dom';
import { useFirestore } from '../hooks/useFirestore';
import { defaultNotices, defaultNews, defaultFaculty, defaultGallery } from '../data/defaultData';
import { FaBullhorn, FaNewspaper, FaChalkboardTeacher, FaPhotoVideo, FaArrowRight, FaClipboardList } from 'react-icons/fa';

const AdminDashboard = () => {
  const [notices] = useFirestore('admin_notices', defaultNotices);
  const [news] = useFirestore('admin_news', defaultNews);
  const [faculty] = useFirestore('admin_faculty', defaultFaculty);
  const [gallery] = useFirestore('admin_gallery', defaultGallery);
  const [applications] = useFirestore('admin_applications', []);

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  const stats = [
    { icon: <FaBullhorn size={28} />, label: 'Total Notices', count: notices.length, path: '/admin/notices', color: '#EF4444' },
    { icon: <FaNewspaper size={28} />, label: 'Total News', count: news.length, path: '/admin/news', color: '#3B82F6' },
    { icon: <FaChalkboardTeacher size={28} />, label: 'Total Faculty', count: faculty.length, path: '/admin/faculty', color: '#8B5CF6' },
    { icon: <FaPhotoVideo size={28} />, label: 'Gallery Items', count: gallery.length, path: '/admin/gallery', color: '#10B981' },
    { icon: <FaClipboardList size={28} />, label: 'Applications', count: applications.length, path: '/admin/applications', color: '#F59E0B', badge: pendingCount > 0 ? `${pendingCount} pending` : null },
  ];

  return (
    <div>
      <h2 style={{ fontSize: '1.8rem', color: 'var(--color-secondary)', marginBottom: '24px' }}>
        Dashboard Overview
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '20px',
        marginBottom: '40px'
      }} className="dashboard-stats">
        {stats.map((stat, index) => (
          <Link
            key={index}
            to={stat.path}
            style={{
              background: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              boxShadow: 'var(--shadow-card)',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              transition: 'var(--transition)',
              borderTop: `4px solid ${stat.color}`
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-card)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: stat.color }}>{stat.icon}</div>
              <FaArrowRight size={16} style={{ color: 'var(--color-muted)' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-secondary)', margin: 0 }}>
                {stat.count}
              </h3>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', margin: '4px 0 0' }}>{stat.label}</p>
              {stat.badge && (
                <span style={{
                  display: 'inline-block', marginTop: '6px',
                  background: '#FEF3C7', color: '#92400E',
                  fontSize: '0.7rem', fontWeight: 700,
                  padding: '2px 8px', borderRadius: '999px',
                }}>{stat.badge}</span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-md)',
        padding: '28px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--color-secondary)', marginBottom: '20px' }}>
          Quick Actions
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px'
        }} className="quick-actions">
          {[
            { label: 'Add New Notice', path: '/admin/notices', desc: 'Post a new announcement' },
            { label: 'Add News Article', path: '/admin/news', desc: 'Publish latest news' },
            { label: 'Upload Gallery', path: '/admin/gallery', desc: 'Add new photos' },
            { label: 'Add Faculty', path: '/admin/faculty', desc: 'Register new teacher' },
            { label: 'Edit Hero Slider', path: '/admin/hero-slider', desc: 'Update homepage slides' },
            { label: 'Page Content', path: '/admin/page-content', desc: 'Edit About, Principal, Contact text' },
            { label: 'Site Settings', path: '/admin/settings', desc: 'Change colors & info' },
            { label: 'View Applications', path: '/admin/applications', desc: 'Review admission forms' },
          ].map((action, index) => (
            <Link
              key={index}
              to={action.path}
              style={{
                padding: '16px',
                background: 'var(--color-light)',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'var(--transition)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--color-secondary)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--color-light)';
                e.currentTarget.style.color = 'inherit';
              }}
            >
              <h4 style={{ fontSize: '0.95rem', marginBottom: '4px', fontWeight: 600 }}>{action.label}</h4>
              <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: 0 }}>{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1200px) {
          .dashboard-stats { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 1024px) {
          .dashboard-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .quick-actions { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .dashboard-stats { grid-template-columns: 1fr !important; }
          .quick-actions { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;