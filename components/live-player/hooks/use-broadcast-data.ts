import { useEffect } from "react";
import { useBroadcastStore } from "@/stores/broadcast-store";

export function useBroadcastData(slug?: string) {
  const store = useBroadcastStore();

  useEffect(() => {
    store.fetchBroadcastData(slug);
    const interval = setInterval(() => store.fetchBroadcastData(slug), 10000);
    return () => clearInterval(interval);
  }, [slug, store.fetchBroadcastData]);

  return {
    state: {
      currentShow: store.currentShow,
      currentBroadcast: store.currentBroadcast,
      upcomingBroadcast: store.upcomingBroadcast,
      schedule: store.schedule,
      isLoading: store.isLoading,
      streamUrl: store.streamUrl,
    },
    setState: () => {}, // Deprecated - use store actions directly
    fetchBroadcastData: store.fetchBroadcastData,
    // Direct store access for new components
    store,
  };
}
