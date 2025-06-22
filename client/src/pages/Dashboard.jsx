import React from "react";
import { useNavigate } from "react-router-dom"; // For navigation after logout
import { useAuth } from "../contexts/AuthContext"; // Adjust path as per your project structure
import toast from "react-hot-toast";

const Dashboard = () => {
  const {
    user,
    loading: authLoading,
    logout,
    isSubscribed,
    getSubscriptionStatus,
  } = useAuth();
  const navigate = useNavigate();

  // Show loading state while AuthContext is determining user status
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Loading dashboard...</p>
      </div>
    );
  }

  // If for some reason user is null despite being behind a ProtectedRoute, redirect to login
  // This is a fallback; the ProtectedRoute should ideally handle this.
  if (!user) {
    toast.error("You are not authenticated. Please log in.");
    navigate("/auth", { replace: true });
    return null; // Or a simple redirect message
  }

  const handleLogout = async () => {
    await logout(); // This will clear token, user and redirect via useEffect in AuthPage if that's your flow
    navigate("/auth", { replace: true }); // Manually navigate to auth page after logout
  };

  const subscriptionStatus = getSubscriptionStatus();
  const showPremiumFeatures = isSubscribed(); // Boolean if user is subscribed or admin

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-8 md:p-10 lg:p-12">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Welcome, {user.name || user.email}!
          </h1>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200"
          >
            Logout
          </button>
        </div>

        {/* User Role Information */}
        <div className="mb-8 bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md">
          <p className="text-lg">
            You are logged in as a{" "}
            <span className="font-semibold capitalize">
              {user.role.replace("_", " ")}
            </span>
            .
          </p>
          {subscriptionStatus && (
            <p className="text-md mt-2">
              Subscription Status:{" "}
              <span
                className={`font-semibold ${
                  subscriptionStatus.isActive
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {subscriptionStatus.isActive ? "Active" : "Inactive"}
              </span>
              {subscriptionStatus.isActive &&
                subscriptionStatus.type !== "admin" &&
                ` (Type: ${subscriptionStatus.type}, Days Remaining: ${subscriptionStatus.daysRemaining})`}
              {subscriptionStatus.type === "admin" &&
                " (Admin - All features unlocked)"}
            </p>
          )}
        </div>

        {/* Role-specific Dashboard Content */}
        {user.role === "job_seeker" && (
          <div className="dashboard-section space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Job Seeker Dashboard
            </h2>
            <p className="text-gray-700 text-lg">
              Find your next career opportunity and manage your applications.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-100 p-6 rounded-lg shadow-sm flex flex-col items-center justify-center text-center">
                <span
                  role="img"
                  aria-label="magnifying glass"
                  className="text-5xl mb-3"
                >
                  🔍
                </span>
                <h3 className="text-xl font-semibold text-blue-800 mb-2">
                  Find Jobs
                </h3>
                <p className="text-gray-700 mb-4">
                  Explore thousands of job listings tailored for you.
                </p>
                <button
                  onClick={() => navigate("/jobs")}
                  className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  View Jobs
                </button>
              </div>
              <div className="bg-green-100 p-6 rounded-lg shadow-sm flex flex-col items-center justify-center text-center">
                <span
                  role="img"
                  aria-label="clipboard"
                  className="text-5xl mb-3"
                >
                  📋
                </span>
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  My Applications
                </h3>
                <p className="text-gray-700 mb-4">
                  Track the status of your submitted job applications.
                </p>
                <button
                  onClick={() => navigate("/applications")}
                  className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition duration-200"
                >
                  View Applications
                </button>
              </div>
            </div>

            {showPremiumFeatures && (
              <div className="mt-8 p-6 bg-purple-100 border-l-4 border-purple-500 rounded-md shadow-sm">
                <h3 className="text-2xl font-bold text-purple-800 mb-3">
                  Premium Features Unlocked!
                </h3>
                <p className="text-gray-700">
                  As a premium user, you have access to exclusive job alerts,
                  priority referrals, and advanced analytics.
                </p>
                {/* Add more premium specific features/links here */}
              </div>
            )}
          </div>
        )}

        {user.role === "referral_provider" && (
          <div className="dashboard-section space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Referral Provider Dashboard
            </h2>
            <p className="text-gray-700 text-lg">
              Manage your referrals and help job seekers find their dream jobs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-100 p-6 rounded-lg shadow-sm flex flex-col items-center justify-center text-center">
                <span
                  role="img"
                  aria-label="handshake"
                  className="text-5xl mb-3"
                >
                  🤝
                </span>
                <h3 className="text-xl font-semibold text-purple-800 mb-2">
                  Provide a Referral
                </h3>
                <p className="text-gray-700 mb-4">
                  Help a job seeker by referring them to a suitable position.
                </p>
                <button
                  onClick={() => navigate("/refer-job")} // Assuming a page for providing referrals
                  className="bg-purple-600 text-white px-5 py-2 rounded-md hover:bg-purple-700 transition duration-200"
                >
                  Refer Now
                </button>
              </div>
              <div className="bg-orange-100 p-6 rounded-lg shadow-sm flex flex-col items-center justify-center text-center">
                <span role="img" aria-label="chart" className="text-5xl mb-3">
                  📊
                </span>
                <h3 className="text-xl font-semibold text-orange-800 mb-2">
                  Managed Applications
                </h3>
                <p className="text-gray-700 mb-4">
                  Track the status of applications you have referred.
                </p>
                <button
                  onClick={() => navigate("/applications")}
                  className="bg-orange-600 text-white px-5 py-2 rounded-md hover:bg-orange-700 transition duration-200"
                >
                  View Referrals
                </button>
              </div>
            </div>

            {showPremiumFeatures && (
              <div className="mt-8 p-6 bg-purple-100 border-l-4 border-purple-500 rounded-md shadow-sm">
                <h3 className="text-2xl font-bold text-purple-800 mb-3">
                  Premium Features Unlocked!
                </h3>
                <p className="text-gray-700">
                  Access enhanced analytics, manage more referrals, and get
                  priority support as a premium provider.
                </p>
                {/* Add more premium specific features/links here */}
              </div>
            )}
          </div>
        )}

        {user.role === "admin" && (
          <div className="dashboard-section space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Admin Dashboard
            </h2>
            <p className="text-gray-700 text-lg">
              Manage all aspects of the referral system.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-red-100 p-6 rounded-lg shadow-sm flex flex-col items-center justify-center text-center">
                <span role="img" aria-label="users" className="text-5xl mb-3">
                  👥
                </span>
                <h3 className="text-xl font-semibold text-red-800 mb-2">
                  Manage Users
                </h3>
                <p className="text-gray-700 mb-4">
                  View, edit, or remove user accounts.
                </p>
                <button
                  onClick={() => navigate("/admin/users")} // Assuming an admin user management page
                  className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition duration-200"
                >
                  Go to Users
                </button>
              </div>
              <div className="bg-teal-100 p-6 rounded-lg shadow-sm flex flex-col items-center justify-center text-center">
                <span
                  role="img"
                  aria-label="briefcase"
                  className="text-5xl mb-3"
                >
                  💼
                </span>
                <h3 className="text-xl font-semibold text-teal-800 mb-2">
                  Manage Jobs
                </h3>
                <p className="text-gray-700 mb-4">
                  Add, edit, or remove job listings.
                </p>
                <button
                  onClick={() => navigate("/admin/jobs")} // Assuming an admin job management page
                  className="bg-teal-600 text-white px-5 py-2 rounded-md hover:bg-teal-700 transition duration-200"
                >
                  Go to Jobs
                </button>
              </div>
              <div className="bg-yellow-100 p-6 rounded-lg shadow-sm flex flex-col items-center justify-center text-center">
                <span
                  role="img"
                  aria-label="document"
                  className="text-5xl mb-3"
                >
                  📄
                </span>
                <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                  All Applications
                </h3>
                <p className="text-gray-700 mb-4">
                  Oversee all job applications in the system.
                </p>
                <button
                  onClick={() => navigate("/applications")} // Admin also uses the /applications page, but sees all
                  className="bg-yellow-600 text-white px-5 py-2 rounded-md hover:bg-yellow-700 transition duration-200"
                >
                  View All Apps
                </button>
              </div>
            </div>
            {/* Admin has all features by default, no special premium section needed */}
          </div>
        )}

        {/* If user role is not recognized or defined */}
        {!["job_seeker", "referral_provider", "admin"].includes(user.role) && (
          <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xl font-semibold text-yellow-800">
              Your role ({user.role}) is not recognized for a specific dashboard
              view.
            </p>
            <p className="text-gray-600 mt-2">
              Please contact support if you believe this is an error.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
