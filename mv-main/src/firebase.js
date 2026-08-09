import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  // Replace these with your exact Firebase Web API keys from Project Settings
  apiKey: "AIzaSyA0LhdDnfbwiZvgRJq5XTV5IfgcQ-9-wOw",
  authDomain: "movyra-customer-prod.firebaseapp.com",
  projectId: "movyra-customer-prod",
  storageBucket: "movyra-customer-prod.firebasestorage.app",
  messagingSenderId: "1087124236242",
  appId: "1:1087124236242:web:5e54116366ed38b9fd4a0b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);