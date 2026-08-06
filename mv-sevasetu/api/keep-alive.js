/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Vercel Serverless API Endpoint to prevent cold starts (Cron-job keep-alive).
 * 
 * English: System Keep Alive Endpoint.
 * Hindi: सिस्टम कीप अलाइव एंडपॉइंट।
 * Hinglish: System Keep Alive Endpoint.
 * Marathi: सिस्टम कीप अलाइव्ह एंडपॉइंट.
 * Gujarati: સિસ્ટમ કીપ અલાઇવ એન્ડપોઇન્ટ.
 * Telugu: సిస్టమ్ కీప్ అలైవ్ ఎండ్‌పాయింట్.
 * Tamil: சிஸ்டம் கீப் அலைவ் எண்ட்பாயிண்ட்.
 * Kannada: ಸಿಸ್ಟಮ್ ಕೀಪ್ ಅಲೈವ್ ಎಂಡ್‌ಪಾಯಿಂಟ್.
 * Malayalam: സിസ്റ്റം കീപ്പ് അലൈവ് എൻഡ്‌പോയിന്റ്.
 * Bengali: সিস্টেম কিপ এলাইভ এন্ডপয়েন্ট।
 * Punjabi: ਸਿਸਟਮ ਕੀਪ ਅਲਾਈਵ ਐਂਡਪੁਆਇੰਟ।
 * Odia: ସିଷ୍ଟମ୍ କିପ୍ ଏଲାଇଭ୍ ଏଣ୍ଡପଏଣ୍ଟ।
 * Assamese: চিষ্টেম কীপ এলাইভ এণ্ডপইণ্ট।
 * Urdu: سسٹم کیپ الائیو اینڈ پوائنٹ۔
 * Bhojpuri: सिस्टम कीप अलाइव एंडपॉइंट।
 *
 * SYSTEM COLORS REFERENCE:
 * Primary: #2563EB | Black: #111111 | White: #FFFFFF | Success: #16A34A | Emergency: #DC2626
 */

export default function handler(request, response) {
  // Strictly enforce GET method for the cron-job ping
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  // Return a 200 OK status instantly to acknowledge the ping and keep the instance warm
  response.status(200).json({ 
    status: 'online',
    message: 'Vercel serverless environment is active.',
    timestamp: new Date().toISOString()
  });
}