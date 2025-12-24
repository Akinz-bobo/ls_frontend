"use client"

import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useBroadcastStore } from '@/stores/broadcast-store'

interface AudioAsset {
  id: string
  filename: string
  originalName: string
  url: string
  size: number
  mimeType: string
  description?: string
  tags?: string
  createdAt: string
}

interface AudioAssetsResponse {
  assets: AudioAsset[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export function useAudioAssets() {
  const queryClient = useQueryClient()
  
  const fetchAssets = useCallback(async (params: {
    search?: string
    type?: string
    genre?: string
    page?: number
    limit?: number
  } = {}) => {
    const searchParams = new URLSearchParams()
    if (params.search) searchParams.set('search', params.search)
    if (params.type) searchParams.set('type', params.type)
    if (params.genre) searchParams.set('genre', params.genre)
    if (params.page) searchParams.set('page', params.page.toString())
    if (params.limit) searchParams.set('limit', params.limit.toString())

    const response = await fetch(`/api/assets/audio?${searchParams}`)
    if (!response.ok) throw new Error('Failed to fetch assets')

    return response.json() as Promise<AudioAssetsResponse>
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['audio-assets'],
    queryFn: () => fetchAssets()
  })

  const uploadMutation = useMutation({
    mutationFn: async ({ file, metadata }: {
      file: File
      metadata: {
        title?: string
        artist?: string
        genre?: string
        audioType?: 'music' | 'jingle' | 'effect' | 'voice'
      }
    }) => {
      const formData = new FormData()
      formData.append('file', file)
      if (metadata.title) formData.append('title', metadata.title)
      if (metadata.artist) formData.append('artist', metadata.artist)
      if (metadata.genre) formData.append('genre', metadata.genre)
      if (metadata.audioType) formData.append('audioType', metadata.audioType)

      const response = await fetch('/api/assets/audio', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload asset')
      }

      const responseData = await response.json()
      return responseData.asset as AudioAsset
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audio-assets'] })
    }
  })

  return {
    assets: data?.assets || [],
    loading: isLoading,
    pagination: data?.pagination || { page: 1, limit: 20, total: 0, pages: 0 },
    fetchAssets,
    uploadAsset: uploadMutation.mutateAsync
  }
}