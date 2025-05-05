import React, { useState } from 'react';

interface MediaPermissionPromptProps {
  onPermissionGranted: () => void;
  onPermissionDenied: () => void;
}

const MediaPermissionPrompt: React.FC<MediaPermissionPromptProps> = ({
  onPermissionGranted,
  onPermissionDenied
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermissions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      
      // Stop the stream immediately as we just needed to request permissions
      stream.getTracks().forEach(track => track.stop());
      
      // Notify parent component that permissions were granted
      onPermissionGranted();
    } catch (err) {
      console.error('Error requesting media permissions:', err);
      
      // Determine the specific error message
      let errorMessage = 'Could not access camera or microphone.';
      
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = 'Permission to use camera and microphone was denied. Please allow access in your browser settings.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMessage = 'No camera or microphone found. Please connect a device and try again.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMessage = 'Your camera or microphone is already in use by another application.';
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'The requested camera or microphone settings are not supported by your device.';
        } else if (err.name === 'TypeError') {
          errorMessage = 'No permission was requested because constraints were invalid.';
        }
      }
      
      setError(errorMessage);
      
      // Notify parent component that permissions were denied
      onPermissionDenied();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-2 sm:mx-4">
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Camera & Microphone Access</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            ElMeet needs access to your camera and microphone to enable video conferencing. 
            Please allow access when prompted by your browser.
          </p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded relative mb-3 sm:mb-4 text-sm sm:text-base" role="alert">
              <span className="block">{error}</span>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
            <button
              onClick={requestPermissions}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 sm:px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm sm:text-base"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Requesting Access...
                </span>
              ) : (
                'Allow Access'
              )}
            </button>
            <button
              onClick={onPermissionDenied}
              disabled={isLoading}
              className="border border-gray-300 bg-white text-gray-700 font-medium py-2 px-3 sm:px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-sm sm:text-base"
            >
              Continue Without Media
            </button>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-3 sm:mt-4">
          <p>
            If you deny permission, you can still join the meeting, but others won't be able to see or hear you.
            You can change your permissions later in your browser settings.
          </p>
          
          {/* Device-specific instructions */}
          <div className="mt-2">
            {/iPhone|iPad|iPod/.test(navigator.userAgent) && (
              <p className="text-xs text-blue-600">
                <strong>iOS users:</strong> If prompted, you must allow camera and microphone access in your browser settings.
              </p>
            )}
            {/Android/.test(navigator.userAgent) && (
              <p className="text-xs text-blue-600">
                <strong>Android users:</strong> Please allow permissions when prompted by your browser.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPermissionPrompt;