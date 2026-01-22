import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithPopup,
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

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
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
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

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

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(doc(db, 'users', user.uid), {
          fullName: user.displayName || '',
          email: user.email,
          phoneNumber: user.phoneNumber,
          createdAt: serverTimestamp(),
          isOnboarded: false
        });
      }
      
      const profile = await fetchUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
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

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      await setDoc(doc(db, 'users', user.uid), data, { merge: true });
      const profile = await fetchUserProfile(user.uid);
      setUserProfile(profile);
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
