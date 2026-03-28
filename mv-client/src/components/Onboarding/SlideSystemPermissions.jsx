import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Camera, Lock, Check, ShieldCheck } from 'lucide-react';
import { useOnboardingStore } from '../../store/useOnboardingStore';

const SlideSystemPermissions = ({ onNext }) => {
  const [perms, setPerms] = useState({ camera: false, notifications: false });
  const updatePermissions = useOnboardingStore(state => state.updatePermissions);

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setPerms(prev => ({ ...prev, camera: true }));
      updatePermissions('camera', 'granted');
    } catch (err) {
      console.error("Camera access denied");
    }
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setPerms(prev => ({ ...prev, notifications: true }));
      updatePermissions('notifications', 'granted');
    }
  };

  return (
    <motion.div 
      initial={{ y: 50, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }}
      className="flex flex-col space-y-8 p-6"
    >
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Native Integration</h2>
        <p className="text-slate-500">Grant system-level access for the full Movyra Experience.</p>
      </div>

      <div className="space-y-4">
        <div 
          onClick={requestNotifications}
          className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer 
            ${perms.notifications ? 'border-green-500 bg-green-50' : 'border-slate-100 bg-white shadow-sm'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${perms.notifications ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Push Notifications</p>
              <p className="text-xs text-slate-500">Live delivery status updates</p>
            </div>
          </div>
          {perms.notifications && <Check className="text-green-600 w-6 h-6" />}
        </div>

        <div 
          onClick={requestCamera}
          className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer 
            ${perms.camera ? 'border-green-500 bg-green-50' : 'border-slate-100 bg-white shadow-sm'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${perms.camera ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Optical Scanner</p>
              <p className="text-xs text-slate-500">Scan barcodes & POD receipts</p>
            </div>
          </div>
          {perms.camera && <Check className="text-green-600 w-6 h-6" />}
        </div>
      </div>

      <div className="flex items-center gap-2 justify-center text-slate-400">
        <Lock className="w-4 h-4" />
        <span className="text-xs">Data is encrypted and stored locally.</span>
      </div>

      <button
        onClick={onNext}
        disabled={!perms.camera && !perms.notifications}
        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2"
      >
        <ShieldCheck className="w-5 h-5" />
        Complete Onboarding Setup
      </button>
    </motion.div>
  );
};

export default SlideSystemPermissions;