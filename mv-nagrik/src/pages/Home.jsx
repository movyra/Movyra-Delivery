import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Car, AlertTriangle, Trash2, Droplet, TreePine, Lightbulb, Zap, 
    Activity, Flame, MapPin, User, ShieldAlert, Volume2, BellRing, Database,
    Maximize2, Minimize2
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import useNearbyAlerts from '../hooks/useNearbyAlerts';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map View Auto-Updater
function ChangeView({ center, zoom }) {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

// Strict 4-Color Custom Marker Generator based on Category
const createCustomIcon = (category) => {
    let color = '#00897B'; // Primary Default
    if (category?.includes('emergency')) color = '#D32F2F'; // Retained for emergency standard, mapped to primary context
    if (category?.includes('emergency') || category === 'accident') color = '#FFB300'; // Accent Override
    if (category?.includes('garbage') || category?.includes('traffic')) color = '#111111'; // Black

    // Using a generic pin shape, color-coded strictly by category
    const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
    `;
    return L.divIcon({
        className: 'custom-leaflet-icon',
        html: svgString,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

export default function Home() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [currentLocation, setCurrentLocation] = useState('');
    const [isLocating, setIsLocating] = useState(true);
    const [recentIncidents, setRecentIncidents] = useState([]);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    
    // Map State
    const [mapReports, setMapReports] = useState([]);
    const [userCoords, setUserCoords] = useState([20.5937, 78.9629]); // Default India Center
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);
    const mapContainerRef = useRef(null);

    // Initialize 5km Proximity Background Radar
    useNearbyAlerts();

    // Leaflet CSS Injection
    useEffect(() => {
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }
    }, []);

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

    // Real-Time GPS Tracking & Super Admin Verification
    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged(user => {
            if (user && user.email === 'testcodecfg@gmail.com') {
                setIsSuperAdmin(true);
            } else {
                setIsSuperAdmin(false);
            }
        });

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    setUserCoords([lat, lon]);
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                        const data = await response.json();
                        const localArea = data.address.suburb || data.address.city_district || data.address.city || data.address.town || "Unknown Area";
                        const stateRegion = data.address.state || data.address.region || "";
                        setCurrentLocation(`${localArea}${stateRegion ? `, ${stateRegion}` : ''}`);
                    } catch (error) {
                        setCurrentLocation(currentT.loc_denied);
                    } finally {
                        setIsLocating(false);
                    }
                },
                (error) => {
                    setCurrentLocation(currentT.loc_denied);
                    setIsLocating(false);
                },
                { timeout: 10000 }
            );
        } else {
            setCurrentLocation(currentT.loc_denied);
            setIsLocating(false);
        }

        // Fetching Incidents for Ticker & Map Box
        const q = query(collection(db, 'nagrik_reports'), orderBy('createdAt', 'desc'), limit(50));
        const unsubscribeIncidents = onSnapshot(q, (snapshot) => {
            const incidents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRecentIncidents(incidents.slice(0, 3)); // Top 3 for Ticker
            setMapReports(incidents); // All 50 for Map Box
        });

        return () => {
            unsubscribeAuth();
            unsubscribeIncidents();
        };
    }, []);

    // 15 Comprehensive Indian Language Translations
    const t = {
        en: { title_main: "Choose a ", title_highlight: "Category", sub_main: "Report with ease.", sub_desc: "From emergencies to everyday issues.", loc_label: "Reporting from", loc_fetching: "Identifying location...", loc_denied: "Location access restricted", cat_traffic: "Traffic Violation", cat_accident: "Accident", cat_garbage: "Illegal Dumping", cat_water: "Damaged Water Pipe", cat_park: "Public Park Damage", cat_light: "Street Light", cat_cable: "Loose Cable", em_title: "Emergency Services", em_amb: "Ambulance", em_fire: "Fire", inc_title: "Active Local Incidents", admin_title: "Super Admin Control", admin_test_audio: "Test Alert Audio", admin_test_push: "Test Push Notification", admin_wipe: "Purge Test Data", map_title: "Incident Radar", rep_by: "Reported by:", contact: "Contact:", anon_masked: "Identity Masked (Public View)", del_btn: "Delete Pin", push_update: "Official Update" },
        hi: { title_main: "चुनें एक ", title_highlight: "श्रेणी", sub_main: "आसानी से रिपोर्ट करें।", sub_desc: "आपात स्थिति से लेकर रोजमर्रा की समस्याओं तक।", loc_label: "यहाँ से रिपोर्ट कर रहे हैं", loc_fetching: "स्थान खोज रहे हैं...", loc_denied: "स्थान पहुंच प्रतिबंधित है", cat_traffic: "यातायात उल्लंघन", cat_accident: "दुर्घटना", cat_garbage: "अवैध डंपिंग", cat_water: "क्षतिग्रस्त पाइप", cat_park: "पार्क का नुकसान", cat_light: "स्ट्रीट लाइट", cat_cable: "खुला केबल", em_title: "आपातकालीन सेवाएं", em_amb: "एम्बुलेंस", em_fire: "आग", inc_title: "सक्रिय स्थानीय घटनाएँ", admin_title: "सुपर एडमिन नियंत्रण", admin_test_audio: "परीक्षण ऑडियो अलर्ट", admin_test_push: "परीक्षण पुश अधिसूचना", admin_wipe: "परीक्षण डेटा मिटाएं", map_title: "घटना रडार", rep_by: "द्वारा दर्ज:", contact: "संपर्क:", anon_masked: "पहचान छिपी हुई", del_btn: "पिन हटाएं", push_update: "आधिकारिक अपडेट" },
        hinglish: { title_main: "Choose a ", title_highlight: "Category", sub_main: "Aasani se report karein.", sub_desc: "Emergency se daily issues tak.", loc_label: "Yahan se report kar rahe hain", loc_fetching: "Location dhoondh rahe hain...", loc_denied: "Location access denied", cat_traffic: "Traffic Violation", cat_accident: "Accident", cat_garbage: "Illegal Dumping", cat_water: "Damaged Pipe", cat_park: "Park Damage", cat_light: "Street Light", cat_cable: "Loose Cable", em_title: "Emergency Services", em_amb: "Ambulance", em_fire: "Fire", inc_title: "Active Local Incidents", admin_title: "Super Admin Control", admin_test_audio: "Test Alert Audio", admin_test_push: "Test Push Notification", admin_wipe: "Purge Test Data", map_title: "Incident Radar", rep_by: "Reported by:", contact: "Contact:", anon_masked: "Identity Masked", del_btn: "Delete Pin", push_update: "Official Update" },
        mr: { title_main: "निवडा एक ", title_highlight: "श्रेणी", sub_main: "सहजतेने तक्रार करा.", sub_desc: "आणीबाणीपासून दररोजच्या समस्यांपर्यंत.", loc_label: "येथून तक्रार करत आहे", loc_fetching: "स्थान शोधत आहे...", loc_denied: "स्थान प्रवेश प्रतिबंधित", cat_traffic: "वाहतूक उल्लंघन", cat_accident: "अपघात", cat_garbage: "बेकायदेशीर डंपिंग", cat_water: "खराब झालेला पाईप", cat_park: "उद्यानाचे नुकसान", cat_light: "पथदिवे", cat_cable: "सैल केबल", em_title: "आपत्कालीन सेवा", em_amb: "रुग्णवाहिका", em_fire: "आग", inc_title: "सक्रिय स्थानिक घटना", admin_title: "सुपर अॅडमिन नियंत्रण", admin_test_audio: "ऑडिओ अलर्ट तपासा", admin_test_push: "पुश सूचना तपासा", admin_wipe: "चाचणी डेटा पुसून टाका", map_title: "घटना रडार", rep_by: "नोंदवणारे:", contact: "संपर्क:", anon_masked: "ओळख लपविली", del_btn: "पिन हटवा", push_update: "अधिकृत अपडेट" },
        gu: { title_main: "પસંદ કરો એક ", title_highlight: "શ્રેણી", sub_main: "સરળતાથી રિપોર્ટ કરો.", sub_desc: "કટોકટીથી લઈને રોજિંદા સમસ્યાઓ સુધી.", loc_label: "અહીંથી રિપોર્ટ કરી રહ્યા છીએ", loc_fetching: "સ્થાન શોધી રહ્યા છીએ...", loc_denied: "સ્થાન ઍક્સેસ પ્રતિબંધિત", cat_traffic: "ટ્રાફિક ઉલ્લંઘન", cat_accident: "અકસ્માત", cat_garbage: "ગેરકાયદેસર ડમ્પિંગ", cat_water: "ક્ષતિગ્રસ્ત પાઇપ", cat_park: "પાર્ક નુકસાન", cat_light: "સ્ટ્રીટ લાઇટ", cat_cable: "છૂટો કેબલ", em_title: "કટોકટી સેવાઓ", em_amb: "એમ્બ્યુલન્સ", em_fire: "આગ", inc_title: "સક્રિય સ્થાનિક ઘટનાઓ", admin_title: "સુપર એડમિન નિયંત્રણ", admin_test_audio: "ઑડિઓ ચેતવણીનું પરીક્ષણ કરો", admin_test_push: "પુશ સૂચનાનું પરીક્ષણ કરો", admin_wipe: "પરીક્ષણ ડેટા ભૂંસી નાખો", map_title: "ઘટના રડાર", rep_by: "દ્વારા રિપોર્ટ:", contact: "સંપર્ક:", anon_masked: "ઓળખ છુપાયેલ", del_btn: "પિન કાઢી નાખો", push_update: "સત્તાવાર અપડેટ" },
        te: { title_main: "ఎంచుకోండి ఒక ", title_highlight: "వర్గాన్ని", sub_main: "సులభంగా నివేదించండి.", sub_desc: "అత్యవసరాల నుండి రోజువారీ సమస్యల వరకు.", loc_label: "ఇక్కడి నుండి నివేదిస్తున్నారు", loc_fetching: "స్థానాన్ని కనుగొంటున్నాము...", loc_denied: "స్థాన యాక్సెస్ నిరాకరించబడింది", cat_traffic: "ట్రాఫిక్ ఉల్లంఘన", cat_accident: "ప్రమాదం", cat_garbage: "అక్రమ డంపింగ్", cat_water: "దెబ్బతిన్న పైపు", cat_park: "పార్క్ నష్టం", cat_light: "వీధి దీపం", cat_cable: "వదులుగా ఉన్న కేబుల్", em_title: "అత్యవసర సేవలు", em_amb: "అంబులెన్స్", em_fire: "అగ్నిమాపక", inc_title: "క్రియాశీల స్థానిక సంఘటనలు", admin_title: "సూపర్ అడ్మిన్ నియంత్రణ", admin_test_audio: "ఆడియో హెచ్చరికను పరీక్షించండి", admin_test_push: "పుష్ నోటిఫికేషన్‌ను పరీక్షించండి", admin_wipe: "పరీక్ష డేటాను తుడిచివేయండి", map_title: "సంఘటన రాడార్", rep_by: "నివేదించిన వారు:", contact: "సంప్రదించండి:", anon_masked: "గుర్తింపు దాచబడింది", del_btn: "పిన్ తొలగించండి", push_update: "అధికారిక నవీకరణ" },
        ta: { title_main: "தேர்ந்தெடு ஒரு ", title_highlight: "வகையை", sub_main: "எளிதாகப் புகாரளிக்கவும்.", sub_desc: "அவசரநிலைகள் முதல் அன்றாடப் பிரச்சினைகள் வரை.", loc_label: "இங்கிருந்து புகாரளிக்கிறது", loc_fetching: "இருப்பிடத்தைத் தேடுகிறது...", loc_denied: "இருப்பிட அணுகல் மறுக்கப்பட்டது", cat_traffic: "போக்குவரத்து மீறல்", cat_accident: "விபத்து", cat_garbage: "சட்டவிரோத குப்பை", cat_water: "சேதமடைந்த குழாய்", cat_park: "பூங்கா சேதம்", cat_light: "தெரு விளக்கு", cat_cable: "தளர்வான கேபிள்", em_title: "அவசர சேவைகள்", em_amb: "ஆம்புலன்ஸ்", em_fire: "தீ", inc_title: "செயலில் உள்ள உள்ளூர் நிகழ்வுகள்", admin_title: "சூப்பர் நிர்வாகி கட்டுப்பாடு", admin_test_audio: "ஆடியோ எச்சரிக்கையை சோதிக்கவும்", admin_test_push: "புஷ் அறிவிப்பை சோதிக்கவும்", admin_wipe: "சோதனை தரவை அழிக்கவும்", map_title: "நிகழ்வு ரேடார்", rep_by: "அறிக்கையிட்டவர்:", contact: "தொடர்பு:", anon_masked: "அடையாளம் மறைக்கப்பட்டது", del_btn: "பின்னை நீக்கு", push_update: "அதிகாரப்பூர்வ புதுப்பிப்பு" },
        kn: { title_main: "ಆಯ್ಕೆಮಾಡಿ ಒಂದು ", title_highlight: "ವರ್ಗವನ್ನು", sub_main: "ಸುಲಭವಾಗಿ ವರದಿ ಮಾಡಿ.", sub_desc: "ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಳಿಂದ ದೈನಂದಿನ সমস্যাಗಳವರೆಗೆ.", loc_label: "ಇಲ್ಲಿಂದ ವರದಿ ಮಾಡಲಾಗುತ್ತಿದೆ", loc_fetching: "ಸ್ಥಳವನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ...", loc_denied: "ಸ್ಥಳ ಪ್ರವೇಶ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ", cat_traffic: "ಸಂಚಾರ ಉಲ್ಲಂಘನೆ", cat_accident: "ಅಪಘಾತ", cat_garbage: "ಅಕ್ರಮ ಡಂಪಿಂಗ್", cat_water: "ಹಾನಿಗೊಳಗಾದ ಪೈಪ್", cat_park: "ಪಾರ್ಕ್ ಹಾನಿ", cat_light: "ಬೀದಿ ದೀಪ", cat_cable: "ಸಡಿಲವಾದ ಕೇಬಲ್", em_title: "ತುರ್ತು ಸೇವೆಗಳು", em_amb: "ಆಂಬ್ಯುಲೆನ್ಸ್", em_fire: "ಬೆಂಕಿ", inc_title: "ಸಕ್ರಿಯ ಸ್ಥಳೀಯ ಘಟನೆಗಳು", admin_title: "ಸೂಪರ್ ಅಡ್ಮಿನ್ ನಿಯಂತ್ರಣ", admin_test_audio: "ಆಡಿಯೊ ಎಚ್ಚರಿಕೆಯನ್ನು ಪರೀಕ್ಷಿಸಿ", admin_test_push: "ಪುಶ್ ಅಧಿಸೂಚನೆಯನ್ನು ಪರೀಕ್ಷಿಸಿ", admin_wipe: "ಪರೀಕ್ಷಾ ಡೇಟಾವನ್ನು ಅಳಿಸಿ", map_title: "ಘಟನೆ ರಾಡಾರ್", rep_by: "ವರದಿ ಮಾಡಿದವರು:", contact: "ಸಂಪರ್ಕಿಸಿ:", anon_masked: "ಗುರುತನ್ನು ಮರೆಮಾಡಲಾಗಿದೆ", del_btn: "ಪಿನ್ ಅಳಿಸಿ", push_update: "ಅಧಿಕೃತ ನವೀಕರಣ" },
        ml: { title_main: "തിരഞ്ഞെടുക്കുക ഒരു ", title_highlight: "വിഭാഗം", sub_main: "എളുപ്പത്തിൽ റിപ്പോർട്ട് ചെയ്യുക.", sub_desc: "അത്യാഹിതങ്ങൾ മുതൽ ദൈനംദിന പ്രശ്നങ്ങൾ വരെ.", loc_label: "ഇവിടെ നിന്ന് റിപ്പോർട്ട് ചെയ്യുന്നു", loc_fetching: "സ്ഥലം കണ്ടെത്തുന്നു...", loc_denied: "ലൊക്കേഷൻ ആക്സസ് പരിമിതപ്പെടുത്തി", cat_traffic: "ഗതാഗത ലംഘനം", cat_accident: "അപകടം", cat_garbage: "അനധികൃത ഡംപിംഗ്", cat_water: "തകർന്ന പൈപ്പ്", cat_park: "പാർക്ക് നാശം", cat_light: "തെരുവ് വിളക്ക്", cat_cable: "അയഞ്ഞ കേബിൾ", em_title: "അടിയന്തര സേവനങ്ങൾ", em_amb: "ആംബുലൻസ്", em_fire: "തീ", inc_title: "സജീവമായ പ്രാദേശിക സംഭവങ്ങൾ", admin_title: "സൂപ്പർ അഡ്മിൻ നിയന്ത്രണം", admin_test_audio: "ഓഡിയോ അലർട്ട് പരിശോധിക്കുക", admin_test_push: "പുഷ് അറിയിപ്പ് പരിശോധിക്കുക", admin_wipe: "ടെസ്റ്റ് ഡാറ്റ മായ്‌ക്കുക", map_title: "സംഭവ റഡാർ", rep_by: "റിപ്പോർട്ട് ചെയ്തത്:", contact: "ബന്ധപ്പെടുക:", anon_masked: "ഐഡന്റിറ്റി മറച്ചു", del_btn: "പിൻ ഇല്ലാതാക്കുക", push_update: "ഔദ്യോഗിക അപ്ഡേറ്റ്" },
        bn: { title_main: "বেছে নিন একটি ", title_highlight: "বিভাগ", sub_main: "সহজে রিপোর্ট করুন।", sub_desc: "জরুরি অবস্থা থেকে দৈনন্দিন সমস্যা পর্যন্ত।", loc_label: "এখান থেকে রিপোর্ট করছেন", loc_fetching: "অবস্থান খুঁজছি...", loc_denied: "অবস্থান অ্যাক্সেস সীমাবদ্ধ", cat_traffic: "ট্রাফিক লঙ্ঘন", cat_accident: "দুর্ঘটনা", cat_garbage: "অবৈধ ডাম্পিং", cat_water: "ক্ষতিগ্রস্ত পাইপ", cat_park: "পার্কের ক্ষতি", cat_light: "রাস্তার আলো", cat_cable: "আলগা তার", em_title: "জরুরি সেবা", em_amb: "অ্যাম্বুলেন্স", em_fire: "আগুন", inc_title: "সক্রিয় স্থানীয় ঘটনা", admin_title: "সুপার অ্যাডমিন নিয়ন্ত্রণ", admin_test_audio: "অডিও অ্যালার্ট পরীক্ষা করুন", admin_test_push: "পুশ বিজ্ঞপ্তি পরীক্ষা করুন", admin_wipe: "পরীক্ষা ডেটা মুছুন", map_title: "ঘটনা রাডার", rep_by: "রিপোর্ট করেছেন:", contact: "যোগাযোগ:", anon_masked: "পরিচয় লুকানো", del_btn: "পিন মুছুন", push_update: "অফিসিয়াল আপডেট" },
        pa: { title_main: "ਚੁਣੋ ਇੱਕ ", title_highlight: "ਸ਼੍ਰੇਣੀ", sub_main: "ਆਸਾਨੀ ਨਾਲ ਰਿਪੋਰਟ ਕਰੋ।", sub_desc: "ਐਮਰਜੈਂਸੀ ਤੋਂ ਲੈ ਕੇ ਰੋਜ਼ਾਨਾ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ ਤੱਕ।", loc_label: "ਇੱਥੋਂ ਰਿਪੋਰਟ ਕਰ ਰਹੇ ਹਾਂ", loc_fetching: "ਸਥਾਨ ਲੱਭ ਰਹੇ ਹਾਂ...", loc_denied: "ਸਥਾਨ ਪਹੁੰਚ ਪ੍ਰਤੀਬੰਧਿਤ ਹੈ", cat_traffic: "ਟ੍ਰੈਫਿਕ ਉਲੰਘਣਾ", cat_accident: "ਹਾਦਸਾ", cat_garbage: "ਗੈਰ-ਕਾਨੂੰਨੀ ਡੰਪਿੰਗ", cat_water: "ਖਰਾਬ ਪਾਈਪ", cat_park: "ਪਾਰਕ ਦਾ ਨੁਕਸਾਨ", cat_light: "ਸਟ੍ਰੀਟ ਲਾਈਟ", cat_cable: "ਢਿੱਲੀ ਤਾਰ", em_title: "ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ", em_amb: "ਐਂਬੂਲੈਂਸ", em_fire: "ਅੱਗ", inc_title: "ਸਰਗਰਮ ਸਥਾਨਕ ਘਟਨਾਵਾਂ", admin_title: "ਸੁਪਰ ਐਡਮਿਨ ਕੰਟਰੋਲ", admin_test_audio: "ਆਡੀਓ ਅਲਰਟ ਦੀ ਜਾਂਚ ਕਰੋ", admin_test_push: "ਪੁਸ਼ ਸੂਚਨਾ ਦੀ ਜਾਂਚ ਕਰੋ", admin_wipe: "ਟੈਸਟ ਡਾਟਾ ਮਿਟਾਓ", map_title: "ਘਟਨਾ ਰਾਡਾਰ", rep_by: "ਦੁਆਰਾ ਰਿਪੋਰਟ:", contact: "ਸੰਪਰਕ:", anon_masked: "ਪਛਾਣ ਲੁਕਾਈ ਗਈ", del_btn: "ਪਿੰਨ ਮਿਟਾਓ", push_update: "ਅਧਿਕਾਰਤ ਅੱਪਡੇਟ" },
        or: { title_main: "ବାଛନ୍ତୁ ଗୋଟିଏ ", title_highlight: "ବର୍ଗ", sub_main: "ସହଜରେ ରିପୋର୍ଟ କରନ୍ତୁ।", sub_desc: "ଜରୁରୀକାଳୀନ ପରିସ୍ଥିତିରୁ ଦୈନନ୍ଦିନ ସମସ୍ୟା ପର୍ଯ୍ୟନ୍ତ।", loc_label: "ଏଠାରୁ ରିପୋର୍ଟ କରୁଛନ୍ତି", loc_fetching: "ସ୍ଥାନ ଖୋଜୁଛୁ...", loc_denied: "ସ୍ଥାନ ପ୍ରବେଶ ବାରଣ କରାଯାଇଛି", cat_traffic: "ଟ୍ରାଫିକ୍ ଉଲ୍ଲଂଘନ", cat_accident: "ଦୁର୍ଘଟଣା", cat_garbage: "ଅବୈଧ ଡମ୍ପିଂ", cat_water: "ନଷ୍ଟ ହୋଇଥିବା ପାଇପ୍", cat_park: "ପାର୍କ କ୍ଷତି", cat_light: "ଷ୍ଟ୍ରିଟ୍ ଲାଇଟ୍", cat_cable: "ଢିଲା ତାର", em_title: "ଜରୁରୀକାଳୀନ ସେବା", em_amb: "ଆମ୍ବୁଲାନ୍ସ", em_fire: "ନିଆଁ", inc_title: "ସକ୍ରିୟ ସ୍ଥାନୀୟ ଘଟଣା", admin_title: "ସୁପର ଆଡମିନ ନିୟନ୍ତ୍ରଣ", admin_test_audio: "ଅଡିଓ ଆଲର୍ଟ ପରୀକ୍ଷା କରନ୍ତୁ", admin_test_push: "ପୁଶ ବିଜ୍ଞପ୍ତି ପରୀକ୍ଷା କରନ୍ତୁ", admin_wipe: "ପରୀକ୍ଷା ଡାଟା ଲିଭାନ୍ତୁ", map_title: "ଘଟଣା ରାଡାର", rep_by: "ଦ୍ୱାରା ରିପୋର୍ଟ:", contact: "ଯୋଗାଯୋଗ:", anon_masked: "ପରିଚୟ ଲୁକ୍କାୟିତ", del_btn: "ପିନ୍ ଡିଲିଟ୍ କରନ୍ତୁ", push_update: "ଅଫିସିଆଲ୍ ଅପଡେଟ୍" },
        as: { title_main: "বাছনি কৰক এটা ", title_highlight: "শ্ৰেণী", sub_main: "সহজে ৰিপৰ্ট কৰক।", sub_desc: "জৰুৰী অৱস্থাৰ পৰা দৈনন্দিন সমস্যালৈকে।", loc_label: "ইয়াৰ পৰা ৰিপৰ্ট কৰিছে", loc_fetching: "অৱস্থান বিচাৰি আছোঁ...", loc_denied: "অৱস্থান প্ৰৱেশ বাধাগ্ৰস্ত", cat_traffic: "ট্ৰেফিক উলংঘন", cat_accident: "দুৰ্ঘটনা", cat_garbage: "অবৈধ ডাম্পিং", cat_water: "ক্ষতিগ্ৰস্ত পাইপ", cat_park: "পাৰ্কৰ ক্ষতি", cat_light: "ষ্ট্ৰীট লাইট", cat_cable: "ঢিলা তাঁৰ", em_title: "জৰুৰীকালীন সেৱা", em_amb: "এম্বুলেন্স", em_fire: "জুই", inc_title: "সক্ৰিয় স্থানীয় ঘটনা", admin_title: "ছুপাৰ এডমিন নিয়ন্ত্ৰণ", admin_test_audio: "অডিঅ' এলাৰ্ট পৰীক্ষা কৰক", admin_test_push: "পুশ্ব অধিসূচনা পৰীক্ষা কৰক", admin_wipe: "পৰীক্ষা ডাটা মচি পেলাওক", map_title: "ঘটনা ৰাডাৰ", rep_by: "দ্বাৰা ৰিপৰ্ট:", contact: "যোগাযোগ:", anon_masked: "পৰিচয় লুকুৱাই ৰখা হৈছে", del_btn: "পিন মচি পেলাওক", push_update: "চৰকাৰী আপডেট" },
        ur: { title_main: "منتخب کریں ایک ", title_highlight: "زمرہ", sub_main: "آسانی سے رپورٹ کریں۔", sub_desc: "ہنگامی حالات سے روزمرہ کے مسائل تک۔", loc_label: "یہاں سے رپورٹ کر رہے ہیں", loc_fetching: "مقام تلاش کر رہے ہیں۔۔۔", loc_denied: "مقام تک رسائی محدود ہے", cat_traffic: "ٹریفک کی خلاف ورزی", cat_accident: "حادثہ", cat_garbage: "غیر قانونی ڈمپنگ", cat_water: "خراب پائپ", cat_park: "پارک کا نقصان", cat_light: "اسٹریٹ لائٹ", cat_cable: "ڈھیلی تار", em_title: "ہنگامی خدمات", em_amb: "ایمبولینس", em_fire: "آگ", inc_title: "فعال مقامی واقعات", admin_title: "سپر ایڈمن کنٹرول", admin_test_audio: "آڈیو الرٹ کی جانچ کریں", admin_test_push: "پش نوٹیفکیشن کی جانچ کریں", admin_wipe: "ٹیسٹ ڈیٹا حذف کریں", map_title: "واقعہ ریڈار", rep_by: "کی طرف سے رپورٹ:", contact: "رابطہ:", anon_masked: "شناخت پوشیدہ", del_btn: "پن حذف کریں", push_update: "سرکاری اپ ڈیٹ" },
        bho: { title_main: "चुनीं एगो ", title_highlight: "श्रेणी", sub_main: "आसानी से रिपोर्ट करीं।", sub_desc: "आपात स्थिति से ले के रोजमर्रा के समस्या तक।", loc_label: "इहाँ से रिपोर्ट कर रहल बानी", loc_fetching: "स्थान खोज रहल बानी...", loc_denied: "स्थान पहुंच प्रतिबंधित बा", cat_traffic: "यातायात उल्लंघन", cat_accident: "दुर्घटना", cat_garbage: "अवैध डंपिंग", cat_water: "टूट गइल पाइप", cat_park: "पार्क के नुकसान", cat_light: "स्ट्रीट लाइट", cat_cable: "खुलल केबल", em_title: "आपातकालीन सेवा", em_amb: "एम्बुलेंस", em_fire: "आग", inc_title: "सक्रिय स्थानीय घटना", admin_title: "सुपर एडमिन नियंत्रण", admin_test_audio: "ऑडियो अलर्ट चेक करीं", admin_test_push: "पुश सूचना चेक करीं", admin_wipe: "टेस्ट डेटा मिटाईं", map_title: "घटना रडार", rep_by: "द्वारा दर्ज:", contact: "संपर्क:", anon_masked: "पहचान छिपल बा", del_btn: "पिन मिटाईं", push_update: "आधिकारिक अपडेट" }
    };

    const currentT = t[lang] || t['en'];

    const handleCategorySelect = (categoryId) => {
        navigate(`/report?category=${categoryId}`);
    };

    // Super Admin Execution Handlers
    const testAudioPlayback = () => {
        try {
            const audio = new Audio('/alert.mp3');
            audio.play();
        } catch (error) {
            console.error("Audio playback failed:", error);
        }
    };

    const testPushNotification = () => {
        if ("Notification" in window) {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("Admin Test", {
                        body: "Push notification system is operational.",
                        icon: "/logo-1.png"
                    });
                }
            });
        }
    };

    const purgeTestData = async () => {
        if (window.confirm("Purge all unverified test data?")) {
            const q = query(collection(db, 'nagrik_reports'), limit(10));
            const snapshot = await getDocs(q);
            snapshot.forEach(async (document) => {
                await deleteDoc(doc(db, 'nagrik_reports', document.id));
            });
            alert("Batch deletion executed via Admin Override.");
        }
    };

    const handleAdminDelete = async (reportId) => {
        if (window.confirm("Permanently delete this report and pin from the database?")) {
            await deleteDoc(doc(db, 'nagrik_reports', reportId));
            alert("Data purged successfully via Admin Override.");
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            mapContainerRef.current.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsMapFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsMapFullscreen(false);
        }
    };

    const floatingCategories = [
        { id: 'traffic', label: currentT.cat_traffic, icon: Car, size: 'large', float: 'animate-[float_4s_ease-in-out_infinite]' },
        { id: 'accident', label: currentT.cat_accident, icon: AlertTriangle, size: 'medium', float: 'animate-[float_5s_ease-in-out_infinite_0.5s]' },
        { id: 'garbage', label: currentT.cat_garbage, icon: Trash2, size: 'medium', float: 'animate-[float_4.5s_ease-in-out_infinite_1s]' },
        { id: 'water', label: currentT.cat_water, icon: Droplet, size: 'medium', float: 'animate-[float_5.5s_ease-in-out_infinite_0.2s]' },
        { id: 'park', label: currentT.cat_park, icon: TreePine, size: 'small', float: 'animate-[float_4s_ease-in-out_infinite_1.5s]' },
        { id: 'light', label: currentT.cat_light, icon: Lightbulb, size: 'small', float: 'animate-[float_6s_ease-in-out_infinite_0.8s]' },
        { id: 'cable', label: currentT.cat_cable, icon: Zap, size: 'small', float: 'animate-[float_5s_ease-in-out_infinite_0.3s]' },
    ];

    const emergencyServices = [
        { id: 'ambulance', label: currentT.em_amb, icon: Activity },
        { id: 'fire', label: currentT.em_fire, icon: Flame }
    ];

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#111111] pb-32">
            {/* Header Section (Strict 4-Color Adherence) */}
            <div className="px-6 pt-12 pb-6 max-w-[500px] mx-auto text-center flex flex-col items-center">
                <h1 className="text-[2.2rem] font-black leading-[1.1] tracking-tight mb-2 text-[#111111]">
                    {currentT.title_main} 
                    <span className="relative inline-block text-[#00897B] px-1 whitespace-nowrap">
                        {currentT.title_highlight}
                        {/* Strict Animated SVG Drawing Ellipse */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <motion.ellipse 
                                cx="50" cy="50" rx="55" ry="32" 
                                fill="none" stroke="#FFB300" strokeWidth="4"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                            />
                        </svg>
                    </span>
                    <br />
                    <span className="text-[#111111]">{currentT.sub_main}</span>
                </h1>
                <p className="text-[1.05rem] text-[#111111]/70 font-medium leading-relaxed max-w-[280px]">
                    {currentT.sub_desc}
                </p>
            </div>

            {/* Floating Grid Section */}
            <div className="px-4 py-8 max-w-[500px] mx-auto min-h-[350px] relative flex flex-wrap justify-center items-center gap-4 bg-[#FFFFFF]">
                {floatingCategories.map((cat, index) => {
                    let cardClasses = "bg-[#FFFFFF] shadow-[0_8px_20px_-6px_rgba(17,17,17,0.08)] flex flex-col items-center justify-center text-center cursor-pointer transition-transform active:scale-95 border border-[#111111]/10 outline-none ";
                    let iconSize = 24;
                    
                    if (cat.size === 'large') {
                        cardClasses += "w-[140px] h-[140px] rounded-[32px] p-4";
                        iconSize = 36;
                    } else if (cat.size === 'medium') {
                        cardClasses += "w-[110px] h-[110px] rounded-[24px] p-3";
                        iconSize = 28;
                    } else {
                        cardClasses += "w-[90px] h-[90px] rounded-[20px] p-2";
                        iconSize = 20;
                    }

                    return (
                        <motion.button
                            key={cat.id}
                            onClick={() => handleCategorySelect(cat.id)}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`${cardClasses} ${cat.float}`}
                        >
                            <cat.icon size={iconSize} className="text-[#00897B] mb-2" strokeWidth={2} />
                            <span className={`font-bold leading-tight text-[#111111] ${cat.size === 'small' ? 'text-[0.65rem]' : 'text-[0.8rem]'}`}>
                                {cat.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Real-Time Local Incident Ticker */}
            {recentIncidents.length > 0 && (
                <div className="px-6 mb-8 max-w-[500px] mx-auto">
                    <h3 className="text-[1.1rem] font-black text-[#111111] mb-3 flex items-center gap-2">
                        <Activity size={18} className="text-[#FFB300]" /> {currentT.inc_title}
                    </h3>
                    <div className="bg-[#FFB300]/10 border border-[#FFB300] rounded-2xl p-4 overflow-hidden relative">
                        <div className="flex flex-col gap-3">
                            <AnimatePresence>
                                {recentIncidents.map((incident) => (
                                    <motion.div 
                                        key={incident.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-3 border-b border-[#FFB300]/30 pb-3 last:border-0 last:pb-0"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-[#FFB300] animate-pulse shrink-0"></div>
                                        <span className="text-[0.85rem] font-bold text-[#111111] truncate flex-1">
                                            {incident.category} reported nearby
                                        </span>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}

            {/* Strict Interactive Boxed Map Component */}
            <div className="px-6 mb-8 max-w-[500px] mx-auto">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[1.1rem] font-black text-[#111111] flex items-center gap-2">
                        <MapPin size={18} className="text-[#00897B]" /> {currentT.map_title}
                    </h3>
                    <button onClick={toggleFullscreen} className="text-[#111111]/50 hover:text-[#111111] transition-colors outline-none">
                        {isMapFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                </div>
                
                <div 
                    ref={mapContainerRef}
                    className={`w-full bg-[#111111]/5 rounded-2xl overflow-hidden border border-[#111111]/10 relative shadow-sm ${isMapFullscreen ? 'h-screen rounded-none border-0' : 'h-[300px]'}`}
                >
                    <MapContainer center={userCoords} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                        <ChangeView center={userCoords} zoom={13} />
                        
                        {mapReports.map((report) => (
                            report.coordinates && (
                                <Marker 
                                    key={report.id} 
                                    position={report.coordinates} 
                                    icon={createCustomIcon(report.category)}
                                >
                                    <Popup className="custom-popup rounded-xl overflow-hidden">
                                        <div className="p-1 min-w-[150px]">
                                            <span className="inline-block px-2 py-1 bg-[#00897B] text-[#FFFFFF] text-[0.6rem] font-black uppercase tracking-wider rounded mb-2">
                                                {report.category.replace('emergency_', '')}
                                            </span>
                                            <p className="text-[0.8rem] font-medium text-[#111111] mb-2 leading-tight">
                                                {report.description || "No description provided."}
                                            </p>
                                            
                                            {/* Strict Identity Masking Logic */}
                                            <div className="bg-[#111111]/5 p-2 rounded border border-[#111111]/10">
                                                {isSuperAdmin ? (
                                                    <div className="text-[0.65rem] font-bold text-[#111111]">
                                                        <p>{currentT.rep_by} {report.guestName || report.reporterId}</p>
                                                        <p>{currentT.contact} {report.guestContact || 'N/A'}</p>
                                                    </div>
                                                ) : (
                                                    report.isAnonymous ? (
                                                        <p className="text-[0.65rem] font-bold text-[#111111]/50 italic">
                                                            {currentT.anon_masked}
                                                        </p>
                                                    ) : (
                                                        <p className="text-[0.65rem] font-bold text-[#111111]">
                                                            {currentT.rep_by} Citizen
                                                        </p>
                                                    )
                                                )}
                                            </div>

                                            {/* Super Admin Control Injection */}
                                            {isSuperAdmin && (
                                                <div className="mt-3 flex flex-col gap-1">
                                                    <button onClick={() => handleAdminDelete(report.id)} className="w-full bg-[#111111] text-[#FFFFFF] text-[0.7rem] font-bold py-1.5 rounded outline-none transition-colors hover:bg-[#111111]/80">
                                                        {currentT.del_btn}
                                                    </button>
                                                    <button className="w-full bg-transparent text-[#00897B] border border-[#00897B] text-[0.7rem] font-bold py-1.5 rounded outline-none transition-colors hover:bg-[#00897B]/10">
                                                        {currentT.push_update}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </MapContainer>
                </div>
            </div>

            {/* Bottom Content Area */}
            <div className="px-6 max-w-[500px] mx-auto">
                
                {/* Real-time Location Card */}
                <div className="bg-[#FFFFFF] rounded-2xl p-4 shadow-[0_4px_12px_-4px_rgba(17,17,17,0.05)] border border-[#111111]/10 flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#00897B]/10 flex items-center justify-center shrink-0">
                            <MapPin size={18} className="text-[#00897B]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[0.75rem] text-[#111111]/50 font-bold uppercase tracking-wider">{currentT.loc_label}</span>
                            <span className="text-[0.95rem] font-black text-[#111111] truncate max-w-[200px]">
                                {isLocating ? currentT.loc_fetching : currentLocation}
                            </span>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center shrink-0 cursor-pointer">
                        <User size={18} className="text-[#FFFFFF]" />
                    </div>
                </div>

                {/* Emergency Services */}
                <div className="mb-8">
                    <h3 className="text-[1.1rem] font-black text-[#111111] mb-4 flex items-center gap-2">
                        <ShieldAlert size={18} className="text-[#D32F2F]" /> {currentT.em_title}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {emergencyServices.map((service) => (
                            <button 
                                key={service.id}
                                onClick={() => handleCategorySelect(`emergency_${service.id}`)}
                                className="bg-[#FFFFFF] rounded-2xl p-5 shadow-[0_4px_12px_-4px_rgba(17,17,17,0.05)] border border-[#111111]/10 flex flex-col items-center justify-center gap-3 transition-transform active:scale-95 outline-none"
                            >
                                <div className="w-12 h-12 rounded-full bg-[#111111]/5 flex items-center justify-center">
                                    <service.icon size={24} className="text-[#111111]" strokeWidth={2.5} />
                                </div>
                                <span className="font-bold text-[0.9rem] text-[#111111]">{service.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Exclusive Super Admin Test Console */}
                {isSuperAdmin && (
                    <div className="bg-[#111111] rounded-[24px] p-6 shadow-2xl border border-[#FFFFFF]/10 mt-12 mb-8">
                        <h3 className="text-[1rem] font-black text-[#FFB300] mb-4 uppercase tracking-widest flex items-center gap-2">
                            <Database size={16} /> {currentT.admin_title}
                        </h3>
                        <div className="flex flex-col gap-3">
                            <button onClick={testAudioPlayback} className="w-full bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 text-[#FFFFFF] rounded-xl p-3 font-bold text-[0.9rem] flex items-center gap-3 transition-colors outline-none text-left">
                                <Volume2 size={18} className="text-[#00897B]" /> {currentT.admin_test_audio}
                            </button>
                            <button onClick={testPushNotification} className="w-full bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 text-[#FFFFFF] rounded-xl p-3 font-bold text-[0.9rem] flex items-center gap-3 transition-colors outline-none text-left">
                                <BellRing size={18} className="text-[#00897B]" /> {currentT.admin_test_push}
                            </button>
                            <button onClick={purgeTestData} className="w-full bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 text-[#FFFFFF] rounded-xl p-3 font-bold text-[0.9rem] flex items-center gap-3 transition-colors outline-none text-left">
                                <Trash2 size={18} className="text-[#D32F2F]" /> {currentT.admin_wipe}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}