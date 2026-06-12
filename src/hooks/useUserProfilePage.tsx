import { useCallback, useEffect, useState } from "react";
import { UserProfileService } from "@/services/UserProfileService";
import type { OrganizationUserProfile, UserProjectListItem, UserType } from "@/types/types";

export function useUserProfilePage(userId?: string) {

    const [error, setError] = useState<Error | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [user, setUser] = useState<UserType>()
    const [userOrganizationsAndRoles, setUserOrganizationsAndRoles] = useState<OrganizationUserProfile[]>([])
    const [userProjectsList, setUserProjectsList] = useState<UserProjectListItem[]>([])

    const loadUserData = useCallback(async () => {
        try {

            console.log("USER ID : ", userId)

            let userData
            let organizations
            let userProjects

            if(userId){
                userData = await UserProfileService.getUserData(userId)
            } else {
                userData = await UserProfileService.getMyData()
            }

            setUser(userData)

            if(userId) {
                if(userData.self){
                    [organizations, userProjects] = await Promise.all([
                        UserProfileService.getUserOrganizationsAndRoles(userId),
                        UserProfileService.getUserProjects(userId),
                    ])
                } else {
                    [organizations, userProjects] = await Promise.all([
                        UserProfileService.getUserOrganizationsInCommon(userId),
                        [],
                    ])
                }
            } else {
                [organizations, userProjects] = await Promise.all([
                    UserProfileService.getUserOrganizationsAndRoles(),
                    UserProfileService.getUserProjects(),
                ])
            }

            setUserOrganizationsAndRoles(organizations)
            setUserProjectsList(userProjects)

        } catch (error: any) {
            setError(error)
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        loadUserData()
    }, [loadUserData])

    return {
        user,
        userOrganizationsAndRoles,
        userProjectsList,
        loading,
        error,
    }

}