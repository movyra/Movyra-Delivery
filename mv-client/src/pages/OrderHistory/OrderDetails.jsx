import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ChevronLeft, MapPin, Clock, Download, 
  Loader2, AlertCircle, CheckCircle2, Truck,
  Package, ShieldAlert, Diamond, UserCircle2, Crosshair, Receipt
} from 'lucide-react';

// Core PDF Generation
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Real Database Integration
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// New Modular UI Components
import OrderFloatingStatusCard from '../../components/OrderDetails/OrderFloatingStatusCard';
import OrderSegmentedToggle from '../../components/OrderDetails/OrderSegmentedToggle';
import OrderInfoListCard from '../../components/OrderDetails/OrderInfoListCard';
import OrderAnalyticsChart from '../../components/OrderDetails/OrderAnalyticsChart';

/**
 * PAGE: HISTORICAL ORDER DETAILS
 * Architecture: 45vh/55vh Split Screen (Uber/Analytics Style)
 * Features: 
 * - Real Firestore Fetching
 * - Leaflet Map with Custom Red Destination Pin & Route
 * - Dynamic Floating Status Card (Two-dot timeline)
 * - Segmented Toggles (Details, Timeline, Receipt)
 * - PDF Invoice Generation Engine
 */

const TABS = [
  { id: 'details', label: 'Details' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'receipt', label: 'Receipt' }
];

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const db = getFirestore();
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const routeLayer = useRef(null);
  const receiptRef = useRef(null);

  // Local Data & UI State
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // ============================================================================
  // REAL-TIME FIRESTORE DATA SYNC
  // ============================================================================
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!id) return;
        const orderRef = doc(db, 'orders', id);
        const snapshot = await getDoc(orderRef);
        
        if (snapshot.exists()) {
          setOrder({ id: snapshot.id, ...snapshot.data() });
        } else {
          setError('Order not found or has been removed from the database.');
        }
      } catch (err) {
        console.error("Firestore Fetch Error:", err);
        setError('Failed to securely fetch order details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, db]);

  // ============================================================================
  // OPENSTREETMAP ENGINE (LEAFLET PLOTTING & ROUTING)
  // ============================================================================
  useEffect(() => {
    if (!order || !mapContainer.current || map.current) return;

    // Determine Map Center
    const pickupLat = order.pickup?.lat || 28.6139;
    const pickupLng = order.pickup?.lng || 77.2090;

    // Initialize Leaflet Map (Raster based - stable for split-screen)
    map.current = L.map(mapContainer.current, {
      center: [pickupLat, pickupLng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false,
      touchZoom: true
    });

    // Muted Light Theme Layer (Matches Reference Aesthetic)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map.current);

    const validDropoffs = order.dropoffs || (order.dropoff ? [order.dropoff] : []);
    const points = [];

    // Plot Pickup Marker (Hollow Dot)
    if (order.pickup?.lat) {
      const pickupIcon = L.divIcon({
        className: '',
        html: `<div class="w-4 h-4 bg-white border-[4px] border-[#111111] rounded-full shadow-md"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      L.marker([order.pickup.lat, order.pickup.lng], { icon: pickupIcon }).addTo(map.current);
      points.push([order.pickup.lat, order.pickup.lng]);
    }

    // Plot Dropoff Markers (Static Red Pin matching image_5acec6.png)
    validDropoffs.forEach((drop) => {
      if (drop?.lat) {
        const dropIcon = L.divIcon({
          className: '',
          html: `<div class="w-[22px] h-[22px] bg-[#FF3B30] rounded-full shadow-[0_4px_12px_rgba(255,59,48,0.5)] border-[3px] border-white"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        L.marker([drop.lat, drop.lng], { icon: dropIcon }).addTo(map.current);
        points.push([drop.lat, drop.lng]);
      }
    });

    // Fetch and draw the OSRM route polyline
    if (order.pickup?.lat && validDropoffs.length > 0 && validDropoffs[0].lat) {
      const fetchHistoricalRoute = async () => {
        try {
          const coords = [order.pickup, ...validDropoffs].map(s => `${s.lng},${s.lat}`).join(';');
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?geometries=geojson&overview=full`);
          const data = await res.json();
          
          if (data.code === 'Ok') {
            const routeCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            
            routeLayer.current = L.polyline(routeCoords, {
              color: '#111111', // Solid black route line
              weight: 4,
              opacity: 0.8,
              lineJoin: 'round'
            }).addTo(map.current);
            
            // Auto-fit map to route bounds with padding for the bottom card
            map.current.fitBounds(routeLayer.current.getBounds(), { paddingTopLeft: [50, 100], paddingBottomRight: [50, 80] });
          }
        } catch (err) {
          console.error("OSRM Route History Error:", err);
          if (points.length > 1) map.current.fitBounds(L.latLngBounds(points), { padding: [50, 80] });
        }
      };
      fetchHistoricalRoute();
    } else if (points.length > 1) {
      map.current.fitBounds(L.latLngBounds(points), { padding: [50, 80] });
    }

    setTimeout(() => map.current?.invalidateSize(), 200);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [order]);

  // ============================================================================
  // PDF INVOICE GENERATOR
  // ============================================================================
  const handleDownloadInvoice = async () => {
    if (!receiptRef.current || !order) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Movyra_Invoice_${order.id.slice(-8)}.pdf`);
    } catch (err) {
      console.error("PDF Engine Error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  // ============================================================================
  // LOADING & ERROR STATES
  // ============================================================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F2F4F7] flex flex-col items-center justify-center font-sans">
        <Loader2 size={40} className="animate-spin text-[#111111] mb-4" />
        <p className="text-[14px] font-bold text-gray-500 uppercase tracking-widest">Decrypting Record</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F2F4F7] flex flex-col items-center justify-center p-6 text-center font-sans">
        <AlertCircle size={48} className="text-red-500 mb-4" strokeWidth={2} />
        <h1 className="text-[24px] font-black text-[#111111] mb-2">Record Unavailable</h1>
        <p className="text-[15px] font-medium text-gray-500 mb-8">{error}</p>
        <button onClick={() => navigate(-1)} className="px-8 py-4 bg-[#111111] text-white rounded-full font-bold shadow-lg active:scale-95 transition-transform">Go Back</button>
      </div>
    );
  }

  // Formatting Utilities
  const dateObj = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
  const formattedDate = dateObj.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  const totalAmount = order.pricing?.estimatedPrice || order.totalFare || 0;
  const taxableValue = totalAmount / 1.18;
  const cgst = taxableValue * 0.09;
  const sgst = taxableValue * 0.09;
  const dropoffsArray = order.dropoffs || (order.dropoff ? [order.dropoff] : []);

  // Center Map Action
  const handleRecenter = () => {
    if (map.current && routeLayer.current) {
      map.current.fitBounds(routeLayer.current.getBounds(), { paddingTopLeft: [50, 100], paddingBottomRight: [50, 80] });
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#F2F4F7] overflow-hidden font-sans flex flex-col">
      
      {/* ========================================================= */}
      {/* TOP HALF: 45vh MAP CANVAS */}
      {/* ========================================================= */}
      <div className="relative w-full h-[45vh] shrink-0 z-10">
        <div ref={mapContainer} className="absolute inset-0 bg-[#e5e7eb]" />

        {/* Floating Top-Left Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-12 left-6 z-[2000] w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center text-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all"
        >
          <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
        </button>

        {/* Floating Top-Right Download Button (Visible only on Receipt Tab) */}
        <AnimatePresence>
          {activeTab === 'receipt' && (
            <motion.button 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleDownloadInvoice}
              disabled={isDownloading}
              className="absolute top-12 right-6 z-[2000] w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center text-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all disabled:opacity-50"
            >
              {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} strokeWidth={2.5} />}
            </motion.button>
          )}
        </AnimatePresence>

        {/* OVERLAPPING FLOATING CARD */}
        <div className="absolute -bottom-8 left-5 right-5 z-[2000]">
          <OrderFloatingStatusCard 
            pickupAddress={order.pickup?.address}
            dropoffAddress={dropoffsArray[0]?.address}
            statusText={order.status === 'delivered' ? 'Order Delivered' : order.status === 'cancelled' ? 'Order Cancelled' : 'In Transit'}
            subText={formattedDate}
            onActionClick={handleRecenter}
            actionIcon={Crosshair}
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM HALF: 55vh SCROLLABLE CONTENT */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto pt-16 pb-8 px-5 space-y-4 z-0 relative">
        
        {/* Segmented Tab Toggles */}
        <OrderSegmentedToggle 
          tabs={TABS} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        <AnimatePresence mode="wait">
          
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 pt-2">
              
              <OrderInfoListCard 
                icon={UserCircle2}
                title="Assigned Partner"
                subtitle={order.selectedBid?.driverName || "Standard Partner"}
                rightValue={order.selectedBid?.vehicleType || "Moto"}
                rightSubValue="Vehicle Class"
              />

              <OrderInfoListCard 
                icon={Package}
                title="Package Configuration"
                subtitle={order.packageDetails?.itemType || "Standard Package"}
                rightValue={order.packageDetails?.isFragile ? "Fragile" : "Standard"}
                rightSubValue="Handling Type"
                alertMode={order.packageDetails?.isFragile}
              />

              {order.packageDetails?.requiresSecureOTP && (
                <OrderInfoListCard 
                  icon={Diamond}
                  title="Delivery Authentication"
                  subtitle="End-to-End Secure OTP"
                  rightValue={order.packageDetails.secureOTP || "****"}
                  rightSubValue="Verification PIN"
                />
              )}
            </motion.div>
          )}

          {/* TAB 2: TIMELINE */}
          {activeTab === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 pt-2">
              
              <OrderInfoListCard 
                icon={CheckCircle2}
                title={`Order Placed • ${formattedDate.split(',')[1]}`}
                subtitle={order.pickup?.address}
                rightValue="Origin"
                rightSubValue="Pickup Node"
              />

              {dropoffsArray.map((drop, idx) => (
                <OrderInfoListCard 
                  key={idx}
                  icon={MapPin}
                  title={order.status === 'delivered' ? "Delivery Complete" : `Pending Dropoff ${idx + 1}`}
                  subtitle={drop.address}
                  rightValue={`Stop ${idx + 1}`}
                  rightSubValue="Destination"
                />
              ))}
            </motion.div>
          )}

          {/* TAB 3: RECEIPT & ANALYTICS */}
          {activeTab === 'receipt' && (
            <motion.div key="receipt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 pt-2">
              
              {/* Dynamic Spending Analytics Chart */}
              <OrderAnalyticsChart 
                totalValue={totalAmount.toFixed(2)}
                currency="₹"
                dateRange={`Order ID: ${order.id.slice(-8).toUpperCase()}`}
                data={[
                  { label: 'Base Fare', value: taxableValue.toFixed(2), isActive: false },
                  { label: 'Taxes', value: (cgst + sgst).toFixed(2), isActive: false },
                  { label: 'Total', value: totalAmount.toFixed(2), isActive: true }
                ]}
              />

              {/* Secret Printable Receipt Container (Hidden structurally but used for PDF canvas) */}
              <div className="absolute top-[-9999px] left-[-9999px]">
                <div ref={receiptRef} className="bg-white p-8 w-[600px] text-black">
                  <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-dashed border-gray-200">
                    <div>
                      <h2 className="text-[32px] font-black tracking-tight leading-none mb-1">Movyra</h2>
                      <span className="text-[14px] font-bold text-gray-500 uppercase tracking-widest">Tax Invoice</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[16px] font-black uppercase">{order.id.slice(-8)}</span>
                      <span className="block text-[13px] font-bold text-gray-500 mt-1">{formattedDate.split(',')[0]}</span>
                    </div>
                  </div>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-[18px]">
                      <span className="font-bold text-gray-500">Logistics Base Fare</span>
                      <span className="font-black">₹{taxableValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[18px]">
                      <span className="font-bold text-gray-500">CGST (9%)</span>
                      <span className="font-black">₹{cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[18px] pb-6 border-b border-gray-200">
                      <span className="font-bold text-gray-500">SGST (9%)</span>
                      <span className="font-black">₹{sgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[24px] font-black uppercase">Final Total</span>
                      <span className="text-[36px] font-black">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-center mt-12 pt-6 border-t border-gray-200">
                     <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">GSTIN: 27AADCM9999A1Z9</p>
                     <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mt-2">Computer Generated Invoice</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleDownloadInvoice}
                disabled={isDownloading}
                className="w-full bg-[#111111] text-white py-4 rounded-[24px] font-bold text-[16px] active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] disabled:opacity-50 flex items-center justify-center gap-3 min-h-[60px]"
              >
                {isDownloading ? <Loader2 size={20} className="animate-spin text-white" /> : <Receipt size={20} strokeWidth={2.5} />}
                {isDownloading ? 'Generating PDF...' : 'Download Full Receipt'}
              </button>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}