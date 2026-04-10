import { api } from "../api/api";
import type { BlueprintType } from "@/types/types";

export const BlueprintViewService = {

    getBlueprint: async (blueprintId: string): Promise<BlueprintType> => {
        const response = await api.get(`/blueprints/${blueprintId}`)
        return response.data
    },

    getDownloadUrl: async (blueprintId: string): Promise<string> => {
        try {
            const response = await api.get(`/blueprints/blueprintDownloadUrl/${blueprintId}`)
            return response.data
        } catch (error) {
            return ""
        }
    },

    updateBluperint: async (blueprintId: string, blueprintName: string, tags: string[]): Promise<BlueprintType | null> => {
        try {
            const response = await api.patch(`/blueprints/${blueprintId}`, {blueprintName, tags})
            return response.data
        } catch (error) {
            return null
        }
    },

    deleteBlueprint: async (blueprintId: string): Promise<boolean> => {
        try {
            const response = await api.delete(`/blueprints/${blueprintId}`)
            if(response) return true
            return false
        } catch (error) {
            return false
        }
    },

}