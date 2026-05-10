import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { useFirestore } from './hooks/useFirestore';
import { defaultSiteSettings } from './data/defaultData';

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

// Admin
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import HeroSliderManager from './admin/HeroSliderManager';
import NoticeManager from './admin/NoticeManager';
import NewsManager from './admin/NewsManager';
import FacultyManager from './admin/FacultyManager';
import GalleryManager from './admin/GalleryManager';
import TestimonialsManager from './admin/TestimonialsManager';
import AchievementsManager from './admin/AchievementsManager';
import ApplicationsManager from './admin/ApplicationsManager';
import SiteSettings from './admin/SiteSettings';
import ProtectedRoute from './admin/ProtectedRoute';

import './styles/global.css';

const App = () => {
  const [siteSettings] = useFirestore('admin_site_settings', defaultSiteSettings);

  useEffect(() => {
    if (siteSettings.primaryColor) {
      document.documentElement.style.setProperty('--color-primary', siteSettings.primaryColor);
    }
    if (siteSettings.secondaryColor) {
      document.documentElement.style.setProperty('--color-secondary', siteSettings.secondaryColor);
    }
    if (siteSettings.accentColor) {
      document.documentElement.style.setProperty('--color-accent', siteSettings.accentColor);
    }
  }, [siteSettings]);

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
          <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
          <Route path="/academics" element={<><Navbar /><Academics /><Footer /></>} />
          <Route path="/admissions" element={<><Navbar /><Admissions /><Footer /></>} />
          <Route path="/faculty" element={<><Navbar /><Faculty /><Footer /></>} />
          <Route path="/gallery" element={<><Navbar /><Gallery /><Footer /></>} />
          <Route path="/news-events" element={<><Navbar /><NewsEvents /><Footer /></>} />
          <Route path="/notice-board" element={<><Navbar /><NoticeBoard /><Footer /></>} />
          <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="hero-slider" element={<HeroSliderManager />} />
            <Route path="notices" element={<NoticeManager />} />
            <Route path="news" element={<NewsManager />} />
            <Route path="faculty" element={<FacultyManager />} />
            <Route path="gallery" element={<GalleryManager />} />
            <Route path="testimonials" element={<TestimonialsManager />} />
            <Route path="achievements" element={<AchievementsManager />} />
            <Route path="applications" element={<ApplicationsManager />} />
            <Route path="settings" element={<SiteSettings />} />
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
};

export default App;