import { api } from "@/api/api"
import type { UserProjectListItem } from "@/types/types"

export const MyProjectsService = {
    getUserProjects: async (): Promise<UserProjectListItem[]> => {
        const response = await api.get("/projects/userProjects", {
            params: {}
        })
        console.log("RETORNA DATA DE PROJECTS : ", response.data)
        return response.data
    },
}