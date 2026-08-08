/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Secure Administrative Dashboard for SevaSetu Waitlist Operations.
 * Database: PocketBase (https://movyra-mv-main-db-gradio.hf.space)
 * Security: Super Admin Authentication Required.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Search, X, CheckCircle, Clock, AlertTriangle, Shield, Globe, Image as ImageIcon } from 'lucide-react';
import PocketBase from 'pocketbase';

// Initialize PocketBase Connection
const PB_URL = 'https://movyra-mv-main-db-gradio.hf.space';
const pb = new PocketBase(PB_URL);

const TRANSLATIONS = {
    en: {
        lang: "English", admin_portal: "Admin Portal", email: "Email Address", password: "Password",
        login: "Secure Login", dashboard: "Operations Dashboard", ack: "Acknowledgement",
        org: "Organization", contact: "Contact", live_photo: "Live Photo", doc: "Document",
        status: "Status", action: "Action", pending: "Pending", verified: "Verified",
        rejected: "Rejected", update: "Update Status", logout: "Logout", loading: "Authenticating System...",
        search: "Search Records", view: "View Image"
    },
    hi: {
        lang: "हिन्दी", admin_portal: "एडमिन पोर्टल", email: "ईमेल पता", password: "पासवर्ड",
        login: "सुरक्षित लॉगिन", dashboard: "संचालन डैशबोर्ड", ack: "पावती",
        org: "संगठन", contact: "संपर्क", live_photo: "लाइव फोटो", doc: "दस्तावेज़",
        status: "स्थिति", action: "कार्रवाई", pending: "लंबित", verified: "सत्यापित",
        rejected: "अस्वीकृत", update: "स्थिति अपडेट करें", logout: "लॉगआउट", loading: "प्रमाणीकरण हो रहा है...",
        search: "रिकॉर्ड खोजें", view: "छवि देखें"
    },
    hinglish: {
        lang: "Hinglish", admin_portal: "Admin Portal", email: "Email Address", password: "Password",
        login: "Secure Login", dashboard: "Operations Dashboard", ack: "Acknowledgement",
        org: "Organization", contact: "Contact", live_photo: "Live Photo", doc: "Document",
        status: "Status", action: "Action", pending: "Pending", verified: "Verified",
        rejected: "Rejected", update: "Update Status", logout: "Logout", loading: "Authenticating System...",
        search: "Search Records", view: "View Image"
    },
    mr: {
        lang: "मराठी", admin_portal: "प्रशासक पोर्टल", email: "ईमेल पत्ता", password: "पासवर्ड",
        login: "सुरक्षित लॉग इन", dashboard: "ऑपरेशन्स डॅशबोर्ड", ack: "पोचपावती",
        org: "संस्था", contact: "संपर्क", live_photo: "थेट फोटो", doc: "दस्तऐवज",
        status: "स्थिती", action: "कृती", pending: "प्रलंबित", verified: "सत्यापित",
        rejected: "नाकारले", update: "स्थिती अपडेट करा", logout: "लॉगआउट", loading: "प्रमाणीकरण करत आहे...",
        search: "रेकॉर्ड शोधा", view: "प्रतिमा पहा"
    },
    gu: {
        lang: "ગુજરાતી", admin_portal: "એડમિન પોર્ટલ", email: "ઇમેઇલ સરનામું", password: "પાસવર્ડ",
        login: "સુરક્ષિત લૉગિન", dashboard: "ઓપરેશન્સ ડેશબોર્ડ", ack: "સ્વીકૃતિ",
        org: "સંસ્થા", contact: "સંપર્ક", live_photo: "લાઇવ ફોટો", doc: "દસ્તાવેજ",
        status: "સ્થિતિ", action: "ક્રિયા", pending: "બાકી", verified: "ચકાસાયેલ",
        rejected: "નકારવામાં આવેલ", update: "સ્થિતિ અપડેટ કરો", logout: "લોગઆઉટ", loading: "પ્રમાણીકરણ થઈ રહ્યું છે...",
        search: "રેકોર્ડ્સ શોધો", view: "છબી જુઓ"
    },
    te: {
        lang: "తెలుగు", admin_portal: "అడ్మిన్ పోర్టల్", email: "ఈమెయిల్", password: "పాస్‌వర్డ్",
        login: "సురక్షిత లాగిన్", dashboard: "ఆపరేషన్స్ డాష్‌బోర్డ్", ack: "అక్నాలెడ్జ్‌మెంట్",
        org: "సంస్థ", contact: "సంప్రదింపు", live_photo: "లైవ్ ఫోటో", doc: "పత్రం",
        status: "స్థితి", action: "చర్య", pending: "పెండింగ్", verified: "ధృవీకరించబడింది",
        rejected: "తిరస్కరించబడింది", update: "నవీకరించు", logout: "లాగ్అవుట్", loading: "ప్రామాణీకరిస్తోంది...",
        search: "శోధించండి", view: "చిత్రం చూడండి"
    },
    ta: {
        lang: "தமிழ்", admin_portal: "நிர்வாகி போர்டல்", email: "மின்னஞ்சல்", password: "கடவுச்சொல்",
        login: "பாதுகாப்பான உள்நுழைவு", dashboard: "செயல்பாட்டு டாஷ்போர்டு", ack: "ஒப்புகை",
        org: "நிறுவனம்", contact: "தொடர்பு", live_photo: "நேரடி புகைப்படம்", doc: "ஆவணம்",
        status: "நிலை", action: "செயல்", pending: "நிலுவையில்", verified: "சரிபார்க்கப்பட்டது",
        rejected: "நிராகரிக்கப்பட்டது", update: "நிலை புதுப்பி", logout: "வெளியேறு", loading: "அங்கீகரிக்கப்படுகிறது...",
        search: "தேடு", view: "படம் காண்"
    },
    pa: {
        lang: "ਪੰਜਾਬੀ", admin_portal: "ਐਡਮਿਨ ਪੋਰਟਲ", email: "ਈਮੇਲ", password: "ਪਾਸਵਰਡ",
        login: "ਸੁਰੱਖਿਅਤ ਲਾਗਇਨ", dashboard: "ਡੈਸ਼ਬੋਰਡ", ack: "ਰਸੀਦ",
        org: "ਸੰਗਠਨ", contact: "ਸੰਪਰਕ", live_photo: "ਲਾਈਵ ਫੋਟੋ", doc: "ਦਸਤਾਵੇਜ਼",
        status: "ਸਥਿਤੀ", action: "ਕਾਰਵਾਈ", pending: "ਬਕਾਇਆ", verified: "ਪ੍ਰਮਾਣਿਤ",
        rejected: "ਰੱਦ", update: "ਅੱਪਡੇਟ ਕਰੋ", logout: "ਲਾਗਆਊਟ", loading: "ਪ੍ਰਮਾਣਿਤ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
        search: "ਖੋਜੋ", view: "ਤਸਵੀਰ ਵੇਖੋ"
    },
    bho: {
        lang: "भोजपुरी", admin_portal: "एडमिन पोर्टल", email: "ईमेल", password: "पासवर्ड",
        login: "सुरक्षित लॉगिन", dashboard: "डैशबोर्ड", ack: "पावती",
        org: "संगठन", contact: "संपर्क", live_photo: "लाइव फोटो", doc: "दस्तावेज",
        status: "स्थिति", action: "कार्रवाई", pending: "लंबित", verified: "सत्यापित",
        rejected: "अस्वीकृत", update: "अपडेट करीं", logout: "लॉगआउट", loading: "प्रमाणीकरण हो रहल बा...",
        search: "खोजीं", view: "फोटो देखीं"
    },
    ar: {
        lang: "العربية", admin_portal: "بوابة الإدارة", email: "البريد الإلكتروني", password: "كلمة المرور",
        login: "تسجيل الدخول", dashboard: "لوحة العمليات", ack: "إقرار",
        org: "منظمة", contact: "اتصال", live_photo: "صورة حية", doc: "وثيقة",
        status: "حالة", action: "إجراء", pending: "قيد الانتظار", verified: "تم التحقق",
        rejected: "مرفوض", update: "تحديث", logout: "خروج", loading: "جاري المصادقة...",
        search: "بحث", view: "عرض الصورة"
    },
    es: {
        lang: "Español", admin_portal: "Portal de Administración", email: "Correo Electrónico", password: "Contraseña",
        login: "Acceso Seguro", dashboard: "Panel de Operaciones", ack: "Acuse",
        org: "Organización", contact: "Contacto", live_photo: "Foto en Vivo", doc: "Documento",
        status: "Estado", action: "Acción", pending: "Pendiente", verified: "Verificado",
        rejected: "Rechazado", update: "Actualizar", logout: "Salir", loading: "Autenticando...",
        search: "Buscar", view: "Ver Imagen"
    },
    fr: {
        lang: "Français", admin_portal: "Portail d'Administration", email: "Adresse E-mail", password: "Mot de passe",
        login: "Connexion Sécurisée", dashboard: "Tableau de Bord", ack: "Accusé",
        org: "Organisation", contact: "Contact", live_photo: "Photo en Direct", doc: "Document",
        status: "Statut", action: "Action", pending: "En attente", verified: "Vérifié",
        rejected: "Rejeté", update: "Mettre à jour", logout: "Déconnexion", loading: "Authentification...",
        search: "Rechercher", view: "Voir l'image"
    },
    de: {
        lang: "Deutsch", admin_portal: "Administrationsportal", email: "E-Mail-Adresse", password: "Passwort",
        login: "Sichere Anmeldung", dashboard: "Betriebsdashboard", ack: "Bestätigung",
        org: "Organisation", contact: "Kontakt", live_photo: "Live-Foto", doc: "Dokument",
        status: "Status", action: "Aktion", pending: "Ausstehend", verified: "Verifiziert",
        rejected: "Abgelehnt", update: "Aktualisieren", logout: "Abmelden", loading: "Authentifizierung...",
        search: "Suchen", view: "Bild ansehen"
    }
};

export default function SevaSetuAdmin() {
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    
    // Auth States
    const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid && pb.authStore.isAdmin);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authError, setAuthError] = useState('');

    // Data States
    const [records, setRecords] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Image Modal States
    const [selectedImage, setSelectedImage] = useState(null);

    const currentT = TRANSLATIONS[lang] || TRANSLATIONS['en'];

    const languageOptions = Object.keys(TRANSLATIONS).map(key => ({
        code: key,
        label: TRANSLATIONS[key].lang
    }));

    useEffect(() => {
        if (isAuthenticated) {
            fetchRecords();
        }
    }, [isAuthenticated]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsAuthenticating(true);
        setAuthError('');
        try {
            await pb.admins.authWithPassword(email, password);
            setIsAuthenticated(true);
        } catch (error) {
            setAuthError('Authentication failed. Verify credentials.');
            pb.authStore.clear();
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleLogout = () => {
        pb.authStore.clear();
        setIsAuthenticated(false);
        setRecords([]);
    };

    const fetchRecords = async () => {
        setIsLoadingData(true);
        try {
            const resultList = await pb.collection('sevasetu_waitlist').getFullList({
                sort: '-created',
            });
            setRecords(resultList);
        } catch (error) {
            console.error("Error fetching waitlist data:", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    const updateStatus = async (recordId, newStatus) => {
        try {
            await pb.collection('sevasetu_waitlist').update(recordId, { status: newStatus });
            setRecords(records.map(rec => rec.id === recordId ? { ...rec, status: newStatus } : rec));
        } catch (error) {
            alert("Error updating record status.");
        }
    };

    const getFileUrl = (record, filename) => {
        if (!filename) return null;
        return pb.files.getUrl(record, filename);
    };

    const filteredRecords = records.filter(rec => 
        rec.ack_number.toLowerCase().includes(searchQuery.toLowerCase()) || 
        rec.business_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-6 font-sans">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-[#FFFFFF] rounded-2xl shadow-xl p-8 border border-[#E5E7EB]">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-[#2563EB] rounded-full flex items-center justify-center mb-4 shadow-lg">
                            <Shield size={32} color="#FFFFFF" />
                        </div>
                        <h1 className="text-[1.8rem] font-black text-[#111111] tracking-tight">{currentT.admin_portal}</h1>
                        <p className="text-[#6B7280] font-medium text-[0.95rem]">SevaSetu System Access</p>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        <input 
                            type="email" 
                            placeholder={currentT.email} 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full p-4 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB]"
                            required 
                        />
                        <input 
                            type="password" 
                            placeholder={currentT.password} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full p-4 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB]"
                            required 
                        />
                        
                        {authError && <p className="text-[#DC2626] text-[0.85rem] font-bold text-center">{authError}</p>}
                        
                        <button 
                            type="submit" 
                            disabled={isAuthenticating}
                            className="w-full py-4 bg-[#111111] text-[#FFFFFF] rounded-xl font-black text-[1.1rem] hover:bg-[#000000] transition-colors mt-2 disabled:opacity-50"
                        >
                            {isAuthenticating ? currentT.loading : currentT.login}
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F3F4F6] font-sans flex flex-col">
            
            {/* Admin Header */}
            <header className="bg-[#FFFFFF] border-b border-[#E5E7EB] px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#2563EB] rounded-lg flex items-center justify-center">
                        <Shield size={20} color="#FFFFFF" />
                    </div>
                    <div>
                        <h1 className="text-[1.25rem] font-black text-[#111111] leading-tight tracking-tight">SevaSetu</h1>
                        <p className="text-[#6B7280] text-[0.75rem] font-bold uppercase tracking-wider">{currentT.dashboard}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9CA3AF]" size={16} />
                        <input 
                            type="text" 
                            placeholder={currentT.search} 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[0.9rem] font-medium outline-none focus:border-[#2563EB] w-64"
                        />
                    </div>
                    <button onClick={() => setShowLangPrompt(true)} className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] rounded-lg text-[#374151] font-bold text-[0.9rem] hover:bg-[#F9FAFB] transition-colors bg-[#FFFFFF]">
                        <Globe size={16} /> {currentT.lang}
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-[#FEE2E2] text-[#DC2626] rounded-lg font-bold text-[0.9rem] hover:bg-[#FECACA] transition-colors border border-[#FCA5A5]">
                        <LogOut size={16} /> {currentT.logout}
                    </button>
                </div>
            </header>

            {/* Main Content Grid */}
            <main className="flex-1 p-8">
                <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-120px)]">
                    
                    {/* Table Header */}
                    <div className="grid grid-cols-6 gap-4 p-4 bg-[#F9FAFB] border-b border-[#E5E7EB] font-bold text-[#374151] text-[0.85rem] uppercase tracking-wider">
                        <div>{currentT.ack}</div>
                        <div>{currentT.org}</div>
                        <div>{currentT.contact}</div>
                        <div>{currentT.doc} & {currentT.live_photo}</div>
                        <div>{currentT.status}</div>
                        <div>{currentT.action}</div>
                    </div>

                    {/* Table Body */}
                    <div className="overflow-y-auto flex-1 p-2">
                        {isLoadingData ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
                            </div>
                        ) : filteredRecords.length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-[#6B7280] font-medium">
                                No records found.
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {filteredRecords.map((record) => (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={record.id} className="grid grid-cols-6 gap-4 p-4 bg-[#FFFFFF] border border-[#F3F4F6] rounded-xl items-center hover:shadow-md transition-shadow">
                                        
                                        <div className="font-mono font-bold text-[#2563EB] tracking-widest text-[0.95rem]">
                                            {record.ack_number}
                                        </div>
                                        
                                        <div className="font-black text-[#111111] text-[1rem] truncate">
                                            {record.business_name}
                                        </div>
                                        
                                        <div className="font-medium text-[#4B5563] text-[0.9rem]">
                                            {record.contact_info}
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            {record.business_photo && (
                                                <button onClick={() => setSelectedImage(getFileUrl(record, record.business_photo))} className="w-10 h-10 bg-[#F3F4F6] rounded-lg flex items-center justify-center hover:bg-[#E5E7EB] transition-colors border border-[#D1D5DB]" title="View Document">
                                                    <ImageIcon size={18} className="text-[#374151]" />
                                                </button>
                                            )}
                                            {record.live_person_photo && (
                                                <button onClick={() => setSelectedImage(getFileUrl(record, record.live_person_photo))} className="w-10 h-10 bg-[#F3F4F6] rounded-lg flex items-center justify-center hover:bg-[#E5E7EB] transition-colors border border-[#D1D5DB]" title="View Live Photo">
                                                    <img src={getFileUrl(record, record.live_person_photo)} alt="Live" className="w-full h-full object-cover rounded-lg" />
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.8rem] font-bold border ${record.status === 'Verified' ? 'bg-[#ECFDF5] text-[#16A34A] border-[#A7F3D0]' : record.status === 'Rejected' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'}`}>
                                                {record.status === 'Verified' ? <CheckCircle size={12} /> : record.status === 'Rejected' ? <AlertTriangle size={12} /> : <Clock size={12} />}
                                                {record.status === 'Verified' ? currentT.verified : record.status === 'Rejected' ? currentT.rejected : currentT.pending}
                                            </span>
                                        </div>
                                        
                                        <div>
                                            <select 
                                                value={record.status} 
                                                onChange={(e) => updateStatus(record.id, e.target.value)}
                                                className="w-full p-2 bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg text-[#111111] font-bold text-[0.85rem] outline-none cursor-pointer focus:border-[#2563EB]"
                                            >
                                                <option value="Pending">Set {currentT.pending}</option>
                                                <option value="Verified">Set {currentT.verified}</option>
                                                <option value="Rejected">Set {currentT.rejected}</option>
                                            </select>
                                        </div>

                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* IMAGE VIEWER MODAL */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
                        <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 w-12 h-12 bg-[#FFFFFF] rounded-full flex items-center justify-center text-[#111111] hover:bg-[#F3F4F6] transition-colors shadow-xl z-50 outline-none">
                            <X size={24} />
                        </button>
                        <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={selectedImage} alt="Application Document" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/20" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* LANGUAGE SELECTOR MODAL */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-[400px] bg-[#FFFFFF] rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[80vh] overflow-y-auto border border-[#E0E0E0] hide-scrollbar">
                            <button onClick={() => setShowLangPrompt(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#111111] hover:bg-[#F5F5F5] rounded-full transition-colors outline-none"><X size={18} /></button>
                            <div className="w-12 h-12 mx-auto rounded-full border border-[#E0E0E0] flex items-center justify-center mb-4"><Globe size={24} color="#111111" strokeWidth="1.5" /></div>
                            <div className="flex flex-col gap-2 mt-4">
                                {languageOptions.map((option) => (
                                    <button key={option.code} onClick={() => { setLang(option.code); setShowLangPrompt(false); }} className={`w-full p-4 rounded-xl flex items-center justify-between group transition-colors outline-none ${lang === option.code ? 'bg-[#2563EB] text-white border border-[#2563EB]' : 'bg-[#F9FAFB] text-[#111111] border border-[#E0E0E0] hover:border-[#2563EB]'}`}>
                                        <span className="font-bold text-[1rem]">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}