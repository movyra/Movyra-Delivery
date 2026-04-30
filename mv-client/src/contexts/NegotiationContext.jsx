import { create } from 'zustand';
import { io } from 'socket.io-client';

/**
 * ============================================================================
 * FEATURE DOMAIN: STRICT REAL-TIME BIDDING & NEGOTIATION ENGINE
 * Contains 11+ real operational features: Socket handling, Multi-vendor bidding,
 * Counter-offers, Auto-rejection thresholds, Live sorting, and Deal locking.
 * ============================================================================
 */

// Define backend socket URL from environment variables
const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 'https://api.movyra.com';

let socketInstance = null;

export const useNegotiationContext = create((set, get) => ({
  // 1. Connection & Room State
  isConnected: false,
  activeRequestId: null,
  activeRoomId: null,
  
  // 2. Live Participant Tracking
  connectedDriversCount: 0,
  
  // 3. Dynamic Bid State
  bids: [], // Array of real-time bid objects: { driverId, price, eta, trustScore, vehicleType }
  
  // 4. Customer Constraints
  maxAcceptablePrice: null, // Auto-rejects bids above this
  negotiationTimerStart: null,

  // 5. Deal Status
  isDealLocked: false,
  acceptedBidId: null,

  // ======================================================================
  // 6. ACTION: Initialize Real-Time Connection Engine
  // ======================================================================
  initConnection: (token) => {
    if (!socketInstance) {
      socketInstance = io(SOCKET_SERVER_URL, {
        auth: { token },
        transports: ['websocket'], // Force strict websockets for ultra-low latency
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketInstance.on('connect', () => set({ isConnected: true }));
      socketInstance.on('disconnect', () => set({ isConnected: false }));
      
      // Feature 7: Live Participant Counter Updater
      socketInstance.on('drivers_in_radius_updated', (count) => {
        set({ connectedDriversCount: count });
      });

      // Feature 8: Incoming Bid Listener & Auto-Rejection Filter
      socketInstance.on('new_bid_received', (newBid) => {
        const { maxAcceptablePrice } = get();
        
        // Auto-Rejection Logic: Drop bids immediately if they exceed customer's maximum
        if (maxAcceptablePrice && newBid.price > maxAcceptablePrice) {
          console.info(`Movyra Auto-Reject: Bid of ${newBid.price} exceeded max constraint.`);
          return; 
        }

        set((state) => {
          // Check if driver is updating an existing bid, otherwise append
          const existingBidIndex = state.bids.findIndex(b => b.driverId === newBid.driverId);
          if (existingBidIndex >= 0) {
            const updatedBids = [...state.bids];
            updatedBids[existingBidIndex] = newBid;
            return { bids: updatedBids };
          }
          return { bids: [...state.bids, newBid] };
        });
      });

      // Deal Confirmation Listener
      socketInstance.on('deal_locked_success', (payload) => {
        set({ isDealLocked: true, acceptedBidId: payload.bidId });
      });
    }
  },

  // ======================================================================
  // 9. ACTION: Broadcast Request to Regional Drivers
  // ======================================================================
  broadcastRequest: (requestData, maxPriceLimit) => {
    if (!socketInstance || !get().isConnected) {
      console.error("Socket not connected. Cannot broadcast request.");
      return;
    }
    
    set({ 
      activeRequestId: requestData.id, 
      activeRoomId: `room_${requestData.id}`,
      maxAcceptablePrice: maxPriceLimit,
      bids: [], // Reset previous bids
      negotiationTimerStart: Date.now(),
      isDealLocked: false,
      acceptedBidId: null
    });

    // Join isolated negotiation room & broadcast
    socketInstance.emit('join_negotiation_room', `room_${requestData.id}`);
    socketInstance.emit('broadcast_customer_request', requestData);
  },

  // ======================================================================
  // 10. ACTION: Customer Counter-Offer Logic
  // ======================================================================
  sendCounterOffer: (driverId, targetPrice) => {
    if (!socketInstance) return;
    const { activeRoomId } = get();
    
    socketInstance.emit('customer_counter_offer', {
      roomId: activeRoomId,
      targetDriverId: driverId,
      proposedPrice: targetPrice,
      timestamp: Date.now()
    });
  },

  // ======================================================================
  // 11. ACTION: Accept Bid & Lock Contract
  // ======================================================================
  acceptBid: (bidId) => {
    if (!socketInstance) return;
    const { activeRoomId, bids } = get();
    const winningBid = bids.find(b => b.id === bidId);
    
    if (!winningBid) return;

    socketInstance.emit('lock_deal', {
      roomId: activeRoomId,
      bidId: winningBid.id,
      driverId: winningBid.driverId,
      finalPrice: winningBid.price
    });
  },

  // ======================================================================
  // 12. UTILITY: Live Sorting Algorithms
  // ======================================================================
  getSortedBids: (sortBy = 'price_asc') => {
    const { bids } = get();
    const sorted = [...bids];
    
    if (sortBy === 'price_asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'eta_asc') {
      sorted.sort((a, b) => a.eta - b.eta);
    } else if (sortBy === 'rating_desc') {
      sorted.sort((a, b) => b.trustScore - a.trustScore);
    }
    return sorted;
  },

  // ======================================================================
  // 13. ACTION: Cleanup & Disconnect
  // ======================================================================
  terminateNegotiation: () => {
    const { activeRoomId } = get();
    if (socketInstance && activeRoomId) {
      socketInstance.emit('leave_negotiation_room', activeRoomId);
    }
    set({
      activeRequestId: null,
      activeRoomId: null,
      bids: [],
      isDealLocked: false,
      acceptedBidId: null
    });
  }
}));