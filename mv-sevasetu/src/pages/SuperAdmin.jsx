/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Super Admin portal for platform management and payment auditing.
 * 
 * English: Super Admin Portal.
 * Hindi: सुपर एडमिन पोर्टल।
 * Hinglish: Super Admin Portal.
 * Marathi: सुपर अॅडमिन पोर्टल.
 * Gujarati: સુપર એડમિન પોર્ટલ.
 * Telugu: సూపర్ అడ్మిన్ పోర్టల్.
 * Tamil: சூப்பர் நிர்வாகி போர்ட்டல்.
 * Kannada: ಸೂಪರ್ ಅಡ್ಮಿನ್ ಪೋರ್ಟಲ್.
 * Malayalam: സൂപ്പർ അഡ്മിൻ പോർട്ടൽ.
 * Bengali: সুপার অ্যাডমিন পোর্টাল।
 * Punjabi: ਸੁਪਰ ਐਡਮਿਨ ਪੋਰਟਲ।
 * Odia: ସୁପର ଆଡମିନ୍ ପୋର୍ଟାଲ୍।
 * Assamese: ছুপাৰ এডমিন পৰ্টেল।
 * Urdu: سپر ایڈمن پورٹل۔
 * Bhojpuri: सुपर एडमिन पोर्टल।
 */

import { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, limit } from 'firebase/firestore';
import { AppContext } from '../main';
import { useAuth } from '../context/AuthContext';

const ADMIN_TRANSLATIONS = {
  en: { title: "Super Admin Portal", overview: "Platform Overview", paymentTest: "Payment Testing", logs: "Transaction Logs", clearPending: "Clear Pending Status", status: "Status", amount: "Amount", org: "Organization", date: "Date", noLogs: "No transaction records found.", success: "Status Updated", processing: "Processing...", active: "Active", pending: "Pending" },
  hi: { title: "सुपर एडमिन पोर्टल", overview: "प्लेटफॉर्म अवलोकन", paymentTest: "भुगतान परीक्षण", logs: "लेनदेन लॉग", clearPending: "लंबित स्थिति साफ़ करें", status: "स्थिति", amount: "राशि", org: "संगठन", date: "तारीख", noLogs: "कोई लेनदेन रिकॉर्ड नहीं मिला।", success: "स्थिति अपडेट की गई", processing: "प्रोसेस हो रहा है...", active: "सक्रिय", pending: "लंबित" },
  hinglish: { title: "Super Admin Portal", overview: "Platform Overview", paymentTest: "Payment Testing", logs: "Transaction Logs", clearPending: "Pending Status Clear Karein", status: "Status", amount: "Amount", org: "Organization", date: "Date", noLogs: "Koi transaction record nahi mila.", success: "Status Update Hua", processing: "Process ho raha hai...", active: "Active", pending: "Pending" },
  mr: { title: "सुपर अॅडमिन पोर्टल", overview: "प्लॅटफॉर्म विहंगावलोकन", paymentTest: "पेमेंट चाचणी", logs: "व्यवहार लॉग", clearPending: "प्रलंबित स्थिती साफ करा", status: "स्थिती", amount: "रक्कम", org: "संस्था", date: "तारीख", noLogs: "कोणतेही व्यवहार रेकॉर्ड आढळले नाही.", success: "स्थिती अपडेट केली", processing: "प्रक्रिया करत आहे...", active: "सक्रिय", pending: "प्रलंबित" },
  gu: { title: "સુપર એડમિન પોર્ટલ", overview: "પ્લેટફોર્મ વિહંગાવલોકન", paymentTest: "ચુકવણી પરીક્ષણ", logs: "વ્યવહાર લોગ", clearPending: "બાકી સ્થિતિ સાફ કરો", status: "સ્થિતિ", amount: "રકમ", org: "સંસ્થા", date: "તારીખ", noLogs: "કોઈ વ્યવહાર રેકોર્ડ મળ્યો નથી.", success: "સ્થિતિ અપડેટ થઈ", processing: "પ્રક્રિયા થઈ રહી છે...", active: "સક્રિય", pending: "બાકી" },
  te: { title: "సూపర్ అడ్మిన్ పోర్టల్", overview: "ప్లాట్‌ఫారమ్ అవలోకనం", paymentTest: "చెల్లింపు పరీక్ష", logs: "లావాదేవీ లాగ్‌లు", clearPending: "పెండింగ్ స్థితిని క్లియర్ చేయండి", status: "స్థితి", amount: "మొత్తం", org: "సంస్థ", date: "తేదీ", noLogs: "లావాదేవీ రికార్డులు కనుగొనబడలేదు.", success: "స్థితి నవీకరించబడింది", processing: "ప్రాసెస్ చేయబడుతోంది...", active: "క్రియాశీల", pending: "పెండింగ్‌లో ఉంది" },
  ta: { title: "சூப்பர் நிர்வாகி போர்ட்டல்", overview: "கண்ணோட்டம்", paymentTest: "கட்டண சோதனை", logs: "பரிவர்த்தனை பதிவுகள்", clearPending: "நிலுவையில் உள்ளதை அழிக்கவும்", status: "நிலை", amount: "தொகை", org: "நிறுவனம்", date: "தேதி", noLogs: "பரிவர்த்தனை பதிவுகள் எதுவும் கிடைக்கவில்லை.", success: "நிலை புதுப்பிக்கப்பட்டது", processing: "செயலாக்கப்படுகிறது...", active: "செயலில்", pending: "நிலுவையில் உள்ளது" },
  kn: { title: "ಸೂಪರ್ ಅಡ್ಮಿನ್ ಪೋರ್ಟಲ್", overview: "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಅವಲೋಕನ", paymentTest: "ಪಾವತಿ ಪರೀಕ್ಷೆ", logs: "ವಹಿವಾಟು ದಾಖಲೆಗಳು", clearPending: "ಬಾಕಿ ಸ್ಥಿತಿಯನ್ನು ತೆರವುಗೊಳಿಸಿ", status: "ಸ್ಥಿತಿ", amount: "ಮೊತ್ತ", org: "ಸಂಸ್ಥೆ", date: "ದಿನಾಂಕ", noLogs: "ಯಾವುದೇ ವಹಿವಾಟು ದಾಖಲೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.", success: "ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ", processing: "ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...", active: "ಸಕ್ರಿಯ", pending: "ಬಾಕಿಯಿದೆ" },
  ml: { title: "സൂപ്പർ അഡ്മിൻ പോർട്ടൽ", overview: "പ്ലാറ്റ്‌ഫോം അവലോകനം", paymentTest: "പേയ്‌മെന്റ് പരിശോധന", logs: "ഇടപാട് രേഖകൾ", clearPending: "പെൻഡിംഗ് നില മായ്‌ക്കുക", status: "നില", amount: "തുക", org: "സ്ഥാപനം", date: "തീയതി", noLogs: "ഇടപാട് രേഖകളൊന്നും കണ്ടെത്തിയില്ല.", success: "നില പുതുക്കി", processing: "പ്രോസസ്സ് ചെയ്യുന്നു...", active: "സജീവം", pending: "തീർപ്പുകൽപ്പിച്ചിട്ടില്ല" },
  bn: { title: "সুপার অ্যাডমিন পোর্টাল", overview: "প্ল্যাটফর্ম ওভারভিউ", paymentTest: "পেমেন্ট টেস্টিং", logs: "লেনদেনের লগ", clearPending: "পেন্ডিং স্ট্যাটাস সাফ করুন", status: "স্ট্যাটাস", amount: "পরিমাণ", org: "প্রতিষ্ঠান", date: "তারিখ", noLogs: "কোনো লেনদেনের রেকর্ড পাওয়া যায়নি।", success: "স্ট্যাটাস আপডেট হয়েছে", processing: "প্রক্রিয়া করা হচ্ছে...", active: "সক্রিয়", pending: "পেন্ডিং" },
  pa: { title: "ਸੁਪਰ ਐਡਮਿਨ ਪੋਰਟਲ", overview: "ਪਲੇਟਫਾਰਮ ਸੰਖੇਪ ਰੂਪ", paymentTest: "ਭੁਗਤਾਨ ਟੈਸਟਿੰਗ", logs: "ਲੈਣ-ਦੇਣ ਲਾਗ", clearPending: "ਬਕਾਇਆ ਸਥਿਤੀ ਸਾਫ਼ ਕਰੋ", status: "ਸਥਿਤੀ", amount: "ਰਕਮ", org: "ਸੰਸਥਾ", date: "ਮਿਤੀ", noLogs: "ਕੋਈ ਲੈਣ-ਦੇਣ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ।", success: "ਸਥਿਤੀ ਅੱਪਡੇਟ ਕੀਤੀ ਗਈ", processing: "ਕਾਰਵਾਈ ਹੋ ਰਹੀ ਹੈ...", active: "ਸਰਗਰਮ", pending: "ਬਕਾਇਆ" },
  or: { title: "ସୁପର ଆଡମିନ୍ ପୋର୍ଟାଲ୍", overview: "ପ୍ଲାଟଫର୍ମ ଓଭରଭ୍ୟୁ", paymentTest: "ପେମେଣ୍ଟ ଟେଷ୍ଟିଂ", logs: "ଟ୍ରାଞ୍ଜାକ୍ସନ୍ ଲଗ୍", clearPending: "ପେଣ୍ଡିଂ ସ୍ଥିତି ସଫା କରନ୍ତୁ", status: "ସ୍ଥିତି", amount: "ପରିମାଣ", org: "ସଂସ୍ଥା", date: "ତାରିଖ", noLogs: "କୌଣସି ଟ୍ରାଞ୍ଜାକ୍ସନ୍ ରେକର୍ଡ ମିଳିଲା ନାହିଁ।", success: "ସ୍ଥିତି ଅପଡେଟ୍ ହେଲା", processing: "ପ୍ରକ୍ରିୟାକରଣ ହେଉଛି...", active: "ସକ୍ରିୟ", pending: "ପେଣ୍ଡିଂ" },
  as: { title: "ছুপাৰ এডমিন পৰ্টেল", overview: "প্লেটফৰ্ম অভাৰভিউ", paymentTest: "পেমেণ্ট টেষ্টিং", logs: "ট্ৰেঞ্জেকচন লগ", clearPending: "পেণ্ডিং স্থিতি পৰিষ্কাৰ কৰক", status: "স্থিতি", amount: "পৰিমাণ", org: "সংস্থা", date: "তাৰিখ", noLogs: "কোনো ট্ৰেঞ্জেকচন ৰেকৰ্ড পোৱা নগ'ল।", success: "স্থিতি আপডেইট কৰা হ'ল", processing: "প্ৰক্ৰিয়া চলি আছে...", active: "সক্ৰিয়", pending: "পেণ্ডিং" },
  ur: { title: "سپر ایڈمن پورٹل", overview: "پلیٹ فارم کا جائزہ", paymentTest: "ادائیگی کی جانچ", logs: "لین دین کے لاگز", clearPending: "زیر التواء حیثیت صاف کریں", status: "حیثیت", amount: "رقم", org: "تنظیم", date: "تاریخ", noLogs: "کوئی لین دین کا ریکارڈ نہیں ملا۔", success: "حیثیت اپ ڈیٹ ہو گئی", processing: "عمل ہو رہا ہے...", active: "فعال", pending: "زیر التواء" },
  bho: { title: "सुपर एडमिन पोर्टल", overview: "प्लेटफॉर्म अवलोकन", paymentTest: "भुगतान परीक्षण", logs: "लेनदेन लॉग", clearPending: "लंबित स्थिति साफ़ करीं", status: "स्थिति", amount: "राशि", org: "संगठन", date: "तारीख", noLogs: "कौनो लेनदेन रिकॉर्ड ना मिलल।", success: "स्थिति अपडेट भइल", processing: "प्रोसेस हो रहल बा...", active: "सक्रिय", pending: "लंबित" }
};

export default function SuperAdmin() {
  const { language, colors } = useContext(AppContext);
  const { user, isSuperAdmin, isLoading: authLoading } = useAuth();
  const db = getFirestore();
  const currentLang = ADMIN_TRANSLATIONS[language] || ADMIN_TRANSLATIONS.en;

  const [transactions, setTransactions] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Real-time Auditing: Fetch raw transaction logs
  // STRICTLY MOVED ABOVE EARLY RETURNS TO COMPLY WITH REACT RULES OF HOOKS
  useEffect(() => {
    // Internal guard to prevent unauthorized execution
    if (!user || !isSuperAdmin) return;

    const logsQuery = query(
      collection(db, 'transactions'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
      const logsData = [];
      snapshot.forEach((doc) => {
        logsData.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(logsData);
      setIsLoadingLogs(false);
    }, (error) => {
      console.error(error);
      setIsLoadingLogs(false);
    });

    return () => unsubscribe();
  }, [db, user, isSuperAdmin]);

  // Strict Security Gate
  if (authLoading) return null;
  if (!user || !isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleClearPaymentState = async (transactionId, orgId) => {
    setProcessingId(transactionId);
    try {
      // 1. Update the transaction status to success
      const txRef = doc(db, 'transactions', transactionId);
      await updateDoc(txRef, { status: 'success' });
      
      // 2. Clear the verification lock on the organization profile
      const orgRef = doc(db, 'users', orgId);
      await updateDoc(orgRef, { paymentStatus: 'verified' });
      
      alert(currentLang.success);
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', padding: '40px 24px', display: 'flex', flexDirection: 'column', animation: 'fade-up 0.5s ease-out forwards' }}>
      
      <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '40px', borderBottom: `2px solid ${colors.Primary}`, paddingBottom: '16px' }}>
          <h1 style={{ color: colors.Black, fontSize: '32px', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            {currentLang.title}
          </h1>
          <p style={{ color: colors.Emergency, fontWeight: '700', fontSize: '14px', margin: 0 }}>
            Restricted Access: testcodecfg@gmail.com
          </p>
        </div>

        {/* Payment Testing & Auditing Section */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: colors.Primary }}></div>
            <h2 style={{ color: colors.Black, fontSize: '20px', fontWeight: '800', margin: 0 }}>
              {currentLang.paymentTest} - {currentLang.logs}
            </h2>
          </div>

          <div style={{ backgroundColor: colors.White, borderRadius: '24px', padding: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', overflowX: 'auto' }}>
            {isLoadingLogs ? (
              <div style={{ color: colors.Primary, fontWeight: '700', textAlign: 'center', padding: '40px' }}>
                {currentLang.processing}
              </div>
            ) : transactions.length === 0 ? (
              <div style={{ color: colors.Black, opacity: 0.6, fontWeight: '600', textAlign: 'center', padding: '40px' }}>
                {currentLang.noLogs}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E5E7EB', color: colors.Black, fontSize: '14px' }}>
                    <th style={{ padding: '16px 8px', fontWeight: '800' }}>Txn ID</th>
                    <th style={{ padding: '16px 8px', fontWeight: '800' }}>{currentLang.org}</th>
                    <th style={{ padding: '16px 8px', fontWeight: '800' }}>{currentLang.amount}</th>
                    <th style={{ padding: '16px 8px', fontWeight: '800' }}>{currentLang.date}</th>
                    <th style={{ padding: '16px 8px', fontWeight: '800' }}>{currentLang.status}</th>
                    <th style={{ padding: '16px 8px', fontWeight: '800', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #E5E7EB', fontSize: '14px', color: colors.Black, fontWeight: '500' }}>
                      <td style={{ padding: '16px 8px', fontFamily: 'monospace' }}>{tx.id.substring(0, 8)}...</td>
                      <td style={{ padding: '16px 8px' }}>{tx.orgName || tx.orgId}</td>
                      <td style={{ padding: '16px 8px', fontWeight: '700' }}>₹{tx.amount}</td>
                      <td style={{ padding: '16px 8px' }}>{formatDate(tx.createdAt)}</td>
                      <td style={{ padding: '16px 8px' }}>
                        <span style={{ 
                          backgroundColor: tx.status === 'success' ? '#ECFDF5' : '#FEF2F2', 
                          color: tx.status === 'success' ? colors.Success : colors.Emergency, 
                          padding: '4px 12px', 
                          borderRadius: '9999px', 
                          fontWeight: '800',
                          fontSize: '12px'
                        }}>
                          {tx.status === 'success' ? currentLang.active : currentLang.pending}
                        </span>
                      </td>
                      <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                        {tx.status !== 'success' && (
                          <button
                            onClick={() => handleClearPaymentState(tx.id, tx.orgId)}
                            disabled={processingId === tx.id}
                            style={{
                              backgroundColor: colors.Black,
                              color: colors.White,
                              border: 'none',
                              padding: '8px 16px',
                              borderRadius: '9999px',
                              fontWeight: '700',
                              fontSize: '12px',
                              cursor: processingId === tx.id ? 'not-allowed' : 'pointer',
                              opacity: processingId === tx.id ? 0.7 : 1
                            }}
                          >
                            {processingId === tx.id ? currentLang.processing : currentLang.clearPending}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}