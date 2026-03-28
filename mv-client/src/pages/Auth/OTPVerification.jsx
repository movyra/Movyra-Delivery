import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { ShieldCheck } from 'lucide-react';
export default function OTPVerification() {
  const loc = useLocation(); const nav = useNavigate(); const login = useAuthStore(s=>s.login);
  const [code, setCode] = useState('');
  const verify = () => { login({ id: 'USR_1', name: 'Kretya User', phone: loc.state?.phone }, 'MOCK_TOKEN'); nav('/dashboard-home'); };
  return (
    <div className="min-h-screen bg-surfaceBlack text-white px-8 pt-20">
      <ShieldCheck size={56} className="text-movyraMint mb-8" />
      <h1 className="text-4xl font-bold mb-4">Enter code.</h1>
      <input type="text" value={code} onChange={e=>setCode(e.target.value)} maxLength={4} className="w-full bg-surfaceDarker border-2 border-movyraMint rounded-2xl p-4 text-3xl tracking-widest text-center outline-none mb-10" />
      <button onClick={verify} disabled={code.length!==4} className="w-full bg-movyraMint text-surfaceBlack py-4 rounded-pill font-bold">Confirm</button>
    </div>
  );
}
