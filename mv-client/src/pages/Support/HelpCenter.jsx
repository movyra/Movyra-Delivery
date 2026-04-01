import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, AlertCircle, X, CheckCircle2, 
  PackageOpen, ShieldAlert, Clock, Loader2, ImagePlus
} from 'lucide-react';

// Premium Design System Components
import SystemCard from '../../components/UI/SystemCard';
import SystemButton from '../../components/UI/SystemButton';

// Real Services & Database Integration
import { auth } from '../../services/firebaseAuth';
import { onAuthStateChanged } from 'firebase/auth';
import { createDispute } from '../../services/firestore';
import { getFirestore, collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';

/**
 * PAGE: HELP CENTER & DISPUTE SYSTEM (PREMIUM CARD UI)
 * Architecture: Detached 32px rounded SystemCards on #F2F4F7 background.
 * Features: 
 * - Real-time historical order fetching with strict auth listener failsafe
 * - Base64 Image Parsing for Proof Uploads
 * - Strict typography and high-contrast form fields
 * - Submits directly to the centralized Firestore disputes ledger
 */

const ISSUE_TYPES = [
  { id: 'damaged', label: 'Damaged Goods', icon: ShieldAlert },
  { id: 'delayed', label: 'Severe Delay', icon: Clock },
  { id: 'missing', label: 'Missing Item', icon: PackageOpen },
  { id: 'billing', label: 'Billing Issue', icon: AlertCircle },
];

export default function HelpCenter() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Data State
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Form State
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]); // Array of Base64 strings

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // ============================================================================
  // LOGIC: FETCH REAL RECENT ORDERS FOR SELECTION (STRICT AUTH FIX)
  // ============================================================================
  useEffect(() => {
    // Wrap the query in an auth listener to prevent permission-denied race conditions
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsLoadingOrders(false);
        navigate('/auth-login', { replace: true });
        return;
      }

      try {
        const db = getFirestore();
        const ordersRef = collection(db, 'orders');
        // Fetch last 10 orders to keep the dropdown relevant
        const q = query(
          ordersRef, 
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(10)
        );

        const snapshot = await getDocs(q);
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          date: doc.data().createdAt?.toDate() || new Date(),
          total: doc.data().pricing?.estimatedPrice || doc.data().totalFare || 0,
          status: doc.data().status || 'Processing'
        }));
        
        setRecentOrders(orders);
      } catch (err) {
        console.error("Order Fetch Error:", err);
        setError("Failed to load your recent orders. Please check your connection.");
      } finally {
        setIsLoadingOrders(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // ============================================================================
  // LOGIC: NATIVE IMAGE PROCESSING (Base64 Conversion)
  // ============================================================================
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Strict limit of 3 images to prevent Firestore document size overflow (1MB limit)
    if (images.length + files.length > 3) {
      setError("You can only upload a maximum of 3 proof images.");
      return;
    }

    files.forEach(file => {
      // Validate file type and size (< 2MB per image)
      if (!file.type.startsWith('image/')) {
        setError("Please upload valid image files only.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("Each image must be smaller than 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so the same file can be selected again if removed
    e.target.value = null;
    setError('');
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // ============================================================================
  // LOGIC: SUBMIT DISPUTE TO FIRESTORE
  // ============================================================================
  const handleSubmit = async () => {
    setError('');

    if (!selectedOrderId) { setError("Please select an order to dispute."); return; }
    if (!issueType) { setError("Please select the type of issue."); return; }
    if (description.trim().length < 15) { setError("Please provide at least 15 characters describing the issue."); return; }

    setIsSubmitting(true);

    try {
      await createDispute({
        orderId: selectedOrderId,
        issueType,
        description: description.trim(),
        attachedImages: images, // Persisted as Base64 arrays in Firestore MVP
      });

      setIsSuccess(true);
      
      // Auto-redirect after success visualization
      setTimeout(() => {
        navigate('/dashboard-home', { replace: true });
      }, 2500);

    } catch (err) {
      console.error("Dispute Submission Failed:", err);
      setError("Failed to submit your ticket. Please try again.");
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================
  if (isSuccess) {
    return (
      <div className="min-h-[100dvh] bg-[#F2F4F7] text-[#111111] flex flex-col items-center justify-center font-sans p-6">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-[#111111] rounded-full flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
        >
          <CheckCircle2 size={48} className="text-white" strokeWidth={2.5} />
        </motion.div>
        <motion.h1 
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-[32px] font-black tracking-tighter text-[#111111] text-center mb-2 leading-tight"
        >
          Ticket Created
        </motion.h1>
        <motion.p 
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-[#4A6B85] font-bold text-[15px] text-center max-w-[280px]"
        >
          Our support team will review your case and contact you shortly.
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#F2F4F7] text-[#111111] flex flex-col font-sans relative">
      
      {/* SECTION 1: Isolated Circular Navigation */}
      <div className="px-6 pt-14 pb-4 flex items-center gap-4 sticky top-0 z-40 bg-[#F2F4F7]/90 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)} 
          className="w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center text-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all shrink-0"
        >
          <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
        </button>
        <h1 className="text-[32px] font-black tracking-tighter text-[#111111] leading-none">
          Help Center
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-5 pt-2 pb-32 space-y-4">
        
        {/* Header Typography */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 px-1">
          <h1 className="text-[40px] font-black text-[#111111] leading-[1.05] tracking-tighter mb-2">
            Raise a <br/>Dispute.
          </h1>
          <p className="text-[15px] text-gray-500 font-bold leading-relaxed max-w-[90%]">
            Report issues with a recent delivery. We're here to help make it right.
          </p>
        </motion.div>

        {/* Global Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }} 
              className="bg-red-50 text-red-600 px-5 py-4 rounded-[24px] font-bold text-[13px] flex items-start gap-2 shadow-sm border border-red-100"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="leading-snug">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 2: Select Past Order Card */}
        <SystemCard animated variant="white" className="flex flex-col !p-5">
          <h3 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Select Order</h3>
          <div className="relative">
            <select
              value={selectedOrderId}
              onChange={(e) => { setSelectedOrderId(e.target.value); setError(''); }}
              disabled={isLoadingOrders || recentOrders.length === 0}
              className={`w-full appearance-none bg-[#F6F6F6] px-5 py-4 rounded-[24px] font-bold text-[15px] border-2 transition-all outline-none focus:bg-white focus:border-[#111111] ${selectedOrderId ? 'text-[#111111] border-[#111111] bg-white shadow-[0_4px_15px_rgba(0,0,0,0.03)]' : 'text-gray-500 border-transparent hover:border-gray-200'}`}
            >
              <option value="" disabled>
                {isLoadingOrders ? 'Loading orders...' : recentOrders.length === 0 ? 'No recent orders found' : 'Choose an order to dispute'}
              </option>
              {recentOrders.map(order => (
                <option key={order.id} value={order.id} className="font-bold text-[#111111]">
                  {order.date.toLocaleDateString('en-IN')} • ID: {order.id.slice(-6).toUpperCase()} • ₹{order.total}
                </option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
              {isLoadingOrders ? <Loader2 size={18} className="animate-spin text-gray-400" /> : <ChevronLeft size={18} className="text-[#111111] -rotate-90" strokeWidth={3} />}
            </div>
          </div>
        </SystemCard>

        {/* SECTION 3: Issue Type Grid Card */}
        <SystemCard animated variant="white" className="flex flex-col !p-5">
          <h3 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">What went wrong?</h3>
          <div className="grid grid-cols-2 gap-3">
            {ISSUE_TYPES.map(type => {
              const Icon = type.icon;
              const isSelected = issueType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => { setIssueType(type.id); setError(''); }}
                  className={`p-4 rounded-[24px] border-2 flex flex-col items-start gap-4 transition-all active:scale-95 ${
                    isSelected ? 'border-[#111111] bg-white shadow-[0_8px_20px_rgba(0,0,0,0.06)]' : 'border-transparent bg-[#F6F6F6] hover:border-gray-200 hover:bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-[#111111] text-white' : 'bg-white text-[#111111] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100'}`}>
                    <Icon size={22} strokeWidth={2.5} />
                  </div>
                  <span className={`text-[14px] font-black tracking-tight leading-tight text-left ${isSelected ? 'text-[#111111]' : 'text-gray-500'}`}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </SystemCard>

        {/* SECTION 4: Detailed Description Card */}
        <SystemCard animated variant="white" className="flex flex-col !p-5">
          <h3 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Description</h3>
          <textarea
            value={description}
            onChange={(e) => { setDescription(e.target.value); setError(''); }}
            placeholder="Explain what happened in detail (min. 15 characters)..."
            className="w-full bg-[#F6F6F6] p-5 rounded-[24px] font-bold text-[15px] text-[#111111] placeholder:text-gray-400 border-2 border-transparent focus:border-[#111111] focus:bg-white transition-all outline-none resize-none min-h-[140px]"
          />
        </SystemCard>

        {/* SECTION 5: Proof Upload Card */}
        <SystemCard animated variant="white" className="flex flex-col !p-5">
          <h3 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1 flex justify-between items-center">
            <span>Proof of Issue</span>
            <span className="text-[11px] bg-[#F2F4F7] text-gray-500 px-2 py-0.5 rounded-md font-bold">{images.length}/3</span>
          </h3>
          
          <div className="flex flex-wrap gap-3">
            <AnimatePresence mode="popLayout">
              {images.map((imgSrc, idx) => (
                <motion.div 
                  key={idx} 
                  layout 
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.8 }} 
                  className="relative w-[90px] h-[90px] rounded-[24px] overflow-hidden border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] group"
                >
                  <img src={imgSrc} alt="Proof" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(idx)}
                    className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-md opacity-100 transition-opacity active:scale-95"
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {images.length < 3 && (
              <motion.button 
                layout
                onClick={() => fileInputRef.current?.click()}
                className="w-[90px] h-[90px] rounded-[24px] border-2 border-dashed border-gray-300 bg-[#F6F6F6] hover:bg-white hover:border-gray-400 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-[#111111] transition-all active:scale-95"
              >
                <ImagePlus size={24} strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-widest">Add Photo</span>
              </motion.button>
            )}

            {/* Hidden Native File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              multiple 
              onChange={handleImageUpload} 
              className="hidden" 
            />
          </div>
        </SystemCard>

      </div>

      {/* SECTION 6: Floating Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-[#F2F4F7]/90 backdrop-blur-md border-t border-gray-200 z-50">
        <SystemButton 
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedOrderId || !issueType || description.length < 15}
          loading={isSubmitting}
          variant="primary"
        >
          Submit Ticket
        </SystemButton>
      </div>

    </div>
  );
}