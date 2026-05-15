import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import UserProfile from '../components/UserProfile'; // student version lives in components
import {
  FaUserGraduate, FaSignOutAlt, FaBook, FaTrophy,
  FaCheckCircle, FaTimesCircle, FaHome, FaPrint, FaUser, FaChartBar
} from 'react-icons/fa';

const GRADE_COLOR = {
  'A+': { bg: '#f0fdf4', color: '#166534' },
  'A':  { bg: '#f0fdf4', color: '#166534' },
  'B+': { bg: '#eff6ff', color: '#1e40af' },
  'B':  { bg: '#eff6ff', color: '#1e40af' },
  'C+': { bg: '#fefce8', color: '#854d0e' },
  'C':  { bg: '#fefce8', color: '#854d0e' },
  'D':  { bg: '#fff7ed', color: '#c2410c' },
  'NG': { bg: '#fef2f2', color: '#dc2626' },
};

const NEPALI_GPA = {
  'A+': { gradePoint: 4.0, description: 'Outstanding' },
  'A':  { gradePoint: 3.6, description: 'Excellent' },
  'B+': { gradePoint: 3.2, description: 'Very Good' },
  'B':  { gradePoint: 2.8, description: 'Good' },
  'C+': { gradePoint: 2.4, description: 'Satisfactory' },
  'C':  { gradePoint: 2.0, description: 'Acceptable' },
  'D':  { gradePoint: 1.6, description: 'Basic' },
  'NG': { gradePoint: 0.0, description: 'Not Graded' },
};

export default function StudentResults() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('results'); // 'results' | 'profile'
  const [marks, setMarks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selectedExam, setExam] = useState('all');
  const [schoolInfo, setSchoolInfo] = useState({
    name: 'SSNEBS',
    address: 'Siddhartha Sishu Niketan English Boarding School',
    logoUrl: '/logo.jpg',
  });

  useEffect(() => {
    if (!currentUser) return;
    const fetchMarks = async () => {
      const q = query(collection(db, 'ssnebs_marks'), where('studentId', '==', currentUser.uid));
      const snap = await getDocs(q);
      setMarks(snap.docs.map(d => d.data()));
      setLoading(false);
    };
    fetchMarks();
  }, [currentUser]);

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'admin_site_settings', 'main'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setSchoolInfo({
            name:    data.schoolName  || 'SSNEBS',
            address: data.address     || 'Siddhartha Sishu Niketan English Boarding School, Siraha-1, Nepal',
            phone:   data.phone       || '',
            email:   data.email       || '',
            logoUrl: data.logo        || '/logo.jpg',
            estd:    data.established || '2057 B.S.',
          });
        }
      } catch (err) {
        console.error('Failed to load school info:', err);
      }
    };
    fetchSchoolInfo();
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const examTypes     = [...new Set(marks.map(m => m.examType))].sort();
  const filteredMarks = selectedExam === 'all' ? marks : marks.filter(m => m.examType === selectedExam);

  const grouped = filteredMarks.reduce((acc, m) => {
    if (!acc[m.examType]) acc[m.examType] = [];
    acc[m.examType].push(m);
    return acc;
  }, {});

  const examStats = (list) => {
    const total   = list.reduce((s, m) => s + (m.obtained  || 0), 0);
    const fullTot = list.reduce((s, m) => s + (m.fullMarks || 100), 0);
    const passed  = list.filter(m => m.pass).length;
    const pct     = fullTot > 0 ? ((total / fullTot) * 100).toFixed(1) : '0.0';
    const totalGP = list.reduce((s, m) => s + (NEPALI_GPA[m.grade]?.gradePoint || 0), 0);
    const gpa     = list.length > 0 ? (totalGP / list.length).toFixed(2) : '0.00';
    return { total, fullTot, passed, failed: list.length - passed, pct, gpa };
  };

  const calculateOverallGPA = () => {
    if (marks.length === 0) return '0.00';
    const totalGP = marks.reduce((s, m) => s + (NEPALI_GPA[m.grade]?.gradePoint || 0), 0);
    return (totalGP / marks.length).toFixed(2);
  };

  const renderExamBlock = (examType, subjects) => {
    const stats  = examStats(subjects);
    const sorted = [...subjects].sort((a, b) => (a.subject || '').localeCompare(b.subject || ''));
    return (
      <div key={examType} style={{ background: 'white', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

        {/* Screen exam header */}
        <div className="screen-only" style={{ background: 'linear-gradient(90deg, #1A3A6B, #2d5299)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ margin: 0, color: 'white', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaTrophy style={{ color: '#F5C518' }} /> {examType}
          </h3>
          <div style={{ display: 'flex', gap: '16px', color: 'white', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>Total: <b>{stats.total}/{stats.fullTot}</b></span>
            <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>Percentage: <b>{stats.pct}%</b></span>
            <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>GPA: <b>{stats.gpa}</b></span>
            <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>
              Passed: <b style={{ color: '#86efac' }}>{stats.passed}</b> / Failed: <b style={{ color: '#fca5a5' }}>{stats.failed}</b>
            </span>
          </div>
        </div>

        {/* Print exam header */}
        <div className="print-exam-header">
          <h3 className="print-exam-title"><FaTrophy style={{ color: '#F5C518' }} /> {examType}</h3>
          <div className="print-exam-stats">
            <span>Total: <b>{stats.total}/{stats.fullTot}</b></span>
            <span>Percentage: <b>{stats.pct}%</b></span>
            <span>GPA: <b>{stats.gpa}</b></span>
            <span>Passed: <b className="pass-count">{stats.passed}</b> / Failed: <b className="fail-count">{stats.failed}</b></span>
          </div>
        </div>

        {/* Screen marks table */}
        <div className="screen-only" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Subject','Obtained','Full Marks','Pass Marks','Grade','Grade Point','Result'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '0.76rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e5e7eb' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((m, i) => {
                const gc = GRADE_COLOR[m.grade] || GRADE_COLOR['NG'];
                const gp = NEPALI_GPA[m.grade]?.gradePoint || 0;
                return (
                  <tr key={m.subject + i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{m.subject}</td>
                    <td style={{ padding: '12px 16px', fontSize: '1rem', fontWeight: 800, color: m.pass ? '#166534' : '#dc2626' }}>{m.obtained}</td>
                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '0.875rem' }}>{m.fullMarks}</td>
                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '0.875rem' }}>{m.passMarks}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '999px', background: gc.bg, color: gc.color, fontWeight: 800, fontSize: '0.82rem' }}>{m.grade}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1A3A6B', fontSize: '0.9rem' }}>{gp.toFixed(1)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {m.pass
                        ? <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}><FaCheckCircle /> Pass</span>
                        : <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#dc2626', fontWeight: 700, fontSize: '0.85rem' }}><FaTimesCircle /> Fail</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f0f4ff', borderTop: '2px solid #e5e7eb' }}>
                <td style={{ padding: '12px 16px', fontWeight: 800, color: '#1A3A6B', fontSize: '0.9rem' }}>Total</td>
                <td style={{ padding: '12px 16px', fontWeight: 800, color: '#1A3A6B', fontSize: '1rem' }}>{stats.total}</td>
                <td style={{ padding: '12px 16px', fontWeight: 800, color: '#6b7280' }}>{stats.fullTot}</td>
                <td colSpan={2} style={{ padding: '12px 16px', fontWeight: 800, color: '#1A3A6B' }}>{stats.pct}%</td>
                <td style={{ padding: '12px 16px', fontWeight: 800, color: '#1A3A6B', fontSize: '1rem' }}>{stats.gpa}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '999px', fontWeight: 800, fontSize: '0.82rem', background: parseFloat(stats.pct) >= 35 ? '#f0fdf4' : '#fef2f2', color: parseFloat(stats.pct) >= 35 ? '#166534' : '#dc2626' }}>
                    {parseFloat(stats.pct) >= 35 ? 'Promoted' : 'Not Promoted'}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Print marks table */}
        <div className="print-table-wrap">
          <table className="print-table">
            <thead>
              <tr><th>Subject</th><th>Obtained</th><th>Full Marks</th><th>Pass Marks</th><th>Grade</th><th>Grade Point</th><th>Result</th></tr>
            </thead>
            <tbody>
              {sorted.map((m, i) => {
                const gc = GRADE_COLOR[m.grade] || GRADE_COLOR['NG'];
                const gp = NEPALI_GPA[m.grade]?.gradePoint || 0;
                return (
                  <tr key={"p" + m.subject + i} className={i % 2 === 0 ? 'even' : 'odd'}>
                    <td className="col-subject">{m.subject}</td>
                    <td className={"col-obtained " + (m.pass ? 'pass' : 'fail')}>{m.obtained}</td>
                    <td className="col-full">{m.fullMarks}</td>
                    <td className="col-pass">{m.passMarks}</td>
                    <td className="col-grade"><span className="grade-badge" style={{ background: gc.bg, color: gc.color }}>{m.grade}</span></td>
                    <td className="col-gp">{gp.toFixed(1)}</td>
                    <td className="col-result">
                      {m.pass
                        ? <span className="result-pass"><FaCheckCircle /> Pass</span>
                        : <span className="result-fail"><FaTimesCircle /> Fail</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="total-row">
                <td className="col-subject">Total</td>
                <td className="col-obtained total">{stats.total}</td>
                <td className="col-full">{stats.fullTot}</td>
                <td colSpan={2} className="col-percent">{stats.pct}%</td>
                <td className="col-gp total">{stats.gpa}</td>
                <td className="col-result">
                  <span className={"promo-badge " + (parseFloat(stats.pct) >= 35 ? 'promoted' : 'not-promoted')}>
                    {parseFloat(stats.pct) >= 35 ? 'Promoted' : 'Not Promoted'}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

      </div>
    );
  };

  const initials = (currentUser?.name || 'S').charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>

      {/* Screen header */}
      <header className="screen-only" style={{ background: 'linear-gradient(135deg, #1A3A6B 0%, #10B981 100%)', color: 'white', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaUserGraduate size={18} />
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem' }}>Student Portal</p>
            <p style={{ margin: 0, fontSize: '0.72rem', opacity: 0.8 }}>SSNEBS — Your Academic Results</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="/" style={{ color: 'white', opacity: 0.8, textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}><FaHome /> Home</a>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </header>

      {/* Print school header */}
      <div className="print-header">
        <div className="print-header-box">
          <div className="print-header-top">
            <div className="print-logo-side"><img src={schoolInfo.logoUrl} alt="Logo" className="print-logo-img" /></div>
            <div className="print-header-center">
              <h1 className="print-school-name">{schoolInfo.name}</h1>
              <p className="print-school-address">{schoolInfo.address}</p>
              <div className="print-school-contact">
                {schoolInfo.phone && <span>📞 {schoolInfo.phone}</span>}
                {schoolInfo.email && <span>✉ {schoolInfo.email}</span>}
                <span>Est. {schoolInfo.estd || '2057 B.S.'}</span>
              </div>
            </div>
            <div className="print-logo-side"><img src={schoolInfo.logoUrl} alt="Logo" className="print-logo-img" /></div>
          </div>
          <div className="print-header-divider">
            <span className="print-line"></span><span className="print-dot">◆</span>
            <span className="print-line-center"></span><span className="print-dot">◆</span>
            <span className="print-line"></span>
          </div>
          <div className="print-report-box">
            <h2 className="print-report-title">Academic Progress Report</h2>
            <p className="print-report-subtitle">Official Examination Results Sheet</p>
          </div>
        </div>
      </div>

      {/* Print student card */}
      <div className="print-student-card">
        <div className="print-student-left">
          <div className="print-avatar">{initials}</div>
          <div className="print-student-details">
            <h2 className="print-student-name">{currentUser?.name}</h2>
            <p className="print-student-meta">
              {currentUser?.class   ? "Class " + currentUser.class : ""}
              {currentUser?.section ? " – Section " + currentUser.section : ""}
              {currentUser?.rollNo  ? " | Roll No: " + currentUser.rollNo : ""}
            </p>
          </div>
        </div>
        <div className="print-gpa-box">
          <p className="print-gpa-value">{calculateOverallGPA()}</p>
          <p className="print-gpa-label">Overall GPA</p>
        </div>
      </div>

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 16px' }}>

        {/* ── Tab buttons (screen only) ── */}
        <div className="screen-only" style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#e2e8f0', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
          {[
            { id: 'results', label: 'My Results',  icon: FaChartBar },
            { id: 'profile', label: 'My Profile',  icon: FaUser },
          ].map(tab => {
            const TabIcon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 20px', borderRadius: '9px',
                border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.875rem', fontFamily: 'inherit',
                background: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? '#10B981' : '#6b7280',
                boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
              }}>
                <TabIcon size={13} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && (
          <UserProfile />
        )}

        {/* ── Results Tab ── */}
        {activeTab === 'results' && (
          <>
            {/* Screen student info card */}
            <div className="screen-only" style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: currentUser?.photoURL ? 'transparent' : 'linear-gradient(135deg, #1A3A6B, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 900, overflow: 'hidden' }}>
                  {currentUser?.photoURL
                    ? <img src={currentUser.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initials
                  }
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#1A3A6B', fontWeight: 800 }}>{currentUser?.name}</h2>
                  <p style={{ margin: '3px 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                    {currentUser?.class ? "Class " + currentUser.class + (currentUser.section ? " – Section " + currentUser.section : "") : ""}
                    {currentUser?.rollNo ? " | Roll No: " + currentUser.rollNo : ""}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>@{currentUser?.username}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', padding: '12px 20px', background: '#f0fdf4', borderRadius: '10px' }}>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#166534' }}>{marks.length}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Total Entries</p>
                </div>
                <div style={{ textAlign: 'center', padding: '12px 20px', background: '#eff6ff', borderRadius: '10px' }}>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e40af' }}>{examTypes.length}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Exams</p>
                </div>
                <div style={{ textAlign: 'center', padding: '12px 20px', background: '#fefce8', borderRadius: '10px' }}>
                  <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#854d0e' }}>{calculateOverallGPA()}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Overall GPA</p>
                </div>
              </div>
            </div>

            {/* Screen exam filter pills */}
            {examTypes.length > 0 && (
              <div className="screen-only" style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {['all', ...examTypes].map(ex => (
                  <button key={ex} onClick={() => setExam(ex)}
                    style={{ padding: '7px 16px', border: '2px solid', borderColor: selectedExam === ex ? '#1A3A6B' : '#e5e7eb', borderRadius: '999px', background: selectedExam === ex ? '#1A3A6B' : 'white', color: selectedExam === ex ? 'white' : '#374151', cursor: 'pointer', fontWeight: 600, fontSize: '0.825rem', transition: 'all 0.2s' }}>
                    {ex === 'all' ? 'All Exams' : ex}
                  </button>
                ))}
              </div>
            )}

            {/* Results */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #e5e7eb', borderTopColor: '#1A3A6B', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                <p style={{ color: '#6b7280' }}>Loading your results…</p>
              </div>
            ) : marks.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center', boxShadow: '0 1px 8px rgba(0,0,0,0.08)' }}>
                <FaBook size={40} style={{ color: '#d1d5db', marginBottom: '16px' }} />
                <h3 style={{ color: '#6b7280', margin: '0 0 8px' }}>No results yet</h3>
                <p style={{ color: '#9ca3af', margin: 0 }}>Your marks will appear here once your teacher has entered them.</p>
              </div>
            ) : (
              Object.entries(grouped).map(([examType, subjects]) => renderExamBlock(examType, subjects))
            )}

            {/* GPA legend */}
            <div className="screen-only" style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.08)' }}>
              <h4 style={{ margin: '0 0 12px', color: '#1A3A6B', fontSize: '0.9rem', fontWeight: 700 }}>Nepali GPA Grading System</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                {Object.entries(NEPALI_GPA).map(([grade, info]) => (
                  <div key={grade} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: GRADE_COLOR[grade]?.bg || '#f3f4f6', color: GRADE_COLOR[grade]?.color || '#374151', fontWeight: 800, fontSize: '0.75rem', minWidth: '28px', textAlign: 'center' }}>{grade}</span>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{info.gradePoint} — {info.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Print button */}
            {marks.length > 0 && (
              <div className="screen-only" style={{ textAlign: 'right', marginTop: '8px' }}>
                <button onClick={() => window.print()} style={{ padding: '10px 20px', background: '#1A3A6B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                  <FaPrint /> Print Results
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .print-header, .print-student-card, .print-exam-header, .print-table-wrap { display: none; }

        @media print {
          @page { margin: 12mm 10mm; size: A4; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: 'Segoe UI', Arial, sans-serif; }
          * { box-shadow: none !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .screen-only { display: none !important; }
          .print-header       { display: block !important; margin-bottom: 14px; page-break-inside: avoid; }
          .print-student-card { display: flex !important; justify-content: space-between; align-items: center; background: white !important; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; margin-bottom: 14px; page-break-inside: avoid; }
          .print-exam-header  { display: flex !important; justify-content: space-between; align-items: center; background: linear-gradient(90deg, #1A3A6B, #2d5299) !important; padding: 8px 14px; color: white; page-break-inside: avoid; }
          .print-table-wrap   { display: block !important; overflow: visible; }
          .print-header-box { border: 2px solid #1A3A6B; padding: 2px; background: white; }
          .print-header-top { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px 8px; background: linear-gradient(180deg,#f8fafc 0%,#ffffff 100%); }
          .print-logo-side { flex-shrink: 0; width: 60px; height: 60px; }
          .print-logo-img { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #1A3A6B; }
          .print-header-center { text-align: center; flex: 1; padding: 0 16px; }
          .print-school-name { margin: 0 0 4px; color: #1A3A6B; font-size: 20pt; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
          .print-school-address { margin: 0 0 4px; color: #4b5563; font-size: 9pt; }
          .print-school-contact { display: flex; justify-content: center; gap: 12px; color: #6b7280; font-size: 7.5pt; }
          .print-header-divider { display: flex; align-items: center; justify-content: center; padding: 0 16px; margin: 4px 0; }
          .print-line { flex: 1; height: 1px; background: linear-gradient(90deg,transparent,#1A3A6B,transparent); max-width: 100px; }
          .print-line-center { width: 30px; height: 2px; background: #D72638; margin: 0 6px; }
          .print-dot { color: #D72638; font-size: 7pt; margin: 0 4px; }
          .print-report-box { text-align: center; padding: 6px 0 10px; }
          .print-report-title { margin: 0; color: #D72638; font-size: 13pt; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; display: inline-block; padding: 4px 20px; border: 2px solid #D72638; border-radius: 3px; background: #fef2f2 !important; }
          .print-report-subtitle { margin: 6px 0 0; color: #9ca3af; font-size: 7pt; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
          .print-student-left { display: flex; align-items: center; gap: 12px; }
          .print-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg,#1A3A6B,#10B981) !important; display: flex; align-items: center; justify-content: center; color: white; font-size: 16pt; font-weight: 900; flex-shrink: 0; }
          .print-student-details { display: flex; flex-direction: column; }
          .print-student-name { margin: 0; font-size: 13pt; color: #1A3A6B; font-weight: 800; }
          .print-student-meta { margin: 2px 0 0; font-size: 8.5pt; color: #6b7280; }
          .print-gpa-box { text-align: center; padding: 8px 16px; background: linear-gradient(135deg,#1A3A6B,#10B981) !important; border-radius: 6px; color: white; min-width: 80px; }
          .print-gpa-value { margin: 0; font-size: 18pt; font-weight: 800; }
          .print-gpa-label { margin: 1px 0 0; font-size: 6.5pt; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; }
          .print-exam-title { margin: 0; font-size: 10pt; display: flex; align-items: center; gap: 6px; font-weight: 700; }
          .print-exam-stats { display: flex; gap: 12px; font-size: 8pt; }
          .pass-count { color: #86efac !important; }
          .fail-count { color: #fca5a5 !important; }
          .print-table { width: 100%; border-collapse: collapse; font-size: 9pt; }
          .print-table thead tr { background: #f8fafc !important; }
          .print-table th { padding: 6px 8px; text-align: left; font-size: 7pt; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: .05em; border-bottom: 2px solid #e5e7eb; }
          .print-table td { padding: 5px 8px; border-bottom: 1px solid #f3f4f6; }
          .print-table .even { background: white; }
          .print-table .odd  { background: #fafafa; }
          .col-subject { font-weight: 600; color: #1e293b; width: 24%; }
          .col-obtained { font-weight: 800; font-size: 10pt; width: 12%; }
          .col-obtained.pass { color: #166534 !important; }
          .col-obtained.fail { color: #dc2626 !important; }
          .col-obtained.total { color: #1A3A6B !important; font-size: 10.5pt; }
          .col-full, .col-pass { color: #6b7280; width: 12%; font-size: 8.5pt; }
          .col-grade { width: 10%; }
          .grade-badge { padding: 2px 8px; border-radius: 999px; font-weight: 800; font-size: 8pt; display: inline-block; }
          .col-gp { font-weight: 700; color: #1A3A6B; width: 12%; }
          .col-result { width: 15%; }
          .result-pass { display: flex; align-items: center; gap: 4px; color: #16a34a; font-weight: 700; font-size: 8pt; }
          .result-fail { display: flex; align-items: center; gap: 4px; color: #dc2626; font-weight: 700; font-size: 8pt; }
          .total-row { background: #f0f4ff !important; border-top: 2px solid #e5e7eb; font-weight: 800; }
          .total-row td { padding: 6px 8px; color: #1A3A6B; }
          .col-percent { font-weight: 800; color: #1A3A6B; font-size: 9.5pt; }
          .promo-badge { padding: 2px 8px; border-radius: 999px; font-weight: 800; font-size: 8pt; display: inline-block; }
          .promo-badge.promoted { background: #f0fdf4 !important; color: #166534 !important; }
          .promo-badge.not-promoted { background: #fef2f2 !important; color: #dc2626 !important; }
          aside, nav, header, [class*="sidebar"], [class*="topbar"] { display: none !important; }
          main { margin-left: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; }
        }
      `}</style>
    </div>
  );
}