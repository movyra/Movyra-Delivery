import React, { useState, useEffect } from 'react';

const AboutHero = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeFeatureFilter, setActiveFeatureFilter] = useState('All');

  // Real-time logic: Live clock and dynamic greeting based on user's actual system time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hours = currentTime.getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const featureData = [
    { category: 'Safety', title: 'Live GPS Synchronization', desc: 'Real-time granular tracking of every active route across the global network.', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
    { category: 'Environment', title: 'Zero-Emission Pledges', desc: 'Transitioning the fleet to 100% electric vehicles to combat global climate change.', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { category: 'Operations', title: 'Instantaneous Dispatch', desc: 'Algorithmic matching connecting the closest available vehicle in milliseconds.', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
    { category: 'Finance', title: 'Dynamic Fare Computation', desc: 'Transparent, upfront pricing calculated via real-time traffic and demand metrics.', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' },
    { category: 'Safety', title: 'Partner Verification', desc: 'Multi-layer background checks and continuous driving record monitoring.', icon: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' },
    { category: 'Operations', title: '24/7 Global Support', desc: 'Round-the-clock incident response teams available in over 40 languages.', icon: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z' },
    { category: 'Finance', title: 'Encrypted Transactions', desc: 'PCI-DSS compliant payment gateways ensuring total financial data security.', icon: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z' },
    { category: 'Environment', title: 'Smart City Integration', desc: 'Data partnerships with municipal governments to reduce urban congestion.', icon: 'M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z' },
    { category: 'Operations', title: 'Enterprise Logistics', desc: 'Dedicated corporate dashboards for managing employee travel and freight.', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v-2h2V7c0-1.1.9-2 2-2h2v2h2v5zm4 0h-2V7h-2v5h-2v-2h2V7c0-1.1.9-2 2-2h2v2h2v5z' },
    { category: 'Accessibility', title: 'Universal Access Protocol', desc: 'Wheelchair-accessible vehicle routing and visual impairment app optimization.', icon: 'M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z' }
  ];

  const filteredFeatures = activeFeatureFilter === 'All' 
    ? featureData 
    : featureData.filter(f => f.category === activeFeatureFilter);

  return (
    <div className="relative w-full bg-white overflow-hidden font-sans text-black">
      
      {/* Inline styles for custom high-end keyframes not natively supported by base utility classes */}
      <style>
        {`
          @keyframes customSlowSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes customFloatCard {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
          .animate-custom-spin {
            animation: customSlowSpin 60s linear infinite;
          }
          .animate-custom-float {
            animation: customFloatCard 4s ease-in-out infinite;
          }
        `}
      </style>

      {/* Background High-End SVG Animations */}
      <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] z-0 opacity-[0.03] pointer-events-none animate-custom-spin">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="#000000" d="M45.7,-76.3C58.9,-69.3,69.1,-55.3,77.2,-40.5C85.3,-25.7,91.3,-10.1,90.4,5.1C89.5,20.3,81.7,35.1,71.1,46.7C60.5,58.3,47.1,66.7,32.3,73.4C17.5,80.1,1.3,85.1,-14.2,83.1C-29.7,81.1,-44.5,72,-56.9,60.6C-69.3,49.2,-79.3,35.5,-84.4,20.1C-89.5,4.7,-89.7,-12.3,-83.4,-27.1C-77.1,-41.9,-64.3,-54.5,-49.9,-61.6C-35.5,-68.7,-19.5,-70.3,-2.3,-67.2C14.9,-64.1,29.8,-56.3,45.7,-76.3Z" transform="translate(100 100)" />
        </svg>
      </div>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between max-w-[1400px] mx-auto px-6 lg:px-12 py-24 lg:py-32 relative z-10 min-h-[80vh]">
        <div className="flex-1 max-w-[650px] lg:pr-16 mb-16 lg:mb-0 text-center lg:text-left">
          <span className="inline-block px-4 py-2 bg-[#f6f6f6] rounded-full text-[0.85rem] font-semibold mb-6 tracking-wide uppercase text-black">
            {getGreeting()}. Local Time: {currentTime.toLocaleTimeString()}
          </span>
          <h1 className="text-[3rem] lg:text-[4.5rem] font-bold leading-[1.05] mb-8 tracking-[-1.5px] text-black">
            We reimagine the way the <span className="underline decoration-[#eeeeee] underline-offset-8">world moves</span> for the better
          </h1>
          <p className="text-[1.15rem] lg:text-[1.25rem] leading-[1.6] color-[#444444] mb-10 text-gray-700">
            Movement is what we power. It is our lifeblood. It runs through our veins. It is what gets us out of bed each morning. It pushes us to constantly reimagine how we can move better. Across the entire world. In real time.
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            {/* Real SVG Apple Store Badge */}
            <a href="#ios-store" className="transition-transform duration-300 hover:-translate-y-1 block">
              <svg viewBox="0 0 135 40" width="135" height="40">
                <path d="M130.2,40H4.8C2.1,40,0,37.9,0,35.2V4.8C0,2.1,2.1,0,4.8,0h125.4C132.9,0,135,2.1,135,4.8v30.4C135,37.9,132.9,40,130.2,40z" fill="#000000"/>
                <path d="M31.2,14.6c0-3.3,2.7-4.9,2.8-5c-1.5-2.2-3.9-2.5-4.7-2.6c-2-0.2-3.9,1.2-5,1.2c-1,0-2.6-1.1-4.2-1.1c-2.1,0-4.1,1.2-5.1,3c-2.2,3.8-0.6,9.4,1.5,12.5c1,1.5,2.2,3.1,3.8,3.1c1.5,0,2.1-0.9,3.9-0.9c1.8,0,2.4,0.9,4,0.9c1.6,0,2.6-1.5,3.6-3c1.2-1.7,1.7-3.4,1.7-3.5C33.4,19.1,31.2,17.3,31.2,14.6z M27.1,9.8c0.8-1,1.4-2.4,1.2-3.8c-1.2,0.1-2.7,0.8-3.6,1.8c-0.7,0.8-1.4,2.2-1.2,3.6C24.8,11.5,26.2,10.8,27.1,9.8z" fill="#FFFFFF"/>
                <text x="45" y="16" fill="#FFFFFF" fontSize="10" fontFamily="sans-serif">Download on the</text>
                <text x="45" y="32" fill="#FFFFFF" fontSize="16" fontFamily="sans-serif" fontWeight="bold">App Store</text>
              </svg>
            </a>
            
            {/* Real SVG Google Play Badge */}
            <a href="#android-store" className="transition-transform duration-300 hover:-translate-y-1 block">
              <svg viewBox="0 0 135 40" width="135" height="40">
                <path d="M130.2,40H4.8C2.1,40,0,37.9,0,35.2V4.8C0,2.1,2.1,0,4.8,0h125.4C132.9,0,135,2.1,135,4.8v30.4C135,37.9,132.9,40,130.2,40z" fill="#000000"/>
                <path d="M12.6,9.1L24,20.4L12.6,31.8c-0.5,0.5-1.4,0.1-1.4-0.6V9.7C11.2,9,12.1,8.6,12.6,9.1z" fill="#00E676"/>
                <path d="M25.4,21.9l4.5,4.5l-17.3,9.8c-1.1,0.6-2.5-0.1-2.5-1.4v-0.6L25.4,21.9z" fill="#F44336"/>
                <path d="M25.4,18.9L10.1,3.7v-0.6c0-1.3,1.4-2,2.5-1.4l17.3,9.8L25.4,18.9z" fill="#FFC107"/>
                <path d="M31.8,18.9l-4.9-2.8l-1.4,1.4l0,0l0,0l1.4,1.4l4.9-2.8C32.6,19.9,32.6,19.3,31.8,18.9z" fill="#2196F3"/>
                <text x="45" y="16" fill="#FFFFFF" fontSize="10" fontFamily="sans-serif">GET IT ON</text>
                <text x="45" y="32" fill="#FFFFFF" fontSize="16" fontFamily="sans-serif" fontWeight="bold">Google Play</text>
              </svg>
            </a>
          </div>
        </div>

        <div className="flex-1 flex justify-center lg:justify-end w-full relative">
          <div className="relative w-full max-w-[600px]">
            <img 
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80" 
              alt="Two smiling individuals representing our community" 
              className="w-full h-auto rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.12)] object-cover"
            />
            <div className="absolute -bottom-[30px] lg:-left-[40px] left-[20px] bg-black text-white px-8 py-6 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] flex flex-col animate-custom-float">
              <span className="text-[2rem] font-extrabold">10,000+</span>
              <span className="text-[0.9rem] opacity-80">Cities Worldwide</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 10+ Features Section */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24 relative z-10">
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-[2.5rem] lg:text-[3rem] font-bold mb-8 tracking-tight text-black">Our Core Architecture</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['All', 'Safety', 'Operations', 'Finance', 'Environment', 'Accessibility'].map(filter => (
              <button 
                key={filter} 
                className={`px-6 py-2 border rounded-full cursor-pointer font-semibold text-[0.95rem] transition-all duration-300 ${activeFeatureFilter === filter ? 'bg-black text-white border-black' : 'bg-transparent text-black border-[#e0e0e0] hover:bg-black hover:text-white hover:border-black'}`}
                onClick={() => setActiveFeatureFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredFeatures.map((feature, index) => (
            <div className="bg-[#f9f9f9] p-8 rounded-[20px] transition-all duration-300 transform hover:-translate-y-2 hover:bg-white border border-transparent hover:border-[#f0f0f0] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] flex flex-col" key={index}>
              <div className="w-[60px] h-[60px] bg-[#eeeeee] rounded-xl flex items-center justify-center mb-6">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="#000000">
                  <path d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-[1.25rem] font-bold mb-3 text-black">{feature.title}</h3>
              <p className="text-[1rem] text-[#555555] leading-[1.5] mb-6 flex-grow">{feature.desc}</p>
              <span className="self-start text-[0.75rem] uppercase tracking-widest font-bold bg-[#e0e0e0] px-3 py-1 rounded text-black">{feature.category}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutHero;