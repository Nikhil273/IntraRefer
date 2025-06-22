import { CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

const pricingFeatures = [
  "Up to 3 applications per week",
  "Basic profile features",
  "Standard support",
  "Access to all referrals",
];

const premiumFeatures = [
  "Unlimited applications",
  "Verified badge on profile",
  "AI-powered job matching",
  "Resume analyzer",
  "Higher visibility to referrers",
  "Priority customer support",
  "Advanced analytics",
  "Early access to new features",
];

const Pricing = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Start for free, upgrade when you need more features
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-white border-2 border-gray-200 rounded-2xl p-8"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">₹0</div>
              <p className="text-gray-600">Perfect for getting started</p>
            </div>

            <ul className="space-y-4 mb-8">
              {pricingFeatures.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/auth"
              className="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center block"
            >
              Get Started Free
            </Link>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-primary-50 to-blue-50 border-2 border-primary-200 rounded-2xl p-8 relative"
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">₹99</div>
              <p className="text-gray-600">per month</p>
            </div>

            <ul className="space-y-4 mb-8">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/auth"
              className="w-full bg-gradient-to-r from-primary-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-primary-700 hover:to-blue-700 transition-all text-center block"
            >
              Start Premium Trial
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
