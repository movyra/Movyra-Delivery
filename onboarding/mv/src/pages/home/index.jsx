import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { 
  ShieldCheck, MapPin, Store, Lock, Activity, ShoppingBag, 
  Utensils, Shirt, ChevronRight, Users, CheckCircle2, TrendingUp 
} from 'lucide-react';

const HomePage = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', role: 'customer', city: '' });
  const [formStatus, setFormStatus] = useState('idle');
  const [networkStats, setNetworkStats] = useState({ partners: 312, shops: 145 });
  const [recentJoins, setRecentJoins] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'early_access'), orderBy('createdAt', 'desc'), limit(4));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const joins = [];
      snapshot.forEach((doc) => joins.push(doc.data()));
      setRecentJoins(joins);
      if(snapshot.size > 0) {
        setNetworkStats(prev => ({ partners: prev.partners + 1, shops: prev.shops + 1 }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleResendEmail = async (userEmail, userName) => {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Movyra Trust Engine <onboarding@updates.movyra.in>',
          to: [userEmail],
          subject: 'Complete your Movyra Onboarding',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
              <h2 style="color: #0F172A; text-align: center;">Welcome to the Network, ${userName}</h2>
              <p style="color: #4B5563; text-align: center;">You are successfully added to the early access waitlist for your city.</p>
            </div>
          `
        })
      });
    } catch (error) {
      console.error("Email dispatch failed", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('loading');
    try {
      await addDoc(collection(db, 'early_access'), {
        ...formData,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      
      if(formData.email) {
        await handleResendEmail(formData.email, formData.name);
      }
      
      setFormStatus('success');
      setFormData({ name: '', phone: '', email: '', role: 'customer', city: '' });
      setTimeout(() => setFormStatus('idle'), 5000);
    } catch (error) {
      setFormStatus('error');
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
  };

  return (
    <div className="min-h-screen bg-movyra-light text-movyra-dark overflow-x-hidden">
      <Header />
      <main>
        {/* 1. HERO SECTION */}
        <section className="relative pt-48 pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-movyra-blue/10 rounded-full blur-[100px] animate-blob"></div>
          <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <div className="inline-flex items-center gap-2 bg-white px-5 py-2 rounded-full shadow-sm border border-gray-200 mb-8">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-gray-700">Trust Engine Active</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-tight">
                Your nearby stores, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-movyra-blue to-blue-600">now one tap away.</span>
              </h1>
              <p className="mt-8 text-xl text-gray-600 max-w-2xl mx-auto font-medium">
                The fastest, safest, and most transparent hyperlocal commerce network. Built for real people and local shops.
              </p>
              <div className="mt-12 flex justify-center">
                <a href="#early-access" className="bg-movyra-dark text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-xl flex items-center gap-2">
                  Join The Network <ChevronRight size={20}/>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 2. REAL-TIME DATA */}
        <section className="py-10 bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100 text-center">
            <div>
              <div className="text-4xl font-black flex justify-center items-center gap-2"><Activity className="text-movyra-blue" /> {networkStats.partners}</div>
              <div className="text-gray-500 text-sm font-bold mt-2 uppercase">Active Partners</div>
            </div>
            <div>
              <div className="text-4xl font-black">{networkStats.shops}</div>
              <div className="text-gray-500 text-sm font-bold mt-2 uppercase">Verified Shops</div>
            </div>
            <div>
              <div className="text-4xl font-black">0%</div>
              <div className="text-gray-500 text-sm font-bold mt-2 uppercase">Hidden Fees</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-mono font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span> SYSTEM LIVE
              </div>
            </div>
          </div>
        </section>

        {/* 3. SERVICES SECTION */}
        <section id="services" className="py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-5xl font-black tracking-tight mb-16 text-center">The Local Ecosystem.</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Daily Needs', icon: ShoppingBag, pts: ['Groceries in minutes', 'Fresh Vegetables', 'Kirana Integration'] },
                { title: 'AAT Eats', icon: Utensils, pts: ['Verified Home Kitchens', 'Tiffin Subscriptions', 'Neighborhood Chefs'] },
                { title: 'Local Fashion', icon: Shirt, pts: ['Boutique Delivery', 'Try-at-Home', 'Local Trends'] }
              ].map((svc, i) => (
                <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8">
                    <svc.icon className="text-movyra-blue w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-6">{svc.title}</h3>
                  <ul className="space-y-4 text-gray-600 font-medium">
                    {svc.pts.map((pt, idx) => <li key={idx} className="flex items-center gap-3"><CheckCircle2 className="text-green-500"/> {pt}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. SAFETY OS SECTION */}
        <section id="safety" className="py-32 bg-movyra-dark text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase mb-6 inline-block">Trust Layer OS</span>
              <h2 className="text-5xl font-black mb-8 leading-tight">Safety is not a feature. It is the foundation.</h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <ShieldCheck className="text-movyra-blue w-10 h-10 shrink-0" />
                  <div>
                    <h4 className="text-2xl font-bold mb-2">Women-Only Preferences</h4>
                    <p className="text-gray-400">Opt for women-only delivery partners, verified safe zones, and strict night protocol filters.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <Lock className="text-movyra-blue w-10 h-10 shrink-0" />
                  <div>
                    <h4 className="text-2xl font-bold mb-2">Anonymous Route Privacy</h4>
                    <p className="text-gray-400">Masked numbers, silent SOS triggers, and end-to-end route monitoring.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#111827] p-10 rounded-[3rem] border border-gray-800 shadow-2xl font-mono text-sm">
              <div className="flex justify-between border-b border-gray-800 pb-6 mb-6">
                <span className="text-gray-400">SYSTEM.MONITOR</span>
                <span className="text-green-400 flex items-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> ACTIVE</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between p-4 bg-black/30 rounded-xl"><span>Identity Verification</span><span className="text-green-400">PASSED</span></div>
                <div className="flex justify-between p-4 bg-black/30 rounded-xl"><span>Route Encryption</span><span className="text-green-400">SECURED</span></div>
                <div className="flex justify-between p-4 bg-black/30 rounded-xl"><span>Night Protocol</span><span className="text-movyra-blue">STANDBY</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. VENDOR SECTION */}
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-5xl font-black mb-16">Scale Your Local Business</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100"><Store className="text-movyra-blue w-10 h-10 mx-auto mb-6"/><h4 className="text-xl font-bold mb-2">Shop Uploads</h4><p className="text-gray-600">Upload photos for immediate verification. GST optional at start.</p></div>
              <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100"><Activity className="text-movyra-blue w-10 h-10 mx-auto mb-6"/><h4 className="text-xl font-bold mb-2">Live ETA Tracker</h4><p className="text-gray-600">Stop waiting blindly. Get approved and go live in 48 hours.</p></div>
              <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100"><TrendingUp className="text-movyra-blue w-10 h-10 mx-auto mb-6"/><h4 className="text-xl font-bold mb-2">Earnings Estimator</h4><p className="text-gray-600">Transparent payout structures without hidden fees.</p></div>
            </div>
          </div>
        </section>

        {/* 6. COMMUNITY FEED */}
        <section className="py-20 bg-gray-900 text-white border-y border-gray-800">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-10"><Activity className="text-movyra-blue"/> Live Network Additions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recentJoins.length > 0 ? recentJoins.map((join, idx) => (
                <div key={idx} className="bg-gray-800 p-5 rounded-2xl border border-gray-700 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-movyra-blue"><Users size={16}/> <span className="font-bold capitalize">{join.role}</span></div>
                  <div className="text-sm text-gray-400">From {join.city || 'India'}</div>
                </div>
              )) : <div className="text-gray-500 italic">Listening for real-time joins...</div>}
            </div>
          </div>
        </section>

        {/* 7. EARLY ACCESS FORM (Includes Client-Side Resend Fetch) */}
        <section id="early-access" className="py-32 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white p-10 lg:p-16 rounded-[3rem] shadow-2xl border border-gray-100">
              <h2 className="text-4xl font-black text-center mb-12">Secure Your Spot.</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                    <input required type="text" className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-movyra-blue focus:ring-2 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <input required type="email" className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-movyra-blue focus:ring-2 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp Number</label>
                    <input required type="tel" className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-movyra-blue focus:ring-2 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                    <input required type="text" className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-movyra-blue focus:ring-2 outline-none" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Intent to Join As</label>
                  <select className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:border-movyra-blue focus:ring-2 outline-none appearance-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="customer">Customer App User</option>
                    <option value="partner">Delivery Partner</option>
                    <option value="vendor">Local Shop / Vendor</option>
                    <option value="kitchen">Home Kitchen Chef</option>
                  </select>
                </div>
                <button type="submit" disabled={formStatus === 'loading' || formStatus === 'success'} className="w-full bg-movyra-dark text-white font-bold text-xl py-5 rounded-2xl hover:bg-black transition-all mt-6">
                  {formStatus === 'loading' ? 'Encrypting Data...' : formStatus === 'success' ? 'Welcome to the Network' : 'Get Early Access'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;