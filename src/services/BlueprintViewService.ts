import { api } from "../api/api";
import type { BlueprintResponseType, BlueprintType, BlueprintViewType, SectionCoords, CreateCropPayload, SectionSize, SectionView, SpecialtyTag, InferenceJobType, AvailableModel } from "@/types/types";



export const BlueprintViewService = {

    getBlueprint: async (blueprintId: string): Promise<BlueprintResponseType> => {
        const response = await api.get(`/blueprints/${blueprintId}`)
        console.log("BLUEPRINT DATA RESPONSE : ", response.data)
        return response.data
    },

    getDownloadUrl: async (blueprintId: string): Promise<string> => {
        try {
            const response = await api.get(`/blueprints/blueprintDownloadUrl/${blueprintId}`)
            return response.data.downloadUrl
        } catch (error) {
            return ""
        }
    },

    getAvailableModels: async (): Promise<AvailableModel> => {
        const response = await api.get("/availableModels")
        return response.data
    },

    updateBluperint: async (blueprintId: string, blueprintName: string, viewSelected: BlueprintViewType, specialties: SpecialtyTag[], levels: string[]): Promise<BlueprintType | null> => {
        try {
            const response = await api.patch(`/blueprints/${blueprintId}`, {
                blueprintName,
                view: viewSelected,
                specialties,
                levels
            })
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

    getRawImage: async (blueprintId: string): Promise<Blob> => {
        try {
            const response = await api.get(`/blueprints/${blueprintId}/image`, {
            responseType: "blob",
            });

            return response.data;

        } catch (error) {
            console.log("ERROR FETCHING IMAGE:", error)
            throw error
        }
    },

    createBlueprint: async (data: CreateCropPayload): Promise<boolean> => {
        try {
            const formData = new FormData()

            formData.append("file", data.file);
            formData.append("blueprintName", data.blueprintName);
            formData.append("projectId", data.projectId);
            formData.append("organizationId", data.organizationId);
            formData.append("originalBlueprintId", data.originalBlueprintId)
            formData.append("width", String(data.width))
            formData.append("height", String(data.height))

            await api.post("/blueprints", formData)

            return true;

        } catch (error) {
            console.log("ERROR ON CREATION:", error)
            return false
        }
    },

    getLatestInferenceJob: async (blueprintId: string): Promise<InferenceJobType | null> => {
        try {
            const response = await api.get(`/blueprints/${blueprintId}/inference-jobs/latest`)
            return response.data
        } catch {
            return null
        }
    },

    enqueueInference: async (blueprintId: string, selectedModels: string[]): Promise<InferenceJobType> => {
        const response = await api.post(`/blueprints/${blueprintId}/inference-jobs`, 
            {selectedModels}
        )
        return response.data
    },

    saveAreas: async (blueprintId: string, sectionViews: SectionView[]) => {
        const response = await api.patch(`/blueprints/${blueprintId}/section-views`, 
            {sectionViews}
        )
        return response.data
    }

}