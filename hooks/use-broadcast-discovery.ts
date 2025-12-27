'use client';

import { useEffect, useState } from 'react';
import { useBroadcastStore } from '@/stores/broadcast-store';

export function useBroadcastDiscovery() {
  const { setBroadcast, setCurrentShow } = useBroadcastStore();
  const [liveBroadcasts, setLiveBroadcasts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkForLiveBroadcast = async () => {
      try {
        const response = await fetch('/api/broadcasts/current');
        if (response.ok) {
          const data = await response.json();
          
          if (data.isLive) {
            console.log('📻 [Discovery] Found live broadcast:', data.title);
            setLiveBroadcasts([data]);
            setBroadcast(data);
            setCurrentShow(data.title);
          } else {
            console.log('📻 [Discovery] No live broadcast found');
            setLiveBroadcasts([]);
            setBroadcast(null);
            setCurrentShow('No live broadcast');
          }
        }
      } catch (error) {
        console.warn('Failed to check for live broadcast:', error);
        setLiveBroadcasts([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Check immediately
    checkForLiveBroadcast();

    // Poll every 10 seconds
    const interval = setInterval(checkForLiveBroadcast, 10000);

    return () => clearInterval(interval);
  }, [setBroadcast, setCurrentShow]);

  return { 
    liveBroadcasts, 
    hasLiveBroadcasts: liveBroadcasts.length > 0,
    isLoading 
  };
}