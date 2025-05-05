// Language Teaching service

export interface VocabularyItem {
  id: string;
  term: string;
  definition: string;
  example?: string;
  notes?: string;
  timestamp: number;
}

export interface RolePlayRole {
  id: string;
  name: string;
  description?: string;
  prompts: string[];
  assignedParticipantId?: string;
}

export interface RolePlayScenario {
  id: string;
  title: string;
  description: string;
  roles: RolePlayRole[];
  isActive: boolean;
}

export interface PollQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer?: string | string[];
}

export interface Poll {
  id: string;
  title: string;
  questions: PollQuestion[];
  isAnonymous: boolean;
  isActive: boolean;
  responses: {
    participantId: string;
    answers: {
      questionId: string;
      answer: string | string[];
    }[];
  }[];
}

export interface PronunciationFeedback {
  id: string;
  participantId: string;
  teacherId: string;
  audioUrl: string;
  feedback?: string;
  timestamp: number;
}

export interface LanguageTeachingState {
  vocabularyPad: VocabularyItem[];
  rolePlayScenarios: RolePlayScenario[];
  polls: Poll[];
  pronunciationFeedback: PronunciationFeedback[];
  timerEndTime?: number;
  timerDuration?: number;
  isTimerRunning: boolean;
  stopwatchStartTime?: number;
  isStopwatchRunning: boolean;
}

export const useLanguageTeaching = () => {
  // Initialize language teaching state
  const initializeLanguageTeaching = (): LanguageTeachingState => {
    return {
      vocabularyPad: [],
      rolePlayScenarios: [],
      polls: [],
      pronunciationFeedback: [],
      isTimerRunning: false,
      isStopwatchRunning: false,
    };
  };

  // Vocabulary Pad functions
  const addVocabularyItem = (
    state: LanguageTeachingState,
    term: string,
    definition: string,
    example?: string,
    notes?: string
  ): LanguageTeachingState => {
    const newItem: VocabularyItem = {
      id: `vocab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      term,
      definition,
      example,
      notes,
      timestamp: Date.now(),
    };
    
    return {
      ...state,
      vocabularyPad: [...state.vocabularyPad, newItem],
    };
  };

  const updateVocabularyItem = (
    state: LanguageTeachingState,
    itemId: string,
    updates: Partial<VocabularyItem>
  ): LanguageTeachingState => {
    const updatedItems = state.vocabularyPad.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          ...updates,
          // Don't update id or timestamp
          id: item.id,
          timestamp: item.timestamp,
        };
      }
      return item;
    });
    
    return {
      ...state,
      vocabularyPad: updatedItems,
    };
  };

  const deleteVocabularyItem = (
    state: LanguageTeachingState,
    itemId: string
  ): LanguageTeachingState => {
    return {
      ...state,
      vocabularyPad: state.vocabularyPad.filter(item => item.id !== itemId),
    };
  };

  const exportVocabularyPad = (state: LanguageTeachingState): string => {
    let exportText = 'Vocabulary List\\n\\n';
    
    state.vocabularyPad.forEach(item => {
      exportText += `Term: ${item.term}\\n`;
      exportText += `Definition: ${item.definition}\\n`;
      
      if (item.example) {
        exportText += `Example: ${item.example}\\n`;
      }
      
      if (item.notes) {
        exportText += `Notes: ${item.notes}\\n`;
      }
      
      exportText += '\\n';
    });
    
    return exportText;
  };

  // Role Play functions
  const createRolePlayScenario = (
    state: LanguageTeachingState,
    title: string,
    description: string,
    roles: { name: string; description?: string; prompts: string[] }[]
  ): LanguageTeachingState => {
    const newRoles: RolePlayRole[] = roles.map(role => ({
      id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: role.name,
      description: role.description,
      prompts: role.prompts,
    }));
    
    const newScenario: RolePlayScenario = {
      id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      roles: newRoles,
      isActive: false,
    };
    
    return {
      ...state,
      rolePlayScenarios: [...state.rolePlayScenarios, newScenario],
    };
  };

  const activateRolePlayScenario = (
    state: LanguageTeachingState,
    scenarioId: string
  ): LanguageTeachingState => {
    // Deactivate all scenarios first
    const updatedScenarios = state.rolePlayScenarios.map(scenario => ({
      ...scenario,
      isActive: scenario.id === scenarioId,
    }));
    
    return {
      ...state,
      rolePlayScenarios: updatedScenarios,
    };
  };

  const assignRoleToParticipant = (
    state: LanguageTeachingState,
    scenarioId: string,
    roleId: string,
    participantId: string
  ): LanguageTeachingState => {
    const updatedScenarios = state.rolePlayScenarios.map(scenario => {
      if (scenario.id === scenarioId) {
        const updatedRoles = scenario.roles.map(role => {
          if (role.id === roleId) {
            return {
              ...role,
              assignedParticipantId: participantId,
            };
          }
          return role;
        });
        
        return {
          ...scenario,
          roles: updatedRoles,
        };
      }
      return scenario;
    });
    
    return {
      ...state,
      rolePlayScenarios: updatedScenarios,
    };
  };

  // Poll functions
  const createPoll = (
    state: LanguageTeachingState,
    title: string,
    questions: PollQuestion[],
    isAnonymous: boolean = false
  ): LanguageTeachingState => {
    const newPoll: Poll = {
      id: `poll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      questions,
      isAnonymous,
      isActive: false,
      responses: [],
    };
    
    return {
      ...state,
      polls: [...state.polls, newPoll],
    };
  };

  const activatePoll = (
    state: LanguageTeachingState,
    pollId: string
  ): LanguageTeachingState => {
    const updatedPolls = state.polls.map(poll => ({
      ...poll,
      isActive: poll.id === pollId,
    }));
    
    return {
      ...state,
      polls: updatedPolls,
    };
  };

  const submitPollResponse = (
    state: LanguageTeachingState,
    pollId: string,
    participantId: string,
    answers: { questionId: string; answer: string | string[] }[]
  ): LanguageTeachingState => {
    const updatedPolls = state.polls.map(poll => {
      if (poll.id === pollId) {
        // Remove any existing response from this participant
        const filteredResponses = poll.responses.filter(
          response => response.participantId !== participantId
        );
        
        return {
          ...poll,
          responses: [
            ...filteredResponses,
            {
              participantId,
              answers,
            },
          ],
        };
      }
      return poll;
    });
    
    return {
      ...state,
      polls: updatedPolls,
    };
  };

  // Pronunciation Helper functions
  const recordPronunciation = (
    state: LanguageTeachingState,
    participantId: string,
    teacherId: string,
    audioBlob: Blob
  ): Promise<LanguageTeachingState> => {
    return new Promise((resolve) => {
      // In a real implementation, this would upload the audio to a server
      // For now, we'll just create a local URL
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const newFeedback: PronunciationFeedback = {
        id: `pronunciation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        participantId,
        teacherId,
        audioUrl,
        timestamp: Date.now(),
      };
      
      resolve({
        ...state,
        pronunciationFeedback: [...state.pronunciationFeedback, newFeedback],
      });
    });
  };

  const addPronunciationFeedback = (
    state: LanguageTeachingState,
    feedbackId: string,
    feedback: string
  ): LanguageTeachingState => {
    const updatedFeedback = state.pronunciationFeedback.map(item => {
      if (item.id === feedbackId) {
        return {
          ...item,
          feedback,
        };
      }
      return item;
    });
    
    return {
      ...state,
      pronunciationFeedback: updatedFeedback,
    };
  };

  // Timer functions
  const startTimer = (
    state: LanguageTeachingState,
    durationMinutes: number
  ): LanguageTeachingState => {
    const durationMs = durationMinutes * 60 * 1000;
    const endTime = Date.now() + durationMs;
    
    return {
      ...state,
      timerEndTime: endTime,
      timerDuration: durationMs,
      isTimerRunning: true,
    };
  };

  const pauseTimer = (
    state: LanguageTeachingState
  ): LanguageTeachingState => {
    if (!state.isTimerRunning || !state.timerEndTime) return state;
    
    const remainingTime = state.timerEndTime - Date.now();
    
    return {
      ...state,
      timerDuration: remainingTime > 0 ? remainingTime : 0,
      isTimerRunning: false,
      timerEndTime: undefined,
    };
  };

  const resumeTimer = (
    state: LanguageTeachingState
  ): LanguageTeachingState => {
    if (state.isTimerRunning || !state.timerDuration) return state;
    
    const endTime = Date.now() + state.timerDuration;
    
    return {
      ...state,
      timerEndTime: endTime,
      isTimerRunning: true,
    };
  };

  const stopTimer = (
    state: LanguageTeachingState
  ): LanguageTeachingState => {
    return {
      ...state,
      timerEndTime: undefined,
      timerDuration: undefined,
      isTimerRunning: false,
    };
  };

  // Stopwatch functions
  const startStopwatch = (
    state: LanguageTeachingState
  ): LanguageTeachingState => {
    return {
      ...state,
      stopwatchStartTime: Date.now(),
      isStopwatchRunning: true,
    };
  };

  const pauseStopwatch = (
    state: LanguageTeachingState
  ): LanguageTeachingState => {
    if (!state.isStopwatchRunning || !state.stopwatchStartTime) return state;
    
    const elapsedTime = Date.now() - state.stopwatchStartTime;
    
    return {
      ...state,
      stopwatchStartTime: undefined,
      timerDuration: elapsedTime, // Reuse timerDuration to store elapsed time
      isStopwatchRunning: false,
    };
  };

  const resumeStopwatch = (
    state: LanguageTeachingState
  ): LanguageTeachingState => {
    if (state.isStopwatchRunning || !state.timerDuration) return state;
    
    // Calculate new start time by subtracting elapsed time from current time
    const newStartTime = Date.now() - state.timerDuration;
    
    return {
      ...state,
      stopwatchStartTime: newStartTime,
      isStopwatchRunning: true,
    };
  };

  const resetStopwatch = (
    state: LanguageTeachingState
  ): LanguageTeachingState => {
    return {
      ...state,
      stopwatchStartTime: undefined,
      timerDuration: undefined,
      isStopwatchRunning: false,
    };
  };

  return {
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
  };
};