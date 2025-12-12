import React, { useState, useEffect } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { useAuth } from '../contexts/AuthContext';

const LiveStream = ({ streamId, streamerId, isStreamer = false, onClose }) => {
  const { user } = useAuth();
  const {
    socket,
    stream,
    isConnected,
    localVideoRef,
    startLocalStream,
    stopLocalStream,
    viewerCount,
    setViewerCount
  } = useWebRTC(user?.id, isStreamer);

  const [isStreaming, setIsStreaming] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [tipAmount, setTipAmount] = useState('');
  const [showTipAnimation, setShowTipAnimation] = useState(false);
  const [lastTip, setLastTip] = useState(null);

  // Start streaming (for model)
  const handleStartStream = async () => {
    try {
      await startLocalStream(true, true);

      socket.emit('start-stream', {
        streamId: user.id,
        userId: user.id,
        userName: user.display_name || user.username
      });

      setIsStreaming(true);
    } catch (err) {
      console.error('Error starting stream:', err);
      alert('Nepodařilo se spustit stream');
    }
  };

  // Stop streaming
  const handleStopStream = () => {
    socket.emit('stop-stream', {
      streamId: user.id,
      userId: user.id
    });

    stopLocalStream();
    setIsStreaming(false);

    if (onClose) onClose();
  };

  // Join stream (for viewers)
  useEffect(() => {
    if (!isStreamer && socket && streamerId) {
      socket.emit('join-stream', {
        streamId: streamerId,
        userId: user.id
      });

      return () => {
        socket.emit('leave-stream', {
          streamId: streamerId,
          userId: user.id
        });
      };
    }
  }, [isStreamer, socket, streamerId, user]);

  // Listen for viewer count updates
  useEffect(() => {
    if (!socket) return;

    socket.on('viewer-joined', ({ viewerCount }) => {
      setViewerCount(viewerCount);
    });

    socket.on('viewer-left', ({ viewerCount }) => {
      setViewerCount(viewerCount);
    });

    socket.on('stream-ended', () => {
      if (!isStreamer && onClose) {
        onClose();
      }
    });

    return () => {
      socket.off('viewer-joined');
      socket.off('viewer-left');
      socket.off('stream-ended');
    };
  }, [socket, isStreamer, onClose]);

  // Send chat message
  const sendMessage = () => {
    if (!messageInput.trim() || !socket) return;

    const message = {
      streamId: streamerId || user.id,
      userId: user.id,
      userName: user.display_name || user.username,
      message: messageInput,
      timestamp: new Date().toISOString()
    };

    socket.emit('stream-chat-message', message);
    setChatMessages(prev => [...prev, message]);
    setMessageInput('');
  };

  // Send tip
  const sendTip = () => {
    const amount = parseInt(tipAmount);
    if (!amount || amount <= 0 || !socket) {
      alert('Zadej platnou částku');
      return;
    }

    const tip = {
      streamId: streamerId || user.id,
      userId: user.id,
      userName: user.display_name || user.username,
      amount: amount,
      timestamp: new Date().toISOString()
    };

    socket.emit('stream-tip', tip);
    setTipAmount('');

    // Show success message
    const tipMessage = {
      streamId: streamerId || user.id,
      userId: user.id,
      userName: user.display_name || user.username,
      message: `💰 Poslal tip ${amount} Kč!`,
      timestamp: new Date().toISOString(),
      isTip: true
    };
    setChatMessages(prev => [...prev, tipMessage]);
  };

  // Listen for chat messages
  useEffect(() => {
    if (!socket) return;

    socket.on('stream-chat-message', (message) => {
      setChatMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('stream-chat-message');
    };
  }, [socket]);

  // Listen for tips
  useEffect(() => {
    if (!socket) return;

    socket.on('stream-tip-received', (tip) => {
      setLastTip(tip);
      setShowTipAnimation(true);
      setTimeout(() => setShowTipAnimation(false), 3000);

      // Add to chat
      const tipMessage = {
        streamId: tip.streamId,
        userId: tip.userId,
        userName: tip.userName,
        message: `💰 ${tip.userName} poslal tip ${tip.amount} Kč!`,
        timestamp: tip.timestamp,
        isTip: true
      };
      setChatMessages(prev => [...prev, tipMessage]);
    });

    return () => {
      socket.off('stream-tip-received');
    };
  }, [socket]);

  // Toggle video
  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex">
      {/* Video Section */}
      <div className="flex-1 flex flex-col">
        {/* Video */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          {isStreamer ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white/60 text-center">
                <div className="text-6xl mb-4">📹</div>
                <div className="text-2xl">Stream se načítá...</div>
              </div>
            </div>
          )}

          {/* Viewer count */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center space-x-2">
            <span className="text-red-500 text-xl">●</span>
            <span className="text-white font-semibold">{viewerCount} diváků</span>
          </div>

          {/* Tip Animation */}
          {showTipAnimation && lastTip && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
              <div className="bg-gradient-to-r from-gold-500 to-yellow-500 text-white px-8 py-6 rounded-2xl shadow-2xl text-center">
                <div className="text-6xl mb-2">💰</div>
                <div className="text-2xl font-bold">{lastTip.userName}</div>
                <div className="text-3xl font-bold mt-2">{lastTip.amount} Kč</div>
              </div>
            </div>
          )}

          {/* Controls */}
          {isStreamer && isStreaming && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <button
                onClick={toggleVideo}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  videoEnabled
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {videoEnabled ? '📹 Kamera' : '📹 Vypnuto'}
              </button>
              <button
                onClick={toggleAudio}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  audioEnabled
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {audioEnabled ? '🎤 Mikrofon' : '🎤 Vypnuto'}
              </button>
              <button
                onClick={handleStopStream}
                className="px-6 py-3 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition"
              >
                ⏹ Ukončit stream
              </button>
            </div>
          )}

          {isStreamer && !isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <button
                onClick={handleStartStream}
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-gold-500 text-white text-xl font-bold rounded-lg hover:scale-105 transition"
              >
                🎥 Spustit Live Stream
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-96 bg-gray-900 border-l border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-white font-bold text-lg">💬 Chat</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatMessages.map((msg, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-primary-400 font-semibold text-sm">
                  {msg.userName}
                </span>
                <span className="text-white/40 text-xs">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-white/80">{msg.message}</p>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* Chat Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Napište zprávu..."
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-500"
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
            >
              📤
            </button>
          </div>

          {/* Tips Section (only for viewers) */}
          {!isStreamer && (
            <div className="space-y-2">
              <div className="text-white/60 text-sm font-semibold">💰 Poslat tip</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => { setTipAmount('50'); sendTip(); }}
                  className="px-3 py-2 bg-gold-500/20 border border-gold-500 text-gold-400 rounded-lg hover:bg-gold-500/30 transition text-sm font-bold"
                >
                  50 Kč
                </button>
                <button
                  onClick={() => { setTipAmount('100'); sendTip(); }}
                  className="px-3 py-2 bg-gold-500/20 border border-gold-500 text-gold-400 rounded-lg hover:bg-gold-500/30 transition text-sm font-bold"
                >
                  100 Kč
                </button>
                <button
                  onClick={() => { setTipAmount('200'); sendTip(); }}
                  className="px-3 py-2 bg-gold-500/20 border border-gold-500 text-gold-400 rounded-lg hover:bg-gold-500/30 transition text-sm font-bold"
                >
                  200 Kč
                </button>
              </div>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  placeholder="Vlastní částka..."
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-gold-500 text-sm"
                />
                <button
                  onClick={sendTip}
                  className="px-4 py-2 bg-gradient-to-r from-gold-500 to-yellow-500 text-white rounded-lg hover:scale-105 transition font-bold text-sm"
                >
                  💸 Tip
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveStream;
