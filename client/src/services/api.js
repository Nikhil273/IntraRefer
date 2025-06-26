import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000/api";

// Main Axios instance for authenticated API calls
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth API instance (for auth-related requests like login/register
// which might not immediately have a token, or where token management is explicit)
export const authAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request Interceptor: Add Auth Token to ALL requests made by 'api' instance ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor for Global Error Handling ---
// This interceptor handles toast notifications for various HTTP status codes.
// It explicitly returns a rejected Promise, which will be caught by the
// try...catch blocks in individual service methods like those in authService.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error has a response from the server
    if (error.response) {
      const message = error.response.data?.message || "An error occurred";

      if (error.response.status === 401) {
        localStorage.removeItem("token");
        if (window.location.pathname !== "/auth") {
          window.location.href = "/auth";
        }
        toast.error("Session expired. Please login again.");
      } else if (error.response.status === 403) {
        if (error.response.data?.subscriptionRequired) {
          toast.error("Premium subscription required for this feature.");
        } else if (error.response.data?.limitReached) {
          toast.error(
            "Weekly application limit reached. Upgrade to premium for unlimited applications."
          );
        } else {
          toast.error("Access denied.");
        }
      } else if (error.response.status === 429) {
        toast.error("Too many requests. Please try again later.");
      } else if (error.response.status >= 500) {
        toast.error("Server error. Please try again later.");
      } else if (error.response.status >= 400) {
        toast.error(message); // Catch-all for other 4xx errors
      }
    } else if (error.request) {
      // Request was made but no response was received (e.g., network error)
      toast.error("Network error. Please check your connection.");
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error(error.message || "An unexpected error occurred.");
    }

    // Crucially, reject the promise so that the calling try...catch block
    // in the service methods (like authService.login/register) can catch it.
    return Promise.reject(error);
  }
);

// Helper function to handle successful API responses
export const handleApiSuccess = (
  response,
  defaultMessage = "Operation successful"
) => {
  const message = response.data?.message || defaultMessage;
  return { success: true, message, data: response.data };
};

// Helper function to handle API errors, returning a structured object.
// This function is useful for components that need more granular error handling
// beyond the global toast, or for displaying errors directly in form fields.
export const handleApiError = (error) => {
  // Check if there's a response from the server (e.g., 4xx, 5xx)
  if (error.response) {
    const message = error.response.data?.message || "An error occurred";
    return {
      success: false,
      message,
      status: error.response.status,
      data: error.response.data, // Include full data for specific error details (e.g., validation errors)
    };
  }
  // Check if the request was made but no response was received (e.g., network issues, server offline)
  else if (error.request) {
    return {
      success: false,
      message: "Network error. Please check your connection.",
      status: null,
      data: null,
    };
  }
  // Something happened in setting up the request that triggered an Error
  else {
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
      status: null,
      data: null,
    };
  }
};

// --- API Service Definitions ---
export const authService = {
  // Login method: Now uses try...catch to return structured success/error responses
  login: async (credentials) => {
    try {
      const response = await authAPI.post("/auth/login", credentials);
      return handleApiSuccess(response, "Login successful");
    } catch (error) {
      return handleApiError(error); // Explicitly return the structured error object
    }
  },
  // Register method: Now uses try...catch to return structured success/error responses
  register: async (userData) => {
    try {
      const response = await authAPI.post("/auth/register", userData);
      return handleApiSuccess(response, "Registration successful");
    } catch (error) {
      return handleApiError(error); // Explicitly return the structured error object
    }
  },
  // These calls should leverage the global `api` instance once authenticated
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
  refreshToken: () => api.post("/auth/refresh"),
  changePassword: (passwords) => api.put("/auth/change-password", passwords),
  deactivateAccount: () => api.post("/auth/deactivate"),
};

export const userService = {
  getProfile: () => api.get("/users/me"),
  updateProfile: (profileData) => api.patch("/users/me", profileData),
  uploadAvatar: (formData) =>
    api.post("/users/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  uploadResume: (formData) =>
    api.post("/users/upload-resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getUsers: (params) => api.get("/users", { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUserStatus: (id, status) => api.put(`/users/${id}/status`, { status }),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const referralService = {
  getReferrals: (params) => api.get("/referrals", { params }),
  getReferralById: (id) => api.get(`/referrals/${id}`),
  createReferral: (referralData) => api.post("/referrals", referralData),
  updateReferral: (id, referralData) =>
    api.put(`/referrals/${id}`, referralData),
  deleteReferral: (id) => api.delete(`/referrals/${id}`),
  getMyReceivedReferrals: (params) =>
    api.get("/referrals/my-received", { params }),
  getMyProvidedReferrals: (params) =>
    api.get("/referrals/my-provided", { params }),
  searchReferrals: (query) =>
    api.get(`/referrals/search?q=${encodeURIComponent(query)}`),
  getMatchingReferrals: () => api.get("/referrals/matching"),
  incrementViews: (id) => api.post(`/referrals/${id}/view`),
};

export const applicationService = {
  getApplications: (params) => api.get("/applications", { params }),
  getApplicationById: (id) => api.get(`/applications/${id}`),
  createApplication: (applicationData) =>
    api.post("/applications", applicationData),
  updateApplication: (id, applicationData) =>
    api.put(`/applications/${id}`, applicationData),
  deleteApplication: (id) => api.delete(`/applications/${id}`),
  getMyApplications: (params) => api.get("/applications/my", { params }),
  getProvidedApplications: (params) =>
    api.get("/applications/provided", { params }),
  updateApplicationStatus: (id, status, notes) =>
    api.put(`/applications/${id}/status`, { status, notes }),
  withdrawApplication: (id) => api.put(`/applications/${id}/withdraw`),
  getApplicationStats: () => api.get("/applications/stats"),
  getApplicationCounts: () => api.get("/applications/counts"),
};

export const jobService = {
  getJobs: (params) => api.get("/jobs", { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post("/jobs", jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getJobsViewedByMe: () => api.get("/jobs/viewed-by-me"),
  incrementJobView: (id) => api.post(`/jobs/${id}/view`),
};

export const paymentService = {
  getSubscriptionPlans: () => api.get("/payments/plans"),
  subscribeToPlan: (planId) => api.post("/subscriptions/subscribe", { planId }),
  cancelSubscription: () => api.post("/subscriptions/cancel"),
  createOrder: (subscriptionType) =>
    api.post("/payments/create-order", { subscriptionType }),
  verifyPayment: (paymentData) => api.post("/payments/verify", paymentData),
  getSubscriptionStatus: () => api.get("/payments/subscription-status"),
  getPaymentHistory: () => api.get("/payments/history"),
};

export const adminService = {
  getDashboardStats: () => api.get("/admin/dashboard-summary"),
  getAllUsers: (params) => api.get("/admin/users", { params }),
  getAllReferrals: (params) => api.get("/admin/referrals", { params }),
  getAllApplications: (params) => api.get("/admin/applications", { params }),
  getAllPayments: (params) => api.get("/admin/payments", { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  banUser: (id, reason) => api.put(`/admin/users/${id}/ban`, { reason }),
  unbanUser: (id) => api.put(`/admin/users/${id}/unban`),
  deleteReferral: (id) => api.delete(`/admin/referrals/${id}`),
  getAnalytics: (params) => api.get("/admin/analytics", { params }),
};

export const uploadFile = async (file, type = "avatar") => {
  const formData = new FormData();
  formData.append(type, file);

  if (type === "avatar") {
    return userService.uploadAvatar(formData);
  } else if (type === "resume") {
    return userService.uploadResume(formData);
  }

  throw new Error("Invalid file type for upload.");
};

export const subscriptionAPI = {};

export default api;
