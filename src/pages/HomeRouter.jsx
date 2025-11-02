import React, { useState, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getUserFromToken } from "../utils/auth";
import Header from "../components/Header";


const AdminDashboard = lazy(() => import("./dashboards/AdminDashboard.jsx"));
const ManagerDashboard = lazy(() => import("./dashboards/ManagerDashboard.jsx"));
const TeamLeadDashboard = lazy(() => import("./dashboards/TeamLeadDashboard.jsx"));
const SalesRepDashboard = lazy(() => import("./dashboards/SalesRepDashboard.jsx"));
const LeadDetailPage = lazy(() => import("./LeadDetailPage.jsx"));
const RegisterUser = lazy(() => import("../components/RegisterUser.jsx"));
const ChangePassword = lazy(() => import("./ChangePassword.jsx"));
const ForgotPassword = lazy(() => import("./ForgotPassword.jsx"));
const ManageUsers = lazy(() => import("../components/ManageUsers.jsx"));
const ActivityLogs = lazy(() => import("../components/ActivityLogs.jsx"));

export default function HomeRouter() {
  const user = getUserFromToken();
  const role = user?.roleName;

  const base =
    role === "Admin"
      ? "/admin"
      : role === "Sales Manager"
      ? "/manager"
      : role === "Sales Team Lead"
      ? "/teamlead"
      : "/rep";

  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
      {/* Sidebar */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <main
        className={`flex-1 transition-all duration-300 p-6 ${
          sidebarOpen ? "ml-60" : "ml-0 md:ml-20"
        }`}
      >
        <div className="max-w-10xl mx-auto text-gray-900 dark:text-gray-100">
         
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-[60vh] text-lg font-medium">
                Loading...
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Navigate to={base} replace />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/teamlead" element={<TeamLeadDashboard />} />
              <Route path="/rep" element={<SalesRepDashboard />} />
              <Route path="/leads/:id/edit" element={<LeadDetailPage />} />
              <Route path="/registerUser" element={<RegisterUser />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/manageUsers" element={<ManageUsers />} />
              <Route path="/activityLogs" element={<ActivityLogs />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
