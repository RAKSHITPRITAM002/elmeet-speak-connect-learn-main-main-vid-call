import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VideoConferenceEnhanced } from '@/components/meeting';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Copy, Share2 } from 'lucide-react';

const MeetingEnhanced: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [meetingTitle, setMeetingTitle] = useState<string>('');
  
  // Get meeting title from localStorage
  useEffect(() => {
    const title = localStorage.getItem('currentMeetingTitle');
    if (title) {
      setMeetingTitle(title);
    }
  }, []);
  
  // Handle errors from the video conference component
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    toast({
      title: 'Meeting Error',
      description: errorMessage,
      variant: 'destructive',
    });
  };
  
  // Handle copying meeting link
  const copyMeetingLink = () => {
    const link = `${window.location.origin}/meeting-enhanced/${meetingId}`;
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: 'Link Copied',
        description: 'Meeting link copied to clipboard',
      });
    });
  };
  
  // Handle leaving the meeting
  const leaveMeeting = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={leaveMeeting}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-semibold">
            {meetingTitle ? meetingTitle : 'Meeting'} 
            <span className="text-sm ml-2 text-gray-400">ID: {meetingId}</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyMeetingLink}>
            <Copy size={16} className="mr-2" />
            Copy Link
          </Button>
          <Button variant="outline" size="sm">
            <Share2 size={16} className="mr-2" />
            Share
          </Button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1">
        {meetingId ? (
          <VideoConferenceEnhanced 
            meetingId={meetingId} 
            onError={handleError}
            isHost={true}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Invalid Meeting ID</h2>
              <p className="mb-4">The meeting ID is missing or invalid.</p>
              <Button onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MeetingEnhanced;