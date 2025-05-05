import React, { useEffect, useRef, useState } from "react";
// Ensure React is in scope for JSX
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
 
interface Participant {
  id: number;
  name: string;
  isAdmin?: boolean;
  isHost?: boolean; // Indicates if the participant is the host
  isCoHost?: boolean; // Indicates if the participant is a co-host
  videoStream?: MediaStream | null;
  handRaised?: boolean; // Indicates if participant has raised hand
  isMuted?: boolean; // Indicates if participant is muted
  isVideoOff?: boolean; // Indicates if participant's video is off
  breakoutRoomId?: string | null; // Assigned breakout room ID
  virtualBackground?: string | null; // Virtual background image URL or "blur"
  reactions?: { emoji: string; timestamp: number }[]; // Recent emoji reactions
}
 
const dummyParticipants: Participant[] = [
  { 
    id: 2, 
    name: "Bob", 
    videoStream: null, 
    isCoHost: true,
    handRaised: false,
    isMuted: false,
    isVideoOff: true,
    breakoutRoomId: null,
    virtualBackground: null,
    reactions: []
  },
  { 
    id: 3, 
    name: "Charlie", 
    videoStream: null,
    handRaised: true,
    isMuted: true,
    isVideoOff: false,
    breakoutRoomId: null,
    virtualBackground: null,
    reactions: []
  },
  { 
    id: 4, 
    name: "Dana", 
    videoStream: null,
    handRaised: false,
    isMuted: false,
    isVideoOff: true,
    breakoutRoomId: null,
    virtualBackground: "blur",
    reactions: []
  },
  { 
    id: 5, 
    name: "Ethan", 
    videoStream: null,
    handRaised: false,
    isMuted: true,
    isVideoOff: false,
    breakoutRoomId: null,
    virtualBackground: null,
    reactions: []
  },
  { 
    id: 6, 
    name: "Fiona", 
    videoStream: null,
    handRaised: false,
    isMuted: false,
    isVideoOff: false,
    breakoutRoomId: null,
    virtualBackground: null,
    reactions: []
  },
];
 
 interface ParticipantCardProps {
   participant: Participant;
   isActive?: boolean;
   isLarge?: boolean;
   isThumbnail?: boolean;
   onActiveSpeakerChange: () => void;
   onToggleHandRaise?: (participantId: number) => void;
   onToggleMute?: (participantId: number) => void;
   onToggleVideo?: (participantId: number) => void;
   onAssignCoHost?: (participantId: number) => void;
   onRemoveParticipant?: (participantId: number) => void;
   onSendToBreakoutRoom?: (participantId: number, roomId: string) => void;
   onSendReaction?: (participantId: number, emoji: string) => void;
   onChangeVirtualBackground?: (participantId: number, background: string | null) => void;
 }

 const ParticipantCard = ({ 
   participant, 
   isActive = false, 
   isLarge = false,
   isThumbnail = false,
   onActiveSpeakerChange,
   onToggleHandRaise,
   onToggleMute,
   onToggleVideo,
   onAssignCoHost,
   onRemoveParticipant,
   onSendToBreakoutRoom,
   onSendReaction,
   onChangeVirtualBackground
 }: ParticipantCardProps): JSX.Element => {
   // Reference to the video element
   const videoRef = useRef<HTMLVideoElement>(null);
   
   // Set up video stream when it changes
   useEffect(() => {
     if (videoRef.current && participant.videoStream) {
       videoRef.current.srcObject = participant.videoStream;
     }
   }, [participant.videoStream]);
   
   // Common controls for all participants
   const handleMicToggle = () => {
     console.log(`Toggling mic for participant ${participant.id}`);
     if (onToggleMute) {
       onToggleMute(participant.id);
     }
   };
   
   const handleHandUp = () => {
     console.log(`Participant ${participant.id} raised hand`);
     if (onToggleHandRaise) {
       onToggleHandRaise(participant.id);
     }
   };
   
   const handleMute = () => {
     console.log(`Muting participant ${participant.id}`);
     if (onToggleMute) {
       onToggleMute(participant.id);
     }
   };
   
   const handleVideoToggle = () => {
     console.log(`Toggling video for participant ${participant.id}`);
     if (onToggleVideo) {
       onToggleVideo(participant.id);
     }
   };

   // Admin-only controls
   const handleRemove = () => {
     console.log(`Removing participant ${participant.id}`);
     if (onRemoveParticipant) {
       onRemoveParticipant(participant.id);
     }
   };
   
   const handleClose = () => {
     console.log(`Closing connection for participant ${participant.id}`);
   };
   
   const handleAssignCoHost = () => {
     console.log(`Assigning co-host role to participant ${participant.id}`);
     if (onAssignCoHost) {
       onAssignCoHost(participant.id);
     }
   };
   
   const handleSendToBreakoutRoom = (roomId: string) => {
     console.log(`Sending participant ${participant.id} to breakout room ${roomId}`);
     if (onSendToBreakoutRoom) {
       onSendToBreakoutRoom(participant.id, roomId);
     }
   };
   
   const handleSendReaction = (emoji: string) => {
     console.log(`Sending reaction ${emoji} from participant ${participant.id}`);
     if (onSendReaction) {
       onSendReaction(participant.id, emoji);
     }
   };
   
   const handleChangeBackground = (background: string | null) => {
     console.log(`Changing background for participant ${participant.id} to ${background}`);
     if (onChangeVirtualBackground) {
       onChangeVirtualBackground(participant.id, background);
     }
   };

   // Audio level simulation for active speaker detection
   const [audioLevel, setAudioLevel] = useState(0);
   
   // Simulate audio level changes for demo purposes
   useEffect(() => {
     if (participant.id === 1) return; // Don't simulate for local user
     
     const interval = setInterval(() => {
       // Random audio level between 0 and 100
       const newLevel = Math.floor(Math.random() * 100);
       setAudioLevel(newLevel);
       
       // If audio level is high enough, mark as active speaker
       if (newLevel > 70) {
         onActiveSpeakerChange();
       }
     }, 2000);
     
     return () => clearInterval(interval);
   }, [participant.id, onActiveSpeakerChange]);

   // Determine card classes based on props
   const cardClasses = `
     relative 
     ${isActive ? 'ring-2 ring-yellow-400' : ''} 
     ${isThumbnail ? 'bg-blue-50 border border-blue-200 rounded-lg overflow-hidden shadow flex flex-col h-24' : 
       'bg-blue-50 border border-blue-200 rounded-lg overflow-hidden shadow-lg flex flex-col'}
     ${isLarge ? 'w-full h-full' : ''}
   `;

   // Emoji reactions display
   const [visibleReactions, setVisibleReactions] = useState<{emoji: string, id: number}[]>([]);
   
   // Process and display emoji reactions
   useEffect(() => {
     if (participant.reactions && participant.reactions.length > 0) {
       // Get recent reactions (last 5 seconds)
       const now = Date.now();
       const recentReactions = participant.reactions.filter(r => now - r.timestamp < 5000);
       
       // Add each reaction with a unique ID
       recentReactions.forEach(reaction => {
         const reactionId = Math.random();
         setVisibleReactions(prev => [...prev, {emoji: reaction.emoji, id: reactionId}]);
         
         // Remove reaction after animation (3 seconds)
         setTimeout(() => {
           setVisibleReactions(prev => prev.filter(r => r.id !== reactionId));
         }, 3000);
       });
     }
   }, [participant.reactions]);

   return (
     <div className={cardClasses} onClick={onActiveSpeakerChange}>
       {/* Active Speaker Indicator */}
       {isActive && !isThumbnail && (
         <div className="absolute top-2 right-2 z-10 bg-yellow-400 text-xs px-2 py-1 rounded-full text-blue-900 font-semibold">
           Speaking
         </div>
       )}
       
       {/* Hand Raised Indicator */}
       {participant.handRaised && (
         <div className="absolute top-2 left-2 z-10 text-2xl" title="Hand Raised">
           ✋
         </div>
       )}
       
       {/* Co-Host Badge */}
       {participant.isCoHost && !participant.isHost && !isThumbnail && (
         <div className="absolute top-2 left-2 z-10 bg-purple-500 text-xs px-2 py-1 rounded-full text-white font-semibold">
           Co-Host
         </div>
       )}
       
       {/* Breakout Room Indicator */}
       {participant.breakoutRoomId && !isThumbnail && (
         <div className="absolute top-10 left-2 z-10 bg-blue-500 text-xs px-2 py-1 rounded-full text-white font-semibold">
           Room: {participant.breakoutRoomId}
         </div>
       )}
       
       {/* Audio Level Indicator */}
       {!isThumbnail && (
         <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
           <div 
             className="h-full bg-green-500" 
             style={{ width: `${audioLevel}%` }}
           ></div>
         </div>
       )}
       
       {/* Emoji Reactions */}
       <div className="absolute inset-0 pointer-events-none overflow-hidden">
         {visibleReactions.map(reaction => (
           <div 
             key={reaction.id}
             className="absolute text-2xl animate-float-up"
             style={{
               left: `${Math.random() * 80 + 10}%`,
               bottom: '0',
               animation: 'float-up 3s ease-out forwards'
             }}
           >
             {reaction.emoji}
           </div>
         ))}
       </div>
       
       {/* Video Feed Area with Virtual Background */}
       <div className={`bg-blue-900 ${isThumbnail ? 'h-full' : 'aspect-video'} flex items-center justify-center relative overflow-hidden`}>
         {/* Virtual Background */}
         {participant.virtualBackground && (
           <div 
             className="absolute inset-0 z-0" 
             style={{
               backdropFilter: participant.virtualBackground === "blur" ? "blur(10px)" : "none",
               backgroundImage: participant.virtualBackground !== "blur" ? `url(${participant.virtualBackground})` : "none",
               backgroundSize: "cover",
               backgroundPosition: "center"
             }}
           ></div>
         )}
         
         {/* Video or Avatar */}
         {participant.videoStream && !participant.isVideoOff ? (
           <video 
             ref={videoRef} 
             autoPlay 
             playsInline 
             muted={participant.id === 1} // Mute only the local user's video
             className="w-full h-full object-cover z-10 relative"
           />
         ) : (
           <div className="flex flex-col items-center justify-center z-10 relative">
             <div className={`${isThumbnail ? 'w-10 h-10 text-lg' : 'w-20 h-20 text-2xl'} rounded-full bg-blue-700 flex items-center justify-center text-white font-bold`}>
               {participant.name.charAt(0)}
             </div>
             {!isThumbnail && (
               <p className="text-yellow-300 text-lg mt-2">
                 {participant.isVideoOff ? "Video Off" : "No Video"}
               </p>
             )}
           </div>
         )}
         
         {/* Muted Indicator */}
         {participant.isMuted && (
           <div className="absolute bottom-2 right-2 z-20 bg-red-500 rounded-full p-1">
             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd"></path>
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"></path>
             </svg>
           </div>
         )}
       </div>
       
       {/* Participant Name */}
       <div className={`${isThumbnail ? 'p-1' : 'p-2'} bg-blue-100`}>
         <p className={`text-blue-800 font-semibold text-center ${isThumbnail ? 'text-xs truncate' : ''}`}>
           {participant.name}
           {participant.isHost && !isThumbnail && <span className="ml-2 text-xs bg-blue-600 text-white px-1 rounded">Host</span>}
           {participant.isCoHost && !participant.isHost && !isThumbnail && <span className="ml-2 text-xs bg-purple-600 text-white px-1 rounded">Co-Host</span>}
         </p>
       </div>
       
       {/* Participant Control Buttons - Only show in regular view */}
       {!isThumbnail && !isLarge && (
         <div className="p-2 bg-blue-50 flex flex-wrap justify-around gap-1">
           <button
             onClick={handleMicToggle}
             className={`${participant.isMuted ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'} text-yellow-200 text-xs px-2 py-1 rounded flex-1`}
           >
             {participant.isMuted ? 'Unmute' : 'Mute'}
           </button>
           <button
             onClick={handleVideoToggle}
             className={`${participant.isVideoOff ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'} text-yellow-200 text-xs px-2 py-1 rounded flex-1`}
           >
             {participant.isVideoOff ? 'Video On' : 'Video Off'}
           </button>
           <button
             onClick={handleHandUp}
             className={`${participant.handRaised ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-blue-900 text-xs px-2 py-1 rounded flex-1`}
           >
             {participant.handRaised ? 'Hand Down' : 'Hand Up'}
           </button>
           
           {/* Emoji Reactions Dropdown */}
           <div className="relative group flex-1">
             <button
               className="bg-blue-600 hover:bg-blue-700 text-yellow-200 text-xs px-2 py-1 rounded w-full"
             >
               Reactions
             </button>
             <div className="absolute hidden group-hover:flex flex-wrap bg-white shadow-lg rounded p-2 z-50 bottom-full mb-1 left-0 w-32">
               {['👍', '❤️', '😂', '🎉', '🤔', '👏'].map(emoji => (
                 <button 
                   key={emoji} 
                   className="text-xl p-1 hover:bg-gray-100 rounded"
                   onClick={() => handleSendReaction(emoji)}
                 >
                   {emoji}
                 </button>
               ))}
             </div>
           </div>
           
           {/* Virtual Background Dropdown */}
           <div className="relative group flex-1">
             <button
               className="bg-blue-600 hover:bg-blue-700 text-yellow-200 text-xs px-2 py-1 rounded w-full"
             >
               Background
             </button>
             <div className="absolute hidden group-hover:flex flex-col bg-white shadow-lg rounded p-2 z-50 bottom-full mb-1 left-0 w-32">
               <button 
                 className="text-xs p-1 hover:bg-gray-100 rounded"
                 onClick={() => handleChangeBackground(null)}
               >
                 None
               </button>
               <button 
                 className="text-xs p-1 hover:bg-gray-100 rounded"
                 onClick={() => handleChangeBackground("blur")}
               >
                 Blur
               </button>
               <button 
                 className="text-xs p-1 hover:bg-gray-100 rounded"
                 onClick={() => handleChangeBackground("/backgrounds/office.jpg")}
               >
                 Office
               </button>
               <button 
                 className="text-xs p-1 hover:bg-gray-100 rounded"
                 onClick={() => handleChangeBackground("/backgrounds/beach.jpg")}
               >
                 Beach
               </button>
             </div>
           </div>
           
           {/* Admin/Host Controls */}
           {(participant.isAdmin || participant.isHost || participant.isCoHost) && (
             <>
               <button
                 onClick={handleRemove}
                 className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded flex-1"
               >
                 Remove
               </button>
               {participant.isHost && !participant.isCoHost && (
                 <button
                   onClick={handleAssignCoHost}
                   className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded flex-1"
                 >
                   Make Co-Host
                 </button>
               )}
             </>
           )}
         </div>
       )}
       
       {/* Simplified controls for large view */}
       {isLarge && (
         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
           <button
             onClick={handleMicToggle}
             className={`${participant.isMuted ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'} text-white p-2 rounded-full`}
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
             </svg>
           </button>
           <button
             onClick={handleVideoToggle}
             className={`${participant.isVideoOff ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'} text-white p-2 rounded-full`}
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
             </svg>
           </button>
           <button
             onClick={handleHandUp}
             className={`${participant.handRaised ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white p-2 rounded-full`}
           >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"></path>
             </svg>
           </button>
         </div>
       )}
     </div>
   );
 };
 
 const Meeting = () => {
   const { meetingId } = useParams<{ meetingId: string }>();
   const { user } = useAuth();
   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
   const [isCameraOn, setIsCameraOn] = useState(false);
   const [isMicOn, setIsMicOn] = useState(false);
   const [permissionsRequested, setPermissionsRequested] = useState(false);
   const [permissionsGranted, setPermissionsGranted] = useState(false);
   const videoRef = useRef<HTMLVideoElement>(null);
   const [feedback, setFeedback] = useState("");
   const [globalHandUp, setGlobalHandUp] = useState(false);
   const [meetingTitle, setMeetingTitle] = useState<string>("");
   const navigate = useNavigate();
   
   // View mode state (gallery or speaker view)
   const [viewMode, setViewMode] = useState<"gallery" | "speaker">("gallery");
   
   // Active speaker tracking
   const [activeParticipantId, setActiveParticipantId] = useState<number>(1); // Default to local user
   
   // Breakout Rooms
   const [breakoutRooms, setBreakoutRooms] = useState<{id: string; name: string; participants: number[]}[]>([]);
   const [showBreakoutRoomModal, setShowBreakoutRoomModal] = useState(false);
   const [breakoutRoomDuration, setBreakoutRoomDuration] = useState(15); // Default 15 minutes
   const [breakoutRoomCount, setBreakoutRoomCount] = useState(2); // Default 2 rooms
   const [breakoutRoomAssignmentMode, setBreakoutRoomAssignmentMode] = useState<"automatic" | "manual">("automatic");
   
   // Raised Hands Queue
   const [handRaisedQueue, setHandRaisedQueue] = useState<{participantId: number; timestamp: number}[]>([]);
   const [showHandRaisedQueue, setShowHandRaisedQueue] = useState(false);
   
   // Emoji Reactions
   const [showReactionsPanel, setShowReactionsPanel] = useState(false);
   
   // Virtual Backgrounds
   const [showVirtualBackgroundPanel, setShowVirtualBackgroundPanel] = useState(false);
   const [availableBackgrounds, setAvailableBackgrounds] = useState<{name: string; url: string | "blur" | null}[]>([
     { name: "None", url: null },
     { name: "Blur", url: "blur" },
     { name: "Office", url: "/backgrounds/office.jpg" },
     { name: "Beach", url: "/backgrounds/beach.jpg" },
     { name: "Bookshelf", url: "/backgrounds/bookshelf.jpg" },
     { name: "Mountain", url: "/backgrounds/mountain.jpg" },
   ]);
   
   // Host & Co-Host Controls
   const [showHostControlsPanel, setShowHostControlsPanel] = useState(false);
   const [muteAllOnEntry, setMuteAllOnEntry] = useState(false);
   const [disableVideoOnEntry, setDisableVideoOnEntry] = useState(false);
   const [spotlightParticipantId, setSpotlightParticipantId] = useState<number | null>(null);
   
   // Session Templates
   const [sessionTemplates, setSessionTemplates] = useState<{
     id: string;
     name: string;
     description: string;
     breakoutRooms: {id: string; name: string; participants: number[]}[];
     hostControls: {muteAllOnEntry: boolean; disableVideoOnEntry: boolean};
   }[]>([]);
   const [showSessionTemplatesPanel, setShowSessionTemplatesPanel] = useState(false);
   const [currentSessionTemplate, setCurrentSessionTemplate] = useState<string | null>(null);
   
   // Recording
   const [isRecording, setIsRecording] = useState(false);
   const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
   const [recordingConfig, setRecordingConfig] = useState({
     recordVideo: true,
     recordAudio: true,
     recordChat: true,
     recordActiveView: true, // Record what's currently visible (speaker or gallery)
     autoRecordOnStart: false,
   });
   const [recordings, setRecordings] = useState<{
     id: string;
     meetingId: string;
     startTime: number;
     endTime: number | null;
     duration: number | null;
     url: string | null;
     name: string;
     size: number | null;
   }[]>([]);
   const [showRecordingPanel, setShowRecordingPanel] = useState(false);
   
   // Meeting Persistence
   const [persistenceConfig, setPersistenceConfig] = useState({
     saveChat: true,
     saveWhiteboard: true,
     saveBreakoutRoomNotes: true,
     saveAttendeeList: true,
   });
   
   // Handler functions for new features
   
   // Breakout Room Functions
   const handleCreateBreakoutRooms = () => {
     setShowBreakoutRoomModal(true);
   };
   
   const handleCloseBreakoutRoomModal = () => {
     setShowBreakoutRoomModal(false);
   };
   
   const handleStartBreakoutRooms = () => {
     // Create breakout rooms based on count and assignment mode
     const newRooms: { id: string; name: string; participants: number[] }[] = [];
     
     for (let i = 1; i <= breakoutRoomCount; i++) {
       newRooms.push({
         id: `room-${i}-${Date.now()}`,
         name: `Room ${i}`,
         participants: []
       });
     }
     
     // If automatic assignment, distribute participants evenly
     if (breakoutRoomAssignmentMode === "automatic") {
       const participantsToAssign = participants
         .filter(p => p.id !== 1) // Exclude host
         .map(p => p.id);
       
       // Distribute participants evenly among rooms
       participantsToAssign.forEach((participantId, index) => {
         const roomIndex = index % breakoutRoomCount;
         newRooms[roomIndex].participants.push(participantId);
       });
     }
     
     setBreakoutRooms(newRooms);
     setShowBreakoutRoomModal(false);
     
     // Update participants with their breakout room assignments
     const updatedParticipants = [...participants];
     
     newRooms.forEach(room => {
       room.participants.forEach(participantId => {
         const participantIndex = updatedParticipants.findIndex(p => p.id === participantId);
         if (participantIndex !== -1) {
           updatedParticipants[participantIndex] = {
             ...updatedParticipants[participantIndex],
             breakoutRoomId: room.id
           };
         }
       });
     });
     
     setParticipants(updatedParticipants);
     
     // Start timer for breakout rooms
     showFeedback(`Breakout rooms started for ${breakoutRoomDuration} minutes`);
     
     // Set timeout to end breakout rooms
     setTimeout(() => {
       handleEndBreakoutRooms();
     }, breakoutRoomDuration * 60 * 1000);
   };
   
   const handleEndBreakoutRooms = () => {
     // End all breakout rooms and bring participants back
     const updatedParticipants = participants.map(p => ({
       ...p,
       breakoutRoomId: null
     }));
     
     setParticipants(updatedParticipants);
     setBreakoutRooms([]);
     showFeedback("Breakout rooms ended");
   };
   
   const handleSendToBreakoutRoom = (participantId: number, roomId: string) => {
     // Assign participant to a specific breakout room
     const updatedParticipants = [...participants];
     const participantIndex = updatedParticipants.findIndex(p => p.id === participantId);
     
     if (participantIndex !== -1) {
       updatedParticipants[participantIndex] = {
         ...updatedParticipants[participantIndex],
         breakoutRoomId: roomId
       };
       
       setParticipants(updatedParticipants);
       
       // Update room participants list
       const updatedRooms = [...breakoutRooms];
       const roomIndex = updatedRooms.findIndex(r => r.id === roomId);
       
       if (roomIndex !== -1) {
         if (!updatedRooms[roomIndex].participants.includes(participantId)) {
           updatedRooms[roomIndex].participants.push(participantId);
           setBreakoutRooms(updatedRooms);
         }
       }
       
       showFeedback(`Participant moved to ${breakoutRooms.find(r => r.id === roomId)?.name || roomId}`);
     }
   };
   
   const handleBroadcastToBreakoutRooms = () => {
     const message = prompt("Enter message to broadcast to all breakout rooms:");
     if (message) {
       showFeedback(`Message broadcast to all breakout rooms: ${message}`);
       // In a real implementation, this would send the message to all breakout rooms
     }
   };
   
   // Raised Hand Functions
   const handleToggleHandRaise = (participantId: number) => {
     const updatedParticipants = [...participants];
     const participantIndex = updatedParticipants.findIndex(p => p.id === participantId);
     
     if (participantIndex !== -1) {
       const wasRaised = updatedParticipants[participantIndex].handRaised;
       updatedParticipants[participantIndex] = {
         ...updatedParticipants[participantIndex],
         handRaised: !wasRaised
       };
       
       setParticipants(updatedParticipants);
       
       // Update hand raised queue
       if (!wasRaised) {
         // Add to queue
         setHandRaisedQueue(prev => [...prev, {
           participantId,
           timestamp: Date.now()
         }]);
         showFeedback(`${updatedParticipants[participantIndex].name} raised hand`);
       } else {
         // Remove from queue
         setHandRaisedQueue(prev => prev.filter(item => item.participantId !== participantId));
         showFeedback(`${updatedParticipants[participantIndex].name} lowered hand`);
       }
     }
   };
   
   const handleLowerAllHands = () => {
     const updatedParticipants = participants.map(p => ({
       ...p,
       handRaised: false
     }));
     
     setParticipants(updatedParticipants);
     setHandRaisedQueue([]);
     showFeedback("All hands lowered");
   };
   
   // Emoji Reactions Functions
   const handleSendReaction = (participantId: number, emoji: string) => {
     const updatedParticipants = [...participants];
     const participantIndex = updatedParticipants.findIndex(p => p.id === participantId);
     
     if (participantIndex !== -1) {
       const reactions = updatedParticipants[participantIndex].reactions || [];
       updatedParticipants[participantIndex] = {
         ...updatedParticipants[participantIndex],
         reactions: [...reactions, { emoji, timestamp: Date.now() }]
       };
       
       setParticipants(updatedParticipants);
     }
   };
   
   // Virtual Background Functions
   const handleChangeVirtualBackground = (participantId: number, background: string | null) => {
     const updatedParticipants = [...participants];
     const participantIndex = updatedParticipants.findIndex(p => p.id === participantId);
     
     if (participantIndex !== -1) {
       updatedParticipants[participantIndex] = {
         ...updatedParticipants[participantIndex],
         virtualBackground: background
       };
       
       setParticipants(updatedParticipants);
       showFeedback(`Background changed for ${updatedParticipants[participantIndex].name}`);
     }
   };
   
   // Host & Co-Host Control Functions
   const handleToggleMute = (participantId: number) => {
     const updatedParticipants = [...participants];
     const participantIndex = updatedParticipants.findIndex(p => p.id === participantId);
     
     if (participantIndex !== -1) {
       updatedParticipants[participantIndex] = {
         ...updatedParticipants[participantIndex],
         isMuted: !updatedParticipants[participantIndex].isMuted
       };
       
       setParticipants(updatedParticipants);
       showFeedback(`${updatedParticipants[participantIndex].isMuted ? 'Muted' : 'Unmuted'} ${updatedParticipants[participantIndex].name}`);
     }
   };
   
   const handleToggleVideo = (participantId: number) => {
     const updatedParticipants = [...participants];
     const participantIndex = updatedParticipants.findIndex(p => p.id === participantId);
     
     if (participantIndex !== -1) {
       updatedParticipants[participantIndex] = {
         ...updatedParticipants[participantIndex],
         isVideoOff: !updatedParticipants[participantIndex].isVideoOff
       };
       
       setParticipants(updatedParticipants);
       showFeedback(`${updatedParticipants[participantIndex].isVideoOff ? 'Turned off' : 'Turned on'} video for ${updatedParticipants[participantIndex].name}`);
     }
   };
   
   const handleMuteAll = (exceptHost: boolean = true) => {
     const updatedParticipants = participants.map(p => {
       if (exceptHost && p.isHost) {
         return p;
       }
       return {
         ...p,
         isMuted: true
       };
     });
     
     setParticipants(updatedParticipants);
     showFeedback("Muted all participants");
   };
   
   const handleStopAllVideos = (exceptHost: boolean = true) => {
     const updatedParticipants = participants.map(p => {
       if (exceptHost && p.isHost) {
         return p;
       }
       return {
         ...p,
         isVideoOff: true
       };
     });
     
     setParticipants(updatedParticipants);
     showFeedback("Stopped all videos");
   };
   
   const handleAssignCoHost = (participantId: number) => {
     const updatedParticipants = [...participants];
     const participantIndex = updatedParticipants.findIndex(p => p.id === participantId);
     
     if (participantIndex !== -1) {
       updatedParticipants[participantIndex] = {
         ...updatedParticipants[participantIndex],
         isCoHost: true
       };
       
       setParticipants(updatedParticipants);
       showFeedback(`${updatedParticipants[participantIndex].name} is now a co-host`);
     }
   };
   
   const handleRemoveCoHost = (participantId: number) => {
     const updatedParticipants = [...participants];
     const participantIndex = updatedParticipants.findIndex(p => p.id === participantId);
     
     if (participantIndex !== -1) {
       updatedParticipants[participantIndex] = {
         ...updatedParticipants[participantIndex],
         isCoHost: false
       };
       
       setParticipants(updatedParticipants);
       showFeedback(`${updatedParticipants[participantIndex].name} is no longer a co-host`);
     }
   };
   
   const handleRemoveParticipant = (participantId: number) => {
     const participantToRemove = participants.find(p => p.id === participantId);
     
     if (participantToRemove && window.confirm(`Are you sure you want to remove ${participantToRemove.name} from the meeting?`)) {
       setParticipants(prev => prev.filter(p => p.id !== participantId));
       showFeedback(`${participantToRemove.name} has been removed from the meeting`);
     }
   };
   
   const handleSpotlightParticipant = (participantId: number) => {
     setSpotlightParticipantId(participantId === spotlightParticipantId ? null : participantId);
     const participant = participants.find(p => p.id === participantId);
     
     if (participant) {
       showFeedback(participantId === spotlightParticipantId 
         ? `Spotlight removed from ${participant.name}` 
         : `${participant.name} is now spotlighted`);
     }
   };
   
   // Session Templates Functions
   const handleSaveSessionTemplate = () => {
     const templateName = prompt("Enter a name for this session template:");
     if (templateName) {
       const templateDescription = prompt("Enter a description (optional):");
       
       const newTemplate = {
         id: `template-${Date.now()}`,
         name: templateName,
         description: templateDescription || "",
         breakoutRooms: breakoutRooms,
         hostControls: {
           muteAllOnEntry,
           disableVideoOnEntry
         }
       };
       
       setSessionTemplates(prev => [...prev, newTemplate]);
       setCurrentSessionTemplate(newTemplate.id);
       showFeedback(`Session template "${templateName}" saved`);
     }
   };
   
   const handleLoadSessionTemplate = (templateId: string) => {
     const template = sessionTemplates.find(t => t.id === templateId);
     
     if (template) {
       // Apply template settings
       setBreakoutRooms(template.breakoutRooms);
       setMuteAllOnEntry(template.hostControls.muteAllOnEntry);
       setDisableVideoOnEntry(template.hostControls.disableVideoOnEntry);
       setCurrentSessionTemplate(templateId);
       
       showFeedback(`Session template "${template.name}" loaded`);
     }
   };
   
   // Recording Functions
   const handleToggleRecording = () => {
     if (!isRecording) {
       // Start recording
       setIsRecording(true);
       const startTime = Date.now();
       setRecordingStartTime(startTime);
       
       // Create a new recording entry
       const newRecording = {
         id: `recording-${startTime}`,
         meetingId: meetingId || "",
         startTime,
         endTime: null,
         duration: null,
         url: null,
         name: `${meetingTitle} - ${new Date(startTime).toLocaleString()}`,
         size: null
       };
       
       setRecordings(prev => [...prev, newRecording]);
       showFeedback("Recording started");
     } else {
       // Stop recording
       setIsRecording(false);
       
       if (recordingStartTime) {
         const endTime = Date.now();
         const duration = endTime - recordingStartTime;
         
         // Update the recording entry
         setRecordings(prev => prev.map(rec => {
           if (rec.startTime === recordingStartTime) {
             return {
               ...rec,
               endTime,
               duration,
               url: `/recordings/${rec.id}.mp4`, // Simulated URL
               size: Math.floor(Math.random() * 100) + 50 // Simulated size in MB
             };
           }
           return rec;
         }));
         
         setRecordingStartTime(null);
         showFeedback(`Recording stopped (${Math.floor(duration / 60000)} min ${Math.floor((duration % 60000) / 1000)} sec)`);
       }
     }
   };
   
   // We'll get the active participant later after participants state is initialized
   
   // Get meeting title from localStorage
   useEffect(() => {
     const storedTitle = localStorage.getItem('currentMeetingTitle');
     if (storedTitle) {
       setMeetingTitle(storedTitle);
     } else {
       // If no title is found, check if this is a scheduled meeting
       const savedMeetings = localStorage.getItem('scheduledMeetings');
       if (savedMeetings && meetingId) {
         const meetings = JSON.parse(savedMeetings);
         const currentMeeting = meetings.find((m: any) => m.id === meetingId);
         if (currentMeeting) {
           setMeetingTitle(currentMeeting.title);
         } else {
           setMeetingTitle(`Meeting ${meetingId}`);
         }
       } else {
         setMeetingTitle(`Meeting ${meetingId}`);
       }
     }
   }, [meetingId]);
   
   // Create current user from auth context
   const [currentUser, setCurrentUser] = useState<Participant>({
     id: 1,
     name: user?.name || "Guest",
     isAdmin: true,
     isHost: true,
     videoStream: null
   });
   
   // Create participants list with current user
   const [participants, setParticipants] = useState<Participant[]>([
     currentUser,
     ...dummyParticipants
   ]);

   // Helper to show feedback messages for 3 seconds.
   const showFeedback = (msg: string) => {
     setFeedback(msg);
     setTimeout(() => setFeedback(""), 3000);
   };
   
   // Update current user when auth user changes
   useEffect(() => {
     if (user) {
       const updatedUser = {
         ...currentUser,
         name: user.name
       };
       setCurrentUser(updatedUser);
       
       // Update the participants list with the new current user
       setParticipants(prev => [
         updatedUser,
         ...prev.filter(p => p.id !== 1)
       ]);
     }
   }, [user]);

   // Available video quality options
   const videoQualityOptions = [
     { label: "Low (360p)", value: "360p", constraints: { width: 640, height: 360 } },
     { label: "Standard (480p)", value: "480p", constraints: { width: 854, height: 480 } },
     { label: "HD (720p)", value: "720p", constraints: { width: 1280, height: 720 } },
     { label: "Full HD (1080p)", value: "1080p", constraints: { width: 1920, height: 1080 } }
   ];
   
   // State for video quality
   const [videoQuality, setVideoQuality] = useState("720p"); // Default to HD
   
   // Function to get video constraints based on selected quality
   const getVideoConstraints = () => {
     const quality = videoQualityOptions.find(option => option.value === videoQuality);
     return {
       facingMode: "user",
       width: { ideal: quality?.constraints.width || 1280 },
       height: { ideal: quality?.constraints.height || 720 }
     };
   };
   
   // Function to request camera and microphone permissions with quality settings
   const requestMediaPermissions = async () => {
     setPermissionsRequested(true);
     try {
       // Get video constraints based on selected quality
       const videoConstraints = getVideoConstraints();
       
       // Request media with high-quality audio and selected video quality
       const stream = await navigator.mediaDevices.getUserMedia({
         video: videoConstraints,
         audio: {
           echoCancellation: true,
           noiseSuppression: true,
           autoGainControl: true,
           sampleRate: 48000, // High-quality audio (CD quality is 44100)
           channelCount: 2 // Stereo
         }
       });
       
       console.log("Media stream obtained:", stream);
       console.log("Video tracks:", stream.getVideoTracks());
       console.log("Audio tracks:", stream.getAudioTracks());
       
       // Log video track settings
       const videoTrack = stream.getVideoTracks()[0];
       if (videoTrack) {
         const settings = videoTrack.getSettings();
         console.log("Video settings:", settings);
         showFeedback(`Video quality: ${settings.width}x${settings.height}`);
       }
       
       setLocalStream(stream);
       setPermissionsGranted(true);
       setIsCameraOn(true);
       setIsMicOn(true);
       
       // Update current user with video stream
       const updatedUser = {
         ...currentUser,
         videoStream: stream
       };
       setCurrentUser(updatedUser);
       
       // Update the participants list with the new current user
       setParticipants(prev => [
         updatedUser,
         ...prev.filter(p => p.id !== 1)
       ]);
       
       showFeedback("Camera and microphone access granted!");
     } catch (error) {
       console.error("Error accessing media devices.", error);
       showFeedback("Failed to access camera or microphone. Please check your permissions.");
       setPermissionsGranted(false);
     }
   };
   
   // Function to change video quality
   const changeVideoQuality = async (quality: string) => {
     if (!localStream) {
       showFeedback("No active stream. Please enable your camera first.");
       return;
     }
     
     try {
       // Stop current tracks
       localStream.getTracks().forEach(track => track.stop());
       
       // Set new quality
       setVideoQuality(quality);
       
       // Request new stream with updated quality
       await requestMediaPermissions();
       
       showFeedback(`Video quality changed to ${quality}`);
     } catch (error) {
       console.error("Error changing video quality:", error);
       showFeedback("Failed to change video quality");
     }
   };
 
   // Global Admin / Host Control Handlers
   const handleEndMeeting = () => {
     showFeedback("End Meeting command executed!");
     navigate("/dashboard");
   };
   const handleAnnotations = () => {
     const language = window.prompt("Enter annotation language (e.g., English, Spanish, French):", "English");
     if (language) {
       showFeedback(`Annotations in ${language} executed!`);
       console.log(`Annotations set to: ${language}`);
     }
   };
   const handleYouTubeShare = () => {
     const youtubeLink = `https://youtube.com/share?meeting=${meetingId}`;
     showFeedback("YouTube Share command executed!");
     window.prompt("Copy and share this YouTube link:", youtubeLink);
   };
   const handleGlobalHandUp = () => {
     setGlobalHandUp(!globalHandUp);
     showFeedback("Global Hand Up toggled!");
   };
 
   // Toggle Camera On/Off (for the local user)
   const handleToggleCamera = () => {
     if (localStream) {
       localStream.getVideoTracks().forEach((track) => {
         track.enabled = !isCameraOn;
       });
       setIsCameraOn(!isCameraOn);
       showFeedback(`Camera turned ${!isCameraOn ? "On" : "Off"}`);
       console.log(`Camera toggled: ${!isCameraOn ? "On" : "Off"}`);
     } else if (!permissionsRequested) {
       requestMediaPermissions();
     } else {
       showFeedback("No camera stream available. Please check your permissions.");
     }
   };
   
   // Toggle Microphone On/Off (for the local user)
   const handleToggleMic = () => {
     if (localStream) {
       localStream.getAudioTracks().forEach((track) => {
         track.enabled = !isMicOn;
       });
       setIsMicOn(!isMicOn);
       showFeedback(`Microphone turned ${!isMicOn ? "On" : "Off"}`);
       console.log(`Microphone toggled: ${!isMicOn ? "On" : "Off"}`);
     } else if (!permissionsRequested) {
       requestMediaPermissions();
     } else {
       showFeedback("No microphone stream available. Please check your permissions.");
     }
   };
 
   return (
     <div className="min-h-screen bg-gray-100 p-6 relative">
       <header className="mb-6">
         <h1 className="text-4xl font-bold text-blue-900 text-center">
           {meetingTitle}
         </h1>
         <p className="text-center text-blue-600 mt-2">
           Meeting ID: {meetingId} | Host: {user?.name || "Guest"}
         </p>
       </header>

       {/* Camera and Microphone Permission Request */}
       {!permissionsGranted && (
         <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
           <h2 className="text-xl font-semibold text-yellow-800 mb-2">
             Camera and Microphone Access Required
           </h2>
           <p className="text-yellow-700 mb-4">
             To participate in this meeting, please allow access to your camera and microphone.
           </p>
           <button
             onClick={requestMediaPermissions}
             className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium"
           >
             {permissionsRequested ? "Retry Access Request" : "Allow Access"}
           </button>
         </div>
       )}

       {/* Local Controls Panel (visible to all participants) */}
       <div className="mb-6 flex flex-col items-center gap-4">
         <h2 className="text-xl font-semibold">My Controls</h2>
         <div className="flex flex-wrap justify-center gap-4">
           <button
             onClick={handleToggleCamera}
             className={`${isCameraOn ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-600 hover:bg-gray-700"} text-white text-sm px-4 py-2 rounded`}
           >
             {isCameraOn ? "Camera Off" : "Camera On"}
           </button>
           <button
             onClick={handleToggleMic}
             className={`${isMicOn ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600 hover:bg-gray-700"} text-white text-sm px-4 py-2 rounded`}
           >
             {isMicOn ? "Mic Off" : "Mic On"}
           </button>
           
           {/* Device selection dropdown */}
           <div className="relative">
             <button
               onClick={() => document.getElementById('videoQualityDropdown')?.classList.toggle('hidden')}
               className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded flex items-center"
             >
               <span>Video Quality</span>
               <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
               </svg>
             </button>
             <div id="videoQualityDropdown" className="absolute z-10 hidden mt-2 w-48 bg-white rounded-md shadow-lg py-1">
               {videoQualityOptions.map(option => (
                 <button
                   key={option.value}
                   onClick={() => {
                     changeVideoQuality(option.value);
                     document.getElementById('videoQualityDropdown')?.classList.add('hidden');
                   }}
                   className={`block w-full text-left px-4 py-2 text-sm ${videoQuality === option.value ? 'bg-indigo-100 text-indigo-900' : 'text-gray-700'} hover:bg-indigo-50`}
                 >
                   {option.label}
                 </button>
               ))}
             </div>
           </div>
         </div>
         
         {/* Current video quality indicator */}
         {isCameraOn && (
           <div className="mt-2 text-sm text-gray-600">
             Current quality: {videoQualityOptions.find(option => option.value === videoQuality)?.label || videoQuality}
           </div>
         )}
         
         {feedback && (
           <div className="mt-4 text-green-700 font-semibold">{feedback}</div>
         )}
       </div>

       {/* Host Controls Panel (for the host who controls everything) */}
       {currentUser.isHost && (
         <div className="mb-6 flex flex-col items-center gap-4 border p-4 rounded shadow-lg">
           <h2 className="text-xl font-bold text-red-700">Host Controls</h2>
           <div className="flex flex-wrap justify-center gap-4">
             <button
               onClick={handleEndMeeting}
               className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded"
             >
               End Meeting
             </button>
             <button
               onClick={handleAnnotations}
               className="bg-blue-600 hover:bg-blue-700 text-yellow-200 text-sm px-4 py-2 rounded"
             >
               Annotations
             </button>
             <button
               onClick={handleYouTubeShare}
               className="bg-blue-600 hover:bg-blue-700 text-yellow-200 text-sm px-4 py-2 rounded"
             >
               YouTube Share
             </button>
             <button
               onClick={handleGlobalHandUp}
               className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 text-sm px-4 py-2 rounded"
             >
               Hand Up
             </button>
           </div>
         </div>
       )}

       {/* Global Hand Up Icon Overlay */}
       {globalHandUp && (
         <div className="absolute top-4 right-4 text-4xl" title="Global Hand Up">
           ✋
         </div>
       )}

       {/* View Layout Controls */}
       <div className="mb-6 flex justify-center">
         <div className="inline-flex rounded-md shadow-sm" role="group">
           <button
             type="button"
             onClick={() => setViewMode("gallery")}
             className={`px-4 py-2 text-sm font-medium ${
               viewMode === "gallery" 
                 ? "bg-blue-600 text-white" 
                 : "bg-white text-gray-700 hover:bg-gray-50"
             } border border-gray-200 rounded-l-lg`}
           >
             Gallery View
           </button>
           <button
             type="button"
             onClick={() => setViewMode("speaker")}
             className={`px-4 py-2 text-sm font-medium ${
               viewMode === "speaker" 
                 ? "bg-blue-600 text-white" 
                 : "bg-white text-gray-700 hover:bg-gray-50"
             } border border-gray-200 rounded-r-lg`}
           >
             Speaker View
           </button>
         </div>
       </div>
       
       {/* Participants Grid - Gallery View */}
       {viewMode === "gallery" && (
         <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {participants.map((participant) => (
             <ParticipantCard 
               key={participant.id} 
               participant={participant} 
               isActive={activeParticipantId === participant.id}
               onActiveSpeakerChange={() => setActiveParticipantId(participant.id)}
             />
           ))}
         </main>
       )}
       
       {/* Participants Grid - Speaker View */}
       {viewMode === "speaker" && (
         <main className="flex flex-col space-y-6">
           {/* Main speaker */}
           <div className="w-full">
             {activeParticipantId ? (
               <div className="aspect-video w-full max-h-[60vh] bg-blue-900 rounded-lg overflow-hidden">
                 {participants.find(p => p.id === activeParticipantId) && (
                   <ParticipantCard 
                     participant={participants.find(p => p.id === activeParticipantId)!} 
                     isActive={true}
                     isLarge={true}
                     onActiveSpeakerChange={() => {}}
                   />
                 )}
               </div>
             ) : (
               <div className="aspect-video w-full max-h-[60vh] bg-blue-900 rounded-lg flex items-center justify-center">
                 <p className="text-white text-xl">No active speaker</p>
               </div>
             )}
           </div>
           
           {/* Thumbnails of other participants */}
           <div className="flex overflow-x-auto gap-2 pb-2">
             {participants
               .filter(p => p.id !== activeParticipantId)
               .map((participant) => (
                 <div 
                   key={participant.id} 
                   className="flex-shrink-0 w-40"
                   onClick={() => setActiveParticipantId(participant.id)}
                 >
                   <ParticipantCard 
                     participant={participant} 
                     isActive={false}
                     isThumbnail={true}
                     onActiveSpeakerChange={() => setActiveParticipantId(participant.id)}
                   />
                 </div>
               ))}
           </div>
         </main>
       )}
       <footer className="mt-8 text-center text-sm text-blue-800">
         Meeting Controls &middot; EL:MEET © 2024
       </footer>
     </div>
   );
 };
 
 export default Meeting;