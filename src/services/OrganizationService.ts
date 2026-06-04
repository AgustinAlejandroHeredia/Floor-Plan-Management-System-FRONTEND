import type { CreateProjectPayload, InvitationItemData, OrganizationActionPermissions, OrganizationMembersList } from "@/types/types";
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

    getOrganizationMembersAsAdmin: async (organizationId: string): Promise<OrganizationMembersList[]> => {
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
        const response = await api.delete(`/deleteproject/${projectId}`)
        return response.data
    },

    leaveOrganization: async (organizationId: string) => {
        const response = await api.delete(`/organizations/me/${organizationId}`)
        return response
    },

    kickUser: async (organizationId: string, userId: string) => {
        console.log("Kicking user ", userId,  " from organization ", organizationId)
        const response = await api.delete(`/organizations/user/${userId}/${organizationId}`)
        return response
    },

    changeUserOrganizationRole: async (userId: string, organizationId: string) => {
        const response = await api.patch(`/organizations/membership/${organizationId}/${userId}/role`)
        return response
    },

    getAllOrganizationInvitations: async (organizationId: string): Promise<InvitationItemData[]> => {
        const response = await api.get(`/invitation/admin/organizationInvitations/${organizationId}`)
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