import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Briefcase, LogOut, ChevronRight, Settings, Shield, CreditCard, MessageSquare } from 'lucide-react';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({ email: '', uid: '' });

  useEffect(() => {
    // Real logic: Retrieve active authenticated user from Firebase
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserProfile({
        email: currentUser.email,
        uid: currentUser.uid,
      });
    } else {
      // Fallback to local storage if Firebase hasn't hydrated state yet
      const stored = localStorage.getItem('movyra_user');
      if (stored) {
        setUserProfile(JSON.parse(stored));
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Real logic: Sign out from Firebase and clear JWT tokens
      await signOut(auth);
      localStorage.removeItem('movyra_jwt');
      localStorage.removeItem('movyra_user');
      navigate('/auth-login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans overflow-y-auto pb-24">
      
      {/* User Header Profile Block */}
      <div className="px-6 pt-12 pb-8 flex items-center gap-5 border-b border-gray-100">
        <div className="w-20 h-20 bg-[#F3F3F3] rounded-full flex items-center justify-center shrink-0 border border-gray-200 shadow-sm">
          <User size={36} className="text-gray-400" />
        </div>
        <div className="flex-1 overflow-hidden">
          <h1 className="text-2xl font-bold tracking-tight text-black truncate">
            {userProfile.email ? userProfile.email.split('@')[0] : 'User'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold font-mono">
              {userProfile.uid ? userProfile.uid.substring(0, 8) : 'Loading...'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8">
        
        {/* Saved Places Section */}
        <div>
          <h2 className="text-lg font-bold text-black mb-3 px-2">Saved Places</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-4 p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-[#F3F3F3] rounded-full flex items-center justify-center shrink-0">
                <Briefcase size={20} className="text-black fill-black" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[16px] text-black">Work</p>
                <p className="text-sm text-gray-500 font-medium truncate">1455 Market St, San Francisco</p>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
            
            <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-[#F3F3F3] rounded-full flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-black fill-black" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-[16px] text-black">Home</p>
                <p className="text-sm text-gray-500 font-medium truncate">903 Sunrose Terr, Sunnyvale</p>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Account Options */}
        <div>
          <h2 className="text-lg font-bold text-black mb-3 px-2">Account</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {[
              { label: 'Settings', icon: Settings },
              { label: 'Payment Methods', icon: CreditCard },
              { label: 'Safety Tools', icon: Shield },
              { label: 'Help & Support', icon: MessageSquare },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.label} 
                  className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                    index !== 3 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Icon size={20} className="text-gray-600" />
                    <span className="font-bold text-[16px] text-black">{item.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-4">
          <button 
            onClick={handleLogout}
            className="w-full bg-[#F3F3F3] text-red-600 py-4 rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-100 border border-transparent transition-all active:scale-[0.98]"
          >
            <LogOut size={20} /> Log out
          </button>
          <p className="text-center text-xs text-gray-400 font-medium mt-4">Movyra App v1.0.0</p>
        </div>

      </div>
    </div>
  );
}