import {
  lazy,
  Suspense,
} from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

/*
|--------------------------------------------------------------------------
| PUBLIC PAGES
|--------------------------------------------------------------------------
*/

const Login = lazy(
  () => import("../pages/auth/Login"),
);

const Register = lazy(
  () => import("../pages/auth/Register"),
);

const TwoFactorLogin = lazy(
  () => import("../pages/auth/TwoFactorLogin"),
);

const ForgotPassword = lazy(
  () => import("../pages/auth/ForgotPassword"),
);

const ResetPassword = lazy(
  () => import("../pages/auth/ResetPassword"),
);

/*
|--------------------------------------------------------------------------
| PROTECTED PAGES
|--------------------------------------------------------------------------
*/

const Dashboard = lazy(
  () => import("../pages/Dashboard"),
);

const Accounts = lazy(
  () => import("../pages/Accounts"),
);

const Transactions = lazy(
  () => import("../pages/Transactions"),
);

const Transfers = lazy(
  () => import("../pages/Transfers"),
);

const Budgets = lazy(
  () => import("../pages/Budgets"),
);

const Savings = lazy(
  () => import("../pages/Savings"),
);

const Reports = lazy(
  () => import("../pages/Reports"),
);

const FinancialInsights = lazy(
  () => import("../pages/FinancialInsights"),
);

const Notifications = lazy(
  () => import("../pages/Notifications"),
);

const NotificationSettings = lazy(
  () => import("../pages/NotificationSettings"),
);

const Support = lazy(
  () => import("../pages/Support"),
);

const Profile = lazy(
  () => import("../pages/Profile"),
);

const Security = lazy(
  () => import("../pages/Security"),
);

/*
|--------------------------------------------------------------------------
| ROUTE / LAYOUT COMPONENTS
|--------------------------------------------------------------------------
*/

import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../layouts/AppLayout";

/*
|--------------------------------------------------------------------------
| PAGE LOADING FALLBACK
|--------------------------------------------------------------------------
*/

function PageLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f5f8f7",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            border: "3px solid #d7e8e4",
            borderTopColor: "#0d9278",
            animation:
              "router-spin 0.7s linear infinite",
          }}
        />

        <p
          style={{
            margin: 0,
            color: "#7f8a86",
            fontSize: "13px",
          }}
        >
          Loading...
        </p>
      </div>

      <style>
        {`
          @keyframes router-spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
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

          <Route
            element={
              <ProtectedRoute />
            }
          >
            <Route
              element={
                <AppLayout />
              }
            >

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
                path="/notification-settings"
                element={
                  <NotificationSettings />
                }
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
      </Suspense>
    </BrowserRouter>
  );
}