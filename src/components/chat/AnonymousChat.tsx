import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  text: string;
  sender: "scanner" | "owner";
  timestamp: Date;
}

interface AnonymousChatProps {
  vehiclePlate: string;
  isOwner?: boolean;
  onClose?: () => void;
}

const AnonymousChat = ({ vehiclePlate, isOwner = false, onClose }: AnonymousChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const senderType = isOwner ? "owner" : "scanner";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: "welcome",
      text: isOwner 
        ? "Someone scanned your vehicle's QR code. Chat with them anonymously."
        : `You're chatting about vehicle ${vehiclePlate}. Your identity is protected.`,
      sender: isOwner ? "scanner" : "owner",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [vehiclePlate, isOwner]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: senderType,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    // Simulate typing indicator and auto-response for demo
    if (!isOwner) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const autoReply: Message = {
          id: (Date.now() + 1).toString(),
          text: "Thanks for reaching out! I'll be there shortly.",
          sender: "owner",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, autoReply]);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full bg-white rounded-2xl border-2 border-ping-yellow/30 overflow-hidden"
      style={{
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Chat Header */}
      <div className="bg-ping-yellow px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ping-ink/10 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-ping-ink" />
          </div>
          <div>
            <h3 className="font-bold text-ping-ink">Anonymous Chat</h3>
            <p className="text-xs text-ping-ink/70">Vehicle: {vehiclePlate}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-ping-ink/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-ping-ink" />
          </button>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="bg-ping-cream/50 px-4 py-2 text-center">
        <p className="text-xs text-ping-brown">
          🔒 Messages are not stored. Chat ends when you leave.
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-ping-cream/30">
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
                    ? "bg-ping-yellow text-ping-ink rounded-br-md"
                    : "bg-white border border-ping-ink/10 text-ping-ink rounded-bl-md"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3 h-3" />
                  <span className="text-xs font-medium opacity-70">
                    {message.sender === "owner" ? "Vehicle Owner" : "Anonymous"}
                  </span>
                </div>
                <p className="text-sm">{message.text}</p>
                <p className="text-[10px] opacity-50 mt-1 text-right">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-ping-ink/10 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-ping-ink/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-ping-ink/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-ping-ink/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-ping-ink/10">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border-2 border-ping-ink/20 focus:border-ping-yellow"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-ping-yellow text-ping-ink hover:bg-ping-yellow/90 px-4"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AnonymousChat;