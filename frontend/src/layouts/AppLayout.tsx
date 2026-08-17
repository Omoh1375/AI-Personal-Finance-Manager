import {
  useState,
} from "react";

import {
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  useAuth,
} from "../context/AuthContext";

import {
  getUnreadNotifications,
} from "../api/notifications";

import "./AppLayout.css";

function getInitials(
  name?: string | null,
) {
  if (!name) {
    return "U";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join("");
}

function getPageTitle(
  pathname: string,
) {
  if (pathname === "/dashboard") {
    return "Dashboard";
  }

  if (pathname.startsWith("/accounts")) {
    return "Accounts";
  }

  if (
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/income") ||
    pathname.startsWith("/expenses") ||
    pathname.startsWith("/transfers")
  ) {
    return "Transactions";
  }

  if (
    pathname.startsWith("/budgets") ||
    pathname.startsWith("/savings")
  ) {
    return "Planning";
  }

  if (
    pathname.startsWith(
      "/financial-insights",
    ) ||
    pathname.startsWith("/notifications")
  ) {
    return "Insights";
  }

  if (
    pathname.startsWith("/reports") ||
    pathname.startsWith("/statements")
  ) {
    return "Reports";
  }

  return "AI Personal Finance Manager";
}

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1"
      />

      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1"
      />

      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1"
      />

      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1"
      />
    </svg>
  );
}

function AccountsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M3 10h18" />
      <path d="M5 10v8M9 10v8M15 10v8M19 10v8" />
      <path d="M3 18h18" />
      <path d="m12 4 9 5H3l9-5Z" />
    </svg>
  );
}

function TransactionsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M6 7h12" />
      <path d="m14 4 3 3-3 3" />
      <path d="M18 17H6" />
      <path d="m10 14-3 3 3 3" />
    </svg>
  );
}

function PlanningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="2"
      />

      <path d="M8 9h8M8 13h5M8 17h3" />
    </svg>
  );
}

function InsightsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 3v4" />
      <path d="m5.6 5.6 2.8 2.8" />
      <path d="M3 12h4" />
      <path d="m5.6 18.4 2.8-2.8" />
      <path d="M12 21v-4" />
      <path d="m18.4 18.4-2.8-2.8" />
      <path d="M21 12h-4" />
      <path d="m18.4 5.6-2.8 2.8" />
      <circle
        cx="12"
        cy="12"
        r="3"
      />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M5 20V10" />
      <path d="M12 20V4" />
      <path d="M19 20v-7" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M10 4H5v16h5" />
      <path d="M14 8l4 4-4 4" />
      <path d="M18 12H9" />
    </svg>
  );
}

export default function AppLayout() {
  const {
    user,
    logout,
  } = useAuth();

  const location = useLocation();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [collapsed, setCollapsed] =
    useState(false);

  const {
    data: unreadNotifications = [],
  } = useQuery({
    queryKey: [
      "notifications",
      "unread",
    ],
    queryFn:
      getUnreadNotifications,
    staleTime: 30_000,
  });

  const pageTitle =
    getPageTitle(
      location.pathname,
    );

  const unreadCount =
    unreadNotifications.length;

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const navClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `app-nav-link ${
      isActive ? "active" : ""
    }`;

  return (
    <div
      className={`app-shell ${
        collapsed
          ? "sidebar-collapsed"
          : ""
      } ${
        mobileOpen
          ? "mobile-sidebar-open"
          : ""
      }`}
    >
      {/* Mobile overlay */}
      <button
        className="sidebar-overlay"
        aria-label="Close navigation"
        onClick={
          closeMobileMenu
        }
      />

      {/* ================================================================
          SIDEBAR
      ================================================================= */}

      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <NavLink
            to="/dashboard"
            className="brand-link"
            onClick={
              closeMobileMenu
            }
          >
            <span className="brand-mark">
              <span />
              <span />
              <span />
            </span>

            <span className="brand-copy">
              <strong>
                AI Finance
              </strong>

              <small>
                Personal Manager
              </small>
            </span>
          </NavLink>

          <button
            className="mobile-close-sidebar"
            onClick={
              closeMobileMenu
            }
            aria-label="Close navigation"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {getInitials(
              user?.name,
            )}
          </div>

          <div className="sidebar-user-info">
            <strong>
              {user?.name ??
                "User"}
            </strong>

            <span>
              {user?.email ??
                "Personal account"}
            </span>
          </div>
        </div>

        <nav className="app-navigation">
          <div className="navigation-label">
            Workspace
          </div>

          <NavLink
            to="/dashboard"
            className={navClass}
            onClick={
              closeMobileMenu
            }
          >
            <span className="nav-icon">
              <DashboardIcon />
            </span>

            <span className="nav-text">
              Dashboard
            </span>
          </NavLink>

          <NavLink
            to="/accounts"
            className={navClass}
            onClick={
              closeMobileMenu
            }
          >
            <span className="nav-icon">
              <AccountsIcon />
            </span>

            <span className="nav-text">
              Accounts
            </span>
          </NavLink>

          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              `app-nav-link ${
                isActive ||
                location.pathname ===
                  "/income" ||
                location.pathname ===
                  "/expenses" ||
                location.pathname ===
                  "/transfers"
                  ? "active"
                  : ""
              }`
            }
            onClick={
              closeMobileMenu
            }
          >
            <span className="nav-icon">
              <TransactionsIcon />
            </span>

            <span className="nav-text">
              Transactions
            </span>

            <span className="nav-chevron">
              <ChevronIcon />
            </span>
          </NavLink>

          {location.pathname.startsWith(
            "/transactions",
          ) && (
            <div className="nav-submenu">
              <NavLink to="/transactions">
                All transactions
              </NavLink>

              <NavLink to="/income">
                Income
              </NavLink>

              <NavLink to="/expenses">
                Expenses
              </NavLink>

              <NavLink to="/transfers">
                Transfers
              </NavLink>
            </div>
          )}

          <div className="navigation-label planning-label">
            Planning
          </div>

          <NavLink
            to="/budgets"
            className={navClass}
            onClick={
              closeMobileMenu
            }
          >
            <span className="nav-icon">
              <PlanningIcon />
            </span>

            <span className="nav-text">
              Budgets
            </span>
          </NavLink>

          <NavLink
            to="/savings"
            className={navClass}
            onClick={
              closeMobileMenu
            }
          >
            <span className="nav-icon savings-nav-icon">
              ◎
            </span>

            <span className="nav-text">
              Savings Goals
            </span>
          </NavLink>

          <div className="navigation-label planning-label">
            Intelligence
          </div>

          <NavLink
            to="/financial-insights"
            className={navClass}
            onClick={
              closeMobileMenu
            }
          >
            <span className="nav-icon">
              <InsightsIcon />
            </span>

            <span className="nav-text">
              Financial Insights
            </span>
          </NavLink>

          <NavLink
            to="/notifications"
            className={navClass}
            onClick={
              closeMobileMenu
            }
          >
            <span className="nav-icon">
              <BellIcon />
            </span>

            <span className="nav-text">
              Notifications
            </span>

            {unreadCount >
              0 && (
              <span className="notification-badge">
                {unreadCount >
                99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </NavLink>

          <div className="navigation-label planning-label">
            Reports
          </div>

          <NavLink
            to="/reports"
            className={navClass}
            onClick={
              closeMobileMenu
            }
          >
            <span className="nav-icon">
              <ReportsIcon />
            </span>

            <span className="nav-text">
              Reports & Statements
            </span>
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-security">
            <span className="security-dot" />

            <div>
              <strong>
                Secure workspace
              </strong>

              <small>
                Your finance data is protected
              </small>
            </div>
          </div>

          <button
            className="sidebar-logout"
            onClick={
              handleLogout
            }
          >
            <span className="nav-icon">
              <LogoutIcon />
            </span>

            <span className="nav-text">
              Sign out
            </span>
          </button>
        </div>
      </aside>

      {/* ================================================================
          MAIN AREA
      ================================================================= */}

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              onClick={() =>
                setMobileOpen(
                  true,
                )
              }
              aria-label="Open navigation"
            >
              <MenuIcon />
            </button>

            <div className="topbar-page-title">
              <span>
                Personal Finance
              </span>

              <strong>
                {pageTitle}
              </strong>
            </div>
          </div>

          <div className="topbar-right">
            <NavLink
              to="/notifications"
              className="topbar-icon-button"
              aria-label="Notifications"
            >
              <BellIcon />

              {unreadCount >
                0 && (
                <span className="topbar-notification-dot">
                  {unreadCount >
                  99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/financial-insights"
              className="topbar-insight-link"
            >
              <InsightsIcon />

              <span>
                Insights
              </span>
            </NavLink>

            <div className="topbar-divider" />

            <div className="topbar-user">
              <div className="topbar-avatar">
                {getInitials(
                  user?.name,
                )}
              </div>

              <div className="topbar-user-copy">
                <strong>
                  {user?.name ??
                    "User"}
                </strong>

                <span>
                  Personal account
                </span>
              </div>
            </div>

            <button
              className="sidebar-collapse-button"
              onClick={() =>
                setCollapsed(
                  (value) =>
                    !value,
                )
              }
              aria-label={
                collapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
            >
              <ChevronIcon />
            </button>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}