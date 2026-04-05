import type { CreateProjectPayload } from "@/types/types";
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

    getProjectOldestBlueprint: async (projectId: string): Promise<{ downloadUrl: string } | null> => {
        try {
            const response = await api.get(`/blueprints/oldestBlueprintUrl/${projectId}`)
            return response.data
        } catch {
            return null
        }
    },

    getOrganizationMembersAsAdmin: async (organizationId: string) => {
        const response = await api.get(`/organizations/allMembers/admin/${organizationId}`)
        return response.data
    },

    createNewProject: async (data: CreateProjectPayload): Promise<boolean> => {
        try {
            const response = await api.post(`/projects`, data)
            console.log("CREATION PROJECT RESPONSE : ",response.data)
            return true
        } catch (error) {
            return false
        }
    },

}