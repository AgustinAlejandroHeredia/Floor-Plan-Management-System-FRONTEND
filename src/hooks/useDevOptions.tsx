import { useCallback, useEffect, useState } from "react";

// TYPES
import type { OrganizationWithMembers, UserType } from "@/types/types";

import { DevOptionsService } from "@/services/DevOptionsService";

export function useDevOptions() {

    const [error, setError] = useState<Error | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const [organizationsWithMembers, setOrganizationsWithMembers] = useState<OrganizationWithMembers[]>([])
    const [users, setUsers] = useState<UserType[]>([])

    const loadDevOptions = useCallback(async () => {
        try{

            setLoading(true)
            setError(null)

            const organizationsData = await DevOptionsService.getOrganizationsWithMembers()
            setOrganizationsWithMembers(organizationsData)

            const usersData = await DevOptionsService.getAllUsers()
            setUsers(usersData)

        } catch (err: any) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadDevOptions()
    }, [loadDevOptions])

    return {
        organizationsWithMembers,
        users,
        loading,
        error,
        refreshContent: loadDevOptions,
    };

}