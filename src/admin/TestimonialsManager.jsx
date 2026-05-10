import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { defaultTestimonials } from '../data/defaultData';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaStar, FaEye, FaEyeSlash } from 'react-icons/fa';

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useLocalStorage('admin_testimonials', defaultTestimonials);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '', role: 'Parent', grade: '', quote: '', rating: 5, photo: null, visible: true
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, photo: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing && editing !== 'new') {
      setTestimonials(testimonials.map(t => t.id === editing ? { ...formData, id: editing } : t));
    } else {
      setTestimonials([...testimonials, { ...formData, id: Date.now() }]);
    }
    setEditing(null);
    setFormData({ name: '', role: 'Parent', grade: '', quote: '', rating: 5, photo: null, visible: true });
  };

  const handleEdit = (item) => {
    setEditing(item.id);
    setFormData(item);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this testimonial?')) {
      setTestimonials(testimonials.filter(t => t.id !== id));
    }
  };

  const toggleVisible = (id) => {
    setTestimonials(testimonials.map(t => t.id === id ? { ...t, visible: !t.visible } : t));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--color-secondary)' }}>Testimonials Manager</h2>
        <button onClick={() => { setEditing('new'); setFormData({ name: '', role: 'Parent', grade: '', quote: '', rating: 5, photo: null, visible: true }); }}
          style={{ padding: '10px 20px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
          <FaPlus /> Add Testimonial
        </button>
      </div>

      {editing && (
        <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '28px', marginBottom: '24px', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--color-secondary)' }}>{editing === 'new' ? 'Add Testimonial' : 'Edit Testimonial'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Role</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }}>
                <option value="Parent">Parent</option>
                <option value="Student">Student</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Grade/Relation</label>
              <input type="text" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Rating (1-5)</label>
              <input type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})}
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Quote</label>
              <textarea value={formData.quote} onChange={e => setFormData({...formData, quote: e.target.value})} rows="3" required
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)', resize: 'vertical' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Photo</label>
              <div style={{ border: '2px dashed #e5e7eb', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} id="testimonial-photo" />
                <label htmlFor="testimonial-photo" style={{ cursor: 'pointer' }}>
                  {formData.photo ? (
                    <img src={formData.photo} alt="Preview" style={{ maxHeight: '120px', borderRadius: 'var(--radius-sm)' }} />
                  ) : (
                    <><p>Click to upload photo</p></>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {testimonials.map(item => (
          <div key={item.id} style={{
            background: 'white',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            boxShadow: 'var(--shadow-card)',
            opacity: item.visible ? 1 : 0.5,
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(item.rating)].map((_, i) => (
                  <FaStar key={i} size={14} style={{ color: 'var(--color-accent)' }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => toggleVisible(item.id)} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: item.visible ? 'var(--color-success)' : 'var(--color-muted)' }}>
                  {item.visible ? <FaEye size={14} /> : <FaEyeSlash size={14} />}
                </button>
                <button onClick={() => handleEdit(item)} style={{ padding: '4px', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  <FaEdit size={12} />
                </button>
                <button onClick={() => handleDelete(item.id)} style={{ padding: '4px', background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  <FaTrash size={12} />
                </button>
              </div>
            </div>
            <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--color-dark)', lineHeight: 1.6, marginBottom: '12px' }}>"{item.quote}"</p>
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--color-secondary)', margin: 0 }}>{item.name}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', margin: 0 }}>{item.grade || item.role}</p>
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

export default TestimonialsManager;