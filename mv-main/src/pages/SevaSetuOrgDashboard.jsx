/**
 * SYSTEM DOCUMENTATION / NGO ORGANIZATION DASHBOARD & 14-LANGUAGE TRANSLATION
 * Context: Secure portal for verified NGOs to manage public civic reports.
 * Database: PocketBase (ngo_users for auth, civic_reports for data).
 * Security: Strict Role-Based Access Control (No deletion privileges).
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Search, X, Globe, Image as ImageIcon, Filter, CheckCircle, IndianRupee, ShieldCheck, FileText, MapPin } from 'lucide-react';
import PocketBase from 'pocketbase';

const PB_URL = 'https://movyra-mv-main-db-gradio.hf.space';
const pb = new PocketBase(PB_URL);

const TRANSLATIONS = {
    en: {
        lang: "English", org_portal: "Organization Portal", email: "Email Address", password: "Password",
        login: "Secure Login", dashboard: "Civic Reports Dashboard", ack: "Acknowledgement",
        title: "Report Title", category: "Category", location: "Location", status: "Status", action: "Action",
        pending: "Pending", verified: "Verified", in_progress: "In Progress", resolved: "Resolved", rejected: "Rejected",
        update: "Update Status", logout: "Logout", loading: "Processing...", search: "Search Reports",
        total: "Total Reports", active_plan: "Active Subscription", txn_id: "Transaction Reference",
        plan_desc: "Your organization is verified and active on the SevaSetu network."
    },
    hi: {
        lang: "हिन्दी", org_portal: "संगठन पोर्टल", email: "ईमेल पता", password: "पासवर्ड", login: "लॉगिन करें",
        dashboard: "नागरिक रिपोर्ट डैशबोर्ड", ack: "पावती", title: "रिपोर्ट शीर्षक", category: "श्रेणी", location: "स्थान",
        status: "स्थिति", action: "कार्रवाई", pending: "लंबित", verified: "सत्यापित", in_progress: "प्रगति पर", resolved: "हल हो गया", rejected: "अस्वीकृत",
        update: "स्थिति अपडेट करें", logout: "लॉगआउट", loading: "प्रसंस्करण...", search: "रिपोर्ट खोजें",
        total: "कुल रिपोर्ट", active_plan: "सक्रिय सदस्यता", txn_id: "लेनदेन संदर्भ", plan_desc: "आपका संगठन SevaSetu नेटवर्क पर सत्यापित और सक्रिय है।"
    },
    hinglish: {
        lang: "Hinglish", org_portal: "Organization Portal", email: "Email Address", password: "Password", login: "Login Karein",
        dashboard: "Civic Reports Dashboard", ack: "Acknowledgement", title: "Report Title", category: "Category", location: "Location",
        status: "Status", action: "Action", pending: "Pending", verified: "Verified", in_progress: "In Progress", resolved: "Resolved", rejected: "Rejected",
        update: "Status Update Karein", logout: "Logout", loading: "Processing...", search: "Reports Search Karein",
        total: "Total Reports", active_plan: "Active Subscription", txn_id: "Transaction ID", plan_desc: "Aapka organization SevaSetu network par verified aur active hai."
    },
    mr: {
        lang: "मराठी", org_portal: "संस्था पोर्टल", email: "ईमेल पत्ता", password: "पासवर्ड", login: "लॉग इन करा",
        dashboard: "नागरी अहवाल डॅशबोर्ड", ack: "पोचपावती", title: "अहवाल शीर्षक", category: "श्रेणी", location: "स्थान",
        status: "स्थिती", action: "कृती", pending: "प्रलंबित", verified: "सत्यापित", in_progress: "प्रगतीपथावर", resolved: "सोडवले", rejected: "नाकारले",
        update: "स्थिती अपडेट करा", logout: "लॉगआउट", loading: "प्रक्रिया...", search: "अहवाल शोधा",
        total: "एकूण अहवाल", active_plan: "सक्रिय सदस्यता", txn_id: "व्यवहार संदर्भ", plan_desc: "तुमची संस्था SevaSetu नेटवर्कवर सत्यापित आणि सक्रिय आहे."
    },
    gu: {
        lang: "ગુજરાતી", org_portal: "સંસ્થા પોર્ટલ", email: "ઇમેઇલ સરનામું", password: "પાસવર્ડ", login: "લૉગિન કરો",
        dashboard: "નાગરિક અહેવાલો ડેશબોર્ડ", ack: "સ્વીકૃતિ", title: "અહેવાલ શીર્ષક", category: "શ્રેણી", location: "સ્થાન",
        status: "સ્થિતિ", action: "ક્રિયા", pending: "બાકી", verified: "ચકાસાયેલ", in_progress: "પ્રગતિમાં છે", resolved: "ઉકેલાઈ ગયું", rejected: "નકારવામાં આવેલ",
        update: "સ્થિતિ અપડેટ કરો", logout: "લોગઆઉટ", loading: "પ્રક્રિયા...", search: "અહેવાલો શોધો",
        total: "કુલ અહેવાલો", active_plan: "સક્રિય સબ્સ્ક્રિપ્શન", txn_id: "વ્યવહાર સંદર્ભ", plan_desc: "તમારી સંસ્થા SevaSetu નેટવર્ક પર ચકાસાયેલ અને સક્રિય છે."
    },
    te: {
        lang: "తెలుగు", org_portal: "సంస్థ పోర్టల్", email: "ఈమెయిల్", password: "పాస్‌వర్డ్", login: "లాగిన్ చేయండి",
        dashboard: "పౌర నివేదికల డాష్‌బోర్డ్", ack: "అక్నాలెడ్జ్‌మెంట్", title: "నివేదిక శీర్షిక", category: "వర్గం", location: "స్థానం",
        status: "స్థితి", action: "చర్య", pending: "పెండింగ్", verified: "ధృవీకరించబడింది", in_progress: "పురోగతిలో ఉంది", resolved: "పరిష్కరించబడింది", rejected: "తిరస్కరించబడింది",
        update: "స్థితిని నవీకరించండి", logout: "లాగౌట్", loading: "ప్రాసెస్...", search: "నివేదికలను శోధించండి",
        total: "మొత్తం నివేదికలు", active_plan: "క్రియాశీల సభ్యత్వం", txn_id: "లావాదేవీ సూచన", plan_desc: "మీ సంస్థ SevaSetu నెట్‌వర్క్‌లో ధృవీకరించబడింది మరియు క్రియాశీలంగా ఉంది."
    },
    ta: {
        lang: "தமிழ்", org_portal: "நிறுவன போர்டல்", email: "மின்னஞ்சல்", password: "கடவுச்சொல்", login: "உள்நுழைக",
        dashboard: "குடிமக்கள் அறிக்கைகள் டாஷ்போர்டு", ack: "ஒப்புகை", title: "அறிக்கை தலைப்பு", category: "வகை", location: "இடம்",
        status: "நிலை", action: "செயல்", pending: "நிலுவையில்", verified: "சரிபார்க்கப்பட்டது", in_progress: "செயலில் உள்ளது", resolved: "தீர்க்கப்பட்டது", rejected: "நிராகரிக்கப்பட்டது",
        update: "நிலையை புதுப்பிக்கவும்", logout: "வெளியேறு", loading: "செயலாக்கம்...", search: "அறிக்கைகளைத் தேடுங்கள்",
        total: "மொத்த அறிக்கைகள்", active_plan: "செயலில் உள்ள சந்தா", txn_id: "பரிவர்த்தனை குறிப்பு", plan_desc: "உங்கள் நிறுவனம் SevaSetu நெட்வொர்க்கில் சரிபார்க்கப்பட்டு செயலில் உள்ளது."
    },
    pa: {
        lang: "ਪੰਜਾਬੀ", org_portal: "ਸੰਗਠਨ ਪੋਰਟਲ", email: "ਈਮੇਲ", password: "ਪਾਸਵਰਡ", login: "ਲਾਗਇਨ ਕਰੋ",
        dashboard: "ਨਾਗਰਿਕ ਰਿਪੋਰਟਾਂ ਡੈਸ਼ਬੋਰਡ", ack: "ਰਸੀਦ", title: "ਰਿਪੋਰਟ ਸਿਰਲੇਖ", category: "ਸ਼੍ਰੇਣੀ", location: "ਸਥਾਨ",
        status: "ਸਥਿਤੀ", action: "ਕਾਰਵਾਈ", pending: "ਬਕਾਇਆ", verified: "ਪ੍ਰਮਾਣਿਤ", in_progress: "ਪ੍ਰਗਤੀ ਵਿੱਚ", resolved: "ਹੱਲ ਕੀਤਾ ਗਿਆ", rejected: "ਰੱਦ",
        update: "ਸਥਿਤੀ ਅੱਪਡੇਟ ਕਰੋ", logout: "ਲਾਗਆਊਟ", loading: "ਪ੍ਰਕਿਰਿਆ...", search: "ਰਿਪੋਰਟਾਂ ਖੋਜੋ",
        total: "ਕੁੱਲ ਰਿਪੋਰਟਾਂ", active_plan: "ਸਰਗਰਮ ਗਾਹਕੀ", txn_id: "ਲੈਣ-ਦੇਣ ਦਾ ਹਵਾਲਾ", plan_desc: "ਤੁਹਾਡਾ ਸੰਗਠਨ SevaSetu ਨੈੱਟਵਰਕ 'ਤੇ ਪ੍ਰਮਾਣਿਤ ਅਤੇ ਸਰਗਰਮ ਹੈ।"
    },
    bho: {
        lang: "भोजपुरी", org_portal: "संगठन पोर्टल", email: "ईमेल", password: "पासवर्ड", login: "लॉगिन करीं",
        dashboard: "नागरिक रिपोर्ट डैशबोर्ड", ack: "पावती", title: "रिपोर्ट शीर्षक", category: "श्रेणी", location: "स्थान",
        status: "स्थिति", action: "कार्रवाई", pending: "लंबित", verified: "सत्यापित", in_progress: "प्रगति पर", resolved: "हल हो गइल", rejected: "अस्वीकृत",
        update: "स्थिति अपडेट करीं", logout: "लॉगआउट", loading: "प्रक्रिया...", search: "रिपोर्ट खोजीं",
        total: "कुल रिपोर्ट", active_plan: "सक्रिय सदस्यता", txn_id: "लेनदेन संदर्भ", plan_desc: "रउआँ के संगठन SevaSetu नेटवर्क पर सत्यापित अउर सक्रिय बा।"
    },
    bn: {
        lang: "বাংলা", org_portal: "প্রতিষ্ঠান পোর্টাল", email: "ইমেইল", password: "পাসওয়ার্ড", login: "লগইন",
        dashboard: "নাগরিক প্রতিবেদন ড্যাশবোর্ড", ack: "রসিদ", title: "প্রতিবেদনের শিরোনাম", category: "বিভাগ", location: "অবস্থান",
        status: "অবস্থা", action: "পদক্ষেপ", pending: "অপেক্ষমান", verified: "যাচাইকৃত", in_progress: "প্রক্রিয়াধীন", resolved: "সমাধান করা হয়েছে", rejected: "বাতিল",
        update: "অবস্থা আপডেট করুন", logout: "লগআউট", loading: "প্রক্রিয়া চলছে...", search: "প্রতিবেদন অনুসন্ধান করুন",
        total: "মোট প্রতিবেদন", active_plan: "সক্রিয় সদস্যতা", txn_id: "লেনদেন রেফারেন্স", plan_desc: "আপনার প্রতিষ্ঠান SevaSetu নেটওয়ার্কে যাচাইকৃত এবং সক্রিয়।"
    },
    kn: {
        lang: "ಕನ್ನಡ", org_portal: "ಸಂಸ್ಥೆ ಪೋರ್ಟಲ್", email: "ಇಮೇಲ್", password: "ಪಾಸ್ವರ್ಡ್", login: "ಲಾಗಿನ್",
        dashboard: "ನಾಗರಿಕ ವರದಿಗಳ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", ack: "ರಶೀದಿ", title: "ವರದಿ ಶೀರ್ಷಿಕೆ", category: "ವರ್ಗ", location: "ಸ್ಥಳ",
        status: "ಸ್ಥಿತಿ", action: "ಕ್ರಮ", pending: "ಬಾಕಿಯಿದೆ", verified: "ಪರಿಶೀಲಿಸಲಾಗಿದೆ", in_progress: "ಪ್ರಗತಿಯಲ್ಲಿದೆ", resolved: "ಪರಿಹರಿಸಲಾಗಿದೆ", rejected: "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
        update: "ಸ್ಥಿತಿ ನವೀಕರಿಸಿ", logout: "ಲಾಗ್ಔಟ್", loading: "ಪ್ರಕ್ರಿಯೆ...", search: "ವರದಿಗಳನ್ನು ಹುಡುಕಿ",
        total: "ಒಟ್ಟು ವರದಿಗಳು", active_plan: "ಸಕ್ರಿಯ ಚಂದಾದಾರಿಕೆ", txn_id: "ವಹಿವಾಟು ಉಲ್ಲೇಖ", plan_desc: "ನಿಮ್ಮ ಸಂಸ್ಥೆಯು SevaSetu ನೆಟ್‌ವರ್ಕ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ ಮತ್ತು ಸಕ್ರಿಯವಾಗಿದೆ."
    },
    ml: {
        lang: "മലയാളം", org_portal: "സ്ഥാപന പോർട്ടൽ", email: "ഇമെയിൽ", password: "പാസ്‌വേഡ്", login: "ലോഗിൻ",
        dashboard: "സിവിക് റിപ്പോർട്ടുകൾ ഡാഷ്‌ബോർഡ്", ack: "രസീത്", title: "റിപ്പോർട്ട് ശീർഷകം", category: "വിഭാഗം", location: "സ്ഥലം",
        status: "അവസ്ഥ", action: "നടപടി", pending: "തീരുമാനിച്ചിട്ടില്ല", verified: "ഉറപ്പാക്കി", in_progress: "പുരോഗമിക്കുന്നു", resolved: "പരിഹരിച്ചു", rejected: "നിരസിച്ചു",
        update: "അവസ്ഥ അപ്ഡേറ്റ് ചെയ്യുക", logout: "ലോഗൗട്ട്", loading: "പ്രവർത്തിക്കുന്നു...", search: "റിപ്പോർട്ടുകൾ തിരയുക",
        total: "ആകെ റിപ്പോർട്ടുകൾ", active_plan: "സജീവ സബ്‌സ്‌ക്രിപ്‌ഷൻ", txn_id: "ഇടപാട് റഫറൻസ്", plan_desc: "നിങ്ങളുടെ സ്ഥാപനം SevaSetu നെറ്റ്‌വർക്കിൽ പരിശോധിച്ചുറപ്പിക്കുകയും സജീവമാക്കുകയും ചെയ്തു."
    },
    or: {
        lang: "ଓଡ଼ିଆ", org_portal: "ସଂସ୍ଥା ପୋର୍ଟାଲ୍", email: "ଇମେଲ୍", password: "ପାସୱାର୍ଡ", login: "ଲଗଇନ୍",
        dashboard: "ନାଗରିକ ରିପୋର୍ଟ ଡ୍ୟାସବୋର୍ଡ", ack: "ରସିଦ", title: "ରିପୋର୍ଟ ଶୀର୍ଷକ", category: "ବିଭାଗ", location: "ସ୍ଥାନ",
        status: "ସ୍ଥିତି", action: "କାର୍ଯ୍ୟ", pending: "ବାକି ଅଛି", verified: "ଯାଞ୍ଚ ହୋଇଛି", in_progress: "ପ୍ରଗତିରେ ଅଛି", resolved: "ସମାଧାନ ହୋଇଛି", rejected: "ପ୍ରତ୍ୟାଖ୍ୟାନ ହୋଇଛି",
        update: "ସ୍ଥିତି ଅପଡେଟ୍ କରନ୍ତୁ", logout: "ଲଗଆଉଟ୍", loading: "ପ୍ରକ୍ରିୟାକରଣ...", search: "ରିପୋର୍ଟ ସନ୍ଧାନ କରନ୍ତୁ",
        total: "ମୋଟ ରିପୋର୍ଟ", active_plan: "ସକ୍ରିୟ ସଦସ୍ୟତା", txn_id: "କାରବାର ସନ୍ଦର୍ଭ", plan_desc: "ଆପଣଙ୍କର ସଂସ୍ଥା SevaSetu ନେଟୱାର୍କରେ ଯାଞ୍ଚ ହୋଇଛି ଏବଂ ସକ୍ରିୟ ଅଛି।"
    },
    as: {
        lang: "অসমীয়া", org_portal: "সংস্থা প'ৰ্টেল", email: "ইমেইল", password: "পাছৱৰ্ড", login: "লগইন",
        dashboard: "নাগৰিক প্ৰতিবেদন ডেচবৰ্ড", ack: "ৰচিদ", title: "প্ৰতিবেদনৰ শীৰ্ষক", category: "বিভাগ", location: "স্থান",
        status: "অৱস্থা", action: "পদক্ষেপ", pending: "বাকি আছে", verified: "পৰীক্ষা কৰা হ'ল", in_progress: "প্ৰগতিশীল", resolved: "সমাধান কৰা হ'ল", rejected: "বাতিল কৰা হ'ল",
        update: "অৱস্থা আপডেট কৰক", logout: "লগআউট", loading: "প্ৰক্ৰিয়া...", search: "প্ৰতিবেদন সন্ধান কৰক",
        total: "মুঠ প্ৰতিবেদন", active_plan: "সক্ৰিয় চাবস্ক্ৰিপচন", txn_id: "লেনদেনৰ প্ৰসংগ", plan_desc: "আপোনাৰ সংস্থা SevaSetu নেটৱৰ্কত প্ৰমাণিত আৰু সক্ৰিয়।"
    }
};

export default function SevaSetuOrgDashboard() {
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    
    // Auth State (Uses ngo_users collection, strictly not super admin)
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [organizationData, setOrganizationData] = useState(null);
    const [email, setEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authMessage, setAuthMessage] = useState({ text: '', type: '' });

    // Data State (civic_reports)
    const [reports, setReports] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    
    const [selectedImage, setSelectedImage] = useState(null);

    const currentT = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    const languageOptions = Object.keys(TRANSLATIONS).map(key => ({ code: key, label: TRANSLATIONS[key].lang }));

    // Check existing auth on load
    useEffect(() => {
        if (pb.authStore.isValid && pb.authStore.model?.collectionName === 'ngo_users') {
            setIsAuthenticated(true);
            setOrganizationData(pb.authStore.model);
            fetchReports();
        } else {
            pb.authStore.clear();
            setIsAuthenticated(false);
        }
    }, []);

    // ==========================================
    // AUTHENTICATION LOGIC
    // ==========================================
    const handleLogin = async (e) => {
        e.preventDefault();
        setIsAuthenticating(true);
        setAuthMessage({ text: '', type: '' });
        try {
            const authData = await pb.collection('ngo_users').authWithPassword(email, loginPassword);
            setIsAuthenticated(true);
            setOrganizationData(authData.record);
            fetchReports();
        } catch (error) {
            setAuthMessage({ text: 'Authentication failed. Invalid credentials or inactive account.', type: 'error' });
            pb.authStore.clear();
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleLogout = () => {
        pb.authStore.clear();
        setIsAuthenticated(false);
        setOrganizationData(null);
        setReports([]);
    };

    // ==========================================
    // DASHBOARD DATA LOGIC
    // ==========================================
    const fetchReports = async () => {
        setIsLoadingData(true);
        try {
            const resultList = await pb.collection('civic_reports').getFullList({ sort: '-created' });
            setReports(resultList);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const updateStatus = async (recordId, newStatus) => {
        try {
            await pb.collection('civic_reports').update(recordId, { status: newStatus });
            setReports(reports.map(rec => rec.id === recordId ? { ...rec, status: newStatus } : rec));
        } catch (error) {
            alert("Error updating report status.");
        }
    };

    const getFileUrl = (record, filename) => {
        if (!filename) return null;
        return pb.files.getUrl(record, filename);
    };

    const filteredReports = reports.filter(rec => {
        const matchesSearch = (rec.ack_number && rec.ack_number.toLowerCase().includes(searchQuery.toLowerCase())) || 
                              (rec.title && rec.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                              (rec.location && rec.location.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'All' || rec.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const kpi = {
        total: filteredReports.length,
        pending: filteredReports.filter(r => r.status === 'Pending').length,
        in_progress: filteredReports.filter(r => r.status === 'In Progress').length,
        resolved: filteredReports.filter(r => r.status === 'Resolved').length
    };

    // ==========================================
    // RENDER UNAUTHENTICATED PUBLIC VIEW
    // ==========================================
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center p-6 font-sans relative">
                <div className="absolute top-6 right-6 z-50">
                    <button type="button" onClick={() => setShowLangPrompt(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-[#111111] font-bold text-[0.85rem] bg-[#FFFFFF] hover:bg-[#F9FAFB] outline-none shadow-sm">
                        <Globe size={14} /> {currentT.lang}
                    </button>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-[#FFFFFF] rounded-2xl shadow-xl p-8 border border-[#E5E7EB]">
                    <div className="flex flex-col items-center mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <img src="/logo-7.png" alt="Movyra" className="h-8 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                            <span className="font-black text-[1.6rem] tracking-tighter text-[#111111]">ovyra <span className="text-[#2563EB]">SevaSetu</span></span>
                        </div>
                        <p className="text-[#6B7280] font-bold text-[0.85rem] uppercase tracking-wider">{currentT.org_portal}</p>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <input type="email" placeholder={currentT.email} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB]" required />
                        <input type="password" placeholder={currentT.password} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full p-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB]" required />
                        {authMessage.text && <p className={`text-[0.85rem] font-bold text-center ${authMessage.type === 'error' ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>{authMessage.text}</p>}
                        <button type="submit" disabled={isAuthenticating} className="w-full py-4 bg-[#2563EB] text-[#FFFFFF] rounded-xl font-black transition-colors hover:bg-[#1D4ED8] mt-2">
                            {isAuthenticating ? currentT.loading : currentT.login}
                        </button>
                    </form>
                </motion.div>

                {/* Language Prompt */}
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

    // ==========================================
    // RENDER AUTHENTICATED NGO DASHBOARD
    // ==========================================
    return (
        <div className="min-h-screen bg-[#FFFFFF] font-sans flex flex-col relative">
            
            {/* Header */}
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
                    <button onClick={() => setShowLangPrompt(true)} className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg text-[#111111] font-bold text-[0.85rem] bg-[#FFFFFF] outline-none hover:bg-[#F9FAFB] transition-colors">
                        <Globe size={16} /> <span className="hidden sm:inline">{currentT.lang}</span>
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 bg-[#FEF2F2] text-[#DC2626] rounded-lg font-bold text-[0.85rem] hover:bg-[#FCA5A5] transition-colors border border-[#DC2626] outline-none">
                        <LogOut size={16} /> <span className="hidden sm:inline">{currentT.logout}</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
                
                {/* ANIMATED SUBSCRIPTION GRAPHIC CARD */}
                <div className="bg-[#EFF6FF] border border-[#2563EB] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldCheck size={120} />
                    </div>
                    <div className="flex flex-col z-10 w-full md:w-auto mb-6 md:mb-0">
                        <h2 className="text-2xl font-black text-[#111111] mb-1">{organizationData?.org_name}</h2>
                        <p className="text-[#2563EB] font-bold uppercase tracking-wider text-sm mb-4">{currentT.active_plan}: {organizationData?.plan_type}</p>
                        <p className="text-[#4B5563] font-medium text-sm max-w-lg">{currentT.plan_desc}</p>
                        <p className="text-[#111111] font-mono text-xs mt-2 bg-[#FFFFFF] px-2 py-1 rounded inline-block border border-[#E5E7EB]">
                            {currentT.txn_id}: {organizationData?.payu_txn_id || "N/A"}
                        </p>
                    </div>
                    
                    {/* Synchronized Currency and Verification Loop */}
                    <div className="relative w-32 h-32 flex items-center justify-center z-10 bg-[#FFFFFF] rounded-full border-4 border-[#2563EB] shadow-lg">
                        <motion.div animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.8] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.8, 1], delay: 0 }} className="absolute">
                            <IndianRupee size={50} className="text-[#111111]" />
                        </motion.div>
                        <motion.div animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.8] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.8, 1], delay: 2 }} className="absolute">
                            <ShieldCheck size={50} className="text-[#16A34A]" />
                        </motion.div>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-4 rounded-xl shadow-sm flex flex-col">
                        <span className="text-[#6B7280] text-[0.8rem] font-bold uppercase">{currentT.total}</span>
                        <span className="text-[#111111] text-[1.8rem] font-black">{kpi.total}</span>
                    </div>
                    <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-4 rounded-xl shadow-sm flex flex-col border-l-4 border-l-[#D97706]">
                        <span className="text-[#6B7280] text-[0.8rem] font-bold uppercase">{currentT.pending}</span>
                        <span className="text-[#D97706] text-[1.8rem] font-black">{kpi.pending}</span>
                    </div>
                    <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-4 rounded-xl shadow-sm flex flex-col border-l-4 border-l-[#2563EB]">
                        <span className="text-[#6B7280] text-[0.8rem] font-bold uppercase">{currentT.in_progress}</span>
                        <span className="text-[#2563EB] text-[1.8rem] font-black">{kpi.in_progress}</span>
                    </div>
                    <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-4 rounded-xl shadow-sm flex flex-col border-l-4 border-l-[#16A34A]">
                        <span className="text-[#6B7280] text-[0.8rem] font-bold uppercase">{currentT.resolved}</span>
                        <span className="text-[#16A34A] text-[1.8rem] font-black">{kpi.resolved}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-[#6B7280]" />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-[#111111] font-bold text-[0.85rem] outline-none cursor-pointer">
                            <option value="All">{currentT.filter_all || "All Status"}</option>
                            <option value="Pending">{currentT.pending}</option>
                            <option value="Verified">{currentT.verified}</option>
                            <option value="In Progress">{currentT.in_progress}</option>
                            <option value="Resolved">{currentT.resolved}</option>
                        </select>
                    </div>
                </div>

                {/* Main Data Table */}
                <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#111111] text-[0.8rem] uppercase tracking-wider font-bold">
                                    <th className="p-4">{currentT.ack}</th>
                                    <th className="p-4">{currentT.title}</th>
                                    <th className="p-4">{currentT.category}</th>
                                    <th className="p-4">{currentT.location}</th>
                                    <th className="p-4">{currentT.doc}</th>
                                    <th className="p-4 text-right">{currentT.status}</th>
                                </tr>
                            </thead>
                            <tbody className="text-[0.9rem]">
                                {isLoadingData ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-[#6B7280] font-bold">{currentT.loading}</td></tr>
                                ) : filteredReports.length === 0 ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-[#6B7280] font-bold">No reports available.</td></tr>
                                ) : (
                                    filteredReports.map((report) => (
                                        <tr key={report.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors">
                                            <td className="p-4 font-mono font-bold text-[#2563EB]">{report.ack_number}</td>
                                            <td className="p-4 font-black text-[#111111] max-w-[200px] truncate" title={report.title}>{report.title}</td>
                                            <td className="p-4 font-medium text-[#4B5563]">{report.category}</td>
                                            <td className="p-4 font-medium text-[#4B5563] truncate max-w-[150px]" title={report.location}>{report.location}</td>
                                            <td className="p-4">
                                                {report.photo ? (
                                                    <button onClick={() => setSelectedImage(getFileUrl(report, report.photo))} className="w-8 h-8 bg-[#FFFFFF] rounded flex items-center justify-center border border-[#E5E7EB] text-[#111111] outline-none hover:bg-[#F3F4F6]" title="View Image">
                                                        <ImageIcon size={14} />
                                                    </button>
                                                ) : <span className="text-xs text-[#9CA3AF] italic">None</span>}
                                            </td>
                                            <td className="p-4 text-right">
                                                <select value={report.status} onChange={(e) => updateStatus(report.id, e.target.value)} className={`p-1.5 rounded-lg font-bold text-[0.8rem] border outline-none cursor-pointer ${report.status === 'Resolved' ? 'bg-[#ECFDF5] text-[#16A34A] border-[#16A34A]' : report.status === 'In Progress' ? 'bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]' : report.status === 'Rejected' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]' : 'bg-[#FFFBEB] text-[#D97706] border-[#D97706]'}`}>
                                                    <option value="Pending">{currentT.pending}</option>
                                                    <option value="Verified">{currentT.verified}</option>
                                                    <option value="In Progress">{currentT.in_progress}</option>
                                                    <option value="Resolved">{currentT.resolved}</option>
                                                    <option value="Rejected">{currentT.rejected}</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Image Viewer Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
                        <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 w-10 h-10 bg-[#FFFFFF] rounded-full flex items-center justify-center text-[#111111] hover:bg-[#F3F4F6] shadow-xl z-50 outline-none"><X size={20} /></button>
                        <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={selectedImage} alt="Civic Report Document" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-[#FFFFFF]" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Language Prompt Modal */}
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