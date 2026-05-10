import React, { useState } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { defaultNotices } from '../data/defaultData';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaThumbtack } from 'react-icons/fa';

const NoticeManager = () => {
  const [notices, setNotices] = useFirestore('admin_notices', defaultNotices);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Academic', date: '', pinned: false, pdfUrl: null });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing && editing !== 'new') {
      setNotices(notices.map(n => n.id === editing ? { ...formData, id: editing } : n));
    } else {
      setNotices([...notices, { ...formData, id: Date.now() }]);
    }
    setEditing(null);
    setFormData({ title: '', description: '', category: 'Academic', date: '', pinned: false, pdfUrl: null });
  };

  const handleEdit = (notice) => {
    setEditing(notice.id);
    setFormData(notice);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this notice?')) {
      setNotices(notices.filter(n => n.id !== id));
    }
  };

  const categories = ['Academic', 'Admin', 'Exam', 'Holiday', 'Sports'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--color-secondary)' }}>Notice Board Manager</h2>
        <button onClick={() => { setEditing('new'); setFormData({ title: '', description: '', category: 'Academic', date: '', pinned: false, pdfUrl: null }); }}
          style={{ padding: '10px 20px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <FaPlus /> Add Notice
        </button>
      </div>

      {editing && (
        <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '28px', marginBottom: '24px', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--color-secondary)' }}>{editing === 'new' ? 'Add Notice' : 'Edit Notice'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" required
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={formData.pinned} onChange={e => setFormData({...formData, pinned: e.target.checked})} id="pinned" />
              <label htmlFor="pinned" style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaThumbtack size={12} /> Pin to top
              </label>
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
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Title</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Pinned</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notices.sort((a, b) => b.pinned - a.pinned || new Date(b.date) - new Date(a.date)).map((notice, idx) => (
              <tr key={notice.id} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{notice.date}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 10px', background: notice.category === 'Academic' ? '#dbeafe' : notice.category === 'Exam' ? '#fee2e2' : notice.category === 'Holiday' ? '#d1fae5' : '#fef3c7', color: notice.category === 'Academic' ? '#1e40af' : notice.category === 'Exam' ? '#991b1b' : notice.category === 'Holiday' ? '#065f46' : '#92400e', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {notice.category}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{notice.title}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  {notice.pinned ? <FaThumbtack style={{ color: 'var(--color-accent)' }} /> : '-'}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <button onClick={() => handleEdit(notice)} style={{ padding: '6px 10px', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginRight: '6px' }}><FaEdit size={12} /></button>
                  <button onClick={() => handleDelete(notice.id)} style={{ padding: '6px 10px', background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}><FaTrash size={12} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NoticeManager;