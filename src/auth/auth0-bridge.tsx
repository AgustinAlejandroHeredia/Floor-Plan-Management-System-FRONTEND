import { useAuth0 } from "@auth0/auth0-react";
import type { AuthBridge } from "./auth-bridge";

export function useAuth0Bridge(): AuthBridge {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const getAccessToken = async () => {
    if (!isAuthenticated) return null;
    return await getAccessTokenSilently();
  };

  return {
    getAccessToken,
  };
}