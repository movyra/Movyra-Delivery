/**
 * SYSTEM DOCUMENTATION / PAYU SECURE HASH GENERATOR & 14-LANGUAGE TRANSLATION
 * Context: Secure Payment Gateway Processing.
 * Security: Dynamic Credential Routing (Test vs Production).
 * Output: SHA-512 Hash required by PayU authorization.
 * Syntax: Strict ES Module for Vite Project Compatibility.
 */

import crypto from 'crypto';

const TRANSLATIONS = {
    en: { success: "Payment secure validation successful.", error: "Invalid payment parameters." },
    hi: { success: "भुगतान सुरक्षित सत्यापन सफल रहा।", error: "अमान्य भुगतान पैरामीटर।" },
    hinglish: { success: "Payment secure validation successful raha.", error: "Invalid payment parameters." },
    mr: { success: "पेमेंट सुरक्षित प्रमाणीकरण यशस्वी.", error: "अवैध पेमेंट पॅरामीटर्स." },
    gu: { success: "ચુકવણી સુરક્ષિત માન્યતા સફળ.", error: "અમાન્ય ચુકવણી પરિમાણો." },
    te: { success: "చెల్లింపు సురక్షిత ధృవీకరణ విజయవంతమైంది.", error: "చెల్లని చెల్లింపు పారామితులు." },
    ta: { success: "கட்டண பாதுகாப்பான சரிபார்ப்பு வெற்றிகரமானது.", error: "தவறான கட்டண அளவுருக்கள்." },
    pa: { success: "ਭੁਗਤਾਨ ਸੁਰੱਖਿਅਤ ਪ੍ਰਮਾਣਿਕਤਾ ਸਫਲ।", error: "ਅਵੈਧ ਭੁਗਤਾਨ ਪੈਰਾਮੀਟਰ।" },
    bho: { success: "भुगतान सुरक्षित सत्यापन सफल भइल।", error: "अमान्य भुगतान पैरामीटर।" },
    bn: { success: "পেমেন্ট সুরক্ষিত বৈধতা সফল।", error: "অবৈধ পেমেন্ট পরামিতি।" },
    kn: { success: "ಪಾವತಿ ಸುರಕ್ಷಿತ ಮೌಲ್ಯೀಕರಣ ಯಶಸ್ವಿಯಾಗಿದೆ.", error: "ಅಮಾನ್ಯ ಪಾವತಿ ನಿಯತಾಂಕಗಳು." },
    ml: { success: "പേയ്‌മെന്റ് സുരക്ഷിത മൂല്യനിർണ്ണയം വിജയകരം.", error: "അസാധുവായ പേയ്‌മെന്റ് പാരാമീറ്ററുകൾ." },
    or: { success: "ପେମେଣ୍ଟ ସୁରକ୍ଷିତ ବୈଧତା ସଫଳ ହେଲା।", error: "ଅବୈଧ ପେମେଣ୍ଟ ପାରାମିଟର।" },
    as: { success: "পেমেন্ট সুৰক্ষিত বৈধতা সফল।", error: "অবৈধ পেমেন্ট পেৰামিটাৰ।" }
};

export default async function handler(req, res) {
    // 1. Redundant CORS fallback (Primary CORS handled strictly by vercel.json)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

    // 2. Preflight Request Resolution
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. Strict Method Validation
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Require POST method.', code: 405 });
    }

    try {
        // 4. Safe Payload Extraction
        let body = req.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch (e) { /* Ignore non-JSON strings */ }
        }

        const { txnid, amount, productinfo, firstname, email, lang = 'en' } = body || {};
        
        // 5. Language Dictionary Resolution
        const currentT = TRANSLATIONS[lang] || TRANSLATIONS['en'];

        // 6. Strict Parameter Validation
        if (!txnid || !amount || !productinfo || !firstname || !email) {
            return res.status(400).json({ error: currentT.error, code: 400 });
        }

        // 7. SECURE DYNAMIC CREDENTIAL ROUTING (Fixes the Firewall Block)
        // Strictly routes to PayU Test credentials if the testing email is detected.
        const isTestMode = email === 'testcodecfg@gmail.com';
        
        const merchantKey = isTestMode ? 'gtKFFx' : process.env.PAYU_MERCHANT_KEY;
        const merchantSalt = isTestMode ? 'eCwWELxi' : process.env.PAYU_MERCHANT_SALT;

        if (!merchantKey || !merchantSalt) {
            console.error('CRITICAL ERROR: PayU Merchant Configuration Missing in Vercel Environment.');
            return res.status(500).json({ error: 'Internal Server Configuration Error.', code: 500 });
        }

        // 8. Strict PayU Hash Sequence Assembly (key|txnid|amount|productinfo|firstname|email|udf1...udf10|salt)
        const hashSequence = [
            merchantKey, 
            txnid, 
            amount, 
            productinfo, 
            firstname, 
            email, 
            "", "", "", "", "", "", "", "", "", "", // 10 Empty User Defined Fields (UDFs)
            merchantSalt
        ].join('|');

        // 9. Cryptographic SHA-512 Hash Generation
        const generatedHash = crypto.createHash('sha512').update(hashSequence).digest('hex');

        // 10. Secure Output to Frontend
        return res.status(200).json({
            success: true,
            hash: generatedHash,
            message: currentT.success
        });

    } catch (error) {
        console.error('Cryptographic Generation Error:', error);
        return res.status(500).json({ error: 'Transaction validation processing failed.', code: 500 });
    }
}