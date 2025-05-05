import React, { useState, useEffect, useRef } from 'react';
import { useLanguageTeaching, LanguageTeachingState, VocabularyItem, RolePlayScenario, Poll, PronunciationFeedback } from '../../services/LanguageTeachingService';

interface LanguageTeachingToolsProps {
  isHost: boolean;
  participants: { id: string; name: string }[];
  onError?: (error: string) => void;
}

const LanguageTeachingTools: React.FC<LanguageTeachingToolsProps> = ({ isHost, participants, onError }) => {
  const {
    initializeLanguageTeaching,
    // Vocabulary Pad
    addVocabularyItem,
    updateVocabularyItem,
    deleteVocabularyItem,
    exportVocabularyPad,
    // Role Play
    createRolePlayScenario,
    activateRolePlayScenario,
    assignRoleToParticipant,
    // Polls
    createPoll,
    activatePoll,
    submitPollResponse,
    // Pronunciation Helper
    recordPronunciation,
    addPronunciationFeedback,
    // Timer
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    // Stopwatch
    startStopwatch,
    pauseStopwatch,
    resumeStopwatch,
    resetStopwatch,
  } = useLanguageTeaching();
  
  // State
  const [teachingState, setTeachingState] = useState<LanguageTeachingState>(initializeLanguageTeaching());
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'roleplay' | 'polls' | 'pronunciation' | 'timer'>('vocabulary');
  const [newVocabularyTerm, setNewVocabularyTerm] = useState('');
  const [newVocabularyDefinition, setNewVocabularyDefinition] = useState('');
  const [newVocabularyExample, setNewVocabularyExample] = useState('');
  const [editingVocabularyId, setEditingVocabularyId] = useState<string | null>(null);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (teachingState.isTimerRunning && teachingState.timerEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, teachingState.timerEndTime! - now);
        
        if (remaining <= 0) {
          // Timer finished
          setTeachingState(stopTimer(teachingState));
          setTimerMinutes(0);
          setTimerSeconds(0);
          
          // Play sound or show notification
          const audio = new Audio('/sounds/timer-end.mp3');
          audio.play().catch(err => console.error('Error playing sound:', err));
        } else {
          // Update display
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);
          setTimerMinutes(minutes);
          setTimerSeconds(seconds);
        }
      }, 500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [teachingState.isTimerRunning, teachingState.timerEndTime]);
  
  // Stopwatch effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (teachingState.isStopwatchRunning && teachingState.stopwatchStartTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - teachingState.stopwatchStartTime!;
        setStopwatchTime(elapsed);
      }, 100);
    } else if (!teachingState.isStopwatchRunning && teachingState.timerDuration) {
      // When paused, show the elapsed time
      setStopwatchTime(teachingState.timerDuration);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [teachingState.isStopwatchRunning, teachingState.stopwatchStartTime, teachingState.timerDuration]);
  
  // Handle adding vocabulary item
  const handleAddVocabulary = () => {
    if (!newVocabularyTerm.trim() || !newVocabularyDefinition.trim()) {
      if (onError) onError('Please enter both term and definition');
      return;
    }
    
    const updatedState = addVocabularyItem(
      teachingState,
      newVocabularyTerm.trim(),
      newVocabularyDefinition.trim(),
      newVocabularyExample.trim() || undefined
    );
    
    setTeachingState(updatedState);
    setNewVocabularyTerm('');
    setNewVocabularyDefinition('');
    setNewVocabularyExample('');
  };
  
  // Handle updating vocabulary item
  const handleUpdateVocabulary = () => {
    if (!editingVocabularyId) return;
    
    if (!newVocabularyTerm.trim() || !newVocabularyDefinition.trim()) {
      if (onError) onError('Please enter both term and definition');
      return;
    }
    
    const updatedState = updateVocabularyItem(
      teachingState,
      editingVocabularyId,
      {
        term: newVocabularyTerm.trim(),
        definition: newVocabularyDefinition.trim(),
        example: newVocabularyExample.trim() || undefined,
      }
    );
    
    setTeachingState(updatedState);
    setNewVocabularyTerm('');
    setNewVocabularyDefinition('');
    setNewVocabularyExample('');
    setEditingVocabularyId(null);
  };
  
  // Handle deleting vocabulary item
  const handleDeleteVocabulary = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this vocabulary item?')) {
      const updatedState = deleteVocabularyItem(teachingState, itemId);
      setTeachingState(updatedState);
    }
  };
  
  // Handle editing vocabulary item
  const handleEditVocabulary = (item: VocabularyItem) => {
    setNewVocabularyTerm(item.term);
    setNewVocabularyDefinition(item.definition);
    setNewVocabularyExample(item.example || '');
    setEditingVocabularyId(item.id);
  };
  
  // Handle exporting vocabulary
  const handleExportVocabulary = () => {
    const exportText = exportVocabularyPad(teachingState);
    
    // Create a blob and download it
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocabulary-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Handle starting timer
  const handleStartTimer = () => {
    const totalMinutes = timerMinutes + (timerSeconds / 60);
    const updatedState = startTimer(teachingState, totalMinutes);
    setTeachingState(updatedState);
  };
  
  // Handle pausing timer
  const handlePauseTimer = () => {
    const updatedState = pauseTimer(teachingState);
    setTeachingState(updatedState);
  };
  
  // Handle resuming timer
  const handleResumeTimer = () => {
    const updatedState = resumeTimer(teachingState);
    setTeachingState(updatedState);
  };
  
  // Handle stopping timer
  const handleStopTimer = () => {
    const updatedState = stopTimer(teachingState);
    setTeachingState(updatedState);
    setTimerMinutes(5);
    setTimerSeconds(0);
  };
  
  // Handle starting stopwatch
  const handleStartStopwatch = () => {
    const updatedState = startStopwatch(teachingState);
    setTeachingState(updatedState);
  };
  
  // Handle pausing stopwatch
  const handlePauseStopwatch = () => {
    const updatedState = pauseStopwatch(teachingState);
    setTeachingState(updatedState);
  };
  
  // Handle resuming stopwatch
  const handleResumeStopwatch = () => {
    const updatedState = resumeStopwatch(teachingState);
    setTeachingState(updatedState);
  };
  
  // Handle resetting stopwatch
  const handleResetStopwatch = () => {
    const updatedState = resetStopwatch(teachingState);
    setTeachingState(updatedState);
    setStopwatchTime(0);
  };
  
  // Handle starting pronunciation recording
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setRecordingBlob(audioBlob);
        setRecordingUrl(audioUrl);
        setIsRecording(false);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      // Automatically stop after 15 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 15000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      if (onError) onError('Could not access microphone. Please check permissions.');
    }
  };
  
  // Handle stopping pronunciation recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };
  
  // Handle submitting pronunciation feedback
  const handleSubmitFeedback = async () => {
    if (!recordingBlob) return;
    
    try {
      // In a real implementation, you would have the actual participant and teacher IDs
      const participantId = 'participant-1';
      const teacherId = 'teacher-1';
      
      const updatedState = await recordPronunciation(
        teachingState,
        participantId,
        teacherId,
        recordingBlob
      );
      
      if (feedbackText) {
        const newFeedbackId = updatedState.pronunciationFeedback[updatedState.pronunciationFeedback.length - 1].id;
        const finalState = addPronunciationFeedback(updatedState, newFeedbackId, feedbackText);
        setTeachingState(finalState);
      } else {
        setTeachingState(updatedState);
      }
      
      // Reset state
      setRecordingBlob(null);
      setRecordingUrl(null);
      setFeedbackText('');
    } catch (err) {
      console.error('Error saving pronunciation feedback:', err);
      if (onError) onError('Failed to save pronunciation feedback');
    }
  };
  
  // Format time for display
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const tenths = Math.floor((milliseconds % 1000) / 100);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
  };
  
  return (
    <div className="language-teaching-tools bg-white rounded-lg shadow-lg">
      {/* Tabs */}
      <div className="tabs flex border-b border-gray-200">
        <button
          className={`tab-button px-4 py-2 font-medium ${activeTab === 'vocabulary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('vocabulary')}
        >
          Vocabulary Pad
        </button>
        
        <button
          className={`tab-button px-4 py-2 font-medium ${activeTab === 'roleplay' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('roleplay')}
        >
          Role Play
        </button>
        
        <button
          className={`tab-button px-4 py-2 font-medium ${activeTab === 'polls' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('polls')}
        >
          Polls & Quizzes
        </button>
        
        <button
          className={`tab-button px-4 py-2 font-medium ${activeTab === 'pronunciation' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('pronunciation')}
        >
          Pronunciation
        </button>
        
        <button
          className={`tab-button px-4 py-2 font-medium ${activeTab === 'timer' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('timer')}
        >
          Timer
        </button>
      </div>
      
      {/* Tab content */}
      <div className="tab-content p-4">
        {/* Vocabulary Pad */}
        {activeTab === 'vocabulary' && (
          <div className="vocabulary-pad">
            <h3 className="text-lg font-medium mb-4">Vocabulary Pad</h3>
            
            {/* Add/Edit form */}
            <div className="vocabulary-form mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newVocabularyTerm}
                    onChange={(e) => setNewVocabularyTerm(e.target.value)}
                    placeholder="Enter term"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Definition</label>
                  <input
                    type="text"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newVocabularyDefinition}
                    onChange={(e) => setNewVocabularyDefinition(e.target.value)}
                    placeholder="Enter definition"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Example (optional)</label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newVocabularyExample}
                  onChange={(e) => setNewVocabularyExample(e.target.value)}
                  placeholder="Enter example usage"
                  rows={2}
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                {editingVocabularyId ? (
                  <>
                    <button
                      className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      onClick={() => {
                        setNewVocabularyTerm('');
                        setNewVocabularyDefinition('');
                        setNewVocabularyExample('');
                        setEditingVocabularyId(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      onClick={handleUpdateVocabulary}
                    >
                      Update
                    </button>
                  </>
                ) : (
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={handleAddVocabulary}
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
            
            {/* Vocabulary list */}
            <div className="vocabulary-list">
              {teachingState.vocabularyPad.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No vocabulary items yet. Add some above!</p>
              ) : (
                <>
                  <div className="flex justify-end mb-2">
                    <button
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                      onClick={handleExportVocabulary}
                    >
                      Export
                    </button>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {teachingState.vocabularyPad.map((item) => (
                      <div key={item.id} className="vocabulary-item py-3">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{item.term}</h4>
                          <div className="flex space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => handleEditVocabulary(item)}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleDeleteVocabulary(item.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-700">{item.definition}</p>
                        {item.example && (
                          <p className="text-gray-500 italic mt-1">Example: {item.example}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Role Play */}
        {activeTab === 'roleplay' && (
          <div className="role-play">
            <h3 className="text-lg font-medium mb-4">Role Play</h3>
            
            {/* Role play scenarios will be implemented here */}
            <p className="text-gray-500 text-center py-4">Role play feature coming soon!</p>
          </div>
        )}
        
        {/* Polls & Quizzes */}
        {activeTab === 'polls' && (
          <div className="polls">
            <h3 className="text-lg font-medium mb-4">Polls & Quizzes</h3>
            
            {/* Polls and quizzes will be implemented here */}
            <p className="text-gray-500 text-center py-4">Polls & quizzes feature coming soon!</p>
          </div>
        )}
        
        {/* Pronunciation */}
        {activeTab === 'pronunciation' && (
          <div className="pronunciation">
            <h3 className="text-lg font-medium mb-4">Pronunciation Helper</h3>
            
            <div className="pronunciation-recorder bg-gray-50 p-4 rounded-lg mb-6">
              <p className="mb-4 text-sm text-gray-700">
                Record a short audio clip (up to 15 seconds) for pronunciation practice or feedback.
              </p>
              
              <div className="flex items-center justify-center mb-4">
                {isRecording ? (
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 flex items-center"
                    onClick={handleStopRecording}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path>
                    </svg>
                    Stop Recording
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center"
                    onClick={handleStartRecording}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                    </svg>
                    Start Recording
                  </button>
                )}
              </div>
              
              {recordingUrl && (
                <div className="audio-player mb-4">
                  <audio src={recordingUrl} controls className="w-full"></audio>
                </div>
              )}
              
              {recordingUrl && (
                <div className="feedback-form">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Feedback (optional)</label>
                  <textarea
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 mb-2"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Enter feedback or notes about this pronunciation"
                    rows={3}
                  ></textarea>
                  
                  <div className="flex justify-end">
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      onClick={handleSubmitFeedback}
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Pronunciation history */}
            <div className="pronunciation-history">
              <h4 className="font-medium mb-2">Pronunciation History</h4>
              
              {teachingState.pronunciationFeedback.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No pronunciation recordings yet.</p>
              ) : (
                <div className="divide-y divide-gray-200">
                  {teachingState.pronunciationFeedback.map((item) => (
                    <div key={item.id} className="pronunciation-item py-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <audio src={item.audioUrl} controls className="w-full mb-2"></audio>
                      
                      {item.feedback && (
                        <div className="feedback bg-gray-50 p-2 rounded">
                          <p className="text-sm">{item.feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Timer */}
        {activeTab === 'timer' && (
          <div className="timer">
            <h3 className="text-lg font-medium mb-4">Timer & Stopwatch</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Timer */}
              <div className="timer-section bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-4">Timer</h4>
                
                <div className="timer-display text-4xl font-bold text-center mb-4">
                  {teachingState.isTimerRunning ? (
                    <span>
                      {timerMinutes.toString().padStart(2, '0')}:{timerSeconds.toString().padStart(2, '0')}
                    </span>
                  ) : (
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        className="w-16 text-center rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={timerMinutes}
                        onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 0)}
                        min="0"
                        max="60"
                        disabled={teachingState.isTimerRunning}
                      />
                      <span className="mx-2">:</span>
                      <input
                        type="number"
                        className="w-16 text-center rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={timerSeconds}
                        onChange={(e) => setTimerSeconds(parseInt(e.target.value) || 0)}
                        min="0"
                        max="59"
                        step="5"
                        disabled={teachingState.isTimerRunning}
                      />
                    </div>
                  )}
                </div>
                
                <div className="timer-controls flex justify-center space-x-2">
                  {!teachingState.isTimerRunning ? (
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      onClick={handleStartTimer}
                      disabled={timerMinutes === 0 && timerSeconds === 0}
                    >
                      Start
                    </button>
                  ) : (
                    <>
                      <button
                        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                        onClick={handlePauseTimer}
                      >
                        Pause
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        onClick={handleStopTimer}
                      >
                        Stop
                      </button>
                    </>
                  )}
                </div>
                
                <div className="timer-presets mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Presets:</div>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 5, 10, 15, 20, 30].map(minutes => (
                      <button
                        key={minutes}
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        onClick={() => {
                          setTimerMinutes(minutes);
                          setTimerSeconds(0);
                        }}
                        disabled={teachingState.isTimerRunning}
                      >
                        {minutes}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Stopwatch */}
              <div className="stopwatch-section bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-4">Stopwatch</h4>
                
                <div className="stopwatch-display text-4xl font-bold text-center mb-4">
                  {formatTime(stopwatchTime)}
                </div>
                
                <div className="stopwatch-controls flex justify-center space-x-2">
                  {!teachingState.isStopwatchRunning ? (
                    <>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        onClick={handleStartStopwatch}
                      >
                        Start
                      </button>
                      {stopwatchTime > 0 && (
                        <>
                          <button
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            onClick={handleResumeStopwatch}
                          >
                            Resume
                          </button>
                          <button
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            onClick={handleResetStopwatch}
                          >
                            Reset
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                        onClick={handlePauseStopwatch}
                      >
                        Pause
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        onClick={handleResetStopwatch}
                      >
                        Reset
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageTeachingTools;