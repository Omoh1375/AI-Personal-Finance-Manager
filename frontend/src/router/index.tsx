import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import Accounts from "../pages/Accounts";
import Transactions from "../pages/Transactions";
import Transfers from "../pages/Transfers";
import Budgets from "../pages/Budgets";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
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
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
        </Route>

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