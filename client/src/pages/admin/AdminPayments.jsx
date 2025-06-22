import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Adjust path
import { adminService } from "../../services/api.js"; // Reuse adminAPI for admin-specific data
import toast from "react-hot-toast";

const AdminPayments = () => {
  const { user, loading: authLoading, token, hasRole } = useAuth();
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true); // Component-specific loading for payments data
  const [error, setError] = useState(null);

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
      navigate("/admin", { replace: true }); // Redirect non-admins to admin dashboard or general dashboard
      setLoading(false);
      return;
    }

    const fetchPayments = async () => {
      setLoading(true);
      setError(null);

      try {
        // Set Authorization header for admin API requests
        adminService.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;

        // Assuming an endpoint to fetch all payments
        const response = await adminService.get("/admin/payments");

        setPayments(response.data.payments || []); // Assuming backend sends payments in response.data.payments

        toast.success("Payments data loaded!");
      } catch (err) {
        console.error("Failed to fetch payments data:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to load payments data.";
        setError(errorMessage);
        toast.error(errorMessage);
        setPayments([]); // Reset payments on error
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user, authLoading, token, hasRole, navigate]); // Dependencies

  // --- Conditional Rendering ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Loading payments data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-6 bg-red-50 border border-red-200 rounded-lg mx-auto max-w-md mt-10">
        <h3 className="font-semibold text-lg mb-2">Error Loading Payments</h3>
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

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-xl p-8 md:p-10 lg:p-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center border-b pb-4">
          Payments Management
        </h1>

        {payments.length === 0 ? (
          <div className="text-center p-8 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xl font-semibold text-blue-800">
              No payment records found.
            </p>
            <p className="text-gray-600 mt-2">
              Check your backend configuration or add new transactions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="py-3 px-6">
                    Transaction ID
                  </th>
                  <th scope="col" className="py-3 px-6">
                    User (ID/Email)
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Type
                  </th>
                  <th scope="col" className="py-3 px-6 text-right">
                    Amount
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Status
                  </th>
                  <th scope="col" className="py-3 px-6">
                    Date
                  </th>
                  {/* Add more table headers if needed */}
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                      {payment.transactionId || payment._id}
                    </td>
                    <td className="py-4 px-6">
                      {payment.userName || "N/A"} (
                      {payment.userId || payment.userEmail || "N/A"})
                    </td>
                    <td className="py-4 px-6 capitalize">
                      {payment.type ? payment.type.replace("_", " ") : "N/A"}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold">
                      {payment.currency || "$"}
                      {payment.amount ? payment.amount.toFixed(2) : "0.00"}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          payment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : payment.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {payment.status || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    {/* Add more table data if needed */}
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

export default AdminPayments;
