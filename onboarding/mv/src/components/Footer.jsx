import React from 'react';
import { Globe, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Logo & Help Link */}
        <div className="mb-16 space-y-8">
          <img src="logo.png" alt="Movyra" className="h-10 w-auto rounded-md object-contain" />
          <a href="#help" className="inline-block text-lg font-medium hover:text-gray-300 transition-colors">
            Visit Help Center
          </a>
        </div>

        {/* 4-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/* Column 1: Company */}
          <div>
            <h4 className="font-bold text-lg mb-6">Company</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-300">
              <li><a href="#about" className="hover:text-white transition-colors">About us</a></li>
              <li><a href="#offerings" className="hover:text-white transition-colors">Our offerings</a></li>
              <li><a href="#news" className="hover:text-white transition-colors">Newsroom</a></li>
              <li><a href="#investors" className="hover:text-white transition-colors">Investors</a></li>
              <li><a href="#blog" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>

          {/* Column 2: Products */}
          <div>
            <h4 className="font-bold text-lg mb-6">Products</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-300">
              <li><a href="#ride" className="hover:text-white transition-colors">Ride</a></li>
              <li><a href="#drive" className="hover:text-white transition-colors">Drive</a></li>
              <li><a href="#eat" className="hover:text-white transition-colors">Eat</a></li>
              <li><a href="#business" className="hover:text-white transition-colors">Movyra for Business</a></li>
              <li><a href="#freight" className="hover:text-white transition-colors">Freight Logistics</a></li>
            </ul>
          </div>

          {/* Column 3: Global Citizenship */}
          <div>
            <h4 className="font-bold text-lg mb-6">Global citizenship</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-300">
              <li><a href="#safety" className="hover:text-white transition-colors">Safety OS</a></li>
              <li><a href="#sustainability" className="hover:text-white transition-colors">Sustainability</a></li>
              <li><a href="#diversity" className="hover:text-white transition-colors">Diversity & Inclusion</a></li>
            </ul>
          </div>

          {/* Column 4: Travel */}
          <div>
            <h4 className="font-bold text-lg mb-6">Travel</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-300">
              <li><a href="#reserve" className="hover:text-white transition-colors">Reserve</a></li>
              <li><a href="#airports" className="hover:text-white transition-colors">Airports</a></li>
              <li><a href="#cities" className="hover:text-white transition-colors">Cities</a></li>
            </ul>
          </div>
        </div>

        {/* Socials & Locale Settings */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex items-center gap-6">
            {/* LinkedIn */}
            <a href="#linkedin" className="text-gray-400 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
            {/* YouTube */}
            <a href="#youtube" className="text-gray-400 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </a>
            {/* Instagram */}
            <a href="#instagram" className="text-gray-400 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            {/* Twitter / X */}
            <a href="#x" className="text-gray-400 hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>
            </a>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-300">
            <button className="flex items-center gap-2 hover:text-white transition-colors"><Globe size={16} /> English</button>
            <button className="flex items-center gap-2 hover:text-white transition-colors"><MapPin size={16} /> Pune</button>
          </div>
        </div>

        {/* App Store Buttons */}
        <div className="flex flex-wrap gap-4 mb-16">
          <button className="bg-gray-900 border border-gray-800 hover:bg-gray-800 transition-colors px-4 py-2 rounded-lg flex items-center gap-3">
            <svg viewBox="0 0 512 512" className="w-6 h-6 fill-white"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
            <div className="text-left">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider leading-none">Get it on</div>
              <div className="text-sm font-bold leading-none mt-1">Google Play</div>
            </div>
          </button>
          <button className="bg-gray-900 border border-gray-800 hover:bg-gray-800 transition-colors px-4 py-2 rounded-lg flex items-center gap-3">
            <svg viewBox="0 0 384 512" className="w-6 h-6 fill-white"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
            <div className="text-left">
              <div className="text-[10px] text-gray-400 leading-none">Download on the</div>
              <div className="text-sm font-bold leading-none mt-1">App Store</div>
            </div>
          </button>
        </div>

        {/* Bottom Legal Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-8 border-t border-gray-800 text-xs text-gray-400">
          <p>© 2026 Movyra Technologies. <br className="md:hidden"/>by Bongo Logistics Network operating under the premises of AnyAstro Techno Pvt Ltd.</p>
          <div className="flex items-center gap-6 font-medium">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="#accessibility" className="hover:text-white transition-colors">Accessibility</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;