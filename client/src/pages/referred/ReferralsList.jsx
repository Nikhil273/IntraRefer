import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext"; // Adjust path
import { applicationService, jobService } from "../../services/api"; // Need both for applications and (conceptual) viewed jobs
import toast from "react-hot-toast";

const JobSeekerJobActivity = () => {
  const { user, loading: authLoading, token, hasRole } = useAuth();

  const [appliedJobs, setAppliedJobs] = useState([]);
  const [viewedJobs, setViewedJobs] = useState([]); // This will be conceptual without backend tracking
  const [loadingApplied, setLoadingApplied] = useState(true);
  const [loadingViewed, setLoadingViewed] = useState(true); // Separate loading for viewed jobs
  const [errorApplied, setErrorApplied] = useState(null);
  const [errorViewed, setErrorViewed] = useState(null);

  // Effect to fetch 'Applied Jobs' (which are essentially their applications)
  useEffect(() => {
    if (authLoading) {
      return;
    }

    // Only job seekers (and admins who can view everything) should see this
    if (!user || (!hasRole("job_seeker") && !hasRole("admin"))) {
      setErrorApplied(
        "Access Denied: Only Job Seekers can view their applied jobs."
      );
      setLoadingApplied(false);
      // No toast/redirect here, as ProtectedRoute should handle primary access denial.
      return;
    }

    const fetchAppliedJobs = async () => {
      setLoadingApplied(true);
      setErrorApplied(null);
      try {
        applicationService.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;
        // Reusing the /applications/my endpoint as this represents what they've applied for
        const response = await applicationService.get("/applications/my");
        setAppliedJobs(response.data.applications || []); // Assuming response has 'applications' array
        toast.success("Applied jobs loaded.");
      } catch (err) {
        console.error("Failed to fetch applied jobs:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to load applied jobs.";
        setErrorApplied(errorMessage);
        toast.error(errorMessage);
        setAppliedJobs([]);
      } finally {
        setLoadingApplied(false);
      }
    };

    fetchAppliedJobs();
  }, [user, authLoading, token, hasRole]);

  // Effect to fetch 'Viewed Jobs' (Conceptual - needs backend tracking)
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user || (!hasRole("job_seeker") && !hasRole("admin"))) {
      setErrorViewed(
        "Access Denied: Only Job Seekers can view their viewed jobs."
      );
      setLoadingViewed(false);
      return;
    }

    const fetchViewedJobs = async () => {
      setLoadingViewed(true);
      setErrorViewed(null);
      try {
        jobService.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        // This is a CONCEPTUAL endpoint. You would need to implement:
        // 1. Backend logic to record when a job seeker views a job.
        // 2. A backend endpoint like GET /api/jobs/viewed-by-me that returns a list of job IDs or objects.
        // For now, we'll simulate an empty response or a placeholder.

        // Example: const response = await jobsAPI.get("/jobs/viewed-by-me");
        // setViewedJobs(response.data.viewedJobs || []);

        // --- SIMULATING NO VIEWED JOBS FOR NOW ---
        console.warn(
          "Viewed Jobs feature is conceptual and requires backend tracking."
        );
        // await new Promise(resolve => setTimeout(500)); // Simulate API delay
        setViewedJobs([]); // No viewed jobs currently implemented on backend
        toast.info("Viewed jobs tracking is not yet fully implemented.");
        // --- END SIMULATION ---
      } catch (err) {
        console.error("Failed to fetch viewed jobs:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to load viewed jobs.";
        setErrorViewed(errorMessage);
        toast.error(errorMessage);
        setViewedJobs([]);
      } finally {
        setLoadingViewed(false);
      }
    };

    fetchViewedJobs();
  }, [user, authLoading, token, hasRole]);

  // Show loading for initial auth or if user is not a job seeker/admin
  if (
    authLoading ||
    (!user && !authLoading) ||
    (user && !hasRole("job_seeker") && !hasRole("admin"))
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">
          {authLoading
            ? "Loading authentication..."
            : "Accessing job activity..."}
        </p>
      </div>
    );
  }

  // If user is neither job_seeker nor admin
  if (
    !user ||
    !user.role ||
    (user.role !== "job_seeker" && user.role !== "admin")
  ) {
    return (
      <div className="text-center p-8 bg-red-100 border border-red-300 rounded-lg mx-auto max-w-lg mt-10">
        <h2 className="text-2xl font-bold text-red-800 mb-3">
          Unauthorized Access
        </h2>
        <p className="text-red-700">
          You do not have the necessary permissions to view this page.
        </p>
        <button
          onClick={() => window.history.back()} // Go back
          className="mt-5 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-8 md:p-10 lg:p-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center border-b pb-4">
          My Job Activity
        </h1>

        {/* Applied Jobs Section */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Jobs You've Applied For ({appliedJobs.length})
          </h2>
          {loadingApplied ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-600">Loading your applications...</p>
            </div>
          ) : errorApplied ? (
            <div className="text-red-600 p-4 bg-red-50 rounded-md border border-red-200">
              <p>{errorApplied}</p>
            </div>
          ) : appliedJobs.length === 0 ? (
            <p className="text-gray-600 italic">
              You haven't applied for any jobs through referrals yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {appliedJobs.map((app) => (
                <div
                  key={app._id}
                  className="bg-white p-5 rounded-lg shadow-sm border border-gray-200"
                >
                  <h3 className="text-xl font-semibold text-blue-700">
                    {app.jobTitle || "N/A"}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Referred By: {app.referralProviderName || "N/A"}
                  </p>
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
                  {/* Link to full application detail if available */}
                  {/* <button onClick={() => navigate(`/applications/${app._id}`)} className="mt-3 text-blue-500 hover:underline text-sm">View Details</button> */}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Viewed Jobs Section (Conceptual) */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Jobs You've Viewed ({viewedJobs.length})
          </h2>
          {loadingViewed ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-600">Loading viewed jobs...</p>
            </div>
          ) : errorViewed ? (
            <div className="text-red-600 p-4 bg-red-50 rounded-md border border-red-200">
              <p>{errorViewed}</p>
              <p className="text-sm mt-2">
                This feature requires backend tracking of job views.
              </p>
            </div>
          ) : viewedJobs.length === 0 ? (
            <div className="text-gray-600 italic p-4 bg-yellow-50 rounded-md border border-yellow-200">
              <p>
                You haven't viewed any jobs yet, or this feature is not fully
                implemented on the backend.
              </p>
              <p className="mt-2 text-sm">
                To enable this, your backend needs to track job views (e.g.,
                when you visit a job detail page) and provide an API endpoint to
                retrieve them.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {viewedJobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white p-5 rounded-lg shadow-sm border border-gray-200"
                >
                  <h3 className="text-xl font-semibold text-purple-700">
                    {job.title || "N/A"}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Company: {job.company || "N/A"}
                  </p>
                  <p className="text-gray-700 text-sm">
                    Location: {job.location || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Viewed On: {new Date(job.lastViewedAt).toLocaleDateString()}
                  </p>
                  {/* Link to job detail page */}
                  {/* <button onClick={() => navigate(`/jobs/${job._id}`)} className="mt-3 text-purple-500 hover:underline text-sm">View Job</button> */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSeekerJobActivity;
