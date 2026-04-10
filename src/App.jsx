import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PharmacistDashboard from './pages/PharmacistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UploadPrescriptionPage from './pages/UploadPrescriptionPage';
import UserProfilePage from './pages/UserProfilePage';
import LoadingSpinner from './components/LoadingSpinner';

import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Create placeholders for other pages to avoid errors until they are built
const PlaceholderInfo = ({ title }) => (
  <div className="container mx-auto px-4 py-20 text-center">
    <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
    <p className="text-gray-600">This page is currently under construction.</p>
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailsPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="payment-success" element={<PaymentSuccessPage />} />
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="pharmacist/dashboard" element={<PharmacistDashboard />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="upload-prescription" element={<UploadPrescriptionPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<PlaceholderInfo title="404 - Page Not Found" />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
