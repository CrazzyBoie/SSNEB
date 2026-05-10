import React, { useState } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { defaultGallery } from '../data/defaultData';
import { FaPlus, FaTrash, FaCheckSquare, FaSquare } from 'react-icons/fa';
import { compressImage } from '../hooks/useImageCompress';

const GalleryManager = () => {
  const [gallery, setGallery] = useFirestore('admin_gallery', defaultGallery);
  const [selected, setSelected] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const compressed = await compressImage(file, 800, 0.75);
        setNewImages(prev => [...prev, { url: compressed, category: 'Events', caption: file.name.replace(/\.[^/.]+$/, '') }]);
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewImages(prev => [...prev, { url: reader.result, category: 'Events', caption: file.name }]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSaveNew = () => {
    const newItems = newImages.map((img, idx) => ({
      id: Date.now() + idx,
      ...img
    }));
    setGallery([...gallery, ...newItems]);
    setNewImages([]);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this image?')) {
      setGallery(gallery.filter(g => g.id !== id));
      setSelected(selected.filter(s => s !== id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selected.length} images?`)) {
      setGallery(gallery.filter(g => !selected.includes(g.id)));
      setSelected([]);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const categories = ['Classrooms', 'Events', 'Sports', 'Cultural', 'Hostel'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--color-secondary)' }}>Gallery Manager</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {selected.length > 0 && (
            <button onClick={handleBulkDelete}
              style={{ padding: '10px 20px', background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
              <FaTrash /> Delete ({selected.length})
            </button>
          )}
          <label style={{ padding: '10px 20px', background: 'var(--color-primary)', color: 'white', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
            <FaPlus /> Upload Images
            <input type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* New Images Preview */}
      {newImages.length > 0 && (
        <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '24px', marginBottom: '24px', boxShadow: 'var(--shadow-card)' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--color-secondary)' }}>New Images Preview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {newImages.map((img, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <img src={img.url} alt="" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                <select value={img.category} onChange={e => {
                  const updated = [...newImages];
                  updated[idx].category = e.target.value;
                  setNewImages(updated);
                }} style={{ width: '100%', marginTop: '8px', padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid #e5e7eb' }}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="text" value={img.caption} onChange={e => {
                  const updated = [...newImages];
                  updated[idx].caption = e.target.value;
                  setNewImages(updated);
                }} placeholder="Caption" style={{ width: '100%', marginTop: '6px', padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid #e5e7eb', fontSize: '0.85rem' }} />
              </div>
            ))}
          </div>
          <button onClick={handleSaveNew} style={{ marginTop: '16px', padding: '12px 24px', background: 'var(--color-success)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}>
            Save All Images
          </button>
        </div>
      )}

      {/* Gallery Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {gallery.map(item => (
          <div key={item.id} style={{ position: 'relative', background: 'white', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2 }}>
              <button onClick={() => toggleSelect(item.id)} style={{ background: 'white', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                {selected.includes(item.id) ? <FaCheckSquare style={{ color: 'var(--color-success)' }} /> : <FaSquare style={{ color: 'var(--color-muted)' }} />}
              </button>
            </div>
            <img src={item.url} alt={item.caption} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            <div style={{ padding: '12px' }}>
              <p style={{ fontSize: '0.85rem', margin: '0 0 6px', fontWeight: 600, color: 'var(--color-secondary)' }}>{item.caption}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ padding: '2px 8px', background: 'var(--color-light)', color: 'var(--color-secondary)', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600 }}>{item.category}</span>
                <button onClick={() => handleDelete(item.id)} style={{ padding: '4px 8px', background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.75rem' }}>
                  <FaTrash size={10} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="grid-template-columns: repeat(3"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
};

export default GalleryManager;