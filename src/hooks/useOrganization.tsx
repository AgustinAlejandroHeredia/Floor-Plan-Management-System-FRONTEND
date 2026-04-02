import type { OrganizationRole, ProjectOrganizationType } from "@/types/types";
import { useEffect, useState, useCallback } from "react";
import { OrganizationService } from "@/services/OrganizationService";

export function useOrganization(organizationId: string) {

  const [error, setError] = useState<Error | null>(null);
  const [projects, setProjects] = useState<ProjectOrganizationType[]>([]);
  const [userOrganizationRole, setUserOrganizationRole] = useState<OrganizationRole>("member")
  const [loadingOrganizationProjects, setLoadingOrganizationProjects] = useState<boolean>(true);

  const loadProjects = useCallback(async () => {
    try {
      setLoadingOrganizationProjects(true);
      setError(null);

      const data: ProjectOrganizationType[] =
        await OrganizationService.getOrganizationProjects(organizationId);

      //setProjects(data);
      setProjects([]);

      const userRole = await OrganizationService.getOrganizationMyRole(organizationId)
      setUserOrganizationRole(userRole)

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
    userOrganizationRole,
    loadingOrganizationProjects,
    error,
    refreshProjects: loadProjects,
  };
}