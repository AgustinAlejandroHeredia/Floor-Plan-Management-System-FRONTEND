import type { CreateBlueprintPayload } from "@/types/types";
import { api } from "../api/api";

export const ProjectService = {

    getProject: async (projectId: string) => {
        const response = await api.get(`/projects/${projectId}`)
        console.log("PROJECT INFO : ", response.data)
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

            await api.post("/blueprints", formData);

            return true;

        } catch (error) {
            console.log("ERROR ON CREATION:", error);
            return false;
        }
    },

    getOrganizationMyRole: async (organizationId: string) => {
        const response = await api.get(`/organizations/me/role/${organizationId}`)
        return response.data
    },

    getOrganizationActionPermissions: async (organizationId: string) => {
        const response = await api.get(`/organizations/actionPermissions/${organizationId}`)
        return response.data
    },

    deleteProject: async (projectId: string): Promise<void> => {
        console.log("PROJECT ID : ", projectId)
        const response = await api.delete(`/deleteproject/${projectId}`)
        console.log(response.data)
        return response.data
    },
    
}