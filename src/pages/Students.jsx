import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import {
  FaUserGraduate, FaSearch, FaBirthdayCake, FaVenusMars,
  FaPhone, FaMapMarkerAlt, FaExclamationTriangle, FaFilter
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

const inputStyle = {
  width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb',
  borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit',
  boxSizing: 'border-box', outline: 'none',
};

const Students = () => {
  const { currentUser } = useAuth();
  const isTeacher = currentUser?.role === 'teacher';

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterSection, setFilterSection] = useState('all');
  const [error, setError] = useState(null);
  const [schoolOptions, setSchoolOptions] = useState({ classes: [], sections: {} });

  // Teacher's allowed departments and sections
  const teacherDepartments = isTeacher
    ? (currentUser?.departments || (currentUser?.department ? [currentUser.department] : []))
    : [];
  const teacherSections = isTeacher
    ? (currentUser?.sections || [])
    : [];

  // Load school options for section info
  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'admin_school_options', 'main'));
        if (snap.exists()) {
          setSchoolOptions(snap.data());
        }
      } catch (err) {
        console.error('Failed to load school options', err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const studentList = [];

        // Method 1: From Student Manager
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
                    section: s.section || '',
                    rollNo: s.rollNo,
                    gender: s.gender || '',
                    dob: s.dob || '',
                    fatherName: s.fatherName || '',
                    motherName: s.motherName || '',
                    parentContact: s.parentContact || '',
                    address: s.address || '',
                    linkedUserId: s.linkedUserId || null,
                    source: 'student_manager'
                  });
                }
              });
            }
          }
        } catch (err) {
          console.error('Error fetching admin_students:', err.message);
        }

        // Method 2: From User Manager
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
                section: data.section || '',
                rollNo: data.rollNo,
                gender: data.gender || '',
                dob: data.dob || '',
                fatherName: data.fatherName || '',
                motherName: data.motherName || '',
                parentContact: data.parentContact || '',
                address: data.address || '',
                linkedUserId: d.id,
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

  const calculateAge = (dob) => {
    if (!dob) return '—';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Check if a class has sections defined in school options
  const classHasSections = (cls) => {
    if (!cls) return false;
    const sections = (schoolOptions.sections || {})[cls];
    return sections && Array.isArray(sections) && sections.length > 0;
  };

  const classes = [...new Set(students.map(s => s.class))].sort();
  const sections = [...new Set(students.map(s => s.section).filter(Boolean))].sort();

  const filteredStudents = students.filter(s => {
    const matchSearch = !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo?.toLowerCase().includes(search.toLowerCase());
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
          if (teacherSections.length > 0) {
            matchTeacherSection = teacherSections.includes(s.section);
          }
          // If teacherSections is empty, they can see all sections in their department
        }
        // If class has NO sections → teacher sees all students in their department (already matched)
      }

      matchTeacher = matchDept && matchTeacherSection;
    }

    return matchSearch && matchClass && matchSection && matchTeacher;
  });

  // Build a helpful message about what the teacher can see
  const getTeacherAccessInfo = () => {
    if (!isTeacher) return null;

    const deptText = teacherDepartments.join(', ') || 'All';

    if (teacherSections.length === 0) {
      return `Showing all students in your departments: ${deptText} (all sections)`;
    }

    // Group sections by class for display
    const sectionByClass = {};
    teacherSections.forEach(sec => {
      // sections are stored like "A", "B" or "10-A", etc.
      // Try to extract class from section format or just show raw
      sectionByClass[sec] = true;
    });

    return `Departments: ${deptText} | Sections: ${teacherSections.join(', ')}`;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-secondary)', margin: 0 }}>Student List</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '4px 0 0' }}>
            View enrolled students
            {isTeacher && ' assigned to you'}
          </p>
          {isTeacher && (
            <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ padding: '4px 10px', background: '#eff6ff', color: '#1e40af', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                🏫 {getTeacherAccessInfo()}
              </span>
            </div>
          )}
        </div>
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

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '36px' }} />
        </div>
        <select value={filterClass} onChange={e => { setFilterClass(e.target.value); setFilterSection('all'); }} style={inputStyle}>
          <option value="all">All Classes</option>
          {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
        </select>
        <select value={filterSection} onChange={e => setFilterSection(e.target.value)} style={inputStyle}>
          <option value="all">All Sections</option>
          {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
        </select>
      </div>

      {/* Teacher restriction notice */}
      {isTeacher && (
        <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.82rem', color: '#854d0e' }}>
          <FaFilter style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          <strong>Access Rules:</strong>
          <ul style={{ margin: '6px 0 0', paddingLeft: '18px', fontSize: '0.78rem' }}>
            <li>Classes <strong>with sections</strong>: You see only students in sections assigned to you</li>
            <li>Classes <strong>without sections</strong>: You see all students in your departments</li>
            {teacherSections.length === 0 && (
              <li><em>You currently have no specific section assignments — you can view all sections in your departments</em></li>
            )}
          </ul>
        </div>
      )}

      {/* Student Table */}
      <div style={{ background: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-secondary)', color: 'white' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Student</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Class/Section</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Age</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Gender</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Parent Contact</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px', textAlign: 'center' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '50%', 
                    border: '4px solid #e5e7eb', borderTopColor: '#1A3A6B', 
                    animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' 
                  }} />
                  <p style={{ color: '#6b7280' }}>Loading students...</p>
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px', textAlign: 'center' }}>
                  <FaUserGraduate size={40} style={{ color: '#d1d5db', marginBottom: '16px' }} />
                  <p style={{ color: '#6b7280' }}>
                    {isTeacher
                      ? 'No students match your department/section assignments. Contact admin if you believe this is an error.'
                      : 'No students found. Add students from Student Management first.'
                    }
                  </p>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, idx) => {
                const hasSections = classHasSections(student.class);
                const dept = getDepartmentFromClass(student.class);
                return (
                  <tr key={student.id} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '0.85rem', fontWeight: 700,
                          overflow: 'hidden'
                        }}>
                          {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{student.name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>Roll: {student.rollNo}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>
                      Class {student.class} – {student.section || '—'}
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ padding: '1px 6px', background: '#f3f4f6', borderRadius: '4px', fontSize: '0.7rem' }}>{dept}</span>
                        {hasSections && student.section && (
                          <span style={{ padding: '1px 6px', background: '#eff6ff', borderRadius: '4px', fontSize: '0.7rem', color: '#1e40af' }}>
                            Sectioned
                          </span>
                        )}
                        {!hasSections && (
                          <span style={{ padding: '1px 6px', background: '#f0fdf4', borderRadius: '4px', fontSize: '0.7rem', color: '#166534' }}>
                            No sections
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.9rem' }}>
                      {calculateAge(student.dob)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '999px',
                        background: student.gender === 'Male' ? '#eff6ff' : student.gender === 'Female' ? '#fef2f2' : '#f3f4f6',
                        color: student.gender === 'Male' ? '#1e40af' : student.gender === 'Female' ? '#dc2626' : '#374151',
                        fontSize: '0.75rem', fontWeight: 600
                      }}>
                        {student.gender || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6b7280' }}>
                      {student.parentContact || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6b7280' }}>
                      {student.address || '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Students;