import React, { useEffect, useRef, useState } from 'react';
import { useWebRTC, useScreenShare } from 'hooks';
import { useAuth } from 'contexts/AuthContext';
import MediaPermissionPrompt from './MediaPermissionPrompt';
import { ConferenceControls } from './ConferenceControls';
import Chat from './Chat';
import PollsAndQuizzes from './PollsAndQuizzes';
import RolePlay from './RolePlay';
import MultimediaPlayer from './MultimediaPlayer';
import LanguageTools from './LanguageTools';
import VirtualBackground from './VirtualBackground';
import { AnnotationCanvas, AnnotationCanvasRef } from './AnnotationCanvas';
import { AnnotationToolbar } from './AnnotationToolbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import {
  PanelLeftClose,
  PanelRightClose,
  Users,
  Settings,
  Maximize,
  Minimize
} from "lucide-react";
import { Switch } from '@/components/ui/switch';

interface VideoConferenceProps {
  meetingId: string;
  onError?: (error: string) => void;
  isHost?: boolean;
}

interface BackgroundOption {
  id: string;
  type: "blur" | "image" | "none";
  url?: string;
  name: string;
  thumbnail?: string;
}

const VideoConferenceEnhanced: React.FC<VideoConferenceProps> = ({
  meetingId,
  onError,
  isHost = true
}) => {
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
    changeAudioDevice,
    changeVideoDevice
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

  // UI state
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarContent, setSidebarContent] = useState<
    'chat' | 'participants' | 'polls' | 'roleplay' | 'multimedia' | 'language' | 'settings' | 'more'
  >('chat');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [annotationTool, setAnnotationTool] = useState<'pen' | 'highlighter' | 'arrow' | 'rectangle' | 'circle' | 'text' | 'eraser'>('pen');
  const [annotationColor, setAnnotationColor] = useState<string>('#FFC32B');
  const [annotationWidth, setAnnotationWidth] = useState<number>(2);

  // Use the imported AnnotationCanvasRef interface
  const annotationCanvasRef = useRef<AnnotationCanvasRef>(null);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingVolume, setSpeakingVolume] = useState(0);
  const [currentBackground, setCurrentBackground] = useState<BackgroundOption>({
    id: "none",
    type: "none",
    name: "None"
  });

  // Use the imported AnnotationCanvasRef interface
  // Emoji reactions state
  interface EmojiReaction {
    id: string;
    emoji: string;
    x: number;
    y: number;
    timestamp: number;
  }
  const [emojiReactions, setEmojiReactions] = useState<EmojiReaction[]>([]);

  // Remote participants speaking state
  const [speakingParticipants, setSpeakingParticipants] = useState<Record<string, {
    isSpeaking: boolean;
    volume: number;
  }>>({});

  // Refs for video elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Enumerate available devices with enhanced support for virtual cameras
  const enumerateDevices = () => {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        // Get all audio and video devices
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        const audioOutputs = devices.filter(device => device.kind === 'audiooutput');

        // Log devices for debugging
        console.log('Available devices:', {
          audioInputs: audioInputs.map(d => ({ label: d.label, id: d.deviceId })),
          videoInputs: videoInputs.map(d => ({ label: d.label, id: d.deviceId })),
          audioOutputs: audioOutputs.map(d => ({ label: d.label, id: d.deviceId }))
        });

        // Check for OBS Virtual Camera or other virtual camera software
        const hasVirtualCamera = videoInputs.some(device =>
          device.label.toLowerCase().includes('obs') ||
          device.label.toLowerCase().includes('virtual') ||
          device.label.toLowerCase().includes('cam link') ||
          device.label.toLowerCase().includes('capture')
        );

        if (hasVirtualCamera) {
          console.log('Virtual camera detected!');
          // You could show a notification here if desired
        }

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

    // Listen for device changes to detect when virtual cameras are added/removed
    navigator.mediaDevices.addEventListener('devicechange', () => {
      console.log('Device change detected, re-enumerating devices...');

      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const audioInputs = devices.filter(device => device.kind === 'audioinput');
          const videoInputs = devices.filter(device => device.kind === 'videoinput');
          const audioOutputs = devices.filter(device => device.kind === 'audiooutput');

          // Check if any new devices were added
          const newDeviceCount = videoInputs.length + audioInputs.length;
          const oldDeviceCount =
            availableDevices.videoInputs.length +
            availableDevices.audioInputs.length;

          if (newDeviceCount > oldDeviceCount) {
            console.log('New device connected!');
            if (onError) onError('New audio/video device detected');
          }

          setAvailableDevices({
            audioInputs,
            videoInputs,
            audioOutputs,
          });
        })
        .catch(err => {
          console.error('Error enumerating devices after change:', err);
        });
    });
  };

  // Set up local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;

      // Set up voice activity detection
      if (localStream.getAudioTracks().length > 0) {
        const audioContext = new AudioContext();
        const audioSource = audioContext.createMediaStreamSource(localStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        audioSource.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkAudioLevel = () => {
          if (!isAudioEnabled) {
            setIsSpeaking(false);
            setSpeakingVolume(0);
            return;
          }

          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }

          const average = sum / bufferLength;
          const normalizedVolume = Math.min(average / 50, 1); // Normalize between 0 and 1

          // Set speaking state based on volume threshold
          const isSpeakingNow = normalizedVolume > 0.15;
          setIsSpeaking(isSpeakingNow);
          setSpeakingVolume(normalizedVolume);

          // Request next animation frame
          requestAnimationFrame(checkAudioLevel);
        };

        // Start checking audio levels
        checkAudioLevel();

        // Clean up
        return () => {
          audioContext.close();
        };
      }
    }
  }, [localStream, isAudioEnabled]);

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

  // Handle optimized video sharing for YouTube
  const handleOptimizedVideoShare = async () => {
    if (isScreenSharing && screenShareStream) {
      stopScreenShare(screenShareStream);
      setScreenShareStream(null);
      setIsScreenSharing(false);
      return;
    }

    // Ask for YouTube URL if this is for YouTube sharing
    const shareYouTube = window.confirm("Would you like to share a YouTube video? Click OK for YouTube or Cancel for regular screen sharing.");

    if (shareYouTube) {
      const youtubeUrl = window.prompt("Enter YouTube URL:");

      if (youtubeUrl) {
        try {
          // Import the MediaOptimizationService dynamically
          const { MediaOptimizationService } = await import('../../services/MediaOptimizationService');

          // Check if it's a valid YouTube URL
          if (MediaOptimizationService.isYouTubeUrl(youtubeUrl)) {
            // Get optimized YouTube embed
            const result = MediaOptimizationService.optimizeYouTubeUrl(youtubeUrl, {
              youtubeQuality: '720p',
              prioritizeLatency: true,
              bufferSize: 'small',
            });

            if (result.success && result.embedCode) {
              // Create a container for the YouTube iframe
              const container = document.createElement('div');
              container.style.position = 'fixed';
              container.style.top = '50%';
              container.style.left = '50%';
              container.style.transform = 'translate(-50%, -50%)';
              container.style.width = '80%';
              container.style.height = '80%';
              container.style.zIndex = '9999';
              container.style.backgroundColor = '#000';
              container.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
              container.style.borderRadius = '8px';
              container.style.overflow = 'hidden';

              // Add close button
              const closeButton = document.createElement('button');
              closeButton.innerHTML = '✕';
              closeButton.style.position = 'absolute';
              closeButton.style.top = '10px';
              closeButton.style.right = '10px';
              closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
              closeButton.style.color = 'white';
              closeButton.style.border = 'none';
              closeButton.style.borderRadius = '50%';
              closeButton.style.width = '30px';
              closeButton.style.height = '30px';
              closeButton.style.cursor = 'pointer';
              closeButton.style.zIndex = '10000';
              closeButton.onclick = () => {
                document.body.removeChild(container);
                setIsScreenSharing(false);
              };

              // Set the embed code
              container.innerHTML = result.embedCode;
              container.appendChild(closeButton);

              // Add to document
              document.body.appendChild(container);

              // Set screen sharing state
              setIsScreenSharing(true);

              // Return early since we're not using the actual screen share API
              return;
            } else {
              alert("Failed to optimize YouTube URL. Please try again.");
            }
          } else {
            alert("Invalid YouTube URL. Please enter a valid YouTube URL.");
          }
        } catch (error) {
          console.error("Error handling YouTube share:", error);
          alert("An error occurred while trying to share YouTube video.");
        }
      }
    }

    // If not YouTube or YouTube failed, fall back to regular optimized screen sharing
    const stream = await startOptimizedVideoShare();

    if (stream) {
      try {
        // Import the MediaOptimizationService dynamically
        const { MediaOptimizationService } = await import('../../services/MediaOptimizationService');

        // Apply optimizations for video content
        const optimizedStream = MediaOptimizationService.optimizeScreenShare(stream, {
          videoQuality: 'high',
          frameRate: 60,
          bitrateMultiplier: 1.5,
          audioQuality: 'high',
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          prioritizeLatency: true,
        });

        setScreenShareStream(optimizedStream);
        setIsScreenSharing(true);

        // Add event listener for when user stops sharing
        optimizedStream.getVideoTracks()[0].addEventListener('ended', () => {
          setScreenShareStream(null);
          setIsScreenSharing(false);
        });
      } catch (error) {
        console.error("Error optimizing screen share:", error);

        // Fall back to unoptimized stream
        setScreenShareStream(stream);
        setIsScreenSharing(true);

        // Add event listener for when user stops sharing
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          setScreenShareStream(null);
          setIsScreenSharing(false);
        });
      }
    }
  };

  // Handle changing audio device
  const handleChangeAudioDevice = (deviceId: string) => {
    changeAudioDevice(deviceId);
  };

  // Handle changing video device
  const handleChangeVideoDevice = (deviceId: string) => {
    changeVideoDevice(deviceId);
  };

  // Handle toggling annotation mode - enhanced for full-screen mode
  const handleToggleAnnotation = () => {
    const newState = !isAnnotating;
    setIsAnnotating(newState);

    // When enabling annotation mode, show a helpful message
    if (newState && onError) {
      onError('Annotation mode enabled - draw anywhere on the screen');
    }

    // When disabling, clear annotations if needed
    if (!newState) {
      handleClearAnnotations();
    }

    // If we're in fullscreen mode, make sure the annotation canvas covers everything
    if (newState && isFullscreen) {
      // Give the DOM time to update
      setTimeout(() => {
        const canvas = document.querySelector('.annotation-canvas') as HTMLCanvasElement;
        if (canvas) {
          // Make sure canvas dimensions match the screen
          const updateCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Set up the canvas context with default styles
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.strokeStyle = '#FFC32B';
              ctx.lineWidth = 2;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';
            }
          };

          updateCanvasSize();

          // Update canvas size when window is resized
          window.addEventListener('resize', updateCanvasSize);
        }
      }, 100);
    }
  };

  // Handle raise hand functionality
  const handleRaiseHand = () => {
    const newHandRaisedState = !isHandRaised;
    setIsHandRaised(newHandRaisedState);

    // Show notification
    if (onError) {
      if (newHandRaisedState) {
        onError('You raised your hand');

        // Add a hand emoji reaction
        addEmojiReaction('✋');
      } else {
        onError('You lowered your hand');
      }
    }

    // In a real implementation, this would notify other participants
    // For now, we'll just update the local state
  };

  // Add emoji reaction
  const addEmojiReaction = (emoji: string) => {
    // Generate random position within the container
    const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
    const containerHeight = containerRef.current?.clientHeight || window.innerHeight;

    // Position within the middle 60% of the screen for better visibility
    const x = Math.random() * (containerWidth * 0.6) + (containerWidth * 0.2);
    const y = Math.random() * (containerHeight * 0.6) + (containerHeight * 0.2);

    const newReaction: EmojiReaction = {
      id: Math.random().toString(36).substring(2, 9),
      emoji,
      x,
      y,
      timestamp: Date.now()
    };

    setEmojiReactions(prev => [...prev, newReaction]);

    // Remove the emoji after animation completes (3 seconds)
    setTimeout(() => {
      setEmojiReactions(prev => prev.filter(reaction => reaction.id !== newReaction.id));
    }, 3000);
  };

  // Handle emoji button click
  const handleEmojiClick = (emoji: string) => {
    addEmojiReaction(emoji);

    // In a real implementation, this would broadcast the emoji to other participants
    if (onError) {
      onError(`You reacted with ${emoji}`);
    }
  };

  // Handle annotation drawing with enhanced features
  const handleStartDrawing = (e: React.MouseEvent) => {
    if (!isAnnotating) return;
    setIsDrawing(true);

    const canvas = e.currentTarget as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Make sure canvas dimensions match its display size
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    // Apply current annotation settings
    ctx.strokeStyle = annotationColor;
    ctx.lineWidth = annotationWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle different tools
    switch (annotationTool) {
      case 'pen':
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.moveTo(x, y);
        break;

      case 'highlighter':
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = annotationWidth * 3; // Highlighters are thicker
        ctx.beginPath();
        ctx.moveTo(x, y);
        break;

      case 'arrow':
      case 'rectangle':
      case 'circle':
        // For shapes, we'll store the starting point
        ctx.globalAlpha = 1.0;
        // Store starting point in canvas dataset
        canvas.dataset.startX = x.toString();
        canvas.dataset.startY = y.toString();
        break;

      case 'text':
        ctx.globalAlpha = 1.0;
        // For text, we'll prompt for the text content
        const text = prompt('Enter text:');
        if (text) {
          ctx.font = `${annotationWidth * 8}px Arial`;
          ctx.fillStyle = annotationColor;
          ctx.fillText(text, x, y);
        }
        break;

      case 'eraser':
        // For eraser, we'll use destination-out composite operation
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, annotationWidth * 5, 0, Math.PI * 2, false);
        ctx.fill();
        break;

      default:
        // Default to pen
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
  };

  const handleDraw = (e: React.MouseEvent) => {
    if (!isAnnotating || !isDrawing) return;

    const canvas = e.currentTarget as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle different tools
    switch (annotationTool) {
      case 'pen':
      case 'highlighter':
        ctx.lineTo(x, y);
        ctx.stroke();
        break;

      case 'arrow':
        // For arrow, we'll redraw on each move
        if (canvas.dataset.startX && canvas.dataset.startY) {
          const startX = parseFloat(canvas.dataset.startX);
          const startY = parseFloat(canvas.dataset.startY);

          // Clear the canvas and redraw
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw the line
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(x, y);
          ctx.stroke();

          // Draw the arrowhead
          const angle = Math.atan2(y - startY, x - startX);
          const headLength = 15;

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(
            x - headLength * Math.cos(angle - Math.PI / 6),
            y - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            x - headLength * Math.cos(angle + Math.PI / 6),
            y - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = annotationColor;
          ctx.fill();
        }
        break;

      case 'rectangle':
        // For rectangle, we'll redraw on each move
        if (canvas.dataset.startX && canvas.dataset.startY) {
          const startX = parseFloat(canvas.dataset.startX);
          const startY = parseFloat(canvas.dataset.startY);

          // Clear the canvas and redraw
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw the rectangle
          ctx.beginPath();
          ctx.rect(
            startX,
            startY,
            x - startX,
            y - startY
          );
          ctx.stroke();
        }
        break;

      case 'circle':
        // For circle, we'll redraw on each move
        if (canvas.dataset.startX && canvas.dataset.startY) {
          const startX = parseFloat(canvas.dataset.startX);
          const startY = parseFloat(canvas.dataset.startY);

          // Calculate radius
          const radius = Math.sqrt(
            Math.pow(x - startX, 2) + Math.pow(y - startY, 2)
          );

          // Clear the canvas and redraw
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw the circle
          ctx.beginPath();
          ctx.arc(startX, startY, radius, 0, Math.PI * 2, false);
          ctx.stroke();
        }
        break;

      case 'eraser':
        // For eraser, we'll use destination-out composite operation
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, annotationWidth * 5, 0, Math.PI * 2, false);
        ctx.fill();
        break;
    }
  };

  const handleStopDrawing = () => {
    if (!isAnnotating) return;
    setIsDrawing(false);

    // Reset canvas dataset
    const canvas = document.querySelector('.annotation-canvas') as HTMLCanvasElement;
    if (canvas) {
      delete canvas.dataset.startX;
      delete canvas.dataset.startY;

      // Reset composite operation
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
      }
    }

    // Save annotation if needed
    if (annotationCanvasRef.current) {
      try {
        // In a real app, you might want to save this to a server
        const dataUrl: string = annotationCanvasRef.current.toDataURL('image/png');
        console.log('Annotation saved:', dataUrl.substring(0, 50) + '...');
      } catch (err) {
        console.error('Error saving annotation:', err);
      }
    }
  };

  // Handle annotation tool change
  const handleAnnotationToolChange = (tool: 'pen' | 'highlighter' | 'arrow' | 'rectangle' | 'circle' | 'text' | 'eraser' | string) => {
    // Ensure the tool is one of the allowed types
    const validTool = ['pen', 'highlighter', 'arrow', 'rectangle', 'circle', 'text', 'eraser'].includes(tool)
      ? tool as 'pen' | 'highlighter' | 'arrow' | 'rectangle' | 'circle' | 'text' | 'eraser'
      : 'pen'; // Default to pen if an invalid tool is provided

    setAnnotationTool(validTool);

    // Notify user
    if (onError) {
      onError(`Annotation tool: ${validTool}`);
    }
  };

  // Handle annotation color change
  const handleAnnotationColorChange = (color: string) => {
    setAnnotationColor(color);

    // Update canvas context
    const canvas = document.querySelector('.annotation-canvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
      }
    }
  };

  // Handle annotation width change
  const handleAnnotationWidthChange = (width: number) => {
    setAnnotationWidth(width);

    // Update canvas context
    const canvas = document.querySelector('.annotation-canvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = width;
      }
    }
  };

  // Clear annotations - enhanced to work with full-screen canvas
  const handleClearAnnotations = () => {
    // Try to use the canvas ref method first
    if (annotationCanvasRef.current) {
      // With the imported interface, TypeScript knows these methods are required
      annotationCanvasRef.current.clearAnnotations();

      // Notify user
      if (onError) {
        onError('Annotations cleared');
      }
      return;
    }

    // Fallback to manual clearing
    const canvases = document.querySelectorAll('.annotation-canvas') as NodeListOf<HTMLCanvasElement>;
    if (!canvases || canvases.length === 0) return;

    // Clear each canvas
    canvases.forEach(canvas => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Save current transform and styles
      ctx.save();

      // Reset any transformations
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // Clear the entire canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Restore transform and styles
      ctx.restore();
    });

    // Notify user
    if (onError) {
      onError('Annotations cleared');
    }
  };

  // Handle toggling fullscreen
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };

  // Handle virtual background change
  const handleBackgroundChange = (background: BackgroundOption) => {
    setCurrentBackground(background);

    // The background is now applied through React's style props in the JSX
    // This provides a more reliable and React-friendly way to manage styles

    // Show a toast notification to confirm the background change
    const message = background.type === 'none'
      ? 'Background removed'
      : background.type === 'blur'
        ? `Blur background applied (${background.name})`
        : `Background changed to ${background.name}`;

    // Use onError as a toast mechanism (in a real app, you'd use a dedicated toast system)
    if (onError) {
      // Use a timeout to make the notification feel more responsive
      setTimeout(() => {
        onError(`Background: ${message}`);
      }, 100);
    }

    // Log the background change for debugging
    console.log('Background changed:', background);
  };

  // Handle end call
  const handleEndCall = () => {
    // In a real implementation, this would disconnect from the meeting
    if (onError) {
      onError('Call ended');
    }
  };

  // Note: Using the enhanced handleToggleAnnotation defined earlier

  // Get participants from remote streams
  const participants = Array.from(remoteStreams as Map<string, MediaStream>).map(([peerId]) => ({
    id: peerId,
    name: peerId,
    email: `${peerId}@example.com`
  }));

  // Add local user to participants
  const allParticipants = [
    {
      id: userId,
      name: user?.name || 'You',
      email: userId
    },
    ...participants
  ];

  return (
    <div
      ref={containerRef}
      className="video-conference h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden relative"
      style={{
        backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.025) 2%, transparent 0%)`,
        backgroundSize: '100px 100px'
      }}
    >
      {/* Full-screen Annotation Canvas - positioned to cover the entire screen */}
      {isAnnotating && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <AnnotationCanvas
            ref={annotationCanvasRef}
            isAnnotating={isAnnotating}
            isDrawing={isDrawing}
            onStartDrawing={handleStartDrawing}
            onDraw={handleDraw}
            onStopDrawing={handleStopDrawing}
            strokeColor={annotationColor}
            strokeWidth={annotationWidth}
            tool={annotationTool}
            onSaveAnnotation={(dataUrl) => {
              console.log('Annotation saved:', dataUrl.substring(0, 50) + '...');
            }}
          />
          <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearAnnotations}
            >
              Clear
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsAnnotating(false)}
            >
              Exit
            </Button>
          </div>
          <div className="absolute bottom-4 left-4 pointer-events-auto">
            <AnnotationToolbar
              isAnnotating={isAnnotating}
              onToggleAnnotation={() => setIsAnnotating(!isAnnotating)}
              onClearAnnotations={handleClearAnnotations}
              onToolChange={handleAnnotationToolChange}
              onColorChange={handleAnnotationColorChange}
              onWidthChange={handleAnnotationWidthChange}
              onUndo={handleToggleAnnotation}
              onRedo={handleToggleAnnotation}
              onSave={handleToggleAnnotation}
              canvasRef={annotationCanvasRef}
            />
          </div>
        </div>
      )}

      {/* Floating Emoji Reactions */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {emojiReactions.map(reaction => (
          <div
            key={reaction.id}
            className="absolute animate-float-up transition-opacity duration-3000"
            style={{
              left: `${reaction.x}px`,
              top: `${reaction.y}px`,
              fontSize: '3rem',
              opacity: 0.9,
              transform: `rotate(${Math.random() * 30 - 15}deg)`,
              animation: 'float-up 3s ease-out forwards, fade-out 3s ease-in forwards'
            }}
          >
            {reaction.emoji}
          </div>
        ))}
      </div>

      {/* Emoji Reaction Bar */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-30 bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-700/50">
        <div className="flex space-x-3">
          {['👍', '👏', '❤️', '😂', '😮', '😢', '✋', '🎉', '👋'].map(emoji => (
            <button
              key={emoji}
              className="text-2xl hover:scale-125 transition-transform p-1 focus:outline-none hover:bg-gray-700/50 rounded-full"
              onClick={() => handleEmojiClick(emoji)}
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Media Permission Prompt */}
      {showPermissionPrompt && (
        <MediaPermissionPrompt
          onPermissionGranted={handlePermissionGranted}
          onPermissionDenied={handlePermissionDenied}
        />
      )}

      {!showPermissionPrompt && (
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Main content */}
          <ResizablePanel defaultSize={showSidebar ? 70 : 100} minSize={50}>
            <div className="flex flex-col h-full relative">
              {/* Connection status */}
              <div className="absolute top-2 left-2 z-10">
                <div className="flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm shadow-lg border border-gray-700/50">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`}></div>
                  {isConnected ? "Connected" : "Connecting..."}
                  {isConnected && (
                    <span className="ml-1 text-xs text-gray-400">
                      {remoteStreams.size} {remoteStreams.size === 1 ? 'participant' : 'participants'}
                    </span>
                  )}
                </div>
              </div>

              {/* Video grid */}
              <div className="flex-1 p-2 relative">
                {/* Annotation Canvas is now moved to the root level to cover the entire screen */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 h-full">
                  {/* Local video */}
                  <div
                    className={`video-container relative aspect-video bg-gray-800 rounded-lg overflow-hidden transition-all duration-500 shadow-lg ring-1 ring-gray-700 ${isSpeaking ? 'speaking-active' : ''} ${currentBackground.type === 'image' ? 'video-container-with-background' : ''}`}
                  >
                    {/* Background layer - separate div for better control */}
                    {currentBackground.type === 'image' && currentBackground.url && (
                      <div
                        className="absolute inset-0 z-0"
                        style={{
                          backgroundImage: `url(${currentBackground.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          transform: 'scale(1.05)', /* Slightly scale up to avoid any gaps at edges */
                          filter: 'brightness(0.9)' /* Slightly dim the background to make video more visible */
                        }}
                      />
                    )}
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover transition-all duration-500 ${!isVideoEnabled ? 'hidden' : ''} relative z-10`}
                      style={{
                        filter: currentBackground.type === 'blur' ? `blur(${currentBackground.name.match(/\d+/)?.[0] || 5}px)` : 'none',
                        opacity: currentBackground.type === 'image' ? 0.9 : 1, // Make video slightly transparent when using image background
                      }}
                    />

                    {!isVideoEnabled && (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-70 absolute inset-0 z-10">
                        <div className="text-white text-4xl font-bold bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center">
                          {user?.name?.charAt(0) || 'A'}
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded flex items-center">
                      {isSpeaking && (
                        <div className="voice-indicator mr-2 flex items-center">
                          <div className="flex space-x-0.5">
                            <div className={`h-3 w-0.5 bg-green-400 rounded-full ${speakingVolume > 0.2 ? 'animate-pulse' : ''}`} style={{ height: `${Math.max(6, speakingVolume * 12)}px` }}></div>
                            <div className={`h-4 w-0.5 bg-green-400 rounded-full ${speakingVolume > 0.4 ? 'animate-pulse' : ''}`} style={{ height: `${Math.max(8, speakingVolume * 16)}px` }}></div>
                            <div className={`h-5 w-0.5 bg-green-400 rounded-full ${speakingVolume > 0.6 ? 'animate-pulse' : ''}`} style={{ height: `${Math.max(10, speakingVolume * 20)}px` }}></div>
                          </div>
                        </div>
                      )}
                      {user?.name || 'You'} (You)
                      {currentBackground.type !== 'none' && (
                        <span className="ml-2 text-xs bg-blue-500 px-1 py-0.5 rounded">
                          {currentBackground.type === 'blur' ? 'Blur' : 'BG'}
                        </span>
                      )}
                      {isHandRaised && (
                        <span className="ml-2 text-xs bg-yellow-500 px-1 py-0.5 rounded flex items-center">
                          <span className="mr-1">✋</span> Hand Raised
                        </span>
                      )}
                    </div>

                    {/* Speaking indicator overlay */}
                    {isSpeaking && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 border-4 border-green-500 rounded-lg animate-pulse"></div>
                        <div className="absolute top-2 right-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded-full shadow-lg backdrop-blur-sm flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                          </svg>
                          Speaking
                        </div>
                      </div>
                    )}

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
                    <div className="video-container relative col-span-2 bg-gray-800 rounded-lg overflow-hidden shadow-lg ring-1 ring-blue-700/50 transition-all duration-300" style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}>
                      <video
                        ref={screenShareVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                      />

                      <div className="absolute top-2 right-2">
                        <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center shadow-lg">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                          Screen Share
                        </div>
                      </div>

                      <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                        {user?.name || 'You'} is sharing screen
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

                        // Set up voice activity detection for remote participants
                        if (stream.getAudioTracks().length > 0) {
                          const audioContext = new AudioContext();
                          const audioSource = audioContext.createMediaStreamSource(stream);
                          const analyser = audioContext.createAnalyser();
                          analyser.fftSize = 256;
                          audioSource.connect(analyser);

                          const bufferLength = analyser.frequencyBinCount;
                          const dataArray = new Uint8Array(bufferLength);

                          const checkAudioLevel = () => {
                            analyser.getByteFrequencyData(dataArray);
                            let sum = 0;
                            for (let i = 0; i < bufferLength; i++) {
                              sum += dataArray[i];
                            }

                            const average = sum / bufferLength;
                            const normalizedVolume = Math.min(average / 50, 1); // Normalize between 0 and 1

                            // Set speaking state based on volume threshold
                            const isSpeakingNow = normalizedVolume > 0.15;

                            setSpeakingParticipants(prev => ({
                              ...prev,
                              [peerId]: {
                                isSpeaking: isSpeakingNow,
                                volume: normalizedVolume
                              }
                            }));

                            // Request next animation frame
                            requestAnimationFrame(checkAudioLevel);
                          };

                          // Start checking audio levels
                          checkAudioLevel();

                          // Clean up
                          return () => {
                            audioContext.close();
                            setSpeakingParticipants(prev => {
                              const newState = {...prev};
                              delete newState[peerId];
                              return newState;
                            });
                          };
                        }
                      }
                    }, [stream, peerId]);

                    // Get speaking state for this participant
                    const speakingState = speakingParticipants[peerId] || { isSpeaking: false, volume: 0 };

                    return (
                      <div
                        key={peerId}
                        className={`video-container relative aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg ring-1 ring-gray-700 transition-all duration-300 ${speakingState.isSpeaking ? 'speaking-active' : ''}`}
                      >
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />

                        <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded flex items-center">
                          {speakingState.isSpeaking && (
                            <div className="voice-indicator mr-2 flex items-center">
                              <div className="flex space-x-0.5">
                                <div className={`h-3 w-0.5 bg-green-400 rounded-full ${speakingState.volume > 0.2 ? 'animate-pulse' : ''}`} style={{ height: `${Math.max(6, speakingState.volume * 12)}px` }}></div>
                                <div className={`h-4 w-0.5 bg-green-400 rounded-full ${speakingState.volume > 0.4 ? 'animate-pulse' : ''}`} style={{ height: `${Math.max(8, speakingState.volume * 16)}px` }}></div>
                                <div className={`h-5 w-0.5 bg-green-400 rounded-full ${speakingState.volume > 0.6 ? 'animate-pulse' : ''}`} style={{ height: `${Math.max(10, speakingState.volume * 20)}px` }}></div>
                              </div>
                            </div>
                          )}
                          {peerId}
                        </div>

                        {/* Speaking indicator overlay */}
                        {speakingState.isSpeaking && (
                          <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 border-4 border-green-500 rounded-lg animate-pulse"></div>
                            <div className="absolute top-2 right-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded-full shadow-lg backdrop-blur-sm flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                              </svg>
                              Speaking
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Annotation canvas is now at the root level to cover the entire screen */}
              </div>

              {/* Controls */}
              <div className="p-2">
                <ConferenceControls
                  videoEnabled={isVideoEnabled}
                  audioEnabled={isAudioEnabled}
                  onToggleVideo={handleToggleVideo}
                  onToggleAudio={handleToggleAudio}
                  onEndCall={handleEndCall}
                  onShareScreen={handleToggleScreenShare}
                  onToggleChat={() => {
                    setSidebarContent('chat');
                    setShowSidebar(true);
                  }}
                  onToggleParticipants={() => {
                    setSidebarContent('participants');
                    setShowSidebar(true);
                  }}
                  onRaiseHand={handleRaiseHand}
                  isHandRaised={isHandRaised}
                  onToggleAnnotation={handleToggleAnnotation}
                  onToggleWhiteboard={() => {
                    // Implement whiteboard functionality
                  }}
                  onTogglePolls={() => {
                    setSidebarContent('polls');
                    setShowSidebar(true);
                  }}
                  onToggleRolePlay={() => {
                    setSidebarContent('roleplay');
                    setShowSidebar(true);
                  }}
                  onToggleMultimediaPlayer={() => {
                    setSidebarContent('multimedia');
                    setShowSidebar(true);
                  }}
                  onToggleLanguageTools={() => {
                    setSidebarContent('language');
                    setShowSidebar(true);
                  }}
                  onToggleVirtualBackground={() => {
                    setSidebarContent('settings');
                    setShowSidebar(true);
                  }}
                  onChangeAudioDevice={handleChangeAudioDevice}
                  onChangeVideoDevice={handleChangeVideoDevice}
                  audioInputDevices={availableDevices.audioInputs}
                  videoInputDevices={availableDevices.videoInputs}
                  isAnnotating={isAnnotating}
                  isScreenSharing={isScreenSharing}
                  isHost={isHost}
                />
              </div>
            </div>
          </ResizablePanel>

          {showSidebar && (
            <>
              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={30} minSize={20}>
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center p-2 border-b border-gray-700">
                    <Tabs value={sidebarContent} onValueChange={(value) => setSidebarContent(value as any)}>
                      <TabsList className="grid grid-cols-4">
                        <TabsTrigger value="chat">Chat</TabsTrigger>
                        <TabsTrigger value="participants">People</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                        <TabsTrigger value="more">More</TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSidebar(false)}
                    >
                      <PanelRightClose size={18} />
                    </Button>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    {sidebarContent === 'chat' && (
                      <Chat
                        meetingId={meetingId}
                        isHost={isHost}
                        participants={allParticipants}
                        allowDirectMessages={true}
                        allowFileSharing={true}
                      />
                    )}

                    {sidebarContent === 'participants' && (
                      <div className="p-4">
                        <h2 className="text-lg font-semibold mb-4">Participants ({allParticipants.length})</h2>
                        <div className="space-y-2">
                          {allParticipants.map(participant => (
                            <div key={participant.id} className="flex items-center justify-between p-2 hover:bg-gray-800 rounded">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                                  {participant.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium">{participant.name}</div>
                                  <div className="text-xs text-gray-400">{participant.email}</div>
                                </div>
                              </div>
                              {isHost && participant.id !== userId && (
                                <Button variant="ghost" size="sm">
                                  More
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sidebarContent === 'polls' && (
                      <PollsAndQuizzes
                        meetingId={meetingId}
                        isHost={isHost}
                        participants={allParticipants}
                      />
                    )}

                    {sidebarContent === 'roleplay' && (
                      <RolePlay
                        meetingId={meetingId}
                        isHost={isHost}
                        participants={allParticipants}
                      />
                    )}

                    {sidebarContent === 'multimedia' && (
                      <MultimediaPlayer
                        meetingId={meetingId}
                        isHost={isHost}
                      />
                    )}

                    {sidebarContent === 'language' && (
                      <LanguageTools
                        meetingId={meetingId}
                      />
                    )}

                    {sidebarContent === 'settings' && (
                      <Tabs defaultValue="audio">
                        <div className="p-4 border-b border-gray-700">
                          <TabsList className="w-full">
                            <TabsTrigger value="audio">Audio</TabsTrigger>
                            <TabsTrigger value="video">Video</TabsTrigger>
                            <TabsTrigger value="background">Background</TabsTrigger>
                            <TabsTrigger value="general">General</TabsTrigger>
                          </TabsList>
                        </div>

                        <TabsContent value="audio" className="p-4">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-medium mb-2">Microphone</h3>
                              <select
                                className="w-full bg-gray-800 border border-gray-700 rounded p-2"
                                onChange={(e) => handleChangeAudioDevice(e.target.value)}
                              >
                                {availableDevices.audioInputs.map(device => (
                                  <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Microphone ${device.deviceId.substring(0, 5)}`}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium mb-2">Speaker</h3>
                              <select
                                className="w-full bg-gray-800 border border-gray-700 rounded p-2"
                              >
                                {availableDevices.audioOutputs.map(device => (
                                  <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Speaker ${device.deviceId.substring(0, 5)}`}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium mb-2">Audio Processing</h3>
                              <div className="flex items-center justify-between">
                                <span>Noise Suppression</span>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span>Echo Cancellation</span>
                                <Switch defaultChecked />
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="video" className="p-4">
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-sm font-medium mb-2">Camera</h3>
                              <div className="mb-2">
                                <select
                                  className="w-full bg-gray-800 border border-gray-700 rounded p-2"
                                  onChange={(e) => handleChangeVideoDevice(e.target.value)}
                                >
                                  {availableDevices.videoInputs.map(device => {
                                    // Highlight virtual cameras
                                    const isVirtual = device.label.toLowerCase().includes('obs') ||
                                      device.label.toLowerCase().includes('virtual') ||
                                      device.label.toLowerCase().includes('cam link') ||
                                      device.label.toLowerCase().includes('capture');

                                    return (
                                      <option
                                        key={device.deviceId}
                                        value={device.deviceId}
                                        style={{
                                          fontWeight: isVirtual ? 'bold' : 'normal',
                                          color: isVirtual ? '#10B981' : 'inherit'
                                        }}
                                      >
                                        {isVirtual ? '🎬 ' : ''}{device.label || `Camera ${device.deviceId.substring(0, 5)}`}
                                        {isVirtual ? ' (Virtual)' : ''}
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>

                              <div className="text-xs text-gray-400 mb-2">
                                <p>💡 <strong>Tip:</strong> OBS Virtual Camera and other virtual camera software are supported.</p>
                                <p className="mt-1">If you don't see your virtual camera, make sure it's running and refresh the page.</p>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-1"
                                onClick={() => {
                                  // Refresh device list
                                  enumerateDevices();
                                  if (onError) onError('Refreshing camera list...');
                                }}
                              >
                                Refresh Camera List
                              </Button>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium mb-2">Video Quality</h3>
                              <select className="w-full bg-gray-800 border border-gray-700 rounded p-2">
                                <option value="low">Low (360p) - Best for slow connections</option>
                                <option value="medium" selected>Medium (480p) - Balanced</option>
                                <option value="high">High (720p) - Recommended for virtual cameras</option>
                                <option value="hd">HD (1080p) - Best quality (requires fast connection)</option>
                              </select>
                              <p className="text-xs text-gray-400 mt-1">
                                For OBS and virtual cameras, higher quality settings are recommended.
                              </p>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium mb-2">Virtual Camera Settings</h3>
                              <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                  <span>Optimize for virtual camera</span>
                                  <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                  <span>Preserve aspect ratio</span>
                                  <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>Hardware acceleration</span>
                                  <Switch defaultChecked />
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                  These settings help improve performance with OBS Virtual Camera and similar software.
                                </p>
                              </div>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium mb-2">Video Processing</h3>
                              <div className="flex items-center justify-between">
                                <span>Mirror my video</span>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span>Enhance lighting</span>
                                <Switch />
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="background">
                          <VirtualBackground
                            onSelectBackground={handleBackgroundChange}
                            currentBackground={currentBackground}
                          />
                        </TabsContent>

                        <TabsContent value="general" className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">Fullscreen</h3>
                                <p className="text-sm text-gray-400">Toggle fullscreen mode</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleToggleFullscreen}
                              >
                                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                              </Button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">Meeting Info</h3>
                                <p className="text-sm text-gray-400">Meeting ID: {meetingId}</p>
                              </div>
                              <Button variant="outline" size="sm">
                                Copy
                              </Button>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}

                    {sidebarContent === 'more' && (
                      <div className="p-4">
                        <h2 className="text-lg font-semibold mb-4">More Tools</h2>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            className="flex flex-col items-center justify-center h-24"
                            onClick={() => setSidebarContent('polls')}
                          >
                            <div className="text-2xl mb-2">📊</div>
                            <div>Polls & Quizzes</div>
                          </Button>

                          <Button
                            variant="outline"
                            className="flex flex-col items-center justify-center h-24"
                            onClick={() => setSidebarContent('roleplay')}
                          >
                            <div className="text-2xl mb-2">🎭</div>
                            <div>Role Play</div>
                          </Button>

                          <Button
                            variant="outline"
                            className="flex flex-col items-center justify-center h-24"
                            onClick={() => setSidebarContent('multimedia')}
                          >
                            <div className="text-2xl mb-2">🎬</div>
                            <div>Media Player</div>
                          </Button>

                          <Button
                            variant="outline"
                            className="flex flex-col items-center justify-center h-24"
                            onClick={() => setSidebarContent('language')}
                          >
                            <div className="text-2xl mb-2">🌐</div>
                            <div>Language Tools</div>
                          </Button>

                          <Button
                            variant="outline"
                            className="flex flex-col items-center justify-center h-24"
                            onClick={handleToggleAnnotation}
                          >
                            <div className="text-2xl mb-2">✏️</div>
                            <div>Annotation</div>
                          </Button>

                          <Button
                            variant="outline"
                            className="flex flex-col items-center justify-center h-24"
                            onClick={() => window.open('/profile', '_blank')}
                          >
                            <div className="text-2xl mb-2">👤</div>
                            <div>User Profile</div>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      )}

      {/* Permission denied banner */}
      {permissionStatus === 'denied' && (
        <div className="absolute bottom-0 left-0 right-0 bg-yellow-900/90 backdrop-blur-sm text-white p-3 z-50">
          <div className="flex items-start gap-2">
            <div className="p-1 bg-yellow-600 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-medium">Media access denied</p>
              <p className="text-sm">
                You've joined without camera and microphone access. Others won't be able to see or hear you.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPermissionPrompt(true)}
            >
              Try again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoConferenceEnhanced;