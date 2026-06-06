import { api } from "../api/api";
import type { CreateOrganizationPayload, InvitationsResponse, OrganizationRole, OrganizationWithMembersResponse, UpdateOrganizationPayload, UserListResponse } from "@/types/types";

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


    // LIMIT : 30
    getAllUsers: async (page: number): Promise<UserListResponse> => {
        const response = await api.get("/user/allUsers/superadmin",
            {
                params: {
                    page: page,
                    limit: 30, // change here
                }
            }
        )
        return response.data
    },

    // LIMIT : 20
    getOrganizationsWithMembers: async (page: number): Promise<OrganizationWithMembersResponse> => {
        const response = await api.get("/organizations/superadmin/organizations-with-members",
            {
                params: {
                    page: page,
                    limit: 20, // change here
                }
            }
        )
        return response.data
    },

    getBlueprintCountsByOrganizationIds: async (
        organizationIds: string[]
    ): Promise<{ organizationId: string; count: number }[]> => {
        const response = await api.get(`/blueprints/counts/${organizationIds}`)
        return response.data
    },

    addUser: async (organizationId: string, userId: string, organizationRole?: OrganizationRole) => {
        const response = await api.post(`/organizations/addUser/${organizationId}/${userId}`, 
            {organizationRole}
        )
        return response.data
    },

    kickUser: async (organizationId: string, userId: string) => {
        console.log("Kicking user ", userId,  " from organization ", organizationId)
        const response = await api.delete(`/organizations/user/${userId}/${organizationId}`)
        return response
    },

    // LIMIT : 20
    getAllInvitations: async (page: number): Promise<InvitationsResponse> => {
        const response = await api.get("invitation/superadmin/allInvitations", 
            {
                params: {
                    page: page,
                    limit: 20, // change here
                }
            }
        )
        return response.data
    },

    refreshInvitation: async (invitationId: string) => {
        const response = await api.patch(`/invitation/superadmin/refresInvitation/${invitationId}`)
        return response.data
    },

    deleteInvitation: async (invitationId: string) => {
        const response = await api.delete(`/invitation/${invitationId}`)
        return response.data
    },

}