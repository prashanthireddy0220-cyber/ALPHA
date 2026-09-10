import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBc4KCxlryb4Wp2Wy8YKHLHdpgnoCW-FJc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "alpha-2d5bc.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "alpha-2d5bc",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "alpha-2d5bc.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "547748155227",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:547748155227:web:7fbe53a05e8a5741e1d47e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GVRFGR1M33"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export { app, auth, analytics };
