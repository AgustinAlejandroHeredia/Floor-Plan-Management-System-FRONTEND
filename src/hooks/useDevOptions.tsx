import { useCallback, useEffect, useState } from "react";

// TYPES
import type { InvitationItemData, OrganizationWithMembers, UserType } from "@/types/types";

import { DevOptionsService } from "@/services/DevOptionsService";

export function useDevOptions() {

    const [error, setError] = useState<Error | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const [organizationsWithMembers, setOrganizationsWithMembers] = useState<OrganizationWithMembers[]>([])
    const [users, setUsers] = useState<UserType[]>([])

    const [organizationBlueprintCounts, setOrganizationBlueprintCounts] = useState<
        { organizationId: string; count: number }[]
    >([])

    const [invitationsList, setInvitationsList] = useState<InvitationItemData[]>([])

    const loadDevOptions = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const organizationsPromise =
                DevOptionsService.getOrganizationsWithMembers()

            const usersPromise =
                DevOptionsService.getAllUsers()

            const invitationsPromise =
                DevOptionsService.getAllInvitations()

            const organizationsData = await organizationsPromise

            const countsPromise =
                DevOptionsService.getBlueprintCountsByOrganizationIds(
                    organizationsData.map(org => org._id)
                )

            const [
                usersData,
                allInvitations,
                counts,
            ] = await Promise.all([
                usersPromise,
                invitationsPromise,
                countsPromise,
            ])

            setOrganizationsWithMembers(organizationsData)
            setUsers(usersData)
            setOrganizationBlueprintCounts(counts)
            setInvitationsList(allInvitations)

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
        invitationsList,
        loading,
        error,
        refreshContent: loadDevOptions,
    };

}