import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  User,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  fullName: string;
  age?: number;
  email: string | null;
  phoneNumber: string | null;
  createdAt: Date;
  isOnboarded: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Firestore
  const fetchUserProfile = useCallback(async (uid: string, retries = 3): Promise<UserProfile | null> => {
    for (let i = 0; i < retries; i++) {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          return {
            uid,
            fullName: data.fullName || '',
            age: data.age || undefined,
            email: data.email || null,
            phoneNumber: data.phoneNumber || data.phone || null,
            createdAt: data.createdAt?.toDate() || new Date(),
            isOnboarded: data.isOnboarded || false
          };
        }
        return null;
      } catch (error: any) {
        console.error(`Error fetching user profile (attempt ${i + 1}):`, error);
        if (i === retries - 1) return null;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    return null;
  }, []);

  // Refresh user profile
  const refreshUserProfile = useCallback(async () => {
    if (user) {
      const profile = await fetchUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
      }
    }
  }, [user, fetchUserProfile]);

  // Create user document if it doesn't exist
  const ensureUserDocument = async (firebaseUser: User): Promise<UserProfile | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Create new user document
        const newUserData = {
          fullName: firebaseUser.displayName || '',
          email: firebaseUser.email || null,
          phoneNumber: firebaseUser.phoneNumber || null,
          createdAt: serverTimestamp(),
          isOnboarded: false
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), newUserData);
        
        return {
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || '',
          email: firebaseUser.email || null,
          phoneNumber: firebaseUser.phoneNumber || null,
          createdAt: new Date(),
          isOnboarded: false
        };
      }
      
      // Return existing profile
      return await fetchUserProfile(firebaseUser.uid);
    } catch (error) {
      console.error('Error ensuring user document:', error);
      return null;
    }
  };

  // Handle redirect result on mount
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const profile = await ensureUserDocument(result.user);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Redirect result error:', error);
      }
    };
    handleRedirectResult();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await ensureUserDocument(result.user);
      setUserProfile(profile);
    } catch (error: any) {
      // If popup blocked or COOP issues, use redirect
      if (error.code === 'auth/popup-blocked' || 
          error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/cancelled-popup-request' ||
          error.message?.includes('Cross-Origin-Opener-Policy')) {
        console.log('Popup failed, using redirect...');
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timed out. Please check your connection.')), 10000)
      );
      
      // Prepare data for Firestore (remove uid as it's not stored)
      const { uid, ...updateData } = data as any;
      
      await Promise.race([
        setDoc(doc(db, 'users', user.uid), updateData, { merge: true }),
        timeoutPromise
      ]);
      
      // Update local state immediately
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
      
      // Refresh from server in background
      refreshUserProfile().catch(console.error);
      
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      signInWithGoogle,
      logout,
      updateUserProfile,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
