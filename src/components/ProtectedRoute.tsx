import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loading from "./Loading";

// Modo prueba: deja pasar sin Auth0 para poder correr E2E. Apagado por defecto y
// atado a DEV, asi un build de produccion no puede quedar con el bypass adentro.
const AUTH_TEST_MODE =
  import.meta.env.DEV && import.meta.env.VITE_AUTH_TEST_MODE === "true";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();

  if (AUTH_TEST_MODE) {
    return <Outlet />;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ returnTo: location.pathname }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;