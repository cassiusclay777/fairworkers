import React, { useState, useEffect } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { useAuth } from '../contexts/AuthContext';

const PrivateCall = ({ otherUserId, otherUserName, isInitiator = false, onClose }) => {
  const { user } = useAuth();
  const {
    socket,
    stream,
    remoteStream,
    isConnected,
    localVideoRef,
    remoteVideoRef,
    startCall,
    answerCall,
    stopLocalStream,
    toggleVideo,
    toggleAudio
  } = useWebRTC(user?.id, isInitiator);

  const [callStatus, setCallStatus] = useState('idle'); // idle, calling, ringing, active, ended
  const [duration, setDuration] = useState(0);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [costPerMinute] = useState(100); // 100 Kč per minute

  // Timer for call duration
  useEffect(() => {
    let interval;

    if (callStatus === 'active') {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [callStatus]);

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate current cost
  const calculateCost = () => {
    const minutes = Math.ceil(duration / 60);
    return minutes * costPerMinute;
  };

  // Request private call
  const handleRequestCall = () => {
    if (!socket) return;

    setCallStatus('calling');

    socket.emit('request-private-call', {
      workerId: otherUserId,
      clientId: user.id,
      clientName: user.display_name || user.username
    });
  };

  // Accept private call
  const handleAcceptCall = (offer) => {
    setCallStatus('active');
    answerCall(otherUserId, offer);
  };

  // Reject private call
  const handleRejectCall = () => {
    if (!socket) return;

    socket.emit('reject-private-call', {
      workerId: user.id,
      clientId: otherUserId,
      reason: 'Modelka odmítla hovor'
    });

    setCallStatus('ended');
    if (onClose) onClose();
  };

  // End call
  const handleEndCall = () => {
    if (!socket) return;

    socket.emit('end-private-call', {
      callId: `${user.id}-${otherUserId}`,
      userId: user.id,
      otherUserId
    });

    stopLocalStream();
    setCallStatus('ended');

    // Show cost summary before closing
    setTimeout(() => {
      if (onClose) onClose();
    }, 3000);
  };

  // Listen for call events
  useEffect(() => {
    if (!socket) return;

    // Incoming call request
    socket.on('private-call-request', ({ clientId, clientName }) => {
      setCallStatus('ringing');
    });

    // Call accepted
    socket.on('private-call-accepted', ({ workerId }) => {
      setCallStatus('active');
      startCall(workerId);
    });

    // Call rejected
    socket.on('private-call-rejected', ({ reason }) => {
      alert(reason || 'Hovor byl odmítnut');
      setCallStatus('ended');
      if (onClose) onClose();
    });

    // Call ended
    socket.on('private-call-ended', () => {
      stopLocalStream();
      setCallStatus('ended');
    });

    // WebRTC offer (answer it if we're the worker)
    socket.on('webrtc-offer', ({ from, offer }) => {
      if (!isInitiator) {
        handleAcceptCall(offer);
      }
    });

    return () => {
      socket.off('private-call-request');
      socket.off('private-call-accepted');
      socket.off('private-call-rejected');
      socket.off('private-call-ended');
      socket.off('webrtc-offer');
    };
  }, [socket, isInitiator]);

  // Handle video toggle
  const handleToggleVideo = () => {
    const enabled = toggleVideo();
    setVideoEnabled(enabled);
  };

  // Handle audio toggle
  const handleToggleAudio = () => {
    const enabled = toggleAudio();
    setAudioEnabled(enabled);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      <div className="w-full h-full max-w-7xl mx-auto p-8 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Privátní hovor s {otherUserName}
            </h2>
            {callStatus === 'active' && (
              <div className="text-white/60 mt-1">
                Délka hovoru: {formatDuration(duration)} | Cena: {calculateCost()} Kč
              </div>
            )}
          </div>
          <button
            onClick={handleEndCall}
            className="text-white/60 hover:text-white transition text-3xl"
          >
            ✕
          </button>
        </div>

        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          {/* Remote Video (Other Person) */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-white/60 text-center">
                  <div className="text-6xl mb-4">👤</div>
                  <div className="text-xl">
                    {callStatus === 'calling' && 'Volání...'}
                    {callStatus === 'ringing' && 'Příchozí hovor...'}
                    {callStatus === 'active' && 'Připojování...'}
                    {callStatus === 'idle' && 'Čekání na připojení'}
                  </div>
                </div>
              </div>
            )}

            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg">
              <span className="text-white font-semibold">{otherUserName}</span>
            </div>
          </div>

          {/* Local Video (You) */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            {stream ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-white/60 text-center">
                  <div className="text-6xl mb-4">📹</div>
                  <div className="text-xl">Kamera se aktivuje...</div>
                </div>
              </div>
            )}

            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg">
              <span className="text-white font-semibold">Vy</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex justify-center space-x-4">
          {callStatus === 'idle' && isInitiator && (
            <button
              onClick={handleRequestCall}
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-gold-500 text-white text-xl font-bold rounded-lg hover:scale-105 transition"
            >
              📞 Požádat o hovor ({costPerMinute} Kč/min)
            </button>
          )}

          {callStatus === 'ringing' && !isInitiator && (
            <>
              <button
                onClick={() => handleAcceptCall(null)}
                className="px-8 py-4 bg-green-500 text-white text-xl font-bold rounded-lg hover:bg-green-600 transition"
              >
                ✅ Přijmout hovor
              </button>
              <button
                onClick={handleRejectCall}
                className="px-8 py-4 bg-red-500 text-white text-xl font-bold rounded-lg hover:bg-red-600 transition"
              >
                ❌ Odmítnout
              </button>
            </>
          )}

          {callStatus === 'active' && (
            <>
              <button
                onClick={handleToggleVideo}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  videoEnabled
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {videoEnabled ? '📹 Kamera zapnuta' : '📹 Kamera vypnuta'}
              </button>

              <button
                onClick={handleToggleAudio}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  audioEnabled
                    ? 'bg-white/20 text-white hover:bg-white/30'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {audioEnabled ? '🎤 Mikrofon zapnut' : '🎤 Mikrofon vypnut'}
              </button>

              <button
                onClick={handleEndCall}
                className="px-8 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition"
              >
                📞 Ukončit hovor
              </button>
            </>
          )}

          {callStatus === 'ended' && (
            <div className="text-center">
              <div className="text-white text-2xl mb-4">Hovor ukončen</div>
              <div className="text-white/60 text-xl">
                Celková doba: {formatDuration(duration)}
              </div>
              <div className="text-primary-400 text-3xl font-bold mt-2">
                Cena: {calculateCost()} Kč
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivateCall;
