import type { UserProjectListItem } from "@/types/types";
import { useCallback, useEffect, useState } from "react";
import { MyProjectsService } from "@/services/MyProjectsService";

export function useMyProjectPage() {

    const [error, setError] = useState<Error | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [userProjectsList, setUserProjectsList] = useState<UserProjectListItem[]>([])

    const loadMyProjectsData = useCallback(async () => {
        try {
            const userProjects = await MyProjectsService.getUserProjects()
            setUserProjectsList(userProjects)
        } catch (error: any) {
            setError(error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadMyProjectsData()
    }, [loadMyProjectsData])

    return {
        userProjectsList,
        loading,
        error,
    }
}