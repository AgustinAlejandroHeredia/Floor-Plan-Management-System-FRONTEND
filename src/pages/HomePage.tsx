import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from "../context/UserContext";
import Loading from "../components/Loading";
import BreadcrumbBar from "@/components/BreadcrumbBar";

const HomePage = () => {

  const { logout } = useAuth0();
  const { user, isLoading } = useUser();

  if (isLoading) return <Loading/>;

  return (
    <div style={{ textAlign: "center" }}>

      <>
        <BreadcrumbBar items={[
          { label: "Home" },
        ]} />
      </>

      <div className="main-content">

      <h1>Bienvenido! 🎉</h1>

      {user && (
        <>
          <p>{user.name}</p>
          <p>{user.email}</p>
        </>
      )}

      <button
        onClick={() =>
          logout({
            logoutParams: {
              returnTo: window.location.origin,
            },
          })
        }
      >
        Cerrar sesión
      </button>
    </div>

    </div>
  );
};

export default HomePage;