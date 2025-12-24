"use client";

import { useEffect, useState, useRef } from 'react';
import { Room, RoomOptions } from 'livekit-client';

interface LiveKitListenerProps {
  serverUrl: string;
  token: string;
  onConnectionChange: (connected: boolean) => void;
  volume: number;
  muted: boolean;
}

export function LiveKitListener({ 
  serverUrl, 
  token, 
  onConnectionChange, 
  volume, 
  muted 
}: LiveKitListenerProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  const connectionAttemptRef = useRef(0);

  useEffect(() => {
    if (!serverUrl || !token) return;

    const attemptId = ++connectionAttemptRef.current;
    let currentRoom: Room | null = null;
    let isMounted = true;

    const connectRoom = async () => {
      if (!isMounted || isConnectingRef.current || attemptId !== connectionAttemptRef.current) return;
      isConnectingRef.current = true;

      console.log('🔄 Attempting LiveKit connection...');

      try {
        currentRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
          publishDefaults: {
            simulcast: false,
          },
        } as RoomOptions);
        
        currentRoom.on('connected', () => {
          if (!isMounted) return;
          console.log('🎧 Connected to LiveKit room as listener');
          console.log('📊 Room info:', {
            name: currentRoom!.name,
            participants: currentRoom!.remoteParticipants.size,
            localParticipant: currentRoom!.localParticipant.identity
          });
          onConnectionChange(true);
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
          }
        });
        
        currentRoom.on('participantConnected', (participant) => {
          console.log('👥 Participant joined:', participant.identity, 'Role:', participant.metadata);
        });
        
        currentRoom.on('participantDisconnected', (participant) => {
          console.log('🚪 Participant left:', participant.identity);
        });

        currentRoom.on('disconnected', (reason) => {
          console.log('🎧 Disconnected from LiveKit room:', reason);
          if (isMounted) {
            onConnectionChange(false);
          }
          isConnectingRef.current = false;
        });

        currentRoom.on('trackSubscribed', (track, publication, participant) => {
          console.log('📡 Track subscribed:', {
            kind: track.kind,
            source: track.source,
            participant: participant.identity,
            trackSid: track.sid
          });
          
          if (track.kind === 'audio') {
            console.log('🎵 Audio track received from:', participant.identity);
            console.log('📊 Track details:', {
              trackSid: track.sid,
              source: track.source,
              muted: track.isMuted
            });
            
            const audioElement = track.attach();
            audioElement.volume = volume / 100;
            audioElement.muted = muted;
            audioElement.autoplay = true;
            document.body.appendChild(audioElement);
            
            console.log('🔊 Audio element created and attached');
            
            track.on('ended', () => {
              console.log('🛑 Audio track ended from:', participant.identity);
              if (audioElement.parentNode) {
                audioElement.parentNode.removeChild(audioElement);
              }
            });
          }
        });

        currentRoom.on('trackUnsubscribed', (track, publication, participant) => {
          console.log('📡 Track unsubscribed:', {
            kind: track.kind,
            participant: participant.identity
          });
        });

        await currentRoom.connect(serverUrl, token);
        if (isMounted) {
          setRoom(currentRoom);
        }
        isConnectingRef.current = false;
      } catch (error) {
        console.error('Failed to connect to LiveKit:', error);
        if (isMounted) {
          onConnectionChange(false);
        }
        isConnectingRef.current = false;
      }
    };

    connectRoom();

    return () => {
      isMounted = false;
      isConnectingRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (currentRoom) {
        currentRoom.disconnect();
      }
      setRoom(null);
    };
  }, [serverUrl, token]);

  useEffect(() => {
    if (!room) return;

    // Update volume for all audio tracks
    room.remoteParticipants.forEach(participant => {
      participant.audioTrackPublications.forEach(publication => {
        if (publication.track) {
          const audioElement = publication.track.attach();
          if (audioElement instanceof HTMLAudioElement) {
            audioElement.volume = volume / 100;
            audioElement.muted = muted;
          }
        }
      });
    });
  }, [room, volume, muted]);

  return null;
}