import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import {
  FaUserGraduate, FaTrophy, FaCheckCircle, FaTimesCircle,
  FaPrint, FaSearch, FaArrowLeft, FaExclamationTriangle
} from 'react-icons/fa';

// Helper: derive department from class
const getDepartmentFromClass = (cls) => {
  const classStr = String(cls).trim().toLowerCase();
  const num = parseInt(classStr);
  if (!isNaN(num)) {
    if (num >= 1 && num <= 5) return 'Primary';
    if (num >= 6 && num <= 8) return 'Lower Secondary';
    if (num >= 9 && num <= 10) return 'Secondary';
    if (num >= 11 && num <= 12) return 'Higher Secondary';
  }
  if (['nursery', 'lkg', 'ukg'].includes(classStr)) return 'Primary';
  return 'Primary';
};

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

export default function StudentResultViewer({ onBack }) {
  const { currentUser } = useAuth();
  const isTeacher = currentUser?.role === 'teacher';

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marksLoading, setMarksLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [selectedExam, setExam] = useState('all');
  const [schoolInfo, setSchoolInfo] = useState({ 
    name: 'SSNEBS', 
    address: 'Siddhartha Sishu Niketan English Boarding School' 
  });
  const [schoolOptions, setSchoolOptions] = useState({ classes: [], sections: {} });
  const [error, setError] = useState(null);

  // Teacher's allowed subjects and departments
  const teacherSubjects = isTeacher 
    ? (currentUser?.subjects || (currentUser?.subject ? [currentUser.subject] : []))
    : [];
  const teacherDepartments = isTeacher
    ? (currentUser?.departments || (currentUser?.department ? [currentUser.department] : []))
    : [];

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const studentList = [];

        try {
          const docRef = doc(db, 'ssnebs', 'admin_students');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const docData = docSnap.data();
            if (docData.data && Array.isArray(docData.data)) {
              docData.data.forEach(s => {
                if (s.active !== false) {
                  studentList.push({
                    id: s.id?.toString() || String(Math.random()),
                    name: s.name,
                    class: s.class,
                    section: s.section,
                    rollNo: s.rollNo,
                    linkedUserId: s.linkedUserId || null,
                    fatherName: s.fatherName || '',
                    motherName: s.motherName || '',
                    dob: s.dob || '',
                    gender: s.gender || '',
                    parentContact: s.parentContact || '',
                    address: s.address || '',
                    source: 'student_manager'
                  });
                }
              });
            }
          }
        } catch (err) {
          console.error('Error fetching admin_students:', err.message);
        }

        try {
          const userSnap = await getDocs(query(collection(db, 'ssnebs_user'), where('role', '==', 'student')));
          userSnap.docs.forEach(d => {
            const data = d.data();
            const exists = studentList.some(s => 
              s.name === data.name && s.class === data.class && s.rollNo === data.rollNo
            );
            if (!exists && data.active !== false) {
              studentList.push({
                id: d.id,
                name: data.name,
                class: data.class,
                section: data.section,
                rollNo: data.rollNo,
                linkedUserId: d.id,
                fatherName: data.fatherName || '',
                motherName: data.motherName || '',
                dob: data.dob || '',
                gender: data.gender || '',
                parentContact: data.parentContact || '',
                address: data.address || '',
                source: 'user_manager'
              });
            }
          });
        } catch (err) {
          console.error('Error fetching ssnebs_user:', err.message);
        }

        setStudents(studentList);
      } catch (err) {
        console.error('Failed to load students:', err);
        setError('Failed to load students: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'site'));
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          setSchoolInfo({
            name: data.schoolName || 'SSNEBS',
            address: data.schoolAddress || 'Siddhartha Sishu Niketan English Boarding School',
            logoUrl: data.logoUrl || '/logo.jpg',
            phone: data.phone || '',
            email: data.email || '',
            estd: data.established || '1995',
          });
        }
      } catch (err) {
        console.error('Failed to load school info:', err);
      }
    };
    fetchSchoolInfo();
  }, []);

  // Load school options for section checking
  useEffect(() => {
    const loadSchoolOptions = async () => {
      try {
        const snap = await getDoc(doc(db, 'admin_school_options', 'main'));
        if (snap.exists()) {
          setSchoolOptions(snap.data());
        }
      } catch (err) {
        console.error('Failed to load school options:', err);
      }
    };
    loadSchoolOptions();
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;
    const fetchMarks = async () => {
      setMarksLoading(true);
      setMarks([]);
      setError(null);
      try {
        const queryId = selectedStudent.linkedUserId || selectedStudent.id;
        const q = query(collection(db, 'ssnebs_marks'), where('studentId', '==', queryId));
        const snap = await getDocs(q);
        const marksData = snap.docs.map(d => d.data());

        if (marksData.length === 0) {
          const q2 = query(collection(db, 'ssnebs_marks'), where('studentDocId', '==', selectedStudent.id));
          const snap2 = await getDocs(q2);
          setMarks(snap2.docs.map(d => d.data()));
        } else {
          setMarks(marksData);
        }
      } catch (err) {
        console.error('Failed to load marks:', err);
        setError('Failed to load marks: ' + err.message);
      } finally {
        setMarksLoading(false);
      }
    };
    fetchMarks();
  }, [selectedStudent]);

  const classes = [...new Set(students.map(s => s.class))].sort();
  const sections = [...new Set(students.map(s => s.section))].sort();

  // Check if a class has sections defined in school options
  const classHasSections = (cls) => {
    if (!cls) return false;
    const sections = (schoolOptions.sections || {})[cls];
    return sections && Array.isArray(sections) && sections.length > 0;
  };

  const filteredStudents = students.filter(s => {
    const matchSearch = !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo?.toLowerCase().includes(search.toLowerCase()) ||
      s.fatherName?.toLowerCase().includes(search.toLowerCase());
    const matchClass = filterClass === 'all' || s.class === filterClass;
    const matchSection = filterSection === 'all' || s.section === filterSection;

    // Teacher restrictions
    let matchTeacher = true;
    if (isTeacher) {
      const studentDept = getDepartmentFromClass(s.class);

      // First check: student must be in teacher's department
      const matchDept = teacherDepartments.length === 0 || teacherDepartments.includes(studentDept);

      // Second check: section-level filtering
      let matchTeacherSection = true;
      if (matchDept) {
        const hasSections = classHasSections(s.class);
        if (hasSections) {
          // Class HAS sections → teacher must be assigned to this student's specific section
          // OR teacher has no section restrictions (empty sections array)
          const teacherSections = currentUser?.sections || [];
          if (teacherSections.length > 0) {
            // Check if any of teacher's sections match this student's class-section combo
            matchTeacherSection = teacherSections.some(ts => {
              if (ts.includes('-')) {
                const [tc, tsSec] = ts.split('-');
                return tc === s.class && tsSec === s.section;
              }
              return ts === s.section;
            });
          }
        }
        // If class has NO sections → teacher sees all students in their department
      }

      matchTeacher = matchDept && matchTeacherSection;
    }

    return matchSearch && matchClass && matchSection && matchTeacher;
  });

  const examTypes = [...new Set(marks.map(m => m.examType))].sort();
  const filteredMarks = selectedExam === 'all' ? marks : marks.filter(m => m.examType === selectedExam);

  const grouped = filteredMarks.reduce((acc, m) => {
    if (!acc[m.examType]) acc[m.examType] = [];
    acc[m.examType].push(m);
    return acc;
  }, {});

  const examStats = (list) => {
    const total = list.reduce((s, m) => s + (m.obtained || 0), 0);
    const fullTot = list.reduce((s, m) => s + (m.fullMarks || 100), 0);
    const passed = list.filter(m => m.pass).length;
    const pct = fullTot > 0 ? ((total / fullTot) * 100).toFixed(1) : '—';
    const totalGradePoints = list.reduce((sum, m) => {
      const gp = NEPALI_GPA[m.grade]?.gradePoint || 0;
      return sum + gp;
    }, 0);
    const gpa = list.length > 0 ? (totalGradePoints / list.length).toFixed(2) : '0.00';
    return { total, fullTot, passed, failed: list.length - passed, pct, gpa };
  };

  const calculateOverallGPA = () => {
    if (marks.length === 0) return '0.00';
    const totalGradePoints = marks.reduce((sum, m) => {
      const gp = NEPALI_GPA[m.grade]?.gradePoint || 0;
      return sum + gp;
    }, 0);
    return (totalGradePoints / marks.length).toFixed(2);
  };

  if (!selectedStudent) {
    return (
      <div>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 8px', color: '#1A3A6B', fontSize: '1.5rem', fontWeight: 800 }}>
            Student Results
          </h2>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
            Select a student to view and print their complete result report
          </p>
          {isTeacher && (
            <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ padding: '4px 10px', background: '#eff6ff', color: '#1e40af', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                🏫 Your Departments: {teacherDepartments.join(', ') || 'All'}
              </span>
              {currentUser?.sections && currentUser.sections.length > 0 && (
                <span style={{ padding: '4px 10px', background: '#fef3c7', color: '#92400e', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                  📑 Your Sections: {currentUser.sections.join(', ')}
                </span>
              )}
              <span style={{ padding: '4px 10px', background: '#f0fdf4', color: '#166534', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                📋 Complete results (all subjects) for your students
              </span>
            </div>
          )}
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
            padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
            color: '#dc2626', fontSize: '0.875rem'
          }}>
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <div style={{
          background: 'white', borderRadius: '12px', padding: '20px',
          boxShadow: '0 1px 8px rgba(0,0,0,0.08)', marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input
                placeholder="Search by name, roll no, or father name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px 10px 36px',
                  border: '2px solid #e5e7eb', borderRadius: '8px',
                  fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box'
                }}
              />
            </div>
            <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
              style={{ padding: '10px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', minWidth: '120px' }}>
              <option value="all">All Classes</option>
              {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
            <select value={filterSection} onChange={e => setFilterSection(e.target.value)}
              style={{ padding: '10px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', minWidth: '120px' }}>
              <option value="all">All Sections</option>
              {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
            Showing <strong>{filteredStudents.length}</strong> of {students.length} students
            {isTeacher && ' (filtered by your department/section assignments)'}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', 
              border: '4px solid #e5e7eb', borderTopColor: '#1A3A6B', 
              animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' 
            }} />
            <p style={{ color: '#6b7280' }}>Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
            <FaUserGraduate size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
            <h3 style={{ color: '#6b7280', margin: '0 0 8px' }}>No students found</h3>
            <p style={{ color: '#9ca3af', margin: 0 }}>
              {isTeacher
                ? 'No students match your department/section assignments. Contact admin if you believe this is an error.'
                : (students.length === 0 
                    ? 'No students in database. Add students in Students Manager first.' 
                    : 'Try adjusting your filters.')
              }
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filteredStudents.map(student => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                style={{
                  background: 'white', border: '2px solid #e5e7eb', borderRadius: '12px',
                  padding: '20px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '14px', width: '100%'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#1A3A6B';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,58,107,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: '50px', height: '50px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1A3A6B, #10B981)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '1.2rem', fontWeight: 700, flexShrink: 0
                }}>
                  {(student.name || 'S').charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ 
                    margin: '0 0 4px', color: '#1A3A6B', fontSize: '1rem', 
                    fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
                  }}>
                    {student.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>
                    Class {student.class}{student.section ? ` – ${student.section}` : ''} | Roll: {student.rollNo}
                  </p>
                  {student.fatherName && (
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
                      Father: {student.fatherName}
                    </p>
                  )}
                  {student.linkedUserId && (
                    <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: '#10B981' }}>
                      ✓ Account linked
                    </p>
                  )}
                </div>
                <FaArrowLeft style={{ transform: 'rotate(180deg)', color: '#9ca3af', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* ===== SCREEN: Back Button ===== */}
      <div className="screen-only" style={{ marginBottom: '16px' }}>
        <button
          onClick={() => { setSelectedStudent(null); setMarks([]); setExam('all'); setError(null); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', background: 'white', border: '2px solid #e5e7eb',
            borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem',
            fontWeight: 600, color: '#374151', transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#1A3A6B'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
        >
          <FaArrowLeft /> Back to Students
        </button>
      </div>

      {error && (
        <div className="screen-only" style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
          padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
          color: '#dc2626', fontSize: '0.875rem'
        }}>
          <FaExclamationTriangle /> {error}
        </div>
      )}

      {/* ===== SCREEN: Student Info Card ===== */}
      <div className="screen-only" style={{
        background: 'white', borderRadius: '16px', padding: '24px',
        marginBottom: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #1A3A6B, #10B981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '1.5rem', fontWeight: 900
          }}>
            {(selectedStudent.name || 'S').charAt(0)}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#1A3A6B', fontWeight: 800 }}>
              {selectedStudent.name}
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
              Class {selectedStudent.class}
              {selectedStudent.section ? ` – Section ${selectedStudent.section}` : ''}
              {selectedStudent.rollNo ? ` | Roll No: ${selectedStudent.rollNo}` : ''}
            </p>
            {selectedStudent.fatherName && (
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>
                Father: {selectedStudent.fatherName} | Mother: {selectedStudent.motherName || '—'}
              </p>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '12px 24px', background: 'linear-gradient(135deg, #1A3A6B, #10B981)', borderRadius: '12px', color: 'white' }}>
          <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>{calculateOverallGPA()}</p>
          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', opacity: 0.9 }}>Overall GPA</p>
        </div>
      </div>

      {/* ===== PRINT: Header ===== */}
      <div className="print-header">
        <div className="print-header-box">
          <div className="print-header-top">
            <div className="print-logo-side">
              <img src={schoolInfo.logoUrl || '/logo.jpg'} alt="" className="print-logo-img" />
            </div>
            <div className="print-header-center">
              <h1 className="print-school-name">{schoolInfo.name}</h1>
              <p className="print-school-address">{schoolInfo.address}</p>
              <div className="print-school-contact">
                {schoolInfo.phone && <span>📞 {schoolInfo.phone}</span>}
                {schoolInfo.email && <span>✉ {schoolInfo.email}</span>}
                <span>Est. {schoolInfo.estd || '1995'}</span>
              </div>
            </div>
            <div className="print-logo-side">
              <img src={schoolInfo.logoUrl || '/logo.jpg'} alt="" className="print-logo-img" />
            </div>
          </div>
          <div className="print-header-divider">
            <span className="print-line"></span>
            <span className="print-dot">◆</span>
            <span className="print-line-center"></span>
            <span className="print-dot">◆</span>
            <span className="print-line"></span>
          </div>
          <div className="print-report-box">
            <h2 className="print-report-title">Academic Progress Report</h2>
            <p className="print-report-subtitle">Official Examination Results Sheet</p>
          </div>
        </div>
      </div>

      {/* ===== PRINT: Student Card ===== */}
      <div className="print-student-card">
        <div className="print-student-left">
          <div className="print-avatar">
            {(selectedStudent.name || 'S').charAt(0)}
          </div>
          <div className="print-student-details">
            <h2 className="print-student-name">{selectedStudent.name}</h2>
            <p className="print-student-meta">
              Class {selectedStudent.class}
              {selectedStudent.section ? ` – Section ${selectedStudent.section}` : ''}
              {selectedStudent.rollNo ? ` | Roll No: ${selectedStudent.rollNo}` : ''}
            </p>
            {selectedStudent.fatherName && (
              <p className="print-student-parents">
                Father: {selectedStudent.fatherName} | Mother: {selectedStudent.motherName || '—'}
              </p>
            )}
          </div>
        </div>
        <div className="print-gpa-box">
          <p className="print-gpa-value">{calculateOverallGPA()}</p>
          <p className="print-gpa-label">Overall GPA</p>
        </div>
      </div>

      {/* ===== SCREEN: Exam Filter ===== */}
      {marks.length > 0 && (
        <div className="screen-only" style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['all', ...examTypes].map(ex => (
            <button key={ex} onClick={() => setExam(ex)}
              style={{
                padding: '7px 16px', border: '2px solid',
                borderColor: selectedExam === ex ? '#1A3A6B' : '#e5e7eb',
                borderRadius: '999px',
                background: selectedExam === ex ? '#1A3A6B' : 'white',
                color: selectedExam === ex ? 'white' : '#374151',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.825rem',
                transition: 'all 0.2s'
              }}>
              {ex === 'all' ? 'All Exams' : ex}
            </button>
          ))}
        </div>
      )}

      {/* Teacher notice - shows all subjects for department students */}
      {isTeacher && (
        <div className="screen-only" style={{ 
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', 
          padding: '10px 14px', marginBottom: '16px', fontSize: '0.8rem', color: '#166534' 
        }}>
          📋 Showing complete result for this student (all subjects).
        </div>
      )}

      {/* ===== Results ===== */}
      {marksLoading ? (
        <div className="screen-only" style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '50%', 
            border: '4px solid #e5e7eb', borderTopColor: '#1A3A6B', 
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' 
          }} />
          <p style={{ color: '#6b7280' }}>Loading results...</p>
        </div>
      ) : marks.length === 0 ? (
        <div style={{ 
          background: 'white', borderRadius: '16px', padding: '60px', 
          textAlign: 'center', boxShadow: '0 1px 8px rgba(0,0,0,0.08)' 
        }}>
          <FaUserGraduate size={40} style={{ color: '#d1d5db', marginBottom: '16px' }} />
          <h3 style={{ color: '#6b7280', margin: '0 0 8px' }}>No results found</h3>
          <p style={{ color: '#9ca3af', margin: '0 0 16px' }}>
            This student has no marks entered yet.
          </p>
          <div className="screen-only" style={{ 
            background: '#f8fafc', borderRadius: '8px', padding: '16px', 
            textAlign: 'left', maxWidth: '500px', margin: '0 auto', fontSize: '0.8rem', color: '#6b7280'
          }}>
            <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#374151' }}>Debug Info:</p>
            <p style={{ margin: '0 0 4px' }}>Student ID: <code>{selectedStudent.id}</code></p>
            <p style={{ margin: '0 0 4px' }}>Linked User ID: <code>{selectedStudent.linkedUserId || 'Not set'}</code></p>
            <p style={{ margin: '0 0 4px' }}>Query used: <code>{selectedStudent.linkedUserId || selectedStudent.id}</code></p>
            <p style={{ margin: 0 }}>Collection: <code>ssnebs_marks</code> | Field: <code>studentId</code></p>

          </div>
        </div>
      ) : (
        Object.entries(grouped).map(([examType, subjects]) => {
          const stats = examStats(subjects);
          return (
            <div key={examType} style={{
              background: 'white', borderRadius: '16px', marginBottom: '20px',
              boxShadow: '0 1px 8px rgba(0,0,0,0.08)', overflow: 'hidden'
            }}>
              {/* SCREEN: Exam Header */}
              <div className="screen-only" style={{
                background: 'linear-gradient(90deg, #1A3A6B, #2d5299)',
                padding: '16px 24px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: '12px'
              }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaTrophy style={{ color: '#F5C518' }} /> {examType}
                </h3>
                <div style={{ display: 'flex', gap: '16px', color: 'white', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>Total: <b>{stats.total}/{stats.fullTot}</b></span>
                  <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>Percentage: <b>{stats.pct}%</b></span>
                  <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>GPA: <b>{stats.gpa}</b></span>
                  <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                    Passed: <b style={{ color: '#86efac' }}>{stats.passed}</b> / Failed: <b style={{ color: '#fca5a5' }}>{stats.failed}</b>
                  </span>
                </div>
              </div>

              {/* PRINT: Exam Header */}
              <div className="print-exam-header">
                <h3 className="print-exam-title">
                  <FaTrophy style={{ color: '#F5C518' }} /> {examType}
                </h3>
                <div className="print-exam-stats">
                  <span>Total: <b>{stats.total}/{stats.fullTot}</b></span>
                  <span>Percentage: <b>{stats.pct}%</b></span>
                  <span>GPA: <b>{stats.gpa}</b></span>
                  <span>Passed: <b className="pass-count">{stats.passed}</b> / Failed: <b className="fail-count">{stats.failed}</b></span>
                </div>
              </div>

              {/* SCREEN: Table */}
              <div className="screen-only" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Subject', 'Obtained', 'Full Marks', 'Pass Marks', 'Grade', 'Grade Point', 'Result'].map(h => (
                        <th key={h} style={{
                          padding: '11px 16px', textAlign: 'left', fontSize: '0.76rem',
                          fontWeight: 700, color: '#6b7280', textTransform: 'uppercase',
                          letterSpacing: '0.05em', borderBottom: '2px solid #e5e7eb'
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.sort((a, b) => a.subject?.localeCompare(b.subject)).map((m, i) => {
                      const gc = GRADE_COLOR[m.grade] || GRADE_COLOR['NG'];
                      const gp = NEPALI_GPA[m.grade]?.gradePoint || 0;
                      return (
                        <tr key={`screen-${m.subject}-${i}`} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{m.subject}</td>
                          <td style={{ padding: '12px 16px', fontSize: '1rem', fontWeight: 800, color: m.pass ? '#166534' : '#dc2626' }}>{m.obtained}</td>
                          <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '0.875rem' }}>{m.fullMarks}</td>
                          <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '0.875rem' }}>{m.passMarks}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '4px 12px', borderRadius: '999px', background: gc.bg, color: gc.color, fontWeight: 800, fontSize: '0.82rem' }}>{m.grade}</span>
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1A3A6B', fontSize: '0.9rem' }}>
                            {gp.toFixed(1)}
                          </td>
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
                        <span style={{
                          padding: '4px 12px', borderRadius: '999px', fontWeight: 800, fontSize: '0.82rem',
                          background: parseFloat(stats.pct) >= 35 ? '#f0fdf4' : '#fef2f2',
                          color: parseFloat(stats.pct) >= 35 ? '#166534' : '#dc2626'
                        }}>
                          {parseFloat(stats.pct) >= 35 ? 'Promoted' : 'Not Promoted'}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* PRINT: Table */}
              <div className="print-table-wrap">
                <table className="print-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Obtained</th>
                      <th>Full Marks</th>
                      <th>Pass Marks</th>
                      <th>Grade</th>
                      <th>Grade Point</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.sort((a, b) => a.subject?.localeCompare(b.subject)).map((m, i) => {
                      const gc = GRADE_COLOR[m.grade] || GRADE_COLOR['NG'];
                      const gp = NEPALI_GPA[m.grade]?.gradePoint || 0;
                      return (
                        <tr key={`print-${m.subject}-${i}`} className={i % 2 === 0 ? 'even' : 'odd'}>
                          <td className="col-subject">{m.subject}</td>
                          <td className={`col-obtained ${m.pass ? 'pass' : 'fail'}`}>{m.obtained}</td>
                          <td className="col-full">{m.fullMarks}</td>
                          <td className="col-pass">{m.passMarks}</td>
                          <td className="col-grade">
                            <span className="grade-badge" style={{ background: gc.bg, color: gc.color }}>
                              {m.grade}
                            </span>
                          </td>
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
                        <span className={`promo-badge ${parseFloat(stats.pct) >= 35 ? 'promoted' : 'not-promoted'}`}>
                          {parseFloat(stats.pct) >= 35 ? 'Promoted' : 'Not Promoted'}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        })
      )}

      {/* GPA Legend - Screen only */}
      {marks.length > 0 && (
        <div className="screen-only" style={{
          background: 'white', borderRadius: '12px', padding: '20px',
          marginBottom: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.08)'
        }}>
          <h4 style={{ margin: '0 0 12px', color: '#1A3A6B', fontSize: '0.9rem', fontWeight: 700 }}>
            Nepali GPA Grading System
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
            {Object.entries(NEPALI_GPA).map(([grade, info]) => (
              <div key={grade} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px' }}>
                <span style={{
                  padding: '2px 8px', borderRadius: '4px',
                  background: GRADE_COLOR[grade]?.bg || '#f3f4f6',
                  color: GRADE_COLOR[grade]?.color || '#374151',
                  fontWeight: 800, fontSize: '0.75rem', minWidth: '28px', textAlign: 'center'
                }}>
                  {grade}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{info.gradePoint} - {info.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print Button - Screen only */}
      {marks.length > 0 && (
        <div className="screen-only" style={{ textAlign: 'right', marginTop: '8px' }}>
          <button onClick={() => window.print()} style={{
            padding: '10px 20px', background: '#1A3A6B', color: 'white',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.875rem', display: 'inline-flex',
            alignItems: 'center', gap: '7px'
          }}>
            <FaPrint /> Print Results
          </button>
        </div>
      )}

      {/* ===== STYLES ===== */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ============================================
           SCREEN STYLES
           ============================================ */

        /* Hide print-only elements on screen */
        .print-header,
        .print-student-card,
        .print-exam-header,
        .print-table-wrap,
        .print-table {
          display: none;
        }

        /* ============================================
           PRINT STYLES
           ============================================ */
        @media print {
          @page {
            margin: 12mm 10mm;
            size: A4;
          }

          /* Hide ALL screen elements */
          .screen-only,
          .screen-only * {
            display: none !important;
          }

          /* Show print elements */
          .print-header,
          .print-student-card,
          .print-exam-header,
          .print-table-wrap,
          .print-table {
            display: block !important;
          }

          body { 
            background: white !important; 
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: 'Segoe UI', Arial, sans-serif;
          }

          * {
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* ===== PRINT HEADER ===== */
          .print-header {
            display: block !important;
            margin-bottom: 16px;
            page-break-inside: avoid;
          }

          .print-header-box {
            border: 2px solid #1A3A6B;
            padding: 2px;
            background: white;
          }

          .print-header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px 8px;
            background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
          }

          .print-logo-side {
            flex-shrink: 0;
            width: 60px;
            height: 60px;
          }

          .print-logo-img {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #1A3A6B;
          }

          .print-header-center {
            text-align: center;
            flex: 1;
            padding: 0 16px;
          }

          .print-school-name {
            margin: 0 0 4px;
            color: #1A3A6B;
            font-size: 20pt;
            font-weight: 900;
            letter-spacing: 2px;
            text-transform: uppercase;
          }

          .print-school-address {
            margin: 0 0 4px;
            color: #4b5563;
            font-size: 9pt;
            font-weight: 500;
          }

          .print-school-contact {
            display: flex;
            justify-content: center;
            gap: 12px;
            color: #6b7280;
            font-size: 7.5pt;
          }

          .print-header-divider {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 16px;
            margin: 4px 0;
          }

          .print-line {
            flex: 1;
            height: 1px;
            background: linear-gradient(90deg, transparent, #1A3A6B, transparent);
            max-width: 100px;
          }

          .print-line-center {
            width: 30px;
            height: 2px;
            background: #D72638;
            margin: 0 6px;
          }

          .print-dot {
            color: #D72638;
            font-size: 7pt;
            margin: 0 4px;
          }

          .print-report-box {
            text-align: center;
            padding: 6px 0 10px;
          }

          .print-report-title {
            margin: 0;
            color: #D72638;
            font-size: 13pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 3px;
            display: inline-block;
            padding: 4px 20px;
            border: 2px solid #D72638;
            border-radius: 3px;
            background: #fef2f2;
          }

          .print-report-subtitle {
            margin: 6px 0 0;
            color: #9ca3af;
            font-size: 7pt;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
          }

          /* ===== PRINT STUDENT CARD ===== */
          .print-student-card {
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            background: white !important;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 14px;
            page-break-inside: avoid;
          }

          .print-student-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .print-avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: linear-gradient(135deg, #1A3A6B, #10B981);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16pt;
            font-weight: 900;
            flex-shrink: 0;
          }

          .print-student-details {
            display: flex;
            flex-direction: column;
          }

          .print-student-name {
            margin: 0;
            font-size: 13pt;
            color: #1A3A6B;
            font-weight: 800;
          }

          .print-student-meta {
            margin: 2px 0 0;
            font-size: 8.5pt;
            color: #6b7280;
          }

          .print-student-parents {
            margin: 1px 0 0;
            font-size: 7.5pt;
            color: #9ca3af;
          }

          .print-gpa-box {
            text-align: center;
            padding: 8px 16px;
            background: linear-gradient(135deg, #1A3A6B, #10B981) !important;
            border-radius: 6px;
            color: white;
            min-width: 80px;
          }

          .print-gpa-value {
            margin: 0;
            font-size: 18pt;
            font-weight: 800;
          }

          .print-gpa-label {
            margin: 1px 0 0;
            font-size: 6.5pt;
            opacity: 0.9;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          /* ===== PRINT EXAM HEADER ===== */
          .print-exam-header {
            background: linear-gradient(90deg, #1A3A6B, #2d5299) !important;
            padding: 8px 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: white;
            page-break-inside: avoid;
          }

          .print-exam-title {
            margin: 0;
            font-size: 10pt;
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 700;
          }

          .print-exam-stats {
            display: flex;
            gap: 12px;
            font-size: 8pt;
          }

          .pass-count { color: #86efac !important; }
          .fail-count { color: #fca5a5 !important; }

          /* ===== PRINT TABLE ===== */
          .print-table-wrap {
            overflow: visible;
          }

          .print-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9pt;
          }

          .print-table thead tr {
            background: #f8fafc !important;
            border-bottom: 2px solid #e5e7eb;
          }

          .print-table th {
            padding: 6px 8px;
            text-align: left;
            font-size: 7pt;
            font-weight: 700;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 2px solid #e5e7eb;
          }

          .print-table td {
            padding: 5px 8px;
            border-bottom: 1px solid #f3f4f6;
          }

          .print-table .even { background: white; }
          .print-table .odd { background: #fafafa; }

          .col-subject {
            font-weight: 600;
            color: #1e293b;
            width: 24%;
          }

          .col-obtained {
            font-weight: 800;
            font-size: 10pt;
            width: 12%;
          }

          .col-obtained.pass { color: #166534 !important; }
          .col-obtained.fail { color: #dc2626 !important; }
          .col-obtained.total { color: #1A3A6B !important; font-size: 10.5pt; }

          .col-full, .col-pass {
            color: #6b7280;
            width: 12%;
            font-size: 8.5pt;
          }

          .col-grade { width: 10%; }

          .grade-badge {
            padding: 2px 8px;
            border-radius: 999px;
            font-weight: 800;
            font-size: 8pt;
            display: inline-block;
          }

          .col-gp {
            font-weight: 700;
            color: #1A3A6B;
            width: 12%;
          }

          .col-result { width: 15%; }

          .result-pass {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #16a34a;
            font-weight: 700;
            font-size: 8pt;
          }

          .result-fail {
            display: flex;
            align-items: center;
            gap: 4px;
            color: #dc2626;
            font-weight: 700;
            font-size: 8pt;
          }

          .total-row {
            background: #f0f4ff !important;
            border-top: 2px solid #e5e7eb;
            font-weight: 800;
          }

          .total-row td {
            padding: 6px 8px;
            color: #1A3A6B;
          }

          .col-percent {
            font-weight: 800;
            color: #1A3A6B;
            font-size: 9.5pt;
          }

          .promo-badge {
            padding: 2px 8px;
            border-radius: 999px;
            font-weight: 800;
            font-size: 8pt;
            display: inline-block;
          }

          .promo-badge.promoted {
            background: #f0fdf4 !important;
            color: #166534 !important;
          }

          .promo-badge.not-promoted {
            background: #fef2f2 !important;
            color: #dc2626 !important;
          }

          /* ===== HIDE ALL UI ===== */
          aside, .teacher-sidebar, .admin-sidebar,
          header, .sticky, nav,
          .admin-layout > aside,
          .admin-layout > div > div:first-child,
          .teacher-main > header,
          [class*="topbar"],
          [class*="top-bar"],
          [class*="TopBar"],
          [class*="sidebar"],
          [class*="Sidebar"] {
            display: none !important;
          }

          main, .teacher-main, .admin-content,
          .admin-layout,
          .admin-layout > div {
            margin-left: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
