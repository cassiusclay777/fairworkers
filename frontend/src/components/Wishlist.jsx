import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/axios';

const Wishlist = ({ workerId, workerName, isOwner = false, onClose }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGiftsModal, setShowGiftsModal] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    price: 0,
    imageUrl: '',
    category: 'fashion'
  });

  const categories = [
    { id: 'fashion', name: 'Oblečení & Móda', icon: '👗' },
    { id: 'beauty', name: 'Beauty & Kosmetika', icon: '💄' },
    { id: 'electronics', name: 'Elektronika', icon: '📱' },
    { id: 'jewelry', name: 'Šperky', icon: '💎' },
    { id: 'home', name: 'Domov & Dekorace', icon: '🏠' },
    { id: 'other', name: 'Ostatní', icon: '🎁' }
  ];

  // Virtual gifts for live streams
  const virtualGifts = [
    { id: 'rose', name: 'Růže', icon: '🌹', price: 50, animation: 'float' },
    { id: 'heart', name: 'Srdce', icon: '❤️', price: 100, animation: 'bounce' },
    { id: 'diamond', name: 'Diamant', icon: '💎', price: 200, animation: 'sparkle' },
    { id: 'champagne', name: 'Šampaňské', icon: '🍾', price: 300, animation: 'spray' },
    { id: 'crown', name: 'Koruna', icon: '👑', price: 500, animation: 'shine' },
    { id: 'rocket', name: 'Raketa', icon: '🚀', price: 1000, animation: 'fly' }
  ];

  useEffect(() => {
    fetchWishlist();
  }, [workerId]);

  const fetchWishlist = async () => {
    try {
      const response = await api.get(`/wishlist/${workerId}`);
      if (response.data.success) {
        setWishlistItems(response.data.items);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      // Demo data
      setWishlistItems([
        {
          id: 1,
          title: 'Elegantní šaty',
          description: 'Krásné večerní šaty pro focení',
          price: 2500,
          imageUrl: null,
          category: 'fashion',
          purchased: false,
          purchasedBy: null
        },
        {
          id: 2,
          title: 'Professional kamera',
          description: 'Sony Alpha pro lepší kvalitu streamů',
          price: 25000,
          imageUrl: null,
          category: 'electronics',
          purchased: true,
          purchasedBy: 'Jan K.'
        },
        {
          id: 3,
          title: 'Ring light',
          description: 'LED osvětlení pro perfektní video',
          price: 3500,
          imageUrl: null,
          category: 'electronics',
          purchased: false,
          purchasedBy: null
        }
      ]);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.price) {
      alert('Vyplň název a cenu');
      return;
    }

    try {
      const response = await api.post('/wishlist/create', {
        workerId,
        ...newItem
      });

      if (response.data.success) {
        setWishlistItems(prev => [...prev, response.data.item]);
        setShowAddModal(false);
        setNewItem({ title: '', description: '', price: 0, imageUrl: '', category: 'fashion' });
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Nepodařilo se přidat položku');
    }
  };

  const handlePurchase = async (itemId, itemTitle, itemPrice) => {
    if (!confirm(`Koupit "${itemTitle}" za ${itemPrice} Kč jako dárek?`)) return;

    try {
      const response = await api.post(`/wishlist/${itemId}/purchase`, {
        buyerId: user.id,
        buyerName: user.display_name || user.username
      });

      if (response.data.success) {
        alert('Dárek zakoupen! 🎁 Modelka dostane notifikaci.');
        fetchWishlist();
      }
    } catch (error) {
      console.error('Error purchasing:', error);
      alert('Nákup se nezdařil');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Opravdu smazat tuto položku?')) return;

    try {
      const response = await api.delete(`/wishlist/${itemId}`);
      if (response.data.success) {
        setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Nepodařilo se smazat');
    }
  };

  const getCategoryIcon = (categoryId) => {
    return categories.find(c => c.id === categoryId)?.icon || '🎁';
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                🎁 {isOwner ? 'Můj Wishlist' : `Wishlist - ${workerName}`}
              </h1>
              <p className="text-white/60">
                {isOwner ? 'Přidej si věci, které bys chtěla dostat' : 'Udělej radost a pošli dárek'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {isOwner && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-gold-500 text-white font-semibold rounded-lg hover:scale-105 transition"
                >
                  ➕ Přidat položku
                </button>
              )}
              <button
                onClick={() => setShowGiftsModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:scale-105 transition"
              >
                ✨ Virtuální dárky
              </button>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition text-3xl"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Wishlist Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className={`card hover:scale-[1.02] transition ${
                  item.purchased ? 'opacity-60' : ''
                }`}
              >
                {/* Item Image */}
                <div className="aspect-square bg-gradient-to-br from-primary-500/20 to-gold-500/20 rounded-lg mb-4 flex items-center justify-center relative">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-8xl">{getCategoryIcon(item.category)}</div>
                  )}

                  {/* Purchased Badge */}
                  {item.purchased && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold flex items-center space-x-2">
                      <span>✓</span>
                      <span>Koupeno</span>
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm mb-4">{item.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-primary-400">{item.price} Kč</div>
                  {item.purchased && item.purchasedBy && (
                    <div className="text-white/60 text-sm">
                      od {item.purchasedBy}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!item.purchased && !isOwner && (
                  <button
                    onClick={() => handlePurchase(item.id, item.title, item.price)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-gold-500 text-white font-bold rounded-lg hover:scale-105 transition"
                  >
                    🎁 Koupit jako dárek
                  </button>
                )}

                {isOwner && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                    >
                      Smazat
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty state */}
          {wishlistItems.length === 0 && (
            <div className="card text-center py-20">
              <div className="text-8xl mb-4">🎁</div>
              <div className="text-white text-2xl mb-2">Wishlist je prázdný</div>
              <div className="text-white/60">
                {isOwner ? 'Přidej si věci, které bys chtěla dostat!' : 'Zatím tu nejsou žádné položky'}
              </div>
            </div>
          )}

          {/* Add Item Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold text-white mb-6">➕ Přidat položku</h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Název</label>
                    <input
                      type="text"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                      placeholder="Co chceš dostat?"
                    />
                  </div>

                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Popis</label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                      rows="3"
                      placeholder="Popis produktu..."
                    />
                  </div>

                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Kategorie</label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Cena (Kč)</label>
                    <input
                      type="number"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                  >
                    Zrušit
                  </button>
                  <button
                    onClick={handleAddItem}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-gold-500 text-white font-bold rounded-lg hover:scale-105 transition"
                  >
                    Přidat
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Virtual Gifts Modal */}
          {showGiftsModal && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full">
                <h2 className="text-3xl font-bold text-white mb-4">✨ Virtuální dárky</h2>
                <p className="text-white/60 mb-6">
                  Pošli virtuální dárek během live streamu s krásnou animací!
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {virtualGifts.map((gift) => (
                    <button
                      key={gift.id}
                      onClick={() => {
                        alert(`Posílám ${gift.name} za ${gift.price} Kč! 🎉`);
                        setShowGiftsModal(false);
                      }}
                      className="card hover:scale-105 transition text-center"
                    >
                      <div className="text-6xl mb-3">{gift.icon}</div>
                      <h3 className="text-white font-bold mb-2">{gift.name}</h3>
                      <div className="text-primary-400 font-bold text-xl">{gift.price} Kč</div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowGiftsModal(false)}
                  className="w-full mt-6 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                >
                  Zavřít
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
