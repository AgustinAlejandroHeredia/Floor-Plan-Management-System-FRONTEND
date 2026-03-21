import { api } from "../api/api";

export const HomeService = {
  testBackend: async () => {
    const response = await api.get("/test");
    return response.data;
  },
};