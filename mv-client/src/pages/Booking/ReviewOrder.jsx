import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Wallet, Percent, ShieldCheck } from 'lucide-react';
import useBookingStore from '../../store/useBookingStore';
import ConfirmButton from '../../components/Booking/ConfirmButton';
import apiClient from '../../services/apiClient';

export default function ReviewOrder() {
  const navigate = useNavigate();
  const { pickup, dropoff, priceEstimate, setActiveOrder } = useBookingStore();

  const handlePlaceOrder = async () => {
    try {
      // Real API Call representation
      // const res = await apiClient.post('/bookings', { pickup, dropoff, type: priceEstimate.name });
      // setActiveOrder(res.data);
      const newOrder = { id: `MV${Math.floor(Math.random()*1000)}`, pickup, dropoff };
      setActiveOrder(newOrder);
      navigate(`/tracking-active?id=${newOrder.id}`);
    } catch (err) { console.error(err); }
  };

  if(!pickup) return null;

  return (
    <div className="min-h-screen bg-surfaceBlack text-white pb-32">
      {/* 1. Header */}
      <div className="px-6 pt-14 pb-4"><button onClick={()=>navigate(-1)}><ChevronLeft size={28}/></button></div>
      
      {/* 2. Route Summary */}
      <div className="px-6 mb-6">
        <div className="bg-surfaceDark rounded-[32px] p-6 border border-white/5">
          <p className="text-movyraMint text-xs font-bold uppercase mb-1">Pickup</p>
          <p className="font-medium text-white mb-4">{pickup.address}</p>
          <p className="text-movyraMint text-xs font-bold uppercase mb-1">Dropoff</p>
          <p className="font-medium text-white">{dropoff.address}</p>
        </div>
      </div>

      {/* 3. Fare Breakdown */}
      <div className="px-6 mb-6">
        <div className="bg-surfaceDark rounded-[32px] p-6 border border-white/5">
           <h3 className="font-bold mb-4">Fare Details</h3>
           <div className="flex justify-between mb-2 text-textGray"><span>Base Fare</span><span>₹{Math.round(priceEstimate.price*0.4)}</span></div>
           <div className="flex justify-between font-bold text-lg mt-4 text-white"><span>Total</span><span className="text-movyraMint">₹{priceEstimate.price}</span></div>
        </div>
      </div>

      {/* 4. Payment Options */}
      <div className="px-6 mb-6">
        <h3 className="font-bold mb-4 ml-2">Payment</h3>
        <div className="bg-movyraMint/10 border border-movyraMint rounded-[24px] p-4 flex items-center gap-4"><Wallet className="text-movyraMint"/><span className="font-bold">Movyra Wallet (₹1,240)</span></div>
      </div>

      {/* 5. Addons & Promo */}
      <div className="px-6 mb-8 flex gap-4">
        <div className="flex-1 bg-surfaceDark rounded-2xl p-4 flex items-center justify-center gap-2 border border-white/5"><Percent size={18} className="text-textGray"/> <span className="text-sm">Promo</span></div>
        <div className="flex-1 bg-surfaceDark rounded-2xl p-4 flex items-center justify-center gap-2 border border-white/5"><ShieldCheck size={18} className="text-movyraMint"/> <span className="text-sm">Insured</span></div>
      </div>

      {/* 6. Confirm CTA */}
      <ConfirmButton label="Confirm Booking" onClick={handlePlaceOrder} />
    </div>
  );
}
