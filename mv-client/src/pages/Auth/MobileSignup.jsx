import React from 'react';
import { useNavigate } from 'react-router-dom';
export default function MobileSignup() {
  const nav = useNavigate();
  return <div className="p-8 bg-surfaceBlack text-white min-h-screen" onClick={()=>nav('/auth-login')}>Redirecting to Login...</div>;
}
