import { api } from "@/api/api";
import type { ModelItem } from "@/types/types";

export const ModelService = {
  getAll: async (): Promise<ModelItem[]> => {
    const response = await api.get("/api/admin/models");
    return response.data.models;
  },

  getById: async (id: string): Promise<ModelItem> => {
    const response = await api.get(`/api/admin/models/${id}`);
    return response.data.model;
  },

  create: async (model: ModelItem, configFile?: File | null): Promise<ModelItem> => {
    const payload = configFile ? new FormData() : model;
    if (configFile) {
      payload.append("model", JSON.stringify(model));
      payload.append("configFile", configFile);
    }
    const response = await api.post("/api/admin/models", payload);
    return response.data.model;
  },

  update: async (id: string, model: Partial<ModelItem>, configFile?: File | null): Promise<ModelItem> => {
    const payload = configFile ? new FormData() : model;
    if (configFile) {
      payload.append("model", JSON.stringify(model));
      payload.append("configFile", configFile);
    }
    const response = await api.put(`/api/admin/models/${id}`, payload);
    return response.data.model;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/admin/models/${id}`);
  },
};
