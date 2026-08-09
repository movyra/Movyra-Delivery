/**
 * SYSTEM DOCUMENTATION / FRONTEND FIREBASE AUTH & 14-LANGUAGE TRANSLATION
 * Context: Secure Administrative Dashboard.
 * Database: PocketBase for primary data.
 * Auth/Reset: Native Firebase Client SDK for Password Resets & Session Updates.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Search, X, Globe, Image as ImageIcon, Download, Printer, Trash2, Filter, Camera, Key } from 'lucide-react';
import PocketBase from 'pocketbase';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

const PB_URL = 'https://movyra-mv-main-db-gradio.hf.space';
const pb = new PocketBase(PB_URL);
const SUPER_ADMIN_EMAIL = 'testcodecfg@gmail.com';

const TRANSLATIONS = {
    en: {
        lang: "English", admin_portal: "Admin Portal", email: "Email Address", password: "Password",
        login: "Secure Login", dashboard: "Operations Dashboard", ack: "Acknowledgement",
        org: "Organization", contact: "Contact", live_photo: "Live Photo", doc: "Document",
        status: "Status", action: "Action", pending: "Pending", verified: "Verified",
        rejected: "Rejected", update: "Update", logout: "Logout", loading: "Processing...",
        search: "Search Records", view: "View Image", total: "Total", export_csv: "Export CSV",
        print: "Print", delete: "Delete", bulk_update: "Apply Bulk Status", filter_all: "All Status",
        forgot_pwd: "Forgot Password?", request_access: "Request Admin Access", send_reset: "Send Reset Link",
        submit_req: "Submit Request", name: "Full Name", reason: "Reason for Access", back: "Back to Login",
        prev: "Previous", next: "Next", page: "Page", change_pwd: "Change Password"
    },
    hi: {
        lang: "हिन्दी", admin_portal: "एडमिन पोर्टल", email: "ईमेल पता", password: "पासवर्ड", login: "लॉगिन करें", 
        dashboard: "डैशबोर्ड", ack: "पावती", org: "संगठन", contact: "संपर्क", live_photo: "लाइव फोटो", doc: "दस्तावेज़", 
        status: "स्थिति", action: "कार्रवाई", pending: "लंबित", verified: "सत्यापित", rejected: "अस्वीकृत", update: "अपडेट", 
        logout: "लॉगआउट", loading: "प्रसंस्करण...", search: "खोजें", view: "छवि देखें", total: "कुल", export_csv: "CSV निर्यात", 
        print: "प्रिंट", delete: "हटाएं", bulk_update: "थोक अपडेट", filter_all: "सभी स्थिति", forgot_pwd: "पासवर्ड भूल गए?", 
        request_access: "एक्सेस अनुरोध", send_reset: "लिंक भेजें", submit_req: "अनुरोध सबमिट करें", name: "पूरा नाम", 
        reason: "कारण", back: "वापस जाएं", prev: "पिछला", next: "अगला", page: "पृष्ठ", change_pwd: "पासवर्ड बदलें"
    },
    hinglish: {
        lang: "Hinglish", admin_portal: "Admin Portal", email: "Email Address", password: "Password", login: "Login Karein", 
        dashboard: "Dashboard", ack: "Acknowledgement", org: "Organization", contact: "Contact", live_photo: "Live Photo", 
        doc: "Document", status: "Status", action: "Action", pending: "Pending", verified: "Verified", rejected: "Rejected", 
        update: "Update Karein", logout: "Logout", loading: "Processing...", search: "Search Karein", view: "Image Dekhein", 
        total: "Total", export_csv: "CSV Export", print: "Print Karein", delete: "Delete Karein", bulk_update: "Bulk Update", 
        filter_all: "All Status", forgot_pwd: "Password Bhool Gaye?", request_access: "Access Request", send_reset: "Link Bhejein", 
        submit_req: "Submit Karein", name: "Full Name", reason: "Reason", back: "Back to Login", prev: "Peechhe", 
        next: "Aage", page: "Page", change_pwd: "Password Badlein"
    },
    mr: {
        lang: "मराठी", admin_portal: "प्रशासक पोर्टल", email: "ईमेल पत्ता", password: "पासवर्ड", login: "लॉग इन करा", 
        dashboard: "डॅशबोर्ड", ack: "पोचपावती", org: "संस्था", contact: "संपर्क", live_photo: "थेट फोटो", doc: "दस्तऐवज", 
        status: "स्थिती", action: "कृती", pending: "प्रलंबित", verified: "सत्यापित", rejected: "नाकारले", update: "अपडेट करा", 
        logout: "लॉगआउट", loading: "प्रक्रिया...", search: "शोधा", view: "प्रतिमा पहा", total: "एकूण", export_csv: "CSV निर्यात", 
        print: "प्रिंट", delete: "काढून टाका", bulk_update: "एकत्रित अपडेट", filter_all: "सर्व स्थिती", forgot_pwd: "पासवर्ड विसरलात?", 
        request_access: "प्रवेश विनंती", send_reset: "लिंक पाठवा", submit_req: "विनंती सबमिट करा", name: "पूर्ण नाव", 
        reason: "कारण", back: "मागे जा", prev: "मागील", next: "पुढील", page: "पृष्ठ", change_pwd: "पासवर्ड बदला"
    },
    gu: {
        lang: "ગુજરાતી", admin_portal: "એડમિન પોર્ટલ", email: "ઇમેઇલ સરનામું", password: "પાસવર્ડ", login: "લૉગિન કરો", 
        dashboard: "ડેશબોર્ડ", ack: "સ્વીકૃતિ", org: "સંસ્થા", contact: "સંપર્ક", live_photo: "લાઇવ ફોટો", doc: "દસ્તાવેજ", 
        status: "સ્થિતિ", action: "ક્રિયા", pending: "બાકી", verified: "ચકાસાયેલ", rejected: "નકારવામાં આવેલ", update: "અપડેટ કરો", 
        logout: "લોગઆઉટ", loading: "પ્રક્રિયા...", search: "શોધો", view: "છબી જુઓ", total: "કુલ", export_csv: "CSV નિકાસ", 
        print: "છાપો", delete: "કાઢી નાખો", bulk_update: "બલ્ક અપડેટ", filter_all: "તમામ સ્થિતિ", forgot_pwd: "પાસવર્ડ ભૂલી ગયા છો?", 
        request_access: "ઍક્સેસ વિનંતી", send_reset: "લિન્ક મોકલો", submit_req: "વિનંતી સબમિટ કરો", name: "પૂરું નામ", 
        reason: "કારણ", back: "પાછા જાઓ", prev: "પાછલું", next: "આગળ", page: "પૃષ્ઠ", change_pwd: "પાસવર્ડ બદલો"
    },
    te: {
        lang: "తెలుగు", admin_portal: "అడ్మిన్ పోర్టల్", email: "ఈమెయిల్", password: "పాస్‌వర్డ్", login: "లాగిన్ చేయండి", 
        dashboard: "డాష్‌బోర్డ్", ack: "అక్నాలెడ్జ్‌మెంట్", org: "సంస్థ", contact: "సంప్రదింపు", live_photo: "లైవ్ ఫోటో", doc: "పత్రం", 
        status: "స్థితి", action: "చర్య", pending: "పెండింగ్", verified: "ధృవీకరించబడింది", rejected: "తిరస్కరించబడింది", 
        update: "అప్‌డేట్ చేయండి", logout: "లాగౌట్", loading: "ప్రాసెస్...", search: "శోధించండి", view: "చిత్రం చూడండి", total: "మొత్తం", 
        export_csv: "CSV ఎగుమతి", print: "ప్రింట్", delete: "తొలగించు", bulk_update: "బల్క్ అప్‌డేట్", filter_all: "అన్ని స్థితి", 
        forgot_pwd: "పాస్‌వర్డ్ మర్చిపోయారా?", request_access: "యాక్సెస్ అభ్యర్థన", send_reset: "లింక్ పంపండి", submit_req: "సమర్పించండి", 
        name: "పూర్తి పేరు", reason: "కారణం", back: "వెనక్కి వెళ్ళు", prev: "మునుపటి", next: "తదుపరి", page: "పేజీ", 
        change_pwd: "పాస్‌వర్డ్ మార్చండి"
    },
    ta: {
        lang: "தமிழ்", admin_portal: "நிர்வாகி போர்டல்", email: "மின்னஞ்சல்", password: "கடவுச்சொல்", login: "உள்நுழைக", 
        dashboard: "டாஷ்போர்டு", ack: "ஒப்புகை", org: "நிறுவனம்", contact: "தொடர்பு", live_photo: "நேரடி புகைப்படம்", doc: "ஆவணம்", 
        status: "நிலை", action: "செயல்", pending: "நிலுவையில்", verified: "சரிபார்க்கப்பட்டது", rejected: "நிராகரிக்கப்பட்டது", 
        update: "புதுப்பி", logout: "வெளியேறு", loading: "செயலாக்கம்...", search: "தேடு", view: "படம் காண்", total: "மொத்தம்", 
        export_csv: "CSV பதிவிறக்கம்", print: "அச்சிடு", delete: "நீக்கு", bulk_update: "மொத்த புதுப்பிப்பு", filter_all: "அனைத்து நிலை", 
        forgot_pwd: "கடவுச்சொல் மறந்துவிட்டதா?", request_access: "அணுகல் கோரிக்கை", send_reset: "இணைப்பை அனுப்பு", submit_req: "சமர்ப்பி", 
        name: "முழு பெயர்", reason: "காரணம்", back: "திரும்பிச் செல்", prev: "முந்தைய", next: "அடுத்தது", page: "பக்கம்", 
        change_pwd: "கடவுச்சொல் மாற்று"
    },
    pa: {
        lang: "ਪੰਜਾਬੀ", admin_portal: "ਐਡਮਿਨ ਪੋਰਟਲ", email: "ਈਮੇਲ", password: "ਪਾਸਵਰਡ", login: "ਲਾਗਇਨ ਕਰੋ", 
        dashboard: "ਡੈਸ਼ਬੋਰਡ", ack: "ਰਸੀਦ", org: "ਸੰਗਠਨ", contact: "ਸੰਪਰਕ", live_photo: "ਲਾਈਵ ਫੋਟੋ", doc: "ਦਸਤਾਵੇਜ਼", 
        status: "ਸਥਿਤੀ", action: "ਕਾਰਵਾਈ", pending: "ਬਕਾਇਆ", verified: "ਪ੍ਰਮਾਣਿਤ", rejected: "ਰੱਦ", update: "ਅੱਪਡੇਟ ਕਰੋ", 
        logout: "ਲਾਗਆਊਟ", loading: "ਪ੍ਰਕਿਰਿਆ...", search: "ਖੋਜੋ", view: "ਤਸਵੀਰ ਵੇਖੋ", total: "ਕੁੱਲ", export_csv: "CSV ਡਾਊਨਲੋਡ", 
        print: "ਪ੍ਰਿੰਟ", delete: "ਮਿਟਾਓ", bulk_update: "ਬਲਕ ਅੱਪਡੇਟ", filter_all: "ਸਾਰੀ ਸਥਿਤੀ", forgot_pwd: "ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?", 
        request_access: "ਪਹੁੰਚ ਬੇਨਤੀ", send_reset: "ਲਿੰਕ ਭੇਜੋ", submit_req: "ਬੇਨਤੀ ਜਮ੍ਹਾਂ ਕਰੋ", name: "ਪੂਰਾ ਨਾਮ", 
        reason: "ਕਾਰਨ", back: "ਵਾਪਸ ਜਾਓ", prev: "ਪਿਛਲਾ", next: "ਅਗਲਾ", page: "ਪੰਨਾ", change_pwd: "ਪਾਸਵਰਡ ਬਦਲੋ"
    },
    bho: {
        lang: "भोजपुरी", admin_portal: "एडमिन पोर्टल", email: "ईमेल", password: "पासवर्ड", login: "लॉगिन करीं", 
        dashboard: "डैशबोर्ड", ack: "पावती", org: "संगठन", contact: "संपर्क", live_photo: "लाइव फोटो", doc: "दस्तावेज", 
        status: "स्थिति", action: "कार्रवाई", pending: "लंबित", verified: "सत्यापित", rejected: "अस्वीकृत", update: "अपडेट करीं", 
        logout: "लॉगआउट", loading: "प्रक्रिया...", search: "खोजीं", view: "फोटो देखीं", total: "कुल", export_csv: "CSV डाउनलोड", 
        print: "प्रिंट", delete: "हटावल जाव", bulk_update: "सब अपडेट", filter_all: "सभ स्थिति", forgot_pwd: "पासवर्ड भुला गइल?", 
        request_access: "एक्सेस अनुरोध", send_reset: "लिंक भेजीं", submit_req: "अनुरोध जमा करीं", name: "पूरा नाम", 
        reason: "कारण", back: "वापस जाईं", prev: "पिछला", next: "अगला", page: "पन्ना", change_pwd: "पासवर्ड बदलीं"
    },
    bn: {
        lang: "বাংলা", admin_portal: "অ্যাডমিন পোর্টাল", email: "ইমেইল", password: "পাসওয়ার্ড", login: "লগইন", 
        dashboard: "ড্যাশবোর্ড", ack: "রসিদ", org: "প্রতিষ্ঠান", contact: "যোগাযোগ", live_photo: "লাইভ ছবি", doc: "নথি", 
        status: "অবস্থা", action: "পদক্ষেপ", pending: "অপেক্ষমান", verified: "যাচাইকৃত", rejected: "বাতিল", update: "আপডেট", 
        logout: "লগআউট", loading: "প্রক্রিয়া চলছে...", search: "অনুসন্ধান", view: "ছবি দেখুন", total: "মোট", export_csv: "CSV ডাউনলোড", 
        print: "প্রিন্ট", delete: "মুছুন", bulk_update: "সব আপডেট করুন", filter_all: "সব অবস্থা", forgot_pwd: "পাসওয়ার্ড ভুলে গেছেন?", 
        request_access: "অ্যাক্সেস অনুরোধ", send_reset: "লিঙ্ক পাঠান", submit_req: "অনুরোধ জমা দিন", name: "পুরো নাম", 
        reason: "কারণ", back: "ফিরে যান", prev: "আগের", next: "পরবর্তী", page: "পৃষ্ঠা", change_pwd: "পাসওয়ার্ড পরিবর্তন"
    },
    kn: {
        lang: "ಕನ್ನಡ", admin_portal: "ಅಡ್ಮಿನ್ ಪೋರ್ಟಲ್", email: "ಇಮೇಲ್", password: "ಪಾಸ್ವರ್ಡ್", login: "ಲಾಗಿನ್", 
        dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", ack: "ರಶೀದಿ", org: "ಸಂಸ್ಥೆ", contact: "ಸಂಪರ್ಕ", live_photo: "ಲೈವ್ ಫೋಟೋ", doc: "ದಾಖಲೆ", 
        status: "ಸ್ಥಿತಿ", action: "ಕ್ರಮ", pending: "ಬಾಕಿಯಿದೆ", verified: "ಪರಿಶೀಲಿಸಲಾಗಿದೆ", rejected: "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ", update: "ಅಪ್ಡೇಟ್", 
        logout: "ಲಾಗ್ಔಟ್", loading: "ಪ್ರಕ್ರಿಯೆ...", search: "ಹುಡುಕಿ", view: "ಚಿತ್ರ ನೋಡಿ", total: "ಒಟ್ಟು", export_csv: "CSV ಡೌನ್‌ಲೋಡ್", 
        print: "ಪ್ರಿಂಟ್", delete: "ಅಳಿಸಿ", bulk_update: "ಎಲ್ಲಾ ಅಪ್ಡೇಟ್", filter_all: "ಎಲ್ಲಾ ಸ್ಥಿತಿ", forgot_pwd: "ಪಾಸ್ವರ್ಡ್ ಮರೆತಿರಾ?", 
        request_access: "ಪ್ರವೇಶ ವಿನಂತಿ", send_reset: "ಲಿಂಕ್ ಕಳುಹಿಸಿ", submit_req: "ವಿನಂತಿ ಸಲ್ಲಿಸಿ", name: "ಪೂರ್ಣ ಹೆಸರು", 
        reason: "ಕಾರಣ", back: "ಹಿಂದಕ್ಕೆ", prev: "ಹಿಂದಿನ", next: "ಮುಂದಿನ", page: "ಪುಟ", change_pwd: "ಪಾಸ್ವರ್ಡ್ ಬದಲಾಯಿಸಿ"
    },
    ml: {
        lang: "മലയാളം", admin_portal: "അഡ്മിൻ പോർട്ടൽ", email: "ഇമെയിൽ", password: "പാസ്‌വേഡ്", login: "ലോഗിൻ", 
        dashboard: "ഡാഷ്‌ബോർഡ്", ack: "രസീത്", org: "സ്ഥാപനം", contact: "ബന്ധപ്പെടുക", live_photo: "ലൈവ് ഫോട്ടോ", doc: "രേഖ", 
        status: "അവസ്ഥ", action: "നടപടി", pending: "തീരുമാനിച്ചിട്ടില്ല", verified: "ഉറപ്പാക്കി", rejected: "നിരസിച്ചു", update: "അപ്ഡേറ്റ്", 
        logout: "ലോഗൗട്ട്", loading: "പ്രവർത്തിക്കുന്നു...", search: "തിരയുക", view: "ചിത്രം കാണുക", total: "ആകെ", export_csv: "CSV ഡൗൺലോഡ്", 
        print: "പ്രിന്റ്", delete: "മായ്ക്കുക", bulk_update: "എല്ലാം അപ്ഡേറ്റ്", filter_all: "എല്ലാ അവസ്ഥയും", forgot_pwd: "പാസ്‌വേഡ് മറന്നോ?", 
        request_access: "ആക്സസ് അപേക്ഷ", send_reset: "ലിങ്ക് അയക്കുക", submit_req: "സമർപ്പിക്കുക", name: "പൂർണ്ണ പേര്", 
        reason: "കാരണം", back: "പുറകോട്ട്", prev: "മുമ്പത്തെ", next: "അടുത്തത്", page: "പേജ്", change_pwd: "പാസ്‌വേഡ് മാറ്റുക"
    },
    or: {
        lang: "ଓଡ଼ିଆ", admin_portal: "ଆଡମିନ୍ ପୋର୍ଟାଲ୍", email: "ଇମେଲ୍", password: "ପାସୱାର୍ଡ", login: "ଲଗଇନ୍", 
        dashboard: "ଡ୍ୟାସବୋର୍ଡ", ack: "ରସିଦ", org: "ସଂସ୍ଥା", contact: "ସମ୍ପର୍କ", live_photo: "ଲାଇଭ୍ ଫଟୋ", doc: "କାଗଜପତ୍ର", 
        status: "ସ୍ଥିତି", action: "କାର୍ଯ୍ୟ", pending: "ବାକି ଅଛି", verified: "ଯାଞ୍ଚ ହୋଇଛି", rejected: "ପ୍ରତ୍ୟାଖ୍ୟାନ", update: "ଅପଡେଟ୍", 
        logout: "ଲଗଆଉଟ୍", loading: "ପ୍ରକ୍ରିୟା...", search: "ସନ୍ଧାନ", view: "ଫଟୋ ଦେଖନ୍ତୁ", total: "ମୋଟ", export_csv: "CSV ଡାଉନଲୋଡ୍", 
        print: "ପ୍ରିଣ୍ଟ", delete: "ଡିଲିଟ୍", bulk_update: "ସବୁ ଅପଡେଟ୍", filter_all: "ସବୁ ସ୍ଥିତି", forgot_pwd: "ପାସୱାର୍ଡ ଭୁଲିଗଲେ କି?", 
        request_access: "ଆକ୍ସେସ୍ ଅନୁରୋଧ", send_reset: "ଲିଙ୍କ୍ ପଠାନ୍ତୁ", submit_req: "ଦାଖଲ କରନ୍ତୁ", name: "ପୂରା ନାମ", 
        reason: "କାରଣ", back: "ପଛକୁ ଯାଆନ୍ତୁ", prev: "ପୂର୍ବ", next: "ପରବର୍ତ୍ତୀ", page: "ପୃଷ୍ଠା", change_pwd: "ପାସୱାର୍ଡ ବଦଳାନ୍ତୁ"
    },
    as: {
        lang: "অসমীয়া", admin_portal: "এডমিন প'ৰ্টেল", email: "ইমেইল", password: "পাছৱৰ্ড", login: "লগইন", 
        dashboard: "ডেচবৰ্ড", ack: "ৰচিদ", org: "সংস্থা", contact: "যোগাযোগ", live_photo: "লাইভ ফটো", doc: "নথি", 
        status: "অৱস্থা", action: "পদক্ষেপ", pending: "বাকি আছে", verified: "পৰীক্ষা কৰা হ'ল", rejected: "বাতিল", update: "আপডেট", 
        logout: "লগআউট", loading: "প্ৰক্ৰিয়া...", search: "সন্ধান", view: "ফটো চাওক", total: "মুঠ", export_csv: "CSV ডাউনলোড", 
        print: "প্ৰিণ্ট", delete: "মচি পেলাওক", bulk_update: "সকলো আপডেট", filter_all: "সকলো অৱস্থা", forgot_pwd: "পাছৱৰ্ড পাহৰিলে নেকি?", 
        request_access: "এক্সেস অনুৰোধ", send_reset: "লিংক পঠাওক", submit_req: "জমা দিয়ক", name: "সম্পূৰ্ণ নাম", 
        reason: "কাৰণ", back: "উভতি যাওক", prev: "পূৰ্বৱৰ্তী", next: "পৰৱৰ্তী", page: "পৃষ্ঠা", change_pwd: "পাছৱৰ্ড সলনি কৰক"
    }
};

export default function SevaSetuAdmin() {
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    
    // Auth & Role States
    const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid && pb.authStore.isAdmin);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [email, setEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authMessage, setAuthMessage] = useState({ text: '', type: '' });

    // Public Modals
    const [activeModal, setActiveModal] = useState(null); // 'login', 'forgot', 'request', 'change_pwd'
    const [resetEmail, setResetEmail] = useState('');
    const [reqForm, setReqForm] = useState({ name: '', email: '', reason: '' });

    // Data States & Pagination
    const [records, setRecords] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Bulk Actions & Print
    const [selectedRecords, setSelectedRecords] = useState([]);
    const [bulkStatus, setBulkStatus] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [recordToPrint, setRecordToPrint] = useState(null);

    const currentT = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    const languageOptions = Object.keys(TRANSLATIONS).map(key => ({ code: key, label: TRANSLATIONS[key].lang }));

    useEffect(() => {
        if (isAuthenticated) {
            setIsSuperAdmin(pb.authStore.model?.email === SUPER_ADMIN_EMAIL);
            fetchRecords();
        }
    }, [isAuthenticated]);

    // ==========================================
    // AUTHENTICATION LOGIC
    // ==========================================

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsAuthenticating(true);
        setAuthMessage({ text: '', type: '' });
        try {
            await pb.admins.authWithPassword(email, loginPassword);
            setIsAuthenticated(true);
        } catch (error) {
            setAuthMessage({ text: 'Authentication failed.', type: 'error' });
            pb.authStore.clear();
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleLogout = () => {
        pb.authStore.clear();
        if (auth.currentUser) auth.signOut();
        setIsAuthenticated(false);
        setIsSuperAdmin(false);
        setRecords([]);
    };

    // LOGGED-OUT: FRONTEND FIREBASE "FORGOT PASSWORD" FLOW
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsAuthenticating(true);
        setAuthMessage({ text: '', type: '' });

        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setAuthMessage({ text: 'Reset link sent successfully. Please check your inbox.', type: 'success' });
            setTimeout(() => setActiveModal(null), 4000);
        } catch (error) {
            console.error('Firebase Auth Error:', error);
            setAuthMessage({ text: error.message || 'Failed to send reset email.', type: 'error' });
        } finally {
            setIsAuthenticating(false);
        }
    };

    // LOGGED-IN: SECURE "CHANGE PASSWORD" FLOW (Pulls Session Email)
    const handleSessionPasswordUpdate = async (e) => {
        e.preventDefault();
        if (!isAuthenticated || !pb.authStore.model?.email) return;

        setIsAuthenticating(true);
        setAuthMessage({ text: '', type: '' });

        try {
            await sendPasswordResetEmail(auth, pb.authStore.model.email);
            setAuthMessage({ text: 'Secure reset link sent to your registered email.', type: 'success' });
            setTimeout(() => setActiveModal(null), 3000);
        } catch (error) {
            console.error('Session Update Error:', error);
            setAuthMessage({ text: error.message || 'Failed to trigger password reset.', type: 'error' });
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleRequestAccess = async (e) => {
        e.preventDefault();
        setIsAuthenticating(true);
        try {
            await pb.collection('sevasetu_admin_requests').create({
                name: reqForm.name, email: reqForm.email, reason: reqForm.reason, status: 'Pending'
            });
            setAuthMessage({ text: 'Request submitted successfully.', type: 'success' });
            setTimeout(() => setActiveModal(null), 3000);
        } catch (error) {
            setAuthMessage({ text: 'Failed to submit request.', type: 'error' });
        } finally {
            setIsAuthenticating(false);
        }
    };

    // ==========================================
    // DASHBOARD FEATURES
    // ==========================================

    const fetchRecords = async () => {
        setIsLoadingData(true);
        try {
            const resultList = await pb.collection('sevasetu_waitlist').getFullList({ sort: '-created' });
            setRecords(resultList);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const updateStatus = async (recordId, newStatus) => {
        try {
            await pb.collection('sevasetu_waitlist').update(recordId, { status: newStatus });
            setRecords(records.map(rec => rec.id === recordId ? { ...rec, status: newStatus } : rec));
        } catch (error) {
            alert("Error updating record.");
        }
    };

    const handleBulkUpdate = async () => {
        if (!bulkStatus || selectedRecords.length === 0) return;
        setIsLoadingData(true);
        try {
            for (let id of selectedRecords) {
                await pb.collection('sevasetu_waitlist').update(id, { status: bulkStatus });
            }
            setRecords(records.map(rec => selectedRecords.includes(rec.id) ? { ...rec, status: bulkStatus } : rec));
            setSelectedRecords([]);
            setBulkStatus('');
        } catch (error) {
            alert("Error processing bulk update.");
        } finally {
            setIsLoadingData(false);
        }
    };

    const deleteRecord = async (recordId) => {
        if (!isSuperAdmin) return;
        if (window.confirm("Permanent delete? This action cannot be undone.")) {
            try {
                await pb.collection('sevasetu_waitlist').delete(recordId);
                setRecords(records.filter(rec => rec.id !== recordId));
            } catch (error) {
                alert("Error deleting record.");
            }
        }
    };

    const exportCSV = () => {
        const csvRows = ["ACK Number,Business Name,Contact Info,Status,Created"];
        filteredRecords.forEach(rec => {
            csvRows.push(`"${rec.ack_number}","${rec.business_name}","${rec.contact_info}","${rec.status}","${rec.created}"`);
        });
        const csvString = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvString));
        link.setAttribute("download", `sevasetu_records_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleSelect = (id) => {
        setSelectedRecords(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedRecords.length === currentRecords.length) setSelectedRecords([]);
        else setSelectedRecords(currentRecords.map(r => r.id));
    };

    const getFileUrl = (record, filename) => {
        if (!filename) return null;
        return pb.files.getUrl(record, filename);
    };

    const filteredRecords = records.filter(rec => {
        const matchesSearch = rec.ack_number.toLowerCase().includes(searchQuery.toLowerCase()) || rec.business_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || rec.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const kpi = {
        total: filteredRecords.length,
        pending: filteredRecords.filter(r => r.status === 'Pending').length,
        verified: filteredRecords.filter(r => r.status === 'Verified').length,
        rejected: filteredRecords.filter(r => r.status === 'Rejected').length
    };

    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const currentRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

    // ==========================================
    // RENDER UNAUTHENTICATED PUBLIC VIEW
    // ==========================================
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#2563EB] flex items-center justify-center p-6 font-sans">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-[#FFFFFF] rounded-2xl shadow-xl p-8 border border-[#E5E7EB] relative">
                    
                    <div className="absolute top-4 right-4">
                        <button type="button" onClick={() => setShowLangPrompt(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-[#374151] font-bold text-[0.8rem] bg-[#FFFFFF] hover:bg-[#F9FAFB] outline-none shadow-sm"><Globe size={14} /> {currentT.lang}</button>
                    </div>

                    <div className="flex flex-col items-center mb-8 mt-4">
                        <div className="flex items-center gap-0.3 mb-2">
                            <img src="/logo-7.png" alt="Movyra" className="h-8 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                            <span className="font-black text-[1.6rem] tracking-tighter text-[#111111]">
                                ovyra <span className="font-medium text-[#2563EB]">SevaSetu</span>
                            </span>
                        </div>
                        <p className="text-[#6B7280] font-bold text-[0.85rem] uppercase tracking-wider">{currentT.admin_portal}</p>
                    </div>

                    {!activeModal && (
                        <form onSubmit={handleLogin} className="flex flex-col gap-4">
                            <input type="email" placeholder={currentT.email} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB]" required />
                            <input type="password" placeholder={currentT.password} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full p-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB]" required />
                            {authMessage.text && <p className={`text-[0.85rem] font-bold text-center ${authMessage.type === 'error' ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>{authMessage.text}</p>}
                            <button type="submit" disabled={isAuthenticating} className="w-full py-4 bg-[#2563EB] text-[#FFFFFF] rounded-xl font-black transition-colors hover:bg-[#1D4ED8]">{isAuthenticating ? currentT.loading : currentT.login}</button>
                            <div className="flex justify-between mt-4">
                                <button type="button" onClick={() => { setActiveModal('forgot'); setAuthMessage({text:'', type:''}); }} className="text-[#4B5563] text-[0.85rem] font-bold outline-none hover:text-[#2563EB]">{currentT.forgot_pwd}</button>
                                <button type="button" onClick={() => { setActiveModal('request'); setAuthMessage({text:'', type:''}); }} className="text-[#4B5563] text-[0.85rem] font-bold outline-none hover:text-[#2563EB]">{currentT.request_access}</button>
                            </div>
                        </form>
                    )}

                    {activeModal === 'forgot' && (
                        <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                            <input type="email" placeholder={currentT.email} value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full p-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB]" required />
                            {authMessage.text && <p className={`text-[0.85rem] font-bold text-center ${authMessage.type === 'error' ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>{authMessage.text}</p>}
                            <button type="submit" disabled={isAuthenticating} className="w-full py-4 bg-[#111111] text-[#FFFFFF] rounded-xl font-black transition-colors hover:bg-[#000000]">{isAuthenticating ? currentT.loading : currentT.send_reset}</button>
                            <button type="button" onClick={() => setActiveModal(null)} className="text-[#4B5563] text-[0.85rem] font-bold text-center w-full outline-none hover:text-[#111111]">{currentT.back}</button>
                        </form>
                    )}

                    {activeModal === 'request' && (
                        <form onSubmit={handleRequestAccess} className="flex flex-col gap-4">
                            <input type="text" placeholder={currentT.name} value={reqForm.name} onChange={(e) => setReqForm({...reqForm, name: e.target.value})} className="w-full p-3 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB]" required />
                            <input type="email" placeholder={currentT.email} value={reqForm.email} onChange={(e) => setReqForm({...reqForm, email: e.target.value})} className="w-full p-3 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB]" required />
                            <textarea placeholder={currentT.reason} value={reqForm.reason} onChange={(e) => setReqForm({...reqForm, reason: e.target.value})} className="w-full p-3 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB] resize-none h-24" required></textarea>
                            {authMessage.text && <p className={`text-[0.85rem] font-bold text-center ${authMessage.type === 'error' ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>{authMessage.text}</p>}
                            <button type="submit" disabled={isAuthenticating} className="w-full py-4 bg-[#16A34A] text-[#FFFFFF] rounded-xl font-black transition-colors hover:bg-[#15803D]">{isAuthenticating ? currentT.loading : currentT.submit_req}</button>
                            <button type="button" onClick={() => setActiveModal(null)} className="text-[#4B5563] text-[0.85rem] font-bold text-center w-full outline-none hover:text-[#111111]">{currentT.back}</button>
                        </form>
                    )}
                </motion.div>

                {/* Language Prompt for Unauthenticated View */}
                <AnimatePresence>
                    {showLangPrompt && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-[400px] bg-[#FFFFFF] rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[80vh] overflow-y-auto hide-scrollbar">
                                <button type="button" onClick={() => setShowLangPrompt(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#111111] hover:bg-[#F5F5F5] rounded-full outline-none"><X size={18} /></button>
                                <h2 className="text-[1.4rem] font-black tracking-tight mb-4 text-[#111111] text-center">{currentT.lang}</h2>
                                <div className="flex flex-col gap-2">
                                    {languageOptions.map((opt) => (
                                        <button type="button" key={opt.code} onClick={() => { setLang(opt.code); setShowLangPrompt(false); }} className={`p-3 rounded-xl font-bold text-left border outline-none ${lang === opt.code ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-[#FFFFFF] text-[#111111] border-[#E5E7EB]'}`}>{opt.label}</button>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // ==========================================
    // RENDER AUTHENTICATED DASHBOARD
    // ==========================================
    return (
        <div className="min-h-screen bg-[#2563EB] font-sans flex flex-col">
            <header className="bg-[#FFFFFF] border-b border-[#E5E7EB] px-6 py-4 flex flex-wrap items-center justify-between sticky top-0 z-40 shadow-sm gap-4">
                <div className="flex items-center gap-3">
                    <img src="/logo-7.png" alt="Movyra" className="h-8 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                    <div>
                        <h1 className="text-[1.2rem] font-black text-[#111111] leading-tight tracking-tight">ovyra SevaSetu</h1>
                        <p className="text-[#6B7280] text-[0.7rem] font-bold uppercase tracking-wider">{currentT.dashboard}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF]" size={16} />
                        <input type="text" placeholder={currentT.search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg text-[#111111] font-medium outline-none focus:border-[#2563EB] w-48 sm:w-64" />
                    </div>
                    {/* SECURE SESSION BUTTON - CHANGE PASSWORD */}
                    <button onClick={() => setActiveModal('change_pwd')} className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg text-[#111111] font-bold text-[0.85rem] bg-[#FFFFFF] outline-none hover:bg-[#F9FAFB]">
                        <Key size={16} className="text-[#2563EB]" /> <span className="hidden sm:inline">{currentT.change_pwd}</span>
                    </button>
                    <button onClick={() => setShowLangPrompt(true)} className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg text-[#111111] font-bold text-[0.85rem] bg-[#FFFFFF] outline-none hover:bg-[#F9FAFB] transition-colors">
                        <Globe size={16} /> <span className="hidden sm:inline">{currentT.lang}</span>
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 bg-[#FEF2F2] text-[#DC2626] rounded-lg font-bold text-[0.85rem] hover:bg-[#FCA5A5] transition-colors border border-[#DC2626] outline-none">
                        <LogOut size={16} /> <span className="hidden sm:inline">{currentT.logout}</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 p-6 flex flex-col gap-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-4 rounded-xl shadow-sm flex flex-col">
                        <span className="text-[#6B7280] text-[0.8rem] font-bold uppercase">{currentT.total}</span>
                        <span className="text-[#111111] text-[1.8rem] font-black">{kpi.total}</span>
                    </div>
                    <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-4 rounded-xl shadow-sm flex flex-col border-l-4 border-l-[#D97706]">
                        <span className="text-[#6B7280] text-[0.8rem] font-bold uppercase">{currentT.pending}</span>
                        <span className="text-[#D97706] text-[1.8rem] font-black">{kpi.pending}</span>
                    </div>
                    <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-4 rounded-xl shadow-sm flex flex-col border-l-4 border-l-[#16A34A]">
                        <span className="text-[#6B7280] text-[0.8rem] font-bold uppercase">{currentT.verified}</span>
                        <span className="text-[#16A34A] text-[1.8rem] font-black">{kpi.verified}</span>
                    </div>
                    <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-4 rounded-xl shadow-sm flex flex-col border-l-4 border-l-[#DC2626]">
                        <span className="text-[#6B7280] text-[0.8rem] font-bold uppercase">{currentT.rejected}</span>
                        <span className="text-[#DC2626] text-[1.8rem] font-black">{kpi.rejected}</span>
                    </div>
                </div>

                <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-[#6B7280]" />
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-[#111111] font-bold text-[0.85rem] outline-none cursor-pointer">
                                <option value="All">{currentT.filter_all}</option>
                                <option value="Pending">{currentT.pending}</option>
                                <option value="Verified">{currentT.verified}</option>
                                <option value="Rejected">{currentT.rejected}</option>
                            </select>
                        </div>
                        
                        {selectedRecords.length > 0 && (
                            <div className="flex items-center gap-2 border-l border-[#E5E7EB] pl-4">
                                <span className="text-[#2563EB] font-bold text-[0.85rem]">{selectedRecords.length} selected</span>
                                <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="bg-[#FFFFFF] border border-[#2563EB] text-[#2563EB] rounded-lg px-2 py-1 text-[0.8rem] font-bold outline-none cursor-pointer">
                                    <option value="">Status...</option>
                                    <option value="Pending">{currentT.pending}</option>
                                    <option value="Verified">{currentT.verified}</option>
                                    <option value="Rejected">{currentT.rejected}</option>
                                </select>
                                <button onClick={handleBulkUpdate} className="bg-[#2563EB] text-[#FFFFFF] px-3 py-1 rounded-lg text-[0.8rem] font-bold hover:bg-[#1D4ED8] outline-none">{currentT.update}</button>
                            </div>
                        )}
                    </div>
                    
                    <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-[#111111] text-[#FFFFFF] rounded-lg font-bold text-[0.85rem] hover:bg-[#000000] transition-colors outline-none">
                        <Download size={16} /> {currentT.export_csv}
                    </button>
                </div>

                <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#111111] text-[0.8rem] uppercase tracking-wider font-bold">
                                    <th className="p-4 w-10 text-center"><input type="checkbox" checked={selectedRecords.length === currentRecords.length && currentRecords.length > 0} onChange={toggleSelectAll} className="cursor-pointer" /></th>
                                    <th className="p-4">{currentT.ack}</th>
                                    <th className="p-4">{currentT.org}</th>
                                    <th className="p-4">{currentT.contact}</th>
                                    <th className="p-4">{currentT.doc}</th>
                                    <th className="p-4">{currentT.status}</th>
                                    <th className="p-4 text-right">{currentT.action}</th>
                                </tr>
                            </thead>
                            <tbody className="text-[0.9rem]">
                                {isLoadingData ? (
                                    <tr><td colSpan="7" className="p-8 text-center text-[#6B7280] font-bold">{currentT.loading}</td></tr>
                                ) : currentRecords.length === 0 ? (
                                    <tr><td colSpan="7" className="p-8 text-center text-[#6B7280] font-bold">No records available.</td></tr>
                                ) : (
                                    currentRecords.map((record) => (
                                        <tr key={record.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors">
                                            <td className="p-4 text-center">
                                                <input type="checkbox" checked={selectedRecords.includes(record.id)} onChange={() => toggleSelect(record.id)} className="cursor-pointer" />
                                            </td>
                                            <td className="p-4 font-mono font-bold text-[#2563EB]">{record.ack_number}</td>
                                            <td className="p-4 font-black text-[#111111] max-w-[200px] truncate" title={record.business_name}>{record.business_name}</td>
                                            <td className="p-4 font-medium text-[#4B5563]">{record.contact_info}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {record.business_photo && <button onClick={() => setSelectedImage(getFileUrl(record, record.business_photo))} className="w-8 h-8 bg-[#FFFFFF] rounded flex items-center justify-center border border-[#E5E7EB] text-[#111111] outline-none hover:bg-[#F3F4F6]" title="Document"><ImageIcon size={14} /></button>}
                                                    {record.live_person_photo && <button onClick={() => setSelectedImage(getFileUrl(record, record.live_person_photo))} className="w-8 h-8 bg-[#FFFFFF] rounded flex items-center justify-center border border-[#E5E7EB] text-[#111111] outline-none hover:bg-[#F3F4F6]" title="Live Photo"><Camera size={14} /></button>}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <select value={record.status} onChange={(e) => updateStatus(record.id, e.target.value)} className={`p-1.5 rounded-lg font-bold text-[0.8rem] border outline-none cursor-pointer ${record.status === 'Verified' ? 'bg-[#ECFDF5] text-[#16A34A] border-[#16A34A]' : record.status === 'Rejected' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]' : 'bg-[#FFFBEB] text-[#D97706] border-[#D97706]'}`}>
                                                    <option value="Pending">{currentT.pending}</option>
                                                    <option value="Verified">{currentT.verified}</option>
                                                    <option value="Rejected">{currentT.rejected}</option>
                                                </select>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => setRecordToPrint(record)} className="p-1.5 text-[#111111] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded transition-colors outline-none" title={currentT.print}><Printer size={16} /></button>
                                                    {isSuperAdmin && (
                                                        <button onClick={() => deleteRecord(record.id)} className="p-1.5 text-[#DC2626] hover:bg-[#FEF2F2] rounded transition-colors outline-none" title={currentT.delete}><Trash2 size={16} /></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {totalPages > 1 && (
                        <div className="bg-[#FFFFFF] p-3 border-t border-[#E5E7EB] flex items-center justify-between text-[0.85rem] font-bold text-[#111111]">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111111] disabled:opacity-50 outline-none">{currentT.prev}</button>
                            <span>{currentT.page} {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111111] disabled:opacity-50 outline-none">{currentT.next}</button>
                        </div>
                    )}
                </div>
            </main>

            {/* MODALS */}
            
            {/* Image Viewer */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
                        <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 w-10 h-10 bg-[#FFFFFF] rounded-full flex items-center justify-center text-[#111111] hover:bg-[#F3F4F6] shadow-xl z-50 outline-none"><X size={20} /></button>
                        <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={selectedImage} alt="Application Document" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-[#FFFFFF]" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Print View Modal */}
            <AnimatePresence>
                {recordToPrint && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-[#F3F4F6] overflow-y-auto">
                        <div className="max-w-3xl mx-auto my-8 bg-[#FFFFFF] p-8 rounded-none border border-[#E5E7EB] shadow-2xl" id="print-area">
                            <div className="flex justify-between items-start border-b-2 border-[#111111] pb-6 mb-6">
                                <div>
                                    <h1 className="text-[2rem] font-black text-[#111111]">SevaSetu Record</h1>
                                    <p className="text-[#6B7280] font-mono text-[0.9rem]">Generated: {new Date().toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[0.8rem] font-bold uppercase text-[#6B7280]">Acknowledgement No.</p>
                                    <p className="text-[1.5rem] font-mono font-black text-[#2563EB]">{recordToPrint.ack_number}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <p className="text-[0.8rem] font-bold uppercase text-[#6B7280] mb-1">Organization Name</p>
                                    <p className="text-[1.2rem] font-black text-[#111111]">{recordToPrint.business_name}</p>
                                </div>
                                <div>
                                    <p className="text-[0.8rem] font-bold uppercase text-[#6B7280] mb-1">Contact Information</p>
                                    <p className="text-[1.2rem] font-medium text-[#111111]">{recordToPrint.contact_info}</p>
                                </div>
                                <div>
                                    <p className="text-[0.8rem] font-bold uppercase text-[#6B7280] mb-1">Current Status</p>
                                    <p className="text-[1.2rem] font-black text-[#111111]">{recordToPrint.status}</p>
                                </div>
                                <div>
                                    <p className="text-[0.8rem] font-bold uppercase text-[#6B7280] mb-1">Application Date</p>
                                    <p className="text-[1rem] font-medium text-[#111111]">{new Date(recordToPrint.created).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 border-t border-[#E5E7EB] pt-8">
                                <div>
                                    <p className="text-[0.8rem] font-bold uppercase text-[#6B7280] mb-2">Organization Document</p>
                                    {recordToPrint.business_photo ? (
                                        <img src={getFileUrl(recordToPrint, recordToPrint.business_photo)} className="w-full rounded border border-[#E5E7EB]" alt="Doc" />
                                    ) : <p className="text-[0.9rem] italic text-[#9CA3AF]">Not provided</p>}
                                </div>
                                <div>
                                    <p className="text-[0.8rem] font-bold uppercase text-[#6B7280] mb-2">Live Identity Verification</p>
                                    {recordToPrint.live_person_photo ? (
                                        <img src={getFileUrl(recordToPrint, recordToPrint.live_person_photo)} className="w-full rounded border border-[#E5E7EB]" alt="Live" />
                                    ) : <p className="text-[0.9rem] italic text-[#9CA3AF]">Not provided</p>}
                                </div>
                            </div>
                        </div>

                        <div className="fixed bottom-0 left-0 right-0 bg-[#111111] p-4 flex justify-center gap-4 z-50 print:hidden">
                            <button onClick={() => setRecordToPrint(null)} className="px-6 py-2 bg-[#FFFFFF] text-[#111111] font-bold rounded-lg border border-[#E5E7EB] hover:bg-[#F3F4F6] outline-none">Cancel</button>
                            <button onClick={() => window.print()} className="px-6 py-2 bg-[#2563EB] text-[#FFFFFF] font-bold rounded-lg flex items-center gap-2 hover:bg-[#1D4ED8] outline-none"><Printer size={18} /> Print Record</button>
                        </div>
                        <style>{`@media print { body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; box-shadow: none; border: none; } }`}</style>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SECURE CHANGE PASSWORD MODAL (Requires Session) */}
            <AnimatePresence>
                {activeModal === 'change_pwd' && isAuthenticated && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div className="w-full max-w-md bg-[#FFFFFF] rounded-2xl p-8 flex flex-col shadow-2xl relative">
                            <button onClick={() => { setActiveModal(null); setAuthMessage({text:'', type:''}); }} className="absolute top-4 right-4 text-[#111111] outline-none hover:bg-[#F3F4F6] rounded-full p-1"><X size={20} /></button>
                            <h2 className="text-[1.4rem] font-black mb-4 text-[#111111] flex items-center gap-2"><Key size={20} className="text-[#2563EB]"/> {currentT.change_pwd}</h2>
                            <p className="text-[#111111] mb-6 text-[0.95rem] font-medium leading-relaxed">
                                A secure password reset link will be instantly dispatched to your active session email: <br/><strong className="text-[#2563EB]">{pb.authStore.model?.email}</strong>
                            </p>
                            <form onSubmit={handleSessionPasswordUpdate} className="flex flex-col gap-4">
                                {authMessage.text && <p className={`text-[0.85rem] font-bold text-center ${authMessage.type === 'error' ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>{authMessage.text}</p>}
                                <button type="submit" disabled={isAuthenticating} className="w-full py-4 bg-[#111111] text-[#FFFFFF] rounded-xl font-black transition-colors hover:bg-[#000000]">{isAuthenticating ? currentT.loading : currentT.send_reset}</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Language Prompt for Authenticated View */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-[400px] bg-[#FFFFFF] rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[80vh] overflow-y-auto hide-scrollbar">
                            <button type="button" onClick={() => setShowLangPrompt(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#111111] hover:bg-[#F3F4F6] rounded-full outline-none"><X size={18} /></button>
                            <h2 className="text-[1.4rem] font-black tracking-tight mb-4 text-[#111111] text-center">{currentT.lang}</h2>
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