import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import MainLayout from './layouts/MainLayout';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PharmacistDashboard from './pages/PharmacistDashboard';
import InventoryBatchCreatePage from './pages/InventoryBatchCreatePage';
import AdminDashboard from './pages/AdminDashboard';
import UploadPrescriptionPage from './pages/UploadPrescriptionPage';
import UserProfilePage from './pages/UserProfilePage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import PrescriptionReviewPage from './pages/PrescriptionReviewPage';
import HospitalRegistrationPage from './pages/HospitalRegistrationPage';
import HospitalDashboardPage from './pages/HospitalDashboardPage';
import DoctorLoginPage from './pages/DoctorLoginPage';
import DoctorInviteRegisterPage from './pages/DoctorInviteRegisterPage';
import EPrescriptionPage from './pages/EPrescriptionPage';
import MedicalVerificationDashboardPage from './pages/MedicalVerificationDashboardPage';
import LoadingSpinner from './components/LoadingSpinner';
import { isDevBypassAllowAllRoles } from './config/devBuilderMode';
import LoadingPage from './pages/LoadingPage';

import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Create placeholders for other pages to avoid errors until they are built
const PlaceholderInfo = ({ title }) => (
  <div className="container mx-auto px-4 py-20 text-center">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
    <p className="text-gray-600">This page is currently under construction.</p>
  </div>
);

const ProtectedRoute = ({ roles, children }) => {
  const { isAuthenticated, hasAnyRole } = useAuth();

  if (isDevBypassAllowAllRoles()) {
    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles?.length > 0 && !hasAnyRole(roles)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/loading" element={<LoadingPage />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailsPage />} />
          <Route
            path="cart"
            element={<ProtectedRoute roles={['customer']}><CartPage /></ProtectedRoute>}
          />
          <Route
            path="checkout"
            element={<ProtectedRoute roles={['customer']}><CheckoutPage /></ProtectedRoute>}
          />
          <Route
            path="payment-success"
            element={<ProtectedRoute roles={['customer']}><PaymentSuccessPage /></ProtectedRoute>}
          />
          <Route
            path="profile"
            element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>}
          />
          <Route
            path="orders"
            element={<ProtectedRoute roles={['customer']}><OrderTrackingPage /></ProtectedRoute>}
          />
          <Route
            path="upload-prescription"
            element={<ProtectedRoute roles={['customer']}><UploadPrescriptionPage /></ProtectedRoute>}
          />

          <Route
            path="pharmacist/dashboard"
            element={<ProtectedRoute roles={['pharmacy', 'pharmacist']}><PharmacistDashboard /></ProtectedRoute>}
          />
          <Route
            path="pharmacist/prescription-review"
            element={<ProtectedRoute roles={['pharmacy', 'pharmacist']}><PrescriptionReviewPage /></ProtectedRoute>}
          />
          <Route
            path="pharmacist/inventory/batch/new"
            element={<ProtectedRoute roles={['pharmacy', 'pharmacist']}><InventoryBatchCreatePage /></ProtectedRoute>}
          />

          <Route path="hospital/register" element={<HospitalRegistrationPage />} />
          <Route
            path="hospital/dashboard"
            element={<ProtectedRoute roles={['hospital']}><HospitalDashboardPage /></ProtectedRoute>}
          />

          <Route path="doctor/login" element={<DoctorLoginPage />} />
          <Route path="register/doctor" element={<DoctorInviteRegisterPage />} />
          <Route path="register/doctor/:token" element={<DoctorInviteRegisterPage />} />
          <Route
            path="doctor/prescriptions/new"
            element={<ProtectedRoute roles={['doctor']}><EPrescriptionPage /></ProtectedRoute>}
          />

          <Route
            path="admin/dashboard"
            element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>}
          />
          <Route
            path="admin/medical-verification"
            element={<ProtectedRoute roles={['admin']}><MedicalVerificationDashboardPage /></ProtectedRoute>}
          />

          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="register/:token" element={<RegisterPage />} />
          <Route path="register/invite/:token" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<PlaceholderInfo title="404 - Page Not Found" />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
