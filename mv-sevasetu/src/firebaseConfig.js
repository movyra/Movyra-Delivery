import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Strict real-time initialization using local environment variables.
// Ensure your .env file contains these exact VITE_ keys.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase Application
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore for live data syncing
export const db = getFirestore(app);

// Initialize Firebase Authentication for strict admin gates
export const auth = getAuth(app);

// Initialize Google Auth Provider for admin OAuth flows
export const googleProvider = new GoogleAuthProvider();