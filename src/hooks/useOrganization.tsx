import type { OrganizationActionPermissions, OrganizationMembersList, OrganizationRole, ProjectOrganizationType } from "@/types/types";
import { useEffect, useState, useCallback } from "react";
import { OrganizationService } from "@/services/OrganizationService";

export function useOrganization(organizationId: string) {

  const [error, setError] = useState<Error | null>(null);
  const [organizationPermissions, setOrganizationPermissions] = useState<OrganizationActionPermissions>({
    createPermission: "admins",
    invitePermission: "admins",
  })
  const [projects, setProjects] = useState<ProjectOrganizationType[]>([]);
  const [projectThumbnails, setProjectThumbnails] = useState<Record<string, string>>({})
  const [userOrganizationRole, setUserOrganizationRole] = useState<OrganizationRole>("member")
  const [organizationMembersList, setOrganizationMembersList] = useState<OrganizationMembersList[]>([])
  const [hasMoreThanOneAdmin, setHasMoreThanOneAdmin] = useState<boolean>(false)
  const [loadingOrganizationProjects, setLoadingOrganizationProjects] = useState<boolean>(true);

  const loadProjects = useCallback(async () => {
    try {
      setLoadingOrganizationProjects(true);
      setError(null);

      const data: ProjectOrganizationType[] = await OrganizationService.getOrganizationProjects(organizationId);
      setProjects(data);

      const userRole = await OrganizationService.getOrganizationMyRole(organizationId)
      setUserOrganizationRole(userRole)

      // loading thumbnails

      const thumbnails: Record<string, string> = {}

      await Promise.all(
        data.map(async (project) => {
          const res = await OrganizationService.getProjectOldestBlueprintThumbnail(project._id)
          if (res) {
            thumbnails[project._id] = res.downloadUrl
          }
        })
      )

      setProjectThumbnails(thumbnails)

      const permissionsData = await OrganizationService.getOrganizationActionPermissions(organizationId)
      setOrganizationPermissions(permissionsData)

      const membersList = await OrganizationService.getOrganizationMembersAsAdmin(organizationId)
      setOrganizationMembersList(membersList)

      setHasMoreThanOneAdmin(membersList.filter(member => member.organizationRole === "admin").length > 1)

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
    hasMoreThanOneAdmin,
    loadingOrganizationProjects,
    error,
    refreshProjects: loadProjects,
  };
}