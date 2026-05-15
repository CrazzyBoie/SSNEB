/**
 * seedAdmin.js
 * ─────────────────────────────────────────────────────────────
 * Run this ONCE from your browser console or as a temporary
 * React component to create the first admin account in Firestore.
 *
 * HOW TO USE:
 *   Option A – Browser console (quickest):
 *     1. Open your site in the browser
 *     2. Open DevTools → Console
 *     3. Paste the code inside the <script> block below and press Enter
 *
 *   Option B – Temporary React component:
 *     1. Import and render <SeedAdmin /> once anywhere in your app
 *     2. Click the button, then remove the component
 *
 *   Option C – Firebase Console:
 *     Go to Firestore → ssnebs_user → Add document with the
 *     fields shown in DEFAULT_ADMIN below.
 * ─────────────────────────────────────────────────────────────
 */

// ── Default first admin ───────────────────────────────────────
const DEFAULT_ADMIN = {
  name:     'Administrator',
  username: 'admin',
  password: 'ssnebs2057',   // ← CHANGE THIS after first login!
  role:     'admin',
  email:    'admin@ssnebs.edu.np',
  phone:    '',
  active:   true,
};

// ── React component version ───────────────────────────────────
import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const SeedAdmin = () => {
  const [status, setStatus] = useState('');

  const seed = async () => {
    try {
      setStatus('Creating...');
      await addDoc(collection(db, 'ssnebs_user'), {
        ...DEFAULT_ADMIN,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setStatus('✅ Admin created! username: admin | password: ssnebs2057');
    } catch (e) {
      setStatus('❌ Error: ' + e.message);
    }
  };

  return (
    <div style={{ padding: 20, background: '#fef9c3', border: '2px solid #ca8a04', borderRadius: 12, margin: 20, maxWidth: 400 }}>
      <h3 style={{ margin: '0 0 10px' }}>🔧 Seed First Admin</h3>
      <p style={{ fontSize: 13, color: '#374151', margin: '0 0 12px' }}>
        Click once to create the default admin account in Firestore.
        Remove this component afterwards!
      </p>
      <button onClick={seed} style={{ padding: '8px 20px', background: '#1A3A6B', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
        Create Admin Account
      </button>
      {status && <p style={{ marginTop: 12, fontWeight: 600, fontSize: 13 }}>{status}</p>}
    </div>
  );
};

/*
 * ── Browser console version ───────────────────────────────────
 * Paste this into your browser console after opening the site:
 *
import('/src/firebase.js').then(({ db }) => {
  import('firebase/firestore').then(({ collection, addDoc, serverTimestamp }) => {
    addDoc(collection(db, 'ssnebs_user'), {
      name: 'Administrator',
      username: 'admin',
      password: 'ssnebs2057',
      role: 'admin',
      email: 'admin@ssnebs.edu.np',
      active: true,
      createdAt: serverTimestamp(),
    }).then(() => console.log('✅ Admin created!'))
      .catch(e => console.error('❌', e));
  });
});
*/