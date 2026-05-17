import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { useFirestore } from '../hooks/useFirestore';
import { defaultSiteSettings } from '../data/defaultData';
import {
  FaSearch, FaUserGraduate, FaTrophy, FaCheckCircle,
  FaTimesCircle, FaPrint, FaBook, FaIdCard
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

export default function StudentResultLookup() {
  const [siteSettings] = useFirestore('admin_site_settings', defaultSiteSettings);
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [student, setStudent] = useState(null);
  const [marks, setMarks] = useState([]);
  const [selectedExam, setSelectedExam] = useState('all');

  const schoolName = siteSettings?.schoolName || 'SSNEBS';
  const schoolLogo = siteSettings?.logo || null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!studentId.trim()) return;

    setLoading(true);
    setError('');
    setStudent(null);
    setMarks([]);
    setSelectedExam('all');

    try {
      // 1. Find the student record by studentId
      const studentsSnap = await getDocs(collection(db, 'admin_students'));
      const allStudents = studentsSnap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
      const found = allStudents.find(
        s => s.studentId && s.studentId.trim().toLowerCase() === studentId.trim().toLowerCase()
      );

      if (!found) {
        setError('No student found with that Student ID. Please check and try again.');
        setLoading(false);
        return;
      }

      setStudent(found);

      // In ssnebs_marks, studentId = the student's numeric `id` field (e.g. "1779025157411")
      // and studentDocId is the same value. We try all possible keys in priority order.
      let marksData = [];

      const candidateIds = [
        found.id,           // numeric id stored inside the student doc  ← PRIMARY MATCH
        found.firestoreId,  // Firestore document path id (may differ)
        found.linkedUserId, // linked user account id
      ].filter(Boolean).map(String);

      for (const cid of candidateIds) {
        // Try matching marks.studentId
        const q1 = query(collection(db, 'ssnebs_marks'), where('studentId', '==', cid));
        const snap1 = await getDocs(q1);
        if (!snap1.empty) { marksData = snap1.docs.map(d => d.data()); break; }

        // Try matching marks.studentDocId (explicit field in newer marks docs)
        const q2 = query(collection(db, 'ssnebs_marks'), where('studentDocId', '==', cid));
        const snap2 = await getDocs(q2);
        if (!snap2.empty) { marksData = snap2.docs.map(d => d.data()); break; }
      }

      setMarks(marksData);
    } catch (err) {
      console.error('Error looking up student results:', err);
      setError('An error occurred. Please try again.');
    }

    setLoading(false);
  };

  const examTypes = [...new Set(marks.map(m => m.examType))].sort();
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

  return (
    <div style={{ minHeight: '80vh', background: '#f1f5f9', padding: '40px 16px 60px' }}>

      {/* Page Header */}
      <div style={{ maxWidth: '800px', margin: '0 auto 32px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))', marginBottom: '16px' }}>
          <FaIdCard size={30} style={{ color: 'white' }} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-secondary)', margin: '0 0 8px' }}>
          Student Result Lookup
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem', margin: 0 }}>
          Enter your Student ID to view your academic results — no login required.
        </p>
      </div>

      {/* Search Box */}
      <div style={{ maxWidth: '520px', margin: '0 auto 32px' }}>
        <form onSubmit={handleSearch} style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <label style={{ display: 'block', fontWeight: 700, color: 'var(--color-secondary)', marginBottom: '8px', fontSize: '0.95rem' }}>
            Student ID
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              placeholder="e.g. SSNEBS-2024-001"
              style={{
                flex: 1, padding: '12px 16px', border: '2px solid #e5e7eb',
                borderRadius: '10px', fontSize: '1rem', fontFamily: 'inherit',
                outline: 'none', transition: 'border 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            <button
              type="submit"
              disabled={loading || !studentId.trim()}
              style={{
                padding: '12px 20px', background: 'var(--color-primary)', color: 'white',
                border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700,
                fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px',
                opacity: loading || !studentId.trim() ? 0.65 : 1, transition: 'opacity 0.2s'
              }}
            >
              {loading ? (
                <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              ) : <FaSearch />}
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>

          {error && (
            <div style={{ marginTop: '14px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.875rem', fontWeight: 600 }}>
              {error}
            </div>
          )}
        </form>
      </div>

      {/* Results */}
      {student && (
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>

          {/* Student Info Card */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: student.photo ? 'transparent' : 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '1.6rem', fontWeight: 900, overflow: 'hidden', flexShrink: 0
              }}>
                {student.photo
                  ? <img src={student.photo} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (student.name || 'S').charAt(0).toUpperCase()
                }
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-secondary)', fontWeight: 800 }}>{student.name}</h2>
                <p style={{ margin: '3px 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  {student.class ? `Class ${student.class}` : ''}
                  {student.section ? ` – Section ${student.section}` : ''}
                  {student.rollNo ? ` | Roll No: ${student.rollNo}` : ''}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>Student ID: {student.studentId}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
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

          {marks.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center', boxShadow: '0 1px 8px rgba(0,0,0,0.08)' }}>
              <FaBook size={40} style={{ color: '#d1d5db', marginBottom: '16px' }} />
              <h3 style={{ color: '#6b7280', margin: '0 0 8px' }}>No results available yet</h3>
              <p style={{ color: '#9ca3af', margin: 0 }}>Your marks will appear here once your teacher has entered them.</p>
            </div>
          ) : (
            <>
              {/* Exam filter pills */}
              {examTypes.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  {['all', ...examTypes].map(ex => (
                    <button key={ex} onClick={() => setSelectedExam(ex)}
                      style={{ padding: '7px 16px', border: '2px solid', borderColor: selectedExam === ex ? 'var(--color-secondary)' : '#e5e7eb', borderRadius: '999px', background: selectedExam === ex ? 'var(--color-secondary)' : 'white', color: selectedExam === ex ? 'white' : '#374151', cursor: 'pointer', fontWeight: 600, fontSize: '0.825rem', transition: 'all 0.2s' }}>
                      {ex === 'all' ? 'All Exams' : ex}
                    </button>
                  ))}
                </div>
              )}

              {/* Exam blocks */}
              {Object.entries(grouped).map(([examType, subjects]) => {
                const stats = examStats(subjects);
                const sorted = [...subjects].sort((a, b) => (a.subject || '').localeCompare(b.subject || ''));
                return (
                  <div key={examType} style={{ background: 'white', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(90deg, var(--color-secondary), #2d5299)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
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

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            {['Subject', 'Obtained', 'Full Marks', 'Pass Marks', 'Grade', 'Grade Point', 'Result'].map(h => (
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
                                <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-secondary)', fontSize: '0.9rem' }}>{gp.toFixed(1)}</td>
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
                            <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--color-secondary)', fontSize: '0.9rem' }}>Total</td>
                            <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--color-secondary)', fontSize: '1rem' }}>{stats.total}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 800, color: '#6b7280' }}>{stats.fullTot}</td>
                            <td colSpan={2} style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--color-secondary)' }}>{stats.pct}%</td>
                            <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--color-secondary)', fontSize: '1rem' }}>{stats.gpa}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ padding: '4px 12px', borderRadius: '999px', fontWeight: 800, fontSize: '0.82rem', background: parseFloat(stats.pct) >= 35 ? '#f0fdf4' : '#fef2f2', color: parseFloat(stats.pct) >= 35 ? '#166534' : '#dc2626' }}>
                                {parseFloat(stats.pct) >= 35 ? 'Promoted' : 'Not Promoted'}
                              </span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })}

              {/* GPA legend */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.08)' }}>
                <h4 style={{ margin: '0 0 12px', color: 'var(--color-secondary)', fontSize: '0.9rem', fontWeight: 700 }}>Nepali GPA Grading System</h4>
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
              <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <button onClick={() => window.print()} style={{ padding: '10px 20px', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                  <FaPrint /> Print Results
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print {
          @page { margin: 12mm 10mm; size: A4; }
          body { background: white !important; }
          nav, header, footer { display: none !important; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
}