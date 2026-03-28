import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Delete } from 'lucide-react';
export default function MobileLogin() {
  const navigate = useNavigate(); const [phone, setPhone] = useState('');
  const type = (k) => k==='del' ? setPhone(p=>p.slice(0,-1)) : phone.length<10 && setPhone(p=>p+k);
  const handleSend = () => navigate('/auth/otp', { state: { phone: `+91${phone}` } });
  return (
    <div className="min-h-screen bg-surfaceBlack text-white flex flex-col font-sans">
      <div className="px-6 pt-14 pb-4"><button onClick={()=>navigate(-1)}><ChevronLeft size={28}/></button></div>
      <div className="px-8 flex-1 flex flex-col">
        <h1 className="text-4xl font-bold mb-3 tracking-tight">Welcome <br/>back.</h1>
        <div className="flex items-center gap-4 mt-8 mb-auto">
          <div className="bg-surfaceDarker px-5 py-4 rounded-2xl border border-white/5 font-bold text-xl text-textGray">+91</div>
          <div className="flex-1 bg-surfaceDarker px-5 py-4 rounded-2xl border border-white/5"><span className="text-2xl font-bold tracking-widest">{phone || '0000000000'}</span></div>
        </div>
      </div>
      <div className="bg-surfaceDark rounded-t-[40px] px-6 pt-8 pb-12">
        <div className="grid grid-cols-3 gap-y-6 gap-x-4 mb-10 text-3xl font-medium text-center">
          {[1,2,3,4,5,6,7,8,9].map(n => <button key={n} onClick={()=>type(n.toString())}>{n}</button>)}
          <div className="col-start-2"><button onClick={()=>type('0')}>0</button></div>
          <div className="col-start-3"><button onClick={()=>type('del')}><Delete size={32}/></button></div>
        </div>
        <button onClick={handleSend} disabled={phone.length!==10} className="w-full bg-movyraMint text-surfaceBlack py-4 rounded-pill font-bold disabled:opacity-50">Send Code</button>
      </div>
    </div>
  );
}
