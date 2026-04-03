import { api } from "../api/api";

export const ProjectService = {

    getProject: async (projectId: string) => {
        const response = await api.get(`/projects/${projectId}`)
        return response.data
    },

    getProjectMyRole: async (projectId: string) => {
        const response = await api.get(`/projects/me/role/${projectId}`)
        return response.data
    },

    getProjectBlueprints: async (projectId: string) => {
        const response = await api.get(`/blueprints/project/${projectId}`)
        return response.data
    },
}