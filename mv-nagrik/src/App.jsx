/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Minimal Official Marketing Landing Page for NagrikSetu.
 * Brand: Movyra Civic (NagrikSetu)
 *
 * SYSTEM COLORS REFERENCE (STRICT):
 * Primary Background: #00897B (Civic Teal)
 * Dark Text: #111111 (Deep Black)
 * Containers: #FFFFFF (Pure White)
 * Highlight CTA: #FFB300 (Action Yellow)
 */

import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

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
const SOS = React.lazy(() => import('./pages/SOS'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
// New Official Download Page
const DownloadPage = React.lazy(() => import('./pages/DownloadPage'));
// New Marketing Showcase Page
const MarketingLanding = React.lazy(() => import('./pages/MarketingLanding'));

// New Civic Expansion Modules
const CivicDirectory = React.lazy(() => import('./pages/CivicDirectory'));
const CivicPolls = React.lazy(() => import('./pages/CivicPolls'));
const LostFound = React.lazy(() => import('./pages/LostFound'));
const VolunteerNetwork = React.lazy(() => import('./pages/VolunteerNetwork'));
const PublicAmenities = React.lazy(() => import('./pages/PublicAmenities'));
const CivicRights = React.lazy(() => import('./pages/CivicRights'));

// Minimalist loader utilizing the strictly requested 4-color palette
const PageLoader = () => (
    <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center w-full">
        <div className="w-10 h-10 border-4 border-[#111111]/10 border-t-[#00897B] rounded-full animate-spin"></div>
    </div>
);

// Strict Admin Route Guard (Frontend Security Layer)
const AdminRoute = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return <PageLoader />;

    // Strictly verify Super Admin credentials
    if (user && user.email === 'testcodecfg@gmail.com') {
        return children;
    }

    // Redirect unauthorized users immediately
    return <Navigate to="/home" replace />;
};

// Layout Wrapper to conditionally handle Navigation visibility based on current route
const AppLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Global Authentication State Listener
    // Automatically intercepts the route and pushes authenticated users to /home
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            // Check limits user redirection on login to avoid blocking the public download page
            if (currentUser && (location.pathname === '/onboarding' || location.pathname === '/')) {
                navigate('/home', { replace: true });
            }
        });
        return () => unsubscribe();
    }, [location.pathname, navigate]);
    
    // Conditionally hide navigation components for immersive screens
    const isExcludedRoute = ['/onboarding', '/sos', '/admin', '/download', '/landing'].includes(location.pathname);
    
    // Strictly remove relative container restraints for marketing routes to force edge-to-edge widescreen rendering
    const isWidescreenRoute = ['/landing', '/download'].includes(location.pathname);

    return (
        <div className={`${isWidescreenRoute ? "w-full min-h-screen bg-[#FFFFFF]" : "relative min-h-screen bg-[#FFFFFF]"}`}>
            {/* Conditionally render Top Navigation */}
            {!isExcludedRoute && <TopNav />}

            {/* Main Content Area - Adds padding if TopNav is active to prevent overlap, removes limits for widescreen pages */}
            <div className={!isExcludedRoute ? "pt-16 pb-24" : "w-full"}>
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

                            {/* Live Panic Broadcast Engine */}
                            <Route path="/sos" element={<SOS />} />

                            {/* New Civic Expansion Routes */}
                            <Route path="/directory" element={<CivicDirectory />} />
                            <Route path="/polls" element={<CivicPolls />} />
                            <Route path="/lost-found" element={<LostFound />} />
                            <Route path="/volunteer" element={<VolunteerNetwork />} />
                            <Route path="/amenities" element={<PublicAmenities />} />
                            <Route path="/rights" element={<CivicRights />} />

                            {/* Civic Gamification */}
                            <Route path="/leaderboard" element={<Leaderboard />} />

                            {/* Official Download Landing Page */}
                            <Route path="/download" element={<DownloadPage />} />
                            
                            {/* Marketing Showcase Landing Page */}
                            <Route path="/landing" element={<MarketingLanding />} />

                            {/* Exclusive Super Admin Moderation Route */}
                            <Route 
                                path="/admin" 
                                element={
                                    <AdminRoute>
                                        <AdminDashboard />
                                    </AdminRoute>
                                } 
                            />
                            
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