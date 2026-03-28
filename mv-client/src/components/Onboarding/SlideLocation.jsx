import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, CheckCircle, ShieldAlert } from 'lucide-react';
import { useOnboardingStore } from '../../store/useOnboardingStore';

const SlideLocation = ({ onNext }) => {
  const [status, setStatus] = useState('idle'); // idle, checking, success, error
  const setUserLocation = useOnboardingStore(state => state.setUserLocation);

  const verifyLocation = () => {
    setStatus('checking');
    if (!navigator.geolocation) {
      setStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setStatus('success');
      },
      () => setStatus('error'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-6 text-center space-y-8"
    >
      <div className={`p-6 rounded-full ${status === 'success' ? 'bg-green-100' : 'bg-blue-100'}`}>
        {status === 'success' ? (
          <CheckCircle className="w-16 h-16 text-green-600" />
        ) : (
          <MapPin className="w-16 h-16 text-blue-600 animate-pulse" />
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Real-Time Coverage</h2>
        <p className="text-slate-500 max-w-xs mx-auto">
          We need to verify your physical presence to ensure real-time tracking accuracy in your zone.
        </p>
      </div>

      {status === 'error' && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          <ShieldAlert className="w-5 h-5" />
          <span>Location access denied or timeout.</span>
        </div>
      )}

      <button
        onClick={status === 'success' ? onNext : verifyLocation}
        disabled={status === 'checking'}
        className={`w-full py-4 rounded-2xl font-semibold transition-all flex items-center justify-center space-x-2 
          ${status === 'success' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-900'}`}
      >
        <Navigation className="w-5 h-5" />
        <span>
          {status === 'checking' ? 'Verifying Coordinates...' : 
           status === 'success' ? 'Location Confirmed - Proceed' : 'Verify My Location'}
        </span>
      </button>
    </motion.div>
  );
};

export default SlideLocation;