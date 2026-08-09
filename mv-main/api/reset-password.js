const admin = require('firebase-admin');
const { Resend } = require('resend');

export default async function handler(req, res) {
    // 1. Permanent CORS Fix (Must execute first to prevent phantom CORS crashes)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // 2. Handle Preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. Handle GET requests gracefully when visited in browser
    if (req.method === 'GET') {
        return res.status(200).json({ status: 'Serverless function is active. Send a POST request with an email payload.' });
    }

    // 4. Reject non-POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. This endpoint requires a POST request.' });
    }

    const { email } = req.body || {};

    if (!email) {
        return res.status(400).json({ error: 'Email address is required.' });
    }

    // 4. Validate Environment Variables safely
    if (!process.env.RESEND_API_KEY || !process.env.FIREBASE_PRIVATE_KEY) {
        console.error('CRITICAL ERROR: Missing server environment variables.');
        return res.status(500).json({ error: 'Internal Server Configuration Error. Missing API keys.' });
    }

    // 5. Safely Initialize Firebase Admin INSIDE the handler
    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    // Format the private key to handle Vercel's string escaping
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                })
            });
        }
    } catch (initError) {
        console.error('Firebase Admin Initialization Error:', initError);
        return res.status(500).json({ error: 'Failed to initialize Firebase credentials. Check Vercel Environment Variables.', details: initError.message });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        // 6. Securely generate the Native Firebase password reset link using Admin SDK
        const actionUrl = await admin.auth().generatePasswordResetLink(email);

        // 7. Dispatch the email using Resend with custom Movyra branding
        const data = await resend.emails.send({
            from: 'Movyra SevaSetu <onboarding@resend.dev>',
            to: [email],
            subject: 'Reset your Movyra SevaSetu Admin Password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; background-color: #FFFFFF;">
                    <div style="background-color: #2563EB; padding: 24px; text-align: center;">
                        <img src="https://msevasetu.web.app/logo.png" alt="Movyra SevaSetu" style="height: 48px; width: auto; margin-bottom: 8px;">
                        <h1 style="color: #FFFFFF; font-size: 24px; margin: 0; font-weight: 900; letter-spacing: -0.5px;">ovyra <span style="font-weight: 500;">SevaSetu</span></h1>
                    </div>
                    <div style="padding: 32px; color: #111111;">
                        <h2 style="font-size: 20px; font-weight: bold; margin-top: 0;">Password Reset Request</h2>
                        <p style="font-size: 16px; line-height: 1.5; color: #4B5563;">Hello,</p>
                        <p style="font-size: 16px; line-height: 1.5; color: #4B5563;">We received a request to reset the administrator password for your SevaSetu account. Click the button below to complete the reset process.</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${actionUrl}" target="_blank" rel="noopener" style="background-color: #111111; color: #FFFFFF; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
                        </div>
                        <p style="font-size: 14px; color: #6B7280; font-style: italic;">If you did not request this password reset, please ignore this email. Your system access remains secure.</p>
                    </div>
                    <div style="background-color: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 16px; text-align: center;">
                        <p style="font-size: 12px; color: #9CA3AF; margin: 0;">&copy; Movyra Civic | NGO Support Platform</p>
                    </div>
                </div>
            `
        });

        return res.status(200).json({ success: true, message: 'Password reset email sent successfully.', data });
    } catch (error) {
        console.error('API Execution Error:', error);
        return res.status(500).json({ error: 'Failed to process request to Firebase servers.', details: error.message });
    }
}