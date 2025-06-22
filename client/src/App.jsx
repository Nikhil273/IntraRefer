import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../client/src/contexts/AuthContext";

// Layout Components
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Page Components
import LandingPage from "./pages/LandingPage";
import AuthPage from "../../client/src/pages/AuthPage";
import Dashboard from "../../client/src/pages/Dashboard";
import Profile from "../../client/src/pages/Profile";
import ReferralsList from "../../client/src/pages/ReferralsList";
import ReferralDetail from "../../client/src/pages/ReferralDetail";
import MyReferrals from "../../client/src/pages/MyReferrals";
import CreateReferral from "../../client/src/pages/CreateReferral";
import Applications from "../../client/src/pages/Applications";
import ReferrerApplications from "../../client/src/pages/ReferrerApplications";
import Subscription from "../../client/src/pages/Subscription";
import AdminDashboard from "../../client/src/pages/admin/AdminDashboard";
import AdminUsers from "../../client/src/pages/admin/AdminUsers";
import AdminReferrals from "../../client/src/pages/admin/AdminReferrals";
import AdminPayments from "../../client/src/pages/admin/AdminPayments";

// Protected Route Component
import ProtectedRoute from "../../client/src/components/auth/ProtectedRoute";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/auth"
          element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
        />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    {/* Common Routes */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/subscription" element={<Subscription />} />

                    {/* Job Seeker Routes */}
                    <Route
                      path="/referrals"
                      element={
                        <ProtectedRoute allowedRoles={["jobSeeker"]}>
                          <ReferralsList />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/referrals/:id"
                      element={
                        <ProtectedRoute allowedRoles={["jobSeeker"]}>
                          <ReferralDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/applications"
                      element={
                        <ProtectedRoute allowedRoles={["jobSeeker"]}>
                          <Applications />
                        </ProtectedRoute>
                      }
                    />

                    {/* Referrer Routes */}
                    <Route
                      path="/my-referrals"
                      element={
                        <ProtectedRoute allowedRoles={["referrer"]}>
                          <MyReferrals />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/create-referral"
                      element={
                        <ProtectedRoute allowedRoles={["referrer"]}>
                          <CreateReferral />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/referrer-applications"
                      element={
                        <ProtectedRoute allowedRoles={["referrer"]}>
                          <ReferrerApplications />
                        </ProtectedRoute>
                      }
                    />

                    {/* Admin Routes */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AdminUsers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/referrals"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AdminReferrals />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/payments"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AdminPayments />
                        </ProtectedRoute>
                      }
                    />

                    {/* Catch all route */}
                    <Route
                      path="*"
                      element={<Navigate to="/dashboard" replace />}
                    />
                  </Routes>
                </main>
                <Footer />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
