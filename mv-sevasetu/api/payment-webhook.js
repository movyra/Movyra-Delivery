/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Vercel Serverless API Endpoint for processing PayU payment webhooks and updating Firestore.
 * 
 * English: Payment Webhook Processor.
 * Hindi: भुगतान वेबहुक प्रोसेसर।
 * Hinglish: Payment Webhook Processor.
 * Marathi: पेमेंट वेबहुक प्रोसेसर.
 * Gujarati: ચુકવણી વેબહૂક પ્રોસેસર.
 * Telugu: చెల్లింపు వెబ్‌హుక్ ప్రాసెసర్.
 * Tamil: கட்டண வெப்ஹூக் செயலி.
 * Kannada: ಪಾವತಿ ವೆಬ್‌ಹುಕ್ ಪ್ರೊಸೆಸರ್.
 * Malayalam: പേയ്‌മെന്റ് വെബ്‌ഹുക്ക് പ്രോസസർ.
 * Bengali: পেমেন্ট ওয়েবহুক প্রসেসর।
 * Punjabi: ਭੁਗਤਾਨ ਵੈਬਹੁੱਕ ਪ੍ਰੋਸੈਸਰ।
 * Odia: ପେମେଣ୍ଟ ୱେବହୁକ୍ ପ୍ରୋସେସର୍।
 * Assamese: পেমেণ্ট ৱেবহুক প্ৰচেছৰ।
 * Urdu: ادائیگی ویب ہک پروسیسر۔
 * Bhojpuri: भुगतान वेबहुक प्रोसेसर।
 *
 * SYSTEM COLORS REFERENCE:
 * Primary: #2563EB | Black: #111111 | White: #FFFFFF | Success: #16A34A | Emergency: #DC2626
 */

import crypto from 'crypto';
import admin from 'firebase-admin';

// Strictly initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Handle escaped newlines strictly required for Vercel environment variables
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    }),
  });
}

const db = admin.firestore();

export default async function handler(request, response) {
  // Strictly enforce POST method from the payment gateway
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { txnid, status, amount, hash, key, email, productinfo, firstname, udf1 } = request.body;
    const salt = process.env.PAYU_SALT;

    // Strictly verify the payment payload using reverse hashing
    // PayU Reverse Hash Formula: salt|status||||||udf1|email|firstname|productinfo|amount|txnid|key
    const hashString = `${salt}|${status}||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const generatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    if (hash !== generatedHash) {
      console.error('Security Error: Invalid payment hash detected.');
      return response.status(400).json({ error: 'Security verification failed.' });
    }

    // 1. Update the immutable transactions collection
    const transactionRef = db.collection('transactions').doc(txnid);
    await transactionRef.set({
      status: status,
      amount: amount,
      email: email,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // 2. Update the organization profile if payment is successful
    if (status === 'success') {
      // udf1 strictly contains the userId (organization ID) passed during the client payment initiation
      const userId = udf1; 
      if (userId) {
        const userRef = db.collection('users').doc(userId);
        
        // Calculate subscription expiration strictly (1 year from activation)
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);

        await userRef.update({
          paymentStatus: 'verified',
          planTier: productinfo || 'Premium',
          planExpiresAt: admin.firestore.Timestamp.fromDate(expirationDate)
        });
      }
    }

    // Strictly redirect user to the frontend success or failure page
    const redirectDomain = process.env.FRONTEND_URL || 'https://msevasetu.web.app';
    const redirectUrl = status === 'success' 
      ? `${redirectDomain}/payment-status?status=success`
      : `${redirectDomain}/payment-status?status=failure`;

    // Issue standard HTTP 302 redirect back to the client application
    response.redirect(302, redirectUrl);

  } catch (error) {
    console.error('System Error: Payment processing failure.', error);
    response.status(500).json({ error: 'Internal system error during payment processing.' });
  }
}