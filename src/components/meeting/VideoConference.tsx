import React, { useEffect, useRef, useState } from "react";

interface VideoConferenceProps {
  meetingId: string;
}

const VideoConference: React.FC<VideoConferenceProps> = ({ meetingId }) => {
  // Refs for local and remote video elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  useEffect(() => {
    // TODO: Initialize your WebRTC connection here using mediasoup, LiveKit, etc.
    // For now, simply log the meetingId
    console.log("Initializing WebRTC for meeting:", meetingId);
  }, [meetingId]);

  return (
    <section className="mb-8">
      <h2 className="text-2xl mb-2">Video Conference</h2>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <video ref={localVideoRef} autoPlay muted className="w-1/2 border rounded" />
          <video ref={remoteVideoRef} autoPlay className="w-1/2 border rounded" />
        </div>
        <div className="flex gap-4">
          <button 
            className="px-4 py-2 bg-gray-800 text-white rounded"
            onClick={() => setMuted(!muted)}
          >
            {muted ? "Unmute" : "Mute"}
          </button>
          <button 
            className="px-4 py-2 bg-gray-800 text-white rounded"
            onClick={() => setVideoOff(!videoOff)}
          >
            {videoOff ? "Start Video" : "Stop Video"}
          </button>
          {/* Device selection and other controls can be added here */}
        </div>
      </div>
    </section>
  );
};

export default VideoConference;