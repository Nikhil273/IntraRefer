import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// Page Components
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ReferralsList from './pages/ReferralsList';
import ReferralDetail from './pages/ReferralDetail';
import MyReferrals from './pages/MyReferrals';
import CreateReferral from './pages/CreateReferral';
import Applications from './pages/Applications';
import ReferrerApplications from './pages/ReferrerApplications';
import Subscription from './pages/Subscription';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReferrals from './pages/admin/AdminReferrals';
import AdminPayments from './pages/admin/AdminPayments';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/auth" 
          element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} 
        />

        {/* Protected Routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Common Routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/subscription" element={<Subscription />} />

                  {/* Job Seeker Routes */}
                  <Route path="/referrals" element={
                    <ProtectedRoute allowedRoles={['jobSeeker']}>
                      <ReferralsList />
                    </ProtectedRoute>
                  } />
                  <Route path="/referrals/:id" element={
                    <ProtectedRoute allowedRoles={['jobSeeker']}>
                      <ReferralDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/applications" element={
                    <ProtectedRoute allowedRoles={['jobSeeker']}>
                      <Applications />
                    </ProtectedRoute>
                  } />

                  {/* Referrer Routes */}
                  <Route path="/my-referrals" element={
                    <ProtectedRoute allowedRoles={['referrer']}>
                      <MyReferrals />
                    </ProtectedRoute>
                  } />
                  <Route path="/create-referral" element={
                    <ProtectedRoute allowedRoles={['referrer']}>
                      <CreateReferral />
                    </ProtectedRoute>
                  } />
                  <Route path="/referrer-applications" element={
                    <ProtectedRoute allowedRoles={['referrer']}>
                      <ReferrerApplications />
                    </ProtectedRoute>
                  } />

                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/users" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminUsers />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/referrals" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminReferrals />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/payments" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPayments />
                    </ProtectedRoute>
                  } />

                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;