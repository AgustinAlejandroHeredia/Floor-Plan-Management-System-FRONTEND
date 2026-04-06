import { ProjectService } from "@/services/ProjectService";
import type { ProjectMembersList, ProjectRole, ProjectType } from "@/types/types";
import { useCallback, useEffect, useState } from "react";

export function useProject(projectId: string) {

    const [error, setError] = useState<Error | null>(null);
    const [project, setProject] = useState<ProjectType>();
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
        loadingProject,
        error,
        refreshProject: loadProject,
    }

}