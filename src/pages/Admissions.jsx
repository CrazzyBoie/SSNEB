import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaCheckCircle, FaFileAlt, FaIdCard, FaCamera, FaCertificate, FaArrowRight } from 'react-icons/fa';

const Admissions = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    studentName: '',
    studentNameNepali: '',
    dob: '',
    gender: '',
    grade: '',
    fatherName: '',
    motherName: '',
    guardianPhone: '',
    previousSchool: '',
    address: '',
    photo: null
  });
  const [submitted, setSubmitted]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ─── PASTE YOUR APPS SCRIPT WEB APP URL HERE ─────────────────────────────
  const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbzsN1gi7fc-aaWLZXNCAyaTF1PlxQmMF3G9O6JUKhBaErei3kZiAhZzDNYuKJxtZeg/exec';
  // ─────────────────────────────────────────────────────────────────────────

  const steps = [
    { num: '01', title: 'Fill Online Application Form', desc: 'Complete the online form with all required details' },
    { num: '02', title: 'Submit Required Documents', desc: 'Upload necessary documents for verification' },
    { num: '03', title: 'Entrance Assessment', desc: 'For Grade 6+ students, take the entrance test' },
    { num: '04', title: 'Interview with Parents', desc: 'Meet with school administration' },
    { num: '05', title: 'Confirmation & Fee Payment', desc: 'Complete admission with fee payment' },
  ];

  const documents = [
    { icon: <FaCertificate />, title: 'Birth Certificate', desc: 'Original or certified copy' },
    { icon: <FaFileAlt />, title: 'Previous Marksheet', desc: 'Last completed grade marksheet' },
    { icon: <FaCamera />, title: 'Passport Size Photo', desc: 'Recent photo (2 copies)' },
    { icon: <FaIdCard />, title: 'Character Certificate', desc: 'From previous school' },
  ];

  const grades = ['Nursery', 'KG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 
                  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', '+2 Science', '+2 Management', '+2 Law', '+2 Humanities'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    const application = {
      ...formData,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };

    // 1️⃣  Send to Google Sheets
    let sheetOk = false;
    try {
      const params = new URLSearchParams({
        studentName:      application.studentName,
        studentNameNepali: application.studentNameNepali,
        dob:              application.dob,
        gender:           application.gender,
        grade:            application.grade,
        fatherName:       application.fatherName,
        motherName:       application.motherName,
        guardianPhone:    application.guardianPhone,
        previousSchool:   application.previousSchool,
        address:          application.address,
        submittedAt:      application.submittedAt,
        id:               application.id,
      });

      const res = await fetch(`${GOOGLE_SHEET_URL}?${params.toString()}`, {
        method: 'GET', // Apps Script GET is simplest — no CORS preflight
        mode: 'no-cors', // Google Apps Script requires no-cors
      });

      // no-cors means we can't read the response, but if fetch didn't throw, it went through
      sheetOk = true;
    } catch (err) {
      console.error('Google Sheets error:', err);
      setSubmitError('Could not reach Google Sheets — application saved locally only.');
    }

    // 2️⃣  Always save to localStorage as backup (and for the admin panel)
    try {
      const existing = JSON.parse(localStorage.getItem('admin_applications') || '[]');
      existing.push({ ...application, savedToSheet: sheetOk });
      localStorage.setItem('admin_applications', JSON.stringify(existing));
    } catch (err) {
      console.error('localStorage error:', err);
    }

    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubmitError('');
      setFormData({
        studentName: '', studentNameNepali: '', dob: '', gender: '',
        grade: '', fatherName: '', motherName: '', guardianPhone: '',
        previousSchool: '', address: '', photo: null,
      });
    }, 6000);
  };

  return (
    <main>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%)',
        padding: '100px 0',
        textAlign: 'center',
        color: 'white'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>{t('admissions')}</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>Join the SSNEBS Family - Admission Open for 2082</p>
        </div>
      </div>

      {/* Admission Notice */}
      <div style={{
        background: 'var(--color-accent)',
        padding: '20px 0',
        textAlign: 'center'
      }}>
        <div className="container">
          <p style={{ fontWeight: 700, color: 'var(--color-dark)', fontSize: '1.1rem', margin: 0 }}>
            🎓 Admission Open for Academic Year 2082 (2025-26) - Apply Now!
          </p>
        </div>
      </div>

      {/* Admission Process */}
      <section className="section">
        <div className="container">
          <div className="section-title scroll-animate">
            <h2>{t('admissionProcess')}</h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '20px',
            alignItems: 'start'
          }} className="steps-grid">
            {steps.map((step, index) => (
              <div key={index} className="scroll-animate" style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  margin: '0 auto 16px',
                  fontFamily: 'var(--font-display)'
                }}>
                  {step.num}
                </div>
                <h4 style={{ fontSize: '1rem', color: 'var(--color-secondary)', marginBottom: '8px' }}>{step.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>{step.desc}</p>
                {index < steps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '30px',
                    right: '-30px',
                    color: 'var(--color-accent)',
                    fontSize: '1.2rem',
                    display: 'block'
                  }} className="step-arrow">
                    <FaArrowRight />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Required Documents */}
      <section style={{ background: 'var(--color-light)', padding: '80px 0' }}>
        <div className="container">
          <div className="section-title scroll-animate">
            <h2>{t('requiredDocuments')}</h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px'
          }} className="docs-grid">
            {documents.map((doc, index) => (
              <div key={index} className="card scroll-animate" style={{
                padding: '28px',
                textAlign: 'center'
              }}>
                <div style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '14px' }}>{doc.icon}</div>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px', color: 'var(--color-secondary)' }}>{doc.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>{doc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fee Structure */}
      <section className="section">
        <div className="container">
          <div className="section-title scroll-animate">
            <h2>{t('feeStructure')}</h2>
            <p>Affordable quality education for every family</p>
          </div>
          <div className="card scroll-animate" style={{ overflow: 'hidden', maxWidth: '700px', margin: '0 auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-secondary)', color: 'white' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontFamily: 'var(--font-display)' }}>Fee Type</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontFamily: 'var(--font-display)' }}>Amount (NPR)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: 'Admission Fee', amount: '5,000' },
                  { type: 'Monthly Tuition (Nursery-5)', amount: '2,500' },
                  { type: 'Monthly Tuition (6-8)', amount: '3,000' },
                  { type: 'Monthly Tuition (9-10)', amount: '3,500' },
                  { type: 'Monthly Tuition (+2)', amount: '4,000' },
                  { type: 'Hostel Fee (Monthly)', amount: '8,000' },
                  { type: 'Examination Fee', amount: '1,500' },
                  { type: 'Library & Lab Fee', amount: '1,000' },
                ].map((fee, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <td style={{ padding: '14px 16px', fontSize: '0.95rem' }}>{fee.type}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--color-primary)' }}>Rs. {fee.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Online Form */}
      <section style={{ background: 'var(--color-light)', padding: '80px 0' }}>
        <div className="container">
          <div className="section-title scroll-animate">
            <h2>{t('onlineForm')}</h2>
          </div>

          {submitted ? (
            <div className="card scroll-animate" style={{
              padding: '60px',
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto',
              border: '3px solid var(--color-success)'
            }}>
              <FaCheckCircle size={60} style={{ color: 'var(--color-success)', marginBottom: '20px' }} />
              <h3 style={{ color: 'var(--color-success)', marginBottom: '12px' }}>Application Submitted!</h3>
              <p style={{ color: 'var(--color-muted)' }}>{t('successMessage')}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card scroll-animate" style={{
              padding: '40px',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }} className="form-grid">
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                    Student Name (English) *
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    required
                    value={formData.studentName}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-body)'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                    Student Name (Nepali)
                  </label>
                  <input
                    type="text"
                    name="studentNameNepali"
                    value={formData.studentNameNepali}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-nepali)'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dob"
                    required
                    value={formData.dob}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                    Gender *
                  </label>
                  <select
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-body)'
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                    Grade Applying For *
                  </label>
                  <select
                    name="grade"
                    required
                    value={formData.grade}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-body)'
                    }}
                  >
                    <option value="">Select Grade</option>
                    {grades.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                    Father's Name *
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    required
                    value={formData.fatherName}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                    Mother's Name *
                  </label>
                  <input
                    type="text"
                    name="motherName"
                    required
                    value={formData.motherName}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                    Guardian Contact *
                  </label>
                  <input
                    type="tel"
                    name="guardianPhone"
                    required
                    value={formData.guardianPhone}
                    onChange={handleChange}
                    placeholder="+977-XXXXXXXXXX"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                    Previous School
                  </label>
                  <input
                    type="text"
                    name="previousSchool"
                    value={formData.previousSchool}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                    Address *
                  </label>
                  <textarea
                    name="address"
                    required
                    rows="3"
                    value={formData.address}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-body)',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                    Upload Photo
                  </label>
                  <div style={{
                    border: '2px dashed #e5e7eb',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
                  onDrop={e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormData(prev => ({ ...prev, photo: reader.result }));
                      reader.readAsDataURL(file);
                    }
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" style={{ cursor: 'pointer' }}>
                      {formData.photo ? (
                        <img src={formData.photo} alt="Preview" style={{ maxHeight: '150px', borderRadius: 'var(--radius-sm)' }} />
                      ) : (
                        <>
                          <FaCamera size={32} style={{ color: 'var(--color-muted)', marginBottom: '10px' }} />
                          <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>Click or drag photo here</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '24px', padding: '14px', opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
              >
                {submitting ? 'Submitting…' : t('submit')}
              </button>
              {submitError && (
                <p style={{ marginTop: '12px', color: '#B45309', background: '#FEF3C7', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  ⚠️ {submitError}
                </p>
              )}
            </form>
          )}
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .steps-grid { grid-template-columns: 1fr !important; }
          .step-arrow { display: none !important; }
          .docs-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .form-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .docs-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
};

export default Admissions;