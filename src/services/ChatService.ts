// Chat service

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  type: 'text' | 'file' | 'system';
  isPrivate?: boolean;
  recipientId?: string;
  recipientName?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  isFormatted?: boolean;
  formattedContent?: {
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
    link?: string;
  };
}

export interface ChatState {
  messages: ChatMessage[];
  privateMessagesEnabled: boolean;
  unreadCount: number;
}

export const useChat = () => {
  // Initialize chat state
  const initializeChat = (): ChatState => {
    return {
      messages: [],
      privateMessagesEnabled: true,
      unreadCount: 0,
    };
  };

  // Send a text message
  const sendTextMessage = (
    state: ChatState,
    senderId: string,
    senderName: string,
    content: string,
    isPrivate: boolean = false,
    recipientId?: string,
    recipientName?: string
  ): ChatState => {
    // Don't allow empty messages
    if (!content.trim()) return state;
    
    // Don't allow private messages if disabled
    if (isPrivate && !state.privateMessagesEnabled) return state;
    
    // Create the new message
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId,
      senderName,
      content,
      timestamp: Date.now(),
      type: 'text',
      isPrivate,
      recipientId,
      recipientName,
      // Parse formatting
      isFormatted: content.includes('*') || content.includes('_') || content.includes('`'),
      formattedContent: parseFormatting(content),
    };
    
    return {
      ...state,
      messages: [...state.messages, newMessage],
    };
  };

  // Send a file message
  const sendFileMessage = (
    state: ChatState,
    senderId: string,
    senderName: string,
    file: File,
    isPrivate: boolean = false,
    recipientId?: string,
    recipientName?: string
  ): Promise<ChatState> => {
    return new Promise((resolve) => {
      // Don't allow private messages if disabled
      if (isPrivate && !state.privateMessagesEnabled) {
        resolve(state);
        return;
      }
      
      // In a real implementation, this would upload the file to a server
      // For now, we'll just create a local URL
      const fileUrl = URL.createObjectURL(file);
      
      // Create the new message
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        senderId,
        senderName,
        content: `Shared a file: ${file.name}`,
        timestamp: Date.now(),
        type: 'file',
        isPrivate,
        recipientId,
        recipientName,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      };
      
      resolve({
        ...state,
        messages: [...state.messages, newMessage],
      });
    });
  };

  // Add a system message
  const addSystemMessage = (
    state: ChatState,
    content: string
  ): ChatState => {
    const newMessage: ChatMessage = {
      id: `sys-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      senderId: 'system',
      senderName: 'System',
      content,
      timestamp: Date.now(),
      type: 'system',
    };
    
    return {
      ...state,
      messages: [...state.messages, newMessage],
    };
  };

  // Toggle private messaging
  const togglePrivateMessaging = (state: ChatState): ChatState => {
    return {
      ...state,
      privateMessagesEnabled: !state.privateMessagesEnabled,
    };
  };

  // Mark messages as read
  const markAsRead = (state: ChatState): ChatState => {
    return {
      ...state,
      unreadCount: 0,
    };
  };

  // Export chat history
  const exportChatHistory = (state: ChatState): string => {
    let exportText = 'Chat History\\n\\n';
    
    state.messages.forEach(message => {
      const time = new Date(message.timestamp).toLocaleTimeString();
      
      if (message.type === 'system') {
        exportText += `[${time}] SYSTEM: ${message.content}\\n`;
      } else if (message.isPrivate) {
        exportText += `[${time}] ${message.senderName} (private to ${message.recipientName}): ${message.content}\\n`;
      } else {
        exportText += `[${time}] ${message.senderName}: ${message.content}\\n`;
      }
    });
    
    return exportText;
  };

  // Helper function to parse text formatting
  const parseFormatting = (text: string) => {
    const formatting: {
      bold?: boolean;
      italic?: boolean;
      code?: boolean;
      link?: string;
    } = {};
    
    // Check for bold text (surrounded by *)
    if (text.match(/\*[^*]+\*/)) {
      formatting.bold = true;
    }
    
    // Check for italic text (surrounded by _)
    if (text.match(/_[^_]+_/)) {
      formatting.italic = true;
    }
    
    // Check for code (surrounded by `)
    if (text.match(/`[^`]+`/)) {
      formatting.code = true;
    }
    
    // Check for links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    if (match && match.length > 0) {
      formatting.link = match[0];
    }
    
    return formatting;
  };

  return {
    initializeChat,
    sendTextMessage,
    sendFileMessage,
    addSystemMessage,
    togglePrivateMessaging,
    markAsRead,
    exportChatHistory,
  };
};