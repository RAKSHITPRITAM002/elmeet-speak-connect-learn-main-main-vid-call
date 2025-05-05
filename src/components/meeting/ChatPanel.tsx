
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile } from "lucide-react";

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isSystem?: boolean;
};

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  currentUserId: string;
  onClose?: () => void;
}

export const ChatPanel = ({ messages, onSendMessage, currentUserId, onClose }: ChatPanelProps) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-900 px-4 py-3 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-medium">Chat</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            &times;
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.senderId === currentUserId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.isSystem
                  ? "bg-gray-200 dark:bg-gray-700 text-center w-full"
                  : msg.senderId === currentUserId
                  ? "bg-brand-teal text-white"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {!msg.isSystem && msg.senderId !== currentUserId && (
                <div className="font-semibold text-xs text-gray-600 dark:text-gray-300 mb-1">
                  {msg.senderName}
                </div>
              )}
              <div className="break-words">{msg.content}</div>
              <div className="text-xs text-right mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-2 border-t dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 dark:text-gray-400"
          >
            <Paperclip size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 dark:text-gray-400"
          >
            <Smile size={18} />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            size="icon"
            className="bg-brand-teal text-white"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};
