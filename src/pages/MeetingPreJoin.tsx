import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PreJoinMeeting from '@/components/meeting/PreJoinMeeting';
import { useAuth } from '@/contexts/AuthContext';

interface BackgroundOption {
  id: string;
  type: "blur" | "image" | "none";
  url?: string;
  name: string;
  thumbnail?: string;
}

const MeetingPreJoin = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If no meeting ID is provided, generate one
    if (!meetingId) {
      const generatedId = Math.random().toString(36).substring(2, 10);
      navigate(`/meeting-prejoin/${generatedId}`);
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
      background: options.background
    }));

    // Navigate to the meeting with the selected options
    navigate(`/meeting-enhanced/${meetingId}`, { 
      state: { 
        audioEnabled: options.audioEnabled,
        videoEnabled: options.videoEnabled,
        userName: options.userName,
        background: options.background
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <PreJoinMeeting 
      meetingId={meetingId || ''} 
      onJoin={handleJoinMeeting} 
    />
  );
};

export default MeetingPreJoin;