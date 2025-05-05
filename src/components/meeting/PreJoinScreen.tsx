import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  Camera, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Settings, 
  Image,
  RefreshCw
} from 'lucide-react';
import BackgroundSelector from './BackgroundSelector';
import { useAuth } from "../../contexts/AuthContext";

interface PreJoinScreenProps {
  meetingId: string;
  onJoin: (options: {
    audio: boolean;
    video: boolean;
    userName: string;
    backgroundType: string;
    backgroundValue: string | null;
    blurAmount: number;
  }) => void;
}

const PreJoinScreen: React.FC<PreJoinScreenProps> = ({ meetingId, onJoin }) => {
  const { user } = useAuth();
  const [userName, setUserName] = useState(user?.name || '');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
  const [backgroundType, setBackgroundType] = useState<string>('none');
  const [backgroundValue, setBackgroundValue] = useState<string | null>(null);
  const [blurAmount, setBlurAmount] = useState(10);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<{
    audioInputs: MediaDeviceInfo[];
    videoInputs: MediaDeviceInfo[];
    audioOutputs: MediaDeviceInfo[];
  }>({
    audioInputs: [],
    videoInputs: [],
    audioOutputs: []
  });
  const [selectedDevices, setSelectedDevices] = useState<{
    audioInput: string;
    videoInput: string;
    audioOutput: string;
  }>({
    audioInput: '',
    videoInput: '',
    audioOutput: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get available media devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const audioInputs = devices.filter(device => device.kind === 'audioinput');
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
        
        setDevices({
          audioInputs,
          videoInputs,
          audioOutputs
        });
        
        // Set default devices
        setSelectedDevices({
          audioInput: audioInputs.length > 0 ? audioInputs[0].deviceId : '',
          videoInput: videoInputs.length > 0 ? videoInputs[0].deviceId : '',
          audioOutput: audioOutputs.length > 0 ? audioOutputs[0].deviceId : ''
        });
      } catch (err) {
        console.error('Error getting media devices:', err);
        setError('Could not access media devices. Please check your browser permissions.');
      }
    };
    
    getDevices();
  }, []);

  // Initialize media stream
  useEffect(() => {
    const initializeStream = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Stop any existing stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        // Get new stream with selected devices
        const constraints: MediaStreamConstraints = {
          audio: audioEnabled ? { deviceId: selectedDevices.audioInput ? { exact: selectedDevices.audioInput } : undefined } : false,
          video: videoEnabled ? { 
            deviceId: selectedDevices.videoInput ? { exact: selectedDevices.videoInput } : undefined,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } : false
        };
        
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(newStream);
        
        // Set video source
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
        setError('Could not access camera or microphone. Please check your browser permissions.');
        
        // If video fails, try audio only
        if (videoEnabled) {
          setVideoEnabled(false);
          try {
            const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ 
              audio: audioEnabled ? { deviceId: selectedDevices.audioInput ? { exact: selectedDevices.audioInput } : undefined } : false,
              video: false 
            });
            setStream(audioOnlyStream);
          } catch (audioErr) {
            console.error('Error accessing audio devices:', audioErr);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeStream();
    
    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDevices.audioInput, selectedDevices.videoInput, audioEnabled, videoEnabled]);

  // Handle device change
  const handleDeviceChange = (type: 'audioInput' | 'videoInput' | 'audioOutput', deviceId: string) => {
    setSelectedDevices(prev => ({
      ...prev,
      [type]: deviceId
    }));
  };

  // Handle background selection
  const handleSelectBackground = (type: string, value: string | null) => {
    setBackgroundType(type);
    setBackgroundValue(value);
  };

  // Handle blur amount change
  const handleBlurAmount = (amount: number) => {
    setBlurAmount(amount);
  };

  // Handle join meeting
  const handleJoinMeeting = () => {
    if (!userName.trim()) {
      alert('Please enter your name before joining');
      return;
    }
    
    onJoin({
      audio: audioEnabled,
      video: videoEnabled,
      userName: userName.trim(),
      backgroundType,
      backgroundValue,
      blurAmount
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Join Meeting</CardTitle>
          <CardDescription>
            Meeting ID: {meetingId}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Video preview */}
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="animate-spin h-8 w-8 text-white" />
                </div>
              ) : videoEnabled ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />
                  {backgroundType === 'blur' && (
                    <div 
                      className="absolute inset-0 backdrop-blur" 
                      style={{ backdropFilter: `blur(${blurAmount}px)` }}
                    />
                  )}
                  {backgroundType === 'image' && backgroundValue && (
                    <div 
                      className="absolute inset-0" 
                      style={{ 
                        backgroundImage: `url(${backgroundValue})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                  )}
                  {backgroundType === 'color' && backgroundValue && (
                    <div 
                      className="absolute inset-0" 
                      style={{ backgroundColor: backgroundValue }}
                    />
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <VideoOff className="h-16 w-16 mb-4" />
                  <p>Camera is turned off</p>
                </div>
              )}
              
              {error && (
                <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white p-2 text-sm">
                  {error}
                </div>
              )}
              
              {/* Controls overlay */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                <Button 
                  variant={audioEnabled ? "default" : "secondary"}
                  size="icon"
                  className="rounded-full"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                >
                  {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                
                <Button 
                  variant={videoEnabled ? "default" : "secondary"}
                  size="icon"
                  className="rounded-full"
                  onClick={() => setVideoEnabled(!videoEnabled)}
                >
                  {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                
                <Dialog open={showBackgroundSelector} onOpenChange={setShowBackgroundSelector}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="secondary"
                      size="icon"
                      className="rounded-full"
                      disabled={!videoEnabled}
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0">
                    <BackgroundSelector 
                      onSelectBackground={handleSelectBackground}
                      onBlurAmount={handleBlurAmount}
                      onClose={() => setShowBackgroundSelector(false)}
                      currentVideoStream={stream || undefined}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {/* Settings */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-name">Your Name</Label>
                <Input 
                  id="user-name" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="audio-input">Microphone</Label>
                <select 
                  id="audio-input"
                  className="w-full p-2 border rounded-md mt-1"
                  value={selectedDevices.audioInput}
                  onChange={(e) => handleDeviceChange('audioInput', e.target.value)}
                  disabled={!audioEnabled}
                >
                  {devices.audioInputs.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                    </option>
                  ))}
                  {devices.audioInputs.length === 0 && (
                    <option value="">No microphones available</option>
                  )}
                </select>
              </div>
              
              <div>
                <Label htmlFor="video-input">Camera</Label>
                <select 
                  id="video-input"
                  className="w-full p-2 border rounded-md mt-1"
                  value={selectedDevices.videoInput}
                  onChange={(e) => handleDeviceChange('videoInput', e.target.value)}
                  disabled={!videoEnabled}
                >
                  {devices.videoInputs.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
                    </option>
                  ))}
                  {devices.videoInputs.length === 0 && (
                    <option value="">No cameras available</option>
                  )}
                </select>
              </div>
              
              <div>
                <Label htmlFor="audio-output">Speaker</Label>
                <select 
                  id="audio-output"
                  className="w-full p-2 border rounded-md mt-1"
                  value={selectedDevices.audioOutput}
                  onChange={(e) => handleDeviceChange('audioOutput', e.target.value)}
                >
                  {devices.audioOutputs.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Speaker ${device.deviceId.slice(0, 5)}...`}
                    </option>
                  ))}
                  {devices.audioOutputs.length === 0 && (
                    <option value="">No speakers available</option>
                  )}
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="audio-enabled">Microphone</Label>
                  <p className="text-sm text-gray-500">
                    {audioEnabled ? 'Your microphone is on' : 'Your microphone is muted'}
                  </p>
                </div>
                <Switch 
                  id="audio-enabled" 
                  checked={audioEnabled}
                  onCheckedChange={setAudioEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="video-enabled">Camera</Label>
                  <p className="text-sm text-gray-500">
                    {videoEnabled ? 'Your camera is on' : 'Your camera is off'}
                  </p>
                </div>
                <Switch 
                  id="video-enabled" 
                  checked={videoEnabled}
                  onCheckedChange={setVideoEnabled}
                />
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Device Settings
          </Button>
          <Button onClick={handleJoinMeeting}>
            Join Meeting
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PreJoinScreen;
