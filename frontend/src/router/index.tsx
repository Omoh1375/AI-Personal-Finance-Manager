import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import TwoFactorLogin from "../pages/auth/TwoFactorLogin";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Dashboard from "../pages/Dashboard";
import Accounts from "../pages/Accounts";
import Transactions from "../pages/Transactions";
import Transfers from "../pages/Transfers";
import Budgets from "../pages/Budgets";
import Savings from "../pages/Savings";
import Reports from "../pages/Reports";
import FinancialInsights from "../pages/FinancialInsights";
import Notifications from "../pages/Notifications";
import Profile from "../pages/Profile";
import Security from "../pages/Security";

import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../layouts/AppLayout";
import Support from "../pages/Support";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ============================================================
            PUBLIC ROUTES
        ============================================================ */}

        <Route
          path="/login"
          element={<Login />}
        />
       <Route
          path="/login/2fa"
          element={<TwoFactorLogin />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* ============================================================
            PROTECTED ROUTES
        ============================================================ */}

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/accounts"
              element={<Accounts />}
            />

            <Route
              path="/transactions"
              element={<Transactions />}
            />

            <Route
              path="/income"
              element={<Transactions />}
            />

            <Route
              path="/expenses"
              element={<Transactions />}
            />

            <Route
              path="/transfers"
              element={<Transfers />}
            />

            <Route
              path="/budgets"
              element={<Budgets />}
            />

            <Route
              path="/savings"
              element={<Savings />}
            />

            <Route
              path="/savings-goals"
              element={<Savings />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />

            <Route
              path="/financial-insights"
              element={<FinancialInsights />}
            />

            <Route
              path="/notifications"
              element={<Notifications />}
            />

            <Route
              path="/support"
              element={<Support />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="/security"
              element={<Security />}
            />
          </Route>
        </Route>

        {/* ============================================================
            ROOT
        ============================================================ */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* ============================================================
            FALLBACK
        ============================================================ */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}