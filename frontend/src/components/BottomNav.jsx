import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './Toast';

const BottomNav = ({ activeSection, onSectionChange }) => {
  const { user, isAuthenticated } = useAuth();
  const { info } = useToast();
  const [expanded, setExpanded] = useState(false);

  const workerNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', color: 'text-primary-400' },
    { id: 'stream', label: 'Stream', icon: '🎥', color: 'text-red-400' },
    { id: 'gallery', label: 'Galerie', icon: '📸', color: 'text-purple-400' },
    { id: 'booking', label: 'Rezervace', icon: '📅', color: 'text-blue-400' },
    { id: 'more', label: 'Více', icon: '⋯', color: 'text-white/60' },
  ];

  const clientNavItems = [
    { id: 'browse', label: 'Procházet', icon: '👩‍💼', color: 'text-primary-400' },
    { id: 'favorites', label: 'Oblíbené', icon: '⭐', color: 'text-yellow-400' },
    { id: 'messages', label: 'Zprávy', icon: '💬', color: 'text-green-400' },
    { id: 'wallet', label: 'Peněženka', icon: '💳', color: 'text-emerald-400' },
    { id: 'more', label: 'Více', icon: '⋯', color: 'text-white/60' },
  ];

  const moreItems = user?.role === 'worker' ? [
    { id: 'wishlist', label: 'Wishlist', icon: '🎁' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'earnings', label: 'Výdělky', icon: '💰' },
    { id: 'schedule', label: 'Rozvrh', icon: '🗓️' },
    { id: 'settings', label: 'Nastavení', icon: '⚙️' },
  ] : [
    { id: 'bookings', label: 'Rezervace', icon: '📅' },
    { id: 'history', label: 'Historie', icon: '📜' },
    { id: 'settings', label: 'Nastavení', icon: '⚙️' },
  ];

  const navItems = isAuthenticated 
    ? (user?.role === 'worker' ? workerNavItems : clientNavItems)
    : [];

  if (!isAuthenticated || navItems.length === 0) {
    return null;
  }

  const handleItemClick = (itemId) => {
    if (itemId === 'more') {
      setExpanded(!expanded);
      return;
    }
    
    onSectionChange(itemId);
    info(`Otevřeno: ${navItems.find(item => item.id === itemId)?.label || moreItems.find(item => item.id === itemId)?.label}`);
  };

  return (
    <>
      {/* Main Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 z-50 md:hidden">
        <div className="flex justify-around items-center py-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`
                flex flex-col items-center justify-center w-16
                transition-all duration-200
                ${activeSection === item.id 
                  ? `${item.color} transform -translate-y-1` 
                  : 'text-white/60 hover:text-white'
                }
              `}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {activeSection === item.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-current mt-1"></div>
              )}
            </button>
          ))}
        </div>

        {/* Expanded More Menu */}
        {expanded && (
          <div className="absolute bottom-full left-0 right-0 bg-gradient-to-b from-black/95 to-black backdrop-blur-xl border-t border-white/10 rounded-t-2xl p-4 shadow-2xl">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {moreItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleItemClick(item.id);
                    setExpanded(false);
                  }}
                  className="flex flex-col items-center justify-center p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
                >
                  <span className="text-2xl mb-2">{item.icon}</span>
                  <span className="text-xs font-medium text-white/80">{item.label}</span>
                </button>
              ))}
            </div>
            
            {/* Quick Actions */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex justify-around">
                <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 rounded-lg transition">
                  <span>🔔</span>
                  <span className="text-sm font-medium">Notifikace</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                  <span>🔍</span>
                  <span className="text-sm font-medium">Hledat</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spacer pro obsah, aby nebyl překrytý bottom nav */}
      <div className="h-16 md:h-0"></div>
    </>
  );
};

export default BottomNav;
