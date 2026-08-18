import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";

import Dashboard from "../pages/Dashboard";
import Accounts from "../pages/Accounts";
import Transactions from "../pages/Transactions";
import Transfers from "../pages/Transfers";
import Budgets from "../pages/Budgets";
import Savings from "../pages/Savings";
import Reports from "../pages/Reports";
import FinancialInsights from "../pages/FinancialInsights";
import Notifications from "../pages/Notifications";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../layouts/AppLayout";
import Profile from "../pages/Profile";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ============================================================
            PUBLIC ROUTES
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

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ============================================================
            PROTECTED APPLICATION
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
              element={
                <Dashboard />
              }
            />

            <Route
              path="/accounts"
              element={
                <Accounts />
              }
            />

            <Route
              path="/transactions"
              element={
                <Transactions />
              }
            />

            <Route
              path="/income"
              element={
                <Transactions />
              }
            />

            <Route
              path="/expenses"
              element={
                <Transactions />
              }
            />

            <Route
              path="/transfers"
              element={
                <Transfers />
              }
            />

            <Route
              path="/budgets"
              element={
                <Budgets />
              }
            />

            <Route
              path="/savings"
              element={
                <Savings />
              }
            />

            <Route
              path="/savings-goals"
              element={
                <Savings />
              }
            />

            <Route
              path="/reports"
              element={
                <Reports />
              }
            />

            <Route
              path="/statements"
              element={
                <Reports />
              }
            />

            <Route
              path="/financial-insights"
              element={
                <FinancialInsights />
              }
            />

            <Route
              path="/notifications"
              element={
                <Notifications />
              }
            />
          </Route>
        </Route>

        {/* ============================================================
            FALLBACK
        ============================================================ */}
          <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />
        </Route>
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