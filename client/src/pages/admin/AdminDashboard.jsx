import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Adjust path
import { adminService } from "../../services/api"; // Assume you have an adminAPI instance for summary data
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { user, loading: authLoading, token, hasRole } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    jobSeekers: 0,
    referralProviders: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalReferrals: 0,
    pendingReferrals: 0,
  });
  const [loading, setLoading] = useState(true); // Component-specific loading for dashboard data
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Wait for authentication state to be determined
    if (authLoading) {
      return;
    }

    // 2. Check if the user is an admin
    if (!user || !hasRole("admin")) {
      setError(
        "Access Denied: You must be an administrator to view this page."
      );
      toast.error("Access Denied: Insufficient permissions.");
      // Redirect to dashboard or home, as ProtectedRoute might not cover all specific access denials
      navigate("/dashboard", { replace: true });
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Set Authorization header for admin API requests
        adminService.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;

        // Assuming a single endpoint for all dashboard summary data
        const response = await adminService.get("/admin/dashboard-summary");

        setDashboardData(response.data); // Assuming backend sends data directly

        toast.success("Admin dashboard data loaded!");
      } catch (err) {
        console.error("Failed to fetch admin dashboard data:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to load dashboard data.";
        setError(errorMessage);
        toast.error(errorMessage);
        setDashboardData({
          // Reset to default on error
          totalUsers: 0,
          jobSeekers: 0,
          referralProviders: 0,
          totalJobs: 0,
          activeJobs: 0,
          totalApplications: 0,
          pendingApplications: 0,
          totalReferrals: 0,
          pendingReferrals: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, authLoading, token, hasRole, navigate]); // Dependencies

  // --- Conditional Rendering ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-6 bg-red-50 border border-red-200 rounded-lg mx-auto max-w-md mt-10">
        <h3 className="font-semibold text-lg mb-2">
          Error Loading Admin Dashboard
        </h3>
        <p>{error}</p>
        <p className="text-sm mt-2">
          Please ensure you have administrator privileges.
        </p>
      </div>
    );
  }

  // Double check user role again, although ProtectedRoute should prevent this
  if (!user || !hasRole("admin")) {
    return (
      <div className="text-center p-8 bg-red-100 border border-red-300 rounded-lg mx-auto max-w-lg mt-10">
        <h2 className="text-2xl font-bold text-red-800 mb-3">
          Unauthorized Access
        </h2>
        <p className="text-red-700">
          You do not have the necessary permissions to view this page.
        </p>
        <button
          onClick={() => navigate("/dashboard", { replace: true })}
          className="mt-5 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-8 md:p-10 lg:p-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center border-b pb-4">
          Admin Dashboard Overview
        </h1>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Users */}
          <div className="bg-blue-50 p-6 rounded-lg shadow-sm text-center border border-blue-200">
            <h3 className="text-2xl font-bold text-blue-800 mb-2">
              Total Users
            </h3>
            <p className="text-5xl font-extrabold text-blue-600">
              {dashboardData.totalUsers}
            </p>
            <p className="text-md text-gray-600 mt-2">
              Job Seekers: {dashboardData.jobSeekers}
            </p>
            <p className="text-md text-gray-600">
              Referral Providers: {dashboardData.referralProviders}
            </p>
          </div>

          {/* Jobs */}
          <div className="bg-green-50 p-6 rounded-lg shadow-sm text-center border border-green-200">
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Total Jobs
            </h3>
            <p className="text-5xl font-extrabold text-green-600">
              {dashboardData.totalJobs}
            </p>
            <p className="text-md text-gray-600 mt-2">
              Active Jobs: {dashboardData.activeJobs}
            </p>
          </div>

          {/* Applications */}
          <div className="bg-yellow-50 p-6 rounded-lg shadow-sm text-center border border-yellow-200">
            <h3 className="text-2xl font-bold text-yellow-800 mb-2">
              Total Applications
            </h3>
            <p className="text-5xl font-extrabold text-yellow-600">
              {dashboardData.totalApplications}
            </p>
            <p className="text-md text-gray-600 mt-2">
              Pending: {dashboardData.pendingApplications}
            </p>
          </div>

          {/* Referrals */}
          <div className="bg-purple-50 p-6 rounded-lg shadow-sm text-center border border-purple-200">
            <h3 className="text-2xl font-bold text-purple-800 mb-2">
              Total Referrals
            </h3>
            <p className="text-5xl font-extrabold text-purple-600">
              {dashboardData.totalReferrals}
            </p>
            <p className="text-md text-gray-600 mt-2">
              Pending: {dashboardData.pendingReferrals}
            </p>
          </div>
        </div>

        {/* Quick Actions / Navigation */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => navigate("/admin/users")}
              className="px-6 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-200 text-xl flex items-center justify-center space-x-3"
            >
              <span role="img" aria-label="users" className="text-3xl">
                👥
              </span>
              <span>Manage Users</span>
            </button>
            <button
              onClick={() => navigate("/admin/jobs")}
              className="px-6 py-4 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition duration-200 text-xl flex items-center justify-center space-x-3"
            >
              <span role="img" aria-label="briefcase" className="text-3xl">
                💼
              </span>
              <span>Manage Jobs</span>
            </button>
            <button
              // {/* Reusing the Applications component, which an admin can see all */}
              onClick={() => navigate("/applications")}
              className="px-6 py-4 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 transition duration-200 text-xl flex items-center justify-center space-x-3"
            >
              <span role="img" aria-label="clipboard" className="text-3xl">
                📋
              </span>
              <span>View All Applications</span>
            </button>
            <button
              // {/* Reusing the MyReferral component, which an admin can see all */}
              onClick={() => navigate("/my-referrals")}
              className="px-6 py-4 bg-pink-600 text-white font-semibold rounded-lg shadow-md hover:bg-pink-700 transition duration-200 text-xl flex items-center justify-center space-x-3"
            >
              <span role="img" aria-label="handshake" className="text-3xl">
                🤝
              </span>
              <span>View All Referrals</span>
            </button>
            <button
              // {/* Placeholder for reports page */}
              onClick={() => navigate("/admin/reports")}
              className="px-6 py-4 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-200 text-xl flex items-center justify-center space-x-3"
            >
              <span role="img" aria-label="report" className="text-3xl">
                📈
              </span>
              <span>Generate Reports</span>
            </button>
          </div>
        </div>

        {/* You can add more complex sections here, e.g., recent activity feeds, charts, etc. */}
      </div>
    </div>
  );
};

export default AdminDashboard;
