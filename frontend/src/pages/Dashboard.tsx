import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getDashboard } from "../api/dashboard";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

function formatMoney(value: number | string, currency = "NGN") {
  const amount =
    typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function formatAccountType(type: string) {
  return type
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function AccountIcon({ type }: { type: string }) {
  if (type === "bank") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 10h18" />
        <path d="M5 10v8M9 10v8M15 10v8M19 10v8" />
        <path d="M3 18h18" />
        <path d="m12 4 9 5H3l9-5Z" />
      </svg>
    );
  }

  if (type === "mobile_wallet") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 17h6" />
        <path d="M10 7h4" />
      </svg>
    );
  }

  if (type === "credit_card") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
        <path d="M7 15h4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8h16" />
      <path d="M6 8V6h12v2" />
      <path d="M5 8v10h14V8" />
      <path d="M8 11v4M12 11v4M16 11v4" />
    </svg>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  if (isLoading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <p>Loading your financial dashboard...</p>
        </div>
      </main>
    );
  }

  if (isError || !data?.success) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-error">
          <h2>We couldn't load your dashboard</h2>
          <p>
            Please check your connection and try again.
          </p>

          <button onClick={() => refetch()}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  const dashboard = data.data;

  const firstCurrency =
    dashboard.accounts?.[0]?.currency || "NGN";

  const monthlyNet =
    Number(dashboard.monthly_income || 0) -
    Number(dashboard.monthly_expenses || 0);

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">
            PERSONAL FINANCE
          </p>

          <h1>Good day, {user?.name?.split(" ")[0]} 👋</h1>

          <p className="dashboard-subtitle">
            Here's your financial picture at a glance.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <Link
            to="/income"
            className="header-action secondary"
          >
            + Income
          </Link>

          <Link
            to="/expenses"
            className="header-action primary"
          >
            + Expense
          </Link>

          <button
            className="profile-button"
            onClick={logout}
            title="Sign out"
          >
            {user?.name?.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <section className="dashboard-summary">
        <article className="balance-card">
          <div className="balance-card-top">
            <span>Total balance</span>

            <span className="balance-badge">
              All accounts
            </span>
          </div>

          <strong>
            {formatMoney(
              dashboard.total_balance,
              firstCurrency,
            )}
          </strong>

          <div className="balance-footer">
            <span>
              Monthly net
            </span>

            <span
              className={
                monthlyNet >= 0
                  ? "positive"
                  : "negative"
              }
            >
              {monthlyNet >= 0 ? "+" : ""}
              {formatMoney(
                monthlyNet,
                firstCurrency,
              )}
            </span>
          </div>
        </article>

        <article className="metric-card income">
          <div className="metric-icon">
            ↑
          </div>

          <div>
            <span>Monthly income</span>

            <strong>
              {formatMoney(
                dashboard.monthly_income,
                firstCurrency,
              )}
            </strong>

            <small>
              Total:{" "}
              {formatMoney(
                dashboard.total_income,
                firstCurrency,
              )}
            </small>
          </div>
        </article>

        <article className="metric-card expense">
          <div className="metric-icon">
            ↓
          </div>

          <div>
            <span>Monthly expenses</span>

            <strong>
              {formatMoney(
                dashboard.monthly_expenses,
                firstCurrency,
              )}
            </strong>

            <small>
              Total:{" "}
              {formatMoney(
                dashboard.total_expenses,
                firstCurrency,
              )}
            </small>
          </div>
        </article>
      </section>

      <section className="dashboard-content">
        <div className="accounts-section">
          <div className="section-heading">
            <div>
              <h2>Your accounts</h2>
              <p>
                Your current account balances
              </p>
            </div>

            <Link to="/accounts">
              View all
            </Link>
          </div>

          {dashboard.accounts.length === 0 ? (
            <div className="empty-state">
              <div>◎</div>
              <h3>No accounts yet</h3>
              <p>
                Add your first account to start tracking
                your finances.
              </p>

              <Link to="/accounts">
                Add account
              </Link>
            </div>
          ) : (
            <div className="accounts-grid">
              {dashboard.accounts.map((account) => (
                <article
                  className="account-card"
                  key={account.id}
                >
                  <div className="account-top">
                    <div
                      className="account-icon"
                      style={{
                        backgroundColor:
                          account.color
                            ? `${account.color}18`
                            : "#eef7f5",
                        color:
                          account.color || "#07977c",
                      }}
                    >
                      <AccountIcon
                        type={account.type}
                      />
                    </div>

                    {account.is_default && (
                      <span className="default-label">
                        Default
                      </span>
                    )}
                  </div>

                  <p>
                    {account.name}
                  </p>

                  <small>
                    {formatAccountType(
                      account.type,
                    )}
                  </small>

                  <strong>
                    {formatMoney(
                      account.balance,
                      account.currency ||
                        firstCurrency,
                    )}
                  </strong>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="dashboard-side">
          <div className="quick-card">
            <div className="section-heading compact">
              <div>
                <h2>Quick actions</h2>
                <p>
                  Manage your finances
                </p>
              </div>
            </div>

            <div className="quick-actions">
              <Link to="/income">
                <span className="quick-action-icon income-icon">
                  ↑
                </span>
                <span>
                  <strong>Add income</strong>
                  <small>
                    Record money received
                  </small>
                </span>
              </Link>

              <Link to="/expenses">
                <span className="quick-action-icon expense-icon">
                  ↓
                </span>
                <span>
                  <strong>Add expense</strong>
                  <small>
                    Record money spent
                  </small>
                </span>
              </Link>

              <Link to="/transfers">
                <span className="quick-action-icon transfer-icon">
                  ↔
                </span>
                <span>
                  <strong>Transfer money</strong>
                  <small>
                    Move money between accounts
                  </small>
                </span>
              </Link>

              <Link to="/budgets">
                <span className="quick-action-icon budget-icon">
                  ◫
                </span>
                <span>
                  <strong>Manage budget</strong>
                  <small>
                    Stay on top of spending
                  </small>
                </span>
              </Link>
            </div>
          </div>

          <div className="insight-card">
            <span className="insight-kicker">
              FINANCIAL INSIGHT
            </span>

            <h3>
              Build better money habits.
            </h3>

            <p>
              Use your dashboard, budgets and savings
              goals to stay intentional with your money.
            </p>

            <Link to="/financial-insights">
              View insights →
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}