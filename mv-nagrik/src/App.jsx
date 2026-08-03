import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Global Navigation Components
import TopNav from './components/Header/TopNav';
import BottomNav from './components/Navigation/BottomNav';

// Lazy loading route components for optimal performance and code splitting
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const Home = React.lazy(() => import('./pages/Home'));
const Alerts = React.lazy(() => import('./pages/Alerts'));
const Feed = React.lazy(() => import('./pages/Feed'));
const More = React.lazy(() => import('./pages/More'));
const Report = React.lazy(() => import('./pages/Report'));
const Profile = React.lazy(() => import('./pages/Profile'));

// Minimalist loader utilizing the NagrikSetu Civic Teal brand identity
const PageLoader = () => (
    <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#E0F2F1] border-t-[#00897B] rounded-full animate-spin"></div>
    </div>
);

// Layout Wrapper to conditionally handle Navigation visibility based on current route
const AppLayout = () => {
    const location = useLocation();
    const isExcludedRoute = location.pathname === '/onboarding';

    return (
        <div className="relative min-h-screen bg-[#FFFFFF]">
            {/* Conditionally render Top Navigation */}
            {!isExcludedRoute && <TopNav />}

            {/* Main Content Area - Adds padding if TopNav is active to prevent overlap */}
            <div className={!isExcludedRoute ? "pt-16 pb-24" : ""}>
                <Suspense fallback={<PageLoader />}>
                    <AnimatePresence mode="wait">
                        <Routes location={location} key={location.pathname}>
                            {/* Core NagrikSetu Public Routes */}
                            <Route path="/" element={<Navigate to="/onboarding" replace />} />
                            <Route path="/onboarding" element={<Onboarding />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/alerts" element={<Alerts />} />
                            <Route path="/feed" element={<Feed />} />
                            <Route path="/more" element={<More />} />
                            
                            {/* Auth & Profile */}
                            <Route path="/profile" element={<Profile />} />
                            
                            {/* Issue Reporting Engine */}
                            <Route path="/report" element={<Report />} />
                            
                            {/* Fallback Interception for Invalid URLs */}
                            <Route path="*" element={<Navigate to="/home" replace />} />
                        </Routes>
                    </AnimatePresence>
                </Suspense>
            </div>

            {/* Conditionally render Bottom Navigation */}
            {!isExcludedRoute && <BottomNav />}
        </div>
    );
};

export default function App() {
    return (
        <BrowserRouter>
            <AppLayout />
        </BrowserRouter>
    );
}