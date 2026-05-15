import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaHome, FaImages, FaBullhorn, FaNewspaper, FaChalkboardTeacher,
  FaUserGraduate, FaPhotoVideo, FaComments, FaTrophy, FaCog,
  FaSignOutAlt, FaBars, FaClipboardList, FaFileAlt, FaUsers, FaClipboard,
  FaChartLine, FaUserCircle
} from 'react-icons/fa';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/admin/dashboard',    icon: <FaHome />,              label: 'Dashboard' },
    { path: '/admin/hero-slider',  icon: <FaImages />,            label: 'Hero Slider' },
    { path: '/admin/notices',      icon: <FaBullhorn />,          label: 'Notice Board' },
    { path: '/admin/news',         icon: <FaNewspaper />,         label: 'News & Events' },
    { path: '/admin/faculty',      icon: <FaChalkboardTeacher />, label: 'Faculty' },
    { path: '/admin/students',     icon: <FaUserGraduate />,      label: 'Students' },
    { path: '/admin/gallery',      icon: <FaPhotoVideo />,        label: 'Gallery' },
    { path: '/admin/testimonials', icon: <FaComments />,          label: 'Testimonials' },
    { path: '/admin/achievements', icon: <FaTrophy />,            label: 'Achievements' },
    { path: '/admin/applications', icon: <FaClipboardList />,     label: 'Applications' },
    { path: '/admin/marks',        icon: <FaClipboard />,         label: 'Marks Manager' },
    { path: '/admin/results',      icon: <FaChartLine />,         label: 'View Results' },
    { path: '/admin/users',        icon: <FaUsers />,             label: 'User Management' },
    { path: '/admin/page-content', icon: <FaFileAlt />,           label: 'Page Content' },
    { path: '/admin/settings',     icon: <FaCog />,               label: 'Site Settings' },
    { path: '/admin/profile',      icon: <FaUserCircle />,        label: 'My Profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Avatar initials for topbar
  const initials = (currentUser?.name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{
        width: sidebarOpen ? '260px' : '0',
        overflow: 'hidden',
        transition: 'width 0.3s ease',
        background: 'var(--color-secondary)',
        color: 'white',
        position: 'fixed',
        height: '100vh',
        zIndex: 1000
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}>
              SSN
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>SSNEBS</p>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.7 }}>Admin Panel</p>
            </div>
          </div>
        </div>
        <nav style={{ padding: '16px 0', overflowY: 'auto', height: 'calc(100vh - 100px)' }}>
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                color: location.pathname === item.path ? 'white' : 'rgba(255,255,255,0.7)',
                background: location.pathname === item.path ? 'rgba(245,197,24,0.15)' : 'transparent',
                borderLeft: location.pathname === item.path ? '4px solid var(--color-accent)' : '4px solid transparent',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: location.pathname === item.path ? 600 : 400,
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {item.icon} {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              color: 'rgba(255,255,255,0.7)',
              background: 'transparent',
              border: 'none',
              borderLeft: '4px solid transparent',
              fontSize: '0.9rem',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          >
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-content" style={{
        flex: 1,
        marginLeft: sidebarOpen ? '260px' : '0',
        transition: 'margin-left 0.3s ease',
        background: '#f8fafc',
        minHeight: '100vh'
      }}>
        {/* Top Bar */}
        <div style={{
          background: 'white',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          marginBottom: '24px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.2rem',
              color: 'var(--color-secondary)',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <FaBars />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                background: 'var(--color-accent)',
                color: 'var(--color-dark)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none'
              }}
            >
              🌐 View Site
            </a>
            {/* Profile avatar link */}
            <Link
              to="/admin/profile"
              title="My Profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                color: 'var(--color-secondary)',
              }}
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="avatar"
                  style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-accent)' }}
                />
              ) : (
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: 'var(--color-secondary)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 800,
                }}>
                  {initials}
                </div>
              )}
              <span style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
                {currentUser?.name || 'Admin'}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaSignOutAlt size={12} /> Logout
            </button>
          </div>
        </div>

        <div style={{ padding: '0 24px 24px' }}>
          <Outlet />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { position: fixed !important; z-index: 1000 !important; }
          .admin-content { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;