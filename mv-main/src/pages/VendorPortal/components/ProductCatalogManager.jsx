import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: VENDOR PRODUCT CATALOG MANAGER (mv-main)
 * Purpose: Real-time inventory table for Admins and Vendors.
 * Behavior: Reads, updates, and deletes live Firestore documents.
 * Structural Constraint: Strict zero emoji vector configuration.
 * ============================================================================
 */

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export default function ProductCatalogManager({ role, storeId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: 0, weight: '', category: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!role || role === 'unauthorized') return;
    if (role === 'vendor' && !storeId) return;

    setLoading(true);

    let q;
    const productsRef = collection(db, 'products');

    if (role === 'admin') {
      // Admins see all products globally
      q = query(productsRef, orderBy('createdAt', 'desc'));
    } else {
      // Vendors only see their specific store inventory
      q = query(productsRef, where('storeId', '==', storeId), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProducts = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setProducts(fetchedProducts);
      setLoading(false);
    }, (error) => {
      console.error("Real-time synchronization failure:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [role, storeId]);

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this item from the live catalog?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      console.error("Deletion execution failed:", error);
      alert("Failed to delete item. Verify permission levels.");
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product.id);
    setEditForm({
      name: product.name || '',
      price: product.price || 0,
      weight: product.weight || '',
      category: product.category || ''
    });
  };

  const closeEditModal = () => {
    setEditingProduct(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsUpdating(true);
    try {
      const productRef = doc(db, 'products', editingProduct);
      await updateDoc(productRef, {
        name: editForm.name,
        price: Number(editForm.price),
        weight: editForm.weight,
        category: editForm.category,
        updatedAt: new Date().toISOString()
      });
      closeEditModal();
    } catch (error) {
      console.error("Update execution failed:", error);
      alert("Failed to update item parameters.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-[#666666] text-[0.8rem] uppercase tracking-widest font-bold">Synchronizing Live Catalog</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-10 relative">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-[2rem] font-black tracking-tight leading-none mb-2">Live Inventory</h1>
          <p className="text-[#888888] text-[0.95rem]">Manage and audit active catalog deployments.</p>
        </div>

        <div className="w-full md:w-[300px] bg-[#111111] border border-[#222222] rounded-xl flex items-center px-4 py-3 focus-within:border-[#00ff88] transition-colors">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 shrink-0">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search by name or category..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-[0.9rem] text-white placeholder:text-[#666666]"
          />
        </div>
      </div>

      {/* Data Table View */}
      <div className="w-full bg-[#050505] border border-[#1c1c1c] rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111111] border-b border-[#222222]">
                <th className="p-4 text-[#888888] font-bold text-[0.75rem] uppercase tracking-widest whitespace-nowrap">Product Details</th>
                <th className="p-4 text-[#888888] font-bold text-[0.75rem] uppercase tracking-widest whitespace-nowrap">Category</th>
                <th className="p-4 text-[#888888] font-bold text-[0.75rem] uppercase tracking-widest whitespace-nowrap">Grid Price</th>
                {role === 'admin' && <th className="p-4 text-[#888888] font-bold text-[0.75rem] uppercase tracking-widest whitespace-nowrap">Store ID</th>}
                <th className="p-4 text-[#888888] font-bold text-[0.75rem] uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-[#1c1c1c] hover:bg-[#0a0a0a] transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[0.95rem] text-white">{product.name}</span>
                        <span className="text-[#666666] text-[0.75rem] font-medium">{product.weight}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-[#111111] border border-[#222222] text-[#888888] px-3 py-1 rounded-md text-[0.75rem] font-bold">
                        {product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-black text-[#00ff88] text-[0.95rem]">{formatINR(product.price)}</span>
                    </td>
                    {role === 'admin' && (
                      <td className="p-4">
                        <span className="text-[#666666] text-[0.7rem] font-mono">{product.storeId?.slice(0, 8)}...</span>
                      </td>
                    )}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => openEditModal(product)}
                          className="w-8 h-8 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center text-[#888888] hover:text-white hover:border-[#666666] transition-colors"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="w-8 h-8 rounded-full bg-[#ff4444]/10 border border-[#ff4444]/20 flex items-center justify-center text-[#ff4444] hover:bg-[#ff4444] hover:text-white transition-colors"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={role === 'admin' ? 5 : 4} className="p-8 text-center text-[#666666] text-[0.85rem] font-bold">
                    No matching inventory records discovered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Overlay Modal */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-[500px] bg-[#050505] border border-[#222222] rounded-2xl p-6 shadow-2xl relative"
            >
              <button onClick={closeEditModal} className="absolute top-4 right-4 text-[#666666] hover:text-white transition-colors">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              <h2 className="text-[1.4rem] font-black tracking-tight mb-6">Modify Entity Parameters</h2>
              
              <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Item Designation</label>
                  <input type="text" required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3 rounded-xl outline-none focus:border-[#00ff88] text-[0.9rem]" />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Pricing (INR)</label>
                    <input type="number" required min="0" step="0.01" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3 rounded-xl outline-none focus:border-[#00ff88] text-[0.9rem]" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Unit Weight/Scale</label>
                    <input type="text" required value={editForm.weight} onChange={e => setEditForm({...editForm, weight: e.target.value})} className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3 rounded-xl outline-none focus:border-[#00ff88] text-[0.9rem]" placeholder="e.g. 500g" />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#666666] mb-2">System Category</label>
                  <select required value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3 rounded-xl outline-none focus:border-[#00ff88] text-[0.9rem] appearance-none">
                    <option value="" disabled>Select Category</option>
                    <option value="Produce">Produce</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Meats">Meats</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Pantry">Pantry</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div className="pt-4 mt-2 border-t border-[#111111] flex gap-3">
                  <button type="button" onClick={closeEditModal} className="flex-1 bg-transparent border border-[#333333] text-white py-3 rounded-xl font-bold hover:bg-[#111111] transition-colors">Cancel</button>
                  <button type="submit" disabled={isUpdating} className="flex-1 bg-[#00ff88] text-black py-3 rounded-xl font-black tracking-tight hover:bg-[#00cc6a] transition-colors disabled:opacity-50">
                    {isUpdating ? 'Committing...' : 'Commit Update'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}