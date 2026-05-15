import React, { useState, useEffect } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { compressImage } from '../hooks/useImageCompress';
import { defaultStudents } from '../data/defaultData';
import {
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUser, FaSearch,
  FaLink, FaUnlink, FaUserGraduate, FaBirthdayCake, FaVenusMars,
  FaPhone, FaMapMarkerAlt, FaUserPlus
} from 'react-icons/fa';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const GENDERS = ['Male', 'Female', 'Other'];

const inputStyle = {
  width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb',
  borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit',
  boxSizing: 'border-box', outline: 'none',
};

const emptyForm = {
  name: '',
  dob: '',
  gender: 'Male',
  class: '',
  section: '',
  rollNo: '',
  photo: null,
  fatherName: '',
  motherName: '',
  parentContact: '',
  address: '',
  linkedUserId: null,
  active: true,
};

const defaultSchoolOptions = {
  classes: ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  sections: {}, // per-class map: { '1': ['A','B'], '10': ['A','B','C'] }
  subjects: {}, // per-class map: { '10': ['Physics','Chemistry',...] }
};

const StudentsManager = () => {
  const [students, setStudents] = useFirestore('admin_students', defaultStudents);
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [createUser, setCreateUser] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [schoolOptions, setSchoolOptions] = useState(defaultSchoolOptions);

  // Load school options (classes & sections) from Firestore
  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'admin_school_options', 'main'));
        if (snap.exists()) {
          setSchoolOptions(prev => ({ ...prev, ...snap.data() }));
        }
      } catch (err) {
        console.error('Failed to load school options', err);
      }
    };
    load();
  }, []);

  // Fetch users for linking
  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, 'ssnebs_user'));
      const userList = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === 'student');
      setUsers(userList);
    };
    fetchUsers();
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 400, 0.75);
        setFormData(prev => ({ ...prev, photo: compressed }));
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => setFormData(prev => ({ ...prev, photo: reader.result }));
        reader.readAsDataURL(file);
      }
    }
  };

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

  const generateUsername = (name) => {
    return name.toLowerCase().replace(/[^a-z]/g, '').substring(0, 8) + Math.floor(Math.random() * 1000);
  };

  const generatePassword = () => {
    return Math.random().toString(36).slice(-8) + 'A1!';
  };

  const handleCreateUserToggle = (checked) => {
    setCreateUser(checked);
    if (checked && formData.name) {
      setUserForm({
        username: generateUsername(formData.name),
        password: generatePassword()
      });
    }
  };

  const handleNameChange = (name) => {
    setFormData(prev => ({ ...prev, name }));
    if (createUser && name) {
      setUserForm({
        username: generateUsername(name),
        password: generatePassword()
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.class.trim() || !formData.rollNo.trim()) return; // section is optional

    setSaving(true);
    try {
      let linkedUserId = formData.linkedUserId;

      // Create user account if enabled
      if (createUser && !editing) {
        const username = userForm.username.trim().toLowerCase();
        const password = userForm.password.trim();

        // Check username uniqueness
        const existingSnap = await getDocs(collection(db, 'ssnebs_user'));
        const existing = existingSnap.docs.find(d => d.data().username === username);
        if (existing) {
          alert('Username already exists. Please change it.');
          setSaving(false);
          return;
        }

        const newUserRef = doc(collection(db, 'ssnebs_user'));
        await setDoc(newUserRef, {
          name: formData.name.trim(),
          username: username,
          password: password,
          role: 'student',
          class: formData.class.trim(),
          section: formData.section.trim(),
          rollNo: formData.rollNo.trim(),
          email: '',
          phone: formData.parentContact.trim(),
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        linkedUserId = newUserRef.id;
      }

      const studentData = {
        ...formData,
        linkedUserId: linkedUserId || null
      };

      if (editing) {
        setStudents(students.map(s => s.id === editing ? { ...studentData, id: editing } : s));
      } else {
        setStudents([...students, { ...studentData, id: Date.now() }]);
      }

      // Reset form
      setEditing(null);
      setShowForm(false);
      setFormData(emptyForm);
      setCreateUser(false);
      setUserForm({ username: '', password: '' });
    } catch (err) {
      console.error('Error saving student:', err);
      alert('Error: ' + err.message);
    }
    setSaving(false);
  };

  const handleEdit = (student) => {
    setEditing(student.id);
    setFormData(student);
    setShowForm(true);
    setCreateUser(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this student?')) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const handleLinkUser = (studentId, userId) => {
    setStudents(students.map(s => s.id === studentId ? { ...s, linkedUserId: userId } : s));
  };

  const handleUnlinkUser = (studentId) => {
    setStudents(students.map(s => s.id === studentId ? { ...s, linkedUserId: null } : s));
  };

  const classes = [...new Set(students.map(s => s.class))].sort();

  const filtered = students.filter(s => {
    const matchSearch = !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo?.toLowerCase().includes(search.toLowerCase());
    const matchClass = filterClass === 'all' || s.class === filterClass;
    return matchSearch && matchClass && s.active !== false;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-secondary)', margin: 0 }}>Student Management</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '4px 0 0' }}>Manage student records and link to user accounts</p>
        </div>
        <button onClick={() => { setEditing(null); setFormData(emptyForm); setShowForm(true); setCreateUser(false); }}
          style={{ padding: '10px 20px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <FaPlus /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '36px' }} />
        </div>
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)} style={inputStyle}>
          <option value="all">All Classes</option>
          {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
        </select>
      </div>

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
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Linked User</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student, idx) => (
              <tr key={student.id} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: student.photo ? 'transparent' : 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '0.85rem', fontWeight: 700,
                      overflow: 'hidden'
                    }}>
                      {student.photo
                        ? <img src={student.photo} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{student.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>Roll: {student.rollNo}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>
                  Class {student.class} – {student.section}
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
                    {student.gender}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#6b7280' }}>
                  {student.parentContact}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {student.linkedUserId ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <span style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 600 }}>✓ Linked</span>
                      <button onClick={() => handleUnlinkUser(student.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.75rem' }} title="Unlink">
                        <FaUnlink />
                      </button>
                    </div>
                  ) : (
                    <select
                      onChange={e => { if (e.target.value) handleLinkUser(student.id, e.target.value); }}
                      style={{ padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      <option value="">Link to user...</option>
                      {users.filter(u => !students.some(s => s.linkedUserId === u.id)).map(u => (
                        <option key={u.id} value={u.id}>{u.name} (@{u.username})</option>
                      ))}
                    </select>
                  )}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <button onClick={() => handleEdit(student)} style={{ padding: '6px 10px', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginRight: '6px' }}><FaEdit size={12} /></button>
                  <button onClick={() => handleDelete(student.id)} style={{ padding: '6px 10px', background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}><FaTrash size={12} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
              <h3 style={{ margin: 0, color: 'var(--color-secondary)', fontSize: '1.2rem' }}>
                {editing ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '1.2rem' }}><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
              {/* Photo Upload */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '100px', height: '100px', borderRadius: '50%',
                  border: '3px dashed var(--color-primary)',
                  margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', cursor: 'pointer',
                  background: formData.photo ? 'transparent' : '#f9fafb'
                }}>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} id="student-photo" />
                  <label htmlFor="student-photo" style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {formData.photo ? (
                      <img src={formData.photo} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <FaUser size={28} style={{ color: 'var(--color-muted)' }} />
                    )}
                  </label>
                </div>
                <label htmlFor="student-photo" style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  {formData.photo ? 'Change Photo' : 'Upload Photo'}
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>Full Name *</label>
                  <input style={inputStyle} value={formData.name} onChange={e => handleNameChange(e.target.value)} required placeholder="e.g. Ram Kumar Yadav" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>Date of Birth *</label>
                  <input type="date" style={inputStyle} value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>Gender *</label>
                  <select style={inputStyle} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>Class *</label>
                  <select style={inputStyle} value={formData.class} onChange={e => setFormData({...formData, class: e.target.value, section: ''})} required>
                    <option value="">Select Class</option>
                    {schoolOptions.classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>Section <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: '0.78rem' }}>(optional)</span></label>
                  {(() => {
                    const availSections = formData.class
                      ? ((schoolOptions.sections || {})[formData.class] || [])
                      : [];
                    return (
                      <select
                        style={{
                          ...inputStyle,
                          background: !formData.class ? '#f9fafb' : 'white',
                          color: !formData.class ? '#9ca3af' : 'inherit',
                        }}
                        value={formData.section}
                        onChange={e => setFormData({...formData, section: e.target.value})}
                        disabled={!formData.class}
                      >
                        <option value="">
                          {!formData.class ? 'Select class first' : availSections.length === 0 ? 'No sections defined' : 'Select Section'}
                        </option>
                        {availSections.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    );
                  })()}

                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>Roll No. *</label>
                  <input style={inputStyle} value={formData.rollNo} onChange={e => setFormData({...formData, rollNo: e.target.value})} required placeholder="e.g. 101" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>Parent Contact *</label>
                  <input style={inputStyle} value={formData.parentContact} onChange={e => setFormData({...formData, parentContact: e.target.value})} required placeholder="+977-XXXXXXXXXX" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>Father's Name *</label>
                  <input style={inputStyle} value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} required placeholder="Father's full name" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>Mother's Name *</label>
                  <input style={inputStyle} value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} required placeholder="Mother's full name" />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>Address *</label>
                <input style={inputStyle} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required placeholder="Full address" />
              </div>

              {/* Link to User (only for editing existing) */}
              {editing && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>Link to User Account</label>
                  <select
                    style={inputStyle}
                    value={formData.linkedUserId || ''}
                    onChange={e => setFormData({...formData, linkedUserId: e.target.value || null})}
                  >
                    <option value="">Not linked</option>
                    {users.filter(u => !students.some(s => s.linkedUserId === u.id && s.id !== editing)).map(u => (
                      <option key={u.id} value={u.id}>{u.name} (@{u.username})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Auto-create user account (only for new student) */}
              {!editing && (
                <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '10px', border: '1px solid #bbf7d0', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <input
                      type="checkbox"
                      id="createUserStudent"
                      checked={createUser}
                      onChange={e => handleCreateUserToggle(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="createUserStudent" style={{ fontWeight: 700, fontSize: '0.9rem', color: '#166534', cursor: 'pointer' }}>
                      <FaUserPlus style={{ marginRight: '6px' }} />
                      Automatically create user account for this student
                    </label>
                  </div>

                  {createUser && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Username *</label>
                        <input
                          type="text"
                          value={userForm.username}
                          onChange={e => setUserForm({...userForm, username: e.target.value})}
                          required={createUser}
                          style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem' }}
                        />
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '4px 0 0' }}>Auto-generated, you can change it</p>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem', color: '#374151' }}>Password *</label>
                        <input
                          type="text"
                          value={userForm.password}
                          onChange={e => setUserForm({...userForm, password: e.target.value})}
                          required={createUser}
                          style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem' }}
                        />
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '4px 0 0' }}>Auto-generated, you can change it</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '14px', borderTop: '1px solid #f3f4f6' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '10px 24px', background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', opacity: saving ? 0.7 : 1 }}>
                  <FaSave /> {saving ? 'Saving...' : (editing ? 'Update Student' : 'Add Student')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManager;