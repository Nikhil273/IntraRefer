import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Removed 'redirect' as it's not used directly
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { authService } from "../services/api"; // Ensure this import is correct

const AuthPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Only for registration
  const [role, setRole] = useState("jobSeeker"); // Default role for registration

  // useAuth provides user, loading, error, clearError, but login/register are called directly via authService
  // We'll keep them destructured here if other parts of the app rely on them for state.
  const { user, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      // Clear any existing error message if user logs in successfully
      if (error) {
        clearError();
      }
      toast.success(`Welcome, ${user.name || user.email}! Redirecting...`);
      // Redirect to a suitable page, e.g., dashboard or home
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate, error, clearError]); // Dependencies for useEffect

  // Handle form submission for login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    clearError(); // Clear previous errors before a new attempt

    const credentials = { email, password };
    const result = await authService.login(credentials); // This calls the API service directly

    if (result.success) {
      // If login is successful, AuthContext should handle setting the 'user'
      // state and the useEffect above will trigger the redirect and toast.
      console.log("Login successful. User data set in AuthContext.");
      // NO direct redirect("/") or toast.success here. Let useEffect handle it.
    } else {
      // Access the error message from 'result.message'
      console.error("Login failed:", result.message);
      // The Axios response interceptor in api.js already handles displaying
      // a toast.error for API call failures. So, no need for another toast here.
    }
  };

  // Handle form submission for registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    clearError(); // Clear previous errors before a new attempt

    // Basic frontend validation
    if (!name || !email || !password || !role) {
      toast.error("Please fill in all fields for registration.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    const userData = { name, email, password, role };
    const result = await authService.register(userData); // This calls the API service directly

    if (result.success) {
      // If registration is successful, AuthContext should handle setting the 'user'
      // state and the useEffect above will trigger the redirect and toast.
      console.log("Registration successful. User data set in AuthContext.");
      // NO direct redirect("/") or toast.success here. Let useEffect handle it.
    } else {
      // Access the error message from 'result.message'
      console.error("Registration failed:", result.message);
      // The Axios response interceptor in api.js already handles displaying
      // a toast.error for API call failures.
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter">
      <div className="sm:mx-auto sm:w-full sm:max-w-md rounded-lg overflow-hidden shadow-lg">
        <div className="bg-white py-8 px-4 sm:px-10 rounded-lg">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLoginMode ? "Sign in to your account" : "Create a new account"}
          </h2>
          <form
            onSubmit={isLoginMode ? handleLoginSubmit : handleRegisterSubmit}
            className="space-y-6 mt-6"
          >
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={
                    isLoginMode ? "current-password" : "new-password"
                  }
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                />
              </div>
            </div>

            {/* Name Input (only for Register mode) */}
            {!isLoginMode && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                  />
                </div>
              </div>
            )}

            {/* Role Selection (only for Register mode) */}
            {!isLoginMode && (
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Register as
                </label>
                <div className="mt-1">
                  <select
                    id="role"
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                  >
                    <option value="jobSeeker">Job Seeker</option>
                    <option value="referrer">Referral Provider</option>
                  </select>
                </div>
              </div>
            )}

            {/* General error display (optional, as toast handles it) */}
            {error && (
              <div className="text-red-500 text-sm text-center font-medium mt-4 p-2 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading} // Disable button while loading
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition duration-150 ease-in-out ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
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
                    {isLoginMode ? "Signing In..." : "Registering..."}
                  </span>
                ) : isLoginMode ? (
                  "Sign In"
                ) : (
                  "Register"
                )}
              </button>
            </div>
            <p className="mt-2 text-center text-sm text-gray-600">
              {isLoginMode
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              {"  "}
              <button
                type="button" // Important: change to type="button" to prevent form submission
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  clearError(); // Clear errors when switching modes
                  setEmail(""); // Clear form fields when switching modes
                  setPassword("");
                  setName("");
                }}
                className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLoginMode ? "Sign Up" : "Sign In "}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
