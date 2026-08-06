/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Volunteer Portal for tracking impact and accepting local tasks.
 * 
 * English: Volunteer Portal.
 * Hindi: स्वयंसेवक पोर्टल।
 * Hinglish: Volunteer Portal.
 * Marathi: स्वयंसेवक पोर्टल.
 * Gujarati: સ્વયંસેવક પોર્ટલ.
 * Telugu: వాలంటీర్ పోర్టల్.
 * Tamil: தொண்டர் போர்ட்டல்.
 * Kannada: ಸ್ವಯಂಸೇವಕ ಪೋರ್ಟಲ್.
 * Malayalam: വളണ്ടിയർ പോർട്ടൽ.
 * Bengali: স্বেচ্ছাসেবক পোর্টাল।
 * Punjabi: ਵਲੰਟੀਅਰ ਪੋਰਟਲ।
 * Odia: ସ୍ୱେଚ୍ଛାସେବୀ ପୋର୍ଟାଲ୍।
 * Assamese: স্বেচ্ছাসেৱক পৰ্টেল।
 * Urdu: رضاکار پورٹل۔
 * Bhojpuri: स्वयंसेवक पोर्टल।
 */

import { useState, useEffect, useContext } from 'react';
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { AppContext } from '../main';
import { useAuth } from '../context/AuthContext';

const VOLUNTEER_TRANSLATIONS = {
  en: { title: "Volunteer Portal", impact: "Your Impact", tasksCompleted: "Tasks Completed", hours: "Hours Contributed", activeTasks: "Local Active Tasks", accept: "Accept Task", loading: "Fetching tasks...", empty: "No active tasks nearby.", location: "Location", description: "Description", success: "Task Accepted" },
  hi: { title: "स्वयंसेवक पोर्टल", impact: "आपका प्रभाव", tasksCompleted: "पूरे किए गए कार्य", hours: "योगदान के घंटे", activeTasks: "स्थानीय सक्रिय कार्य", accept: "कार्य स्वीकार करें", loading: "कार्य प्राप्त कर रहा है...", empty: "आसपास कोई सक्रिय कार्य नहीं है।", location: "स्थान", description: "विवरण", success: "कार्य स्वीकार किया गया" },
  hinglish: { title: "Volunteer Portal", impact: "Aapka Impact", tasksCompleted: "Tasks Complete Hue", hours: "Hours Contribute Kiye", activeTasks: "Local Active Tasks", accept: "Task Accept Karein", loading: "Tasks fetch ho rahe hain...", empty: "Aaspaas koi active task nahi hai.", location: "Location", description: "Description", success: "Task Accept Hua" },
  mr: { title: "स्वयंसेवक पोर्टल", impact: "तुमचा प्रभाव", tasksCompleted: "पूर्ण झालेली कामे", hours: "योगदानाचे तास", activeTasks: "स्थानिक सक्रिय कामे", accept: "काम स्वीकारा", loading: "कामे मिळवत आहे...", empty: "जवळपास कोणतीही सक्रिय कामे नाहीत.", location: "स्थान", description: "तपशील", success: "काम स्वीकारले" },
  gu: { title: "સ્વયંસેવક પોર્ટલ", impact: "તમારો પ્રભાવ", tasksCompleted: "પૂર્ણ થયેલ કાર્યો", hours: "યોગદાનના કલાકો", activeTasks: "સ્થાનિક સક્રિય કાર્યો", accept: "કાર્ય સ્વીકારો", loading: "કાર્યો લાવી રહ્યાં છે...", empty: "નજીકમાં કોઈ સક્રિય કાર્યો નથી.", location: "સ્થાન", description: "વિગતો", success: "કાર્ય સ્વીકારવામાં આવ્યું" },
  te: { title: "వాలంటీర్ పోర్టల్", impact: "మీ ప్రభావం", tasksCompleted: "పూర్తయిన పనులు", hours: "సహకరించిన గంటలు", activeTasks: "స్థానిక క్రియాశీల పనులు", accept: "పనిని అంగీకరించండి", loading: "పనులను పొందుతోంది...", empty: "సమీపంలో క్రియాశీల పనులు లేవు.", location: "స్థానం", description: "వివరాలు", success: "పని అంగీకరించబడింది" },
  ta: { title: "தொண்டர் போர்ட்டல்", impact: "உங்கள் தாக்கம்", tasksCompleted: "முடிக்கப்பட்ட பணிகள்", hours: "பங்களித்த மணிநேரம்", activeTasks: "உள்ளூர் செயலில் உள்ள பணிகள்", accept: "பணியை ஏற்கவும்", loading: "பணிகள் பெறப்படுகின்றன...", empty: "அருகில் செயலில் உள்ள பணிகள் எதுவும் இல்லை.", location: "இடம்", description: "விவரம்", success: "பணி ஏற்கப்பட்டது" },
  kn: { title: "ಸ್ವಯಂಸೇವಕ ಪೋರ್ಟಲ್", impact: "ನಿಮ್ಮ ಪ್ರಭಾವ", tasksCompleted: "ಪೂರ್ಣಗೊಂಡ ಕಾರ್ಯಗಳು", hours: "ನೀಡಿದ ಗಂಟೆಗಳು", activeTasks: "ಸ್ಥಳೀಯ ಸಕ್ರಿಯ ಕಾರ್ಯಗಳು", accept: "ಕಾರ್ಯವನ್ನು ಸ್ವೀಕರಿಸಿ", loading: "ಕಾರ್ಯಗಳನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...", empty: "ಹತ್ತಿರದಲ್ಲಿ ಯಾವುದೇ ಸಕ್ರಿಯ ಕಾರ್ಯಗಳಿಲ್ಲ.", location: "ಸ್ಥಳ", description: "ವಿವರಣೆ", success: "ಕಾರ್ಯ ಸ್ವೀಕರಿಸಲಾಗಿದೆ" },
  ml: { title: "വളണ്ടിയർ പോർട്ടൽ", impact: "നിങ്ങളുടെ സ്വാധീനം", tasksCompleted: "പൂർത്തിയാക്കിയ ജോലികൾ", hours: "സംഭാവന ചെയ്ത മണിക്കൂറുകൾ", activeTasks: "പ്രാദേശിക സജീവ ജോലികൾ", accept: "ജോലി സ്വീകരിക്കുക", loading: "ജോലികൾ കൊണ്ടുവരുന്നു...", empty: "അടുത്തൊന്നും സജീവ ജോലികളില്ല.", location: "സ്ഥലം", description: "വിവരണം", success: "ജോലി സ്വീകരിച്ചു" },
  bn: { title: "স্বেচ্ছাসেবক পোর্টাল", impact: "আপনার প্রভাব", tasksCompleted: "সম্পন্ন কাজ", hours: "অবদান রাখা ঘন্টা", activeTasks: "স্থানীয় সক্রিয় কাজ", accept: "কাজ গ্রহণ করুন", loading: "কাজ আনা হচ্ছে...", empty: "কাছাকাছি কোনো সক্রিয় কাজ নেই।", location: "অবস্থান", description: "বিবরণ", success: "কাজ গৃহীত হয়েছে" },
  pa: { title: "ਵਲੰਟੀਅਰ ਪੋਰਟਲ", impact: "ਤੁਹਾਡਾ ਪ੍ਰਭਾਵ", tasksCompleted: "ਪੂਰੇ ਕੀਤੇ ਗਏ ਕੰਮ", hours: "ਯੋਗਦਾਨ ਦੇ ਘੰਟੇ", activeTasks: "ਸਥਾਨਕ ਸਰਗਰਮ ਕੰਮ", accept: "ਕੰਮ ਸਵੀਕਾਰ ਕਰੋ", loading: "ਕੰਮ ਪ੍ਰਾਪਤ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ...", empty: "ਨੇੜੇ ਕੋਈ ਸਰਗਰਮ ਕੰਮ ਨਹੀਂ ਹੈ।", location: "ਸਥਾਨ", description: "ਵੇਰਵਾ", success: "ਕੰਮ ਸਵੀਕਾਰ ਕੀਤਾ ਗਿਆ" },
  or: { title: "ସ୍ୱେଚ୍ଛାସେବୀ ପୋର୍ଟାଲ୍", impact: "ଆପଣଙ୍କ ପ୍ରଭାବ", tasksCompleted: "ସମ୍ପୂର୍ଣ୍ଣ ହୋଇଥିବା କାର୍ଯ୍ୟ", hours: "ଯୋଗଦାନ ଘଣ୍ଟା", activeTasks: "ସ୍ଥାନୀୟ ସକ୍ରିୟ କାର୍ଯ୍ୟ", accept: "କାର୍ଯ୍ୟ ଗ୍ରହଣ କରନ୍ତୁ", loading: "କାର୍ଯ୍ୟ ଅଣାଯାଉଛି...", empty: "ନିକଟରେ କୌଣସି ସକ୍ରିୟ କାର୍ଯ୍ୟ ନାହିଁ।", location: "ସ୍ଥାନ", description: "ବିବରଣୀ", success: "କାର୍ଯ୍ୟ ଗୃହୀତ ହେଲା" },
  as: { title: "স্বেচ্ছাসেৱক পৰ্টেল", impact: "আপোনাৰ প্ৰভাৱ", tasksCompleted: "সম্পূৰ্ণ কৰা কাম", hours: "যোগদান কৰা ঘণ্টা", activeTasks: "স্থানীয় সক্ৰিয় কাম", accept: "কাম গ্ৰহণ কৰক", loading: "কাম অনা হৈছে...", empty: "ওচৰত কোনো সক্ৰিয় কাম নাই।", location: "স্থান", description: "বিৱৰণ", success: "কাম গ্ৰহণ কৰা হ'ল" },
  ur: { title: "رضاکار پورٹل", impact: "آپ کا اثر", tasksCompleted: "مکمل کردہ کام", hours: "تعاون کے گھنٹے", activeTasks: "مقامی فعال کام", accept: "کام قبول کریں", loading: "کام لائے جا رہے ہیں...", empty: "قریب میں کوئی فعال کام نہیں ہے۔", location: "مقام", description: "تفصیل", success: "کام قبول کر لیا گیا" },
  bho: { title: "स्वयंसेवक पोर्टल", impact: "राउर प्रभाव", tasksCompleted: "पूरा भइल काम", hours: "योगदान के घंटा", activeTasks: "स्थानीय सक्रिय काम", accept: "काम स्वीकार करीं", loading: "काम ले आवत बा...", empty: "आसपास कौनो सक्रिय काम नइखे।", location: "स्थान", description: "विवरण", success: "काम स्वीकार कइल गइल" }
};

// Strictly moved outside the main render function to prevent cascading state resets
const StatCard = ({ title, value, colorHex, colors }) => (
  <div style={{ backgroundColor: colors.White, borderRadius: '24px', padding: '24px', flex: 1, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', borderBottom: `4px solid ${colorHex}` }}>
    <h3 style={{ color: colors.Black, opacity: 0.7, fontSize: '14px', fontWeight: '700', margin: '0 0 8px 0' }}>{title}</h3>
    <div style={{ color: colors.Black, fontSize: '32px', fontWeight: '900' }}>{value}</div>
  </div>
);

export default function VolunteerPortal() {
  const { language, colors } = useContext(AppContext);
  const { user } = useAuth();
  const db = getFirestore();
  const currentLang = VOLUNTEER_TRANSLATIONS[language] || VOLUNTEER_TRANSLATIONS.en;

  const [activeTasks, setActiveTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState({ tasksCompleted: 0, hoursContributed: 0 });

  // Fetch real-time volunteer stats
  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserStats({
          tasksCompleted: data.tasksCompleted || 0,
          hoursContributed: data.hoursContributed || 0
        });
      }
    });
    return () => unsubscribeUser();
  }, [user, db]);

  // Fetch real-time open tasks
  useEffect(() => {
    const tasksQuery = query(
      collection(db, 'cases'),
      where('status', '==', 'active'),
      where('visibility', '==', 'public')
    );

    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = [];
      snapshot.forEach((document) => {
        tasksData.push({ id: document.id, ...document.data() });
      });
      setActiveTasks(tasksData);
      setIsLoading(false);
    }, (error) => {
      console.error(error);
      setIsLoading(false);
    });

    return () => unsubscribeTasks();
  }, [db]);

  const handleAcceptTask = async (taskId) => {
    if (!user) return;
    try {
      const taskRef = doc(db, 'cases', taskId);
      await updateDoc(taskRef, {
        status: 'assigned',
        assignedTo: user.uid
      });
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        tasksCompleted: increment(1)
      });
      
      alert(currentLang.success);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '32px 24px', backgroundColor: '#F3F4F6', minHeight: '100vh', animation: 'fade-up 0.5s ease-out forwards' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: colors.Black, fontSize: '28px', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
          {currentLang.title}
        </h1>
      </div>

      {/* Impact Statistics */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ color: colors.Black, fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>
          {currentLang.impact}
        </h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <StatCard title={currentLang.tasksCompleted} value={userStats.tasksCompleted} colorHex={colors.Success} colors={colors} />
          <StatCard title={currentLang.hours} value={userStats.hoursContributed} colorHex={colors.Primary} colors={colors} />
        </div>
      </section>

      {/* Active Tasks Feed */}
      <section>
        <h2 style={{ color: colors.Black, fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>
          {currentLang.activeTasks}
        </h2>

        {isLoading ? (
          <div style={{ color: colors.Primary, fontWeight: '600', padding: '24px', textAlign: 'center' }}>
            {currentLang.loading}
          </div>
        ) : activeTasks.length === 0 ? (
          <div style={{ backgroundColor: colors.White, padding: '32px', borderRadius: '24px', textAlign: 'center', border: '1px dashed #E5E7EB' }}>
            <p style={{ color: colors.Black, opacity: 0.6, fontSize: '15px', fontWeight: '600', margin: 0 }}>
              {currentLang.empty}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeTasks.map(task => (
              <div key={task.id} style={{ backgroundColor: colors.White, borderRadius: '24px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ backgroundColor: '#FEF2F2', color: colors.Emergency, padding: '6px 16px', borderRadius: '9999px', fontSize: '14px', fontWeight: '800' }}>
                    {task.type || 'Emergency'}
                  </span>
                </div>
                
                <div>
                  <div style={{ color: colors.Black, fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{currentLang.description}</div>
                  <p style={{ color: colors.Black, opacity: 0.8, fontSize: '16px', fontWeight: '500', margin: 0 }}>{task.description}</p>
                </div>

                <div>
                  <div style={{ color: colors.Black, fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{currentLang.location}</div>
                  <p style={{ color: colors.Primary, fontSize: '14px', fontWeight: '600', margin: 0 }}>{task.location}</p>
                </div>

                <button 
                  onClick={() => handleAcceptTask(task.id)}
                  style={{ width: '100%', padding: '16px', borderRadius: '9999px', backgroundColor: colors.Success, color: colors.White, fontSize: '16px', fontWeight: '800', border: 'none', cursor: 'pointer', marginTop: '8px' }}
                >
                  {currentLang.accept}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}