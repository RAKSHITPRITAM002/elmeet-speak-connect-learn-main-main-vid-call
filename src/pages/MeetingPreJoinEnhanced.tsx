import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { PreJoinMeetingEnhanced } from '@/components/meeting';

interface BackgroundOption {
  id: string;
  type: "blur" | "image" | "none";
  url?: string;
  name: string;
  thumbnail?: string;
  fit?: "cover" | "contain" | "fill";
}

const MeetingPreJoinEnhanced = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If no meeting ID is provided, generate one
    if (!meetingId) {
      const generatedId = Math.random().toString(36).substring(2, 10);
      navigate(`/meeting-prejoin-enhanced/${generatedId}`);
    } else {
      setIsLoading(false);
    }
  }, [meetingId, navigate]);

  const handleJoinMeeting = (options: {
    audioEnabled: boolean;
    videoEnabled: boolean;
    userName: string;
    background: BackgroundOption;
  }) => {
    // Save meeting preferences to localStorage
    localStorage.setItem('meetingPreferences', JSON.stringify({
      audioEnabled: options.audioEnabled,
      videoEnabled: options.videoEnabled,
      userName: options.userName,
      background: options.background,
      selectedAudioDevice: "",
      selectedVideoDevice: ""
    }));

    // Navigate to the meeting with the selected options
    navigate(`/meeting-enhanced/${meetingId}`, { 
      state: { 
        audioEnabled: options.audioEnabled,
        videoEnabled: options.videoEnabled,
        userName: options.userName,
        background: options.background,
        selectedAudioDevice: "",
        selectedVideoDevice: ""
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="text-white animate-spin" />
          <div className="text-white text-xl">Preparing your meeting...</div>
        </div>
      </div>
    );
  }

  return (
    <PreJoinMeetingEnhanced 
      meetingId={meetingId || ''} 
      onJoin={handleJoinMeeting}
    />
  );
};

export default MeetingPreJoinEnhanced;