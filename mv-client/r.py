import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip())

# 1. THEME & GLOBAL STYLES
tailwind_config = """
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bongoBlue: '#00A3FF',
        uberBlack: '#000000',
        uberGray: '#F3F3F3',
        iosDark: '#121212',
        iosBorder: '#2A2A2A',
      },
      fontFamily: {
        sans: ['"SF Pro Display"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'monospace'],
      },
      borderRadius: {
        'ios': '32px',
        'uber': '12px'
      }
    },
  },
  plugins: [],
}
"""

index_css = """
@import "tailwindcss";
@theme {
  --color-bongo-blue: #00A3FF;
}
html { scroll-behavior: smooth; }
body { 
  margin: 0; 
  -webkit-font-smoothing: antialiased; 
  font-family: "SF Pro Display", sans-serif;
  overflow-x: hidden;
}
.ios-glass {
  background: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
@keyframes scanning {
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
}
.animate-scan { animation: scanning 3s infinite ease-in-out; }
"""

# 2. CUSTOM SVG ASSETS (Icons & Illustrations)
custom_assets = """
import React from 'react';

export const BongoLogo = ({ color = "white" }) => (
  <div className="flex items-center gap-2">
    <div className="w-9 h-9 bg-[#1A1A1A] rounded-lg flex items-center justify-center border border-[#2A2A2A]">
      <span className="text-[#00A3FF] font-black text-xl">B</span>
    </div>
    <span style={{ color }} className="font-extrabold text-[22px] tracking-tighter">BONGO</span>
  </div>
);

export const SuitcaseIllustration = () => (
  <svg viewBox="0 0 550 550" fill="none" className="w-full h-full drop-shadow-2xl">
    <rect x="50" y="50" width="450" height="450" rx="40" fill="#FFC043" />
    <rect x="80" y="100" width="390" height="340" rx="20" fill="black" fillOpacity="0.05" />
    <g transform="translate(100, 130)">
       <rect width="120" height="180" rx="10" fill="white" />
       {[20, 40, 60, 80].map(y => <rect key={y} y={y} width="120" height="10" fill="#00A3FF" opacity="0.4" />)}
    </g>
    <circle cx="300" cy="180" r="25" fill="#1A1A1A" />
    <circle cx="360" cy="180" r="25" fill="#1A1A1A" />
  </svg>
);

export const Truck3DIcon = () => (
  <svg viewBox="0 0 200 200" fill="none" className="w-32 h-32 rotate-[-15deg]">
    <path d="M40 140L160 140L180 120L60 120L40 140Z" fill="black" fillOpacity="0.1" />
    <rect x="60" y="60" width="100" height="60" fill="#FF3B30" />
    <rect x="20" y="90" width="40" height="30" fill="#FF3B30" />
    <circle cx="45" cy="130" r="12" fill="#1A1A1A" />
    <circle cx="130" cy="130" r="12" fill="#1A1A1A" />
  </svg>
);
"""

# 3. PUBLIC HEADER (Uber Style Wide + 2-Line Hamburger)
header_jsx = """
import React, { useState } from 'react';
import { Globe, ChevronDown, ChevronRight } from 'lucide-react';
import { BongoLogo } from '../assets/Icons';

export default function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);

  return (
    <header className="bg-black text-white h-16 md:h-20 sticky top-0 z-[100] border-b border-[#1A1A1A]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 h-full flex items-center justify-between">
        <div className="flex items-center gap-10">
          <a href="/"><BongoLogo /></a>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <a href="#" className="hover:text-gray-300 transition-colors">Ride</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Drive</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Business</a>
            <div className="relative group cursor-pointer flex items-center gap-1">
              About <ChevronDown size={14} />
            </div>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
             <span className="flex items-center gap-1.5"><Globe size={16}/> EN</span>
             <a href="#" className="hover:text-gray-300">Help</a>
             <a href="#" className="hover:text-gray-300">Log in</a>
          </div>
          <a href="/entry/auth-signup.html" className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition-all">Sign up</a>
          
          {/* 2-LINE HAMBURGER (Strictly 2 lines) */}
          <button className="lg:hidden flex flex-col gap-[6px] p-2" onClick={() => setIsOpen(!isOpen)}>
            <div className={`w-6 h-[2px] bg-white transition-all ${isOpen ? 'rotate-45 translate-y-[4px]' : ''}`}></div>
            <div className={`w-6 h-[2px] bg-white transition-all ${isOpen ? '-rotate-45 -translate-y-[4px]' : ''}`}></div>
          </button>
        </div>
      </div>
    </header>
  );
}
"""

# 4. LANDING PAGE (Uber Style, 7+ Sections)
landing_jsx = """
import React, { useState } from 'react';
import PublicHeader from '../components/PublicHeader';
import { Clock, MapPin, Navigation, ChevronDown, Calendar, FileText, CheckCircle2, QrCode } from 'lucide-react';
import { SuitcaseIllustration, Truck3DIcon } from '../assets/Icons';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      
      {/* SECTION 1: HERO (image_b1cf34) */}
      <section className="max-w-[1440px] mx-auto px-4 lg:px-12 py-16 flex flex-col lg:flex-row items-center gap-20">
        <div className="w-full lg:w-1/2 space-y-10">
           <div className="flex items-center gap-2 font-bold text-[15px]"><MapPin size={16}/> Pune, IN <span className="text-gray-400 underline ml-2 cursor-pointer">Change city</span></div>
           <h1 className="text-5xl lg:text-[72px] font-bold leading-[1.1] tracking-tighter text-black">Go anywhere with Bongo</h1>
           <div className="space-y-4 max-w-lg">
              <button className="bg-[#F3F3F3] px-5 py-3 rounded-full flex items-center gap-2 font-bold text-sm hover:bg-gray-200 transition-colors">
                <Clock size={18}/> Pickup now <ChevronDown size={16}/>
              </button>
              <div className="relative space-y-3">
                <div className="absolute left-[23px] top-[25px] bottom-[25px] w-0.5 bg-black"></div>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-black bg-white z-10"></div>
                  <input className="w-full bg-[#F3F3F3] p-5 pl-14 rounded-lg font-medium outline-none text-lg" placeholder="Pickup location" />
                  <Navigation size={22} className="absolute right-5 top-1/2 -translate-y-1/2 text-red-500 fill-current"/>
                </div>
                <div className="relative">
                   <div className="absolute left-5 top-1/2 -translate-y-1/2 w-2 h-2 bg-black z-10"></div>
                   <input className="w-full bg-[#F3F3F3] p-5 pl-14 rounded-lg font-medium outline-none text-lg" placeholder="Dropoff location" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                <button className="bg-black text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-zinc-800 transition-all w-full sm:w-auto shadow-xl">See prices</button>
                <span className="text-sm text-gray-500 border-b border-gray-200 pb-1 font-medium cursor-pointer hover:text-black">Log in to see your recent activity</span>
              </div>
           </div>
        </div>
        <div className="w-full lg:w-1/2 relative">
          <div className="aspect-square bg-[#FFC043] rounded-ios overflow-hidden relative shadow-2xl">
            <SuitcaseIllustration />
            <div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-xl flex justify-between items-center shadow-2xl border border-white/40">
              <div>
                <p className="font-bold text-xl text-black">Ready to travel?</p>
                <p className="text-sm text-gray-500">Fast & Secure logistics</p>
              </div>
              <button className="bg-white border px-6 py-3 rounded-full font-black text-sm shadow-sm hover:bg-black hover:text-white transition-all">Schedule ahead</button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: EXPLORE (image_b1cfea) */}
      <section className="bg-white py-24 px-4 md:px-12 border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-16 tracking-tight">Explore what you can do with Bongo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Ride", desc: "Go anywhere with Bongo. Request a ride, hop in, and go.", icon: "🚗" },
              { title: "Reserve", desc: "Reserve your ride in advance so you can relax on the day of your trip.", icon: "📅" },
              { title: "Parcel", desc: "Bongo makes same-day item delivery easier than ever.", icon: "📦" }
            ].map((item, i) => (
              <div key={i} className="bg-[#F6F6F6] p-10 rounded-2xl h-[280px] flex flex-col justify-between group hover:bg-[#EEEEEE] transition-all">
                <div>
                  <h3 className="text-[28px] font-bold mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-gray-600 font-medium leading-relaxed max-w-[220px]">{item.desc}</p>
                  <button className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-black mt-6 shadow-sm border border-transparent hover:border-gray-200">Details</button>
                </div>
                <div className="self-end text-7xl group-hover:scale-110 transition-transform">{item.icon}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: ACCOUNT DETAILS (image_b1d02b) */}
      <section className="py-24 px-4 md:px-12 bg-white border-t border-gray-100">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <h2 className="text-5xl font-bold text-black tracking-tight leading-tight">Log in to see your account details</h2>
            <p className="text-gray-600 text-lg font-medium">View past trips, tailored suggestions, support resources, and more.</p>
            <div className="flex gap-6">
              <button className="bg-black text-white px-8 py-4 rounded-lg font-bold">Log in to your account</button>
              <button className="text-black font-bold border-b-2 border-black/10 hover:border-black transition-all pb-1">Create an account</button>
            </div>
          </div>
          <div className="flex-1 w-full bg-[#F3F3F3] rounded-ios aspect-video flex items-center justify-center border border-gray-100">
             <div className="flex gap-4">
                <div className="w-24 h-40 bg-bongoBlue rounded-t-full"></div>
                <div className="w-24 h-40 bg-black rounded-t-full"></div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: RESERVE (image_b1d2f3) */}
      <section className="bg-white py-20 px-4 md:px-12">
        <div className="max-w-[1440px] mx-auto bg-[#EDF5F7] rounded-[48px] overflow-hidden flex flex-col lg:flex-row border border-gray-100 shadow-sm">
           <div className="flex-[1.5] p-12 lg:p-24 space-y-10">
              <h2 className="text-5xl md:text-[64px] font-bold text-black leading-none tracking-tighter">Plan for later</h2>
              <div className="py-8 space-y-6">
                 <h3 className="text-4xl font-bold leading-tight">Get your ride right with Bongo Reserve</h3>
                 <p className="font-bold text-lg mt-8">Choose date and time</p>
                 <div className="flex gap-4 max-w-sm">
                    <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-3 text-gray-400 font-bold"><Calendar size={20}/> Date</div>
                    <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between text-gray-400 font-bold"><div className="flex items-center gap-3"><Clock size={20}/> Time</div><ChevronDown size={18}/></div>
                 </div>
                 <button className="w-full max-w-sm bg-black text-white py-4 rounded-lg font-bold mt-4 hover:bg-zinc-800 shadow-xl transition-all">Next</button>
              </div>
           </div>
           <div className="flex-1 bg-[#B5DCE4] p-12 lg:p-24 border-l border-white/20">
              <h4 className="text-2xl font-bold mb-10 tracking-tight">Benefits</h4>
              <ul className="space-y-12">
                 {[
                   { icon: <Calendar size={24}/>, text: "Choose your exact pickup time up to 90 days in advance." },
                   { icon: <Clock size={24}/>, text: "Extra wait time included to meet your ride." },
                   { icon: <FileText size={24}/>, text: "Cancel at no charge up to 60 minutes in advance." }
                 ].map((item, idx) => (
                   <li key={idx} className="flex gap-6 items-start">
                      <div className="mt-1 text-black bg-white/30 p-2 rounded-lg">{item.icon}</div>
                      <p className="text-gray-800 font-bold text-[17px] leading-snug">{item.text}</p>
                   </li>
                 ))}
              </ul>
           </div>
        </div>
      </section>

      {/* SECTION 5: PARTNER CTA (image_b0cfea style) */}
      <section className="bg-iosDark py-32 px-4 border-t-[12px] border-bongoBlue">
         <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="w-24 h-24 bg-bongoBlue rounded-ios mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(0,163,255,0.3)]">
               <span className="text-white font-black text-5xl italic">B</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-[0.9]">Want to send<br/><span className="text-bongoBlue">parcels too?</span></h2>
            <p className="text-gray-400 text-xl font-medium max-w-lg mx-auto">Download our app from AppStore or Google Play and send your parcels in 1 click.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
               <button className="bg-bongoBlue text-white px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-2xl uppercase tracking-widest italic">Download App</button>
               <button className="text-gray-500 font-bold hover:text-white transition-colors">Not now</button>
            </div>
         </div>
      </section>

      {/* SECTION 6: GLOBAL NETWORK */}
      <section className="bg-white py-24 border-t border-gray-100 px-4">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-12">Popular cities for Bongo</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
               {['Warsaw', 'London', 'Dubai', 'Riyadh', 'Mumbai', 'Delhi', 'Pune', 'Singapore'].map(city => (
                  <div key={city} className="text-gray-500 hover:text-black font-bold text-lg cursor-pointer transition-colors hover:underline decoration-2 underline-offset-8">{city}</div>
               ))}
            </div>
         </div>
      </section>

      {/* SECTION 7: FINAL CTA (Uber style) */}
      <section className="bg-black py-24 px-4 text-center">
         <h2 className="text-white text-5xl md:text-7xl font-bold mb-12 tracking-tight">Ready to move?</h2>
         <a href="/entry/auth-signup.html" className="inline-block bg-white text-black px-12 py-5 rounded-xl font-black text-2xl hover:bg-gray-200 transition-all shadow-2xl">Get started now</a>
      </section>
    </div>
  );
}
"""

def build():
    print("🚀 Building Bongo Architecture...")
    write_file("tailwind.config.js", tailwind_config)
    write_file("src/index.css", index_css)
    write_file("src/assets/Icons.jsx", custom_assets)
    write_file("src/components/PublicHeader.jsx", header_jsx)
    write_file("src/pages/LandingPage.jsx", landing_jsx)
    print("✅ Successfully built landing page and system configs!")

if __name__ == "__main__":
    build()