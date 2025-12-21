import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/landing';
import LoginPage from './pages/auth/login';
import RegisterPage from './pages/auth/register';
import VerifyOTPPage from './pages/auth/verify-otp';
import ProtectedRoute from './components/common/ProtectedRoute';
import { ToastProvider } from './components/ui/use-toast';
import KYCLayout from './pages/kyc/layout';
import Step1Personal from './pages/kyc/steps/Step1Personal';
import Step2NICUpload from './pages/kyc/steps/Step2NICUpload';
import Step3BankDetails from './pages/kyc/steps/Step3BankDetails';
import Step4BankBook from './pages/kyc/steps/Step4BankBook';
import Step5BillingProof from './pages/kyc/steps/Step5BillingProof';
import Step6Employment from './pages/kyc/steps/Step6Employment';
import Step7Nominee from './pages/kyc/steps/Step7Nominee';
import Step8VideoKYC from './pages/kyc/steps/Step8VideoKYC';
import Step9Declaration from './pages/kyc/steps/Step9Declaration';
import DashboardPage from './pages/dashboard/index';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/dashboard';
import AdminUserList from './pages/admin/users/list';
import AdminKYCList from './pages/admin/kyc/list';
import AdminKYCReview from './pages/admin/kyc/review';
import AdminFundList from './pages/admin/funds/list';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />

          {/* Protected Routes (Placeholder) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/kyc" element={<KYCLayout />}>
              <Route path="personal" element={<Step1Personal />} />
              <Route path="nic" element={<Step2NICUpload />} />
              <Route path="bank" element={<Step3BankDetails />} />
              <Route path="bank-book" element={<Step4BankBook />} />
              <Route path="billing" element={<Step5BillingProof />} />
              <Route path="employment" element={<Step6Employment />} />
              <Route path="nominee" element={<Step7Nominee />} />
              <Route path="video" element={<Step8VideoKYC />} />
              <Route path="declaration" element={<Step9Declaration />} />
              <Route index element={<Navigate to="personal" replace />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUserList />} />
              <Route path="kyc" element={<AdminKYCList />} />
              <Route path="kyc/:id" element={<AdminKYCReview />} />
              <Route path="funds" element={<AdminFundList />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
