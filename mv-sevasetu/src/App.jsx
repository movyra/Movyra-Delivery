/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Core application routing and access control architecture.
 * 
 * English: Core application routing and access control architecture.
 * Hindi: कोर एप्लिकेशन रूटिंग और एक्सेस कंट्रोल आर्किटेक्चर।
 * Hinglish: Core application routing aur access control architecture.
 * Marathi: कोर ऍप्लिकेशन राउटिंग आणि ऍक्सेस कंट्रोल आर्किटेक्चर.
 * Gujarati: કોર એપ્લિકેશન રૂટીંગ અને એક્સેસ કંટ્રોલ આર્કિટેક્ચર.
 * Telugu: కోర్ అప్లికేషన్ రూటింగ్ మరియు యాక్సెస్ కంట్రోల్ ఆర్కిటెక్చర్.
 * Tamil: மைய பயன்பாட்டு வழிகாட்டல் மற்றும் அணுகல் கட்டுப்பாட்டு கட்டமைப்பு.
 * Kannada: ಕೋರ್ ಅಪ್ಲಿಕೇಶನ್ ರೂಟಿಂಗ್ ಮತ್ತು ಪ್ರವೇಶ ನಿಯಂತ್ರಣ ವಾಸ್ತುಶಿಲ್ಪ.
 * Malayalam: കോർ ആപ്ലിക്കേഷൻ റൂട്ടിംഗ്, ആക്സസ് കൺട്രോൾ ആർക്കിടെക്ചർ.
 * Bengali: কোর অ্যাপ্লিকেশন রাউটিং এবং অ্যাক্সেস কন্ট্রোল আর্কিটেকচার।
 * Punjabi: ਕੋਰ ਐਪਲੀਕੇਸ਼ਨ ਰਾਊਟਿੰਗ ਅਤੇ ਐਕਸੈਸ ਕੰਟਰੋਲ ਆਰਕੀਟੈਕਚਰ।
 * Odia: କୋର୍ ଆପ୍ଲିକେସନ୍ ରାଉଟିଂ ଏବଂ ଆକ୍ସେସ୍ କଣ୍ଟ୍ରୋଲ୍ ଆର୍ଚିଟେକ୍ଚର୍।
 * Assamese: মূল এপ্লিকেচন ৰাউটিং আৰু এক্সেছ কন্ট্ৰোল আৰ্কিটেকচাৰ।
 * Urdu: کور ایپلیکیشن روٹنگ اور رسائی کنٹرول کا فن تعمیر۔
 * Bhojpuri: कोर एप्लीकेशन रूटिंग अउर एक्सेस कंट्रोल आर्किटेक्चर।
 */

import { useContext, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from './main';
import { useAuth } from './context/AuthContext';

// Performance Optimization: Lazy Loading Functional Portals
const PublicDashboard = lazy(() => import('./pages/PublicDashboard'));
const PlanSelection = lazy(() => import('./pages/PlanSelection'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const OrgDashboard = lazy(() => import('./pages/OrgDashboard'));
const VolunteerPortal = lazy(() => import('./pages/VolunteerPortal'));
const SuperAdmin = lazy(() => import('./pages/SuperAdmin'));
const Login = lazy(() => import('./pages/Login'));

// Strict Access Control Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, isLoading } = useAuth();
  const { translations, language, colors } = useContext(AppContext);

  if (isLoading) {
    return (
      <div style={{ backgroundColor: colors.White, color: colors.Black, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
        <span style={{ color: colors.Primary }}>{translations[language]?.loading || "System Loading"}</span>
      </div>
    );
  }

  // Redirect unauthenticated organizations to mandatory plan selection
  if (!user) {
    return <Navigate to="/select-plan" replace />;
  }

  // Restrict access based on strictly defined system roles
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { translations, language, colors } = useContext(AppContext);

  return (
    <BrowserRouter>
      <Suspense fallback={
        <div style={{ backgroundColor: colors.White, color: colors.Black, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
          <span style={{ color: colors.Primary }}>{translations[language]?.loading || "System Loading"}</span>
        </div>
      }>
        <Routes>
          {/* Public Access Routes */}
          <Route path="/" element={<PublicDashboard />} />
          <Route path="/select-plan" element={<PlanSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Secure Organization Routes */}
          <Route path="/org/*" element={
            <ProtectedRoute allowedRoles={['organization']}>
              <OrgDashboard />
            </ProtectedRoute>
          } />

          {/* Secure Volunteer Routes */}
          <Route path="/volunteer/*" element={
            <ProtectedRoute allowedRoles={['volunteer']}>
              <VolunteerPortal />
            </ProtectedRoute>
          } />

          {/* Strictly Restricted Super Admin Routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperAdmin />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;