import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UserRole } from "@shared/types";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CaseManagement from "./pages/CaseManagement";
import StaffManagement from "./pages/StaffManagement";
import ReportGeneration from "./pages/ReportGeneration";
import AssetManagement from "./pages/AssetManagement";
import UserManagement from "./pages/UserManagement";
import SystemConfiguration from "./pages/SystemConfiguration";
import IncidentReports from "./pages/IncidentReports";
import PatrolLogs from "./pages/PatrolLogs";
import CriminalDatabase from "./pages/CriminalDatabase";
import InvestigationReports from "./pages/InvestigationReports";
import MyCases from "./pages/MyCases";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Index />
        }
      />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Case Management - All authenticated users */}
      <Route
        path="/case-management"
        element={
          <ProtectedRoute>
            <CaseManagement />
          </ProtectedRoute>
        }
      />

      {/* Staff Management - Police Head, Super Admin */}
      <Route
        path="/staff-management"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.POLICE_HEAD, UserRole.HR_MANAGER]}>
            <StaffManagement />
          </ProtectedRoute>
        }
      />

      {/* Report Generation - Officers and above */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.POLICE_HEAD, UserRole.DETECTIVE_OFFICER, UserRole.HR_MANAGER]}>
            <ReportGeneration />
          </ProtectedRoute>
        }
      />

      {/* Asset Management - Police Head, Super Admin */}
      <Route
        path="/asset-management"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.POLICE_HEAD]}>
            <AssetManagement />
          </ProtectedRoute>
        }
      />

      {/* User Management - Super Admin, Police Head (for approvals) */}
      <Route
        path="/user-management"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.POLICE_HEAD, UserRole.HR_MANAGER]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      {/* System Configuration - Super Admin only */}
      <Route
        path="/system-config"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN]}>
            <SystemConfiguration />
          </ProtectedRoute>
        }
      />

      {/* Officer-Specific Routes */}

      {/* Incident Reports - Preventive Officers and above */}
      <Route
        path="/incident-reports"
        element={
          <ProtectedRoute requiredRoles={[UserRole.PREVENTIVE_OFFICER, UserRole.DETECTIVE_OFFICER, UserRole.POLICE_HEAD, UserRole.SUPER_ADMIN]}>
            <IncidentReports />
          </ProtectedRoute>
        }
      />

      {/* Patrol Logs - Preventive Officers and above */}
      <Route
        path="/patrol-logs"
        element={
          <ProtectedRoute requiredRoles={[UserRole.PREVENTIVE_OFFICER, UserRole.POLICE_HEAD, UserRole.SUPER_ADMIN]}>
            <PatrolLogs />
          </ProtectedRoute>
        }
      />

      {/* Criminal Database - Detectives and above */}
      <Route
        path="/criminal-database"
        element={
          <ProtectedRoute requiredRoles={[UserRole.DETECTIVE_OFFICER, UserRole.POLICE_HEAD, UserRole.SUPER_ADMIN]}>
            <CriminalDatabase />
          </ProtectedRoute>
        }
      />

      {/* Investigation Reports - Detectives and above */}
      <Route
        path="/investigation-reports"
        element={
          <ProtectedRoute requiredRoles={[UserRole.DETECTIVE_OFFICER, UserRole.POLICE_HEAD, UserRole.SUPER_ADMIN]}>
            <InvestigationReports />
          </ProtectedRoute>
        }
      />

      {/* My Cases - Officers and above */}
      <Route
        path="/my-cases"
        element={
          <ProtectedRoute requiredRoles={[UserRole.PREVENTIVE_OFFICER, UserRole.DETECTIVE_OFFICER, UserRole.POLICE_HEAD, UserRole.SUPER_ADMIN]}>
            <MyCases />
          </ProtectedRoute>
        }
      />

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
