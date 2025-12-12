import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const [activeSection, setActiveSection] = useState('dashboard');

  const workerMenuItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'stream', label: '🎥 Live Stream', icon: '🎥' },
    { id: 'gallery', label: '📸 Galerie', icon: '📸' },
    { id: 'booking', label: '📅 Rezervace', icon: '📅' },
    { id: 'wishlist', label: '🎁 Wishlist', icon: '🎁' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' },
    { id: 'earnings', label: '💰 Výdělky', icon: '💰' },
    { id: 'schedule', label: '🗓️ Rozvrh', icon: '🗓️' },
    { id: 'messages', label: '💬 Zprávy', icon: '💬' },
    { id: 'settings', label: '⚙️ Nastavení', icon: '⚙️' },
  ];

  const clientMenuItems = [
    { id: 'browse', label: '👩‍💼 Procházet', icon: '👩‍💼' },
    { id: 'favorites', label: '⭐ Oblíbené', icon: '⭐' },
    { id: 'bookings', label: '📅 Moje rezervace', icon: '📅' },
    { id: 'messages', label: '💬 Zprávy', icon: '💬' },
    { id: 'wallet', label: '💳 Peněženka', icon: '💳' },
    { id: 'history', label: '📜 Historie', icon: '📜' },
    { id: 'settings', label: '⚙️ Nastavení', icon: '⚙️' },
  ];

  const menuItems = user?.role === 'worker' ? workerMenuItems : clientMenuItems;

  const handleMenuItemClick = (itemId) => {
    setActiveSection(itemId);
    success(`Otevřeno: ${menuItems.find(item => item.id === itemId)?.label}`);
    // Zde by se v budoucnu implementovala navigace
    console.log(`Navigating to: ${itemId}`);
  };

  const handleLogout = () => {
    logout();
    success('Úspěšně odhlášeno');
    onClose();
  };

  return (
    <>
      {/* Overlay pro mobilní zobrazení */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900/95 to-black/95 
        backdrop-blur-xl border-r border-white/10 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative md:w-64
        w-64
      `}>
        {/* Logo a zavírací tlačítko */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">💎</span>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-gold-400 bg-clip-text text-transparent">
                FairWorkers
              </span>
            </div>
            <button
              onClick={onClose}
              className="md:hidden text-white/60 hover:text-white transition"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* User info */}
          <div className="mt-6 p-3 bg-white/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-gold-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {user?.display_name?.[0] || user?.username?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">
                  {user?.display_name || user?.username || 'Uživatel'}
                </p>
                <p className="text-white/60 text-sm truncate">
                  {user?.role === 'worker' ? 'Modelka' : 'Klient'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigace */}
        <div className="p-4 overflow-y-auto h-[calc(100vh-180px)]">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${activeSection === item.id 
                    ? 'bg-gradient-to-r from-primary-500/20 to-gold-500/20 text-white border-l-4 border-primary-500' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Separator */}
          <div className="my-6 border-t border-white/10"></div>

          {/* Quick stats pro pracovníky */}
          {user?.role === 'worker' && (
            <div className="p-4 bg-gradient-to-r from-primary-500/10 to-gold-500/10 rounded-lg">
              <h3 className="text-white font-bold mb-2">Dnešní výkon</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Online:</span>
                  <span className="text-green-400 font-bold">2h 30m</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Výdělek:</span>
                  <span className="text-gold-400 font-bold">1,250 Kč</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Rezervace:</span>
                  <span className="text-primary-400 font-bold">3</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick actions pro klienty */}
          {user?.role === 'client' && (
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg">
              <h3 className="text-white font-bold mb-2">Rychlé akce</h3>
              <div className="space-y-2">
                <button className="w-full text-sm px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white transition">
                  🔍 Najít modelku
                </button>
                <button className="w-full text-sm px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white transition">
                  💬 Nová konverzace
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 
                     bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
          >
            <span>🚪</span>
            <span className="font-medium">Odhlásit se</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
