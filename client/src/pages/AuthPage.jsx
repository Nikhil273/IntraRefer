import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For redirection
import { useAuth } from "../contexts/AuthContext"; // Adjust the path if your AuthContext is elsewhere
import toast from "react-hot-toast"; // Your AuthContext already uses this, but it's good to import if you'll use it directly here too

const AuthPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true); // State to toggle between login and register forms
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Only for registration
  const [role, setRole] = useState("job_seeker"); // Default role for registration

  const { login, register, user, loading, error, clearError } = useAuth(); // Destructure auth functions and state
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
  }, [user, navigate, error, clearError]);

  // Handle form submission for login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    clearError(); // Clear previous errors before a new attempt

    const result = await login(email, password);
    if (result.success) {
      // Redirection handled by useEffect if 'user' state updates
    } else {
      // Error message is already displayed by toast from AuthContext
      console.error("Login failed:", result.error);
    }
  };

  // Handle form submission for registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    clearError(); // Clear previous errors before a new attempt

    // Basic validation
    if (!name || !email || !password || !role) {
      toast.error("Please fill in all fields for registration.");
      return;
    }
    if (password.length < 6) {
      // Example: minimum password length
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    const userData = { name, email, password, role };
    const result = await register(userData);
    if (result.success) {
      // Redirection handled by useEffect if 'user' state updates
    } else {
      // Error message is already displayed by toast from AuthContext
      console.error("Registration failed:", result.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isLoginMode ? "Sign in to your account" : "Create a new account"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 max-w">
          Or{" "}
          <button
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              clearError(); // Clear errors when switching modes
              setEmail(""); // Clear form fields when switching modes
              setPassword("");
              setName("");
            }}
            className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoginMode
              ? "register for a new account"
              : "sign in to an existing account"}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-md sm:rounded-lg sm:px-10">
          <form
            onSubmit={isLoginMode ? handleLoginSubmit : handleRegisterSubmit}
            className="space-y-6"
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="job_seeker">Job Seeker</option>
                    <option value="referral_provider">Referral Provider</option>
                  </select>
                </div>
              </div>
            )}

            {/* General error display (optional, as toast handles it) */}
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading} // Disable button while loading
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
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
                    {isLoginMode ? "Signing In..." : "Registering..."}
                  </span>
                ) : isLoginMode ? (
                  "Sign In"
                ) : (
                  "Register"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
