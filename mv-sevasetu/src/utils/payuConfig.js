/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: PayU Payment Gateway Configuration and Environment Routing.
 * 
 * English: Payment Gateway Configuration.
 * Hindi: भुगतान गेटवे कॉन्फ़िगरेशन।
 * Hinglish: Payment Gateway Configuration.
 * Marathi: पेमेंट गेटवे कॉन्फिगरेशन.
 * Gujarati: ચુકવણી ગેટવે ગોઠવણી.
 * Telugu: చెల్లింపు గేట్‌వే కాన్ఫిగరేషన్.
 * Tamil: கட்டண நுழைவாயில் கட்டமைப்பு.
 * Kannada: ಪಾವತಿ ಗೇಟ್‌ವೇ ಕಾನ್ಫಿಗರೇಶನ್.
 * Malayalam: പേയ്‌മെന്റ് ഗേറ്റ്‌വേ കോൺഫിഗറേഷൻ.
 * Bengali: পেমেন্ট গেটওয়ে কনফিগারেশন।
 * Punjabi: ਭੁਗਤਾਨ ਗੇਟਵੇ ਸੰਰਚਨਾ।
 * Odia: ପେମେଣ୍ଟ ଗେଟୱେ କନଫିଗରେସନ୍।
 * Assamese: পেমেণ্ট গেটৱে কনফিগাৰেচন।
 * Urdu: ادائیگی گیٹ وے کنفیگریشن۔
 * Bhojpuri: भुगतान गेटवे कॉन्फ़िगरेशन।
 */

// Strict PayU Merchant Credentials (mapped from environment variables)
export const PAYU_CREDENTIALS = {
  MERCHANT_KEY: import.meta.env.VITE_PAYU_MERCHANT_KEY || 'LIVE_MERCHANT_KEY',
  SALT: import.meta.env.VITE_PAYU_SALT || 'LIVE_SALT_KEY'
};

// Strict Callback Routing URLs (pointing to the production Firebase Hosting environment)
export const PAYU_CALLBACKS = {
  SUCCESS_URL: 'https://msevasetu.web.app/payment-status?status=success',
  FAILURE_URL: 'https://msevasetu.web.app/payment-status?status=failure'
};

/**
 * Strictly evaluates the user role to determine the correct PayU environment.
 * Super Admins are routed to the test environment for auditing and bypass checks.
 * All other organizations are strictly routed to the production secure environment.
 * 
 * @param {boolean} isSuperAdmin - Extracted from AuthContext
 * @returns {string} - The correct PayU API endpoint URL
 */
export const getPayUEndpoint = (isSuperAdmin) => {
  const TEST_URL = 'https://test.payu.in/_payment';
  const PROD_URL = 'https://secure.payu.in/_payment';

  // Apply strict routing logic based on administrative privilege
  if (isSuperAdmin === true) {
    return TEST_URL;
  }
  
  return PROD_URL;
};