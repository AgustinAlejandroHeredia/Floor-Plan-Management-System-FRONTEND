import { ProjectService } from "@/services/ProjectService";
import type { OrganizationActionPermissions, OrganizationRole, ProjectMembersList, ProjectType } from "@/types/types";
import { useCallback, useEffect, useState } from "react";

export function useProject(organizationId: string, projectId: string) {

    const [error, setError] = useState<Error | null>(null);
    const [project, setProject] = useState<ProjectType>();
    const [userOrganizationRole, setUserOrganizationRole] = useState<OrganizationRole>("member");
    const [organizationPermissions, setOrganizationPermissions] = useState<OrganizationActionPermissions>({
        createPermission: "admins",
        invitePermission: "admins",
    })
    const [projectMembersList, setProjectMembersList] = useState<ProjectMembersList[]>([])
    const [blueprints, setBlueprints] = useState<any[]>([]);
    const [loadingProject, setLoadingProject] = useState<boolean>(true);

    const loadProject = useCallback(async () => {
        try {

            setLoadingProject(true)
            setError(null)

            const data: ProjectType = await ProjectService.getProject(projectId)
            setProject(data)

            const blueprintsData = await ProjectService.getProjectBlueprints(projectId)
            setBlueprints(blueprintsData)

            const userRole = await ProjectService.getOrganizationMyRole(organizationId)
            setUserOrganizationRole(userRole)

            const permissionsData = await ProjectService.getOrganizationActionPermissions(organizationId)
            setOrganizationPermissions(permissionsData)

        } catch (err : any) {
            setError(err)
        } finally {
            setLoadingProject(false)
        }
    }, [projectId])

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