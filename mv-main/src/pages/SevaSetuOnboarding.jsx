/**
 * SYSTEM DOCUMENTATION / PUBLIC NGO ONBOARDING & PAYMENT PORTAL
 * Context: Organization Registration and Subscription.
 * Database: PocketBase (ngo_users auth collection).
 * Gateway: PayU Checkout (Standard POST Redirect targeting /api/payu-callback).
 * Features: Super Admin Testing Override & Dedicated Transaction Receipt UI.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X, Building, Mail, Phone, Lock, ArrowRight, ShieldCheck, AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import PocketBase from 'pocketbase';
import { useNavigate } from 'react-router-dom';

const PB_URL = 'https://movyra-mv-main-db-gradio.hf.space';
const pb = new PocketBase(PB_URL);

const TRANSLATIONS = {
    en: {
        lang: "English", onboarding: "Organization Registration", free_plan: "Free Plan", support_plan: "Support Plan", pro_plan: "Pro Plan",
        org_name: "Organization Name", email: "Email", contact: "Phone Number", password: "Password",
        proceed: "Pay Now", complete_reg: "Complete Registration", select_plan: "Choose Plan",
        fill_details: "Fill Details", success: "Success", processing: "Please Wait...",
        back: "Back", login_now: "Go to Dashboard", 
        price_free: "₹0 / month", price_support: "₹29 / month", price_pro: "₹99 / month",
        desc_free: "Basic access.", 
        desc_support: "Verified profile and tools.", 
        desc_pro: "All tools and priority support.",
        pay_failed: "Payment failed.", recommended: "Recommended",
        txn_status: "Payment Status", txn_success: "Payment Success", txn_fail: "Payment Failed",
        txn_id: "Transaction ID", retry: "Retry", go_home: "Home"
    },
    hi: {
        lang: "हिन्दी", onboarding: "संगठन पंजीकरण", free_plan: "मुफ्त प्लान", support_plan: "सहायता प्लान", pro_plan: "प्रो प्लान",
        org_name: "संगठन का नाम", email: "ईमेल", contact: "फोन नंबर", password: "पासवर्ड",
        proceed: "भुगतान करें", complete_reg: "पंजीकरण पूरा करें", select_plan: "प्लान चुनें",
        fill_details: "विवरण भरें", success: "सफल", processing: "कृपया प्रतीक्षा करें...",
        back: "वापस जाएं", login_now: "डैशबोर्ड पर जाएं", 
        price_free: "₹0 / माह", price_support: "₹29 / माह", price_pro: "₹99 / माह",
        desc_free: "बुनियादी पहुंच।", 
        desc_support: "सत्यापित प्रोफाइल और उपकरण।", 
        desc_pro: "सभी उपकरण और प्राथमिकता समर्थन।",
        pay_failed: "भुगतान विफल।", recommended: "अनुशंसित",
        txn_status: "भुगतान की स्थिति", txn_success: "भुगतान सफल", txn_fail: "भुगतान विफल",
        txn_id: "लेनदेन आईडी", retry: "पुनः प्रयास करें", go_home: "होम"
    },
    hinglish: {
        lang: "Hinglish", onboarding: "Organization Registration", free_plan: "Free Plan", support_plan: "Support Plan", pro_plan: "Pro Plan",
        org_name: "Organization Name", email: "Email", contact: "Phone Number", password: "Password",
        proceed: "Pay Karein", complete_reg: "Registration Poora Karein", select_plan: "Plan Chunein",
        fill_details: "Details Bharein", success: "Success", processing: "Wait Karein...",
        back: "Peechhe", login_now: "Dashboard Par Jayein", 
        price_free: "₹0 / month", price_support: "₹29 / month", price_pro: "₹99 / month",
        desc_free: "Basic access.", 
        desc_support: "Verified profile aur tools.", 
        desc_pro: "Sabhi tools aur priority support.",
        pay_failed: "Payment fail ho gaya.", recommended: "Recommended",
        txn_status: "Payment Status", txn_success: "Payment Success", txn_fail: "Payment Failed",
        txn_id: "Transaction ID", retry: "Retry Karein", go_home: "Home"
    },
    mr: {
        lang: "मराठी", onboarding: "संस्था नोंदणी", free_plan: "मोफत प्लान", support_plan: "आधार प्लान", pro_plan: "प्रो प्लान",
        org_name: "संस्थेचे नाव", email: "ईमेल", contact: "फोन नंबर", password: "पासवर्ड",
        proceed: "पेमेंट करा", complete_reg: "नोंदणी पूर्ण करा", select_plan: "प्लान निवडा",
        fill_details: "तपशील भरा", success: "यशस्वी", processing: "कृपया थांबा...",
        back: "मागे", login_now: "डॅशबोर्डवर जा", 
        price_free: "₹0 / महिना", price_support: "₹29 / महिना", price_pro: "₹99 / महिना",
        desc_free: "मूलभूत प्रवेश.", 
        desc_support: "सत्यापित प्रोफाइल आणि साधने.", 
        desc_pro: "सर्व साधने आणि प्राधान्य समर्थन.",
        pay_failed: "पेमेंट अयशस्वी.", recommended: "शिफारस केलेले",
        txn_status: "पेमेंट स्थिती", txn_success: "पेमेंट यशस्वी", txn_fail: "पेमेंट अयशस्वी",
        txn_id: "व्यवहार आयडी", retry: "पुन्हा प्रयत्न करा", go_home: "होम"
    },
    gu: {
        lang: "ગુજરાતી", onboarding: "સંસ્થા નોંધણી", free_plan: "મફત પ્લાન", support_plan: "આધાર પ્લાન", pro_plan: "પ્રો પ્લાન",
        org_name: "સંસ્થાનું નામ", email: "ઇમેઇલ", contact: "ફોન નંબર", password: "પાસવર્ડ",
        proceed: "ચુકવણી કરો", complete_reg: "નોંધણી પૂર્ણ કરો", select_plan: "પ્લાન પસંદ કરો",
        fill_details: "વિગતો ભરો", success: "સફળ", processing: "કૃપા કરીને રાહ જુઓ...",
        back: "પાછળ", login_now: "ડેશબોર્ડ પર જાઓ", 
        price_free: "₹0 / મહિનો", price_support: "₹29 / મહિનો", price_pro: "₹99 / મહિનો",
        desc_free: "મૂળભૂત ઍક્સેસ.", 
        desc_support: "ચકાસાયેલ પ્રોફાઇલ અને સાધનો.", 
        desc_pro: "બધા સાધનો અને પ્રાધાન્યતા સપોર્ટ.",
        pay_failed: "ચુકવણી નિષ્ફળ.", recommended: "ભલામણ કરેલ",
        txn_status: "ચુકવણીની સ્થિતિ", txn_success: "ચુકવણી સફળ", txn_fail: "ચુકવણી નિષ્ફળ",
        txn_id: "વ્યવહાર આઈડી", retry: "ફરી પ્રયાસ કરો", go_home: "હોમ"
    },
    te: {
        lang: "తెలుగు", onboarding: "సంస్థ నమోదు", free_plan: "ఉచిత ప్లాన్", support_plan: "మద్దతు ప్లాన్", pro_plan: "ప్రో ప్లాన్",
        org_name: "సంస్థ పేరు", email: "ఈమెయిల్", contact: "ఫోన్ నంబర్", password: "పాస్‌వర్డ్",
        proceed: "చెల్లించండి", complete_reg: "నమోదును పూర్తి చేయండి", select_plan: "ప్లాన్ ఎంచుకోండి",
        fill_details: "వివరాలు నింపండి", success: "విజయవంతమైంది", processing: "దయచేసి వేచి ఉండండి...",
        back: "వెనుకకు", login_now: "డాష్‌బోర్డ్‌కు వెళ్లండి", 
        price_free: "₹0 / నెల", price_support: "₹29 / నెల", price_pro: "₹99 / నెల",
        desc_free: "ప్రాథమిక ప్రాప్యత.", 
        desc_support: "ధృవీకరించబడిన ప్రొఫైల్ మరియు సాధనాలు.", 
        desc_pro: "అన్ని సాధనాలు మరియు ప్రాధాన్యత మద్దతు.",
        pay_failed: "చెల్లింపు విఫలమైంది.", recommended: "సిఫార్సు చేయబడింది",
        txn_status: "చెల్లింపు స్థితి", txn_success: "చెల్లింపు విజయవంతమైంది", txn_fail: "చెల్లింపు విఫలమైంది",
        txn_id: "లావాదేవీ ID", retry: "మళ్లీ ప్రయత్నించండి", go_home: "హోమ్"
    },
    ta: {
        lang: "தமிழ்", onboarding: "நிறுவன பதிவு", free_plan: "இலவச திட்டம்", support_plan: "ஆதரவு திட்டம்", pro_plan: "ப்ரோ திட்டம்",
        org_name: "நிறுவனத்தின் பெயர்", email: "மின்னஞ்சல்", contact: "தொலைபேசி எண்", password: "கடவுச்சொல்",
        proceed: "செலுத்தவும்", complete_reg: "பதிவை முடிக்கவும்", select_plan: "திட்டத்தை தேர்ந்தெடுக்கவும்",
        fill_details: "விவரங்களை நிரப்பவும்", success: "வெற்றி", processing: "காத்திருக்கவும்...",
        back: "பின்னால்", login_now: "டாஷ்போர்டுக்குச் செல்லவும்", 
        price_free: "₹0 / மாதம்", price_support: "₹29 / மாதம்", price_pro: "₹99 / மாதம்",
        desc_free: "அடிப்படை அணுகல்.", 
        desc_support: "சரிபார்க்கப்பட்ட சுயவிவரம் மற்றும் கருவிகள்.", 
        desc_pro: "அனைத்து கருவிகள் மற்றும் முன்னுரிமை ஆதரவு.",
        pay_failed: "கட்டணம் தோல்வியடைந்தது.", recommended: "பரிந்துரைக்கப்படுகிறது",
        txn_status: "கட்டண நிலை", txn_success: "கட்டணம் வெற்றி", txn_fail: "கட்டணம் தோல்வி",
        txn_id: "பரிவர்த்தனை ஐடி", retry: "மீண்டும் முயற்சிக்கவும்", go_home: "முகப்பு"
    },
    pa: {
        lang: "ਪੰਜਾਬੀ", onboarding: "ਸੰਗਠਨ ਰਜਿਸਟ੍ਰੇਸ਼ਨ", free_plan: "ਮੁਫਤ ਪਲਾਨ", support_plan: "ਸਹਾਇਤਾ ਪਲਾਨ", pro_plan: "ਪ੍ਰੋ ਪਲਾਨ",
        org_name: "ਸੰਗਠਨ ਦਾ ਨਾਮ", email: "ਈਮੇਲ", contact: "ਫੋਨ ਨੰਬਰ", password: "ਪਾਸਵਰਡ",
        proceed: "ਭੁਗਤਾਨ ਕਰੋ", complete_reg: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਪੂਰੀ ਕਰੋ", select_plan: "ਪਲਾਨ ਚੁਣੋ",
        fill_details: "ਵੇਰਵੇ ਭਰੋ", success: "ਸਫਲ", processing: "ਕਿਰਪਾ ਕਰਕੇ ਉਡੀਕ ਕਰੋ...",
        back: "ਪਿੱਛੇ", login_now: "ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਜਾਓ", 
        price_free: "₹0 / ਮਹੀਨਾ", price_support: "₹29 / ਮਹੀਨਾ", price_pro: "₹99 / ਮਹੀਨਾ",
        desc_free: "ਬੁਨਿਆਦੀ ਪਹੁੰਚ।", 
        desc_support: "ਪ੍ਰਮਾਣਿਤ ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਟੂਲ।", 
        desc_pro: "ਸਾਰੇ ਟੂਲ ਅਤੇ ਤਰਜੀਹੀ ਸਹਾਇਤਾ।",
        pay_failed: "ਭੁਗਤਾਨ ਅਸਫਲ।", recommended: "ਸਿਫਾਰਸ਼ੀ",
        txn_status: "ਭੁਗਤਾਨ ਦੀ ਸਥਿਤੀ", txn_success: "ਭੁਗਤਾਨ ਸਫਲ", txn_fail: "ਭੁਗਤਾਨ ਅਸਫਲ",
        txn_id: "ਲੈਣ-ਦੇਣ ਆਈਡੀ", retry: "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ", go_home: "ਹੋਮ"
    },
    bho: {
        lang: "भोजपुरी", onboarding: "संगठन पंजीकरण", free_plan: "मुफ्त प्लान", support_plan: "मदद प्लान", pro_plan: "प्रो प्लान",
        org_name: "संगठन के नाम", email: "ईमेल", contact: "फोन नंबर", password: "पासवर्ड",
        proceed: "भुगतान करीं", complete_reg: "पंजीकरण पूरा करीं", select_plan: "प्लान चुनीं",
        fill_details: "विवरण भरीं", success: "सफल", processing: "इंतजार करीं...",
        back: "पाछे", login_now: "डैशबोर्ड पर जाईं", 
        price_free: "₹0 / महिना", price_support: "₹29 / महिना", price_pro: "₹99 / महिना",
        desc_free: "बुनियादी पहुंच।", 
        desc_support: "सत्यापित प्रोफाइल आ टूल।", 
        desc_pro: "सब टूल आ प्राथमिकता समर्थन।",
        pay_failed: "भुगतान विफल।", recommended: "अनुशंसित",
        txn_status: "भुगतान के स्थिति", txn_success: "भुगतान सफल", txn_fail: "भुगतान विफल",
        txn_id: "लेनदेन आईडी", retry: "फेर से कोशिश करीं", go_home: "होम"
    },
    bn: {
        lang: "বাংলা", onboarding: "প্রতিষ্ঠান নিবন্ধন", free_plan: "ফ্রি প্ল্যান", support_plan: "সাপোর্ট প্ল্যান", pro_plan: "প্রো প্ল্যান",
        org_name: "প্রতিষ্ঠানের নাম", email: "ইমেইল", contact: "ফোন নম্বর", password: "পাসওয়ার্ড",
        proceed: "পেমেন্ট করুন", complete_reg: "নিবন্ধন সম্পূর্ণ করুন", select_plan: "প্ল্যান নির্বাচন করুন",
        fill_details: "বিবরণ পূরণ করুন", success: "সফল", processing: "অপেক্ষা করুন...",
        back: "ফিরে যান", login_now: "ড্যাশবোর্ডে যান", 
        price_free: "₹0 / মাস", price_support: "₹29 / মাস", price_pro: "₹99 / মাস",
        desc_free: "প্রাথমিক অ্যাক্সেস।", 
        desc_support: "যাচাইকৃত প্রোফাইল এবং টুল।", 
        desc_pro: "সমস্ত টুল এবং অগ্রাধিকার সমর্থন।",
        pay_failed: "পেমেন্ট ব্যর্থ হয়েছে।", recommended: "প্রস্তাবিত",
        txn_status: "পেমেন্ট অবস্থা", txn_success: "পেমেন্ট সফল", txn_fail: "পেমেন্ট ব্যর্থ",
        txn_id: "লেনদেন আইডি", retry: "আবার চেষ্টা করুন", go_home: "হোম"
    },
    kn: {
        lang: "ಕನ್ನಡ", onboarding: "ಸಂಸ್ಥೆ ನೋಂದಣಿ", free_plan: "ಉಚಿತ ಪ್ಲಾನ್", support_plan: "ಬೆಂಬಲ ಪ್ಲಾನ್", pro_plan: "ಪ್ರೊ ಪ್ಲಾನ್",
        org_name: "ಸಂಸ್ಥೆಯ ಹೆಸರು", email: "ಇಮೇಲ್", contact: "ಫೋನ್ ಸಂಖ್ಯೆ", password: "ಪಾಸ್ವರ್ಡ್",
        proceed: "ಪಾವತಿಸಿ", complete_reg: "ನೋಂದಣಿ ಪೂರ್ಣಗೊಳಿಸಿ", select_plan: "ಪ್ಲಾನ್ ಆಯ್ಕೆಮಾಡಿ",
        fill_details: "ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ", success: "ಯಶಸ್ವಿ", processing: "ದಯವಿಟ್ಟು ಕಾಯಿರಿ...",
        back: "ಹಿಂದಕ್ಕೆ", login_now: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ", 
        price_free: "₹0 / ತಿಂಗಳು", price_support: "₹29 / ತಿಂಗಳು", price_pro: "₹99 / ತಿಂಗಳು",
        desc_free: "ಮೂಲ ಪ್ರವೇಶ.", 
        desc_support: "ಪರಿಶೀಲಿಸಿದ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಪರಿಕರಗಳು.", 
        desc_pro: "ಎಲ್ಲಾ ಪರಿಕರಗಳು ಮತ್ತು ಆದ್ಯತೆಯ ಬೆಂಬಲ.",
        pay_failed: "ಪಾವತಿ ವಿಫಲವಾಗಿದೆ.", recommended: "ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ",
        txn_status: "ಪಾವತಿ ಸ್ಥಿತಿ", txn_success: "ಪಾವತಿ ಯಶಸ್ವಿ", txn_fail: "ಪಾವತಿ ವಿಫಲವಾಗಿದೆ",
        txn_id: "ವಹಿವಾಟು ಐಡಿ", retry: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ", go_home: "ಮುಖಪುಟ"
    },
    ml: {
        lang: "മലയാളം", onboarding: "സ്ഥാപന രജിസ്ട്രേഷൻ", free_plan: "സൗജന്യ പ്ലാൻ", support_plan: "പിന്തുണ പ്ലാൻ", pro_plan: "പ്രോ പ്ലാൻ",
        org_name: "സ്ഥാപനത്തിന്റെ പേര്", email: "ഇമെയിൽ", contact: "ഫോൺ നമ്പർ", password: "പാസ്‌വേഡ്",
        proceed: "പണമടയ്ക്കുക", complete_reg: "രജിസ്ട്രേഷൻ പൂർത്തിയാക്കുക", select_plan: "പ്ലാൻ തിരഞ്ഞെടുക്കുക",
        fill_details: "വിവരങ്ങൾ പൂരിപ്പിക്കുക", success: "വിജയകരം", processing: "കാത്തിരിക്കുക...",
        back: "പുറകോട്ട്", login_now: "ഡാഷ്‌ബോർഡിലേക്ക് പോകുക", 
        price_free: "₹0 / മാസം", price_support: "₹29 / മാസം", price_pro: "₹99 / മാസം",
        desc_free: "അടിസ്ഥാന ആക്സസ്.", 
        desc_support: "സ്ഥിരീകരിച്ച പ്രൊഫൈലും ടൂളുകളും.", 
        desc_pro: "എല്ലാ ടൂളുകളും മുൻഗണനാ പിന്തുണയും.",
        pay_failed: "പേയ്‌മെന്റ് പരാജയപ്പെട്ടു.", recommended: "ശുപാർശ ചെയ്യുന്നത്",
        txn_status: "പേയ്‌മെന്റ് നില", txn_success: "പേയ്‌മെന്റ് വിജയകരം", txn_fail: "പേയ്‌മെന്റ് പരാജയപ്പെട്ടു",
        txn_id: "ഇടപാട് ഐഡി", retry: "വീണ്ടും ശ്രമിക്കുക", go_home: "ഹോം"
    },
    or: {
        lang: "ଓଡ଼ିଆ", onboarding: "ସଂସ୍ଥା ପଞ୍ଜିକରଣ", free_plan: "ମାଗଣା ପ୍ଲାନ୍", support_plan: "ସମର୍ଥନ ପ୍ଲାନ୍", pro_plan: "ପ୍ରୋ ପ୍ଲାନ୍",
        org_name: "ସଂସ୍ଥାର ନାମ", email: "ଇମେଲ୍", contact: "ଫୋନ୍ ନମ୍ବର", password: "ପାସୱାର୍ଡ",
        proceed: "ପେମେଣ୍ଟ କରନ୍ତୁ", complete_reg: "ପଞ୍ଜିକରଣ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ", select_plan: "ପ୍ଲାନ୍ ବାଛନ୍ତୁ",
        fill_details: "ବିବରଣୀ ପୂରଣ କରନ୍ତୁ", success: "ସଫଳ", processing: "ଦୟାକରି ଅପେକ୍ଷା କରନ୍ତୁ...",
        back: "ପଛକୁ", login_now: "ଡ୍ୟାସବୋର୍ଡକୁ ଯାଆନ୍ତୁ", 
        price_free: "₹0 / ମାସ", price_support: "₹29 / ମାସ", price_pro: "₹99 / ମାସ",
        desc_free: "ପ୍ରାଥମିକ ଆକ୍ସେସ୍।", 
        desc_support: "ଯାଞ୍ଚ ହୋଇଥିବା ପ୍ରୋଫାଇଲ୍ ଏବଂ ଟୁଲ୍।", 
        desc_pro: "ସମସ୍ତ ଟୁଲ୍ ଏବଂ ପ୍ରାଥମିକତା ସମର୍ଥନ।",
        pay_failed: "ପେମେଣ୍ଟ ବିଫଳ ହୋଇଛି।", recommended: "ସୁପାରିଶ କରାଯାଇଛି",
        txn_status: "ପେମେଣ୍ଟ ସ୍ଥିତି", txn_success: "ପେମେଣ୍ଟ ସଫଳ", txn_fail: "ପେମେଣ୍ଟ ବିଫଳ",
        txn_id: "କାରବାର ଆଇଡି", retry: "ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ", go_home: "ହୋମ"
    },
    as: {
        lang: "অসমীয়া", onboarding: "সংস্থা পঞ্জীয়ন", free_plan: "বিনামূলীয়া প্লেন", support_plan: "সহায় প্লেন", pro_plan: "প্ৰ' প্লেন",
        org_name: "সংস্থাৰ নাম", email: "ইমেইল", contact: "ফোন নম্বৰ", password: "পাছৱৰ্ড",
        proceed: "পেমেন্ট কৰক", complete_reg: "পঞ্জীয়ন সম্পূৰ্ণ কৰক", select_plan: "প্লেন নিৰ্বাচন কৰক",
        fill_details: "বিৱৰণ পূৰণ কৰক", success: "সফল", processing: "অনুগ্ৰহ কৰি অপেক্ষা কৰক...",
        back: "উভতি যাওক", login_now: "ডেচবৰ্ডলৈ যাওক", 
        price_free: "₹0 / মাহ", price_support: "₹29 / মাহ", price_pro: "₹99 / মাহ",
        desc_free: "প্ৰাথমিক প্ৰৱেশাধিকাৰ।", 
        desc_support: "প্ৰমাণিত প্ৰফাইল আৰু সঁজুলি।", 
        desc_pro: "সকলো সঁজুলি আৰু অগ্ৰাধিকাৰ সমৰ্থন।",
        pay_failed: "পেমেন্ট বিফল হৈছে।", recommended: "পৰামৰ্শ দিয়া হৈছে",
        txn_status: "পেমেন্টৰ অৱস্থা", txn_success: "পেমেন্ট সফল", txn_fail: "পেমেন্ট বিফল",
        txn_id: "লেনদেনৰ আইডী", retry: "পুনৰ চেষ্টা কৰক", go_home: "হোম"
    }
};

export default function SevaSetuOnboarding() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const langDropdownRef = useRef(null);
    
    // Application States: 1=Plan, 2=Details, 3=Success (Free), 4=Transaction Receipt
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

    // Transaction Receipt State
    const [receiptData, setReceiptData] = useState({ status: null, txnid: null });

    // Super Admin Gateway Testing Override State
    const [adminOverrideAmount, setAdminOverrideAmount] = useState(null);

    const currentT = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    const languageOptions = Object.keys(TRANSLATIONS).map(key => ({ code: key, label: TRANSLATIONS[key].lang }));

    // Custom SVG Sliding Animation Sequence Logic
    const [animIndex, setAnimIndex] = useState(0);
    const CUSTOM_SVGS = [
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" key="rupee">
            <path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3c3.314 0 6-2.686 6-6 0-1.28-.404-2.46-1.087-3.42M13.5 13H6"/>
            <circle cx="12" cy="12" r="10" stroke="#111111" strokeWidth="0" strokeDasharray="2 2" />
        </svg>,
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" key="shield">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
        </svg>,
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" key="building">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
            <path d="M9 22v-4h6v4"/>
            <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M16 10h.01M8 10h.01M12 14h.01M16 14h.01M8 14h.01"/>
        </svg>,
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

    // Handle Return from PayU Standard Redirect & Trigger Receipt UI
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const payuStatus = urlParams.get('payu_status');
        const returnedTxnId = urlParams.get('txnid');

        if (payuStatus) {
            const storedDataStr = sessionStorage.getItem('seva_onboard_data');
            
            // Set Dedicated Receipt Data
            setReceiptData({ status: payuStatus, txnid: returnedTxnId });
            setStep(4); // Trigger Transaction Receipt UI
            
            if (storedDataStr) {
                const storedData = JSON.parse(storedDataStr);
                setFormData({
                    org_name: storedData.org_name || '',
                    email: storedData.email || '',
                    contact: storedData.contact || '',
                    password: storedData.password || ''
                });
                setSelectedPlan(storedData.selectedPlan || 'Support Plan');
                
                if (payuStatus === 'success') {
                    createPocketBaseUserFromRedirect(storedData, returnedTxnId || storedData.txnid).catch(err => {
                        console.error("Post-Payment PB Error:", err);
                        setReceiptData({ status: 'failure', txnid: returnedTxnId, error: err.message });
                    });
                }
            }
            window.history.replaceState({}, document.title, window.location.pathname);
            sessionStorage.removeItem('seva_onboard_data');
        }
    }, []);

    // STRICT UPDATE: Extracts the exact database validation error to prevent silent 400 Bad Requests
    const createPocketBaseUserFromRedirect = async (data, txnId) => {
        try {
            await pb.collection('ngo_users').create({
                email: data.email,
                password: data.password,
                passwordConfirm: data.password,
                org_name: data.org_name,
                contact: data.contact,
                plan_type: data.selectedPlan || 'Free Plan',
                payu_txn_id: txnId || 'FREE_TXN',
                status: 'Active'
            });
            return true;
        } catch (error) {
            console.error("PocketBase Creation Error:", error);
            let extractedMsg = "Database validation failed. Please check your details.";
            if (error.response && error.response.data) {
                const invalidFields = Object.keys(error.response.data);
                if (invalidFields.length > 0) {
                    const firstField = invalidFields[0];
                    const detail = error.response.data[firstField].message;
                    extractedMsg = `Error in ${firstField}: ${detail}`;
                }
            }
            throw new Error(extractedMsg);
        }
    };

    const handlePlanSelect = (planName) => {
        setSelectedPlan(planName);
        setStep(2);
    };

    const handleRegistration = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setErrorMessage('');

        const isTestMode = formData.email === 'testcodecfg@gmail.com';
        let amount = '0.00';

        // STRICT ADMIN GATEWAY TESTING OVERRIDE
        if (isTestMode && adminOverrideAmount !== null) {
            amount = adminOverrideAmount;
        } else {
            if (selectedPlan === 'Support Plan') amount = '29.00';
            if (selectedPlan === 'Professional Plan') amount = '99.00';
        }

        const txnid = "SEVA" + new Date().getTime();

        // STRICT UPDATE: Capture database errors for Free Plan immediately
        if (amount === '0.00') {
            try {
                await createPocketBaseUserFromRedirect({ ...formData, selectedPlan }, txnid);
                setStep(3); // Route to standard Free Success
            } catch (err) {
                setErrorMessage(err.message);
                setIsProcessing(false);
            }
            return;
        }

        try {
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

            const surlUrl = `https://msevasetupay.vercel.app/api/payu-callback`;
            const furlUrl = `https://msevasetupay.vercel.app/api/payu-callback`;

            sessionStorage.setItem('seva_onboard_data', JSON.stringify({ ...formData, selectedPlan, txnid }));

            const payuUrl = isTestMode ? 'https://test.payu.in/_payment' : 'https://secure.payu.in/_payment';
            const form = document.createElement('form');
            form.action = payuUrl;
            form.method = 'POST';
            form.style.display = 'none';

            const params = {
                key: isTestMode ? 'gtKFFx' : import.meta.env.VITE_PAYU_MERCHANT_KEY,
                txnid: txnid,
                hash: hashData.hash,
                amount: amount,
                productinfo: `${selectedPlan} Subscription`,
                firstname: formData.org_name.substring(0, 10),
                email: formData.email,
                phone: formData.contact,
                surl: surlUrl,
                furl: furlUrl
            };

            for (const key in params) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = params[key];
                form.appendChild(input);
            }

            document.body.appendChild(form);
            form.submit();

        } catch (error) {
            console.error("Registration Processing Error:", error);
            setErrorMessage(error.message || currentT.pay_failed);
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
                <div className="w-full md:w-1/3 bg-[#F9FAFB] border-r border-[#E5E7EB] p-8 flex flex-col items-center justify-center relative hidden md:flex">
                    <div className="flex items-center gap-0.3 mb-12">
                        <img src="/logo-7.png" alt="Movyra" className="h-10 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                        <span className="font-black text-[1.8rem] tracking-tighter text-[#111111]">ovyra <span className="text-[#2563EB]">SevaSetu</span></span>
                    </div>

                    <div className="relative w-48 h-48 flex items-center justify-center mb-8 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div key={animIndex} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5, ease: "easeInOut" }} className="absolute flex items-center justify-center">
                                {CUSTOM_SVGS[animIndex]}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <h2 className="text-xl font-black text-[#111111] text-center mb-2">{currentT.onboarding}</h2>
                    <p className="text-[#6B7280] font-medium text-center text-sm">Join the network of verified organizations providing civic support.</p>
                </div>

                {/* Right Side: Interactive Content */}
                <div className="w-full md:w-2/3 p-6 md:p-12 bg-[#FFFFFF]">
                    
                    {/* Mobile Header */}
                    <div className="flex md:hidden items-center justify-center gap-0.3 mb-8">
                        <img src="/logo-7.png" alt="Movyra" className="h-8 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                        <span className="font-black text-[1.4rem] tracking-tighter text-[#111111]">ovyra <span className="text-[#2563EB]">SevaSetu</span></span>
                    </div>

                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full justify-center">
                            <h3 className="text-2xl font-black text-[#111111] mb-6 text-center md:text-left">{currentT.select_plan}</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                <div onClick={() => handlePlanSelect('Free Plan')} className="border-2 border-[#E5E7EB] rounded-xl p-6 cursor-pointer hover:border-[#6B7280] transition-colors bg-[#F9FAFB]">
                                    <h4 className="text-lg font-black text-[#111111] mb-2">{currentT.free_plan}</h4>
                                    <p className="text-xl font-black text-[#6B7280] mb-4">{currentT.price_free}</p>
                                    <p className="text-[#4B5563] text-xs font-medium leading-relaxed">{currentT.desc_free}</p>
                                </div>
                                
                                <div onClick={() => handlePlanSelect('Support Plan')} className="border-2 border-[#2563EB] rounded-xl p-6 cursor-pointer bg-[#EFF6FF] shadow-sm relative overflow-hidden transform transition hover:-translate-y-1">
                                    <div className="absolute top-0 right-0 bg-[#2563EB] text-[#FFFFFF] text-[0.6rem] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-wider">{currentT.recommended}</div>
                                    <h4 className="text-lg font-black text-[#111111] mb-2">{currentT.support_plan}</h4>
                                    <p className="text-xl font-black text-[#2563EB] mb-4">{currentT.price_support}</p>
                                    <p className="text-[#4B5563] text-xs font-medium leading-relaxed">{currentT.desc_support}</p>
                                </div>

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
                                
                                {/* STRICT SUPER ADMIN OVERRIDE PANEL */}
                                {formData.email === 'testcodecfg@gmail.com' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-[#FFFBEB] border border-[#D97706] rounded-xl p-4 flex flex-col gap-3">
                                        <p className="text-[#D97706] font-black text-sm uppercase tracking-wider flex items-center gap-2"><ShieldCheck size={16}/> Super Admin Sandbox Tools</p>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setAdminOverrideAmount('1.00')} className={`flex-1 py-2 rounded-lg font-bold text-[0.8rem] border outline-none ${adminOverrideAmount === '1.00' ? 'bg-[#D97706] text-[#FFFFFF] border-[#D97706]' : 'bg-[#FFFFFF] text-[#D97706] border-[#D97706]'}`}>Force ₹1.00 Test</button>
                                            <button type="button" onClick={() => setAdminOverrideAmount('0.00')} className={`flex-1 py-2 rounded-lg font-bold text-[0.8rem] border outline-none ${adminOverrideAmount === '0.00' ? 'bg-[#D97706] text-[#FFFFFF] border-[#D97706]' : 'bg-[#FFFFFF] text-[#D97706] border-[#D97706]'}`}>Force ₹0.00 Bypass</button>
                                            <button type="button" onClick={() => setAdminOverrideAmount(null)} className="px-3 py-2 rounded-lg font-bold text-[#6B7280] hover:bg-[#F3F4F6] border border-transparent outline-none">Clear</button>
                                        </div>
                                    </motion.div>
                                )}

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
                                        {isProcessing ? currentT.processing : (selectedPlan === 'Free Plan' || adminOverrideAmount === '0.00' ? currentT.complete_reg : currentT.proceed)}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-24 h-24 bg-[#ECFDF5] rounded-full flex items-center justify-center mb-6">
                                <ShieldCheck size={48} className="text-[#16A34A]" />
                            </div>
                            <h3 className="text-3xl font-black text-[#111111] mb-2">{currentT.success}</h3>
                            <p className="text-[#6B7280] font-medium mb-8">Your organization has been securely registered on SevaSetu.</p>
                            <button onClick={() => window.location.href = '/sevasetu-org'} className="px-8 py-4 bg-[#111111] text-[#FFFFFF] rounded-xl font-black hover:bg-[#000000] outline-none flex items-center gap-2">
                                {currentT.login_now} <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    )}

                    {/* DEDICATED TRANSACTION RECEIPT SCREEN */}
                    {step === 4 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-full justify-center items-center text-center py-6">
                            <div className="flex items-center gap-2 mb-8">
                                <img src="/logo-7.png" alt="Movyra" className="h-8 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                <span className="font-black text-[1.6rem] tracking-tighter text-[#111111]">ovyra <span className="text-[#2563EB]">SevaSetu</span></span>
                            </div>
                            
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${receiptData.status === 'success' ? 'bg-[#ECFDF5]' : 'bg-[#FEF2F2]'}`}>
                                {receiptData.status === 'success' ? <ShieldCheck size={48} className="text-[#16A34A]" /> : <AlertCircle size={48} className="text-[#DC2626]" />}
                            </div>
                            
                            <h3 className="text-3xl font-black text-[#111111] mb-2">{currentT.txn_status}</h3>
                            <p className={`text-xl font-black mb-6 ${receiptData.status === 'success' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                                {receiptData.status === 'success' ? currentT.txn_success : currentT.txn_fail}
                            </p>
                            
                            {receiptData.error && (
                                <p className="text-[0.85rem] font-bold text-center text-[#DC2626] mb-4">{receiptData.error}</p>
                            )}

                            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-6 w-full max-w-sm mb-8">
                                <p className="text-[#6B7280] font-bold text-sm uppercase tracking-wider mb-1">{currentT.txn_id}</p>
                                <p className="text-[#111111] font-mono text-lg">{receiptData.txnid || "N/A"}</p>
                            </div>

                            <div className="flex flex-col w-full max-w-sm gap-3">
                                {receiptData.status === 'success' ? (
                                    <button onClick={() => window.location.href = '/sevasetu-org'} className="w-full py-4 bg-[#111111] text-[#FFFFFF] rounded-xl font-black hover:bg-[#000000] outline-none flex items-center justify-center gap-2">
                                        {currentT.login_now} <ArrowRight size={18} />
                                    </button>
                                ) : (
                                    <button onClick={() => setStep(2)} className="w-full py-4 bg-[#2563EB] text-[#FFFFFF] rounded-xl font-black hover:bg-[#1D4ED8] outline-none flex items-center justify-center gap-2">
                                        <RefreshCw size={18} /> {currentT.retry}
                                    </button>
                                )}
                                
                                <div className="flex gap-3">
                                    <button onClick={() => { setReceiptData({status: null, txnid: null}); setStep(1); }} className="flex-1 py-4 bg-[#F3F4F6] text-[#111111] rounded-xl font-bold hover:bg-[#E5E7EB] outline-none flex items-center justify-center gap-2">
                                        <ArrowLeft size={16} /> {currentT.back}
                                    </button>
                                    <button onClick={() => navigate('/landing')} className="flex-1 py-4 bg-[#F3F4F6] text-[#111111] rounded-xl font-bold hover:bg-[#E5E7EB] outline-none flex items-center justify-center gap-2">
                                        <Home size={16} /> {currentT.go_home}
                                    </button>
                                </div>
                            </div>
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