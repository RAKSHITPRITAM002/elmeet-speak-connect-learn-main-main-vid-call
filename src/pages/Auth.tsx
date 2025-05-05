import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [name, setName] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const navigate = useNavigate();

  // Simple helper to generate a random meeting id
  const generateMeetingId = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let id = meetingId.trim();
    // If no meeting id is provided, create one and mark the user as host.
    if (id === '') {
      id = generateMeetingId();
      setIsHost(true);
    }
    // Save user info (in production, you might use context or a backend)
    localStorage.setItem('userName', name);
    localStorage.setItem('isHost', JSON.stringify(isHost));
    // Navigate to the meeting room using the meeting id.
    navigate(`/meeting/${id}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Join / Create Meeting</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block font-medium text-gray-700">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="meetingId" className="block font-medium text-gray-700">
              Meeting ID (leave blank to create a new meeting)
            </label>
            <input
              id="meetingId"
              type="text"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              placeholder="Enter meeting ID"
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {meetingId.trim() === '' ? 'Create Meeting' : 'Join Meeting'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;