/**
 * Utility to trigger SSE broadcast events from the frontend API.
 * This allows the Next.js API route to notify backend of broadcast status changes.
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function notifyBroadcastStarted(broadcastData: {
  id: string;
  title: string;
  description?: string;
  streamUrl?: string;
  liveKitUrl?: string;
  liveKitToken?: string;
}): Promise<void> {
  try {
    // Call backend to broadcast the event via SSE
    const response = await fetch(
      `${BACKEND_URL}/api/broadcasts/notify/started`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(broadcastData),
      }
    );

    if (!response.ok) {
      console.error(
        "[Frontend API] Failed to notify broadcast started:",
        response.statusText
      );
    } else {
      console.log("[Frontend API] ✅ Broadcast started event sent to backend");
    }
  } catch (error) {
    console.error("[Frontend API] Error notifying broadcast started:", error);
  }
}

export async function notifyBroadcastEnded(broadcastData: {
  id: string;
  title: string;
}): Promise<void> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/broadcasts/notify/ended`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(broadcastData),
    });

    if (!response.ok) {
      console.error(
        "[Frontend API] Failed to notify broadcast ended:",
        response.statusText
      );
    } else {
      console.log("[Frontend API] ✅ Broadcast ended event sent to backend");
    }
  } catch (error) {
    console.error("[Frontend API] Error notifying broadcast ended:", error);
  }
}
