import React from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
export default function ConfirmButton({ onClick, label, disabled, loading, className = "" }) {
  const handlePress = (e) => {
    if (navigator.vibrate) navigator.vibrate(50);
    if (onClick) onClick(e);
  };
  return (
    <div className={`fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-surfaceBlack via-surfaceBlack to-transparent z-50 ${className}`}>
      <button onClick={handlePress} disabled={disabled || loading} className="w-full bg-movyraMint text-surfaceBlack py-4 rounded-pill font-bold text-lg flex items-center justify-center gap-2 shadow-mintGlow disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]">
        {loading ? <Loader2 size={24} className="animate-spin text-surfaceBlack" /> : <>{label} <ArrowRight size={20} /></>}
      </button>
    </div>
  );
}
