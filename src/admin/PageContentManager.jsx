import React, { useState, useEffect } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { defaultPageContent } from '../data/defaultData';
import {
  FaSave, FaUndo, FaInfoCircle, FaPhone, FaUserTie,
  FaGraduationCap, FaChevronDown, FaChevronUp, FaImage
} from 'react-icons/fa';

// ─── Reusable Components ───────────────────────────────────────────────────

const inputStyle = {
  width: '100%', padding: '10px 14px',
  border: '2px solid #e5e7eb', borderRadius: '8px',
  fontSize: '0.95rem', fontFamily: 'inherit',
  outline: 'none', transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const textareaStyle = { ...inputStyle, resize: 'vertical', minHeight: '100px' };

const labelStyle = {
  display: 'block', marginBottom: '6px',
  fontWeight: 600, fontSize: '0.875rem',
  color: '#374151',
};

const Field = ({ label, name, value, onChange, type = 'text', rows, hint }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={labelStyle}>{label}</label>
    {hint && <p style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '6px', marginTop: '-2px' }}>{hint}</p>}
    {rows ? (
      <textarea name={name} value={value} onChange={onChange} rows={rows} style={textareaStyle} />
    ) : (
      <input type={type} name={name} value={value} onChange={onChange} style={inputStyle} />
    )}
  </div>
);

const SectionCard = ({ title, icon, children, accent = 'var(--color-primary)' }) => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{
      background: 'white', borderRadius: '12px',
      boxShadow: '0 1px 8px rgba(0,0,0,0.08)', marginBottom: '24px',
      overflow: 'hidden', border: '1px solid #f0f0f0'
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 28px', cursor: 'pointer',
          borderLeft: `4px solid ${accent}`,
          background: open ? '#fafafa' : 'white',
          userSelect: 'none',
        }}
      >
        <h3 style={{ fontSize: '1.05rem', color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <span style={{ color: accent }}>{icon}</span> {title}
        </h3>
        {open ? <FaChevronUp color="#9ca3af" /> : <FaChevronDown color="#9ca3af" />}
      </div>
      {open && (
        <div style={{ padding: '24px 28px' }}>
          {children}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────

const PageContentManager = () => {
  const [content, setContent] = useFirestore('admin_page_content', defaultPageContent);
  const [formData, setFormData] = useState(defaultPageContent);
  const [saved, setSaved] = useState(false);
  const [principalImagePreview, setPrincipalImagePreview] = useState(null);

  useEffect(() => {
    if (content) {
      setFormData(content);
      if (content.principal?.image) setPrincipalImagePreview(content.principal.image);
    }
  }, [content]);

  // Generic nested handler: section.field
  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  // Top-level flat fields
  const handleFlat = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrincipalImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setPrincipalImagePreview(base64);
      handleChange('principal', 'image', base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setContent(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all page content to defaults?')) {
      setContent(defaultPageContent);
      setFormData(defaultPageContent);
      setPrincipalImagePreview(null);
    }
  };

  if (!formData) return <p>Loading...</p>;

  const p = (section) => (field) => ({
    value: formData[section]?.[field] ?? '',
    onChange: (e) => handleChange(section, field, e.target.value),
  });

  const principal  = p('principal');
  const about      = p('about');
  const contactPage = p('contactPage');
  const admissions = p('admissions');
  const academics  = p('academics');

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-secondary)', margin: 0 }}>Page Content Manager</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '4px' }}>
            Edit text content displayed across all pages of the website.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleReset} style={{
            padding: '10px 20px', background: '#f3f4f6', color: '#374151',
            border: 'none', borderRadius: '8px', display: 'flex',
            alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600,
          }}>
            <FaUndo /> Reset
          </button>
          <button onClick={handleSave} style={{
            padding: '10px 24px', background: 'var(--color-success)', color: 'white',
            border: 'none', borderRadius: '8px', display: 'flex',
            alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600,
          }}>
            <FaSave /> Save Changes
          </button>
        </div>
      </div>

      {saved && (
        <div style={{
          background: '#f0fdf4', color: '#166534', padding: '12px 20px',
          borderRadius: '8px', marginBottom: '20px', fontWeight: 600,
          border: '1px solid #bbf7d0',
        }}>
          ✅ Page content saved successfully!
        </div>
      )}

      {/* ── Principal's Message ─────────────────────────── */}
      <SectionCard title="Principal's Message" icon={<FaUserTie />} accent="#8B5CF6">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="content-grid">
          <div>
            <Field label="Principal's Full Name" name="name" {...principal('name')} />
            <Field label="Title / Designation" name="title" {...principal('title')} />
            <Field label="Qualifications" name="qualifications" {...principal('qualifications')} hint="e.g. M.Ed., B.Ed." />
            <Field label="Experience" name="experience" {...principal('experience')} hint="e.g. 20+ years in education" />
          </div>
          <div>
            {/* Principal Image */}
            <label style={labelStyle}>Principal's Photo</label>
            <div style={{
              border: '2px dashed #d1d5db', borderRadius: '10px',
              padding: '20px', textAlign: 'center', marginBottom: '16px'
            }}>
              <input type="file" accept="image/*" id="principal-img"
                style={{ display: 'none' }} onChange={handlePrincipalImageUpload} />
              <label htmlFor="principal-img" style={{ cursor: 'pointer', display: 'block' }}>
                {principalImagePreview ? (
                  <img src={principalImagePreview} alt="Principal"
                    style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto' }} />
                ) : (
                  <div style={{
                    width: '100px', height: '100px', borderRadius: '50%', background: '#e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'
                  }}>
                    <FaImage size={32} color="#9ca3af" />
                  </div>
                )}
                <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '10px' }}>
                  Click to upload photo
                </p>
              </label>
            </div>
          </div>
        </div>
        <Field label="Welcome Message / Quote" name="quote" {...principal('quote')} rows={4}
          hint="This appears on the homepage and About page as the principal's featured message." />
        <Field label="Extended Message" name="message" {...principal('message')} rows={6}
          hint="Full message shown on a dedicated section (optional)." />
      </SectionCard>

      {/* ── About Us ──────────────────────────────────────── */}
      <SectionCard title="About Us Page" icon={<FaInfoCircle />} accent="#3B82F6">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="content-grid">
          <div>
            <Field label="School Full Name" name="schoolName" {...about('schoolName')} />
            <Field label="Established Year" name="established" {...about('established')} hint="e.g. 2057 B.S. (2000 A.D.)" />
            <Field label="Location" name="location" {...about('location')} />
            <Field label="Student Count" name="studentCount" {...about('studentCount')} hint="e.g. 1200+" />
            <Field label="Faculty Count" name="facultyCount" {...about('facultyCount')} hint="e.g. 60+" />
            <Field label="Affiliation" name="affiliation" {...about('affiliation')} hint="e.g. National Examinations Board (NEB)" />
          </div>
          <div>
            <Field label="Our Story — Paragraph 1" name="story1" {...about('story1')} rows={5} />
            <Field label="Our Story — Paragraph 2" name="story2" {...about('story2')} rows={5} />
          </div>
        </div>

        <div style={{ marginTop: '8px', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
          <h4 style={{ color: 'var(--color-secondary)', marginBottom: '16px' }}>Mission & Vision</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="content-grid">
            <Field label="Mission Statement" name="mission" {...about('mission')} rows={4} />
            <Field label="Vision Statement" name="vision" {...about('vision')} rows={4} />
          </div>
        </div>

        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
          <h4 style={{ color: 'var(--color-secondary)', marginBottom: '16px' }}>Core Values (Descriptions)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="values-grid">
            {['excellence', 'integrity', 'inclusivity', 'innovation', 'discipline', 'community'].map(val => (
              <Field key={val}
                label={val.charAt(0).toUpperCase() + val.slice(1)}
                name={val}
                value={formData.about?.coreValues?.[val] ?? ''}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  about: {
                    ...prev.about,
                    coreValues: { ...prev.about?.coreValues, [val]: e.target.value }
                  }
                }))}
                rows={2}
              />
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
          <h4 style={{ color: 'var(--color-secondary)', marginBottom: '16px' }}>Why Choose Us (Features)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="content-grid">
            {[
              { key: 'feature1Title', label: 'Feature 1 — Title' },
              { key: 'feature1Desc', label: 'Feature 1 — Description' },
              { key: 'feature2Title', label: 'Feature 2 — Title' },
              { key: 'feature2Desc', label: 'Feature 2 — Description' },
              { key: 'feature3Title', label: 'Feature 3 — Title' },
              { key: 'feature3Desc', label: 'Feature 3 — Description' },
              { key: 'feature4Title', label: 'Feature 4 — Title' },
              { key: 'feature4Desc', label: 'Feature 4 — Description' },
            ].map(({ key, label }) => (
              <Field key={key} label={label} name={key} {...about(key)} />
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── Contact Us Page ───────────────────────────────── */}
      <SectionCard title="Contact Us Page" icon={<FaPhone />} accent="#10B981">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="content-grid">
          <Field label="Page Subtitle" name="subtitle" {...contactPage('subtitle')} hint='Shown below "Contact Us" heading' />
          <Field label="Google Maps Embed URL" name="mapEmbedUrl" {...contactPage('mapEmbedUrl')}
            hint="Paste the full Google Maps embed src URL here" />
        </div>
        <Field label="Additional Info / Note" name="additionalNote" {...contactPage('additionalNote')} rows={3}
          hint="Optional note shown on the contact page (e.g. best time to call, response time, etc.)" />
      </SectionCard>

      {/* ── Admissions Page ───────────────────────────────── */}
      <SectionCard title="Admissions Page" icon={<FaGraduationCap />} accent="#F59E0B">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="content-grid">
          <div>
            <Field label="Page Subtitle" name="subtitle" {...admissions('subtitle')} />
            <Field label="Admission Open Notice" name="openNotice" {...admissions('openNotice')}
              hint="e.g. Admissions open for Academic Year 2082" />
            <Field label="Eligibility Note" name="eligibility" {...admissions('eligibility')} rows={3} />
          </div>
          <div>
            <Field label="Required Documents (one per line)" name="documents" {...admissions('documents')} rows={7}
              hint="List documents separated by new lines" />
          </div>
        </div>
        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
          <h4 style={{ color: 'var(--color-secondary)', marginBottom: '16px' }}>Fee Structure</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="values-grid">
            {[
              { key: 'feeNursery', label: 'Nursery to KG' },
              { key: 'feePrimary', label: 'Class 1–5' },
              { key: 'feeMiddle', label: 'Class 6–8' },
              { key: 'feeSEE', label: 'Class 9–10 (SEE)' },
              { key: 'fee11', label: 'Class 11 (+2 Sci)' },
              { key: 'fee12', label: 'Class 12 (+2 Sci)' },
            ].map(({ key, label }) => (
              <Field key={key} label={label} name={key} {...admissions(key)}
                hint="e.g. Rs. 3,500/month" />
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── Academics Page ────────────────────────────────── */}
      <SectionCard title="Academics Page" icon={<FaGraduationCap />} accent="#EF4444">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="content-grid">
          <Field label="Page Subtitle" name="subtitle" {...academics('subtitle')} />
          <Field label="Overview / Intro" name="overview" {...academics('overview')} rows={4} />
        </div>
        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
          <h4 style={{ color: 'var(--color-secondary)', marginBottom: '16px' }}>Academic Programs</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="content-grid">
            {[
              { key: 'eccdTitle', label: 'Early Childhood Title' },
              { key: 'eccdDesc', label: 'Early Childhood Description' },
              { key: 'primaryTitle', label: 'Primary Level Title' },
              { key: 'primaryDesc', label: 'Primary Level Description' },
              { key: 'lowerSecTitle', label: 'Lower Secondary Title' },
              { key: 'lowerSecDesc', label: 'Lower Secondary Description' },
              { key: 'seeTitle', label: 'SEE Level Title' },
              { key: 'seeDesc', label: 'SEE Level Description' },
              { key: 'plusTwoTitle', label: '+2 Level Title' },
              { key: 'plusTwoDesc', label: '+2 Level Description' },
            ].map(({ key, label }) => (
              <Field key={key} label={label} name={key} {...academics(key)} rows={key.endsWith('Desc') ? 3 : 1} />
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Bottom Save */}
      <div style={{ textAlign: 'right', marginTop: '8px' }}>
        <button onClick={handleSave} style={{
          padding: '12px 32px', background: 'var(--color-success)', color: 'white',
          border: 'none', borderRadius: '8px', display: 'inline-flex',
          alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
        }}>
          <FaSave /> Save All Changes
        </button>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .content-grid { grid-template-columns: 1fr !important; }
          .values-grid  { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .values-grid { grid-template-columns: 1fr !important; }
        }
        input:focus, textarea:focus {
          border-color: var(--color-secondary) !important;
          box-shadow: 0 0 0 3px rgba(26,58,107,0.1);
        }
      `}</style>
    </div>
  );
};

export default PageContentManager;