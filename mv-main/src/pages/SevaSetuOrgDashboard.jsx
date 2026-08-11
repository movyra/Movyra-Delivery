/**
 * SYSTEM DOCUMENTATION / NGO MASTER ORGANIZATION DASHBOARD
 * Context: Secure multi-platform portal for verified NGOs and Super Admins.
 * Database: Dual-Backend (PocketBase for Civic/Sahay/Admin, Firestore strictly for NagrikSetu public reports).
 * Features: Dark Mode, Staggered Slide Animations, URL Query Parsing, Super Admin Gatekeeping, Real-time Sync, CSV Export.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Search, X, Globe, Image as ImageIcon, Filter, CheckCircle, IndianRupee, ShieldCheck, MapPin, Moon, Sun, Download, LayoutDashboard, LifeBuoy, Lock, Megaphone } from 'lucide-react';
// STRICT FIX: Imported universal dual-backend fetchers and listeners
import { pocketbaseClient, fetchCivicReportsPB, fetchSahayCasesPB, fetchSevaSetuAdminRequests, fetchFirestoreNagrikReports, fetchFirestoreCivicReports, fetchFirestoreSahayCases, subscribeToCollection, subscribeToFirestoreCollection, updateCrossPlatformStatus } from '../services/pocketbase';
import { useLocation } from 'react-router-dom';

const TRANSLATIONS = {
    en: {
        lang: "English", org_portal: "Organization Portal", email: "Email Address", password: "Password",
        login: "Secure Login", dashboard: "Master Dashboard", ack: "Reference",
        title: "Subject", category: "Category", location: "Location", status: "Status", action: "Action",
        pending: "Pending", verified: "Verified", in_progress: "In Progress", resolved: "Resolved", rejected: "Rejected",
        update: "Update", logout: "Logout", loading: "Processing...", search: "Search Records",
        total: "Total Records", active_plan: "Active Plan", txn_id: "Transaction",
        plan_desc: "Your organization is verified on the network.", tab_civic: "Civic Reports",
        tab_sahay: "Rescue Operations", tab_nagrik: "Public Reports", tab_admin: "Super Admin", dark_mode: "Dark Mode", light_mode: "Light Mode",
        export: "Export Data", sync: "Live Sync Active", no_data: "No records found."
    },
    hi: {
        lang: "हिन्दी", org_portal: "संगठन पोर्टल", email: "ईमेल पता", password: "पासवर्ड", login: "लॉगिन करें",
        dashboard: "मुख्य डैशबोर्ड", ack: "संदर्भ", title: "विषय", category: "श्रेणी", location: "स्थान",
        status: "स्थिति", action: "कार्रवाई", pending: "लंबित", verified: "सत्यापित", in_progress: "प्रगति पर", resolved: "हल", rejected: "अस्वीकृत",
        update: "अपडेट", logout: "लॉगआउट", loading: "प्रसंस्करण...", search: "रिकॉर्ड खोजें",
        total: "कुल रिकॉर्ड", active_plan: "सक्रिय प्लान", txn_id: "लेनदेन", plan_desc: "आपका संगठन नेटवर्क पर सत्यापित है।",
        tab_civic: "नागरिक रिपोर्ट", tab_sahay: "बचाव कार्य", tab_nagrik: "सार्वजनिक रिपोर्ट", tab_admin: "सुपर एडमिन", dark_mode: "डार्क मोड", light_mode: "लाइट मोड",
        export: "डाउनलोड", sync: "लाइव सिंक चालू", no_data: "कोई रिकॉर्ड नहीं मिला।"
    },
    hinglish: {
        lang: "Hinglish", org_portal: "Organization Portal", email: "Email", password: "Password", login: "Login Karein",
        dashboard: "Main Dashboard", ack: "Reference", title: "Subject", category: "Category", location: "Location",
        status: "Status", action: "Action", pending: "Pending", verified: "Verified", in_progress: "In Progress", resolved: "Resolved", rejected: "Rejected",
        update: "Update Karein", logout: "Logout", loading: "Processing...", search: "Search Karein",
        total: "Total Records", active_plan: "Active Plan", txn_id: "Transaction", plan_desc: "Aapka organization network par verified hai.",
        tab_civic: "Civic Reports", tab_sahay: "Rescue Ops", tab_nagrik: "Public Reports", tab_admin: "Super Admin", dark_mode: "Dark Mode", light_mode: "Light Mode",
        export: "Download Data", sync: "Live Sync On", no_data: "Koi data nahi mila."
    },
    mr: {
        lang: "मराठी", org_portal: "संस्था पोर्टल", email: "ईमेल पत्ता", password: "पासवर्ड", login: "लॉग इन करा",
        dashboard: "मुख्य डॅशबोर्ड", ack: "संदर्भ", title: "विषय", category: "श्रेणी", location: "स्थान",
        status: "स्थिती", action: "कृती", pending: "प्रलंबित", verified: "सत्यापित", in_progress: "प्रगतीपथावर", resolved: "सोडवले", rejected: "नाकारले",
        update: "अपडेट", logout: "लॉगआउट", loading: "प्रक्रिया...", search: "रेकॉर्ड शोधा",
        total: "एकूण रेकॉर्ड", active_plan: "सक्रिय प्लान", txn_id: "व्यवहार", plan_desc: "तुमची संस्था नेटवर्कवर सत्यापित आहे.",
        tab_civic: "नागरी अहवाल", tab_sahay: "बचाव कार्य", tab_nagrik: "सार्वजनिक अहवाल", tab_admin: "सुपर ॲडमिन", dark_mode: "डार्क मोड", light_mode: "लाईट मोड",
        export: "डाउनलोड", sync: "लाइव्ह सिंक चालू", no_data: "कोणताही डेटा आढळला नाही."
    },
    gu: {
        lang: "ગુજરાતી", org_portal: "સંસ્થા પોર્ટલ", email: "ઇમેઇલ", password: "પાસવર્ડ", login: "લૉગિન",
        dashboard: "મુખ્ય ડેશબોર્ડ", ack: "સંદર્ભ", title: "વિષય", category: "શ્રેણી", location: "સ્થાન",
        status: "સ્થિતિ", action: "ક્રિયા", pending: "બાકી", verified: "ચકાસાયેલ", in_progress: "પ્રગતિમાં છે", resolved: "ઉકેલાઈ ગયું", rejected: "નકારવામાં આવેલ",
        update: "અપડેટ", logout: "લોગઆઉટ", loading: "પ્રક્રિયા...", search: "રેકોર્ડ શોધો",
        total: "કુલ રેકોર્ડ", active_plan: "સક્રિય પ્લાન", txn_id: "વ્યવહાર", plan_desc: "તમારી સંસ્થા નેટવર્ક પર ચકાસાયેલ છે.",
        tab_civic: "નાગરિક અહેવાલો", tab_sahay: "બચાવ કામગીરી", tab_nagrik: "જાહેર અહેવાલો", tab_admin: "સુपर એડમિન", dark_mode: "ડાર્ક મોડ", light_mode: "લાઇટ મોડ",
        export: "ડાઉનલોડ", sync: "લાઇવ સિંક ચાલુ", no_data: "કોઈ રેકોર્ડ મળ્યો નથી."
    },
    te: {
        lang: "తెలుగు", org_portal: "సంస్థ పోర్టల్", email: "ఈమెయిల్", password: "పాస్‌వర్డ్", login: "లాగిన్ చేయండి",
        dashboard: "ప్రధాన డాష్‌బోర్డ్", ack: "సూచన", title: "విషయం", category: "వర్గం", location: "స్థానం",
        status: "స్థితి", action: "చర్య", pending: "పెండింగ్", verified: "ధృవీకరించబడింది", in_progress: "పురోగతిలో ఉంది", resolved: "పరిష్కరించబడింది", rejected: "తిరస్కరించబడింది",
        update: "నవీకరించండి", logout: "లాగౌట్", loading: "ప్రాసెస్...", search: "రికార్డులను శోధించండి",
        total: "మొత్తం రికార్డులు", active_plan: "క్రియాశీల ప్లాన్", txn_id: "లావాదేవీ", plan_desc: "మీ సంస్థ నెట్‌వర్క్‌లో ధృవీకరించబడింది.",
        tab_civic: "పౌర నివేదికలు", tab_sahay: "రెస్క్యూ ఆపరేషన్స్", tab_nagrik: "ప్రజా నివేదికలు", tab_admin: "సూపర్ అడ్మిన్", dark_mode: "డార్క్ మోડ", light_mode: "లైట్ మోડ",
        export: "డౌన్‌లోడ్ చేయండి", sync: "లైవ్ సింక్ ఆన్‌లో ఉంది", no_data: "ఎలాంటి డేటా లేదు."
    },
    ta: {
        lang: "தமிழ்", org_portal: "நிறுவன போர்டல்", email: "மின்னஞ்சல்", password: "கடவுச்சொல்", login: "உள்நுழைக",
        dashboard: "முதன்மை டாஷ்போர்டு", ack: "குறிப்பு", title: "பொருள்", category: "வகை", location: "இடம்",
        status: "நிலை", action: "செயல்", pending: "நிலுவையில்", verified: "சரிபார்க்கப்பட்டது", in_progress: "செயலில்", resolved: "தீர்க்கப்பட்டது", rejected: "நிராகரிக்கப்பட்டது",
        update: "புதுப்பி", logout: "வெளியேறு", loading: "செயலாக்கம்...", search: "தேடல்",
        total: "மொத்த பதிவுகள்", active_plan: "செயலில் உள்ள திட்டம்", txn_id: "பரிவர்த்தனை", plan_desc: "நிறுவனம் நெட்வொர்க்கில் சரிபார்க்கப்பட்டது.",
        tab_civic: "குடிமக்கள் அறிக்கைகள்", tab_sahay: "மீட்பு பணிகள்", tab_nagrik: "பொது அறிக்கைகள்", tab_admin: "சூப்பர் நிர்வாகி", dark_mode: "இருண்ட பயன்முறை", light_mode: "ஒளி பயன்முறை",
        export: "தரவிறக்கம்", sync: "நேரலை ஒத்திசைவு", no_data: "தரவு எதுவும் கிடைக்கவில்லை."
    },
    pa: {
        lang: "ਪੰਜਾਬੀ", org_portal: "ਸੰਗਠਨ ਪੋਰਟਲ", email: "ਈਮੇਲ", password: "ਪਾਸਵਰਡ", login: "ਲਾਗਇਨ ਕਰੋ",
        dashboard: "ਮੁੱਖ ਡੈਸ਼ਬੋਰਡ", ack: "ਹਵਾਲਾ", title: "ਵਿਸ਼ਾ", category: "ਸ਼੍ਰੇਣੀ", location: "ਸਥਾਨ",
        status: "ਸਥਿਤੀ", action: "ਕਾਰਵਾਈ", pending: "ਬਕਾਇਆ", verified: "ਪ੍ਰਮਾਣਿਤ", in_progress: "ਪ੍ਰਗਤੀ ਵਿੱਚ", resolved: "ਹੱਲ", rejected: "ਰੱਦ",
        update: "ਅੱਪਡੇਟ ਕਰੋ", logout: "ਲਾਗਆਊਟ", loading: "ਪ੍ਰਕਿਰਿਆ...", search: "ਖੋਜ ਕਰੋ",
        total: "ਕੁੱਲ ਰਿਕਾਰਡ", active_plan: "ਸਰਗਰਮ ਪਲਾਨ", txn_id: "ਲੈਣ-ਦੇਣ", plan_desc: "ਤੁਹਾਡਾ ਸੰਗਠਨ ਨੈੱਟਵਰਕ 'ਤੇ ਪ੍ਰਮਾਣਿਤ ਹੈ।",
        tab_civic: "ਨਾਗਰਿਕ ਰਿਪੋਰਟਾਂ", tab_sahay: "ਬਚਾਅ ਕਾਰਜ", tab_nagrik: "ਜਨਤਕ ਰਿਪੋਰਟਾਂ", tab_admin: "ਸੁਪਰ ਐਡਮਿਨ", dark_mode: "ਡਾਰਕ ਮੋਡ", light_mode: "ਲਾਈਟ ਮੋਡ",
        export: "ਡਾਊਨਲੋਡ ਕਰੋ", sync: "ਲਾਈਵ ਸਿੰਕ ਚਾਲੂ", no_data: "ਕੋਈ ਡਾਟਾ ਨਹੀਂ ਮਿਲਿਆ।"
    },
    bho: {
        lang: "भोजपुरी", org_portal: "संगठन पोर्टल", email: "ईमेल", password: "पासवर्ड", login: "लॉगिन करीं",
        dashboard: "मुख्य डैशबोर्ड", ack: "संदर्भ", title: "विषय", category: "श्रेणी", location: "स्थान",
        status: "स्थिति", action: "कार्रवाई", pending: "लंबित", verified: "सत्यापित", in_progress: "प्रगति पर", resolved: "हल", rejected: "अस्वीकृत",
        update: "अपडेट करीं", logout: "लॉगआउट", loading: "प्रक्रिया...", search: "खोजीं",
        total: "कुल रिकॉर्ड", active_plan: "सक्रिय प्लान", txn_id: "लेनदेन", plan_desc: "रउआँ के संगठन नेटवर्क पर सत्यापित बा।",
        tab_civic: "नागरिक रिपोर्ट", tab_sahay: "बचाव कार्य", tab_nagrik: "सार्वजनिक रिपोर्ट", tab_admin: "सुपर एडमिन", dark_mode: "डार्क मोड", light_mode: "लाइट मोड",
        export: "डाउनलोड", sync: "लाइव सिंक चालू", no_data: "कौनो डेटा ना मिलल।"
    },
    bn: {
        lang: "বাংলা", org_portal: "প্রতিষ্ঠান পোর্টাল", email: "ইমেইল", password: "পাসওয়ার্ড", login: "লগইন",
        dashboard: "প্রধান ড্যাশবোর্ড", ack: "রেফারেন্স", title: "বিষয়", category: "বিভাগ", location: "অবস্থান",
        status: "অবস্থা", action: "পদক্ষেপ", pending: "অপেক্ষমান", verified: "যাচাইকৃত", in_progress: "প্রক্রিয়াধীন", resolved: "সমাধান", rejected: "বাতিল",
        update: "আপডেট", logout: "লগআউট", loading: "প্রক্রিয়া চলছে...", search: "অনুসন্ধান করুন",
        total: "মোট রেকর্ড", active_plan: "সক্রিয় প্ল্যান", txn_id: "লেনদেন", plan_desc: "আপনার প্রতিষ্ঠান নেটওয়ার্কে যাচাইকৃত।",
        tab_civic: "নাগরিক প্রতিবেদন", tab_sahay: "উদ্ধার কাজ", tab_nagrik: "জনসাধারণের প্রতিবেদন", tab_admin: "সুপার অ্যাডমিন", dark_mode: "ডার্ক মোড", light_mode: "লাইট মোড",
        export: "ডাউনলোড", sync: "লাইভ সিঙ্ক চালু", no_data: "কোন তথ্য পাওয়া যায়নি।"
    },
    kn: {
        lang: "ಕನ್ನಡ", org_portal: "ಸಂಸ್ಥೆ ಪೋರ್ಟಲ್", email: "ಇಮೇಲ್", password: "ಪಾಸ್ವರ್ಡ್", login: "ಲಾಗಿನ್",
        dashboard: "ಮುಖ್ಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", ack: "ಉಲ್ಲೇಖ", title: "ವಿಷಯ", category: "ವರ್ಗ", location: "ಸ್ಥಳ",
        status: "ಸ್ಥಿತಿ", action: "ಕ್ರಮ", pending: "ಬಾಕಿಯಿದೆ", verified: "ಪರಿಶೀಲಿಸಲಾಗಿದೆ", in_progress: "ಪ್ರಗತಿಯಲ್ಲಿದೆ", resolved: "ಪರಿಹರಿಸಲಾಗಿದೆ", rejected: "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
        update: "ನವೀಕರಿಸಿ", logout: "ಲಾಗ್ಔಟ್", loading: "ಪ್ರಕ್ರಿಯೆ...", search: "ಹುಡುಕಿ",
        total: "ಒಟ್ಟು ದಾಖಲೆಗಳು", active_plan: "ಸಕ್ರಿಯ ಪ್ಲಾನ್", txn_id: "ವಹಿವಾಟು", plan_desc: "ನಿಮ್ಮ ಸಂಸ್ಥೆಯನ್ನು ನೆಟ್‌ವರ್ಕ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.",
        tab_civic: "ನಾಗರಿಕ ವರದಿಗಳು", tab_sahay: "ರಕ್ಷಣಾ ಕಾರ್ಯಾಚರಣೆಗಳು", tab_nagrik: "ಸಾರ್ವಜನಿಕ ವರದಿಗಳು", tab_admin: "ಸೂಪರ್ ಅಡ್ಮಿನ್", dark_mode: "ಡಾರ್ಕ್ ಮೋಡ್", light_mode: "ಲೈಟ್ ಮೋಡ್",
        export: "ಡೌನ್‌ಲೋಡ್", sync: "ಲೈವ್ ಸಿಂಕ್ ಆನ್", no_data: "ಯಾವುದೇ ಡೇಟಾ ಕಂಡುಬಂದಿಲ್ಲ."
    },
    ml: {
        lang: "മലയാളം", org_portal: "സ്ഥാപന പോർട്ടൽ", email: "ഇമെയിൽ", password: "പാസ്‌വേഡ്", login: "ലോഗിൻ",
        dashboard: "പ്രധാന ഡാഷ്‌ബോർഡ്", ack: "റഫറൻസ്", title: "വിഷയം", category: "വിഭാഗം", location: "സ്ഥലം",
        status: "അവസ്ഥ", action: "നടപടി", pending: "തീരുമാനിച്ചിട്ടില്ല", verified: "ഉറപ്പാക്കി", in_progress: "പുരോഗമിക്കുന്നു", resolved: "പരിഹരിച്ചു", rejected: "നിരസിച്ചു",
        update: "അപ്ഡേറ്റ്", logout: "ലോഗൗട്ട്", loading: "പ്രവർത്തിക്കുന്നു...", search: "തിരയുക",
        total: "ആകെ റെക്കോർഡുകൾ", active_plan: "സജീവ പ്ലാൻ", txn_id: "ഇടപാട്", plan_desc: "നിങ്ങളുടെ സ്ഥാപനം നെറ്റ്‌വർക്കിൽ പരിശോധിച്ചുറപ്പിച്ചു.",
        tab_civic: "സിവിക് റിപ്പോർട്ടുകൾ", tab_sahay: "രക്ഷാപ്രവർത്തനങ്ങൾ", tab_nagrik: "പൊതു റിപ്പോർട്ടുകൾ", tab_admin: "സൂപ്പർ അഡ്മിൻ", dark_mode: "ഡാർക്ക് മോഡ്", light_mode: "ലൈറ്റ് മോഡ്",
        export: "ഡൗൺലോഡ്", sync: "ലൈവ് സിങ്ക് ഓൺ", no_data: "വിവരങ്ങളൊന്നും ലഭ്യമല്ല."
    },
    or: {
        lang: "ଓଡ଼ିଆ", org_portal: "ସଂସ୍ଥା ପୋର୍ଟାଲ୍", email: "ଇମେଲ୍", password: "ପାସୱାର୍ଡ", login: "ଲଗଇନ୍",
        dashboard: "ମୁଖ୍ୟ ଡ୍ୟାସବୋର୍ଡ", ack: "ସନ୍ଦର୍ଭ", title: "ବିଷୟ", category: "ବିଭାଗ", location: "ସ୍ଥାନ",
        status: "ସ୍ଥିତି", action: "କାର୍ଯ୍ୟ", pending: "ବାକି ଅଛି", verified: "ଯାଞ୍ଚ ହୋଇଛି", in_progress: "ପ୍ରଗତିରେ ଅଛି", resolved: "ସମାଧାନ ହୋଇଛି", rejected: "ପ୍ରତ୍ୟାଖ୍ୟାନ ହୋଇଛି",
        update: "ଅପଡେଟ୍", logout: "ଲଗଆଉଟ୍", loading: "ପ୍ରକ୍ରିୟାକରଣ...", search: "ସନ୍ଧାନ କରନ୍ତୁ",
        total: "ମୋଟ ରେକର୍ଡ", active_plan: "ସକ୍ରିୟ ପ୍ଲାନ୍", txn_id: "କାରବାର", plan_desc: "ଆପଣଙ୍କର ସଂସ୍ଥା ନେଟୱାର୍କରେ ଯାଞ୍ଚ ହୋଇଛି।",
        tab_civic: "ନାଗରିକ ରିପୋର୍ଟ", tab_sahay: "ଉଦ୍ଧାର କାର୍ଯ୍ୟ", tab_nagrik: "ସାର୍ବଜନୀନ ରିପୋର୍ଟ", tab_admin: "ସୁପର ଆଡମିନ", dark_mode: "ଡାର୍କ ମୋଡ୍", light_mode: "ଲାଇଟ୍ ମୋଡ୍",
        export: "ଡାଉନଲୋଡ୍", sync: "ଲାଇଭ୍ ସିଙ୍କ୍ ଚାଲୁ ଅଛି", no_data: "କୌଣସି ତଥ୍ୟ ମିଳିଲା ନାହିଁ।"
    },
    as: {
        lang: "অসমীয়া", org_portal: "সংস্থা প'ৰ্টেল", email: "ইমেইল", password: "পাছৱৰ্ড", login: "লগইন",
        dashboard: "মুখ্য ডেচবৰ্ড", ack: "প্ৰসংগ", title: "বিষয়", category: "বিভাগ", location: "স্থান",
        status: "অৱস্থা", action: "পদক্ষেপ", pending: "বাকি আছে", verified: "পৰীক্ষা কৰা হ'ল", in_progress: "প্ৰগতিশীল", resolved: "সমাধান হ'ল", rejected: "বাতিল হ'ল",
        update: "আপডেট", logout: "লগআউট", loading: "প্ৰক্ৰিয়া...", search: "সন্ধান কৰক",
        total: "মুঠ ৰেকৰ্ড", active_plan: "সক্ৰিয় প্লেন", txn_id: "লেনদেন", plan_desc: "আপোনাৰ সংস্থা নেটৱৰ্কত প্ৰমাণিত।",
        tab_civic: "নাগৰিক প্ৰতিবেদন", tab_sahay: "উদ্ধাৰ কাৰ্য্য", tab_nagrik: "ৰাজহুৱা প্ৰতিবেদন", tab_admin: "ছুপাৰ এডমিন", dark_mode: "ডাৰ্ক মোড", light_mode: "লাইট মোড",
        export: "ডাউনল'ড", sync: "লাইভ চিংক অন", no_data: "কোনো তথ্য পোৱা নগ'ল।"
    }
};

export default function SevaSetuOrgDashboard() {
    const location = useLocation();
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    
    // Dashboard Features State
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [activeTab, setActiveTab] = useState('nagrik'); // Defaulting to NagrikSetu Public Reports
    
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [organizationData, setOrganizationData] = useState(null);
    const [email, setEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authMessage, setAuthMessage] = useState({ text: '', type: '' });

    // Multi-Platform Data State
    const [civicData, setCivicData] = useState([]);
    const [sahayData, setSahayData] = useState([]);
    const [nagrikData, setNagrikData] = useState([]); 
    const [adminData, setAdminData] = useState([]);
    
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedImage, setSelectedImage] = useState(null);

    const currentT = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    const languageOptions = Object.keys(TRANSLATIONS).map(key => ({ code: key, label: TRANSLATIONS[key].lang }));

    const isSuperAdmin = organizationData?.email === 'testcodecfg@gmail.com';

    // Slide Animation Variants
    const tableContainerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };
    
    const tableRowVariants = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    // Initialize Theme and URL Parameters
    useEffect(() => {
        // Parse URL parameters for direct category routing
        const params = new URLSearchParams(location.search);
        const categoryParam = params.get('category');
        if (categoryParam) {
            setSearchQuery(categoryParam);
            setActiveTab('nagrik');
        }

        const savedTheme = localStorage.getItem('sevasetu_theme');
        if (savedTheme === 'dark') setIsDarkMode(true);
        
        if (pocketbaseClient.authStore.isValid && pocketbaseClient.authStore.model?.collectionName === 'ngo_users') {
            setIsAuthenticated(true);
            setOrganizationData(pocketbaseClient.authStore.model);
            fetchAllPlatformData();
        } else {
            pocketbaseClient.authStore.clear();
            setIsAuthenticated(false);
        }
    }, [location.search]);

    // STRICT FIX: Bind dual-backend listeners to safely poll Firestore & PB dynamically
    useEffect(() => {
        if (!isAuthenticated) return;

        let unsubCivicPB, unsubCivicFS, unsubSahayPB, unsubSahayFS, unsubAdminPB, unsubNagrikFS;

        const setupSubscriptions = async () => {
            unsubCivicPB = subscribeToCollection('civic_reports', () => { fetchAllPlatformData(false); });
            unsubCivicFS = subscribeToFirestoreCollection('civic_complaints', () => { fetchAllPlatformData(false); });
            
            unsubSahayPB = subscribeToCollection('volunteer_verifications', () => { fetchAllPlatformData(false); });
            unsubSahayFS = subscribeToFirestoreCollection('sahay_cases', () => { fetchAllPlatformData(false); });
            
            // Firestore Listener for public reports
            unsubNagrikFS = subscribeToFirestoreCollection('nagrik_reports', () => { fetchAllPlatformData(false); });

            if (isSuperAdmin) {
                unsubAdminPB = subscribeToCollection('sevasetu_admin_requests', () => { fetchAllPlatformData(false); });
            }
        };

        setupSubscriptions();

        return () => {
            if (unsubCivicPB) unsubCivicPB();
            if (unsubCivicFS) unsubCivicFS();
            if (unsubSahayPB) unsubSahayPB();
            if (unsubSahayFS) unsubSahayFS();
            if (unsubNagrikFS) unsubNagrikFS();
            if (unsubAdminPB) unsubAdminPB();
        };
    }, [isAuthenticated, isSuperAdmin]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        localStorage.setItem('sevasetu_theme', !isDarkMode ? 'dark' : 'light');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsAuthenticating(true);
        setAuthMessage({ text: '', type: '' });
        try {
            const authData = await pocketbaseClient.collection('ngo_users').authWithPassword(email, loginPassword);
            setIsAuthenticated(true);
            setOrganizationData(authData.record);
            fetchAllPlatformData();
        } catch (error) {
            setAuthMessage({ text: 'Authentication failed. Invalid credentials.', type: 'error' });
            pocketbaseClient.authStore.clear();
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleLogout = () => {
        pocketbaseClient.authStore.clear();
        setIsAuthenticated(false);
        setOrganizationData(null);
        setCivicData([]);
        setSahayData([]);
        setNagrikData([]);
        setAdminData([]);
    };

    // STRICT FIX: Master Fetcher merges PocketBase AND Firestore arrays correctly for all tabs.
    const fetchAllPlatformData = async (showLoader = true) => {
        if (showLoader) setIsLoadingData(true);
        try {
            const [pbCivicRes, pbSahayRes, firestoreNagrikRes, firestoreCivicRes, firestoreSahayRes] = await Promise.all([
                fetchCivicReportsPB(),
                fetchSahayCasesPB(),
                fetchFirestoreNagrikReports(),
                fetchFirestoreCivicReports(),
                fetchFirestoreSahayCases()
            ]);
            
            // Merge arrays to guarantee no platform data is missed, then chronologically sort
            const mergedCivic = [...firestoreCivicRes, ...pbCivicRes].sort((a, b) => new Date(b.created) - new Date(a.created));
            const mergedSahay = [...firestoreSahayRes, ...pbSahayRes].sort((a, b) => new Date(b.created) - new Date(a.created));
            const mergedNagrik = [...firestoreNagrikRes].sort((a, b) => new Date(b.created) - new Date(a.created));
            
            setCivicData(mergedCivic);
            setSahayData(mergedSahay);
            setNagrikData(mergedNagrik);

            if (pocketbaseClient.authStore.model?.email === 'testcodecfg@gmail.com') {
                const adminRes = await fetchSevaSetuAdminRequests();
                setAdminData(adminRes);
            }
        } catch (error) {
            console.error("Master Fetch Error:", error);
        } finally {
            if (showLoader) setIsLoadingData(false);
        }
    };

    // Dual-Backend Status Updater
    const updateRecordStatus = async (record, newStatus) => {
        try {
            const source = record.source || 'pocketbase';
            // Pass the exact db_collection override parameter safely to target accurate Firebase endpoints
            await updateCrossPlatformStatus(currentCollectionName, record.id, newStatus, source, record.db_collection);
            
            // Optimistic UI updates
            if (activeTab === 'civic') setCivicData(civicData.map(r => r.id === record.id ? { ...r, status: newStatus } : r));
            if (activeTab === 'sahay') setSahayData(sahayData.map(r => r.id === record.id ? { ...r, status: newStatus } : r));
            if (activeTab === 'nagrik') setNagrikData(nagrikData.map(r => r.id === record.id ? { ...r, status: newStatus } : r));
            if (activeTab === 'admin') setAdminData(adminData.map(r => r.id === record.id ? { ...r, status: newStatus } : r));
        } catch (error) {
            alert("Error updating status. Ensure you have the required permissions.");
        }
    };

    const exportToCSV = () => {
        const dataToExport = currentDataSet;
        if (dataToExport.length === 0) return;
        
        const headers = ["ID", "Title", "Category", "Status", "Created At"];
        const rows = dataToExport.map(row => [
            row.ack_number || row.id, 
            `"${(row.title || row.needyName || row.request_type || '').replace(/"/g, '""')}"`, 
            `"${(row.category || row.condition || '').replace(/"/g, '""')}"`,
            row.status, 
            row.created
        ]);
        
        const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `sevasetu_export_${activeTab}_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getFileUrl = (record, filename) => {
        if (record.source === 'firestore') return record.mediaUrl; // Use raw URL if from Firebase Storage
        if (!filename) return null;
        return pocketbaseClient.files.getUrl(record, filename); // Construct PB URL
    };

    // Tab Mapping
    let currentDataSet = [];
    let currentCollectionName = '';
    
    if (activeTab === 'civic') { currentDataSet = civicData; currentCollectionName = 'civic_reports'; }
    if (activeTab === 'sahay') { currentDataSet = sahayData; currentCollectionName = 'volunteer_verifications'; }
    if (activeTab === 'nagrik') { currentDataSet = nagrikData; currentCollectionName = 'nagrik_reports'; } 
    if (activeTab === 'admin') { currentDataSet = adminData; currentCollectionName = 'sevasetu_admin_requests'; }

    const filteredData = currentDataSet.filter(rec => {
        const rawString = `${rec.ack_number || ''} ${rec.title || ''} ${rec.category || ''} ${rec.location || ''} ${rec.needyName || ''} ${rec.request_type || ''}`.toLowerCase();
        const matchesSearch = rawString.includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || rec.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const kpi = {
        total: filteredData.length,
        pending: filteredData.filter(r => r.status === 'Pending').length,
        in_progress: filteredData.filter(r => r.status === 'In Progress').length,
        resolved: filteredData.filter(r => r.status === 'Resolved').length
    };

    // Dynamic Theme Variables
    const bgMain = isDarkMode ? "bg-[#050505]" : "bg-[#FFFFFF]";
    const bgCard = isDarkMode ? "bg-[#0a0a0a]" : "bg-[#FFFFFF]";
    const bgInput = isDarkMode ? "bg-[#111111]" : "bg-[#FFFFFF]";
    const borderCol = isDarkMode ? "border-[#222222]" : "border-[#E5E7EB]";
    const textMain = isDarkMode ? "text-[#FFFFFF]" : "text-[#111111]";
    const textMuted = isDarkMode ? "text-[#888888]" : "text-[#6B7280]";
    const activeBlue = isDarkMode ? "bg-[#2563EB] text-white" : "bg-[#2563EB] text-white";
    const inactiveBlue = isDarkMode ? "bg-[#111111] text-[#888888] hover:bg-[#222222]" : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]";
    const logoSrc = isDarkMode ? "/logo.png" : "/logo-7.png";

    // ==========================================
    // RENDER UNAUTHENTICATED PUBLIC VIEW
    // ==========================================
    if (!isAuthenticated) {
        return (
            <div className={`min-h-screen ${bgMain} flex items-center justify-center p-6 font-sans relative transition-colors duration-300`}>
                <div className="absolute top-6 right-6 z-50 flex gap-2">
                    <button onClick={toggleTheme} className={`p-2 border ${borderCol} rounded-lg ${textMain} ${bgCard} outline-none`}>
                        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                    <button type="button" onClick={() => setShowLangPrompt(true)} className={`flex items-center gap-1.5 px-3 py-1.5 border ${borderCol} rounded-lg ${textMain} font-bold text-[0.85rem] ${bgCard} outline-none`}>
                        <Globe size={14} /> {currentT.lang}
                    </button>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`w-full max-w-md ${bgCard} rounded-2xl shadow-xl p-8 border ${borderCol}`}>
                    <div className="flex flex-col items-center mb-8">
                        <div className="flex items-center gap-0.3 mb-2">
                            <img src={logoSrc} alt="Movyra" className="h-8 w-auto transition-all" onError={(e) => { e.target.style.display = 'none' }} />
                            <span className={`font-black text-[1.6rem] tracking-tighter ${textMain}`}>ovyra <span className="text-[#2563EB]">SevaSetu</span></span>
                        </div>
                        <p className={`${textMuted} font-bold text-[0.85rem] uppercase tracking-wider`}>{currentT.org_portal}</p>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <input type="email" placeholder={currentT.email} value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full p-4 ${bgInput} border ${borderCol} rounded-xl ${textMain} font-medium outline-none focus:border-[#2563EB] transition-colors`} required />
                        <input type="password" placeholder={currentT.password} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={`w-full p-4 ${bgInput} border ${borderCol} rounded-xl ${textMain} font-medium outline-none focus:border-[#2563EB] transition-colors`} required />
                        {authMessage.text && <p className={`text-[0.85rem] font-bold text-center ${authMessage.type === 'error' ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>{authMessage.text}</p>}
                        <button type="submit" disabled={isAuthenticating} className="w-full py-4 bg-[#2563EB] text-[#FFFFFF] rounded-xl font-black transition-colors hover:bg-[#1D4ED8] mt-2 outline-none">
                            {isAuthenticating ? currentT.loading : currentT.login}
                        </button>
                    </form>
                </motion.div>

                <AnimatePresence>
                    {showLangPrompt && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`w-full max-w-[400px] ${bgCard} rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[80vh] overflow-y-auto hide-scrollbar border ${borderCol}`}>
                                <button type="button" onClick={() => setShowLangPrompt(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${textMain} rounded-full outline-none`}><X size={18} /></button>
                                <h2 className={`text-[1.4rem] font-black tracking-tight mb-4 ${textMain} text-center`}>Language</h2>
                                <div className="flex flex-col gap-2">
                                    {languageOptions.map((opt) => (
                                        <button type="button" key={opt.code} onClick={() => { setLang(opt.code); setShowLangPrompt(false); }} className={`p-3 rounded-xl font-bold text-left border outline-none ${lang === opt.code ? 'bg-[#2563EB] text-[#FFFFFF] border-[#2563EB]' : `${bgCard} ${textMain} ${borderCol}`}`}>{opt.label}</button>
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
    // RENDER MASTER DASHBOARD VIEW
    // ==========================================
    return (
        <div className={`min-h-screen ${bgMain} font-sans flex flex-col relative transition-colors duration-300`}>
            
            {/* Header */}
            <header className={`${bgCard} border-b ${borderCol} px-6 py-4 flex flex-wrap items-center justify-between sticky top-0 z-40 shadow-sm gap-4 transition-colors duration-300`}>
                <div className="flex items-center gap-3">
                    <img src={logoSrc} alt="Movyra" className="h-8 w-auto transition-all" onError={(e) => { e.target.style.display = 'none' }} />
                    <div>
                        <h1 className={`text-[1.2rem] font-black ${textMain} leading-tight tracking-tight`}>SevaSetu</h1>
                        <p className={`${textMuted} text-[0.7rem] font-bold uppercase tracking-wider flex items-center gap-1`}><span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span> {currentT.dashboard}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF]" size={16} />
                        <input type="text" placeholder={currentT.search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`pl-9 pr-4 py-2 ${bgInput} border ${borderCol} rounded-lg ${textMain} font-medium outline-none focus:border-[#2563EB] w-48 sm:w-64 transition-colors`} />
                    </div>
                    
                    <button onClick={exportToCSV} className={`flex items-center gap-2 px-3 py-2 border ${borderCol} rounded-lg ${textMain} font-bold text-[0.85rem] ${bgInput} outline-none hover:border-[#2563EB] transition-colors`} title={currentT.export}>
                        <Download size={16} /> <span className="hidden sm:inline">{currentT.export}</span>
                    </button>

                    <button onClick={toggleTheme} className={`p-2 border ${borderCol} rounded-lg ${textMain} ${bgInput} outline-none`} title={isDarkMode ? currentT.light_mode : currentT.dark_mode}>
                        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                    </button>

                    <button onClick={() => setShowLangPrompt(true)} className={`flex items-center gap-2 px-3 py-2 border ${borderCol} rounded-lg ${textMain} font-bold text-[0.85rem] ${bgInput} outline-none transition-colors`}>
                        <Globe size={16} /> <span className="hidden sm:inline">{currentT.lang}</span>
                    </button>

                    <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 bg-[#FEF2F2] text-[#DC2626] rounded-lg font-bold text-[0.85rem] hover:bg-[#FCA5A5] transition-colors border border-[#DC2626] outline-none">
                        <LogOut size={16} /> <span className="hidden sm:inline">{currentT.logout}</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
                
                {/* Tab Navigation */}
                <div className="flex items-center gap-2 border-b border-[#E5E7EB] dark:border-[#222222] pb-2 overflow-x-auto hide-scrollbar">
                    {/* NagrikSetu Public Reports Tab */}
                    <button onClick={() => setActiveTab('nagrik')} className={`px-4 py-2 rounded-xl font-bold text-[0.9rem] flex items-center gap-2 outline-none whitespace-nowrap transition-colors ${activeTab === 'nagrik' ? activeBlue : inactiveBlue}`}>
                        <Megaphone size={16}/> {currentT.tab_nagrik}
                    </button>
                    <button onClick={() => setActiveTab('civic')} className={`px-4 py-2 rounded-xl font-bold text-[0.9rem] flex items-center gap-2 outline-none whitespace-nowrap transition-colors ${activeTab === 'civic' ? activeBlue : inactiveBlue}`}>
                        <LayoutDashboard size={16}/> {currentT.tab_civic}
                    </button>
                    <button onClick={() => setActiveTab('sahay')} className={`px-4 py-2 rounded-xl font-bold text-[0.9rem] flex items-center gap-2 outline-none whitespace-nowrap transition-colors ${activeTab === 'sahay' ? activeBlue : inactiveBlue}`}>
                        <LifeBuoy size={16}/> {currentT.tab_sahay}
                    </button>
                    
                    {/* Strict SuperAdmin Gatekeeper */}
                    {isSuperAdmin && (
                        <button onClick={() => setActiveTab('admin')} className={`px-4 py-2 rounded-xl font-bold text-[0.9rem] flex items-center gap-2 outline-none whitespace-nowrap transition-colors ${activeTab === 'admin' ? 'bg-[#DC2626] text-white' : inactiveBlue}`}>
                            <Lock size={16}/> {currentT.tab_admin}
                        </button>
                    )}
                </div>

                {/* ANIMATED SUBSCRIPTION CARD */}
                <div className={`${isDarkMode ? 'bg-[#001020] border-[#1d4ed8]' : 'bg-[#EFF6FF] border-[#2563EB]'} border rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between shadow-sm relative overflow-hidden transition-colors`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <ShieldCheck size={120} className={textMain} />
                    </div>
                    <div className="flex flex-col z-10 w-full md:w-auto mb-6 md:mb-0">
                        <h2 className={`text-2xl font-black ${textMain} mb-1`}>{organizationData?.org_name}</h2>
                        <p className="text-[#2563EB] font-bold uppercase tracking-wider text-sm mb-4">{currentT.active_plan}: {organizationData?.plan_type}</p>
                        <p className={`${textMuted} font-medium text-sm max-w-lg`}>{currentT.plan_desc}</p>
                        <div className="flex items-center gap-3 mt-4">
                            <p className={`${textMain} font-mono text-xs ${bgInput} px-2 py-1 rounded inline-block border ${borderCol}`}>
                                {currentT.txn_id}: {organizationData?.payu_txn_id || "N/A"}
                            </p>
                            <span className="text-[0.7rem] font-bold text-[#16A34A] flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-ping"></span> {currentT.sync}</span>
                        </div>
                    </div>
                    
                    <div className={`relative w-24 h-24 flex items-center justify-center z-10 ${bgCard} rounded-full border-4 border-[#2563EB] shadow-lg`}>
                        <motion.div animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.8] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.8, 1], delay: 0 }} className="absolute">
                            <IndianRupee size={32} className={textMain} />
                        </motion.div>
                        <motion.div animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.8] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.8, 1], delay: 2 }} className="absolute">
                            <ShieldCheck size={32} className="text-[#16A34A]" />
                        </motion.div>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`${bgCard} border ${borderCol} p-4 rounded-xl shadow-sm flex flex-col transition-colors`}>
                        <span className={`${textMuted} text-[0.8rem] font-bold uppercase`}>{currentT.total}</span>
                        <span className={`${textMain} text-[1.8rem] font-black`}>{kpi.total}</span>
                    </div>
                    <div className={`${bgCard} border ${borderCol} p-4 rounded-xl shadow-sm flex flex-col border-l-4 border-l-[#D97706] transition-colors`}>
                        <span className={`${textMuted} text-[0.8rem] font-bold uppercase`}>{currentT.pending}</span>
                        <span className="text-[#D97706] text-[1.8rem] font-black">{kpi.pending}</span>
                    </div>
                    <div className={`${bgCard} border ${borderCol} p-4 rounded-xl shadow-sm flex flex-col border-l-4 border-l-[#2563EB] transition-colors`}>
                        <span className={`${textMuted} text-[0.8rem] font-bold uppercase`}>{currentT.in_progress}</span>
                        <span className="text-[#2563EB] text-[1.8rem] font-black">{kpi.in_progress}</span>
                    </div>
                    <div className={`${bgCard} border ${borderCol} p-4 rounded-xl shadow-sm flex flex-col border-l-4 border-l-[#16A34A] transition-colors`}>
                        <span className={`${textMuted} text-[0.8rem] font-bold uppercase`}>{currentT.resolved}</span>
                        <span className="text-[#16A34A] text-[1.8rem] font-black">{kpi.resolved}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className={`${bgCard} border ${borderCol} rounded-xl shadow-sm p-4 flex flex-wrap items-center justify-between gap-4 transition-colors`}>
                    <div className="flex items-center gap-2">
                        <Filter size={16} className={textMuted} />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${bgInput} border ${borderCol} rounded-lg px-3 py-1.5 ${textMain} font-bold text-[0.85rem] outline-none cursor-pointer transition-colors`}>
                            <option value="All">All Status</option>
                            <option value="Pending">{currentT.pending}</option>
                            <option value="Verified">{currentT.verified}</option>
                            <option value="In Progress">{currentT.in_progress}</option>
                            <option value="Resolved">{currentT.resolved}</option>
                            <option value="Rejected">{currentT.rejected}</option>
                        </select>
                    </div>
                </div>

                {/* Data Grid with Staggered Slides */}
                <div className={`${bgCard} border ${borderCol} rounded-xl shadow-sm overflow-hidden flex flex-col transition-colors min-h-[400px]`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`${isDarkMode ? 'bg-[#111111]' : 'bg-[#F9FAFB]'} border-b ${borderCol} ${textMain} text-[0.8rem] uppercase tracking-wider font-bold transition-colors`}>
                                    <th className="p-4">{currentT.ack}</th>
                                    <th className="p-4">{currentT.title}</th>
                                    <th className="p-4">{activeTab === 'admin' ? 'Email' : currentT.category}</th>
                                    <th className="p-4">{currentT.location}</th>
                                    <th className="p-4">Docs</th>
                                    <th className="p-4 text-right">{currentT.status}</th>
                                </tr>
                            </thead>
                            
                            <motion.tbody 
                                variants={tableContainerVariants} 
                                initial="hidden" 
                                animate="show"
                                key={activeTab + statusFilter + searchQuery} // Re-trigger animation on filter change
                                className="text-[0.9rem]"
                            >
                                {isLoadingData ? (
                                    <tr><td colSpan="6" className={`p-8 text-center ${textMuted} font-bold`}>{currentT.loading}</td></tr>
                                ) : filteredData.length === 0 ? (
                                    <tr><td colSpan="6" className={`p-8 text-center ${textMuted} font-bold`}>{currentT.no_data}</td></tr>
                                ) : (
                                    filteredData.map((record) => (
                                        <motion.tr variants={tableRowVariants} key={record.id} className={`border-b ${borderCol} hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}>
                                            <td className="p-4 font-mono font-bold text-[#2563EB]">{record.ack_number || record.id.substring(0,8)}</td>
                                            <td className={`p-4 font-black ${textMain} max-w-[200px] truncate`} title={record.title || record.needyName || record.request_type}>
                                                {record.title || record.needyName || record.request_type || "N/A"}
                                            </td>
                                            <td className={`p-4 font-medium ${textMuted}`}>{record.category || record.condition || record.email || "N/A"}</td>
                                            <td className={`p-4 font-medium ${textMuted} truncate max-w-[150px]`} title={record.location}>{record.location || "N/A"}</td>
                                            <td className="p-4">
                                                {(record.photo || record.mediaUrl) ? (
                                                    <button onClick={() => setSelectedImage(getFileUrl(record, record.photo))} className={`w-8 h-8 ${bgInput} rounded flex items-center justify-center border ${borderCol} ${textMain} outline-none`} title="View Image">
                                                        <ImageIcon size={14} />
                                                    </button>
                                                ) : <span className={`text-xs ${textMuted} italic`}>None</span>}
                                            </td>
                                            <td className="p-4 text-right">
                                                <select value={record.status || 'Pending'} onChange={(e) => updateRecordStatus(record, e.target.value)} className={`p-1.5 rounded-lg font-bold text-[0.8rem] border outline-none cursor-pointer ${record.status === 'Resolved' ? 'bg-[#ECFDF5] text-[#16A34A] border-[#16A34A] dark:bg-[#064e3b]' : record.status === 'In Progress' ? 'bg-[#EFF6FF] text-[#2563EB] border-[#2563EB] dark:bg-[#1e3a8a]' : record.status === 'Rejected' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626] dark:bg-[#7f1d1d]' : 'bg-[#FFFBEB] text-[#D97706] border-[#D97706] dark:bg-[#78350f]'}`}>
                                                    <option value="Pending">{currentT.pending}</option>
                                                    <option value="Verified">{currentT.verified}</option>
                                                    <option value="In Progress">{currentT.in_progress}</option>
                                                    <option value="Resolved">{currentT.resolved}</option>
                                                    <option value="Rejected">{currentT.rejected}</option>
                                                </select>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </motion.tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Image Viewer Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
                        <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 w-10 h-10 bg-[#FFFFFF] rounded-full flex items-center justify-center text-[#111111] hover:bg-[#F3F4F6] shadow-xl z-50 outline-none"><X size={20} /></button>
                        <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={selectedImage} alt="Document" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-[#FFFFFF]" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Language Prompt Modal */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`w-full max-w-[400px] ${bgCard} rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[80vh] overflow-y-auto hide-scrollbar border ${borderCol}`}>
                            <button type="button" onClick={() => setShowLangPrompt(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${textMain} rounded-full outline-none`}><X size={18} /></button>
                            <h2 className={`text-[1.4rem] font-black tracking-tight mb-4 ${textMain} text-center`}>Language</h2>
                            <div className="flex flex-col gap-2">
                                {languageOptions.map((opt) => (
                                    <button type="button" key={opt.code} onClick={() => { setLang(opt.code); setShowLangPrompt(false); }} className={`p-3 rounded-xl font-bold text-left border outline-none ${lang === opt.code ? 'bg-[#2563EB] text-[#FFFFFF] border-[#2563EB]' : `${bgCard} ${textMain} ${borderCol}`}`}>{opt.label}</button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}