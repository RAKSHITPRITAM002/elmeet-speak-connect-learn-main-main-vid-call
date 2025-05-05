
import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  points: Point[];
  color: string;
  width: number;
  tool: 'pen' | 'highlighter' | 'arrow' | 'rectangle' | 'circle' | 'text' | 'eraser';
}

// Define the ref interface with the methods we want to expose
export interface AnnotationCanvasRef {
  clearAnnotations: () => void;
  undoAnnotation: () => void;
  redoAnnotation: () => void;
  toDataURL: (type?: string, quality?: any) => string;
}

interface AnnotationCanvasProps {
  isAnnotating: boolean;
  isDrawing: boolean;
  onStartDrawing: (e: React.MouseEvent) => void;
  onDraw: (e: React.MouseEvent) => void;
  onStopDrawing: () => void;
  strokeColor?: string;
  strokeWidth?: number;
  tool?: 'pen' | 'highlighter' | 'arrow' | 'rectangle' | 'circle' | 'text' | 'eraser';
  onSaveAnnotation?: (dataUrl: string) => void;
}

export const AnnotationCanvas = forwardRef<AnnotationCanvasRef, AnnotationCanvasProps>(({
  isAnnotating,
  isDrawing,
  onStartDrawing,
  onDraw,
  onStopDrawing,
  strokeColor = '#FFC32B',
  strokeWidth = 2,
  tool = 'pen',
  onSaveAnnotation,
}: any, ref: any) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const [undoStack, setUndoStack] = useState<DrawingPath[]>([]);

  // Initialize canvas and handle resizing
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;

      const resizeCanvas = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Redraw all paths after resize
        redrawCanvas();
      };

      // Initial sizing
      resizeCanvas();

      // Resize on window resize
      window.addEventListener('resize', resizeCanvas);

      // Cleanup
      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [isAnnotating]);

  // Redraw canvas whenever paths change
  useEffect(() => {
    redrawCanvas();
  }, [paths, currentPath]);

  // Set up touch events for mobile
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (!isAnnotating) return;
      e.preventDefault();

      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      const newPath: DrawingPath = {
        points: [{ x, y }],
        color: strokeColor,
        width: strokeWidth,
        tool,
      };

      setCurrentPath(newPath);
      setUndoStack([]);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isAnnotating || !currentPath) return;
      e.preventDefault();

      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      setCurrentPath({
        ...currentPath,
        points: [...currentPath.points, { x, y }],
      });
    };

    const handleTouchEnd = () => {
      if (!isAnnotating || !currentPath) return;

      setPaths([...paths, currentPath]);
      setCurrentPath(null);

      // Save annotation if callback provided
      if (onSaveAnnotation && canvas) {
        onSaveAnnotation(canvas.toDataURL());
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isAnnotating, currentPath, paths, strokeColor, strokeWidth, tool, onSaveAnnotation]);

  // Custom mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isAnnotating) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPath: DrawingPath = {
      points: [{ x, y }],
      color: strokeColor,
      width: strokeWidth,
      tool,
    };

    setCurrentPath(newPath);
    setUndoStack([]);

    // Call the original handler
    onStartDrawing(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isAnnotating || !currentPath) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentPath({
      ...currentPath,
      points: [...currentPath.points, { x, y }],
    });

    // Call the original handler
    onDraw(e);
  };

  const handleMouseUp = () => {
    if (!isAnnotating || !currentPath) return;

    setPaths([...paths, currentPath]);
    setCurrentPath(null);

    // Save annotation if callback provided
    if (onSaveAnnotation && canvasRef.current) {
      onSaveAnnotation(canvasRef.current.toDataURL());
    }

    // Call the original handler
    onStopDrawing();
  };

  // Redraw the canvas with all paths
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all completed paths
    paths.forEach((path: DrawingPath) => {
      drawPath(context, path);
    });

    // Draw current path if exists
    if (currentPath) {
      drawPath(context, currentPath);
    }
  };

  // Draw a single path
  const drawPath = (context: CanvasRenderingContext2D, path: DrawingPath) => {
    if (path.points.length === 0) return;

    context.strokeStyle = path.color;
    context.lineWidth = path.width;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    context.beginPath();

    switch (path.tool) {
      case 'pen':
        // Draw a smooth line
        context.moveTo(path.points[0].x, path.points[0].y);

        for (let i = 1; i < path.points.length; i++) {
          context.lineTo(path.points[i].x, path.points[i].y);
        }

        context.stroke();
        break;

      case 'highlighter':
        // Draw a semi-transparent highlighter
        context.globalAlpha = 0.3;
        context.lineWidth = path.width * 3;

        context.moveTo(path.points[0].x, path.points[0].y);

        for (let i = 1; i < path.points.length; i++) {
          context.lineTo(path.points[i].x, path.points[i].y);
        }

        context.stroke();
        context.globalAlpha = 1.0;
        break;

      case 'arrow':
        // Draw an arrow
        if (path.points.length < 2) return;

        const start = path.points[0];
        const end = path.points[path.points.length - 1];

        // Draw the line
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.stroke();

        // Draw the arrowhead
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const headLength = 15;

        context.beginPath();
        context.moveTo(end.x, end.y);
        context.lineTo(
          end.x - headLength * Math.cos(angle - Math.PI / 6),
          end.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        context.lineTo(
          end.x - headLength * Math.cos(angle + Math.PI / 6),
          end.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        context.closePath();
        context.fillStyle = path.color;
        context.fill();
        break;

      case 'rectangle':
        // Draw a rectangle
        if (path.points.length < 2) return;

        const startPoint = path.points[0];
        const endPoint = path.points[path.points.length - 1];

        const width = endPoint.x - startPoint.x;
        const height = endPoint.y - startPoint.y;

        context.strokeRect(startPoint.x, startPoint.y, width, height);
        break;

      case 'circle':
        // Draw a circle
        if (path.points.length < 2) return;

        const center = path.points[0];
        const radiusPoint = path.points[path.points.length - 1];

        const radius = Math.sqrt(
          Math.pow(radiusPoint.x - center.x, 2) +
          Math.pow(radiusPoint.y - center.y, 2)
        );

        context.beginPath();
        context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        context.stroke();
        break;

      case 'eraser':
        // For eraser, we'll use destination-out composite operation
        context.globalCompositeOperation = 'destination-out';
        context.moveTo(path.points[0].x, path.points[0].y);

        for (let i = 1; i < path.points.length; i++) {
          context.lineTo(path.points[i].x, path.points[i].y);
        }

        context.stroke();
        context.globalCompositeOperation = 'source-over'; // Reset to default
        break;
    }
  };

  // Public methods exposed via ref
  const clearCanvas = () => {
    // Save current paths to undo stack
    setUndoStack([...undoStack, ...paths]);
    setPaths([]);
    setCurrentPath(null);

    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const undo = () => {
    if (paths.length === 0) return;

    // Remove the last path and add to undo stack
    const newPaths = [...paths];
    const lastPath = newPaths.pop();

    if (lastPath) {
      setUndoStack([...undoStack, lastPath]);
      setPaths(newPaths);
    }
  };

  const redo = () => {
    if (undoStack.length === 0) return;

    // Get the last undone path
    const newUndoStack = [...undoStack];
    const pathToRedo = newUndoStack.pop();

    if (pathToRedo) {
      setUndoStack(newUndoStack);
      setPaths([...paths, pathToRedo]);
    }
  };

  // Expose methods to parent component via useImperativeHandle
  useImperativeHandle(ref, () => ({
    clearAnnotations: clearCanvas,
    undoAnnotation: undo,
    redoAnnotation: redo,
    toDataURL: (type?: string, quality?: any) => {
      return canvasRef.current?.toDataURL(type, quality) || '';
    }
  }), [paths, undoStack]);

  return (
    <canvas
      ref={canvasRef}
      className={`annotation-canvas absolute top-0 left-0 w-full h-full z-10 ${isAnnotating ? 'drawing' : ''}`}
      style={{
        cursor: isAnnotating ? (tool === 'eraser' ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23000000\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\'%3E%3C/path%3E%3Cpath d=\'M15 3h6v6\'%3E%3C/path%3E%3Cpath d=\'M10 14L21 3\'%3E%3C/path%3E%3C/svg%3E") 0 24, auto' : 
                           tool === 'text' ? 'text' : 
                           'crosshair') : 'default',
        // This ensures the canvas doesn't capture all pointer events
        // allowing buttons and controls to be clicked
        pointerEvents: isAnnotating ? 'auto' : 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={(e: { clientX: number; clientY: number; }) => {
        // For text tool, we might want to handle click events differently
        if (isAnnotating && tool === 'text') {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          // In a real implementation, you would show a text input at this position
          // For now, we'll just simulate adding text
          const text = prompt('Enter text:');
          if (text && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
              context.font = `${strokeWidth * 5}px Arial`;
              context.fillStyle = strokeColor;
              context.fillText(text, x, y);
              
              // Save the annotation if callback provided
              if (onSaveAnnotation) {
                onSaveAnnotation(canvasRef.current.toDataURL());
              }
            }
          }
        }
      }}
    />
  );
});



