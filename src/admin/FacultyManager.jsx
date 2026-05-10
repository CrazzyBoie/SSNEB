import React, { useState } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { compressImage } from '../hooks/useImageCompress';
import { defaultFaculty } from '../data/defaultData';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUser } from 'react-icons/fa';

const FacultyManager = () => {
  const [faculty, setFaculty] = useFirestore('admin_faculty', defaultFaculty);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '', subject: '', qualification: '', experience: '', department: 'Primary', photo: null, isLeadership: false
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing && editing !== 'new') {
      setFaculty(faculty.map(f => f.id === editing ? { ...formData, id: editing } : f));
    } else {
      setFaculty([...faculty, { ...formData, id: Date.now() }]);
    }
    setEditing(null);
    setFormData({ name: '', subject: '', qualification: '', experience: '', department: 'Primary', photo: null, isLeadership: false });
  };

  const handleEdit = (member) => {
    setEditing(member.id);
    setFormData(member);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this faculty member?')) {
      setFaculty(faculty.filter(f => f.id !== id));
    }
  };

  const departments = ['Admin', 'Primary', 'Secondary', '+2'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--color-secondary)' }}>Faculty & Staff Manager</h2>
        <button onClick={() => { setEditing('new'); setFormData({ name: '', subject: '', qualification: '', experience: '', department: 'Primary', photo: null, isLeadership: false }); }}
          style={{ padding: '10px 20px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <FaPlus /> Add Faculty
        </button>
      </div>

      {editing && (
        <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '28px', marginBottom: '24px', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--color-secondary)' }}>{editing === 'new' ? 'Add Faculty' : 'Edit Faculty'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Full Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Subject / Position</label>
              <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Qualification</label>
              <input type="text" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Experience (years)</label>
              <input type="number" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Department</label>
              <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }}>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={formData.isLeadership} onChange={e => setFormData({...formData, isLeadership: e.target.checked})} id="leadership" />
              <label htmlFor="leadership" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Leadership Team</label>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Photo</label>
              <div style={{ border: '2px dashed #e5e7eb', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} id="faculty-photo" />
                <label htmlFor="faculty-photo" style={{ cursor: 'pointer' }}>
                  {formData.photo ? (
                    <img src={formData.photo} alt="Preview" style={{ maxHeight: '120px', borderRadius: 'var(--radius-sm)' }} />
                  ) : (
                    <><FaUser size={28} style={{ color: 'var(--color-muted)', marginBottom: '8px' }} /><p>Click to upload photo</p></>
                  )}
                </label>
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px' }}>
              <button type="submit" style={{ padding: '12px 24px', background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <FaSave /> Save
              </button>
              <button type="button" onClick={() => setEditing(null)} style={{ padding: '12px 24px', background: '#e5e7eb', color: 'var(--color-dark)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--color-secondary)', color: 'white' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Subject</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Department</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Leadership</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {faculty.map((member, idx) => (
              <tr key={member.id} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: 600 }}>{member.name}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{member.subject}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>
                  <span style={{ padding: '2px 10px', background: 'var(--color-light)', color: 'var(--color-secondary)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {member.department}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {member.isLeadership ? <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>★</span> : '-'}
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
    </div>
  );
};

export default FacultyManager;