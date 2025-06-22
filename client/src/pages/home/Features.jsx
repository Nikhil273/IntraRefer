import { Award, Shield, Target, TrendingUp, Users, Zap } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Target,
    title: "Smart Matching",
    description:
      "AI-powered algorithm matches job seekers with the most relevant referral opportunities based on skills and experience.",
  },
  {
    icon: Users,
    title: "Verified Referrers",
    description:
      "Connect with verified employees from top companies who are actively helping candidates get hired.",
  },
  {
    icon: TrendingUp,
    title: "Higher Success Rate",
    description:
      "Referrals have 5x higher success rate compared to traditional job applications. Leverage your network effectively.",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description:
      "Your data is protected with enterprise-grade security. All transactions are encrypted and secure.",
  },
  {
    icon: Zap,
    title: "Instant Notifications",
    description:
      "Get real-time updates on your applications and never miss an opportunity with our instant notification system.",
  },
  {
    icon: Award,
    title: "Premium Features",
    description:
      "Unlock unlimited applications, AI matching, and priority support with our affordable premium subscription.",
  },
];

const Features = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose IntraRefer?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform is designed to make job referrals more accessible,
            efficient, and successful for everyone involved.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-gradient-to-r from-primary-100 to-blue-100 p-3 rounded-full w-16 h-16 mb-6 flex items-center justify-center">
                <feature.icon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
