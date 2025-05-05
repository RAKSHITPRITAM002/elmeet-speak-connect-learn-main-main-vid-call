import { useEffect, useRef, useState } from 'react';

// Types for our WebRTC service
export interface PeerConnection {
  id: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

export interface MediaConfig {
  audio: boolean;
  video: boolean;
}

// STUN servers for NAT traversal
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

// Hook for managing WebRTC connections
export const useWebRTC = (roomId: string, userId: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [peers, setPeers] = useState<Map<string, RTCPeerConnection>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Initialize media devices and WebSocket connection
  const initialize = async (mediaConfig: MediaConfig) => {
    try {
      // Get user media (camera and microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: mediaConfig.audio,
        video: mediaConfig.video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false,
      });
      
      setLocalStream(stream);
      
      // Connect to signaling server
      connectToSignalingServer();
      
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera or microphone. Please check permissions.');
      return null;
    }
  };

  // Connect to signaling server via WebSocket
  const connectToSignalingServer = () => {
    // In a real implementation, this would connect to your WebSocket server
    // For now, we'll simulate this with a mock implementation
    console.log('Connecting to signaling server...');
    
    // Simulate successful connection
    setTimeout(() => {
      setIsConnected(true);
      console.log('Connected to signaling server');
    }, 1000);
  };

  // Create a peer connection with another user
  const createPeerConnection = (peerId: string) => {
    try {
      const peerConnection = new RTCPeerConnection(iceServers);
      
      // Add local tracks to the peer connection
      if (localStream) {
        localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStream);
        });
      }
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // In a real implementation, send this candidate to the peer via signaling server
          console.log('New ICE candidate:', event.candidate);
        }
      };
      
      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        console.log('Received remote track from peer:', peerId);
        if (event.streams && event.streams[0]) {
          setRemoteStreams(prev => {
            const newMap = new Map(prev);
            newMap.set(peerId, event.streams[0]);
            return newMap;
          });
        }
      };
      
      // Add to peers map
      setPeers(prev => {
        const newMap = new Map(prev);
        newMap.set(peerId, peerConnection);
        return newMap;
      });
      
      return peerConnection;
    } catch (err) {
      console.error('Error creating peer connection:', err);
      setError('Failed to establish connection with peer.');
      return null;
    }
  };

  // Initiate a call to another peer
  const callPeer = async (peerId: string) => {
    try {
      const peerConnection = peers.get(peerId) || createPeerConnection(peerId);
      
      if (!peerConnection) return;
      
      // Create an offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      // In a real implementation, send this offer to the peer via signaling server
      console.log('Created offer for peer:', peerId, offer);
      
      return offer;
    } catch (err) {
      console.error('Error calling peer:', err);
      setError('Failed to call peer.');
    }
  };

  // Answer a call from another peer
  const answerCall = async (peerId: string, offer: RTCSessionDescriptionInit) => {
    try {
      const peerConnection = peers.get(peerId) || createPeerConnection(peerId);
      
      if (!peerConnection) return;
      
      // Set the remote description (the offer)
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Create an answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      // In a real implementation, send this answer to the peer via signaling server
      console.log('Created answer for peer:', peerId, answer);
      
      return answer;
    } catch (err) {
      console.error('Error answering call:', err);
      setError('Failed to answer call.');
    }
  };

  // Process an answer from a peer
  const processAnswer = async (peerId: string, answer: RTCSessionDescriptionInit) => {
    try {
      const peerConnection = peers.get(peerId);
      
      if (!peerConnection) {
        console.error('No peer connection found for:', peerId);
        return;
      }
      
      // Set the remote description (the answer)
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      
      console.log('Processed answer from peer:', peerId);
    } catch (err) {
      console.error('Error processing answer:', err);
      setError('Failed to process answer from peer.');
    }
  };

  // Add an ICE candidate from a peer
  const addIceCandidate = async (peerId: string, candidate: RTCIceCandidateInit) => {
    try {
      const peerConnection = peers.get(peerId);
      
      if (!peerConnection) {
        console.error('No peer connection found for:', peerId);
        return;
      }
      
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      
      console.log('Added ICE candidate from peer:', peerId);
    } catch (err) {
      console.error('Error adding ICE candidate:', err);
      setError('Failed to add ICE candidate from peer.');
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  };

  // Change audio device
  const changeAudioDevice = async (deviceId: string) => {
    try {
      if (!localStream) return false;
      
      // Get new audio track with the selected device
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
        video: false,
      });
      
      const newAudioTrack = newStream.getAudioTracks()[0];
      
      // Replace the audio track in the local stream
      const oldAudioTrack = localStream.getAudioTracks()[0];
      if (oldAudioTrack) {
        localStream.removeTrack(oldAudioTrack);
        oldAudioTrack.stop();
      }
      
      localStream.addTrack(newAudioTrack);
      
      // Replace the audio track in all peer connections
      peers.forEach((peerConnection) => {
        const senders = peerConnection.getSenders();
        const audioSender = senders.find(sender => 
          sender.track && sender.track.kind === 'audio'
        );
        
        if (audioSender) {
          audioSender.replaceTrack(newAudioTrack);
        }
      });
      
      return true;
    } catch (err) {
      console.error('Error changing audio device:', err);
      setError('Failed to change audio device.');
      return false;
    }
  };

  // Change video device
  const changeVideoDevice = async (deviceId: string) => {
    try {
      if (!localStream) return false;
      
      // Get new video track with the selected device
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { 
          deviceId: { exact: deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
      });
      
      const newVideoTrack = newStream.getVideoTracks()[0];
      
      // Replace the video track in the local stream
      const oldVideoTrack = localStream.getVideoTracks()[0];
      if (oldVideoTrack) {
        localStream.removeTrack(oldVideoTrack);
        oldVideoTrack.stop();
      }
      
      localStream.addTrack(newVideoTrack);
      
      // Replace the video track in all peer connections
      peers.forEach((peerConnection) => {
        const senders = peerConnection.getSenders();
        const videoSender = senders.find(sender => 
          sender.track && sender.track.kind === 'video'
        );
        
        if (videoSender) {
          videoSender.replaceTrack(newVideoTrack);
        }
      });
      
      return true;
    } catch (err) {
      console.error('Error changing video device:', err);
      setError('Failed to change video device.');
      return false;
    }
  };

  // Clean up resources when component unmounts
  const cleanup = () => {
    // Stop local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // Close all peer connections
    peers.forEach((peerConnection) => {
      peerConnection.close();
    });
    
    // Close WebSocket connection
    if (socketRef.current) {
      socketRef.current.close();
    }
    
    // Reset state
    setLocalStream(null);
    setRemoteStreams(new Map());
    setPeers(new Map());
    setIsConnected(false);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    localStream,
    remoteStreams,
    isConnected,
    error,
    initialize,
    callPeer,
    answerCall,
    processAnswer,
    addIceCandidate,
    toggleAudio,
    toggleVideo,
    changeAudioDevice,
    changeVideoDevice,
    cleanup,
  };
};