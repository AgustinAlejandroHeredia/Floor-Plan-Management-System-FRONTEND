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
  
  // LOADING STATES

  const [loadingOrganizations, setLoadingOrganizations] =
    useState<boolean>(true);

  const [loadingUsers, setLoadingUsers] =
    useState<boolean>(true);

  const [loadingInvitations, setLoadingInvitations] =
    useState<boolean>(true);

const [loadingGeneral, setLoadingGeneral] =
    useState<boolean>(true);

  // ORGANIZATIONS

  const [organizationsWithMembers, setOrganizationsWithMembers] =
    useState<OrganizationWithMembers[]>([])

  const [organizationPages, setOrganizationPages] =
    useState(1)

  const [organizationsCount, setOrganizationsCount] =
    useState(0)

  const [currentOrganizationPage, setCurrentOrganizationPage] =
    useState(1)

  // USERS

  const [users, setUsers] =
    useState<UserType[]>([])

  const [userPages, setUserPages] =
    useState(1)

  const [usersCount, setUsersCount] =
    useState(0)

  const [currentUserPage, setCurrentUserPage] =
    useState(1)

  // INVITATIONS

  const [invitationsList, setInvitationsList] =
    useState<InvitationItemData[]>([])

  const [invitationPages, setInvitationPages] =
    useState(1)

  const [invitationsCount, setInvitationsCount] =
    useState(0)

  const [currentInvitationPage, setCurrentInvitationPage] =
    useState(1)

  // COUNTS

  const [organizationBlueprintCounts, setOrganizationBlueprintCounts] =
    useState<
      {
        organizationId: string
        count: number
      }[]
    >([])

  // --------------------------
  // ORGANIZATIONS
  // --------------------------

  const loadOrganizations = useCallback(
    async (page: number = currentOrganizationPage) => {
        setLoadingOrganizations(true)
        try {
            const response =
            await DevOptionsService.getOrganizationsWithMembers(
                page,
            )

            setOrganizationsWithMembers(
            response.list,
            )

            setOrganizationPages(
            response.totalPages,
            )

            setOrganizationsCount(
            response.totalItems,
            )

            const counts =
            await DevOptionsService.getBlueprintCountsByOrganizationIds(
                response.list.map(
                (org) => org._id,
                ),
            )

            setOrganizationBlueprintCounts(
            counts,
            )

        } catch (err: any) {
            setError(err)
        } finally {
            setLoadingOrganizations(false)
        }
    },
    [],
  )

  // --------------------------
  // USERS
  // --------------------------

  const loadUsers = useCallback(
    async (page: number = currentUserPage) => {
        setLoadingUsers(true)
        try {
            const response =
            await DevOptionsService.getAllUsers(
                page,
            )

            setUsers(response.list)

            setUserPages(
            response.totalPages,
            )

            setUsersCount(
            response.totalItems,
            )

        } catch (err: any) {
            setError(err)
        } finally {
            setLoadingUsers(false)
        }
    },
    [],
  )

  // --------------------------
  // INVITATIONS
  // --------------------------

  const loadInvitations = useCallback(
    async (
        page: number = currentInvitationPage,
    ) => {
        setLoadingInvitations(true)
        try {
            const response =
            await DevOptionsService.getAllInvitations(
                page,
            )

            setInvitationsList(
            response.list,
            )

            setInvitationPages(
            response.totalPages,
            )

            setInvitationsCount(
            response.totalItems,
            )

        } catch (err: any) {
            setError(err)
        } finally {
            setLoadingInvitations(false)
        }
    },
    [],
  )

  // --------------------------
  // INITIAL LOAD
  // --------------------------

  useEffect(() => {
    if(!loadingOrganizations && !loadingUsers && !loadingInvitations){
        setLoadingGeneral(false)
    }
  }, [loadingOrganizations, loadingUsers, loadingInvitations])

  // --------------------------
  // PAGE CHANGES
  // --------------------------

  useEffect(() => {
    loadOrganizations(
      currentOrganizationPage,
    )
  }, [
    currentOrganizationPage,
    loadOrganizations,
  ])

  useEffect(() => {
    loadUsers(currentUserPage)
  }, [
    currentUserPage,
    loadUsers,
  ])

  useEffect(() => {
    loadInvitations(
      currentInvitationPage,
    )
  }, [
    currentInvitationPage,
    loadInvitations,
  ])

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

    currentOrganizationPage,
    currentUserPage,
    currentInvitationPage,

    setCurrentOrganizationPage,
    setCurrentUserPage,
    setCurrentInvitationPage,

    refreshOrganizations:
      loadOrganizations,

    refreshUsers:
      loadUsers,

    refreshInvitations:
      loadInvitations,

    loadingGeneral,
    loadingOrganizations,
    loadingUsers,
    loadingInvitations,

    error,
  }
}