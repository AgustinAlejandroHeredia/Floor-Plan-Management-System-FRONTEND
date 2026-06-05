import { useCallback, useEffect, useState } from "react"

// TYPES
import type {
  InvitationItemData,
  OrganizationWithMembers,
  UserType,
} from "@/types/types"

import { DevOptionsService } from "@/services/DevOptionsService"

export function useDevOptions() {
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  const [organizationsWithMembers, setOrganizationsWithMembers] =
    useState<OrganizationWithMembers[]>([])
  const [organizationPages, setOrganizationPages] = useState(1)
  const [organizationsCount, setOrganizationsCount] = useState(0)

  const [users, setUsers] = useState<UserType[]>([])
  const [userPages, setUserPages] = useState(1)
  const [usersCount, setUsersCount] = useState(0)

  const [organizationBlueprintCounts, setOrganizationBlueprintCounts] =
    useState<{ organizationId: string; count: number }[]>([])

  const [invitationsList, setInvitationsList] =
    useState<InvitationItemData[]>([])
  const [invitationPages, setInvitationPages] = useState(1)
  const [invitationsCount, setInvitationsCount] = useState(0)

  const loadDevOptions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [
        organizationsResponse,
        usersResponse,
        invitationsResponse,
      ] = await Promise.all([
        DevOptionsService.getOrganizationsWithMembers(1),
        DevOptionsService.getAllUsers(1),
        DevOptionsService.getAllInvitations(1),
      ])

      const counts =
        await DevOptionsService.getBlueprintCountsByOrganizationIds(
          organizationsResponse.list.map(
            (org) => org._id,
          ),
        )

      setOrganizationsWithMembers(
        organizationsResponse.list,
      )

      setUsers(usersResponse.list)

      setInvitationsList(
        invitationsResponse.list,
      )

      setOrganizationBlueprintCounts(
        counts,
      )

      setOrganizationPages(
        organizationsResponse.totalPages,
      )

      setUserPages(
        usersResponse.totalPages,
      )

      setInvitationPages(
        invitationsResponse.totalPages,
      )

      setOrganizationsCount(
        organizationsResponse.totalItems,
      )

      setUsersCount(
        usersResponse.totalItems,
      )

      setInvitationsCount(
        invitationsResponse.totalItems,
      )

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
  }
}