import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

// ============================================================================
// SECTION 1: Firebase Configuration & Initialization
// Real Firebase Configuration pulled securely from Vite environment variables.
// ============================================================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ============================================================================
// SECTION 2: Persistence Enforcement (STRICT REDIRECT LOOP FIX)
// Explicitly enforces 'browserLocalPersistence' so that the session
// survives browser redirects and app reloads.
// ============================================================================
const enforcePersistence = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.error("Movyra Auth Error [Persistence]:", error);
  }
};

// Fire the persistence enforcement immediately upon module load
enforcePersistence();

// ============================================================================
// SECTION 3: Standard Email Registration
// Registers a brand new user using their verified email and password.
// ============================================================================
export const registerWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    return userCredential.user;
  } catch (error) {
    console.error("Movyra Auth Error [Registration]:", error);
    throw error;
  }
};

// ============================================================================
// SECTION 4: Standard Email Authentication
// Logs in an existing user securely using their email and password.
// ============================================================================
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return userCredential.user;
  } catch (error) {
    console.error("Movyra Auth Error [Login]:", error);
    throw error;
  }
};

// ============================================================================
// SECTION 5: Google Single Sign-On (SSO)
// Seamlessly authenticates the user via a secure Google OAuth popup.
// ============================================================================
export const signInWithGooglePopup = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error) {
    console.error("Movyra Auth Error [Google SSO]:", error);
    throw error;
  }
};

export default app;