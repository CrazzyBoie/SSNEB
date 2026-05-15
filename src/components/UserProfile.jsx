import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { compressImage } from '../hooks/useImageCompress';
import {
  FaUserCircle, FaCamera, FaLock, FaEnvelope, FaPhone,
  FaIdBadge, FaBook, FaSchool, FaHashtag, FaSave,
  FaEye, FaEyeSlash, FaCheckCircle, FaExclamationCircle,
  FaUserShield, FaChalkboardTeacher, FaUserGraduate, FaEdit
} from 'react-icons/fa';

/* ── helpers ─────────────────────────────────────────────────── */
const ROLE_META = {
  admin:   { label: 'Administrator', icon: FaUserShield,        color: '#D72638', bg: '#fef2f2'  },
  teacher: { label: 'Teacher',        icon: FaChalkboardTeacher, color: '#1A3A6B', bg: '#eff6ff'  },
  student: { label: 'Student',        icon: FaUserGraduate,      color: '#10B981', bg: '#f0fdf4'  },
};

const inputStyle = (focused) => ({
  width: '100%',
  padding: '11px 14px',
  border: `2px solid ${focused ? '#1A3A6B' : '#e5e7eb'}`,
  borderRadius: '10px',
  fontSize: '0.92rem',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxShadow: focused ? '0 0 0 3px rgba(26,58,107,0.08)' : 'none',
  background: 'white',
});

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

function FieldGroup({ label, icon: Icon, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={labelStyle}>
        {Icon && <Icon style={{ marginRight: '5px', opacity: 0.7 }} />}{label}
      </label>
      {children}
    </div>
  );
}

function ReadonlyField({ value, icon: Icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '11px 14px', border: '2px solid #f3f4f6',
      borderRadius: '10px', background: '#f9fafb',
      fontSize: '0.92rem', color: '#374151',
    }}>
      {Icon && <Icon style={{ color: '#9ca3af', flexShrink: 0 }} />}
      <span style={{ fontWeight: 600 }}>{value || '—'}</span>
      <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#9ca3af', fontStyle: 'italic' }}>read-only</span>
    </div>
  );
}

/* ── main component ──────────────────────────────────────────── */
export default function UserProfile() {
  const { currentUser, setCurrentUser } = useAuth();
  const role = currentUser?.role || 'student';
  const meta = ROLE_META[role] || ROLE_META.student;
  const RoleIcon = meta.icon;

  /* form state */
  const [name,    setName]    = useState(currentUser?.name    || '');
  const [email,   setEmail]   = useState(currentUser?.email   || '');
  const [phone,   setPhone]   = useState(currentUser?.phone   || '');
  const [subject, setSubject] = useState(currentUser?.subject || '');
  const [cls,     setCls]     = useState(currentUser?.class   || '');
  const [section, setSection] = useState(currentUser?.section || '');
  const [rollNo,  setRollNo]  = useState(currentUser?.rollNo  || '');

  /* password state */
  const [curPw,   setCurPw]   = useState('');
  const [newPw,   setNewPw]   = useState('');
  const [confPw,  setConfPw]  = useState('');
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);

  /* avatar state */
  const [avatar,       setAvatar]       = useState(currentUser?.photoURL || null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileRef = useRef();

  /* ui state */
  const [saving,    setSaving]    = useState(false);
  const [pwSaving,  setPwSaving]  = useState(false);
  const [toast,     setToast]     = useState(null);
  const [focused,   setFocused]   = useState('');
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'security'

  /* ── toast helper ──────────────────────────────────────────── */
  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── avatar upload ─────────────────────────────────────────── */
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return showToast('Please select an image file.', 'error');
    setAvatarUploading(true);
    try {
      const compressed = await compressImage(file, 400, 0.8);
      setAvatar(compressed);
      await updateDoc(doc(db, 'ssnebs_user', currentUser.uid), {
        photoURL: compressed, updatedAt: serverTimestamp()
      });
      // Sync context
      if (typeof setCurrentUser === 'function') {
        setCurrentUser(prev => ({ ...prev, photoURL: compressed }));
      }
      showToast('Profile photo updated!');
    } catch {
      showToast('Failed to upload photo. Try a smaller image.', 'error');
    }
    setAvatarUploading(false);
    e.target.value = '';
  };

  /* ── save profile ──────────────────────────────────────────── */
  const handleSaveProfile = async () => {
    if (!name.trim()) return showToast('Full name is required.', 'error');
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        updatedAt: serverTimestamp(),
      };
      if (role === 'teacher') payload.subject = subject.trim();
      // class, section, rollNo are admin-managed — students cannot edit them
      await updateDoc(doc(db, 'ssnebs_user', currentUser.uid), payload);
      if (typeof setCurrentUser === 'function') {
        setCurrentUser(prev => ({ ...prev, ...payload }));
      }
      // Update session storage (name may have changed)
      const session = JSON.parse(localStorage.getItem('ssnebs_session') || '{}');
      localStorage.setItem('ssnebs_session', JSON.stringify({ ...session, name: payload.name }));
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast('Failed to save changes. Please try again.', 'error');
    }
    setSaving(false);
  };

  /* ── change password ───────────────────────────────────────── */
  const handleChangePassword = async () => {
    if (!curPw) return showToast('Enter your current password.', 'error');
    if (curPw !== currentUser?.password) return showToast('Current password is incorrect.', 'error');
    if (!newPw || newPw.length < 6) return showToast('New password must be at least 6 characters.', 'error');
    if (newPw !== confPw) return showToast('New passwords do not match.', 'error');
    if (newPw === curPw) return showToast('New password must differ from current.', 'error');

    setPwSaving(true);
    try {
      await updateDoc(doc(db, 'ssnebs_user', currentUser.uid), {
        password: newPw, updatedAt: serverTimestamp()
      });
      if (typeof setCurrentUser === 'function') {
        setCurrentUser(prev => ({ ...prev, password: newPw }));
      }
      setCurPw(''); setNewPw(''); setConfPw('');
      showToast('Password changed successfully!');
    } catch {
      showToast('Failed to update password.', 'error');
    }
    setPwSaving(false);
  };

  /* ── password strength ─────────────────────────────────────── */
  const pwStrength = (pw) => {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: 'Weak', color: '#dc2626', width: '25%' };
    if (score <= 3) return { label: 'Fair', color: '#d97706', width: '55%' };
    if (score === 4) return { label: 'Good', color: '#16a34a', width: '80%' };
    return { label: 'Strong', color: '#15803d', width: '100%' };
  };

  const strength = pwStrength(newPw);

  /* ── avatar display ────────────────────────────────────────── */
  const initials = (currentUser?.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  /* ── render ────────────────────────────────────────────────── */
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>

      {/* ── Toast ────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 20px', borderRadius: '12px',
          background: toast.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1.5px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: toast.type === 'success' ? '#166534' : '#dc2626',
          fontWeight: 600, fontSize: '0.9rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          animation: 'slideIn 0.3s ease',
        }}>
          {toast.type === 'success'
            ? <FaCheckCircle size={16} />
            : <FaExclamationCircle size={16} />
          }
          {toast.text}
        </div>
      )}

      {/* ── Page Header ──────────────────────────────────────── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 800, color: '#1e293b' }}>
          My Profile
        </h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
          Manage your personal information and account security.
        </p>
      </div>

      {/* ── Profile Card (Avatar + Role badge) ───────────────── */}
      <div style={{
        background: 'white', borderRadius: '16px', padding: '28px',
        boxShadow: '0 1px 8px rgba(0,0,0,0.08)', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: '96px', height: '96px', borderRadius: '50%',
            background: avatar ? 'transparent' : `linear-gradient(135deg, ${meta.color}, #475569)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', border: '3px solid white',
            boxShadow: `0 0 0 3px ${meta.color}33`,
            fontSize: '2rem', fontWeight: 900, color: 'white',
          }}>
            {avatar
              ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials
            }
          </div>
          {/* Camera button */}
          <button
            onClick={() => fileRef.current.click()}
            disabled={avatarUploading}
            title="Change photo"
            style={{
              position: 'absolute', bottom: 0, right: 0,
              width: '30px', height: '30px', borderRadius: '50%',
              background: meta.color, color: 'white',
              border: '2px solid white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {avatarUploading ? '…' : <FaCamera size={11} />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
        </div>

        {/* Name & role */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>
            {currentUser?.name || 'User'}
          </h2>
          <p style={{ margin: '0 0 10px', color: '#9ca3af', fontSize: '0.85rem' }}>
            @{currentUser?.username}
          </p>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', borderRadius: '999px',
            background: meta.bg, color: meta.color,
            fontSize: '0.8rem', fontWeight: 700,
          }}>
            <RoleIcon size={12} /> {meta.label}
          </span>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {role === 'student' && (
            <>
              {currentUser?.class && (
                <div style={{ textAlign: 'center', padding: '10px 18px', background: '#f8fafc', borderRadius: '10px' }}>
                  <p style={{ margin: 0, fontWeight: 800, color: '#1e293b', fontSize: '1rem' }}>{currentUser.class}</p>
                  <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.72rem' }}>Class</p>
                </div>
              )}
              {currentUser?.rollNo && (
                <div style={{ textAlign: 'center', padding: '10px 18px', background: '#f8fafc', borderRadius: '10px' }}>
                  <p style={{ margin: 0, fontWeight: 800, color: '#1e293b', fontSize: '1rem' }}>{currentUser.rollNo}</p>
                  <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.72rem' }}>Roll No</p>
                </div>
              )}
            </>
          )}
          {role === 'teacher' && currentUser?.subject && (
            <div style={{ textAlign: 'center', padding: '10px 18px', background: '#f8fafc', borderRadius: '10px' }}>
              <p style={{ margin: 0, fontWeight: 800, color: '#1e293b', fontSize: '0.9rem' }}>{currentUser.subject}</p>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.72rem' }}>Subject</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#f1f5f9', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
        {[
          { id: 'info',     label: 'Personal Info',  icon: FaEdit   },
          { id: 'security', label: 'Security',        icon: FaLock   },
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '9px 20px', borderRadius: '9px',
              border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.875rem',
              fontFamily: 'inherit',
              background: activeTab === tab.id ? 'white' : 'transparent',
              color: activeTab === tab.id ? meta.color : '#6b7280',
              boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
            }}>
              <TabIcon size={13} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Personal Info Tab ────────────────────────────────── */}
      {activeTab === 'info' && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 24px', fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaIdBadge style={{ color: meta.color }} /> Personal Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0 24px' }}>

            {/* Full Name */}
            <FieldGroup label="Full Name" icon={FaIdBadge}>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused('')}
                style={inputStyle(focused === 'name')}
              />
            </FieldGroup>

            {/* Username - readonly */}
            <FieldGroup label="Username" icon={FaUserCircle}>
              <ReadonlyField value={currentUser?.username} icon={FaUserCircle} />
            </FieldGroup>

            {/* Role - readonly */}
            <FieldGroup label="Role" icon={RoleIcon}>
              <ReadonlyField value={meta.label} icon={RoleIcon} />
            </FieldGroup>

            {/* Email */}
            <FieldGroup label="Email Address" icon={FaEnvelope}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                style={inputStyle(focused === 'email')}
              />
            </FieldGroup>

            {/* Phone */}
            <FieldGroup label="Phone Number" icon={FaPhone}>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+977 XXXXXXXXXX"
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused('')}
                style={inputStyle(focused === 'phone')}
              />
            </FieldGroup>

            {/* Teacher-only: Subject */}
            {role === 'teacher' && (
              <FieldGroup label="Subject" icon={FaBook}>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Mathematics"
                  onFocus={() => setFocused('subject')}
                  onBlur={() => setFocused('')}
                  style={inputStyle(focused === 'subject')}
                />
              </FieldGroup>
            )}

            {/* Student-only fields — read-only (managed by admin only) */}
            {role === 'student' && (
              <>
                <FieldGroup label="Class" icon={FaSchool}>
                  <ReadonlyField value={currentUser?.class} icon={FaSchool} />
                </FieldGroup>

                <FieldGroup label="Section" icon={FaSchool}>
                  <ReadonlyField value={currentUser?.section} icon={FaSchool} />
                </FieldGroup>

                <FieldGroup label="Roll Number" icon={FaHashtag}>
                  <ReadonlyField value={currentUser?.rollNo} icon={FaHashtag} />
                </FieldGroup>
              </>
            )}
          </div>

          {/* Save button */}
          <div style={{ marginTop: '8px', paddingTop: '20px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '11px 28px', borderRadius: '10px',
                background: saving ? '#93c5fd' : meta.color,
                color: 'white', border: 'none', cursor: saving ? 'default' : 'pointer',
                fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit',
                transition: 'opacity 0.2s, transform 0.1s',
                boxShadow: `0 4px 12px ${meta.color}44`,
              }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <FaSave size={14} />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* ── Security Tab ─────────────────────────────────────── */}
      {activeTab === 'security' && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaLock style={{ color: meta.color }} /> Change Password
          </h3>
          <p style={{ margin: '0 0 24px', fontSize: '0.85rem', color: '#9ca3af' }}>
            Choose a strong password. Minimum 6 characters.
          </p>

          <div style={{ maxWidth: '420px' }}>

            {/* Current password */}
            <FieldGroup label="Current Password" icon={FaLock}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCur ? 'text' : 'password'}
                  value={curPw}
                  onChange={e => setCurPw(e.target.value)}
                  placeholder="Enter current password"
                  onFocus={() => setFocused('curPw')}
                  onBlur={() => setFocused('')}
                  style={{ ...inputStyle(focused === 'curPw'), paddingRight: '44px' }}
                />
                <button type="button" onClick={() => setShowCur(s => !s)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  {showCur ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </FieldGroup>

            {/* New password */}
            <FieldGroup label="New Password" icon={FaLock}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  placeholder="Enter new password"
                  onFocus={() => setFocused('newPw')}
                  onBlur={() => setFocused('')}
                  style={{ ...inputStyle(focused === 'newPw'), paddingRight: '44px' }}
                />
                <button type="button" onClick={() => setShowNew(s => !s)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  {showNew ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {/* Strength bar */}
              {strength && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ height: '4px', background: '#f3f4f6', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: '99px', transition: 'width 0.4s ease' }} />
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: strength.color, fontWeight: 700 }}>
                    {strength.label}
                  </p>
                </div>
              )}
            </FieldGroup>

            {/* Confirm password */}
            <FieldGroup label="Confirm New Password" icon={FaLock}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCon ? 'text' : 'password'}
                  value={confPw}
                  onChange={e => setConfPw(e.target.value)}
                  placeholder="Repeat new password"
                  onFocus={() => setFocused('confPw')}
                  onBlur={() => setFocused('')}
                  style={{
                    ...inputStyle(focused === 'confPw'),
                    paddingRight: '44px',
                    borderColor: confPw && newPw !== confPw ? '#dc2626' : (focused === 'confPw' ? '#1A3A6B' : '#e5e7eb'),
                  }}
                />
                <button type="button" onClick={() => setShowCon(s => !s)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  {showCon ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {confPw && newPw !== confPw && (
                <p style={{ margin: '5px 0 0', fontSize: '0.78rem', color: '#dc2626', fontWeight: 600 }}>
                  Passwords do not match
                </p>
              )}
            </FieldGroup>

            {/* Save password */}
            <button
              onClick={handleChangePassword}
              disabled={pwSaving}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '11px 28px', borderRadius: '10px',
                background: pwSaving ? '#93c5fd' : meta.color,
                color: 'white', border: 'none', cursor: pwSaving ? 'default' : 'pointer',
                fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit',
                transition: 'opacity 0.2s',
                boxShadow: `0 4px 12px ${meta.color}44`,
                marginTop: '4px',
              }}
            >
              <FaLock size={13} />
              {pwSaving ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}