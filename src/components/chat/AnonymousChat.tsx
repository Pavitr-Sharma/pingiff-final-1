import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, X, User, Clock, AlertCircle, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChatMessage,
  getOrCreateChatSession,
  sendMessage,
  subscribeToMessages,
  endChatSession,
  getSessionTimeRemaining,
  setScannerName,
} from "@/lib/chatService";

interface AnonymousChatProps {
  vehicleId: string;
  vehiclePlate: string;
  isOwner?: boolean;
  onClose?: () => void;
  scannerName?: string; // Pre-set scanner name
}

const AnonymousChat = ({ vehicleId, vehiclePlate, isOwner = false, onClose, scannerName: initialScannerName }: AnonymousChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scannerNameInput, setScannerNameInput] = useState(initialScannerName || "");
  const [hasIdentified, setHasIdentified] = useState(isOwner || !!initialScannerName);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const senderType = isOwner ? "owner" : "scanner";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat session
  useEffect(() => {
    const initSession = async () => {
      try {
        setIsLoading(true);
        const id = await getOrCreateChatSession(vehicleId);
        setSessionId(id);
        
        const remaining = await getSessionTimeRemaining(vehicleId);
        setTimeRemaining(remaining);
        
        // If scanner name was provided, set it
        if (initialScannerName && !isOwner) {
          await setScannerName(vehicleId, initialScannerName);
          setHasIdentified(true);
        }
      } catch (err) {
        console.error("Failed to init chat session:", err);
        setError("Failed to start chat. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    initSession();
  }, [vehicleId, initialScannerName, isOwner]);

  const handleIdentify = async () => {
    if (!scannerNameInput.trim()) return;
    
    try {
      await setScannerName(vehicleId, scannerNameInput.trim());
      setHasIdentified(true);
    } catch (err) {
      console.error("Failed to set scanner name:", err);
    }
  };

  // Subscribe to messages
  useEffect(() => {
    if (!sessionId) return;
    
    const unsubscribe = subscribeToMessages(sessionId, (msgs) => {
      setMessages(msgs);
    });
    
    return () => unsubscribe();
  }, [sessionId]);

  // Update time remaining every minute
  useEffect(() => {
    const interval = setInterval(async () => {
      const remaining = await getSessionTimeRemaining(vehicleId);
      setTimeRemaining(remaining);
      
      // Auto-end if expired
      if (remaining <= 0 && sessionId) {
        await handleEndChat();
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [vehicleId, sessionId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !sessionId) return;

    try {
      await sendMessage(sessionId, newMessage.trim(), senderType);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleEndChat = async () => {
    if (sessionId) {
      await endChatSession(vehicleId, sessionId);
    }
    onClose?.();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-card rounded-2xl border border-border items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground">Starting secure chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-card rounded-2xl border border-destructive/20 items-center justify-center p-8">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <p className="text-destructive text-center mb-4">{error}</p>
        <Button onClick={onClose} variant="outline">Go Back</Button>
      </div>
    );
  }

  // Scanner identification screen
  if (!hasIdentified && !isOwner) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-full bg-card rounded-2xl border border-border items-center justify-center p-8"
      >
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <UserCircle className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold mb-2">Identify Yourself</h3>
        <p className="text-muted-foreground text-center text-sm mb-6 max-w-[250px]">
          Enter a nickname so the vehicle owner knows who they're chatting with. This helps build trust.
        </p>
        <div className="w-full max-w-[280px] space-y-3">
          <Input
            placeholder="e.g., Neighbor from Block A, Security Guard"
            value={scannerNameInput}
            onChange={(e) => setScannerNameInput(e.target.value)}
            className="text-center"
            onKeyPress={(e) => e.key === "Enter" && handleIdentify()}
          />
          <Button onClick={handleIdentify} className="w-full" disabled={!scannerNameInput.trim()}>
            Start Chat
          </Button>
          <button
            onClick={() => {
              setScannerNameInput("Anonymous Person");
              setHasIdentified(true);
            }}
            className="text-xs text-muted-foreground hover:text-foreground w-full text-center"
          >
            Continue as Anonymous
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden"
    >
      {/* Chat Header */}
      <div className="bg-primary px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-primary-foreground">
              {isOwner ? (scannerNameInput || "Anonymous Chat") : "Chat with Owner"}
            </h3>
            <p className="text-xs text-primary-foreground/70">Vehicle: {vehiclePlate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-primary-foreground/10 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3 text-primary-foreground" />
            <span className="text-xs font-medium text-primary-foreground">{timeRemaining}m</span>
          </div>
          {onClose && (
            <button
              onClick={handleEndChat}
              className="p-2 hover:bg-primary-foreground/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-primary-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-muted px-4 py-2 text-center">
        <p className="text-xs text-muted-foreground">
          🔒 Messages auto-delete after {timeRemaining} minutes. No data stored.
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/30">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.sender === senderType ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === senderType
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border rounded-bl-md"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3 h-3" />
                  <span className="text-xs font-medium opacity-70">
                    {message.sender === "owner" ? "Vehicle Owner" : (scannerNameInput || "Scanner")}
                  </span>
                </div>
                <p className="text-sm">{message.text}</p>
                <p className="text-[10px] opacity-50 mt-1 text-right">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AnonymousChat;