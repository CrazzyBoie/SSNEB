import React, { useState, useEffect } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { compressImage } from '../hooks/useImageCompress';
import { defaultFaculty } from '../data/defaultData';
import {
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUser, FaLink, FaUnlink, FaUserPlus, FaSearch
} from 'react-icons/fa';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const defaultSchoolOptions = {
  subjects: {}, // per-class map, flattened for faculty dropdown
  positions: ['Principal', 'Vice Principal', 'Head Teacher', 'Coordinator', 'Librarian', 'Accountant'],
};

const FacultyManager = () => {
  const [faculty, setFaculty] = useFirestore('admin_faculty', defaultFaculty);
  const safeFaculty = Array.isArray(faculty) ? faculty : [];
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '', subjects: [], position: '', qualification: '', experience: '', departments: ['Primary'], sections: [], photo: null, isLeadership: false, linkedUserId: null
  });
  const [createUser, setCreateUser] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [schoolOptions, setSchoolOptions] = useState(defaultSchoolOptions);

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb',
    borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit',
    boxSizing: 'border-box', outline: 'none',
  };

  // Load school options (subjects & positions) from Firestore
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

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, 'ssnebs_user'));
      const userList = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role === 'teacher');
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

  // Toggle department selection
  const toggleDepartment = (dept) => {
    setFormData(prev => {
      const current = prev.departments || [];
      if (current.includes(dept)) {
        // Don't allow removing the last department
        if (current.length <= 1) return prev;
        return { ...prev, departments: current.filter(d => d !== dept) };
      }
      return { ...prev, departments: [...current, dept] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || (formData.subjects.length === 0 && !formData.position.trim())) return;
    if (!formData.departments || formData.departments.length === 0) {
      alert('Please select at least one department.');
      return;
    }

    setSaving(true);
    try {
      let linkedUserId = formData.linkedUserId;

      if (createUser && !editing) {
        const username = userForm.username.trim().toLowerCase();
        const password = userForm.password.trim();

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
          role: 'teacher',
          subjects: formData.subjects || [],
          departments: formData.departments || [],
          sections: formData.sections || [],
          subject: [...formData.subjects, ...(formData.position ? [formData.position] : [])].join(', '),
          email: '',
          phone: '',
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        linkedUserId = newUserRef.id;
      }

      // Update existing linked user if editing
      if (editing && linkedUserId) {
        try {
          const userRef = doc(db, 'ssnebs_user', linkedUserId);
          await setDoc(userRef, {
            subjects: formData.subjects || [],
            departments: formData.departments || [],
            sections: formData.sections || [],
            subject: [...formData.subjects, ...(formData.position ? [formData.position] : [])].join(', '),
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (err) {
          console.error('Error updating linked user:', err);
        }
      }

      const facultyData = { 
        ...formData, 
        linkedUserId: linkedUserId || null,
        // Keep backward compatibility with single department
        department: formData.departments && formData.departments.length > 0 ? formData.departments[0] : 'Primary'
      };

      if (editing && editing !== 'new') {
        setFaculty(safeFaculty.map(f => f.id === editing ? { ...facultyData, id: editing } : f));
      } else {
        setFaculty([...safeFaculty, { ...facultyData, id: Date.now() }]);
      }

      setEditing(null);
      setShowForm(false);
      setFormData({ name: '', subjects: [], position: '', qualification: '', experience: '', departments: ['Primary'], sections: [], photo: null, isLeadership: false, linkedUserId: null });
      setCreateUser(false);
      setUserForm({ username: '', password: '' });
    } catch (err) {
      console.error('Error saving faculty:', err);
      alert('Error: ' + err.message);
    }
    setSaving(false);
  };

  const handleEdit = (member) => {
    setEditing(member.id);
    setFormData({
      ...member,
      subjects: Array.isArray(member.subjects) ? member.subjects : 
                member.subject ? [member.subject] : [],
      position: member.position || '',
      // Migrate old single department to array
      departments: member.departments || (member.department ? [member.department] : ['Primary']),
      sections: member.sections || [],
    });
    setCreateUser(false);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this faculty member?')) {
      setFaculty(safeFaculty.filter(f => f.id !== id));
    }
  };

  const handleLinkUser = (facultyId, userId) => {
    setFaculty(safeFaculty.map(f => f.id === facultyId ? { ...f, linkedUserId: userId } : f));
  };

  const handleUnlinkUser = (facultyId) => {
    setFaculty(safeFaculty.map(f => f.id === facultyId ? { ...f, linkedUserId: null } : f));
  };

  const departments = ['Admin', 'Primary', 'Lower Secondary', 'Secondary', 'Higher Secondary'];


  // Flatten all per-class subjects into one deduplicated list for faculty dropdown
  const allSubjects = [...new Set(
    Object.values(schoolOptions.subjects || {}).reduce((acc, arr) => acc.concat(Array.isArray(arr) ? arr : []), [])
  )].sort();

  const filtered = safeFaculty.filter(f => {
    const matchSearch = !search ||
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      (f.subjects?.join(' ')?.toLowerCase().includes(search.toLowerCase()) ||
      f.position?.toLowerCase().includes(search.toLowerCase()));
    const matchDept = filterDept === 'all' || 
      (f.departments && f.departments.includes(filterDept)) || 
      f.department === filterDept;
    return matchSearch && matchDept && f.active !== false;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-secondary)', margin: 0 }}>Faculty & Staff Manager</h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '4px 0 0' }}>Manage faculty records and link to user accounts</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormData({ name: '', subjects: [], position: '', qualification: '', experience: '', departments: ['Primary'], sections: [], photo: null, isLeadership: false, linkedUserId: null });
            setCreateUser(false);
            setShowForm(true);
          }}
          style={{ padding: '10px 20px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}
        >
          <FaPlus /> Add Faculty
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input placeholder="Search faculty..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: '36px' }} />
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={inputStyle}>
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Faculty Table */}
      <div style={{ background: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-secondary)', color: 'white' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Subject / Position</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Departments</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Leadership</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Linked User</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((member, idx) => (
              <tr key={member.id} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: member.photo ? 'transparent' : 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '0.85rem', fontWeight: 700, overflow: 'hidden'
                    }}>
                      {member.photo
                        ? <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{member.name}</div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(member.subjects || []).map(s => (
                      <span key={s} style={{ padding: '2px 8px', background: '#eff6ff', color: '#1e40af', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600 }}>{s}</span>
                    ))}
                    {member.position && (
                      <span style={{ padding: '2px 8px', background: '#fef3c7', color: '#92400e', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600 }}>📌 {member.position}</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(member.departments || (member.department ? [member.department] : [])).map(d => (
                      <span key={d} style={{ padding: '2px 10px', background: 'var(--color-light)', color: 'var(--color-secondary)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {d}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {member.isLeadership ? <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>★</span> : '-'}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {member.linkedUserId ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <span style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 600 }}>✓ Linked</span>
                      <button onClick={() => handleUnlinkUser(member.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.75rem' }} title="Unlink">
                        <FaUnlink />
                      </button>
                    </div>
                  ) : (
                    <select
                      onChange={e => { if (e.target.value) handleLinkUser(member.id, e.target.value); }}
                      style={{ padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      <option value="">Link to user...</option>
                      {users.filter(u => !safeFaculty.some(f => f.linkedUserId === u.id)).map(u => (
                        <option key={u.id} value={u.id}>{u.name} (@{u.username})</option>
                      ))}
                    </select>
                  )}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <button onClick={() => handleEdit(member)} style={{ padding: '6px 10px', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginRight: '6px' }}><FaEdit size={12} /></button>
                  <button onClick={() => handleDelete(member.id)} style={{ padding: '6px 10px', background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}><FaTrash size={12} /></button>
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
                {editing ? 'Edit Faculty' : 'Add New Faculty'}
              </h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '1.2rem' }}><FaTimes /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
              {/* Photo Upload */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '100px', height: '100px', borderRadius: '50%',
                  border: '3px dashed var(--color-primary)', margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', cursor: 'pointer',
                  background: formData.photo ? 'transparent' : '#f9fafb'
                }}>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} id="faculty-photo" />
                  <label htmlFor="faculty-photo" style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {formData.photo ? (
                      <img src={formData.photo} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <FaUser size={28} style={{ color: 'var(--color-muted)' }} />
                    )}
                  </label>
                </div>
                <label htmlFor="faculty-photo" style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  {formData.photo ? 'Change Photo' : 'Upload Photo'}
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>Full Name *</label>
                  <input style={inputStyle} value={formData.name} onChange={e => handleNameChange(e.target.value)} required placeholder="e.g. Ram Prasad Sharma" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {/* Subjects — multi select with pills */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>
                        Subjects <span style={{ color: '#9ca3af', fontWeight: 400 }}>(select one or more)</span>
                      </label>
                      <select
                        style={inputStyle}
                        value=""
                        onChange={e => {
                          const val = e.target.value;
                          if (!val || formData.subjects.includes(val)) return;
                          setFormData({ ...formData, subjects: [...formData.subjects, val] });
                        }}
                      >
                        <option value="">+ Add Subject</option>
                        {allSubjects
                          .filter(s => !formData.subjects.includes(s))
                          .map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {/* Selected subjects as pills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                        {(formData.subjects || []).map((s, i) => (
                          <span key={i} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '4px 10px', background: '#eff6ff', color: '#1e40af',
                            borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, border: '1.5px solid #bfdbfe'
                          }}>
                            {s}
                            <button type="button" onClick={() => setFormData({ ...formData, subjects: formData.subjects.filter((_, idx) => idx !== i) })}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 0, fontSize: '0.75rem', lineHeight: 1 }}>✕</button>
                          </span>
                        ))}
                        {formData.subjects.length === 0 && <span style={{ color: '#9ca3af', fontSize: '0.78rem', fontStyle: 'italic' }}>No subjects selected</span>}
                      </div>
                      {/* Custom subject input */}
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                        <input
                          id="custom-subject-input"
                          style={{ ...inputStyle, flex: 1 }}
                          placeholder="Or type custom subject..."
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = e.target.value.trim();
                              if (val && !formData.subjects.includes(val)) {
                                setFormData({ ...formData, subjects: [...formData.subjects, val] });
                                e.target.value = '';
                              }
                            }
                          }}
                        />
                        <button type="button"
                          style={{ padding: '10px 12px', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                          onClick={() => {
                            const input = document.getElementById('custom-subject-input');
                            const val = input.value.trim();
                            if (val && !formData.subjects.includes(val)) {
                              setFormData({ ...formData, subjects: [...formData.subjects, val] });
                              input.value = '';
                            }
                          }}
                        >+ Add</button>
                      </div>
                    </div>

                    {/* Position — single select + optional custom */}
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>
                        Position <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional)</span>
                      </label>
                      <select
                        style={inputStyle}
                        value={(schoolOptions.positions || []).includes(formData.position) ? formData.position : (formData.position ? '__custom__' : '')}
                        onChange={e => {
                          if (e.target.value !== '__custom__') setFormData({ ...formData, position: e.target.value });
                        }}
                      >
                        <option value="">None / Not applicable</option>
                        {(schoolOptions.positions || []).map(p => <option key={p} value={p}>{p}</option>)}
                        <option value="__custom__">— Type custom —</option>
                      </select>
                      {(!(schoolOptions.positions || []).includes(formData.position) || formData.position === '') && (
                        <input
                          style={{ ...inputStyle, marginTop: '6px' }}
                          value={formData.position}
                          onChange={e => setFormData({ ...formData, position: e.target.value })}
                          placeholder="Custom position (optional)"
                        />
                      )}
                      {formData.position && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', alignItems: 'center' }}>
                          <span style={{ padding: '4px 10px', background: '#fef3c7', color: '#92400e', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, border: '1.5px solid #fde68a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            📌 {formData.position}
                            <button type="button" onClick={() => setFormData({ ...formData, position: '' })}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 0, fontSize: '0.75rem', lineHeight: 1 }}>✕</button>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {(formData.subjects.length === 0 && !formData.position) && (
                    <p style={{ fontSize: '0.78rem', color: '#dc2626', margin: '8px 0 0', fontWeight: 600 }}>
                      ⚠ Please select at least one subject or a position.
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>Qualification</label>
                  <input style={inputStyle} value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} placeholder="e.g. M.Ed, B.Ed" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>Experience (years)</label>
                  <input type="number" style={inputStyle} value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} placeholder="e.g. 10" />
                </div>
              </div>

              {/* Departments — multi-select checkboxes */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem' }}>
                  Departments * <span style={{ color: '#9ca3af', fontWeight: 400 }}>(select one or more)</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {departments.map(dept => {
                    const isSelected = formData.departments && formData.departments.includes(dept);
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => toggleDepartment(dept)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: '2px solid',
                          borderColor: isSelected ? 'var(--color-secondary)' : '#e5e7eb',
                          background: isSelected ? 'var(--color-secondary)' : 'white',
                          color: isSelected ? 'white' : '#374151',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {isSelected ? '✓' : '○'} {dept}
                      </button>
                    );
                  })}
                </div>
                {(!formData.departments || formData.departments.length === 0) && (
                  <p style={{ fontSize: '0.78rem', color: '#dc2626', margin: '8px 0 0', fontWeight: 600 }}>
                    ⚠ Please select at least one department.
                  </p>
                )}
              </div>

              {/* Sections Assignment */}
              <div style={{ marginBottom: '14px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>
                  Section Assignments <span style={{ color: '#9ca3af', fontWeight: 400 }}>(optional — restrict to specific sections)</span>
                </label>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 10px' }}>
                  Leave empty to access all sections in your departments. Select specific sections to restrict access.
                </p>

                {/* Available sections from school options */}
                {(() => {
                  const allSections = [];
                  const sectionsMap = schoolOptions.sections || {};
                  Object.entries(sectionsMap).forEach(([cls, secs]) => {
                    if (Array.isArray(secs)) {
                      secs.forEach(sec => {
                        const key = `${cls}-${sec}`;
                        if (!allSections.some(s => s.key === key)) {
                          allSections.push({ key, class: cls, section: sec, label: `Class ${cls} – ${sec}` });
                        }
                      });
                    }
                  });

                  if (allSections.length === 0) {
                    return <p style={{ fontSize: '0.78rem', color: '#9ca3af', fontStyle: 'italic' }}>No sections defined in school options yet.</p>;
                  }

                  return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '150px', overflowY: 'auto', padding: '4px' }}>
                      {allSections.map(({ key, label }) => {
                        const isSelected = formData.sections && formData.sections.includes(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setFormData(prev => {
                                const current = prev.sections || [];
                                if (current.includes(key)) {
                                  return { ...prev, sections: current.filter(s => s !== key) };
                                }
                                return { ...prev, sections: [...current, key] };
                              });
                            }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1.5px solid',
                              borderColor: isSelected ? '#1A3A6B' : '#e5e7eb',
                              background: isSelected ? '#1A3A6B' : 'white',
                              color: isSelected ? 'white' : '#374151',
                              fontWeight: isSelected ? 700 : 500,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {isSelected ? '✓' : '○'} {label}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Custom section input */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                  <input
                    id="custom-section-input"
                    style={{ ...inputStyle, flex: 1, padding: '8px 10px', fontSize: '0.82rem' }}
                    placeholder="Or add custom section (e.g. 10-A, 5-B)..."
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.target.value.trim();
                        if (val && !(formData.sections || []).includes(val)) {
                          setFormData(prev => ({ ...prev, sections: [...(prev.sections || []), val] }));
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <button type="button"
                    style={{ padding: '8px 12px', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                    onClick={() => {
                      const input = document.getElementById('custom-section-input');
                      const val = input.value.trim();
                      if (val && !(formData.sections || []).includes(val)) {
                        setFormData(prev => ({ ...prev, sections: [...(prev.sections || []), val] }));
                        input.value = '';
                      }
                    }}
                  >+ Add</button>
                </div>

                {/* Selected sections display */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {(formData.sections || []).map((s, i) => (
                    <span key={i} style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '3px 8px', background: '#eff6ff', color: '#1e40af',
                      borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, border: '1.5px solid #bfdbfe'
                    }}>
                      {s}
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, sections: (prev.sections || []).filter((_, idx) => idx !== i) }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: 0, fontSize: '0.7rem', lineHeight: 1 }}>✕</button>
                    </span>
                  ))}
                  {(formData.sections || []).length === 0 && (
                    <span style={{ color: '#9ca3af', fontSize: '0.78rem', fontStyle: 'italic' }}>No section restrictions — access to all sections in assigned departments</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '24px' }}>
                  <input
                    type="checkbox"
                    id="leadership"
                    checked={formData.isLeadership}
                    onChange={e => setFormData({...formData, isLeadership: e.target.checked})}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="leadership" style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Leadership Team</label>
                </div>
              </div>

              {/* Link to User (editing only) */}
              {editing && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '0.85rem' }}>Link to User Account</label>
                  <select
                    style={inputStyle}
                    value={formData.linkedUserId || ''}
                    onChange={e => setFormData({...formData, linkedUserId: e.target.value || null})}
                  >
                    <option value="">Not linked</option>
                    {users.filter(u => !safeFaculty.some(f => f.linkedUserId === u.id && f.id !== editing)).map(u => (
                      <option key={u.id} value={u.id}>{u.name} (@{u.username})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Auto-create user account (new faculty only) */}
              {!editing && (
                <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '10px', border: '1px solid #bbf7d0', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <input
                      type="checkbox"
                      id="createUserFaculty"
                      checked={createUser}
                      onChange={e => handleCreateUserToggle(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="createUserFaculty" style={{ fontWeight: 700, fontSize: '0.9rem', color: '#166534', cursor: 'pointer' }}>
                      <FaUserPlus style={{ marginRight: '6px' }} />
                      Automatically create user account for this faculty
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
                  <FaSave /> {saving ? 'Saving...' : (editing ? 'Update Faculty' : 'Add Faculty')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManager;