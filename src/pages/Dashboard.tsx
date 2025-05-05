import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
// Assuming you have your own Button and Input components; adjust imports accordingly.
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../contexts/AuthContext";

// Interface for scheduled meetings
interface ScheduledMeeting {
  id: string;
  title: string;
  dateTime: string;
  url: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [instantMeetingTitle, setInstantMeetingTitle] = useState("");
  const [scheduledMeetingTitle, setScheduledMeetingTitle] = useState("");
  const [instantMeetingURL, setInstantMeetingURL] = useState("");
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [scheduledMeetingURL, setScheduledMeetingURL] = useState("");
  const [lobbyActive, setLobbyActive] = useState(false);
  const [scheduledMeetings, setScheduledMeetings] = useState<ScheduledMeeting[]>([]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Load scheduled meetings from localStorage on component mount
  useEffect(() => {
    const savedMeetings = localStorage.getItem('scheduledMeetings');
    if (savedMeetings) {
      setScheduledMeetings(JSON.parse(savedMeetings));
    }
  }, []);

  // Dummy participant list — replace with real data as needed.
  const [participants] = useState([
    { id: 1, name: "Alice", connected: true },
    { id: 2, name: "Bob", connected: false },
    { id: 3, name: "Charlie", connected: true },
  ]);

  const generateUniqueID = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  const handleInstantMeeting = (useNewUI = false) => {
    if (!instantMeetingTitle) {
      alert("Please enter a meeting title");
      return;
    }
    const meetingId = generateUniqueID();
    const url = `${window.location.origin}/meeting${useNewUI ? '-new' : ''}/${meetingId}`;
    setInstantMeetingURL(url);
    setLobbyActive(true);
    
    // Store meeting title in localStorage for use in the meeting page
    localStorage.setItem('currentMeetingTitle', instantMeetingTitle);
    
    // Redirect to the meeting page
    navigate(`/meeting${useNewUI ? '-new' : ''}/${meetingId}`);
  };

  const handleScheduleMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledMeetingTitle || !scheduledDateTime) {
      alert("Please enter a meeting title and select a date/time");
      return;
    }
    
    const meetingId = generateUniqueID();
    const url = `${window.location.origin}/meeting/${meetingId}`;
    setScheduledMeetingURL(url);
    
    // Create new scheduled meeting
    const newMeeting: ScheduledMeeting = {
      id: meetingId,
      title: scheduledMeetingTitle,
      dateTime: scheduledDateTime,
      url: url
    };
    
    // Add to scheduled meetings list
    const updatedMeetings = [...scheduledMeetings, newMeeting];
    setScheduledMeetings(updatedMeetings);
    
    // Save to localStorage
    localStorage.setItem('scheduledMeetings', JSON.stringify(updatedMeetings));
    
    alert(`Meeting "${scheduledMeetingTitle}" scheduled for ${scheduledDateTime}. Meeting URL: ${url}`);
    
    // Clear form
    setScheduledMeetingTitle("");
    setScheduledDateTime("");
  };

  // If not authenticated, show loading
  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {/* Instant Meeting Creation */}
        <section className="mb-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-2xl mb-4 text-blue-800">Start an Instant Meeting</h2>
          <div className="mb-4">
            <Input
              value={instantMeetingTitle}
              onChange={(e) => setInstantMeetingTitle(e.target.value)}
              placeholder="Enter meeting title"
              className="mb-4 w-full"
            />
            <div className="flex flex-wrap gap-2">
              {/* Only keep the Enhanced Meeting and Meeting with Setup options */}
              <Button 
                onClick={() => {
                  const meetingId = generateUniqueID();
                  const url = `/meeting-enhanced/${meetingId}`;
                  setInstantMeetingURL(`${window.location.origin}${url}`);
                  // Store meeting title in localStorage for use in the meeting page
                  localStorage.setItem('currentMeetingTitle', instantMeetingTitle || 'Enhanced Meeting');
                  window.open(url, '_blank');
                }} 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 font-bold shadow-lg rounded-md transform transition-transform hover:scale-105"
              >
                Start Enhanced Meeting
              </Button>
              <Button 
                onClick={() => {
                  const meetingId = generateUniqueID();
                  const url = `/meeting-prejoin/${meetingId}`;
                  setInstantMeetingURL(`${window.location.origin}${url}`);
                  // Store meeting title in localStorage for use in the meeting page
                  localStorage.setItem('currentMeetingTitle', instantMeetingTitle || 'Pre-Join Meeting');
                  navigate(url);
                }} 
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2"
              >
                Start Meeting with Setup
              </Button>
              <Button 
                onClick={() => {
                  const meetingId = generateUniqueID();
                  const url = `/meeting-prejoin-background/${meetingId}`;
                  setInstantMeetingURL(`${window.location.origin}${url}`);
                  // Store meeting title in localStorage for use in the meeting page
                  localStorage.setItem('currentMeetingTitle', instantMeetingTitle || 'Meeting with Background Selection');
                  navigate(url);
                }} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2"
              >
                Start with Background Selection
              </Button>
            </div>
          </div>
          {instantMeetingURL && (
            <div className="mt-4 p-4 border border-blue-200 rounded bg-blue-50">
              <p className="font-medium text-blue-800">Your Instant Meeting URL:</p>
              <div className="flex items-center mt-2">
                <input 
                  type="text" 
                  value={instantMeetingURL} 
                  readOnly 
                  className="flex-grow p-2 border rounded mr-2 bg-white"
                />
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(instantMeetingURL);
                    alert("Meeting URL copied to clipboard!");
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Meeting Scheduler */}
        <section className="mb-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-2xl mb-4 text-green-800">Schedule a Meeting</h2>
          <form onSubmit={handleScheduleMeeting} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
              <Input
                value={scheduledMeetingTitle}
                onChange={(e) => setScheduledMeetingTitle(e.target.value)}
                placeholder="Enter meeting title"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date and Time</label>
              <Input
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                className="w-full border p-2 rounded"
              />
            </div>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2">
              Schedule Meeting
            </Button>
          </form>
        </section>

        {/* Scheduled Meetings List */}
        {scheduledMeetings.length > 0 && (
          <section className="mb-8 p-4 bg-white rounded-lg shadow">
            <h2 className="text-2xl mb-4 text-purple-800">Your Scheduled Meetings</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 text-left">Title</th>
                    <th className="py-2 px-4 text-left">Date & Time</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledMeetings.map((meeting) => {
                    const meetingDate = new Date(meeting.dateTime);
                    const formattedDate = meetingDate.toLocaleDateString();
                    const formattedTime = meetingDate.toLocaleTimeString();
                    
                    return (
                      <tr key={meeting.id} className="border-t">
                        <td className="py-3 px-4">{meeting.title}</td>
                        <td className="py-3 px-4">
                          {formattedDate} at {formattedTime}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <div className="flex space-x-1">
                              {/* Enhanced Setup Button - More prominent */}
                              <Button 
                                onClick={() => {
                                  localStorage.setItem('currentMeetingTitle', meeting.title);
                                  navigate(`/meeting-prejoin-enhanced/${meeting.id}`);
                                }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1 font-bold shadow-md rounded-md"
                              >
                                Join with Enhanced Setup
                              </Button>
                              <Button 
                                onClick={() => {
                                  localStorage.setItem('currentMeetingTitle', meeting.title);
                                  navigate(`/meeting-prejoin-background/${meeting.id}`);
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 font-bold shadow-md rounded-md"
                              >
                                Join with Background
                              </Button>
                              <Button 
                                onClick={() => {
                                  localStorage.setItem('currentMeetingTitle', meeting.title);
                                  navigate(`/meeting/${meeting.id}`);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1"
                              >
                                Join
                              </Button>
                              <Button 
                                onClick={() => {
                                  localStorage.setItem('currentMeetingTitle', meeting.title);
                                  navigate(`/meeting-new/${meeting.id}`);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1"
                              >
                                Join (New UI)
                              </Button>
                              <Button 
                                onClick={() => {
                                  localStorage.setItem('currentMeetingTitle', meeting.title);
                                  window.open(`/meeting-enhanced/${meeting.id}`, '_blank');
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1"
                              >
                                Join (Enhanced)
                              </Button>
                            </div>
                            <Button 
                              onClick={() => {
                                navigator.clipboard.writeText(meeting.url);
                                alert("Meeting URL copied to clipboard!");
                              }}
                              className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs px-2 py-1"
                            >
                              Copy Link
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Meeting Lobby / Waiting Room - Now handled by redirect */}
        {lobbyActive && (
          <section className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-2xl mb-2 text-blue-800">Meeting Lobby</h2>
            <p className="mb-4">Your meeting is ready. You'll be redirected to the meeting room.</p>
            <div className="p-4 border border-blue-300 rounded bg-white">
              <p className="font-medium mb-2">Share this meeting URL with participants:</p>
              <div className="flex items-center">
                <input 
                  type="text" 
                  value={instantMeetingURL} 
                  readOnly 
                  className="flex-grow p-2 border rounded mr-2"
                />
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(instantMeetingURL);
                    alert("Meeting URL copied to clipboard!");
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                >
                  Copy
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Participant List with Connection Status */}
        <section className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-2xl mb-4 text-gray-800">Recent Participants</h2>
          <ul className="space-y-3">
            {participants.map((participant) => (
              <li key={participant.id} className="flex items-center p-2 border-b">
                <span
                  className={`w-3 h-3 rounded-full ${participant.connected ? "bg-green-500" : "bg-red-500"} mr-3`}
                ></span>
                <span className="font-medium">{participant.name}</span>
                <span className="ml-auto text-sm text-gray-500">
                  {participant.connected ? "Online" : "Offline"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
};



export default Dashboard;