import { useEffect, useRef } from "react";
import { useBroadcastStore } from "@/stores/broadcast-store";

/**
 * Polls the server for current broadcast status and updates the Zustand store.
 * This ensures all browsers/tabs see broadcast status changes in real-time,
 * even when they're on different devices or windows.
 */
export function useBroadcastPolling(enabled: boolean = true) {
  const { currentBroadcast, setBroadcast, setCurrentShow, setStreamUrl } =
    useBroadcastStore();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastStatusRef = useRef<string | null>(currentBroadcast?.status || null);

  useEffect(() => {
    if (!enabled) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    const poll = async () => {
      try {
        const response = await fetch("/api/broadcasts/current", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });

        if (!response.ok) {
          console.warn(
            "[BroadcastPolling] Failed to fetch current broadcast:",
            response.status
          );
          return;
        }

        const data = await response.json();
        const newStatus = data.status;

        // If status changed, update the store
        if (lastStatusRef.current !== newStatus) {
          console.log("[BroadcastPolling] Broadcast status changed:", {
            from: lastStatusRef.current,
            to: newStatus,
            broadcast: data.id || "none",
          });

          lastStatusRef.current = newStatus;

          if (newStatus === "LIVE" && data.id) {
            // Broadcast is now live
            setBroadcast(data);
            setCurrentShow(data.title || "Live Broadcast");
            setStreamUrl(data.streamUrl || null);
          } else if (
            newStatus === "ENDED" ||
            newStatus === "READY" ||
            !data.id
          ) {
            // Broadcast is no longer live
            setBroadcast(null);
            setCurrentShow(
              data.upcoming
                ? `Up next: ${data.upcoming.title} at ${new Date(data.upcoming.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
                : "No live broadcasts at the moment"
            );
            setStreamUrl(null);
          }
        }
      } catch (error) {
        console.error(
          "[BroadcastPolling] Error polling broadcast status:",
          error
        );
      }
    };

    // Initial poll
    poll();

    // Poll every 3 seconds (adjust as needed for your use case)
    pollIntervalRef.current = setInterval(poll, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [enabled, setBroadcast, setCurrentShow, setStreamUrl]);
}
