import { ProjectService } from "@/services/ProjectService";
import type { OrganizationActionPermissions, OrganizationRole, ProjectType } from "@/types/types";
import { useCallback, useEffect, useState } from "react";

export function useProject(organizationId: string, projectId: string) {

    const [error, setError] = useState<Error | null>(null);
    const [project, setProject] = useState<ProjectType>();
    const [userOrganizationRole, setUserOrganizationRole] = useState<OrganizationRole>("member");
    const [organizationPermissions, setOrganizationPermissions] = useState<OrganizationActionPermissions>({
        createPermission: "admins",
        invitePermission: "admins",
    })
    const [blueprints, setBlueprints] = useState<any[]>([]);
    const [loadingProject, setLoadingProject] = useState<boolean>(true);

    const loadProject = useCallback(async () => {
        try {

            setLoadingProject(true)
            setError(null)

            const [
                projectData,
                blueprintsData,
                userRole,
                permissionsData,
            ] = await Promise.all([
                ProjectService.getProject(projectId),
                ProjectService.getProjectBlueprints(projectId),
                ProjectService.getOrganizationMyRole(organizationId),
                ProjectService.getOrganizationActionPermissions(organizationId),
            ])

            setProject(projectData)
            setBlueprints(blueprintsData)
            setUserOrganizationRole(userRole)
            setOrganizationPermissions(permissionsData)

        } catch (err: any) {
            setError(err)
        } finally {
            setLoadingProject(false)
        }
    }, [projectId, organizationId])

    useEffect(() => {
        if(projectId){
            loadProject()
        }
    }, [loadProject, projectId])

    return {
        project,
        blueprints,
        userOrganizationRole,
        organizationPermissions,
        loadingProject,
        error,
        refreshProject: loadProject,
    }

}