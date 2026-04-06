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

}