import React from 'react';
import { ShieldCheck, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-movyra-dark text-white pt-24 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" rx="20" fill="#0DB2FF"/>
              <path d="M25 75 L35 25 L50 60 L65 25 L75 75" stroke="white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span className="text-xl font-bold">Movyra</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed pr-4">
            Building India's safest and fastest local commerce network. Real people. Real stores. Real safety.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold text-lg mb-6">Network Hub</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li><a href="/customer" className="hover:text-white transition-colors">Customer App</a></li>
            <li><a href="/partner" className="hover:text-white transition-colors">Delivery Partner</a></li>
            <li><a href="/vendor" className="hover:text-white transition-colors">Local Shop Registration</a></li>
            <li><a href="/bongo-eats" className="hover:text-white transition-colors">Bongo Eats Kitchen</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">Trust Layer</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li className="flex items-center gap-2 text-white"><ShieldCheck size={16} className="text-movyra-blue"/> Women Safety Protocols</li>
            <li><a href="/privacy" className="hover:text-white transition-colors">Data Privacy</a></li>
            <li><a href="/transparency" className="hover:text-white transition-colors">Operational Transparency</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-lg mb-6">City Operations</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="text-movyra-blue shrink-0"/> 
              <span>Expanding across Tier 1 & 2 cities in India.</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-movyra-blue"/> support@movyra.in
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
        Copyright 2026 Movyra Technologies. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;