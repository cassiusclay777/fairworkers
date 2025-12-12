import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';

const BACKEND_URL = 'http://localhost:3000';

export const useWebRTC = (userId, isInitiator = false) => {
  const [socket, setSocket] = useState(null);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);

  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!userId) return;

    const socketInstance = io(BACKEND_URL, {
      transports: ['websocket'],
      reconnection: true
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected');
      socketInstance.emit('user-online', userId);
      setSocket(socketInstance);
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [userId]);

  // Get user media (camera + microphone)
  const startLocalStream = async (video = true, audio = true) => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 1280, height: 720 } : false,
        audio: audio
      });

      setStream(mediaStream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }

      return mediaStream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Nelze získat přístup ke kameře/mikrofonu');
      throw err;
    }
  };

  // Stop local stream
  const stopLocalStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    setRemoteStream(null);
    setIsConnected(false);
  };

  // Create WebRTC peer connection
  const createPeer = (targetUserId, localStream, initiator = false) => {
    const peer = new Peer({
      initiator,
      trickle: true,
      stream: localStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on('signal', (signal) => {
      if (initiator) {
        // Send offer
        socket.emit('webrtc-offer', {
          to: targetUserId,
          from: userId,
          offer: signal,
          callType: 'video'
        });
      } else {
        // Send answer
        socket.emit('webrtc-answer', {
          to: targetUserId,
          from: userId,
          answer: signal
        });
      }
    });

    peer.on('stream', (remoteStream) => {
      console.log('📹 Received remote stream');
      setRemoteStream(remoteStream);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });

    peer.on('connect', () => {
      console.log('✅ Peer connection established');
      setIsConnected(true);
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      setError('Chyba připojení');
    });

    peer.on('close', () => {
      console.log('Peer connection closed');
      setIsConnected(false);
      setRemoteStream(null);
    });

    peerRef.current = peer;
    return peer;
  };

  // Start a video call (initiator)
  const startCall = async (targetUserId) => {
    try {
      const localStream = await startLocalStream();
      createPeer(targetUserId, localStream, true);
    } catch (err) {
      setError('Nepodařilo se zahájit hovor');
    }
  };

  // Answer incoming call
  const answerCall = async (targetUserId, offer) => {
    try {
      const localStream = await startLocalStream();
      const peer = createPeer(targetUserId, localStream, false);
      peer.signal(offer);
    } catch (err) {
      setError('Nepodařilo se přijmout hovor');
    }
  };

  // Handle incoming WebRTC offer
  useEffect(() => {
    if (!socket) return;

    socket.on('webrtc-offer', ({ from, offer }) => {
      console.log('📞 Incoming call from:', from);
      // This will be handled by the component
    });

    socket.on('webrtc-answer', ({ answer }) => {
      console.log('✅ Call answered');
      if (peerRef.current) {
        peerRef.current.signal(answer);
      }
    });

    socket.on('ice-candidate', ({ candidate }) => {
      if (peerRef.current) {
        peerRef.current.signal(candidate);
      }
    });

    return () => {
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('ice-candidate');
    };
  }, [socket]);

  // Toggle video/audio
  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  };

  return {
    socket,
    stream,
    remoteStream,
    isConnected,
    error,
    viewerCount,
    localVideoRef,
    remoteVideoRef,
    startLocalStream,
    stopLocalStream,
    startCall,
    answerCall,
    toggleVideo,
    toggleAudio,
    setViewerCount
  };
};
