import React, { useState, useRef, useEffect } from 'react';
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
  Save,
  ArrowRight,
  Highlighter,
  Undo,
  Redo,
  Download
} from 'lucide-react';

interface ScreenShareAnnotationToolbarProps {
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
  onUndo?: () => void;
  onRedo?: () => void;
}

const ScreenShareAnnotationToolbar: React.FC<ScreenShareAnnotationToolbarProps> = ({
  isVisible,
  onToolChange,
  onColorChange,
  onWidthChange,
  onClear,
  onSave,
  onClose,
  currentTool,
  currentColor,
  currentWidth,
  onUndo,
  onRedo
}) => {
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

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
    '#FFC32B', // Yellow-Orange
    '#EF4444', // Bright Red
    '#10B981', // Green
    '#3B82F6', // Blue
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

  // Handle window resize to ensure toolbar stays within viewport
  useEffect(() => {
    const handleResize = () => {
      if (toolbarRef.current) {
        const rect = toolbarRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Adjust position if toolbar is outside viewport
        let newX = position.x;
        let newY = position.y;

        if (rect.right > viewportWidth) {
          newX = viewportWidth - rect.width - 10;
        }
        if (rect.bottom > viewportHeight) {
          newY = viewportHeight - rect.height - 10;
        }

        if (newX !== position.x || newY !== position.y) {
          setPosition({ x: newX, y: newY });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position]);

  if (!isVisible) return null;

  return (
    <div 
      ref={toolbarRef}
      className={`fixed z-50 bg-gray-800 rounded-lg shadow-lg border border-gray-700 ${isCollapsed ? 'w-12' : 'w-64'}`}
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transition: isDragging ? 'none' : 'width 0.3s ease',
        opacity: 0.95,
        pointerEvents: 'auto', // Always allow interaction with the toolbar
      }}
    >
      {/* Toolbar header with drag handle */}
      <div 
        className="flex items-center justify-between p-2 bg-gray-700 rounded-t-lg cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center">
          <Move size={16} className="mr-2 text-gray-300" />
          {!isCollapsed && <span className="text-sm font-medium text-white">Annotation Tools</span>}
        </div>
        <div className="flex items-center">
          {isCollapsed ? (
            <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(false)} className="h-6 w-6 p-0 text-gray-300 hover:text-white hover:bg-gray-600">
              <ChevronDown size={16} />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(true)} className="h-6 w-6 p-0 text-gray-300 hover:text-white hover:bg-gray-600">
              <ChevronUp size={16} />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              // Set tool to pointer before closing
              onToolChange('pointer');
              
              // Small delay to ensure the pointer tool is set before closing
              setTimeout(() => {
                onClose();
              }, 50);
            }} 
            className={`${isCollapsed ? 'h-6 w-6 p-0' : 'h-6 ml-1'} text-gray-300 hover:text-white hover:bg-red-600`}
          >
            <X size={16} />
            {!isCollapsed && <span className="ml-1">Close</span>}
          </Button>
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
                    className={`h-8 w-8 p-0 ${currentTool === 'pointer' ? 'bg-brand-teal text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
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
                    className={`h-8 w-8 p-0 ${currentTool === 'pen' ? 'bg-brand-teal text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
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
                    variant={currentTool === 'highlighter' ? "default" : "outline"} 
                    size="sm" 
                    className={`h-8 w-8 p-0 ${currentTool === 'highlighter' ? 'bg-brand-teal text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                    onClick={() => onToolChange('highlighter')}
                  >
                    <Highlighter size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Highlighter</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={currentTool === 'arrow' ? "default" : "outline"} 
                    size="sm" 
                    className={`h-8 w-8 p-0 ${currentTool === 'arrow' ? 'bg-brand-teal text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                    onClick={() => onToolChange('arrow')}
                  >
                    <ArrowRight size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Arrow</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={currentTool === 'rectangle' ? "default" : "outline"} 
                    size="sm" 
                    className={`h-8 w-8 p-0 ${currentTool === 'rectangle' ? 'bg-brand-teal text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
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
                    className={`h-8 w-8 p-0 ${currentTool === 'circle' ? 'bg-brand-teal text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
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
                    className={`h-8 w-8 p-0 ${currentTool === 'text' ? 'bg-brand-teal text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
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
                    className={`h-8 w-8 p-0 ${currentTool === 'eraser' ? 'bg-brand-teal text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
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
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 bg-gray-700 text-white hover:bg-gray-600"
                    onClick={onUndo}
                  >
                    <Undo size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Undo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 bg-gray-700 text-white hover:bg-gray-600"
                    onClick={onRedo}
                  >
                    <Redo size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Redo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 bg-gray-700 text-white hover:bg-gray-600"
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
                    className="h-8 w-8 p-0 bg-gray-700 text-white hover:bg-gray-600"
                    onClick={onSave}
                  >
                    <Download size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save as Image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Color picker */}
          <div className="mb-4">
            <div className="text-xs text-gray-300 mb-2">Color</div>
            <div className="grid grid-cols-6 gap-1">
              {colors.map(color => (
                <button
                  key={color}
                  className={`h-6 w-6 rounded-full ${currentColor === color ? 'ring-2 ring-white' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => onColorChange(color)}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Line width slider */}
          <div>
            <div className="text-xs text-gray-300 mb-2">Line Width: {currentWidth}px</div>
            <Slider
              value={[currentWidth]}
              min={1}
              max={20}
              step={1}
              onValueChange={(value) => onWidthChange(value[0])}
              className="w-full"
            />
          </div>
          
          {/* Exit annotation mode button */}
          <div className="mt-6 border-t border-gray-600 pt-4">
            <Button 
              variant="destructive" 
              className="w-full flex items-center justify-center font-bold"
              onClick={() => {
                // Set tool to pointer before closing
                onToolChange('pointer');
                
                // Small delay to ensure the pointer tool is set before closing
                setTimeout(() => {
                  onClose();
                }, 50);
              }}
            >
              <X size={16} className="mr-2" />
              Exit Annotation Mode
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenShareAnnotationToolbar;