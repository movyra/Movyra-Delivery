import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './pages/Home';
import DrivePage from './pages/Drive';
import EatPage from './pages/Eat';
import RidePage from './pages/Ride';
import FreightPage from './pages/Freight';
import FleetPage from './pages/Fleet';
import MerchantsPage from './pages/Merchants';
import AboutPage from './pages/About';
import CareersPage from './pages/Careers';
import InvestorsPage from './pages/Investors';
import NewsroomPage from './pages/Newsroom';
import SafetyPage from './pages/Safety';
import HelpPage from './pages/Help';
import LegalPage from './pages/Legal';
import CitiesPage from './pages/Cities';
import AirportsPage from './pages/Airports';
import ReservePage from './pages/Reserve';
import RentalsPage from './pages/Rentals';
import PackagePage from './pages/Package';
import PharmacyPage from './pages/Pharmacy';
import GroceryPage from './pages/Grocery';
import AlcoholPage from './pages/Alcohol';
import PetsPage from './pages/Pets';
import ElevatePage from './pages/Elevate';
import OnePage from './pages/One';
import ProPage from './pages/Pro';
import HealthPage from './pages/Health';
import TransitPage from './pages/Transit';
import CharterPage from './pages/Charter';
import BikesPage from './pages/Bikes';
import ScootersPage from './pages/Scooters';
import AutoPage from './pages/Auto';
import MotoPage from './pages/Moto';
import IntercityPage from './pages/Intercity';
import HourlyPage from './pages/Hourly';
import BusinessPage from './pages/Business';
import APIPage from './pages/API';
import DevelopersPage from './pages/Developers';
import AffiliatesPage from './pages/Affiliates';
import PartnersPage from './pages/Partners';
import AlumniPage from './pages/Alumni';
import DownloadPage from './pages/Download';

export default function App() {
  return (
    <BrowserRouter>
      {/* Global Transparent Navbar Overlay */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-[24px] font-black tracking-tighter text-black dark:text-white">Movyra.</div>
          <div className="hidden md:flex gap-8 font-bold text-[15px] text-gray-600 dark:text-gray-300">
            <a href="/drive" className="hover:text-black dark:hover:text-white transition-colors">Drive</a>
            <a href="/eat" className="hover:text-black dark:hover:text-white transition-colors">Eat</a>
            <a href="/business" className="hover:text-black dark:hover:text-white transition-colors">Business</a>
            <a href="/about" className="hover:text-black dark:hover:text-white transition-colors">About</a>
          </div>
          <div className="flex gap-4">
            <a href="/download" className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-full font-black text-[14px] hover:bg-gray-800 transition-colors">
              Download App
            </a>
          </div>
        </div>
      </nav>

      <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/drive' element={<DrivePage />} />
          <Route path='/eat' element={<EatPage />} />
          <Route path='/ride' element={<RidePage />} />
          <Route path='/freight' element={<FreightPage />} />
          <Route path='/fleet' element={<FleetPage />} />
          <Route path='/merchants' element={<MerchantsPage />} />
          <Route path='/about' element={<AboutPage />} />
          <Route path='/careers' element={<CareersPage />} />
          <Route path='/investors' element={<InvestorsPage />} />
          <Route path='/newsroom' element={<NewsroomPage />} />
          <Route path='/safety' element={<SafetyPage />} />
          <Route path='/help' element={<HelpPage />} />
          <Route path='/legal' element={<LegalPage />} />
          <Route path='/cities' element={<CitiesPage />} />
          <Route path='/airports' element={<AirportsPage />} />
          <Route path='/reserve' element={<ReservePage />} />
          <Route path='/rentals' element={<RentalsPage />} />
          <Route path='/package' element={<PackagePage />} />
          <Route path='/pharmacy' element={<PharmacyPage />} />
          <Route path='/grocery' element={<GroceryPage />} />
          <Route path='/alcohol' element={<AlcoholPage />} />
          <Route path='/pets' element={<PetsPage />} />
          <Route path='/elevate' element={<ElevatePage />} />
          <Route path='/one' element={<OnePage />} />
          <Route path='/pro' element={<ProPage />} />
          <Route path='/health' element={<HealthPage />} />
          <Route path='/transit' element={<TransitPage />} />
          <Route path='/charter' element={<CharterPage />} />
          <Route path='/bikes' element={<BikesPage />} />
          <Route path='/scooters' element={<ScootersPage />} />
          <Route path='/auto' element={<AutoPage />} />
          <Route path='/moto' element={<MotoPage />} />
          <Route path='/intercity' element={<IntercityPage />} />
          <Route path='/hourly' element={<HourlyPage />} />
          <Route path='/business' element={<BusinessPage />} />
          <Route path='/api' element={<APIPage />} />
          <Route path='/developers' element={<DevelopersPage />} />
          <Route path='/affiliates' element={<AffiliatesPage />} />
          <Route path='/partners' element={<PartnersPage />} />
          <Route path='/alumni' element={<AlumniPage />} />
          <Route path='/download' element={<DownloadPage />} />
      </Routes>
    </BrowserRouter>
  );
}
