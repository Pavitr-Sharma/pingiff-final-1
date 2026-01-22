import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, RecaptchaVerifier } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚠️ PASTE YOUR FIREBASE CONFIG HERE
// Get this from: Firebase Console → Project Settings → Your Apps → Config
const firebaseConfig = {
  apiKey: "AIzaSyBaFuw33zzZUme7CDUb7dpII3YeKgimN4w",
  authDomain: "pingmereg.firebaseapp.com",
  projectId: "pingmereg",
  storageBucket: "pingmereg.firebasestorage.app",
  messagingSenderId: "1098521383686",
  appId: "1:1098521383686:web:b2c777e80121311a144487",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// RecaptchaVerifier for phone auth (must be called from component)
export const setupRecaptcha = (containerId: string) => {
  return new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved
    },
  });
};

export default app;
