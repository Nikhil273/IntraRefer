import React from "react";

const Header = () => {
  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary-600 to-blue-600 p-2 rounded-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">
                IntraRefer
              </span>
            </div>
            <Link
              to="/auth"
              className="bg-gradient-to-r from-primary-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-primary-700 hover:to-blue-700 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
