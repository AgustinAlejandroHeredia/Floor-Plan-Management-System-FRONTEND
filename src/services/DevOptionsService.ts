import { api } from "../api/api";
import type { CreateOrganizationPayload, OrganizationType, OrganizationWithMembers, UpdateOrganizationPayload } from "@/types/types";

export const DevOptionsService = {

    createOrganization: async (payload: CreateOrganizationPayload) => {
        const response = await api.post("/organizations", payload) 
        return response.data
    },

    updateOrganization: async (organizationId: string, payload: UpdateOrganizationPayload) => {
        const response = await api.patch(`/organizations/${organizationId}`, payload)
        return response.data
    },

    deleteOrganization: async (organizationId: string) => {
        const response = await api.delete(`/deleteorganization/${organizationId}`)
        return response.data
    },

    getAllUsers: async () => {
        const response = await api.get("/user/allUsers/superadmin")
        return response.data
    },

    getOrganizationsWithMembers: async (): Promise<OrganizationWithMembers[]> => {
        const organizationsRes = await api.get("/organizations/allOrganizations/superadmin")
        const organizations: OrganizationType[] = organizationsRes.data

        const orgsWithMembers = await Promise.all(
            organizations.map(async (org) => {
                try {

                    const membersRes = await api.get(`/organizations/allMembers/admin/${org._id}`)
                    return {
                        ...org,
                        members: membersRes.data
                    }
                } catch (error) {
                    return {
                        ...org,
                        members: []
                    }
                }
            })
        )
        return orgsWithMembers
    },

    getBlueprintCountsByOrganizationIds: async (
        organizationIds: string[]
    ): Promise<{ organizationId: string; count: number }[]> => {
        const response = await api.get(`/blueprints/counts/${organizationIds}`)
        return response.data
    },

}