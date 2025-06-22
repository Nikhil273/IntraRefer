import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Adjust path
import { adminService } from "../../services/api"; // Reuse adminAPI for admin-specific data
import toast from "react-hot-toast";

const AdminUsers = () => {
  const { user, loading: authLoading, token, hasRole } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Component-specific loading for users data
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'

  // In-component check for admin role and data fetching
  useEffect(() => {
    // 1. Wait for authentication state to be determined
    if (authLoading) {
      return;
    }

    // 2. Check if the user is an admin
    if (!user || !hasRole("admin")) {
      setError(
        "Access Denied: You must be an administrator to view this page."
      );
      toast.error("Access Denied: Insufficient permissions.");
      navigate("/admin", { replace: true }); // Redirect non-admins to admin dashboard
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        // Set Authorization header for admin API requests
        adminService.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;

        // Fetch all users
        const response = await adminService.get("/admin/users");

        setUsers(response.data.users || []); // Assuming backend sends users in response.data.users
        toast.success("Users data loaded!");
      } catch (err) {
        console.error("Failed to fetch users data:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to load users data.";
        setError(errorMessage);
        toast.error(errorMessage);
        setUsers([]); // Reset users on error
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, authLoading, token, hasRole, navigate]); // Dependencies

  // Filter and Sort Logic
  const filteredAndSortedUsers = users
    .filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "all" || u.role === filterRole;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc"); // Default to ascending when changing column
    }
  };

  // --- Conditional Rendering ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Loading users data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-6 bg-red-50 border border-red-200 rounded-lg mx-auto max-w-md mt-10">
        <h3 className="font-semibold text-lg mb-2">Error Loading Users</h3>
        <p>{error}</p>
        <p className="text-sm mt-2">
          Please ensure you have administrator privileges.
        </p>
        <button
          onClick={() => navigate("/admin")}
          className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
        >
          Go to Admin Dashboard
        </button>
      </div>
    );
  }

  // Double check user role again, although ProtectedRoute should prevent most cases
  if (!user || !hasRole("admin")) {
    return (
      <div className="text-center p-8 bg-red-100 border border-red-300 rounded-lg mx-auto max-w-lg mt-10">
        <h2 className="text-2xl font-bold text-red-800 mb-3">
          Unauthorized Access
        </h2>
        <p className="text-red-700">
          You do not have the necessary permissions to view this page.
        </p>
        <button
          onClick={() => navigate("/admin", { replace: true })}
          className="mt-5 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
        >
          Go to Admin Dashboard
        </button>
      </div>
    );
  }

  // Placeholder for user actions (e.g., view details, edit, delete)
  const handleViewUser = (userId) => {
    toast.info(`Viewing user: ${userId}`);
    // navigate(`/admin/users/${userId}`); // Navigate to a user detail page
  };

  // const handleEditUser = (userId) => {
  //   toast.info(`Editing user: ${userId}`);
  // };

  // const handleDeleteUser = async (userId) => {
  //   if (window.confirm(`Are you sure you want to delete user ${userId}?`)) {
  //     try {
  //       adminAPI.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  //       await adminAPI.delete(`/admin/users/${userId}`);
  //       setUsers(users.filter(u => u._id !== userId)); // Remove from local state
  //       toast.success("User deleted successfully.");
  //     } catch (err) {
  //       console.error("Failed to delete user:", err);
  //       toast.error(err.response?.data?.message || "Failed to delete user.");
  //     }
  //   }
  // };

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-8 md:p-10 lg:p-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center border-b pb-4">
          User Management
        </h1>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="job_seeker">Job Seeker</option>
            <option value="referral_provider">Referral Provider</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {filteredAndSortedUsers.length === 0 &&
        searchTerm === "" &&
        filterRole === "all" ? (
          <div className="text-center p-8 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xl font-semibold text-blue-800">
              No user records found.
            </p>
            <p className="text-gray-600 mt-2">
              Database is empty or there was an issue fetching data.
            </p>
          </div>
        ) : filteredAndSortedUsers.length === 0 &&
          (searchTerm !== "" || filterRole !== "all") ? (
          <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xl font-semibold text-yellow-800">
              No users found matching your criteria.
            </p>
            <p className="text-gray-600 mt-2">
              Try adjusting your search term or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th
                    scope="col"
                    className="py-3 px-6 cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    Name
                    {sortBy === "name" && (sortOrder === "asc" ? " ▲" : " ▼")}
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-6 cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    Email
                    {sortBy === "email" && (sortOrder === "asc" ? " ▲" : " ▼")}
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-6 cursor-pointer"
                    onClick={() => handleSort("role")}
                  >
                    Role
                    {sortBy === "role" && (sortOrder === "asc" ? " ▲" : " ▼")}
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-6 cursor-pointer"
                    onClick={() => handleSort("isSubscribed")}
                  >
                    Subscription
                    {sortBy === "isSubscribed" &&
                      (sortOrder === "asc" ? " ▲" : " ▼")}
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-6 cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    Joined Date
                    {sortBy === "createdAt" &&
                      (sortOrder === "asc" ? " ▲" : " ▼")}
                  </th>
                  <th scope="col" className="py-3 px-6 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedUsers.map((userItem) => (
                  <tr
                    key={userItem._id}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                      {userItem.name}
                    </td>
                    <td className="py-4 px-6">{userItem.email}</td>
                    <td className="py-4 px-6 capitalize">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          userItem.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : userItem.role === "job_seeker"
                            ? "bg-blue-100 text-blue-800"
                            : userItem.role === "referral_provider"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {userItem.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          userItem.isSubscribed || userItem.role === "admin"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {userItem.isSubscribed || userItem.role === "admin"
                          ? userItem.role === "admin"
                            ? "Admin Default"
                            : userItem.subscriptionType || "Active"
                          : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {new Date(userItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-center space-x-2">
                      <button
                        onClick={() => handleViewUser(userItem._id)}
                        className="font-medium text-blue-600 hover:text-blue-900"
                        title="View User Details"
                      >
                        View
                      </button>
                      {/*
                      <button 
                        onClick={() => handleEditUser(userItem._id)}
                        className="font-medium text-indigo-600 hover:text-indigo-900"
                        title="Edit User"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(userItem._id)}
                        className="font-medium text-red-600 hover:text-red-900"
                        title="Delete User"
                      >
                        Delete
                      </button>
                      */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
