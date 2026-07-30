import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { uploadUserProfilePicture } from '../../services/pocketbase';
import { 
    ArrowLeft, 
    LogOut,
    User,
    Phone,
    MapPin,
    Camera,
    Save
} from 'lucide-react';

export default function SahayProfile() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        location: '',
        avatarUrl: ''
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    // 2. AUTHENTICATION & DATA FETCHING
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                await fetchUserProfile(user.uid);
            } else {
                navigate('/sahay/auth');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchUserProfile = async (uid) => {
        try {
            const docRef = doc(db, 'sahay_users', uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                setProfileData({
                    name: data.name || '',
                    phone: data.phone || '',
                    location: data.location || '',
                    avatarUrl: data.avatarUrl || ''
                });
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            setErrorMsg("Unable to load profile data.");
        } finally {
            setIsLoading(false);
        }
    };

    // 3. OPERATIONAL LOGIC
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            terminateSession();
            navigate('/sahay');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            let finalAvatarUrl = profileData.avatarUrl;

            // Upload new avatar to PocketBase if a file was selected
            if (avatarFile) {
                finalAvatarUrl = await uploadUserProfilePicture(currentUser.uid, avatarFile);
            }

            // Update Firestore Profile
            const userRef = doc(db, 'sahay_users', currentUser.uid);
            await updateDoc(userRef, {
                name: profileData.name,
                phone: profileData.phone,
                location: profileData.location,
                avatarUrl: finalAvatarUrl
            });

            setProfileData(prev => ({ ...prev, avatarUrl: finalAvatarUrl }));
            setAvatarFile(null);
            setAvatarPreview(null);
            setSuccessMsg("Profile updated securely.");

        } catch (error) {
            console.error("Profile update error:", error);
            setErrorMsg("Failed to save changes. Please try again.");
        } finally {
            setIsSaving(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
                <div className="w-8 h-8 border-2 border-t-transparent border-[#FF6B35] rounded-full animate-spin"></div>
            </div>
        );
    }

    const currentDisplayImage = avatarPreview || profileData.avatarUrl;

    return (
        <div className="min-h-screen font-sans overflow-x-hidden flex flex-col bg-[#FFFFFF] text-[#111111] selection:bg-[#FF6B35] selection:text-white">
            
            <style>
                {`
                  @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                  .animate-fade { animation: fadeIn 0.8s ease-out forwards; }
                `}
            </style>

            <header className="w-full flex items-center justify-between px-6 md:px-12 py-6 border-b border-[#E5E7EB] bg-[#FFFFFF]">
                <button onClick={() => navigate('/sahay')} className="flex items-center gap-2 outline-none font-bold text-[0.9rem] text-[#555555] hover:text-[#111111] transition-colors">
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
            </header>

            <main className="flex-1 w-full max-w-[600px] mx-auto px-6 py-12 animate-fade">
                
                <div className="mb-10 text-center">
                    <h1 className="text-[2.5rem] font-black tracking-tight mb-2 text-[#111111]">
                        Your Profile
                    </h1>
                    <p className="text-[1rem] text-[#555555] font-medium">
                        Manage your personal details and identity.
                    </p>
                </div>

                {errorMsg && (
                    <div className="bg-[#DC2626]/10 border border-[#DC2626] text-[#DC2626] px-4 py-3 rounded-xl mb-6 text-[0.9rem] font-bold text-center">
                        {errorMsg}
                    </div>
                )}
                {successMsg && (
                    <div className="bg-[#16A34A]/10 border border-[#16A34A] text-[#16A34A] px-4 py-3 rounded-xl mb-6 text-[0.9rem] font-bold text-center">
                        {successMsg}
                    </div>
                )}

                <div className="bg-[#F7F7F7] border border-[#E5E7EB] rounded-3xl p-8 shadow-sm">
                    <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
                        
                        {/* Avatar Upload Section */}
                        <div className="flex flex-col items-center justify-center mb-4">
                            <input 
                                type="file" 
                                accept="image/*" 
                                ref={fileInputRef} 
                                onChange={handlePhotoSelect} 
                                className="hidden" 
                            />
                            <div 
                                onClick={() => fileInputRef.current.click()}
                                className="relative w-32 h-32 rounded-full border-2 border-dashed border-[#D1D5DB] hover:border-[#FF6B35] flex items-center justify-center cursor-pointer overflow-hidden group bg-[#FFFFFF] transition-colors"
                            >
                                {currentDisplayImage ? (
                                    <>
                                        <img src={currentDisplayImage} alt="Profile" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-[#111111]/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={24} className="text-[#FFFFFF]" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center text-[#555555] group-hover:text-[#FF6B35] transition-colors">
                                        <Camera size={28} className="mb-2" />
                                        <span className="text-[0.7rem] font-bold uppercase tracking-wider">Upload</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Input Fields */}
                        <div>
                            <label className="block text-[0.85rem] font-bold uppercase tracking-wider text-[#555555] mb-2">Full Name</label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" />
                                <input 
                                    type="text" 
                                    required
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#111111] font-bold text-[0.95rem] outline-none focus:border-[#FF6B35] transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[0.85rem] font-bold uppercase tracking-wider text-[#555555] mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" />
                                <input 
                                    type="tel" 
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                                    placeholder="Add phone number"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#111111] font-bold text-[0.95rem] outline-none focus:border-[#FF6B35] transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[0.85rem] font-bold uppercase tracking-wider text-[#555555] mb-2">Primary Location</label>
                            <div className="relative">
                                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" />
                                <input 
                                    type="text" 
                                    value={profileData.location}
                                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                                    placeholder="City, District"
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#111111] font-bold text-[0.95rem] outline-none focus:border-[#FF6B35] transition-colors"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSaving}
                            className="w-full bg-[#111111] text-[#FFFFFF] py-4 rounded-xl font-black text-[1.05rem] flex items-center justify-center gap-2 hover:bg-[#333333] transition-colors disabled:opacity-50 outline-none mt-4"
                        >
                            {isSaving ? (
                                <><div className="w-5 h-5 border-2 border-t-transparent border-[#FFFFFF] rounded-full animate-spin"></div> Saving Updates...</>
                            ) : (
                                <><Save size={18} /> Save Changes</>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 border-t border-[#E5E7EB] pt-8">
                        <button 
                            onClick={handleSignOut}
                            className="w-full bg-[#FFFFFF] text-[#DC2626] border border-[#E5E7EB] py-4 rounded-xl font-bold text-[1rem] flex items-center justify-center gap-2 hover:border-[#DC2626] hover:bg-[#DC2626]/5 transition-colors outline-none"
                        >
                            <LogOut size={18} /> Log out
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
}