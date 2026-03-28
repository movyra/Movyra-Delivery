import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import useBookingStore from '../../store/useBookingStore';
import { calculateDynamicPricing } from '../../services/osrmPricing';
import VehicleCard from '../../components/Booking/VehicleCard';
import ConfirmButton from '../../components/Booking/ConfirmButton';

export default function SelectVehicle() {
  const navigate = useNavigate();
  const { pickup, dropoff, vehicleType, setVehicle, setPrice } = useBookingStore();
  
  const [pricingData, setPricingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If locations are missing, force redirect back
    if (!pickup || !dropoff) {
      navigate('/booking/set-location');
      return;
    }

    const fetchPricing = async () => {
      setIsLoading(true);
      const data = await calculateDynamicPricing(pickup, dropoff);
      if (data && data.estimates) {
        setPricingData(data.estimates);
        // Auto-select first vehicle
        handleSelectVehicle(data.estimates[0]);
      }
      setIsLoading(false);
    };

    fetchPricing();
  }, [pickup, dropoff]);

  const handleSelectVehicle = (vehicle) => {
    setVehicle(vehicle.id);
    setPrice(vehicle);
  };

  const handleConfirm = () => {
    navigate('/booking/review');
  };

  return (
    <div className="min-h-screen bg-surfaceBlack text-white flex flex-col font-sans">
      <div className="px-6 pt-14 pb-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-surfaceDark rounded-full transition-colors">
          <ChevronLeft size={28} className="text-white" />
        </button>
      </div>

      <div className="px-8 mt-4 flex-1 flex flex-col">
        <h1 className="text-4xl font-bold mb-3 tracking-tight">Select <br/>Vehicle.</h1>
        <p className="text-textGray text-lg mb-10">Choose the right capacity for your shipment.</p>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
             <div className="w-10 h-10 border-4 border-movyraMint border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="w-full relative -mx-8 px-8">
            {/* Horizontal Snapping Scroll for Vehicles */}
            <div className="flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              {pricingData.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  isSelected={vehicleType === vehicle.id}
                  onClick={() => handleSelectVehicle(vehicle)}
                />
              ))}
              <div className="min-w-[20px] snap-center"></div> {/* Spacing at end */}
            </div>
          </div>
        )}
      </div>

      <ConfirmButton 
        label="Review Order" 
        disabled={!vehicleType || isLoading}
        onClick={handleConfirm}
      />
    </div>
  );
}