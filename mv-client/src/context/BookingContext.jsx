import React, { createContext, useContext, useState } from 'react';

// Create the Context
const BookingContext = createContext(null);

// Custom hook for consuming the context
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

// Default empty state for a new booking
const initialBookingState = {
  pickup: null,      // { address: string, lat: number, lng: number }
  dropoff: null,     // { address: string, lat: number, lng: number }
  parcelType: null,  // { id: string, name: string, weightLimit: string }
  vehicle: null,     // { id: string, name: string, price: number, eta: string }
  distanceKm: 0,
  durationMins: 0,
  trackingId: null,  // Set after backend confirmation
};

// Provider Component
export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState(initialBookingState);

  // Action: Set Pickup Location
  const setPickup = (location) => {
    setBookingData((prev) => ({ ...prev, pickup: location }));
  };

  // Action: Set Dropoff Location
  const setDropoff = (location) => {
    setBookingData((prev) => ({ ...prev, dropoff: location }));
  };

  // Action: Set Route Metrics (Distance/Time calculated by MapLibre/OSRM)
  const setRouteMetrics = (distanceKm, durationMins) => {
    setBookingData((prev) => ({ ...prev, distanceKm, durationMins }));
  };

  // Action: Set Parcel Type
  const setParcelType = (parcelInfo) => {
    setBookingData((prev) => ({ ...prev, parcelType: parcelInfo }));
  };

  // Action: Set Selected Vehicle and Price
  const setVehicle = (vehicleInfo) => {
    setBookingData((prev) => ({ ...prev, vehicle: vehicleInfo }));
  };

  // Action: Set Tracking ID after successful backend order creation
  const setTrackingId = (id) => {
    setBookingData((prev) => ({ ...prev, trackingId: id }));
  };

  // Action: Reset entirely for a new order
  const resetBooking = () => {
    setBookingData(initialBookingState);
  };

  return (
    <BookingContext.Provider
      value={{
        bookingData,
        setPickup,
        setDropoff,
        setRouteMetrics,
        setParcelType,
        setVehicle,
        setTrackingId,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};