import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";

// PAGES
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";

export function AppRouter() {
  return (
    <Routes>

      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas privadas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}