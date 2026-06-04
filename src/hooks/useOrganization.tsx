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

  const [organizationPermissions, setOrganizationPermissions] =
    useState<OrganizationActionPermissions>({
      createPermission: "admins",
      invitePermission: "admins",
    });

  const [projects, setProjects] = useState<ProjectOrganizationType[]>([]);
  const [projectThumbnails, setProjectThumbnails] = useState<
    Record<string, string>
  >({});

  const [userOrganizationRole, setUserOrganizationRole] =
    useState<OrganizationRole>("member");

  const [organizationMembersList, setOrganizationMembersList] =
    useState<OrganizationMembersList[]>([]);

  const [hasMoreThanOneAdmin, setHasMoreThanOneAdmin] =
    useState<boolean>(false);

  const [loadingOrganizationProjects, setLoadingOrganizationProjects] =
    useState<boolean>(true);

  const [organizationInvitationsList, setOrganizationInvitationsList] =
    useState<InvitationItemData[]>([]);

  const loadProjects = useCallback(async () => {
    try {
      setLoadingOrganizationProjects(true);
      setError(null);

      const [
        projectsData,
        userRole,
        permissionsData,
        membersList,
        allOrganizationInvitations,
      ] = await Promise.all([
        OrganizationService.getOrganizationProjects(organizationId),
        OrganizationService.getOrganizationMyRole(organizationId),
        OrganizationService.getOrganizationActionPermissions(organizationId),
        OrganizationService.getOrganizationMembersAsAdmin(organizationId),
        OrganizationService.getAllOrganizationInvitations(organizationId),
      ]);

      // thumbnails (dependen de projectsData)
      const thumbnails: Record<string, string> = {};

      await Promise.all(
        projectsData.map(async (project: ProjectOrganizationType) => {
          const res =
            await OrganizationService.getProjectOldestBlueprintThumbnail(
              project._id,
            );

          if (res) {
            thumbnails[project._id] = res.downloadUrl;
          }
        }),
      );

      setProjects(projectsData);
      setUserOrganizationRole(userRole);
      setOrganizationPermissions(permissionsData);
      setOrganizationMembersList(membersList);
      setOrganizationInvitationsList(allOrganizationInvitations);
      setProjectThumbnails(thumbnails);

      setHasMoreThanOneAdmin(
        membersList.filter(
          (member: OrganizationMembersList) =>
            member.organizationRole === "admin",
        ).length > 1,
      );
    } catch (err: any) {
      setError(err);
    } finally {
      setLoadingOrganizationProjects(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId) {
      loadProjects();
    }
  }, [loadProjects, organizationId]);

  return {
    organizationPermissions,
    projects,
    projectThumbnails,
    userOrganizationRole,
    organizationMembersList,
    organizationInvitationsList,
    hasMoreThanOneAdmin,
    loadingOrganizationProjects,
    error,
    refreshProjects: loadProjects,
  };
}