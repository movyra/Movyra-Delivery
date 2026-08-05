/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Subscription plan feature matrix and limit definitions.
 * 
 * English: Subscription plan feature matrix and limit definitions.
 * Hindi: सदस्यता योजना सुविधा मैट्रिक्स और सीमा परिभाषाएँ।
 * Hinglish: Subscription plan feature matrix aur limit definitions.
 * Marathi: सदस्यता योजना वैशिष्ट्य मॅट्रिक्स आणि मर्यादा व्याख्या.
 * Gujarati: સબ્સ્ક્રિપ્શન પ્લાન સુવિધા મેટ્રિક્સ અને મર્યાદા વ્યાખ્યાઓ.
 * Telugu: సబ్‌స్క్రిప్షన్ ప్లాన్ ఫీచర్ మ్యాట్రిక్స్ మరియు పరిమితి నిర్వచనాలు.
 * Tamil: சந்தா திட்ட அம்ச மேட்ரிக்ஸ் மற்றும் வரம்பு வரையறைகள்.
 * Kannada: ಚಂದಾದಾರಿಕೆ ಯೋಜನೆ ವೈಶಿಷ್ಟ್ಯ ಮ್ಯಾಟ್ರಿಕ್ಸ್ ಮತ್ತು ಮಿತಿ ವ್ಯಾಖ್ಯಾನಗಳು.
 * Malayalam: സബ്സ്ക്രിപ്ഷൻ പ്ലാൻ ഫീച്ചർ മാട്രിക്സും പരിധി നിർവചനങ്ങളും.
 * Bengali: সাবস্ক্রিপশন প্ল্যান বৈশিষ্ট্য ম্যাট্রিক্স এবং সীমা সংজ্ঞা।
 * Punjabi: ਗਾਹਕੀ ਯੋਜਨਾ ਵਿਸ਼ੇਸ਼ਤਾ ਮੈਟ੍ਰਿਕਸ ਅਤੇ ਸੀਮਾ ਪਰਿਭਾਸ਼ਾਵਾਂ।
 * Odia: ସବସ୍କ୍ରିପସନ୍ ପ୍ଲାନ୍ ଫିଚର୍ ମ୍ୟାଟ୍ରିକ୍ସ ଏବଂ ସୀମା ସଂଜ୍ଞା।
 * Assamese: চাবস্ক্ৰিপচন প্লেন বৈশিষ্ট্য মেট্ৰিক্স আৰু সীমা সংজ্ঞাসমূহ।
 * Urdu: سبسکرپشن پلان فیچر میٹرکس اور حد کی تعریفیں۔
 * Bhojpuri: सदस्यता योजना फीचर मैट्रिक्स अउर सीमा परिभाषा।
 */

export const PLAN_TIERS = {
  Free: {
    price: 0,
    maxActiveCases: 5,
    maxVolunteers: 10,
    serviceRadiusKm: 5,
    hasAnalytics: false,
    hasPrioritySupport: false,
    hasVerificationBadge: false
  },
  Support: {
    price: 29,
    maxActiveCases: 50,
    maxVolunteers: 100,
    serviceRadiusKm: 25,
    hasAnalytics: true,
    hasPrioritySupport: false,
    hasVerificationBadge: true
  },
  Impact: {
    price: 99,
    maxActiveCases: 999999, // Represents Unlimited
    maxVolunteers: 999999, // Represents Unlimited
    serviceRadiusKm: 999999, // Represents Unlimited
    hasAnalytics: true,
    hasPrioritySupport: true,
    hasVerificationBadge: true
  }
};

/**
 * Strictly evaluates if an organization's current plan permits a specific feature or limit.
 * 
 * @param {string} currentTier - The organization's active tier (Free, Support, Impact)
 * @param {string} featureKey - The specific matrix key to evaluate
 * @param {number} [currentUsage] - Optional: The current consumption of a limit-based feature
 * @returns {boolean | number} - The permitted limit or a boolean representing access
 */
export const checkFeatureAccess = (currentTier, featureKey, currentUsage = null) => {
  const activePlan = PLAN_TIERS[currentTier] || PLAN_TIERS['Free'];
  const featureLimit = activePlan[featureKey];

  // If a usage metric is passed, strictly evaluate if it exceeds the plan's maximum
  if (currentUsage !== null && typeof featureLimit === 'number') {
    return currentUsage < featureLimit;
  }

  // Otherwise, return the boolean access right or the raw numeric limit
  return featureLimit;
};