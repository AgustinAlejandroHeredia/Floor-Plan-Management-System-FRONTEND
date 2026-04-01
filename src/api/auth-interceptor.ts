import type { AxiosInstance } from "axios";
import type { AuthBridge } from "../auth/auth-bridge";

let authBridge: AuthBridge | null = null;
let isInterceptorSet = false;

export function registerAuthBridge(bridge: AuthBridge) {
  authBridge = bridge;
}

export function setupAuthInterceptor(http: AxiosInstance) {
  if (isInterceptorSet) return;

  http.interceptors.request.use(async (config) => {
    if (!authBridge) return config;

    const token = await authBridge.getAccessToken();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  isInterceptorSet = true;
}