import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ returnTo: location.pathname }}
      />
    )
  }

  return <Outlet />;
};

export default ProtectedRoute;