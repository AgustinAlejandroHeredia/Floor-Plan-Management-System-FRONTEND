import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App";
import AuthProvider from "./auth/AuthProvider";

import { api } from "./api/api";
import { setupAuthInterceptor, registerAuthBridge } from "./api/auth-interceptor";
import { useAuth0Bridge } from "./auth/auth0-bridge";
import { UserProvider } from "./context/UserContext";

function Bootstrap({ children }: { children: React.ReactNode }) {
  const authBridge = useAuth0Bridge();

  useEffect(() => {
    registerAuthBridge(authBridge);
    setupAuthInterceptor(api);
  }, [authBridge]);

  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <Bootstrap>
        <UserProvider>
          <App />
        </UserProvider>
      </Bootstrap>
    </AuthProvider>
  </StrictMode>
);