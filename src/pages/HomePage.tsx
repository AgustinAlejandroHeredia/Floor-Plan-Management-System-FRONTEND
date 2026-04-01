import { useAuth0 } from "@auth0/auth0-react";
import { useUser } from "../context/UserContext";

const HomePage = () => {

  const { logout } = useAuth0();
  const { user, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;

  /*
  const { user, logout, getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    const run = async () => {
      if (!isAuthenticated) return;

      try {
        // 🔐 Obtener token
        const token = await getAccessTokenSilently();

        if (import.meta.env.DEV) {
          console.log("🔐 Token desde Home:", token);
        }

        // 🌐 Llamar backend
        const data = await HomeService.testBackend();

        console.log("📩 Respuesta backend:", data);

        const userInfo = await HomeService.testUserInfo();

        console.log("User info:", userInfo)

      } catch (error) {
        console.error("❌ Error en Home:", error);
      }
    };

    run();
  }, [isAuthenticated, getAccessTokenSilently]);
  */

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
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
  );
};

export default HomePage;