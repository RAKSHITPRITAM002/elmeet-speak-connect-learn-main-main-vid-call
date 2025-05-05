import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import ScreenShareAnnotationToolbar from './ScreenShareAnnotationToolbar';

interface ScreenShareAnnotationProps {
  isScreenSharing: boolean;
  screenShareRef: React.RefObject<HTMLDivElement>;
}

const ScreenShareAnnotation: React.FC<ScreenShareAnnotationProps> = ({
  isScreenSharing,
  screenShareRef
}) => {
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#FF0000');
  const [currentWidth, setCurrentWidth] = useState(3);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);

  // Initialize canvas when screen sharing starts
  useEffect(() => {
    if (!isScreenSharing || !screenShareRef.current) return;

    const setupCanvas = () => {
      if (!canvasRef.current || !screenShareRef.current) return;

      const canvas = canvasRef.current;
      const container = screenShareRef.current;
      
      // Set canvas size to match container
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Get context and set default styles
      const context = canvas.getContext('2d');
      if (context) {
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = currentColor;
        context.lineWidth = currentWidth;
        contextRef.current = context;
      }
    };

    setupCanvas();

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current || !screenShareRef.current) return;
      
      const canvas = canvasRef.current;
      const container = screenShareRef.current;
      
      // Save current drawing
      const imageData = contextRef.current?.getImageData(0, 0, canvas.width, canvas.height);
      
      // Resize canvas
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Restore context settings
      if (contextRef.current) {
        contextRef.current.lineCap = 'round';
        contextRef.current.lineJoin = 'round';
        contextRef.current.strokeStyle = currentColor;
        contextRef.current.lineWidth = currentWidth;
        
        // Restore drawing if we had one
        if (imageData) {
          contextRef.current.putImageData(imageData, 0, 0);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isScreenSharing, screenShareRef]);

  // Update context when tool, color or width changes
  useEffect(() => {
    if (!contextRef.current) return;
    
    contextRef.current.strokeStyle = currentColor;
    contextRef.current.lineWidth = currentWidth;
  }, [currentColor, currentWidth]);
  
  // Update cursor style when tool changes
  useEffect(() => {
    if (!isAnnotating) return;
    
    // Set appropriate cursor based on the current tool
    if (canvasRef.current) {
      switch (currentTool) {
        case 'pointer':
          canvasRef.current.style.cursor = 'default';
          break;
        case 'pen':
        case 'highlighter':
          canvasRef.current.style.cursor = 'crosshair';
          break;
        case 'eraser':
          canvasRef.current.style.cursor = 'not-allowed';
          break;
        case 'text':
          canvasRef.current.style.cursor = 'text';
          break;
        default:
          canvasRef.current.style.cursor = 'crosshair';
      }
    }
  }, [currentTool, isAnnotating]);

  // Toggle annotation mode
  const toggleAnnotation = () => {
    const newState = !isAnnotating;
    setIsAnnotating(newState);
    
    // If turning off annotation, set the cursor back to default
    if (!newState) {
      if (document.body) {
        document.body.style.cursor = 'default';
      }
      
      // Also set the tool to pointer to ensure mouse interactions work normally
      setCurrentTool('pointer');
      
      // Reset drawing state
      setIsDrawing(false);
      
      // Make sure the canvas is no longer capturing pointer events
      if (canvasRef.current) {
        canvasRef.current.style.pointerEvents = 'none';
      }
    } else {
      // When turning on annotation, make sure the canvas captures pointer events
      if (canvasRef.current) {
        canvasRef.current.style.pointerEvents = 'auto';
      }
    }
  };

  // Handle mouse down
  const startDrawing = (e: React.MouseEvent) => {
    if (!isAnnotating || !contextRef.current) return;
    
    // If using pointer tool, don't draw anything
    if (currentTool === 'pointer') {
      return;
    }
    
    const { offsetX, offsetY } = e.nativeEvent;
    
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    
    setIsDrawing(true);
    setLastPosition({ x: offsetX, y: offsetY });
    
    // For shapes like rectangle, circle, etc., we'll just store the starting point
    if (currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'arrow') {
      // We'll handle these in the stopDrawing function
    }
  };

  // Handle mouse move
  const draw = (e: React.MouseEvent) => {
    if (!isAnnotating || !contextRef.current) return;
    
    // If using pointer tool, don't draw anything
    if (currentTool === 'pointer') {
      return;
    }
    
    // Only proceed with drawing if we're in drawing mode
    if (!isDrawing) return;
    
    const { offsetX, offsetY } = e.nativeEvent;
    
    if (currentTool === 'pen') {
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
    } else if (currentTool === 'eraser') {
      // For eraser, we'll use destination-out composite operation
      const originalComposite = contextRef.current.globalCompositeOperation;
      contextRef.current.globalCompositeOperation = 'destination-out';
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
      contextRef.current.globalCompositeOperation = originalComposite;
    }
    
    // For shapes, we'll preview them during mouse move
    if (currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'arrow') {
      // Clear the canvas and redraw all previous annotations
      redrawAnnotations();
      
      // Draw the current shape
      if (currentTool === 'rectangle') {
        drawRectangle(lastPosition.x, lastPosition.y, offsetX - lastPosition.x, offsetY - lastPosition.y);
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(offsetX - lastPosition.x, 2) + Math.pow(offsetY - lastPosition.y, 2)
        );
        drawCircle(lastPosition.x, lastPosition.y, radius);
      } else if (currentTool === 'arrow') {
        drawArrow(lastPosition.x, lastPosition.y, offsetX, offsetY);
      }
    }
  };

  // Handle mouse up
  const stopDrawing = (e: React.MouseEvent) => {
    if (!isAnnotating || !contextRef.current) return;
    
    // If using pointer tool or not drawing, don't do anything
    if (currentTool === 'pointer' || !isDrawing) {
      setIsDrawing(false);
      return;
    }
    
    const { offsetX, offsetY } = e.nativeEvent;
    
    if (currentTool === 'pen' || currentTool === 'eraser') {
      contextRef.current.closePath();
      
      // Save the path to annotations
      setAnnotations([...annotations, {
        tool: currentTool,
        color: currentColor,
        width: currentWidth,
        path: contextRef.current.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height)
      }]);
    } else if (currentTool === 'rectangle') {
      // Save the rectangle to annotations
      setAnnotations([...annotations, {
        tool: 'rectangle',
        color: currentColor,
        width: currentWidth,
        x: lastPosition.x,
        y: lastPosition.y,
        w: offsetX - lastPosition.x,
        h: offsetY - lastPosition.y
      }]);
    } else if (currentTool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(offsetX - lastPosition.x, 2) + Math.pow(offsetY - lastPosition.y, 2)
      );
      
      // Save the circle to annotations
      setAnnotations([...annotations, {
        tool: 'circle',
        color: currentColor,
        width: currentWidth,
        x: lastPosition.x,
        y: lastPosition.y,
        radius
      }]);
    } else if (currentTool === 'arrow') {
      // Save the arrow to annotations
      setAnnotations([...annotations, {
        tool: 'arrow',
        color: currentColor,
        width: currentWidth,
        x1: lastPosition.x,
        y1: lastPosition.y,
        x2: offsetX,
        y2: offsetY
      }]);
    } else if (currentTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        // Save the text to annotations
        setAnnotations([...annotations, {
          tool: 'text',
          color: currentColor,
          width: currentWidth,
          x: offsetX,
          y: offsetY,
          text
        }]);
        
        // Draw the text
        drawText(offsetX, offsetY, text);
      }
    }
    
    setIsDrawing(false);
    setRedoStack([]); // Clear redo stack after new drawing
  };

  // Draw rectangle
  const drawRectangle = (x: number, y: number, width: number, height: number) => {
    if (!contextRef.current) return;
    
    contextRef.current.beginPath();
    contextRef.current.rect(x, y, width, height);
    contextRef.current.stroke();
  };

  // Draw circle
  const drawCircle = (x: number, y: number, radius: number) => {
    if (!contextRef.current) return;
    
    contextRef.current.beginPath();
    contextRef.current.arc(x, y, radius, 0, 2 * Math.PI);
    contextRef.current.stroke();
  };

  // Draw arrow
  const drawArrow = (x1: number, y1: number, x2: number, y2: number) => {
    if (!contextRef.current) return;
    
    // Draw the line
    contextRef.current.beginPath();
    contextRef.current.moveTo(x1, y1);
    contextRef.current.lineTo(x2, y2);
    contextRef.current.stroke();
    
    // Calculate the angle of the line
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    // Length of the arrowhead
    const headLength = 15;
    
    // Draw the arrowhead
    contextRef.current.beginPath();
    contextRef.current.moveTo(x2, y2);
    contextRef.current.lineTo(
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6)
    );
    contextRef.current.lineTo(
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6)
    );
    contextRef.current.closePath();
    contextRef.current.fillStyle = currentColor;
    contextRef.current.fill();
  };

  // Draw text
  const drawText = (x: number, y: number, text: string) => {
    if (!contextRef.current) return;
    
    contextRef.current.font = `${currentWidth * 5}px Arial`;
    contextRef.current.fillStyle = currentColor;
    contextRef.current.fillText(text, x, y);
  };

  // Redraw all annotations
  const redrawAnnotations = () => {
    if (!contextRef.current || !canvasRef.current) return;
    
    // Clear canvas
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Redraw all annotations
    annotations.forEach(annotation => {
      contextRef.current!.strokeStyle = annotation.color;
      contextRef.current!.lineWidth = annotation.width;
      
      if (annotation.tool === 'pen' || annotation.tool === 'eraser') {
        // For paths, we'll use the saved image data
        if (annotation.path) {
          contextRef.current!.putImageData(annotation.path, 0, 0);
        }
      } else if (annotation.tool === 'rectangle') {
        drawRectangle(annotation.x, annotation.y, annotation.width, annotation.height);
      } else if (annotation.tool === 'circle') {
        drawCircle(annotation.x, annotation.y, annotation.radius);
      } else if (annotation.tool === 'arrow') {
        drawArrow(annotation.x1, annotation.y1, annotation.x2, annotation.y2);
      } else if (annotation.tool === 'text') {
        drawText(annotation.x, annotation.y, annotation.text);
      }
    });
    
    // Restore current settings
    contextRef.current.strokeStyle = currentColor;
    contextRef.current.lineWidth = currentWidth;
  };

  // Clear all annotations
  const clearAnnotations = () => {
    if (!contextRef.current || !canvasRef.current) return;
    
    // Save current annotations to redo stack
    setRedoStack([...redoStack, ...annotations]);
    
    // Clear annotations
    setAnnotations([]);
    
    // Clear canvas
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // Undo last annotation
  const undoAnnotation = () => {
    if (annotations.length === 0) return;
    
    // Get the last annotation
    const lastAnnotation = annotations[annotations.length - 1];
    
    // Remove it from annotations
    const newAnnotations = annotations.slice(0, -1);
    setAnnotations(newAnnotations);
    
    // Add it to redo stack
    setRedoStack([...redoStack, lastAnnotation]);
    
    // Redraw
    redrawAnnotations();
  };

  // Redo last undone annotation
  const redoAnnotation = () => {
    if (redoStack.length === 0) return;
    
    // Get the last undone annotation
    const lastUndone = redoStack[redoStack.length - 1];
    
    // Remove it from redo stack
    const newRedoStack = redoStack.slice(0, -1);
    setRedoStack(newRedoStack);
    
    // Add it back to annotations
    setAnnotations([...annotations, lastUndone]);
    
    // Redraw
    redrawAnnotations();
  };

  // Save annotations as image
  const saveAnnotations = () => {
    if (!canvasRef.current) return;
    
    // Create a temporary link
    const link = document.createElement('a');
    link.download = `annotation-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <>
      {isScreenSharing && (
        <>
          <canvas
            ref={canvasRef}
            className={`absolute top-0 left-0 w-full h-full z-10 ${
              isAnnotating 
                ? currentTool === 'pointer' 
                  ? 'cursor-default' 
                  : currentTool === 'eraser' 
                    ? 'cursor-not-allowed' 
                    : currentTool === 'text' 
                      ? 'cursor-text' 
                      : 'cursor-crosshair'
                : 'pointer-events-none'
            }`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          
          {/* Annotation toggle button */}
          {!isAnnotating && (
            <div className="absolute bottom-20 right-4 z-20">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAnnotation}
                className="bg-gray-800 text-white hover:bg-gray-700"
              >
                Annotate
              </Button>
            </div>
          )}
          
          {/* Floating annotation toolbar */}
          <ScreenShareAnnotationToolbar
            isVisible={isAnnotating}
            onToolChange={setCurrentTool}
            onColorChange={setCurrentColor}
            onWidthChange={setCurrentWidth}
            onClear={clearAnnotations}
            onSave={saveAnnotations}
            onClose={toggleAnnotation}
            currentTool={currentTool}
            currentColor={currentColor}
            currentWidth={currentWidth}
            onUndo={undoAnnotation}
            onRedo={redoAnnotation}
          />
        </>
      )}
    </>
  );
};

export default ScreenShareAnnotation;
