import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bold, Italic, Code, Smile, FileUp, Download, 
  Send, User, Users, X, Paperclip, Image
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Message types
interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  content: string;
  timestamp: Date;
  isPrivate: boolean;
  recipient?: string;
  attachments?: MessageAttachment[];
  formattedContent?: React.ReactNode;
}

interface ChatProps {
  meetingId: string;
  isHost?: boolean;
  participants?: {
    id: string;
    name: string;
    email: string;
  }[];
  allowDirectMessages?: boolean;
  allowFileSharing?: boolean;
  maxFileSize?: number; // in bytes
}

// Emoji data - simplified for this example
const emojiCategories = [
  { name: "Smileys", emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇"] },
  { name: "People", emojis: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "👏", "🙌", "👐"] },
  { name: "Objects", emojis: ["📚", "💻", "📱", "⌚", "📷", "🔋", "💡", "🔍", "🔑", "📝"] },
];

const Chat: React.FC<ChatProps> = ({ 
  meetingId, 
  isHost = false, 
  participants = [],
  allowDirectMessages = true,
  allowFileSharing = true,
  maxFileSize = 25 * 1024 * 1024 // 25MB default
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("everyone");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Format functions
  const formatBold = () => {
    setInput(prev => `**${prev}**`);
  };
  
  const formatItalic = () => {
    setInput(prev => `*${prev}*`);
  };
  
  const formatCode = () => {
    setInput(prev => `\`${prev}\``);
  };
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Parse formatted text
  const parseFormattedText = (text: string): React.ReactNode => {
    // This is a simplified parser - in a real app, you'd use a proper markdown parser
    const boldRegex = /\*\*(.*?)\*\*/g;
    const italicRegex = /\*(.*?)\*/g;
    const codeRegex = /\`(.*?)\`/g;
    
    let formattedText = text;
    
    // Replace bold text
    formattedText = formattedText.replace(boldRegex, '<strong>$1</strong>');
    
    // Replace italic text
    formattedText = formattedText.replace(italicRegex, '<em>$1</em>');
    
    // Replace code text
    formattedText = formattedText.replace(codeRegex, '<code>$1</code>');
    
    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Check file size
      const oversizedFiles = selectedFiles.filter(file => file.size > maxFileSize);
      if (oversizedFiles.length > 0) {
        alert(`Some files exceed the maximum size limit of ${maxFileSize / (1024 * 1024)}MB`);
        return;
      }
      
      setAttachments(prev => [...prev, ...selectedFiles]);
    }
  };
  
  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "" && attachments.length === 0) return;
    
    // In a real app, you would upload files to your server/storage here
    const uploadedAttachments: MessageAttachment[] = [];
    
    if (attachments.length > 0) {
      // Simulate file upload
      for (const file of attachments) {
        // In a real app, this would be an actual upload to S3 or similar
        uploadedAttachments.push({
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file), // This is temporary and will be revoked when the page refreshes
          size: file.size
        });
      }
    }
    
    const newMessage: Message = {
      id: Math.random().toString(36).substring(2, 9),
      sender: {
        id: user?.email || 'anonymous',
        name: user?.name || 'Anonymous',
        email: user?.email || 'anonymous@example.com'
      },
      content: input,
      timestamp: new Date(),
      isPrivate: !!selectedRecipient,
      recipient: selectedRecipient || undefined,
      attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
      formattedContent: parseFormattedText(input)
    };
    
    // In production, send message over WebSocket or your signaling server
    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setAttachments([]);
  };
  
  // Export chat
  const exportChat = () => {
    const chatText = messages
      .filter(msg => !msg.isPrivate || msg.sender.id === user?.email || msg.recipient === user?.email)
      .map(msg => {
        const time = msg.timestamp.toLocaleTimeString();
        const prefix = msg.isPrivate ? '[PRIVATE] ' : '';
        return `[${time}] ${prefix}${msg.sender.name}: ${msg.content}`;
      })
      .join('\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${meetingId}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Filter messages based on active tab
  const filteredMessages = messages.filter(msg => {
    if (activeTab === "everyone") {
      return !msg.isPrivate;
    } else if (activeTab === "private") {
      return msg.isPrivate && (msg.sender.id === user?.email || msg.recipient === user?.email);
    }
    return true;
  });

  return (
    <div className="chat-panel flex flex-col h-full border rounded-lg overflow-hidden bg-white">
      <div className="chat-header flex justify-between items-center p-3 border-b bg-gray-50">
        <h2 className="text-lg font-medium">Chat</h2>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={exportChat}>
                  <Download size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export Chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {allowDirectMessages && (
        <Tabs defaultValue="everyone" className="w-full" onValueChange={setActiveTab}>
          <div className="px-4 pt-2">
            <TabsList className="w-full">
              <TabsTrigger value="everyone" className="flex-1">Everyone</TabsTrigger>
              <TabsTrigger value="private" className="flex-1">Private</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="everyone" className="flex-1 flex flex-col mt-0">
            <ScrollArea className="flex-1 p-4">
              {filteredMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`mb-3 ${msg.sender.id === user?.email ? 'text-right' : 'text-left'}`}
                >
                  <div 
                    className={`inline-block max-w-[80%] px-3 py-2 rounded-lg ${
                      msg.sender.id === user?.email 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="text-xs font-medium mb-1">
                      {msg.sender.id === user?.email ? 'You' : msg.sender.name}
                    </div>
                    <div className="text-sm break-words">
                      {msg.formattedContent || msg.content}
                    </div>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map(attachment => (
                          <div key={attachment.id} className="flex items-center gap-1">
                            <Paperclip size={12} />
                            <a 
                              href={attachment.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs underline"
                              download={attachment.name}
                            >
                              {attachment.name}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="private" className="flex-1 flex flex-col mt-0">
            <ScrollArea className="flex-1 p-4">
              {filteredMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`mb-3 ${msg.sender.id === user?.email ? 'text-right' : 'text-left'}`}
                >
                  <div 
                    className={`inline-block max-w-[80%] px-3 py-2 rounded-lg ${
                      msg.sender.id === user?.email 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="text-xs font-medium mb-1 flex items-center gap-1">
                      <span>{msg.sender.id === user?.email ? 'You' : msg.sender.name}</span>
                      <span className="opacity-70">→</span>
                      <span>
                        {msg.sender.id === user?.email 
                          ? (participants.find(p => p.id === msg.recipient)?.name || 'Someone')
                          : 'You'}
                      </span>
                    </div>
                    <div className="text-sm break-words">
                      {msg.formattedContent || msg.content}
                    </div>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map(attachment => (
                          <div key={attachment.id} className="flex items-center gap-1">
                            <Paperclip size={12} />
                            <a 
                              href={attachment.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs underline"
                              download={attachment.name}
                            >
                              {attachment.name}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
      
      {!allowDirectMessages && (
        <ScrollArea className="flex-1 p-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`mb-3 ${msg.sender.id === user?.email ? 'text-right' : 'text-left'}`}
            >
              <div 
                className={`inline-block max-w-[80%] px-3 py-2 rounded-lg ${
                  msg.sender.id === user?.email 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="text-xs font-medium mb-1">
                  {msg.sender.id === user?.email ? 'You' : msg.sender.name}
                </div>
                <div className="text-sm break-words">
                  {msg.formattedContent || msg.content}
                </div>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.attachments.map(attachment => (
                      <div key={attachment.id} className="flex items-center gap-1">
                        <Paperclip size={12} />
                        <a 
                          href={attachment.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs underline"
                          download={attachment.name}
                        >
                          {attachment.name}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs opacity-70 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </ScrollArea>
      )}
      
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t">
          <div className="text-xs font-medium mb-1">Attachments</div>
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                <span className="truncate max-w-[100px]">{file.name}</span>
                <button 
                  onClick={() => removeAttachment(index)}
                  className="text-gray-500 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Message input */}
      <div className="p-3 border-t">
        <form onSubmit={sendMessage} className="flex flex-col gap-2">
          <div className="flex items-center gap-1 mb-1">
            {/* Formatting controls */}
            <Button type="button" variant="ghost" size="icon" onClick={formatBold}>
              <Bold size={16} />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={formatItalic}>
              <Italic size={16} />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={formatCode}>
              <Code size={16} />
            </Button>
            
            <Separator orientation="vertical" className="h-6 mx-1" />
            
            {/* Emoji picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon">
                  <Smile size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="end">
                <Tabs defaultValue={emojiCategories[0].name}>
                  <TabsList className="w-full">
                    {emojiCategories.map(category => (
                      <TabsTrigger key={category.name} value={category.name} className="flex-1">
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {emojiCategories.map(category => (
                    <TabsContent key={category.name} value={category.name} className="p-2">
                      <div className="grid grid-cols-8 gap-1">
                        {category.emojis.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            className="p-1 hover:bg-gray-100 rounded"
                            onClick={() => setInput(prev => prev + emoji)}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </PopoverContent>
            </Popover>
            
            {/* File upload */}
            {allowFileSharing && (
              <>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileUp size={16} />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                />
              </>
            )}
            
            <div className="flex-1"></div>
            
            {/* Recipient selector for private messages */}
            {allowDirectMessages && activeTab === "private" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                  >
                    <User size={14} className="mr-1" />
                    {selectedRecipient 
                      ? participants.find(p => p.id === selectedRecipient)?.name || 'Select recipient'
                      : 'Select recipient'
                    }
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {participants
                    .filter(p => p.id !== user?.email)
                    .map(participant => (
                      <DropdownMenuItem 
                        key={participant.id}
                        onClick={() => setSelectedRecipient(participant.id)}
                      >
                        {participant.name}
                      </DropdownMenuItem>
                    ))
                  }
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Type a message${activeTab === "private" ? " (private)" : ""}...`}
              className="min-h-[60px] flex-1 bg-white text-gray-900 border-gray-300"
              style={{ color: 'black', caretColor: 'black' }}
            />
            <Button type="submit" size="icon" className="self-end">
              <Send size={16} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;