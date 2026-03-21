import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import AuthProvider from "./auth/AuthProvider.tsx";

import { useEffect } from "react";
import { api } from "./api/api";
import { setupAuthInterceptor, registerAuthBridge } from "./api/auth-interceptor";
import { useAuth0Bridge } from "./auth/auth0-bridge";

function Bootstrap() {
  const authBridge = useAuth0Bridge();

  useEffect(() => {
    registerAuthBridge(authBridge);
    setupAuthInterceptor(api);
  }, [authBridge]);

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <Bootstrap />
    </AuthProvider>
  </StrictMode>
);