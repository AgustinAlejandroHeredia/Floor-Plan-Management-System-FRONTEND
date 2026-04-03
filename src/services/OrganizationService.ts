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

    getProjectOldestBlueprint: async (projectId: string) => {
        const response = await api.get(`/blueprints/oldestBlueprintUrl/${projectId}`)
        return response.data
    },

    getOrganizationMembersAsAdmin: async (organizationId: string) => {
        const response = await api.get(`/organizations/allMembers/admin/${organizationId}`)
        return response.data
    },

}