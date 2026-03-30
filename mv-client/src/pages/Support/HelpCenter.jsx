import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, AlertCircle, Camera, X, CheckCircle2, 
  PackageOpen, ShieldAlert, Clock, Loader2, ArrowRight, ImagePlus
} from 'lucide-react';

// Real Services & Database Integration
import { auth } from '../../services/firebaseAuth';
import { createDispute } from '../../services/firestore';
import { getFirestore, collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';

// ============================================================================
// PAGE: HELP CENTER & DISPUTE SYSTEM (STARK MINIMALIST UI)
// Enterprise-grade ticket creation. Fetches real historical orders, parses
// image proofs to Base64, and submits to the central disputes ledger.
// ============================================================================

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
  // LOGIC: FETCH REAL RECENT ORDERS FOR SELECTION
  // ============================================================================
  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser;
      if (!user) {
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
    };

    fetchOrders();
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
      <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center font-sans p-6">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-6 shadow-xl"
        >
          <CheckCircle2 size={48} className="text-white" strokeWidth={2.5} />
        </motion.div>
        <motion.h1 
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-[32px] font-black tracking-tighter text-black text-center mb-2 leading-tight"
        >
          Ticket Created
        </motion.h1>
        <motion.p 
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-gray-500 font-bold text-center"
        >
          Our support team will review your case and contact you shortly.
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans relative">
      
      {/* SECTION 1: Top Navigation */}
      <div className="pt-12 px-6 pb-2 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-black hover:bg-gray-100 transition-colors active:scale-95"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        <div className="w-8 h-8 rounded-md overflow-hidden bg-black flex items-center justify-center">
          <img src="/logo.png" alt="Movyra" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-6 pt-6 pb-32">
        
        {/* SECTION 2: Header Typography */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-[40px] font-black text-black leading-[1.05] tracking-tighter mb-3">
            Raise a <br/>Dispute.
          </h1>
          <p className="text-[15px] text-gray-500 font-medium">
            Report issues with a recent delivery. We're here to help make it right.
          </p>
        </motion.div>

        {/* SECTION 3: Select Past Order */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <h3 className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mb-4">Select Order</h3>
          
          <div className="relative">
            <select
              value={selectedOrderId}
              onChange={(e) => { setSelectedOrderId(e.target.value); setError(''); }}
              disabled={isLoadingOrders || recentOrders.length === 0}
              className={`w-full appearance-none bg-[#F6F6F6] p-5 rounded-[24px] font-bold text-[16px] border-2 transition-all outline-none ${selectedOrderId ? 'text-black border-black bg-white shadow-sm' : 'text-gray-500 border-transparent hover:border-gray-300'}`}
            >
              <option value="" disabled>
                {isLoadingOrders ? 'Loading orders...' : recentOrders.length === 0 ? 'No recent orders found' : 'Choose an order to dispute'}
              </option>
              {recentOrders.map(order => (
                <option key={order.id} value={order.id}>
                  {order.date.toLocaleDateString('en-IN')} • {order.id.slice(-8)} • ₹{order.total}
                </option>
              ))}
            </select>
            {/* Custom Dropdown Chevron */}
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
              {isLoadingOrders ? <Loader2 size={20} className="animate-spin text-gray-400" /> : <ChevronLeft size={20} className="text-black -rotate-90" strokeWidth={2.5} />}
            </div>
          </div>
        </motion.div>

        {/* SECTION 4: Issue Type Grid */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
          <h3 className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mb-4">What went wrong?</h3>
          <div className="grid grid-cols-2 gap-3">
            {ISSUE_TYPES.map(type => {
              const Icon = type.icon;
              const isSelected = issueType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => { setIssueType(type.id); setError(''); }}
                  className={`p-4 rounded-[20px] border-2 flex flex-col items-start gap-3 transition-all active:scale-95 ${
                    isSelected ? 'border-black bg-white shadow-[0_10px_20px_rgba(0,0,0,0.08)] scale-[1.02]' : 'border-transparent bg-[#F6F6F6] hover:border-gray-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-black text-white' : 'bg-white text-black border border-gray-200 shadow-sm'}`}>
                    <Icon size={18} strokeWidth={2.5} />
                  </div>
                  <span className={`text-[15px] font-black tracking-tight ${isSelected ? 'text-black' : 'text-gray-600'}`}>
                    {type.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* SECTION 5: Detailed Description */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
          <h3 className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mb-4">Description</h3>
          <div className="flex items-start px-5 py-4 rounded-[24px] border-2 border-transparent bg-[#F6F6F6] focus-within:border-black focus-within:bg-white transition-all shadow-inner">
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); setError(''); }}
              placeholder="Explain what happened in detail (min. 15 characters)..."
              className="w-full text-[15px] font-bold text-black placeholder:text-gray-400 focus:outline-none bg-transparent resize-none min-h-[120px]"
            />
          </div>
        </motion.div>

        {/* SECTION 6: Proof Upload (Native Input) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-4">
          <h3 className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex justify-between items-center">
            <span>Proof of Issue</span>
            <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{images.length}/3</span>
          </h3>
          
          <div className="flex flex-wrap gap-3">
            {images.map((imgSrc, idx) => (
              <div key={idx} className="relative w-[100px] h-[100px] rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm group">
                <img src={imgSrc} alt="Proof" className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
            ))}

            {images.length < 3 && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-[100px] h-[100px] rounded-2xl border-2 border-dashed border-gray-300 bg-[#F6F6F6] hover:bg-gray-100 flex flex-col items-center justify-center gap-2 text-gray-500 transition-colors active:scale-95"
              >
                <ImagePlus size={24} strokeWidth={2} />
                <span className="text-[11px] font-bold uppercase">Add Photo</span>
              </button>
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
        </motion.div>

        {/* Real-time Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }} 
              className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold text-sm flex items-start gap-2 mt-4"
            >
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="leading-snug">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* SECTION 7: Floating Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full flex items-center justify-between px-6 bg-black text-white py-4 rounded-full font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[60px] shadow-[0_10px_30px_rgba(0,0,0,0.2)] disabled:opacity-50"
        >
          <span className="flex-1 text-center pl-6">
            {isSubmitting ? 'Submitting Ticket...' : 'Submit Ticket'}
          </span>
          {isSubmitting ? <Loader2 size={24} className="animate-spin text-white" /> : <ArrowRight size={24} className="text-white" />}
        </button>
      </div>

    </div>
  );
}