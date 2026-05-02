import { useCallback, useEffect, useState } from "react";
import { UserProfileService } from "@/services/UserProfileService";
import type { OrganizationUserProfile, UserType } from "@/types/types";

export function useUserProfilePage(userId?: string) {

    const [error, setError] = useState<Error | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [myUser, setMyUser] = useState<UserType>()
    const [userOrganizationsAndRoles, setUserOrganizationsAndRoles] = useState<OrganizationUserProfile[]>([])

    const loadUserData = useCallback(async () => {
        try {

            const [me, organizations] = await Promise.all([
                UserProfileService.getMyData(),
                UserProfileService.getUserOrganizationsAndRoles(userId)
            ])

            setMyUser(me)
            setUserOrganizationsAndRoles(organizations)

            console.log(me)

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
        myUser,
        userOrganizationsAndRoles, 
        loading,
        error,
    }

}