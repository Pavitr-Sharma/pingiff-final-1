import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, RecaptchaVerifier } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Firebase Config
// const firebaseConfig = {
//   apiKey: "AIzaSyBvmo07xwtxvhs1Jbk4HrCrtS2B0QhQ-Ck",
//   authDomain: "pingme-2a544.firebaseapp.com",
//   projectId: "pingme-2a544",
//   storageBucket: "pingme-2a544.firebasestorage.app",
//   messagingSenderId: "302920931774",
//   appId: "1:302920931774:web:e6710da2960ba1089081ef",
//   measurementId: "G-5WDX03B74N",
//   databaseURL: "https://pingme-2a544-default-rtdb.firebaseio.com",
// };

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

// RecaptchaVerifier singleton for phone auth
let recaptchaVerifier: RecaptchaVerifier | null = null;

export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
  if (recaptchaVerifier) {
    return recaptchaVerifier;
  }
  
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {},
    "expired-callback": () => {
      console.log("Recaptcha expired, resetting...");
      clearRecaptcha();
    },
  });
  
  return recaptchaVerifier;
};

export const clearRecaptcha = (): void => {
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch (e) {
      console.warn("Error clearing recaptcha:", e);
    }
    recaptchaVerifier = null;
  }
};

export default app;
