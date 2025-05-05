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
      // Use a more compatible approach with basic options first
      let mediaOptions: any = {
        video: true,
        audio: true
      };
      
      // Check if browser supports advanced constraints
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      const isFirefox = /Firefox/.test(navigator.userAgent);
      const isEdge = /Edg/.test(navigator.userAgent);
      
      console.log('Browser detection:', { isChrome, isFirefox, isEdge });
      
      // Apply advanced options for supported browsers
      if (isChrome || isEdge) {
        // Chrome and Edge support more advanced options
        mediaOptions = {
          video: {
            cursor: 'always',
            // Higher frameRate for smoother video playback
            frameRate: { ideal: 30 },
            // Higher resolution for better quality
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: {
            // Disable audio processing to preserve original audio quality
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          }
        };
        
        // Add Chrome-specific options
        if (isChrome) {
          // @ts-ignore - TypeScript doesn't recognize these Chrome-specific options
          mediaOptions.preferCurrentTab = true;
        }
      } else if (isFirefox) {
        // Firefox has different constraints
        mediaOptions = {
          video: {
            frameRate: { ideal: 30 },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: true
        };
      }
      
      console.log('Starting optimized video share with options:', mediaOptions);
      
      // Request the display media with optimized settings
      const stream = await navigator.mediaDevices.getDisplayMedia(mediaOptions);
      
      // Apply additional optimizations to the tracks if supported
      stream.getVideoTracks().forEach(track => {
        try {
          // Set content hint to detail for better quality if supported
          if ('contentHint' in track) {
            track.contentHint = 'detail';
          }
          
          // Log track constraints for debugging
          console.log('Video track settings:', track.getSettings());
        } catch (e) {
          console.warn('Could not apply video track optimizations:', e);
        }
      });
      
      // Log audio tracks
      stream.getAudioTracks().forEach(track => {
        console.log('Audio track settings:', track.getSettings());
      });
      
      return stream;
    } catch (err) {
      console.error('Error starting optimized video share:', err);
      alert('Failed to start optimized video sharing. Please try regular screen sharing instead.');
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