import React, { useState } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { defaultNews, defaultEvents } from '../data/defaultData';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImage } from 'react-icons/fa';

const NewsManager = () => {
  const [news, setNews] = useFirestore('admin_news', defaultNews);
  const [events, setEvents] = useFirestore('admin_events', defaultEvents);
  const [activeTab, setActiveTab] = useState('news');
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: '', date: '', excerpt: '', content: '', image: '', category: 'News', location: '', time: '', description: ''
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = activeTab === 'news' ? news : events;
    const setter = activeTab === 'news' ? setNews : setEvents;

    if (editing && editing !== 'new') {
      setter(data.map(item => item.id === editing ? { ...formData, id: editing } : item));
    } else {
      setter([...data, { ...formData, id: Date.now() }]);
    }
    setEditing(null);
    setFormData({ title: '', date: '', excerpt: '', content: '', image: '', category: 'News', location: '', time: '', description: '' });
  };

  const handleEdit = (item) => {
    setEditing(item.id);
    setFormData(item);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this item?')) {
      const data = activeTab === 'news' ? news : events;
      const setter = activeTab === 'news' ? setNews : setEvents;
      setter(data.filter(item => item.id !== id));
    }
  };

  const currentData = activeTab === 'news' ? news : events;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--color-secondary)' }}>News & Events Manager</h2>
        <button onClick={() => { setEditing('new'); setFormData({ title: '', date: '', excerpt: '', content: '', image: '', category: 'News', location: '', time: '', description: '' }); }}
          style={{ padding: '10px 20px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <FaPlus /> Add {activeTab === 'news' ? 'News' : 'Event'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => { setActiveTab('news'); setEditing(null); }}
          style={{ padding: '10px 24px', borderRadius: 'var(--radius-md)', border: '2px solid', borderColor: activeTab === 'news' ? 'var(--color-primary)' : '#e5e7eb', background: activeTab === 'news' ? 'var(--color-primary)' : 'white', color: activeTab === 'news' ? 'white' : 'var(--color-dark)', fontWeight: 600, cursor: 'pointer' }}>
          News
        </button>
        <button onClick={() => { setActiveTab('events'); setEditing(null); }}
          style={{ padding: '10px 24px', borderRadius: 'var(--radius-md)', border: '2px solid', borderColor: activeTab === 'events' ? 'var(--color-primary)' : '#e5e7eb', background: activeTab === 'events' ? 'var(--color-primary)' : 'white', color: activeTab === 'events' ? 'white' : 'var(--color-dark)', fontWeight: 600, cursor: 'pointer' }}>
          Events
        </button>
      </div>

      {editing && (
        <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '28px', marginBottom: '24px', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--color-secondary)' }}>{editing === 'new' ? `Add ${activeTab === 'news' ? 'News' : 'Event'}` : 'Edit'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
            </div>
            {activeTab === 'news' ? (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }}>
                    {['Achievement', 'Infrastructure', 'Event', 'General'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Excerpt</label>
                  <input type="text" value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})}
                    style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Full Content</label>
                  <textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} rows="4"
                    style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)', resize: 'vertical' }} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Time</label>
                  <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}
                    style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Location</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                    style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3"
                    style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)', resize: 'vertical' }} />
                </div>
              </>
            )}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Image</label>
              <div style={{ border: '2px dashed #e5e7eb', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="news-image" />
                <label htmlFor="news-image" style={{ cursor: 'pointer' }}>
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" style={{ maxHeight: '120px', borderRadius: 'var(--radius-sm)' }} />
                  ) : (
                    <><FaImage size={28} style={{ color: 'var(--color-muted)', marginBottom: '8px' }} /><p>Click to upload</p></>
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
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Image</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Title</th>
              <th style={{ padding: '14px 16px', textAlign: 'left' }}>Date</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                <td style={{ padding: '12px 16px' }}>
                  <img src={item.image} alt="" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{item.title}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.9rem' }}>{item.date}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <button onClick={() => handleEdit(item)} style={{ padding: '6px 10px', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginRight: '6px' }}><FaEdit size={12} /></button>
                  <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 10px', background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}><FaTrash size={12} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewsManager;