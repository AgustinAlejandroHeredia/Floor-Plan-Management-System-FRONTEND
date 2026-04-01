import { api } from "../api/api";

export const HomeService = {

  getMyOrganizations: async () => {
    const response = await api.get("/organizations/me/organizations")
    return response.data
  }

};