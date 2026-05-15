import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles, redirectTo = '/login' }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:'44px', height:'44px', borderRadius:'50%', border:'4px solid #e5e7eb', borderTopColor:'#D72638', animation:'spin 0.8s linear infinite', margin:'0 auto 12px' }} />
          <p style={{ color:'#6b7280', fontSize:'0.9rem' }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!currentUser) return <Navigate to={redirectTo} replace />;

  if (roles && !roles.includes(currentUser.role)) {
    if (currentUser.role === 'admin')   return <Navigate to="/admin/dashboard" replace />;
    if (currentUser.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    if (currentUser.role === 'student') return <Navigate to="/student/results" replace />;
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;