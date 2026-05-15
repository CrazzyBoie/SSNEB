import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

// Helper: derive department from class
export const getDepartmentFromClass = (cls) => {
  const classStr = String(cls).trim().toLowerCase();
  const num = parseInt(classStr);
  if (!isNaN(num)) {
    if (num >= 1 && num <= 5) return 'Primary';
    if (num >= 6 && num <= 8) return 'Lower Secondary';
    if (num >= 9 && num <= 10) return 'Secondary';
    if (num >= 11 && num <= 12) return 'Higher Secondary';
  }
  // Nursery, LKG, UKG
  if (['nursery', 'lkg', 'ukg'].includes(classStr)) return 'Primary';
  return 'Primary'; // default
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ssnebs_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Re-validate from Firestore to ensure user still exists/active
        const validate = async () => {
          const docRef = doc(db, 'ssnebs_user', parsed.uid);
          const snap = await getDoc(docRef);
          if (snap.exists() && snap.data().active !== false) {
            const userData = snap.data();
            let enrichedUser = { uid: parsed.uid, ...userData };

            // For teachers: fetch linked faculty profile to get departments & subjects arrays
            if (userData.role === 'teacher') {
              try {
                // Check if user has subjects/departments directly stored
                if (userData.subjects && Array.isArray(userData.subjects)) {
                  enrichedUser.subjects = userData.subjects;
                }
                if (userData.departments && Array.isArray(userData.departments)) {
                  enrichedUser.departments = userData.departments;
                }
                // Also try to find linked faculty record for additional data
                const facultySnap = await getDocs(
                  query(collection(db, 'ssnebs'), where('data', '!=', null))
                );
                // Faculty is stored in ssnebs/admin_faculty as array in data field
                const facultyDoc = await getDoc(doc(db, 'ssnebs', 'admin_faculty'));
                if (facultyDoc.exists()) {
                  const facultyData = facultyDoc.data();
                  if (facultyData.data && Array.isArray(facultyData.data)) {
                    const linkedFaculty = facultyData.data.find(
                      f => f.linkedUserId === parsed.uid
                    );
                    if (linkedFaculty) {
                      // Merge faculty subjects/departments/sections if not already present
                      if (linkedFaculty.subjects && Array.isArray(linkedFaculty.subjects)) {
                        enrichedUser.subjects = linkedFaculty.subjects;
                      }
                      if (linkedFaculty.departments && Array.isArray(linkedFaculty.departments)) {
                        enrichedUser.departments = linkedFaculty.departments;
                      } else if (linkedFaculty.department) {
                        enrichedUser.departments = [linkedFaculty.department];
                      }
                      if (linkedFaculty.sections && Array.isArray(linkedFaculty.sections)) {
                        enrichedUser.sections = linkedFaculty.sections;
                      }
                    }
                  }
                }
              } catch (err) {
                console.error('Error fetching faculty profile:', err);
              }
            }

            setCurrentUser(enrichedUser);
          } else {
            localStorage.removeItem('ssnebs_session');
          }
          setLoading(false);
        };
        validate();
      } catch {
        localStorage.removeItem('ssnebs_session');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const usersRef = collection(db, 'ssnebs_user');
    const q = query(usersRef, where('username', '==', username.trim().toLowerCase()));
    const snap = await getDocs(q);

    if (snap.empty) throw new Error('Invalid username or password');

    const userDoc = snap.docs[0];
    const userData = userDoc.data();

    if (userData.active === false) throw new Error('Your account has been deactivated. Contact admin.');
    if (userData.password !== password) throw new Error('Invalid username or password');

    const user = { uid: userDoc.id, ...userData };

    // Enrich teacher data
    if (userData.role === 'teacher') {
      try {
        const facultyDoc = await getDoc(doc(db, 'ssnebs', 'admin_faculty'));
        if (facultyDoc.exists()) {
          const facultyData = facultyDoc.data();
          if (facultyData.data && Array.isArray(facultyData.data)) {
            const linkedFaculty = facultyData.data.find(
              f => f.linkedUserId === userDoc.id
            );
            if (linkedFaculty) {
              if (linkedFaculty.subjects && Array.isArray(linkedFaculty.subjects)) {
                user.subjects = linkedFaculty.subjects;
              }
              if (linkedFaculty.departments && Array.isArray(linkedFaculty.departments)) {
                user.departments = linkedFaculty.departments;
              } else if (linkedFaculty.department) {
                user.departments = [linkedFaculty.department];
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching faculty during login:', err);
      }
    }

    // Don't persist raw password in session
    const sessionUser = { 
      uid: userDoc.id, 
      username: userData.username, 
      role: userData.role, 
      name: userData.name,
      subjects: user.subjects || [],
      departments: user.departments || [],
      sections: user.sections || [],
      subject: userData.subject || ''
    };
    localStorage.setItem('ssnebs_session', JSON.stringify(sessionUser));
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('ssnebs_session');
    // backward compat — also clear old admin flag
    localStorage.removeItem('isAdminLoggedIn');
    setCurrentUser(null);
  };

  const isAdmin   = currentUser?.role === 'admin';
  const isTeacher = currentUser?.role === 'teacher';
  const isStudent = currentUser?.role === 'student';

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,   // ← exposed so UserProfile can update in-memory user
      loading,
      login,
      logout,
      isAdmin,
      isTeacher,
      isStudent,
    }}>
      {children}
    </AuthContext.Provider>
  );
};