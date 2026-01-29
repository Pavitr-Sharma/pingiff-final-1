import { ref, push, onValue, remove, set, get, serverTimestamp, off } from "firebase/database";
import { realtimeDb } from "./firebase";

export interface ChatMessage {
  id: string;
  text: string;
  sender: "scanner" | "owner";
  timestamp: number;
}

export interface ChatSession {
  createdAt: number;
  expiresAt: number;
  vehicleId: string;
  isActive: boolean;
}

const CHAT_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

// Generate or get existing chat session ID for a vehicle
export const getOrCreateChatSession = async (vehicleId: string): Promise<string> => {
  const vehicleChatsRef = ref(realtimeDb, `vehicleChats/${vehicleId}`);
  const snapshot = await get(vehicleChatsRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    const now = Date.now();
    
    // Check if session is still valid
    if (data.expiresAt > now && data.isActive) {
      return data.sessionId;
    }
    
    // Session expired, clean up old messages
    await remove(ref(realtimeDb, `chats/${data.sessionId}`));
  }
  
  // Create new session
  const sessionId = `chat_${vehicleId}_${Date.now()}`;
  const now = Date.now();
  
  await set(vehicleChatsRef, {
    sessionId,
    createdAt: now,
    expiresAt: now + CHAT_EXPIRY_MS,
    isActive: true,
    scannerName: null, // Will be set when scanner identifies themselves
  });
  
  return sessionId;
};

// Set scanner name for identification
export const setScannerName = async (vehicleId: string, name: string): Promise<void> => {
  const vehicleChatsRef = ref(realtimeDb, `vehicleChats/${vehicleId}/scannerName`);
  await set(vehicleChatsRef, name);
};

// Message validation constants
const MAX_MESSAGE_LENGTH = 500;
const MAX_SESSION_ID_LENGTH = 100;

// Simple text sanitizer for messages
const sanitizeMessage = (text: string): string => {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

// Send a message with validation
export const sendMessage = async (
  sessionId: string,
  text: string,
  sender: "scanner" | "owner"
): Promise<void> => {
  // Validate sessionId
  if (!sessionId || typeof sessionId !== 'string' || sessionId.length > MAX_SESSION_ID_LENGTH) {
    throw new Error('Invalid session ID');
  }

  // Validate sender
  if (sender !== 'scanner' && sender !== 'owner') {
    throw new Error('Invalid sender type');
  }

  // Validate and sanitize message text
  if (!text || typeof text !== 'string') {
    throw new Error('Message text is required');
  }

  const sanitizedText = sanitizeMessage(text);
  
  if (!sanitizedText) {
    throw new Error('Message cannot be empty');
  }

  if (sanitizedText.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`);
  }

  const messagesRef = ref(realtimeDb, `chats/${sessionId}/messages`);
  await push(messagesRef, {
    text: sanitizedText,
    sender,
    timestamp: Date.now(),
  });
  
  // Update last activity
  await set(ref(realtimeDb, `chats/${sessionId}/lastActivity`), serverTimestamp());
};

// Subscribe to messages
export const subscribeToMessages = (
  sessionId: string,
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  const messagesRef = ref(realtimeDb, `chats/${sessionId}/messages`);
  
  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const messages: ChatMessage[] = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        messages.push({
          id: child.key!,
          ...child.val(),
        });
      });
    }
    
    // Sort by timestamp
    messages.sort((a, b) => a.timestamp - b.timestamp);
    callback(messages);
  });
  
  return () => off(messagesRef);
};

// End chat session
export const endChatSession = async (vehicleId: string, sessionId: string): Promise<void> => {
  // Mark session as inactive
  await set(ref(realtimeDb, `vehicleChats/${vehicleId}/isActive`), false);
  
  // Remove messages
  await remove(ref(realtimeDb, `chats/${sessionId}`));
};

// Check if session is still valid
export const isSessionValid = async (vehicleId: string): Promise<boolean> => {
  const vehicleChatsRef = ref(realtimeDb, `vehicleChats/${vehicleId}`);
  const snapshot = await get(vehicleChatsRef);
  
  if (!snapshot.exists()) return false;
  
  const data = snapshot.val();
  return data.isActive && data.expiresAt > Date.now();
};

// Get remaining time in session (in minutes)
export const getSessionTimeRemaining = async (vehicleId: string): Promise<number> => {
  const vehicleChatsRef = ref(realtimeDb, `vehicleChats/${vehicleId}`);
  const snapshot = await get(vehicleChatsRef);
  
  if (!snapshot.exists()) return 0;
  
  const data = snapshot.val();
  const remaining = data.expiresAt - Date.now();
  return Math.max(0, Math.ceil(remaining / 60000));
};