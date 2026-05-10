import React, { useState } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { defaultHeroSlides } from '../data/defaultData';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImage } from 'react-icons/fa';

const HeroSliderManager = () => {
  const [slides, setSlides] = useFirestore('admin_hero_slides', defaultHeroSlides);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    image: '', title: '', subtitle: '', cta1: '', cta1Link: '', cta2: '', cta2Link: ''
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
    if (editing && editing !== 'new') {
      setSlides(slides.map(s => s.id === editing ? { ...formData, id: editing } : s));
    } else {
      setSlides([...slides, { ...formData, id: Date.now() }]);
    }
    setEditing(null);
    setFormData({ image: '', title: '', subtitle: '', cta1: '', cta1Link: '', cta2: '', cta2Link: '' });
  };

  const handleEdit = (slide) => {
    setEditing(slide.id);
    setFormData(slide);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this slide?')) {
      setSlides(slides.filter(s => s.id !== id));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--color-secondary)' }}>Hero Slider Manager</h2>
        <button
          onClick={() => { setEditing('new'); setFormData({ image: '', title: '', subtitle: '', cta1: '', cta1Link: '', cta2: '', cta2Link: '' }); }}
          style={{
            padding: '10px 20px',
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          <FaPlus /> Add Slide
        </button>
      </div>

      {editing && (
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-md)',
          padding: '28px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-card)'
        }}>
          <h3 style={{ marginBottom: '20px', color: 'var(--color-secondary)' }}>
            {editing === 'new' ? 'Add New Slide' : 'Edit Slide'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Slide Image</label>
              <div style={{
                border: '2px dashed #e5e7eb',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer'
              }}>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="slide-image" />
                <label htmlFor="slide-image" style={{ cursor: 'pointer' }}>
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" style={{ maxHeight: '150px', borderRadius: 'var(--radius-sm)' }} />
                  ) : (
                    <><FaImage size={32} style={{ color: 'var(--color-muted)', marginBottom: '10px' }} /><p>Click to upload image</p></>
                  )}
                </label>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Subtitle</label>
              <input type="text" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>CTA Button 1</label>
              <input type="text" value={formData.cta1} onChange={e => setFormData({...formData, cta1: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>CTA 1 Link</label>
              <input type="text" value={formData.cta1Link} onChange={e => setFormData({...formData, cta1Link: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>CTA Button 2</label>
              <input type="text" value={formData.cta2} onChange={e => setFormData({...formData, cta2: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>CTA 2 Link</label>
              <input type="text" value={formData.cta2Link} onChange={e => setFormData({...formData, cta2Link: e.target.value})}
                style={{ width: '100%', padding: '10px', border: '2px solid #e5e7eb', borderRadius: 'var(--radius-sm)' }} />
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

      <div style={{ display: 'grid', gap: '16px' }}>
        {slides.map((slide, index) => (
          <div key={slide.id} style={{
            background: 'white',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            gap: '20px',
            alignItems: 'center'
          }}>
            <img src={slide.image} alt={slide.title} style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px', color: 'var(--color-secondary)' }}>{slide.title}</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-muted)' }}>{slide.subtitle}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => handleEdit(slide)} style={{ padding: '8px 12px', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                <FaEdit />
              </button>
              <button onClick={() => handleDelete(slide.id)} style={{ padding: '8px 12px', background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroSliderManager;