import { Link, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Sidebar = () => {
  const { user, isLoading } = useUser();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  if (isLoading) return null;

  return (
    <div className="sidebar">
      
      {/* TOP */}
      <div>
        {/* Organización */}
        <div
          style={{
            padding: "20px 16px",
            fontWeight: 500,
            color: "var(--text-h)",
            textAlign: "left",
          }}
        >
          Acme Inc.
        </div>

        {/* Línea */}
        <div
          style={{
            height: "1px",
            backgroundColor: "var(--border)",
            marginBottom: "8px",
          }}
        />

        {/* Navegación */}
        <div style={{ padding: "8px" }}>
          
          {/* HOME */}
          <Link
            to="/"
            className={`sidebar-link ${isActive("/") ? "active" : ""}`}
          >
            Home
          </Link>

          {/* SOLO SUPER ADMIN */}
          {user?.globalRole === "super_admin" && (
            <Link
              to="/devOptions"
              className={`sidebar-link ${isActive("/devOptions") ? "active" : ""}`}
            >
              Dev. Options
            </Link>
          )}

        </div>
      </div>

      {/* USER */}
      <div
        style={{
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {user && (
          <>
            <img
              src={user.picture}
              alt="user"
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />

            <div style={{ overflow: "hidden", textAlign: "left" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--text-h)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.name}
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.email}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;