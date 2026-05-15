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