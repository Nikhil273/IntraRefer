import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext"; // Adjust path as per your project structure
import { referralService } from "../services/api"; // Make sure this API instance exists and is configured
import toast from "react-hot-toast";

const MyReferral = () => {
  const { user, loading: authLoading, token } = useAuth(); // Get user, auth loading, and token from AuthContext
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true); // Component-specific loading state for data fetching
  const [error, setError] = useState(null); // Component-specific error state

  useEffect(() => {
    // This effect fetches referrals once the authentication state is determined.

    // 1. Wait for authentication status to be determined
    if (authLoading) {
      return; // Still loading authentication data, wait
    }

    // 2. If no user or token, they're not logged in, so prevent API call
    if (!user || !token) {
      setLoading(false);
      setError("You must be logged in to view your referrals.");
      toast.error("Please log in to view your referrals.");
      return;
    }

    const fetchReferrals = async () => {
      setLoading(true);
      setError(null); // Clear any previous errors

      try {
        // Set the Authorization header for this request.
        // If you have a global Axios interceptor, this might not be needed here.
        referralService.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;

        let endpoint = "";
        // Determine the correct API endpoint based on the user's role
        if (user.role === "job_seeker") {
          // For job seekers: fetch referrals *received* by them
          endpoint = "/referrals/my-received";
        } else if (user.role === "referral_provider") {
          // For referral providers: fetch referrals *they provided*
          endpoint = "/referrals/my-provided";
        } else if (user.role === "admin") {
          // Admin might see all referrals
          endpoint = "/referrals";
        } else {
          setError("Your user role does not have a defined referral view.");
          setLoading(false);
          return;
        }

        const response = await referralService.get(endpoint);
        // Assuming your API returns data in response.data.referrals
        setReferrals(response.data.referrals || []);
        toast.success("Referrals loaded successfully!");
      } catch (err) {
        console.error("Failed to fetch referrals:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to load referrals.";
        setError(errorMessage);
        toast.error(errorMessage);
        setReferrals([]); // Clear any old referrals on error
      } finally {
        setLoading(false); // End loading, whether successful or not
      }
    };

    fetchReferrals();
  }, [user, authLoading, token]); // Dependencies: re-run effect if user, authLoading, or token changes

  // --- Conditional Rendering ---

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-xl text-gray-700">
        <p>Loading your referrals...</p>{" "}
        {/* You can replace this with a spinner component */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-6 bg-red-50 border border-red-200 rounded-lg mx-auto max-w-md mt-10">
        <h3 className="font-semibold text-lg mb-2">Error Loading Referrals</h3>
        <p>{error}</p>
        <p className="text-sm mt-2">
          Please refresh the page or contact support if the issue persists.
        </p>
      </div>
    );
  }

  // Function to render content based on referrals array
  const renderReferralsContent = () => {
    if (!referrals || referrals.length === 0) {
      const emptyMessage =
        user.role === "job_seeker"
          ? "You haven't received any referrals yet."
          : user.role === "referral_provider"
          ? "You haven't provided any referrals yet."
          : "No referrals found for your role.";

      return (
        <p className="text-gray-600 text-center text-lg mt-12 p-4 bg-white rounded-lg shadow-sm">
          {emptyMessage}
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {referrals.map((referral) => (
          <div
            key={referral._id}
            className="border border-gray-200 p-6 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-200"
          >
            <h3 className="text-xl font-bold text-blue-700 mb-2">
              Job: {referral.jobTitle || "N/A"}
            </h3>

            {
              user.role === "job_seeker" ? (
                <>
                  <p className="text-gray-700 mb-1">
                    <span className="font-medium">Referred By:</span>{" "}
                    {referral.referralProviderName || "N/A"}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <span className="font-medium">Provider Email:</span>{" "}
                    {referral.referralProviderEmail || "N/A"}
                  </p>
                </>
              ) : user.role === "referral_provider" ? (
                <>
                  <p className="text-gray-700 mb-1">
                    <span className="font-medium">Referred For:</span>{" "}
                    {referral.jobSeekerName || "N/A"}
                  </p>
                  <p className="text-gray-700 mb-1">
                    <span className="font-medium">Seeker Email:</span>{" "}
                    {referral.jobSeekerEmail || "N/A"}
                  </p>
                </>
              ) : null /* Admin might see both */
            }

            <p
              className={`font-semibold mt-2 ${
                referral.status === "Pending"
                  ? "text-yellow-600"
                  : referral.status === "Accepted"
                  ? "text-green-600"
                  : referral.status === "Declined"
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              Status: {referral.status}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Referred On: {new Date(referral.createdAt).toLocaleDateString()}
            </p>
            {/* Add more relevant referral details here */}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
        {user?.role === "job_seeker"
          ? "My Received Referrals"
          : user?.role === "referral_provider"
          ? "My Provided Referrals"
          : "All Referrals"}
      </h2>
      {renderReferralsContent()}
    </div>
  );
};

export default MyReferral;
