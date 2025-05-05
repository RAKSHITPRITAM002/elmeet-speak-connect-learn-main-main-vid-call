import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Mic, MicOff, Video, VideoOff, Settings, Users, Maximize, Minimize } from 'lucide-react';
import VirtualBackground from './VirtualBackground';
import { useAuth } from '@/contexts/AuthContext';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface BackgroundOption {
  id: string;
  type: "blur" | "image" | "none";
  url?: string;
  name: string;
  thumbnail?: string;
  fit?: "cover" | "contain" | "fill";
}

interface PreJoinMeetingProps {
  meetingId: string;
  onJoin: (options: {
    audioEnabled: boolean;
    videoEnabled: boolean;
    userName: string;
    background: BackgroundOption;
  }) => void;
}

const PreJoinMeetingEnhanced: React.FC<PreJoinMeetingProps> = ({ meetingId, onJoin }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [userName, setUserName] = useState(user?.name || '');
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>({
    id: "none",
    type: "none",
    name: "None",
    fit: "cover"
  });
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"audio" | "video" | "background">("video");
  const [backgroundFit, setBackgroundFit] = useState<"cover" | "contain" | "fill">("cover");
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Initialize camera preview
  useEffect(() => {
    if (videoEnabled) {
      startVideoPreview();
    } else {
      stopVideoPreview();
    }

    return () => {
      stopVideoPreview();
    };
  }, [videoEnabled]);

  // Update background fit when it changes
  useEffect(() => {
    if (selectedBackground.type !== "none") {
      setSelectedBackground(prev => ({
        ...prev,
        fit: backgroundFit
      }));
    }
  }, [backgroundFit]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setFullscreenPreview(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setFullscreenPreview(false);
      }
    }
  };

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreenPreview(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Start video preview
  const startVideoPreview = async () => {
    try {
      if (streamRef.current) {
        stopVideoPreview();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setVideoEnabled(false);
    }
  };

  // Stop video preview
  const stopVideoPreview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Handle background selection
  const handleBackgroundChange = (background: BackgroundOption) => {
    setSelectedBackground({
      ...background,
      fit: backgroundFit
    });
  };

  // Handle join meeting
  const handleJoinMeeting = () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }

    onJoin({
      audioEnabled,
      videoEnabled,
      userName: userName.trim(),
      background: selectedBackground
    });
  };

  // Handle background fit change
  const handleBackgroundFitChange = (value: "cover" | "contain" | "fill") => {
    setBackgroundFit(value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <Card className={`w-full ${fullscreenPreview ? '' : 'max-w-4xl'} bg-gray-800 text-white border-gray-700`}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Join Meeting</CardTitle>
          <p className="text-center text-gray-400">Meeting ID: {meetingId}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Video Preview */}
            <div className="flex flex-col items-center">
              <div 
                ref={videoContainerRef}
                className={`relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4 ${fullscreenPreview ? 'fixed inset-0 z-50 rounded-none' : ''}`}
              >
                {videoEnabled ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-${selectedBackground.fit || 'cover'}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
                      <Users size={48} className="text-gray-400" />
                    </div>
                  </div>
                )}
                
                {/* Video/Audio controls */}
                <div className={`absolute ${fullscreenPreview ? 'bottom-10' : 'bottom-4'} left-0 right-0 flex justify-center gap-2`}>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`rounded-full ${audioEnabled ? 'bg-gray-700' : 'bg-red-600'}`}
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    title={audioEnabled ? "Mute microphone" : "Unmute microphone"}
                  >
                    {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`rounded-full ${videoEnabled ? 'bg-gray-700' : 'bg-red-600'}`}
                    onClick={() => setVideoEnabled(!videoEnabled)}
                    title={videoEnabled ? "Turn off camera" : "Turn on camera"}
                  >
                    {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-gray-700"
                    onClick={() => setShowSettings(!showSettings)}
                    title="Settings"
                  >
                    <Settings size={20} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-gray-700"
                    onClick={toggleFullscreen}
                    title={fullscreenPreview ? "Exit fullscreen" : "Enter fullscreen"}
                  >
                    {fullscreenPreview ? <Minimize size={20} /> : <Maximize size={20} />}
                  </Button>
                </div>

                {fullscreenPreview && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-4 right-4 bg-gray-800/70"
                    onClick={toggleFullscreen}
                  >
                    Exit Fullscreen
                  </Button>
                )}
              </div>
              
              {/* User name input */}
              <div className={`w-full ${fullscreenPreview ? 'hidden' : ''}`}>
                <Label htmlFor="userName" className="text-gray-300">Your Name</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            
            {/* Settings panel */}
            <div className={`bg-gray-700 rounded-lg p-4 ${showSettings ? 'block' : 'hidden md:block'} ${fullscreenPreview ? 'hidden' : ''}`}>
              <Tabs defaultValue="video" onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="w-full bg-gray-800">
                  <TabsTrigger value="video" className="flex-1">Camera</TabsTrigger>
                  <TabsTrigger value="audio" className="flex-1">Microphone</TabsTrigger>
                  <TabsTrigger value="background" className="flex-1">Background</TabsTrigger>
                </TabsList>
                
                <TabsContent value="video" className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Camera Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Enable camera</span>
                      <Switch 
                        checked={videoEnabled} 
                        onCheckedChange={setVideoEnabled} 
                      />
                    </div>
                    {/* Camera selection would go here in a real implementation */}
                    <p className="text-sm text-gray-400">
                      Your camera will be off when you join the meeting if you disable it here.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="audio" className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Microphone Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Enable microphone</span>
                      <Switch 
                        checked={audioEnabled} 
                        onCheckedChange={setAudioEnabled} 
                      />
                    </div>
                    {/* Microphone selection would go here in a real implementation */}
                    <p className="text-sm text-gray-400">
                      Your microphone will be muted when you join the meeting if you disable it here.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="background" className="mt-4 space-y-4">
                  <VirtualBackground 
                    onSelectBackground={handleBackgroundChange}
                    currentBackground={selectedBackground}
                  />
                  
                  {selectedBackground.type !== "none" && (
                    <div className="mt-4 border-t border-gray-600 pt-4">
                      <h3 className="text-lg font-medium mb-2">Background Fit</h3>
                      <RadioGroup 
                        value={backgroundFit} 
                        onValueChange={(value) => handleBackgroundFitChange(value as "cover" | "contain" | "fill")}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="cover" id="fit-cover" />
                          <Label htmlFor="fit-cover" className="text-sm">Cover (fill with cropping)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="contain" id="fit-contain" />
                          <Label htmlFor="fit-contain" className="text-sm">Contain (show all with letterboxing)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fill" id="fit-fill" />
                          <Label htmlFor="fit-fill" className="text-sm">Stretch (fill entire space)</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
        <CardFooter className={`flex justify-between ${fullscreenPreview ? 'hidden' : ''}`}>
          <Button variant="outline" onClick={() => navigate('/')}>
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

export default PreJoinMeetingEnhanced;