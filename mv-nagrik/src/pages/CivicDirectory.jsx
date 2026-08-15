import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // EXACT FIX: Updated import path to match your actual configuration file

// 15-Language Translation Dictionary
const t = {
  en: { title: "Civic Directory", loading: "Loading contacts...", error: "Failed to load contacts.", call: "Call Now", category: "Category" },
  hi: { title: "नागरिक निर्देशिका", loading: "संपर्क लोड हो रहे हैं...", error: "संपर्क लोड करने में विफल।", call: "कॉल करें", category: "श्रेणी" },
  hinglish: { title: "Civic Directory", loading: "Contacts load ho rahe hain...", error: "Load fail ho gaya.", call: "Call Karein", category: "Category" },
  mr: { title: "नागरिक निर्देशिका", loading: "संपर्क लोड होत आहेत...", error: "लोड करण्यात त्रुटी.", call: "कॉल करा", category: "श्रेणी" },
  gu: { title: "નાગરિક ડિરેક્ટરી", loading: "સંપર્કો લોડ થઈ રહ્યા છે...", error: "લોડ કરવામાં નિષ્ફળ.", call: "કૉલ કરો", category: "શ્રેણી" },
  te: { title: "పౌర డైరెక్టరీ", loading: "పరిచయాలు లోడ్ అవుతున్నాయి...", error: "లోడ్ విఫలమైంది.", call: "కాల్ చేయండి", category: "వర్గం" },
  ta: { title: "குடிமை அடைவு", loading: "தொடர்புகள் ஏற்றப்படுகின்றன...", error: "ஏற்றுவதில் தோல்வி.", call: "அழைக்க", category: "வகை" },
  kn: { title: "ನಾಗರಿಕ ಡೈರೆಕ್ಟರಿ", loading: "ಸಂಪರ್ಕಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...", error: "ಲೋಡ್ ವಿಫಲವಾಗಿದೆ.", call: "ಕರೆ ಮಾಡಿ", category: "ವರ್ಗ" },
  ml: { title: "സിവിക് ഡയറക്ടറി", loading: "കോൺടാക്റ്റുകൾ ലോഡുചെയ്യുന്നു...", error: "പരാജയപ്പെട്ടു.", call: "വിളിക്കുക", category: "വിഭാഗം" },
  bn: { title: "নাগরিক ডিরেক্টরি", loading: "পরিচিতি লোড হচ্ছে...", error: "ব্যর্থ হয়েছে।", call: "কল করুন", category: "বিভাগ" },
  pa: { title: "ਨਾਗਰਿਕ ਡਾਇਰੈਕਟਰੀ", loading: "ਸੰਪਰਕ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...", error: "ਅਸਫਲ।", call: "ਕਾਲ ਕਰੋ", category: "ਸ਼੍ਰੇਣੀ" },
  or: { title: "ନାଗରିକ ନିର୍ଦ୍ଦେଶିକା", loading: "ସମ୍ପର୍କ ଲୋଡ୍ ହେଉଛି...", error: "ବିଫଳ |", call: "କଲ୍ କରନ୍ତୁ", category: "ବିଭାଗ" },
  as: { title: "নাগৰিক নিৰ্দেশিকা", loading: "যোগাযোগসমূহ লোড কৰা হৈছে...", error: "বিফল।", call: "কল কৰক", category: "বিভাগ" },
  ur: { title: "شہری ڈائرکٹری", loading: "رابطے لوڈ ہو رہے ہیں۔۔۔", error: "ناکام۔", call: "کال کریں", category: "زمرہ" },
  bho: { title: "नागरिक निर्देशिका", loading: "संपर्क लोड हो रहल बा...", error: "विफल।", call: "कॉल करीं", category: "श्रेणी" }
};

export default function CivicDirectory() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    // Detect system or stored language
    const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
    if (t[savedLang]) {
      setLang(savedLang);
    }

    // Fetch real contact data from Firestore
    const fetchContacts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'civic_directory'));
        const directoryData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setContacts(directoryData);
        setLoading(false);
      } catch (err) {
        console.error("Database connection error:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-white">
        <p className="text-gray-600 font-medium text-lg animate-pulse">{t[lang].loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-white">
        <p className="text-red-600 font-medium text-lg">{t[lang].error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t[lang].title}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <div 
              key={contact.id} 
              className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 transition-all hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-gray-800">{contact.departmentName}</h2>
              <p className="text-sm text-gray-500 mt-1">
                <span className="font-medium">{t[lang].category}:</span> {contact.category}
              </p>
              <p className="text-gray-700 mt-2 line-clamp-2">{contact.description}</p>
              
              <a 
                href={`tel:${contact.phoneNumber}`}
                className="mt-4 w-full block text-center bg-[#00897B] text-white py-2 rounded font-medium transition-colors hover:bg-teal-700"
              >
                {t[lang].call} - {contact.phoneNumber}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}