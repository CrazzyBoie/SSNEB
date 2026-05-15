import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore';
import {
  FaUserPlus, FaEdit, FaTrash, FaUserShield, FaChalkboardTeacher,
  FaUserGraduate, FaSave, FaTimes, FaSearch, FaKey, FaEye, FaEyeSlash
} from 'react-icons/fa';

const ROLE_META = {
  admin:   { icon: <FaUserShield />,        color: '#D72638', bg: '#fef2f2', label: 'Admin' },
  teacher: { icon: <FaChalkboardTeacher />, color: '#1A3A6B', bg: '#eff6ff', label: 'Teacher' },
  student: { icon: <FaUserGraduate />,      color: '#10B981', bg: '#f0fdf4', label: 'Student' },
};

const inputStyle = {
  width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb',
  borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit',
  boxSizing: 'border-box', outline: 'none',
};

const emptyForm = {
  name: '', username: '', password: '', role: 'teacher',
  email: '', phone: '', class: '', section: '', rollNo: '', subject: '',
  active: true,
};

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'ssnebs_user'));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toast = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3500);
  };

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setShowPw(false);
  };

  const openEdit = (user) => {
    setForm({ ...emptyForm, ...user, password: '' });
    setEditingId(user.id);
    setShowForm(true);
    setShowPw(false);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.username.trim()) return toast('Name and username are required.', 'error');
    if (!editingId && !form.password.trim()) return toast('Password is required for new users.', 'error');
    if (form.password && form.password.length < 6) return toast('Password must be at least 6 characters.', 'error');

    // Check username uniqueness
    const existing = users.find(u => u.username === form.username.trim().toLowerCase() && u.id !== editingId);
    if (existing) return toast('Username already taken.', 'error');

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        role: form.role,
        email: form.email.trim(),
        phone: form.phone.trim(),
        active: form.active,
        updatedAt: serverTimestamp(),
      };
      if (form.password.trim()) payload.password = form.password;

      // Role-specific fields
      if (form.role === 'student') {
        payload.class   = form.class.trim();
        payload.section = form.section.trim();
        payload.rollNo  = form.rollNo.trim();
      }
      if (form.role === 'teacher') {
        payload.subject = form.subject.trim();
      }

      if (editingId) {
        await updateDoc(doc(db, 'ssnebs_user', editingId), payload);
        toast('User updated successfully!');
      } else {
        payload.createdAt = serverTimestamp();
        const newRef = doc(collection(db, 'ssnebs_user'));
        await setDoc(newRef, payload);
        toast('User created successfully!');
      }
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      toast('Error saving user: ' + err.message, 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    await deleteDoc(doc(db, 'ssnebs_user', user.id));
    toast('User deleted.');
    fetchUsers();
  };

  const toggleActive = async (user) => {
    await updateDoc(doc(db, 'ssnebs_user', user.id), { active: !user.active });
    fetchUsers();
  };

  const filtered = users.filter(u => {
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h2 style={{ fontSize:'1.8rem', color:'var(--color-secondary)', margin:0 }}>User Management</h2>
          <p style={{ color:'#6b7280', fontSize:'0.875rem', margin:'4px 0 0' }}>Manage admin, teacher, and student accounts</p>
        </div>
        <button onClick={openNew} style={{ padding:'10px 20px', background:'var(--color-primary)', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:700, display:'flex', alignItems:'center', gap:'8px', fontSize:'0.9rem' }}>
          <FaUserPlus /> Add User
        </button>
      </div>

      {/* Toast */}
      {msg && (
        <div style={{ padding:'12px 18px', borderRadius:'8px', marginBottom:'16px', fontWeight:600, fontSize:'0.875rem',
          background: msg.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: msg.type === 'error' ? '#dc2626' : '#166534',
          border: `1px solid ${msg.type === 'error' ? '#fecaca' : '#bbf7d0'}` }}>
          {msg.type === 'error' ? '⚠️' : '✅'} {msg.text}
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:'200px' }}>
          <FaSearch style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'#9ca3af' }} />
          <input placeholder="Search by name or username…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft:'36px' }} />
        </div>
        {['all','admin','teacher','student'].map(r => (
          <button key={r} onClick={() => setFilterRole(r)}
            style={{ padding:'8px 16px', border:'2px solid', borderColor: filterRole === r ? 'var(--color-secondary)' : '#e5e7eb',
              background: filterRole === r ? 'var(--color-secondary)' : 'white', color: filterRole === r ? 'white' : '#374151',
              borderRadius:'8px', cursor:'pointer', fontWeight:600, fontSize:'0.85rem', textTransform:'capitalize' }}>
            {r === 'all' ? `All (${users.length})` : `${r.charAt(0).toUpperCase()+r.slice(1)}s (${users.filter(u=>u.role===r).length})`}
          </button>
        ))}
      </div>

      {/* User Cards */}
      {loading ? (
        <p style={{ color:'#6b7280', textAlign:'center', padding:'40px' }}>Loading users...</p>
      ) : filtered.length === 0 ? (
        <div style={{ background:'white', borderRadius:'12px', padding:'48px', textAlign:'center', boxShadow:'0 1px 6px rgba(0,0,0,0.08)' }}>
          <p style={{ color:'#6b7280', margin:0 }}>No users found. <button onClick={openNew} style={{ background:'none', border:'none', color:'var(--color-primary)', cursor:'pointer', fontWeight:700 }}>Add one?</button></p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'16px' }}>
          {filtered.map(user => {
            const meta = ROLE_META[user.role] || ROLE_META.student;
            return (
              <div key={user.id} style={{ background:'white', borderRadius:'12px', padding:'20px', boxShadow:'0 1px 6px rgba(0,0,0,0.08)', borderLeft:`4px solid ${meta.color}`, opacity: user.active === false ? 0.65 : 1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                    <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:meta.bg, display:'flex', alignItems:'center', justifyContent:'center', color:meta.color, fontSize:'1.1rem', flexShrink:0 }}>
                      {meta.icon}
                    </div>
                    <div>
                      <h4 style={{ margin:0, color:'#1e293b', fontSize:'0.975rem', fontWeight:700 }}>{user.name}</h4>
                      <p style={{ margin:0, color:'#6b7280', fontSize:'0.8rem' }}>@{user.username}</p>
                    </div>
                  </div>
                  <span style={{ padding:'3px 10px', borderRadius:'999px', background:meta.bg, color:meta.color, fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>
                    {meta.label}
                  </span>
                </div>

                {/* Extra info */}
                <div style={{ marginTop:'12px', fontSize:'0.8rem', color:'#6b7280', display:'flex', flexDirection:'column', gap:'3px' }}>
                  {user.email && <span>📧 {user.email}</span>}
                  {user.phone && <span>📞 {user.phone}</span>}
                  {user.role === 'student' && user.class && <span>📚 Class {user.class}{user.section ? ` – ${user.section}` : ''}{user.rollNo ? ` | Roll: ${user.rollNo}` : ''}</span>}
                  {user.role === 'teacher' && user.subject && <span>📖 Subject: {user.subject}</span>}
                  <span style={{ color: user.active === false ? '#ef4444' : '#10B981', fontWeight:600 }}>
                    {user.active === false ? '● Inactive' : '● Active'}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:'8px', marginTop:'14px', borderTop:'1px solid #f3f4f6', paddingTop:'12px' }}>
                  <button onClick={() => openEdit(user)} style={{ flex:1, padding:'7px', background:'#f3f4f6', border:'none', borderRadius:'6px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', fontSize:'0.8rem', fontWeight:600, color:'#374151' }}>
                    <FaEdit /> Edit
                  </button>
                  <button onClick={() => toggleActive(user)} style={{ flex:1, padding:'7px', background: user.active === false ? '#f0fdf4' : '#fff7ed', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.8rem', fontWeight:600, color: user.active === false ? '#166534' : '#c2410c' }}>
                    {user.active === false ? 'Activate' : 'Deactivate'}
                  </button>
                  <button onClick={() => handleDelete(user)} style={{ padding:'7px 10px', background:'#fef2f2', border:'none', borderRadius:'6px', cursor:'pointer', color:'#dc2626' }}>
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:'16px' }}>
          <div style={{ background:'white', borderRadius:'16px', width:'100%', maxWidth:'520px', maxHeight:'90vh', overflow:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding:'24px 28px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'white', zIndex:1 }}>
              <h3 style={{ margin:0, color:'var(--color-secondary)', fontSize:'1.2rem' }}>
                {editingId ? 'Edit User' : 'Add New User'}
              </h3>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', fontSize:'1.2rem' }}><FaTimes /></button>
            </div>

            <div style={{ padding:'24px 28px', display:'flex', flexDirection:'column', gap:'14px' }}>
              {/* Role */}
              <div>
                <label style={{ display:'block', marginBottom:'6px', fontWeight:600, fontSize:'0.85rem', color:'#374151' }}>Role *</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
                  {Object.entries(ROLE_META).map(([r, m]) => (
                    <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))}
                      style={{ padding:'8px', border:`2px solid ${form.role === r ? m.color : '#e5e7eb'}`, borderRadius:'8px', background: form.role === r ? m.bg : 'white', cursor:'pointer', color: form.role === r ? m.color : '#6b7280', fontWeight:700, fontSize:'0.8rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div>
                  <label style={{ display:'block', marginBottom:'5px', fontWeight:600, fontSize:'0.85rem', color:'#374151' }}>Full Name *</label>
                  <input style={inputStyle} value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Ram Prasad Sharma" />
                </div>
                <div>
                  <label style={{ display:'block', marginBottom:'5px', fontWeight:600, fontSize:'0.85rem', color:'#374151' }}>Username *</label>
                  <input style={inputStyle} value={form.username} onChange={e => setForm(f=>({...f,username:e.target.value}))} placeholder="e.g. ram.sharma" />
                </div>
              </div>

              <div>
                <label style={{ display:'block', marginBottom:'5px', fontWeight:600, fontSize:'0.85rem', color:'#374151' }}>
                  <FaKey style={{ marginRight:'5px' }} />
                  {editingId ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <div style={{ position:'relative' }}>
                  <input type={showPw ? 'text':'password'} style={{ ...inputStyle, paddingRight:'40px' }} value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} placeholder={editingId ? 'Leave blank to keep current' : 'Min 6 characters'} />
                  <button type="button" onClick={() => setShowPw(s=>!s)} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}>
                    {showPw ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div>
                  <label style={{ display:'block', marginBottom:'5px', fontWeight:600, fontSize:'0.85rem', color:'#374151' }}>Email</label>
                  <input type="email" style={inputStyle} value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="email@example.com" />
                </div>
                <div>
                  <label style={{ display:'block', marginBottom:'5px', fontWeight:600, fontSize:'0.85rem', color:'#374151' }}>Phone</label>
                  <input style={inputStyle} value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} placeholder="+977-XXXXXXXXXX" />
                </div>
              </div>

              {/* Student-specific */}
              {form.role === 'student' && (
                <div style={{ background:'#f0fdf4', padding:'14px', borderRadius:'10px', border:'1px solid #bbf7d0' }}>
                  <p style={{ fontWeight:700, fontSize:'0.82rem', color:'#166534', margin:'0 0 10px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Student Details</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
                    <div>
                      <label style={{ display:'block', marginBottom:'5px', fontWeight:600, fontSize:'0.82rem', color:'#374151' }}>Class</label>
                      <input style={inputStyle} value={form.class} onChange={e => setForm(f=>({...f,class:e.target.value}))} placeholder="e.g. 10" />
                    </div>
                    <div>
                      <label style={{ display:'block', marginBottom:'5px', fontWeight:600, fontSize:'0.82rem', color:'#374151' }}>Section</label>
                      <input style={inputStyle} value={form.section} onChange={e => setForm(f=>({...f,section:e.target.value}))} placeholder="e.g. A" />
                    </div>
                    <div>
                      <label style={{ display:'block', marginBottom:'5px', fontWeight:600, fontSize:'0.82rem', color:'#374151' }}>Roll No.</label>
                      <input style={inputStyle} value={form.rollNo} onChange={e => setForm(f=>({...f,rollNo:e.target.value}))} placeholder="e.g. 15" />
                    </div>
                  </div>
                </div>
              )}

              {/* Teacher-specific */}
              {form.role === 'teacher' && (
                <div style={{ background:'#eff6ff', padding:'14px', borderRadius:'10px', border:'1px solid #bfdbfe' }}>
                  <p style={{ fontWeight:700, fontSize:'0.82rem', color:'#1e40af', margin:'0 0 10px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Teacher Details</p>
                  <div>
                    <label style={{ display:'block', marginBottom:'5px', fontWeight:600, fontSize:'0.82rem', color:'#374151' }}>Subject / Specialization</label>
                    <input style={inputStyle} value={form.subject} onChange={e => setForm(f=>({...f,subject:e.target.value}))} placeholder="e.g. Mathematics, Science" />
                  </div>
                </div>
              )}

              {/* Active toggle */}
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <input type="checkbox" id="activeToggle" checked={form.active !== false} onChange={e => setForm(f=>({...f,active:e.target.checked}))} style={{ width:'16px', height:'16px', cursor:'pointer' }} />
                <label htmlFor="activeToggle" style={{ fontWeight:600, fontSize:'0.875rem', color:'#374151', cursor:'pointer' }}>Account is active</label>
              </div>
            </div>

            <div style={{ padding:'16px 28px', borderTop:'1px solid #f3f4f6', display:'flex', gap:'10px', justifyContent:'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding:'10px 20px', background:'#f3f4f6', color:'#374151', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:600 }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ padding:'10px 24px', background:'var(--color-success)', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:700, display:'flex', alignItems:'center', gap:'8px' }}>
                <FaSave /> {saving ? 'Saving...' : (editingId ? 'Update User' : 'Create User')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}