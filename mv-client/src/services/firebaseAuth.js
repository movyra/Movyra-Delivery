import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

/**
 * Movyra Firebase Configuration
 * Pulls credentials securely from Vite environment variables.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firebase Cloud Messaging
export const messaging = getMessaging(app);

/**
 * Initializes the Invisible reCAPTCHA required for Phone Auth.
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
        // Response expired. Ask user to solve reCAPTCHA again.
        console.warn("reCAPTCHA expired");
      }
    });
  }
  return window.recaptchaVerifier;
};

/**
 * Sends the OTP to the provided phone number.
 * @param {string} phoneNumber - Formatted phone number (e.g., +919876543210).
 * @param {object} appVerifier - The RecaptchaVerifier instance.
 * @returns {Promise<object>} confirmationResult - Used to confirm the OTP later.
 */
export const sendPhoneOTP = async (phoneNumber, appVerifier) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return confirmationResult;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

/**
 * Verifies the OTP entered by the user.
 * @param {object} confirmationResult - The result object from sendPhoneOTP.
 * @param {string} otpCode - The 4 or 6 digit code entered by the user.
 * @returns {Promise<object>} userCredential - The authenticated user credentials.
 */
export const verifyOTP = async (confirmationResult, otpCode) => {
  try {
    const result = await confirmationResult.confirm(otpCode);
    return result;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

/**
 * Requests Notification Permissions from the user device
 * and generates the FCM registration token.
 * This token is sent to the Rust backend to target push notifications.
 */
export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      // VAPID key is required for web push notifications. Add to .env.local if using web push.
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
    });
    
    if (currentToken) {
      return currentToken;
    } else {
      console.warn('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    return null;
  }
};

/**
 * Listener for foreground push notifications.
 * Triggered when the app is actively open on the user's screen.
 */
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export default app;