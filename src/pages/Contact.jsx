import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useFirestore } from '../hooks/useFirestore';
import { defaultSiteSettings, defaultPageContent } from '../data/defaultData';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebook, FaYoutube, FaInstagram, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';

const Contact = () => {
  const { t } = useLanguage();
  const [siteSettings] = useFirestore('admin_site_settings', defaultSiteSettings);
  const [pageContent] = useFirestore('admin_page_content', defaultPageContent);
  const contactPage = pageContent?.contactPage || defaultPageContent.contactPage;
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 5000);
  };

  const contactCards = [
    { icon: <FaMapMarkerAlt size={28} />, title: 'Address', content: siteSettings?.address || t('address') },
    { icon: <FaPhone size={28} />, title: 'Phone', content: siteSettings?.phone || t('phone') },
    { icon: <FaEnvelope size={28} />, title: 'Email', content: siteSettings?.email || t('email') },
    { icon: <FaClock size={28} />, title: 'Office Hours', content: siteSettings?.officeHours || t('officeHours') },
  ];

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
          <h1 style={{ fontSize: '3rem', marginBottom: '12px' }}>{t('contact')}</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>{contactPage.subtitle || 'Get in Touch with Us'}</p>
        </div>
      </div>

      {/* Contact Cards */}
      <section className="section" style={{ paddingBottom: '40px' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
            marginTop: '-60px',
            position: 'relative',
            zIndex: 10
          }} className="contact-cards">
            {contactCards.map((card, index) => (
              <div key={index} className="card scroll-animate" style={{
                padding: '28px',
                textAlign: 'center',
                borderTop: '4px solid var(--color-accent)'
              }}>
                <div style={{ color: 'var(--color-primary)', marginBottom: '14px' }}>{card.icon}</div>
                <h4 style={{ fontSize: '1rem', marginBottom: '8px', color: 'var(--color-secondary)' }}>{card.title}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', lineHeight: 1.5 }}>{card.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Map */}
      <section style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px'
          }} className="contact-grid">
            {/* Contact Form */}
            <div className="scroll-animate">
              <h2 style={{ fontSize: '1.8rem', color: 'var(--color-secondary)', marginBottom: '24px' }}>
                {t('sendMessage')}
              </h2>

              {submitted ? (
                <div style={{
                  padding: '40px',
                  background: '#f0fdf4',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  border: '2px solid var(--color-success)'
                }}>
                  <FaCheckCircle size={48} style={{ color: 'var(--color-success)', marginBottom: '16px' }} />
                  <h3 style={{ color: 'var(--color-success)', marginBottom: '8px' }}>Message Sent!</h3>
                  <p style={{ color: 'var(--color-muted)' }}>{t('thankYou')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                      {t('name')} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
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
                      {t('email')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
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
                      {t('phone')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
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
                      {t('subject')} *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
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
                      {t('message')} *
                    </label>
                    <textarea
                      name="message"
                      required
                      rows="5"
                      value={formData.message}
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
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '14px', fontSize: '1rem' }}
                  >
                    <FaPaperPlane style={{ marginRight: '8px' }} /> {t('send')}
                  </button>
                </form>
              )}
            </div>

            {/* Map */}
            <div className="scroll-animate">
              <h2 style={{ fontSize: '1.8rem', color: 'var(--color-secondary)', marginBottom: '24px' }}>
                Find Us on Map
              </h2>
              <div style={{
                width: '100%',
                height: '450px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-card)'
              }}>
                <iframe
                  src= "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d306.8739011407804!2d86.21286951351615!3d26.652521869237823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ec212a49f8a2ef%3A0x59fb3f75cf6788d2!2sSiddharth%20Sishu%20Niketan%20English%20Boarding%20school!5e1!3m2!1sen!2snp!4v1778606035768!5m2!1sen!2snp"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="SSNEBS Location"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section style={{ background: 'var(--color-secondary)', padding: '40px 0', color: 'white' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>{t('followUs')}</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            {[
              { icon: <FaFacebook size={24} />, color: '#1877F2', url: siteSettings?.facebook || '#' },
              { icon: <FaYoutube size={24} />, color: '#FF0000', url: siteSettings?.youtube || '#' },
              { icon: <FaInstagram size={24} />, color: '#E4405F', url: siteSettings?.instagram || '#' },
            ].map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: social.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textDecoration: 'none',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px) scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 1024px) {
          .contact-cards { grid-template-columns: repeat(2, 1fr) !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .contact-cards { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
};

export default Contact;