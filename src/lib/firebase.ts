import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, RecaptchaVerifier } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBvmo07xwtxvhs1Jbk4HrCrtS2B0QhQ-Ck",
  authDomain: "pingme-2a544.firebaseapp.com",
  projectId: "pingme-2a544",
  storageBucket: "pingme-2a544.firebasestorage.app",
  messagingSenderId: "302920931774",
  appId: "1:302920931774:web:e6710da2960ba1089081ef",
  measurementId: "G-5WDX03B74N",
  databaseURL: "https://pingme-2a544-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firestore persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Firestore persistence not supported');
  }
});

// RecaptchaVerifier for phone auth
export const setupRecaptcha = (containerId: string) => {
  return new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {},
  });
};

export default app;
