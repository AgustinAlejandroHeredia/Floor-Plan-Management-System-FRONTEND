import type { OrganizationUserProfile, UserProjectListItem, UserType } from "@/types/types";
import { api } from "../api/api";

export const UserProfileService = {

    getMyData: async (): Promise<UserType> => {
        const response = await api.get("/user/myProfile")
        return response.data
    },

    getUserData: async (userId: string): Promise<UserType> => {
        const response = await api.get("/user/profile", {
            params: userId ? {userId} : {}
        })
        console.log("RETORNA USER DATA : ", response.data)
        return response.data
    },

    getUserOrganizationsAndRoles: async (userId?: string): Promise<OrganizationUserProfile[]> => {
        const response = await api.get("/organizations/me/organizationsAndRoles/", {
            params: userId ? {userId} : {}
        })
        console.log("RETORNA USER ORG Y ROLES : ", response.data)
        return response.data
    },

    getUserOrganizationsInCommon: async (userId: string): Promise<OrganizationUserProfile[]> => {
        const response = await api.get(`/organizations/organizationsInCommon/${userId}`)
        return response.data
    },

    getUserProjects: async (userId?: string): Promise<UserProjectListItem[]> => {
        const response = await api.get("/projects/userProjects", {
            params: userId ? {userId} : {}
        })
        console.log("RETORNA DATA DE PROJECTS : ", response.data)
        return response.data
    },

}