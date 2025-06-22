import React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative gradient-bg py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Land Your Dream Job Through
            <span className="text-gradient"> Referrals</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Connect with employees at top companies who can refer you to your
            next opportunity. IntraRefer makes networking and job referrals
            simple, transparent, and effective.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/auth"
              className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:from-primary-700 hover:to-blue-700 transition-all flex items-center justify-center group"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-all">
              Watch Demo
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
