/**
 * SYSTEM DOCUMENTATION / PAYU SECURE HASH GENERATOR & 14-LANGUAGE TRANSLATION
 * Context: Secure Payment Gateway Processing.
 * Security: Merchant Salt is strictly hidden in Vercel Environment Variables.
 * Output: SHA-512 Hash required by PayU authorization.
 * Syntax: Strict CommonJS for Vercel Node.js compatibility.
 */

const crypto = require('crypto');

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

module.exports = async function (req, res) {
    // 1. AGGRESSIVE CORS HEADERS FOR PREFLIGHT BYPASS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // 2. IMMEDIATE PREFLIGHT RESOLUTION
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 3. STRICT METHOD VALIDATION
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Require POST method.' });
    }

    // 4. PAYLOAD EXTRACTION
    const { txnid, amount, productinfo, firstname, email, lang = 'en' } = req.body;
    
    // 5. LANGUAGE DICTIONARY RESOLUTION
    const currentT = TRANSLATIONS[lang] || TRANSLATIONS['en'];

    // 6. STRICT PARAMETER VALIDATION
    if (!txnid || !amount || !productinfo || !firstname || !email) {
        return res.status(400).json({ error: currentT.error, code: 400 });
    }

    // 7. SECURE ENVIRONMENT VARIABLE EXTRACTION
    const merchantKey = process.env.PAYU_MERCHANT_KEY;
    const merchantSalt = process.env.PAYU_MERCHANT_SALT;

    if (!merchantKey || !merchantSalt) {
        console.error('CRITICAL ERROR: PayU Merchant Configuration Missing in Vercel Environment.');
        return res.status(500).json({ error: 'Internal Server Configuration Error.', code: 500 });
    }

    try {
        // 8. STRICT PAYU HASH SEQUENCE ASSEMBLY (key|txnid|amount|productinfo|firstname|email|udf1...udf10|salt)
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

        // 9. CRYPTOGRAPHIC SHA-512 HASH GENERATION
        const generatedHash = crypto.createHash('sha512').update(hashSequence).digest('hex');

        // 10. SECURE OUTPUT TO FRONTEND
        return res.status(200).json({
            success: true,
            hash: generatedHash,
            message: currentT.success
        });

    } catch (error) {
        console.error('Cryptographic Generation Error:', error);
        return res.status(500).json({ error: 'Transaction validation processing failed.', code: 500 });
    }
};