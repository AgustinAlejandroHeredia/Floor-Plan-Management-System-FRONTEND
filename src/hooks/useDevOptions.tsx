import { useCallback, useEffect, useState } from "react";

// TYPES
import type { OrganizationWithMembers, UserType } from "@/types/types";

import { DevOptionsService } from "@/services/DevOptionsService";

export function useDevOptions() {

    const [error, setError] = useState<Error | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const [organizationsWithMembers, setOrganizationsWithMembers] = useState<OrganizationWithMembers[]>([])
    const [users, setUsers] = useState<UserType[]>([])

    const [organizationBlueprintCounts, setOrganizationBlueprintCounts] = useState<
        { organizationId: string; count: number }[]
    >([])

    const loadDevOptions = useCallback(async () => {
        try{

            setLoading(true)
            setError(null)

            const organizationsData = await DevOptionsService.getOrganizationsWithMembers()
            setOrganizationsWithMembers(organizationsData)

            const usersData = await DevOptionsService.getAllUsers()
            setUsers(usersData)

            const counts = await DevOptionsService.getBlueprintCountsByOrganizationIds(
                organizationsData.map(org => org._id)
            )
            setOrganizationBlueprintCounts(counts)

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
        organizationBlueprintCounts,
        users,
        loading,
        error,
        refreshContent: loadDevOptions,
    };

}