// Recording service

export interface RecordingConfig {
  recordVideo: boolean;
  recordAudio: boolean;
  recordChat: boolean;
  recordActiveView: boolean;
  autoRecordOnStart: boolean;
}

export interface Recording {
  id: string;
  meetingId: string;
  startTime: number;
  endTime: number | null;
  duration: number | null;
  url: string | null;
  name: string;
  size: number | null;
}

export interface RecordingState {
  isRecording: boolean;
  recordingStartTime: number | null;
  config: RecordingConfig;
  recordings: Recording[];
  currentRecordingId: string | null;
  mediaRecorder: MediaRecorder | null;
  recordedChunks: Blob[];
}

export const useRecording = () => {
  // Initialize recording state
  const initializeRecording = (): RecordingState => {
    return {
      isRecording: false,
      recordingStartTime: null,
      config: {
        recordVideo: true,
        recordAudio: true,
        recordChat: true,
        recordActiveView: true,
        autoRecordOnStart: false,
      },
      recordings: [],
      currentRecordingId: null,
      mediaRecorder: null,
      recordedChunks: [],
    };
  };

  // Update recording config
  const updateConfig = (
    state: RecordingState,
    updates: Partial<RecordingConfig>
  ): RecordingState => {
    return {
      ...state,
      config: {
        ...state.config,
        ...updates,
      },
    };
  };

  // Start recording
  const startRecording = (
    state: RecordingState,
    meetingId: string,
    stream: MediaStream
  ): RecordingState => {
    if (state.isRecording) return state;
    
    try {
      // Create a new recording ID
      const recordingId = `recording-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create a new MediaRecorder instance
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      const mediaRecorder = new MediaRecorder(stream, options);
      
      // Set up event handlers
      const recordedChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };
      
      // Start recording
      mediaRecorder.start(1000); // Capture in 1-second chunks
      
      // Create a new recording entry
      const newRecording: Recording = {
        id: recordingId,
        meetingId,
        startTime: Date.now(),
        endTime: null,
        duration: null,
        url: null,
        name: `Recording ${state.recordings.length + 1}`,
        size: null,
      };
      
      return {
        ...state,
        isRecording: true,
        recordingStartTime: Date.now(),
        recordings: [...state.recordings, newRecording],
        currentRecordingId: recordingId,
        mediaRecorder,
        recordedChunks,
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      return state;
    }
  };

  // Stop recording
  const stopRecording = (state: RecordingState): Promise<RecordingState> => {
    return new Promise((resolve) => {
      if (!state.isRecording || !state.mediaRecorder || !state.currentRecordingId) {
        resolve(state);
        return;
      }
      
      // Stop the media recorder
      state.mediaRecorder.stop();
      
      // Wait for the last data to be available
      state.mediaRecorder.onstop = () => {
        // Create a blob from the recorded chunks
        const blob = new Blob(state.recordedChunks, { type: 'video/webm' });
        
        // Create a URL for the blob
        const url = URL.createObjectURL(blob);
        
        // Update the recording entry
        const updatedRecordings = state.recordings.map(recording => {
          if (recording.id === state.currentRecordingId) {
            const endTime = Date.now();
            return {
              ...recording,
              endTime,
              duration: endTime - recording.startTime,
              url,
              size: blob.size,
            };
          }
          return recording;
        });
        
        resolve({
          ...state,
          isRecording: false,
          recordingStartTime: null,
          recordings: updatedRecordings,
          currentRecordingId: null,
          mediaRecorder: null,
          recordedChunks: [],
        });
      };
    });
  };

  // Pause recording
  const pauseRecording = (state: RecordingState): RecordingState => {
    if (!state.isRecording || !state.mediaRecorder) return state;
    
    try {
      state.mediaRecorder.pause();
      
      return {
        ...state,
        isRecording: false,
      };
    } catch (error) {
      console.error('Error pausing recording:', error);
      return state;
    }
  };

  // Resume recording
  const resumeRecording = (state: RecordingState): RecordingState => {
    if (state.isRecording || !state.mediaRecorder) return state;
    
    try {
      state.mediaRecorder.resume();
      
      return {
        ...state,
        isRecording: true,
      };
    } catch (error) {
      console.error('Error resuming recording:', error);
      return state;
    }
  };

  // Download a recording
  const downloadRecording = (state: RecordingState, recordingId: string): void => {
    const recording = state.recordings.find(r => r.id === recordingId);
    
    if (!recording || !recording.url) {
      console.error('Recording not found or URL not available');
      return;
    }
    
    // Create a download link
    const a = document.createElement('a');
    a.href = recording.url;
    a.download = `${recording.name}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Rename a recording
  const renameRecording = (
    state: RecordingState,
    recordingId: string,
    newName: string
  ): RecordingState => {
    const updatedRecordings = state.recordings.map(recording => {
      if (recording.id === recordingId) {
        return {
          ...recording,
          name: newName,
        };
      }
      return recording;
    });
    
    return {
      ...state,
      recordings: updatedRecordings,
    };
  };

  // Delete a recording
  const deleteRecording = (
    state: RecordingState,
    recordingId: string
  ): RecordingState => {
    // Find the recording to delete
    const recordingToDelete = state.recordings.find(r => r.id === recordingId);
    
    if (recordingToDelete && recordingToDelete.url) {
      // Revoke the object URL to free up memory
      URL.revokeObjectURL(recordingToDelete.url);
    }
    
    return {
      ...state,
      recordings: state.recordings.filter(r => r.id !== recordingId),
    };
  };

  return {
    initializeRecording,
    updateConfig,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    downloadRecording,
    renameRecording,
    deleteRecording,
  };
};