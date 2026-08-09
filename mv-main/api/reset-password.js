const { Resend } = require('resend');

export default async function handler(req, res) {
    // 1. Dynamic CORS Headers for the Node.js Runtime (Strictly bound to Firebase Production)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', 'https://msevasetu.web.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // 2. Immediately answer the Preflight (OPTIONS) request with a standard 200 OK
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. Reject non-POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. This endpoint requires a POST request.' });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email address is required.' });
    }

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.error('CRITICAL ERROR: RESEND_API_KEY is not defined in Vercel.');
        return res.status(500).json({ error: 'Internal Server Configuration Error.' });
    }

    const resend = new Resend(apiKey);

    try {
        const actionUrl = `https://msevasetu.web.app/sevaadmin?action=reset&email=${encodeURIComponent(email)}`;

        const data = await resend.emails.send({
            from: 'Movyra SevaSetu <onboarding@resend.dev>',
            to: [email],
            subject: 'Reset your Movyra SevaSetu Admin Password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; background-color: #FFFFFF;">
                    <div style="background-color: #2563EB; padding: 24px; text-align: center;">
                        <img src="https://msevasetu.web.app/logo-7.png" alt="Movyra SevaSetu" style="height: 48px; width: auto; margin-bottom: 8px;">
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
        console.error('Resend API Error:', error);
        return res.status(500).json({ error: 'Failed to send password reset email.', details: error.message });
    }
}