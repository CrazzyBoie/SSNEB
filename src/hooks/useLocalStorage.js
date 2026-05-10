import { useState, useEffect, useCallback, useRef } from 'react';

const LOCAL_STORAGE_CHANGE_EVENT = 'localStorageChange';

/**
 * Reads a value from localStorage, returning the parsed JSON or the
 * provided fallback if the key is absent or the value is corrupt.
 */
function readFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    return JSON.parse(stored);
  } catch {
    return fallback;
  }
}

/**
 * Writes a value to localStorage.
 * Returns true on success, false if storage is full or serialisation fails.
 */
function writeToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[useLocalStorage] Could not save "${key}":`, err);
    return false;
  }
}

/**
 * useLocalStorage(key, defaultValue)
 *
 * A stable hook that persists state to localStorage.
 *
 * Fixed bugs vs. the original version:
 *  1. defaultValue is captured in a ref so object/array literals passed
 *     inline (e.g. useLocalStorage('k', [])) don't cause the effect to
 *     re-run on every render, which was silently resetting stored data.
 *  2. The native `storage` event is now handled so that changes made in
 *     another browser tab are reflected in this tab.
 *  3. writeToStorage wraps localStorage.setItem in try/catch so that
 *     QuotaExceededError (common with large base64 images) surfaces as a
 *     console error instead of a silent crash that discards all changes.
 *  4. The initial state is read eagerly inside the useState initialiser
 *     rather than through a useCallback with a stale defaultValue ref.
 */
export const useLocalStorage = (key, defaultValue) => {
  // Keep defaultValue stable across renders.
  // If the caller passes an inline literal like [] or {}, a new reference
  // is created on every render, which previously caused the readValue
  // useCallback (and the effect depending on it) to fire on every render
  // — effectively wiping whatever was saved in localStorage.
  const defaultRef = useRef(defaultValue);

  // Read once, eagerly, so the very first render already shows stored data.
  const [value, setValue] = useState(() =>
    readFromStorage(key, defaultRef.current)
  );

  useEffect(() => {
    // Keep the ref in sync if the caller ever changes the default.
    defaultRef.current = defaultValue;
  });

  useEffect(() => {
    // ── Same-tab sync ──────────────────────────────────────────────────
    // When setStoredValue is called anywhere in this tab the custom event
    // carries the new value directly, so we avoid re-parsing JSON.
    const handleCustomChange = (e) => {
      if (e.detail && e.detail.key === key) {
        setValue(e.detail.value);
      }
    };

    // ── Cross-tab sync ─────────────────────────────────────────────────
    // The native `storage` event fires in all OTHER tabs when localStorage
    // changes. Without this, admin changes made in one tab were invisible
    // to the public pages open in another tab until a full page reload.
    const handleStorageEvent = (e) => {
      if (e.key === key) {
        if (e.newValue === null) {
          setValue(defaultRef.current);
        } else {
          try {
            setValue(JSON.parse(e.newValue));
          } catch {
            setValue(defaultRef.current);
          }
        }
      }
    };

    // ── Visibility sync ────────────────────────────────────────────────
    // Re-read from storage when the user switches back to this tab.
    // Covers the common flow: admin saves in Tab A, user views public
    // site in Tab B — switching to Tab B now picks up the changes.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setValue(readFromStorage(key, defaultRef.current));
      }
    };

    window.addEventListener(LOCAL_STORAGE_CHANGE_EVENT, handleCustomChange);
    window.addEventListener('storage', handleStorageEvent);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener(LOCAL_STORAGE_CHANGE_EVENT, handleCustomChange);
      window.removeEventListener('storage', handleStorageEvent);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [key]); // key is the only real dependency now

  const setStoredValue = useCallback(
    (newVal) => {
      // Support functional updates: setStoredValue(prev => [...prev, item])
      setValue((prev) => {
        const resolved = typeof newVal === 'function' ? newVal(prev) : newVal;

        // Persist to localStorage with error handling for QuotaExceededError.
        const ok = writeToStorage(key, resolved);

        if (ok) {
          // Notify every other useLocalStorage in THIS tab with the same key.
          window.dispatchEvent(
            new CustomEvent(LOCAL_STORAGE_CHANGE_EVENT, {
              detail: { key, value: resolved },
            })
          );
        }

        // Always update React state even if storage failed, so the UI
        // stays consistent within the current session.
        return resolved;
      });
    },
    [key]
  );

  return [value, setStoredValue];
};