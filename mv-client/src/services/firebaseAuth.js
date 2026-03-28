import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// Real Firebase Configuration pulled securely from Vite environment variables
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

/**
 * Initializes the Invisible reCAPTCHA required for Phone Auth.
 * This proves to Google that a human is requesting the SMS.
 * @param {string} containerId - The HTML element ID to attach the recaptcha to.
 */
export const setupRecaptcha = (containerId) => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        console.log("reCAPTCHA verified successfully");
      },
      'expired-callback': () => {
        // Response expired. Clear to allow re-solving.
        console.warn("reCAPTCHA expired");
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    });
  }
  return window.recaptchaVerifier;
};

/**
 * Sends the OTP to the provided phone number.
 * @param {string} phone - Formatted phone number (e.g., +919876543210).
 * @param {object} verifier - The RecaptchaVerifier instance.
 * @returns {Promise<object>} confirmationResult - Used to confirm the OTP later.
 */
export const sendPhoneOTP = async (phone, verifier) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phone, verifier);
    return confirmationResult;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

export default app;