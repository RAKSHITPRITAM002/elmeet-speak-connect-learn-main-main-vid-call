// Screen sharing hook

// Extended interfaces for screen sharing options
interface DisplayMediaStreamConstraints extends MediaStreamConstraints {
  preferCurrentTab?: boolean;
  systemAudio?: 'include' | 'exclude';
  video?: boolean | DisplayMediaStreamVideoConstraints;
  audio?: boolean | DisplayMediaStreamAudioConstraints;
}

interface DisplayMediaStreamVideoConstraints extends MediaTrackConstraints {
  cursor?: 'always' | 'motion' | 'never';
  displaySurface?: 'browser' | 'window' | 'monitor' | 'application';
  logicalSurface?: boolean;
  surfaceSwitching?: 'include' | 'exclude';
  selfBrowserSurface?: 'include' | 'exclude';
  contentHint?: 'motion' | 'detail' | 'text';
}

interface DisplayMediaStreamAudioConstraints extends MediaTrackConstraints {
  suppressLocalAudioPlayback?: boolean;
  systemAudio?: 'include' | 'exclude';
}

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
      const mediaOptions: DisplayMediaStreamConstraints = {
        audio: options.audio,
        video: options.video ? {
          cursor: 'always',
          displaySurface: 'window',
        } : false,
      };
      
      // Add additional options if provided
      if (options.preferCurrentTab) {
        mediaOptions.preferCurrentTab = options.preferCurrentTab;
      }
      
      if (options.surfaceSwitching && typeof mediaOptions.video !== 'boolean' && mediaOptions.video) {
        mediaOptions.video.surfaceSwitching = options.surfaceSwitching;
      }
      
      if (options.selfBrowserSurface && typeof mediaOptions.video !== 'boolean' && mediaOptions.video) {
        mediaOptions.video.selfBrowserSurface = options.selfBrowserSurface;
      }
      
      if (options.systemAudio) {
        mediaOptions.audio = { systemAudio: options.systemAudio };
      }
      
      // Get screen capture stream
      const stream = await navigator.mediaDevices.getDisplayMedia(mediaOptions);
      
      return stream;
    } catch (err) {
      console.error('Error starting screen share:', err);
      return null;
    }
  };
  
  // Start optimized video sharing (for YouTube, etc.)
  const startOptimizedVideoShare = async (): Promise<MediaStream | null> => {
    try {
      // Enhanced options specifically optimized for YouTube and video content
      const mediaOptions: DisplayMediaStreamConstraints = {
        video: {
          cursor: 'always',
          displaySurface: 'browser',
          logicalSurface: true,
          // Higher frameRate for smoother video playback
          frameRate: { ideal: 60, max: 60 },
          // Higher resolution for better quality
          width: { ideal: 1920, max: 3840 },
          height: { ideal: 1080, max: 2160 },
          // Prioritize quality over performance
          contentHint: 'detail',
        },
        audio: {
          // Disable audio processing to preserve original audio quality
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          suppressLocalAudioPlayback: false,
          // Ensure system audio is included
          systemAudio: 'include',
        },
        // Prefer current tab for YouTube sharing
        preferCurrentTab: true,
      };
      
      console.log('Starting optimized video share with options:', mediaOptions);
      
      // Request the display media with optimized settings
      const stream = await navigator.mediaDevices.getDisplayMedia(mediaOptions);
      
      // Apply additional optimizations to the tracks
      stream.getVideoTracks().forEach(track => {
        // Set content hint to detail for better quality
        if ('contentHint' in track) {
          track.contentHint = 'detail';
        }
        
        // Log track constraints for debugging
        console.log('Video track settings:', track.getSettings());
        
        // Set track priority to high
        if (track.getConstraints) {
          const constraints = track.getConstraints();
          console.log('Video track constraints:', constraints);
        }
      });
      
      // Log audio tracks
      stream.getAudioTracks().forEach(track => {
        console.log('Audio track settings:', track.getSettings());
      });
      
      return stream;
    } catch (err) {
      console.error('Error starting optimized video share:', err);
      return null;
    }
  };
  
  // Stop screen sharing
  const stopScreenShare = (stream: MediaStream) => {
    stream.getTracks().forEach(track => track.stop());
  };
  
  return {
    startScreenShare,
    startOptimizedVideoShare,
    stopScreenShare,
  };
};