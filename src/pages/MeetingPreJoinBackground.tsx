import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import PreJoinBackgroundSelector from '@/components/meeting/PreJoinBackgroundSelector';

interface BackgroundOption {
  id: string;
  type: "blur" | "image" | "none";
  url?: string;
  name: string;
  thumbnail?: string;
  fit?: "cover" | "contain" | "fill";
}

const MeetingPreJoinBackground: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [availableDevices, setAvailableDevices] = useState<{
    audioInputs: MediaDeviceInfo[];
    videoInputs: MediaDeviceInfo[];
    audioOutputs: MediaDeviceInfo[];
  }>({
    audioInputs: [],
    videoInputs: [],
    audioOutputs: [],
  });

  // Enumerate available devices
  useEffect(() => {
    const enumerateDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        setAvailableDevices({
          audioInputs: devices.filter(device => device.kind === 'audioinput'),
          videoInputs: devices.filter(device => device.kind === 'videoinput'),
          audioOutputs: devices.filter(device => device.kind === 'audiooutput'),
        });
      } catch (error) {
        console.error('Error enumerating devices:', error);
      }
    };

    // Request permissions first to get labeled devices
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then(stream => {
        // Stop tracks immediately after getting permissions
        stream.getTracks().forEach(track => track.stop());
        enumerateDevices();
      })
      .catch(error => {
        console.error('Error getting media permissions:', error);
        // Try to enumerate devices anyway, but they might be unlabeled
        enumerateDevices();
      });

    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);
    };
  }, []);

  // Handle device change
  const handleDeviceChange = (type: 'audio' | 'video', deviceId: string) => {
    // Store selected device in localStorage for persistence
    localStorage.setItem(`preferred_${type}_device`, deviceId);
  };

  // Handle join meeting with selected background
  const handleJoinMeeting = (background: BackgroundOption) => {
    // Store selected background in localStorage
    localStorage.setItem('selected_background', JSON.stringify(background));
    
    // Navigate to the meeting page
    navigate(`/meeting-enhanced/${meetingId}`);
  };

  return (
    <PreJoinBackgroundSelector
      onJoinMeeting={handleJoinMeeting}
      meetingId={meetingId || 'Unknown Meeting'}
      userName={user?.name || 'Anonymous'}
      availableDevices={availableDevices}
      onDeviceChange={handleDeviceChange}
    />
  );
};

export default MeetingPreJoinBackground;