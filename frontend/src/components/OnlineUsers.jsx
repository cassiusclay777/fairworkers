import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const OnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to Socket.IO
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');

    newSocket.on('connect', () => {
      console.log('🟢 Connected to server for online users');
    });

    newSocket.on('users-online', (users) => {
      console.log('👥 Online users updated:', users);
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  if (onlineUsers.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 shadow-2xl">
        <div className="flex items-center space-x-2 mb-3">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-glow"></div>
          </div>
          <h3 className="text-sm font-semibold text-white">Online ({onlineUsers.length})</h3>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
          {onlineUsers.map((userId, index) => (
            <div
              key={userId || index}
              className="flex items-center space-x-2 text-white/80 text-sm"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Uživatel {userId.substring(0, 8)}...</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnlineUsers;
