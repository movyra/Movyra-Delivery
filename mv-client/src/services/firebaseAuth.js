import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
const firebaseConfig = { apiKey: "MOCK_KEY", authDomain: "mock.firebaseapp.com", projectId: "mock", storageBucket: "mock.appspot.com", messagingSenderId: "123", appId: "1:123:web:456" };
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const sendPhoneOTP = async (phone, verifier) => await signInWithPhoneNumber(auth, phone, verifier);
export default app;
