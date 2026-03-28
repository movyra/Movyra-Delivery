import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
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
// SECTION 2: Deterministic Hidden Password Engine
// Generates a complex, repeatable password based on the user's email.
// This allows a "passwordless" OTP experience on Firebase's 100% free tier.
// ============================================================================
const generateHiddenPassword = (email) => {
  // Combine a static salt with email properties to ensure Firebase accepts it
  // as a strong password, while keeping it consistently reproducible per user.
  const sanitizedEmail = email.trim().toLowerCase();
  return `Movyra!_${sanitizedEmail.length}_${sanitizedEmail.substring(0, 4)}@2026_Secure_Bongo`;
};

// ============================================================================
// SECTION 3: Free Tier Account Creation
// Registers a brand new user using their email and the auto-generated password.
// ============================================================================
export const registerUserWithEmail = async (email) => {
  try {
    const hiddenPassword = generateHiddenPassword(email);
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), hiddenPassword);
    return userCredential.user;
  } catch (error) {
    console.error("Movyra Auth Error [Registration]:", error);
    throw error;
  }
};

// ============================================================================
// SECTION 4: Free Tier Account Authentication
// Logs in an existing user securely using their email and hidden password.
// ============================================================================
export const loginUserWithEmail = async (email) => {
  try {
    const hiddenPassword = generateHiddenPassword(email);
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), hiddenPassword);
    return userCredential.user;
  } catch (error) {
    console.error("Movyra Auth Error [Login]:", error);
    throw error;
  }
};

// ============================================================================
// SECTION 5: Master Authentication Controller
// Seamlessly attempts to log the user in. If the account doesn't exist,
// it automatically creates it. This is triggered AFTER successful OTP verification.
// ============================================================================
export const authenticateSeamlessly = async (email) => {
  try {
    // Attempt Login First
    const user = await loginUserWithEmail(email);
    return { user, isNewUser: false };
  } catch (error) {
    // If user does not exist (invalid-credential is the modern Firebase error for this)
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      console.log("User not found in system. Creating new free-tier account...");
      const newUser = await registerUserWithEmail(email);
      return { user: newUser, isNewUser: true };
    }
    // Throw any other genuine errors (e.g., network failure, account disabled)
    throw error;
  }
};

export default app;