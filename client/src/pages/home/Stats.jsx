import { Briefcase, Building, CheckCircle, Users } from "lucide-react";
import { motion } from "motion/react";

const stats = [
  { label: "Active Referrals", value: "2,500+", icon: Briefcase },
  { label: "Success Stories", value: "1,200+", icon: CheckCircle },
  { label: "Partner Companies", value: "150+", icon: Building },
  { label: "Job Seekers", value: "10,000+", icon: Users },
];

const Stats = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="bg-gradient-to-r from-primary-100 to-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <stat.icon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
