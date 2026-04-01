import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../layout/AppLayout";

// PAGES
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import DevOptions from "../pages/DevOptions";
import OrganizationPage from "@/pages/OrganizationPage";
import ErrorPage from "@/pages/ErrorPage";

export function AppRouter() {
  return (
    <Routes>

      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas privadas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/DevOptions" element={<DevOptions />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/OrganizationPage/:name/:id" element={<OrganizationPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/ErrorPage/:message" element={<ErrorPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}