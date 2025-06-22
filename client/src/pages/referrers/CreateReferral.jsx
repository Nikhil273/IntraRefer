import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Adjust path
import { referralService } from "../../services/api"; // Reuse referralsAPI for creating
import toast from "react-hot-toast";

const CreateReferral = () => {
  const { user, loading: authLoading, token, hasRole } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    jobTitle: "",
    jobLocation: "", // Added for more realism
    jobLink: "", // Link to the job posting
    jobSeekerName: "",
    jobSeekerEmail: "",
    referralNotes: "", // Comments from the referral provider
    // If you plan to allow resume uploads, this would be a File object:
    // jobSeekerResume: null,
  });

  const [loading, setLoading] = useState(false); // Component-specific loading for form submission
  const [error, setError] = useState(null);

  // Effect to check user role and redirect if not a referral provider
  useEffect(() => {
    if (authLoading) {
      return; // Still loading auth state
    }

    if (!user || !hasRole("referral_provider")) {
      toast.error(
        "Access Denied: Only Referral Providers can create referrals."
      );
      navigate("/dashboard", { replace: true }); // Redirect non-providers
    }
  }, [user, authLoading, hasRole, navigate]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // For file inputs, handle differently
    // if (type === 'file') {
    //   setFormData((prevData) => ({ ...prevData, [name]: e.target.files[0] }));
    // } else {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    // }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic client-side validation
    if (
      !formData.jobTitle ||
      !formData.jobSeekerName ||
      !formData.jobSeekerEmail
    ) {
      setError(
        "Please fill in all required fields (Job Title, Job Seeker Name, Job Seeker Email)."
      );
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    // Simple email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.jobSeekerEmail)) {
      setError("Please enter a valid email address for the Job Seeker.");
      toast.error("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      // Set Authorization header
      referralService.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      // If you're handling file uploads, you'd use FormData:
      // const data = new FormData();
      // for (const key in formData) {
      //   data.append(key, formData[key]);
      // }
      // const response = await referralsAPI.post("/referrals", data, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // });

      // For now, sending as JSON
      const response = await referralService.post("/referrals", formData);

      toast.success("Referral created successfully!");
      // Reset form or navigate
      setFormData({
        jobTitle: "",
        jobLocation: "",
        jobLink: "",
        jobSeekerName: "",
        jobSeekerEmail: "",
        referralNotes: "",
      });
      navigate("/my-referrals", { replace: true }); // Redirect to referrer's referrals
    } catch (err) {
      console.error("Failed to create referral:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to create referral.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading for auth state or if user is not a referrer
  if (
    authLoading ||
    (!user && !authLoading) ||
    (user && !hasRole("referral_provider"))
  ) {
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
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen flex justify-center items-start">
      <div className="bg-white shadow-lg rounded-xl p-8 md:p-10 lg:p-12 w-full max-w-3xl">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center border-b pb-4">
          Create New Job Referral
        </h1>

        {error && (
          <div className="text-red-600 text-center p-4 bg-red-100 border border-red-200 rounded-md mb-6">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Details */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                Job Information
              </h2>
              <div>
                <label
                  htmlFor="jobTitle"
                  className="block text-sm font-medium text-gray-700"
                >
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="jobTitle"
                  name="jobTitle"
                  type="text"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="jobLocation"
                  className="block text-sm font-medium text-gray-700"
                >
                  Job Location
                </label>
                <input
                  id="jobLocation"
                  name="jobLocation"
                  type="text"
                  value={formData.jobLocation}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., New York, NY (Remote)"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="jobLink"
                  className="block text-sm font-medium text-gray-700"
                >
                  Job Posting Link
                </label>
                <input
                  id="jobLink"
                  name="jobLink"
                  type="url"
                  value={formData.jobLink}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="[https://example.com/job-post](https://example.com/job-post)"
                />
              </div>
            </div>

            {/* Job Seeker Details */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
                Job Seeker Information
              </h2>
              <div>
                <label
                  htmlFor="jobSeekerName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Job Seeker's Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="jobSeekerName"
                  name="jobSeekerName"
                  type="text"
                  value={formData.jobSeekerName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Jane Doe"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="jobSeekerEmail"
                  className="block text-sm font-medium text-gray-700"
                >
                  Job Seeker's Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="jobSeekerEmail"
                  name="jobSeekerEmail"
                  type="email"
                  value={formData.jobSeekerEmail}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., jane.doe@example.com"
                />
              </div>
              {/* Optional: Job Seeker Resume Upload */}
              {/* <div className="mt-4">
                <label htmlFor="jobSeekerResume" className="block text-sm font-medium text-gray-700">
                  Job Seeker's Resume (PDF/DOCX)
                </label>
                <input
                  id="jobSeekerResume"
                  name="jobSeekerResume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleChange}
                  className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                />
                <p className="mt-1 text-sm text-gray-500">Max file size 5MB.</p>
              </div> */}
            </div>
          </div>

          {/* Referral Notes */}
          <div className="mt-6">
            <label
              htmlFor="referralNotes"
              className="block text-sm font-medium text-gray-700"
            >
              Your Referral Notes/Comments (Optional)
            </label>
            <textarea
              id="referralNotes"
              name="referralNotes"
              rows="4"
              value={formData.referralNotes}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Add any relevant details about the job seeker or why they are a good fit."
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white transition duration-200 ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting Referral...
                </span>
              ) : (
                "Submit Referral"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReferral;
