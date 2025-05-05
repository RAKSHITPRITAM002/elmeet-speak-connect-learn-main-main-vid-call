
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, MoreVertical, Crown } from "lucide-react";
import { Participant } from "./VideoGrid";

interface ParticipantsListProps {
  participants: Participant[];
  localParticipant: Participant;
  hostId?: string;
  onToggleParticipantAudio?: (participantId: string) => void;
  onToggleParticipantVideo?: (participantId: string) => void;
  onPromoteToHost?: (participantId: string) => void;
  onClose?: () => void;
}

export const ParticipantsList = ({
  participants,
  localParticipant,
  hostId,
  onToggleParticipantAudio,
  onToggleParticipantVideo,
  onPromoteToHost,
  onClose
}: ParticipantsListProps) => {
  const allParticipants = [localParticipant, ...participants.filter(p => p.id !== localParticipant.id)];
  
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-900 px-4 py-3 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-medium">Participants ({allParticipants.length})</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            &times;
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <ul className="divide-y dark:divide-gray-700">
          {allParticipants.map((participant) => (
            <li key={participant.id} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">
                    {participant.name} 
                    {participant.id === localParticipant.id && " (You)"}
                    {participant.id === hostId && (
                      <span className="ml-1 inline-flex items-center">
                        <Crown size={14} className="text-yellow-500" />
                      </span>
                    )}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    {participant.hasAudio ? 
                      <Mic size={12} className="mr-1" /> : 
                      <MicOff size={12} className="mr-1" />
                    }
                    {participant.hasVideo ? "Video on" : "Video off"}
                  </div>
                </div>
              </div>
              
              {(hostId === localParticipant.id && participant.id !== localParticipant.id) && (
                <div className="flex items-center space-x-1">
                  {onToggleParticipantAudio && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => onToggleParticipantAudio(participant.id)}
                    >
                      {participant.hasAudio ? <MicOff size={14} /> : <Mic size={14} />}
                    </Button>
                  )}
                  
                  {onToggleParticipantVideo && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => onToggleParticipantVideo(participant.id)}
                    >
                      {participant.hasVideo ? <VideoOff size={14} /> : <Video size={14} />}
                    </Button>
                  )}
                  
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <MoreVertical size={14} />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
