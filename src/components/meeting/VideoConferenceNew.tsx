import React, { useEffect, useRef, useState } from 'react';
import { useWebRTC, useScreenShare } from 'hooks';
import { useAuth } from 'contexts/AuthContext';
import MediaPermissionPrompt from './MediaPermissionPrompt';

interface VideoConferenceProps {
  meetingId: string;
  onError?: (error: string) => void;
}

const VideoConferenceNew: React.FC<VideoConferenceProps> = ({ meetingId, onError }) => {
  const { user } = useAuth();
  const userId = user?.email || 'anonymous';
  
  // WebRTC hooks
  const {
    localStream,
    remoteStreams,
    isConnected,
    error,
    initialize,
    toggleAudio,
    toggleVideo,
  } = useWebRTC(meetingId, userId);
  
  // Screen sharing hooks
  const {
    startScreenShare,
    startOptimizedVideoShare,
    stopScreenShare,
  } = useScreenShare();
  
  // State for UI
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<{
    audioInputs: MediaDeviceInfo[];
    videoInputs: MediaDeviceInfo[];
    audioOutputs: MediaDeviceInfo[];
  }>({
    audioInputs: [],
    videoInputs: [],
    audioOutputs: [],
  });
  
  // Detect device type on component mount
  useEffect(() => {
    // Check if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobileDevice(isMobile);
    
    // Check if iOS device
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOSDevice(isIOS);
    
    // Log device info for debugging
    console.log('Device detection:', { 
      userAgent: navigator.userAgent,
      isMobile,
      isIOS
    });
  }, []);
  
  // Refs for video elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareVideoRef = useRef<HTMLVideoElement>(null);
  
  // Handle permission granted
  const handlePermissionGranted = async () => {
    setShowPermissionPrompt(false);
    setPermissionStatus('granted');
    
    // Check if this is iOS Safari which has special requirements
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    try {
      // Initialize WebRTC connection with appropriate constraints
      const stream = await initialize({
        audio: true,
        // The MediaConfig interface only accepts boolean values for video
        // The actual video constraints are handled internally by the useWebRTC hook
        // which applies different settings based on device capabilities
        video: true,
      });
      
      if (stream) {
        setIsAudioEnabled(true);
        setIsVideoEnabled(true);
      }
    } catch (err) {
      console.error('Error initializing media after permission granted:', err);
      if (onError) {
        onError('Error initializing media. Please try refreshing the page.');
      }
    }
    
    // Enumerate available devices
    enumerateDevices();
  };
  
  // Handle permission denied
  const handlePermissionDenied = async () => {
    setShowPermissionPrompt(false);
    setPermissionStatus('denied');
    
    // Try to initialize with audio and video disabled
    const stream = await initialize({
      audio: false,
      video: false,
    });
    
    if (stream) {
      setIsAudioEnabled(false);
      setIsVideoEnabled(false);
    }
    
    // Show error message
    if (onError) {
      onError('Meeting joined without camera and microphone access. Others won\'t be able to see or hear you.');
    }
    
    // Enumerate available devices
    enumerateDevices();
  };
  
  // Enumerate available devices
  const enumerateDevices = () => {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
        
        setAvailableDevices({
          audioInputs,
          videoInputs,
          audioOutputs,
        });
      })
      .catch(err => {
        console.error('Error enumerating devices:', err);
        if (onError) onError('Could not get available devices');
      });
    
    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', () => {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const audioInputs = devices.filter(device => device.kind === 'audioinput');
          const videoInputs = devices.filter(device => device.kind === 'videoinput');
          const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
          
          setAvailableDevices({
            audioInputs,
            videoInputs,
            audioOutputs,
          });
        })
        .catch(err => {
          console.error('Error enumerating devices:', err);
        });
    });
  };
  
  // Set up local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  
  // Set up screen share video stream
  useEffect(() => {
    if (screenShareVideoRef.current && screenShareStream) {
      screenShareVideoRef.current.srcObject = screenShareStream;
    }
  }, [screenShareStream]);
  
  // Handle errors
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);
  
  // Handle audio toggle
  const handleToggleAudio = () => {
    const isEnabled = toggleAudio();
    setIsAudioEnabled(isEnabled);
  };
  
  // Handle video toggle
  const handleToggleVideo = () => {
    const isEnabled = toggleVideo();
    setIsVideoEnabled(isEnabled);
  };
  
  // Handle screen sharing
  const handleToggleScreenShare = async () => {
    if (isScreenSharing && screenShareStream) {
      stopScreenShare(screenShareStream);
      setScreenShareStream(null);
      setIsScreenSharing(false);
      return;
    }
    
    const stream = await startScreenShare();
    
    if (stream) {
      setScreenShareStream(stream);
      setIsScreenSharing(true);
      
      // Add event listener for when user stops sharing
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        setScreenShareStream(null);
        setIsScreenSharing(false);
      });
    }
  };
  
  // Handle optimized video sharing
  const handleOptimizedVideoShare = async () => {
    if (isScreenSharing && screenShareStream) {
      stopScreenShare(screenShareStream);
      setScreenShareStream(null);
      setIsScreenSharing(false);
      return;
    }
    
    const stream = await startOptimizedVideoShare();
    
    if (stream) {
      setScreenShareStream(stream);
      setIsScreenSharing(true);
      
      // Add event listener for when user stops sharing
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        setScreenShareStream(null);
        setIsScreenSharing(false);
      });
    }
  };
  
  return (
    <div className="video-conference">
      {/* Media Permission Prompt */}
      {showPermissionPrompt && (
        <MediaPermissionPrompt 
          onPermissionGranted={handlePermissionGranted}
          onPermissionDenied={handlePermissionDenied}
        />
      )}
      
      {/* Connection status */}
      <div className="connection-status">
        {isConnected ? (
          <span className="text-green-500">Connected</span>
        ) : (
          <span className="text-yellow-500">Connecting...</span>
        )}
      </div>
      
      {/* Video grid - responsive for all devices */}
      <div className="video-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        {/* Local video */}
        <div className="video-container relative aspect-video">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover rounded-lg ${!isVideoEnabled ? 'hidden' : ''}`}
          />
          
          {!isVideoEnabled && (
            <div className="w-full h-full flex items-center justify-center bg-blue-900 rounded-lg">
              <div className="text-white text-xl">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          )}
          
          <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
            {user?.name || 'You'} (You)
          </div>
          
          <div className="absolute bottom-2 right-2 flex space-x-2">
            {!isAudioEnabled && (
              <div className="text-red-500 bg-black bg-opacity-50 p-1 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
                </svg>
              </div>
            )}
            
            {!isVideoEnabled && (
              <div className="text-red-500 bg-black bg-opacity-50 p-1 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
                </svg>
              </div>
            )}
          </div>
        </div>
        
        {/* Screen share video */}
        {isScreenSharing && screenShareStream && (
          <div className="video-container relative col-span-2">
            <video
              ref={screenShareVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain rounded-lg"
            />
            
            <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
              Screen Share
            </div>
          </div>
        )}
        
        {/* Remote videos */}
        {Array.from(remoteStreams as Map<string, MediaStream>).map(([peerId, stream]) => {
          // Create a ref for each remote video element
          const videoRef = React.useRef<HTMLVideoElement>(null);
          
          // Set srcObject when the ref is available
          React.useEffect(() => {
            if (videoRef.current && stream) {
              videoRef.current.srcObject = stream;
            }
          }, [stream]);
          
          return (
            <div key={peerId} className="video-container relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-lg"
              />
              
              <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                {peerId}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Controls - Responsive for mobile and desktop */}
      <div className="controls mt-3 sm:mt-4 flex justify-center flex-wrap gap-2 sm:gap-4">
        <button
          onClick={handleToggleAudio}
          className={`p-2 sm:p-3 rounded-full ${isAudioEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
          disabled={permissionStatus === 'denied'}
          title={permissionStatus === 'denied' ? 'Microphone access denied' : 'Toggle microphone'}
        >
          {isAudioEnabled ? (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
            </svg>
          )}
        </button>
        
        <button
          onClick={handleToggleVideo}
          className={`p-2 sm:p-3 rounded-full ${isVideoEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
          disabled={permissionStatus === 'denied'}
          title={permissionStatus === 'denied' ? 'Camera access denied' : 'Toggle camera'}
        >
          {isVideoEnabled ? (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
            </svg>
          )}
        </button>
        
        {/* Only show screen sharing on desktop or if explicitly supported on mobile */}
        {(!isMobileDevice || (navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) && (
          <button
            onClick={handleToggleScreenShare}
            className={`p-2 sm:p-3 rounded-full ${isScreenSharing ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
          >
            {isScreenSharing ? (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            )}
          </button>
        )}
        
        {/* Only show optimized video share on desktop */}
        {!isMobileDevice && (
          <button
            onClick={handleOptimizedVideoShare}
            className={`p-2 sm:p-3 rounded-full ${isScreenSharing ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
            title="Share tab with optimized video"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path>
            </svg>
          </button>
        )}
        
        {/* Mobile-specific help button */}
        {isMobileDevice && (
          <button
            onClick={() => {
              if (onError) onError('Tip: For best experience, use landscape orientation on mobile devices.');
            }}
            className="p-2 sm:p-3 rounded-full bg-gray-600 hover:bg-gray-700 text-white"
            title="Help"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </button>
        )}
      </div>
      
      {/* Permission denied banner */}
      {permissionStatus === 'denied' && (
        <div className="mt-3 sm:mt-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 sm:p-4 text-sm sm:text-base" role="alert">
          <div className="flex">
            <div className="py-1">
              <svg className="fill-current h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 mr-2 sm:mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold">Media access denied</p>
              <p className="text-sm sm:text-base">
                You've joined without camera and microphone access. Others won't be able to see or hear you.
                <button 
                  className="ml-2 text-blue-600 hover:text-blue-800 underline"
                  onClick={() => setShowPermissionPrompt(true)}
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile device banner */}
      {isMobileDevice && !showPermissionPrompt && (
        <div className="mt-3 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3 text-sm" role="alert">
          <div className="flex">
            <div className="py-1">
              <svg className="fill-current h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm-2-13a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2H8zm0 4a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2H8z"/>
              </svg>
            </div>
            <div>
              <p className="font-bold">Mobile device detected</p>
              <p className="text-sm">
                {isIOSDevice ? 
                  "For iOS devices: If you have issues with audio/video, try using Safari browser." :
                  "For best experience, rotate your device to landscape mode."
                }
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Device selection */}
      <div className="device-selection mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Audio input devices */}
        <div className="device-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Microphone
          </label>
          <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            {availableDevices.audioInputs.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.substr(0, 5)}`}
              </option>
            ))}
          </select>
        </div>
        
        {/* Video input devices */}
        <div className="device-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Camera
          </label>
          <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            {availableDevices.videoInputs.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.substr(0, 5)}`}
              </option>
            ))}
          </select>
        </div>
        
        {/* Audio output devices */}
        <div className="device-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Speaker
          </label>
          <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            {availableDevices.audioOutputs.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Speaker ${device.deviceId.substr(0, 5)}`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default VideoConferenceNew;