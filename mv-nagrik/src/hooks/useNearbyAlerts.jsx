import { useEffect, useRef, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Mathematical Haversine Distance Calculator (Calculates shortest distance over the earth's surface)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
};

export default function useNearbyAlerts() {
    const [userLocation, setUserLocation] = useState(null);
    const processedAlerts = useRef(new Set());
    const isFirstLoad = useRef(true);

    // 15 Comprehensive Indian Language Translations for Push Notifications
    const getTranslations = () => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const t = {
            en: { title: "Nearby Incident Alert", body: "A new issue has been reported within 5km of your location." },
            hi: { title: "आसपास की घटना का अलर्ट", body: "आपके स्थान के 5 किमी के भीतर एक नई समस्या दर्ज की गई है।" },
            hinglish: { title: "Nearby Incident Alert", body: "Aapki location ke 5km ke andar nayi issue report hui hai." },
            mr: { title: "जवळपासच्या घटनेचा अलर्ट", body: "तुमच्या स्थानाच्या 5 किमी अंतरावर नवीन समस्या नोंदवली गेली आहे." },
            gu: { title: "નજીકની ઘટનાનું એલર્ટ", body: "તમારા સ્થાનના 5 કિમીની અંદર નવી સમસ્યા નોંધાઈ છે." },
            te: { title: "సమీప సంఘటన అలర్ట్", body: "మీ స్థానానికి 5 కి.మీ పరిధిలో కొత్త సమస్య నివేదించబడింది." },
            ta: { title: "அருகிலுள்ள நிகழ்வு அலர்ட்", body: "உங்கள் இருப்பிடத்திலிருந்து 5 கி.மீ-க்குள் புதிய சிக்கல் தெரிவிக்கப்பட்டுள்ளது." },
            kn: { title: "ಹತ್ತಿರದ ಘಟನೆ ಅಲರ್ಟ್", body: "ನಿಮ್ಮ ಸ್ಥಳದ 5 ಕಿಮೀ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಹೊಸ ಸಮಸ್ಯೆ ವರದಿಯಾಗಿದೆ." },
            ml: { title: "സമീപത്തുള്ള സംഭവ അലർട്ട്", body: "നിങ്ങളുടെ സ്ഥലത്തിന് 5 കിലോമീറ്ററിനുള്ളിൽ പുതിയ പ്രശ്നം റിപ്പോർട്ട് ചെയ്തു." },
            bn: { title: "কাছাকাছি ঘটনার অ্যালার্ট", body: "আপনার অবস্থানের ৫ কিমির মধ্যে নতুন সমস্যা রিপোর্ট করা হয়েছে।" },
            pa: { title: "ਨੇੜਲੀ ਘਟਨਾ ਦਾ ਅਲਰਟ", body: "ਤੁਹਾਡੇ ਸਥਾਨ ਦੇ 5 ਕਿਲੋਮੀਟਰ ਦੇ ਅੰਦਰ ਨਵੀਂ ਸਮੱਸਿਆ ਦਰਜ ਕੀਤੀ ਗਈ ਹੈ।" },
            or: { title: "ନିକଟସ୍ଥ ଘଟଣା ଆଲର୍ଟ", body: "ଆପଣଙ୍କ ସ୍ଥାନର 5 କିମି ମଧ୍ୟରେ ନୂଆ ସମସ୍ୟା ରିପୋର୍ଟ ହୋଇଛି।" },
            as: { title: "ওচৰৰ ঘটনাৰ এলাৰ্ট", body: "আপোনাৰ অৱস্থানৰ ৫ কিমিৰ ভিতৰত নতুন সমস্যা পঞ্জীয়ন কৰা হৈছে।" },
            ur: { title: "قریبی واقعے کا الرٹ", body: "آپ کے مقام کے 5 کلومیٹر کے اندر نیا مسئلہ درج کیا گیا ہے۔" },
            bho: { title: "आसपास के घटना अलर्ट", body: "राउर स्थान के 5 किमी के भीतर नया समस्या दर्ज भइल बा।" }
        };
        return t[savedLang] || t['en'];
    };

    // Initialize Notification Permissions
    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    }, []);

    // Continuous Live GPS Tracking
    useEffect(() => {
        if (!("geolocation" in navigator)) return;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
            },
            (error) => {
                console.warn("Location tracking disabled by user.");
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Real-Time Firestore Listener for New Reports
    useEffect(() => {
        const q = query(
            collection(db, 'nagrik_reports'),
            orderBy('createdAt', 'desc'),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            // Prevent alerting on historical data during the initial load component mount
            if (isFirstLoad.current) {
                isFirstLoad.current = false;
                snapshot.docs.forEach(doc => processedAlerts.current.add(doc.id));
                return;
            }

            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const report = change.doc.data();
                    const reportId = change.doc.id;

                    if (!processedAlerts.current.has(reportId) && userLocation && report.coordinates) {
                        processedAlerts.current.add(reportId);
                        
                        const distance = calculateDistance(
                            userLocation.lat,
                            userLocation.lon,
                            report.coordinates[0],
                            report.coordinates[1]
                        );

                        // 5 Kilometer Strict Threshold Breach Execution
                        if (distance <= 5.0) {
                            triggerSystemAlert();
                        }
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [userLocation]);

    const triggerSystemAlert = () => {
        const content = getTranslations();

        // Audio Execution Engine
        try {
            const audio = new Audio('/alert.mp3');
            audio.play().catch(e => console.warn("Audio playback blocked by browser policy. User interaction required first."));
        } catch (error) {
            console.warn("Audio engine failed to initialize.");
        }

        // Native Browser Push Notification Engine
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(content.title, {
                body: content.body,
                icon: "/logo-1.png",
                badge: "/logo-1.png"
            });
        }
    };
}