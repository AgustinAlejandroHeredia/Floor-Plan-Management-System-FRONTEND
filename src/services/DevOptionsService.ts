import { api } from "../api/api";
import type { CreateOrganizationPayload, OrganizationType, OrganizationWithMembers } from "@/types/types";

export const DevOptionsService = {

    createOrganization: async (payload: CreateOrganizationPayload) => {
        const response = await api.post("/organizations", payload) 
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

}