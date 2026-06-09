import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: VENDOR PRODUCT CATALOG MANAGER (mv-main)
 * Purpose: Real-time inventory table for Admins and Vendors.
 * Behavior: Reads, updates, and deletes live Firestore documents. Deep-deletes
 * attached media assets from the external PocketBase server to prevent storage bloat.
 * Allows editing of storefront destinations for precise customer targeting.
 * Structural Constraint: Strict zero emoji vector configuration. Uses clear business terminology.
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
  const [editForm, setEditForm] = useState({ name: '', price: 0, weight: '', category: '', storefrontDestination: '' });
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
      console.error("Data synchronization failed:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [role, storeId]);

  // Deep Delete Function: Removes product from Firebase AND image from PocketBase
  const handleDelete = async (product) => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this product? This will also delete its attached image.");
    if (!confirmDelete) return;

    try {
      // Phase 1: Wipe external physical image file if one exists
      if (product.imageUrl && product.imageUrl.includes('movyra-mv-main-db-gradio.hf.space')) {
        try {
          // Extract the PocketBase record ID from the URL string
          // Standard URL format: .../api/files/[collectionId]/[recordId]/[filename]
          const urlParts = product.imageUrl.split('/');
          const recordId = urlParts[urlParts.length - 2]; 

          if (recordId) {
            await fetch(`https://movyra-mv-main-db-gradio.hf.space/api/collections/product_images/records/${recordId}`, {
              method: 'DELETE',
            });
          }
        } catch (imageDeleteError) {
          console.error("Warning: Failed to delete external image file. Proceeding to delete product record.", imageDeleteError);
        }
      }

      // Phase 2: Wipe the Firestore product record
      await deleteDoc(doc(db, 'products', product.id));
      
    } catch (error) {
      console.error("Deletion execution failed:", error);
      alert("Failed to delete product. Please check your network connection.");
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product.id);
    setEditForm({
      name: product.name || '',
      price: product.price || 0,
      weight: product.weight || '',
      category: product.category || '',
      storefrontDestination: product.storefrontDestination || ''
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
        storefrontDestination: editForm.storefrontDestination,
        updatedAt: new Date().toISOString()
      });
      closeEditModal();
    } catch (error) {
      console.error("Update execution failed:", error);
      alert("Failed to update product details. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-[#666666] text-[0.8rem] uppercase tracking-widest font-bold">Loading Live Inventory</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-10 relative">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-[2rem] font-black tracking-tight leading-none mb-2">Manage Inventory</h1>
          <p className="text-[#888888] text-[0.95rem]">View, edit, or delete items currently active in your store.</p>
        </div>

        <div className="w-full md:w-[300px] bg-[#111111] border border-[#222222] rounded-xl flex items-center px-4 py-3 focus-within:border-[#00ff88] transition-colors">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 shrink-0">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-[0.9rem] text-white placeholder:text-[#666666]"
          />
        </div>
      </div>

      {/* Data Table View */}
      <div className="w-full bg-[#050505] border border-[#1c1c1c] rounded-2xl overflow-hidden flex-1 flex flex-col shadow-[0_0_80px_rgba(255,255,255,0.02)]">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111111] border-b border-[#222222]">
                <th className="p-4 text-[#888888] font-bold text-[0.75rem] uppercase tracking-widest whitespace-nowrap w-[60px]">Photo</th>
                <th className="p-4 text-[#888888] font-bold text-[0.75rem] uppercase tracking-widest whitespace-nowrap">Product Details</th>
                <th className="p-4 text-[#888888] font-bold text-[0.75rem] uppercase tracking-widest whitespace-nowrap">Destination</th>
                <th className="p-4 text-[#888888] font-bold text-[0.75rem] uppercase tracking-widest whitespace-nowrap">Category</th>
                <th className="p-4 text-[#888888] font-bold text-[0.75rem] uppercase tracking-widest whitespace-nowrap">Price</th>
                {role === 'admin' && <th className="p-4 text-[#888888] font-bold text-[0.75rem] uppercase tracking-widest whitespace-nowrap">Store ID</th>}
                <th className="p-4 text-[#888888] font-bold text-[0.75rem] uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-[#1c1c1c] hover:bg-[#0a0a0a] transition-colors">
                    
                    {/* Image Thumbnail Column */}
                    <td className="p-4 align-middle">
                      <div className="w-12 h-12 rounded-lg bg-[#111111] border border-[#222222] overflow-hidden flex items-center justify-center">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#444444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        )}
                      </div>
                    </td>

                    <td className="p-4 align-middle">
                      <div className="flex flex-col">
                        <span className="font-bold text-[0.95rem] text-white">{product.name}</span>
                        <span className="text-[#666666] text-[0.75rem] font-medium">{product.weight}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`px-3 py-1 rounded-md text-[0.7rem] font-bold uppercase tracking-widest ${
                        product.storefrontDestination === 'Veggies & Fruits' ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30' : 
                        product.storefrontDestination === 'Daily Needs' ? 'bg-[#00ccff]/10 text-[#00ccff] border border-[#00ccff]/30' : 
                        'bg-[#111111] text-[#666666] border border-[#333333]'
                      }`}>
                        {product.storefrontDestination || 'Unassigned'}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="bg-[#111111] border border-[#222222] text-[#888888] px-3 py-1 rounded-md text-[0.75rem] font-bold">
                        {product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="font-black text-white text-[0.95rem]">{formatINR(product.price)}</span>
                    </td>
                    {role === 'admin' && (
                      <td className="p-4 align-middle">
                        <span className="text-[#666666] text-[0.7rem] font-mono bg-[#111111] px-2 py-1 rounded-sm">{product.storeId?.slice(0, 8)}...</span>
                      </td>
                    )}
                    <td className="p-4 text-right align-middle">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => openEditModal(product)}
                          className="w-8 h-8 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center text-[#888888] hover:text-white hover:border-[#666666] transition-colors"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(product)}
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
                  <td colSpan={role === 'admin' ? 7 : 6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-[#666666]">
                      <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                      <span className="text-[0.95rem] font-bold">No products found.</span>
                      <span className="text-[0.8rem] mt-1">Try adjusting your search terms or add a new product.</span>
                    </div>
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

              <h2 className="text-[1.4rem] font-black tracking-tight mb-6 text-white">Edit Product Details</h2>
              
              <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Product Name</label>
                  <input type="text" required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3 rounded-xl outline-none focus:border-[#00ff88] text-[0.9rem]" />
                </div>

                <div>
                  <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Storefront Destination</label>
                  <div className="relative">
                    <select required value={editForm.storefrontDestination} onChange={e => setEditForm({...editForm, storefrontDestination: e.target.value})} className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3 rounded-xl outline-none focus:border-[#00ff88] text-[0.9rem] appearance-none">
                      <option value="" disabled>Select Destination</option>
                      <option value="Daily Needs">Daily Needs</option>
                      <option value="Veggies & Fruits">Veggies & Fruits</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#666666]">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Price (INR)</label>
                    <input type="number" required min="0" step="0.01" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3 rounded-xl outline-none focus:border-[#00ff88] text-[0.9rem]" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Weight or Quantity</label>
                    <input type="text" required value={editForm.weight} onChange={e => setEditForm({...editForm, weight: e.target.value})} className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3 rounded-xl outline-none focus:border-[#00ff88] text-[0.9rem]" placeholder="e.g. 500g" />
                  </div>
                </div>

                <div>
                  <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Category</label>
                  <div className="relative">
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
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#666666]">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-[#111111] flex gap-3">
                  <button type="button" onClick={closeEditModal} className="flex-1 bg-transparent border border-[#333333] text-white py-3 rounded-xl font-bold hover:bg-[#111111] transition-colors text-[0.95rem]">Cancel</button>
                  <button type="submit" disabled={isUpdating} className="flex-1 bg-white text-black py-3 rounded-xl font-black tracking-tight hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 text-[0.95rem]">
                    {isUpdating ? 'Saving...' : 'Save Changes'}
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