import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLock, FaUser, FaUserShield, FaChalkboardTeacher, FaUserGraduate, FaEye, FaEyeSlash, FaHome } from 'react-icons/fa';

const roleInfo = {
  admin:   { icon: <FaUserShield size={18} />,       label: 'Admin',   color: '#D72638', desc: 'Full site control' },
  teacher: { icon: <FaChalkboardTeacher size={18} />, label: 'Teacher', color: '#1A3A6B', desc: 'Manage student marks' },
  student: { icon: <FaUserGraduate size={18} />,      label: 'Student', color: '#10B981', desc: 'View your results' },
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectedRole, setDetectedRole] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setDetectedRole(null);
    
    try {
      const user = await login(username, password);
      setDetectedRole(user.role);
      
      if (user.role === 'admin')   navigate('/admin/dashboard');
      if (user.role === 'teacher') navigate('/teacher/students');
      if (user.role === 'student') navigate('/student/results');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const activeRole = detectedRole ? roleInfo[detectedRole] : null;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1A3A6B 0%, #D72638 100%)',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative circles */}
      <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'300px', height:'300px', borderRadius:'50%', background:'rgba(245,197,24,0.1)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-60px', left:'-60px', width:'220px', height:'220px', borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />

      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '44px 40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Header - Centered */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          {/* Logo - Centered with margin auto */}
          <div style={{ 
            width: '76px', 
            height: '76px', 
            margin: '0 auto 14px',  // This centers the container horizontally
            borderRadius: '50%', 
            border: '3px solid #D72638', 
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f9fafb'
          }}>
            <img 
              src="/logo.jpg" 
              alt="SSNEBS" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                display: 'block'
              }} 
            />
          </div>
          <h2 style={{ color:'#1A3A6B', fontSize:'1.5rem', fontWeight:800, margin:0 }}>SSNEBS Portal</h2>
          <p style={{ color:'#6b7280', fontSize:'0.85rem', margin:'4px 0 0' }}>Siddhartha Sishu Niketan English Boarding School</p>
        </div>

        {/* Role Detection Status */}
        {activeRole && (
          <div style={{ 
            display:'flex', 
            alignItems:'center', 
            justifyContent: 'center',
            gap:'8px', 
            marginBottom:'20px',
            padding: '10px 16px',
            background: `${activeRole.color}12`,
            border: `2px solid ${activeRole.color}`,
            borderRadius: '10px',
            color: activeRole.color,
            fontSize: '0.875rem',
            fontWeight: 600,
          }}>
            {activeRole.icon}
            <span>Detected: {activeRole.label}</span>
          </div>
        )}

        {/* Divider */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
          <div style={{ flex:1, height:'1px', background:'#e5e7eb' }} />
          <span style={{ fontSize:'0.78rem', color:'#9ca3af', display:'flex', alignItems:'center', gap:'6px' }}>
            <FaUser style={{ color: '#6b7280' }} />
            Sign in to your account
          </span>
          <div style={{ flex:1, height:'1px', background:'#e5e7eb' }} />
        </div>

        {/* Error */}
        {error && (
          <div style={{ background:'#fef2f2', color:'#dc2626', padding:'11px 14px', borderRadius:'8px', marginBottom:'16px', fontSize:'0.875rem', fontWeight:600, border:'1px solid #fecaca' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div style={{ position:'relative' }}>
            <FaUser style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:'0.85rem' }} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={{ width:'100%', padding:'12px 14px 12px 40px', border:'2px solid #e5e7eb', borderRadius:'10px', fontSize:'0.95rem', outline:'none', boxSizing:'border-box', fontFamily:'inherit', transition:'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#D72638'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <div style={{ position:'relative' }}>
            <FaLock style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:'0.85rem' }} />
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width:'100%', padding:'12px 42px 12px 40px', border:'2px solid #e5e7eb', borderRadius:'10px', fontSize:'0.95rem', outline:'none', boxSizing:'border-box', fontFamily:'inherit', transition:'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = '#D72638'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            <button type="button" onClick={() => setShowPw(s => !s)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:'4px' }}>
              {showPw ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" disabled={loading} style={{
            padding:'13px',
            background: loading ? '#9ca3af' : '#D72638',
            color:'white',
            border:'none',
            borderRadius:'10px',
            fontSize:'1rem',
            fontWeight:700,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition:'all 0.2s',
            marginTop:'4px',
            letterSpacing:'0.02em',
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>


        {/* Back to Home */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            marginTop: '16px',
            padding: '10px',
            borderRadius: '10px',
            border: '2px solid #e5e7eb',
            color: '#6b7280',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#1A3A6B'; e.currentTarget.style.color = '#1A3A6B'; e.currentTarget.style.background = '#f0f4ff'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.background = 'transparent'; }}
        >
          <FaHome size={14} /> Back to Home
        </Link>

        <p style={{ textAlign:'center', fontSize:'0.78rem', color:'#9ca3af', marginTop:'16px', lineHeight:1.5 }}>
          Having trouble logging in?<br />Contact your administrator.
        </p>
      </div>
    </div>
  );
};

export default Login;