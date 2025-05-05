import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { 
  Pencil, 
  MousePointer, 
  Square, 
  Circle, 
  Type, 
  Eraser, 
  Trash2, 
  ChevronUp, 
  ChevronDown,
  Move,
  X,
  Save
} from 'lucide-react';

interface FloatingAnnotationToolbarProps {
  isVisible: boolean;
  onToolChange: (tool: string) => void;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onClear: () => void;
  onSave: () => void;
  onClose: () => void;
  currentTool: string;
  currentColor: string;
  currentWidth: number;
}

const FloatingAnnotationToolbar: React.FC<FloatingAnnotationToolbarProps> = ({
  isVisible,
  onToolChange,
  onColorChange,
  onWidthChange,
  onClear,
  onSave,
  onClose,
  currentTool,
  currentColor,
  currentWidth
}) => {
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Colors for the color picker
  const colors = [
    '#000000', // Black
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFFFFF', // White
  ];

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 ${isCollapsed ? 'w-12' : 'w-64'}`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transition: 'width 0.3s ease'
      }}
    >
      {/* Toolbar header with drag handle */}
      <div 
        className="flex items-center justify-between p-2 bg-gray-100 rounded-t-lg cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center">
          <Move size={16} className="mr-2 text-gray-500" />
          {!isCollapsed && <span className="text-sm font-medium">Annotation Tools</span>}
        </div>
        <div className="flex items-center">
          {isCollapsed ? (
            <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(false)} className="h-6 w-6 p-0">
              <ChevronDown size={16} />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(true)} className="h-6 w-6 p-0">
              <ChevronUp size={16} />
            </Button>
          )}
          {!isCollapsed && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 ml-1">
              <X size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Toolbar content */}
      {!isCollapsed && (
        <div className="p-3">
          {/* Drawing tools */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={currentTool === 'pointer' ? "default" : "outline"} 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => onToolChange('pointer')}
                  >
                    <MousePointer size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Pointer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={currentTool === 'pen' ? "default" : "outline"} 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => onToolChange('pen')}
                  >
                    <Pencil size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Pen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={currentTool === 'rectangle' ? "default" : "outline"} 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => onToolChange('rectangle')}
                  >
                    <Square size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rectangle</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={currentTool === 'circle' ? "default" : "outline"} 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => onToolChange('circle')}
                  >
                    <Circle size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Circle</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={currentTool === 'text' ? "default" : "outline"} 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => onToolChange('text')}
                  >
                    <Type size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Text</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={currentTool === 'eraser' ? "default" : "outline"} 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => onToolChange('eraser')}
                  >
                    <Eraser size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Eraser</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={onClear}
                  >
                    <Trash2 size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear All</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={onSave}
                  >
                    <Save size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save Annotations</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Color picker */}
          <div className="mb-4">
            <label className="text-xs font-medium mb-2 block">Color</label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`h-6 w-6 rounded-full border ${
                    currentColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onColorChange(color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Stroke width slider */}
          <div>
            <label className="text-xs font-medium mb-2 block">Stroke Width: {currentWidth}px</label>
            <Slider
              value={[currentWidth]}
              min={1}
              max={20}
              step={1}
              onValueChange={(value) => onWidthChange(value[0])}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingAnnotationToolbar;