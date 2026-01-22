import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
  ConfirmationResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, setupRecaptcha } from '@/lib/firebase';

interface UserProfile {
  uid: string;
  fullName: string;
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
  sendOTP: (phoneNumber: string, recaptchaContainerId: string) => Promise<ConfirmationResult>;
  verifyOTP: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  checkUserOnboarded: () => Promise<boolean>;
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

  // Fetch user profile from Firestore with retry logic
  const fetchUserProfile = async (uid: string, retries = 3): Promise<UserProfile | null> => {
    for (let i = 0; i < retries; i++) {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          return {
            uid,
            fullName: data.fullName || '',
            email: data.email || null,
            phoneNumber: data.phoneNumber || null,
            createdAt: data.createdAt?.toDate() || new Date(),
            isOnboarded: data.isOnboarded || false
          };
        }
        return null;
      } catch (error: any) {
        console.error(`Error fetching user profile (attempt ${i + 1}):`, error);
        if (i === retries - 1) return null;
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    return null;
  };

  // Create user document if it doesn't exist
  const ensureUserDocument = async (user: User): Promise<void> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          fullName: user.displayName || '',
          email: user.email,
          phoneNumber: user.phoneNumber,
          createdAt: serverTimestamp(),
          isOnboarded: false
        });
      }
    } catch (error) {
      console.error('Error ensuring user document:', error);
    }
  };

  // Handle redirect result on mount
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          await ensureUserDocument(result.user);
          const profile = await fetchUserProfile(result.user.uid);
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const profile = await fetchUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign In - Try popup first, fallback to redirect
  const signInWithGoogle = async () => {
    try {
      // Try popup first
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await ensureUserDocument(user);
      const profile = await fetchUserProfile(user.uid);
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

  // Phone OTP - Send
  const sendOTP = async (phoneNumber: string, recaptchaContainerId: string) => {
    try {
      const recaptchaVerifier = setupRecaptcha(recaptchaContainerId);
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  };

  // Phone OTP - Verify
  const verifyOTP = async (confirmationResult: ConfirmationResult, otp: string) => {
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(doc(db, 'users', user.uid), {
          fullName: '',
          email: null,
          phoneNumber: user.phoneNumber,
          createdAt: serverTimestamp(),
          isOnboarded: false
        });
      }
      
      const profile = await fetchUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Verify OTP error:', error);
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

  // Update user profile with timeout
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      // Set timeout for Firestore operation
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timed out')), 10000)
      );
      
      await Promise.race([
        setDoc(doc(db, 'users', user.uid), data, { merge: true }),
        timeoutPromise
      ]);
      
      // Update local state immediately with the new data
      setUserProfile(prev => prev ? { ...prev, ...data } : null);
      
      // Fetch updated profile in background (don't block)
      fetchUserProfile(user.uid).then(profile => {
        if (profile) setUserProfile(profile);
      }).catch(console.error);
      
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  // Check if user completed onboarding
  const checkUserOnboarded = async (): Promise<boolean> => {
    if (!user) return false;
    const profile = await fetchUserProfile(user.uid);
    return profile?.isOnboarded || false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      signInWithGoogle,
      sendOTP,
      verifyOTP,
      logout,
      updateUserProfile,
      checkUserOnboarded
    }}>
      {children}
    </AuthContext.Provider>
  );
};
