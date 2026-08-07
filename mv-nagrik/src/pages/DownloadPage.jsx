/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Official Download Page for NagrikSetu Application.
 * Brand: Movyra Civic
 * 
 * English: Official Application Download.
 * Hindi: आधिकारिक एप्लिकेशन डाउनलोड।
 * Hinglish: Official Application Download.
 * Marathi: अधिकृत ॲप्लिकेशन डाउनलोड.
 * Gujarati: સત્તાવાર એપ્લિકેશન ડાઉનલોડ.
 * Telugu: అధికారిక అప్లికేషన్ డౌన్‌లోడ్.
 * Tamil: அதிகாரப்பூர்வ பயன்பாடு பதிவிறக்கம்.
 * Kannada: ಅಧಿಕೃತ ಅಪ್ಲಿಕೇಶನ್ ಡೌನ್‌ಲೋಡ್.
 * Malayalam: ഔദ്യോഗിക ആപ്ലിക്കേഷൻ ഡൗൺലോഡ്.
 * Bengali: অফিসিয়াল অ্যাপ্লিকেশন ডাউনলোড।
 * Punjabi: ਅਧਿਕਾਰਤ ਐਪਲੀਕੇਸ਼ਨ ਡਾਊਨਲੋਡ।
 * Odia: ଅଫିସିଆଲ୍ ଆପ୍ଲିକେସନ୍ ଡାଉନଲୋଡ୍।
 * Assamese: চৰকাৰী এপ্লিকেচন ডাউনলোড।
 * Urdu: سرکاری ایپلیکیشن ڈاؤن لوڈ۔
 * Bhojpuri: आधिकारिक एप्लीकेशन डाउनलोड।
 *
 * SYSTEM COLORS REFERENCE:
 * Primary Brand (Civic Teal): #00897B
 * Dark Text (Deep Black): #111111
 * Background (White): #FFFFFF
 * Highlight (Action Yellow): #FFB300
 * Success (Green): #2E7D32
 * Emergency (Red): #D32F2F
 * Information (Blue): #1565C0
 * Border (Soft Grey): #E0E0E0
 * Secondary Background (Light Teal): #E0F2F1
 */

import React, { useState } from 'react';

const TRANSLATIONS = {
  en: { title: "Official Application Download", subtitle: "Secure Civic Platform by Movyra", version: "Version", size: "Size", checksum: "Security Checksum", download: "Download Application", guideTitle: "Installation Guide", step1: "Click the download button to save the file to your phone.", step2: "Open your downloads folder and tap the downloaded file.", step3: "If a security warning appears, click 'Download Anyway' or 'Install Anyway'. This is normal for direct downloads.", step4: "Complete the installation and open NagrikSetu." },
  hi: { title: "आधिकारिक एप्लिकेशन डाउनलोड", subtitle: "मोविरा द्वारा सुरक्षित नागरिक मंच", version: "संस्करण", size: "आकार", checksum: "सुरक्षा चेकसम", download: "एप्लिकेशन डाउनलोड करें", guideTitle: "स्थापना गाइड", step1: "फ़ाइल को अपने फोन में सहेजने के लिए डाउनलोड बटन पर क्लिक करें।", step2: "अपना डाउनलोड फ़ोल्डर खोलें और डाउनलोड की गई फ़ाइल पर टैप करें।", step3: "यदि कोई सुरक्षा चेतावनी दिखाई देती है, तो 'फिर भी डाउनलोड करें' या 'फिर भी इंस्टॉल करें' पर क्लिक करें। यह सीधे डाउनलोड के लिए सामान्य है।", step4: "स्थापना पूरी करें और नागरिकसेतु खोलें।" },
  hinglish: { title: "Official Application Download", subtitle: "Movyra dwara secure civic platform", version: "Version", size: "Size", checksum: "Security Checksum", download: "Application Download Karein", guideTitle: "Installation Guide", step1: "File ko apne phone mein save karne ke liye download button dabayein.", step2: "Apna downloads folder kholein aur file par tap karein.", step3: "Agar security warning aaye, toh 'Download Anyway' par click karein. Yeh direct download ke liye normal hai.", step4: "Installation pura karein aur NagrikSetu kholein." },
  mr: { title: "अधिकृत ॲप्लिकेशन डाउनलोड", subtitle: "मोविरा द्वारे सुरक्षित नागरी व्यासपीठ", version: "आवृत्ती", size: "आकार", checksum: "सुरक्षा चेकसम", download: "ॲप्लिकेशन डाउनलोड करा", guideTitle: "स्थापना मार्गदर्शक", step1: "फाइल तुमच्या फोनवर सेव्ह करण्यासाठी डाउनलोड बटणावर क्लिक करा.", step2: "तुमचे डाउनलोड फोल्डर उघडा आणि डाउनलोड केलेल्या फाइलवर टॅप करा.", step3: "सुरक्षा चेतावणी दिसल्यास, 'तरीही डाउनलोड करा' वर क्लिक करा. थेट डाउनलोडसाठी हे सामान्य आहे.", step4: "स्थापना पूर्ण करा आणि नागरिकसेतू उघडा." },
  gu: { title: "સત્તાવાર એપ્લિકેશન ડાઉનલોડ", subtitle: "મોવિરા દ્વારા સુરક્ષિત નાગરિક પ્લેટફોર્મ", version: "આવૃત્તિ", size: "કદ", checksum: "સુરક્ષા ચેકસમ", download: "એપ્લિકેશન ડાઉનલોડ કરો", guideTitle: "સ્થાપન માર્ગદર્શિકા", step1: "ફાઇલને તમારા ફોનમાં સાચવવા માટે ડાઉનલોડ બટન પર ક્લિક કરો.", step2: "તમારું ડાઉનલોડ્સ ફોલ્ડર ખોલો અને ડાઉનલોડ કરેલી ફાઇલ પર ટેપ કરો.", step3: "જો કોઈ સુરક્ષા ચેતવણી દેખાય, તો 'તો પણ ડાઉનલોડ કરો' પર ક્લિક કરો. આ સીધા ડાઉનલોડ માટે સામાન્ય છે.", step4: "સ્થાપન પૂર્ણ કરો અને નાગરિકસેતુ ખોલો." },
  te: { title: "అధికారిక అప్లికేషన్ డౌన్‌లోడ్", subtitle: "మోవిరా ద్వారా సురక్షిత సివిక్ ప్లాట్‌ఫారమ్", version: "వెర్షన్", size: "పరిమాణం", checksum: "భద్రతా చెక్‌సమ్", download: "అప్లికేషన్ డౌన్‌లోడ్ చేయండి", guideTitle: "ఇన్‌స్టాలేషన్ గైడ్", step1: "ఫైల్‌ను మీ ఫోన్‌లో సేవ్ చేయడానికి డౌన్‌లోడ్ బటన్‌ను క్లిక్ చేయండి.", step2: "మీ డౌన్‌లోడ్‌ల ఫోల్డర్‌ను తెరిచి, డౌన్‌లోడ్ చేసిన ఫైల్‌పై నొక్కండి.", step3: "భద్రతా హెచ్చరిక కనిపిస్తే, 'ఎలాగైనా డౌన్‌లోడ్ చేయి' క్లిక్ చేయండి. ప్రత్యక్ష డౌన్‌లోడ్‌లకు ఇది సాధారణం.", step4: "ఇన్‌స్టాలేషన్‌ను పూర్తి చేసి, నాగ్రిక్‌సేతును తెరవండి." },
  ta: { title: "அதிகாரப்பூர்வ பயன்பாடு பதிவிறக்கம்", subtitle: "மோவிராவால் பாதுகாப்பான குடிமக்கள் தளம்", version: "பதிப்பு", size: "அளவு", checksum: "பாதுகாப்பு குறியீடு", download: "பயன்பாட்டைப் பதிவிறக்கவும்", guideTitle: "நிறுவல் வழிகாட்டி", step1: "உங்கள் தொலைபேசியில் கோப்பைச் சேமிக்க பதிவிறக்க பொத்தானைக் கிளிக் செய்யவும்.", step2: "உங்கள் பதிவிறக்கங்கள் கோப்புறையைத் திறந்து பதிவிறக்கிய கோப்பைத் தட்டவும்.", step3: "பாதுகாப்பு எச்சரிக்கை தோன்றினால், 'எப்படியும் பதிவிறக்கு' என்பதைக் கிளிக் செய்யவும். நேரடி பதிவிறக்கங்களுக்கு இது சாதாரணமானது.", step4: "நிறுவலை முடித்து நாகரிக் சேதுவை திறக்கவும்." },
  kn: { title: "ಅಧಿಕೃತ ಅಪ್ಲಿಕೇಶನ್ ಡೌನ್‌ಲೋಡ್", subtitle: "ಮೊವಿರಾ ಅವರಿಂದ ಸುರಕ್ಷಿತ ನಾಗರಿಕ ವೇದಿಕೆ", version: "ಆವೃತ್ತಿ", size: "ಗಾತ್ರ", checksum: "ಭದ್ರತಾ ಚೆಕ್‌ಸಮ್", download: "ಅಪ್ಲಿಕೇಶನ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ", guideTitle: "ಅನುಸ್ಥಾಪನಾ ಮಾರ್ಗದರ್ಶಿ", step1: "ನಿಮ್ಮ ಫೋನ್‌ನಲ್ಲಿ ಫೈಲ್ ಉಳಿಸಲು ಡೌನ್‌ಲೋಡ್ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.", step2: "ನಿಮ್ಮ ಡೌನ್‌ಲೋಡ್‌ಗಳ ಫೋಲ್ಡರ್ ತೆರೆಯಿರಿ ಮತ್ತು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿದ ಫೈಲ್ ಅನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ.", step3: "ಭದ್ರತಾ ಎಚ್ಚರಿಕೆ ಕಾಣಿಸಿಕೊಂಡರೆ, 'ಹೇಗಾದರೂ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ' ಕ್ಲಿಕ್ ಮಾಡಿ. ನೇರ ಡೌನ್‌ಲೋಡ್‌ಗಳಿಗೆ ಇದು ಸಾಮಾನ್ಯವಾಗಿದೆ.", step4: "ಅನುಸ್ಥಾಪನೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ ಮತ್ತು ನಾಗರಿಕ್‌ಸೇತು ತೆರೆಯಿರಿ." },
  ml: { title: "ഔദ്യോഗിക ആപ്ലിക്കേഷൻ ഡൗൺലോഡ്", subtitle: "മോവിറയുടെ സുരക്ഷിത സിവിക് പ്ലാറ്റ്ഫോം", version: "പതിപ്പ്", size: "വലുപ്പം", checksum: "സുരക്ഷാ ചെക്ക്സം", download: "ആപ്ലിക്കേഷൻ ഡൗൺലോഡ് ചെയ്യുക", guideTitle: "ഇൻസ്റ്റലേഷൻ ഗൈഡ്", step1: "നിങ്ങളുടെ ഫോണിൽ ഫയൽ സംരക്ഷിക്കാൻ ഡൗൺലോഡ് ബട്ടൺ ക്ലിക്കുചെയ്യുക.", step2: "നിങ്ങളുടെ ഡൗൺലോഡ് ഫോൾഡർ തുറന്ന് ഡൗൺലോഡ് ചെയ്ത ഫയലിൽ ടാപ്പുചെയ്യുക.", step3: "ഒരു സുരക്ഷാ മുന്നറിയിപ്പ് ദൃശ്യമാകുകയാണെങ്കിൽ, 'എന്തായാലും ഡൗൺലോഡ് ചെയ്യുക' ക്ലിക്കുചെയ്യുക. നേരിട്ടുള്ള ഡൗൺലോഡുകൾക്ക് ഇത് സാധാരണമാണ്.", step4: "ഇൻസ്റ്റലേഷൻ പൂർത്തിയാക്കി നാഗരിക് സേതു തുറക്കുക." },
  bn: { title: "অফিসিয়াল অ্যাপ্লিকেশন ডাউনলোড", subtitle: "মোভিরার সুরক্ষিত নাগরিক প্ল্যাটফর্ম", version: "সংস্করণ", size: "আকার", checksum: "নিরাপত্তা চেকসাম", download: "অ্যাপ্লিকেশন ডাউনলোড করুন", guideTitle: "ইন্সটলেশন গাইড", step1: "আপনার ফোনে ফাইলটি সংরক্ষণ করতে ডাউনলোড বোতামে ক্লিক করুন।", step2: "আপনার ডাউনলোড ফোল্ডার খুলুন এবং ডাউনলোড করা ফাইলে আলতো চাপুন।", step3: "যদি কোনো নিরাপত্তা সতর্কতা উপস্থিত হয়, তবে 'যাই হোক ডাউনলোড করুন' এ ক্লিক করুন। সরাসরি ডাউনলোডের জন্য এটি স্বাভাবিক।", step4: "ইন্সটলেশন সম্পন্ন করুন এবং নাগরিকসেতু খুলুন।" },
  pa: { title: "ਅਧਿਕਾਰਤ ਐਪਲੀਕੇਸ਼ਨ ਡਾਊਨਲੋਡ", subtitle: "ਮੋਵਿਰਾ ਦੁਆਰਾ ਸੁਰੱਖਿਅਤ ਨਾਗਰਿਕ ਪਲੇਟਫਾਰਮ", version: "ਸੰਸਕਰਣ", size: "ਆਕਾਰ", checksum: "ਸੁਰੱਖਿਆ ਚੈੱਕਸਮ", download: "ਐਪਲੀਕੇਸ਼ਨ ਡਾਊਨਲੋਡ ਕਰੋ", guideTitle: "ਇੰਸਟਾਲੇਸ਼ਨ ਗਾਈਡ", step1: "ਆਪਣੇ ਫ਼ੋਨ ਵਿੱਚ ਫ਼ਾਈਲ ਨੂੰ ਸੁਰੱਖਿਅਤ ਕਰਨ ਲਈ ਡਾਊਨਲੋਡ ਬਟਨ 'ਤੇ ਕਲਿੱਕ ਕਰੋ।", step2: "ਆਪਣਾ ਡਾਊਨਲੋਡ ਫੋਲਡਰ ਖੋਲ੍ਹੋ ਅਤੇ ਡਾਊਨਲੋਡ ਕੀਤੀ ਫ਼ਾਈਲ 'ਤੇ ਟੈਪ ਕਰੋ।", step3: "ਜੇਕਰ ਕੋਈ ਸੁਰੱਖਿਆ ਚੇਤਾਵਨੀ ਦਿਖਾਈ ਦਿੰਦੀ ਹੈ, ਤਾਂ 'ਫਿਰ ਵੀ ਡਾਊਨਲੋਡ ਕਰੋ' 'ਤੇ ਕਲਿੱਕ ਕਰੋ। ਸਿੱਧੇ ਡਾਊਨਲੋਡ ਲਈ ਇਹ ਆਮ ਹੈ।", step4: "ਇੰਸਟਾਲੇਸ਼ਨ ਪੂਰੀ ਕਰੋ ਅਤੇ ਨਾਗਰਿਕਸੇਤੂ ਖੋਲ੍ਹੋ।" },
  or: { title: "ଅଫିସିଆଲ୍ ଆପ୍ଲିକେସନ୍ ଡାଉନଲୋଡ୍", subtitle: "ମୋଭିରା ଦ୍ୱାରା ସୁରକ୍ଷିତ ନାଗରିକ ପ୍ଲାଟଫର୍ମ", version: "ସଂସ୍କରଣ", size: "ଆକାର", checksum: "ସୁରକ୍ଷା ଚେକସମ୍", download: "ଆପ୍ଲିକେସନ୍ ଡାଉନଲୋଡ୍ କରନ୍ତୁ", guideTitle: "ଇନଷ୍ଟଲେସନ୍ ଗାଇଡ୍", step1: "ଆପଣଙ୍କ ଫୋନରେ ଫାଇଲ୍ ସେଭ୍ କରିବାକୁ ଡାଉନଲୋଡ୍ ବଟନ୍ କ୍ଲିକ୍ କରନ୍ତୁ।", step2: "ଆପଣଙ୍କ ଡାଉନଲୋଡ୍ ଫୋଲ୍ଡର୍ ଖୋଲନ୍ତୁ ଏବଂ ଡାଉନଲୋଡ୍ ହୋଇଥିବା ଫାଇଲ୍ ଉପରେ ଟ୍ୟାପ୍ କରନ୍ତୁ।", step3: "ଯଦି କୌଣସି ସୁରକ୍ଷା ଚେତାବନୀ ଦେଖାଯାଏ, ତେବେ 'ଯେକୌଣସି ପ୍ରକାରେ ଡାଉନଲୋଡ୍ କରନ୍ତୁ' ଉପରେ କ୍ଲିକ୍ କରନ୍ତୁ। ସିଧାସଳଖ ଡାଉନଲୋଡ୍ ପାଇଁ ଏହା ସାଧାରଣ ଅଟେ।", step4: "ଇନଷ୍ଟଲେସନ୍ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ ଏବଂ ନାଗରିକସେତୁ ଖୋଲନ୍ତୁ।" },
  as: { title: "চৰকাৰী এপ্লিকেচন ডাউনলোড", subtitle: "মভিৰাৰ দ্বাৰা সুৰক্ষিত নাগৰিক প্লেটফৰ্ম", version: "সংস্কৰণ", size: "আকাৰ", checksum: "সুৰক্ষা চেকচাম", download: "এপ্লিকেচন ডাউনলোড কৰক", guideTitle: "ইনষ্টলেচন গাইড", step1: "আপোনাৰ ফোনত ফাইলটো চেভ কৰিবলৈ ডাউনলোড বুটামত ক্লিক কৰক।", step2: "আপোনাৰ ডাউনলোড ফোল্ডাৰ খোলক আৰু ডাউনলোড কৰা ফাইলটোত টেপ কৰক।", step3: "যদি কোনো সুৰক্ষা সতৰ্কবাণী দেখা যায়, তেন্তে 'যিকোনো প্ৰকাৰে ডাউনলোড কৰক'ত ক্লিক কৰক। পোনপটীয়া ডাউনলোডৰ বাবে এইটো স্বাভাৱিক।", step4: "ইনষ্টলেচন সম্পূৰ্ণ কৰক আৰু নাগৰিকসেতু খোলক।" },
  ur: { title: "سرکاری ایپلیکیشن ڈاؤن لوڈ", subtitle: "موویرا کا محفوظ شہری پلیٹ فارم", version: "ورژن", size: "سائز", checksum: "سیکیورٹی چیک سم", download: "ایپلیکیشن ڈاؤن لوڈ کریں", guideTitle: "انسٹالیشن گائیڈ", step1: "اپنے فون میں فائل محفوظ کرنے کے لیے ڈاؤن لوڈ بٹن پر کلک کریں۔", step2: "اپنا ڈاؤن لوڈ فولڈر کھولیں اور ڈاؤن لوڈ کی گئی فائل پر ٹیپ کریں۔", step3: "اگر کوئی سیکیورٹی وارننگ ظاہر ہو تو 'پھر بھی ڈاؤن لوڈ کریں' پر کلک کریں۔ براہ راست ڈاؤن لوڈ کے لیے یہ عام بات ہے۔", step4: "انسٹالیشن مکمل کریں اور ناگرک سیتو کھولیں۔" },
  bho: { title: "आधिकारिक एप्लीकेशन डाउनलोड", subtitle: "मोविरा द्वारा सुरक्षित नागरिक मंच", version: "संस्करण", size: "आकार", checksum: "सुरक्षा चेकसम", download: "एप्लीकेशन डाउनलोड करीं", guideTitle: "स्थापना गाइड", step1: "फ़ाइल के अपना फोन में सहेजे खातिर डाउनलोड बटन पर क्लिक करीं।", step2: "अपन डाउनलोड फ़ोल्डर खोलीं आ डाउनलोड कइल गइल फ़ाइल पर टैप करीं।", step3: "अगर कवनो सुरक्षा चेतावनी लउकत बा, त 'फिर भी डाउनलोड करीं' पर क्लिक करीं। सीधा डाउनलोड खातिर ई सामान्य बा।", step4: "स्थापना पूरा करीं आ नागरिकसेतु खोलीं।" }
};

export default function DownloadPage() {
  const [language, setLanguage] = useState('en');
  const t = TRANSLATIONS[language];

  // APPLICATION METADATA - Strictly update these values when you release a new APK
  const APP_VERSION = "2";
  const APP_SIZE = "1.94 MB";
  const GITHUB_APK_LINK = "https://github.com/movyra/movyra/releases/download/v1.0.0/NagrikSetu-v1.0.0.apk";
  const SHA_256_HASH = "26:FF:38:91:93:D8:6A:2D:21:1D:77:10:17:C4:60:4D:4B:3F:C9:2F:10:C2:2A:D0:09:60:8B:05:CC:C7:A3:4D";

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Simple Language Selector */}
      <div style={{ backgroundColor: '#E0F2F1', padding: '12px 24px', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid #E0E0E0' }}>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #00897B', backgroundColor: '#FFFFFF', color: '#111111', fontWeight: '600', cursor: 'pointer' }}
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="hinglish">Hinglish</option>
          <option value="mr">मराठी</option>
          <option value="gu">ગુજરાતી</option>
          <option value="te">తెలుగు</option>
          <option value="ta">தமிழ்</option>
          <option value="kn">ಕನ್ನಡ</option>
          <option value="ml">മലയാളം</option>
          <option value="bn">বাংলা</option>
          <option value="pa">ਪੰਜਾਬੀ</option>
          <option value="or">ଓଡ଼ିଆ</option>
          <option value="as">অসমীয়া</option>
          <option value="ur">اردو</option>
          <option value="bho">भोजपुरी</option>
        </select>
      </div>

      <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', backgroundColor: '#00897B', color: '#FFFFFF', fontSize: '32px', fontWeight: '900', borderRadius: '16px', marginBottom: '16px' }}>
            N
          </div>
          <h1 style={{ color: '#111111', fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0' }}>
            {t.title}
          </h1>
          <p style={{ color: '#00897B', fontSize: '16px', fontWeight: '600', margin: 0 }}>
            {t.subtitle}
          </p>
        </div>

        {/* Application Details Card */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '24px', marginBottom: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#111111', fontSize: '14px', fontWeight: '600' }}>
            <span>{t.version}: {APP_VERSION}</span>
            <span>{t.size}: {APP_SIZE}</span>
          </div>
          <div style={{ backgroundColor: '#E0F2F1', padding: '12px', borderRadius: '8px', fontSize: '12px' }}>
            <span style={{ color: '#111111', fontWeight: '700', display: 'block', marginBottom: '4px' }}>{t.checksum}:</span>
            <code style={{ color: '#1565C0', wordBreak: 'break-all' }}>{SHA_256_HASH}</code>
          </div>
        </div>

        {/* Download Action */}
        <a 
          href={GITHUB_APK_LINK}
          style={{ display: 'block', width: '100%', backgroundColor: '#00897B', color: '#FFFFFF', textAlign: 'center', padding: '18px 0', borderRadius: '8px', fontSize: '18px', fontWeight: '700', textDecoration: 'none', marginBottom: '40px', boxShadow: '0 4px 12px rgba(0, 137, 123, 0.3)' }}
        >
          {t.download}
        </a>

        {/* Installation Instructions */}
        <div style={{ borderTop: '2px solid #E0E0E0', paddingTop: '32px' }}>
          <h2 style={{ color: '#111111', fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>
            {t.guideTitle}
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', backgroundColor: '#00897B', color: '#FFFFFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>1</div>
              <p style={{ color: '#111111', fontSize: '15px', margin: 0, lineHeight: '1.5', paddingTop: '4px' }}>{t.step1}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', backgroundColor: '#00897B', color: '#FFFFFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>2</div>
              <p style={{ color: '#111111', fontSize: '15px', margin: 0, lineHeight: '1.5', paddingTop: '4px' }}>{t.step2}</p>
            </div>

            {/* Warning Bypass Step (Strictly uses Action Yellow for attention) */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', backgroundColor: '#FFF8E1', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #FFB300' }}>
              <div style={{ width: '28px', height: '28px', backgroundColor: '#FFB300', color: '#111111', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>3</div>
              <p style={{ color: '#111111', fontSize: '15px', fontWeight: '600', margin: 0, lineHeight: '1.5', paddingTop: '4px' }}>
                {t.step3}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', backgroundColor: '#2E7D32', color: '#FFFFFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>4</div>
              <p style={{ color: '#111111', fontSize: '15px', margin: 0, lineHeight: '1.5', paddingTop: '4px' }}>{t.step4}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}