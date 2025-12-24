"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useChat } from "@/contexts/chat";
import { useAuth } from "@/contexts/auth-context";
import { useBroadcastStore } from "@/stores/broadcast-store";

interface ChatToggleProps {
  size?: "sm" | "md";
}

export function ChatToggle({ size = "md" }: ChatToggleProps) {
  const { user } = useAuth();
  const { currentBroadcast } = useBroadcastStore();
  const { state, sendMessage, sendTyping, clearUnread, joinBroadcast } = useChat();

  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const buttonSize = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  const broadcastId = currentBroadcast?.id;
  const isBroadcastLive = currentBroadcast?.status === 'LIVE';

  // Auto-join broadcast if not already joined
  useEffect(() => {
    if (broadcastId && !state.currentBroadcast && user) {
      console.log('🎤 Auto-joining broadcast chat:', broadcastId);
      joinBroadcast(broadcastId, {
        id: user.id,
        username: user.email || 'Anonymous',
        role: 'listener',
        isOnline: true,
        isTyping: false,
        lastSeen: new Date(),
        messageCount: 0,
      });
    }
  }, [broadcastId, state.currentBroadcast, user, joinBroadcast]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [state.messages, isOpen]);

  useEffect(() => {
    if (isOpen && state.unreadCount > 0) {
      clearUnread();
    }
  }, [isOpen, state.unreadCount, clearUnread]);

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !state.isConnected) {
      return;
    }

    sendMessage(newMessage.trim(), "user");
    setNewMessage("");
    setIsTyping(false);
    sendTyping(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);

    if (value.length > 0 && !isTyping) {
      setIsTyping(true);
      sendTyping(true);
    } else if (value.length === 0 && isTyping) {
      setIsTyping(false);
      sendTyping(false);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTyping(false);
      }, 3000);
    }
  };

  // Show all messages if no broadcast filter, or filter by broadcast
  const currentBroadcastMessages = broadcastId 
    ? state.messages.filter((msg) => msg.broadcastId === broadcastId)
    : state.messages; // Show all messages if no specific broadcast

  // Get typing users for this broadcast
  const typingUsers = state.typingUsers.filter(
    (typing) => typing.broadcastId === broadcastId && typing.userId !== currentUserId
  );

  // Debug logging
  useEffect(() => {
    console.log('💬 Chat Toggle Debug:', {
      broadcastId,
      totalMessages: state.messages.length,
      filteredMessages: currentBroadcastMessages.length,
      isConnected: state.isConnected,
      currentBroadcast: state.currentBroadcast,
      typingUsers: typingUsers.length,
      typingUserNames: typingUsers.map(u => u.username),
      sampleMessages: state.messages.slice(0, 3)
    });
  }, [broadcastId, state.messages.length, currentBroadcastMessages.length, state.isConnected, state.currentBroadcast, typingUsers.length]);

  const currentUserId = user?.id || state.currentUser?.id || `listener-${Date.now()}`;

  if (!broadcastId) return null;

  return (
    <>
      <Button
        onClick={handleToggleChat}
        variant="ghost"
        size="icon"
        className={`${buttonSize} rounded-full bg-primary/10 hover:bg-primary/20 text-primary relative`}
      >
        <MessageCircle className={iconSize} />
        {state.unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {state.unreadCount > 9 ? "9+" : state.unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] md:relative md:inset-auto">
          <div
            className="absolute inset-0 bg-black/50 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute bottom-0 left-0 right-0 md:absolute md:bottom-12 md:right-0 md:left-auto md:w-[40vw] bg-white border border-gray-200 rounded-t-lg md:rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Live Chat</span>
                <Badge variant="outline" className="text-xs">
                  {currentBroadcastMessages.length}
                </Badge>
                {state.isConnected && isBroadcastLive ? (
                  <Badge variant="default" className="bg-green-500 text-xs">
                    🟢
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    🔴
                  </Badge>
                )}
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="h-64 md:h-80 p-4 bg-gray-50">
              <div className="space-y-4">
                {/* Show connection status if not connected */}
                {!state.isConnected && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Connecting to chat...</p>
                  </div>
                )}
                
                {/* Show empty state if connected but no messages */}
                {state.isConnected && currentBroadcastMessages.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-1">Be the first to send a message!</p>
                  </div>
                )}
                
                {currentBroadcastMessages.map((message) => (
                  <div key={message.id} className="flex items-start gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {message.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{message.username}</span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicators */}
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-gray-500 text-xs italic">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>
                      {typingUsers.length === 1
                        ? `${typingUsers[0].username} is typing...`
                        : `${typingUsers.length} people are typing...`}
                    </span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={!state.isConnected}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || !state.isConnected}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}