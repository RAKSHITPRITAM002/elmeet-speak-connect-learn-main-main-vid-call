import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Check,
  X,
  Camera,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Settings,
  RefreshCw
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Types
interface BackgroundOption {
  id: string;
  type: "blur" | "image" | "none";
  url?: string;
  name: string;
  thumbnail?: string;
  fit?: "cover" | "contain" | "fill";
}

interface PreJoinBackgroundSelectorProps {
  onJoinMeeting: (background: BackgroundOption) => void;
  meetingId: string;
  userName: string;
  availableDevices?: {
    audioInputs: MediaDeviceInfo[];
    videoInputs: MediaDeviceInfo[];
    audioOutputs: MediaDeviceInfo[];
  };
  onDeviceChange?: (type: 'audio' | 'video', deviceId: string) => void;
}

const PreJoinBackgroundSelector: React.FC<PreJoinBackgroundSelectorProps> = ({
  onJoinMeeting,
  meetingId,
  userName,
  availableDevices = { audioInputs: [], videoInputs: [], audioOutputs: [] },
  onDeviceChange
}) => {
  const [activeTab, setActiveTab] = useState<"backgrounds" | "blur">("backgrounds");
  const [blurAmount, setBlurAmount] = useState<number>(5);
  const [uploadedBackgrounds, setUploadedBackgrounds] = useState<BackgroundOption[]>([]);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>({
    id: "none",
    type: "none",
    name: "None"
  });
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("");
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Default background options
  const defaultBackgrounds: BackgroundOption[] = [
    {
      id: "none",
      type: "none",
      name: "None",
    },
    {
      id: "office",
      type: "image",
      url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
      name: "Office",
      thumbnail: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=200"
    },
    {
      id: "classroom",
      type: "image",
      url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b",
      name: "Classroom",
      thumbnail: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=200"
    },
    {
      id: "library",
      type: "image",
      url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da",
      name: "Library",
      thumbnail: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=200"
    },
    {
      id: "cafe",
      type: "image",
      url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
      name: "Café",
      thumbnail: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200"
    },
    {
      id: "nature",
      type: "image",
      url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
      name: "Nature",
      thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200"
    }
  ];

  // Initialize media stream
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const constraints = {
          audio: isAudioEnabled,
          video: isVideoEnabled
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setLocalStream(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
        // Handle errors appropriately
        if (isVideoEnabled) {
          setIsVideoEnabled(false);
        }
        if (isAudioEnabled) {
          setIsAudioEnabled(false);
        }
      }
    };

    initializeMedia();

    // Cleanup function
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isAudioEnabled, isVideoEnabled]);

  // Update stream when devices change
  useEffect(() => {
    if (!localStream) return;

    const updateStream = async () => {
      // Stop all current tracks
      localStream.getTracks().forEach(track => track.stop());

      try {
        const constraints: MediaStreamConstraints = {
          audio: isAudioEnabled ? { deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined } : false,
          video: isVideoEnabled ? { deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined } : false
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        setLocalStream(newStream);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (error) {
        console.error("Error updating media stream:", error);
      }
    };

    updateStream();
  }, [selectedAudioDevice, selectedVideoDevice]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit');
        return;
      }

      // Create object URLs for the image
      const objectUrl = URL.createObjectURL(file);

      // Pre-load the image to ensure it's properly loaded before using
      const img = new Image();
      img.onload = () => {
        const newBackground: BackgroundOption = {
          id: Math.random().toString(36).substring(2, 9),
          type: "image",
          url: objectUrl,
          name: file.name.split('.')[0] || "Custom Background",
          thumbnail: objectUrl
        };

        setUploadedBackgrounds(prev => [...prev, newBackground]);

        // Automatically apply the new background
        setSelectedBackground(newBackground);
      };

      img.onerror = () => {
        alert('Failed to load image. Please try another file.');
        URL.revokeObjectURL(objectUrl);
      };

      img.src = objectUrl;
    }
  };

  // Delete uploaded background
  const deleteBackground = (id: string) => {
    setUploadedBackgrounds(prev => prev.filter(bg => bg.id !== id));
    
    // If the deleted background was selected, reset to none
    if (selectedBackground.id === id) {
      setSelectedBackground({
        id: "none",
        type: "none",
        name: "None"
      });
    }
  };

  // Apply blur background
  const applyBlurBackground = () => {
    const blurBackground: BackgroundOption = {
      id: "blur",
      type: "blur",
      name: `Blur (${blurAmount}px)`,
    };

    setSelectedBackground(blurBackground);
  };

  // Apply background
  const applyBackground = (background: BackgroundOption) => {
    setSelectedBackground(background);
  };

  // Check if a background is currently selected
  const isSelected = (id: string) => {
    return selectedBackground?.id === id;
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
    }
    setIsVideoEnabled(!isVideoEnabled);
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
    }
    setIsAudioEnabled(!isAudioEnabled);
  };

  // Handle audio device change
  const handleAudioDeviceChange = (deviceId: string) => {
    setSelectedAudioDevice(deviceId);
    if (onDeviceChange) {
      onDeviceChange('audio', deviceId);
    }
  };

  // Handle video device change
  const handleVideoDeviceChange = (deviceId: string) => {
    setSelectedVideoDevice(deviceId);
    if (onDeviceChange) {
      onDeviceChange('video', deviceId);
    }
  };

  // Join the meeting
  const handleJoinMeeting = () => {
    onJoinMeeting(selectedBackground);
  };

  return (
    <div className="pre-join-background-selector min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Join Meeting: {meetingId}</CardTitle>
          <CardDescription>
            Set up your camera, microphone, and background before joining
          </CardDescription>
        </CardHeader>
        
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Video Preview */}
          <div className="space-y-4">
            <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
              {isVideoEnabled ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Background preview overlay */}
                  {selectedBackground.type === "image" && selectedBackground.url && (
                    <div 
                      className="absolute inset-0 z-0" 
                      style={{
                        backgroundImage: `url(${selectedBackground.url})`,
                        backgroundSize: selectedBackground.fit || 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        transform: 'scale(1.05)', /* Slightly scale up to avoid any gaps at edges */
                        filter: 'brightness(0.9)' /* Slightly dim the background to make video more visible */
                      }}
                    />
                  )}
                  
                  {selectedBackground.type === "blur" && (
                    <div 
                      className="absolute inset-0 z-0 backdrop-blur-md"
                      style={{ backdropFilter: `blur(${blurAmount}px)` }}
                    />
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <VideoOff size={48} className="text-gray-400 mb-2" />
                  <p className="text-gray-400 text-sm">Camera is turned off</p>
                </div>
              )}
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <Button
                  variant={isAudioEnabled ? "default" : "destructive"}
                  size="icon"
                  className="rounded-full w-10 h-10"
                  onClick={toggleAudio}
                >
                  {isAudioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
                </Button>
                
                <Button
                  variant={isVideoEnabled ? "default" : "destructive"}
                  size="icon"
                  className="rounded-full w-10 h-10"
                  onClick={toggleVideo}
                >
                  {isVideoEnabled ? <Camera size={18} /> : <VideoOff size={18} />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="username">Your Name</Label>
                <Input id="username" value={userName} readOnly />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="audio-device">Microphone</Label>
                <Select 
                  value={selectedAudioDevice} 
                  onValueChange={handleAudioDeviceChange}
                  disabled={availableDevices.audioInputs.length === 0}
                >
                  <SelectTrigger id="audio-device">
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDevices.audioInputs.map(device => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.substring(0, 5)}...`}
                      </SelectItem>
                    ))}
                    {availableDevices.audioInputs.length === 0 && (
                      <SelectItem value="none">No microphones found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="video-device">Camera</Label>
                <Select 
                  value={selectedVideoDevice} 
                  onValueChange={handleVideoDeviceChange}
                  disabled={availableDevices.videoInputs.length === 0}
                >
                  <SelectTrigger id="video-device">
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDevices.videoInputs.map(device => (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.substring(0, 5)}...`}
                      </SelectItem>
                    ))}
                    {availableDevices.videoInputs.length === 0 && (
                      <SelectItem value="none">No cameras found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Background Selector */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Virtual Background</h3>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload size={14} className="mr-2" />
                Upload Image
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
              />
            </div>
            
            <Tabs
              defaultValue="backgrounds"
              className="w-full"
              onValueChange={(value) => setActiveTab(value as "backgrounds" | "blur")}
              value={activeTab}
            >
              <TabsList className="w-full">
                <TabsTrigger value="backgrounds" className="flex-1">
                  <ImageIcon size={14} className="mr-2" />
                  Backgrounds
                </TabsTrigger>
                <TabsTrigger value="blur" className="flex-1">
                  Blur
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="backgrounds" className="mt-4">
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {/* Default backgrounds */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Default Backgrounds</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {defaultBackgrounds.map(background => (
                          <Card
                            key={background.id}
                            className={`cursor-pointer overflow-hidden ${
                              isSelected(background.id) ? 'ring-2 ring-blue-500' : ''
                            }`}
                            onClick={() => applyBackground(background)}
                          >
                            <CardContent className="p-0 relative">
                              {background.type === "none" ? (
                                <div className="h-20 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                  <X size={20} className="text-gray-400" />
                                </div>
                              ) : (
                                <div
                                  className="h-20 bg-cover bg-center"
                                  style={{
                                    backgroundImage: `url(${background.thumbnail})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                  }}
                                />
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all">
                                {isSelected(background.id) && (
                                  <div className="bg-blue-500 text-white p-1 rounded-full">
                                    <Check size={14} />
                                  </div>
                                )}
                              </div>
                              <div className="p-2 text-center text-xs truncate">
                                {background.name}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    
                    {/* Uploaded backgrounds */}
                    {uploadedBackgrounds.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Your Backgrounds</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {uploadedBackgrounds.map(background => (
                            <Card
                              key={background.id}
                              className={`cursor-pointer overflow-hidden ${
                                isSelected(background.id) ? 'ring-2 ring-blue-500' : ''
                              }`}
                              onClick={() => applyBackground(background)}
                            >
                              <CardContent className="p-0 relative">
                                <div
                                  className="h-20 bg-cover bg-center"
                                  style={{
                                    backgroundImage: `url(${background.thumbnail})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat'
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all">
                                  {isSelected(background.id) ? (
                                    <div className="bg-blue-500 text-white p-1 rounded-full">
                                      <Check size={14} />
                                    </div>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute top-1 right-1 h-6 w-6 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteBackground(background.id);
                                      }}
                                    >
                                      <Trash2 size={12} />
                                    </Button>
                                  )}
                                </div>
                                <div className="p-2 text-center text-xs truncate">
                                  {background.name}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="blur" className="mt-4">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Blur Amount</span>
                      <span>{blurAmount}px</span>
                    </div>
                    <Slider
                      value={[blurAmount]}
                      min={1}
                      max={20}
                      step={1}
                      onValueChange={(value) => setBlurAmount(value[0])}
                    />
                  </div>
                  
                  <div className="flex justify-center">
                    <div
                      className="w-32 h-32 rounded-full overflow-hidden bg-cover bg-center border-4 border-white shadow-lg"
                      style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200')`,
                        filter: `blur(${blurAmount}px)`,
                        margin: `${blurAmount}px`
                      }}
                    />
                  </div>
                  
                  <Button
                    className="w-full"
                    onClick={applyBlurBackground}
                    variant={isSelected("blur") ? "secondary" : "default"}
                  >
                    {isSelected("blur") ? "Applied" : "Apply Blur"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button onClick={handleJoinMeeting}>
            Join Meeting
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PreJoinBackgroundSelector;