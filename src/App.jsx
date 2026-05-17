import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { useFirestore } from './hooks/useFirestore';
import { defaultSiteSettings } from './data/defaultData';
import ScrollToTop from './components/ScrollToTop';

// Public Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Academics from './pages/Academics';
import Admissions from './pages/Admissions';
import Faculty from './pages/Faculty';
import Gallery from './pages/Gallery';
import NewsEvents from './pages/NewsEvents';
import NoticeBoard from './pages/NoticeBoard';
import Contact from './pages/Contact';

// Auth
import Login from './admin/Login';
import ProtectedRoute from './admin/ProtectedRoute';

// Admin
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import HeroSliderManager from './admin/HeroSliderManager';
import NoticeManager from './admin/NoticeManager';
import NewsManager from './admin/NewsManager';
import FacultyManager from './admin/FacultyManager';
import StudentsManager from './admin/StudentsManager';
import GalleryManager from './admin/GalleryManager';
import TestimonialsManager from './admin/TestimonialsManager';
import AchievementsManager from './admin/AchievementsManager';
import ApplicationsManager from './admin/ApplicationsManager';
import SiteSettings from './admin/SiteSettings';
import PageContentManager from './admin/PageContentManager';
import UserManager from './admin/UserManager';
import MarksManager from './admin/MarksManager';
import UserProfile from './admin/UserProfile';

// Teacher & Student portals
import TeacherDashboard from './pages/TeacherDashboard';
import StudentResults from './pages/StudentResults';
import Students from './pages/Students';
import StudentResultViewer from './components/StudentResultViewer';
import StudentResultLookup from './pages/StudentResultLookup';

import './styles/global.css';

const AppInner = () => {
  const [siteSettings] = useFirestore('admin_site_settings', defaultSiteSettings);

  useEffect(() => {
    if (siteSettings?.primaryColor)
      document.documentElement.style.setProperty('--color-primary', siteSettings.primaryColor);
    if (siteSettings?.secondaryColor)
      document.documentElement.style.setProperty('--color-secondary', siteSettings.secondaryColor);
    if (siteSettings?.accentColor)
      document.documentElement.style.setProperty('--color-accent', siteSettings.accentColor);
  }, [siteSettings]);

  return (
    <Routes>
      {/* ── Public Pages ─────────────────────────────────── */}
      <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
      <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
      <Route path="/academics" element={<><Navbar /><Academics /><Footer /></>} />
      <Route path="/admissions" element={<><Navbar /><Admissions /><Footer /></>} />
      <Route path="/faculty" element={<><Navbar /><Faculty /><Footer /></>} />
      <Route path="/gallery" element={<><Navbar /><Gallery /><Footer /></>} />
      <Route path="/news-events" element={<><Navbar /><NewsEvents /><Footer /></>} />
      <Route path="/notice-board" element={<><Navbar /><NoticeBoard /><Footer /></>} />
      <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />

      {/* ── Shared Login ─────────────────────────────────── */}
      <Route path="/login" element={<Login />} />
      {/* Backward compat – old admin login link */}
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />

      {/* ── Admin Portal ─────────────────────────────────── */}
      <Route path="/admin/*" element={
        <ProtectedRoute roles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"    element={<AdminDashboard />} />
        <Route path="hero-slider"  element={<HeroSliderManager />} />
        <Route path="notices"      element={<NoticeManager />} />
        <Route path="news"         element={<NewsManager />} />
        <Route path="faculty"      element={<FacultyManager />} />
        <Route path="students"     element={<StudentsManager />} />
        <Route path="gallery"      element={<GalleryManager />} />
        <Route path="testimonials" element={<TestimonialsManager />} />
        <Route path="achievements" element={<AchievementsManager />} />
        <Route path="applications" element={<ApplicationsManager />} />
        <Route path="marks"        element={<MarksManager />} />
        <Route path="results"      element={<StudentResultViewer />} />
        <Route path="users"        element={<UserManager />} />
        <Route path="page-content" element={<PageContentManager />} />
        <Route path="settings"     element={<SiteSettings />} />
        <Route path="profile"      element={<UserProfile />} />  {/* ← NEW */}
      </Route>

      {/* ── Teacher Portal ─────────────────────────────────────────── */}
      {/* TeacherDashboard uses its own internal <Routes> — no child routes here */}
      <Route path="/teacher/dashboard" element={<Navigate to="/teacher/students" replace />} />
      <Route path="/teacher/*" element={
        <ProtectedRoute roles={['teacher']}>
          <TeacherDashboard />
        </ProtectedRoute>
      } />
      
      {/* ── Student Portal ───────────────────────────────── */}
      <Route path="/student/results" element={
        <ProtectedRoute roles={['student']}>
          <StudentResults />
        </ProtectedRoute>
      } />

      {/* ── Public Result Lookup ─────────────────────── */}
      <Route path="/result-lookup" element={<><Navbar /><StudentResultLookup /><Footer /></>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <LanguageProvider>
      <Router>
        <ScrollToTop />
        <AppInner />
      </Router>
    </LanguageProvider>
  </AuthProvider>
);

export default App;