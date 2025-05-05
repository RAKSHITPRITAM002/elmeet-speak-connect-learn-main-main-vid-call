// Media Optimization Service for YouTube and other media sources

export interface MediaOptimizationOptions {
  // Video options
  videoQuality?: 'auto' | 'low' | 'medium' | 'high' | 'hd';
  frameRate?: number;
  bitrateMultiplier?: number;
  
  // Audio options
  audioQuality?: 'auto' | 'low' | 'medium' | 'high';
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
  
  // Network options
  prioritizeLatency?: boolean;
  bufferSize?: 'small' | 'medium' | 'large';
  
  // YouTube specific options
  youtubeOptimized?: boolean;
  youtubeQuality?: '360p' | '480p' | '720p' | '1080p';
}

export interface YouTubeOptimizationResult {
  success: boolean;
  optimizedUrl?: string;
  embedCode?: string;
  error?: string;
}

export class MediaOptimizationService {
  // Default optimization options
  private static defaultOptions: MediaOptimizationOptions = {
    videoQuality: 'auto',
    frameRate: 30,
    bitrateMultiplier: 1.0,
    audioQuality: 'auto',
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    prioritizeLatency: true,
    bufferSize: 'small',
    youtubeOptimized: true,
    youtubeQuality: '720p',
  };
  
  // Apply optimization to screen sharing
  static optimizeScreenShare(stream: MediaStream, options?: Partial<MediaOptimizationOptions>): MediaStream {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    // Apply video track constraints
    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length > 0) {
      const videoTrack = videoTracks[0];
      
      // Set content hint for better encoding
      if ('contentHint' in videoTrack) {
        // For screen sharing with video content
        if (mergedOptions.youtubeOptimized) {
          videoTrack.contentHint = 'motion';
        } else {
          // For regular screen sharing (presentations, etc.)
          videoTrack.contentHint = 'detail';
        }
      }
      
      // Apply constraints based on quality setting
      const constraints: MediaTrackConstraints = {};
      
      if (mergedOptions.videoQuality !== 'auto') {
        // Set resolution based on quality
        switch (mergedOptions.videoQuality) {
          case 'low':
            constraints.width = { ideal: 640 };
            constraints.height = { ideal: 360 };
            break;
          case 'medium':
            constraints.width = { ideal: 1280 };
            constraints.height = { ideal: 720 };
            break;
          case 'high':
          case 'hd':
            constraints.width = { ideal: 1920 };
            constraints.height = { ideal: 1080 };
            break;
        }
      }
      
      // Set frame rate
      if (mergedOptions.frameRate) {
        constraints.frameRate = { ideal: mergedOptions.frameRate };
      }
      
      // Apply constraints if any were set
      if (Object.keys(constraints).length > 0) {
        try {
          videoTrack.applyConstraints(constraints)
            .catch(err => console.error('Error applying video constraints:', err));
        } catch (err) {
          console.error('Error applying video constraints:', err);
        }
      }
    }
    
    // Apply audio track constraints
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
      const audioTrack = audioTracks[0];
      
      // Apply constraints based on quality setting
      const constraints: MediaTrackConstraints = {
        echoCancellation: mergedOptions.echoCancellation,
        noiseSuppression: mergedOptions.noiseSuppression,
        autoGainControl: mergedOptions.autoGainControl,
      };
      
      // Apply constraints
      try {
        audioTrack.applyConstraints(constraints)
          .catch(err => console.error('Error applying audio constraints:', err));
      } catch (err) {
        console.error('Error applying audio constraints:', err);
      }
    }
    
    return stream;
  }
  
  // Optimize YouTube URL for embedding with low latency
  static optimizeYouTubeUrl(youtubeUrl: string, options?: Partial<MediaOptimizationOptions>): YouTubeOptimizationResult {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      // Extract video ID from various YouTube URL formats
      let videoId = '';
      
      // Standard YouTube URL: https://www.youtube.com/watch?v=VIDEO_ID
      const standardMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/user\/\S+\/\S+\/|youtube\.com\/user\/\S+\/|youtube\.com\/\S+\/\S+\/|youtube\.com\/\S+\/|youtube\.com\/attribution_link\?a=\S+&u=\/watch\?v=|youtube\.com\/attribution_link\?a=\S+&u=%2Fwatch%3Fv%3D)([^#\&\?]*)/);
      
      if (standardMatch && standardMatch[1]) {
        videoId = standardMatch[1];
      } else {
        return {
          success: false,
          error: 'Invalid YouTube URL format',
        };
      }
      
      // Build optimized URL with parameters for low latency
      let optimizedUrl = `https://www.youtube.com/embed/${videoId}?`;
      
      // Add parameters for better performance
      const params = [
        'autoplay=1',                 // Autoplay when shared
        'rel=0',                      // Don't show related videos
        'modestbranding=1',           // Minimal YouTube branding
        'enablejsapi=1',              // Enable JavaScript API
        'origin=' + window.location.origin, // Security
      ];
      
      // Add quality parameter based on options
      if (mergedOptions.youtubeQuality) {
        switch (mergedOptions.youtubeQuality) {
          case '360p':
            params.push('vq=small');
            break;
          case '480p':
            params.push('vq=medium');
            break;
          case '720p':
            params.push('vq=hd720');
            break;
          case '1080p':
            params.push('vq=hd1080');
            break;
        }
      }
      
      // If prioritizing latency, use lower latency settings
      if (mergedOptions.prioritizeLatency) {
        params.push('playsinline=1');  // Play inline on mobile
        params.push('fs=0');           // Disable fullscreen button
        
        // Set buffer size based on option
        switch (mergedOptions.bufferSize) {
          case 'small':
            params.push('buffer=0');   // Minimal buffering
            break;
          case 'medium':
            params.push('buffer=1');   // Medium buffering
            break;
          case 'large':
            params.push('buffer=2');   // Large buffering
            break;
        }
      }
      
      // Join all parameters
      optimizedUrl += params.join('&');
      
      // Create embed code
      const embedCode = `<iframe width="100%" height="100%" src="${optimizedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      
      return {
        success: true,
        optimizedUrl,
        embedCode,
      };
    } catch (error) {
      console.error('Error optimizing YouTube URL:', error);
      return {
        success: false,
        error: 'Failed to optimize YouTube URL',
      };
    }
  }
  
  // Check if a URL is a valid YouTube URL
  static isYouTubeUrl(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
  }
  
  // Extract video ID from YouTube URL
  static getYouTubeVideoId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/user\/\S+\/\S+\/|youtube\.com\/user\/\S+\/|youtube\.com\/\S+\/\S+\/|youtube\.com\/\S+\/|youtube\.com\/attribution_link\?a=\S+&u=\/watch\?v=|youtube\.com\/attribution_link\?a=\S+&u=%2Fwatch%3Fv%3D)([^#\&\?]*)/);
    return match && match[1] ? match[1] : null;
  }
  
  // Apply network optimizations for WebRTC
  static optimizeWebRTCConnection(peerConnection: RTCPeerConnection, options?: Partial<MediaOptimizationOptions>): void {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      // Set priority for media over data
      if (mergedOptions.prioritizeLatency) {
        // Set high priority for audio
        peerConnection.getSenders().forEach(sender => {
          if (sender.track?.kind === 'audio') {
            const parameters = sender.getParameters();
            // Check if encodings array exists and has elements
            if (parameters.encodings && parameters.encodings.length > 0) {
              // Set priority on each encoding
              parameters.encodings.forEach(encoding => {
                encoding.priority = 'high';
              });
              
              sender.setParameters(parameters).catch(err => {
                console.error('Error setting audio priority:', err);
              });
            }
          }
        });
        
        // Set appropriate encoding parameters for video
        peerConnection.getSenders().forEach(sender => {
          if (sender.track?.kind === 'video') {
            const parameters = sender.getParameters();
            if (parameters.encodings && parameters.encodings.length > 0) {
              // Adjust encoding parameters based on options
              parameters.encodings.forEach(encoding => {
                // Set appropriate bitrate multiplier
                if (mergedOptions.bitrateMultiplier && mergedOptions.bitrateMultiplier !== 1.0) {
                  if (encoding.maxBitrate) {
                    encoding.maxBitrate = encoding.maxBitrate * mergedOptions.bitrateMultiplier;
                  }
                }
                
                // Set priority based on content type
                if (sender.track?.contentHint === 'motion') {
                  encoding.priority = 'high';
                }
              });
              
              sender.setParameters(parameters).catch(err => {
                console.error('Error setting video encoding parameters:', err);
              });
            }
          }
        });
      }
    } catch (err) {
      console.error('Error optimizing WebRTC connection:', err);
    }
  }
}

// Hook for using media optimization in components
export const useMediaOptimization = () => {
  return {
    optimizeScreenShare: MediaOptimizationService.optimizeScreenShare,
    optimizeYouTubeUrl: MediaOptimizationService.optimizeYouTubeUrl,
    isYouTubeUrl: MediaOptimizationService.isYouTubeUrl,
    getYouTubeVideoId: MediaOptimizationService.getYouTubeVideoId,
    optimizeWebRTCConnection: MediaOptimizationService.optimizeWebRTCConnection,
  };
};