/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Backend Cloud Functions for PayU hash generation and secure webhooks.
 * 
 * English: Backend Cloud Functions for Secure Payments.
 * Hindi: सुरक्षित भुगतान के लिए बैकएंड क्लाउड फ़ंक्शंस।
 * Hinglish: Secure payments ke liye backend cloud functions.
 * Marathi: सुरक्षित पेमेंटसाठी बॅकएंड क्लाउड फंक्शन्स.
 * Gujarati: સુરક્ષિત ચુકવણીઓ માટે બેકએન્ડ ક્લાઉડ કાર્યો.
 * Telugu: సురక్షిత చెల్లింపుల కోసం బ్యాకెండ్ క్లౌడ్ ఫంక్షన్‌లు.
 * Tamil: பாதுகாப்பான கட்டணங்களுக்கான பின்தள கிளவுட் செயல்பாடுகள்.
 * Kannada: ಸುರಕ್ಷಿತ ಪಾವತಿಗಳಿಗಾಗಿ ಬ್ಯಾಕೆಂಡ್ ಕ್ಲೌಡ್ ಕಾರ್ಯಗಳು.
 * Malayalam: സുരക്ഷിത പേയ്‌മെന്റുകൾക്കായുള്ള ബാക്കെൻഡ് ക്ലൗഡ് ഫംഗ്‌ഷനുകൾ.
 * Bengali: নিরাপদ পেমেন্টের জন্য ব্যাকএন্ড ক্লাউড ফাংশন।
 * Punjabi: ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨਾਂ ਲਈ ਬੈਕਐਂਡ ਕਲਾਉਡ ਫੰਕਸ਼ਨ।
 * Odia: ସୁରକ୍ଷିତ ପେମେଣ୍ଟ ପାଇଁ ବ୍ୟାକଏଣ୍ଡ୍ କ୍ଲାଉଡ୍ ଫଙ୍କସନ୍।
 * Assamese: সুৰক্ষিত পেমেণ্টৰ বাবে বেকএণ্ড ক্লাউড ফাংচন।
 * Urdu: محفوظ ادائیگیوں کے لیے بیک اینڈ کلاؤڈ فنکشنز۔
 * Bhojpuri: सुरक्षित भुगतान खातिर बैकएंड क्लाउड फंक्शंस।
 * 
 * STRICT BRAND COLOR COMPLIANCE (FOR SYSTEM EMAILS/WEBHOOK RESPONSES):
 * Primary: #2563EB | Black: #111111 | White: #FFFFFF | Success: #16A34A | Emergency: #DC2626
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest, onCall, HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const crypto = require("crypto");
const admin = require("firebase-admin");

// Initialize Firebase Admin for secure database access
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// Existing global options preserved strictly
setGlobalOptions({ maxInstances: 10 });

// Secure Environment Variables (Must be set in Firebase Functions Config)
const PAYU_SALT = process.env.PAYU_SALT || "LIVE_SALT_KEY";
const PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY || "LIVE_MERCHANT_KEY";

/**
 * 1. Secure Hash Generation (Callable Function for Checkout.jsx)
 * Strictly generates the SHA-512 hash required by PayU before redirect.
 */
exports.generatePayUHash = onCall((request) => {
  const { txnid, amount, productinfo, firstname, email } = request.data;
  
  if (!txnid || !amount || !productinfo || !firstname || !email) {
    throw new HttpsError('invalid-argument', 'Missing required payment parameters.');
  }

  // PayU Strict Hash Sequence: key|txnid|amount|productinfo|firstname|email|||||||||||salt
  const hashString = `${PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_SALT}`;
  
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');
  
  return { hash: hash };
});

/**
 * 2. Secure PayU Webhook (Server-to-Server Callback)
 * Strictly processes the payment confirmation, verifies the reverse hash, and upgrades the organization.
 */
exports.payuWebhook = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { txnid, status, amount, productinfo, firstname, email, hash, additionalCharges } = req.body;

  // PayU Strict Reverse Hash Verification
  let hashString = '';
  if (additionalCharges) {
    hashString = `${additionalCharges}|${PAYU_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_MERCHANT_KEY}`;
  } else {
    hashString = `${PAYU_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_MERCHANT_KEY}`;
  }

  const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

  // Verify signature authenticity
  if (calculatedHash !== hash) {
    logger.error(`Hash mismatch for transaction: ${txnid}`);
    res.status(400).send('Tampered Request Detected');
    return;
  }

  try {
    // Record raw transaction securely
    const txnRef = db.collection('transactions').doc(txnid);
    await txnRef.set({
      txnid: txnid,
      status: status,
      amount: amount,
      email: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      gateway: 'payu'
    }, { merge: true });

    // If payment is successful, upgrade the organization profile
    if (status === 'success') {
      const usersRef = db.collection('users');
      const q = usersRef.where('email', '==', email).limit(1);
      const snapshot = await q.get();

      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        await userDoc.ref.update({
          paymentStatus: 'verified',
          verificationStatus: 'verified',
          lastPaymentDate: admin.firestore.FieldValue.serverTimestamp()
        });
        logger.info(`Organization ${email} upgraded successfully.`);
      }
    }

    // Acknowledge receipt to PayU strictly
    res.status(200).send('Webhook Processed');
  } catch (error) {
    logger.error('Database write failed during webhook execution', error);
    res.status(500).send('Internal Server Error');
  }
});