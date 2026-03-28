import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, Navigation, Wallet, CreditCard, Banknote } from 'lucide-react';
import useBookingStore from '../../store/useBookingStore';
import ConfirmButton from '../../components/Booking/ConfirmButton';

export default function ReviewOrder() {
  const navigate = useNavigate();
  const { pickup, dropoff, priceEstimate, activeOrder, setActiveOrder } = useBookingStore();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isConfirming, setIsConfirming] = useState(false);

  const handlePlaceOrder = () => {
    setIsConfirming(true);
    
    // Real Logic: Send payload to API. Using timeout to simulate network latency.
    setTimeout(() => {
      const newOrder = {
        id: `MV${Math.floor(Math.random() * 1000000)}`,
        status: 'searching',
        pickup,
        dropoff,
        price: priceEstimate.price,
        vehicleType: priceEstimate.name,
        currentLocation: pickup.address
      };
      
      setActiveOrder(newOrder);
      setIsConfirming(false);
      // Navigate to tracking via ID
      navigate(`/tracking-active?id=${newOrder.id}`, { replace: true });
    }, 1500);
  };

  if (!pickup || !dropoff || !priceEstimate) {
    return null; // Will be caught by route guard in real app
  }

  return (
    <div className="min-h-screen bg-surfaceBlack text-white flex flex-col font-sans pb-32">
      <div className="px-6 pt-14 pb-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-surfaceDark rounded-full transition-colors">
          <ChevronLeft size={28} className="text-white" />
        </button>
        <span className="text-sm font-bold text-textGray tracking-widest uppercase">Summary</span>
      </div>

      <div className="px-6 mt-4 flex-1">
        {/* Route Summary Card */}
        <div className="bg-surfaceDark rounded-[32px] p-6 mb-6 border border-white/5 shadow-2xl">
           <div className="relative pl-8 space-y-6">
            <div className="absolute left-[11px] top-[12px] bottom-[12px] w-[2px] bg-surfaceDarker"></div>
            
            <div className="relative">
              <div className="absolute -left-8 top-1 w-3 h-3 rounded-full bg-surfaceDarker border-2 border-textGray z-10"></div>
              <p className="text-textGray text-xs font-bold uppercase tracking-wider mb-1">Pickup</p>
              <p className="font-medium text-white text-sm">{pickup.address}</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[35px] top-0 w-4 h-4 rounded-full bg-movyraMint/20 flex items-center justify-center z-10">
                 <div className="w-2 h-2 rounded-full bg-movyraMint shadow-mintGlow"></div>
              </div>
              <p className="text-movyraMint text-xs font-bold uppercase tracking-wider mb-1">Dropoff</p>
              <p className="font-medium text-white text-sm">{dropoff.address}</p>
            </div>
          </div>
        </div>

        {/* Fare Breakdown */}
        <div className="bg-surfaceDark rounded-[32px] p-6 mb-6 border border-white/5">
          <h3 className="font-bold text-white mb-4">Fare Details</h3>
          <div className="flex justify-between items-center mb-3">
            <span className="text-textGray text-sm">Base Fare ({priceEstimate.name})</span>
            <span className="text-white font-medium">₹{Math.round(priceEstimate.price * 0.4)}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-textGray text-sm">Distance ({priceEstimate.distance} km)</span>
            <span className="text-white font-medium">₹{Math.round(priceEstimate.price * 0.6)}</span>
          </div>
          <div className="h-px w-full bg-white/5 mb-4"></div>
          <div className="flex justify-between items-center">
            <span className="text-white font-bold">Total Estimate</span>
            <span className="text-2xl font-black text-movyraMint">₹{priceEstimate.price}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <h3 className="font-bold text-white mb-4 ml-2">Payment Method</h3>
        <div className="space-y-3">
          {[
            { id: 'cash', icon: Banknote, label: 'Cash on Delivery' },
            { id: 'wallet', icon: Wallet, label: 'Movyra Wallet (₹1,240)' },
            { id: 'card', icon: CreditCard, label: '•••• 4242' },
          ].map(method => (
            <div 
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
                paymentMethod === method.id 
                  ? 'bg-movyraMint/10 border-movyraMint' 
                  : 'bg-surfaceDark border-white/5 hover:bg-surfaceDarker'
              }`}
            >
              <method.icon size={24} className={paymentMethod === method.id ? 'text-movyraMint' : 'text-textGray'} />
              <span className={`font-medium ${paymentMethod === method.id ? 'text-white' : 'text-textGray'}`}>
                {method.label}
              </span>
              {paymentMethod === method.id && (
                <div className="ml-auto w-4 h-4 rounded-full bg-movyraMint border-2 border-surfaceBlack shadow-mintGlow"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConfirmButton 
        label="Confirm Booking" 
        loading={isConfirming}
        onClick={handlePlaceOrder}
      />
    </div>
  );
}