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
import { getFirestore, doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';

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
const db = getFirestore(app);

// Utility to adhere to strict Firestore path rules for the Immersive Canvas
const getAppId = () => {
  if (typeof window !== 'undefined' && window.__app_id) return window.__app_id;
  if (typeof __app_id !== 'undefined') return __app_id;
  return 'default-app-id';
};

// ============================================================================
// SECTION 2: Persistence Enforcement (STRICT REDIRECT LOOP FIX)
// Explicitly ensures 'browserLocalPersistence' is established and awaited
// before any auth actions are performed. This prevents the "null user" flicker
// during browser redirects.
// ============================================================================
let persistencePromise = null;

export const initPersistence = async () => {
  if (!persistencePromise) {
    persistencePromise = setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("Movyra Auth Error [Persistence]:", error);
      persistencePromise = null; // Reset on failure to allow retry
    });
  }
  return persistencePromise;
};

// Fire the persistence enforcement immediately upon module load
initPersistence();

// ============================================================================
// SECTION 3: Global Security & Fraud Detection Logging (FEATURE 1)
// ============================================================================
export const logDeviceMetadata = async (user) => {
  if (!user) return;
  try {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const language = navigator.language;
    const deviceMemory = navigator.deviceMemory || 'unknown';
    
    // Log isolated session data for fraud detection and security audits
    const sessionRef = collection(db, 'artifacts', getAppId(), 'users', user.uid, 'sessions');
    await addDoc(sessionRef, {
      userAgent,
      platform,
      language,
      deviceMemory,
      loginTimestamp: serverTimestamp(),
      status: 'active'
    });

    // Update main user document with the latest metadata
    const userRef = doc(db, 'artifacts', getAppId(), 'users', user.uid);
    await setDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      lastDevicePlatform: platform,
      email: user.email
    }, { merge: true });

  } catch (error) {
    console.error("Fraud Detection Logging Error:", error);
  }
};

export const logoutFromAllDevices = async () => {
  const user = auth.currentUser;
  if (!user) return;
  
  try {
    // Flag all active sessions as revoked in Firestore
    // In production, Firebase Security Rules intercept this timestamp to block old tokens
    const userRef = doc(db, 'artifacts', getAppId(), 'users', user.uid);
    await setDoc(userRef, {
      sessionsRevokedAt: serverTimestamp()
    }, { merge: true });
    
    console.info("Global Security Flag Set: All remote device sessions revoked.");
  } catch (error) {
    console.error("Global Logout Error:", error);
    throw error;
  }
};

// ============================================================================
// SECTION 4: Standard Email Registration
// ============================================================================
export const registerWithEmail = async (email, password) => {
  try {
    await initPersistence();
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await logDeviceMetadata(userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Movyra Auth Error [Registration]:", error);
    throw error;
  }
};

// ============================================================================
// SECTION 5: Standard Email Authentication
// ============================================================================
export const loginWithEmail = async (email, password) => {
  try {
    await initPersistence();
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    await logDeviceMetadata(userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Movyra Auth Error [Login]:", error);
    throw error;
  }
};

// ============================================================================
// SECTION 6: Google Single Sign-On (SSO)
// ============================================================================
export const signInWithGooglePopup = async () => {
  try {
    await initPersistence();
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    await logDeviceMetadata(userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Movyra Auth Error [Google SSO]:", error);
    throw error;
  }
};

export default app;