import { api } from "../api/api";

export const UserContextService = {

    getUserInfo: async () => {
        const response = await api.get("/user/userInfo")
        return response.data
    }

}