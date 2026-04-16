import React from 'react';
import { Linkedin, Github, Instagram, Twitter, Globe, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-24 pb-12 w-full">
      <div className="container mx-auto px-6 md:px-12">
        
        {/* Top Section: Logo & Socials matching image_a172aa */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Movyra Logo" className="w-10 h-10 object-contain bg-white rounded-lg p-1" onError={(e) => { e.target.style.display='none'; }} />
            <div className="text-[32px] font-black tracking-tighter">Movyra</div>
          </div>
          <div className="flex gap-1 font-bold text-[15px]">
             <a href="#" className="hover:bg-white/10 px-3 py-2 rounded-full transition-colors">Help Center</a>
             <a href="#" className="hover:bg-white/10 px-3 py-2 rounded-full transition-colors">English</a>
          </div>
        </div>

        {/* Middle Section: 4 Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-24">
          <div>
            <h4 className="font-bold text-[18px] mb-6 text-white">Company</h4>
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
            <h4 className="font-bold text-[18px] mb-6 text-white">Products</h4>
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
            <h4 className="font-bold text-[18px] mb-6 text-white">Global citizenship</h4>
            <ul className="space-y-4 font-medium text-[15px] text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[18px] mb-6 text-white">Travel</h4>
            <ul className="space-y-4 font-medium text-[15px] text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Reserve</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Airports</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cities</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: Socials & Locale */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div className="flex items-center gap-6">
            <a href="#" className="text-white hover:text-gray-400 transition-colors"><Linkedin size={20} /></a>
            <a href="#" className="text-white hover:text-gray-400 transition-colors"><YoutubeIcon /></a>
            <a href="#" className="text-white hover:text-gray-400 transition-colors"><Instagram size={20} /></a>
            <a href="#" className="text-white hover:text-gray-400 transition-colors"><Twitter size={20} /></a>
          </div>
          <div className="flex items-center gap-6 text-[14px] font-bold text-white hover:text-gray-300 transition-colors cursor-pointer">
            <div className="flex items-center gap-2"><Globe size={16} /> English</div>
            <div className="flex items-center gap-2"><MapPin size={16} /> San Francisco</div>
          </div>
        </div>

        {/* Bottom Bar: See Prices & Copyright */}
        <div className="flex flex-col gap-6">
           <button className="w-full bg-black border border-white/20 text-white font-bold py-4 rounded-xl hover:bg-white/10 transition-colors">
              See prices
           </button>
           <div className="flex flex-col md:flex-row justify-between items-center text-[12px] text-gray-400 font-medium">
             <p>&copy; 2026 Movyra Technologies Inc.</p>
             <div className="flex gap-6 mt-4 md:mt-0">
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

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);