import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, useLocation } from "react-router-dom";
import Loading from "../components/Loading";

const LoginPage = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: {
          returnTo: location.state?.returnTo || "/",
        },
      });
    }
  }, [isLoading, isAuthenticated, loginWithRedirect, location]);

  if (isLoading) return <Loading />;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Loading />;
};

export default LoginPage;