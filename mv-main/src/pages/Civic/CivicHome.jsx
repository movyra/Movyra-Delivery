import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { auth } from '../../firebaseConfig';
import { 
    ShieldCheck, 
    BarChart3, 
    Map, 
    TerminalSquare, 
    ArrowRight,
    ArrowUp,
    Sun,
    Moon,
    Activity,
    Lock,
    Smartphone,
    Users,
    LayoutDashboard,
    X,
    Globe,
    LogOut,
    ArrowLeft,
    UploadCloud,
    CheckCircle,
    FileText,
    MapPin,
    Wand2,
    User,
    EyeOff,
    Send
} from 'lucide-react';
import { useCivicStore } from '../../store/useCivicStore';
import { submitCivicComplaint } from '../../services/civicService';
import { uploadCivicMedia } from '../../services/pocketbase';
import LocationPicker from '../../components/Civic/LocationPicker';

// Geographic hash generator for proximity sorting
const generateGeohash = (latitude, longitude, precision = 7) => {
    const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    let isEven = true;
    let lat = [-90.0, 90.0];
    let lon = [-180.0, 180.0];
    let bit = 0;
    let ch = 0;
    let geohash = '';

    while (geohash.length < precision) {
        if (isEven) {
            const mid = (lon[0] + lon[1]) / 2;
            if (longitude > mid) {
                ch |= (1 << (4 - bit));
                lon[0] = mid;
            } else {
                lon[1] = mid;
            }
        } else {
            const mid = (lat[0] + lat[1]) / 2;
            if (latitude > mid) {
                ch |= (1 << (4 - bit));
                lat[0] = mid;
            } else {
                lat[1] = mid;
            }
        }
        isEven = !isEven;
        if (bit < 4) {
            bit++;
        } else {
            geohash += base32[ch];
            bit = 0;
            ch = 0;
        }
    }
    return geohash;
};

export default function CivicHome() {
    const navigate = useNavigate();
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [user, setUser] = useState(null);
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    const [showSitemap, setShowSitemap] = useState(false);

    // Quick Report States
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [resolvedAddress, setResolvedAddress] = useState('');
    const [evidenceFile, setEvidenceFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const fileInputRef = useRef(null);

    // Variables for the standardized footer
    const localCity = "Mumbai";

    // Track authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Set initial language based on browser
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);
    }, []);

    // Reverse Geocoding Effect
    useEffect(() => {
        const fetchAddress = async () => {
            if (selectedLocation) {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${selectedLocation[0]}&lon=${selectedLocation[1]}`);
                    const data = await response.json();
                    if (data && data.display_name) {
                        setResolvedAddress(data.display_name);
                    }
                } catch (error) {
                    console.error("Reverse geocoding failed:", error);
                }
            }
        };
        fetchAddress();
    }, [selectedLocation]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            terminateSession();
            navigate('/civic');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 13-Language Comprehensive Dictionary (Simplified Terminology)
    const t = {
        en: {
            lang: "English", sign_in: "Sign In", sign_up: "Sign Up", log_out: "Log out", careers: "Careers", dev: "Developers", products: "Products", sitemap: "Sitemap", sitemap_desc: "Direct navigation to all Civic modules.",
            badge: "Smart City Operations",
            hero_title: "Manage City Services Fast & Securely.",
            hero_desc: "A simple, secure platform to report issues, track work progress, and manage daily municipal tasks in real time.",
            get_started: "Go to Dashboard",
            val_title: "Why Choose Us?", val_desc: "Built for speed, transparency, and simple tracking.",
            v1_t: "Location Tracking", v1_d: "Pinpoint exact locations for faster field response.",
            v2_t: "Live Updates", v2_d: "Watch the status of work change from pending to complete.",
            v3_t: "Secure Records", v3_d: "All data is stored safely with controlled access.",
            stat_title: "Clear Analytics.", stat_desc: "View performance dashboards instantly. Track total reports, resolution speed, and active areas without complex menus.",
            work_title: "How It Works", 
            w1_t: "Report", w1_d: "Submit details.", w2_t: "Assign", w2_d: "Routed to team.", w3_t: "Resolve", w3_d: "Work completed.",
            api_title: "Connect Systems.", api_desc: "Use our simple API to pull active task data into your existing tools. Standard JSON responses make integration fast.",
            api_btn: "Read API Docs",
            sec_title: "Data Privacy First.", sec_desc: "Your reports and personal details are protected by enterprise-grade security. We ensure that sensitive operational data is only accessible to authorized municipal personnel.",
            mob_title: "Access Anywhere.", mob_desc: "Report issues on the go. Our platform is fully optimized for smartphones and tablets, ensuring you can manage and track tasks from any field location.",
            imp_title: "Better Cities Together.", imp_desc: "Join thousands of citizens and municipal officials working in harmony. A unified network ensures faster resolutions and improves local infrastructure for everyone.",
            qr_title: "Quick Report", qr_sub: "File a public report directly without an account.",
            form_cat: "Categorization", form_title_label: "Report Title", form_title_ph: "Brief identification of the issue",
            form_div_label: "Category", form_div_ph: "Select Division...", 
            cat_road: "Road Maintenance", cat_san: "Sanitation Services", cat_water: "Water Supply", cat_elec: "Electrical Grid", cat_safe: "Public Safety",
            form_pri_label: "Priority", pri_std: "Standard Maintenance", pri_high: "High Urgency", pri_crit: "Critical Hazard",
            form_desc_label: "Details", form_desc_btn: "Structure Text", form_desc_ph: "Provide details about the issue...",
            lbl_reporter: "Your Name (Optional)", lbl_phone: "Contact Number (Optional)",
            priv_title: "Anonymous Submission", priv_sub: "Hide your identity from the public record.",
            submit_btn: "Submit Report", submit_proc: "Submitting...",
            map_title: "Location", ev_title: "Visual Evidence", ev_sub: "Select Image", ev_sub2: "JPEG, PNG, MP4 supported", ev_ready: "Ready for upload",
            err_title: "Title must contain at least 5 characters", err_cat: "Please select a category", err_desc: "Please provide a more detailed description (min 20 characters)",
            alert_map: "Please identify the exact location on the map before proceeding.", alert_fail: "Submission failed. Please try again.",
            succ_title: "Report Submitted", succ_sub: "The issue has been registered. Teams will be dispatched according to priority.",
            sm_home: "Public Portal", sm_report: "File a Report", sm_map: "Live Transparency Map", sm_admin: "Admin Console"
        },
        hi: {
            lang: "हिन्दी", sign_in: "साइन इन", sign_up: "साइन अप", log_out: "लॉग आउट", careers: "करियर", dev: "डेवलपर्स", products: "उत्पाद", sitemap: "साइटमैप", sitemap_desc: "सभी सिविक मॉड्यूल पर सीधा नेविगेशन।",
            badge: "स्मार्ट सिटी ऑपरेशंस",
            hero_title: "शहर की सेवाओं का तेजी से प्रबंधन करें।",
            hero_desc: "समस्याओं की रिपोर्ट करने और प्रगति को ट्रैक करने के लिए एक सुरक्षित मंच।",
            get_started: "डैशबोर्ड पर जाएं",
            val_title: "हमें क्यों चुनें?", val_desc: "गति, पारदर्शिता और आसान ट्रैकिंग के लिए बनाया गया।",
            v1_t: "स्थान ट्रैकिंग", v1_d: "तेजी से प्रतिक्रिया के लिए सटीक स्थान।",
            v2_t: "लाइव अपडेट", v2_d: "लंबित से पूर्ण होने तक कार्य की स्थिति देखें।",
            v3_t: "सुरक्षित रिकॉर्ड", v3_d: "सभी डेटा सुरक्षित रूप से संग्रहीत किया जाता है।",
            stat_title: "स्पष्ट विश्लेषिकी।", stat_desc: "प्रदर्शन डैशबोर्ड तुरंत देखें। संकल्प गति और सक्रिय क्षेत्रों को ट्रैक करें।",
            work_title: "यह कैसे काम करता है", 
            w1_t: "रिपोर्ट", w1_d: "विवरण सबमिट करें।", w2_t: "असाइन", w2_d: "टीम को भेजा गया।", w3_t: "समाधान", w3_d: "काम पूरा हुआ।",
            api_title: "सिस्टम कनेक्ट करें।", api_desc: "अपने मौजूदा टूल में डेटा खींचने के लिए हमारे API का उपयोग करें।",
            api_btn: "API डॉक्स पढ़ें",
            sec_title: "डेटा गोपनीयता।", sec_desc: "आपकी रिपोर्ट सुरक्षित हैं। केवल अधिकृत कर्मचारी ही डेटा देख सकते हैं।",
            mob_title: "कहीं भी पहुँचें।", mob_desc: "चलते-फिरते समस्याओं की रिपोर्ट करें। स्मार्टफ़ोन के लिए अनुकूलित।",
            imp_title: "एक साथ बेहतर शहर।", imp_desc: "हजारों नागरिकों से जुड़ें। एक एकीकृत नेटवर्क तेज समाधान सुनिश्चित करता है।",
            qr_title: "त्वरित रिपोर्ट", qr_sub: "बिना खाते के सीधे सार्वजनिक रिपोर्ट दर्ज करें।",
            form_cat: "वर्गीकरण", form_title_label: "रिपोर्ट का शीर्षक", form_title_ph: "समस्या की संक्षिप्त पहचान",
            form_div_label: "श्रेणी", form_div_ph: "विभाग चुनें...",
            cat_road: "सड़क रखरखाव", cat_san: "स्वच्छता सेवाएं", cat_water: "जल आपूर्ति", cat_elec: "इलेक्ट्रिकल ग्रिड", cat_safe: "सार्वजनिक सुरक्षा",
            form_pri_label: "प्राथमिकता", pri_std: "मानक रखरखाव", pri_high: "अत्यधिक तात्कालिकता", pri_crit: "गंभीर खतरा",
            form_desc_label: "विवरण", form_desc_btn: "संरचना पाठ", form_desc_ph: "समस्या के बारे में विवरण प्रदान करें...",
            lbl_reporter: "आपका नाम (वैकल्पिक)", lbl_phone: "संपर्क नंबर (वैकल्पिक)",
            priv_title: "गुमनाम सबमिशन", priv_sub: "सार्वजनिक रिकॉर्ड से अपनी पहचान छिपाएं।",
            submit_btn: "रिपोर्ट जमा करें", submit_proc: "सबमिट हो रहा है...",
            map_title: "स्थान", ev_title: "दृश्य साक्ष्य", ev_sub: "छवि चुनें", ev_sub2: "JPEG, PNG, MP4 समर्थित", ev_ready: "अपलोड के लिए तैयार",
            err_title: "शीर्षक में कम से कम 5 अक्षर होने चाहिए", err_cat: "कृपया एक श्रेणी चुनें", err_desc: "कृपया अधिक विस्तृत विवरण प्रदान करें (न्यूनतम 20 अक्षर)",
            alert_map: "कृपया आगे बढ़ने से पहले मानचित्र पर सटीक स्थान की पहचान करें।", alert_fail: "सबमिशन विफल। कृपया पुनः प्रयास करें।",
            succ_title: "रिपोर्ट सबमिट की गई", succ_sub: "समस्या दर्ज कर ली गई है। प्राथमिकता के अनुसार टीमों को भेजा जाएगा।",
            sm_home: "सार्वजनिक पोर्टल", sm_report: "रिपोर्ट दर्ज करें", sm_map: "लाइव पारदर्शिता मानचित्र", sm_admin: "एडमिन कंसोल"
        },
        hinglish: {
            lang: "Hinglish", sign_in: "Sign In", sign_up: "Sign Up", log_out: "Log out", careers: "Careers", dev: "Developers", products: "Products", sitemap: "Sitemap", sitemap_desc: "Sabhi Civic modules ka direct navigation.",
            badge: "Smart City Operations",
            hero_title: "City Services ko fast manage karein.",
            hero_desc: "Issues report karne aur progress track karne ka secure platform.",
            get_started: "Dashboard par jayein",
            val_title: "Humein kyun chunein?", val_desc: "Speed, transparency, aur easy tracking ke liye bana.",
            v1_t: "Location Tracking", v1_d: "Fast response ke liye exact location.",
            v2_t: "Live Updates", v2_d: "Work status ko pending se complete hote dekhein.",
            v3_t: "Secure Records", v3_d: "Sabhi data safely store hota hai.",
            stat_title: "Clear Analytics.", stat_desc: "Performance dashboards turant dekhein. Resolution speed track karein.",
            work_title: "Yeh kaise kaam karta hai", 
            w1_t: "Report", w1_d: "Details submit karein.", w2_t: "Assign", w2_d: "Team ko bheja gaya.", w3_t: "Resolve", w3_d: "Kaam poora hua.",
            api_title: "Systems Connect Karein.", api_desc: "Apne existing tools me data pull karne ke liye hamara API use karein.",
            api_btn: "API Docs Padhein",
            sec_title: "Data Privacy.", sec_desc: "Aapki reports secure hain. Sirf authorized staff data dekh sakte hain.",
            mob_title: "Kahin se bhi access karein.", mob_desc: "Chalte-phirte issues report karein. Smartphones ke liye optimized.",
            imp_title: "Ek sath behtar shehar.", imp_desc: "Hazaron citizens se judein. Unified network fast resolution ensure karta hai.",
            qr_title: "Quick Report", qr_sub: "Bina account ke direct public report file karein.",
            form_cat: "Categorization", form_title_label: "Report Title", form_title_ph: "Issue ki short pehchan",
            form_div_label: "Category", form_div_ph: "Division Select Karein...",
            cat_road: "Road Maintenance", cat_san: "Sanitation Services", cat_water: "Water Supply", cat_elec: "Electrical Grid", cat_safe: "Public Safety",
            form_pri_label: "Priority", pri_std: "Standard Maintenance", pri_high: "High Urgency", pri_crit: "Critical Hazard",
            form_desc_label: "Details", form_desc_btn: "Structure Text", form_desc_ph: "Issue ke details dein...",
            lbl_reporter: "Aapka Naam (Optional)", lbl_phone: "Contact Number (Optional)",
            priv_title: "Anonymous Submission", priv_sub: "Public record se apni identity chhipayein.",
            submit_btn: "Report Submit Karein", submit_proc: "Submit ho raha hai...",
            map_title: "Location", ev_title: "Visual Evidence", ev_sub: "Image Select Karein", ev_sub2: "JPEG, PNG, MP4 supported", ev_ready: "Upload ke liye ready",
            err_title: "Title me kam se kam 5 characters hone chahiye", err_cat: "Please ek category select karein", err_desc: "Please detailed description dein (minimum 20 characters)",
            alert_map: "Aage badhne se pehle map par exact location identify karein.", alert_fail: "Submission fail ho gaya. Please try again.",
            succ_title: "Report Submitted", succ_sub: "Issue register ho gaya hai. Priority ke hisaab se teams bhej di jayengi.",
            sm_home: "Public Portal", sm_report: "Report Darj Karein", sm_map: "Live Transparency Map", sm_admin: "Admin Console"
        },
        mr: {
            lang: "मराठी", sign_in: "साइन इन करा", sign_up: "साइन अप करा", log_out: "लॉग आउट", careers: "करिअर", dev: "डेव्हलपर्स", products: "उत्पादने", sitemap: "साइटमॅप", sitemap_desc: "सर्व सिविक मॉड्यूल्ससाठी थेट नेव्हिगेशन.",
            badge: "स्मार्ट सिटी ऑपरेशन्स",
            hero_title: "शहराच्या सेवांचे वेगाने व्यवस्थापन करा.",
            hero_desc: "समस्यांची नोंद करण्यासाठी आणि प्रगती ट्रॅक करण्यासाठी सुरक्षित प्लॅटफॉर्म.",
            get_started: "डॅशबोर्डवर जा",
            val_title: "आम्हाला का निवडावे?", val_desc: "वेग, पारदर्शकता आणि सोप्या ट्रॅकिंगसाठी बनवलेले.",
            v1_t: "लोकेशन ट्रॅकिंग", v1_d: "जलद प्रतिसादासाठी अचूक ठिकाण.",
            v2_t: "थेट अपडेट्स", v2_d: "काम प्रलंबित ते पूर्ण होईपर्यंत स्थिती पहा.",
            v3_t: "सुरक्षित रेकॉर्ड", v3_d: "सर्व डेटा सुरक्षितपणे जतन केला जातो.",
            stat_title: "स्पष्ट विश्लेषण.", stat_desc: "कामगिरी डॅशबोर्ड त्वरित पहा. सोडवण्याचा वेग ट्रॅक करा.",
            work_title: "हे कसे काम करते", 
            w1_t: "रिपोर्ट", w1_d: "तपशील सबमिट करा.", w2_t: "असाइन", w2_d: "टीम कडे पाठवले.", w3_t: "निराकरण", w3_d: "काम पूर्ण झाले.",
            api_title: "सिस्टम कनेक्ट करा.", api_desc: "तुमच्या सध्याच्या टूल्समध्ये डेटा ओढण्यासाठी आमचा API वापरा.",
            api_btn: "API डॉक्स वाचा",
            sec_title: "डेटा गोपनीयता.", sec_desc: "तुमचे रिपोर्ट सुरक्षित आहेत. केवळ अधिकृत कर्मचारीच डेटा पाहू शकतात.",
            mob_title: "कुठूनही प्रवेश करा.", mob_desc: "चालता-फिरता समस्यांची नोंद करा. स्मार्टफोन्ससाठी ऑप्टिमाइझ केलेले.",
            imp_title: "एकत्रित उत्तम शहरे.", imp_desc: "हजारो नागरिकांमध्ये सामील व्हा. एकसंध नेटवर्क जलद निराकरण सुनिश्चित करते.",
            qr_title: "त्वरित अहवाल", qr_sub: "खात्याशिवाय थेट सार्वजनिक अहवाल दाखल करा.",
            form_cat: "वर्गीकरण", form_title_label: "अहवालाचे शीर्षक", form_title_ph: "समस्येची संक्षिप्त ओळख",
            form_div_label: "श्रेणी", form_div_ph: "विभाग निवडा...",
            cat_road: "रस्ते देखभाल", cat_san: "स्वच्छता सेवा", cat_water: "पाणी पुरवठा", cat_elec: "विद्युत ग्रिड", cat_safe: "सार्वजनिक सुरक्षा",
            form_pri_label: "प्राधान्य", pri_std: "मानक देखभाल", pri_high: "उच्च तातडी", pri_crit: "गंभीर धोका",
            form_desc_label: "तपशील", form_desc_btn: "स्ट्रक्चर मजकूर", form_desc_ph: "समस्येबाबत तपशील द्या...",
            lbl_reporter: "तुमचे नाव (पर्यायी)", lbl_phone: "संपर्क क्रमांक (पर्यायी)",
            priv_title: "निनावी सबमिशन", priv_sub: "सार्वजनिक रेकॉर्डमधून तुमची ओळख लपवा.",
            submit_btn: "अहवाल सबमिट करा", submit_proc: "सबमिट करत आहे...",
            map_title: "स्थान", ev_title: "दृश्य पुरावा", ev_sub: "प्रतिमा निवडा", ev_sub2: "JPEG, PNG, MP4 समर्थित", ev_ready: "अपलोडसाठी तयार",
            err_title: "शीर्षकामध्ये किमान ५ अक्षरे असणे आवश्यक आहे", err_cat: "कृपया श्रेणी निवडा", err_desc: "कृपया अधिक तपशीलवार वर्णन द्या (किमान २० अक्षरे)",
            alert_map: "कृपया पुढे जाण्यापूर्वी नकाशावर अचूक स्थान ओळखा.", alert_fail: "सबमिशन अयशस्वी. कृपया पुन्हा प्रयत्न करा.",
            succ_title: "अहवाल सबमिट केला", succ_sub: "समस्येची नोंद झाली आहे. प्राधान्यानुसार टीम्स पाठवल्या जातील.",
            sm_home: "सार्वजनिक पोर्टल", sm_report: "अहवाल दाखल करा", sm_map: "थेट पारदर्शकता नकाशा", sm_admin: "प्रशासन कन्सोल"
        },
        gu: {
            lang: "ગુજરાતી", sign_in: "સાઇન ઇન", sign_up: "સાઇન અપ", log_out: "લૉગ આઉટ", careers: "કારકિર્દી", dev: "ડેવલપર્સ", products: "ઉત્પાદનો", sitemap: "સાઇટમેપ", sitemap_desc: "તમામ સિવિક મોડ્યુલો માટે સીધું નેવિગેશન.",
            badge: "સ્માર્ટ સિટી ઓપરેશન્સ",
            hero_title: "શહેરની સેવાઓનું ઝડપથી સંચાલન કરો.",
            hero_desc: "સમસ્યાઓની જાણ કરવા અને પ્રગતિને ટ્રૅક કરવા માટે એક સુરક્ષિત પ્લેટફોર્મ.",
            get_started: "ડેશબોર્ડ પર જાઓ",
            val_title: "અમને શા માટે પસંદ કરો?", val_desc: "ઝડપ, પારદર્શિતા અને સરળ ટ્રેકિંગ માટે બનાવેલ.",
            v1_t: "સ્થાન ટ્રેકિંગ", v1_d: "ઝડપી પ્રતિસાદ માટે ચોક્કસ સ્થાન.",
            v2_t: "લાઇવ અપડેટ્સ", v2_d: "કાર્ય પેન્ડિંગથી પૂર્ણ થાય ત્યાં સુધી સ્થિતિ જુઓ.",
            v3_t: "સુરક્ષિત રેકોર્ડ્સ", v3_d: "તમામ ડેટા સુરક્ષિત રીતે સંગ્રહિત છે.",
            stat_title: "સ્પષ્ટ એનાલિટિક્સ.", stat_desc: "પ્રદર્શન ડેશબોર્ડ તરત જ જુઓ. રિઝોલ્યુશનની ઝડપને ટ્રૅક કરો.",
            work_title: "તે કેવી રીતે કામ કરે છે", 
            w1_t: "રિપોર્ટ", w1_d: "વિગતો સબમિટ કરો.", w2_t: "સોંપો", w2_d: "ટીમને મોકલવામાં આવ્યું.", w3_t: "ઉકેલો", w3_d: "કામ પૂર્ણ થયું.",
            api_title: "સિસ્ટમ્સ કનેક્ટ કરો.", api_desc: "તમારા વર્તમાન ટૂલ્સમાં ડેટા ખેંચવા માટે અમારા API નો ઉપયોગ કરો.",
            api_btn: "API ડૉક્સ વાંચો",
            sec_title: "ડેટા ગોપનીયતા.", sec_desc: "તમારું ડેટા સુરક્ષિત છે. માત્ર અધિકૃત સ્ટાફ જ ડેટા જોઈ શકે છે.",
            mob_title: "ગમે ત્યાંથી ઍક્સેસ કરો.", mob_desc: "સફરમાં સમસ્યાઓની જાણ કરો. સ્માર્ટફોન માટે ઑપ્ટિમાઇઝ.",
            imp_title: "એકસાથે વધુ સારા શહેરો.", imp_desc: "હજારો નાગરિકો સાથે જોડાઓ. એકીકૃત નેટવર્ક ઝડપી ઉકેલની ખાતરી કરે છે.",
            qr_title: "ઝડપી રિપોર્ટ", qr_sub: "એકાઉન્ટ વિના સીધો જાહેર અહેવાલ ફાઇલ કરો.",
            form_cat: "વર્ગીકરણ", form_title_label: "રિપોર્ટ શીર્ષક", form_title_ph: "સમસ્યાની ટૂંકી ઓળખ",
            form_div_label: "શ્રેણી", form_div_ph: "વિભાગ પસંદ કરો...",
            cat_road: "રોડ જાળવણી", cat_san: "સ્વચ્છતા સેવાઓ", cat_water: "પાણી પુરવઠો", cat_elec: "ઇલેક્ટ્રિકલ ગ્રીડ", cat_safe: "જાહેર સુરક્ષા",
            form_pri_label: "પ્રાધાન્ય", pri_std: "પ્રમાણભૂત જાળવણી", pri_high: "ઉચ્ચ તાકીદ", pri_crit: "ગંભીર સંકટ",
            form_desc_label: "વિગતો", form_desc_btn: "સ્ટ્રક્ચર ટેક્સ્ટ", form_desc_ph: "સમસ્યા વિશે વિગતો પ્રદાન કરો...",
            lbl_reporter: "તમારું નામ (વૈકલ્પિક)", lbl_phone: "સંપર્ક નંબર (વૈકલ્પિક)",
            priv_title: "અનામી સબમિશન", priv_sub: "જાહેર રેકોર્ડમાંથી તમારી ઓળખ છુપાવો.",
            submit_btn: "રિપોર્ટ સબમિટ કરો", submit_proc: "સબમિટ થઈ રહ્યું છે...",
            map_title: "સ્થાન", ev_title: "વિઝ્યુઅલ પુરાવા", ev_sub: "છબી પસંદ કરો", ev_sub2: "JPEG, PNG, MP4 સમર્થિત", ev_ready: "અપલોડ માટે તૈયાર છે",
            err_title: "શીર્ષકમાં ઓછામાં ઓછા 5 અક્ષરો હોવા જોઈએ", err_cat: "કૃપા કરીને શ્રેણી પસંદ કરો", err_desc: "કૃપા કરીને વધુ વિગતવાર વર્ણન આપો (ન્યૂનતમ 20 અક્ષરો)",
            alert_map: "આગળ વધતા પહેલા કૃપા કરીને નકશા પર ચોક્કસ સ્થાન ઓળખો.", alert_fail: "સબમિશન નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.",
            succ_title: "રિપોર્ટ સબમિટ કર્યો", succ_sub: "સમસ્યા નોંધવામાં આવી છે. અગ્રતા અનુસાર ટીમો મોકલવામાં આવશે.",
            sm_home: "જાહેર પોર્ટલ", sm_report: "રિપોર્ટ ફાઇલ કરો", sm_map: "જીવંત પારદર્શિતા નકશો", sm_admin: "એડમિન કન્સોલ"
        },
        te: {
            lang: "తెలుగు", sign_in: "సైన్ ఇన్", sign_up: "సైన్ అప్", log_out: "లాగౌట్", careers: "కెరీర్స్", dev: "డెవలపర్లు", products: "ఉత్పత్తులు", sitemap: "సైట్‌మ్యాప్", sitemap_desc: "అన్ని సివిక్ మాడ్యూల్స్‌కు ప్రత్యక్ష నావిగేషన్.",
            badge: "స్మార్ట్ సిటీ కార్యకలాపాలు",
            hero_title: "నగర సేవలను వేగంగా నిర్వహించండి.",
            hero_desc: "సమస్యలను నివేదించడానికి మరియు పురోగతిని ట్రాక్ చేయడానికి సురక్షిత వేదిక.",
            get_started: "డాష్‌బోర్డ్‌కు వెళ్లండి",
            val_title: "మమ్మల్ని ఎందుకు ఎంచుకోవాలి?", val_desc: "వేగం, పారదర్శకత మరియు సులభమైన ట్రాకింగ్ కోసం నిర్మించబడింది.",
            v1_t: "స్థాన ట్రాకింగ్", v1_d: "వేగవంతమైన ప్రతిస్పందన కోసం ఖచ్చితమైన స్థానం.",
            v2_t: "ప్రత్యక్ష నవీకరణలు", v2_d: "పెండింగ్ నుండి పూర్తయ్యే వరకు పని స్థితిని చూడండి.",
            v3_t: "సురక్షిత రికార్డులు", v3_d: "మొత్తం డేటా సురక్షితంగా నిల్వ చేయబడుతుంది.",
            stat_title: "స్పష్టమైన విశ్లేషణలు.", stat_desc: "పనితీరు డ్యాష్‌బోర్డ్‌లను తక్షణమే చూడండి. రిజల్యూషన్ వేగాన్ని ట్రాక్ చేయండి.",
            work_title: "ఇది ఎలా పనిచేస్తుంది", 
            w1_t: "నివేదించు", w1_d: "వివరాలను సమర్పించండి.", w2_t: "కేటాయించు", w2_d: "బృందానికి పంపబడింది.", w3_t: "పరిష్కరించు", w3_d: "పని పూర్తయింది.",
            api_title: "సిస్టమ్‌లను కనెక్ట్ చేయండి.", api_desc: "మీ ప్రస్తుత సాధనాల్లోకి డేటాను లాగడానికి మా APIని ఉపయోగించండి.",
            api_btn: "API డాక్స్ చదవండి",
            sec_title: "డేటా గోప్యత.", sec_desc: "మీ నివేదికలు సురక్షితం. అధీకృత సిబ్బంది మాత్రమే డేటాను చూడగలరు.",
            mob_title: "ఎక్కడి నుండైనా యాక్సెస్ చేయండి.", mob_desc: "ప్రయాణంలో సమస్యలను నివేదించండి. స్మార్ట్‌ఫోన్‌ల కోసం ఆప్టిమైజ్ చేయబడింది.",
            imp_title: "కలిసి మెరుగైన నగరాలు.", imp_desc: "వేలాది మంది పౌరులతో చేరండి. ఏకీకృత నెట్‌వర్క్ వేగవంతమైన పరిష్కారాన్ని నిర్ధారిస్తుంది.",
            qr_title: "త్వరిత నివేదిక", qr_sub: "ఖాతా లేకుండా నేరుగా పబ్లిక్ నివేదికను దాఖలు చేయండి.",
            form_cat: "వర్గీకరణ", form_title_label: "నివేదిక శీర్షిక", form_title_ph: "సమస్య యొక్క సంక్షిప్త గుర్తింపు",
            form_div_label: "వర్గం", form_div_ph: "విభాగాన్ని ఎంచుకోండి...",
            cat_road: "రహదారి నిర్వహణ", cat_san: "పారిశుద్ధ్య సేవలు", cat_water: "నీటి సరఫరా", cat_elec: "ఎలక్ట్రికల్ గ్రిడ్", cat_safe: "ప్రజా భద్రత",
            form_pri_label: "ప్రాధాన్యత", pri_std: "ప్రామాణిక నిర్వహణ", pri_high: "అధిక ఆవశ్యకత", pri_crit: "క్లిష్టమైన ప్రమాదం",
            form_desc_label: "వివరాలు", form_desc_btn: "నిర్మాణ వచనం", form_desc_ph: "సమస్య గురించి వివరాలను అందించండి...",
            lbl_reporter: "మీ పేరు (ఐచ్ఛికం)", lbl_phone: "సంప్రదింపు సంఖ్య (ఐచ్ఛికం)",
            priv_title: "అనామక సమర్పణ", priv_sub: "పబ్లిక్ రికార్డ్ నుండి మీ గుర్తింపును దాచండి.",
            submit_btn: "నివేదికను సమర్పించండి", submit_proc: "సమర్పిస్తోంది...",
            map_title: "స్థానం", ev_title: "దృశ్య ఆధారం", ev_sub: "చిత్రాన్ని ఎంచుకోండి", ev_sub2: "JPEG, PNG, MP4 మద్దతు ఉంది", ev_ready: "అప్‌లోడ్ కోసం సిద్ధంగా ఉంది",
            err_title: "శీర్షికలో కనీసం 5 అక్షరాలు ఉండాలి", err_cat: "దయచేసి ఒక వర్గాన్ని ఎంచుకోండి", err_desc: "దయచేసి మరింత వివరణాత్మక వివరణను అందించండి (కనీసం 20 అక్షరాలు)",
            alert_map: "కొనసాగడానికి ముందు దయచేసి మ్యాప్‌లో ఖచ్చితమైన స్థానాన్ని గుర్తించండి.", alert_fail: "సమర్పణ విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.",
            succ_title: "నివేదిక సమర్పించబడింది", succ_sub: "సమస్య నమోదు చేయబడింది. ప్రాధాన్యత ప్రకారం బృందాలు పంపబడతాయి.",
            sm_home: "పబ్లిక్ పోర్టల్", sm_report: "నివేదిక దాఖలు చేయండి", sm_map: "లైవ్ పారదర్శకత మ్యాప్", sm_admin: "అడ్మిన్ కన్సోల్"
        },
        ta: {
            lang: "தமிழ்", sign_in: "உள்நுழை", sign_up: "பதிவு செய்", log_out: "வெளியேறு", careers: "தொழில்கள்", dev: "டெவலப்பர்கள்", products: "தயாரிப்புகள்", sitemap: "தளத்தின் வரைபடம்", sitemap_desc: "அனைத்து சிவிக் தொகுதிகளுக்கும் நேரடி வழிசெலுத்தல்.",
            badge: "ஸ்மார்ட் சிட்டி செயல்பாடுகள்",
            hero_title: "நகர சேவைகளை வேகமாக நிர்வகிக்கவும்.",
            hero_desc: "சிக்கல்களைப் புகாரளிக்க மற்றும் முன்னேற்றத்தைக் கண்காணிக்க பாதுகாப்பான தளம்.",
            get_started: "டாஷ்போர்டுக்குச் செல்",
            val_title: "எங்களை ஏன் தேர்வு செய்ய வேண்டும்?", val_desc: "வேகம், வெளிப்படைத்தன்மை மற்றும் எளிதான கண்காணிப்பிற்காக உருவாக்கப்பட்டது.",
            v1_t: "இடக் கண்காணிப்பு", v1_d: "வேகமான பதிலுக்கு சரியான இடம்.",
            v2_t: "நேரடி புதுப்பிப்புகள்", v2_d: "பணி நிலுவையிலிருந்து முடிவடையும் வரை பார்க்கவும்.",
            v3_t: "பாதுகாப்பான பதிவுகள்", v3_d: "அனைத்து தரவுகளும் பாதுகாப்பாக சேமிக்கப்படுகின்றன.",
            stat_title: "தெளிவான பகுப்பாய்வு.", stat_desc: "செயல்திறன் டாஷ்போர்டுகளை உடனடியாகப் பார்க்கவும். தீர்வு வேகத்தைக் கண்காணிக்கவும்.",
            work_title: "இது எப்படி வேலை செய்கிறது", 
            w1_t: "அறிக்கை", w1_d: "விவரங்களைச் சமர்ப்பிக்கவும்.", w2_t: "ஒதுக்கு", w2_d: "குழுவிற்கு அனுப்பப்பட்டது.", w3_t: "தீர்வு", w3_d: "பணி முடிந்தது.",
            api_title: "கணினிகளை இணைக்கவும்.", api_desc: "உங்கள் தற்போதைய கருவிகளில் தரவை இழுக்க எங்கள் API ஐப் பயன்படுத்தவும்.",
            api_btn: "API ஆவணங்களைப் படிக்கவும்",
            sec_title: "தரவு தனியுரிமை.", sec_desc: "உங்கள் அறிக்கைகள் பாதுகாப்பானவை. அங்கீகரிக்கப்பட்ட ஊழியர்கள் மட்டுமே தரவைப் பார்க்க முடியும்.",
            mob_title: "எங்கிருந்தும் அணுகலாம்.", mob_desc: "பயணத்தின்போது சிக்கல்களைப் புகாரளிக்கவும். ஸ்மார்ட்போன்களுக்கு உகந்ததாக உள்ளது.",
            imp_title: "ஒன்றாக சிறந்த நகரங்கள்.", imp_desc: "ஆயிரக்கணக்கான குடிமக்களுடன் இணையுங்கள். ஒருங்கிணைந்த நெட்வொர்க் விரைவான தீர்வை உறுதி செய்கிறது.",
            qr_title: "விரைவான அறிக்கை", qr_sub: "கணக்கு இல்லாமல் நேரடியாக பொது அறிக்கையை தாக்கல் செய்யவும்.",
            form_cat: "வகைப்பாடு", form_title_label: "அறிக்கை தலைப்பு", form_title_ph: "பிரச்சனையின் சுருக்கமான அடையாளம்",
            form_div_label: "வகை", form_div_ph: "பிரிவைத் தேர்ந்தெடுக்கவும்...",
            cat_road: "சாலை பராமரிப்பு", cat_san: "சுகாதார சேவைகள்", cat_water: "நீர் வழங்கல்", cat_elec: "மின்சார கட்டம்", cat_safe: "பொது பாதுகாப்பு",
            form_pri_label: "முன்னுரிமை", pri_std: "நிலையான பராமரிப்பு", pri_high: "அதிக அவசரம்", pri_crit: "முக்கியமான ஆபத்து",
            form_desc_label: "விவரங்கள்", form_desc_btn: "கட்டமைப்பு உரை", form_desc_ph: "பிரச்சனை பற்றிய விவரங்களை வழங்கவும்...",
            lbl_reporter: "உங்கள் பெயர் (விருப்பம்)", lbl_phone: "தொடர்பு எண் (விருப்பம்)",
            priv_title: "அநாமதேய சமர்ப்பிப்பு", priv_sub: "பொது பதிவிலிருந்து உங்கள் அடையாளத்தை மறைக்கவும்.",
            submit_btn: "அறிக்கையை சமர்ப்பிக்கவும்", submit_proc: "சமர்ப்பிக்கிறது...",
            map_title: "இடம்", ev_title: "காட்சி சான்று", ev_sub: "படத்தைத் தேர்ந்தெடுக்கவும்", ev_sub2: "JPEG, PNG, MP4 ஆதரிக்கப்படுகிறது", ev_ready: "பதிவேற்றத்திற்கு தயார்",
            err_title: "தலைப்பில் குறைந்தது 5 எழுத்துக்கள் இருக்க வேண்டும்", err_cat: "தயவுசெய்து ஒரு வகையை தேர்ந்தெடுக்கவும்", err_desc: "மேலும் விரிவான விளக்கத்தை வழங்கவும் (குறைந்தது 20 எழுத்துக்கள்)",
            alert_map: "தொடர்வதற்கு முன் வரைபடத்தில் சரியான இடத்தை அடையாளம் காணவும்.", alert_fail: "சமர்ப்பிப்பு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
            succ_title: "அறிக்கை சமர்ப்பிக்கப்பட்டது", succ_sub: "பிரச்சனை பதிவு செய்யப்பட்டுள்ளது. முன்னுரிமைப்படி குழுக்கள் அனுப்பப்படும்.",
            sm_home: "பொது போர்டல்", sm_report: "அறிக்கையை தாக்கல் செய்", sm_map: "நேரடி வெளிப்படைத்தன்மை வரைபடம்", sm_admin: "நிர்வாக கன்சோல்"
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", sign_in: "ਸਾਈਨ ਇਨ", sign_up: "ਸਾਈਨ ਅੱਪ", log_out: "ਲੌਗ ਆਉਟ", careers: "ਕਰੀਅਰ", dev: "ਡਿਵੈਲਪਰ", products: "ਉਤਪਾਦ", sitemap: "ਸਾਈਟਮੈਪ", sitemap_desc: "ਸਾਰੇ ਸਿਵਿਕ ਮੋਡਿਊਲਾਂ ਲਈ ਸਿੱਧੀ ਨੈਵੀਗੇਸ਼ਨ।",
            badge: "ਸਮਾਰਟ ਸਿਟੀ ਸੰਚਾਲਨ",
            hero_title: "ਸ਼ਹਿਰ ਦੀਆਂ ਸੇਵਾਵਾਂ ਦਾ ਤੇਜ਼ੀ ਨਾਲ ਪ੍ਰਬੰਧਨ ਕਰੋ।",
            hero_desc: "ਸਮੱਸਿਆਵਾਂ ਦੀ ਰਿਪੋਰਟ ਕਰਨ ਅਤੇ ਤਰੱਕੀ ਨੂੰ ਟਰੈਕ ਕਰਨ ਲਈ ਇੱਕ ਸੁਰੱਖਿਅਤ ਪਲੇਟਫਾਰਮ।",
            get_started: "ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਜਾਓ",
            val_title: "ਸਾਨੂੰ ਕਿਉਂ ਚੁਣੋ?", val_desc: "ਗਤੀ, ਪਾਰਦਰਸ਼ਤਾ ਅਤੇ ਆਸਾਨ ਟਰੈਕਿੰਗ ਲਈ ਬਣਾਇਆ ਗਿਆ।",
            v1_t: "ਸਥਾਨ ਟਰੈਕਿੰਗ", v1_d: "ਤੇਜ਼ ਜਵਾਬ ਲਈ ਸਹੀ ਸਥਾਨ।",
            v2_t: "ਲਾਈਵ ਅੱਪਡੇਟ", v2_d: "ਕੰਮ ਦੀ ਸਥਿਤੀ ਨੂੰ ਬਕਾਇਆ ਤੋਂ ਪੂਰਾ ਹੁੰਦੇ ਦੇਖੋ।",
            v3_t: "ਸੁਰੱਖਿਅਤ ਰਿਕਾਰਡ", v3_d: "ਸਾਰਾ ਡਾਟਾ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਸਟੋਰ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।",
            stat_title: "ਸਪੱਸ਼ਟ ਵਿਸ਼ਲੇਸ਼ਣ।", stat_desc: "ਪ੍ਰਦਰਸ਼ਨ ਡੈਸ਼ਬੋਰਡ ਤੁਰੰਤ ਦੇਖੋ। ਹੱਲ ਦੀ ਗਤੀ ਨੂੰ ਟਰੈਕ ਕਰੋ।",
            work_title: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ", 
            w1_t: "ਰਿਪੋਰਟ", w1_d: "ਵੇਰਵੇ ਸਬਮਿਟ ਕਰੋ।", w2_t: "ਨਿਰਧਾਰਤ ਕਰੋ", w2_d: "ਟੀਮ ਨੂੰ ਭੇਜਿਆ ਗਿਆ।", w3_t: "ਹੱਲ ਕਰੋ", w3_d: "ਕੰਮ ਪੂਰਾ ਹੋਇਆ।",
            api_title: "ਸਿਸਟਮ ਕਨੈਕਟ ਕਰੋ।", api_desc: "ਆਪਣੇ ਮੌਜੂਦਾ ਟੂਲਸ ਵਿੱਚ ਡਾਟਾ ਖਿੱਚਣ ਲਈ ਸਾਡੇ API ਦੀ ਵਰਤੋਂ ਕਰੋ।",
            api_btn: "API ਡੌਕਸ ਪੜ੍ਹੋ",
            sec_title: "ਡਾਟਾ ਗੋਪਨੀਯਤਾ।", sec_desc: "ਤੁਹਾਡੀਆਂ ਰਿਪੋਰਟਾਂ ਸੁਰੱਖਿਅਤ ਹਨ। ਸਿਰਫ਼ ਅਧਿਕਾਰਤ ਸਟਾਫ਼ ਹੀ ਡਾਟਾ ਦੇਖ ਸਕਦਾ ਹੈ।",
            mob_title: "ਕਿਤੇ ਵੀ ਪਹੁੰਚ ਕਰੋ।", mob_desc: "ਚਲਦੇ-ਫਿਰਦੇ ਸਮੱਸਿਆਵਾਂ ਦੀ ਰਿਪੋਰਟ ਕਰੋ। ਸਮਾਰਟਫ਼ੋਨਾਂ ਲਈ ਅਨੁਕੂਲਿਤ।",
            imp_title: "ਇਕੱਠੇ ਬਿਹਤਰ ਸ਼ਹਿਰ।", imp_desc: "ਹਜ਼ਾਰਾਂ ਨਾਗਰਿਕਾਂ ਨਾਲ ਜੁੜੋ। ਇੱਕ ਏਕੀਕ੍ਰਿਤ ਨੈੱਟਵਰਕ ਤੇਜ਼ ਹੱਲ ਯਕੀਨੀ ਬਣਾਉਂਦਾ ਹੈ।",
            qr_title: "ਤੁਰੰਤ ਰਿਪੋਰਟ", qr_sub: "ਬਿਨਾਂ ਖਾਤੇ ਦੇ ਸਿੱਧੇ ਜਨਤਕ ਰਿਪੋਰਟ ਦਰਜ ਕਰੋ।",
            form_cat: "ਵਰਗੀਕਰਨ", form_title_label: "ਰਿਪੋਰਟ ਦਾ ਸਿਰਲੇਖ", form_title_ph: "ਸਮੱਸਿਆ ਦੀ ਸੰਖੇਪ ਪਛਾਣ",
            form_div_label: "ਸ਼੍ਰੇਣੀ", form_div_ph: "ਵਿਭਾਗ ਚੁਣੋ...",
            cat_road: "ਸੜਕ ਦੀ ਸਾਂਭ-ਸੰਭਾਲ", cat_san: "ਸੈਨੀਟੇਸ਼ਨ ਸੇਵਾਵਾਂ", cat_water: "ਪਾਣੀ ਦੀ ਸਪਲਾਈ", cat_elec: "ਇਲੈਕਟ੍ਰੀਕਲ ਗਰਿੱਡ", cat_safe: "ਜਨਤਕ ਸੁਰੱਖਿਆ",
            form_pri_label: "ਤਰਜੀਹ", pri_std: "ਮਿਆਰੀ ਰੱਖ-ਰਖਾਅ", pri_high: "ਉੱਚ ਜ਼ਰੂਰੀ", pri_crit: "ਗੰਭੀਰ ਖਤਰਾ",
            form_desc_label: "ਵੇਰਵੇ", form_desc_btn: "ਬਣਤਰ ਟੈਕਸਟ", form_desc_ph: "ਸਮੱਸਿਆ ਬਾਰੇ ਵੇਰਵੇ ਪ੍ਰਦਾਨ ਕਰੋ...",
            lbl_reporter: "ਤੁਹਾਡਾ ਨਾਮ (ਵਿਕਲਪਿਕ)", lbl_phone: "ਸੰਪਰਕ ਨੰਬਰ (ਵਿਕਲਪਿਕ)",
            priv_title: "ਗੁਮਨਾਮ ਸਬਮਿਸ਼ਨ", priv_sub: "ਜਨਤਕ ਰਿਕਾਰਡ ਤੋਂ ਆਪਣੀ ਪਛਾਣ ਲੁਕਾਓ।",
            submit_btn: "ਰਿਪੋਰਟ ਜਮ੍ਹਾਂ ਕਰੋ", submit_proc: "ਜਮ੍ਹਾਂ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
            map_title: "ਸਥਾਨ", ev_title: "ਵਿਜ਼ੂਅਲ ਸਬੂਤ", ev_sub: "ਚਿੱਤਰ ਚੁਣੋ", ev_sub2: "JPEG, PNG, MP4 ਸਮਰਥਿਤ ਹਨ", ev_ready: "ਅੱਪਲੋਡ ਲਈ ਤਿਆਰ",
            err_title: "ਸਿਰਲੇਖ ਵਿੱਚ ਘੱਟੋ-ਘੱਟ 5 ਅੱਖਰ ਹੋਣੇ ਚਾਹੀਦੇ ਹਨ", err_cat: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਸ਼੍ਰੇਣੀ ਚੁਣੋ", err_desc: "ਕਿਰਪਾ ਕਰਕੇ ਵਧੇਰੇ ਵਿਸਤ੍ਰਿਤ ਵਰਣਨ ਪ੍ਰਦਾਨ ਕਰੋ (ਘੱਟੋ-ਘੱਟ 20 ਅੱਖਰ)",
            alert_map: "ਕਿਰਪਾ ਕਰਕੇ ਅੱਗੇ ਵਧਣ ਤੋਂ ਪਹਿਲਾਂ ਨਕਸ਼ੇ 'ਤੇ ਸਹੀ ਸਥਾਨ ਦੀ ਪਛਾਣ ਕਰੋ।", alert_fail: "ਸਬਮਿਸ਼ਨ ਅਸਫਲ ਰਿਹਾ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
            succ_title: "ਰਿਪੋਰਟ ਜਮ੍ਹਾਂ ਕੀਤੀ ਗਈ", succ_sub: "ਸਮੱਸਿਆ ਦਰਜ ਕਰ ਲਈ ਗਈ ਹੈ। ਤਰਜੀਹ ਅਨੁਸਾਰ ਟੀਮਾਂ ਭੇਜੀਆਂ ਜਾਣਗੀਆਂ।",
            sm_home: "ਜਨਤਕ ਪੋਰਟਲ", sm_report: "ਰਿਪੋਰਟ ਦਰਜ ਕਰੋ", sm_map: "ਲਾਈਵ ਪਾਰਦਰਸ਼ਤਾ ਨਕਸ਼ਾ", sm_admin: "ਐਡਮਿਨ ਕੰਸੋਲ"
        },
        bho: {
            lang: "भोजपुरी", sign_in: "साइन इन", sign_up: "साइन अप", log_out: "लॉग आउट", careers: "करियर", dev: "डेवलपर्स", products: "उत्पाद", sitemap: "साइटमैप", sitemap_desc: "सब सिविक मॉड्यूल पर सीधा नेविगेशन।",
            badge: "स्मार्ट सिटी ऑपरेशंस",
            hero_title: "शहर के सेवा सभ के तेजी से प्रबंधन करीं।",
            hero_desc: "समस्या सभ के रिपोर्ट करे आ प्रगति के ट्रैक करे खातिर एगो सुरक्षित मंच।",
            get_started: "डैशबोर्ड पर जाईं",
            val_title: "हमनी के काहे चुनीं?", val_desc: "गति, पारदर्शिता आ आसान ट्रैकिंग खातिर बनावल गइल।",
            v1_t: "स्थान ट्रैकिंग", v1_d: "तेजी से प्रतिक्रिया खातिर सटीक स्थान।",
            v2_t: "लाइव अपडेट", v2_d: "लंबित से पूरा भइल तक काम के स्थिति देखीं।",
            v3_t: "सुरक्षित रिकॉर्ड", v3_d: "सब डेटा सुरक्षित रूप से संग्रहीत कइल जाला।",
            stat_title: "स्पष्ट विश्लेषिकी।", stat_desc: "प्रदर्शन डैशबोर्ड तुरंत देखीं। संकल्प गति के ट्रैक करीं।",
            work_title: "ई कइसे काम करेला", 
            w1_t: "रिपोर्ट", w1_d: "विवरण सबमिट करीं।", w2_t: "असाइन", w2_d: "टीम के भेजल गइल।", w3_t: "समाधान", w3_d: "काम पूरा भइल।",
            api_title: "सिस्टम कनेक्ट करीं।", api_desc: "आपन मौजूदा टूल में डेटा खींचे खातिर हमनी के API के उपयोग करीं।",
            api_btn: "API डॉक्स पढ़ीं",
            sec_title: "डेटा गोपनीयता।", sec_desc: "राउर रिपोर्ट सुरक्षित बा। खाली अधिकृत कर्मचारी ही डेटा देख सकेला।",
            mob_title: "कहीं भी पहुँचीं।", mob_desc: "चलत-फिरत समस्या के रिपोर्ट करीं। स्मार्टफोन खातिर अनुकूलित।",
            imp_title: "एक साथ बेहतर शहर।", imp_desc: "हजारों नागरिक लोग से जुड़ीं। एगो एकीकृत नेटवर्क तेज समाधान सुनिश्चित करेला।",
            qr_title: "त्वरित रिपोर्ट", qr_sub: "बिना खाता के सीधे सार्वजनिक रिपोर्ट दर्ज करीं।",
            form_cat: "वर्गीकरण", form_title_label: "रिपोर्ट के शीर्षक", form_title_ph: "समस्या के संक्षिप्त पहचान",
            form_div_label: "श्रेणी", form_div_ph: "विभाग चुनीं...",
            cat_road: "सड़क रखरखाव", cat_san: "स्वच्छता सेवा", cat_water: "जल आपूर्ति", cat_elec: "इलेक्ट्रिकल ग्रिड", cat_safe: "सार्वजनिक सुरक्षा",
            form_pri_label: "प्राथमिकता", pri_std: "मानक रखरखाव", pri_high: "अधिक तात्कालिकता", pri_crit: "गंभीर खतरा",
            form_desc_label: "विवरण", form_desc_btn: "संरचना पाठ", form_desc_ph: "समस्या के बारे में विवरण दीं...",
            lbl_reporter: "रउरा नाम (वैकल्पिक)", lbl_phone: "संपर्क नंबर (वैकल्पिक)",
            priv_title: "गुमनाम सबमिशन", priv_sub: "सार्वजनिक रिकॉर्ड से आपन पहचान छिपाईं।",
            submit_btn: "रिपोर्ट जमा करीं", submit_proc: "जमा हो रहल बा...",
            map_title: "स्थान", ev_title: "दृश्य साक्ष्य", ev_sub: "छवि चुनीं", ev_sub2: "JPEG, PNG, MP4 समर्थित", ev_ready: "अपलोड खातिर तइयार",
            err_title: "शीर्षक में कम से कम 5 अक्षर होखे के चाहीं", err_cat: "कृपया एगो श्रेणी चुनीं", err_desc: "कृपया अउरी विस्तृत विवरण दीं (कम से कम 20 अक्षर)",
            alert_map: "कृपया आगे बढ़े से पहिले नक्शा पर सटीक स्थान के पहचान करीं।", alert_fail: "सबमिशन विफल हो गइल। कृपया फेर से प्रयास करीं।",
            succ_title: "रिपोर्ट जमा भइल", succ_sub: "समस्या दर्ज क लिहल गइल बा। प्राथमिकता के अनुसार टीम भेजल जाई।",
            sm_home: "सार्वजनिक पोर्टल", sm_report: "रिपोर्ट सबमिट करीं", sm_map: "लाइव पारदर्शिता नक्शा", sm_admin: "एडमिन कंसोल"
        },
        ar: {
            lang: "العربية", sign_in: "تسجيل الدخول", sign_up: "التسجيل", log_out: "تسجيل الخروج", careers: "الوظائف", dev: "المطورون", products: "المنتجات", sitemap: "خريطة الموقع", sitemap_desc: "التنقل المباشر لجميع وحدات المدنية.",
            badge: "عمليات المدينة الذكية",
            hero_title: "إدارة خدمات المدينة بسرعة وأمان.",
            hero_desc: "منصة آمنة للإبلاغ عن المشكلات وتتبع التقدم.",
            get_started: "انتقل إلى لوحة القيادة",
            val_title: "لماذا تختارنا؟", val_desc: "مصمم للسرعة والشفافية والتتبع السهل.",
            v1_t: "تتبع الموقع", v1_d: "تحديد الموقع الدقيق لاستجابة أسرع.",
            v2_t: "تحديثات حية", v2_d: "شاهد حالة العمل من قيد الانتظار إلى مكتمل.",
            v3_t: "سجلات آمنة", v3_d: "يتم تخزين جميع البيانات بأمان.",
            stat_title: "تحليلات واضحة.", stat_desc: "عرض لوحات معلومات الأداء على الفور. تتبع سرعة الحل.",
            work_title: "كيف يعمل", 
            w1_t: "إبلاغ", w1_d: "إرسال التفاصيل.", w2_t: "تعيين", w2_d: "مُوجه إلى الفريق.", w3_t: "حل", w3_d: "اكتمل العمل.",
            api_title: "توصيل الأنظمة.", api_desc: "استخدم واجهة برمجة التطبيقات الخاصة بنا لسحب البيانات إلى أدواتك.",
            api_btn: "قراءة وثائق API",
            sec_title: "خصوصية البيانات.", sec_desc: "تقاريرك آمنة. يمكن للموظفين المصرح لهم فقط رؤية البيانات.",
            mob_title: "الوصول من أي مكان.", mob_desc: "الإبلاغ عن المشكلات أثناء التنقل. مُحسّن للهواتف الذكية.",
            imp_title: "مدن أفضل معًا.", imp_desc: "انضم إلى آلاف المواطنين. تضمن الشبكة الموحدة حلاً سريعًا.",
            qr_title: "تقرير سريع", qr_sub: "تقديم تقرير عام مباشرة دون حساب.",
            form_cat: "التصنيف", form_title_label: "عنوان التقرير", form_title_ph: "تحديد موجز للمشكلة",
            form_div_label: "الفئة", form_div_ph: "اختر القسم...", 
            cat_road: "صيانة الطرق", cat_san: "خدمات الصرف الصحي", cat_water: "إمدادات المياه", cat_elec: "الشبكة الكهربائية", cat_safe: "السلامة العامة",
            form_pri_label: "الأولوية", pri_std: "صيانة قياسية", pri_high: "إلحاح شديد", pri_crit: "خطر حرج",
            form_desc_label: "التفاصيل", form_desc_btn: "نص الهيكل", form_desc_ph: "قدم تفاصيل حول المشكلة...",
            lbl_reporter: "اسمك (اختياري)", lbl_phone: "رقم الاتصال (اختياري)",
            priv_title: "تقديم مجهول", priv_sub: "إخفاء هويتك من السجل العام.",
            submit_btn: "إرسال التقرير", submit_proc: "جاري الإرسال...",
            map_title: "الموقع", ev_title: "الأدلة البصرية", ev_sub: "تحديد صورة أو فيديو", ev_sub2: "تنسيقات JPEG و PNG و MP4 مدعومة", ev_ready: "جاهز للتحميل",
            err_title: "يجب أن يحتوي العنوان على 5 أحرف على الأقل", err_cat: "يرجى تحديد فئة", err_desc: "يرجى تقديم وصف أكثر تفصيلاً (20 حرفًا على الأقل)",
            alert_map: "يرجى تحديد الموقع الدقيق على الخريطة قبل المتابعة.", alert_fail: "فشل الإرسال. يرجى المحاولة مرة أخرى.",
            succ_title: "تم إرسال التقرير", succ_sub: "تم تسجيل المشكلة. سيتم إرسال الفرق حسب الأولوية.",
            sm_home: "البوابة العامة", sm_report: "تقديم تقرير", sm_map: "خريطة الشفافية المباشرة", sm_admin: "وحدة تحكم الإدارة"
        },
        es: {
            lang: "Español", sign_in: "Ingresar", sign_up: "Regístrate", log_out: "Cerrar sesión", careers: "Carreras", dev: "Desarrolladores", products: "Productos", sitemap: "Mapa del sitio", sitemap_desc: "Navegación directa a todos los módulos Cívicos.",
            badge: "Operaciones de Ciudad Inteligente",
            hero_title: "Gestione los Servicios de la Ciudad Rápidamente.",
            hero_desc: "Una plataforma segura para reportar problemas y seguir el progreso.",
            get_started: "Ir al Tablero",
            val_title: "¿Por qué elegirnos?", val_desc: "Creado para velocidad, transparencia y fácil seguimiento.",
            v1_t: "Rastreo de Ubicación", v1_d: "Ubicación exacta para una respuesta más rápida.",
            v2_t: "Actualizaciones en Vivo", v2_d: "Vea el estado del trabajo de pendiente a completo.",
            v3_t: "Registros Seguros", v3_d: "Todos los datos se almacenan de forma segura.",
            stat_title: "Análisis Claros.", stat_desc: "Vea paneles de rendimiento al instante. Rastree la velocidad de resolución.",
            work_title: "Cómo funciona", 
            w1_t: "Reportar", w1_d: "Enviar detalles.", w2_t: "Asignar", w2_d: "Enrutado al equipo.", w3_t: "Resolver", w3_d: "Trabajo completado.",
            api_title: "Conectar Sistemas.", api_desc: "Utilice nuestra API para extraer datos a sus herramientas existentes.",
            api_btn: "Leer Docs de API",
            sec_title: "Privacidad de Datos.", sec_desc: "Sus informes son seguros. Solo el personal autorizado puede ver los datos.",
            mob_title: "Accede a cualquier lugar.", mob_desc: "Reporte problemas sobre la marcha. Optimizado para smartphones.",
            imp_title: "Mejores ciudades juntos.", imp_desc: "Únase a miles de ciudadanos. Una red unificada asegura una resolución rápida.",
            qr_title: "Reporte Rápido", qr_sub: "Presente un informe público directamente sin una cuenta.",
            form_cat: "Categorización", form_title_label: "Título del Reporte", form_title_ph: "Breve identificación del problema",
            form_div_label: "Categoría", form_div_ph: "Seleccione División...", 
            cat_road: "Mantenimiento de Carreteras", cat_san: "Servicios de Saneamiento", cat_water: "Suministro de Agua", cat_elec: "Red Eléctrica", cat_safe: "Seguridad Pública",
            form_pri_label: "Prioridad", pri_std: "Mantenimiento Estándar", pri_high: "Alta Urgencia", pri_crit: "Peligro Crítico",
            form_desc_label: "Detalles", form_desc_btn: "Estructurar Texto", form_desc_ph: "Proporcione detalles sobre el problema...",
            lbl_reporter: "Su Nombre (Opcional)", lbl_phone: "Número de Contacto (Opcional)",
            priv_title: "Envío Anónimo", priv_sub: "Oculte su identidad del registro público.",
            submit_btn: "Enviar Reporte", submit_proc: "Enviando...",
            map_title: "Ubicación", ev_title: "Evidencia Visual", ev_sub: "Seleccionar Archivo", ev_sub2: "JPEG, PNG, MP4 soportados", ev_ready: "Listo para cargar",
            err_title: "El título debe contener al menos 5 caracteres", err_cat: "Por favor seleccione una categoría", err_desc: "Por favor proporcione una descripción más detallada (mínimo 20 caracteres)",
            alert_map: "Por favor identifique la ubicación exacta en el mapa antes de proceder.", alert_fail: "Fallo en el envío. Por favor, inténtelo de nuevo.",
            succ_title: "Reporte Enviado", succ_sub: "El problema ha sido registrado. Los equipos serán despachados según la prioridad.",
            sm_home: "Portal Público", sm_report: "Presentar un Reporte", sm_map: "Mapa de Transparencia", sm_admin: "Consola de Administración"
        },
        fr: {
            lang: "Français", sign_in: "Se connecter", sign_up: "S'inscrire", log_out: "Se déconnecter", careers: "Carrières", dev: "Développeurs", products: "Produits", sitemap: "Plan du site", sitemap_desc: "Navigation directe vers tous les modules Civiques.",
            badge: "Opérations de Ville Intelligente",
            hero_title: "Gérez les services de la ville rapidement.",
            hero_desc: "Une plateforme sécurisée pour signaler les problèmes et suivre les progrès.",
            get_started: "Aller au Tableau de bord",
            val_title: "Pourquoi nous choisir ?", val_desc: "Conçu pour la vitesse, la transparence et un suivi facile.",
            v1_t: "Suivi de Localisation", v1_d: "Emplacement exact pour une réponse plus rapide.",
            v2_t: "Mises à jour en direct", v2_d: "Voyez l'état du travail passer de en attente à terminé.",
            v3_t: "Dossiers Sécurisés", v3_d: "Toutes les données sont stockées en toute sécurité.",
            stat_title: "Analyses Claires.", stat_desc: "Affichez les tableaux de bord de performances instantanément.",
            work_title: "Comment ça marche", 
            w1_t: "Signaler", w1_d: "Soumettre les détails.", w2_t: "Assigner", w2_d: "Acheminé à l'équipe.", w3_t: "Résoudre", w3_d: "Travail terminé.",
            api_title: "Connecter les systèmes.", api_desc: "Utilisez notre API pour extraire les données vers vos outils.",
            api_btn: "Lire la documentation API",
            sec_title: "Confidentialité des données.", sec_desc: "Vos rapports sont sécurisés. Seul le personnel autorisé peut voir les données.",
            mob_title: "Accédez n'importe où.", mob_desc: "Signalez les problèmes en déplacement. Optimisé pour les smartphones.",
            imp_title: "De meilleures villes ensemble.", imp_desc: "Rejoignez des milliers de citoyens. Un réseau unifié assure une résolution rapide.",
            qr_title: "Rapport Rapide", qr_sub: "Déposez un rapport public directement sans compte.",
            form_cat: "Catégorisation", form_title_label: "Titre du Rapport", form_title_ph: "Brève identification du problème",
            form_div_label: "Catégorie", form_div_ph: "Sélectionnez la Division...", 
            cat_road: "Entretien Routier", cat_san: "Services d'Assainissement", cat_water: "Approvisionnement en Eau", cat_elec: "Réseau Électrique", cat_safe: "Sécurité Publique",
            form_pri_label: "Priorité", pri_std: "Entretien Standard", pri_high: "Haute Urgence", pri_crit: "Danger Critique",
            form_desc_label: "Détails", form_desc_btn: "Structurer le Texte", form_desc_ph: "Fournissez des détails sur le problème...",
            lbl_reporter: "Votre Nom (Optionnel)", lbl_phone: "Numéro de contact (Optionnel)",
            priv_title: "Soumission Anonyme", priv_sub: "Cachez votre identité du registre public.",
            submit_btn: "Soumettre le Rapport", submit_proc: "Soumission...",
            map_title: "Emplacement", ev_title: "Preuve Visuelle", ev_sub: "Sélectionner un Fichier", ev_sub2: "JPEG, PNG, MP4 pris en charge", ev_ready: "Prêt pour le téléchargement",
            err_title: "Le titre doit contenir au moins 5 caractères", err_cat: "Veuillez sélectionner une catégorie", err_desc: "Veuillez fournir une description plus détaillée (minimum 20 caractères)",
            alert_map: "Veuillez identifier l'emplacement exact sur la carte avant de continuer.", alert_fail: "Échec de la soumission. Veuillez réessayer.",
            succ_title: "Rapport Soumis", succ_sub: "Le problème a été enregistré. Des équipes seront dépêchées selon la priorité.",
            sm_home: "Portail Public", sm_report: "Soumettre un Rapport", sm_map: "Carte de Transparence", sm_admin: "Console d'Administration"
        },
        de: {
            lang: "Deutsch", sign_in: "Anmelden", sign_up: "Registrieren", log_out: "Abmelden", careers: "Karriere", dev: "Entwickler", products: "Produkte", sitemap: "Seitenverzeichnis", sitemap_desc: "Direkte Navigation zu allen Civic-Modulen.",
            badge: "Smart City-Betrieb",
            hero_title: "Städtische Dienste schnell verwalten.",
            hero_desc: "Sichere Plattform, um Probleme zu melden und den Fortschritt zu verfolgen.",
            get_started: "Zum Dashboard",
            val_title: "Warum uns wählen?", val_desc: "Gebaut für Geschwindigkeit, Transparenz und einfache Verfolgung.",
            v1_t: "Standortverfolgung", v1_d: "Genauer Standort für schnellere Reaktion.",
            v2_t: "Live-Updates", v2_d: "Sehen Sie den Arbeitsstatus von ausstehend bis abgeschlossen.",
            v3_t: "Sichere Aufzeichnungen", v3_d: "Alle Daten werden sicher gespeichert.",
            stat_title: "Klare Analysen.", stat_desc: "Leistungs-Dashboards sofort anzeigen. Lösungsgeschwindigkeit verfolgen.",
            work_title: "Wie es funktioniert", 
            w1_t: "Melden", w1_d: "Details einreichen.", w2_t: "Zuweisen", w2_d: "An Team weitergeleitet.", w3_t: "Lösen", w3_d: "Arbeit abgeschlossen.",
            api_title: "Systeme verbinden.", api_desc: "Verwenden Sie unsere API, um Daten in Ihre Tools zu ziehen.",
            api_btn: "API-Doku lesen",
            sec_title: "Datenschutz.", sec_desc: "Ihre Berichte sind sicher. Nur autorisiertes Personal kann Daten sehen.",
            mob_title: "Überall zugreifen.", mob_desc: "Probleme von unterwegs melden. Optimiert für Smartphones.",
            imp_title: "Gemeinsam bessere Städte.", imp_desc: "Schließen Sie sich Tausenden von Bürgern an. Ein einheitliches Netzwerk sorgt für schnelle Lösungen.",
            qr_title: "Schnellbericht", qr_sub: "Reichen Sie direkt und ohne Konto einen öffentlichen Bericht ein.",
            form_cat: "Kategorisierung", form_title_label: "Berichtstitel", form_title_ph: "Kurze Identifikation des Problems",
            form_div_label: "Kategorie", form_div_ph: "Abteilung Auswählen...", 
            cat_road: "Straßeninstandhaltung", cat_san: "Sanitärdienste", cat_water: "Wasserversorgung", cat_elec: "Stromnetz", cat_safe: "Öffentliche Sicherheit",
            form_pri_label: "Priorität", pri_std: "Standardwartung", pri_high: "Hohe Dringlichkeit", pri_crit: "Kritische Gefahr",
            form_desc_label: "Details", form_desc_btn: "Text Strukturieren", form_desc_ph: "Geben Sie Details zum Problem an...",
            lbl_reporter: "Ihr Name (Optional)", lbl_phone: "Kontaktnummer (Optional)",
            priv_title: "Anonyme Einreichung", priv_sub: "Verbergen Sie Ihre Identität in der öffentlichen Akte.",
            submit_btn: "Bericht Einreichen", submit_proc: "Einreichen...",
            map_title: "Standort", ev_title: "Visueller Beweis", ev_sub: "Datei Auswählen", ev_sub2: "JPEG, PNG, MP4 unterstützt", ev_ready: "Bereit zum Hochladen",
            err_title: "Titel muss mindestens 5 Zeichen enthalten", err_cat: "Bitte wählen Sie eine Kategorie aus", err_desc: "Bitte geben Sie eine detailliertere Beschreibung an (mindestens 20 Zeichen)",
            alert_map: "Bitte identifizieren Sie den genauen Standort auf der Karte, bevor Sie fortfahren.", alert_fail: "Einreichung fehlgeschlagen. Bitte versuchen Sie es erneut.",
            succ_title: "Bericht Eingereicht", succ_sub: "Das Problem wurde registriert. Teams werden nach Priorität entsandt.",
            sm_home: "Öffentliches Portal", sm_report: "Meldung Einreichen", sm_map: "Live-Transparenzkarte", sm_admin: "Admin-Konsole"
        }
    };

    const currentT = t[lang] || t['en'];
    const languageOptions = [
        { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' },
        { code: 'mr', label: 'मराठी' }, { code: 'gu', label: 'ગુજરાતી' }, { code: 'te', label: 'తెలుగు' },
        { code: 'ta', label: 'தமிழ்' }, { code: 'pa', label: 'ਪੰਜਾਬੀ' }, { code: 'bho', label: 'भोजपुरी' },
        { code: 'ar', label: 'العربية' }, { code: 'es', label: 'Español' }, { code: 'fr', label: 'Français' },
        { code: 'de', label: 'Deutsch' }
    ];

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    // Quick Report Form Setup
    const dynamicSchema = z.object({
        title: z.string().min(5, currentT.err_title).max(100),
        category: z.string().min(1, currentT.err_cat),
        priority: z.enum(['Standard', 'High', 'Critical']),
        description: z.string().min(20, currentT.err_desc),
        reporterName: z.string().optional(),
        reporterPhone: z.string().optional(),
        isAnonymous: z.boolean().default(false)
    });

    const { control, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm({
        resolver: zodResolver(dynamicSchema),
        defaultValues: {
            title: '', category: '', priority: 'Standard', description: '', reporterName: '', reporterPhone: '', isAnonymous: false
        }
    });

    const currentCategory = watch('category');
    const currentDescription = watch('description');

    const enhanceDescription = () => {
        if (!currentDescription || currentDescription.length < 10) return;
        const structuredText = `OFFICIAL INCIDENT REPORT\nCategory: ${currentCategory || 'Unspecified'}\nPriority Assessment: Pending Review\nDetails: ${currentDescription.charAt(0).toUpperCase() + currentDescription.slice(1)}\n\nPlease deploy necessary assessment personnel to evaluate the reported condition.`;
        setValue('description', structuredText);
    };

    const handleFileSelection = (e) => {
        if (e.target.files && e.target.files[0]) {
            setEvidenceFile(e.target.files[0]);
        }
    };

    const processSubmission = async (data) => {
        if (!selectedLocation) {
            alert(currentT.alert_map);
            return;
        }
        setIsProcessing(true);
        try {
            let evidenceUrl = null;
            if (evidenceFile) {
                evidenceUrl = await uploadCivicMedia(evidenceFile, null, data.category);
            }
            
            const finalPayload = {
                title: data.title,
                category: data.category,
                priority: data.priority,
                description: data.description,
                isAnonymous: data.isAnonymous,
                reporterName: data.isAnonymous ? 'Anonymous' : data.reporterName,
                reporterPhone: data.isAnonymous ? '' : data.reporterPhone,
                location: { latitude: selectedLocation[0], longitude: selectedLocation[1] },
                address: resolvedAddress || "Location captured via GPS",
                geohash: generateGeohash(selectedLocation[0], selectedLocation[1]),
                evidenceUrl: evidenceUrl,
                userId: 'PUBLIC_CITIZEN',
                ward: 'Zone A',
                status: 'Reported'
            };
            
            await submitCivicComplaint(finalPayload);
            setSubmissionSuccess(true);
            
            setTimeout(() => { 
                setSubmissionSuccess(false);
                reset();
                setEvidenceFile(null);
                setSelectedLocation(null);
                setResolvedAddress('');
            }, 5000);
        } catch (error) {
            console.error("Submission processing failed:", error);
            alert(currentT.alert_fail);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={`min-h-screen font-sans overflow-x-hidden flex flex-col transition-colors duration-300 ${
            theme === 'light' ? 'bg-[#f5f5f5] text-[#111111] selection:bg-black selection:text-white' : 'bg-[#050505] text-white selection:bg-white selection:text-black'
        }`}>
            <style>
                {`
                @keyframes fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade { animation: fade 0.6s ease-out forwards; }
                .stagger-3 { animation-delay: 0.3s; }
                html { scroll-behavior: smooth; }
                `}
            </style>

            {/* TRANSLATION MODAL */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-6 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'}`}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`w-full max-w-[400px] rounded-3xl p-8 flex flex-col shadow-2xl relative border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#222222]'}`}>
                            <button onClick={() => setShowLangPrompt(false)} className="absolute top-4 right-4 p-2"><X size={18} /></button>
                            <h2 className="text-[1.4rem] font-black tracking-tight mb-6 text-center">Language</h2>
                            <div className="flex flex-col gap-2 max-h-[45vh] overflow-y-auto">
                                {languageOptions.map((option) => (
                                    <button 
                                        key={option.code}
                                        onClick={() => { setLang(option.code); setShowLangPrompt(false); }}
                                        className={`w-full p-4 rounded-xl flex items-center justify-between font-bold text-[0.95rem] transition-colors border ${theme === 'light' ? (lang === option.code ? 'bg-black text-white border-black' : 'bg-[#f5f5f5] text-[#555555] border-transparent hover:border-black') : (lang === option.code ? 'bg-white text-black border-white' : 'bg-[#111111] text-[#aaaaaa] border-transparent hover:border-white')}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SITEMAP MODAL */}
            <AnimatePresence>
                {showSitemap && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-6 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'}`}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-[600px] rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[80vh] overflow-y-auto border ${
                                theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#222222]'
                            }`}
                        >
                            <button onClick={() => setShowSitemap(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors outline-none ${theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#888888] hover:text-white'}`}>
                                <X size={18} />
                            </button>
                            <h2 className={`text-[1.8rem] font-black tracking-tight mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{currentT.sitemap}</h2>
                            <p className={`font-medium mb-6 ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>{currentT.sitemap_desc}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { path: '/civic', name: currentT.sm_home },
                                    { path: '/civic/report', name: currentT.sm_report },
                                    { path: '/civic/map', name: currentT.sm_map },
                                    { path: '/civic/admin', name: currentT.sm_admin }
                                ].map(link => (
                                    <Link 
                                        key={link.path} 
                                        to={link.path}
                                        onClick={() => setShowSitemap(false)}
                                        className={`p-4 border rounded-xl font-bold transition-colors flex items-center justify-between group outline-none ${
                                            theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-black hover:border-black' : 'bg-[#111111] border-[#333333] text-white hover:border-white'
                                        }`}
                                    >
                                        {link.name}
                                        <ArrowLeft size={16} className="rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PRODUCTS ECOSYSTEM MODAL */}
            <AnimatePresence>
                {showProductsPrompt && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-6 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'}`}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-[500px] rounded-3xl p-8 flex flex-col shadow-2xl relative border ${
                                theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#222222]'
                            }`}
                        >
                            <button onClick={() => setShowProductsPrompt(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors outline-none ${theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#888888] hover:text-white'}`}>
                                <X size={18} />
                            </button>

                            <h2 className={`text-[1.5rem] font-black tracking-tight mb-2 text-center mt-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Also from us</h2>
                            <p className={`text-[0.9rem] text-center mb-8 ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>Discover our connected platforms.</p>

                            <Link to="/sahay/" className={`group flex flex-col items-center gap-4 p-6 rounded-2xl transition-colors text-center w-full outline-none border ${
                                theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] hover:border-black' : 'bg-[#111111] border-[#333333] hover:border-white'
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <img src={theme === 'light' ? '/logo-4.png' : '/logo.png'} alt="Movyra" className="h-6 w-auto" onError={(e) => e.target.style.display = 'none'} />
                                    <span className={`font-black text-[1.2rem] tracking-tighter ml-[-5px] ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                                        ovyra <span className={`font-medium text-[1rem] ml-1 ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>Sahay</span>
                                    </span>
                                </div>
                                <div>
                                    <p className={`text-[0.85rem] leading-relaxed transition-colors ${theme === 'light' ? 'text-[#555555] group-hover:text-black' : 'text-[#888888] group-hover:text-white'}`}>
                                        Humanitarian rescue network. Report emergencies and dispatch help.
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MASTER HEADER */}
            <header className={`fixed top-0 left-0 right-0 w-full flex items-center justify-between px-6 md:px-12 py-6 z-50 transition-colors backdrop-blur-md ${
                theme === 'light' ? 'bg-[#f5f5f5]/90 border-b border-[#e0e0e0]' : 'bg-[#050505]/90 border-b border-[#111111]'
            }`}>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                    <img 
                        src={theme === 'light' ? '/logo-3.png' : '/logo.png'} 
                        alt="Movyra" 
                        className="h-8 w-auto" 
                        onError={(e) => e.target.style.display = 'none'} 
                    />
                    <span className="font-black text-[1.5rem] tracking-tighter ml-[-5px]">
                        ovyra <span className={`${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'} font-medium text-[1.2rem] ml-1`}>Civic</span>
                    </span>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-6 text-[0.9rem] font-bold">
                    <button 
                        onClick={toggleTheme} 
                        className={`p-2 rounded-full transition-colors outline-none ${
                            theme === 'light' ? 'bg-[#e0e0e0] text-black hover:bg-[#cccccc]' : 'bg-[#222222] text-white hover:bg-[#333333]'
                        }`}
                    >
                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                    </button>
                    
                    {user ? (
                        <>
                            <button 
                                onClick={handleSignOut} 
                                className={`transition-colors outline-none hidden sm:block ${theme === 'light' ? 'text-[#555555] hover:text-black' : 'text-[#888888] hover:text-white'}`}
                            >
                                {currentT.log_out}
                            </button>
                            <button 
                                onClick={handleSignOut} 
                                className={`p-2 rounded-full transition-colors outline-none block sm:hidden ${theme === 'light' ? 'bg-[#e0e0e0] text-black hover:bg-[#cccccc]' : 'bg-[#222222] text-white hover:bg-[#333333]'}`}
                                aria-label="Log Out"
                            >
                                <LogOut size={16} />
                            </button>
                            <button 
                                onClick={() => navigate('/civic/dashboard')} 
                                className={`p-2 sm:px-6 sm:py-2.5 rounded-full flex items-center gap-2 transition-colors outline-none border ${
                                    theme === 'light' ? 'bg-black text-white border-black hover:bg-[#222222]' : 'bg-white text-black border-white hover:bg-[#e0e0e0]'
                                }`}
                            >
                                <LayoutDashboard size={16} />
                                <span className="hidden sm:inline">Dashboard</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={() => navigate('/civic/auth')} 
                                className={`transition-colors outline-none hidden sm:block ${theme === 'light' ? 'text-[#555555] hover:text-black' : 'text-[#888888] hover:text-white'}`}
                            >
                                {currentT.sign_in}
                            </button>
                            <button 
                                onClick={() => navigate('/civic/auth')} 
                                className={`px-6 py-2.5 rounded-full transition-colors outline-none border ${
                                    theme === 'light' ? 'bg-black text-white border-black hover:bg-[#222222]' : 'bg-white text-black border-white hover:bg-[#e0e0e0]'
                                }`}
                            >
                                {currentT.sign_up}
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* SECTION 1: HERO */}
            <section className="relative pt-48 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col justify-center w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="z-10">
                        <motion.div variants={fadeUp} className={`inline-flex items-center gap-3 px-4 py-2 rounded-full mb-8 border ${theme === 'light' ? 'bg-white border-[#cccccc]' : 'bg-[#111111] border-[#333333]'}`}>
                            <div className="w-2 h-2 rounded-full bg-[#00aa55] animate-pulse"></div>
                            <span className="text-[0.85rem] font-bold tracking-widest uppercase">{currentT.badge}</span>
                        </motion.div>
                        <motion.h1 variants={fadeUp} className="text-[3.5rem] md:text-[4.5rem] font-black leading-[1.1] tracking-tighter mb-6">
                            {currentT.hero_title}
                        </motion.h1>
                        <motion.p variants={fadeUp} className={`text-[1.1rem] md:text-[1.2rem] max-w-[500px] leading-relaxed mb-10 ${
                            theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'
                        }`}>
                            {currentT.hero_desc}
                        </motion.p>
                        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4">
                            <button 
                                onClick={() => { document.getElementById('quick-report').scrollIntoView({ behavior: 'smooth' }); }} 
                                className={`w-full sm:w-auto px-8 py-4 rounded-xl font-black text-[1rem] flex items-center justify-center gap-2 transition-colors outline-none border ${
                                    theme === 'light' ? 'bg-black text-white hover:bg-[#333333] border-black' : 'bg-white text-black hover:bg-[#e0e0e0] border-white'
                                }`}
                            >
                                {currentT.qr_title} <ArrowRight size={18} />
                            </button>
                            <button 
                                onClick={() => navigate(user ? '/civic/dashboard' : '/civic/auth')} 
                                className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-[1rem] flex items-center justify-center gap-2 transition-colors outline-none border ${
                                    theme === 'light' ? 'bg-transparent text-black border-[#cccccc] hover:border-black' : 'bg-transparent text-white border-[#333333] hover:border-white'
                                }`}
                            >
                                {currentT.get_started}
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* HERO GRAPHIC: Animated Network SVG */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="hidden lg:flex justify-end relative">
                        <svg viewBox="0 0 400 400" className="w-full h-auto max-w-[500px]" fill="none">
                            <circle cx="200" cy="200" r="180" stroke={theme === 'light' ? '#e0e0e0' : '#1a1a1a'} strokeWidth="2" strokeDasharray="8 8"/>
                            <circle cx="200" cy="200" r="120" stroke={theme === 'light' ? '#cccccc' : '#222222'} strokeWidth="1" />
                            <motion.circle cx="200" cy="200" r="60" fill={theme === 'light' ? '#000000' : '#ffffff'} initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }} />
                            <path d="M200 140 L200 50 M260 200 L350 200 M200 260 L200 350 M140 200 L50 200" stroke={theme === 'light' ? '#000000' : '#ffffff'} strokeWidth="3"/>
                            <circle cx="200" cy="50" r="8" fill={theme === 'light' ? '#000000' : '#ffffff'} />
                            <circle cx="350" cy="200" r="8" fill={theme === 'light' ? '#000000' : '#ffffff'} />
                            <circle cx="200" cy="350" r="8" fill={theme === 'light' ? '#000000' : '#ffffff'} />
                            <circle cx="50" cy="200" r="8" fill={theme === 'light' ? '#000000' : '#ffffff'} />
                        </svg>
                    </motion.div>
                </div>
            </section>

            {/* EMBEDDED PUBLIC QUICK REPORT FORM */}
            <section id="quick-report" className={`py-24 px-6 md:px-12 border-t ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#111111]'}`}>
                <div className="max-w-[1200px] mx-auto">
                    <div className="mb-12 text-center">
                        <h2 className="text-[2.5rem] md:text-[3.5rem] font-black tracking-tighter mb-4">{currentT.qr_title}</h2>
                        <p className={`text-[1.1rem] max-w-[600px] mx-auto ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>{currentT.qr_sub}</p>
                    </div>

                    {submissionSuccess ? (
                        <div className={`p-12 text-center rounded-3xl border border-dashed ${theme === 'light' ? 'bg-[#f9f9f9] border-[#cccccc]' : 'bg-[#111111] border-[#333333]'}`}>
                            <CheckCircle size={64} className={`mx-auto mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                            <h3 className="text-[2rem] font-black tracking-tight mb-4">{currentT.succ_title}</h3>
                            <p className={theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}>{currentT.succ_sub}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <form onSubmit={handleSubmit(processSubmission)} className={`rounded-3xl p-6 md:p-10 border ${theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                                        <div>
                                            <label className={`block text-[0.85rem] font-bold mb-2 uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.form_title_label}</label>
                                            <Controller
                                                name="title"
                                                control={control}
                                                render={({ field }) => (
                                                    <input {...field} placeholder={currentT.form_title_ph} className={`w-full px-4 py-3 rounded-xl outline-none transition-colors text-[0.95rem] border ${
                                                        theme === 'light' ? 'bg-white border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#444444] text-white focus:border-white'
                                                    }`} />
                                                )}
                                            />
                                            {errors.title && <span className="text-red-500 text-[0.8rem] mt-1 block">{errors.title.message}</span>}
                                        </div>
                                        <div>
                                            <label className={`block text-[0.85rem] font-bold mb-2 uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.form_div_label}</label>
                                            <Controller
                                                name="category"
                                                control={control}
                                                render={({ field }) => (
                                                    <select {...field} className={`w-full px-4 py-3 rounded-xl outline-none transition-colors text-[0.95rem] appearance-none border ${
                                                        theme === 'light' ? 'bg-white border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#444444] text-white focus:border-white'
                                                    }`}>
                                                        <option value="">{currentT.form_div_ph}</option>
                                                        <option value="Road Maintenance">{currentT.cat_road}</option>
                                                        <option value="Sanitation Services">{currentT.cat_san}</option>
                                                        <option value="Water Supply">{currentT.cat_water}</option>
                                                        <option value="Electrical Grid">{currentT.cat_elec}</option>
                                                        <option value="Public Safety">{currentT.cat_safe}</option>
                                                    </select>
                                                )}
                                            />
                                            {errors.category && <span className="text-red-500 text-[0.8rem] mt-1 block">{errors.category.message}</span>}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className={`block text-[0.85rem] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.form_desc_label}</label>
                                            <button type="button" onClick={enhanceDescription} className={`text-[0.8rem] font-bold transition-colors flex items-center gap-1 outline-none ${theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#aaaaaa] hover:text-white'}`}>
                                                <Wand2 size={14} /> {currentT.form_desc_btn}
                                            </button>
                                        </div>
                                        <Controller
                                            name="description"
                                            control={control}
                                            render={({ field }) => (
                                                <textarea {...field} rows="4" placeholder={currentT.form_desc_ph} className={`w-full px-4 py-3 rounded-xl outline-none transition-colors text-[0.95rem] resize-none border ${
                                                    theme === 'light' ? 'bg-white border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#444444] text-white focus:border-white'
                                                }`}></textarea>
                                            )}
                                        />
                                        {errors.description && <span className="text-red-500 text-[0.8rem] mt-1 block">{errors.description.message}</span>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                                        <div>
                                            <label className={`block text-[0.85rem] font-bold mb-2 uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.lbl_reporter}</label>
                                            <Controller
                                                name="reporterName"
                                                control={control}
                                                render={({ field }) => (
                                                    <input {...field} placeholder="Anonymous" className={`w-full px-4 py-3 rounded-xl outline-none transition-colors text-[0.95rem] border ${
                                                        theme === 'light' ? 'bg-white border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#444444] text-white focus:border-white'
                                                    }`} />
                                                )}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-[0.85rem] font-bold mb-2 uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.lbl_phone}</label>
                                            <Controller
                                                name="reporterPhone"
                                                control={control}
                                                render={({ field }) => (
                                                    <input {...field} type="tel" placeholder="+91..." className={`w-full px-4 py-3 rounded-xl outline-none transition-colors text-[0.95rem] border ${
                                                        theme === 'light' ? 'bg-white border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#444444] text-white focus:border-white'
                                                    }`} />
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isProcessing}
                                        className={`w-full py-4 rounded-xl font-black text-[1rem] transition-colors disabled:opacity-50 disabled:cursor-not-allowed outline-none flex items-center justify-center gap-2 ${
                                            theme === 'light' ? 'bg-black text-white hover:bg-[#333333]' : 'bg-white text-black hover:bg-[#e0e0e0]'
                                        }`}
                                    >
                                        {isProcessing ? (
                                            <><div className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin"></div> {currentT.submit_proc}</>
                                        ) : (
                                            <><Send size={18}/> {currentT.submit_btn}</>
                                        )}
                                    </button>
                                </form>
                            </div>

                            <div className="lg:col-span-1 flex flex-col gap-6">
                                {/* Interactive Location Picker */}
                                <div className={`border rounded-3xl p-6 ${theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                                    <h3 className="text-[1.1rem] font-black mb-4 flex items-center gap-2">
                                        <MapPin size={18} /> {currentT.map_title}
                                    </h3>
                                    <LocationPicker onLocationSelect={(coords) => setSelectedLocation([coords.latitude, coords.longitude])} />
                                    {resolvedAddress && (
                                        <p className={`mt-3 text-[0.8rem] font-medium leading-relaxed ${theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'}`}>
                                            {resolvedAddress}
                                        </p>
                                    )}
                                </div>

                                {/* Evidence Upload */}
                                <div className={`border rounded-3xl p-6 ${theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                                    <h3 className="text-[1.1rem] font-black mb-4 flex items-center gap-2">
                                        <UploadCloud size={18} /> {currentT.ev_title}
                                    </h3>
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`w-full border-2 border-dashed transition-colors rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer text-center ${
                                            theme === 'light' ? 'border-[#cccccc] hover:border-black bg-white' : 'border-[#444444] hover:border-white bg-[#000000]'
                                        }`}
                                    >
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleFileSelection} 
                                            accept="image/*,video/*" 
                                            className="hidden" 
                                        />
                                        {evidenceFile ? (
                                            <>
                                                <CheckCircle size={28} className={`mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                                                <span className={`text-[0.9rem] font-bold break-all ${theme === 'light' ? 'text-black' : 'text-white'}`}>{evidenceFile.name}</span>
                                                <span className={`text-[0.8rem] mt-1 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.ev_ready}</span>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud size={28} className={`mb-2 ${theme === 'light' ? 'text-[#888888]' : 'text-[#555555]'}`} />
                                                <span className={`text-[0.9rem] font-bold ${theme === 'light' ? 'text-black' : 'text-white'}`}>{currentT.ev_sub}</span>
                                                <span className={`text-[0.8rem] mt-1 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.ev_sub2}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* SECTION 2: CORE VALUES */}
            <section className={`py-24 px-6 md:px-12 border-t ${theme === 'light' ? 'bg-[#ffffff] border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#111111]'}`}>
                <div className="max-w-[1400px] mx-auto">
                    <div className="mb-16">
                        <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">{currentT.val_title}</h2>
                        <p className={`text-[1.1rem] ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>{currentT.val_desc}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: Map, title: currentT.v1_t, desc: currentT.v1_d },
                            { icon: Activity, title: currentT.v2_t, desc: currentT.v2_d },
                            { icon: ShieldCheck, title: currentT.v3_t, desc: currentT.v3_d }
                        ].map((feature, idx) => (
                            <div key={idx} className={`p-8 rounded-3xl border transition-colors ${theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0] hover:border-black' : 'bg-[#111111] border-[#333333] hover:border-white'}`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${theme === 'light' ? 'bg-white border-[#cccccc]' : 'bg-[#222222] border-[#444444]'}`}>
                                    <feature.icon size={20} className={theme === 'light' ? 'text-black' : 'text-white'} />
                                </div>
                                <h3 className="text-[1.25rem] font-black mb-2">{feature.title}</h3>
                                <p className={`text-[0.95rem] ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 3: LIVE ANALYTICS PREVIEW */}
            <section className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto w-full">
                <div className={`rounded-3xl p-10 md:p-16 border flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative ${
                    theme === 'light' ? 'bg-white border-[#cccccc]' : 'bg-[#111111] border-[#333333]'
                }`}>
                    <div className="relative z-10 lg:max-w-[40%]">
                        <BarChart3 size={32} className={`mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                        <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">{currentT.stat_title}</h2>
                        <p className={`text-[1.1rem] leading-relaxed mb-8 ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>
                            {currentT.stat_desc}
                        </p>
                    </div>

                    {/* Animated Bar Chart Graphic */}
                    <div className="w-full lg:w-[50%] h-[300px] flex items-end gap-4 relative z-10">
                        <div className={`absolute bottom-0 left-0 w-full h-[1px] ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></div>
                        {[40, 70, 45, 90, 60, 100].map((height, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ height: 0 }}
                                whileInView={{ height: `${height}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                                className={`flex-1 rounded-t-lg ${theme === 'light' ? 'bg-black' : 'bg-white'}`}
                            ></motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 4: CITIZEN WORKFLOW */}
            <section className={`py-24 px-6 md:px-12 border-t ${theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#111111]'}`}>
                <div className="max-w-[1400px] mx-auto text-center">
                    <h2 className="text-[2.5rem] font-black tracking-tighter mb-16">{currentT.work_title}</h2>
                    
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 relative">
                        {/* Connecting Line (Hidden on Mobile) */}
                        <div className={`hidden md:block absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2 z-0 ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></div>

                        {[
                            { num: "1", title: currentT.w1_t, desc: currentT.w1_d },
                            { num: "2", title: currentT.w2_t, desc: currentT.w2_d },
                            { num: "3", title: currentT.w3_t, desc: currentT.w3_d }
                        ].map((step, idx) => (
                            <div key={idx} className={`relative z-10 w-full md:w-1/3 p-8 rounded-3xl border flex flex-col items-center text-center ${
                                theme === 'light' ? 'bg-white border-[#cccccc]' : 'bg-[#111111] border-[#333333]'
                            }`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-[1.2rem] mb-4 ${
                                    theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'
                                }`}>
                                    {step.num}
                                </div>
                                <h3 className="text-[1.25rem] font-black mb-2">{step.title}</h3>
                                <p className={`text-[0.95rem] ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 5: DEVELOPER INTEGRATION */}
            <section className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto w-full">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="lg:max-w-[40%]">
                        <div className="flex items-center gap-2 mb-4">
                            <TerminalSquare size={18} className={theme === 'light' ? 'text-black' : 'text-[#888888]'} />
                            <span className="text-[0.85rem] font-bold tracking-widest uppercase">{currentT.dev}</span>
                        </div>
                        <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">{currentT.api_title}</h2>
                        <p className={`text-[1.1rem] leading-relaxed mb-8 ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>
                            {currentT.api_desc}
                        </p>
                        <button className={`px-6 py-3 rounded-xl font-bold text-[0.95rem] border transition-colors outline-none ${
                            theme === 'light' ? 'bg-white text-black border-[#cccccc] hover:border-black' : 'bg-[#000000] text-white border-[#555555] hover:border-white'
                        }`}>
                            {currentT.api_btn}
                        </button>
                    </div>

                    <div className={`w-full lg:w-[50%] rounded-2xl p-6 font-mono text-[0.85rem] leading-loose border shadow-xl ${
                        theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-[#333333]' : 'bg-[#0a0a0a] border-[#222222] text-[#aaaaaa]'
                    }`}>
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#333333]/20">
                            <div className="w-3 h-3 rounded-full bg-[#ff4444]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#ffaa00]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#00ff88]"></div>
                        </div>
                        <span className={theme === 'light' ? 'text-[#0055aa]' : 'text-[#44aaff]'}>GET</span> /api/status<br/><br/>
                        {`{`} <br/>
                        &nbsp;&nbsp;<span className={theme === 'light' ? 'text-[#000000]' : 'text-[#ffffff]'}>"active_tasks"</span>: 42,<br/>
                        &nbsp;&nbsp;<span className={theme === 'light' ? 'text-[#000000]' : 'text-[#ffffff]'}>"success_rate"</span>: "94%"<br/>
                        {`}`}
                    </div>
                </div>
            </section>

            {/* SECTION 6: ENTERPRISE SECURITY */}
            <section className={`py-24 px-6 md:px-12 border-t ${theme === 'light' ? 'bg-[#ffffff] border-[#e0e0e0]' : 'bg-[#050505] border-[#111111]'}`}>
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="order-2 lg:order-1 flex justify-center lg:justify-start">
                        {/* Custom Isometric Security Lock Vector */}
                        <svg viewBox="0 0 200 200" className="w-full max-w-[300px] h-auto" fill="none">
                            <motion.path 
                                d="M60 100 V70 C60 40 140 40 140 70 V100" 
                                stroke={theme === 'light' ? '#111111' : '#ffffff'} 
                                strokeWidth="16" strokeLinecap="round"
                                initial={{ y: 20 }} animate={{ y: 0 }} transition={{ repeat: Infinity, duration: 2, repeatType: "reverse", ease: "easeInOut" }}
                            />
                            <rect x="40" y="90" width="120" height="90" rx="16" fill={theme === 'light' ? '#111111' : '#ffffff'} />
                            <circle cx="100" cy="135" r="12" fill={theme === 'light' ? '#ffffff' : '#111111'} />
                            <path d="M96 145 L92 160 H108 L104 145 Z" fill={theme === 'light' ? '#ffffff' : '#111111'} />
                        </svg>
                    </motion.div>
                    <div className="order-1 lg:order-2">
                        <Lock size={32} className={`mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                        <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">{currentT.sec_title}</h2>
                        <p className={`text-[1.1rem] leading-relaxed ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>
                            {currentT.sec_desc}
                        </p>
                    </div>
                </div>
            </section>

            {/* SECTION 7: MOBILE ACCESSIBILITY */}
            <section className={`py-24 px-6 md:px-12 border-t ${theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#111111]'}`}>
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <Smartphone size={32} className={`mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                        <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">{currentT.mob_title}</h2>
                        <p className={`text-[1.1rem] leading-relaxed ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>
                            {currentT.mob_desc}
                        </p>
                    </div>
                    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex justify-center lg:justify-end">
                        {/* Custom Animated Smartphone Vector */}
                        <svg viewBox="0 0 200 200" className="w-full max-w-[300px] h-auto" fill="none">
                            <rect x="50" y="20" width="100" height="160" rx="20" fill={theme === 'light' ? '#e0e0e0' : '#222222'} stroke={theme === 'light' ? '#cccccc' : '#333333'} strokeWidth="4" />
                            <rect x="56" y="26" width="88" height="148" rx="14" fill={theme === 'light' ? '#ffffff' : '#050505'} />
                            <motion.rect x="66" y="50" width="56" height="12" rx="4" fill={theme === 'light' ? '#cccccc' : '#333333'} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }} />
                            <rect x="66" y="70" width="68" height="8" rx="4" fill={theme === 'light' ? '#e0e0e0' : '#222222'} />
                            <rect x="66" y="86" width="48" height="8" rx="4" fill={theme === 'light' ? '#e0e0e0' : '#222222'} />
                            <circle cx="100" cy="155" r="8" stroke={theme === 'light' ? '#cccccc' : '#333333'} strokeWidth="2" />
                        </svg>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 8: COMMUNITY IMPACT */}
            <section className={`py-24 px-6 md:px-12 border-t ${theme === 'light' ? 'bg-[#ffffff] border-[#e0e0e0]' : 'bg-[#050505] border-[#111111]'}`}>
                <div className="max-w-[1400px] mx-auto text-center flex flex-col items-center">
                    <Users size={32} className={`mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                    <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">{currentT.imp_title}</h2>
                    <p className={`text-[1.1rem] max-w-[600px] leading-relaxed mb-12 ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>
                        {currentT.imp_desc}
                    </p>
                    
                    {/* Custom Animated Network Nodes Vector */}
                    <div className="relative w-full max-w-[400px] aspect-video">
                        <svg viewBox="0 0 400 200" className="w-full h-full" fill="none">
                            <path d="M50 100 C150 150 250 50 350 100" stroke={theme === 'light' ? '#cccccc' : '#333333'} strokeWidth="2" strokeDasharray="6 6" />
                            <motion.circle cx="50" cy="100" r="10" fill={theme === 'light' ? '#111111' : '#ffffff'} initial={{ scale: 1 }} animate={{ scale: 1.5, opacity: 0.5 }} transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }} />
                            <motion.circle cx="200" cy="100" r="14" fill={theme === 'light' ? '#111111' : '#ffffff'} initial={{ scale: 1 }} animate={{ scale: 1.3, opacity: 0.8 }} transition={{ repeat: Infinity, duration: 2, repeatType: "reverse", delay: 0.5 }} />
                            <motion.circle cx="350" cy="100" r="10" fill={theme === 'light' ? '#111111' : '#ffffff'} initial={{ scale: 1 }} animate={{ scale: 1.5, opacity: 0.5 }} transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 1 }} />
                        </svg>
                    </div>
                </div>
            </section>

            {/* FOOTER ALIGNMENT */}
            <footer className={`w-full mx-auto mt-auto flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-12 border-t opacity-0 animate-fade stagger-3 relative z-10 ${
                theme === 'light' ? 'border-[#e0e0e0] bg-[#ffffff]' : 'border-[#111111] bg-[#050505]'
            }`}>
                
                {/* Social Icons & Utilities */}
                <div className="flex flex-wrap items-center gap-6">
                    <button onClick={() => setShowLangPrompt(true)} className={`flex items-center gap-2 text-[0.8rem] font-bold px-3 py-1.5 rounded-full transition-colors border ${theme === 'light' ? 'border-[#cccccc] hover:border-black text-[#555555]' : 'border-[#333333] hover:border-white text-[#888888]'}`}>
                        <Globe size={14} /> {currentT.lang}
                    </button>
                    <div className={`flex items-center gap-6 ${theme === 'light' ? 'text-[#666666]' : 'text-[#555555]'}`}>
                        <a href="https://www.linkedin.com/company/getmovyra/" target="_blank" rel="noopener noreferrer" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                        <a href="#youtube" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                        </a>
                        <a href="https://www.instagram.com/getmovyra" target="_blank" rel="noopener noreferrer" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </a>
                        <a href="#x" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.006 4.15H5.078z"/></svg>
                        </a>
                    </div>
                </div>
                
                <div className={`flex flex-col md:flex-row items-center gap-6 text-[0.8rem] font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#555555]'}`}>
                    <div className="flex items-center gap-6">
                        <button onClick={() => setShowProductsPrompt(true)} className={`transition-colors outline-none ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>{currentT.products}</button>
                        <span className={`w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
                        <span onClick={() => setShowSitemap(true)} className={`cursor-pointer transition-colors underline outline-none ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>{currentT.sitemap}</span>
                        <span className={`w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
                        <Link to="/careers" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>{currentT.careers}</Link>
                    </div>
                    <span className={`hidden md:block w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
                    
                    {/* Image Attribution Link (Theme Aware) */}
                    <div className="flex items-center gap-2 text-[0.75rem] uppercase tracking-wider">
                        Built by 
                        <a href="https://rebrand.ly/aatns" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity">
                            <img 
                                src={theme === 'light' ? '/aat2.png' : '/aat.png'} 
                                alt="AnyAstro" 
                                className="h-4 w-auto object-contain" 
                                onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '<span class="underline">AnyAstro</span>'); }} 
                            />
                        </a>
                    </div>
                    
                    {/* Back to Top */}
                    <button onClick={scrollToTop} className={`p-2 rounded-full transition-colors border outline-none ${theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] hover:bg-[#e0e0e0]' : 'bg-[#111111] border-[#333333] hover:bg-[#222222]'}`}>
                        <ArrowUp size={16} />
                    </button>
                </div>
            </footer>
        </div>
    );
}