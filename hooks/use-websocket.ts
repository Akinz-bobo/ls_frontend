import { WS_URL } from "@/utils/config";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useBroadcastStore } from "@/stores/broadcast-store";

interface UseWebSocketOptions {
  broadcastId?: string;
  userId?: string;
  onMessage?: (data: any) => void;
  onListenerUpdate?: (data: any) => void;
  onChatMessage?: (data: any) => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [listenerCount, setListenerCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const { setStreamUrl, setBroadcast } = useBroadcastStore();

  useEffect(() => {
    if (!options.broadcastId) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL || WS_URL, {
      transports: ["websocket", "polling"],
      timeout: 10000,
      forceNew: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("WebSocket connected to unified audio server");

      socket.emit("join-broadcast", options.broadcastId, {
        userId: options.userId,
        location: { city: "Studio", country: "Local", countryCode: "LC" },
        device: "desktop",
        browser: "Chrome",
      });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("WebSocket disconnected");
    });

    socket.on("listener-count", (data) => {
      setListenerCount(data.count);
      options.onListenerUpdate?.(data);
    });

    socket.on("new-message", (data) => {
      options.onChatMessage?.(data);
    });

    socket.on("broadcast-info", (data) => {
      // Update store with broadcast info
      if (data.streamUrl) setStreamUrl(data.streamUrl);
      if (data.broadcast) setBroadcast(data.broadcast);
      options.onMessage?.(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [options.broadcastId, options.userId, setStreamUrl, setBroadcast]);

  const sendChatMessage = (message: string, messageType: string = "user") => {
    if (socketRef.current && options.broadcastId) {
      socketRef.current.emit("send-message", options.broadcastId, {
        userId: options.userId || "anonymous",
        username: "Host User",
        content: message,
        messageType: messageType,
      });
    }
  };

  const sendStreamStatus = (status: any) => {
    if (socketRef.current && options.broadcastId) {
      socketRef.current.emit("broadcast-audio", options.broadcastId, status);
    }
  };

  return {
    isConnected,
    listenerCount,
    sendChatMessage,
    sendStreamStatus,
  };
}
