import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useBookingStore from '../../store/useBookingStore';
import { calculateDynamicPricing } from '../../services/osrmPricing';
import VehicleCard from '../../components/Booking/VehicleCard';
import ConfirmButton from '../../components/Booking/ConfirmButton';
import { ChevronLeft } from 'lucide-react';

export default function SelectVehicle() {
  const navigate = useNavigate();
  const { pickup, dropoff, vehicleType, setVehicle, setPrice } = useBookingStore();
  const [pricing, setPricing] = useState([]);

  useEffect(() => {
    if(!pickup) return;
    calculateDynamicPricing(pickup, dropoff).then(d => {
      setPricing(d.estimates); setVehicle(d.estimates[0].id); setPrice(d.estimates[0]);
    });
  }, [pickup]);

  return (
    <div className="min-h-screen bg-surfaceBlack text-white flex flex-col pt-14 px-6">
      <button onClick={()=>navigate(-1)} className="mb-6"><ChevronLeft size={28}/></button>
      <h1 className="text-4xl font-bold mb-8">Select Vehicle.</h1>
      <div className="flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory">
        {pricing.map(v => <VehicleCard key={v.id} vehicle={v} isSelected={vehicleType===v.id} onClick={()=>{setVehicle(v.id); setPrice(v);}} />)}
      </div>
      <ConfirmButton label="Review Order" disabled={!vehicleType} onClick={()=>navigate('/booking/review')} />
    </div>
  );
}
