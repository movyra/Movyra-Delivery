import React, { useState, useEffect } from 'react';
import UserHeader from '../../components/Dashboard/UserHeader';
import TrackingSearch from '../../components/Dashboard/TrackingSearch';
import ActiveShippingCard from '../../components/Dashboard/ActiveShippingCard';
import RecentShippingList from '../../components/Dashboard/RecentShippingList';
import BottomNavBar from '../../components/Navigation/BottomNavBar';
import useAuthStore from '../../store/useAuthStore';
import useBookingStore from '../../store/useBookingStore';

export default function MobileHome() {
  const { user } = useAuthStore();
  const { activeOrder } = useBookingStore();
  
  // Real implementation: Fetch from API. Using local state for UI logic presentation.
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);

  useEffect(() => {
    // Populate with real logic based on API response
    // Simulated fetch for the exact data in the UI
    setCurrentOrder({
      id: "IDJAK142041",
      currentLocation: "Jl Bendungan Raya,\nJakarta Timur",
      status: "in_transit"
    });

    setRecentDeliveries([
      { id: "IDSBY122032", origin: "Jakarta", destination: "Surabaya" },
      { id: "IDBDG141731", origin: "Jakarta", destination: "Bandung" },
      { id: "IDSMRG201737", origin: "Jakarta", destination: "Semarang" }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-surfaceBlack text-white font-sans pb-32">
      {/* 1. Profile Header */}
      <UserHeader 
        user={{ name: user?.name || "Kretya Studio", location: "Jakarta, Indonesia", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kretya" }} 
        notificationsCount={4} 
      />

      {/* 2. Search & Scanner */}
      <TrackingSearch />

      {/* 3. Active Order Widget */}
      {currentOrder && <ActiveShippingCard activeOrder={currentOrder} />}

      {/* 4. History List */}
      <RecentShippingList deliveries={recentDeliveries} />

      {/* 5. Persistent Bottom Navigation */}
      <BottomNavBar />
    </div>
  );
}