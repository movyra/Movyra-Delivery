import React, { useState } from 'react';
import PublicHeader from '../components/PublicHeader';
import { Clock, MapPin, Navigation, ChevronDown, Calendar, FileText, CheckCircle2, QrCode } from 'lucide-react';
import { SuitcaseIllustration, Truck3DIcon } from '../assets/Icons';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-deepMidnight text-white overflow-hidden relative font-sans selection:bg-neonCloud selection:text-white">
      {/* Global Ambient Glows for the "Think in the cloud" aesthetic */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-neonCloud/30 rounded-full blur-[150px] -z-10 pointer-events-none mix-blend-screen"></div>
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-bongoBlue/20 rounded-full blur-[150px] -z-10 pointer-events-none mix-blend-screen"></div>

      <PublicHeader />
      
      {/* SECTION 1: HERO */}
      <section className="relative max-w-[1440px] mx-auto px-6 lg:px-12 pt-40 pb-24 flex flex-col lg:flex-row items-center gap-20">
        <div className="w-full lg:w-[55%] space-y-12 z-10">
          <div className="flex items-center gap-3 font-medium text-sm tracking-[0.2em] uppercase text-white/70">
            <MapPin size={18} className="text-neonCloud"/> Pune, IN 
            <span className="text-neonCloud underline ml-2 cursor-pointer hover:text-white transition-colors">Change city</span>
          </div>
          
          <h1 className="text-6xl md:text-[88px] lg:text-[104px] font-serif font-medium leading-[0.9] tracking-[-0.03em] text-white">
            Go anywhere <br/><span className="text-white/50 italic">with Bongo.</span>
          </h1>
          
          {/* Glassmorphic Input Container */}
          <div className="space-y-6 max-w-[540px] bg-white/[0.03] border border-white/10 p-6 rounded-[32px] backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <button className="bg-white/10 px-6 py-3 rounded-full flex items-center gap-2 font-semibold text-sm hover:bg-white/20 transition-colors">
              <Clock size={18} className="text-neonCloud"/> Pickup now <ChevronDown size={16}/>
            </button>
            
            <div className="relative space-y-4 p-2">
              <div className="absolute left-[30px] top-[45px] bottom-[45px] w-0.5 bg-white/10"></div>
              
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-[3px] border-neonCloud bg-deepMidnight z-10 shadow-[0_0_10px_rgba(0,163,255,0.8)]"></div>
                <input className="w-full bg-white/5 border-2 border-white/10 p-6 pl-16 rounded-2xl font-medium outline-none text-lg focus:border-neonCloud focus:bg-white/10 transition-all duration-300 text-white placeholder-white/40 shadow-inner" placeholder="Pickup location" />
                <Navigation size={22} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-neonCloud transition-colors fill-current"/>
              </div>
              
              <div className="relative group">
                 <div className="absolute left-6 top-1/2 -translate-y-1/2 w-3 h-3 bg-white z-10 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                 <input className="w-full bg-white/5 border-2 border-white/10 p-6 pl-16 rounded-2xl font-medium outline-none text-lg focus:border-neonCloud focus:bg-white/10 transition-all duration-300 text-white placeholder-white/40 shadow-inner" placeholder="Dropoff location" />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
              <button className="bg-white text-deepMidnight px-10 py-5 rounded-xl font-bold text-lg hover:bg-gray-200 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto shadow-[0_0_30px_rgba(255,255,255,0.2)]">See prices</button>
              <span className="text-sm text-white/50 border-b border-white/20 pb-1 font-medium cursor-pointer hover:text-white transition-all">Log in to see your recent activity</span>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-[45%] relative z-10">
          <div className="aspect-square bg-white/[0.02] border border-white/10 rounded-[48px] overflow-hidden relative shadow-[0_0_80px_rgba(0,163,255,0.1)] flex items-center justify-center backdrop-blur-3xl group">
            <div className="absolute inset-0 bg-gradient-to-tr from-neonCloud/20 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>
            <div className="scale-125 group-hover:scale-110 transition-transform duration-700 ease-out">
              <SuitcaseIllustration />
            </div>
            <div className="absolute bottom-8 left-8 right-8 bg-deepMidnight/80 backdrop-blur-xl p-8 rounded-3xl flex justify-between items-center shadow-2xl border border-white/10">
              <div>
                <p className="font-serif text-3xl text-white tracking-tight">Ready to travel?</p>
                <p className="text-sm text-neonCloud font-medium mt-1 uppercase tracking-widest">Fast & Secure</p>
              </div>
              <button className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 transition-all">Schedule</button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: EXPLORE */}
      <section className="relative py-32 px-6 md:px-12 border-t border-white/10 bg-deepMidnight">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-neonCloud/10 rounded-full blur-[150px] -z-10 pointer-events-none mix-blend-screen"></div>
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-5xl md:text-[80px] font-serif leading-[1.1] text-white mb-20 tracking-tight">
            Explore what you can <br/><span className="italic text-white/50">do with Bongo.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Ride", desc: "Go anywhere with Bongo. Request a ride, hop in, and go.", icon: "🚗" },
              { title: "Reserve", desc: "Reserve your ride in advance so you can relax on the day of your trip.", icon: "📅" },
              { title: "Parcel", desc: "Bongo makes same-day item delivery easier than ever.", icon: "📦" }
            ].map((item, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 p-12 rounded-[32px] h-[340px] flex flex-col justify-between group hover:bg-white/10 hover:border-white/20 transition-all duration-500 backdrop-blur-xl">
                <div>
                  <h3 className="text-4xl font-serif mb-4 tracking-tight">{item.title}</h3>
                  <p className="text-white/60 font-medium leading-relaxed max-w-[240px] text-lg">{item.desc}</p>
                </div>
                <div className="flex justify-between items-end">
                  <button className="bg-white text-black px-8 py-3 rounded-full text-sm font-bold shadow-sm hover:scale-105 transition-all">Details</button>
                  <div className="text-6xl group-hover:scale-125 transition-transform duration-500 origin-bottom-right">{item.icon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: ACCOUNT DETAILS */}
      <section className="relative py-32 px-6 md:px-12 border-t border-white/10 overflow-hidden">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-10 z-10">
            <h2 className="text-6xl md:text-[88px] font-serif text-white tracking-tight leading-[1.05]">
              Log in to see your <br/><span className="italic text-neonCloud">account details.</span>
            </h2>
            <p className="text-white/60 text-xl font-medium max-w-lg leading-relaxed">View past trips, tailored suggestions, support resources, and more.</p>
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <button className="bg-neonCloud text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-blue-600 hover:shadow-[0_0_30px_rgba(0,163,255,0.4)] transition-all w-full sm:w-auto">Log in to account</button>
              <button className="text-white font-bold border-b-2 border-white/20 hover:border-white transition-all pb-1 text-lg">Create an account</button>
            </div>
          </div>
          <div className="flex-1 w-full bg-white/[0.03] backdrop-blur-2xl rounded-[48px] aspect-video flex items-center justify-center border border-white/10 relative shadow-[0_0_100px_rgba(255,255,255,0.05)]">
             <div className="absolute inset-0 bg-gradient-to-bl from-neonCloud/10 to-transparent rounded-[48px]"></div>
             <div className="flex gap-6 z-10">
                <div className="w-24 h-48 bg-neonCloud rounded-full shadow-[0_0_40px_rgba(0,163,255,0.5)]"></div>
                <div className="w-24 h-48 bg-white rounded-full shadow-[0_0_40px_rgba(255,255,255,0.2)] transform translate-y-8"></div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: RESERVE */}
      <section className="bg-deepMidnight py-32 px-6 md:px-12 relative border-t border-white/10">
        <div className="max-w-[1440px] mx-auto bg-white/[0.03] backdrop-blur-3xl rounded-[64px] overflow-hidden flex flex-col lg:flex-row border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
           <div className="flex-[1.5] p-12 lg:p-24 space-y-12 relative">
              <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-neonCloud/20 rounded-full blur-[100px] pointer-events-none"></div>
              <h2 className="text-6xl md:text-[88px] font-serif text-white leading-none tracking-tight">Plan for <span className="italic text-white/50">later.</span></h2>
              <div className="py-4 space-y-8 relative z-10">
                 <h3 className="text-3xl font-sans font-medium text-white/90 leading-tight">Get your ride right with Bongo Reserve</h3>
                 <p className="font-medium text-lg text-neonCloud tracking-widest uppercase">Choose date and time</p>
                 <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
                    <div className="flex-1 bg-white/5 p-6 rounded-2xl border border-white/20 flex items-center gap-4 text-white font-medium backdrop-blur-md cursor-pointer hover:bg-white/10 transition-colors"><Calendar size={22} className="text-neonCloud"/> Date</div>
                    <div className="flex-1 bg-white/5 p-6 rounded-2xl border border-white/20 flex items-center justify-between text-white font-medium backdrop-blur-md cursor-pointer hover:bg-white/10 transition-colors"><div className="flex items-center gap-4"><Clock size={22} className="text-neonCloud"/> Time</div><ChevronDown size={20}/></div>
                 </div>
                 <button className="w-full max-w-lg bg-white text-deepMidnight py-5 rounded-2xl font-bold text-lg mt-4 hover:bg-gray-200 hover:scale-[1.02] shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all">Next</button>
              </div>
           </div>
           <div className="flex-1 bg-neonCloud/10 p-12 lg:p-24 border-l border-white/10 backdrop-blur-xl">
              <h4 className="text-2xl font-sans font-bold mb-12 tracking-widest uppercase text-white/80">Benefits</h4>
              <ul className="space-y-12">
                 {[
                   { icon: <Calendar size={24}/>, text: "Choose your exact pickup time up to 90 days in advance." },
                   { icon: <Clock size={24}/>, text: "Extra wait time included to meet your ride." },
                   { icon: <FileText size={24}/>, text: "Cancel at no charge up to 60 minutes in advance." }
                 ].map((item, idx) => (
                   <li key={idx} className="flex gap-6 items-start group">
                      <div className="mt-1 text-neonCloud bg-white/5 p-4 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,163,255,0.1)]">{item.icon}</div>
                      <p className="text-white/80 font-medium text-[19px] leading-relaxed pt-2">{item.text}</p>
                   </li>
                 ))}
              </ul>
           </div>
        </div>
      </section>

      {/* SECTION 5: PARTNER CTA */}
      <section className="relative py-40 px-6 border-t border-white/10 overflow-hidden">
         <div className="absolute inset-0 bg-neonCloud/5 blur-[150px] -z-10"></div>
         <div className="max-w-5xl mx-auto text-center space-y-12 relative z-10">
            <div className="w-32 h-32 bg-neonCloud rounded-full mx-auto flex items-center justify-center shadow-[0_0_80px_rgba(0,163,255,0.6)]">
               <span className="text-white font-serif text-6xl italic">B</span>
            </div>
            <h2 className="text-6xl md:text-[96px] font-serif text-white tracking-tight leading-[0.9]">
              Want to send <br/><span className="italic text-neonCloud">parcels too?</span>
            </h2>
            <p className="text-white/60 text-2xl font-medium max-w-2xl mx-auto">Download our app from AppStore or Google Play and send your parcels in 1 click.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
               <button className="bg-white text-deepMidnight px-12 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]">Download App</button>
               <button className="text-white/50 font-bold hover:text-white transition-colors text-lg px-8">Not now</button>
            </div>
         </div>
      </section>

      {/* SECTION 6: GLOBAL NETWORK (Typography Poster Style) */}
      <section className="bg-deepMidnight py-40 border-t border-white/10 px-6 overflow-hidden">
         <div className="max-w-[1440px] mx-auto relative">
            <h2 className="text-sm font-sans font-bold uppercase tracking-[0.3em] text-neonCloud mb-16 text-center">Popular cities for Bongo</h2>
            <div className="flex flex-wrap gap-x-8 gap-y-4 justify-center text-center">
               {['Warsaw', 'London', 'Dubai', 'Riyadh', 'Mumbai', 'Delhi', 'Pune', 'Singapore'].map(city => (
                  <div key={city} className="font-serif text-[64px] md:text-[100px] lg:text-[140px] leading-[0.9] text-white/20 hover:text-white cursor-pointer transition-all duration-500 hover:scale-105 hover:drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                    {city}
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* SECTION 7: FINAL CTA */}
      <section className="relative py-40 px-6 text-center border-t border-white/10">
         <div className="absolute inset-0 bg-gradient-to-t from-neonCloud/20 to-transparent -z-10"></div>
         <h2 className="text-white text-7xl md:text-[120px] font-serif mb-16 tracking-tight leading-none">Ready to <span className="italic text-neonCloud">move?</span></h2>
         <a href="/entry/auth-signup.html" className="inline-block bg-white text-deepMidnight px-16 py-6 rounded-full font-bold text-2xl hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_60px_rgba(255,255,255,0.3)]">Get started now</a>
      </section>
    </div>
  );
}