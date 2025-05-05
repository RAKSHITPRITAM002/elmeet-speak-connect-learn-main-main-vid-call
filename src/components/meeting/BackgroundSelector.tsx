import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Camera, 
  Image, 
  Palette, 
  Upload, 
  Check, 
  X, 
  RefreshCw,
  Sliders
} from 'lucide-react';

interface BackgroundSelectorProps {
  onSelectBackground: (type: string, value: string | null) => void;
  onBlurAmount: (amount: number) => void;
  onClose: () => void;
  currentVideoStream?: MediaStream;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  onSelectBackground,
  onBlurAmount,
  onClose,
  currentVideoStream
}) => {
  const [activeTab, setActiveTab] = useState('blur');
  const [blurAmount, setBlurAmount] = useState(10);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [customBackgrounds, setCustomBackgrounds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sample background images
  const sampleBackgrounds = [
    '/backgrounds/office.jpg',
    '/backgrounds/beach.jpg',
    '/backgrounds/mountains.jpg',
    '/backgrounds/library.jpg',
    '/backgrounds/cafe.jpg',
    '/backgrounds/abstract1.jpg',
    '/backgrounds/abstract2.jpg',
    '/backgrounds/classroom.jpg',
  ];

  // Sample solid colors
  const sampleColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6B7280', // Gray
    '#000000', // Black
  ];

  useEffect(() => {
    // Set up video preview if stream is provided
    if (currentVideoStream && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = currentVideoStream;
      videoPreviewRef.current.play().catch(err => console.error("Error playing video:", err));
    }

    // Load custom backgrounds from localStorage
    try {
      const savedBackgrounds = localStorage.getItem('customBackgrounds');
      if (savedBackgrounds) {
        setCustomBackgrounds(JSON.parse(savedBackgrounds));
      }
    } catch (error) {
      console.error('Error loading custom backgrounds:', error);
    }
  }, [currentVideoStream]);

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const imageUrl = event.target.result as string;
        
        // Add to custom backgrounds
        const updatedBackgrounds = [...customBackgrounds, imageUrl];
        setCustomBackgrounds(updatedBackgrounds);
        
        // Save to localStorage
        try {
          localStorage.setItem('customBackgrounds', JSON.stringify(updatedBackgrounds));
        } catch (error) {
          console.error('Error saving custom backgrounds:', error);
        }

        // Select the uploaded background
        setSelectedBackground(imageUrl);
        onSelectBackground('image', imageUrl);
        setActiveTab('custom');
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      alert('Error reading file. Please try again.');
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveCustomBackground = (index: number) => {
    const updatedBackgrounds = [...customBackgrounds];
    updatedBackgrounds.splice(index, 1);
    setCustomBackgrounds(updatedBackgrounds);
    
    // Save to localStorage
    try {
      localStorage.setItem('customBackgrounds', JSON.stringify(updatedBackgrounds));
    } catch (error) {
      console.error('Error saving custom backgrounds:', error);
    }

    // If the removed background was selected, reset selection
    if (selectedBackground === customBackgrounds[index]) {
      setSelectedBackground(null);
      onSelectBackground('none', null);
    }
  };

  const handleSelectBackground = (type: string, value: string | null) => {
    setSelectedBackground(value);
    onSelectBackground(type, value);
  };

  const handleBlurChange = (value: number[]) => {
    const amount = value[0];
    setBlurAmount(amount);
    onBlurAmount(amount);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const takeSnapshot = () => {
    if (!videoPreviewRef.current || !canvasRef.current) return;
    
    const video = videoPreviewRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL
    const imageUrl = canvas.toDataURL('image/jpeg');
    
    // Add to custom backgrounds
    const updatedBackgrounds = [...customBackgrounds, imageUrl];
    setCustomBackgrounds(updatedBackgrounds);
    
    // Save to localStorage
    try {
      localStorage.setItem('customBackgrounds', JSON.stringify(updatedBackgrounds));
    } catch (error) {
      console.error('Error saving custom backgrounds:', error);
    }

    // Select the snapshot as background
    setSelectedBackground(imageUrl);
    onSelectBackground('image', imageUrl);
    setActiveTab('custom');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-3xl">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Choose Your Background</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>

      <div className="flex">
        {/* Preview panel */}
        <div className="w-1/3 p-4 border-r">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
            <video 
              ref={videoPreviewRef} 
              className="w-full h-full object-cover" 
              autoPlay 
              playsInline 
              muted
            />
            {selectedBackground && activeTab === 'images' && (
              <div 
                className="absolute inset-0 z-0" 
                style={{ 
                  backgroundImage: `url(${selectedBackground})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            )}
            {selectedBackground && activeTab === 'colors' && (
              <div 
                className="absolute inset-0 z-0" 
                style={{ backgroundColor: selectedBackground }}
              />
            )}
            {activeTab === 'blur' && (
              <div 
                className="absolute inset-0 z-0 backdrop-blur" 
                style={{ backdropFilter: `blur(${blurAmount}px)` }}
              />
            )}
          </div>

          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={takeSnapshot}
              disabled={!currentVideoStream}
            >
              <Camera size={16} className="mr-2" />
              Take Snapshot
            </Button>

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={triggerFileUpload}
            >
              <Upload size={16} className="mr-2" />
              Upload Image
            </Button>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleBackgroundUpload}
            />

            <Button 
              variant="default" 
              className="w-full" 
              onClick={() => {
                setSelectedBackground(null);
                onSelectBackground('none', null);
              }}
            >
              <RefreshCw size={16} className="mr-2" />
              Reset Background
            </Button>
          </div>

          {/* Hidden canvas for taking snapshots */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Options panel */}
        <div className="w-2/3 p-4">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="blur">
                <Sliders size={16} className="mr-2" />
                Blur
              </TabsTrigger>
              <TabsTrigger value="images">
                <Image size={16} className="mr-2" />
                Images
              </TabsTrigger>
              <TabsTrigger value="colors">
                <Palette size={16} className="mr-2" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="custom">
                <Upload size={16} className="mr-2" />
                Custom
              </TabsTrigger>
            </TabsList>

            <TabsContent value="blur" className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Blur Amount: {blurAmount}px</Label>
                <Slider
                  value={[blurAmount]}
                  min={0}
                  max={30}
                  step={1}
                  onValueChange={handleBlurChange}
                  className="w-full"
                />
              </div>
              <p className="text-sm text-gray-500">
                Blur your background to maintain privacy while keeping your presence natural.
              </p>
            </TabsContent>

            <TabsContent value="images">
              <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
                {sampleBackgrounds.map((bg, index) => (
                  <div 
                    key={index} 
                    className={`aspect-video rounded-lg overflow-hidden cursor-pointer relative ${
                      selectedBackground === bg ? 'ring-2 ring-blue-500' : 'hover:opacity-90'
                    }`}
                    onClick={() => handleSelectBackground('image', bg)}
                  >
                    <img src={bg} alt={`Background ${index + 1}`} className="w-full h-full object-cover" />
                    {selectedBackground === bg && (
                      <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-1">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="colors">
              <div className="grid grid-cols-4 gap-3 mb-4">
                {sampleColors.map((color, index) => (
                  <div 
                    key={index} 
                    className={`aspect-square rounded-lg cursor-pointer relative ${
                      selectedBackground === color ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:opacity-90'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleSelectBackground('color', color)}
                  >
                    {selectedBackground === color && (
                      <div className="absolute top-1 right-1 bg-white rounded-full p-1">
                        <Check size={12} className="text-blue-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <Label htmlFor="custom-color" className="text-sm font-medium mb-2 block">Custom Color</Label>
                <div className="flex gap-2">
                  <Input 
                    id="custom-color" 
                    type="color" 
                    className="w-12 h-10 p-1" 
                    onChange={(e) => handleSelectBackground('color', e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => handleSelectBackground('color', '#' + Math.floor(Math.random()*16777215).toString(16))}
                  >
                    Random Color
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom">
              {customBackgrounds.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
                  {customBackgrounds.map((bg, index) => (
                    <div 
                      key={index} 
                      className={`aspect-video rounded-lg overflow-hidden cursor-pointer relative ${
                        selectedBackground === bg ? 'ring-2 ring-blue-500' : 'hover:opacity-90'
                      }`}
                    >
                      <img 
                        src={bg} 
                        alt={`Custom background ${index + 1}`} 
                        className="w-full h-full object-cover"
                        onClick={() => handleSelectBackground('image', bg)}
                      />
                      <button
                        className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveCustomBackground(index)}
                      >
                        <X size={12} className="text-white" />
                      </button>
                      {selectedBackground === bg && (
                        <div className="absolute top-1 left-1 bg-blue-500 rounded-full p-1">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Image size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Custom Backgrounds</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Upload your own images or take a snapshot to create custom backgrounds.
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" onClick={triggerFileUpload}>
                      <Upload size={16} className="mr-2" />
                      Upload Image
                    </Button>
                    <Button variant="outline" onClick={takeSnapshot} disabled={!currentVideoStream}>
                      <Camera size={16} className="mr-2" />
                      Take Snapshot
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="flex justify-end p-4 border-t">
        <Button variant="outline" className="mr-2" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onClose}>
          Apply
        </Button>
      </div>
    </div>
  );
};

export default BackgroundSelector;