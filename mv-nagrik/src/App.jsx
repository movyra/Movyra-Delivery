import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Lazy loading route components for optimal performance and code splitting
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const Home = React.lazy(() => import('./pages/Home'));
const Alerts = React.lazy(() => import('./pages/Alerts'));
const Feed = React.lazy(() => import('./pages/Feed'));
const More = React.lazy(() => import('./pages/More'));
const Report = React.lazy(() => import('./pages/Report'));

// Minimalist loader utilizing the NagrikSetu Civic Teal brand identity
const PageLoader = () => (
    <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E0F2F1] border-t-[#00897B] rounded-full animate-spin"></div>
    </div>
);

export default function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
                <AnimatePresence mode="wait">
                    <Routes>
                        {/* Core NagrikSetu Public Routes */}
                        {/* Note: The 13+ Indian language state provider and Bottom Navigation 
                            will be injected inside the individual page components or a dedicated Layout wrapper 
                            to ensure strict modularity. */}
                        
                        <Route path="/" element={<Navigate to="/onboarding" replace />} />
                        <Route path="/onboarding" element={<Onboarding />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/alerts" element={<Alerts />} />
                        <Route path="/feed" element={<Feed />} />
                        <Route path="/more" element={<More />} />
                        
                        {/* Issue Reporting Engine */}
                        <Route path="/report" element={<Report />} />
                        
                        {/* Fallback Interception for Invalid URLs */}
                        <Route path="*" element={<Navigate to="/home" replace />} />
                    </Routes>
                </AnimatePresence>
            </Suspense>
        </BrowserRouter>
    );
}