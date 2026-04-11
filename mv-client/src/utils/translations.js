/**
 * GLOBAL TRANSLATION ENGINE & DICTIONARY
 * Exports the structured i18n dictionary mapping all UI strings to
 * English (en), Hindi (hi), and Marathi (mr).
 * Fixed: Added missing keys for Navigation (Services), UI Redesign, and Tracking Status to stop console warnings.
 */

export const translations = {
  en: {
    // Navigation & Context Keys
    Home: "Home",
    Track: "Track",
    Activity: "Activity",
    Account: "Account",
    Services: "Services",
    Rides: "Rides",
    Delivery: "Delivery",

    // UI Redesign Keys (Uber-Style)
    Suggestions: "Suggestions",
    "See all": "See all",
    "Search for a service": "Search for a service",
    "Where to?": "Where to?",
    Details: "Details",
    Timeline: "Timeline",
    "Live Total": "Live Total",
    Message: "Message",

    // Tracking Status Keys
    Searching: "Searching",
    "En Route": "En Route",
    "In Transit": "In Transit",
    "Waking Telemetry": "Waking Telemetry",
    "No Active Shipments": "No Active Shipments",
    "You don't have any orders in transit right now.": "You don't have any orders in transit right now.",
    "Send a Package": "Send a Package",
    "Order ID": "Order ID",
    "Call Driver": "Call Driver",
    "Marketplace Search": "Marketplace Search",
    "Driver Assigned": "Driver Assigned",
    "No active shipments": "No active shipments",

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
    // Navigation & Context Keys (Hindi)
    Home: "होम",
    Track: "ट्रैक",
    Activity: "गतिविधि",
    Account: "खाता",
    Services: "सेवाएं",
    Rides: "राइड्स",
    Delivery: "डिलीवरी",

    // UI Redesign Keys (Hindi)
    Suggestions: "सुझाव",
    "See all": "सभी देखें",
    "Search for a service": "सेवा खोजें",
    "Where to?": "कहाँ जाना है?",
    Details: "विवरण",
    Timeline: "टाइमलाइन",
    "Live Total": "लाइव टोटल",
    Message: "संदेश",

    // Tracking Status Keys (Hindi)
    Searching: "खोज रहे हैं",
    "En Route": "रास्ते में",
    "In Transit": "पारगमन में",
    "Waking Telemetry": "टेलीमेट्री सक्रिय हो रही है",
    "No Active Shipments": "कोई सक्रिय शिपमेंट नहीं",
    "You don't have any orders in transit right now.": "अभी आपका कोई भी ऑर्डर पारगमन में नहीं है।",
    "Send a Package": "पैकेज भेजें",
    "Order ID": "ऑर्डर आईडी",
    "Call Driver": "ड्राइवर को कॉल करें",
    "Marketplace Search": "मार्केटप्लेस खोज",
    "Driver Assigned": "ड्राइवर नियुक्त",
    "No active shipments": "कोई सक्रिय शिपमेंट नहीं",

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
    // Navigation & Context Keys (Marathi)
    Home: "मुख्यपृष्ठ",
    Track: "ट्रॅक",
    Activity: "हालचाली",
    Account: "खाते",
    Services: "सेवा",
    Rides: "राइड्स",
    Delivery: "डिलिव्हरी",

    // UI Redesign Keys (Marathi)
    Suggestions: "सूचना",
    "See all": "सर्व पहा",
    "Search for a service": "सेवा शोधा",
    "Where to?": "कुठे जायचे?",
    Details: "तपशील",
    Timeline: "टाइमलाइन",
    "Live Total": "थेट एकूण",
    Message: "संदेश",

    // Tracking Status Keys (Marathi)
    Searching: "शोधत आहे",
    "En Route": "वाटेत आहे",
    "In Transit": "पारगमनमध्ये",
    "Waking Telemetry": "टेलीमेट्री सक्रिय होत आहे",
    "No Active Shipments": "कोणतीही सक्रिय शिपमेंट नाही",
    "You don't have any orders in transit right now.": "सध्या तुमची कोणतीही ऑर्डर पारगमनमध्ये नाही.",
    "Send a Package": "पार्सल पाठवा",
    "Order ID": "ऑर्डर आयडी",
    "Call Driver": "ड्रायव्हरला कॉल करा",
    "Marketplace Search": "मार्केटप्लेस शोध",
    "Driver Assigned": "ड्रायव्हर नियुक्त",
    "No active shipments": "कोणतीही सक्रिय शिपमेंट नाही",

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
 * Extracts the correct nested string based on dot-notation paths or top-level keys.
 */
export const t = (key, lang = 'en') => {
  if (!key) return '';
  
  const keys = key.split('.');
  let result = translations[lang] || translations['en'];
  
  for (const k of keys) {
    if (result[k] === undefined) {
      // Logic for top-level keys like "Home", "Track", "Services" etc.
      if (translations[lang] && translations[lang][key]) return translations[lang][key];
      if (translations['en'][key]) return translations['en'][key];
      
      console.warn(`Translation missing for key: ${key} in lang: ${lang}`);
      return key; // Fallback to raw key
    }
    result = result[k];
  }
  
  return result;
};

export default t;