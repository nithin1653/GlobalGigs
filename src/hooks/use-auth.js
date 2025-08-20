
'use client';
import { useState, useEffect, useContext, createContext } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, getUserProfile } from '@/lib/firebase';
import { useSearchParams } from 'next/navigation';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  
  // Dev role-switching
  const searchParams = useSearchParams();
  const devRole = searchParams.get('dev_role');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Force refresh of the user token to get updated profile info
        await user.reload();
        const refreshedUser = auth.currentUser;
        setUser(refreshedUser);
        const profile = await getUserProfile(user.uid);
        // --- Development Role Override ---
        if (process.env.NODE_ENV === 'development' && devRole && profile) {
            profile.role = devRole;
        }
        // --------------------------------
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [devRole]); // Rerun on role switch

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
