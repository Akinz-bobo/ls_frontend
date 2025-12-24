"use client"

import { useState, useEffect, useRef } from "react"
import { useChat } from "@/contexts/chat"
import { useBroadcastStore } from "@/stores/broadcast-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  MessageSquare,
  Send,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Ban,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Filter,
  Search,
  Settings,
  Crown,
  Shield,
  AlertTriangle,
  Flag,
  Trash2,
  Pin,
  Megaphone,
  Smile,
  Gift,
  Star,
  Clock
} from "lucide-react"

interface EnhancedChatProps {
  isLive: boolean
  isBroadcastLive?: boolean
  hostId: string
  onMessageSend: (message: string, type?: string) => void
  onUserAction: (userId: string, action: string) => void
}

export function EnhancedChat({
  isLive,
  isBroadcastLive,
  hostId,
  onMessageSend,
  onUserAction,
}: EnhancedChatProps) {
  const { currentBroadcast } = useBroadcastStore()
  const {
    state,
    sendMessage,
    sendTyping,
    joinBroadcast,
    leaveBroadcast,
    moderateMessage,
    moderateUser,
    likeMessage,
    updateSettings,
  } = useChat()

  const [newMessage, setNewMessage] = useState("")
  const [selectedMessageType, setSelectedMessageType] = useState("user")
  const [showModerationPanel, setShowModerationPanel] = useState(false)
  const [chatFilters, setChatFilters] = useState({
    showAll: true,
    showUsers: true,
    showModerators: true,
    showSystem: true,
    hideSpam: true
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [showUserActions, setShowUserActions] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [slowMode, setSlowMode] = useState(0)
  const [autoModeration, setAutoModeration] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [chatUsers, setChatUsers] = useState<any[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const broadcastId = currentBroadcast?.id
  const broadcastTitle = currentBroadcast?.title

  // Join broadcast when component mounts
  useEffect(() => {
    if (broadcastId && hostId && !state.currentBroadcast) {
      console.log("🎤 Joining broadcast chat:", broadcastId)
      joinBroadcast(broadcastId, {
        id: hostId,
        username: "Radio Host",
        role: "host",
        isOnline: true,
        isTyping: false,
        lastSeen: new Date(),
        messageCount: 0,
      })
    }

    return () => {
      if (state.currentBroadcast) {
        leaveBroadcast()
      }
    }
  }, [broadcastId, hostId, joinBroadcast, leaveBroadcast, state.currentBroadcast])

  // Debug logging
  useEffect(() => {
    console.log("📊 Chat Debug Info:", {
      broadcastId,
      hostId,
      isConnected: state.isConnected,
      currentBroadcast: state.currentBroadcast,
      messageCount: state.messages.length,
      isLive,
      isBroadcastLive
    })
  }, [broadcastId, hostId, state.isConnected, state.currentBroadcast, state.messages.length, isLive, isBroadcastLive])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [state.messages])

  // Update chat settings when studio settings change
  useEffect(() => {
    updateSettings({
      slowMode: state.chatSettings.slowMode,
      autoModeration: state.chatSettings.autoModeration,
      allowEmojis: state.chatSettings.allowEmojis,
      maxMessageLength: state.chatSettings.maxMessageLength
    })
  }, [])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !state.isConnected) return

    sendMessage(newMessage.trim(), selectedMessageType)
    onMessageSend(newMessage.trim(), selectedMessageType)

    setNewMessage("")
    setIsTyping(false)
    sendTyping(false)
    chatInputRef.current?.focus()
  }

  const handleInputChange = (value: string) => {
    setNewMessage(value)

    // Handle typing indicators
    if (value.length > 0 && !isTyping) {
      setIsTyping(true)
      sendTyping(true)
    } else if (value.length === 0 && isTyping) {
      setIsTyping(false)
      sendTyping(false)
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Auto-stop typing after 3 seconds of inactivity
    if (value.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        sendTyping(false)
      }, 3000)
    }
  }

  const handleMessageAction = (
    messageId: string,
    action: "like" | "dislike" | "pin" | "unpin" | "delete" | "highlight"
  ) => {
    switch (action) {
      case "like":
        likeMessage(messageId)
        break
      case "pin":
      case "delete":
      case "highlight":
        moderateMessage(messageId, action)
        break
      case "unpin":
        // For unpin, we use the pin action (it should toggle)
        moderateMessage(messageId, "pin")
        break
    }
  }

  const handleUserAction = (
    userId: string,
    action: "mute" | "unmute" | "ban" | "unban" | "timeout"
  ) => {
    moderateUser(userId, action)
    onUserAction(userId, action)

    // Show confirmation toast
    const user = state.users.find((u) => u.id === userId)
    if (user) {
      switch (action) {
        case "ban":
          toast.success(`🚫 ${user.username} has been banned`)
          break
        case "unban":
          toast.success(`✅ ${user.username} has been unbanned`)
          break
        case "mute":
          toast.success(`🔇 ${user.username} has been muted`)
          break
        case "unmute":
          toast.success(`🔊 ${user.username} has been unmuted`)
          break
        case "timeout":
          toast.success(`⏰ ${user.username} has been timed out`)
          break
      }
    }

    setSelectedUserId(null)
    setShowUserActions(false)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'host': return Crown
      case 'moderator': return Shield
      case 'admin': return Star
      default: return null
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'host': return 'text-purple-600'
      case 'moderator': return 'text-blue-600'
      case 'admin': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'host': return 'border-l-4 border-purple-500 bg-purple-50'
      case 'moderator': return 'border-l-4 border-blue-500 bg-blue-50'
      case 'system': return 'border-l-4 border-gray-500 bg-gray-50'
      case 'announcement': return 'border-l-4 border-red-500 bg-red-50'
      default: return 'border-l-4 border-transparent'
    }
  }

  if (!broadcastId) return null

  const currentBroadcastMessages = state.messages.filter(
    (msg) => msg.broadcastId === broadcastId
  )

  const filteredMessages = currentBroadcastMessages.filter(msg => {
    if (searchTerm && !msg.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (!chatFilters.showSystem && msg.messageType === 'system') return false
    if (!chatFilters.showUsers && msg.messageType === 'user') return false
    if (!chatFilters.showModerators && (msg.messageType === 'moderator' || msg.messageType === 'host')) return false
    if (chatFilters.hideSpam && msg.isModerated) return false
    return true
  })

  const pinnedMessage = filteredMessages.find((msg) => msg.isPinned)
  const typingUsers = state.typingUsers.filter(
    (typing) => typing.broadcastId === broadcastId
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Pinned Message */}
      {pinnedMessage && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                <Pin className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 mt-1 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-xs sm:text-sm truncate">
                      {pinnedMessage.username}
                    </span>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      Pinned
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 break-words">
                    {pinnedMessage.content}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMessageAction(pinnedMessage.id, "unpin")}
                className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
              >
                <Pin className="h-3 w-3 text-yellow-600" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Chat */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="text-sm sm:text-base">Live Chat</span>
              <Badge variant="outline" className="text-xs hidden sm:inline-flex">{filteredMessages.length} messages</Badge>
              {state.isConnected ? (
                <Badge variant="default" className="bg-green-500 text-xs">
                  🟢 <span className="hidden sm:inline">Connected</span>
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  🔴 <span className="hidden sm:inline">Disconnected</span>
                </Badge>
              )}
              {state.isBroadcastLive ? (
                <Badge variant="default" className="bg-red-500 animate-pulse text-xs">
                  🎤 LIVE
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  📻 <span className="hidden sm:inline">Offline</span>
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModerationPanel(!showModerationPanel)}
                className="h-7 sm:h-8 px-2 sm:px-3"
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-1">Settings</span>
              </Button>
              {state.chatSettings.autoModeration && (
                <Badge variant="secondary" className="text-xs hidden sm:inline-flex">Auto-Mod</Badge>
              )}
              {state.chatSettings.slowMode > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {state.chatSettings.slowMode}s
                </Badge>
              )}
              {typingUsers.length > 0 && (
                <Badge variant="outline" className="animate-pulse text-xs">
                  {typingUsers.length} typing...
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
          {/* Moderation Panel */}
          {showModerationPanel && (
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-xs font-medium mb-1 block">Message Type</label>
                  <Select value={selectedMessageType} onValueChange={setSelectedMessageType}>
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User Message</SelectItem>
                      <SelectItem value="host">Host Message</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="system">System Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium mb-1 block">Search Messages</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3 w-3 text-gray-400" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-7 h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-users"
                    checked={chatFilters.showUsers}
                    onCheckedChange={(checked) => setChatFilters(prev => ({ ...prev, showUsers: checked }))}
                  />
                  <label htmlFor="show-users" className="text-xs">Users</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-mods"
                    checked={chatFilters.showModerators}
                    onCheckedChange={(checked) => setChatFilters(prev => ({ ...prev, showModerators: checked }))}
                  />
                  <label htmlFor="show-mods" className="text-xs">Mods</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-system"
                    checked={chatFilters.showSystem}
                    onCheckedChange={(checked) => setChatFilters(prev => ({ ...prev, showSystem: checked }))}
                  />
                  <label htmlFor="show-system" className="text-xs">System</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hide-spam"
                    checked={chatFilters.hideSpam}
                    onCheckedChange={(checked) => setChatFilters(prev => ({ ...prev, hideSpam: checked }))}
                  />
                  <label htmlFor="hide-spam" className="text-xs">Hide Spam</label>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <ScrollArea className="h-64 sm:h-80 w-full border rounded-lg">
            <div className="p-3 sm:p-4 space-y-3">
              {/* Show connection status if not connected */}
              {!state.isConnected && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Connecting to chat...</p>
                  <p className="text-xs mt-1">Broadcast ID: {broadcastId}</p>
                </div>
              )}
              
              {/* Show empty state if connected but no messages */}
              {state.isConnected && filteredMessages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Be the first to send a message!</p>
                </div>
              )}
              
              {filteredMessages.map((message) => {
                const isOwnMessage = message.userId === hostId
                const isAnnouncement = message.messageType === "announcement"
                const isHostMessage = message.messageType === "host"
                const isSystemMessage = message.messageType === "system"

                // Skip pinned messages in main flow (already shown at top)
                if (message.isPinned) return null

                return (
                  <div
                    key={message.id}
                    className={`p-2 sm:p-3 rounded-lg ${getMessageTypeColor(message.messageType)} ${
                      message.isHighlighted ? 'ring-2 ring-blue-300' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                        <AvatarFallback className={`text-xs ${getRoleColor(message.messageType)}`}>
                          {message.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                          <span className={`text-xs sm:text-sm font-medium ${getRoleColor(message.messageType)}`}>
                            {message.username}
                          </span>
                          
                          {/* Role Badge */}
                          {(isHostMessage || message.messageType === 'moderator') && (
                            <Badge variant="secondary" className="text-xs h-4">
                              {isHostMessage ? (
                                <>
                                  <Crown className="h-2 w-2 mr-1" />
                                  Host
                                </>
                              ) : (
                                <>
                                  <Shield className="h-2 w-2 mr-1" />
                                  Mod
                                </>
                              )}
                            </Badge>
                          )}
                          
                          {isAnnouncement && (
                            <Badge variant="destructive" className="text-xs h-4">
                              <Megaphone className="h-2 w-2 mr-1" />
                              Announcement
                            </Badge>
                          )}
                          
                          <span className="text-xs text-gray-500">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        <p className="text-xs sm:text-sm text-gray-900 break-words leading-relaxed">
                          {message.content}
                        </p>
                        
                        {/* Message Actions */}
                        <div className="flex items-center gap-1 mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMessageAction(message.id, 'like')}
                            className="h-6 px-2 text-xs"
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            {message.likes || 0}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMessageAction(message.id, 'pin')}
                            className="h-6 px-2 text-xs"
                          >
                            <Pin className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMessageAction(message.id, 'delete')}
                            className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {/* Typing Indicators in Messages Area */}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 text-gray-500 text-xs italic p-2">
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

          {/* Message Input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                ref={chatInputRef}
                value={newMessage}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                disabled={!state.isConnected}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !state.isConnected}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {selectedMessageType !== 'user' && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                Sending as: <span className="font-medium capitalize">{selectedMessageType}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}