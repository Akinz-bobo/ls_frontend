"use client";

import React, { useState, useEffect } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { LiveKitListener } from "./components/livekit-listener";

interface LiveKitPlayerProps {
  broadcastSlug: string;
  className?: string;
}

export function LiveKitPlayer({
  broadcastSlug,
  className,
}: LiveKitPlayerProps) {
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Stable anonymous listener id per session/broadcast to avoid repeated token fetches
  const getSessionListenerId = (slug: string) => {
    try {
      const key = `listener-id:${slug}`;
      let id = sessionStorage.getItem(key);
      if (!id) {
        id = `listener-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        sessionStorage.setItem(key, id);
      }
      return id;
    } catch (e) {
      return `listener-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }
  };

  const userId = getSessionListenerId(broadcastSlug);
  const userName = "Listener";

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            roomName: broadcastSlug,
            userName,
            role: "listener",
          }),
        });

        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error("Failed to fetch token:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [broadcastSlug, userId]);

  if (loading) {
    return <div className={className}>Connecting...</div>;
  }

  if (!token) {
    return <div className={className}>Connection failed</div>;
  }

  return (
    <div className={className}>
      <LiveKitRoom
        serverUrl={
          process.env.NEXT_PUBLIC_LIVEKIT_SERVER_URL || "ws://localhost:7880"
        }
        token={token}
        connectOptions={{ autoSubscribe: true }}
      >
        <LiveKitListener
          broadcastId={broadcastSlug}
          userId={userId}
          userName={userName}
          onConnectionChange={setConnected}
          volume={100}
          muted={false}
          isPlaying={isPlaying}
          onPlayingChange={setIsPlaying}
        />
      </LiveKitRoom>
    </div>
  );
}
