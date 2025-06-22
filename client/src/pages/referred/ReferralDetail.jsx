import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useParams to get ID from URL, useNavigate for back button
import { useAuth } from "../../contexts/AuthContext"; // Adjust path
import { referralService } from "../../services/api"; // Reuse referralsAPI
import toast from "react-hot-toast";

const ReferralDetail = () => {
  const { id } = useParams(); // Get the referral ID from the URL
  const navigate = useNavigate();
  const { user, loading: authLoading, token } = useAuth(); // Auth context for user, loading, and token

  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true); // Component-specific loading for data fetch
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Wait for authentication state to be determined
    if (authLoading) {
      return;
    }

    // 2. If no user or token, or no ID provided, prevent API call
    if (!user || !token) {
      setLoading(false);
      setError("You must be logged in to view referral details.");
      toast.error("Please log in to view this referral.");
      return;
    }
    if (!id) {
      setLoading(false);
      setError("No referral ID provided.");
      toast.error("Invalid referral URL.");
      navigate("/my-referrals", { replace: true }); // Redirect to list if no ID
      return;
    }

    const fetchReferralDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        // Set Authorization header for the request
        referralService.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;

        // Fetch single referral by ID
        const response = await referralService.get(`/referrals/${id}`);
        setReferral(response.data.referral); // Assuming backend sends referral in response.data.referral
        toast.success("Referral details loaded!");
      } catch (err) {
        console.error("Failed to fetch referral details:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to load referral details.";
        setError(errorMessage);
        toast.error(errorMessage);
        setReferral(null); // Clear referral on error
        // Optionally redirect if specific error (e.g., 404 or 403)
        if (
          err.response &&
          (err.response.status === 404 || err.response.status === 403)
        ) {
          navigate("/my-referrals", { replace: true }); // Redirect if not found or unauthorized
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReferralDetails();
  }, [id, user, authLoading, token, navigate]); // Dependencies: ID, user, authLoading, token, navigate

  // Determine button text based on user role for back navigation
  const getBackButtonText = () => {
    if (!user) return "Go Back";
    if (user.role === "job_seeker") return "Back to My Received Referrals";
    if (user.role === "referral_provider")
      return "Back to My Provided Referrals";
    if (user.role === "admin") return "Back to All Referrals";
    return "Go Back";
  };

  const getBackPath = () => {
    if (!user) return "/my-referrals"; // Default fallback
    if (user.role === "job_seeker") return "/my-referrals";
    if (user.role === "referral_provider") return "/my-referrals";
    if (user.role === "admin") return "/my-referrals"; // Admins also view all referrals via /my-referrals
    return "/my-referrals";
  };

  // --- Conditional Rendering ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Loading referral details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-6 bg-red-50 border border-red-200 rounded-lg mx-auto max-w-md mt-10">
        <h3 className="font-semibold text-lg mb-2">Error Loading Referral</h3>
        <p>{error}</p>
        <p className="text-sm mt-2">
          Please ensure the referral ID is correct and you have permission to
          view it.
        </p>
        <button
          onClick={() => navigate(getBackPath())}
          className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
        >
          {getBackButtonText()}
        </button>
      </div>
    );
  }

  if (!referral) {
    // This case handles if referral is null after loading (e.g., 404 response handled in catch)
    return (
      <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg mx-auto max-w-lg mt-10">
        <p className="text-xl font-semibold text-yellow-800">
          Referral not found or you do not have access.
        </p>
        <p className="text-gray-600 mt-2">
          Please check the URL or your permissions.
        </p>
        <button
          onClick={() => navigate(getBackPath())}
          className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
        >
          {getBackButtonText()}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="bg-white shadow-lg rounded-xl p-8 md:p-10 lg:p-12 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Referral Details
          </h1>
          <button
            onClick={() => navigate(getBackPath())}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
          >
            {getBackButtonText()}
          </button>
        </div>

        <div className="space-y-6">
          {/* Job Information */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
              Job Information
            </h2>
            <p className="text-lg text-gray-700 mb-2">
              <span className="font-semibold">Job Title:</span>{" "}
              {referral.jobTitle || "N/A"}
            </p>
            <p className="text-lg text-gray-700 mb-2">
              <span className="font-semibold">Location:</span>{" "}
              {referral.jobLocation || "N/A"}
            </p>
            {referral.jobLink && (
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Job Link:</span>{" "}
                <a
                  href={referral.jobLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Posting
                </a>
              </p>
            )}
          </div>

          {/* Job Seeker Information (Visible to Referral Provider and Admin) */}
          {(user?.role === "referral_provider" || user?.role === "admin") && (
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b pb-2">
                Job Seeker Information
              </h2>
              <p className="text-lg text-gray-700 mb-2">
                <span className="font-semibold">Name:</span>{" "}
                {referral.jobSeekerName || "N/A"}
              </p>
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Email:</span>{" "}
                {referral.jobSeekerEmail || "N/A"}
              </p>
              {/* Optional: Resume link if you store it and provide a secure access endpoint */}
              {/* {referral.jobSeekerResumeUrl && (
                <p className="text-lg text-gray-700 mt-2">
                  <span className="font-semibold">Resume:</span>{" "}
                  <a 
                    href={referral.jobSeekerResumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline"
                  >
                    Download Resume
                  </a>
                </p>
              )} */}
            </div>
          )}

          {/* Referral Provider Information (Visible to Job Seeker and Admin) */}
          {(user?.role === "job_seeker" || user?.role === "admin") && (
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <h2 className="text-2xl font-bold text-green-800 mb-4 border-b pb-2">
                Referral Provider Information
              </h2>
              <p className="text-lg text-gray-700 mb-2">
                <span className="font-semibold">Name:</span>{" "}
                {referral.referralProviderName || "N/A"}
              </p>
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Email:</span>{" "}
                {referral.referralProviderEmail || "N/A"}
              </p>
            </div>
          )}

          {/* Referral Notes and Status */}
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h2 className="text-2xl font-bold text-yellow-800 mb-4 border-b pb-2">
              Referral Status & Notes
            </h2>
            <p className="text-lg text-gray-700 mb-2">
              <span className="font-semibold">Referred On:</span>{" "}
              {new Date(referral.createdAt).toLocaleDateString()}
            </p>
            <p
              className={`text-xl font-bold mb-4 ${
                referral.status === "Pending"
                  ? "text-yellow-700"
                  : referral.status === "Accepted"
                  ? "text-green-700"
                  : referral.status === "Declined"
                  ? "text-red-700"
                  : "text-gray-700"
              }`}
            >
              Status: {referral.status}
            </p>
            <p className="text-lg text-gray-700">
              <span className="font-semibold">Notes from Referrer:</span>{" "}
              {referral.referralNotes || "No notes provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDetail;
