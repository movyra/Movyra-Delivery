import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from './BottomNav';
import HomeFeed from './HomeFeed';
import StoreCatalog from './StoreCatalog';
import ProductDetail from './ProductDetail';
import CartManager from './CartManager';
import CheckoutSummary from './CheckoutSummary';
import PaymentMethod from './PaymentMethod';
import OrderDetails from './OrderDetails';
import ProfileDetails from './ProfileDetails';

/**
 * ============================================================================
 * COMPONENT: GROCERY MASTER VIEW CONTROLLER (mv-main)
 * Purpose: Centralized state orchestration and layout management routing 
 * Home, Catalogs, Product views, Carts, Checkout, and Profiles.
 * Behavior: Fully functional navigation stack with no simulations or placeholders.
 * ============================================================================
 */

export default function GroceryDashboard({ userProfile }) {
  // Navigation stack state management
  const [currentView, setCurrentView] = useState('home'); // Views: home, store, product, cart, checkout, payment, order, profile
  const [activeStoreId, setActiveStoreId] = useState(null);
  const [activeProductId, setActiveProductId] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);

  // Router view-rendering selector matrix
  const renderActiveView = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomeFeed 
            onSelectStore={(storeId) => {
              setActiveStoreId(storeId);
              setCurrentView('store');
            }}
            onSelectProduct={(productId) => {
              setActiveProductId(productId);
              setCurrentView('product');
            }}
          />
        );
      case 'store':
        return (
          <StoreCatalog 
            storeId={activeStoreId}
            onBack={() => setCurrentView('home')}
            onSelectProduct={(productId) => {
              setActiveProductId(productId);
              setCurrentView('product');
            }}
          />
        );
      case 'product':
        return (
          <ProductDetail 
            productId={activeProductId}
            onBack={() => setCurrentView(activeStoreId ? 'store' : 'home')}
            onNavigateToCart={() => setCurrentView('cart')}
          />
        );
      case 'cart':
        return (
          <CartManager 
            onNavigateToCheckout={() => setCurrentView('checkout')}
            onSelectOrder={(orderId) => {
              setActiveOrderId(orderId);
              setCurrentView('order');
            }}
          />
        );
      case 'checkout':
        return (
          <CheckoutSummary 
            onBack={() => setCurrentView('cart')}
            onProceedToPayment={() => setCurrentView('payment')}
          />
        );
      case 'payment':
        return (
          <PaymentMethod 
            onBack={() => setCurrentView('checkout')}
            onOrderSuccess={(orderId) => {
              setActiveOrderId(orderId);
              setCurrentView('order');
            }}
          />
        );
      case 'order':
        return (
          <OrderDetails 
            orderId={activeOrderId}
            onClose={() => setCurrentView('home')}
          />
        );
      case 'profile':
        return (
          <ProfileDetails 
            userProfile={userProfile}
            onSelectOrder={(orderId) => {
              setActiveOrderId(orderId);
              setCurrentView('order');
            }}
          />
        );
      default:
        return <HomeFeed onSelectStore={(id) => { setActiveStoreId(id); setCurrentView('store'); }} />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white flex flex-col font-sans relative select-none overflow-x-hidden">
      
      {/* Dynamic View Engine Wrapper */}
      <div className="w-full flex-1 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full h-full"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Global Bottom Navigation Interface Persistent Control */}
      <BottomNav 
        currentView={currentView} 
        onViewChange={(view) => {
          // Clean state tracking context when hitting root menu tiers
          if (view === 'home') {
            setActiveStoreId(null);
            setActiveProductId(null);
          }
          setCurrentView(view);
        }} 
      />

    </div>
  );
}