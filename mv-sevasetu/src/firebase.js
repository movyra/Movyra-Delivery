/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Centralized Firebase Initialization.
 * 
 * English: Centralized Firebase Initialization.
 * Hindi: केंद्रीकृत फायरबेस आरंभीकरण।
 * Hinglish: Centralized Firebase Initialization.
 * Marathi: केंद्रीकृत फायरबेस आरंभीकरण.
 * Gujarati: કેન્દ્રીયકૃત ફાયરબેઝ પ્રારંભ.
 * Telugu: కేంద్రీకృత ఫైర్‌బేస్ ప్రారంభం.
 * Tamil: மையப்படுத்தப்பட்ட ஃபயர்பேஸ் துவக்கம்.
 * Kannada: ಕೇಂದ್ರೀಕೃತ ಫೈರ್‌ಬೇಸ್ ಪ್ರಾರಂಭ.
 * Malayalam: കേന്ദ്രീകൃത ഫയർബേസ് സമാരംഭം.
 * Bengali: কেন্দ্রীভূত ফায়ারবেস প্রারম্ভিকরণ।
 * Punjabi: ਕੇਂਦਰੀਕ੍ਰਿਤ ਫਾਇਰਬੇਸ ਸ਼ੁਰੂਆਤ।
 * Odia: କେନ୍ଦ୍ରୀକୃତ ଫାୟାରବେସ୍ ଆରମ୍ଭ।
 * Assamese: কেন্দ্ৰীভূত ফায়াৰবেচ আৰম্ভণি।
 * Urdu: مرکزی فائر بیس ابتداء۔
 * Bhojpuri: केंद्रीकृत फायरबेस आरंभीकरण।
 *
 * SYSTEM COLORS REFERENCE:
 * Primary: #2563EB | Black: #111111 | White: #FFFFFF | Success: #16A34A | Emergency: #DC2626
 */

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