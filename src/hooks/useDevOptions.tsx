import { useCallback, useEffect, useState } from "react";

// TYPES
import type { InvitationItemData, OrganizationWithMembers, UserType } from "@/types/types";

import { DevOptionsService } from "@/services/DevOptionsService";

export function useDevOptions() {

    const [error, setError] = useState<Error | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const [organizationsWithMembers, setOrganizationsWithMembers] = useState<OrganizationWithMembers[]>([])
    const [organizationPages, setOrganizationPages] = useState(1)
    const [organizationsCount, setOrganizationsCount] = useState(1)

    const [users, setUsers] = useState<UserType[]>([])
    const [userPages, setUserPages] = useState(1)
    const [usersCount, setUsersCount] = useState(1)

    const [organizationBlueprintCounts, setOrganizationBlueprintCounts] = useState<
        { organizationId: string; count: number }[]
    >([])

    const [invitationsList, setInvitationsList] = useState<InvitationItemData[]>([])
    const [invitationPages, setInvitationPages] = useState(1)
    const [invitationsCount, setInvitationsCount] = useState(1)

    const loadDevOptions = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const organizationsPromise =
                DevOptionsService.getOrganizationsWithMembers(1)

            const usersPromise =
                DevOptionsService.getAllUsers(1)

            const invitationsPromise =
                DevOptionsService.getAllInvitations(1)

            const organizationsResponse = await organizationsPromise
            const organizationsData = organizationsResponse.list

            const usersResponse = await usersPromise
            const usersListData = usersResponse.list

            const invitationsResponse = await invitationsPromise
            const invitationsListData = invitationsResponse.list

            const countsPromise =
                DevOptionsService.getBlueprintCountsByOrganizationIds(
                    organizationsData.map(org => org._id)
                )

            const [
                counts,
            ] = await Promise.all([
                countsPromise,
            ])

            setOrganizationsWithMembers(organizationsData)
            setUsers(usersListData)
            setOrganizationBlueprintCounts(counts)
            setInvitationsList(invitationsListData)

            setOrganizationPages(organizationsResponse.totalPages)
            setUserPages(usersResponse.totalPages)
            setInvitationPages(invitationsResponse.totalPages)

            setOrganizationsCount(organizationsResponse.totalItems)
            setUsersCount(usersResponse.totalItems)
            setInvitationsCount(invitationsResponse.totalItems)

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
        organizationPages,
        userPages,
        invitationPages,
        organizationsCount,
        usersCount,
        invitationsCount,
        loading,
        error,
        refreshContent: loadDevOptions,
    };

}