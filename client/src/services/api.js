// import axios from "axios";
// import toast from "react-hot-toast";

// // Base API configuration
// const API_BASE_URL =
//   import.meta.env.REACT_APP_API_URL || "http://localhost:5000/api";

// // Create axios instance
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 10000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Auth API instance (for auth-related requests)
// export const authAPI = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 10000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Request interceptor to add auth token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const message = error.response?.data?.message || "An error occurred";

//     // Handle specific error cases
//     if (error.response?.status === 401) {
//       // Unauthorized - clear token and redirect to login
//       localStorage.removeItem("token");
//       window.location.href = "/auth";
//       toast.error("Session expired. Please login again.");
//     } else if (error.response?.status === 403) {
//       // Forbidden
//       if (error.response.data?.subscriptionRequired) {
//         toast.error("Premium subscription required for this feature");
//       } else if (error.response.data?.limitReached) {
//         toast.error(
//           "Weekly application limit reached. Upgrade to premium for unlimited applications."
//         );
//       } else {
//         toast.error("Access denied");
//       }
//     } else if (error.response?.status === 429) {
//       // Rate limit
//       toast.error("Too many requests. Please try again later.");
//     } else if (error.response?.status >= 500) {
//       // Server error
//       toast.error("Server error. Please try again later.");
//     }

//     return Promise.reject(error);
//   }
// );

// // Auth API Services
// export const authService = {
//   login: (credentials) => authAPI.post("/auth/login", credentials),
//   register: (userData) => authAPI.post("/auth/register", userData),
//   logout: () => authAPI.post("/auth/logout"),
//   getCurrentUser: () => authAPI.get("/auth/me"),
//   refreshToken: () => authAPI.post("/auth/refresh"),
//   changePassword: (passwords) =>
//     authAPI.put("/auth/change-password", passwords),
//   deactivateAccount: () => authAPI.post("/auth/deactivate"),
// };

// // User API Services
// export const userService = {
//   getProfile: () => api.get("/users/profile"),
//   updateProfile: (profileData) => api.put("/users/profile", profileData),
//   uploadAvatar: (formData) =>
//     api.post("/users/upload-avatar", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     }),
//   uploadResume: (formData) =>
//     api.post("/users/upload-resume", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     }),
//   getUsers: (params) => api.get("/users", { params }),
//   getUserById: (id) => api.get(`/users/${id}`),
//   updateUserStatus: (id, status) => api.put(`/users/${id}/status`, { status }),
//   deleteUser: (id) => api.delete(`/users/${id}`),
// };

// // Referral API Services
// export const referralService = {
//   getReferrals: (params) => api.get("/referrals", { params }),
//   getReferralById: (id) => api.get(`/referrals/${id}`),
//   createReferral: (referralData) => api.post("/referrals", referralData),
//   updateReferral: (id, referralData) =>
//     api.put(`/referrals/${id}`, referralData),
//   deleteReferral: (id) => api.delete(`/referrals/${id}`),
//   getMyReferrals: (params) => api.get("/referrals/my-referrals", { params }),
//   searchReferrals: (query) =>
//     api.get(`/referrals/search?q=${encodeURIComponent(query)}`),
//   getMatchingReferrals: () => api.get("/referrals/matching"),
//   incrementViews: (id) => api.post(`/referrals/${id}/view`),
// };

// // Application API Services
// export const applicationService = {
//   getApplications: (params) => api.get("/applications", { params }),
//   getApplicationById: (id) => api.get(`/applications/${id}`),
//   createApplication: (applicationData) =>
//     api.post("/applications", applicationData),
//   updateApplication: (id, applicationData) =>
//     api.put(`/applications/${id}`, applicationData),
//   deleteApplication: (id) => api.delete(`/applications/${id}`),
//   getMyApplications: (params) =>
//     api.get("/applications/my-applications", { params }),
//   getReferrerApplications: (params) =>
//     api.get("/applications/referrer-applications", { params }),
//   updateApplicationStatus: (id, status, notes) =>
//     api.put(`/applications/${id}/status`, { status, notes }),
//   withdrawApplication: (id) => api.put(`/applications/${id}/withdraw`),
//   getApplicationStats: () => api.get("/applications/stats"),
// };

// // Payment API Services
// export const paymentService = {
//   getSubscriptionPlans: () => api.get("/payments/plans"),
//   createOrder: (subscriptionType) =>
//     api.post("/payments/create-order", { subscriptionType }),
//   verifyPayment: (paymentData) => api.post("/payments/verify", paymentData),
//   getSubscriptionStatus: () => api.get("/payments/subscription-status"),
//   getPaymentHistory: () => api.get("/payments/history"),
// };

// // Admin API Services
// export const adminService = {
//   getDashboardStats: () => api.get("/admin/dashboard-stats"),
//   getAllUsers: (params) => api.get("/admin/users", { params }),
//   getAllReferrals: (params) => api.get("/admin/referrals", { params }),
//   getAllApplications: (params) => api.get("/admin/applications", { params }),
//   getAllPayments: (params) => api.get("/admin/payments", { params }),
//   updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
//   banUser: (id, reason) => api.put(`/admin/users/${id}/ban`, { reason }),
//   unbanUser: (id) => api.put(`/admin/users/${id}/unban`),
//   deleteReferral: (id) => api.delete(`/admin/referrals/${id}`),
//   getAnalytics: (params) => api.get("/admin/analytics", { params }),
// };

// // File upload helper
// export const uploadFile = async (file, type = "avatar") => {
//   const formData = new FormData();
//   formData.append(type, file);

//   if (type === "avatar") {
//     return userService.uploadAvatar(formData);
//   } else if (type === "resume") {
//     return userService.uploadResume(formData);
//   }

//   throw new Error("Invalid file type");
// };

// // Helper function to handle API errors
// export const handleApiError = (error) => {
//   if (error.response) {
//     // Server responded with error status
//     const message = error.response.data?.message || "An error occurred";
//     return { success: false, message, status: error.response.status };
//   } else if (error.request) {
//     // Request was made but no response received
//     return {
//       success: false,
//       message: "Network error. Please check your connection.",
//     };
//   } else {
//     // Something else happened
//     return {
//       success: false,
//       message: error.message || "An unexpected error occurred",
//     };
//   }
// };

// // Helper function for successful responses
// export const handleApiSuccess = (
//   response,
//   defaultMessage = "Operation successful"
// ) => {
//   const message = response.data?.message || defaultMessage;
//   return { success: true, message, data: response.data };
// };

// export default api;

import axios from "axios";
import toast from "react-hot-toast";

// Base API configuration from environment variable
const API_BASE_URL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000/api";
// Note: Changed REACT_APP_API_URL to VITE_REACT_APP_API_URL for Vite compatibility.
// If you are not using Vite, keep it as REACT_APP_API_URL.

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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error has a response from the server
    if (error.response) {
      const message = error.response.data?.message || "An error occurred";

      if (error.response.status === 401) {
        // Unauthorized - session expired, invalid token, etc.
        localStorage.removeItem("token");
        // Only redirect if not already on the auth page to prevent infinite loops
        if (window.location.pathname !== "/auth") {
          window.location.href = "/auth";
        }
        toast.error("Session expired. Please login again.");
      } else if (error.response.status === 403) {
        // Forbidden - access denied due to role or subscription
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
        // Too Many Requests (Rate Limit Exceeded)
        toast.error("Too many requests. Please try again later.");
      } else if (error.response.status >= 500) {
        // Server Error (5xx)
        toast.error("Server error. Please try again later.");
      } else if (error.response.status >= 400) {
        // Other client errors (4xx) like 400 Bad Request, 404 Not Found
        toast.error(message);
      }
    } else if (error.request) {
      // Request was made but no response was received (e.g., network error)
      toast.error("Network error. Please check your connection.");
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error(error.message || "An unexpected error occurred.");
    }

    return Promise.reject(error);
  }
);

// --- API Service Definitions ---

// Auth API Services
// These services use `authAPI` for direct auth calls managed by AuthContext,
// or `api` for calls needing the global interceptor after initial login.
export const authService = {
  login: (credentials) => authAPI.post("/auth/login", credentials),
  register: (userData) => authAPI.post("/auth/register", userData),
  // These calls should leverage the global `api` instance once authenticated
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"), // AuthContext uses authAPI.get("/auth/me")
  // Let AuthContext manually set header for getCurrentUser if it uses authAPI
  // For consistency, if `getCurrentUser` is hit post-login, `api` is better.
  refreshToken: () => api.post("/auth/refresh"),
  changePassword: (passwords) => api.put("/auth/change-password", passwords),
  deactivateAccount: () => api.post("/auth/deactivate"),
};

// User API Services
export const userService = {
  // Path changed to /users/me for current user profile as used in Profile component
  getProfile: () => api.get("/users/me"),
  updateProfile: (profileData) => api.patch("/users/me", profileData), // Changed to PATCH as common for partial updates
  uploadAvatar: (formData) =>
    api.post("/users/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  uploadResume: (formData) =>
    api.post("/users/upload-resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getUsers: (params) => api.get("/users", { params }), // General users list (may need admin role on backend)
  getUserById: (id) => api.get(`/users/${id}`),
  updateUserStatus: (id, status) => api.put(`/users/${id}/status`, { status }),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Referral API Services
export const referralService = {
  getReferrals: (params) => api.get("/referrals", { params }), // General list, can be used by admin
  getReferralById: (id) => api.get(`/referrals/${id}`),
  createReferral: (referralData) => api.post("/referrals", referralData),
  updateReferral: (id, referralData) =>
    api.put(`/referrals/${id}`, referralData),
  deleteReferral: (id) => api.delete(`/referrals/${id}`),
  // Renamed to match component usage where `my-received` and `my-provided` are differentiated
  getMyReceivedReferrals: (params) =>
    api.get("/referrals/my-received", { params }),
  getMyProvidedReferrals: (params) =>
    api.get("/referrals/my-provided", { params }),
  searchReferrals: (query) =>
    api.get(`/referrals/search?q=${encodeURIComponent(query)}`),
  getMatchingReferrals: () => api.get("/referrals/matching"),
  incrementViews: (id) => api.post(`/referrals/${id}/view`),
};

// Application API Services
export const applicationService = {
  getApplications: (params) => api.get("/applications", { params }), // General list, can be used by admin
  getApplicationById: (id) => api.get(`/applications/${id}`),
  createApplication: (applicationData) =>
    api.post("/applications", applicationData),
  updateApplication: (id, applicationData) =>
    api.put(`/applications/${id}`, applicationData),
  deleteApplication: (id) => api.delete(`/applications/${id}`),
  // Renamed/aligned to match component usage
  getMyApplications: (params) => api.get("/applications/my", { params }), // For job seeker
  getProvidedApplications: (params) =>
    api.get("/applications/provided", { params }), // For referral provider
  updateApplicationStatus: (id, status, notes) =>
    api.put(`/applications/${id}/status`, { status, notes }),
  withdrawApplication: (id) => api.put(`/applications/${id}/withdraw`),
  getApplicationStats: () => api.get("/applications/stats"),
  // New method for ApplicationCountWidget
  getApplicationCounts: () => api.get("/applications/counts"),
};

// New Job API Services for job-related actions (e.g., viewed jobs)
export const jobService = {
  getJobs: (params) => api.get("/jobs", { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post("/jobs", jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getJobsViewedByMe: () => api.get("/jobs/viewed-by-me"), // For JobSeekerJobActivity
  incrementJobView: (id) => api.post(`/jobs/${id}/view`), // For tracking job views
};

// Payment API Services
export const paymentService = {
  getSubscriptionPlans: () => api.get("/payments/plans"),
  // Aligned with `handleSubscribe` in Subscription component
  subscribeToPlan: (planId) => api.post("/subscriptions/subscribe", { planId }),
  cancelSubscription: () => api.post("/subscriptions/cancel"), // Aligned with Subscription component
  createOrder: (subscriptionType) =>
    api.post("/payments/create-order", { subscriptionType }),
  verifyPayment: (paymentData) => api.post("/payments/verify", paymentData),
  getSubscriptionStatus: () => api.get("/payments/subscription-status"),
  getPaymentHistory: () => api.get("/payments/history"),
};

// Admin API Services
export const adminService = {
  getDashboardStats: () => api.get("/admin/dashboard-summary"), // Aligned path
  getAllUsers: (params) => api.get("/admin/users", { params }),
  getAllReferrals: (params) => api.get("/admin/referrals", { params }), // Admin can get all referrals
  getAllApplications: (params) => api.get("/admin/applications", { params }), // Admin can get all applications
  getAllPayments: (params) => api.get("/admin/payments", { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  banUser: (id, reason) => api.put(`/admin/users/${id}/ban`, { reason }),
  unbanUser: (id) => api.put(`/admin/users/${id}/unban`),
  deleteReferral: (id) => api.delete(`/admin/referrals/${id}`),
  getAnalytics: (params) => api.get("/admin/analytics", { params }),
  // Add any other admin specific methods
};

// File upload helper
// This helper should now call the service methods
export const uploadFile = async (file, type = "avatar") => {
  const formData = new FormData();
  formData.append(type, file); // 'avatar' or 'resume' should match backend expected field name

  if (type === "avatar") {
    return userService.uploadAvatar(formData);
  } else if (type === "resume") {
    return userService.uploadResume(formData);
  }

  throw new Error("Invalid file type for upload.");
};

// Helper function to handle API errors
// This function is still useful for components that need more granular error handling
// beyond the global toast, or for displaying errors directly in form fields.
export const handleApiError = (error) => {
  if (error.response) {
    const message = error.response.data?.message || "An error occurred";
    return {
      success: false,
      message,
      status: error.response.status,
      data: error.response.data,
    };
  } else if (error.request) {
    return {
      success: false,
      message: "Network error. Please check your connection.",
      status: null,
      data: null,
    };
  } else {
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
      status: null,
      data: null,
    };
  }
};

// Helper function for successful responses
export const handleApiSuccess = (
  response,
  defaultMessage = "Operation successful"
) => {
  const message = response.data?.message || defaultMessage;
  return { success: true, message, data: response.data };
};

export const subscriptionAPI = {};

export default api;
