import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Trash2, Users, Video, AlertTriangle, Edit2, Plus, Phone, Building, CheckCircle, ArrowRight, Lock } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [step, setStep] = useState('tutorial'); // tutorial | login | dashboard
    const [activeTab, setActiveTab] = useState('directory'); // directory | reports | reels | users

    // Login Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Directory Form State
    const [deptName, setDeptName] = useState('');
    const [category, setCategory] = useState('Municipal');
    const [phone, setPhone] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data States
    const [reports, setReports] = useState([]);
    const [reels, setReels] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [directoryList, setDirectoryList] = useState([]);

    // Language Synchronization
    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        if (supported.includes(savedLang)) setLang(savedLang);

        const handleStorageChange = () => {
            const newLang = localStorage.getItem('nagrik_lang');
            if (newLang && supported.includes(newLang)) setLang(newLang);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Super Admin Gateway Verification
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user && user.email === 'testcodecfg@gmail.com') {
                setIsAdmin(true);
                setStep('tutorial'); // Show tutorial animations even after login
                fetchAdminData();
            } else {
                setIsAdmin(false);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Real-Time Moderation Data Fetching
    const fetchAdminData = () => {
        const qReports = query(collection(db, 'nagrik_reports'), orderBy('createdAt', 'desc'));
        onSnapshot(qReports, (snapshot) => setReports(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));

        const qReels = query(collection(db, 'nagrik_reels'), orderBy('createdAt', 'desc'));
        onSnapshot(qReels, (snapshot) => setReels(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));

        const qUsers = query(collection(db, 'users'));
        onSnapshot(qUsers, (snapshot) => setUsersList(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));

        const qDir = query(collection(db, 'civic_directory'), orderBy('departmentName', 'asc'));
        onSnapshot(qDir, (snapshot) => setDirectoryList(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
    };

    // 15 Comprehensive Indian Language Translations
    const t = {
        en: { title: "Super Admin Console", tab_dir: "Civic Directory", tab_rep: "Manage Reports", tab_reels: "Moderate Reels", tab_users: "User Base", load: "Verifying Security Clearance...", purge: "Purge Record", update: "Update Profile", no_data: "No records found in database.", cat: "Category:", desc: "Description:", author: "Author:", role: "Role:", tut_title: "Secure Admin Gateway", tut_desc: "Manage city operations, emergency contacts, and citizen reports in real-time.", start: "Proceed to Login", login_title: "Administrator Authentication", email: "Admin Email", pass: "Password", btn_login: "Access Console", dept: "Department Name", phone: "Contact Number", add_contact: "Publish Contact Record", success: "Record successfully published." },
        hi: { title: "सुपर एडमिन कंसोल", tab_dir: "नागरिक निर्देशिका", tab_rep: "रिपोर्ट प्रबंधित करें", tab_reels: "रील्स मॉडरेट करें", tab_users: "उपयोगकर्ता आधार", load: "सुरक्षा मंजूरी सत्यापित की जा रही है...", purge: "रिकॉर्ड हटाएं", update: "प्रोफ़ाइल अपडेट करें", no_data: "डेटाबेस में कोई रिकॉर्ड नहीं मिला।", cat: "श्रेणी:", desc: "विवरण:", author: "लेखक:", role: "भूमिका:", tut_title: "सुरक्षित एडमिन गेटवे", tut_desc: "वास्तविक समय में शहर के संचालन, आपातकालीन संपर्कों और नागरिक रिपोर्टों का प्रबंधन करें।", start: "लॉगिन पर जाएं", login_title: "प्रशासक प्रमाणीकरण", email: "एडमिन ईमेल", pass: "पासवर्ड", btn_login: "कंसोल एक्सेस करें", dept: "विभाग का नाम", phone: "संपर्क नंबर", add_contact: "संपर्क रिकॉर्ड प्रकाशित करें", success: "रिकॉर्ड सफलतापूर्वक प्रकाशित हुआ।" },
        hinglish: { title: "Super Admin Console", tab_dir: "Civic Directory", tab_rep: "Reports Manage Karein", tab_reels: "Reels Moderate Karein", tab_users: "User Base", load: "Security Clearance verify ho raha hai...", purge: "Record Purge Karein", update: "Profile Update Karein", no_data: "Database mein koi record nahi mila.", cat: "Category:", desc: "Description:", author: "Author:", role: "Role:", tut_title: "Secure Admin Gateway", tut_desc: "City operations aur emergency contacts manage karein.", start: "Login Par Jayein", login_title: "Administrator Authentication", email: "Admin Email", pass: "Password", btn_login: "Access Console", dept: "Department Name", phone: "Contact Number", add_contact: "Publish Contact", success: "Record published." },
        mr: { title: "सुपर अॅडमिन कन्सोल", tab_dir: "नागरिक निर्देशिका", tab_rep: "अहवाल व्यवस्थापित करा", tab_reels: "रील्स नियंत्रित करा", tab_users: "वापरकर्ता आधार", load: "सुरक्षा मंजुरी पडताळत आहे...", purge: "रेकॉर्ड पुसून टाका", update: "प्रोफाइल अपडेट करा", no_data: "डेटाबेसमध्ये कोणतेही रेकॉर्ड आढळले नाही.", cat: "श्रेणी:", desc: "वर्णन:", author: "लेखक:", role: "भूमिका:", tut_title: "सुरक्षित एडमिन गेटवे", tut_desc: "शहराची कार्ये आणि आणीबाणी संपर्क व्यवस्थापित करा.", start: "लॉगिन करा", login_title: "प्रशासक प्रमाणीकरण", email: "एडमिन ईमेल", pass: "पासवर्ड", btn_login: "कन्सोल प्रवेश करा", dept: "विभाग नाव", phone: "संपर्क क्रमांक", add_contact: "संपर्क रेकॉर्ड प्रकाशित करा", success: "रेकॉर्ड प्रकाशित झाले." },
        gu: { title: "સુપર એડમિન કન્સોલ", tab_dir: "નાગરિક ડિરેક્ટરી", tab_rep: "રિપોર્ટ્સ મેનેજ કરો", tab_reels: "રીલ્સ મોડરેટ કરો", tab_users: "વપરાશકર્તા આધાર", load: "સુરક્ષા મંજૂરી ચકાસી રહ્યા છીએ...", purge: "રેકોર્ડ સાફ કરો", update: "પ્રોફાઇલ અપડેટ કરો", no_data: "ડેટાબેઝમાં કોઈ રેકોર્ડ મળ્યો નથી.", cat: "શ્રેણી:", desc: "વર્ણન:", author: "લેખક:", role: "ભૂમિકા:", tut_title: "સુરક્ષિત એડમિન ગેટવે", tut_desc: "શહેરના કામકાજ અને કટોકટી સંપર્કોનું સંચાલન કરો.", start: "લોગિન પર જાઓ", login_title: "પ્રશાસક પ્રમાણીકરણ", email: "એડમિન ઇમેઇલ", pass: "પાસવર્ડ", btn_login: "કન્સોલ Accessક્સેસ કરો", dept: "વિભાગનું નામ", phone: "સંપર્ક નંબર", add_contact: "સંપર્ક રેકોર્ડ પ્રકાશિત કરો", success: "રેકોર્ડ સફળતાપૂર્વક પ્રકાશિત થયો." },
        te: { title: "సూపర్ అడ్మిన్ కన్సోల్", tab_dir: "పౌర డైరెక్టరీ", tab_rep: "నివేదికలను నిర్వహించండి", tab_reels: "రీల్స్ మోడరేట్ చేయండి", tab_users: "వినియోగదారు ఆధారం", load: "భద్రతా క్లియరెన్స్ నిర్ధారిస్తోంది...", purge: "రికార్డును తొలగించండి", update: "ప్రొఫైల్ నవీకరించండి", no_data: "డేటాబేస్లో రికార్డులు కనుగొనబడలేదు.", cat: "వర్గం:", desc: "వివరణ:", author: "రచయిత:", role: "పాత్ర:", tut_title: "సురక్షిత అడ్మిన్ గేట్‌వే", tut_desc: "నగర కార్యకలాపాలు మరియు అత్యవసర పరిచయాలను నిర్వహించండి.", start: "లాగిన్‌కి వెళ్లండి", login_title: "నిర్వాహక ప్రమాణీకరణ", email: "అడ్మిన్ ఇమెయిల్", pass: "పాస్‌వర్డ్", btn_login: "కన్సోల్‌ను యాక్సెస్ చేయండి", dept: "శాఖ పేరు", phone: "సంప్రదింపు నంబర్", add_contact: "సంప్రదింపు రికార్డును ప్రచురించండి", success: "రికార్డు విజయవంతంగా ప్రచురించబడింది." },
        ta: { title: "சூப்பர் நிர்வாகி கன்சோல்", tab_dir: "குடிமை அடைவு", tab_rep: "அறிக்கைகளை நிர்வகி", tab_reels: "ரீல்களை மதிப்பாய்வு செய்", tab_users: "பயனர் தளம்", load: "பாதுகாப்பு அனுமதியை சரிபார்க்கிறது...", purge: "பதிவை அழிக்கவும்", update: "சுயவிவரத்தை புதுப்பிக்கவும்", no_data: "தரவுத்தளத்தில் எந்த பதிவும் இல்லை.", cat: "வகை:", desc: "விளக்கம்:", author: "ஆசிரியர்:", role: "பங்கு:", tut_title: "பாதுகாப்பான நிர்வாக நுழைவாயில்", tut_desc: "நகர செயல்பாடுகள் மற்றும் அவசர தொடர்புகளை நிர்வகிக்கவும்.", start: "உள்நுழைவுக்குச் செல்", login_title: "நிர்வாகி அங்கீகாரம்", email: "நிர்வாகி மின்னஞ்சல்", pass: "கடவுச்சொல்", btn_login: "கன்சோலை அணுகவும்", dept: "துறை பெயர்", phone: "தொடர்பு எண்", add_contact: "தொடர்பு பதிவை வெளியிடு", success: "பதிவு வெற்றிகரமாக வெளியிடப்பட்டது." },
        kn: { title: "ಸೂಪರ್ ಅಡ್ಮಿನ್ ಕನ್ಸೋಲ್", tab_dir: "ನಾಗರಿಕ ಡೈರೆಕ್ಟರಿ", tab_rep: "ವರದಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ", tab_reels: "ರೀಲ್ಸ್ ಮಾಡರೇಟ್ ಮಾಡಿ", tab_users: "ಬಳಕೆದಾರರ ಮೂಲ", load: "ಭದ್ರತಾ ಕ್ಲಿಯರೆನ್ಸ್ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...", purge: "ದಾಖಲೆಯನ್ನು ಅಳಿಸಿ", update: "ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಿ", no_data: "ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಯಾವುದೇ ದಾಖಲೆ ಕಂಡುಬಂದಿಲ್ಲ.", cat: "ವರ್ಗ:", desc: "ವಿವರಣೆ:", author: "ಲೇಖಕ:", role: "ಪಾತ್ರ:", tut_title: "ಸುರಕ್ಷಿತ ನಿರ್ವಾಹಕ ಗೇಟ್‌ವೇ", tut_desc: "ನಗರದ ಕಾರ್ಯಾಚರಣೆಗಳು ಮತ್ತು ತುರ್ತು ಸಂಪರ್ಕಗಳನ್ನು ನಿರ್ವಹಿಸಿ.", start: "ಲಾಗಿನ್‌ಗೆ ಮುಂದುವರಿಯಿರಿ", login_title: "ನಿರ್ವಾಹಕ ದೃಢೀಕರಣ", email: "ನಿರ್ವಾಹಕ ಇಮೇಲ್", pass: "ಪಾಸ್‌ವರ್ಡ್", btn_login: "ಕನ್ಸೋಲ್ ಪ್ರವೇಶಿಸಿ", dept: "ವಿಭಾಗದ ಹೆಸರು", phone: "ಸಂಪರ್ಕ ಸಂಖ್ಯೆ", add_contact: "ಸಂಪರ್ಕ ದಾಖಲೆಯನ್ನು ಪ್ರಕಟಿಸಿ", success: "ದಾಖಲೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪ್ರಕಟಿಸಲಾಗಿದೆ." },
        ml: { title: "സൂപ്പർ അഡ്മിൻ കൺസോൾ", tab_dir: "സിവിക് ഡയറക്ടറി", tab_rep: "റിപ്പോർട്ടുകൾ നിയന്ത്രിക്കുക", tab_reels: "റീലുകൾ മോഡറേറ്റ് ചെയ്യുക", tab_users: "ഉപയോക്തൃ അടിത്തറ", load: "സുരക്ഷാ ക്ലിയറൻസ് പരിശോധിക്കുന്നു...", purge: "റെക്കോർഡ് മായ്‌ക്കുക", update: "പ്രൊഫൈൽ അപ്ഡേറ്റ് ചെയ്യുക", no_data: "ഡാറ്റാബേസിൽ റെക്കോർഡുകളൊന്നും കണ്ടെത്തിയില്ല.", cat: "വിഭാഗം:", desc: "വിവരണം:", author: "രചയിതാവ്:", role: "പങ്ക്:", tut_title: "സുരക്ഷിത അഡ്മിൻ ഗേറ്റ്‌വേ", tut_desc: "നഗര പ്രവർത്തനങ്ങളും അടിയന്തര കോൺടാക്റ്റുകളും കൈകാര്യം ചെയ്യുക.", start: "ലോഗിൻ ചെയ്യുക", login_title: "അഡ്മിനിസ്ട്രേറ്റർ പ്രാമാണീകരണം", email: "അഡ്മിൻ ഇമെയിൽ", pass: "പാസ്‌വേർഡ്", btn_login: "കൺസോൾ ആക്സസ് ചെയ്യുക", dept: "വകുപ്പിന്റെ പേര്", phone: "കോൺടാക്റ്റ് നമ്പർ", add_contact: "കോൺടാക്റ്റ് റെക്കോർഡ് പ്രസിദ്ധീകരിക്കുക", success: "റെക്കോർഡ് വിജയകരമായി പ്രസിദ്ധീകരിച്ചു." },
        bn: { title: "সুপার অ্যাডমিন কনসোল", tab_dir: "নাগরিক ডিরেক্টরি", tab_rep: "রিপোর্ট পরিচালনা করুন", tab_reels: "রিল মডারেট করুন", tab_users: "ব্যবহারকারী বেস", load: "নিরাপত্তা ছাড়পত্র যাচাই করা হচ্ছে...", purge: "রেকর্ড মুছুন", update: "প্রোফাইল আপডেট করুন", no_data: "ডাটাবেসে কোনো রেকর্ড পাওয়া যায়নি।", cat: "বিভাগ:", desc: "বিবরণ:", author: "লেখক:", role: "ভূমিকা:", tut_title: "নিরাপদ অ্যাডমিন গেটওয়ে", tut_desc: "শহরের অপারেশন এবং জরুরি যোগাযোগ পরিচালনা করুন।", start: "লগইন করুন", login_title: "প্রশাসক প্রমাণীকরণ", email: "অ্যাডমিন ইমেল", pass: "পাসওয়ার্ড", btn_login: "কনসোল অ্যাক্সেস করুন", dept: "বিভাগের নাম", phone: "যোগাযোগের নম্বর", add_contact: "যোগাযোগ রেকর্ড প্রকাশ করুন", success: "রেকর্ড সফলভাবে প্রকাশিত হয়েছে।" },
        pa: { title: "ਸੁਪਰ ਐਡਮਿਨ ਕੰਸੋਲ", tab_dir: "ਨਾਗਰਿਕ ਡਾਇਰੈਕਟਰੀ", tab_rep: "ਰਿਪੋਰਟਾਂ ਦਾ ਪ੍ਰਬੰਧ ਕਰੋ", tab_reels: "ਰੀਲਾਂ ਨੂੰ ਮੋਡਰੇਟ ਕਰੋ", tab_users: "ਉਪਭੋਗਤਾ ਆਧਾਰ", load: "ਸੁਰੱਖਿਆ ਮਨਜ਼ੂਰੀ ਦੀ ਜਾਂਚ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...", purge: "ਰਿਕਾਰਡ ਮਿਟਾਓ", update: "ਪ੍ਰਫਾਈਲ ਅੱਪਡੇਟ ਕਰੋ", no_data: "ਡਾਟਾਬੇਸ ਵਿੱਚ ਕੋਈ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ।", cat: "ਸ਼੍ਰੇਣੀ:", desc: "ਵਰਣਨ:", author: "ਲੇਖਕ:", role: "ਭੂਮਿਕਾ:", tut_title: "ਸੁਰੱਖਿਅਤ ਐਡਮਿਨ ਗੇਟਵੇ", tut_desc: "ਸ਼ਹਿਰ ਦੇ ਕੰਮਕਾਜ ਅਤੇ ਐਮਰਜੈਂਸੀ ਸੰਪਰਕਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ।", start: "ਲਗਇਨ ਕਰੋ", login_title: "ਪ੍ਰਸ਼ਾਸਕ ਪ੍ਰਮਾਣੀਕਰਨ", email: "ਐਡਮਿਨ ਈਮੇਲ", pass: "ਪਾਸਵਰਡ", btn_login: "ਕੰਸੋਲ ਤੱਕ ਪਹੁੰਚ ਕਰੋ", dept: "ਵਿਭਾਗ ਦਾ ਨਾਮ", phone: "ਸੰਪਰਕ ਨੰਬਰ", add_contact: "ਸੰਪਰਕ ਰਿਕਾਰਡ ਪ੍ਰਕਾਸ਼ਿਤ ਕਰੋ", success: "ਰਿਕਾਰਡ ਸਫਲਤਾਪੂਰਵਕ ਪ੍ਰਕਾਸ਼ਿਤ ਕੀਤਾ ਗਿਆ ਹੈ।" },
        or: { title: "ସୁପର ଆଡମିନ କନସୋଲ", tab_dir: "ନାଗରିକ ନିର୍ଦ୍ଦେଶିକା", tab_rep: "ରିପୋର୍ଟ ପରିଚାଳନା କରନ୍ତୁ", tab_reels: "ରିଲ୍ସ ମଡରେଟ୍ କରନ୍ତୁ", tab_users: "ବ୍ୟବହାରକାରୀ ଆଧାର", load: "ସୁରକ୍ଷା କ୍ଲିୟରାନ୍ସ ଯାଞ୍ଚ ହେଉଛି...", purge: "ରେକର୍ଡ ଲିଭାନ୍ତୁ", update: "ପ୍ରୋଫାଇଲ୍ ଅପଡେଟ୍ କରନ୍ତୁ", no_data: "ଡାଟାବେସରେ କୌଣସି ରେକର୍ଡ ମିଳିଲା ନାହିଁ।", cat: "ବର୍ଗ:", desc: "ବିବରଣୀ:", author: "ଲେଖକ:", role: "ଭୂମିକା:", tut_title: "ସୁରକ୍ଷିତ ଆଡମିନ ଗେଟୱେ", tut_desc: "ସହର କାର୍ଯ୍ୟ ଏବଂ ଜରୁରୀକାଳୀନ ଯୋଗାଯୋଗ ପରିଚାଳନା କରନ୍ତୁ।", start: "ଲଗଇନ୍ କରନ୍ତୁ", login_title: "ପ୍ରଶାସକ ପ୍ରମାଣୀକରଣ", email: "ଆଡମିନ ଇମେଲ୍", pass: "ପାସୱାର୍ଡ", btn_login: "କନସୋଲ୍ ଆକ୍ସେସ୍ କରନ୍ତୁ", dept: "ବିଭାଗ ନାମ", phone: "ଯୋଗାଯୋଗ ନମ୍ବର", add_contact: "ଯୋଗାଯୋଗ ରେକର୍ଡ ପ୍ରକାଶ କରନ୍ତୁ", success: "ରେକର୍ଡ ସଫଳତାପୂର୍ବକ ପ୍ରକାଶିତ ହେଲା।" },
        as: { title: "ছুপাৰ এডমিন কনচোল", tab_dir: "নাগৰিক নিৰ্দেশিকা", tab_rep: "প্ৰতিবেদন পৰিচালনা কৰক", tab_reels: "ৰিলছ মডাৰেট কৰক", tab_users: "ব্যৱহাৰকাৰীৰ ভিত্তি", load: "নিৰাপত্তা ক্লিয়াৰেন্স পৰীক্ষা কৰা হৈছে...", purge: "ৰেকৰ্ড মচি পেলাওক", update: "প্ৰফাইল আপডেট কৰক", no_data: "ডাটাবেচত কোনো ৰেকৰ্ড পোৱা নগ'ল।", cat: "শ্ৰেণী:", desc: "বিৱৰণ:", author: "লেখক:", role: "ভূমিকা:", tut_title: "নিৰাপদ এডমিন গেটৱে", tut_desc: "চহৰৰ কাৰ্য্যকলাপ আৰু জৰুৰীকালীন যোগাযোগ পৰিচালনা কৰক।", start: "লগইন কৰক", login_title: "প্ৰশাসক প্ৰমাণীকৰণ", email: "এডমিন ইমেইল", pass: "পাছৱৰ্ড", btn_login: "কনচোল প্ৰৱেশ কৰক", dept: "বিভাগৰ নাম", phone: "যোগাযোগৰ নম্বৰ", add_contact: "যোগাযোগ ৰেকৰ্ড প্ৰকাশ কৰক", success: "ৰেকৰ্ড সফলতাৰে প্ৰকাশ কৰা হ'ল।" },
        ur: { title: "سپر ایڈمن کنسول", tab_dir: "شہری ڈائرکٹری", tab_rep: "رپورٹس کا نظم کریں", tab_reels: "ریلز کو معتدل کریں", tab_users: "صارف کی بنیاد", load: "سیکیورٹی کلیئرنس کی تصدیق کی جا رہی ہے۔۔۔", purge: "ریکارڈ حذف کریں", update: "پروفائل اپ ڈیٹ کریں", no_data: "ڈیٹا بیس میں کوئی ریکارڈ نہیں ملا۔", cat: "زمرہ:", desc: "تفصیل:", author: "مصنف:", role: "کردار:", tut_title: "محفوظ ایڈمن گیٹ وے", tut_desc: "شہر کے آپریشنز اور ہنگامی رابطوں کا نظم کریں۔", start: "لاگ ان کریں", login_title: "منتظم توثیق", email: "ایڈمن ای میل", pass: "پاس ورڈ", btn_login: "کنسول تک رسائی حاصل کریں", dept: "محکمہ کا نام", phone: "رابطہ نمبر", add_contact: "رابطہ ریکارڈ شائع کریں", success: "ریکارڈ کامیابی کے ساتھ شائع ہو گیا۔" },
        bho: { title: "सुपर एडमिन कंसोल", tab_dir: "नागरिक निर्देशिका", tab_rep: "रिपोर्ट प्रबंधित करीं", tab_reels: "रील्स मॉडरेट करीं", tab_users: "उपयोगकर्ता आधार", load: "सुरक्षा मंजूरी सत्यापित हो रहल बा...", purge: "रिकॉर्ड मिटाईं", update: "प्रोफ़ाइल अपडेट करीं", no_data: "डेटाबेस में कवनो रिकॉर्ड ना मिलल।", cat: "श्रेणी:", desc: "विवरण:", author: "लेखक:", role: "भूमिका:", tut_title: "सुरक्षित एडमिन गेटवे", tut_desc: "शहर के संचालन आ आपातकालीन संपर्क के प्रबंधन करीं।", start: "लॉगिन करीं", login_title: "प्रशासक प्रमाणीकरण", email: "एडमिन ईमेल", pass: "पासवर्ड", btn_login: "कंसोल एक्सेस करीं", dept: "विभाग के नाम", phone: "संपर्क नंबर", add_contact: "संपर्क रिकॉर्ड प्रकाशित करीं", success: "रिकॉर्ड सफलतापूर्वक प्रकाशित भइल।" }
    };

    const currentT = t[lang] || t['en'];

    // Login Submission
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setLoginError("Invalid credentials or unauthorized clearance.");
        }
    };

    // Add Civic Directory Record
    const handleAddDirectoryRecord = async (e) => {
        e.preventDefault();
        if (!deptName || !phone) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'civic_directory'), {
                departmentName: deptName.trim(),
                category: category.trim(),
                phoneNumber: phone.trim(),
                description: description.trim(),
                createdAt: serverTimestamp()
            });
            setDeptName('');
            setPhone('');
            setDescription('');
            alert(currentT.success);
        } catch (err) {
            console.error("Failed to publish record:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Action Execution Methods
    const handlePurgeReport = async (id) => {
        if (window.confirm("Execute absolute purge on this report?")) {
            await deleteDoc(doc(db, 'nagrik_reports', id));
        }
    };

    const handlePurgeReel = async (id) => {
        if (window.confirm("Execute absolute purge on this reel?")) {
            await deleteDoc(doc(db, 'nagrik_reels', id));
        }
    };

    const handleUpdateUserStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        if (window.confirm(`Update user status to ${newStatus.toUpperCase()}?`)) {
            await updateDoc(doc(db, 'users', id), { status: newStatus });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center text-[#FFFFFF]">
                <Shield size={48} className="text-[#00897B] mb-4 animate-pulse" />
                <span className="font-bold tracking-widest uppercase text-[0.9rem]">{currentT.load}</span>
            </div>
        );
    }

    // TUTORIAL SCREEN WITH LANDSCAPE, BIRDS, BUILDINGS, AND CLOUD ANIMATIONS
    if (step === 'tutorial') {
        return (
            <div className="min-h-screen bg-[#00897B] flex flex-col justify-between relative overflow-hidden font-sans select-none">
                
                {/* Animated Clouds Background */}
                <motion.div 
                    animate={{ x: [-100, 400] }} 
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                    className="absolute top-12 left-0 w-32 h-10 bg-white/20 rounded-full blur-md"
                />
                <motion.div 
                    animate={{ x: [300, -150] }} 
                    transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
                    className="absolute top-24 right-0 w-48 h-14 bg-white/15 rounded-full blur-lg"
                />

                {/* Animated Birds */}
                <motion.div 
                    animate={{ x: [-50, 500], y: [-20, 20] }} 
                    transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
                    className="absolute top-32 left-10 text-white/60 font-black text-lg"
                >
                    v v
                </motion.div>

                {/* Content Header */}
                <div className="px-8 pt-16 z-20 max-w-lg mx-auto text-center">
                    <span className="inline-block p-4 bg-white/10 rounded-2xl text-white mb-6 backdrop-blur-sm border border-white/20 shadow-lg">
                        <Lock size={36} strokeWidth={2} />
                    </span>
                    <h1 className="text-[2.2rem] font-black text-white tracking-tight leading-tight mb-4">
                        {currentT.tut_title}
                    </h1>
                    <p className="text-[1.05rem] font-medium text-white/80 leading-relaxed">
                        {currentT.tut_desc}
                    </p>
                </div>

                {/* Pixel Perfect SVG Landscape & Buildings */}
                <div className="relative w-full h-[280px] z-10 flex items-end">
                    <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
                        {/* Background Hills */}
                        <path fill="#00695C" fillOpacity="0.5" d="M0,192L48,181.3C96,171,192,149,288,160C384,171,480,213,576,213.3C672,213,768,171,864,165.3C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        {/* Foreground Buildings */}
                        <path fill="#111111" fillOpacity="0.9" d="M0,256L60,240C120,224,240,192,360,197.3C480,203,600,245,720,240C840,235,960,181,1080,165.3C1200,149,1320,171,1380,181.3L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                    </svg>

                    {/* Action Button Container inside Landscape */}
                    <div className="absolute inset-x-0 bottom-10 px-8 z-30 max-w-md mx-auto">
                        <button 
                            onClick={() => isAdmin ? setStep('dashboard') : setStep('login')}
                            className="w-full bg-[#FFB300] text-[#111111] font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.3)] active:scale-95 transition-transform outline-none uppercase tracking-wider text-sm"
                        >
                            <span>{isAdmin ? "Skip to Dashboard" : currentT.start}</span>
                            <ArrowRight size={20} strokeWidth={3} />
                        </button>
                    </div>
                </div>

            </div>
        );
    }

    // LOGIN SCREEN
    if (step === 'login') {
        return (
            <div className="min-h-screen bg-[#FFFFFF] flex flex-col justify-center px-6 py-12 font-sans text-[#111111]">
                <div className="max-w-[400px] mx-auto w-full">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-[#00897B]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#00897B]">
                            <Shield size={32} strokeWidth={2} />
                        </div>
                        <h2 className="text-[1.8rem] font-black tracking-tight text-[#111111]">{currentT.login_title}</h2>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        {loginError && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl text-center">
                                {loginError}
                            </div>
                        )}
                        <input 
                            type="email" 
                            placeholder={currentT.email} 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="w-full bg-[#F9FAFB] border border-[#111111]/15 rounded-xl p-4 text-[0.95rem] outline-none focus:border-[#00897B] font-medium" 
                        />
                        <input 
                            type="password" 
                            placeholder={currentT.pass} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="w-full bg-[#F9FAFB] border border-[#111111]/15 rounded-xl p-4 text-[0.95rem] outline-none focus:border-[#00897B] font-medium" 
                        />
                        <button 
                            type="submit" 
                            className="w-full bg-[#111111] text-[#FFFFFF] font-black py-4 rounded-xl mt-2 active:scale-95 transition-transform tracking-wide uppercase text-sm shadow-lg"
                        >
                            {currentT.btn_login}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#111111] pb-32">
            
            {/* Admin Header */}
            <div className="bg-[#111111] text-[#FFFFFF] px-6 pt-12 pb-8 shadow-md border-b-4 border-[#FFB300]">
                <div className="max-w-[800px] mx-auto flex items-center gap-3">
                    <Shield size={28} className="text-[#FFB300]" />
                    <h1 className="text-[1.8rem] font-black tracking-tight uppercase">{currentT.title}</h1>
                </div>
            </div>

            <div className="max-w-[800px] mx-auto px-4 pt-6">
                
                {/* Navigation Tabs */}
                <div className="flex bg-[#111111]/5 rounded-xl p-1 mb-8 border border-[#111111]/10 overflow-x-auto no-scrollbar">
                    <button onClick={() => setActiveTab('directory')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-lg text-[0.85rem] font-bold transition-all outline-none ${activeTab === 'directory' ? 'bg-[#00897B] text-[#FFFFFF] shadow-md' : 'text-[#111111]/60'}`}>
                        <Building size={16} /> {currentT.tab_dir}
                    </button>
                    <button onClick={() => setActiveTab('reports')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-lg text-[0.85rem] font-bold transition-all outline-none ${activeTab === 'reports' ? 'bg-[#00897B] text-[#FFFFFF] shadow-md' : 'text-[#111111]/60'}`}>
                        <AlertTriangle size={16} /> {currentT.tab_rep}
                    </button>
                    <button onClick={() => setActiveTab('reels')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-lg text-[0.85rem] font-bold transition-all outline-none ${activeTab === 'reels' ? 'bg-[#00897B] text-[#FFFFFF] shadow-md' : 'text-[#111111]/60'}`}>
                        <Video size={16} /> {currentT.tab_reels}
                    </button>
                    <button onClick={() => setActiveTab('users')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-lg text-[0.85rem] font-bold transition-all outline-none ${activeTab === 'users' ? 'bg-[#00897B] text-[#FFFFFF] shadow-md' : 'text-[#111111]/60'}`}>
                        <Users size={16} /> {currentT.tab_users}
                    </button>
                </div>

                {/* Content Render Area */}
                <div className="flex flex-col gap-4">
                    
                    {/* DIRECTORY MANAGEMENT VIEW */}
                    {activeTab === 'directory' && (
                        <div className="flex flex-col gap-6">
                            {/* Data Entry Form */}
                            <div className="bg-[#F9FAFB] border border-[#111111]/10 rounded-2xl p-6 shadow-sm">
                                <h2 className="text-[1.1rem] font-black text-[#111111] mb-4 flex items-center gap-2">
                                    <Plus size={20} className="text-[#00897B]" /> {currentT.add_contact}
                                </h2>
                                <form onSubmit={handleAddDirectoryRecord} className="flex flex-col gap-4">
                                    <input 
                                        type="text" 
                                        placeholder={currentT.dept} 
                                        value={deptName} 
                                        onChange={(e) => setDeptName(e.target.value)} 
                                        required 
                                        className="w-full bg-[#FFFFFF] border border-[#111111]/15 rounded-xl p-3 text-[0.95rem] outline-none focus:border-[#00897B]" 
                                    />
                                    <select 
                                        value={category} 
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-[#FFFFFF] border border-[#111111]/15 rounded-xl p-3 text-[0.95rem] outline-none focus:border-[#00897B]"
                                    >
                                        <option value="Municipal">Municipal</option>
                                        <option value="Emergency">Emergency</option>
                                        <option value="Utilities">Utilities</option>
                                        <option value="Police">Police</option>
                                        <option value="Medical">Medical</option>
                                    </select>
                                    <input 
                                        type="tel" 
                                        placeholder={currentT.phone} 
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)} 
                                        required 
                                        className="w-full bg-[#FFFFFF] border border-[#111111]/15 rounded-xl p-3 text-[0.95rem] outline-none focus:border-[#00897B]" 
                                    />
                                    <textarea 
                                        placeholder={currentT.desc} 
                                        value={description} 
                                        onChange={(e) => setDescription(e.target.value)} 
                                        className="w-full bg-[#FFFFFF] border border-[#111111]/15 rounded-xl p-3 text-[0.95rem] outline-none focus:border-[#00897B] min-h-[80px]" 
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting} 
                                        className="w-full bg-[#00897B] text-[#FFFFFF] font-black py-3.5 rounded-xl active:scale-95 transition-transform disabled:opacity-50 uppercase tracking-wider text-sm shadow-md"
                                    >
                                        {isSubmitting ? "..." : currentT.add_contact}
                                    </button>
                                </form>
                            </div>

                            {/* Existing Records List */}
                            <div className="flex flex-col gap-3 mt-4">
                                <h3 className="text-[0.95rem] font-black text-[#111111]/60 uppercase tracking-wider">Live Directory Records ({directoryList.length})</h3>
                                {directoryList.length === 0 ? <p className="text-center font-bold text-[#111111]/50 mt-4">{currentT.no_data}</p> :
                                directoryList.map(item => (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={item.id} className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#111111]/10 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                        <div className="flex-1">
                                            <p className="text-[0.75rem] font-black text-[#00897B] uppercase tracking-wider mb-1">{item.category}</p>
                                            <h4 className="text-[1.05rem] font-black text-[#111111] mb-1">{item.departmentName}</h4>
                                            <p className="text-[0.85rem] font-bold text-[#111111]/70 flex items-center gap-1.5"><Phone size={14} className="text-[#00897B]" /> {item.phoneNumber}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* REPORTS VIEW */}
                    {activeTab === 'reports' && (
                        reports.length === 0 ? <p className="text-center font-bold text-[#111111]/50 mt-10">{currentT.no_data}</p> :
                        reports.map(report => (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={report.id} className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#111111]/10 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                <div className="flex-1">
                                    <p className="text-[0.75rem] font-black text-[#00897B] uppercase tracking-wider mb-1">{report.id}</p>
                                    <p className="text-[0.9rem] font-bold text-[#111111] mb-1"><span className="text-[#111111]/50">{currentT.cat}</span> {report.category}</p>
                                    <p className="text-[0.85rem] text-[#111111]/80 line-clamp-2">{report.description}</p>
                                </div>
                                <button onClick={() => handlePurgeReport(report.id)} className="shrink-0 bg-[#111111] text-[#FFFFFF] px-4 py-2 rounded-lg font-bold text-[0.8rem] flex items-center gap-2 hover:bg-[#FFB300] hover:text-[#111111] transition-colors outline-none">
                                    <Trash2 size={16} /> {currentT.purge}
                                </button>
                            </motion.div>
                        ))
                    )}

                    {/* REELS VIEW */}
                    {activeTab === 'reels' && (
                        reels.length === 0 ? <p className="text-center font-bold text-[#111111]/50 mt-10">{currentT.no_data}</p> :
                        reels.map(reel => (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={reel.id} className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#111111]/10 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                <div className="flex-1">
                                    <p className="text-[0.75rem] font-black text-[#00897B] uppercase tracking-wider mb-1">{reel.id}</p>
                                    <p className="text-[0.9rem] font-bold text-[#111111] mb-1"><span className="text-[#111111]/50">{currentT.author}</span> {reel.authorName}</p>
                                    <p className="text-[0.85rem] font-bold text-[#111111]"><span className="text-[#111111]/50">Title:</span> {reel.title}</p>
                                </div>
                                <button onClick={() => handlePurgeReel(reel.id)} className="shrink-0 bg-[#111111] text-[#FFFFFF] px-4 py-2 rounded-lg font-bold text-[0.8rem] flex items-center gap-2 hover:bg-[#FFB300] hover:text-[#111111] transition-colors outline-none">
                                    <Trash2 size={16} /> {currentT.purge}
                                </button>
                            </motion.div>
                        ))
                    )}

                    {/* USERS VIEW */}
                    {activeTab === 'users' && (
                        usersList.length === 0 ? <p className="text-center font-bold text-[#111111]/50 mt-10">{currentT.no_data}</p> :
                        usersList.map(user => (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={user.id} className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#111111]/10 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                <div className="flex-1">
                                    <p className="text-[0.75rem] font-black text-[#00897B] uppercase tracking-wider mb-1">{user.id}</p>
                                    <p className="text-[0.9rem] font-bold text-[#111111] mb-1">{user.name || user.email || 'Unknown User'}</p>
                                    <p className="text-[0.85rem] font-bold text-[#111111]/50 uppercase">{user.status || 'Active'}</p>
                                </div>
                                <button onClick={() => handleUpdateUserStatus(user.id, user.status)} className="shrink-0 bg-[#FFFFFF] border-2 border-[#111111] text-[#111111] px-4 py-2 rounded-lg font-bold text-[0.8rem] flex items-center gap-2 hover:bg-[#111111] hover:text-[#FFFFFF] transition-colors outline-none">
                                    <Edit2 size={16} /> {currentT.update}
                                </button>
                            </motion.div>
                        ))
                    )}

                </div>
            </div>
        </div>
    );
}