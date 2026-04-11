import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Shield, Zap, Download, Star, ChevronDown } from 'lucide-react';

/**
 * PAGE: INVESTORS LANDING
 * Architecture: 7-Section Parallax Marketing Page
 * UI Engine: Uber-Style Stark Contrast (Black/White/Grey)
 */
export default function InvestorsPage() {
  const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

  return (
    <div className="min-h-screen bg-[#F2F4F7] dark:bg-[#111111] text-[#111111] dark:text-white font-sans transition-colors duration-300">
      
      {/* SECTION 1: IMMERSIVE HERO */}
      <section className="relative w-full min-h-[90vh] flex items-center pt-20 overflow-hidden bg-white dark:bg-[#000000]">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-r from-black/80 to-transparent absolute inset-0 z-10" />
          <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop" alt="Hero Background" className="w-full h-full object-cover grayscale opacity-60" />
        </div>
        <div className="container mx-auto px-6 md:px-12 relative z-20">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="max-w-3xl">
            <h1 className="text-[56px] md:text-[84px] font-black leading-[1.05] tracking-tighter text-white mb-6">
              Investor Relations
            </h1>
            <p className="text-[20px] md:text-[24px] font-medium text-gray-300 mb-10 max-w-2xl leading-relaxed">
              Financial news, earnings reports, and corporate governance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-white text-black px-8 py-4.5 rounded-full font-black text-[16px] hover:bg-gray-200 transition-colors flex items-center justify-center gap-3">
                Get Started <ArrowRight size={20} strokeWidth={2.5} />
              </button>
              <button className="bg-transparent text-white border-2 border-white px-8 py-4.5 rounded-full font-black text-[16px] hover:bg-white/10 transition-colors">
                Explore Features
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: VALUE PROPOSITION GRID */}
      <section className="py-24 bg-[#F2F4F7] dark:bg-[#111111]">
        <div className="container mx-auto px-6 md:px-12">
          <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-[40px] font-black tracking-tight mb-16">
            Why choose Movyra Investors?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Globe, title: 'Global Scale', desc: 'Available in over 10,000 cities worldwide. Your app works seamlessly wherever you travel.' },
              { icon: Zap, title: 'Instant Matching', desc: 'Our proprietary ML routing engine connects you with partners in milliseconds.' },
              { icon: Shield, title: 'Enterprise Security', desc: 'Bank-level encryption and real-time telemetry ensure your data and physical safety.' }
            ].map((feature, idx) => (
              <motion.div key={idx} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: idx * 0.1 }} className="flex flex-col">
                <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon size={32} strokeWidth={2} />
                </div>
                <h3 className="text-[24px] font-black mb-4">{feature.title}</h3>
                <p className="text-[16px] font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS (HORIZONTAL SCROLL) */}
      <section className="py-24 bg-white dark:bg-[#000000] overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-[40px] font-black tracking-tight mb-16">How Investors Works</h2>
          <div className="flex gap-8 overflow-x-auto no-scrollbar pb-12 snap-x">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="min-w-[300px] md:min-w-[400px] bg-[#F2F4F7] dark:bg-[#1A1A1A] rounded-[32px] p-10 snap-center shrink-0">
                <div className="text-[64px] font-black text-gray-300 dark:text-gray-700 leading-none mb-8">0{step}</div>
                <h4 className="text-[24px] font-black mb-4">Step {step} Configuration</h4>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Seamlessly integrate your requirements into the Movyra engine and let our algorithms handle the logistics.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: DUAL APP DOWNLOAD */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-[48px] font-black tracking-tighter mb-6">Take Movyra with you.</h2>
            <p className="text-[20px] text-gray-400 mb-10">Download the app for iOS and Android. Experience the full power of Movyra Investors in your pocket.</p>
            <div className="flex gap-4">
              <button className="bg-white text-black px-8 py-4 rounded-full font-black flex items-center gap-3 hover:bg-gray-200 transition-colors">
                <Download size={20} /> App Store
              </button>
              <button className="bg-white text-black px-8 py-4 rounded-full font-black flex items-center gap-3 hover:bg-gray-200 transition-colors">
                <Download size={20} /> Google Play
              </button>
            </div>
          </div>
          <div className="w-full md:w-1/3 aspect-square bg-gradient-to-tr from-gray-800 to-gray-600 rounded-[48px] rotate-12 flex items-center justify-center border-8 border-gray-900 shadow-2xl">
             <span className="text-white font-black text-2xl tracking-widest">APP PREVIEW</span>
          </div>
        </div>
      </section>

      {/* SECTION 5: LIVE GLOBAL STATS */}
      <section className="py-20 bg-[#F2F4F7] dark:bg-[#111111] border-y border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { metric: '10,000+', label: 'Cities Worldwide' },
            { metric: '25M+', label: 'Daily Operations' },
            { metric: '99.9%', label: 'Uptime SLA' },
            { metric: '4.9/5', label: 'Average Rating' }
          ].map((stat, i) => (
            <div key={i} className="text-center md:text-left">
              <h3 className="text-[48px] font-black tracking-tighter mb-2">{stat.metric}</h3>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[12px]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: FAQ ACCORDION */}
      <section className="py-24 bg-white dark:bg-[#000000]">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h2 className="text-[40px] font-black tracking-tight mb-16 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((faq) => (
              <details key={faq} className="group bg-[#F2F4F7] dark:bg-[#1A1A1A] rounded-2xl cursor-pointer">
                <summary className="flex justify-between items-center font-black text-[18px] p-6 list-none">
                  How does Movyra Investors pricing work?
                  <span className="transition group-open:rotate-180">
                    <ChevronDown size={24} />
                  </span>
                </summary>
                <div className="text-gray-600 dark:text-gray-400 font-medium p-6 pt-0 leading-relaxed">
                  Pricing is dynamically calculated based on distance, time, and real-time network demand. We provide upfront pricing before you confirm your request.
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: MEGA FOOTER */}
      <footer className="bg-black text-white py-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-[32px] font-black tracking-tighter mb-16">Movyra.</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div>
              <h4 className="font-bold text-gray-400 mb-6">Company</h4>
              <ul className="space-y-4 font-medium">
                <li><a href="/about" className="hover:text-gray-300">About us</a></li>
                <li><a href="/newsroom" className="hover:text-gray-300">Newsroom</a></li>
                <li><a href="/investors" className="hover:text-gray-300">Investors</a></li>
                <li><a href="/careers" className="hover:text-gray-300">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-400 mb-6">Products</h4>
              <ul className="space-y-4 font-medium">
                <li><a href="/ride" className="hover:text-gray-300">Ride</a></li>
                <li><a href="/drive" className="hover:text-gray-300">Drive</a></li>
                <li><a href="/eat" className="hover:text-gray-300">Eat</a></li>
                <li><a href="/business" className="hover:text-gray-300">Movyra for Business</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-400 mb-6">Global Citizenship</h4>
              <ul className="space-y-4 font-medium">
                <li><a href="/safety" className="hover:text-gray-300">Safety</a></li>
                <li><a href="/diversity" className="hover:text-gray-300">Diversity and Inclusion</a></li>
                <li><a href="/sustainability" className="hover:text-gray-300">Sustainability</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-400 mb-6">Travel</h4>
              <ul className="space-y-4 font-medium">
                <li><a href="/airports" className="hover:text-gray-300">Airports</a></li>
                <li><a href="/cities" className="hover:text-gray-300">Cities</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 font-medium">&copy; 2026 Movyra Technologies Inc.</p>
            <div className="flex gap-6 font-medium text-sm">
              <a href="/legal" className="hover:text-white">Privacy</a>
              <a href="/legal" className="hover:text-white">Terms</a>
              <a href="/legal" className="hover:text-white">Pricing</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
