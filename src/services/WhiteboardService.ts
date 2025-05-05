// Whiteboard service

export interface DrawingOptions {
  strokeColor: string;
  strokeWidth: number;
  tool: 'pen' | 'highlighter' | 'eraser' | 'line' | 'rectangle' | 'circle' | 'text' | 'laser';
  fillColor?: string;
  fontSize?: number;
  fontFamily?: string;
}

export interface WhiteboardPage {
  id: string;
  name: string;
  background: string;
  elements: any[];
  thumbnail?: string;
}

export interface WhiteboardState {
  currentPageId: string;
  pages: WhiteboardPage[];
  currentOptions: DrawingOptions;
}

export const useWhiteboard = () => {
  // Initialize a new whiteboard
  const initializeWhiteboard = (): WhiteboardState => {
    const initialPage: WhiteboardPage = {
      id: 'page-1',
      name: 'Page 1',
      background: 'white',
      elements: [],
    };

    return {
      currentPageId: initialPage.id,
      pages: [initialPage],
      currentOptions: {
        strokeColor: '#000000',
        strokeWidth: 2,
        tool: 'pen',
      },
    };
  };

  // Add a new element to the whiteboard
  const addElement = (state: WhiteboardState, element: any): WhiteboardState => {
    const pageIndex = state.pages.findIndex(page => page.id === state.currentPageId);
    
    if (pageIndex === -1) return state;
    
    const updatedPages = [...state.pages];
    updatedPages[pageIndex] = {
      ...updatedPages[pageIndex],
      elements: [...updatedPages[pageIndex].elements, element],
    };
    
    return {
      ...state,
      pages: updatedPages,
    };
  };

  // Update an existing element
  const updateElement = (state: WhiteboardState, elementId: string, updates: any): WhiteboardState => {
    const pageIndex = state.pages.findIndex(page => page.id === state.currentPageId);
    
    if (pageIndex === -1) return state;
    
    const elementIndex = state.pages[pageIndex].elements.findIndex(el => el.id === elementId);
    
    if (elementIndex === -1) return state;
    
    const updatedPages = [...state.pages];
    const updatedElements = [...updatedPages[pageIndex].elements];
    updatedElements[elementIndex] = {
      ...updatedElements[elementIndex],
      ...updates,
    };
    
    updatedPages[pageIndex] = {
      ...updatedPages[pageIndex],
      elements: updatedElements,
    };
    
    return {
      ...state,
      pages: updatedPages,
    };
  };

  // Delete an element
  const deleteElement = (state: WhiteboardState, elementId: string): WhiteboardState => {
    const pageIndex = state.pages.findIndex(page => page.id === state.currentPageId);
    
    if (pageIndex === -1) return state;
    
    const updatedPages = [...state.pages];
    updatedPages[pageIndex] = {
      ...updatedPages[pageIndex],
      elements: updatedPages[pageIndex].elements.filter(el => el.id !== elementId),
    };
    
    return {
      ...state,
      pages: updatedPages,
    };
  };

  // Clear all elements from the current page
  const clearPage = (state: WhiteboardState): WhiteboardState => {
    const pageIndex = state.pages.findIndex(page => page.id === state.currentPageId);
    
    if (pageIndex === -1) return state;
    
    const updatedPages = [...state.pages];
    updatedPages[pageIndex] = {
      ...updatedPages[pageIndex],
      elements: [],
    };
    
    return {
      ...state,
      pages: updatedPages,
    };
  };

  // Add a new page
  const addPage = (state: WhiteboardState, background: string = 'white'): WhiteboardState => {
    const newPageId = `page-${state.pages.length + 1}`;
    const newPage: WhiteboardPage = {
      id: newPageId,
      name: `Page ${state.pages.length + 1}`,
      background,
      elements: [],
    };
    
    return {
      ...state,
      currentPageId: newPageId,
      pages: [...state.pages, newPage],
    };
  };

  // Delete a page
  const deletePage = (state: WhiteboardState, pageId: string): WhiteboardState => {
    if (state.pages.length <= 1) return state;
    
    const updatedPages = state.pages.filter(page => page.id !== pageId);
    
    // If the current page is being deleted, switch to the first page
    const newCurrentPageId = state.currentPageId === pageId
      ? updatedPages[0].id
      : state.currentPageId;
    
    return {
      ...state,
      currentPageId: newCurrentPageId,
      pages: updatedPages,
    };
  };

  // Switch to a different page
  const switchPage = (state: WhiteboardState, pageId: string): WhiteboardState => {
    const pageExists = state.pages.some(page => page.id === pageId);
    
    if (!pageExists) return state;
    
    return {
      ...state,
      currentPageId: pageId,
    };
  };

  // Change the drawing options
  const changeOptions = (state: WhiteboardState, options: Partial<DrawingOptions>): WhiteboardState => {
    return {
      ...state,
      currentOptions: {
        ...state.currentOptions,
        ...options,
      },
    };
  };

  // Export the whiteboard as an image
  const exportAsImage = async (state: WhiteboardState, pageId?: string): Promise<string | null> => {
    // This would be implemented with canvas operations in a real application
    // For now, we'll just return a placeholder
    console.log('Exporting whiteboard as image', pageId || state.currentPageId);
    return null;
  };

  // Export the whiteboard as a PDF
  const exportAsPDF = async (state: WhiteboardState): Promise<Blob | null> => {
    // This would be implemented with a PDF library in a real application
    // For now, we'll just return a placeholder
    console.log('Exporting whiteboard as PDF');
    return null;
  };

  // Import an image to the whiteboard
  const importImage = async (state: WhiteboardState, file: File): Promise<WhiteboardState> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (!event.target || typeof event.target.result !== 'string') {
          resolve(state);
          return;
        }
        
        const imageUrl = event.target.result;
        
        const newElement = {
          id: `image-${Date.now()}`,
          type: 'image',
          x: 100,
          y: 100,
          width: 300,
          height: 200,
          url: imageUrl,
        };
        
        resolve(addElement(state, newElement));
      };
      
      reader.readAsDataURL(file);
    });
  };

  return {
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
  };
};