import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useBroadcastStore } from '@/stores/broadcast-store'
import { BroadcastService } from "../services"
import type { Broadcast, StaffMember, Asset, Program, BroadcastFilters } from "../types"

export function useBroadcasts(programIdFromUrl?: string | null) {
  const queryClient = useQueryClient()
  const { setLoading } = useBroadcastStore()
  
  const [filters, setFilters] = useState<BroadcastFilters>({
    status: "all",
    program: programIdFromUrl || "all",
    search: ""
  })

  const { data: broadcasts = [], isLoading: broadcastsLoading } = useQuery({
    queryKey: ['broadcasts', filters.program],
    queryFn: () => BroadcastService.fetchBroadcasts(filters.program === "all" ? undefined : filters.program),
    select: (data) => data.broadcasts
  })

  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: () => BroadcastService.fetchStaff(),
    select: (data) => data.staff || []
  })

  const { data: assets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => BroadcastService.fetchAssets(),
    select: (data) => data.assets || []
  })

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => BroadcastService.fetchPrograms(),
    select: (data) => data.programs || []
  })

  const filteredBroadcasts = broadcasts.filter(broadcast => {
    const matchesStatus = filters.status === "all" || broadcast.status === filters.status
    const matchesProgram = filters.program === "all" || 
      (filters.program === "null" && !broadcast.program) ||
      broadcast.program?.id === filters.program
    const matchesSearch = !filters.search || 
      broadcast.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      broadcast.description?.toLowerCase().includes(filters.search.toLowerCase())
    
    return matchesStatus && matchesProgram && matchesSearch
  })

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['broadcasts'] })
    queryClient.invalidateQueries({ queryKey: ['staff'] })
    queryClient.invalidateQueries({ queryKey: ['assets'] })
    queryClient.invalidateQueries({ queryKey: ['programs'] })
  }, [queryClient])

  return {
    broadcasts: filteredBroadcasts,
    staff,
    assets,
    programs,
    isLoading: broadcastsLoading,
    error: null,
    filters,
    setFilters,
    refetch
  }
}