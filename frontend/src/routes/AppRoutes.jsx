import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { ErrorBoundary } from "react-error-boundary";

// Lazy-loaded pages
const Home = lazy(() => import("../pages/Home"));
const About = lazy(() => import("../pages/About"));
const ThankYouPage = lazy(() => import("../pages/ThankYouPage"));
const Login = lazy(() => import("../features/auth/Login"));
const Register = lazy(() => import("../features/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../features/auth/ResetPassword"));

// Farmer routes
const FarmerDashboard = lazy(() =>
  import("../features/farmer/FarmerDashboard")
);
const OverviewPage = lazy(() => import("../features/farmer/OverviewPage"));
const FarmerProfileForm = lazy(() =>
  import("../features/profile/FarmerProfileForm")
);
const CropAdvisor = lazy(() => import("../features/farmer/CropAdvisor"));
const WeatherForecast = lazy(() =>
  import("../features/farmer/WeatherForecast")
);
const SensorMonitor = lazy(() => import("../features/farmer/SensorMonitor"));
const YieldChart = lazy(() => import("../features/farmer/YieldChart"));
const ChatBot = lazy(() => import("../features/ai-assistant/ChatBot"));

// Staff/Admin
const StaffDashboard = lazy(() => import("../features/staff/StaffDashboard"));
const AdminDashboard = lazy(() => import("../features/admin/AdminDashboard"));

const ErrorFallback = () => (
  <div className="p-6 text-center text-red-700">
    ⚠️ Something went wrong loading this page. Please try again or refresh.
  </div>
);

const AppRoutes = () => (
  <Suspense
    fallback={<div className="p-8 text-green-800 text-center">Loading...</div>}
  >
    <Routes>
      {/* 🌐 Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/assistant" element={<ChatBot />} />
      <Route path="/thank-you" element={<ThankYouPage />} />

      {/* 🌿 Farmer Routes */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute allowedRoles={["FARMER"]}>
            <ErrorBoundary fallback={<ErrorFallback />}>
              <FarmerProfileForm />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["FARMER"]}>
            <ErrorBoundary fallback={<ErrorFallback />}>
              <FarmerDashboard />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="crop-advisor" element={<CropAdvisor />} />
        <Route path="weather" element={<WeatherForecast />} />
        <Route path="sensor-data" element={<SensorMonitor />} />
        <Route path="yield-history" element={<YieldChart />} />
        <Route path="ai-assistant" element={<ChatBot />} />
      </Route>

      {/* 🧑‍💼 Staff Routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={["STAFF"]}>
            <ErrorBoundary fallback={<ErrorFallback />}>
              <StaffDashboard />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />

      {/* 🛡️ Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <ErrorBoundary fallback={<ErrorFallback />}>
              <AdminDashboard />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />

      {/* ❌ 404 Fallback */}
      <Route
        path="*"
        element={
          <div className="p-10 text-center text-red-700 font-semibold">
            404 - Page not found
          </div>
        }
      />
    </Routes>
  </Suspense>
);

export default AppRoutes;
