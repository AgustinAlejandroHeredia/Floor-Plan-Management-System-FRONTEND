import { api } from '../api/api'
import type { BlueprintAlignment, BlueprintType } from '@/types/types'

export interface SaveAlignmentPayload {
  alignedWith: string
  matrix: number[][]
  scale?: number
  rotationDeg?: number
  translation?: number[]
  confidence?: number
  status?: string
}

export const AlignmentService = {
  // Re-run auto-alignment for a blueprint (result arrives over the /alignment socket).
  triggerAlign: async (blueprintId: string): Promise<void> => {
    await api.post(`/blueprints/${blueprintId}/align`)
  },

  getAlignment: async (blueprintId: string): Promise<BlueprintAlignment | null> => {
    const res = await api.get(`/blueprints/${blueprintId}/alignment`)
    return res.data ?? null
  },

  // Persist a user-adjusted or fully-manual transform from the UI.
  saveAlignment: async (
    blueprintId: string,
    payload: SaveAlignmentPayload,
  ): Promise<BlueprintAlignment> => {
    const res = await api.put(`/blueprints/${blueprintId}/alignment`, payload)
    return res.data
  },

  // Fetch a blueprint (used to load the counterpart image/name for the overlay).
  getBlueprint: async (blueprintId: string): Promise<BlueprintType> => {
    const res = await api.get(`/blueprints/${blueprintId}`)
    return res.data
  },
}
