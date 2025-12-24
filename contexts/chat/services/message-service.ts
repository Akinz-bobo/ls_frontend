import { ChatMessage, ChatUser } from '../types';
import { SocketService } from './socket-service';
import { ChatApiService } from './chat-api';
import { toast } from 'sonner';

export class MessageService {
  constructor(
    private socketService: SocketService,
    private apiService: ChatApiService
  ) {}

  async sendMessage(
    content: string,
    messageType: string = 'user',
    replyTo?: string,
    currentBroadcast?: string,
    currentUser?: ChatUser
  ): Promise<void> {
    if (!this.socketService.isConnected() || !currentBroadcast || !currentUser) {
      toast.error('Not connected to chat');
      return;
    }

    if (content.trim().length === 0) return;

    const messageData = {
      content: content.trim(),
      broadcastId: currentBroadcast,
      messageType,
      replyTo
    };

    // Send via WebSocket using correct event
    this.socketService.emit('chat:message', messageData);
  }

  sendTyping(isTyping: boolean, currentBroadcast?: string, currentUser?: ChatUser): void {
    if (!this.socketService.isConnected() || !currentBroadcast || !currentUser) {
      return;
    }

    console.log('📤 Sending typing event:', { isTyping, broadcastId: currentBroadcast, username: currentUser.username });
    
    this.socketService.emit('chat:typing', {
      broadcastId: currentBroadcast,
      isTyping
    });
  }

  editMessage(messageId: string, newContent: string, currentBroadcast?: string): void {
    if (!this.socketService.isConnected() || !currentBroadcast) return;

    this.socketService.emit('edit-message', currentBroadcast, messageId, newContent);
  }

  deleteMessage(messageId: string, currentBroadcast?: string): void {
    if (!this.socketService.isConnected() || !currentBroadcast) return;

    this.socketService.emit('delete-message', currentBroadcast, messageId);
  }

  likeMessage(messageId: string, currentBroadcast?: string): void {
    if (!this.socketService.isConnected() || !currentBroadcast) {
      toast.error('Not connected to chat');
      return;
    }

    this.socketService.emit('chat:like', {
      messageId
    });
  }
}