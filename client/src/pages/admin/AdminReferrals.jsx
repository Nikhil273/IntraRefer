import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Adjust path
import MyReferral from "../MyReferral"; // Import your existing MyReferral component
import toast from "react-hot-toast";

const AdminReferrals = () => {
  const { user, loading: authLoading, hasRole } = useAuth();
  const navigate = useNavigate();

  // In-component check for admin role
  useEffect(() => {
    if (authLoading) {
      return; // Still loading authentication state
    }

    if (!user || !hasRole("admin")) {
      toast.error(
        "Access Denied: You must be an administrator to view this page."
      );
      navigate("/admin", { replace: true }); // Redirect non-admins to admin dashboard
    }
  }, [user, authLoading, hasRole, navigate]);

  // Show loading state while AuthContext is determining user status
  if (authLoading || (!user && !authLoading) || (user && !hasRole("admin"))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">
          {authLoading
            ? "Loading authentication..."
            : "Redirecting due to insufficient permissions..."}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-8 md:p-10 lg:p-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center border-b pb-4">
          All System Referrals (Admin View)
        </h1>

        {/* Potential Admin-Specific Actions for Referrals */}
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            Admin Actions
          </h2>
          <p className="text-gray-700 mb-4">
            From here, you can oversee all job referrals in the system. Future
            enhancements might include:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Filtering referrals by status, job seeker, or provider.</li>
            <li>Searching for specific referrals by keywords.</li>
            <li>
              Manually changing referral statuses (e.g., 'Pending', 'Accepted',
              'Declined').
            </li>
            <li>Viewing detailed audit logs for each referral.</li>
            <li>Deleting referrals.</li>
          </ul>
          {/* Example Admin Button (conceptual - would require backend integration) */}
          {/* <button className="mt-4 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">
            Export Referrals to CSV
          </button> */}
        </div>

        {/* The core list display is handled by MyReferral component */}
        {/* MyReferral will automatically fetch all referrals because the current user is an 'admin' */}
        <MyReferral />
      </div>
    </div>
  );
};

export default AdminReferrals;
