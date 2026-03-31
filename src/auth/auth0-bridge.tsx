import { useAuth0 } from "@auth0/auth0-react";
import type { AuthBridge } from "./auth-bridge";

export function useAuth0Bridge(): AuthBridge {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const getAccessToken = async () => {
    if (!isAuthenticated) return null;

    try {
      return await getAccessTokenSilently();
    } catch (error) {
      console.error("Error getting token", error);
      return null;
    }
  };

  return {
    getAccessToken,
  };
}