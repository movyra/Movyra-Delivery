/**
 * SYSTEM DOCUMENTATION / PUBLIC NGO ONBOARDING & PAYMENT PORTAL
 * Context: Organization Registration and Subscription.
 * Database: PocketBase (ngo_users auth collection).
 * Gateway: PayU Checkout (Strict test routing for super admin).
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X, Building, Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import PocketBase from 'pocketbase';

const PB_URL = 'https://movyra-mv-main-db-gradio.hf.space';
const pb = new PocketBase(PB_URL);

const TRANSLATIONS = {
    en: {
        lang: "English", onboarding: "Organization Onboarding", free_plan: "Free Plan", support_plan: "Support Plan", pro_plan: "Professional Plan",
        org_name: "Organization Name", email: "Email Address", contact: "Contact Number", password: "Secure Password",
        proceed: "Proceed to Checkout", complete_reg: "Complete Registration", select_plan: "Select Your Plan",
        fill_details: "Organization Details", success: "Registration Successful", processing: "Processing Payment...",
        back: "Go Back", login_now: "Proceed to Dashboard", 
        price_free: "₹0 / month", price_support: "₹29 / month", price_pro: "₹99 / month",
        desc_free: "Basic access to civic reports and verification tools.", 
        desc_support: "Verified profile, case management, and team tools.", 
        desc_pro: "Multiple branches, advanced analytics, and priority support.",
        pay_failed: "Payment validation failed. Please try again.", recommended: "Recommended"
    },
    hi: {
        lang: "हिन्दी", onboarding: "संगठन ऑनबोर्डिंग", free_plan: "मुफ्त योजना", support_plan: "सहायता योजना", pro_plan: "पेशेवर योजना",
        org_name: "संगठन का नाम", email: "ईमेल पता", contact: "संपर्क नंबर", password: "सुरक्षित पासवर्ड",
        proceed: "चेकआउट के लिए आगे बढ़ें", complete_reg: "पंजीकरण पूरा करें", select_plan: "अपनी योजना चुनें",
        fill_details: "संगठन विवरण", success: "पंजीकरण सफल", processing: "भुगतान संसाधित हो रहा है...",
        back: "वापस जाएं", login_now: "डैशबोर्ड पर जाएं", 
        price_free: "₹0 / माह", price_support: "₹29 / माह", price_pro: "₹99 / माह",
        desc_free: "नागरिक रिपोर्ट और सत्यापन उपकरणों तक बुनियादी पहुंच।", 
        desc_support: "सत्यापित प्रोफ़ाइल, केस प्रबंधन और टीम टूल।", 
        desc_pro: "कई शाखाएं, उन्नत एनालिटिक्स और प्राथमिकता समर्थन।",
        pay_failed: "भुगतान सत्यापन विफल रहा। कृपया पुनः प्रयास करें।", recommended: "अनुशंसित"
    },
    hinglish: {
        lang: "Hinglish", onboarding: "Organization Onboarding", free_plan: "Free Plan", support_plan: "Support Plan", pro_plan: "Professional Plan",
        org_name: "Organization Name", email: "Email Address", contact: "Contact Number", password: "Secure Password",
        proceed: "Checkout Karein", complete_reg: "Registration Poora Karein", select_plan: "Plan Select Karein",
        fill_details: "Organization Details", success: "Registration Successful", processing: "Payment Process Ho Raha Hai...",
        back: "Peechhe Jayein", login_now: "Dashboard Par Jayein", 
        price_free: "₹0 / month", price_support: "₹29 / month", price_pro: "₹99 / month",
        desc_free: "Civic reports aur verification tools ka basic access.", 
        desc_support: "Verified profile, case management, aur team tools.", 
        desc_pro: "Multiple branches, advanced analytics, aur priority support.",
        pay_failed: "Payment validation fail ho gaya. Kripaya dubara try karein.", recommended: "Recommended"
    },
    mr: {
        lang: "मराठी", onboarding: "संस्था ऑनबोर्डिंग", free_plan: "मोफत योजना", support_plan: "आधार योजना", pro_plan: "व्यावसायिक योजना",
        org_name: "संस्थेचे नाव", email: "ईमेल पत्ता", contact: "संपर्क क्रमांक", password: "सुरक्षित पासवर्ड",
        proceed: "चेकआउट करण्यासाठी पुढे जा", complete_reg: "नोंदणी पूर्ण करा", select_plan: "तुमची योजना निवडा",
        fill_details: "संस्थेचे तपशील", success: "नोंदणी यशस्वी", processing: "पेमेंट प्रक्रियेत आहे...",
        back: "मागे जा", login_now: "डॅशबोर्डवर जा", 
        price_free: "₹0 / महिना", price_support: "₹29 / महिना", price_pro: "₹99 / महिना",
        desc_free: "नागरी अहवाल आणि पडताळणी साधनांमध्ये मूलभूत प्रवेश.", 
        desc_support: "सत्यापित प्रोफाइल, केस व्यवस्थापन आणि टीम साधने.", 
        desc_pro: "अनेक शाखा, प्रगत विश्लेषण आणि प्राधान्य समर्थन.",
        pay_failed: "पेमेंट प्रमाणीकरण अयशस्वी. कृपया पुन्हा प्रयत्न करा.", recommended: "शिफारस केलेले"
    },
    gu: {
        lang: "ગુજરાતી", onboarding: "સંસ્થા ઓનબોર્ડિંગ", free_plan: "મફત યોજના", support_plan: "આધાર યોજના", pro_plan: "વ્યવસાયિક યોજના",
        org_name: "સંસ્થાનું નામ", email: "ઇમેઇલ સરનામું", contact: "સંપર્ક નંબર", password: "સુરક્ષિત પાસવર્ડ",
        proceed: "ચેકઆઉટ માટે આગળ વધો", complete_reg: "નોંધણી પૂર્ણ કરો", select_plan: "તમારી યોજના પસંદ કરો",
        fill_details: "સંસ્થાની વિગતો", success: "નોંધણી સફળ", processing: "ચુકવણી પ્રક્રિયામાં છે...",
        back: "પાછા જાઓ", login_now: "ડેશબોર્ડ પર જાઓ", 
        price_free: "₹0 / મહિનો", price_support: "₹29 / મહિનો", price_pro: "₹99 / મહિનો",
        desc_free: "નાગરિક અહેવાલો અને ચકાસણી સાધનોની મૂળભૂત ઍક્સેસ.", 
        desc_support: "ચકાસાયેલ પ્રોફાઇલ, કેસ મેનેજમેન્ટ અને ટીમ સાધનો.", 
        desc_pro: "બહુવિધ શાખાઓ, અદ્યતન વિશ્લેષણ અને પ્રાધાન્યતા સપોર્ટ.",
        pay_failed: "ચુકવણી માન્યતા નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.", recommended: "ભલામણ કરેલ"
    },
    te: {
        lang: "తెలుగు", onboarding: "సంస్థ ఆన్‌బోర్డింగ్", free_plan: "ఉచిత ప్రణాళిక", support_plan: "మద్దతు ప్రణాళిక", pro_plan: "వృత్తిపరమైన ప్రణాళిక",
        org_name: "సంస్థ పేరు", email: "ఈమెయిల్", contact: "సంప్రదింపు నంబర్", password: "సురక్షిత పాస్‌వర్డ్",
        proceed: "చెల్లింపుకు కొనసాగండి", complete_reg: "నమోదును పూర్తి చేయండి", select_plan: "మీ ప్రణాళికను ఎంచుకోండి",
        fill_details: "సంస్థ వివరాలు", success: "నమోదు విజయవంతమైంది", processing: "చెల్లింపు ప్రాసెస్ చేయబడుతోంది...",
        back: "వెనక్కి వెళ్ళు", login_now: "డాష్‌బోర్డ్‌కు వెళ్లండి", 
        price_free: "₹0 / నెల", price_support: "₹29 / నెల", price_pro: "₹99 / నెల",
        desc_free: "పౌర నివేదికలు మరియు ధృవీకరణ సాధనాలకు ప్రాథమిక ప్రాప్యత.", 
        desc_support: "ధృవీకరించబడిన ప్రొఫైల్, కేస్ నిర్వహణ మరియు జట్టు సాధనాలు.", 
        desc_pro: "బహుళ శాఖలు, అధునాతన విశ్లేషణలు మరియు ప్రాధాన్యత మద్దతు.",
        pay_failed: "చెల్లింపు ధృవీకరణ విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.", recommended: "సిఫార్సు చేయబడింది"
    },
    ta: {
        lang: "தமிழ்", onboarding: "நிறுவன ஆன்போர்டிங்", free_plan: "இலவச திட்டம்", support_plan: "ஆதரவு திட்டம்", pro_plan: "தொழில்முறை திட்டம்",
        org_name: "நிறுவனத்தின் பெயர்", email: "மின்னஞ்சல்", contact: "தொடர்பு எண்", password: "பாதுகாப்பான கடவுச்சொல்",
        proceed: "பணம் செலுத்த தொடரவும்", complete_reg: "பதிவை முடிக்கவும்", select_plan: "உங்கள் திட்டத்தை தேர்ந்தெடுக்கவும்",
        fill_details: "நிறுவனத்தின் விவரங்கள்", success: "பதிவு வெற்றிகரமானது", processing: "கட்டணம் செயலாக்கப்படுகிறது...",
        back: "திரும்பிச் செல்", login_now: "டாஷ்போர்டுக்குச் செல்லவும்", 
        price_free: "₹0 / மாதம்", price_support: "₹29 / மாதம்", price_pro: "₹99 / மாதம்",
        desc_free: "குடிமக்கள் அறிக்கைகள் மற்றும் சரிபார்ப்பு கருவிகளுக்கான அடிப்படை அணுகல்.", 
        desc_support: "சரிபார்க்கப்பட்ட சுயவிவரம், வழக்கு மேலாண்மை மற்றும் குழு கருவிகள்.", 
        desc_pro: "பல கிளைகள், மேம்பட்ட பகுப்பாய்வு மற்றும் முன்னுரிமை ஆதரவு.",
        pay_failed: "கட்டண சரிபார்ப்பு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.", recommended: "பரிந்துரைக்கப்படுகிறது"
    },
    pa: {
        lang: "ਪੰਜਾਬੀ", onboarding: "ਸੰਗਠਨ ਆਨਬੋਰਡਿੰਗ", free_plan: "ਮੁਫਤ ਯੋਜਨਾ", support_plan: "ਸਹਾਇਤਾ ਯੋਜਨਾ", pro_plan: "ਪੇਸ਼ੇਵਰ ਯੋਜਨਾ",
        org_name: "ਸੰਗਠਨ ਦਾ ਨਾਮ", email: "ਈਮੇਲ", contact: "ਸੰਪਰਕ ਨੰਬਰ", password: "ਸੁਰੱਖਿਅਤ ਪਾਸਵਰਡ",
        proceed: "ਭੁਗਤਾਨ ਲਈ ਅੱਗੇ ਵਧੋ", complete_reg: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਪੂਰੀ ਕਰੋ", select_plan: "ਆਪਣੀ ਯੋਜਨਾ ਚੁਣੋ",
        fill_details: "ਸੰਗਠਨ ਦੇ ਵੇਰਵੇ", success: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸਫਲ", processing: "ਭੁਗਤਾਨ ਪ੍ਰਕਿਰਿਆ ਵਿੱਚ ਹੈ...",
        back: "ਵਾਪਸ ਜਾਓ", login_now: "ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਜਾਓ", 
        price_free: "₹0 / ਮਹੀਨਾ", price_support: "₹29 / ਮਹੀਨਾ", price_pro: "₹99 / ਮਹੀਨਾ",
        desc_free: "ਨਾਗਰਿਕ ਰਿਪੋਰਟਾਂ ਅਤੇ ਤਸਦੀਕ ਸਾਧਨਾਂ ਤੱਕ ਬੁਨਿਆਦੀ ਪਹੁੰਚ।", 
        desc_support: "ਪ੍ਰਮਾਣਿਤ ਪ੍ਰੋਫਾਈਲ, ਕੇਸ ਪ੍ਰਬੰਧਨ, ਅਤੇ ਟੀਮ ਟੂਲ।", 
        desc_pro: "ਕਈ ਸ਼ਾਖਾਵਾਂ, ਉੱਨਤ ਵਿਸ਼ਲੇਸ਼ਣ, ਅਤੇ ਤਰਜੀਹੀ ਸਹਾਇਤਾ।",
        pay_failed: "ਭੁਗਤਾਨ ਪ੍ਰਮਾਣਿਕਤਾ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।", recommended: "ਸਿਫਾਰਸ਼ੀ"
    },
    bho: {
        lang: "भोजपुरी", onboarding: "संगठन ऑनबोर्डिंग", free_plan: "मुफ्त योजना", support_plan: "सहायता योजना", pro_plan: "पेशेवर योजना",
        org_name: "संगठन के नाम", email: "ईमेल", contact: "संपर्क नंबर", password: "सुरक्षित पासवर्ड",
        proceed: "भुगतान खातिर आगे बढ़ीं", complete_reg: "पंजीकरण पूरा करीं", select_plan: "आपन योजना चुनीं",
        fill_details: "संगठन के विवरण", success: "पंजीकरण सफल", processing: "भुगतान के प्रक्रिया चल रहल बा...",
        back: "वापस जाईं", login_now: "डैशबोर्ड पर जाईं", 
        price_free: "₹0 / महिना", price_support: "₹29 / महिना", price_pro: "₹99 / महिना",
        desc_free: "नागरिक रिपोर्ट अउर सत्यापन उपकरण तक बुनियादी पहुंच।", 
        desc_support: "सत्यापित प्रोफाइल, केस प्रबंधन, अउर टीम टूल।", 
        desc_pro: "कई गो शाखा, उन्नत एनालिटिक्स, अउर प्राथमिकता समर्थन।",
        pay_failed: "भुगतान सत्यापन विफल हो गइल। कृपया फेर से कोशिश करीं।", recommended: "अनुशंसित"
    },
    bn: {
        lang: "বাংলা", onboarding: "প্রতিষ্ঠান অনবোর্ডিং", free_plan: "বিনামূল্যে পরিকল্পনা", support_plan: "সহায়তা পরিকল্পনা", pro_plan: "পেশাদার পরিকল্পনা",
        org_name: "প্রতিষ্ঠানের নাম", email: "ইমেইল", contact: "যোগাযোগ নম্বর", password: "নিরাপদ পাসওয়ার্ড",
        proceed: "চেকআউটে এগিয়ে যান", complete_reg: "নিবন্ধন সম্পূর্ণ করুন", select_plan: "আপনার পরিকল্পনা নির্বাচন করুন",
        fill_details: "প্রতিষ্ঠানের বিবরণ", success: "নিবন্ধন সফল", processing: "পেমেন্ট প্রক্রিয়াধীন...",
        back: "ফিরে যান", login_now: "ড্যাশবোর্ডে যান", 
        price_free: "₹0 / মাস", price_support: "₹29 / মাস", price_pro: "₹99 / মাস",
        desc_free: "নাগরিক প্রতিবেদন এবং যাচাইকরণ সরঞ্জামগুলিতে প্রাথমিক অ্যাক্সেস।", 
        desc_support: "যাচাইকৃত প্রোফাইল, কেস পরিচালনা এবং দলীয় সরঞ্জাম।", 
        desc_pro: "একাধিক শাখা, উন্নত বিশ্লেষণ এবং অগ্রাধিকার সমর্থন।",
        pay_failed: "পেমেন্ট বৈধতা ব্যর্থ হয়েছে। আবার চেষ্টা করুন।", recommended: "প্রস্তাবিত"
    },
    kn: {
        lang: "ಕನ್ನಡ", onboarding: "ಸಂಸ್ಥೆ ಆನ್‌ಬೋರ್ಡಿಂಗ್", free_plan: "ಉಚಿತ ಯೋಜನೆ", support_plan: "ಬೆಂಬಲ ಯೋಜನೆ", pro_plan: "ವೃತ್ತಿಪರ ಯೋಜನೆ",
        org_name: "ಸಂಸ್ಥೆಯ ಹೆಸರು", email: "ಇಮೇಲ್", contact: "ಸಂಪರ್ಕ ಸಂಖ್ಯೆ", password: "ಸುರಕ್ಷಿತ ಪಾಸ್ವರ್ಡ್",
        proceed: "ಪಾವತಿಗೆ ಮುಂದುವರಿಯಿರಿ", complete_reg: "ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ", select_plan: "ನಿಮ್ಮ ಯೋಜನೆ ಆಯ್ಕೆಮಾಡಿ",
        fill_details: "ಸಂಸ್ಥೆಯ ವಿವರಗಳು", success: "ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ", processing: "ಪಾವತಿ ಪ್ರಕ್ರಿಯೆಯಲ್ಲಿದೆ...",
        back: "ಹಿಂದಕ್ಕೆ", login_now: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ", 
        price_free: "₹0 / ತಿಂಗಳು", price_support: "₹29 / ತಿಂಗಳು", price_pro: "₹99 / ತಿಂಗಳು",
        desc_free: "ನಾಗರಿಕ ವರದಿಗಳು ಮತ್ತು ಪರಿಶೀಲನಾ ಸಾಧನಗಳಿಗೆ ಮೂಲ ಪ್ರವೇಶ.", 
        desc_support: "ಪರಿಶೀಲಿಸಿದ ಪ್ರೊಫೈಲ್, ಪ್ರಕರಣ ನಿರ್ವಹಣೆ ಮತ್ತು ತಂಡದ ಪರಿಕರಗಳು.", 
        desc_pro: "ಬಹು ಶಾಖೆಗಳು, ಸುಧಾರಿತ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಆದ್ಯತೆಯ ಬೆಂಬಲ.",
        pay_failed: "ಪಾವತಿ ಮೌಲ್ಯೀಕರಣ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.", recommended: "ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ"
    },
    ml: {
        lang: "മലയാളം", onboarding: "സ്ഥാപന ഓൺബോർഡിംഗ്", free_plan: "സൗജന്യ പ്ലാൻ", support_plan: "പിന്തുണ പ്ലാൻ", pro_plan: "പ്രൊഫഷണൽ പ്ലാൻ",
        org_name: "സ്ഥാപനത്തിന്റെ പേര്", email: "ഇമെയിൽ", contact: "ബന്ധപ്പെടേണ്ട നമ്പർ", password: "സുരക്ഷിത പാസ്‌വേഡ്",
        proceed: "പേയ്‌മെന്റിലേക്ക് തുടരുക", complete_reg: "രജിസ്ട്രേഷൻ പൂർത്തിയാക്കുക", select_plan: "നിങ്ങളുടെ പ്ലാൻ തിരഞ്ഞെടുക്കുക",
        fill_details: "സ്ഥാപനത്തിന്റെ വിവരങ്ങൾ", success: "രജിസ്ട്രേഷൻ വിജയകരം", processing: "പേയ്‌മെന്റ് പ്രോസസ്സ് ചെയ്യുന്നു...",
        back: "പുറകോട്ട്", login_now: "ഡാഷ്‌ബോർഡിലേക്ക് പോകുക", 
        price_free: "₹0 / മാസം", price_support: "₹29 / മാസം", price_pro: "₹99 / മാസം",
        desc_free: "സിവിക് റിപ്പോർട്ടുകളിലേക്കും സ്ഥിരീകരണ ഉപകരണങ്ങളിലേക്കുമുള്ള അടിസ്ഥാന ആക്സസ്.", 
        desc_support: "പരിശോധിച്ചുറപ്പിച്ച പ്രൊഫൈൽ, കേസ് മാനേജ്മെന്റ്, ടീം ടൂളുകൾ.", 
        desc_pro: "ഒന്നിലധികം ശാഖകൾ, വിപുലമായ വിശകലനം, മുൻഗണനാ പിന്തുണ.",
        pay_failed: "പേയ്‌മെന്റ് സാധൂകരണം പരാജയപ്പെട്ടു. വീണ്ടും ശ്രമിക്കുക.", recommended: "ശുപാർശ ചെയ്യുന്നത്"
    },
    or: {
        lang: "ଓଡ଼ିଆ", onboarding: "ସଂସ୍ଥା ଅନବୋର୍ଡିଂ", free_plan: "ମାଗଣା ଯୋଜନା", support_plan: "ସମର୍ଥନ ଯୋଜନା", pro_plan: "ପେସାଦାର ଯୋଜନା",
        org_name: "ସଂସ୍ଥାର ନାମ", email: "ଇମେଲ୍", contact: "ସମ୍ପର୍କ ନମ୍ବର", password: "ସୁରକ୍ଷିତ ପାସୱାର୍ଡ",
        proceed: "ପେମେଣ୍ଟକୁ ଆଗକୁ ବଢନ୍ତୁ", complete_reg: "ପଞ୍ଜିକରଣ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ", select_plan: "ଆପଣଙ୍କର ଯୋଜନା ବାଛନ୍ତୁ",
        fill_details: "ସଂସ୍ଥାର ବିବରଣୀ", success: "ପଞ୍ଜିକରଣ ସଫଳ", processing: "ପେମେଣ୍ଟ ପ୍ରକ୍ରିୟାକରଣ ହେଉଛି...",
        back: "ପଛକୁ ଯାଆନ୍ତୁ", login_now: "ଡ୍ୟାସବୋର୍ଡକୁ ଯାଆନ୍ତୁ", 
        price_free: "₹0 / ମାସ", price_support: "₹29 / ମାସ", price_pro: "₹99 / ମାସ",
        desc_free: "ନାଗରିକ ରିପୋର୍ଟ ଏବଂ ଯାଞ୍ଚ ଉପକରଣଗୁଡ଼ିକ ପାଇଁ ପ୍ରାଥମିକ ଆକ୍ସେସ୍।", 
        desc_support: "ଯାଞ୍ଚ ହୋଇଥିବା ପ୍ରୋଫାଇଲ୍, କେସ୍ ପରିଚାଳନା ଏବଂ ଟିମ୍ ଉପକରଣ।", 
        desc_pro: "ଏକାଧିକ ଶାଖା, ଉନ୍ନତ ବିଶ୍ଳେଷଣ ଏବଂ ପ୍ରାଥମିକତା ସମର୍ଥନ।",
        pay_failed: "ପେମେଣ୍ଟ ବୈଧତା ବିଫଳ ହୋଇଛି। ଦୟାକରି ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ।", recommended: "ସୁପାରିଶ କରାଯାଇଛି"
    },
    as: {
        lang: "অসমীয়া", onboarding: "সংস্থা অনবৰ্ডিং", free_plan: "বিনামূলীয়া পৰিকল্পনা", support_plan: "সহায় পৰিকল্পনা", pro_plan: "পেছাদাৰী পৰিকল্পনা",
        org_name: "সংস্থাৰ নাম", email: "ইমেইল", contact: "যোগাযোগ নম্বৰ", password: "সুৰক্ষিত পাছৱৰ্ড",
        proceed: "চেকআউটলৈ আগবাঢ়ক", complete_reg: "পঞ্জীয়ন সম্পূৰ্ণ কৰক", select_plan: "আপোনাৰ পৰিকল্পনা নিৰ্বাচন কৰক",
        fill_details: "সংস্থাৰ বিৱৰণ", success: "পঞ্জীয়ন সফল", processing: "পেমেন্ট প্ৰক্ৰিয়া চলি আছে...",
        back: "উভতি যাওক", login_now: "ডেচবৰ্ডলৈ যাওক", 
        price_free: "₹0 / মাহ", price_support: "₹29 / মাহ", price_pro: "₹99 / মাহ",
        desc_free: "নাগৰিক প্ৰতিবেদন আৰু সত্যাগ্ৰহ সঁজুলিলৈ প্ৰাথমিক প্ৰৱেশাধিকাৰ।", 
        desc_support: "প্ৰমাণিত প্ৰফাইল, কেছ পৰিচালনা, আৰু দলীয় সঁজুলি।", 
        desc_pro: "একাধিক শাখা, উন্নত বিশ্লেষণ, আৰু অগ্ৰাধিকাৰ সমৰ্থন।",
        pay_failed: "পেমেন্ট বৈধতা বিফল হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।", recommended: "পৰামৰ্শ দিয়া হৈছে"
    }
};

export default function SevaSetuOnboarding() {
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    
    const [step, setStep] = useState(1); 
    const [selectedPlan, setSelectedPlan] = useState('Support Plan');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        org_name: '',
        email: '',
        contact: '',
        password: ''
    });

    const currentT = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    const languageOptions = Object.keys(TRANSLATIONS).map(key => ({ code: key, label: TRANSLATIONS[key].lang }));

    // Custom SVG Sliding Animation Sequence Logic
    const [animIndex, setAnimIndex] = useState(0);
    const CUSTOM_SVGS = [
        // 1. Rupee Payment Graphic
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" key="rupee">
            <path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3c3.314 0 6-2.686 6-6 0-1.28-.404-2.46-1.087-3.42M13.5 13H6"/>
            <circle cx="12" cy="12" r="10" stroke="#111111" strokeWidth="0" strokeDasharray="2 2" />
        </svg>,
        // 2. Shield Verification Graphic
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" key="shield">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
        </svg>,
        // 3. Organization Building Graphic
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" key="building">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
            <path d="M9 22v-4h6v4"/>
            <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M16 10h.01M8 10h.01M12 14h.01M16 14h.01M8 14h.01"/>
        </svg>,
        // 4. File Document Graphic
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" key="file">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <path d="M9 15l2 2 4-4"/>
        </svg>
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimIndex(prev => (prev + 1) % CUSTOM_SVGS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [CUSTOM_SVGS.length]);

    // Load PayU Bolt Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://sboxcheckout-static.citruspay.com/bolt/run/bolt.min.js";
        script.id = "bolt";
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); };
    }, []);

    const handlePlanSelect = (planName) => {
        setSelectedPlan(planName);
        setStep(2);
    };

    const handleRegistration = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setErrorMessage('');

        let amount = '0.00';
        if (selectedPlan === 'Support Plan') amount = '29.00';
        if (selectedPlan === 'Professional Plan') amount = '99.00';

        const isTestMode = formData.email === 'testcodecfg@gmail.com';
        const txnid = "SEVA" + new Date().getTime();

        if (amount === '0.00') {
            await createPocketBaseUser(txnid, 'Free');
            return;
        }

        try {
            // STRICT UPDATE: Pointing to correct backend URL
            const hashResponse = await fetch('https://msevasetupay.vercel.app/api/payu-hash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    txnid: txnid,
                    amount: amount,
                    productinfo: `${selectedPlan} Subscription`,
                    firstname: formData.org_name.substring(0, 10),
                    email: formData.email,
                    lang: lang
                })
            });

            const hashData = await hashResponse.json();

            if (!hashResponse.ok || !hashData.hash) {
                throw new Error(currentT.pay_failed);
            }

            if (!window.bolt) {
                throw new Error("Payment gateway failed to load.");
            }

            window.bolt.launch({
                key: isTestMode ? 'gtKFFx' : import.meta.env.VITE_PAYU_MERCHANT_KEY,
                txnid: txnid,
                hash: hashData.hash,
                amount: amount,
                firstname: formData.org_name.substring(0, 10),
                email: formData.email,
                phone: formData.contact,
                productinfo: `${selectedPlan} Subscription`,
                surl: window.location.origin, 
                furl: window.location.origin,
                mode: 'dropout'
            }, {
                responseHandler: async function(BOLT) {
                    if (BOLT.response.txnStatus === "SUCCESS" || BOLT.response.status === "success") {
                        await createPocketBaseUser(BOLT.response.txnid || txnid, 'Active');
                    } else {
                        setErrorMessage(currentT.pay_failed);
                        setIsProcessing(false);
                    }
                },
                catchException: function(BOLT) {
                    console.error("Payment Exception:", BOLT.message);
                    setErrorMessage(currentT.pay_failed);
                    setIsProcessing(false);
                }
            });

        } catch (error) {
            console.error("Registration Processing Error:", error);
            setErrorMessage(error.message || currentT.pay_failed);
            setIsProcessing(false);
        }
    };

    const createPocketBaseUser = async (txnId, paymentStatus) => {
        try {
            await pb.collection('ngo_users').create({
                email: formData.email,
                password: formData.password,
                passwordConfirm: formData.password,
                org_name: formData.org_name,
                contact: formData.contact,
                plan_type: selectedPlan,
                payu_txn_id: txnId,
                status: 'Active'
            });
            setIsProcessing(false);
            setStep(3);
        } catch (error) {
            console.error("PocketBase Creation Error:", error);
            setErrorMessage("Database registration failed. Please contact support.");
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#2563EB] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
            
            {/* Top Right Controls */}
            <div className="absolute top-6 right-6 z-50">
                <button type="button" onClick={() => setShowLangPrompt(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-[#111111] font-bold text-[0.85rem] bg-[#FFFFFF] hover:bg-[#F9FAFB] outline-none shadow-md">
                    <Globe size={14} /> {currentT.lang}
                </button>
            </div>

            {/* Main Wrapper */}
            <div className="w-full max-w-6xl flex flex-col md:flex-row bg-[#FFFFFF] rounded-2xl shadow-2xl overflow-hidden z-10 relative">
                
                {/* Left Side: Graphic & Branding */}
                <div className="w-full md:w-1/3 bg-[#F9FAFB] border-r border-[#E5E7EB] p-8 flex flex-col items-center justify-center relative">
                    <div className="flex items-center gap-0.3 mb-12">
                        <img src="/logo-7.png" alt="Movyra" className="h-10 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                        <span className="font-black text-[1.8rem] tracking-tighter text-[#111111]">ovyra <span className="text-[#2563EB]">SevaSetu</span></span>
                    </div>

                    <div className="relative w-48 h-48 flex items-center justify-center mb-8 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={animIndex}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="absolute flex items-center justify-center"
                            >
                                {CUSTOM_SVGS[animIndex]}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <h2 className="text-xl font-black text-[#111111] text-center mb-2">{currentT.onboarding}</h2>
                    <p className="text-[#6B7280] font-medium text-center text-sm">Join the network of verified organizations providing civic support.</p>
                </div>

                {/* Right Side: Interactive Content */}
                <div className="w-full md:w-2/3 p-8 md:p-12 bg-[#FFFFFF]">
                    
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full justify-center">
                            <h3 className="text-2xl font-black text-[#111111] mb-6 text-center md:text-left">{currentT.select_plan}</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* Free Plan */}
                                <div onClick={() => handlePlanSelect('Free Plan')} className="border-2 border-[#E5E7EB] rounded-xl p-6 cursor-pointer hover:border-[#6B7280] transition-colors bg-[#F9FAFB]">
                                    <h4 className="text-lg font-black text-[#111111] mb-2">{currentT.free_plan}</h4>
                                    <p className="text-xl font-black text-[#6B7280] mb-4">{currentT.price_free}</p>
                                    <p className="text-[#4B5563] text-xs font-medium leading-relaxed">{currentT.desc_free}</p>
                                </div>
                                
                                {/* Support Plan (Recommended) */}
                                <div onClick={() => handlePlanSelect('Support Plan')} className="border-2 border-[#2563EB] rounded-xl p-6 cursor-pointer bg-[#EFF6FF] shadow-sm relative overflow-hidden transform transition hover:-translate-y-1">
                                    <div className="absolute top-0 right-0 bg-[#2563EB] text-[#FFFFFF] text-[0.6rem] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">{currentT.recommended}</div>
                                    <h4 className="text-lg font-black text-[#111111] mb-2">{currentT.support_plan}</h4>
                                    <p className="text-xl font-black text-[#2563EB] mb-4">{currentT.price_support}</p>
                                    <p className="text-[#4B5563] text-xs font-medium leading-relaxed">{currentT.desc_support}</p>
                                </div>

                                {/* Professional Plan */}
                                <div onClick={() => handlePlanSelect('Professional Plan')} className="border-2 border-[#E5E7EB] rounded-xl p-6 cursor-pointer hover:border-[#111111] transition-colors bg-[#FFFFFF]">
                                    <h4 className="text-lg font-black text-[#111111] mb-2">{currentT.pro_plan}</h4>
                                    <p className="text-xl font-black text-[#111111] mb-4">{currentT.price_pro}</p>
                                    <p className="text-[#4B5563] text-xs font-medium leading-relaxed">{currentT.desc_pro}</p>
                                </div>

                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full justify-center">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-black text-[#111111]">{currentT.fill_details}</h3>
                                <span className="bg-[#EFF6FF] text-[#2563EB] font-bold px-3 py-1 rounded-full text-sm">{selectedPlan}</span>
                            </div>
                            
                            <form onSubmit={handleRegistration} className="flex flex-col gap-4">
                                <div className="relative">
                                    <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9CA3AF]" size={18} />
                                    <input type="text" placeholder={currentT.org_name} value={formData.org_name} onChange={(e) => setFormData({...formData, org_name: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB]" required />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9CA3AF]" size={18} />
                                    <input type="email" placeholder={currentT.email} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB]" required />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9CA3AF]" size={18} />
                                    <input type="tel" placeholder={currentT.contact} value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB]" required />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9CA3AF]" size={18} />
                                    <input type="password" placeholder={currentT.password} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB]" required minLength="8" />
                                </div>
                                
                                {errorMessage && <p className="text-[0.85rem] font-bold text-center text-[#DC2626] mt-2">{errorMessage}</p>}
                                
                                <div className="flex gap-4 mt-4">
                                    <button type="button" onClick={() => setStep(1)} disabled={isProcessing} className="px-6 py-4 bg-[#F3F4F6] text-[#111111] rounded-xl font-bold hover:bg-[#E5E7EB] outline-none disabled:opacity-50">{currentT.back}</button>
                                    <button type="submit" disabled={isProcessing} className="flex-1 py-4 bg-[#2563EB] text-[#FFFFFF] rounded-xl font-black hover:bg-[#1D4ED8] outline-none transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                        {isProcessing ? currentT.processing : (selectedPlan === 'Free Plan' ? currentT.complete_reg : currentT.proceed)}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-24 h-24 bg-[#ECFDF5] rounded-full flex items-center justify-center mb-6">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                    <path d="M9 12l2 2 4-4"/>
                                </svg>
                            </div>
                            <h3 className="text-3xl font-black text-[#111111] mb-2">{currentT.success}</h3>
                            <p className="text-[#6B7280] font-medium mb-8">Your organization has been securely registered on SevaSetu.</p>
                            <button onClick={() => window.location.href = '/sevasetu-org'} className="px-8 py-4 bg-[#111111] text-[#FFFFFF] rounded-xl font-black hover:bg-[#000000] outline-none flex items-center gap-2">
                                {currentT.login_now} <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    )}

                </div>
            </div>

            {/* Language Selection Modal */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-[400px] bg-[#FFFFFF] rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[80vh] overflow-y-auto hide-scrollbar">
                            <button type="button" onClick={() => setShowLangPrompt(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#111111] hover:bg-[#F3F4F6] rounded-full outline-none"><X size={18} /></button>
                            <h2 className="text-[1.4rem] font-black tracking-tight mb-4 text-[#111111] text-center">Language</h2>
                            <div className="flex flex-col gap-2">
                                {languageOptions.map((opt) => (
                                    <button type="button" key={opt.code} onClick={() => { setLang(opt.code); setShowLangPrompt(false); }} className={`p-3 rounded-xl font-bold text-left border outline-none ${lang === opt.code ? 'bg-[#2563EB] text-[#FFFFFF] border-[#2563EB]' : 'bg-[#FFFFFF] text-[#111111] border-[#E5E7EB]'}`}>{opt.label}</button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}