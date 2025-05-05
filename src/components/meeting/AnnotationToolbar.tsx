
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Edit2, Trash2, Circle, Square, ChevronDown, Pencil, Type, Check,
  ArrowRight, Highlighter, Undo, Redo, Download, Save, Image,
  MousePointer, Eraser
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnnotationCanvasRef } from "./AnnotationCanvas";

interface AnnotationToolbarProps {
  isAnnotating: boolean;
  onToggleAnnotation: () => void;
  onClearAnnotations: () => void;
  onToolChange?: (tool: 'pen' | 'highlighter' | 'arrow' | 'rectangle' | 'circle' | 'text' | 'eraser' | string) => void;
  onColorChange?: (color: string) => void;
  onWidthChange?: (width: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  canvasRef?: React.RefObject<AnnotationCanvasRef>;
}

export const AnnotationToolbar = ({
  isAnnotating,
  onToggleAnnotation,
  onClearAnnotations,
  onToolChange,
  onColorChange,
  onWidthChange,
  onUndo,
  onRedo,
  onSave,
  canvasRef,
}: AnnotationToolbarProps) => {
  const [strokeColor, setStrokeColor] = useState("#FFC32B");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [activeTool, setActiveTool] = useState<'pen' | 'highlighter' | 'arrow' | 'rectangle' | 'circle' | 'text' | 'eraser'>("pen");
  const [showToolbar, setShowToolbar] = useState(false);

  const colors = [
    { name: "Yellow", value: "#FFC32B" },
    { name: "Red", value: "#EF4444" },
    { name: "Green", value: "#10B981" },
    { name: "Blue", value: "#3B82F6" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Pink", value: "#EC4899" },
    { name: "Orange", value: "#F97316" },
    { name: "White", value: "#FFFFFF" },
    { name: "Black", value: "#000000" },
  ];

  const tools = [
    { id: "pen" as const, name: "Pen", icon: <Pencil size={16} /> },
    { id: "highlighter" as const, name: "Highlighter", icon: <Highlighter size={16} /> },
    { id: "arrow" as const, name: "Arrow", icon: <ArrowRight size={16} /> },
    { id: "rectangle" as const, name: "Rectangle", icon: <Square size={16} /> },
    { id: "circle" as const, name: "Circle", icon: <Circle size={16} /> },
    { id: "text" as const, name: "Text", icon: <Type size={16} /> },
    // Note: eraser is not in the allowed tool types, so we'll need to handle it specially
    { id: "eraser", name: "Eraser", icon: <Eraser size={16} /> },
  ];

  // Toggle toolbar visibility when annotation mode changes
  useEffect(() => {
    setShowToolbar(isAnnotating);
  }, [isAnnotating]);

  const handleColorChange = (color: string) => {
    setStrokeColor(color);

    // Update canvas context
    const canvas = document.querySelector('.annotation-canvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = color;
      }
    }

    // Call parent callback if provided
    if (onColorChange) {
      onColorChange(color);
    }
  };

  const handleWidthChange = (width: number) => {
    setStrokeWidth(width);

    // Update canvas context
    const canvas = document.querySelector('.annotation-canvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = width;
      }
    }

    // Call parent callback if provided
    if (onWidthChange) {
      onWidthChange(width);
    }
  };

  const handleToolChange = (tool: string) => {
    // Ensure the tool is one of the allowed types
    const validTool = ['pen', 'highlighter', 'arrow', 'rectangle', 'circle', 'text', 'eraser'].includes(tool)
      ? tool as 'pen' | 'highlighter' | 'arrow' | 'rectangle' | 'circle' | 'text' | 'eraser'
      : 'pen'; // Default to pen if an invalid tool is provided

    setActiveTool(validTool);

    // Call parent callback if provided
    if (onToolChange) {
      onToolChange(validTool);
    }
  };

  const handleUndo = () => {
    // Try to use the canvas ref method first
    if (canvasRef?.current) {
      canvasRef.current.undoAnnotation();
    }

    // Call parent callback if provided
    if (onUndo) {
      onUndo();
    }
  };

  const handleRedo = () => {
    // Try to use the canvas ref method first
    if (canvasRef?.current) {
      canvasRef.current.redoAnnotation();
    }

    // Call parent callback if provided
    if (onRedo) {
      onRedo();
    }
  };

  const handleSave = () => {
    // Try to save the canvas content
    if (canvasRef?.current) {
      try {
        const dataUrl = canvasRef.current.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `annotation-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Error saving annotation:', err);
      }
    }

    // Call parent callback if provided
    if (onSave) {
      onSave();
    }
  };

  return (
    <TooltipProvider>
      <div className={`annotation-toolbar ${showToolbar ? 'flex flex-col md:flex-row' : 'flex flex-col'} gap-2 bg-gray-800/90 backdrop-blur-sm p-2 rounded-lg shadow-lg transition-all duration-300 z-50`} style={{ pointerEvents: 'auto' }}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleAnnotation}
              className={`bg-gray-700 text-white hover:bg-gray-600 ${isAnnotating ? 'ring-2 ring-brand-teal' : ''}`}
            >
              <Edit2 size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{isAnnotating ? 'Disable' : 'Enable'} Annotation</p>
          </TooltipContent>
        </Tooltip>

        {showToolbar && (
          <div className="flex flex-col md:flex-row gap-2 animate-in fade-in slide-in-from-left-5 duration-300">
            {/* Tools dropdown */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-gray-700 text-white hover:bg-gray-600"
                    >
                      {tools.find(t => t.id === activeTool)?.icon || <Pencil size={20} />}
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Drawing Tools</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-48">
                <div className="grid grid-cols-2 gap-1 p-1">
                  {tools.map((tool) => (
                    <DropdownMenuItem
                      key={tool.id}
                      className={`flex items-center gap-2 p-2 ${activeTool === tool.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      onClick={() => handleToolChange(tool.id)}
                    >
                      {tool.icon}
                      <span>{tool.name}</span>
                      {activeTool === tool.id && <Check size={16} className="ml-auto" />}
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Color picker */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-gray-700 text-white hover:bg-gray-600"
                      style={{ color: strokeColor }}
                    >
                      <Circle size={20} fill={strokeColor} />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Color</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <Tabs defaultValue="basic">
                  <TabsList className="w-full">
                    <TabsTrigger value="basic" className="flex-1">Basic</TabsTrigger>
                    <TabsTrigger value="custom" className="flex-1">Custom</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic">
                    <div className="grid grid-cols-3 gap-1 p-2">
                      {colors.map((color) => (
                        <div
                          key={color.value}
                          className="w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform flex items-center justify-center"
                          style={{
                            backgroundColor: color.value,
                            border: color.value === strokeColor
                              ? '2px solid white'
                              : color.value === '#FFFFFF'
                                ? '1px solid #ccc'
                                : 'none'
                          }}
                          onClick={() => handleColorChange(color.value)}
                          title={color.name}
                        >
                          {color.value === strokeColor && (
                            <Check size={16} className={color.value === '#FFFFFF' ? 'text-black' : 'text-white'} />
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="custom">
                    <div className="p-2">
                      <label className="text-sm mb-1 block">Custom Color</label>
                      <input
                        type="color"
                        value={strokeColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-full h-8 cursor-pointer"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Line width */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-gray-700 text-white hover:bg-gray-600"
                    >
                      <div className="relative">
                        <Pencil size={20} />
                        <span className="absolute bottom-0 right-0 text-[10px] font-bold bg-gray-800 rounded-full w-4 h-4 flex items-center justify-center">
                          {strokeWidth}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Line Width</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <div className="flex flex-col gap-1 p-2">
                  {[1, 2, 4, 6, 8, 12].map((width) => (
                    <div
                      key={width}
                      className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                      onClick={() => handleWidthChange(width)}
                    >
                      <div className="w-12 h-[1px] bg-current" style={{ height: `${width}px` }} />
                      <span>{width}px</span>
                      {width === strokeWidth && <Check size={16} className="ml-auto" />}
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Undo/Redo */}
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleUndo}
                    className="bg-gray-700 text-white hover:bg-gray-600"
                  >
                    <Undo size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Undo</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRedo}
                    className="bg-gray-700 text-white hover:bg-gray-600"
                  >
                    <Redo size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Redo</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Clear and Save */}
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onClearAnnotations}
                    className="bg-gray-700 text-white hover:bg-gray-600"
                  >
                    <Trash2 size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Clear All</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSave}
                    className="bg-gray-700 text-white hover:bg-gray-600"
                  >
                    <Download size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Save Annotation</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
