import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, RecaptchaVerifier } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA29m_ZE0EEm5nAqLYVkjtSKU9rSSTts2Q",
  authDomain: "ping-me-eedd0.firebaseapp.com",
  projectId: "ping-me-eedd0",
  storageBucket: "ping-me-eedd0.firebasestorage.app",
  messagingSenderId: "441441409182",
  appId: "1:441441409182:web:d2ce715476830aaf9ac38f",
  measurementId: "G-JLHT8LK9HV",
  databaseURL: "https://ping-me-eedd0-default-rtdb.firebaseio.com",
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
  if (err.code === "failed-precondition") {
    console.warn("Firestore persistence failed: Multiple tabs open");
  } else if (err.code === "unimplemented") {
    console.warn("Firestore persistence not supported");
  }
});

// Store recaptcha verifier instance to prevent multiple instances
let recaptchaVerifierInstance: RecaptchaVerifier | null = null;

// RecaptchaVerifier for phone auth - improved version
export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
  // Clear any existing recaptcha instance
  if (recaptchaVerifierInstance) {
    try {
      recaptchaVerifierInstance.clear();
    } catch (e) {
      console.warn("Could not clear existing recaptcha:", e);
    }
    recaptchaVerifierInstance = null;
  }

  // Clear the container element
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '';
  }

  // Create new instance
  recaptchaVerifierInstance = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      console.log("reCAPTCHA verified");
    },
    'expired-callback': () => {
      console.log("reCAPTCHA expired");
      recaptchaVerifierInstance = null;
    }
  });

  return recaptchaVerifierInstance;
};

// Clear recaptcha (call when component unmounts or after verification)
export const clearRecaptcha = () => {
  if (recaptchaVerifierInstance) {
    try {
      recaptchaVerifierInstance.clear();
    } catch (e) {
      console.warn("Could not clear recaptcha:", e);
    }
    recaptchaVerifierInstance = null;
  }
};

export default app;