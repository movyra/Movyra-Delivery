import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import BottomNavBar from './Navigation/BottomNavBar';
import useAuthStore from '../store/useAuthStore';

export default function MobileAppLayout() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => { if (!isAuthenticated) navigate('/auth-login', { replace: true }); }, [isAuthenticated, navigate]);
  if (!isAuthenticated) return null;
  return (
    <div className="relative min-h-screen bg-surfaceBlack w-full overflow-hidden">
      <main className="w-full h-full overflow-y-auto pb-[100px] pt-safe"><Outlet /></main>
      <BottomNavBar />
    </div>
  );
}
