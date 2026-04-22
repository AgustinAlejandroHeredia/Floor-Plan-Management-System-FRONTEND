import type { CreateProjectPayload, OrganizationActionPermissions } from "@/types/types";
import { api } from "../api/api";

export const OrganizationService = {

    getOrganizationProjects: async (organizationId: string) => {
        const response = await api.get(`/projects/organizationProjects/${organizationId}`)
        return response.data
    },

    getOrganizationMyRole: async (organizationId: string) => {
        const response = await api.get(`/organizations/me/role/${organizationId}`)
        return response.data
    },

    getProjectOldestBlueprintThumbnail: async (projectId: string): Promise<{ downloadUrl: string } | null> => {
        try {
            const response = await api.get(`/blueprints/oldestBlueprintThumbnailUrl/${projectId}`)
            return response.data
        } catch {
            return null
        }
    },

    getOrganizationActionPermissions: async (organizationId: string) => {
        const response = await api.get(`/organizations/actionPermissions/${organizationId}`)
        return response.data
    },

    getOrganizationMembersAsAdmin: async (organizationId: string) => {
        const response = await api.get(`/organizations/allMembers/admin/${organizationId}`)
        return response.data
    },

    updateOrganizationActionPermissionsAsAdmin: async (organizationId: string, payload: OrganizationActionPermissions) => {
        const response = await api.patch(`/organizations/actionPermissions/admin/${organizationId}`, payload)
        return response.data
    },

    createNewProject: async (data: CreateProjectPayload): Promise<boolean> => {
        try {
            console.log("PROJECT DATA : ", data)
            await api.post(`/projects`, data)
            return true
        } catch (error) {
            return false
        }
    },

    deleteProject: async (projectId: string): Promise<void> => {
        console.log("PROJECT ID : ", projectId)
        const response = await api.delete(`/deleteproject/${projectId}`)
        console.log(response.data)
        return response.data
    }

}