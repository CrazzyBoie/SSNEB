import React, { useState } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { defaultAchievements } from '../data/defaultData';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const AchievementsManager = () => {
  const [achievements, setAchievements] = useFirestore('admin_achievements', defaultAchievements);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '', student: '', year: '', category: 'Academic', icon: '🏆'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing && editing !== 'new') {
      setAchievements(achievements.map(a => a.id === editing ? { ...formData, id: editing } : a));
    } else {
      setAchievements([...achievements, { ...formData, id: Date.now() }]);
    }
    setEditing(null);
    setFormData({ title: '', student: '', year: '', category: 'Academic', icon: '🏆' });
  };

  const handleEdit = (item) => {
    setEditing(item.id);
    setFormData(item);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this achievement?')) {
      setAchievements(achievements.filter(a => a.id !== id));
    }
  };

  const categories = ['Academic', 'Competition', 'Sports', 'Arts'];
  const icons = ['🏆', '🥇', '🏅', '🎤', '🎨', '🧠', '📚', '⚽', '🏀', '🎭'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--color-secondary)' }}>Achievements Manager</h2>
        <button onClick={() => { setEditing('new'); setFormData({ title: '', student: '', year: '', category: 'Academic', icon: '🏆' }); }}
          style={{ padding: '10px 20px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <FaPlus /> Add Achievement
        </button>
      </div>

      {editing && (
        <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '28px', marginBottom: '24px', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--color-secondary)' }}>{editing === 'new' ? 'Add Achievement' : 'Edit Achievement'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Student Name</label>
              <input type="text" value={formData.student} onChange={e => setFormData({...formData, student: e.target.value})} required
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Year (B.S.)</label>
              <input type="text" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} required
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Icon</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {icons.map(icon => (
                  <button key={icon} type="button" onClick={() => setFormData({...formData, icon})}
                    style={{
                      width: '44px', height: '44px', fontSize: '1.5rem', border: formData.icon === icon ? '2px solid var(--color-primary)' : '2px solid #e5e7eb',
                      borderRadius: 'var(--radius-sm)', background: formData.icon === icon ? 'var(--color-light)' : 'white', cursor: 'pointer'
                    }}>
                    {icon}
                  </button>
                ))}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {achievements.map(item => (
          <div key={item.id} style={{
            background: 'white',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start',
            borderLeft: '4px solid var(--color-accent)'
          }}>
            <div style={{ fontSize: '2.5rem' }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '1rem', marginBottom: '6px', color: 'var(--color-secondary)' }}>{item.title}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '4px' }}>{item.student}</p>
              <span style={{ display: 'inline-block', padding: '2px 10px', background: 'var(--color-light)', borderRadius: '20px', fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
                {item.year} B.S. | {item.category}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button onClick={() => handleEdit(item)} style={{ padding: '6px', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                <FaEdit size={12} />
              </button>
              <button onClick={() => handleDelete(item.id)} style={{ padding: '6px', background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                <FaTrash size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          div[style*="grid-template-columns: repeat(3"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default AchievementsManager;