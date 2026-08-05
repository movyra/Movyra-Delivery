/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Public Dashboard displaying verified organizations and open service requests.
 * 
 * English: Public Dashboard.
 * Hindi: सार्वजनिक डैशबोर्ड।
 * Hinglish: Public Dashboard.
 * Marathi: सार्वजनिक डॅशबोर्ड.
 * Gujarati: જાહેર ડેશબોર્ડ.
 * Telugu: పబ్లిక్ డాష్‌బోర్డ్.
 * Tamil: பொது டாஷ்போர்டு.
 * Kannada: ಸಾರ್ವಜನಿಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್.
 * Malayalam: പബ്ലിക് ഡാഷ്ബോർഡ്.
 * Bengali: পাবলিক ড্যাশবোর্ড।
 * Punjabi: ਜਨਤਕ ਡੈਸ਼ਬੋਰਡ।
 * Odia: ସାର୍ବଜନୀନ ଡାସବୋର୍ଡ।
 * Assamese: ৰাজহুৱা ডেচবোৰ্ড।
 * Urdu: عوامی ڈیش بورڈ۔
 * Bhojpuri: सार्वजनिक डैशबोर्ड।
 */

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/auth';
// Correction for strict Firebase SDK import
import { getFirestore as getDb, collection as getCol, query as makeQuery, where as addWhere, onSnapshot as listenSnapshot } from 'firebase/firestore';
import { AppContext } from '../main';

const PUBLIC_TRANSLATIONS = {
  en: { title: "Public Dashboard", orgs: "Verified Organizations", cases: "Open Service Requests", joinOrg: "Register Organization", login: "System Login", loading: "Loading Real-Time Data...", noOrgs: "No verified organizations available.", noCases: "No open requests available." },
  hi: { title: "सार्वजनिक डैशबोर्ड", orgs: "सत्यापित संगठन", cases: "खुले सेवा अनुरोध", joinOrg: "संगठन पंजीकृत करें", login: "सिस्टम लॉगिन", loading: "डेटा लोड हो रहा है...", noOrgs: "कोई सत्यापित संगठन उपलब्ध नहीं है।", noCases: "कोई खुला अनुरोध उपलब्ध नहीं है।" },
  hinglish: { title: "Public Dashboard", orgs: "Verified Organizations", cases: "Open Service Requests", joinOrg: "Organization Register Karein", login: "System Login", loading: "Data load ho raha hai...", noOrgs: "Koi verified organization nahi hai.", noCases: "Koi open request nahi hai." },
  mr: { title: "सार्वजनिक डॅशबोर्ड", orgs: "सत्यापित संस्था", cases: "खुल्या सेवा विनंत्या", joinOrg: "संस्था नोंदणी करा", login: "सिस्टम लॉगिन", loading: "डेटा लोड होत आहे...", noOrgs: "कोणतीही सत्यापित संस्था उपलब्ध नाही.", noCases: "कोणतीही खुली विनंती उपलब्ध नाही." },
  gu: { title: "જાહેર ડેશબોર્ડ", orgs: "ચકાસાયેલ સંસ્થાઓ", cases: "ખુલ્લી સેવા વિનંતીઓ", joinOrg: "સંસ્થા નોંધણી કરો", login: "સિસ્ટમ લોગિન", loading: "ડેટા લોડ થઈ રહ્યો છે...", noOrgs: "કોઈ ચકાસાયેલ સંસ્થા ઉપલબ્ધ નથી.", noCases: "કોઈ ખુલ્લી વિનંતી ઉપલબ્ધ નથી." },
  te: { title: "పబ్లిక్ డాష్‌బోర్డ్", orgs: "ధృవీకరించబడిన సంస్థలు", cases: "తెరిచిన సేవా అభ్యర్థనలు", joinOrg: "సంస్థను నమోదు చేయండి", login: "సిస్టమ్ లాగిన్", loading: "డేటా లోడ్ అవుతోంది...", noOrgs: "ధృవీకరించబడిన సంస్థలు అందుబాటులో లేవు.", noCases: "తెరిచిన అభ్యర్థనలు అందుబాటులో లేవు." },
  ta: { title: "பொது டாஷ்போர்டு", orgs: "சரிபார்க்கப்பட்ட நிறுவனங்கள்", cases: "திறந்த சேவை கோரிக்கைகள்", joinOrg: "நிறுவனத்தை பதிவு செய்", login: "சிஸ்டம் உள்நுழைவு", loading: "தரவு ஏற்றப்படுகிறது...", noOrgs: "சரிபார்க்கப்பட்ட நிறுவனங்கள் எதுவும் இல்லை.", noCases: "திறந்த கோரிக்கைகள் எதுவும் இல்லை." },
  kn: { title: "ಸಾರ್ವಜನಿಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", orgs: "ಪರಿಶೀಲಿಸಿದ ಸಂಸ್ಥೆಗಳು", cases: "ತೆರೆದ ಸೇವಾ ವಿನಂತಿಗಳು", joinOrg: "ಸಂಸ್ಥೆಯನ್ನು ನೋಂದಾಯಿಸಿ", login: "ಸಿಸ್ಟಮ್ ಲಾಗಿನ್", loading: "ಡೇಟಾ ಲೋಡ್ ಆಗುತ್ತಿದೆ...", noOrgs: "ಯಾವುದೇ ಪರಿಶೀಲಿಸಿದ ಸಂಸ್ಥೆಗಳು ಲಭ್ಯವಿಲ್ಲ.", noCases: "ಯಾವುದೇ ತೆರೆದ ವಿನಂತಿಗಳು ಲಭ್ಯವಿಲ್ಲ." },
  ml: { title: "പബ്ലിക് ഡാഷ്ബോർഡ്", orgs: "സ്ഥിരീകരിച്ച സ്ഥാപനങ്ങൾ", cases: "തുറന്ന സേവന അഭ്യർത്ഥനകൾ", joinOrg: "സ്ഥാപനം രജിസ്റ്റർ ചെയ്യുക", login: "സിസ്റ്റം ലോഗിൻ", loading: "ഡാറ്റ ലോഡുചെയ്യുന്നു...", noOrgs: "സ്ഥിരീകരിച്ച സ്ഥാപനങ്ങൾ ലഭ്യമല്ല.", noCases: "തുറന്ന അഭ്യർത്ഥനകൾ ലഭ്യമല്ല." },
  bn: { title: "পাবলিক ড্যাশবোর্ড", orgs: "যাচাইকৃত প্রতিষ্ঠান", cases: "উন্মুক্ত সেবা অনুরোধ", joinOrg: "প্রতিষ্ঠান নিবন্ধন করুন", login: "সিস্টেম লগইন", loading: "ডেটা লোড হচ্ছে...", noOrgs: "কোনো যাচাইকৃত প্রতিষ্ঠান উপলব্ধ নেই।", noCases: "কোনো উন্মুক্ত অনুরোধ উপলব্ধ নেই।" },
  pa: { title: "ਜਨਤਕ ਡੈਸ਼ਬੋਰਡ", orgs: "ਤਸਦੀਕਸ਼ੁਦਾ ਸੰਸਥਾਵਾਂ", cases: "ਖੁੱਲ੍ਹੀਆਂ ਸੇਵਾ ਬੇਨਤੀਆਂ", joinOrg: "ਸੰਸਥਾ ਰਜਿਸਟਰ ਕਰੋ", login: "ਸਿਸਟਮ ਲਾਗਇਨ", loading: "ਡਾਟਾ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...", noOrgs: "ਕੋਈ ਤਸਦੀਕਸ਼ੁਦਾ ਸੰਸਥਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।", noCases: "ਕੋਈ ਖੁੱਲ੍ਹੀ ਬੇਨਤੀ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।" },
  or: { title: "ସାର୍ବଜନୀନ ଡାସବୋର୍ଡ", orgs: "ଯାଞ୍ଚ ହୋଇଥିବା ସଂସ୍ଥା", cases: "ଖୋଲା ସେବା ଅନୁରୋଧ", joinOrg: "ସଂସ୍ଥା ପଞ୍ଜିକରଣ କରନ୍ତୁ", login: "ସିଷ୍ଟମ୍ ଲଗଇନ୍", loading: "ଡାଟା ଲୋଡ୍ ହେଉଛି...", noOrgs: "କୌଣସି ଯାଞ୍ଚ ହୋଇଥିବା ସଂସ୍ଥା ଉପଲବ୍ଧ ନାହିଁ।", noCases: "କୌଣସି ଖୋଲା ଅନୁରୋଧ ଉପଲବ୍ଧ ନାହିଁ।" },
  as: { title: "ৰাজহুৱা ডেচবোৰ্ড", orgs: "প্ৰমাণীকৃত সংস্থাসমূহ", cases: "খোলা সেৱা অনুৰোধ", joinOrg: "সংস্থা পঞ্জীয়ন কৰক", login: "চিষ্টেম লগইন", loading: "ডাটা ল'ড হৈ আছে...", noOrgs: "কোনো প্ৰমাণীকৃত সংস্থা উপলব্ধ নাই।", noCases: "কোনো খোলা অনুৰোধ উপলব্ধ নাই।" },
  ur: { title: "عوامی ڈیش بورڈ", orgs: "تصدیق شدہ تنظیمیں", cases: "کھلی سروس کی درخواستیں", joinOrg: "تنظیم رجسٹر کریں", login: "سسٹم لاگ ان", loading: "ڈیٹا لوڈ ہو رہا ہے...", noOrgs: "کوئی تصدیق شدہ تنظیم دستیاب نہیں ہے۔", noCases: "کوئی کھلی درخواست دستیاب نہیں ہے۔" },
  bho: { title: "सार्वजनिक डैशबोर्ड", orgs: "सत्यापित संगठन", cases: "खुला सेवा अनुरोध", joinOrg: "संगठन पंजीकृत करीं", login: "सिस्टम लॉगिन", loading: "डेटा लोड हो रहल बा...", noOrgs: "कौनो सत्यापित संगठन उपलब्ध नइखे।", noCases: "कौनो खुला अनुरोध उपलब्ध नइखे।" }
};

export default function PublicDashboard() {
  const { language, colors } = useContext(AppContext);
  const navigate = useNavigate();
  const db = getDb();
  const currentLang = PUBLIC_TRANSLATIONS[language] || PUBLIC_TRANSLATIONS.en;

  const [organizations, setOrganizations] = useState([]);
  const [activeCases, setActiveCases] = useState([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [isLoadingCases, setIsLoadingCases] = useState(true);

  // Real-time Database Listener: Verified Organizations
  useEffect(() => {
    const orgQuery = makeQuery(
      getCol(db, 'users'), 
      addWhere('role', '==', 'organization'),
      addWhere('verificationStatus', '==', 'verified')
    );

    const unsubscribeOrgs = listenSnapshot(orgQuery, (snapshot) => {
      const orgData = [];
      snapshot.forEach((doc) => {
        orgData.push({ id: doc.id, ...doc.data() });
      });
      setOrganizations(orgData);
      setIsLoadingOrgs(false);
    }, (error) => {
      console.error(error);
      setIsLoadingOrgs(false);
    });

    return () => unsubscribeOrgs();
  }, [db]);

  // Real-time Database Listener: Open Public Service Requests
  useEffect(() => {
    const casesQuery = makeQuery(
      getCol(db, 'cases'),
      addWhere('status', '==', 'active'),
      addWhere('visibility', '==', 'public')
    );

    const unsubscribeCases = listenSnapshot(casesQuery, (snapshot) => {
      const casesData = [];
      snapshot.forEach((doc) => {
        casesData.push({ id: doc.id, ...doc.data() });
      });
      setActiveCases(casesData);
      setIsLoadingCases(false);
    }, (error) => {
      console.error(error);
      setIsLoadingCases(false);
    });

    return () => unsubscribeCases();
  }, [db]);

  const Header = () => (
    <div style={{ backgroundColor: colors.White, padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
      <h1 style={{ color: colors.Black, fontSize: '24px', fontWeight: '900', margin: 0 }}>
        {currentLang.title}
      </h1>
      <div style={{ display: 'flex', gap: '16px' }}>
        <button 
          onClick={() => navigate('/select-plan')}
          style={{ backgroundColor: colors.Primary, color: colors.White, padding: '12px 24px', borderRadius: '9999px', fontWeight: '700', border: 'none', cursor: 'pointer' }}
        >
          {currentLang.joinOrg}
        </button>
        <button 
          onClick={() => navigate('/login')}
          style={{ backgroundColor: colors.Black, color: colors.White, padding: '12px 24px', borderRadius: '9999px', fontWeight: '700', border: 'none', cursor: 'pointer' }}
        >
          {currentLang.login}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {/* Organizations Section */}
        <section>
          <h2 style={{ color: colors.Black, fontSize: '20px', fontWeight: '800', marginBottom: '24px', borderLeft: `4px solid ${colors.Success}`, paddingLeft: '12px' }}>
            {currentLang.orgs}
          </h2>
          
          {isLoadingOrgs ? (
            <div style={{ color: colors.Primary, fontWeight: '600' }}>{currentLang.loading}</div>
          ) : organizations.length === 0 ? (
            <div style={{ backgroundColor: colors.White, padding: '24px', borderRadius: '16px', color: colors.Black, opacity: 0.6, fontWeight: '500' }}>
              {currentLang.noOrgs}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {organizations.map(org => (
                <div key={org.id} style={{ backgroundColor: colors.White, borderRadius: '24px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <h3 style={{ color: colors.Black, fontSize: '18px', fontWeight: '800', margin: 0 }}>{org.orgName}</h3>
                    <span style={{ backgroundColor: '#ECFDF5', color: colors.Success, padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700' }}>
                      Verified
                    </span>
                  </div>
                  <div style={{ color: colors.Black, opacity: 0.7, fontSize: '14px', fontWeight: '500' }}>
                    Plan: <span style={{ color: colors.Primary, fontWeight: '700' }}>{org.planTier}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Cases Section */}
        <section>
          <h2 style={{ color: colors.Black, fontSize: '20px', fontWeight: '800', marginBottom: '24px', borderLeft: `4px solid ${colors.Emergency}`, paddingLeft: '12px' }}>
            {currentLang.cases}
          </h2>
          
          {isLoadingCases ? (
            <div style={{ color: colors.Primary, fontWeight: '600' }}>{currentLang.loading}</div>
          ) : activeCases.length === 0 ? (
            <div style={{ backgroundColor: colors.White, padding: '24px', borderRadius: '16px', color: colors.Black, opacity: 0.6, fontWeight: '500' }}>
              {currentLang.noCases}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {activeCases.map(caseItem => (
                <div key={caseItem.id} style={{ backgroundColor: colors.White, borderRadius: '24px', padding: '24px', border: `1px solid ${colors.Emergency}40`, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ backgroundColor: '#FEF2F2', color: colors.Emergency, padding: '6px 16px', borderRadius: '9999px', fontSize: '14px', fontWeight: '800' }}>
                      {caseItem.type || 'Emergency'}
                    </span>
                  </div>
                  <p style={{ color: colors.Black, fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                    {caseItem.description}
                  </p>
                  <div style={{ color: colors.Black, opacity: 0.6, fontSize: '14px', fontWeight: '500' }}>
                    Location: {caseItem.location}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}