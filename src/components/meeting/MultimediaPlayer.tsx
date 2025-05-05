import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Upload,
  FileVideo,
  FileAudio,
  Trash2,
  Plus,
  Clock,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw
} from "lucide-react";
import { useAuth } from "contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Types
interface MediaItem {
  id: string;
  title: string;
  description?: string;
  type: "audio" | "video";
  url: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: Date;
  duration?: number; // in seconds
  thumbnail?: string;
}

interface MultimediaPlayerProps {
  meetingId: string;
  isHost: boolean;
}

const MultimediaPlayer: React.FC<MultimediaPlayerProps> = ({
  meetingId,
  isHost
}) => {
  const { user } = useAuth();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sample media items
  const sampleMediaItems: MediaItem[] = [
    {
      id: "sample1",
      title: "Introduction to Language Learning",
      description: "A brief overview of effective language learning techniques",
      type: "video",
      url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      uploadedBy: "system",
      uploadedByName: "System",
      uploadedAt: new Date(),
      duration: 120,
      thumbnail: "https://sample-videos.com/img/Sample-jpg-image-50kb.jpg"
    },
    {
      id: "sample2",
      title: "Pronunciation Practice: English Vowels",
      description: "Learn how to pronounce English vowel sounds correctly",
      type: "audio",
      url: "https://sample-videos.com/audio/mp3/crowd-cheering.mp3",
      uploadedBy: "system",
      uploadedByName: "System",
      uploadedAt: new Date(),
      duration: 60
    }
  ];

  // Initialize with sample media and load saved media from localStorage
  useEffect(() => {
    try {
      const savedMedia = localStorage.getItem('mediaItems');
      if (savedMedia) {
        const parsedMedia = JSON.parse(savedMedia);
        
        // Convert stored date strings back to Date objects
        const processedMedia = parsedMedia.map((item: any) => ({
          ...item,
          uploadedAt: new Date(item.uploadedAt),
          endedAt: item.endedAt ? new Date(item.endedAt) : undefined
        }));
        
        setMediaItems([...sampleMediaItems, ...processedMedia]);
      } else {
        setMediaItems(sampleMediaItems);
      }
    } catch (error) {
      console.error('Error loading saved media:', error);
      setMediaItems(sampleMediaItems);
    }
  }, []);

  // Handle media playback
  useEffect(() => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.play().catch((error: any) => {
          console.error("Error playing media:", error);
          setIsPlaying(false);
        });
      } else {
        mediaRef.current.pause();
      }
    }
  }, [isPlaying, currentMedia]);

  // Handle volume change
  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle time update
  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
    }
  };

  // Handle duration change
  const handleDurationChange = () => {
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration);
    }
  };

  // Handle media end
  const handleMediaEnd = () => {
    setIsPlaying(false);
    if (mediaRef.current) {
      mediaRef.current.currentTime = 0;
    }
    setCurrentTime(0);
  };

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Play media
  const playMedia = (mediaItem: MediaItem) => {
    setCurrentMedia(mediaItem);
    setIsPlaying(true);
  };

  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Seek to position
  const seekTo = (value: number[]) => {
    if (mediaRef.current && duration) {
      const newTime = value[0];
      mediaRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Skip forward 10 seconds
  const skipForward = () => {
    if (mediaRef.current) {
      const newTime = Math.min(mediaRef.current.currentTime + 10, duration);
      mediaRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Skip backward 10 seconds
  const skipBackward = () => {
    if (mediaRef.current) {
      const newTime = Math.max(mediaRef.current.currentTime - 10, 0);
      mediaRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err: { message: any; }) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check if file is audio or video
      if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
        alert('Please select an audio or video file');
        return;
      }

      // Check file size (25MB limit)
      if (file.size > 25 * 1024 * 1024) {
        alert('File size exceeds 25MB limit');
        return;
      }

      setUploadFile(file);

      // Set default title from filename
      const fileName = file.name.split('.').slice(0, -1).join('.');
      setUploadTitle(fileName);
    }
  };

  // Upload media
  const uploadMedia = () => {
    if (!uploadFile || !uploadTitle.trim()) {
      alert('Please select a file and enter a title');
      return;
    }

    setIsUploading(true);

    // Create a FileReader to read the file as a data URL
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target && event.target.result) {
        try {
          // Get file duration if possible
          let mediaDuration: number | undefined = undefined;
          
          // For audio files, we can create an audio element to get duration
          if (uploadFile!.type.startsWith('audio/')) {
            const audio = new Audio(event.target.result as string);
            audio.onloadedmetadata = () => {
              mediaDuration = audio.duration;
            };
          }
          
          // Create a new media item with the data URL
          const newMedia: MediaItem = {
            id: Math.random().toString(36).substring(2, 9),
            title: uploadTitle,
            description: uploadDescription,
            type: uploadFile!.type.startsWith('audio/') ? 'audio' : 'video',
            url: event.target.result as string, // Store as data URL for persistence
            uploadedBy: user?.email || 'anonymous',
            uploadedByName: user?.name || 'Anonymous',
            uploadedAt: new Date(),
            duration: mediaDuration
          };

          // Update state with the new media item
          const updatedMediaItems = [...mediaItems, newMedia];
          setMediaItems(updatedMediaItems);

          // Store in localStorage (excluding sample media)
          const savedMedia = updatedMediaItems.filter(item => !sampleMediaItems.some(sample => sample.id === item.id));
          localStorage.setItem('mediaItems', JSON.stringify(savedMedia));

          // Show success message
          alert(`Media "${uploadTitle}" uploaded successfully!`);

          // Reset form
          setIsUploading(false);
          setShowUploadDialog(false);
          setUploadFile(null);
          setUploadTitle("");
          setUploadDescription("");
          
          // Automatically play the newly uploaded media
          setTimeout(() => {
            playMedia(newMedia);
          }, 500);
        } catch (error) {
          console.error('Error processing uploaded file:', error);
          alert('Error processing file. Please try a different file.');
          setIsUploading(false);
        }
      }
    };

    reader.onerror = () => {
      alert('Error reading file. Please try again.');
      setIsUploading(false);
    };

    // Read the file as a data URL
    reader.readAsDataURL(uploadFile);
  };

  // Delete media
  const deleteMedia = (mediaId: string) => {
    // Check if this is a sample media item
    const isSampleMedia = sampleMediaItems.some(item => item.id === mediaId);

    // If the media is currently playing, stop it
    if (currentMedia?.id === mediaId) {
      setCurrentMedia(null);
      setIsPlaying(false);
    }

    // Update state
    const updatedMediaItems = mediaItems.filter((item: { id: string; }) => item.id !== mediaId);
    setMediaItems(updatedMediaItems);

    // If it's not a sample media item, update localStorage
    if (!isSampleMedia) {
      const savedMedia = updatedMediaItems.filter((item: { id: string; }) => !sampleMediaItems.some(sample => sample.id === item.id));
      localStorage.setItem('mediaItems', JSON.stringify(savedMedia));

      // Show confirmation
      alert('Media deleted successfully');
    }
  };

  return (
    <div className="multimedia-player h-full flex flex-col">
      <div className="header flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Multimedia Player</h2>

        {isHost && (
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload size={16} className="mr-2" />
                Upload Media
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Media</DialogTitle>
                <DialogDescription>
                  Upload audio or video files to share with participants.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="media-file" className="text-sm font-medium">
                    Select File (Max 25MB)
                  </label>
                  <Input
                    id="media-file"
                    type="file"
                    accept="audio/*,video/*"
                    onChange={handleFileSelect}
                  />
                  {uploadFile && (
                    <div className="text-xs text-gray-500">
                      {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(2)}MB)
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <label htmlFor="media-title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="media-title"
                    placeholder="Enter media title"
                    value={uploadTitle}
                    onChange={(e: { target: { value: any; }; }) => setUploadTitle(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="media-description" className="text-sm font-medium">
                    Description (Optional)
                  </label>
                  <Input
                    id="media-description"
                    placeholder="Enter media description"
                    value={uploadDescription}
                    onChange={(e: { target: { value: any; }; }) => setUploadDescription(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={uploadMedia} disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col md:flex-row h-full">
        {/* Media player */}
        <div className="w-full md:w-2/3 p-4 flex flex-col">
          <div
            ref={containerRef}
            className={`media-container relative bg-black rounded-lg flex items-center justify-center ${
              currentMedia ? 'flex-1' : 'aspect-video'
            }`}
          >
            {currentMedia ? (
              <>
                {currentMedia.type === 'video' ? (
                  <video
                    ref={mediaRef as React.RefObject<HTMLVideoElement>}
                    src={currentMedia.url}
                    className="max-h-full max-w-full"
                    onTimeUpdate={handleTimeUpdate}
                    onDurationChange={handleDurationChange}
                    onEnded={handleMediaEnd}
                    controls={false}
                    playsInline
                    preload="auto"
                  />
                ) : (
                  <>
                    <audio
                      ref={mediaRef as React.RefObject<HTMLAudioElement>}
                      src={currentMedia.url}
                      className="hidden"
                      onTimeUpdate={handleTimeUpdate}
                      onDurationChange={handleDurationChange}
                      onEnded={handleMediaEnd}
                      controls={false}
                      preload="auto"
                    />
                    <div className="text-center p-8">
                      <FileAudio size={64} className="mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-medium text-white">{currentMedia.title}</h3>
                      {currentMedia.description && (
                        <p className="text-gray-300 mt-2">{currentMedia.description}</p>
                      )}
                      <div className="mt-4 text-sm text-gray-400">
                        <p>Audio is playing. Use the controls below to adjust playback.</p>
                        <p className="mt-2">Current time: {formatTime(currentTime)} / {formatTime(duration)}</p>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center p-8">
                <FileVideo size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-medium text-gray-300">No media selected</h3>
                <p className="text-gray-400 mt-2">Select a media file from the library to play</p>
              </div>
            )}
          </div>

          {/* Media controls */}
          <div className="mt-4 space-y-2">
            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <span className="text-xs">{formatTime(currentTime)}</span>
              <Slider
                value={[currentTime]}
                min={0}
                max={duration || 100}
                step={1}
                onValueChange={seekTo}
                disabled={!currentMedia}
                className="flex-1"
              />
              <span className="text-xs">{formatTime(duration)}</span>
            </div>

            {/* Control buttons */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  disabled={!currentMedia}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </Button>
                <Slider
                  value={[volume * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value: number[]) => setVolume(value[0] / 100)}
                  disabled={!currentMedia || isMuted}
                  className="w-24"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (mediaRef.current) {
                      mediaRef.current.currentTime = 0;
                      setCurrentTime(0);
                    }
                  }}
                  disabled={!currentMedia}
                  title="Restart"
                >
                  <RotateCcw size={20} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipBackward}
                  disabled={!currentMedia}
                  title="Skip back 10 seconds"
                >
                  <SkipBack size={20} />
                </Button>
                <Button
                  size="icon"
                  onClick={togglePlay}
                  disabled={!currentMedia}
                  className="h-12 w-12 rounded-full"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipForward}
                  disabled={!currentMedia}
                  title="Skip forward 10 seconds"
                >
                  <SkipForward size={20} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    // Find the next media item in the list
                    if (currentMedia) {
                      const currentIndex = mediaItems.findIndex((item: { id: any; }) => item.id === currentMedia.id);
                      if (currentIndex >= 0 && currentIndex < mediaItems.length - 1) {
                        playMedia(mediaItems[currentIndex + 1]);
                      }
                    }
                  }}
                  disabled={!currentMedia || mediaItems.findIndex((item: { id: any; }) => item.id === currentMedia?.id) === mediaItems.length - 1}
                  title="Next media"
                >
                  <RotateCw size={20} />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                disabled={!currentMedia || currentMedia.type !== 'video'}
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </Button>
            </div>
          </div>

          {/* Current media info */}
          {currentMedia && (
            <div className="mt-4">
              <h3 className="text-lg font-medium">{currentMedia.title}</h3>
              {currentMedia.description && (
                <p className="text-gray-600 mt-1">{currentMedia.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Badge variant="outline">
                  {currentMedia.type === 'video' ? 'Video' : 'Audio'}
                </Badge>
                <span>Uploaded by {currentMedia.uploadedByName}</span>
                <span>•</span>
                <span>{currentMedia.uploadedAt.toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Media library */}
        <div className="w-full md:w-1/3 border-t md:border-t-0 md:border-l p-4">
          <h3 className="text-lg font-medium mb-4">Media Library</h3>
          <ScrollArea className="h-[calc(100%-2rem)]">
            <div className="space-y-3">
              {mediaItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No media available. {isHost && "Upload media to get started."}
                </div>
              ) : (
                mediaItems.map((item: MediaItem) => (
                  <Card
                    key={item.id}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                      currentMedia?.id === item.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => playMedia(item)}
                  >
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          {item.type === 'video' ? (
                            item.thumbnail ? (
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <FileVideo size={24} className="text-gray-400" />
                            )
                          ) : (
                            <FileAudio size={24} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.title}</h4>
                          {item.description && (
                            <p className="text-xs text-gray-500 truncate">{item.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.type === 'video' ? 'Video' : 'Audio'}
                            </Badge>
                            {item.duration && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock size={12} className="mr-1" />
                                {formatTime(item.duration)}
                              </span>
                            )}
                          </div>
                        </div>
                        {isHost && item.uploadedBy !== 'system' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
                            onClick={(e: { stopPropagation: () => void; }) => {
                              e.stopPropagation();
                              deleteMedia(item.id);
                            }}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default MultimediaPlayer;