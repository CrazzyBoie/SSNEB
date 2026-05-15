import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, query, where, serverTimestamp, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { FaSave, FaSearch, FaFilter } from 'react-icons/fa';

const EXAMS    = ['First Terminal','Second Terminal','Final Exam','Pre-Board','Unit Test 1','Unit Test 2'];

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

const gradeFromMark = (m, full) => {
  const pct = (m / full) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C+';
  if (pct >= 40) return 'C';
  if (pct >= 35) return 'D';
  return 'NG';
};

export default function MarksManager() {
  const { currentUser } = useAuth();
  const isTeacher = currentUser?.role === 'teacher';

  const [students, setStudents]     = useState([]);
  const [allMarks, setAllMarks]     = useState({});
  const [selectedClass, setClass]   = useState('');
  const [selectedSection, setSection] = useState('');
  const [selectedExam, setExam]     = useState('');
  const [selectedSubject, setSubject] = useState(isTeacher ? (currentUser?.subjects?.[0] || currentUser?.subject || '') : '');
  const [fullMarks, setFullMarks]   = useState(100);
  const [passMarks, setPassMarks]   = useState(35);
  const [inputs, setInputs]         = useState({});
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [search, setSearch]         = useState('');
  const [schoolOptions, setSchoolOptions] = useState({ classes: [], sections: {}, subjects: {} });

  // Load school options from Firestore (Page Content → School Options)
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

  // Classes from school options
  const classes = schoolOptions.classes || [];
  // Sections filtered by selected class — from school options
  const sections = selectedClass
    ? ((schoolOptions.sections || {})[selectedClass] || [])
    : [];
  // Subjects filtered by selected class — from school options
  const classSubjects = selectedClass
    ? ((schoolOptions.subjects || {})[selectedClass] || [])
    : Object.values(schoolOptions.subjects || {}).reduce((acc, arr) => {
        (Array.isArray(arr) ? arr : []).forEach(s => { if (!acc.includes(s)) acc.push(s); });
        return acc;
      }, []).sort();

  // Teacher's allowed subjects and departments
  const teacherSubjects = isTeacher 
    ? (currentUser?.subjects || (currentUser?.subject ? [currentUser.subject] : []))
    : [];
  const teacherDepartments = isTeacher
    ? (currentUser?.departments || (currentUser?.department ? [currentUser.department] : []))
    : [];

  // Fetch students from admin_students (useFirestore format: ssnebs collection, admin_students doc, data field)
  useEffect(() => {
    const fetchStudents = async () => {
      const studentList = [];

      // Method 1: From Student Manager (useFirestore stores in ssnebs collection as document with data field)
      try {
        const docRef = doc(db, 'ssnebs', 'admin_students');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const docData = docSnap.data();
          console.log('admin_students doc found:', docData);
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
                  source: 'student_manager'
                });
              }
            });
          }
        } else {
          console.log('admin_students document does not exist at ssnebs/admin_students');
        }
      } catch (err) {
        console.error('Error fetching admin_students:', err.message);
      }

      // Method 2: From User Manager (ssnebs_user collection with role='student')
      try {
        const userSnap = await getDocs(query(collection(db, 'ssnebs_user'), where('role', '==', 'student')));
        userSnap.docs.forEach(d => {
          const data = d.data();
          // Only add if not already in list (check by name + class + rollNo)
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
              source: 'user_manager'
            });
          }
        });
      } catch (err) {
        console.error('Error fetching ssnebs_user:', err.message);
      }

      console.log('Total students loaded:', studentList.length);
      setStudents(studentList);
    };
    fetchStudents();
  }, [saved]);

  useEffect(() => {
    const fetchMarks = async () => {
      const snap = await getDocs(collection(db, 'ssnebs_marks'));
      const map = {};
      snap.docs.forEach(d => { map[d.id] = d.data(); });
      setAllMarks(map);
    };
    fetchMarks();
  }, [saved]);

  // Filter students by class/section/search AND by teacher's department/subject restrictions
  const filteredStudents = students.filter(s => {
    const matchClass   = !selectedClass   || s.class   === selectedClass;
    const matchSection = !selectedSection || s.section === selectedSection;
    const matchSearch  = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.rollNo?.includes(search);

    // Teacher restrictions
    let matchTeacher = true;

    if (isTeacher) {
      const studentDept = getDepartmentFromClass(s.class);

      // First check: student must be in teacher's department
      const matchDept = teacherDepartments.length === 0 || teacherDepartments.includes(studentDept);

      // Second check: section-level filtering
      let matchTeacherSection = true;
      if (matchDept) {
        const classSections = (schoolOptions.sections || {})[s.class];
        const hasSections = classSections && Array.isArray(classSections) && classSections.length > 0;

        if (hasSections) {
          // Class HAS sections → teacher must be assigned to this student's specific section
          // OR teacher has no section restrictions (empty sections array)
          const teacherSections = currentUser?.sections || [];
          if (teacherSections.length > 0) {
            // Check if any of teacher's sections match this student's class-section combo
            matchTeacherSection = teacherSections.some(ts => {
              // Format could be "10-A" or just "A"
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

      // Subject check: if subject selected, teacher must teach it
      let matchTeacherSubject = true;
      if (selectedSubject) {
        matchTeacherSubject = teacherSubjects.length === 0 || teacherSubjects.includes(selectedSubject);
      }

      matchTeacher = matchDept && matchTeacherSection && matchTeacherSubject;
    }

    return matchClass && matchSection && matchSearch && matchTeacher;
  }).sort((a, b) => (parseInt(a.rollNo)||0) - (parseInt(b.rollNo)||0));

  // Load existing marks when exam/subject/class changes
  useEffect(() => {
    if (!selectedExam || !selectedSubject) return;
    const newInputs = {};
    filteredStudents.forEach(s => {
      const key = `${s.id}_${selectedExam}_${selectedSubject}`;
      if (allMarks[key]) newInputs[s.id] = allMarks[key].obtained ?? '';
    });
    setInputs(newInputs);
  }, [selectedExam, selectedSubject, selectedClass, selectedSection, allMarks]);

  const handleMarkChange = (studentId, val) => {
    const num = parseInt(val);
    if (val === '' || (num >= 0 && num <= fullMarks)) {
      setInputs(prev => ({ ...prev, [studentId]: val }));
    }
  };

  const handleSaveAll = async () => {
    if (!selectedExam || !selectedSubject) return alert('Please select exam type and subject first.');

    // Verify teacher can save marks for this subject
    if (isTeacher && teacherSubjects.length > 0 && !teacherSubjects.includes(selectedSubject)) {
      return alert('You are not authorized to enter marks for this subject.');
    }

    setSaving(true);
    try {
      const promises = filteredStudents.map(async s => {
        const obtained = parseInt(inputs[s.id]);
        if (isNaN(obtained)) return;

        // KEY FIX: Use linkedUserId (Firebase Auth UID) as studentId if available, fallback to doc id
        const studentIdForQuery = s.linkedUserId || s.id;
        const key = `${s.id}_${selectedExam}_${selectedSubject}`;

        await setDoc(doc(db, 'ssnebs_marks', key), {
          studentId: studentIdForQuery,
          studentDocId: s.id,
          studentName: s.name,
          class: s.class || '',
          section: s.section || '',
          rollNo: s.rollNo || '',
          examType: selectedExam,
          subject: selectedSubject,
          obtained,
          fullMarks,
          passMarks,
          grade: gradeFromMark(obtained, fullMarks),
          pass: obtained >= passMarks,
          enteredBy: currentUser?.name || currentUser?.username,
          updatedAt: serverTimestamp(),
        });
      });
      await Promise.all(promises);
      setSaved(s => !s);
      setSaving(false);
      const btn = document.getElementById('save-marks-btn');
      if (btn) { btn.textContent = '✅ Saved!'; setTimeout(() => { btn.textContent = '💾 Save All Marks'; }, 2000); }
    } catch (err) {
      alert('Error saving: ' + err.message);
      setSaving(false);
    }
  };

  // Filter available subjects for teacher
  const availableSubjects = isTeacher
    ? classSubjects.filter(s => teacherSubjects.includes(s))
    : classSubjects;

  return (
    <div>
      <div style={{ marginBottom:'24px' }}>
        <h2 style={{ fontSize:'1.8rem', color:'var(--color-secondary)', margin:0 }}>Marks Manager</h2>
        <p style={{ color:'#6b7280', fontSize:'0.875rem', margin:'4px 0 0' }}>Enter and update student examination marks</p>
        {isTeacher && (
          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ padding: '4px 10px', background: '#eff6ff', color: '#1e40af', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
              🏫 Departments: {teacherDepartments.join(', ') || 'All'}
            </span>
            <span style={{ padding: '4px 10px', background: '#f0fdf4', color: '#166534', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
              📚 Subjects: {teacherSubjects.join(', ') || 'All'}
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 6px rgba(0,0,0,0.08)', marginBottom:'20px' }}>
        <h4 style={{ margin:'0 0 14px', color:'var(--color-secondary)', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'6px' }}><FaFilter /> Filters & Configuration</h4>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'12px' }}>
          <div>
            <label style={{ display:'block', fontWeight:600, fontSize:'0.8rem', color:'#374151', marginBottom:'5px' }}>Class</label>
            <select value={selectedClass} onChange={e => { setClass(e.target.value); setSection(''); setSubject(''); }} style={{ width:'100%', padding:'9px 10px', border:'2px solid #e5e7eb', borderRadius:'8px', fontSize:'0.875rem', background:'white' }}>
              <option value="">All Classes</option>
              {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:'block', fontWeight:600, fontSize:'0.8rem', color:'#374151', marginBottom:'5px' }}>Section</label>
            <select value={selectedSection} onChange={e => setSection(e.target.value)} style={{ width:'100%', padding:'9px 10px', border:'2px solid #e5e7eb', borderRadius:'8px', fontSize:'0.875rem', background:'white' }}>
              <option value="">All Sections</option>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:'block', fontWeight:600, fontSize:'0.8rem', color:'#374151', marginBottom:'5px' }}>Exam Type *</label>
            <select value={selectedExam} onChange={e => setExam(e.target.value)} style={{ width:'100%', padding:'9px 10px', border:'2px solid #e5e7eb', borderRadius:'8px', fontSize:'0.875rem', background:'white' }}>
              <option value="">Select Exam…</option>
              {EXAMS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:'block', fontWeight:600, fontSize:'0.8rem', color:'#374151', marginBottom:'5px' }}>Subject *</label>
            <select 
              value={selectedSubject} 
              onChange={e => setSubject(e.target.value)} 
              disabled={isTeacher && availableSubjects.length <= 1} 
              style={{ width:'100%', padding:'9px 10px', border:'2px solid #e5e7eb', borderRadius:'8px', fontSize:'0.875rem', background:'white', opacity: (isTeacher && availableSubjects.length <= 1) ? 0.7 : 1 }}
            >
              <option value="">{!selectedClass ? 'Select class first…' : 'Select Subject…'}</option>
              {availableSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
            {isTeacher && availableSubjects.length === 0 && (
              <p style={{ fontSize: '0.75rem', color: '#dc2626', margin: '4px 0 0' }}>
                ⚠ No subjects assigned to you for this class.
              </p>
            )}
          </div>
          <div>
            <label style={{ display:'block', fontWeight:600, fontSize:'0.8rem', color:'#374151', marginBottom:'5px' }}>Full Marks</label>
            <input type="number" value={fullMarks} onChange={e => setFullMarks(parseInt(e.target.value)||100)} style={{ width:'100%', padding:'9px 10px', border:'2px solid #e5e7eb', borderRadius:'8px', fontSize:'0.875rem', boxSizing:'border-box' }} />
          </div>
          <div>
            <label style={{ display:'block', fontWeight:600, fontSize:'0.8rem', color:'#374151', marginBottom:'5px' }}>Pass Marks</label>
            <input type="number" value={passMarks} onChange={e => setPassMarks(parseInt(e.target.value)||35)} style={{ width:'100%', padding:'9px 10px', border:'2px solid #e5e7eb', borderRadius:'8px', fontSize:'0.875rem', boxSizing:'border-box' }} />
          </div>
        </div>
      </div>

      {/* Student Search */}
      <div style={{ position:'relative', marginBottom:'16px' }}>
        <FaSearch style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }} />
        <input placeholder="Search student by name or roll no…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ width:'100%', padding:'10px 12px 10px 36px', border:'2px solid #e5e7eb', borderRadius:'8px', fontSize:'0.9rem', boxSizing:'border-box', outline:'none' }} />
      </div>

      {/* Restriction notice for teachers */}
      {isTeacher && (
        <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '0.8rem', color: '#854d0e' }}>
          <strong>🔒 Access Rules:</strong>
          <ul style={{ margin: '4px 0 0', paddingLeft: '16px', fontSize: '0.75rem' }}>
            <li>Departments: <strong>{teacherDepartments.join(', ')}</strong></li>
            {currentUser?.sections && currentUser.sections.length > 0 ? (
              <li>Sections: <strong>{currentUser.sections.join(', ')}</strong> (sectioned classes only)</li>
            ) : (
              <li><em>No section restrictions — all sections in your departments</em></li>
            )}
            {teacherSubjects.length > 0 && (
              <li>Subjects: <strong>{teacherSubjects.join(', ')}</strong></li>
            )}
          </ul>
        </div>
      )}

      {/* Marks Table */}
      {filteredStudents.length === 0 ? (
        <div style={{ background:'white', borderRadius:'12px', padding:'48px', textAlign:'center', boxShadow:'0 1px 6px rgba(0,0,0,0.08)' }}>
          <p style={{ color:'#6b7280' }}>
            {isTeacher 
              ? 'No students match your department/section/subject assignments. Contact admin if you believe this is an error.'
              : 'No students found. Add students from Student Management first.'
            }
          </p>
        </div>
      ) : (
        <div style={{ background:'white', borderRadius:'12px', boxShadow:'0 1px 6px rgba(0,0,0,0.08)', overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontWeight:700, color:'var(--color-secondary)', fontSize:'0.9rem' }}>
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
              {selectedExam && selectedSubject ? ` — ${selectedExam} / ${selectedSubject}` : ''}
            </span>
            <button id="save-marks-btn" onClick={handleSaveAll} disabled={saving || !selectedExam || !selectedSubject}
              style={{ padding:'9px 20px', background: (!selectedExam || !selectedSubject) ? '#9ca3af' : 'var(--color-success)', color:'white', border:'none', borderRadius:'8px', cursor: (!selectedExam || !selectedSubject) ? 'not-allowed' : 'pointer', fontWeight:700, fontSize:'0.875rem', display:'flex', alignItems:'center', gap:'6px' }}>
              <FaSave /> {saving ? 'Saving…' : 'Save All Marks'}
            </button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f8fafc' }}>
                  {['Roll No.', 'Student Name', 'Class', 'Obtained Marks', 'Grade', 'Status'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:'0.78rem', fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid #e5e7eb' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, i) => {
                  const obtained = parseInt(inputs[s.id]);
                  const grade    = !isNaN(obtained) ? gradeFromMark(obtained, fullMarks) : '—';
                  const pass     = !isNaN(obtained) ? obtained >= passMarks : null;
                  return (
                    <tr key={s.id} style={{ borderBottom:'1px solid #f3f4f6', background: i%2===0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding:'10px 16px', fontWeight:700, color:'#374151', fontSize:'0.875rem' }}>{s.rollNo || '—'}</td>
                      <td style={{ padding:'10px 16px', fontWeight:600, color:'#1e293b', fontSize:'0.875rem' }}>{s.name}</td>
                      <td style={{ padding:'10px 16px', color:'#6b7280', fontSize:'0.875rem' }}>
                        {s.class ? `Class ${s.class}${s.section ? ` – ${s.section}` : ''}` : '—'}
                      </td>
                      <td style={{ padding:'8px 16px' }}>
                        <input
                          type="number" min="0" max={fullMarks}
                          value={inputs[s.id] ?? ''}
                          onChange={e => handleMarkChange(s.id, e.target.value)}
                          placeholder={`0–${fullMarks}`}
                          disabled={!selectedExam || !selectedSubject}
                          style={{ width:'90px', padding:'7px 10px', border:'2px solid #e5e7eb', borderRadius:'6px', fontSize:'0.9rem', textAlign:'center', outline:'none' }}
                          onFocus={e => e.target.style.borderColor = '#1A3A6B'}
                          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                      </td>
                      <td style={{ padding:'10px 16px' }}>
                        <span style={{ padding:'3px 10px', borderRadius:'999px', background: grade === 'NG' ? '#fef2f2' : '#f0fdf4', color: grade === 'NG' ? '#dc2626' : '#166534', fontWeight:700, fontSize:'0.78rem' }}>
                          {grade}
                        </span>
                      </td>
                      <td style={{ padding:'10px 16px' }}>
                        {pass === null ? <span style={{ color:'#9ca3af', fontSize:'0.8rem' }}>—</span> :
                          <span style={{ padding:'3px 10px', borderRadius:'999px', fontSize:'0.78rem', fontWeight:700, background: pass ? '#f0fdf4' : '#fef2f2', color: pass ? '#166534' : '#dc2626' }}>
                            {pass ? 'Pass' : 'Fail'}
                          </span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}