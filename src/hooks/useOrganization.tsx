import type { OrganizationMembersList, OrganizationRole, ProjectOrganizationType } from "@/types/types";
import { useEffect, useState, useCallback } from "react";
import { OrganizationService } from "@/services/OrganizationService";

export function useOrganization(organizationId: string) {

  const [error, setError] = useState<Error | null>(null);
  const [projects, setProjects] = useState<ProjectOrganizationType[]>([]);
  const [projectThumbnails, setProjectThumbnails] = useState<Record<string, string>>({})
  const [userOrganizationRole, setUserOrganizationRole] = useState<OrganizationRole>("member")
  const [organizationMembersList, setOrganizationMembersList] = useState<OrganizationMembersList[]>([])
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
          try {
            const res = await OrganizationService.getProjectOldestBlueprint(project._id)
            thumbnails[project._id] = res.downloadUrl
          } catch {
            // nothing
          }
        })
      )

      setProjectThumbnails(thumbnails)

      if(userRole && userRole === "admin"){
        const membersList = await OrganizationService.getOrganizationMembersAsAdmin(organizationId)
        setOrganizationMembersList(membersList)
      }

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
    projects,
    projectThumbnails,
    userOrganizationRole,
    organizationMembersList,
    loadingOrganizationProjects,
    error,
    refreshProjects: loadProjects,
  };
}