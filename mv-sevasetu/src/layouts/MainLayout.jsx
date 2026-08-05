/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Global layout wrapper featuring a floating, pill-shaped bottom navigation bar.
 * 
 * English: Global layout wrapper with floating bottom navigation.
 * Hindi: फ्लोटिंग बॉटम नेविगेशन के साथ ग्लोबल लेआउट रैपर।
 * Hinglish: Floating bottom navigation ke sath global layout wrapper.
 * Marathi: फ्लोटिंग बॉटम नेव्हिगेशनसह ग्लोबल लेआउट रॅपर.
 * Gujarati: ફ્લોટિંગ બોટમ નેવિગેશન સાથે ગ્લોબલ લેઆઉટ રેપર.
 * Telugu: ఫ్లోటింగ్ బాటమ్ నావిగేషన్‌తో గ్లోబల్ లేఅవుట్ రాపర్.
 * Tamil: மிதக்கும் கீழ் வழிசெலுத்தலுடன் உலகளாவிய லேஅவுட் ரேப்பர்.
 * Kannada: ಫ್ಲೋಟಿಂಗ್ ಬಾಟಮ್ ನ್ಯಾವಿಗೇಷನ್‌ನೊಂದಿಗೆ ಜಾಗತಿಕ ಲೇಔಟ್ ಹೊದಿಕೆ.
 * Malayalam: ഫ്ലോട്ടിംഗ് താഴെയുള്ള നാവിഗേഷനോടുകൂടിയ ആഗോള ലേഔട്ട് റാപ്പർ.
 * Bengali: ভাসমান নিচের নেভিগেশন সহ গ্লোবাল লেআউট র‍্যাপার।
 * Punjabi: ਫਲੋਟਿੰਗ ਬੌਟਮ ਨੈਵੀਗੇਸ਼ਨ ਦੇ ਨਾਲ ਗਲੋਬਲ ਲੇਆਉਟ ਰੈਪਰ।
 * Odia: ଫ୍ଲୋଟିଂ ତଳ ନାଭିଗେସନ୍ ସହିତ ଗ୍ଲୋବାଲ୍ ଲେଆଉଟ୍ ରାପର୍।
 * Assamese: ফ্লোটিং বটম নেভিগেচনৰ সৈতে গ্লোবেল লেআউট ৰেপাৰ।
 * Urdu: فلوٹنگ باٹم نیویگیشن کے ساتھ عالمی لے آؤٹ ریپر۔
 * Bhojpuri: फ्लोटिंग बॉटम नेविगेशन के साथ ग्लोबल लेआउट रैपर।
 */

import React, { useContext } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { AppContext } from '../main';

const NAVIGATION_TRANSLATIONS = {
  en: { home: "Home", alerts: "Alerts", profile: "Profile" },
  hi: { home: "होम", alerts: "अलर्ट", profile: "प्रोफाइल" },
  hinglish: { home: "Home", alerts: "Alerts", profile: "Profile" },
  mr: { home: "होम", alerts: "अॅलर्ट", profile: "प्रोफाइल" },
  gu: { home: "હોમ", alerts: "એલર્ટ્સ", profile: "પ્રોફાઇલ" },
  te: { home: "హోమ్", alerts: "హెచ్చరికలు", profile: "ప్రొఫైల్" },
  ta: { home: "முகப்பு", alerts: "எச்சரிக்கைகள்", profile: "சுயவிவரம்" },
  kn: { home: "ಮುಖಪುಟ", alerts: "ಎಚ್ಚರಿಕೆಗಳು", profile: "ಪ್ರೊಫೈಲ್" },
  ml: { home: "ഹോം", alerts: "അലേർട്ടുകൾ", profile: "പ്രൊഫൈൽ" },
  bn: { home: "হোম", alerts: "সতর্কতা", profile: "প্রোফাইল" },
  pa: { home: "ਹੋਮ", alerts: "ਅਲਰਟ", profile: "ਪ੍ਰੋਫਾਈਲ" },
  or: { home: "ହୋମ୍", alerts: "ଆଲର୍ଟ", profile: "ପ୍ରୋଫାଇଲ୍" },
  as: { home: "হোম", alerts: "এলাৰ্ট", profile: "প্ৰফাইল" },
  ur: { home: "ہوم", alerts: "الرٹس", profile: "پروفائل" },
  bho: { home: "होम", alerts: "अलर्ट", profile: "प्रोफाइल" }
};

export default function MainLayout() {
  const { language, colors } = useContext(AppContext);
  const location = useLocation();
  const currentLang = NAVIGATION_TRANSLATIONS[language] || NAVIGATION_TRANSLATIONS.en;

  // Base path resolution to handle dynamic dashboard contexts (org or volunteer)
  const getBasePath = () => {
    if (location.pathname.startsWith('/org')) return '/org';
    if (location.pathname.startsWith('/volunteer')) return '/volunteer';
    return '/org'; // Default fallback
  };

  const basePath = getBasePath();

  return (
    <div style={{ backgroundColor: '#F3F4F6', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Page Content Rendering Area - Padded at bottom to clear the fixed navigation */}
      <main style={{ flex: 1, paddingBottom: '100px', width: '100%', maxWidth: '768px', margin: '0 auto' }}>
        <Outlet />
      </main>

      {/* Floating Pill-Shaped Bottom Navigation */}
      <nav 
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: colors.White,
          borderRadius: '9999px',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '90%',
          maxWidth: '320px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          zIndex: 50
        }}
      >
        {/* Home Route */}
        <NavLink 
          to={`${basePath}`}
          end
          aria-label={currentLang.home}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            color: isActive ? colors.Primary : colors.Black,
            opacity: isActive ? 1 : 0.4,
            transition: 'color 0.2s, opacity 0.2s'
          })}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" />
          </svg>
        </NavLink>

        {/* Alerts / Emergencies Route */}
        <NavLink 
          to={`${basePath}/alerts`}
          aria-label={currentLang.alerts}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            color: isActive ? colors.Primary : colors.Black,
            opacity: isActive ? 1 : 0.4,
            transition: 'color 0.2s, opacity 0.2s',
            position: 'relative'
          })}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16ZM16 17H8V11C8 8.52 9.51 6.5 12 6.5C14.49 6.5 16 8.52 16 11V17Z" />
          </svg>
          {/* Strict Emergency Red Indicator for Unread Alerts */}
          <span 
            style={{
              position: 'absolute',
              top: '6px',
              right: '8px',
              width: '8px',
              height: '8px',
              backgroundColor: colors.Emergency,
              borderRadius: '50%',
              border: `2px solid ${colors.White}`
            }}
          />
        </NavLink>

        {/* Profile / Settings Route */}
        <NavLink 
          to={`${basePath}/profile`}
          aria-label={currentLang.profile}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            color: isActive ? colors.Primary : colors.Black,
            opacity: isActive ? 1 : 0.4,
            transition: 'color 0.2s, opacity 0.2s'
          })}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.93 6 15.5 7.57 15.5 9.5C15.5 11.43 13.93 13 12 13C10.07 13 8.5 11.43 8.5 9.5C8.5 7.57 10.07 6 12 6ZM12 20C9.97 20 7.57 19.18 5.86 17.12C7.55 15.8 9.68 15 12 15C14.32 15 16.45 15.8 18.14 17.12C16.43 19.18 14.03 20 12 20Z" />
          </svg>
        </NavLink>
      </nav>
    </div>
  );
}