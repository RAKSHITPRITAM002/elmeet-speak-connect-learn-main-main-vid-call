// Screen sharing service

export interface ScreenShareOptions {
  audio: boolean;
  video: boolean;
  preferCurrentTab?: boolean;
  surfaceSwitching?: 'include' | 'exclude';
  selfBrowserSurface?: 'include' | 'exclude';
  systemAudio?: 'include' | 'exclude';
}

export const useScreenShare = () => {
  // Start screen sharing
  const startScreenShare = async (options: ScreenShareOptions = { audio: true, video: true }): Promise<MediaStream | null> => {
    try {
      // @ts-ignore - TypeScript doesn't recognize the displaySurface option
      const mediaOptions: any = {
        audio: options.audio,
        video: options.video ? {
          cursor: 'always',
          displaySurface: options.preferCurrentTab ? 'browser' : 'monitor',
          logicalSurface: true,
          // For Chrome
          surfaceSwitching: options.surfaceSwitching || 'include',
          selfBrowserSurface: options.selfBrowserSurface || 'include',
          systemAudio: options.systemAudio || 'include',
        } : false,
      };

      // Get screen sharing stream
      // @ts-ignore - TypeScript doesn't recognize getDisplayMedia
      const stream = await navigator.mediaDevices.getDisplayMedia(mediaOptions);
      
      // Add listener for when user stops sharing
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        console.log('User stopped sharing screen');
      });
      
      return stream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      return null;
    }
  };

  // Start sharing a browser tab with optimized video
  const startOptimizedVideoShare = async (): Promise<MediaStream | null> => {
    try {
      // @ts-ignore - TypeScript doesn't recognize these options
      const mediaOptions: any = {
        audio: true,
        video: {
          cursor: 'always',
          displaySurface: 'browser',
          logicalSurface: true,
          // For Chrome - optimize for video
          frameRate: { ideal: 30, max: 60 },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          // Additional options for video optimization
          contentHint: 'motion',
        },
        // For Chrome - include system audio
        preferCurrentTab: true,
        systemAudio: 'include',
      };

      // @ts-ignore - TypeScript doesn't recognize getDisplayMedia
      const stream = await navigator.mediaDevices.getDisplayMedia(mediaOptions);
      
      // Set content hint for video track to optimize for motion
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.contentHint = 'motion';
      }
      
      return stream;
    } catch (error) {
      console.error('Error starting optimized video share:', error);
      return null;
    }
  };

  // Stop screen sharing
  const stopScreenShare = (stream: MediaStream) => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  return {
    startScreenShare,
    startOptimizedVideoShare,
    stopScreenShare,
  };
};