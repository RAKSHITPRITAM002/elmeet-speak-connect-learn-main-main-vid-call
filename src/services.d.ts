// Type definitions for services module
declare module 'services' {
  // WebRTC and ScreenShare services are now in hooks directory
  export * from './services/ChatService';
  export * from './services/MeetingService';
  export * from './services/RecordingService';
  export * from './services/WhiteboardService';
  export * from './services/BreakoutRoomService';
  export * from './services/LanguageTeachingService';
}