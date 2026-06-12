import type {
  InvitationItemData,
  OrganizationActionPermissions,
  OrganizationMembersList,
  OrganizationRole,
  ProjectOrganizationType,
} from "@/types/types";
import { useEffect, useState, useCallback } from "react";
import { OrganizationService } from "@/services/OrganizationService";

export function useOrganization(organizationId: string) {

  const [error, setError] = useState<Error | null>(null);

  // LOADING STATES

  const [loadingProjects, setLoadingProjects] =
    useState<boolean>(true);

  const [loadingUsers, setLoadingUsers] =
    useState<boolean>(true);

  const [loadingInvitations, setLoadingInvitations] =
    useState<boolean>(true);

  const [loadingUserRoleAndPermissisons, setLoadingUserRoleAndPermissisons] =
    useState<boolean>(true);

  const [loadingGeneral, setLoadingGeneral] =
    useState<boolean>(true);

  // PERMISSIONS

  const [organizationPermissions, setOrganizationPermissions] =
    useState<OrganizationActionPermissions>({
      createPermission: "admins",
      invitePermission: "admins",
    });

  const [userOrganizationRole, setUserOrganizationRole] =
    useState<OrganizationRole>("member");

  // PROJECTS

  const [projects, setProjects] = useState<ProjectOrganizationType[]>([]);

  const [projectPages, setProjectPages] =
    useState(1)

  const [projectsCount, setProjectsCount] =
    useState(0)

  const [currentProjectPage, setCurrentProjectPage] =
    useState(1)

  // USERS

  const [organizationMembersList, setOrganizationMembersList] =
    useState<OrganizationMembersList[]>([]);

  const [hasMoreThanOneAdmin, setHasMoreThanOneAdmin] =
    useState<boolean>(false);

  const [userPages, setUserPages] =
    useState(1)

  const [usersCount, setUsersCount] =
    useState(0)

  const [currentUserPage, setCurrentUserPage] =
    useState(1)

  // INVITATIONS

  const [organizationInvitationsList, setOrganizationInvitationsList] =
    useState<InvitationItemData[]>([]);

  const [invitationPages, setInvitationPages] =
    useState(1)

  const [invitationsCount, setInvitationsCount] =
    useState(0)

  const [currentInvitationPage, setCurrentInvitationPage] =
    useState(1)



  // --------------------------
  // PERMISSIONS
  // --------------------------
  const loadPermissions = async () => {
    try {
      const permissions = await OrganizationService.getOrganizationActionPermissions(
        organizationId
      )
      setOrganizationPermissions(permissions)
    } catch (err: any) {
      setError(err)
    }
  }

  const loadUserRole = async () => {
    try {
      const role = await OrganizationService.getMyOrganizationRole(
        organizationId
      )
      setUserOrganizationRole(role)
    } catch (err: any) {
      setError(err)
    }
  }
  
  
  // --------------------------
  // PROJECT
  // --------------------------

  const loadProjects = useCallback(
    async (page: number = currentProjectPage) => {
      setLoadingProjects(true)
      try {
        const response =
          await OrganizationService.getOrganizationProjects(
            organizationId,
            page,
          )

          setProjects(
            response.list,
          )

          setProjectPages(
            response.totalPages
          )

          setProjectsCount(
            response.totalItems,
          )

          //console.log("PROJECTS : ", response)

      } catch (err: any) {
        setError(err)
      } finally {
        setLoadingProjects(false)
      }
    },
    []
  )

  // --------------------------
  // USERS
  // --------------------------

  const loadUsers = useCallback(
    async (page: number = currentUserPage) => {
      setLoadingUsers(true)
      try {
        const response = await OrganizationService.getOrganizationMembersAsMember(
          organizationId,
          page,
        )

        setOrganizationMembersList(
          response.list
        )

        setUserPages(
          response.totalPages
        )

        setUsersCount(
          response.totalItems
        )

        setHasMoreThanOneAdmin(
          response.list.filter(
            (member: OrganizationMembersList) =>
              member.organizationRole === "admin",
          ).length > 1,
        )

        //console.log("USERS : ", response)

      } catch (err: any) {
        setError(err)
      } finally {
        setLoadingUsers(false)
      }
    },
    []
  )

  // --------------------------
  // INVITATIONS
  // --------------------------

  const loadInvitations = useCallback(
    async (page: number = currentInvitationPage) => {
      setLoadingInvitations(true)
      try {
        const response = 
          await OrganizationService.getAllOrganizationInvitations(
            organizationId,
            page,
          )

        setOrganizationInvitationsList(
          response.list
        )

        setInvitationPages(
          response.totalPages
        )

        setInvitationsCount(
          response.totalItems
        )

        //console.log("INVITATIONS : ", response)
        
      } catch (err: any) {
        setError(err)
      } finally {
        setLoadingInvitations(false)
      }
    },
    []
  )

  // --------------------------
  // USER ROLE AND PERMISSIONS
  // --------------------------

  useEffect(() => {
    const initializeRoleAndPermissions = async () => {
      setLoadingUserRoleAndPermissisons(true)
      await Promise.all([
        loadPermissions(),
        loadUserRole(),
      ])
      setLoadingUserRoleAndPermissisons(false)
    }
    initializeRoleAndPermissions()
  }, [])

  // --------------------------
  // INITIAL LOAD
  // --------------------------

  useEffect(() => {
    if(!loadingProjects && !loadingUsers && !loadingInvitations){
        setLoadingGeneral(false)
    }
  }, [loadingProjects, loadingUsers, loadingInvitations])

  // --------------------------
  // PAGE CHANGES
  // --------------------------

  useEffect(() => {
    loadProjects(
      currentProjectPage
    )
  }, [
    currentProjectPage,
    loadProjects
  ])

  useEffect(() => {
    loadUsers(
      currentUserPage
    )
  }, [
    currentUserPage,
    loadUsers
  ])

  useEffect(() => {
    loadInvitations(
      currentInvitationPage
    )
  }, [
    currentInvitationPage,
    loadInvitations
  ])

  return {
    organizationPermissions,
    projects,
    userOrganizationRole,
    organizationMembersList,
    organizationInvitationsList,
    hasMoreThanOneAdmin,

    projectsCount,
    usersCount,
    invitationsCount,

    projectPages,
    userPages,
    invitationPages,

    currentProjectPage, 
    currentUserPage, 
    currentInvitationPage,

    setCurrentProjectPage,
    setCurrentUserPage,
    setCurrentInvitationPage,

    refreshPermissions: loadPermissions,
    refreshProjects: loadProjects,
    refreshUsers: loadUsers,
    refreshInvitations: loadInvitations,

    loadingGeneral,
    loadingUserRoleAndPermissisons,
    loadingProjects,
    loadingUsers,
    loadingInvitations,

    error,
  };
}