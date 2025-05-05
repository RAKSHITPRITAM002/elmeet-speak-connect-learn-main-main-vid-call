
import { Button } from "@/components/ui/button";
import { Video, Copy, Users, Calendar, Clock } from "lucide-react";
import { useState } from "react";

interface MeetingCardProps {
  id: string;
  title: string;
  scheduledTime?: string;
  participants?: number;
  isActive?: boolean;
  onJoin: () => void;
}

export const MeetingCard = ({
  id,
  title,
  scheduledTime,
  participants = 0,
  isActive = false,
  onJoin
}: MeetingCardProps) => {
  const [copied, setCopied] = useState(false);
  
  const copyLink = () => {
    navigator.clipboard.writeText(`https://elmeet.com/join/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className={`border rounded-lg overflow-hidden shadow-sm hover:shadow transition-all ${
      isActive ? "border-brand-teal" : "border-gray-200"
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
            
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <div className="flex items-center mr-3">
                <Users size={14} className="mr-1" />
                <span>{participants} participants</span>
              </div>
              
              {scheduledTime && (
                <>
                  <div className="flex items-center mr-3">
                    <Calendar size={14} className="mr-1" />
                    <span>{scheduledTime.split(" ")[0]}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>{scheduledTime.split(" ")[1]}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {isActive && (
            <div className="flex items-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                Live
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="text-sm text-gray-500 flex items-center">
            <span className="inline-block mr-1 truncate max-w-[120px]">ID: {id}</span>
            <button 
              onClick={copyLink} 
              className="p-1 hover:text-brand-teal focus:outline-none"
              aria-label="Copy meeting link"
            >
              <Copy size={14} />
            </button>
            {copied && <span className="text-xs text-green-600 ml-1">Copied!</span>}
          </div>
          
          <Button
            onClick={onJoin}
            className={isActive 
              ? "bg-brand-orange hover:bg-brand-orange/90 text-white" 
              : "bg-brand-teal hover:bg-brand-teal/90 text-white"
            }
            size="sm"
          >
            <Video size={16} className="mr-1" />
            {isActive ? "Join now" : "Start"}
          </Button>
        </div>
      </div>
    </div>
  );
};
