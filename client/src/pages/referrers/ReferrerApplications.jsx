import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext"; // Adjust the path if your AuthContext is elsewhere
import { applicationService } from "../../services/api"; // Make sure this API instance exists and is configured
import toast from "react-hot-toast";

const Applications = () => {
  const { user, loading: authLoading, token } = useAuth(); // Destructure relevant state from your AuthContext
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true); // Component-specific loading state for data fetching
  const [error, setError] = useState(null); // Component-specific error state

  useEffect(() => {
    // This effect runs to fetch applications when the component mounts
    // or when the user, authLoading, or token state from AuthContext changes.

    // 1. Wait for authentication status to be determined
    if (authLoading) {
      return; // Still loading authentication data, hold off on fetching applications
    }

    // 2. If no user or token after authentication loads, they're not logged in
    if (!user || !token) {
      setLoading(false); // Stop loading, as we can't fetch without auth
      setError("You must be logged in to view applications.");
      toast.error("Please log in to view applications.");
      return;
    }

    const fetchApplications = async () => {
      setLoading(true); // Start loading for this component's data
      setError(null); // Clear any previous errors

      try {
        // Crucial: Set the Authorization header for this request.
        // If you have a global Axios interceptor, you might not need this line here.
        // However, if `authAPI` is the only one automatically getting the token,
        // it's safest to explicitly set it for `applicationsAPI` here.
        applicationService.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;

        let endpoint = "";
        // Determine the correct API endpoint based on the user's role
        if (user.role === "job_seeker") {
          endpoint = "/applications/my"; // e.g., GET /api/applications/my
        } else if (user.role === "referral_provider") {
          endpoint = "/applications/provided"; // e.g., GET /api/applications/provided
        } else if (user.role === "admin") {
          endpoint = "/applications"; // e.g., GET /api/applications (all applications)
        } else {
          // Handle roles that don't have access to this page or are unrecognized
          setError("Your user role does not have access to view applications.");
          setLoading(false);
          return;
        }

        const response = await applicationService.get(endpoint);
        // Assuming your API returns data in response.data.applications
        setApplications(response.data.applications || []);
        toast.success("Applications loaded successfully!");
      } catch (err) {
        console.error("Failed to fetch applications:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to load applications.";
        setError(errorMessage);
        toast.error(errorMessage);
        setApplications([]); // Clear any old applications on error
      } finally {
        setLoading(false); // End loading, whether successful or not
      }
    };

    fetchApplications();
  }, [user, authLoading, token]); // Dependencies: re-run if user, auth loading state, or token changes

  // --- Conditional Rendering ---

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-xl text-gray-700">
        <p>Loading your applications...</p>{" "}
        {/* You might want a spinner here */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-6 bg-red-50 border border-red-200 rounded-lg mx-auto max-w-md mt-10">
        <h3 className="font-semibold text-lg mb-2">
          Error Loading Applications
        </h3>
        <p>{error}</p>
        <p className="text-sm mt-2">
          Please refresh the page or contact support if the issue persists.
        </p>
      </div>
    );
  }

  // Function to render content based on applications array
  const renderApplicationsContent = () => {
    if (!applications || applications.length === 0) {
      const emptyMessage =
        user.role === "job_seeker"
          ? "You haven't submitted any job applications yet."
          : user.role === "referral_provider"
          ? "You haven't provided any referrals or managed any applications yet."
          : "No applications found for your role.";

      return (
        <p className="text-gray-600 text-center text-lg mt-12 p-4 bg-white rounded-lg shadow-sm">
          {emptyMessage}
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app) => (
          <div
            key={app._id}
            className="border border-gray-200 p-6 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-200"
          >
            <h3 className="text-xl font-bold text-blue-700 mb-2">
              {app.jobTitle || "Job Title N/A"}
            </h3>
            <p className="text-gray-700 mb-1">
              <span className="font-medium">Applicant:</span>{" "}
              {app.applicantName || "N/A"}
            </p>

            {/* Show seeker email to providers/admins */}
            {(user.role === "referral_provider" || user.role === "admin") && (
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Seeker Email:</span>{" "}
                {app.jobSeekerEmail || "N/A"}
              </p>
            )}

            {/* Show referrer name to job seekers/admins */}
            {(user.role === "job_seeker" || user.role === "admin") && (
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Referred By:</span>{" "}
                {app.referralProviderName || "N/A"}
              </p>
            )}

            <p
              className={`font-semibold mt-2 ${
                app.status === "Pending"
                  ? "text-yellow-600"
                  : app.status === "Approved"
                  ? "text-green-600"
                  : app.status === "Rejected"
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              Status: {app.status}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Applied On: {new Date(app.createdAt).toLocaleDateString()}
            </p>
            {/* Add more relevant application details here */}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
        Your Job Applications
      </h2>
      {renderApplicationsContent()}
    </div>
  );
};

export default Applications;
