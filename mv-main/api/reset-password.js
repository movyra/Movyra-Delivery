const admin = require('firebase-admin');
const { Resend } = require('resend');

export default async function handler(req, res) {
    // 1. CORS Headers
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

    // 5. Validate Environment Variables
    if (!process.env.RESEND_API_KEY) {
        console.error('CRITICAL ERROR: RESEND_API_KEY is missing.');
        return res.status(500).json({ error: 'Server configuration error: RESEND_API_KEY is missing.' });
    }

    if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL) {
        console.error('CRITICAL ERROR: Firebase environment variables are missing.');
        return res.status(500).json({ error: 'Server configuration error: Firebase environment variables are missing in Vercel.' });
    }

    try {
        // 6. Initialize Firebase Admin safely
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                })
            });
        }

        // 7. Generate secure password reset link
        const actionUrl = await admin.auth().generatePasswordResetLink(email);
        const resend = new Resend(process.env.RESEND_API_KEY);

        // 8. Dispatch email via Resend
        const data = await resend.emails.send({
            from: 'Movyra SevaSetu <onboarding@resend.dev>',
            to: [email],
            subject: 'Reset your Movyra SevaSetu Admin Password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; background-color: #FFFFFF;">
                    <div style="background-color: #2563EB; padding: 24px; text-align: center;">
                        <h1 style="color: #FFFFFF; font-size: 24px; margin: 0; font-weight: 900;">Movyra SevaSetu</h1>
                    </div>
                    <div style="padding: 32px; color: #111111;">
                        <h2 style="font-size: 20px; font-weight: bold; margin-top: 0;">Password Reset Request</h2>
                        <p style="font-size: 16px; line-height: 1.5; color: #4B5563;">Hello,</p>
                        <p style="font-size: 16px; line-height: 1.5; color: #4B5563;">We received a request to reset your administrator password. Click the button below to complete the process.</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${actionUrl}" target="_blank" rel="noopener" style="background-color: #111111; color: #FFFFFF; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
                        </div>
                        <p style="font-size: 14px; color: #6B7280; font-style: italic;">If you did not request this, please ignore this email.</p>
                    </div>
                </div>
            `
        });

        return res.status(200).json({ success: true, message: 'Password reset email sent successfully.', data });
    } catch (error) {
        console.error('Serverless Function Execution Error:', error);
        return res.status(500).json({ error: 'Failed to process password reset request.', details: error.message });
    }
}