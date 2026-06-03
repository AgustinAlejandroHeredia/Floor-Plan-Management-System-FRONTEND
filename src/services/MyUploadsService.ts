import { api } from "@/api/api"
import type { MyUploadsBlurpintType } from "@/types/types"

export const MyUploadsService = {
    getUserUploads: async (): Promise<MyUploadsBlurpintType[]> => {
        const response = await api.get("blueprints/me/myUploads")
        return response.data
    },
    getBlueprintUrl: async (blueprintId: string): Promise<{projectId: string, projectName: string}> => {
        const response = await api.get(`blueprints/blueprintUrlPage/${blueprintId}`)
        return response.data
    },
}