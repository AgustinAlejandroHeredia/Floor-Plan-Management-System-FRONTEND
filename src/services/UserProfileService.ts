import type { OrganizationUserProfile, UserType } from "@/types/types";
import { api } from "../api/api";

export const UserProfileService = {

    getMyData: async (): Promise<UserType> => {
        const response = await api.get("/user/myProfile")
        return response.data
    },

    getUserOrganizationsAndRoles: async (userId?: string): Promise<OrganizationUserProfile[]> => {
        const response = await api.get("/organizations/me/organizationsAndRoles/", {
            params: userId ? {userId} : {}
        })
        return response.data
    },

}