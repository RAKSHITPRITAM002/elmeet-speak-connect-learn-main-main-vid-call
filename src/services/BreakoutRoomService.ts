// Breakout Room service

export interface Participant {
  id: string;
  name: string;
  isHost?: boolean;
  isCoHost?: boolean;
  breakoutRoomId?: string | null;
}

export interface BreakoutRoom {
  id: string;
  name: string;
  participants: string[]; // Participant IDs
  isOpen: boolean;
  startTime: number;
  endTime?: number;
  notes?: string;
}

export interface BreakoutRoomState {
  rooms: BreakoutRoom[];
  isActive: boolean;
  duration: number; // in minutes
  autoCloseTime?: number;
}

export const useBreakoutRooms = () => {
  // Initialize breakout rooms
  const initializeBreakoutRooms = (): BreakoutRoomState => {
    return {
      rooms: [],
      isActive: false,
      duration: 15, // Default 15 minutes
    };
  };

  // Create breakout rooms
  const createBreakoutRooms = (
    state: BreakoutRoomState,
    count: number,
    duration: number,
    participants: Participant[],
    assignmentMode: 'automatic' | 'manual' = 'automatic'
  ): BreakoutRoomState => {
    // Create the rooms
    const newRooms: BreakoutRoom[] = [];
    
    for (let i = 1; i <= count; i++) {
      newRooms.push({
        id: `room-${i}-${Date.now()}`,
        name: `Room ${i}`,
        participants: [],
        isOpen: true,
        startTime: Date.now(),
      });
    }
    
    // If automatic assignment, distribute participants evenly
    if (assignmentMode === 'automatic') {
      const participantsToAssign = participants
        .filter(p => !p.isHost) // Exclude host
        .map(p => p.id);
      
      // Distribute participants evenly among rooms
      participantsToAssign.forEach((participantId, index) => {
        const roomIndex = index % count;
        newRooms[roomIndex].participants.push(participantId);
      });
    }
    
    // Calculate auto-close time
    const autoCloseTime = Date.now() + (duration * 60 * 1000);
    
    return {
      rooms: newRooms,
      isActive: true,
      duration,
      autoCloseTime,
    };
  };

  // Assign a participant to a breakout room
  const assignParticipant = (
    state: BreakoutRoomState,
    participantId: string,
    roomId: string
  ): BreakoutRoomState => {
    // First, remove the participant from any existing room
    const updatedRooms = state.rooms.map(room => ({
      ...room,
      participants: room.participants.filter(id => id !== participantId),
    }));
    
    // Then, add the participant to the new room
    const roomIndex = updatedRooms.findIndex(room => room.id === roomId);
    
    if (roomIndex === -1) return state;
    
    updatedRooms[roomIndex] = {
      ...updatedRooms[roomIndex],
      participants: [...updatedRooms[roomIndex].participants, participantId],
    };
    
    return {
      ...state,
      rooms: updatedRooms,
    };
  };

  // Remove a participant from all breakout rooms
  const removeParticipant = (
    state: BreakoutRoomState,
    participantId: string
  ): BreakoutRoomState => {
    const updatedRooms = state.rooms.map(room => ({
      ...room,
      participants: room.participants.filter(id => id !== participantId),
    }));
    
    return {
      ...state,
      rooms: updatedRooms,
    };
  };

  // Close a specific breakout room
  const closeRoom = (
    state: BreakoutRoomState,
    roomId: string
  ): BreakoutRoomState => {
    const updatedRooms = state.rooms.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          isOpen: false,
          endTime: Date.now(),
        };
      }
      return room;
    });
    
    // Check if all rooms are closed
    const allClosed = updatedRooms.every(room => !room.isOpen);
    
    return {
      ...state,
      rooms: updatedRooms,
      isActive: !allClosed,
    };
  };

  // End all breakout rooms
  const endAllRooms = (state: BreakoutRoomState): BreakoutRoomState => {
    const updatedRooms = state.rooms.map(room => ({
      ...room,
      isOpen: false,
      endTime: Date.now(),
    }));
    
    return {
      ...state,
      rooms: updatedRooms,
      isActive: false,
      autoCloseTime: undefined,
    };
  };

  // Broadcast a message to all breakout rooms
  const broadcastMessage = (
    state: BreakoutRoomState,
    message: string
  ): { state: BreakoutRoomState; message: string } => {
    // In a real implementation, this would send the message to all rooms
    console.log('Broadcasting message to all breakout rooms:', message);
    
    return {
      state,
      message,
    };
  };

  // Update room notes
  const updateRoomNotes = (
    state: BreakoutRoomState,
    roomId: string,
    notes: string
  ): BreakoutRoomState => {
    const updatedRooms = state.rooms.map(room => {
      if (room.id === roomId) {
        return {
          ...room,
          notes,
        };
      }
      return room;
    });
    
    return {
      ...state,
      rooms: updatedRooms,
    };
  };

  // Extend the duration of breakout rooms
  const extendDuration = (
    state: BreakoutRoomState,
    additionalMinutes: number
  ): BreakoutRoomState => {
    if (!state.autoCloseTime) return state;
    
    const newAutoCloseTime = state.autoCloseTime + (additionalMinutes * 60 * 1000);
    const newDuration = state.duration + additionalMinutes;
    
    return {
      ...state,
      duration: newDuration,
      autoCloseTime: newAutoCloseTime,
    };
  };

  return {
    initializeBreakoutRooms,
    createBreakoutRooms,
    assignParticipant,
    removeParticipant,
    closeRoom,
    endAllRooms,
    broadcastMessage,
    updateRoomNotes,
    extendDuration,
  };
};