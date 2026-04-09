import type { CreateBlueprintPayload } from "@/types/types";
import { api } from "../api/api";

export const ProjectService = {

    getProject: async (projectId: string) => {
        const response = await api.get(`/projects/${projectId}`)
        return response.data
    },

    getProjectMyRole: async (projectId: string) => {
        const response = await api.get(`/projects/me/role/${projectId}`)
        return response.data
    },

    getProjectBlueprints: async (projectId: string) => {
        const response = await api.get(`/blueprints/projectThumbnails/${projectId}`)
        return response.data
    },

    createBlueprint: async (data: CreateBlueprintPayload): Promise<boolean> => {
        try {
            const formData = new FormData();

            formData.append("file", data.file);
            formData.append("blueprintName", data.blueprintName);
            formData.append("projectId", data.projectId);
            formData.append("organizationId", data.organizationId);

            data.tags.forEach((tag, index) => {
                formData.append(`tags[${index}]`, tag);
            });

            const response = await api.post("/blueprints", formData);

            console.log("CREATION BLUEPRINT RESPONSE:", response.data);

            return true;

        } catch (error) {
            console.log("ERROR ON CREATION:", error);
            return false;
        }
    },
    
}