import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Zap, Activity, Globe, Info } from 'lucide-react';
import { useOnboardingStore } from '../../store/useOnboardingStore';

const SlideNetwork = ({ onNext }) => {
  const [stats, setStats] = useState({ type: 'Checking...', speed: 0, rtt: 0 });
  const updateNetwork = useOnboardingStore(state => state.updateNetwork);

  useEffect(() => {
    const checkNetwork = () => {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn) {
        const data = {
          effectiveType: conn.effectiveType,
          downlink: conn.downlink,
          rtt: conn.rtt
        };
        setStats({ type: data.effectiveType, speed: data.downlink, rtt: data.rtt });
        updateNetwork(data);
      }
    };

    checkNetwork();
    const interval = setInterval(checkNetwork, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (stats.speed > 5) return 'text-green-500';
    if (stats.speed > 1) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="flex flex-col items-center p-6 space-y-8"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping" />
        <div className="relative bg-white p-8 rounded-full shadow-2xl">
          <Wifi className={`w-16 h-16 ${getStatusColor()}`} />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Live Telemetry</h2>
        <p className="text-slate-500">Verifying network stability for live parcel tracking and VoIP communication.</p>
      </div>

      <div className="w-full grid grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-400 uppercase">Latency</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.rtt} <span className="text-sm font-normal">ms</span></p>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-400 uppercase">Throughput</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.speed} <span className="text-sm font-normal">Mbps</span></p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-2xl text-xs">
        <Info className="w-5 h-5 shrink-0" />
        <p>Your current connection type is <strong>{stats.type.toUpperCase()}</strong>. High-speed tracking requires at least 2Mbps downlink.</p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
      >
        <Activity className="w-5 h-5" />
        Proceed with Connection
      </button>
    </motion.div>
  );
};

export default SlideNetwork;