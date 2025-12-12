import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import io from 'socket.io-client';

const BACKEND_URL = 'http://localhost:3000';

const Notifications = ({ isOpen, onClose, onNotificationClick }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user?.id) return;

    const socketInstance = io(BACKEND_URL, {
      transports: ['websocket'],
      reconnection: true
    });

    socketInstance.on('connect', () => {
      socketInstance.emit('user-online', user.id);
      setSocket(socketInstance);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user?.id]);

  // Listen for notifications
  useEffect(() => {
    if (!socket) return;

    // Private call request notification
    socket.on('private-call-request', ({ clientId, clientName, timestamp }) => {
      addNotification({
        id: Date.now().toString(),
        type: 'call-request',
        title: 'Žádost o privátní hovor',
        message: `${clientName} chce s tebou privátní hovor`,
        timestamp,
        read: false,
        data: { clientId, clientName }
      });
    });

    // Stream started notification (for followers)
    socket.on('stream-started', ({ streamId, userId, userName, timestamp }) => {
      if (userId !== user.id) {
        addNotification({
          id: Date.now().toString(),
          type: 'stream-started',
          title: 'Živý stream začal',
          message: `${userName} právě spustil/a live stream!`,
          timestamp,
          read: false,
          data: { streamId, userId, userName }
        });
      }
    });

    // Tip received notification
    socket.on('stream-tip-received', (tip) => {
      if (tip.userId !== user.id) {
        addNotification({
          id: Date.now().toString(),
          type: 'tip-received',
          title: 'Obdržel jsi tip!',
          message: `${tip.userName} poslal tip ${tip.amount} Kč`,
          timestamp: tip.timestamp,
          read: false,
          data: tip
        });
      }
    });

    // New message notification
    socket.on('new-message', (message) => {
      if (message.receiverId === user.id) {
        addNotification({
          id: Date.now().toString(),
          type: 'new-message',
          title: 'Nová zpráva',
          message: `Máš novou zprávu`,
          timestamp: message.timestamp,
          read: false,
          data: message
        });
      }
    });

    return () => {
      socket.off('private-call-request');
      socket.off('stream-started');
      socket.off('stream-tip-received');
      socket.off('new-message');
    };
  }, [socket, user?.id]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);

    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png'
      });
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      'call-request': '📞',
      'stream-started': '🎥',
      'tip-received': '💰',
      'new-message': '💬',
      'album-unlocked': '🔓',
      'follower': '👤'
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colors = {
      'call-request': 'bg-blue-500/20 border-blue-500',
      'stream-started': 'bg-red-500/20 border-red-500',
      'tip-received': 'bg-gold-500/20 border-gold-500',
      'new-message': 'bg-primary-500/20 border-primary-500',
      'album-unlocked': 'bg-purple-500/20 border-purple-500',
      'follower': 'bg-green-500/20 border-green-500'
    };
    return colors[type] || 'bg-white/10 border-white/20';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed top-20 right-6 w-96 max-h-[600px] bg-gray-900 border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-primary-500/10 to-gold-500/10">
        <div>
          <h3 className="text-white font-bold text-lg">🔔 Notifikace</h3>
          {unreadCount > 0 && (
            <p className="text-white/60 text-sm">{unreadCount} nepřečtených</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllAsRead}
                className="text-primary-400 text-sm hover:text-primary-300 transition"
              >
                Označit vše
              </button>
              <button
                onClick={clearAll}
                className="text-white/40 text-sm hover:text-white/60 transition"
              >
                Vymazat
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition text-xl ml-2"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <div className="text-white/60">Žádné notifikace</div>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-white/5 transition cursor-pointer ${
                  !notification.read ? 'bg-white/5' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg border ${getNotificationColor(notification.type)}`}>
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-semibold text-sm">{notification.title}</h4>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-white/70 text-sm mb-2">{notification.message}</p>
                    <span className="text-white/40 text-xs">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Browser Notifications */}
      {Notification.permission === 'default' && (
        <div className="p-3 bg-primary-500/10 border-t border-primary-500/20">
          <button
            onClick={() => Notification.requestPermission()}
            className="w-full text-primary-400 text-sm hover:text-primary-300 transition"
          >
            Povolit push notifikace
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
