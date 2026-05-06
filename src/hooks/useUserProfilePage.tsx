import { useCallback, useEffect, useState } from "react";
import { UserProfileService } from "@/services/UserProfileService";
import type { OrganizationUserProfile, UserType } from "@/types/types";

export function useUserProfilePage(userId?: string) {

    const [error, setError] = useState<Error | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [user, setUser] = useState<UserType>()
    const [userOrganizationsAndRoles, setUserOrganizationsAndRoles] = useState<OrganizationUserProfile[]>([])

    const loadUserData = useCallback(async () => {
        try {

            console.log("USER ID : ", userId)

            let userData
            let organizations

            if(userId) {
                [userData, organizations] = await Promise.all([
                    UserProfileService.getUserData(userId),
                    UserProfileService.getUserOrganizationsAndRoles(userId)
                ])
            } else {
                [userData, organizations] = await Promise.all([
                    UserProfileService.getMyData(),
                    UserProfileService.getUserOrganizationsAndRoles(userId)
                ])
            }

            setUser(userData)
            setUserOrganizationsAndRoles(organizations)

            console.log(userData)

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
        loading,
        error,
    }

}