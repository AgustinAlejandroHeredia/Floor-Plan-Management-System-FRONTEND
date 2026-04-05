import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../layout/AppLayout";

// PAGES
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import DevOptions from "../pages/DevOptions";
import OrganizationPage from "@/pages/OrganizationPage";
import ErrorPage from "@/pages/ErrorPage";
import MyProjectsPage from "@/pages/MyProjectsPage";
import ProjectPage from "@/pages/ProjectPage";
import BlueprintView from "@/pages/BlueprintView";

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

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/MyProjects" element={<MyProjectsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/Project/:organizationName/:organizationId/:projectName/:projectId" element={<ProjectPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/BlueprintView/:organizationName/:organizationId/:projectName/:projectId/:blueprintName/:blueprintId" element={<BlueprintView />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}