import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Check,
  X
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

// Types
interface BackgroundOption {
  id: string;
  type: "blur" | "image" | "none";
  url?: string;
  name: string;
  thumbnail?: string;
}

interface VirtualBackgroundProps {
  onSelectBackground: (background: BackgroundOption) => void;
  currentBackground?: BackgroundOption;
}

const VirtualBackground: React.FC<VirtualBackgroundProps> = ({
  onSelectBackground,
  currentBackground
}) => {
  const [activeTab, setActiveTab] = useState<"backgrounds" | "blur">("backgrounds");
  const [blurAmount, setBlurAmount] = useState<number>(5);
  const [uploadedBackgrounds, setUploadedBackgrounds] = useState<BackgroundOption[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default background options
  const defaultBackgrounds: BackgroundOption[] = [
    {
      id: "none",
      type: "none",
      name: "None",
    },
    {
      id: "office",
      type: "image",
      url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
      name: "Office",
      thumbnail: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=200"
    },
    {
      id: "classroom",
      type: "image",
      url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b",
      name: "Classroom",
      thumbnail: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=200"
    },
    {
      id: "library",
      type: "image",
      url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da",
      name: "Library",
      thumbnail: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=200"
    },
    {
      id: "cafe",
      type: "image",
      url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
      name: "Café",
      thumbnail: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200"
    },
    {
      id: "nature",
      type: "image",
      url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
      name: "Nature",
      thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200"
    }
  ];

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit');
        return;
      }

      // Create object URLs for the image
      const objectUrl = URL.createObjectURL(file);

      // Pre-load the image to ensure it's properly loaded before using
      const img = new Image();
      img.onload = () => {
        const newBackground: BackgroundOption = {
          id: Math.random().toString(36).substring(2, 9),
          type: "image",
          url: objectUrl,
          name: file.name.split('.')[0] || "Custom Background",
          thumbnail: objectUrl
        };

        setUploadedBackgrounds(prev => [...prev, newBackground]);

        // Automatically apply the new background
        applyBackground(newBackground);
      };

      img.onerror = () => {
        alert('Failed to load image. Please try another file.');
        URL.revokeObjectURL(objectUrl);
      };

      img.src = objectUrl;
    }
  };

  // Delete uploaded background
  const deleteBackground = (id: string) => {
    setUploadedBackgrounds(prev => prev.filter(bg => bg.id !== id));
  };

  // Apply blur background
  const applyBlurBackground = () => {
    const blurBackground: BackgroundOption = {
      id: "blur",
      type: "blur",
      name: `Blur (${blurAmount}px)`,
    };

    onSelectBackground(blurBackground);
  };

  // Apply background
  const applyBackground = (background: BackgroundOption) => {
    onSelectBackground(background);
  };

  // Check if a background is currently selected
  const isSelected = (id: string) => {
    return currentBackground?.id === id;
  };

  return (
    <div className="virtual-background h-full flex flex-col">
      <div className="header flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Virtual Background</h2>

        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload size={16} className="mr-2" />
          Upload Image
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*"
        />
      </div>

      <Tabs
        defaultValue="backgrounds"
        className="flex-1 flex flex-col"
        onValueChange={(value) => setActiveTab(value as "backgrounds" | "blur")}
        value={activeTab}
      >
        <div className="px-4 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="backgrounds" className="flex-1">
              <ImageIcon size={16} className="mr-2" />
              Backgrounds
            </TabsTrigger>
            <TabsTrigger value="blur" className="flex-1">
              Blur
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="backgrounds" className="flex-1 p-4 overflow-auto">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {/* Default backgrounds */}
              <div>
                <h3 className="text-sm font-medium mb-2">Default Backgrounds</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {defaultBackgrounds.map(background => (
                    <Card
                      key={background.id}
                      className={`cursor-pointer overflow-hidden ${
                        isSelected(background.id) ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => applyBackground(background)}
                    >
                      <CardContent className="p-0 relative">
                        {background.type === "none" ? (
                          <div className="h-24 bg-gray-100 flex items-center justify-center">
                            <X size={24} className="text-gray-400" />
                          </div>
                        ) : (
                          <div
                            className="h-24 bg-cover bg-center"
                            style={{
                              backgroundImage: `url(${background.thumbnail})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat'
                            }}
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all">
                          {isSelected(background.id) && (
                            <div className="bg-blue-500 text-white p-1 rounded-full animate-pulse">
                              <Check size={16} />
                            </div>
                          )}
                        </div>
                        <div className="p-2 text-center text-sm truncate">
                          {background.name}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Uploaded backgrounds */}
              {uploadedBackgrounds.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Your Backgrounds</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {uploadedBackgrounds.map(background => (
                      <Card
                        key={background.id}
                        className={`cursor-pointer overflow-hidden ${
                          isSelected(background.id) ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => applyBackground(background)}
                      >
                        <CardContent className="p-0 relative">
                          <div
                            className="h-24 bg-cover bg-center"
                            style={{
                              backgroundImage: `url(${background.thumbnail})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat'
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all">
                            {isSelected(background.id) ? (
                              <div className="bg-blue-500 text-white p-1 rounded-full">
                                <Check size={16} />
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteBackground(background.id);
                                }}
                              >
                                <Trash2 size={12} />
                              </Button>
                            )}
                          </div>
                          <div className="p-2 text-center text-sm truncate">
                            {background.name}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="blur" className="flex-1 p-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-4">Background Blur</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Blur Amount</span>
                    <span>{blurAmount}px</span>
                  </div>
                  <Slider
                    value={[blurAmount]}
                    min={1}
                    max={20}
                    step={1}
                    onValueChange={(value) => setBlurAmount(value[0])}
                  />
                </div>

                <div className="flex justify-center">
                  <div
                    className="w-48 h-48 rounded-full overflow-hidden bg-cover bg-center border-4 border-white shadow-lg"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200')`,
                      filter: `blur(${blurAmount}px)`,
                      margin: `${blurAmount}px`
                    }}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={applyBlurBackground}
                  variant={isSelected("blur") ? "secondary" : "default"}
                >
                  {isSelected("blur") ? "Applied" : "Apply Blur"}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VirtualBackground;