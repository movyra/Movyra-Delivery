/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Organization Dashboard displaying service categories and active operations.
 * 
 * English: Organization Dashboard.
 * Hindi: संगठन डैशबोर्ड।
 * Hinglish: Organization Dashboard.
 * Marathi: संस्था डॅशबोर्ड.
 * Gujarati: સંસ્થા ડેશબોર્ડ.
 * Telugu: సంస్థ డాష్‌బోర్డ్.
 * Tamil: நிறுவன டாஷ்போர்டு.
 * Kannada: ಸಂಸ್ಥೆಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್.
 * Malayalam: സ്ഥാപന ഡാഷ്ബോർഡ്.
 * Bengali: প্রতিষ্ঠান ড্যাশবোর্ড।
 * Punjabi: ਸੰਸਥਾ ਡੈਸ਼ਬੋਰਡ।
 * Odia: ସଂସ୍ଥା ଡାସବୋର୍ଡ।
 * Assamese: সংস্থা ডেচবোৰ্ড।
 * Urdu: تنظیم کا ڈیش بورڈ۔
 * Bhojpuri: संगठन डैशबोर्ड।
 */

import React, { useState, useEffect, useContext } from 'react';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { AppContext } from '../main';
import { useAuth } from '../context/AuthContext';

const ORG_TRANSLATIONS = {
  en: { greeting: "Organization Dashboard", sub: "Manage your active operations", categories: "Service Categories", activeOps: "Active Operations", loading: "Fetching live operations...", empty: "No active operations currently.", create: "New Operation", medical: "Medical Support", medicalDesc: "Health assistance", fire: "Fire Safety", fireDesc: "Fire outbreak response", rescue: "Rescue Mission", rescueDesc: "Emergency extraction", food: "Food Supply", foodDesc: "Ration distribution" },
  hi: { greeting: "संगठन डैशबोर्ड", sub: "अपने सक्रिय संचालन प्रबंधित करें", categories: "सेवा श्रेणियाँ", activeOps: "सक्रिय संचालन", loading: "लाइव संचालन प्राप्त कर रहा है...", empty: "वर्तमान में कोई सक्रिय संचालन नहीं है।", create: "नया संचालन", medical: "चिकित्सा सहायता", medicalDesc: "स्वास्थ्य सहायता", fire: "अग्नि सुरक्षा", fireDesc: "आग प्रतिक्रिया", rescue: "बचाव मिशन", rescueDesc: "आपातकालीन निष्कर्षण", food: "खाद्य आपूर्ति", foodDesc: "राशन वितरण" },
  hinglish: { greeting: "Organization Dashboard", sub: "Apne active operations manage karein", categories: "Service Categories", activeOps: "Active Operations", loading: "Live operations fetch ho rahe hain...", empty: "Abhi koi active operation nahi hai.", create: "New Operation", medical: "Medical Support", medicalDesc: "Health assistance", fire: "Fire Safety", fireDesc: "Fire response", rescue: "Rescue Mission", rescueDesc: "Emergency extraction", food: "Food Supply", foodDesc: "Ration distribution" },
  mr: { greeting: "संस्था डॅशबोर्ड", sub: "तुमचे सक्रिय ऑपरेशन्स व्यवस्थापित करा", categories: "सेवा श्रेणी", activeOps: "सक्रिय ऑपरेशन्स", loading: "थेट ऑपरेशन्स मिळवत आहे...", empty: "सध्या कोणतेही सक्रिय ऑपरेशन्स नाहीत.", create: "नवीन ऑपरेशन", medical: "वैद्यकीय मदत", medicalDesc: "आरोग्य सहाय्य", fire: "अग्निसुरक्षा", fireDesc: "आग प्रतिसाद", rescue: "बचाव मोहीम", rescueDesc: "आणीबाणी सुटका", food: "अन्न पुरवठा", foodDesc: "रेशन वाटप" },
  gu: { greeting: "સંસ્થા ડેશબોર્ડ", sub: "તમારા સક્રિય ઓપરેશન્સનું સંચાલન કરો", categories: "સેવા શ્રેણીઓ", activeOps: "સક્રિય ઓપરેશન્સ", loading: "લાઇવ ઓપરેશન્સ લાવી રહ્યાં છે...", empty: "હાલમાં કોઈ સક્રિય ઓપરેશન્સ નથી.", create: "નવું ઓપરેશન", medical: "તબીબી સહાય", medicalDesc: "આરોગ્ય સહાય", fire: "અગ્નિ સલામતી", fireDesc: "આગ પ્રતિસાદ", rescue: "બચાવ મિશન", rescueDesc: "કટોકટી નિષ્કર્ષણ", food: "અન્ન પુરવઠો", foodDesc: "રાશન વિતરણ" },
  te: { greeting: "సంస్థ డాష్‌బోర్డ్", sub: "మీ క్రియాశీల కార్యకలాపాలను నిర్వహించండి", categories: "సేవా వర్గాలు", activeOps: "క్రియాశీల కార్యకలాపాలు", loading: "లైవ్ కార్యకలాపాలను పొందుతోంది...", empty: "ప్రస్తుతం క్రియాశీల కార్యకలాపాలు లేవు.", create: "కొత్త ఆపరేషన్", medical: "వైద్య మద్దతు", medicalDesc: "ఆరోగ్య సహాయం", fire: "అగ్ని భద్రత", fireDesc: "అగ్ని ప్రమాద స్పందన", rescue: "రెస్క్యూ మిషన్", rescueDesc: "అత్యవసర వెలికితీత", food: "ఆహార సరఫరా", foodDesc: "రేషన్ పంపిణీ" },
  ta: { greeting: "நிறுவன டாஷ்போர்டு", sub: "உங்கள் செயலில் உள்ள செயல்பாடுகளை நிர்வகிக்கவும்", categories: "சேவை வகைகள்", activeOps: "செயலில் உள்ள செயல்பாடுகள்", loading: "நேரடி செயல்பாடுகள் பெறப்படுகின்றன...", empty: "தற்போது செயலில் உள்ள செயல்பாடுகள் எதுவும் இல்லை.", create: "புதிய செயல்பாடு", medical: "மருத்துவ ஆதரவு", medicalDesc: "சுகாதார உதவி", fire: "தீ பாதுகாப்பு", fireDesc: "தீ வெடிப்பு பதில்", rescue: "மீட்பு பணி", rescueDesc: "அவசர மீட்பு", food: "உணவு வழங்கல்", foodDesc: "ரேஷன் விநியோகம்" },
  kn: { greeting: "ಸಂಸ್ಥೆಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", sub: "ನಿಮ್ಮ ಸಕ್ರಿಯ ಕಾರ್ಯಾಚರಣೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ", categories: "ಸೇವಾ ವರ್ಗಗಳು", activeOps: "ಸಕ್ರಿಯ ಕಾರ್ಯಾಚರಣೆಗಳು", loading: "ಲೈವ್ ಕಾರ್ಯಾಚರಣೆಗಳನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...", empty: "ಪ್ರಸ್ತುತ ಯಾವುದೇ ಸಕ್ರಿಯ ಕಾರ್ಯಾಚರಣೆಗಳಿಲ್ಲ.", create: "ಹೊಸ ಕಾರ್ಯಾಚರಣೆ", medical: "ವೈದ್ಯಕೀಯ ಬೆಂಬಲ", medicalDesc: "ಆರೋಗ್ಯ ನೆರವು", fire: "ಅಗ್ನಿ ಸುರಕ್ಷತೆ", fireDesc: "ಬೆಂಕಿ ಪ್ರತಿಕ್ರಿಯೆ", rescue: "ರಕ್ಷಣಾ ಕಾರ್ಯಾಚರಣೆ", rescueDesc: "ತುರ್ತು ಹೊರತೆಗೆಯುವಿಕೆ", food: "ಆಹಾರ ಪೂರೈಕೆ", foodDesc: "ಪಡಿತರ ವಿತರಣೆ" },
  ml: { greeting: "സ്ഥാപന ഡാഷ്ബോർഡ്", sub: "നിങ്ങളുടെ സജീവ പ്രവർത്തനങ്ങൾ നിയന്ത്രിക്കുക", categories: "സേവന വിഭാഗങ്ങൾ", activeOps: "സജീവ പ്രവർത്തനങ്ങൾ", loading: "തത്സമയ പ്രവർത്തനങ്ങൾ കൊണ്ടുവരുന്നു...", empty: "നിലവിൽ സജീവ പ്രവർത്തനങ്ങളൊന്നുമില്ല.", create: "പുതിയ പ്രവർത്തനം", medical: "മെഡിക്കൽ പിന്തുണ", medicalDesc: "ആരോഗ്യ സഹായം", fire: "അഗ്നി സുരക്ഷ", fireDesc: "തീപിടുത്ത പ്രതികരണം", rescue: "രക്ഷാപ്രവർത്തനം", rescueDesc: "അടിയന്തര രക്ഷപ്പെടുത്തൽ", food: "ഭക്ഷ്യ വിതരണം", foodDesc: "റേഷൻ വിതരണം" },
  bn: { greeting: "প্রতিষ্ঠান ড্যাশবোর্ড", sub: "আপনার সক্রিয় অপারেশন পরিচালনা করুন", categories: "সেবা বিভাগ", activeOps: "সক্রিয় অপারেশন", loading: "লাইভ অপারেশন আনা হচ্ছে...", empty: "বর্তমানে কোনো সক্রিয় অপারেশন নেই।", create: "নতুন অপারেশন", medical: "চিকিৎসা সহায়তা", medicalDesc: "স্বাস্থ্য সহায়তা", fire: "অগ্নি নিরাপত্তা", fireDesc: "অগ্নি প্রতিক্রিয়া", rescue: "উদ্ধার অভিযান", rescueDesc: "জরুরী উদ্ধার", food: "খাদ্য সরবরাহ", foodDesc: "রেশন বিতরণ" },
  pa: { greeting: "ਸੰਸਥਾ ਡੈਸ਼ਬੋਰਡ", sub: "ਆਪਣੇ ਸਰਗਰਮ ਕਾਰਜਾਂ ਦਾ ਪ੍ਰਬੰਧ ਕਰੋ", categories: "ਸੇਵਾ ਸ਼੍ਰੇਣੀਆਂ", activeOps: "ਸਰਗਰਮ ਕਾਰਜ", loading: "ਲਾਈਵ ਕਾਰਜ ਪ੍ਰਾਪਤ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ...", empty: "ਵਰਤਮਾਨ ਵਿੱਚ ਕੋਈ ਸਰਗਰਮ ਕਾਰਜ ਨਹੀਂ ਹਨ।", create: "ਨਵਾਂ ਕਾਰਜ", medical: "ਡਾਕਟਰੀ ਸਹਾਇਤਾ", medicalDesc: "ਸਿਹਤ ਸਹਾਇਤਾ", fire: "ਅੱਗ ਸੁਰੱਖਿਆ", fireDesc: "ਅੱਗ ਪ੍ਰਤੀਕਿਰਿਆ", rescue: "ਬਚਾਅ ਮਿਸ਼ਨ", rescueDesc: "ਐਮਰਜੈਂਸੀ ਨਿਕਾਸੀ", food: "ਭੋਜਨ ਸਪਲਾਈ", foodDesc: "ਰਾਸ਼ਨ ਵੰਡ" },
  or: { greeting: "ସଂସ୍ଥା ଡାସବୋର୍ଡ", sub: "ଆପଣଙ୍କର ସକ୍ରିୟ କାର୍ଯ୍ୟ ପରିଚାଳନା କରନ୍ତୁ", categories: "ସେବା ବର୍ଗ", activeOps: "ସକ୍ରିୟ କାର୍ଯ୍ୟ", loading: "ଲାଇଭ୍ କାର୍ଯ୍ୟ ଅଣାଯାଉଛି...", empty: "ବର୍ତ୍ତମାନ କୌଣସି ସକ୍ରିୟ କାର୍ଯ୍ୟ ନାହିଁ।", create: "ନୂଆ କାର୍ଯ୍ୟ", medical: "ଚିକିତ୍ସା ସହାୟତା", medicalDesc: "ସ୍ୱାସ୍ଥ୍ୟ ସହାୟତା", fire: "ଅଗ୍ନି ସୁରକ୍ଷା", fireDesc: "ଅଗ୍ନି ପ୍ରତିକ୍ରିୟା", rescue: "ଉଦ୍ଧାର କାର୍ଯ୍ୟ", rescueDesc: "ଜରୁରୀକାଳୀନ ଉଦ୍ଧାର", food: "ଖାଦ୍ୟ ଯୋଗାଣ", foodDesc: "ରାସନ ବଣ୍ଟନ" },
  as: { greeting: "সংস্থা ডেচবোৰ্ড", sub: "আপোনাৰ সক্ৰিয় কাৰ্য্যকলাপ পৰিচালনা কৰক", categories: "সেৱা শ্ৰেণী", activeOps: "সক্ৰিয় কাৰ্য্যকলাপ", loading: "লাইভ কাৰ্য্যকলাপ অনা হৈছে...", empty: "বৰ্তমান কোনো সক্ৰিয় কাৰ্য্যকলাপ নাই।", create: "নতুন কাৰ্য্যকলাপ", medical: "চিকিৎসা সমৰ্থন", medicalDesc: "স্বাস্থ্য সাহায্য", fire: "অগ্নি সুৰক্ষা", fireDesc: "অগ্নি সঁহাৰি", rescue: "উদ্ধাৰ অভিযান", rescueDesc: "জৰুৰীকালীন উদ্ধাৰ", food: "খাদ্য যোগান", foodDesc: "ৰেচন বিতৰণ" },
  ur: { greeting: "تنظیم کا ڈیش بورڈ", sub: "اپنے فعال کاموں کا نظم کریں", categories: "سروس کے زمرے", activeOps: "فعال کام", loading: "لائیو کام لائے جا رہے ہیں...", empty: "فی الحال کوئی فعال کام نہیں ہے۔", create: "نیا کام", medical: "طبی امداد", medicalDesc: "صحت کی مدد", fire: "آگ سے بچاؤ", fireDesc: "آگ کا ردعمل", rescue: "ریسکیو مشن", rescueDesc: "ہنگامی انخلاء", food: "خوراک کی فراہمی", foodDesc: "راشن کی تقسیم" },
  bho: { greeting: "संगठन डैशबोर्ड", sub: "अपन सक्रिय संचालन प्रबंधित करीं", categories: "सेवा श्रेणियाँ", activeOps: "सक्रिय संचालन", loading: "लाइव संचालन ले आवत बा...", empty: "वर्तमान में कौनो सक्रिय संचालन नइखे।", create: "नया संचालन", medical: "चिकित्सा सहायता", medicalDesc: "स्वास्थ्य सहायता", fire: "अग्नि सुरक्षा", fireDesc: "आग प्रतिक्रिया", rescue: "बचाव मिशन", rescueDesc: "आपातकालीन निकासी", food: "भोजन आपूर्ति", foodDesc: "राशन वितरण" }
};

export default function OrgDashboard() {
  const { language, colors } = useContext(AppContext);
  const { user } = useAuth();
  const db = getFirestore();
  const currentLang = ORG_TRANSLATIONS[language] || ORG_TRANSLATIONS.en;

  const [activeOperations, setActiveOperations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time Database Listener for Organization's specific cases
  useEffect(() => {
    if (!user) return;

    const opsQuery = query(
      collection(db, 'cases'),
      where('orgId', '==', user.uid),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(opsQuery, (snapshot) => {
      const opsData = [];
      snapshot.forEach((doc) => {
        opsData.push({ id: doc.id, ...doc.data() });
      });
      setActiveOperations(opsData);
      setIsLoading(false);
    }, (error) => {
      console.error(error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, db]);

  const CategoryCard = ({ title, desc, icon, colorHex }) => (
    <div style={{ backgroundColor: colors.White, borderRadius: '24px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', cursor: 'pointer' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: `${colorHex}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: colorHex, display: 'flex' }}>{icon}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ color: colors.Black, fontSize: '16px', fontWeight: '800', margin: 0 }}>{title}</span>
        <span style={{ color: colors.Black, opacity: 0.6, fontSize: '13px', fontWeight: '500', margin: 0 }}>{desc}</span>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '32px 24px', animation: 'fade-up 0.5s ease-out forwards' }}>
      
      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: colors.Black, fontSize: '28px', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
          {currentLang.greeting}
        </h1>
        <p style={{ color: colors.Black, opacity: 0.7, fontSize: '16px', margin: 0, fontWeight: '500' }}>
          {currentLang.sub}
        </p>
      </div>

      {/* Service Categories Grid */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: colors.Black, fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>
          {currentLang.categories}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          <CategoryCard 
            title={currentLang.medical} 
            desc={currentLang.medicalDesc} 
            colorHex={colors.Primary} 
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>} 
          />
          <CategoryCard 
            title={currentLang.fire} 
            desc={currentLang.fireDesc} 
            colorHex={colors.Emergency} 
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c-2.2-2.2-4.5-4.5-4.5-7.5A6.5 6.5 0 0 1 19 8c0 3-2.3 5.3-4.5 7.5a2.5 2.5 0 0 0 2.5 2.5 4.5 4.5 0 0 1-8.5-3.5Z"></path></svg>} 
          />
          <CategoryCard 
            title={currentLang.rescue} 
            desc={currentLang.rescueDesc} 
            colorHex={colors.Success} 
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>} 
          />
          <CategoryCard 
            title={currentLang.food} 
            desc={currentLang.foodDesc} 
            colorHex={colors.Primary} 
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>} 
          />
        </div>
      </section>

      {/* Active Operations List */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: colors.Black, fontSize: '18px', fontWeight: '800', margin: 0 }}>
            {currentLang.activeOps}
          </h2>
          <button style={{ backgroundColor: colors.Black, color: colors.White, border: 'none', borderRadius: '9999px', padding: '8px 16px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
            {currentLang.create}
          </button>
        </div>

        {isLoading ? (
          <div style={{ color: colors.Primary, fontWeight: '600', padding: '24px', textAlign: 'center' }}>
            {currentLang.loading}
          </div>
        ) : activeOperations.length === 0 ? (
          <div style={{ backgroundColor: colors.White, padding: '32px', borderRadius: '24px', textAlign: 'center', border: '1px dashed #E5E7EB' }}>
            <p style={{ color: colors.Black, opacity: 0.6, fontSize: '15px', fontWeight: '600', margin: 0 }}>
              {currentLang.empty}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeOperations.map(op => (
              <div key={op.id} style={{ backgroundColor: colors.White, borderRadius: '24px', padding: '20px', borderLeft: `6px solid ${colors.Emergency}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: colors.Black }}>{op.title || op.type}</span>
                  <span style={{ backgroundColor: '#FEF2F2', color: colors.Emergency, padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '800' }}>
                    Active
                  </span>
                </div>
                <p style={{ color: colors.Black, opacity: 0.7, fontSize: '14px', fontWeight: '500', margin: '0 0 12px 0' }}>
                  {op.description}
                </p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontWeight: '600', color: colors.Primary }}>
                  <span>Location: {op.location}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}