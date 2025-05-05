import React, { useEffect, useRef, useState } from 'react';
import { useWhiteboard, WhiteboardState, DrawingOptions } from '../../services/WhiteboardService';

interface WhiteboardProps {
  isHost: boolean;
  onError?: (error: string) => void;
}

const WhiteboardNew: React.FC<WhiteboardProps> = ({ isHost, onError }) => {
  const {
    initializeWhiteboard,
    addElement,
    updateElement,
    deleteElement,
    clearPage,
    addPage,
    deletePage,
    switchPage,
    changeOptions,
    exportAsImage,
    exportAsPDF,
    importImage,
  } = useWhiteboard();
  
  // State
  const [whiteboardState, setWhiteboardState] = useState<WhiteboardState>(initializeWhiteboard());
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<any | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStrokeWidthPicker, setShowStrokeWidthPicker] = useState(false);
  const [showTextOptions, setShowTextOptions] = useState(false);
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize canvas
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setCanvasSize({
        width: clientWidth,
        height: clientHeight,
      });
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setCanvasSize({
          width: clientWidth,
          height: clientHeight,
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Draw elements on canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set transform for pan and zoom
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.scale(scale, scale);
    
    // Get current page
    const currentPage = whiteboardState.pages.find(page => page.id === whiteboardState.currentPageId);
    
    if (!currentPage) {
      ctx.restore();
      return;
    }
    
    // Set background
    ctx.fillStyle = currentPage.background;
    ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
    
    // Draw elements
    currentPage.elements.forEach(element => {
      drawElement(ctx, element, element.id === selectedElement);
    });
    
    // Draw current element if drawing
    if (currentElement) {
      drawElement(ctx, currentElement, false);
    }
    
    ctx.restore();
  }, [whiteboardState, currentElement, selectedElement, canvasSize, scale, position]);
  
  // Draw an element on the canvas
  const drawElement = (ctx: CanvasRenderingContext2D, element: any, isSelected: boolean) => {
    ctx.beginPath();
    
    switch (element.type) {
      case 'pen':
        ctx.strokeStyle = element.strokeColor;
        ctx.lineWidth = element.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (element.points.length > 0) {
          ctx.moveTo(element.points[0].x, element.points[0].y);
          
          for (let i = 1; i < element.points.length; i++) {
            ctx.lineTo(element.points[i].x, element.points[i].y);
          }
        }
        
        ctx.stroke();
        break;
        
      case 'highlighter':
        ctx.strokeStyle = element.strokeColor;
        ctx.lineWidth = element.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.5;
        
        if (element.points.length > 0) {
          ctx.moveTo(element.points[0].x, element.points[0].y);
          
          for (let i = 1; i < element.points.length; i++) {
            ctx.lineTo(element.points[i].x, element.points[i].y);
          }
        }
        
        ctx.stroke();
        ctx.globalAlpha = 1;
        break;
        
      case 'line':
        ctx.strokeStyle = element.strokeColor;
        ctx.lineWidth = element.strokeWidth;
        ctx.lineCap = 'round';
        
        ctx.moveTo(element.x1, element.y1);
        ctx.lineTo(element.x2, element.y2);
        
        ctx.stroke();
        break;
        
      case 'rectangle':
        ctx.strokeStyle = element.strokeColor;
        ctx.lineWidth = element.strokeWidth;
        
        if (element.fillColor) {
          ctx.fillStyle = element.fillColor;
          ctx.fillRect(
            element.x,
            element.y,
            element.width,
            element.height
          );
        }
        
        ctx.strokeRect(
          element.x,
          element.y,
          element.width,
          element.height
        );
        break;
        
      case 'circle':
        ctx.strokeStyle = element.strokeColor;
        ctx.lineWidth = element.strokeWidth;
        
        const centerX = element.x + element.radius;
        const centerY = element.y + element.radius;
        
        ctx.arc(
          centerX,
          centerY,
          element.radius,
          0,
          2 * Math.PI
        );
        
        if (element.fillColor) {
          ctx.fillStyle = element.fillColor;
          ctx.fill();
        }
        
        ctx.stroke();
        break;
        
      case 'text':
        ctx.font = `${element.fontSize}px ${element.fontFamily}`;
        ctx.fillStyle = element.strokeColor;
        ctx.fillText(element.text, element.x, element.y);
        break;
        
      case 'image':
        if (element.imageObj) {
          ctx.drawImage(
            element.imageObj,
            element.x,
            element.y,
            element.width,
            element.height
          );
        } else if (element.url) {
          // Load image if not already loaded
          const img = new Image();
          img.src = element.url;
          img.onload = () => {
            element.imageObj = img;
            // Trigger a redraw
            setWhiteboardState({ ...whiteboardState });
          };
        }
        break;
        
      case 'laser':
        // Laser pointer effect (temporary)
        ctx.fillStyle = element.strokeColor;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(element.x, element.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1;
        break;
    }
    
    // Draw selection box if selected
    if (isSelected) {
      ctx.strokeStyle = '#0066ff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      let selectionX = 0;
      let selectionY = 0;
      let selectionWidth = 0;
      let selectionHeight = 0;
      
      switch (element.type) {
        case 'pen':
        case 'highlighter':
          // Find bounding box of points
          if (element.points.length > 0) {
            let minX = element.points[0].x;
            let minY = element.points[0].y;
            let maxX = element.points[0].x;
            let maxY = element.points[0].y;
            
            element.points.forEach((point: { x: number; y: number }) => {
              minX = Math.min(minX, point.x);
              minY = Math.min(minY, point.y);
              maxX = Math.max(maxX, point.x);
              maxY = Math.max(maxY, point.y);
            });
            
            selectionX = minX - 5;
            selectionY = minY - 5;
            selectionWidth = maxX - minX + 10;
            selectionHeight = maxY - minY + 10;
          }
          break;
          
        case 'line':
          selectionX = Math.min(element.x1, element.x2) - 5;
          selectionY = Math.min(element.y1, element.y2) - 5;
          selectionWidth = Math.abs(element.x2 - element.x1) + 10;
          selectionHeight = Math.abs(element.y2 - element.y1) + 10;
          break;
          
        case 'rectangle':
          selectionX = element.x - 5;
          selectionY = element.y - 5;
          selectionWidth = element.width + 10;
          selectionHeight = element.height + 10;
          break;
          
        case 'circle':
          selectionX = element.x - 5;
          selectionY = element.y - 5;
          selectionWidth = element.radius * 2 + 10;
          selectionHeight = element.radius * 2 + 10;
          break;
          
        case 'text':
          // Approximate text width
          const textWidth = ctx.measureText(element.text).width;
          selectionX = element.x - 5;
          selectionY = element.y - element.fontSize - 5;
          selectionWidth = textWidth + 10;
          selectionHeight = element.fontSize + 10;
          break;
          
        case 'image':
          selectionX = element.x - 5;
          selectionY = element.y - 5;
          selectionWidth = element.width + 10;
          selectionHeight = element.height + 10;
          break;
      }
      
      ctx.strokeRect(
        selectionX,
        selectionY,
        selectionWidth,
        selectionHeight
      );
      
      ctx.setLineDash([]);
    }
  };
  
  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - position.x) / scale;
    const y = (e.clientY - rect.top - position.y) / scale;
    
    setIsDrawing(true);
    
    const { tool, strokeColor, strokeWidth, fillColor, fontSize, fontFamily } = whiteboardState.currentOptions;
    
    switch (tool) {
      case 'pen':
        setCurrentElement({
          id: `element-${Date.now()}`,
          type: 'pen',
          points: [{ x, y }],
          strokeColor,
          strokeWidth,
        });
        break;
        
      case 'highlighter':
        setCurrentElement({
          id: `element-${Date.now()}`,
          type: 'highlighter',
          points: [{ x, y }],
          strokeColor,
          strokeWidth: strokeWidth * 3, // Highlighter is thicker
        });
        break;
        
      case 'line':
        setCurrentElement({
          id: `element-${Date.now()}`,
          type: 'line',
          x1: x,
          y1: y,
          x2: x,
          y2: y,
          strokeColor,
          strokeWidth,
        });
        break;
        
      case 'rectangle':
        setCurrentElement({
          id: `element-${Date.now()}`,
          type: 'rectangle',
          x,
          y,
          width: 0,
          height: 0,
          strokeColor,
          strokeWidth,
          fillColor,
        });
        break;
        
      case 'circle':
        setCurrentElement({
          id: `element-${Date.now()}`,
          type: 'circle',
          x,
          y,
          radius: 0,
          strokeColor,
          strokeWidth,
          fillColor,
        });
        break;
        
      case 'text':
        const text = prompt('Enter text:');
        if (text) {
          const newElement = {
            id: `element-${Date.now()}`,
            type: 'text',
            x,
            y: y + parseInt(fontSize?.toString() || '16', 10),
            text,
            strokeColor,
            fontSize: parseInt(fontSize?.toString() || '16', 10),
            fontFamily: fontFamily || 'Arial',
          };
          
          setWhiteboardState(addElement(whiteboardState, newElement));
        }
        break;
        
      case 'laser':
        setCurrentElement({
          id: `element-${Date.now()}`,
          type: 'laser',
          x,
          y,
          strokeColor: '#ff0000', // Laser is always red
        });
        break;
        
      case 'eraser':
        // Find element under cursor
        const currentPage = whiteboardState.pages.find(page => page.id === whiteboardState.currentPageId);
        
        if (currentPage) {
          // Check in reverse order (top to bottom)
          for (let i = currentPage.elements.length - 1; i >= 0; i--) {
            const element = currentPage.elements[i];
            
            // Simple hit testing
            let hit = false;
            
            switch (element.type) {
              case 'pen':
              case 'highlighter':
                // Check if cursor is near any point
                for (const point of element.points) {
                  const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
                  if (distance < 10) {
                    hit = true;
                    break;
                  }
                }
                break;
                
              case 'line':
                // Check if cursor is near the line
                const lineDistance = distanceToLine(x, y, element.x1, element.y1, element.x2, element.y2);
                hit = lineDistance < 10;
                break;
                
              case 'rectangle':
                // Check if cursor is inside or near the rectangle
                hit = x >= element.x - 10 && x <= element.x + element.width + 10 &&
                      y >= element.y - 10 && y <= element.y + element.height + 10;
                break;
                
              case 'circle':
                // Check if cursor is inside or near the circle
                const centerX = element.x + element.radius;
                const centerY = element.y + element.radius;
                const distance = Math.sqrt((centerX - x) ** 2 + (centerY - y) ** 2);
                hit = distance <= element.radius + 10;
                break;
                
              case 'text':
                // Approximate text width
                const canvas = canvasRef.current;
                if (canvas) {
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.font = `${element.fontSize}px ${element.fontFamily}`;
                    const textWidth = ctx.measureText(element.text).width;
                    hit = x >= element.x - 10 && x <= element.x + textWidth + 10 &&
                          y >= element.y - element.fontSize - 10 && y <= element.y + 10;
                  }
                }
                break;
                
              case 'image':
                hit = x >= element.x - 10 && x <= element.x + element.width + 10 &&
                      y >= element.y - 10 && y <= element.y + element.height + 10;
                break;
            }
            
            if (hit) {
              setWhiteboardState(deleteElement(whiteboardState, element.id));
              break;
            }
          }
        }
        break;
    }
  };
  
  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !isDrawing || !currentElement) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - position.x) / scale;
    const y = (e.clientY - rect.top - position.y) / scale;
    
    switch (currentElement.type) {
      case 'pen':
      case 'highlighter':
        setCurrentElement({
          ...currentElement,
          points: [...currentElement.points, { x, y }],
        });
        break;
        
      case 'line':
        setCurrentElement({
          ...currentElement,
          x2: x,
          y2: y,
        });
        break;
        
      case 'rectangle':
        setCurrentElement({
          ...currentElement,
          width: x - currentElement.x,
          height: y - currentElement.y,
        });
        break;
        
      case 'circle':
        const radius = Math.sqrt((x - currentElement.x) ** 2 + (y - currentElement.y) ** 2);
        setCurrentElement({
          ...currentElement,
          radius,
        });
        break;
        
      case 'laser':
        setCurrentElement({
          ...currentElement,
          x,
          y,
        });
        break;
    }
  };
  
  // Handle mouse up
  const handleMouseUp = () => {
    if (!isDrawing || !currentElement) {
      setIsDrawing(false);
      return;
    }
    
    // Add current element to whiteboard state
    if (currentElement.type !== 'laser') {
      setWhiteboardState(addElement(whiteboardState, currentElement));
    }
    
    setIsDrawing(false);
    setCurrentElement(null);
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    handleMouseUp();
  };
  
  // Handle tool change
  const handleToolChange = (tool: DrawingOptions['tool']) => {
    setWhiteboardState(changeOptions(whiteboardState, { tool }));
  };
  
  // Handle color change
  const handleColorChange = (color: string) => {
    setWhiteboardState(changeOptions(whiteboardState, { strokeColor: color }));
    setShowColorPicker(false);
  };
  
  // Handle stroke width change
  const handleStrokeWidthChange = (width: number) => {
    setWhiteboardState(changeOptions(whiteboardState, { strokeWidth: width }));
    setShowStrokeWidthPicker(false);
  };
  
  // Handle fill color change
  const handleFillColorChange = (color: string | undefined) => {
    setWhiteboardState(changeOptions(whiteboardState, { fillColor: color }));
  };
  
  // Handle font size change
  const handleFontSizeChange = (size: number) => {
    setWhiteboardState(changeOptions(whiteboardState, { fontSize: size }));
    setShowTextOptions(false);
  };
  
  // Handle font family change
  const handleFontFamilyChange = (family: string) => {
    setWhiteboardState(changeOptions(whiteboardState, { fontFamily: family }));
    setShowTextOptions(false);
  };
  
  // Handle clear page
  const handleClearPage = () => {
    if (window.confirm('Are you sure you want to clear the current page?')) {
      setWhiteboardState(clearPage(whiteboardState));
    }
  };
  
  // Handle add page
  const handleAddPage = () => {
    setWhiteboardState(addPage(whiteboardState));
  };
  
  // Handle delete page
  const handleDeletePage = (pageId: string) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      setWhiteboardState(deletePage(whiteboardState, pageId));
    }
  };
  
  // Handle switch page
  const handleSwitchPage = (pageId: string) => {
    setWhiteboardState(switchPage(whiteboardState, pageId));
  };
  
  // Handle export as image
  const handleExportAsImage = async () => {
    const imageUrl = await exportAsImage(whiteboardState);
    
    if (imageUrl) {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `whiteboard-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      if (onError) onError('Failed to export whiteboard as image');
    }
  };
  
  // Handle export as PDF
  const handleExportAsPDF = async () => {
    const pdfBlob = await exportAsPDF(whiteboardState);
    
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whiteboard-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      if (onError) onError('Failed to export whiteboard as PDF');
    }
  };
  
  // Handle import image
  const handleImportImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (file.type.startsWith('image/')) {
        const updatedState = await importImage(whiteboardState, file);
        setWhiteboardState(updatedState);
      } else {
        if (onError) onError('Please select an image file');
      }
    }
  };
  
  // Handle zoom in
  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.1, 3));
  };
  
  // Handle zoom out
  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
  };
  
  // Handle reset zoom
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  
  // Helper function to calculate distance from point to line
  const distanceToLine = (x: number, y: number, x1: number, y1: number, x2: number, y2: number) => {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
      param = dot / lenSq;
    }
    
    let xx, yy;
    
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    const dx = x - xx;
    const dy = y - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  return (
    <div className="whiteboard-container h-full flex flex-col">
      {/* Toolbar */}
      <div className="whiteboard-toolbar flex flex-wrap gap-2 p-2 bg-gray-100 border-b border-gray-300">
        {/* Drawing tools */}
        <div className="tool-group flex gap-1">
          <button
            className={`tool-button p-2 rounded ${whiteboardState.currentOptions.tool === 'pen' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'}`}
            onClick={() => handleToolChange('pen')}
            title="Pen"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
          </button>
          
          <button
            className={`tool-button p-2 rounded ${whiteboardState.currentOptions.tool === 'highlighter' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'}`}
            onClick={() => handleToolChange('highlighter')}
            title="Highlighter"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
            </svg>
          </button>
          
          <button
            className={`tool-button p-2 rounded ${whiteboardState.currentOptions.tool === 'line' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'}`}
            onClick={() => handleToolChange('line')}
            title="Line"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 20h16M4 4h16"></path>
            </svg>
          </button>
          
          <button
            className={`tool-button p-2 rounded ${whiteboardState.currentOptions.tool === 'rectangle' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'}`}
            onClick={() => handleToolChange('rectangle')}
            title="Rectangle"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"></path>
            </svg>
          </button>
          
          <button
            className={`tool-button p-2 rounded ${whiteboardState.currentOptions.tool === 'circle' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'}`}
            onClick={() => handleToolChange('circle')}
            title="Circle"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3a9 9 0 100 18 9 9 0 000-18z"></path>
            </svg>
          </button>
          
          <button
            className={`tool-button p-2 rounded ${whiteboardState.currentOptions.tool === 'text' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'}`}
            onClick={() => handleToolChange('text')}
            title="Text"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v18m12-13h-9m9 8h-9"></path>
            </svg>
          </button>
          
          <button
            className={`tool-button p-2 rounded ${whiteboardState.currentOptions.tool === 'laser' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'}`}
            onClick={() => handleToolChange('laser')}
            title="Laser Pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </button>
          
          <button
            className={`tool-button p-2 rounded ${whiteboardState.currentOptions.tool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-200'}`}
            onClick={() => handleToolChange('eraser')}
            title="Eraser"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
        
        {/* Color picker */}
        <div className="color-group relative">
          <button
            className="color-button p-2 rounded bg-white hover:bg-gray-200 flex items-center"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Color"
          >
            <div
              className="color-preview w-5 h-5 rounded-full border border-gray-300"
              style={{ backgroundColor: whiteboardState.currentOptions.strokeColor }}
            ></div>
          </button>
          
          {showColorPicker && (
            <div className="color-picker absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded shadow-lg grid grid-cols-5 gap-1 z-10">
              {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8000', '#8000ff', '#0080ff'].map(color => (
                <div
                  key={color}
                  className="color-option w-6 h-6 rounded-full border border-gray-300 cursor-pointer"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                ></div>
              ))}
            </div>
          )}
        </div>
        
        {/* Stroke width picker */}
        <div className="stroke-width-group relative">
          <button
            className="stroke-width-button p-2 rounded bg-white hover:bg-gray-200"
            onClick={() => setShowStrokeWidthPicker(!showStrokeWidthPicker)}
            title="Stroke Width"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={whiteboardState.currentOptions.strokeWidth} d="M4 12h16"></path>
            </svg>
          </button>
          
          {showStrokeWidthPicker && (
            <div className="stroke-width-picker absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded shadow-lg z-10">
              {[1, 2, 4, 6, 8, 10].map(width => (
                <div
                  key={width}
                  className="stroke-width-option p-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleStrokeWidthChange(width)}
                >
                  <svg className="w-16 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={width} d="M4 12h16"></path>
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Text options */}
        {whiteboardState.currentOptions.tool === 'text' && (
          <div className="text-options-group relative">
            <button
              className="text-options-button p-2 rounded bg-white hover:bg-gray-200"
              onClick={() => setShowTextOptions(!showTextOptions)}
              title="Text Options"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v18m12-13h-9m9 8h-9"></path>
              </svg>
            </button>
            
            {showTextOptions && (
              <div className="text-options-picker absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded shadow-lg z-10 w-48">
                <div className="font-size mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                  <select
                    className="w-full rounded border-gray-300"
                    value={whiteboardState.currentOptions.fontSize || 16}
                    onChange={(e) => handleFontSizeChange(parseInt(e.target.value, 10))}
                  >
                    {[12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64].map(size => (
                      <option key={size} value={size}>{size}px</option>
                    ))}
                  </select>
                </div>
                
                <div className="font-family">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                  <select
                    className="w-full rounded border-gray-300"
                    value={whiteboardState.currentOptions.fontFamily || 'Arial'}
                    onChange={(e) => handleFontFamilyChange(e.target.value)}
                  >
                    {['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Comic Sans MS'].map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Page controls */}
        <div className="page-controls-group ml-auto flex gap-1">
          <button
            className="page-button p-2 rounded bg-white hover:bg-gray-200"
            onClick={handleAddPage}
            title="Add Page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </button>
          
          <button
            className="page-button p-2 rounded bg-white hover:bg-gray-200"
            onClick={handleClearPage}
            title="Clear Page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
          
          <button
            className="page-button p-2 rounded bg-white hover:bg-gray-200"
            onClick={handleExportAsImage}
            title="Export as Image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </button>
          
          <button
            className="page-button p-2 rounded bg-white hover:bg-gray-200"
            onClick={handleExportAsPDF}
            title="Export as PDF"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
          </button>
          
          <label className="page-button p-2 rounded bg-white hover:bg-gray-200 cursor-pointer" title="Import Image">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImportImage}
            />
          </label>
        </div>
        
        {/* Zoom controls */}
        <div className="zoom-controls-group flex gap-1">
          <button
            className="zoom-button p-2 rounded bg-white hover:bg-gray-200"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
            </svg>
          </button>
          
          <button
            className="zoom-button p-2 rounded bg-white hover:bg-gray-200"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
            </svg>
          </button>
          
          <button
            className="zoom-button p-2 rounded bg-white hover:bg-gray-200"
            onClick={handleResetZoom}
            title="Reset Zoom"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
          
          <div className="zoom-level p-2 bg-white rounded">
            {Math.round(scale * 100)}%
          </div>
        </div>
      </div>
      
      {/* Canvas and page thumbnails */}
      <div className="whiteboard-content flex-1 flex">
        {/* Page thumbnails */}
        <div className="page-thumbnails w-24 bg-gray-100 border-r border-gray-300 overflow-y-auto">
          {whiteboardState.pages.map(page => (
            <div
              key={page.id}
              className={`page-thumbnail p-2 cursor-pointer ${page.id === whiteboardState.currentPageId ? 'bg-blue-100' : 'hover:bg-gray-200'}`}
              onClick={() => handleSwitchPage(page.id)}
            >
              <div className="thumbnail-preview bg-white border border-gray-300 aspect-video mb-1">
                {/* Thumbnail preview would be generated in a real implementation */}
              </div>
              <div className="thumbnail-name text-xs text-center truncate">
                {page.name}
              </div>
              {whiteboardState.pages.length > 1 && page.id === whiteboardState.currentPageId && (
                <button
                  className="delete-page-button mt-1 w-full text-xs text-red-600 hover:text-red-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePage(page.id);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* Canvas */}
        <div
          ref={containerRef}
          className="canvas-container flex-1 overflow-hidden bg-gray-200 relative"
        >
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="whiteboard-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          ></canvas>
        </div>
      </div>
    </div>
  );
};

export default WhiteboardNew;