'use client'

import React from 'react'
import { LiveKitBroadcastProvider } from '@/contexts/broadcast'
import { StudioInterface } from './studio-interface'

interface BroadcastStudioInterfaceProps {
  broadcastId: string
  stationName: string
}

export function BroadcastStudioInterface({ 
  broadcastId, 
  stationName
}: BroadcastStudioInterfaceProps) {
  return (
    <LiveKitBroadcastProvider 
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_SERVER_URL || 'ws://localhost:7880'}
      token="" // Token will be provided by parent component
    >
      <StudioInterface 
        broadcastId={broadcastId}
        stationName={stationName}
      />
    </LiveKitBroadcastProvider>
  )
}