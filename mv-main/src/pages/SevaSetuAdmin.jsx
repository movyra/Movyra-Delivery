/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Secure Administrative Dashboard for SevaSetu Waitlist Operations.
 * Database: PocketBase (https://movyra-mv-main-db-gradio.hf.space)
 * Security: Native PocketBase Auth. Super Admin RBAC applied for deletion.
 * Routing: Password resets are routed to Vercel Serverless API (/api/reset-password).
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Search, X, CheckCircle, Clock, AlertTriangle, Shield, Globe, Image as ImageIcon, Download, Printer, Trash2, KeyRound, UserPlus, Filter, Camera } from 'lucide-react';
import PocketBase from 'pocketbase';

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
        prev: "Previous", next: "Next", page: "Page"
    },
    hi: {
        lang: "हिन्दी", admin_portal: "एडमिन पोर्टल", email: "ईमेल पता", password: "पासवर्ड",
        login: "लॉगिन करें", dashboard: "डैशबोर्ड", ack: "पावती", org: "संगठन", contact: "संपर्क", 
        live_photo: "लाइव फोटो", doc: "दस्तावेज़", status: "स्थिति", action: "कार्रवाई", 
        pending: "लंबित", verified: "सत्यापित", rejected: "अस्वीकृत", update: "अपडेट", 
        logout: "लॉगआउट", loading: "प्रसंस्करण...", search: "खोजें", view: "छवि देखें", 
        total: "कुल", export_csv: "सीएसवी निर्यात", print: "प्रिंट", delete: "हटाएं", 
        bulk_update: "थोक अद्यतन", filter_all: "सभी स्थिति", forgot_pwd: "पासवर्ड भूल गए?", 
        request_access: "एक्सेस का अनुरोध करें", send_reset: "रीसेट लिंक भेजें", submit_req: "अनुरोध सबमिट करें", 
        name: "पूरा नाम", reason: "कारण", back: "वापस जाएं", prev: "पिछला", next: "अगला", page: "पृष्ठ"
    },
    hinglish: {
        lang: "Hinglish", admin_portal: "Admin Portal", email: "Email Address", password: "Password",
        login: "Login Karein", dashboard: "Dashboard", ack: "Acknowledgement", org: "Organization", 
        contact: "Contact", live_photo: "Live Photo", doc: "Document", status: "Status", 
        action: "Action", pending: "Pending", verified: "Verified", rejected: "Rejected", 
        update: "Update Karein", logout: "Logout", loading: "Processing...", search: "Search Karein", 
        view: "Image Dekhein", total: "Total", export_csv: "CSV Export", print: "Print Karein", 
        delete: "Delete Karein", bulk_update: "Bulk Update Karein", filter_all: "All Status", 
        forgot_pwd: "Password Bhool Gaye?", request_access: "Access Request Karein", send_reset: "Reset Link Bhejein", 
        submit_req: "Request Submit Karein", name: "Full Name", reason: "Access Reason", back: "Login Par Jayein", 
        prev: "Peechhe", next: "Aage", page: "Page"
    },
    mr: {
        lang: "मराठी", admin_portal: "प्रशासक पोर्टल", email: "ईमेल पत्ता", password: "पासवर्ड",
        login: "लॉग इन करा", dashboard: "डॅशबोर्ड", ack: "पोचपावती", org: "संस्था", contact: "संपर्क", 
        live_photo: "थेट फोटो", doc: "दस्तऐवज", status: "स्थिती", action: "कृती", pending: "प्रलंबित", 
        verified: "सत्यापित", rejected: "नाकारले", update: "अपडेट करा", logout: "लॉगआउट", loading: "प्रक्रिया...", 
        search: "शोधा", view: "प्रतिमा पहा", total: "एकूण", export_csv: "CSV निर्यात", print: "प्रिंट", 
        delete: "काढून टाका", bulk_update: "एकत्रित अपडेट", filter_all: "सर्व स्थिती", forgot_pwd: "पासवर्ड विसरलात?", 
        request_access: "अॅक्सेसची विनंती करा", send_reset: "रीसेट लिंक पाठवा", submit_req: "विनंती सबमिट करा", 
        name: "पूर्ण नाव", reason: "कारण", back: "मागे जा", prev: "मागील", next: "पुढील", page: "पृष्ठ"
    },
    gu: {
        lang: "ગુજરાતી", admin_portal: "એડમિન પોર્ટલ", email: "ઇમેઇલ સરનામું", password: "પાસવર્ડ",
        login: "લૉગિન કરો", dashboard: "ડેશબોર્ડ", ack: "સ્વીકૃતિ", org: "સંસ્થા", contact: "સંપર્ક", 
        live_photo: "લાઇવ ફોટો", doc: "દસ્તાવેજ", status: "સ્થિતિ", action: "ક્રિયા", pending: "બાકી", 
        verified: "ચકાસાયેલ", rejected: "નકારવામાં આવેલ", update: "અપડેટ કરો", logout: "લોગઆઉટ", loading: "પ્રક્રિયા...", 
        search: "શોધો", view: "છબી જુઓ", total: "કુલ", export_csv: "CSV નિકાસ", print: "છાપો", 
        delete: "કાઢી નાખો", bulk_update: "બલ્ક અપડેટ", filter_all: "તમામ સ્થિતિ", forgot_pwd: "પાસવર્ડ ભૂલી ગયા છો?", 
        request_access: "ઍક્સેસની વિનંતી કરો", send_reset: "રીસેટ લિંક મોકલો", submit_req: "વિનંતી સબમિટ કરો", 
        name: "પૂરું નામ", reason: "કારણ", back: "પાછા જાઓ", prev: "પાછલું", next: "આગળ", page: "પૃષ્ઠ"
    },
    te: {
        lang: "తెలుగు", admin_portal: "అడ్మిన్ పోర్టల్", email: "ఈమెయిల్", password: "పాస్‌వర్డ్",
        login: "లాగిన్ చేయండి", dashboard: "డాష్‌బోర్డ్", ack: "అక్నాలెడ్జ్‌మెంట్", org: "సంస్థ", contact: "సంప్రదింపు", 
        live_photo: "లైవ్ ఫోటో", doc: "పత్రం", status: "స్థితి", action: "చర్య", pending: "పెండింగ్", 
        verified: "ధృవీకరించబడింది", rejected: "తిరస్కరించబడింది", update: "నవీకరించు", logout: "లాగ్అవుట్", loading: "ప్రాసెస్...", 
        search: "శోధించండి", view: "చిత్రం చూడండి", total: "మొత్తం", export_csv: "CSV ఎగుమతి", print: "ప్రింట్", 
        delete: "తొలగించు", bulk_update: "బల్క్ నవీకరణ", filter_all: "అన్ని స్థితి", forgot_pwd: "పాస్‌వర్డ్ మర్చిపోయారా?", 
        request_access: "యాక్సెస్ అభ్యర్థించండి", send_reset: "రీసెట్ లింక్ పంపండి", submit_req: "అభ్యర్థన సమర్పించండి", 
        name: "పూర్తి పేరు", reason: "కారణం", back: "వెనక్కి వెళ్ళు", prev: "మునుపటి", next: "తదుపరి", page: "పేజీ"
    },
    ta: {
        lang: "தமிழ்", admin_portal: "நிர்வாகி போர்டல்", email: "மின்னஞ்சல்", password: "கடவுச்சொல்",
        login: "உள்நுழைக", dashboard: "டாஷ்போர்டு", ack: "ஒப்புகை", org: "நிறுவனம்", contact: "தொடர்பு", 
        live_photo: "நேரடி புகைப்படம்", doc: "ஆவணம்", status: "நிலை", action: "செயல்", pending: "நிலுவையில்", 
        verified: "சரிபார்க்கப்பட்டது", rejected: "நிராகரிக்கப்பட்டது", update: "புதுப்பி", logout: "வெளியேறு", loading: "செயலாக்கம்...", 
        search: "தேடு", view: "படம் காண்", total: "மொத்தம்", export_csv: "CSV ஏற்றுமதி", print: "அச்சிடு", 
        delete: "நீக்கு", bulk_update: "மொத்த புதுப்பிப்பு", filter_all: "அனைத்து நிலை", forgot_pwd: "கடவுச்சொல் மறந்துவிட்டதா?", 
        request_access: "அணுகல் கோருக", send_reset: "மீட்டமை இணைப்பு அனுப்பு", submit_req: "கோரிக்கை சமர்ப்பி", 
        name: "முழு பெயர்", reason: "காரணம்", back: "திரும்பிச் செல்", prev: "முந்தைய", next: "அடுத்தது", page: "பக்கம்"
    },
    pa: {
        lang: "ਪੰਜਾਬੀ", admin_portal: "ਐਡਮਿਨ ਪੋਰਟਲ", email: "ਈਮੇਲ", password: "ਪਾਸਵਰਡ",
        login: "ਲਾਗਇਨ ਕਰੋ", dashboard: "ਡੈਸ਼ਬੋਰਡ", ack: "ਰਸੀਦ", org: "ਸੰਗਠਨ", contact: "ਸੰਪਰਕ", 
        live_photo: "ਲਾਈਵ ਫੋਟੋ", doc: "ਦਸਤਾਵੇਜ਼", status: "ਸਥਿਤੀ", action: "ਕਾਰਵਾਈ", pending: "ਬਕਾਇਆ", 
        verified: "ਪ੍ਰਮਾਣਿਤ", rejected: "ਰੱਦ", update: "ਅੱਪਡੇਟ", logout: "ਲਾਗਆਊਟ", loading: "ਕਾਰਵਾਈ ਹੋ ਰਹੀ ਹੈ...", 
        search: "ਖੋਜੋ", view: "ਤਸਵੀਰ ਵੇਖੋ", total: "ਕੁੱਲ", export_csv: "CSV ਨਿਰਯਾਤ", print: "ਪ੍ਰਿੰਟ", 
        delete: "ਮਿਟਾਓ", bulk_update: "ਬਲਕ ਅੱਪਡੇਟ", filter_all: "ਸਾਰੀ ਸਥਿਤੀ", forgot_pwd: "ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?", 
        request_access: "ਪਹੁੰਚ ਦੀ ਬੇਨਤੀ ਕਰੋ", send_reset: "ਰੀਸੈਟ ਲਿੰਕ ਭੇਜੋ", submit_req: "ਬੇਨਤੀ ਜਮ੍ਹਾਂ ਕਰੋ", 
        name: "ਪੂਰਾ ਨਾਮ", reason: "ਕਾਰਨ", back: "ਵਾਪਸ ਜਾਓ", prev: "ਪਿਛਲਾ", next: "ਅਗਲਾ", page: "ਪੰਨਾ"
    },
    bho: {
        lang: "भोजपुरी", admin_portal: "एडमिन पोर्टल", email: "ईमेल", password: "पासवर्ड",
        login: "लॉगिन करीं", dashboard: "डैशबोर्ड", ack: "पावती", org: "संगठन", contact: "संपर्क", 
        live_photo: "लाइव फोटो", doc: "दस्तावेज", status: "स्थिति", action: "कार्रवाई", pending: "लंबित", 
        verified: "सत्यापित", rejected: "अस्वीकृत", update: "अपडेट करीं", logout: "लॉगआउट", loading: "प्रक्रिया...", 
        search: "खोजीं", view: "फोटो देखीं", total: "कुल", export_csv: "CSV निर्यात", print: "प्रिंट", 
        delete: "हटावल जाव", bulk_update: "थोक अपडेट", filter_all: "सभ स्थिति", forgot_pwd: "पासवर्ड भुला गइल?", 
        request_access: "एक्सेस के अनुरोध करीं", send_reset: "रीसेट लिंक भेजीं", submit_req: "अनुरोध जमा करीं", 
        name: "पूरा नाम", reason: "कारण", back: "वापस जाईं", prev: "पिछला", next: "अगला", page: "पन्ना"
    },
    ar: {
        lang: "العربية", admin_portal: "بوابة الإدارة", email: "البريد الإلكتروني", password: "كلمة المرور",
        login: "تسجيل الدخول", dashboard: "لوحة العمليات", ack: "إقرار", org: "منظمة", contact: "اتصال", 
        live_photo: "صورة حية", doc: "وثيقة", status: "حالة", action: "إجراء", pending: "قيد الانتظار", 
        verified: "تم التحقق", rejected: "مرفوض", update: "تحديث", logout: "خروج", loading: "معالجة...", 
        search: "بحث", view: "عرض الصورة", total: "المجموع", export_csv: "تصدير CSV", print: "طباعة", 
        delete: "حذف", bulk_update: "تحديث جماعي", filter_all: "جميع الحالات", forgot_pwd: "نسيت كلمة المرور؟", 
        request_access: "طلب وصول", send_reset: "إرسال رابط إعادة الضبط", submit_req: "إرسال الطلب", 
        name: "الاسم الكامل", reason: "السبب", back: "رجوع", prev: "السابق", next: "التالي", page: "صفحة"
    },
    es: {
        lang: "Español", admin_portal: "Portal de Administración", email: "Correo Electrónico", password: "Contraseña",
        login: "Iniciar Sesión", dashboard: "Panel", ack: "Acuse", org: "Organización", contact: "Contacto", 
        live_photo: "Foto en Vivo", doc: "Documento", status: "Estado", action: "Acción", pending: "Pendiente", 
        verified: "Verificado", rejected: "Rechazado", update: "Actualizar", logout: "Salir", loading: "Procesando...", 
        search: "Buscar", view: "Ver Imagen", total: "Total", export_csv: "Exportar CSV", print: "Imprimir", 
        delete: "Eliminar", bulk_update: "Actualización Masiva", filter_all: "Todos", forgot_pwd: "¿Olvidó su contraseña?", 
        request_access: "Solicitar Acceso", send_reset: "Enviar Enlace", submit_req: "Enviar Solicitud", 
        name: "Nombre Completo", reason: "Motivo", back: "Volver", prev: "Anterior", next: "Siguiente", page: "Página"
    },
    fr: {
        lang: "Français", admin_portal: "Portail d'Administration", email: "Adresse E-mail", password: "Mot de passe",
        login: "Connexion", dashboard: "Tableau de Bord", ack: "Accusé", org: "Organisation", contact: "Contact", 
        live_photo: "Photo Direct", doc: "Document", status: "Statut", action: "Action", pending: "En attente", 
        verified: "Vérifié", rejected: "Rejeté", update: "Mettre à jour", logout: "Déconnexion", loading: "Traitement...", 
        search: "Rechercher", view: "Voir l'image", total: "Total", export_csv: "Exporter CSV", print: "Imprimer", 
        delete: "Supprimer", bulk_update: "Mise à jour en masse", filter_all: "Tous", forgot_pwd: "Mot de passe oublié ?", 
        request_access: "Demander l'accès", send_reset: "Envoyer le lien", submit_req: "Soumettre", 
        name: "Nom Complet", reason: "Raison", back: "Retour", prev: "Précédent", next: "Suivant", page: "Page"
    },
    de: {
        lang: "Deutsch", admin_portal: "Admin-Portal", email: "E-Mail", password: "Passwort",
        login: "Anmelden", dashboard: "Dashboard", ack: "Bestätigung", org: "Organisation", contact: "Kontakt", 
        live_photo: "Live-Foto", doc: "Dokument", status: "Status", action: "Aktion", pending: "Ausstehend", 
        verified: "Verifiziert", rejected: "Abgelehnt", update: "Aktualisieren", logout: "Abmelden", loading: "Verarbeitung...", 
        search: "Suchen", view: "Bild ansehen", total: "Gesamt", export_csv: "CSV Exportieren", print: "Drucken", 
        delete: "Löschen", bulk_update: "Massen-Update", filter_all: "Alle Status", forgot_pwd: "Passwort vergessen?", 
        request_access: "Zugang anfordern", send_reset: "Link senden", submit_req: "Anfrage senden", 
        name: "Vollständiger Name", reason: "Grund", back: "Zurück", prev: "Zurück", next: "Weiter", page: "Seite"
    }
};

export default function SevaSetuAdmin() {
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    
    // Auth & Role States
    const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid && pb.authStore.isAdmin);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authMessage, setAuthMessage] = useState({ text: '', type: '' });

    // Public Modals
    const [activeModal, setActiveModal] = useState(null); // 'login', 'forgot', 'request'
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

    const languageOptions = Object.keys(TRANSLATIONS).map(key => ({
        code: key,
        label: TRANSLATIONS[key].lang
    }));

    useEffect(() => {
        if (isAuthenticated) {
            setIsSuperAdmin(pb.authStore.model?.email === SUPER_ADMIN_EMAIL);
            fetchRecords();
        }
    }, [isAuthenticated]);

    // ==========================================
    // AUTHENTICATION & PUBLIC ACTIONS
    // ==========================================

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsAuthenticating(true);
        setAuthMessage({ text: '', type: '' });
        try {
            await pb.admins.authWithPassword(email, password);
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
        setIsAuthenticated(false);
        setIsSuperAdmin(false);
        setRecords([]);
    };

    // STRICT UPDATE: Route password resets through the Vercel API endpoint
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsAuthenticating(true);
        setAuthMessage({ text: '', type: '' });

        try {
            const response = await fetch('https://msevasetuemail.vercel.app/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: resetEmail }),
            });

            const result = await response.json();

            if (response.ok) {
                setAuthMessage({ text: 'Reset link sent successfully. Please check your inbox.', type: 'success' });
                setTimeout(() => setActiveModal(null), 4000);
            } else {
                setAuthMessage({ text: result.error || 'Failed to send reset email.', type: 'error' });
            }
        } catch (error) {
            console.error('Reset request error:', error);
            setAuthMessage({ text: 'Network error. Please try again.', type: 'error' });
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleRequestAccess = async (e) => {
        e.preventDefault();
        setIsAuthenticating(true);
        try {
            await pb.collection('sevasetu_admin_requests').create({
                name: reqForm.name,
                email: reqForm.email,
                reason: reqForm.reason,
                status: 'Pending'
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

    // Filter Logic
    const filteredRecords = records.filter(rec => {
        const matchesSearch = rec.ack_number.toLowerCase().includes(searchQuery.toLowerCase()) || rec.business_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || rec.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Analytics KPIs
    const kpi = {
        total: filteredRecords.length,
        pending: filteredRecords.filter(r => r.status === 'Pending').length,
        verified: filteredRecords.filter(r => r.status === 'Verified').length,
        rejected: filteredRecords.filter(r => r.status === 'Rejected').length
    };

    // Pagination Logic
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const currentRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

    // ==========================================
    // RENDER UNAUTHENTICATED PUBLIC VIEW
    // ==========================================
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-6 font-sans">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-[#FFFFFF] rounded-2xl shadow-xl p-8 border border-[#E5E7EB]">
                    
                    <div className="flex flex-col items-center mb-8">
                        <div className="flex items-center gap-1 mb-2">
                            <img src="/logo-7.png" alt="Movyra" className="h-8 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                            <span className="font-black text-[1.6rem] tracking-tighter text-[#111111]">
                                ovyra <span className="font-medium text-[#2563EB]">SevaSetu</span>
                            </span>
                        </div>
                        <p className="text-[#6B7280] font-bold text-[0.85rem] uppercase tracking-wider">{currentT.admin_portal}</p>
                    </div>

                    {!activeModal && (
                        <form onSubmit={handleLogin} className="flex flex-col gap-4">
                            <input type="email" placeholder={currentT.email} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB]" required />
                            <input type="password" placeholder={currentT.password} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB]" required />
                            {authMessage.text && <p className={`text-[0.85rem] font-bold text-center ${authMessage.type === 'error' ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>{authMessage.text}</p>}
                            <button type="submit" disabled={isAuthenticating} className="w-full py-4 bg-[#2563EB] text-[#FFFFFF] rounded-xl font-black text-[1.1rem] hover:bg-[#1D4ED8] transition-colors mt-2 disabled:opacity-50">
                                {isAuthenticating ? currentT.loading : currentT.login}
                            </button>
                            <div className="flex justify-between mt-4">
                                <button type="button" onClick={() => { setActiveModal('forgot'); setAuthMessage({text:'', type:''}); }} className="text-[#4B5563] text-[0.85rem] font-bold hover:text-[#2563EB] outline-none">{currentT.forgot_pwd}</button>
                                <button type="button" onClick={() => { setActiveModal('request'); setAuthMessage({text:'', type:''}); }} className="text-[#4B5563] text-[0.85rem] font-bold hover:text-[#2563EB] outline-none">{currentT.request_access}</button>
                            </div>
                        </form>
                    )}

                    {activeModal === 'forgot' && (
                        <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                            <input type="email" placeholder={currentT.email} value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full p-4 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB]" required />
                            {authMessage.text && <p className={`text-[0.85rem] font-bold text-center ${authMessage.type === 'error' ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>{authMessage.text}</p>}
                            <button type="submit" disabled={isAuthenticating} className="w-full py-4 bg-[#111111] text-[#FFFFFF] rounded-xl font-black hover:bg-[#000000] transition-colors mt-2 disabled:opacity-50">
                                {isAuthenticating ? currentT.loading : currentT.send_reset}
                            </button>
                            <button type="button" onClick={() => setActiveModal(null)} className="text-[#4B5563] text-[0.85rem] font-bold hover:text-[#111111] mt-2 outline-none text-center w-full">{currentT.back}</button>
                        </form>
                    )}

                    {activeModal === 'request' && (
                        <form onSubmit={handleRequestAccess} className="flex flex-col gap-4">
                            <input type="text" placeholder={currentT.name} value={reqForm.name} onChange={(e) => setReqForm({...reqForm, name: e.target.value})} className="w-full p-3 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB]" required />
                            <input type="email" placeholder={currentT.email} value={reqForm.email} onChange={(e) => setReqForm({...reqForm, email: e.target.value})} className="w-full p-3 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB]" required />
                            <textarea placeholder={currentT.reason} value={reqForm.reason} onChange={(e) => setReqForm({...reqForm, reason: e.target.value})} className="w-full p-3 bg-[#F9FAFB] border border-[#D1D5DB] rounded-xl text-[#111111] font-medium outline-none focus:border-[#2563EB] resize-none h-24" required></textarea>
                            {authMessage.text && <p className={`text-[0.85rem] font-bold text-center ${authMessage.type === 'error' ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>{authMessage.text}</p>}
                            <button type="submit" disabled={isAuthenticating} className="w-full py-4 bg-[#16A34A] text-[#FFFFFF] rounded-xl font-black hover:bg-[#15803D] transition-colors mt-2 disabled:opacity-50">
                                {isAuthenticating ? currentT.loading : currentT.submit_req}
                            </button>
                            <button type="button" onClick={() => setActiveModal(null)} className="text-[#4B5563] text-[0.85rem] font-bold hover:text-[#111111] mt-2 outline-none text-center w-full">{currentT.back}</button>
                        </form>
                    )}

                </motion.div>
            </div>
        );
    }

    // ==========================================
    // RENDER AUTHENTICATED DASHBOARD
    // ==========================================
    return (
        <div className="min-h-screen bg-[#F3F4F6] font-sans flex flex-col">
            
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
                        <input type="text" placeholder={currentT.search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[0.9rem] font-medium outline-none focus:border-[#2563EB] w-48 sm:w-64" />
                    </div>
                    <button onClick={() => setShowLangPrompt(true)} className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg text-[#374151] font-bold text-[0.85rem] hover:bg-[#F9FAFB] transition-colors bg-[#FFFFFF]">
                        <Globe size={16} /> <span className="hidden sm:inline">{currentT.lang}</span>
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 bg-[#FEE2E2] text-[#DC2626] rounded-lg font-bold text-[0.85rem] hover:bg-[#FECACA] transition-colors border border-[#FCA5A5]">
                        <LogOut size={16} /> <span className="hidden sm:inline">{currentT.logout}</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 p-6 flex flex-col gap-6">
                
                {/* Real-time KPI Analytics */}
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

                {/* Toolbar */}
                <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-[#6B7280]" />
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-[#F9FAFB] border border-[#D1D5DB] rounded-lg px-3 py-1.5 text-[#111111] font-bold text-[0.85rem] outline-none">
                                <option value="All">{currentT.filter_all}</option>
                                <option value="Pending">{currentT.pending}</option>
                                <option value="Verified">{currentT.verified}</option>
                                <option value="Rejected">{currentT.rejected}</option>
                            </select>
                        </div>
                        
                        {selectedRecords.length > 0 && (
                            <div className="flex items-center gap-2 border-l border-[#E5E7EB] pl-4">
                                <span className="text-[#2563EB] font-bold text-[0.85rem]">{selectedRecords.length} selected</span>
                                <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] rounded-lg px-2 py-1 text-[0.8rem] font-bold outline-none">
                                    <option value="">Status...</option>
                                    <option value="Pending">{currentT.pending}</option>
                                    <option value="Verified">{currentT.verified}</option>
                                    <option value="Rejected">{currentT.rejected}</option>
                                </select>
                                <button onClick={handleBulkUpdate} className="bg-[#2563EB] text-[#FFFFFF] px-3 py-1 rounded-lg text-[0.8rem] font-bold hover:bg-[#1D4ED8]">{currentT.update}</button>
                            </div>
                        )}
                    </div>
                    
                    <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-[#111111] text-[#FFFFFF] rounded-lg font-bold text-[0.85rem] hover:bg-[#000000] transition-colors">
                        <Download size={16} /> {currentT.export_csv}
                    </button>
                </div>

                {/* Main Data Table */}
                <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden flex flex-col flex-1">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#374151] text-[0.8rem] uppercase tracking-wider font-bold">
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
                                        <tr key={record.id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                                            <td className="p-4 text-center">
                                                <input type="checkbox" checked={selectedRecords.includes(record.id)} onChange={() => toggleSelect(record.id)} className="cursor-pointer" />
                                            </td>
                                            <td className="p-4 font-mono font-bold text-[#2563EB]">{record.ack_number}</td>
                                            <td className="p-4 font-black text-[#111111] max-w-[200px] truncate" title={record.business_name}>{record.business_name}</td>
                                            <td className="p-4 font-medium text-[#4B5563]">{record.contact_info}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {record.business_photo && <button onClick={() => setSelectedImage(getFileUrl(record, record.business_photo))} className="w-8 h-8 bg-[#F3F4F6] rounded flex items-center justify-center border border-[#D1D5DB]" title="Document"><ImageIcon size={14} /></button>}
                                                    {record.live_person_photo && <button onClick={() => setSelectedImage(getFileUrl(record, record.live_person_photo))} className="w-8 h-8 bg-[#F3F4F6] rounded flex items-center justify-center border border-[#D1D5DB]" title="Live Photo"><Camera size={14} /></button>}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <select value={record.status} onChange={(e) => updateStatus(record.id, e.target.value)} className={`p-1.5 rounded-lg font-bold text-[0.8rem] border outline-none ${record.status === 'Verified' ? 'bg-[#ECFDF5] text-[#16A34A] border-[#A7F3D0]' : record.status === 'Rejected' ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]' : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'}`}>
                                                    <option value="Pending">{currentT.pending}</option>
                                                    <option value="Verified">{currentT.verified}</option>
                                                    <option value="Rejected">{currentT.rejected}</option>
                                                </select>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => setRecordToPrint(record)} className="p-1.5 text-[#4B5563] hover:text-[#2563EB] hover:bg-[#EFF6FF] rounded transition-colors" title={currentT.print}><Printer size={16} /></button>
                                                    {isSuperAdmin && (
                                                        <button onClick={() => deleteRecord(record.id)} className="p-1.5 text-[#DC2626] hover:bg-[#FEE2E2] rounded transition-colors" title={currentT.delete}><Trash2 size={16} /></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-[#F9FAFB] p-3 border-t border-[#E5E7EB] flex items-center justify-between text-[0.85rem] font-bold text-[#374151]">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-[#D1D5DB] rounded bg-[#FFFFFF] disabled:opacity-50">{currentT.prev}</button>
                            <span>{currentT.page} {currentPage} of {totalPages}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border border-[#D1D5DB] rounded bg-[#FFFFFF] disabled:opacity-50">{currentT.next}</button>
                        </div>
                    )}
                </div>
            </main>

            {/* MODALS */}
            
            {/* Image Viewer */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
                        <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 w-10 h-10 bg-[#FFFFFF] rounded-full flex items-center justify-center text-[#111111] hover:bg-[#F3F4F6] shadow-xl z-50"><X size={20} /></button>
                        <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={selectedImage} alt="Application Document" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/20" />
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
                                    <p className="text-[#666666] font-mono text-[0.9rem]">Generated: {new Date().toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[0.8rem] font-bold uppercase text-[#666666]">Acknowledgement No.</p>
                                    <p className="text-[1.5rem] font-mono font-black text-[#2563EB]">{recordToPrint.ack_number}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <p className="text-[0.8rem] font-bold uppercase text-[#666666] mb-1">Organization Name</p>
                                    <p className="text-[1.2rem] font-black text-[#111111]">{recordToPrint.business_name}</p>
                                </div>
                                <div>
                                    <p className="text-[0.8rem] font-bold uppercase text-[#666666] mb-1">Contact Information</p>
                                    <p className="text-[1.2rem] font-medium text-[#111111]">{recordToPrint.contact_info}</p>
                                </div>
                                <div>
                                    <p className="text-[0.8rem] font-bold uppercase text-[#666666] mb-1">Current Status</p>
                                    <p className="text-[1.2rem] font-black text-[#111111]">{recordToPrint.status}</p>
                                </div>
                                <div>
                                    <p className="text-[0.8rem] font-bold uppercase text-[#666666] mb-1">Application Date</p>
                                    <p className="text-[1rem] font-medium text-[#111111]">{new Date(recordToPrint.created).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 border-t border-[#E5E7EB] pt-8">
                                <div>
                                    <p className="text-[0.8rem] font-bold uppercase text-[#666666] mb-2">Organization Document</p>
                                    {recordToPrint.business_photo ? (
                                        <img src={getFileUrl(recordToPrint, recordToPrint.business_photo)} className="w-full rounded border border-[#E5E7EB]" alt="Doc" />
                                    ) : <p className="text-[0.9rem] italic text-[#9CA3AF]">Not provided</p>}
                                </div>
                                <div>
                                    <p className="text-[0.8rem] font-bold uppercase text-[#666666] mb-2">Live Identity Verification</p>
                                    {recordToPrint.live_person_photo ? (
                                        <img src={getFileUrl(recordToPrint, recordToPrint.live_person_photo)} className="w-full rounded border border-[#E5E7EB]" alt="Live" />
                                    ) : <p className="text-[0.9rem] italic text-[#9CA3AF]">Not provided</p>}
                                </div>
                            </div>
                        </div>

                        {/* Print Controls (Hidden during actual printing via CSS injected below) */}
                        <div className="fixed bottom-0 left-0 right-0 bg-[#111111] p-4 flex justify-center gap-4 z-50 print:hidden">
                            <button onClick={() => setRecordToPrint(null)} className="px-6 py-2 bg-[#374151] text-white font-bold rounded-lg hover:bg-[#4B5563]">Cancel</button>
                            <button onClick={() => window.print()} className="px-6 py-2 bg-[#2563EB] text-white font-bold rounded-lg flex items-center gap-2 hover:bg-[#1D4ED8]"><Printer size={18} /> Print Record</button>
                        </div>
                        <style>{`@media print { body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; box-shadow: none; border: none; } }`}</style>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Language Prompt */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-[400px] bg-[#FFFFFF] rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[80vh] overflow-y-auto hide-scrollbar">
                            <button onClick={() => setShowLangPrompt(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#111111] hover:bg-[#F5F5F5] rounded-full"><X size={18} /></button>
                            <h2 className="text-[1.4rem] font-black tracking-tight mb-4 text-[#111111] text-center">{currentT.lang}</h2>
                            <div className="flex flex-col gap-2">
                                {languageOptions.map((opt) => (
                                    <button key={opt.code} onClick={() => { setLang(opt.code); setShowLangPrompt(false); }} className={`p-3 rounded-xl font-bold text-left border ${lang === opt.code ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-[#F9FAFB] text-[#111111] border-[#E5E7EB]'}`}>{opt.label}</button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}