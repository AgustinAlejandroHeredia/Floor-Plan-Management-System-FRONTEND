import React from "react";
import { useLocation } from "react-router-dom";
import { ErrorDisplay } from "@/components/ErrorDisplay";

const ErrorPage: React.FC = () => {
  const location = useLocation();

  // Extraemos el error que se pasó desde navigate("/error", { state: { message: ... } })
  const state = location.state as { message?: string } | null;
  const message = state?.message ?? "Ocurrió un error inesperado.";

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <ErrorDisplay message={message} />
    </div>
  );
};

export default ErrorPage;