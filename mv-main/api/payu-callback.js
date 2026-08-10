/**
 * SYSTEM DOCUMENTATION / PAYU TRANSACTION CALLBACK RECEIVER
 * Context: Secure Payment Gateway Processing.
 * Function: Receives the transaction receipt from the payment provider and redirects the customer to the application portal.
 * Syntax: Strict ES Module for Vercel Serverless environment.
 */

export default async function handler(req, res) {
    // 1. Validate incoming transaction data method
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Invalid request method. Require POST method for payment callback.', code: 405 });
    }

    try {
        // 2. Extract transaction parameters from the payment provider
        const { status, txnid } = req.body || {};

        // 3. Define the destination portal address
        // Defaults to the production domain. Configure FRONTEND_URL in Vercel for custom test domains if required.
        const applicationUrl = process.env.FRONTEND_URL || 'https://msevasetu.web.app';

        // 4. Construct the final redirection path with transaction results
        const destinationPath = `${applicationUrl}/sevasetu-onboarding?payu_status=${status || 'failure'}&txnid=${txnid || 'unknown'}`;

        // 5. Issue the browser redirect instruction
        return res.redirect(302, destinationPath);

    } catch (error) {
        console.error('Transaction Callback Processing Error:', error);
        const fallbackUrl = process.env.FRONTEND_URL || 'https://msevasetu.web.app';
        return res.redirect(302, `${fallbackUrl}/sevasetu-onboarding?payu_status=failure&txnid=error`);
    }
}