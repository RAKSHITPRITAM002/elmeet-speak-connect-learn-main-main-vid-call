import { Button } from "@/components/ui/button";
import { 
  Video, VideoOff, Mic, MicOff, Phone, ScreenShare, MessageSquare, 
  Users, Hand, PenTool, Layout, Presentation, FileVideo, 
  Languages, Settings, Smile, FileUp, PanelLeftClose, 
  PanelRightClose, BarChart, UserPlus, Layers, Palette
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface ConferenceControlsProps {
  videoEnabled: boolean;
  audioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onEndCall: () => void;
  onShareScreen?: () => void;
  onOptimizedVideoShare?: () => void;
  onToggleChat?: () => void;
  onToggleParticipants?: () => void;
  onRaiseHand?: () => void;
  onToggleAnnotation?: () => void;
  onToggleWhiteboard?: () => void;
  onTogglePolls?: () => void;
  onToggleRolePlay?: () => void;
  onToggleMultimediaPlayer?: () => void;
  onToggleLanguageTools?: () => void;
  onToggleVirtualBackground?: () => void;
  onChangeAudioDevice?: (deviceId: string) => void;
  onChangeVideoDevice?: (deviceId: string) => void;
  audioInputDevices?: MediaDeviceInfo[];
  videoInputDevices?: MediaDeviceInfo[];
  isAnnotating?: boolean;
  isScreenSharing?: boolean;
  isHandRaised?: boolean;
  isHost?: boolean;
}

export const ConferenceControls = ({
  videoEnabled,
  audioEnabled,
  onToggleVideo,
  onToggleAudio,
  onEndCall,
  onShareScreen,
  onOptimizedVideoShare,
  onToggleChat,
  onToggleParticipants,
  onRaiseHand,
  onToggleAnnotation,
  onToggleWhiteboard,
  onTogglePolls,
  onToggleRolePlay,
  onToggleMultimediaPlayer,
  onToggleLanguageTools,
  onToggleVirtualBackground,
  onChangeAudioDevice,
  onChangeVideoDevice,
  audioInputDevices = [],
  videoInputDevices = [],
  isAnnotating = false,
  isScreenSharing = false,
  isHandRaised = false,
  isHost = false
}: ConferenceControlsProps) => {
  const [showMoreTools, setShowMoreTools] = useState(false);

  const controlButton = (
    icon: React.ReactNode, 
    label: string, 
    onClick: () => void, 
    variant?: "danger" | "primary" | "active",
    disabled?: boolean
  ) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            variant={variant === "danger" ? "destructive" : "outline"}
            size="lg"
            disabled={disabled}
            className={`
              h-12 w-12 rounded-full p-0
              ${variant === "primary" ? "bg-brand-teal hover:bg-brand-teal/90 text-white" : ""}
              ${variant === "active" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
              ${!variant ? "bg-gray-800/50 hover:bg-gray-700/50 text-white" : ""}
            `}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="meeting-controls bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Audio Controls with Device Selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                {controlButton(
                  audioEnabled ? <Mic size={20} /> : <MicOff size={20} />,
                  audioEnabled ? "Mute" : "Unmute",
                  onToggleAudio,
                  audioEnabled ? undefined : "active"
                )}
              </div>
            </DropdownMenuTrigger>
            {audioInputDevices.length > 0 && onChangeAudioDevice && (
              <DropdownMenuContent align="start">
                <div className="p-2 text-xs font-medium">Select Microphone</div>
                <Separator />
                {audioInputDevices.map((device) => (
                  <DropdownMenuItem 
                    key={device.deviceId}
                    onClick={() => onChangeAudioDevice(device.deviceId)}
                  >
                    {device.label || `Microphone ${device.deviceId.substring(0, 5)}`}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            )}
          </DropdownMenu>
          
          {/* Video Controls with Device Selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                {controlButton(
                  videoEnabled ? <Video size={20} /> : <VideoOff size={20} />,
                  videoEnabled ? "Stop Video" : "Start Video",
                  onToggleVideo,
                  videoEnabled ? undefined : "active"
                )}
              </div>
            </DropdownMenuTrigger>
            {videoInputDevices.length > 0 && onChangeVideoDevice && (
              <DropdownMenuContent align="start">
                <div className="p-2 text-xs font-medium">Select Camera</div>
                <Separator />
                {videoInputDevices.map((device) => (
                  <DropdownMenuItem 
                    key={device.deviceId}
                    onClick={() => onChangeVideoDevice(device.deviceId)}
                  >
                    {device.label || `Camera ${device.deviceId.substring(0, 5)}`}
                  </DropdownMenuItem>
                ))}
                {onToggleVirtualBackground && (
                  <>
                    <Separator />
                    <DropdownMenuItem onClick={onToggleVirtualBackground}>
                      <Palette size={16} className="mr-2" />
                      Virtual Background
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            )}
          </DropdownMenu>
          
          {/* Screen Share */}
          {onShareScreen && controlButton(
            <ScreenShare size={20} />, 
            isScreenSharing ? "Stop Sharing" : "Share Screen", 
            onShareScreen,
            isScreenSharing ? "active" : undefined
          )}
          
          {/* Optimized Video Share */}
          {onOptimizedVideoShare && controlButton(
            <FileVideo size={20} />, 
            isScreenSharing ? "Stop Video Share" : "Optimized Video Share", 
            onOptimizedVideoShare,
            isScreenSharing ? "active" : undefined
          )}
          
          {/* Raise Hand */}
          {onRaiseHand && controlButton(
            <Hand size={20} />, 
            isHandRaised ? "Lower Hand" : "Raise Hand", 
            onRaiseHand,
            isHandRaised ? "active" : undefined
          )}
          
          {/* Annotation */}
          {onToggleAnnotation && controlButton(
            <PenTool size={20} />, 
            "Annotation", 
            onToggleAnnotation,
            isAnnotating ? "active" : undefined,
            !isScreenSharing
          )}
        </div>

        {/* End Call Button */}
        {controlButton(<Phone size={20} />, "End Call", onEndCall, "danger")}

        <div className="flex items-center gap-2">
          {/* Participants */}
          {onToggleParticipants && controlButton(<Users size={20} />, "Participants", onToggleParticipants)}
          
          {/* Chat */}
          {onToggleChat && controlButton(<MessageSquare size={20} />, "Chat", onToggleChat)}
          
          {/* More Tools Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {controlButton(<Layout size={20} />, "More Tools", () => setShowMoreTools(!showMoreTools))}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2 text-xs font-medium">Teaching Tools</div>
              <Separator />
              
              {onToggleWhiteboard && (
                <DropdownMenuItem onClick={onToggleWhiteboard}>
                  <Presentation size={16} className="mr-2" />
                  Whiteboard
                </DropdownMenuItem>
              )}
              
              {onTogglePolls && (
                <DropdownMenuItem onClick={onTogglePolls}>
                  <BarChart size={16} className="mr-2" />
                  Polls & Quizzes
                </DropdownMenuItem>
              )}
              
              {onToggleRolePlay && (
                <DropdownMenuItem onClick={onToggleRolePlay}>
                  <UserPlus size={16} className="mr-2" />
                  Role Play
                </DropdownMenuItem>
              )}
              
              {onToggleMultimediaPlayer && (
                <DropdownMenuItem onClick={onToggleMultimediaPlayer}>
                  <FileVideo size={16} className="mr-2" />
                  Media Player
                </DropdownMenuItem>
              )}
              
              {onToggleLanguageTools && (
                <DropdownMenuItem onClick={onToggleLanguageTools}>
                  <Languages size={16} className="mr-2" />
                  Language Tools
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

