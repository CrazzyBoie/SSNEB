// ─────────────────────────────────────────────────────────────────────────────
//  src/hooks/useFirestore.js
//
//  Drop-in replacement for useLocalStorage.
//  API is identical:  const [value, setValue] = useFirestore('key', default)
//
//  Each localStorage key becomes one Firestore document:
//    Collection: "ssnebs"
//    Document:   the key (e.g. "admin_notices")
//    Field:      "data"  ← holds the array or object
//
//  The hook:
//    • Subscribes to real-time updates (onSnapshot) so all browsers/devices
//      see changes instantly without a page reload.
//    • Falls back to defaultValue while loading.
//    • Shows a loading state so components don't flash with empty data.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase';
import {
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';

const COLLECTION = 'ssnebs';

export const useFirestore = (key, defaultValue) => {
  const defaultRef  = useRef(defaultValue);
  const [value, setValue]     = useState(defaultValue);
  const [loading, setLoading] = useState(true);

  // Keep defaultRef in sync (prevents stale closure issues)
  useEffect(() => { defaultRef.current = defaultValue; });

  useEffect(() => {
    const docRef = doc(db, COLLECTION, key);

    // Real-time listener — fires immediately with current data, then on every change
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          setValue(snap.data().data ?? defaultRef.current);
        } else {
          // Document doesn't exist yet — seed it with the default
          setDoc(docRef, { data: defaultRef.current }).catch(console.error);
          setValue(defaultRef.current);
        }
        setLoading(false);
      },
      (err) => {
        console.error(`[useFirestore] onSnapshot error for "${key}":`, err);
        setLoading(false);
      }
    );

    return () => unsub(); // Unsubscribe when component unmounts
  }, [key]);

  const setStoredValue = useCallback(
    (newVal) => {
      setValue((prev) => {
        const resolved = typeof newVal === 'function' ? newVal(prev) : newVal;
        const docRef   = doc(db, COLLECTION, key);
        setDoc(docRef, { data: resolved }).catch((err) =>
          console.error(`[useFirestore] setDoc error for "${key}":`, err)
        );
        return resolved;
      });
    },
    [key]
  );

  return [value, setStoredValue, loading];
};