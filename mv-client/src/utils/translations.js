/**
 * GLOBAL TRANSLATION ENGINE & DICTIONARY
 * Exports the structured i18n dictionary mapping all UI strings to
 * English (en), Hindi (hi), and Marathi (mr).
 * Includes the `t()` helper function to dynamically fetch active translations.
 */

export const translations = {
  en: {
    common: {
      loading: "Loading...",
      confirm: "Confirm",
      cancel: "Cancel",
      save: "Save",
      back: "Back",
      error: "Error",
      success: "Success",
      done: "Done"
    },
    settings: {
      title: "Settings",
      language: "Display Language",
      appearance: "Appearance",
      pushNotifications: "Push Notifications",
      pushSub: "Live order & driver alerts",
      locationServices: "Location Services",
      locationSub: "Precise pickup auto-fill",
      helpCenter: "Help Center",
      helpSub: "Support tickets & FAQs",
      signOut: "Sign Out",
      signOutAll: "Sign out of all devices",
      exclusiveMember: "Exclusive Member",
      unlimitedPriority: "Unlimited priority delivery enabled",
      manageSubscription: "Manage Subscription",
      trustedDriver: "Trusted Driver Mode"
    },
    booking: {
      pickup: "Pickup Location",
      dropoff: "Drop-off Location",
      selectVehicle: "Select Vehicle",
      confirmVehicle: "Confirm Vehicle",
      estimatedFare: "Estimated Fare",
      highDemand: "High Demand Area",
      findingPartner: "Finding Partner...",
      standard: "Standard",
      group: "Group Save 20%"
    },
    tracking: {
      activeShipment: "Active Shipment",
      driverEnRoute: "Partner En Route",
      pickedUp: "Package In Transit",
      delivered: "Delivery Complete",
      eta: "MIN ETA",
      minsAway: "mins away",
      call: "Call",
      chat: "Chat",
      sos: "SOS",
      share: "Share Live Tracking",
      routeDeviation: "Route Deviation",
      deviationMsg: "Driver is off the optimal path."
    },
    auth: {
      login: "Sign In",
      register: "Create Account",
      email: "Email Address",
      password: "Password",
      welcome: "Welcome Back",
      google: "Continue with Google"
    }
  },

  hi: {
    common: {
      loading: "लोड हो रहा है...",
      confirm: "पुष्टि करें",
      cancel: "रद्द करें",
      save: "सहेजें",
      back: "पीछे",
      error: "त्रुटि",
      success: "सफलता",
      done: "हो गया"
    },
    settings: {
      title: "सेटिंग्स",
      language: "प्रदर्शन भाषा",
      appearance: "दिखावट",
      pushNotifications: "पुश सूचनाएं",
      pushSub: "लाइव ऑर्डर और ड्राइवर अलर्ट",
      locationServices: "स्थान सेवाएँ",
      locationSub: "सटीक पिकअप ऑटो-फिल",
      helpCenter: "सहायता केंद्र",
      helpSub: "समर्थन टिकट और सामान्य प्रश्न",
      signOut: "साइन आउट",
      signOutAll: "सभी डिवाइस से साइन आउट करें",
      exclusiveMember: "विशेष सदस्य",
      unlimitedPriority: "असीमित प्राथमिकता डिलीवरी सक्षम",
      manageSubscription: "सदस्यता प्रबंधित करें",
      trustedDriver: "विश्वसनीय ड्राइवर मोड"
    },
    booking: {
      pickup: "पिकअप स्थान",
      dropoff: "ड्रॉप-ऑफ़ स्थान",
      selectVehicle: "वाहन चुनें",
      confirmVehicle: "वाहन की पुष्टि करें",
      estimatedFare: "अनुमानित किराया",
      highDemand: "उच्च मांग क्षेत्र",
      findingPartner: "पार्टनर खोजा जा रहा है...",
      standard: "मानक",
      group: "समूह बचत 20%"
    },
    tracking: {
      activeShipment: "सक्रिय शिपमेंट",
      driverEnRoute: "पार्टनर रास्ते में है",
      pickedUp: "पैकेज पारगमन में है",
      delivered: "डिलीवरी पूरी हुई",
      eta: "मिनट ETA",
      minsAway: "मिनट दूर",
      call: "कॉल",
      chat: "चैट",
      sos: "आपातकाल (SOS)",
      share: "लाइव ट्रैकिंग साझा करें",
      routeDeviation: "मार्ग विचलन",
      deviationMsg: "ड्राइवर इष्टतम पथ से बाहर है।"
    },
    auth: {
      login: "साइन इन करें",
      register: "खाता बनाएं",
      email: "ईमेल पता",
      password: "पासवर्ड",
      welcome: "वापसी पर स्वागत है",
      google: "Google के साथ जारी रखें"
    }
  },

  mr: {
    common: {
      loading: "लोड होत आहे...",
      confirm: "पुष्टी करा",
      cancel: "रद्द करा",
      save: "जतन करा",
      back: "मागे",
      error: "त्रुटी",
      success: "यश",
      done: "पूर्ण"
    },
    settings: {
      title: "सेटिंग्ज",
      language: "प्रदर्शन भाषा",
      appearance: "देखावा",
      pushNotifications: "पुश नोटिफिकेशन्स",
      pushSub: "थेट ऑर्डर आणि ड्रायव्हर अलर्ट",
      locationServices: "स्थान सेवा",
      locationSub: "अचूक पिकअप ऑटो-फिल",
      helpCenter: "मदत केंद्र",
      helpSub: "सपोर्ट तिकीट आणि वारंवार विचारले जाणारे प्रश्न",
      signOut: "साइन आउट",
      signOutAll: "सर्व डिव्हाइसेसमधून साइन आउट करा",
      exclusiveMember: "अनन्य सदस्य",
      unlimitedPriority: "अमर्यादित प्राधान्य वितरण सक्षम",
      manageSubscription: "सदस्यत्व व्यवस्थापित करा",
      trustedDriver: "विश्वसनीय ड्रायव्हर मोड"
    },
    booking: {
      pickup: "पिकअप स्थान",
      dropoff: "ड्रॉप-ऑफ स्थान",
      selectVehicle: "वाहन निवडा",
      confirmVehicle: "वाहनाची पुष्टी करा",
      estimatedFare: "अंदाजे भाडे",
      highDemand: "उच्च मागणी क्षेत्र",
      findingPartner: "भागीदार शोधत आहे...",
      standard: "प्रमाणित",
      group: "गट बचत 20%"
    },
    tracking: {
      activeShipment: "सक्रिय शिपमेंट",
      driverEnRoute: "भागीदार वाटेत आहे",
      pickedUp: "पार्सल ट्रांझिटमध्ये आहे",
      delivered: "वितरण पूर्ण झाले",
      eta: "मिनिटे ETA",
      minsAway: "मिनिटे दूर",
      call: "कॉल करा",
      chat: "गप्पा",
      sos: "आणीबाणी (SOS)",
      share: "लाइव्ह ट्रॅकिंग शेअर करा",
      routeDeviation: "मार्ग विचलन",
      deviationMsg: "ड्रायव्हर योग्य मार्गावर नाही."
    },
    auth: {
      login: "साइन इन करा",
      register: "खाते तयार करा",
      email: "ईमेल पत्ता",
      password: "पासवर्ड",
      welcome: "परत स्वागत आहे",
      google: "Google सह सुरू ठेवा"
    }
  }
};

/**
 * Global Translation Hook / Helper Method
 * Extracts the correct nested string based on dot-notation paths.
 * * @param {string} key - e.g., 'settings.title'
 * @param {string} lang - 'en', 'hi', or 'mr' (Defaults to 'en')
 * @returns {string} The translated string or the original key if missing
 */
export const t = (key, lang = 'en') => {
  if (!key) return '';
  
  const keys = key.split('.');
  let result = translations[lang] || translations['en'];
  
  for (const k of keys) {
    if (result[k] === undefined) {
      console.warn(`Translation missing for key: ${key} in lang: ${lang}`);
      return key; // Fallback to raw key if translation is missing
    }
    result = result[k];
  }
  
  return result;
};