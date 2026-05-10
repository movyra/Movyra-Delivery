import React from 'react';

// Core Layout Components
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// The 10 High-End Modular Components
import AboutHero from '../../components/AboutHero';
import MissionStatement from '../../components/MissionStatement';
import LeadershipLetter from '../../components/LeadershipLetter';
import LeadershipTeam from '../../components/LeadershipTeam';
import Sustainability from '../../components/Sustainability';
import BeyondRides from '../../components/BeyondRides';
import SafetyFocus from '../../components/SafetyFocus';
import CompanyInfoCards from '../../components/CompanyInfoCards';
import LatestNewsGrid from '../../components/LatestNewsGrid';
import CallToAction from '../../components/CallToAction';

/**
 * ============================================================================
 * MODULE: MODULAR PREMIUM ABOUT PAGE ORCHESTRATOR (mv-main)
 * Architecture: 10 Sequentially Stacked Components
 * Styling: Built-in CSS-in-JS variables on the global wrapper
 * Data: Real-time logic contained within individual child components.
 * ============================================================================
 */

export default function AboutPage() {
  // Built-in styling object establishing the global design system variables
  const globalDesignSystem = {
    '--about-color-black': '#000000',
    '--about-color-white': '#ffffff',
    '--about-color-gray-50': '#fafafa',
    '--about-color-gray-100': '#f5f5f5',
    '--about-color-gray-200': '#eeeeee',
    '--about-color-gray-800': '#222222',
    '--about-color-gray-900': '#111111',
    '--about-color-accent-blue': '#276ef1',
    '--about-color-accent-green': '#05a357',
    '--about-section-padding-y': '120px',
    '--about-section-padding-y-mobile': '80px',
    '--about-container-max-width': '1440px',
    '--about-container-padding-x': '5%',
    '--about-transition-smooth': '0.4s cubic-bezier(0.16, 1, 0.3, 1)'
  };

  return (
    <div 
      className="about-page-global-wrapper bg-white text-[#111111] font-sans selection:bg-black selection:text-white overflow-x-hidden pt-20 flex flex-col min-h-screen"
      style={globalDesignSystem}
    >
      <Header />

      {/* Sequential stacking of the 10 real-time functional components */}
      <main className="w-full flex-grow flex flex-col">
        <AboutHero />
        <MissionStatement />
        <LeadershipLetter />
        <LeadershipTeam />
        <Sustainability />
        <BeyondRides />
        <SafetyFocus />
        <CompanyInfoCards />
        <LatestNewsGrid />
        <CallToAction />
      </main>

      <Footer />
    </div>
  );
}