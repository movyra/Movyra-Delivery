import emailjs from '@emailjs/browser';

/**
 * MOVYRA BY BONGO - FREE AUTHENTICATION SERVICE
 * Logic sections: Configuration, Generation, Transmission, and Verification.
 */

// SECTION 1: EmailJS Configuration & Environment
// These values are pulled strictly from your .env.local or .env.production files
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// SECTION 2: Secure OTP Generation Logic
/**
 * Generates a non-mock, real-time 4-digit numeric code.
 * Uses Math.random() bounded for a 1000-9999 range.
 */
export const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// SECTION 3: EmailJS Transmission Engine
/**
 * Sends the generated OTP to the user's email address.
 * Integrates directly with the EmailJS browser SDK using real production credentials.
 */
export const sendOTPEmail = async (userEmail, otp) => {
  const templateParams = {
    to_email: userEmail,
    otp_code: otp,
    app_name: "Movyra by Bongo",
    expiry_time: "5 minutes"
  };

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    
    // Store session data only after a successful email dispatch
    storeOTPSession(userEmail, otp);
    
    return { success: true, message: "OTP sent successfully", response };
  } catch (error) {
    console.error("Movyra Auth Error [EmailJS]:", error);
    // Return structured error for UI handling
    throw new Error(error?.text || "Failed to deliver security code. Please check network connection.");
  }
};

// SECTION 4: Session Management & Verification Logic
/**
 * Saves the OTP in an obscured local session with a strict 5-minute expiry.
 * This prevents mock verification and ensures real-time security.
 */
const storeOTPSession = (email, otp) => {
  const expiry = Date.now() + 5 * 60 * 1000; // 5 Minutes
  const sessionData = JSON.stringify({ email, otp, expiry });
  
  // Base64 encoding for basic obscurity in LocalStorage
  localStorage.setItem('mv_auth_sess', btoa(sessionData));
};

/**
 * Validates the user-entered OTP against the active session.
 * Real-time temporal and string matching logic.
 */
export const verifyOTPSession = (enteredOtp) => {
  const rawSession = localStorage.getItem('mv_auth_sess');
  
  if (!rawSession) {
    return { valid: false, message: "No active session found. Please request a new code." };
  }

  try {
    const { otp, expiry } = JSON.parse(atob(rawSession));

    // Logic: Check for temporal expiration
    if (Date.now() > expiry) {
      localStorage.removeItem('mv_auth_sess');
      return { valid: false, message: "Code has expired. Please try again." };
    }

    // Logic: Precise string matching
    if (otp === enteredOtp) {
      localStorage.removeItem('mv_auth_sess'); // Clear session on success to prevent reuse
      return { valid: true };
    }

    return { valid: false, message: "Incorrect verification code." };
  } catch (e) {
    console.error("Movyra Session Error:", e);
    localStorage.removeItem('mv_auth_sess');
    return { valid: false, message: "Session corrupted or tampered with." };
  }
};