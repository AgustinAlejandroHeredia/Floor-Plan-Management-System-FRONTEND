import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";

const LoginPage = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <div>Cargando...</div>;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}>
      <button onClick={() => loginWithRedirect()}>
        Iniciar sesión
      </button>
    </div>
  );
};

export default LoginPage;