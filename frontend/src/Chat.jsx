import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

function Chat({ currentUserId = 'demo-user-1' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Demo users for testing
  const demoUsers = [
    { id: 'worker-1', username: 'Petra K.', avatar: '👩', online: false },
    { id: 'worker-2', username: 'Lucie M.', avatar: '👱‍♀️', online: false },
    { id: 'worker-3', username: 'Tereza N.', avatar: '👩‍🦰', online: false },
    { id: 'client-1', username: 'Jan S.', avatar: '👨', online: false },
  ];

  // Initialize Socket.IO connection
  useEffect(() => {
    if (isOpen && !socket) {
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('💬 Připojeno k chat serveru');
        newSocket.emit('user-online', currentUserId);
      });

      newSocket.on('users-online', (users) => {
        console.log('👥 Online uživatelé:', users);
        setOnlineUsers(users);
      });

      newSocket.on('new-message', (message) => {
        console.log('📨 Nová zpráva:', message);
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('user-typing', ({ userId }) => {
        if (userId === selectedUser?.id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get messages for selected user
  const getCurrentMessages = () => {
    if (!selectedUser) return [];
    return messages.filter(m =>
      (m.senderId === currentUserId && m.receiverId === selectedUser.id) ||
      (m.senderId === selectedUser.id && m.receiverId === currentUserId)
    );
  };

  // Send message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUser || !socket) return;

    const message = {
      senderId: currentUserId,
      receiverId: selectedUser.id,
      message: messageInput
    };

    socket.emit('send-message', message);
    setMessageInput('');
  };

  // Handle typing
  const handleTyping = () => {
    if (socket && selectedUser) {
      socket.emit('typing', {
        senderId: currentUserId,
        receiverId: selectedUser.id
      });
    }
  };

  // Merge demo users with online status
  const getUsersWithStatus = () => {
    return demoUsers.map(user => ({
      ...user,
      online: onlineUsers.includes(user.id)
    }));
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full shadow-lg shadow-primary-500/50 hover:shadow-xl hover:shadow-primary-500/60 transition-all duration-300 hover:scale-110 flex items-center justify-center text-3xl z-50"
      >
        💬
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 w-96 h-[600px] bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">💬</span>
          <div>
            <h3 className="font-bold text-white">Chat</h3>
            <p className="text-xs text-white/70">{onlineUsers.length} online</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white text-2xl"
        >
          ×
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* User List */}
        <div className="w-32 bg-white/5 border-r border-white/10 overflow-y-auto">
          <div className="p-2 space-y-1">
            {getUsersWithStatus().map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full p-3 rounded-lg transition-all text-left relative ${
                  selectedUser?.id === user.id
                    ? 'bg-primary-500/30 border border-primary-500/50'
                    : 'hover:bg-white/10'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <div className="relative">
                    <span className="text-2xl">{user.avatar}</span>
                    {user.online && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                    )}
                  </div>
                  <span className="text-xs text-white/80 text-center break-words">
                    {user.username.split(' ')[0]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Selected User Header */}
              <div className="p-3 bg-white/5 border-b border-white/10 flex items-center space-x-3">
                <span className="text-2xl">{selectedUser.avatar}</span>
                <div>
                  <p className="font-semibold text-white">{selectedUser.username}</p>
                  <p className="text-xs text-white/60">
                    {selectedUser.online ? '🟢 Online' : '⚪ Offline'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {getCurrentMessages().length === 0 ? (
                  <div className="text-center text-white/40 mt-8">
                    <p className="text-4xl mb-2">👋</p>
                    <p>Zatím žádné zprávy</p>
                    <p className="text-sm mt-2">Začněte konverzaci!</p>
                  </div>
                ) : (
                  getCurrentMessages().map((msg, idx) => {
                    const isOwn = msg.senderId === currentUserId;
                    return (
                      <div
                        key={idx}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-white/50'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString('cs-CZ', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 px-4 py-2 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-3 bg-white/5 border-t border-white/10">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Napište zprávu..."
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl font-semibold text-white shadow-lg shadow-primary-500/50 hover:shadow-xl hover:shadow-primary-500/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📤
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/40">
              <div className="text-center">
                <p className="text-5xl mb-3">👈</p>
                <p>Vyberte uživatele</p>
                <p className="text-sm mt-2">a začněte chatovat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
