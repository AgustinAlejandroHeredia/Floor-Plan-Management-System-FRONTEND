import { ProjectService } from "@/services/ProjectService";
import type { ProjectRole, ProjectType } from "@/types/types";
import { useCallback, useEffect, useState } from "react";

export function useProject(projectId: string) {

    const [error, setError] = useState<Error | null>(null);
    const [project, setProject] = useState<ProjectType>();
    const [userProjectRole, setUserProjectRole] = useState<ProjectRole>("viewer")
    const [loadingProject, setLoadingProject] = useState<boolean>(true);

    const loadProject = useCallback(async () => {
        try {

            setLoadingProject(true)
            setError(null)

            const data: ProjectType = await ProjectService.getProject(projectId)
            setProject(data)

            const userRole = await ProjectService.getProjectMyRole(projectId)
            setUserProjectRole(userRole)

            const blueprnts = await ProjectService.getProjectBlueprints(projectId)
            console.log("DATA DE BLUEPRINTS: ", blueprnts)

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
        userProjectRole,
        loadingProject,
        error,
        refreshProject: loadProject,
    }

}