/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Global Authentication and Subscription State Management.
 * 
 * English: Global Authentication and Subscription State Management.
 * Hindi: वैश्विक प्रमाणीकरण और सदस्यता स्थिति प्रबंधन।
 * Hinglish: Global Authentication aur Subscription State Management.
 * Marathi: जागतिक प्रमाणीकरण आणि सदस्यता स्थिती व्यवस्थापन.
 * Gujarati: વૈશ્વિક પ્રમાણીકરણ અને સબ્સ્ક્રિપ્શન સ્થિતિ સંચાલન.
 * Telugu: గ్లోబల్ అథెంటికేషన్ మరియు సబ్‌స్క్రిప్షన్ స్టేట్ మేనేజ్‌మెంట్.
 * Tamil: உலகளாவிய அங்கீகாரம் மற்றும் சந்தா நிலை மேலாண்மை.
 * Kannada: ಜಾಗತಿಕ ದೃಢೀಕರಣ ಮತ್ತು ಚಂದಾದಾರಿಕೆ ಸ್ಥಿತಿ ನಿರ್ವಹಣೆ.
 * Malayalam: ആഗോള ആധികാരികതയും സബ്സ്ക്രിപ്ഷൻ സ്റ്റേറ്റ് മാനേജ്മെന്റും.
 * Bengali: গ্লোবাল প্রমাণীকরণ এবং সাবস্ক্রিপশন স্ট্যাটাস ম্যানেজমেন্ট।
 * Punjabi: ਗਲੋਬਲ ਪ੍ਰਮਾਣਿਕਤਾ ਅਤੇ ਗਾਹਕੀ ਸਥਿਤੀ ਪ੍ਰਬੰਧਨ।
 * Odia: ଗ୍ଲୋବାଲ୍ ପ୍ରମାଣୀକରଣ ଏବଂ ସବସ୍କ୍ରିପସନ୍ ସ୍ଥିତି ପରିଚାଳନା।
 * Assamese: গ্লোবেল প্ৰমাণীকৰণ আৰু চাবস্ক্ৰিপচন স্থিতি ব্যৱস্থাপনা।
 * Urdu: عالمی تصدیق اور سبسکرپشن اسٹیٹ مینجمنٹ۔
 * Bhojpuri: ग्लोबल प्रमाणीकरण अउर सदस्यता स्थिति प्रबंधन।
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

// Initialize context
const AuthContext = createContext();

// Export custom hook for global access
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [planTier, setPlanTier] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Strict Super Admin Evaluation
        const superAdminCheck = firebaseUser.email === 'testcodecfg@gmail.com';
        setIsSuperAdmin(superAdminCheck);

        if (superAdminCheck) {
          setRole('superadmin');
          setPlanTier('Impact'); // Super admin inherits maximum privileges
        }

        // Establish real-time connection to user metadata for role and subscription tier
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            
            if (!superAdminCheck) {
              setRole(userData.role || 'public');
              setPlanTier(userData.planTier || 'Free');
            }
          } else {
            if (!superAdminCheck) {
              setRole('public');
              setPlanTier('Free');
            }
          }
          setIsLoading(false);
        }, (error) => {
          console.error("System Error: Failed to fetch secure user metadata.", error);
          setIsLoading(false);
        });

        return () => unsubscribeDoc();
      } else {
        // Reset state on explicit sign out or session expiration
        setUser(null);
        setRole(null);
        setPlanTier(null);
        setIsSuperAdmin(false);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const logout = () => {
    const auth = getAuth();
    return signOut(auth);
  };

  const value = {
    user,
    role,
    planTier,
    isSuperAdmin,
    isLoading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}