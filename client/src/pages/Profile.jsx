import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext"; // Adjust path
import { userService } from "../services/api"; // Assume you have a usersAPI instance
import toast from "react-hot-toast";

const Profile = () => {
  const { user, loading: authLoading, token, updateUser } = useAuth(); // Get user, loading, token, and updateUser from AuthContext
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    role: "", // User's current role
    // Add other profile fields you expect to edit, e.g.,
    // phoneNumber: "",
    // address: "",
  });
  const [loading, setLoading] = useState(false); // Component-specific loading for save operations
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Effect to populate form fields when user data is available or changes
  useEffect(() => {
    if (!authLoading && user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        // Initialize other fields here from user object if they exist
        // phoneNumber: user.phoneNumber || "",
        // address: user.address || "",
      });
      setError(null); // Clear any previous errors when user data loads
    } else if (!authLoading && !user) {
      setError("User not authenticated. Please log in.");
      toast.error("Please log in to view your profile.");
    }
  }, [user, authLoading]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Toggle editing mode
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    // If exiting edit mode without saving, reset form data to current user data
    if (isEditing && user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        // Reset other fields too
        // phoneNumber: user.phoneNumber || "",
        // address: user.address || "",
      });
      setError(null);
    }
  };

  // Handle saving profile changes
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Set Authorization header for the request
      userService.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Only send updatable fields. Email and role are often not directly editable by users.
      // For this example, we'll allow name editing.
      const dataToUpdate = {
        name: profileData.name,
        // Add other fields that are editable, e.g.,
        // phoneNumber: profileData.phoneNumber,
        // address: profileData.address,
      };

      const response = await userService.patch("/users/me", dataToUpdate); // Assuming PATCH /api/users/me for updating current user

      // Update the user object in AuthContext with the new data
      // Assuming your backend returns the updated user object
      updateUser(response.data.user);

      toast.success("Profile updated successfully!");
      setIsEditing(false); // Exit editing mode
    } catch (err) {
      console.error("Failed to update profile:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to update profile.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Loading profile data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-6 bg-red-50 border border-red-200 rounded-lg mx-auto max-w-md mt-10">
        <h3 className="font-semibold text-lg mb-2">Error Loading Profile</h3>
        <p>{error}</p>
        <p className="text-sm mt-2">Please ensure you are logged in.</p>
      </div>
    );
  }

  if (!user) {
    // This case should ideally be caught by ProtectedRoute, but good for fallback
    return (
      <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg mx-auto max-w-lg mt-10">
        <p className="text-xl font-semibold text-yellow-800">
          You are not logged in to view a profile.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen flex justify-center items-start">
      <div className="bg-white shadow-lg rounded-xl p-8 md:p-10 lg:p-12 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-4xl font-extrabold text-gray-900">
            User Profile
          </h1>
          <button
            onClick={handleEditToggle}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <div className="mt-1">
              <input
                id="name"
                name="name"
                type="text"
                value={profileData.name}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm ${
                  isEditing
                    ? "bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
              />
            </div>
          </div>

          {/* Email Field (usually read-only) */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                value={profileData.email}
                readOnly
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm"
              />
            </div>
          </div>

          {/* Role Field (usually read-only) */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <div className="mt-1">
              <input
                id="role"
                name="role"
                type="text"
                value={profileData.role
                  .replace("_", " ")
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")} // Capitalize words
                readOnly
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm"
              />
            </div>
          </div>

          {/* Add more fields here as needed (e.g., phoneNumber, address) */}
          {/* Example of an editable field:
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1">
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={profileData.phoneNumber}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm ${
                  isEditing ? "bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" : "bg-gray-100 cursor-not-allowed"
                }`}
              />
            </div>
          </div>
          */}

          {/* Save/Cancel Buttons in Editing Mode */}
          {isEditing && (
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button" // Use type="button" to prevent form submission
                onClick={handleEditToggle} // Cancel
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
