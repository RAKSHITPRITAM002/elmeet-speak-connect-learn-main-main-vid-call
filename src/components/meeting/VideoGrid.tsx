import { useMemo } from "react";

export type Participant = {
  id: string;
  name: string;
  isActive: boolean;
  isSpeaking?: boolean;
  hasAudio: boolean;
  hasVideo: boolean;
  videoElement?: React.ReactNode;
};

interface VideoGridProps {
  participants: Participant[];
  localParticipant: Participant;
  activeSpeakerId?: string;
  viewMode?: 'gallery' | 'speaker';
}

export const VideoGrid = ({ 
  participants, 
  localParticipant, 
  activeSpeakerId, 
  viewMode = 'gallery' 
}: VideoGridProps) => {
  const allParticipants = useMemo(() => {
    // Always place local participant first
    return [localParticipant, ...participants.filter(p => p.id !== localParticipant.id)];
  }, [participants, localParticipant]);
  
  const activeParticipant = useMemo(() => {
    if (viewMode === 'speaker' && activeSpeakerId) {
      return allParticipants.find(p => p.id === activeSpeakerId) || allParticipants[0];
    }
    return null;
  }, [allParticipants, activeSpeakerId, viewMode]);
  
  if (viewMode === 'speaker' && activeParticipant) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
          {renderParticipantVideo(activeParticipant, true)}
          
          <div className="absolute bottom-4 right-4 flex space-x-2">
            {allParticipants
              .filter(p => p.id !== activeParticipant.id)
              .slice(0, 4)
              .map(participant => (
                <div key={participant.id} className="w-32 h-24 bg-gray-800 rounded overflow-hidden">
                  {renderParticipantVideo(participant, false)}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Gallery view - grid layout
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 h-full">
      {allParticipants.map(participant => (
        <div 
          key={participant.id} 
          className={`bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center ${
            participant.isSpeaking ? 'ring-2 ring-brand-teal' : ''
          }`}
        >
          {renderParticipantVideo(participant, false)}
        </div>
      ))}
    </div>
  );
};

const renderParticipantVideo = (participant: Participant, isMain: boolean) => {
  // If participant has provided a custom video element, render it
  if (participant.videoElement) {
    return participant.videoElement;
  }
  
  // Otherwise render placeholder based on video status
  if (participant.hasVideo) {
    return (
      <div className="relative w-full h-full">
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <div className={`${isMain ? 'text-2xl' : 'text-sm'} text-white`}>
            {participant.name}'s Video
          </div>
        </div>
        
        {/* Indicator overlays */}
        <div className="absolute bottom-2 left-2 flex items-center space-x-1">
          {!participant.hasAudio && (
            <div className="bg-red-500 rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
              </svg>
            </div>
          )}
          
          {participant.isActive && (
            <div className="bg-green-500 rounded-full w-2 h-2"></div>
          )}
        </div>
        
        <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-white text-xs">
          {participant.name}
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-white text-xl mb-2">
          {participant.name.charAt(0).toUpperCase()}
        </div>
        <p className="text-white text-center">{participant.name}</p>
        
        {!participant.hasAudio && (
          <div className="mt-2 bg-red-500 rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
            </svg>
          </div>
        )}
      </div>
    );
  }
};
