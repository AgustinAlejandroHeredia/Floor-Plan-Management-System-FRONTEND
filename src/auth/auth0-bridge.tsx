import { useAuth0 } from "@auth0/auth0-react";
import type { AuthBridge } from "./auth-bridge";

export function useAuth0Bridge(): AuthBridge {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const getAccessToken = async () => {

    // Modo prueba: el backend con AUTH_TEST_MODE ignora el token, pero el
    // interceptor necesita algo para mandar el header.
    if (import.meta.env.DEV && import.meta.env.VITE_AUTH_TEST_MODE === "true") {
      return "auth-test-mode";
    }

    if (!isAuthenticated) return null;

    try {
      const res = await getAccessTokenSilently();
      
      if(import.meta.env.DEV){
        console.log("AUTH0-BRIDGE RESPONSE : ", res)
      }

      return res
    } catch (error) {
      console.error("Error getting token", error);
      return null;
    }
  };

  return {
    getAccessToken,
  };
}