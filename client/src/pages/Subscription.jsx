import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext"; // Adjust path as per your project structure
import { paymentService } from "../services/api"; // Make sure this API instance exists and is configured
import toast from "react-hot-toast";

const Subscription = () => {
  const {
    user,
    loading: authLoading,
    token,
    updateUser,
    getSubscriptionStatus,
  } = useAuth();
  const [loading, setLoading] = useState(false); // Component-specific loading for subscription actions
  const [error, setError] = useState(null);

  // Mock subscription plans (replace with real data from your backend if available)
  const plans = [
    {
      id: "basic",
      name: "Basic Plan",
      price: "$0/month",
      features: [
        "Limited job alerts",
        "Standard referral tools",
        "Email support",
      ],
      type: "basic", // Corresponds to subscriptionType in backend
    },
    {
      id: "premium",
      name: "Premium Plan",
      price: "$9.99/month",
      features: [
        "Unlimited job alerts",
        "Advanced referral analytics",
        "Priority referrals",
        "24/7 Chat support",
        "Exclusive webinars",
      ],
      type: "premium", // Corresponds to subscriptionType in backend
    },
  ];

  // Get current subscription status from AuthContext
  const currentSubscriptionStatus = getSubscriptionStatus();

  // Handle subscription action (e.g., subscribing to a plan)
  const handleSubscribe = async (planId) => {
    if (!user || !token) {
      toast.error("Please log in to manage subscriptions.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Set Authorization header for the request
      paymentService.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      // Assuming your backend endpoint to subscribe
      const response = await paymentService.post("/subscriptions/subscribe", {
        planId,
      });

      // Assuming your backend returns the updated user object with new subscription details
      // It's crucial for the backend to return the full updated user object
      updateUser(response.data.user);

      toast.success(
        `Successfully subscribed to ${
          response.data.user.subscriptionType || "your plan"
        }!`
      );
      setError(null); // Clear any old errors
    } catch (err) {
      console.error("Subscription failed:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to subscribe. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Optional: Handle cancellation (if your backend supports it)
  const handleCancelSubscription = async () => {
    if (!user || !token || !currentSubscriptionStatus?.isActive) {
      toast.error("No active subscription to cancel.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      paymentService.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
      // Assuming your backend endpoint to cancel subscription
      const response = await paymentService.post("/subscriptions/cancel");

      // Update user in context (backend should return user with subscription status set to inactive)
      updateUser(response.data.user);

      toast.success("Subscription cancelled successfully.");
    } catch (err) {
      console.error("Cancellation failed:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to cancel subscription.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while AuthContext is determining user status
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Loading subscription details...</p>
      </div>
    );
  }

  // If user is not authenticated after loading, show an error
  if (!user) {
    return (
      <div className="text-red-600 text-center p-6 bg-red-50 border border-red-200 rounded-lg mx-auto max-w-md mt-10">
        <h3 className="font-semibold text-lg mb-2">Authentication Required</h3>
        <p>Please log in to view and manage your subscriptions.</p>
      </div>
    );
  }

  // Render content based on subscription status and user role
  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen flex flex-col items-center">
      <div className="bg-white shadow-lg rounded-xl p-8 md:p-10 lg:p-12 w-full max-w-4xl">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center border-b pb-4">
          Manage Your Subscription
        </h1>

        {error && (
          <div className="text-red-600 text-center p-4 bg-red-100 border border-red-200 rounded-md mb-6">
            <p>{error}</p>
          </div>
        )}

        {currentSubscriptionStatus?.type === "admin" ? (
          // Admin View
          <div className="text-center p-6 bg-blue-100 border-l-4 border-blue-500 text-blue-800 rounded-md">
            <p className="text-xl font-semibold">
              You are an Admin. All premium features are active by default.
            </p>
            <p className="mt-2 text-gray-700">
              Subscription management features are not applicable for admin
              accounts directly.
            </p>
          </div>
        ) : currentSubscriptionStatus?.isActive ? (
          // User is currently subscribed
          <div className="text-center p-6 bg-green-100 border-l-4 border-green-500 text-green-800 rounded-md space-y-4">
            <p className="text-2xl font-semibold">
              Your Current Plan:{" "}
              <span className="capitalize">
                {currentSubscriptionStatus.type || "N/A"}
              </span>
            </p>
            <p className="text-lg">
              Status: <span className="font-bold">Active</span>
            </p>
            {currentSubscriptionStatus.daysRemaining !== Infinity && (
              <p className="text-lg">
                Days Remaining:{" "}
                <span className="font-bold">
                  {currentSubscriptionStatus.daysRemaining}
                </span>
              </p>
            )}
            <div className="flex justify-center space-x-4 mt-6">
              {/* Optional: Button to manage billing (e.g., link to Stripe portal) */}
              <button
                // onClick={() => window.open("YOUR_BILLING_PORTAL_URL", "_blank")}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200"
              >
                Manage Billing
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={loading}
                className={`px-6 py-3 border border-red-600 text-red-600 font-semibold rounded-md shadow-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Cancelling..." : "Cancel Subscription"}
              </button>
            </div>
          </div>
        ) : (
          // User is not subscribed or subscription is inactive
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 text-center">
              Choose Your Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-md p-6 flex flex-col"
                >
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {plan.name}
                  </h3>
                  <p className="text-4xl font-extrabold text-blue-600 mb-4">
                    {plan.price}
                  </p>
                  <ul className="text-gray-700 space-y-2 flex-grow">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={
                      loading ||
                      (currentSubscriptionStatus?.isActive &&
                        plan.id === currentSubscriptionStatus?.type)
                    } // Disable if already subscribed to this plan or loading
                    className={`mt-6 w-full py-3 px-6 rounded-md text-white font-semibold shadow-md transition duration-200 ${
                      loading ||
                      (currentSubscriptionStatus?.isActive &&
                        plan.id === currentSubscriptionStatus?.type)
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    }`}
                  >
                    {loading && plan.id === currentSubscriptionStatus?.type
                      ? "Processing..."
                      : currentSubscriptionStatus?.isActive &&
                        plan.id === currentSubscriptionStatus?.type
                      ? "Current Plan"
                      : plan.id === "basic"
                      ? "Get Started"
                      : "Subscribe Now"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;
