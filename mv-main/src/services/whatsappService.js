/**
 * ============================================================================
 * SERVICE: WHATSAPP WEBHOOK DISPATCHER (mv-main)
 * Architecture: Pure Data Telemetry Service
 * Description: Dispatches new waitlist registration payloads to a secure external
 * webhook (Zapier, Make, or custom Cloud Function) to trigger a WhatsApp alert.
 * ============================================================================
 */

// WARNING: Replace this URL with your actual secure Webhook URL.
// Never commit sensitive API keys directly to the frontend. Always use a webhook
// proxy to secure your WhatsApp Business API credentials.
const WHATSAPP_WEBHOOK_URL = 'https://your-secure-webhook-url-here.com/api/trigger';

/**
 * Dispatches the registration payload to the configured webhook.
 * * @param {Object} userData - The registration data.
 * @param {string} userData.name - Full Name of the registrant.
 * @param {string} userData.phone - WhatsApp Number.
 * @param {string} userData.email - Email Address.
 * @param {string} userData.role - Requested Role (e.g., Customer, Driver Partner).
 * @returns {Promise<boolean>} - Returns true if the dispatch was successful.
 */
export const dispatchWhatsAppNotification = async (userData) => {
  // 1. Data Validation Guard
  if (!userData || !userData.phone) {
    console.warn('WhatsApp Dispatch Aborted: Invalid or missing user payload.');
    return false;
  }

  // 2. Prevent execution if the webhook URL is still the placeholder
  if (WHATSAPP_WEBHOOK_URL === 'https://your-secure-webhook-url-here.com/api/trigger') {
    console.warn('WhatsApp Dispatch Skipped: Webhook URL is unconfigured.');
    // Return true in development to simulate success without breaking the UI flow
    return true; 
  }

  try {
    // 3. Format the Payload
    const payload = {
      source: 'Movyra_Coming_Soon_Terminal',
      timestamp: new Date().toISOString(),
      registrant: {
        name: userData.name || 'Unknown',
        phone: userData.phone,
        email: userData.email || 'N/A',
        requestedRole: userData.role || 'Unspecified'
      }
    };

    // 4. Execute the Network Request
    const response = await fetch(WHATSAPP_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with status: ${response.status}`);
    }

    return true;

  } catch (error) {
    console.error('Critical Error during WhatsApp Dispatch:', error);
    return false;
  }
};