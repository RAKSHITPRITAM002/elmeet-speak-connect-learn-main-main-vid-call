import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VideoConferenceNew from '../components/meeting/VideoConferenceNew';
import WhiteboardNew from '../components/meeting/WhiteboardNew';
import LanguageTeachingTools from '../components/meeting/LanguageTeachingTools';
import { useMeetingService } from '../services/MeetingService';
import { useBreakoutRooms } from '../services/BreakoutRoomService';
import { useChat } from '../services/ChatService';
import { useRecording } from '../services/RecordingService';

interface Participant {
  id: string;
  name: string;
  isHost?: boolean;
  isCoHost?: boolean;
  videoStream?: MediaStream | null;
  handRaised?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  breakoutRoomId?: string | null;
  virtualBackground?: string | null;
  reactions?: { emoji: string; timestamp: number }[];
}

const MeetingNew: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Services
  const meetingService = useMeetingService();
  const breakoutRoomService = useBreakoutRooms();
  const chatService = useChat();
  const recordingService = useRecording();
  
  // State
  const [meeting, setMeeting] = useState<any | null>(null);
  const [meetingTitle, setMeetingTitle] = useState<string>('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeView, setActiveView] = useState<'video' | 'whiteboard' | 'language'>('video');
  const [isHost, setIsHost] = useState(false);
  const [isCoHost, setIsCoHost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [chatState, setChatState] = useState(chatService.initializeChat());
  const [breakoutRoomState, setBreakoutRoomState] = useState(breakoutRoomService.initializeBreakoutRooms());
  const [recordingState, setRecordingState] = useState(recordingService.initializeRecording());
  
  // Get meeting title from localStorage
  useEffect(() => {
    const title = localStorage.getItem('currentMeetingTitle');
    if (title) {
      setMeetingTitle(title);
    }
  }, []);
  
  // Initialize meeting
  useEffect(() => {
    const initializeMeeting = async () => {
      if (!meetingId) {
        setError('Invalid meeting ID');
        return;
      }
      
      try {
        // Get meeting details
        const meetingDetails = await meetingService.getMeeting(meetingId);
        
        if (!meetingDetails) {
          setError('Meeting not found');
          return;
        }
        
        setMeeting(meetingDetails);
        
        // Check if current user is host or co-host
        const isUserHost = meetingDetails.hostId === user?.email;
        setIsHost(isUserHost);
        
        // Join the meeting
        if (user?.email) {
          await meetingService.joinMeeting(meetingId, user.email);
        }
        
        // Show feedback about camera and microphone permissions
        showFeedback('Please allow camera and microphone access to participate fully in the meeting');
        
        // Initialize participants
        const initialParticipants: Participant[] = [
          {
            id: user?.email || 'anonymous',
            name: user?.name || 'You',
            isHost: isUserHost,
            isCoHost: false,
            handRaised: false,
            isMuted: false,
            isVideoOff: false,
            breakoutRoomId: null,
            virtualBackground: null,
            reactions: [],
          },
        ];
        
        // Add dummy participants for testing
        if (process.env.NODE_ENV === 'development') {
          initialParticipants.push(
            {
              id: 'participant-1',
              name: 'Alice',
              isCoHost: true,
              handRaised: false,
              isMuted: true,
              isVideoOff: false,
              breakoutRoomId: null,
              virtualBackground: null,
              reactions: [],
            },
            {
              id: 'participant-2',
              name: 'Bob',
              handRaised: true,
              isMuted: false,
              isVideoOff: true,
              breakoutRoomId: null,
              virtualBackground: null,
              reactions: [],
            },
            {
              id: 'participant-3',
              name: 'Charlie',
              handRaised: false,
              isMuted: false,
              isVideoOff: false,
              breakoutRoomId: null,
              virtualBackground: 'blur',
              reactions: [],
            }
          );
        }
        
        setParticipants(initialParticipants);
        
        // Add system message to chat
        const updatedChatState = chatService.addSystemMessage(
          chatState,
          `You joined the meeting: ${meetingDetails.title}`
        );
        setChatState(updatedChatState);
        
        // Show feedback
        showFeedback('Connected to meeting');
      } catch (err) {
        console.error('Error initializing meeting:', err);
        setError('Failed to initialize meeting');
      }
    };
    
    initializeMeeting();
    
    // Clean up when leaving the meeting
    return () => {
      if (meetingId && user?.email) {
        meetingService.leaveMeeting(meetingId, user.email);
      }
    };
  }, [meetingId, user]);
  
  // Handle errors
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    
    // Clear error after 5 seconds
    setTimeout(() => {
      setError(null);
    }, 5000);
  };
  
  // Show feedback
  const showFeedback = (message: string) => {
    setFeedback(message);
    
    // Clear feedback after 3 seconds
    setTimeout(() => {
      setFeedback(null);
    }, 3000);
  };
  
  // Handle leaving the meeting
  const handleLeaveMeeting = async () => {
    try {
      // Stop recording if active
      if (recordingState.isRecording) {
        const updatedRecordingState = await recordingService.stopRecording(recordingState);
        setRecordingState(updatedRecordingState);
      }
      
      // Leave the meeting
      if (meetingId && user?.email) {
        await meetingService.leaveMeeting(meetingId, user.email);
      }
      
      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error leaving meeting:', err);
      handleError('Failed to leave meeting');
    }
  };
  
  // Handle ending the meeting (host only)
  const handleEndMeeting = async () => {
    if (!isHost) return;
    
    try {
      // End the meeting
      if (meetingId) {
        await meetingService.endMeeting(meetingId);
      }
      
      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error ending meeting:', err);
      handleError('Failed to end meeting');
    }
  };
  
  // Handle sending a chat message
  const handleSendMessage = (content: string, isPrivate: boolean = false, recipientId?: string) => {
    if (!content.trim()) return;
    
    try {
      const updatedChatState = chatService.sendTextMessage(
        chatState,
        user?.email || 'anonymous',
        user?.name || 'You',
        content,
        isPrivate,
        recipientId,
        participants.find(p => p.id === recipientId)?.name
      );
      
      setChatState(updatedChatState);
    } catch (err) {
      console.error('Error sending message:', err);
      handleError('Failed to send message');
    }
  };
  
  // Handle creating breakout rooms
  const handleCreateBreakoutRooms = (count: number, duration: number) => {
    try {
      const updatedBreakoutRoomState = breakoutRoomService.createBreakoutRooms(
        breakoutRoomState,
        count,
        duration,
        participants,
        'automatic'
      );
      
      setBreakoutRoomState(updatedBreakoutRoomState);
      showFeedback(`Created ${count} breakout rooms for ${duration} minutes`);
    } catch (err) {
      console.error('Error creating breakout rooms:', err);
      handleError('Failed to create breakout rooms');
    }
  };
  
  // Handle ending breakout rooms
  const handleEndBreakoutRooms = () => {
    try {
      const updatedBreakoutRoomState = breakoutRoomService.endAllRooms(breakoutRoomState);
      setBreakoutRoomState(updatedBreakoutRoomState);
      showFeedback('Ended all breakout rooms');
    } catch (err) {
      console.error('Error ending breakout rooms:', err);
      handleError('Failed to end breakout rooms');
    }
  };
  
  // Handle starting recording
  const handleStartRecording = async (stream: MediaStream) => {
    try {
      if (!meetingId) return;
      
      const updatedRecordingState = recordingService.startRecording(
        recordingState,
        meetingId,
        stream
      );
      
      setRecordingState(updatedRecordingState);
      showFeedback('Recording started');
    } catch (err) {
      console.error('Error starting recording:', err);
      handleError('Failed to start recording');
    }
  };
  
  // Handle stopping recording
  const handleStopRecording = async () => {
    try {
      const updatedRecordingState = await recordingService.stopRecording(recordingState);
      setRecordingState(updatedRecordingState);
      showFeedback('Recording stopped');
    } catch (err) {
      console.error('Error stopping recording:', err);
      handleError('Failed to stop recording');
    }
  };
  
  return (
    <div className="meeting-page min-h-screen bg-gray-100 flex flex-col">
      {/* Header - Responsive for mobile */}
      <header className="bg-blue-600 text-white p-2 sm:p-4 shadow-md">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="mb-2 sm:mb-0 text-center sm:text-left">
            <h1 className="text-lg sm:text-xl font-bold">{meeting?.title || meetingTitle || 'Meeting'}</h1>
            <p className="text-xs sm:text-sm opacity-80">Meeting ID: {meetingId}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:space-x-4 w-full sm:w-auto">
            {/* View switcher - Responsive */}
            <div className="view-switcher bg-blue-700 rounded-lg p-1 flex w-full sm:w-auto overflow-x-auto">
              <button
                className={`px-2 sm:px-3 py-1 rounded-md text-sm whitespace-nowrap ${activeView === 'video' ? 'bg-white text-blue-700' : 'text-white hover:bg-blue-800'}`}
                onClick={() => setActiveView('video')}
              >
                Video
              </button>
              <button
                className={`px-2 sm:px-3 py-1 rounded-md text-sm whitespace-nowrap ${activeView === 'whiteboard' ? 'bg-white text-blue-700' : 'text-white hover:bg-blue-800'}`}
                onClick={() => setActiveView('whiteboard')}
              >
                Whiteboard
              </button>
              <button
                className={`px-2 sm:px-3 py-1 rounded-md text-sm whitespace-nowrap ${activeView === 'language' ? 'bg-white text-blue-700' : 'text-white hover:bg-blue-800'}`}
                onClick={() => setActiveView('language')}
              >
                Language
              </button>
            </div>
            
            {/* Leave/End meeting button */}
            {isHost ? (
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-md text-sm w-full sm:w-auto"
                onClick={handleEndMeeting}
              >
                End Meeting
              </button>
            ) : (
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-md text-sm w-full sm:w-auto"
                onClick={handleLeaveMeeting}
              >
                Leave Meeting
              </button>
            )}
          </div>
        </div>
      </header>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}
      
      {/* Feedback message */}
      {feedback && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{feedback}</span>
        </div>
      )}
      
      {/* Main content - Responsive */}
      <main className="flex-1 container mx-auto p-2 sm:p-4">
        {/* Active view */}
        <div className="bg-white rounded-lg shadow-lg p-2 sm:p-4 mb-2 sm:mb-4 h-[calc(100vh-10rem)] sm:h-[calc(100vh-12rem)]">
          {activeView === 'video' && (
            <VideoConferenceNew
              meetingId={meetingId || ''}
              onError={handleError}
            />
          )}
          
          {activeView === 'whiteboard' && (
            <WhiteboardNew
              isHost={isHost}
              onError={handleError}
            />
          )}
          
          {activeView === 'language' && (
            <LanguageTeachingTools
              isHost={isHost}
              participants={participants.map(p => ({ id: p.id, name: p.name }))}
              onError={handleError}
            />
          )}
        </div>
        
        {/* Controls and info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Participants */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-lg font-medium mb-2">Participants ({participants.length})</h2>
            <div className="max-h-60 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {participants.map(participant => (
                  <li key={participant.id} className="py-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-2">
                        {participant.name.charAt(0)}
                      </div>
                      <span>
                        {participant.name}
                        {participant.isHost && <span className="ml-1 text-xs bg-blue-600 text-white px-1 rounded">Host</span>}
                        {participant.isCoHost && <span className="ml-1 text-xs bg-purple-600 text-white px-1 rounded">Co-Host</span>}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      {participant.handRaised && (
                        <span className="text-yellow-500" title="Hand Raised">✋</span>
                      )}
                      {participant.isMuted && (
                        <span className="text-red-500" title="Muted">🔇</span>
                      )}
                      {participant.isVideoOff && (
                        <span className="text-red-500" title="Video Off">📵</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Chat */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-lg font-medium mb-2">Chat</h2>
            <div className="h-60 flex flex-col">
              <div className="flex-1 overflow-y-auto mb-2">
                <ul className="space-y-2">
                  {chatState.messages.map(message => (
                    <li key={message.id} className={`p-2 rounded ${message.type === 'system' ? 'bg-gray-100 text-gray-700' : message.senderId === (user?.email || 'anonymous') ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {message.type === 'system' ? (
                        <div className="text-sm italic">{message.content}</div>
                      ) : (
                        <>
                          <div className="font-medium text-sm">
                            {message.senderName}
                            {message.isPrivate && <span className="ml-1 text-xs text-gray-500">(private)</span>}
                          </div>
                          <div>{message.content}</div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
                    if (input.value) {
                      handleSendMessage(input.value);
                      input.value = '';
                    }
                  }}
                  className="flex"
                >
                  <input
                    type="text"
                    name="message"
                    className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Type a message..."
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
          
          {/* Meeting info */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-lg font-medium mb-2">Meeting Info</h2>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 text-green-600">Active</span>
              </div>
              <div>
                <span className="text-gray-600">Duration:</span>
                <span className="ml-2">00:45:12</span>
              </div>
              <div>
                <span className="text-gray-600">Host:</span>
                <span className="ml-2">{participants.find(p => p.isHost)?.name || 'Unknown'}</span>
              </div>
              
              {/* Host controls */}
              {isHost && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Host Controls</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm"
                      onClick={() => handleCreateBreakoutRooms(2, 15)}
                    >
                      Create Breakout Rooms
                    </button>
                    
                    {breakoutRoomState.isActive && (
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                        onClick={handleEndBreakoutRooms}
                      >
                        End Breakout Rooms
                      </button>
                    )}
                    
                    {!recordingState.isRecording ? (
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                        onClick={() => {
                          // In a real implementation, you would get the actual stream
                          const dummyStream = new MediaStream();
                          handleStartRecording(dummyStream);
                        }}
                      >
                        Start Recording
                      </button>
                    ) : (
                      <button
                        className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-sm"
                        onClick={handleStopRecording}
                      >
                        Stop Recording
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MeetingNew;