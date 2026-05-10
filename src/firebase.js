// ─────────────────────────────────────────────────────────────────────────────
//  src/firebase.js
//
//  HOW TO FILL IN YOUR KEYS:
//  1. Go to https://console.firebase.google.com
//  2. Create a project (e.g. "ssnebs-website")
//  3. Click the </> Web icon to register a web app
//  4. Copy the firebaseConfig object and paste it below
//  5. In the Firebase console, go to Build → Firestore Database → Create database
//     Choose "Start in test mode" (you can lock it down later)
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDX4e78eU_noiyHNEN0kJT0A9d5Iwo8vYw",
  authDomain: "ssneb-cc7f1.firebaseapp.com",
  projectId: "ssneb-cc7f1",
  storageBucket: "ssneb-cc7f1.firebasestorage.app",
  messagingSenderId: "695486777553",
  appId: "1:695486777553:web:71e2c624b401f9b90a9df0"
};

const app = initializeApp(firebaseConfig);
export const db  = getFirestore(app);