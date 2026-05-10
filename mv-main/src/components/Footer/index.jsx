import React from 'react';
import { Linkedin, Instagram, Globe, MapPin } from 'lucide-react';

/**
 * ============================================================================
 * MODULE: PREMIUM FOOTER NAVIGATION (mv-main)
 * Architecture: Deep, dark-themed, multi-column layout matching reference.
 * Features: High-end custom SVG icons (including modern X logo), Movyra Logo
 * integration, App Store / Google Play interactive badges, and precise 
 * typography matrices.
 * ============================================================================
 */

// ============================================================================
// CUSTOM ASSETS & SVGs (Strictly no emojis)
// ============================================================================

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const XTwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.005 4.15H5.059z" />
  </svg>
);

const AppStoreBadge = () => (
  <svg viewBox="0 0 160 48" fill="none" className="h-10 hover:opacity-80 transition-opacity cursor-pointer border border-white/20 rounded-lg">
    <rect width="160" height="48" rx="8" fill="black" />
    <path d="M36.05 16.25c-.2-3.1 2.55-4.6 2.65-4.7-1.45-2.1-3.7-2.4-4.5-2.45-1.9-.2-3.7 1.15-4.65 1.15-.95 0-2.45-1.1-4.05-1.1-2.05 0-3.95 1.2-4.95 3-2.05 3.55-.5 8.75 1.45 11.65.95 1.4 2.1 2.95 3.6 2.9 1.45-.05 2.05-.95 3.8-.95 1.7 0 2.25.95 3.8.9 1.6-.05 2.55-1.45 3.5-2.85 1.1-1.6 1.55-3.15 1.6-3.25-.05-.05-3-1.15-3.25-4.3zM32.35 11.5c.8-1 1.35-2.35 1.2-3.75-1.15.05-2.6.8-3.45 1.8-.75.85-1.4 2.25-1.2 3.6 1.3.1 2.65-.65 3.45-1.65z" fill="white" />
    <text x="50" y="20" fill="white" fontSize="9" fontFamily="sans-serif">Download on the</text>
    <text x="49" y="36" fill="white" fontSize="16" fontFamily="sans-serif" fontWeight="bold">App Store</text>
  </svg>
);

const GooglePlayBadge = () => (
  <svg viewBox="0 0 160 48" fill="none" className="h-10 hover:opacity-80 transition-opacity cursor-pointer border border-white/20 rounded-lg">
    <rect width="160" height="48" rx="8" fill="black" />
    <path d="M21.5 12.5l12.5 7.5-12.5 7.5v-15z" fill="white" />
    <path d="M21.5 12.5l12.5 7.5-4 4-8.5-11.5z" fill="white" opacity="0.8" />
    <path d="M21.5 27.5l12.5-7.5-4-4-8.5 11.5z" fill="white" opacity="0.6" />
    <text x="46" y="20" fill="white" fontSize="9" fontFamily="sans-serif">GET IT ON</text>
    <text x="45" y="36" fill="white" fontSize="16" fontFamily="sans-serif" fontWeight="bold">Google Play</text>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-24 pb-12 w-full">
      <div className="container mx-auto px-6 md:px-12 w-full max-w-[1400px]">
        
        {/* Top Section: Logo & Localization Links */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
            <img src="/logo.png" alt="Movyra" className="w-10 h-10 object-contain" onError={(e) => e.target.style.display='none'} />
            <div className="text-[32px] font-black tracking-tighter">Movyra</div>
          </a>
          <div className="flex gap-1 font-bold text-[15px]">
             <a href="#" className="hover:bg-white/10 px-4 py-2 rounded-full transition-colors">Help Center</a>
             <a href="#" className="hover:bg-white/10 px-4 py-2 rounded-full transition-colors">English</a>
          </div>
        </div>

        {/* Middle Section: 4 Column Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8 mb-24">
          <div>
            <h4 className="font-bold text-[18px] mb-8 text-white">Company</h4>
            <ul className="space-y-4 font-medium text-[15px] text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">About us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Our offerings</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Newsroom</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Investors</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Movyra One</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[18px] mb-8 text-white">Products</h4>
            <ul className="space-y-4 font-medium text-[15px] text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Ride</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Drive</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Eat</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Movyra for Business</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Movyra Freight</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Gift cards</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[18px] mb-8 text-white">Global citizenship</h4>
            <ul className="space-y-4 font-medium text-[15px] text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[18px] mb-8 text-white">Travel</h4>
            <ul className="space-y-4 font-medium text-[15px] text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Reserve</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Airports</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cities</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Socials, App Downloads & Locale */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 mb-12">
          
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-6">
              <a href="#" className="text-white hover:text-gray-400 transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="text-white hover:text-gray-400 transition-colors"><YoutubeIcon /></a>
              <a href="#" className="text-white hover:text-gray-400 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-white hover:text-gray-400 transition-colors"><XTwitterIcon /></a>
            </div>
            
            <div className="flex items-center gap-6 text-[14px] font-bold text-white hover:text-gray-300 transition-colors cursor-pointer">
              <div className="flex items-center gap-2"><Globe size={16} /> English</div>
              <div className="flex items-center gap-2"><MapPin size={16} /> San Francisco</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <GooglePlayBadge />
             <AppStoreBadge />
          </div>

        </div>

        {/* Bottom Bar: See Prices Button & Legal */}
        <div className="flex flex-col gap-8">
           <button className="w-full bg-black border border-white/20 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-colors active:scale-[0.99]">
              See prices
           </button>
           
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-[12px] text-gray-400 font-medium">
             <p>&copy; 2026 Movyra Technologies Inc.</p>
             <div className="flex flex-wrap gap-6 mt-6 md:mt-0">
               <a href="#" className="hover:text-white transition-colors">Privacy</a>
               <a href="#" className="hover:text-white transition-colors">Accessibility</a>
               <a href="#" className="hover:text-white transition-colors">Terms</a>
             </div>
           </div>
        </div>

      </div>
    </footer>
  );
}