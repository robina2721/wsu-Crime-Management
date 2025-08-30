import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UserRole } from "@shared/types";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
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
import HRManagement from "./pages/HRManagement";
import StaffScheduling from "./pages/StaffScheduling";
import HRReports from "./pages/HRReports";
import CitizenPortal from "./pages/CitizenPortal";
import CitizenFeedback from "./pages/CitizenFeedback";
import SafetyInformation from "./pages/SafetyInformation";
import NotFound from "./pages/NotFound";

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Index />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/case-management"
        element={
          <ProtectedRoute>
            <CaseManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff-management"
        element={
          <ProtectedRoute
            requiredRoles={[UserRole.SUPER_ADMIN, UserRole.POLICE_HEAD, UserRole.HR_MANAGER]}
          >
            <StaffManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute
            requiredRoles={[
              UserRole.SUPER_ADMIN,
              UserRole.POLICE_HEAD,
              UserRole.DETECTIVE_OFFICER,
              UserRole.HR_MANAGER,
            ]}
          >
            <ReportGeneration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/asset-management"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN, UserRole.POLICE_HEAD]}>
            <AssetManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-management"
        element={
          <ProtectedRoute
            requiredRoles={[UserRole.SUPER_ADMIN, UserRole.POLICE_HEAD, UserRole.HR_MANAGER]}
          >
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-config"
        element={
          <ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN]}>
            <SystemConfiguration />
          </ProtectedRoute>
        }
      />
      <Route
        path="/incident-reports"
        element={
          <ProtectedRoute
            requiredRoles={[
              UserRole.PREVENTIVE_OFFICER,
              UserRole.DETECTIVE_OFFICER,
              UserRole.POLICE_HEAD,
              UserRole.SUPER_ADMIN,
            ]}
          >
            <IncidentReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patrol-logs"
        element={
          <ProtectedRoute
            requiredRoles={[UserRole.PREVENTIVE_OFFICER, UserRole.POLICE_HEAD, UserRole.SUPER_ADMIN]}
          >
            <PatrolLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/criminal-database"
        element={
          <ProtectedRoute
            requiredRoles={[UserRole.DETECTIVE_OFFICER, UserRole.POLICE_HEAD, UserRole.SUPER_ADMIN]}
          >
            <CriminalDatabase />
          </ProtectedRoute>
        }
      />
      <Route
        path="/investigation-reports"
        element={
          <ProtectedRoute
            requiredRoles={[UserRole.DETECTIVE_OFFICER, UserRole.POLICE_HEAD, UserRole.SUPER_ADMIN]}
          >
            <InvestigationReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-cases"
        element={
          <ProtectedRoute
            requiredRoles={[
              UserRole.PREVENTIVE_OFFICER,
              UserRole.DETECTIVE_OFFICER,
              UserRole.POLICE_HEAD,
              UserRole.SUPER_ADMIN,
            ]}
          >
            <MyCases />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr-management"
        element={
          <ProtectedRoute requiredRoles={[UserRole.HR_MANAGER, UserRole.SUPER_ADMIN]}>
            <HRManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff-scheduling"
        element={
          <ProtectedRoute requiredRoles={[UserRole.HR_MANAGER, UserRole.SUPER_ADMIN]}>
            <StaffScheduling />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr-reports"
        element={
          <ProtectedRoute requiredRoles={[UserRole.HR_MANAGER, UserRole.SUPER_ADMIN]}>
            <HRReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen-portal"
        element={
          <ProtectedRoute requiredRoles={[UserRole.CITIZEN]}>
            <CitizenPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen-feedback"
        element={
          <ProtectedRoute requiredRoles={[UserRole.CITIZEN]}>
            <CitizenFeedback />
          </ProtectedRoute>
        }
      />
      <Route
        path="/safety-information"
        element={
          <ProtectedRoute>
            <SafetyInformation />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
