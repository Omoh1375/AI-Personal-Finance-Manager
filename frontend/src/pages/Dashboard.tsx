import {
  useMemo,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { Link } from "react-router-dom";

import { getDashboard } from "../api/dashboard";
import { getAccounts } from "../api/accounts";
import {
  createSavingsDeposit,
  getSavingsGoals,
} from "../api/savings";
import { getBudgets } from "../api/budgets";

import { useAuth } from "../context/AuthContext";

import type { SavingsDepositPayload } from "../types/savings";

import "./Dashboard.css";

function formatMoney(
  value: number | string,
  currency = "NGN",
) {
  const amount =
    typeof value === "string"
      ? Number(value)
      : value;

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatAccountType(type: string) {
  return type
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function getToday() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function AccountIcon({
  type,
}: {
  type: string;
}) {
  if (type === "bank") {
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

  if (type === "mobile_wallet") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <rect
          x="5"
          y="3"
          width="14"
          height="18"
          rx="2"
        />
        <path d="M9 17h6" />
        <path d="M10 7h4" />
      </svg>
    );
  }

  if (type === "credit_card") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
        />
        <path d="M3 10h18" />
        <path d="M7 15h4" />
      </svg>
    );
  }

  if (type === "crypto") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M10 7v10M14 7v10" />
        <path d="M8 9h5a2 2 0 0 1 0 4H8m0 0h6a2 2 0 0 1 0 4H8" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M4 8h16" />
      <path d="M6 8V6h12v2" />
      <path d="M5 8v10h14V8" />
      <path d="M8 11v4M12 11v4M16 11v4" />
    </svg>
  );
}

function TransactionIcon({
  type,
}: {
  type: string;
}) {
  if (type === "expense") {
    return (
      <span className="activity-icon expense">
        ↓
      </span>
    );
  }

  if (type === "transfer") {
    return (
      <span className="activity-icon transfer">
        ↔
      </span>
    );
  }

  return (
    <span className="activity-icon income">
      ↑
    </span>
  );
}

export default function Dashboard() {
  const {
    user,
    logout,
  } = useAuth();

  const queryClient =
    useQueryClient();

  const [
    showDepositModal,
    setShowDepositModal,
  ] = useState(false);

  const [
    depositError,
    setDepositError,
  ] = useState("");

  const [
    depositForm,
    setDepositForm,
  ] =
    useState<SavingsDepositPayload>({
      savings_goal_id: 0,
      account_id: 0,
      amount: 0,
      reference: "",
      description: "",
      deposited_at: getToday(),
    });

  /*
  |--------------------------------------------------------------------------
  | Dashboard
  |--------------------------------------------------------------------------
  */

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  /*
  |--------------------------------------------------------------------------
  | Accounts
  |--------------------------------------------------------------------------
  |
  | This is the source of truth for the Dashboard balance.
  |
  */

  const {
    data: accounts = [],
    isLoading: accountsLoading,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  /*
  |--------------------------------------------------------------------------
  | Savings
  |--------------------------------------------------------------------------
  */

  const {
    data: savingsGoals = [],
  } = useQuery({
    queryKey: ["savings-goals"],
    queryFn: getSavingsGoals,
  });

  /*
  |--------------------------------------------------------------------------
  | Budgets
  |--------------------------------------------------------------------------
  */

  const {
    data: budgets = [],
  } = useQuery({
    queryKey: ["budgets"],
    queryFn: getBudgets,
  });

  /*
  |--------------------------------------------------------------------------
  | Savings Deposit Mutation
  |--------------------------------------------------------------------------
  */

  const depositMutation =
    useMutation({
      mutationFn:
        createSavingsDeposit,

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        });

        queryClient.invalidateQueries({
          queryKey: ["accounts"],
        });

        queryClient.invalidateQueries({
          queryKey: ["savings-goals"],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "savings-deposits",
          ],
        });

        closeDepositModal();
      },

      onError: (error: any) => {
        const errors =
          error?.response?.data
            ?.errors;

        const firstError =
          errors
            ? Object.values(errors)
                .flat()
                .find(Boolean)
            : null;

        setDepositError(
          typeof firstError === "string"
            ? firstError
            : error?.response?.data
                ?.message ??
                "Unable to make this deposit.",
        );
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Deposit Modal
  |--------------------------------------------------------------------------
  */

  const openDepositModal = () => {
    setDepositError("");

    setDepositForm({
      savings_goal_id:
        savingsGoals[0]?.id ?? 0,

      account_id:
        accounts[0]?.id ?? 0,

      amount: 0,
      reference: "",
      description: "",
      deposited_at: getToday(),
    });

    setShowDepositModal(true);
  };

  const closeDepositModal = () => {
    setShowDepositModal(false);
    setDepositError("");
  };

  const selectedDepositAccount =
    accounts.find(
      (account) =>
        account.id ===
        Number(
          depositForm.account_id,
        ),
    );

  const selectedSavingsGoal =
    savingsGoals.find(
      (goal) =>
        goal.id ===
        Number(
          depositForm.savings_goal_id,
        ),
    );

  const handleDeposit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setDepositError("");

    if (
      !depositForm.savings_goal_id
    ) {
      setDepositError(
        "Please select a savings goal.",
      );

      return;
    }

    if (!depositForm.account_id) {
      setDepositError(
        "Please select a source account.",
      );

      return;
    }

    if (
      !depositForm.amount ||
      Number(depositForm.amount) <= 0
    ) {
      setDepositError(
        "Enter a valid deposit amount.",
      );

      return;
    }

    if (
      selectedDepositAccount &&
      Number(
        selectedDepositAccount.balance,
      ) <
        Number(
          depositForm.amount,
        )
    ) {
      setDepositError(
        "Insufficient account balance.",
      );

      return;
    }

    depositMutation.mutate({
      ...depositForm,

      amount: Number(
        depositForm.amount,
      ),

      reference:
        depositForm.reference
          ?.trim() || undefined,

      description:
        depositForm.description
          ?.trim() || undefined,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (isLoading || accountsLoading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner" />

          <p>
            Loading your financial dashboard...
          </p>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (
    isError ||
    !data?.success
  ) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-error">
          <h2>
            We couldn't load your dashboard
          </h2>

          <p>
            Please check your connection and try again.
          </p>

          <button
            onClick={() => refetch()}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const dashboard = data.data;

  /*
  |--------------------------------------------------------------------------
  | IMPORTANT:
  | Calculate the total balance from the actual accounts endpoint.
  |--------------------------------------------------------------------------
  */

  const totalBalance =
    accounts.reduce(
      (total, account) =>
        total +
        Number(account.balance || 0),
      0,
    );

  /*
  |--------------------------------------------------------------------------
  | Currency
  |--------------------------------------------------------------------------
  */

  const firstCurrency =
    accounts[0]?.currency ||
    "NGN";

  /*
  |--------------------------------------------------------------------------
  | Monthly Metrics
  |--------------------------------------------------------------------------
  */

  const monthlyIncome =
    Number(
      dashboard.monthly_income || 0,
    );

  const monthlyExpenses =
    Number(
      dashboard.monthly_expenses || 0,
    );

  const monthlyNet =
    monthlyIncome -
    monthlyExpenses;

  const savingsRate =
    monthlyIncome > 0
      ? (monthlyNet /
          monthlyIncome) *
        100
      : 0;

  /*
  |--------------------------------------------------------------------------
  | Savings Metrics
  |--------------------------------------------------------------------------
  */

  const totalSavingsTarget =
    savingsGoals.reduce(
      (sum, goal) =>
        sum +
        Number(
          goal.target_amount || 0,
        ),
      0,
    );

  const totalSavings =
    savingsGoals.reduce(
      (sum, goal) =>
        sum +
        Number(
          goal.saved || 0,
        ),
      0,
    );

  const savingsProgress =
    totalSavingsTarget > 0
      ? Math.min(
          100,
          (totalSavings /
            totalSavingsTarget) *
            100,
        )
      : 0;

  /*
  |--------------------------------------------------------------------------
  | Budget Metrics
  |--------------------------------------------------------------------------
  */

  const activeBudgets =
    budgets.filter(
      (budget) =>
        budget.is_active,
    );

  const totalBudget =
    activeBudgets.reduce(
      (sum, budget) =>
        sum +
        Number(
          budget.budget || 0,
        ),
      0,
    );

  const totalBudgetSpent =
    activeBudgets.reduce(
      (sum, budget) =>
        sum +
        Number(
          budget.spent || 0,
        ),
      0,
    );

  const budgetProgress =
    totalBudget > 0
      ? Math.min(
          100,
          (totalBudgetSpent /
            totalBudget) *
            100,
        )
      : 0;

  /*
  |--------------------------------------------------------------------------
  | Recent Transactions
  |--------------------------------------------------------------------------
  */

  const recentTransactions =
    (
      dashboard.recent_transactions ??
      []
    ).slice(0, 8);

  const topCategory =
    dashboard
      .top_spending_categories?.[0];

  /*
  |--------------------------------------------------------------------------
  | Financial Health Score
  |--------------------------------------------------------------------------
  */

  const financialHealthScore =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(
          100 -
            Math.max(
              0,
              budgetProgress -
                savingsProgress /
                  2,
            ),
        ),
      ),
    );

  return (
    <main className="dashboard-page">
      {/* ================================================================
          HEADER
      ================================================================= */}

      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">
            PERSONAL FINANCE COMMAND CENTER
          </p>

          <h1>
            Good day,{" "}
            {user?.name?.split(
              " ",
            )[0] ?? "there"}{" "}
            👋
          </h1>

          <p className="dashboard-subtitle">
            Your complete financial picture,
            all in one place.
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
            {user?.name
              ?.charAt(0)
              .toUpperCase() ?? "U"}
          </button>
        </div>
      </header>

      {/* ================================================================
          MAIN FINANCIAL METRICS
      ================================================================= */}

      <section className="dashboard-summary">
        <article className="balance-card">
          <div className="balance-card-top">
            <span>
              Total balance
            </span>

            <span className="balance-badge">
              {accounts.length}{" "}
              {accounts.length === 1
                ? "account"
                : "accounts"}
            </span>
          </div>

          <strong>
            {formatMoney(
              totalBalance,
              firstCurrency,
            )}
          </strong>

          <div className="balance-footer">
            <span>
              Monthly net cash flow
            </span>

            <span
              className={
                monthlyNet >= 0
                  ? "positive"
                  : "negative"
              }
            >
              {monthlyNet >= 0
                ? "+"
                : "-"}
              {formatMoney(
                Math.abs(monthlyNet),
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
            <span>
              Monthly income
            </span>

            <strong>
              {formatMoney(
                monthlyIncome,
                firstCurrency,
              )}
            </strong>

            <small>
              Total{" "}
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
            <span>
              Monthly expenses
            </span>

            <strong>
              {formatMoney(
                monthlyExpenses,
                firstCurrency,
              )}
            </strong>

            <small>
              Total{" "}
              {formatMoney(
                dashboard.total_expenses,
                firstCurrency,
              )}
            </small>
          </div>
        </article>

        <article className="metric-card neutral">
          <div className="metric-icon">
            %
          </div>

          <div>
            <span>
              Savings rate
            </span>

            <strong>
              {savingsRate.toFixed(1)}%
            </strong>

            <small>
              This month
            </small>
          </div>
        </article>
      </section>

      {/* ================================================================
          MONEY CENTER
      ================================================================= */}

      <section className="money-center">
        <div className="money-center-primary">
          <div className="section-heading">
            <div>
              <h2>
                Financial command center
              </h2>

              <p>
                Everything you need to manage
                your money quickly.
              </p>
            </div>

            <Link to="/transactions">
              View transactions
            </Link>
          </div>

          <div className="command-grid">
            <Link
              to="/income"
              className="command-card income-command"
            >
              <span className="command-icon">
                ↑
              </span>

              <div>
                <strong>
                  Add income
                </strong>

                <small>
                  Record money received
                </small>
              </div>

              <span className="command-arrow">
                →
              </span>
            </Link>

            <Link
              to="/expenses"
              className="command-card expense-command"
            >
              <span className="command-icon">
                ↓
              </span>

              <div>
                <strong>
                  Add expense
                </strong>

                <small>
                  Record money spent
                </small>
              </div>

              <span className="command-arrow">
                →
              </span>
            </Link>

            <Link
              to="/transfers"
              className="command-card"
            >
              <span className="command-icon transfer-command">
                ↔
              </span>

              <div>
                <strong>
                  Transfer money
                </strong>

                <small>
                  Move money between accounts
                </small>
              </div>

              <span className="command-arrow">
                →
              </span>
            </Link>

            <button
              className="command-card"
              onClick={
                openDepositModal
              }
              disabled={
                accounts.length === 0 ||
                savingsGoals.length ===
                  0
              }
            >
              <span className="command-icon saving-command">
                ↑
              </span>

              <div>
                <strong>
                  Deposit savings
                </strong>

                <small>
                  Put money toward a goal
                </small>
              </div>

              <span className="command-arrow">
                →
              </span>
            </button>

            <Link
              to="/savings"
              className="command-card"
            >
              <span className="command-icon goal-command">
                ◎
              </span>

              <div>
                <strong>
                  Create savings goal
                </strong>

                <small>
                  Plan your next milestone
                </small>
              </div>

              <span className="command-arrow">
                →
              </span>
            </Link>

            <Link
              to="/budgets"
              className="command-card"
            >
              <span className="command-icon budget-command">
                ◫
              </span>

              <div>
                <strong>
                  Create budget
                </strong>

                <small>
                  Control category spending
                </small>
              </div>

              <span className="command-arrow">
                →
              </span>
            </Link>
          </div>
        </div>

        <aside className="financial-score-card">
          <span className="score-kicker">
            MONEY HEALTH
          </span>

          <div className="score-circle">
            <strong>
              {financialHealthScore}
            </strong>

            <span>
              /100
            </span>
          </div>

          <h3>
            Your financial health
          </h3>

          <p>
            Keep savings growing and stay below
            your budget limits to strengthen your
            financial position.
          </p>

          <Link to="/financial-insights">
            Get personalized insights →
          </Link>
        </aside>
      </section>

      {/* ================================================================
          ACCOUNTS
      ================================================================= */}

      <section className="dashboard-content">
        <div className="accounts-section">
          <div className="section-heading">
            <div>
              <h2>
                Your accounts
              </h2>

              <p>
                Current balances across your accounts
              </p>
            </div>

            <Link to="/accounts">
              Manage accounts →
            </Link>
          </div>

          {accounts.length ===
          0 ? (
            <div className="empty-state">
              <div>◎</div>

              <h3>
                No accounts yet
              </h3>

              <p>
                Add your first account to start
                tracking your finances.
              </p>

              <Link to="/accounts">
                Add account
              </Link>
            </div>
          ) : (
            <div className="accounts-grid">
              {accounts
                .slice(0, 6)
                .map((account) => (
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
                            account.color ||
                            "#07977c",
                        }}
                      >
                        <AccountIcon
                          type={
                            account.type
                          }
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

                    <div className="account-mini-stats">
                      <span>
                        In{" "}
                        {formatMoney(
                          account.income ??
                            0,
                          account.currency ||
                            firstCurrency,
                        )}
                      </span>

                      <span>
                        Out{" "}
                        {formatMoney(
                          account.expenses ??
                            0,
                          account.currency ||
                            firstCurrency,
                        )}
                      </span>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* ================================================================
          ACTIVITY + PLANNING
      ================================================================= */}

      <section className="dashboard-lower-grid">
        <div className="activity-panel">
          <div className="section-heading">
            <div>
              <h2>
                Recent activity
              </h2>

              <p>
                Your latest financial movements
              </p>
            </div>

            <Link to="/transactions">
              View all
            </Link>
          </div>

          {recentTransactions.length ===
          0 ? (
            <div className="small-empty-state">
              <strong>
                No recent activity
              </strong>

              <span>
                Your transactions will appear here.
              </span>
            </div>
          ) : (
            <div className="activity-list">
              {recentTransactions.map(
                (transaction: any) => (
                  <div
                    className="activity-row"
                    key={`${transaction.type}-${transaction.id}`}
                  >
                    <TransactionIcon
                      type={
                        transaction.type
                      }
                    />

                    <div className="activity-main">
                      <strong>
                        {transaction.title ??
                          "Transaction"}
                      </strong>

                      <span>
                        {transaction.account ??
                          "Account"}
                      </span>
                    </div>

                    <div className="activity-date">
                      {formatDate(
                        transaction.date,
                      )}
                    </div>

                    <strong
                      className={
                        transaction.type ===
                        "expense"
                          ? "activity-amount negative"
                          : transaction.type ===
                              "income"
                            ? "activity-amount positive"
                            : "activity-amount"
                      }
                    >
                      {transaction.type ===
                      "expense"
                        ? "-"
                        : "+"}

                      {formatMoney(
                        transaction.amount,
                        firstCurrency,
                      )}
                    </strong>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <aside className="planning-panel">
          {/* SAVINGS */}

          <div className="planning-section">
            <div className="section-heading compact">
              <div>
                <h2>
                  Savings
                </h2>

                <p>
                  Your goals at a glance
                </p>
              </div>

              <Link to="/savings">
                Manage
              </Link>
            </div>

            <div className="planning-progress-value">
              <strong>
                {formatMoney(
                  totalSavings,
                  firstCurrency,
                )}
              </strong>

              <span>
                of{" "}
                {formatMoney(
                  totalSavingsTarget,
                  firstCurrency,
                )}{" "}
                saved
              </span>
            </div>

            <div className="planning-progress">
              <div
                style={{
                  width: `${savingsProgress}%`,
                }}
              />
            </div>

            <div className="planning-footer">
              <span>
                {savingsProgress.toFixed(
                  1,
                )}
                % complete
              </span>

              <Link to="/savings">
                Open savings
              </Link>
            </div>
          </div>

          {/* BUDGETS */}

          <div className="planning-section">
            <div className="section-heading compact">
              <div>
                <h2>
                  Budgets
                </h2>

                <p>
                  Spending control
                </p>
              </div>

              <Link to="/budgets">
                Manage
              </Link>
            </div>

            <div className="planning-progress-value">
              <strong>
                {formatMoney(
                  totalBudgetSpent,
                  firstCurrency,
                )}
              </strong>

              <span>
                of{" "}
                {formatMoney(
                  totalBudget,
                  firstCurrency,
                )}{" "}
                used
              </span>
            </div>

            <div className="planning-progress">
              <div
                className={
                  budgetProgress >=
                  100
                    ? "danger"
                    : budgetProgress >=
                        80
                      ? "warning"
                      : ""
                }
                style={{
                  width: `${budgetProgress}%`,
                }}
              />
            </div>

            <div className="planning-footer">
              <span>
                {budgetProgress.toFixed(
                  1,
                )}
                % used
              </span>

              <Link to="/budgets">
                Open budgets
              </Link>
            </div>
          </div>
        </aside>
      </section>

      {/* ================================================================
          INSIGHTS
      ================================================================= */}

      <section className="dashboard-insights">
        <div className="section-heading">
          <div>
            <h2>
              Financial snapshot
            </h2>

            <p>
              A few things worth paying attention to
            </p>
          </div>

          <Link to="/financial-insights">
            See all insights →
          </Link>
        </div>

        <div className="insight-grid">
          <article className="insight-box">
            <span>
              MONTHLY CASH FLOW
            </span>

            <strong
              className={
                monthlyNet >= 0
                  ? "positive"
                  : "negative"
              }
            >
              {monthlyNet >= 0
                ? "+"
                : "-"}
              {formatMoney(
                Math.abs(monthlyNet),
                firstCurrency,
              )}
            </strong>

            <p>
              {monthlyNet >= 0
                ? "You're bringing in more than you're spending this month."
                : "Your expenses are currently higher than your income this month."}
            </p>
          </article>

          <article className="insight-box">
            <span>
              TOP SPENDING CATEGORY
            </span>

            <strong>
              {topCategory?.category ??
                "No spending yet"}
            </strong>

            <p>
              {topCategory
                ? `${Number(
                    topCategory.percentage ??
                      0,
                  ).toFixed(
                    1,
                  )}% of your recorded expenses.`
                : "Record expenses to see your biggest spending area."}
            </p>
          </article>

          <article className="insight-box">
            <span>
              ACTIVE BUDGETS
            </span>

            <strong>
              {activeBudgets.length}
            </strong>

            <p>
              {budgetProgress >= 80
                ? "You're getting close to your overall budget limit."
                : "Your active budgets are currently under control."}
            </p>
          </article>

          <article className="insight-box">
            <span>
              SAVINGS GOALS
            </span>

            <strong>
              {savingsGoals.length}
            </strong>

            <p>
              {savingsProgress >=
              80
                ? "You're close to reaching your combined savings targets."
                : "Keep contributing consistently to reach your goals."}
            </p>
          </article>
        </div>
      </section>

      {/* ================================================================
          FOOTER TOOLS
      ================================================================= */}

      <section className="dashboard-footer-tools">
        <Link to="/reports">
          <span>▦</span>
          Reports
        </Link>

        <Link to="/statements">
          <span>▤</span>
          Statements
        </Link>

        <Link to="/financial-insights">
          <span>✦</span>
          Financial insights
        </Link>

        <Link to="/notifications">
          <span>◉</span>
          Notifications
        </Link>
      </section>

      {/* ================================================================
          SAVINGS DEPOSIT MODAL
      ================================================================= */}

      {showDepositModal && (
        <div
          className="dashboard-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeDepositModal();
            }
          }}
        >
          <div
            className="dashboard-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-deposit-title"
          >
            <div className="dashboard-modal-header">
              <div>
                <p>
                  SAVINGS CONTRIBUTION
                </p>

                <h2 id="dashboard-deposit-title">
                  Deposit into savings
                </h2>
              </div>

              <button
                className="dashboard-modal-close"
                onClick={
                  closeDepositModal
                }
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {depositError && (
              <div className="dashboard-form-error">
                {depositError}
              </div>
            )}

            {accounts.length ===
              0 ||
            savingsGoals.length ===
              0 ? (
              <div className="dashboard-deposit-empty">
                <strong>
                  {accounts.length ===
                  0
                    ? "Add an account first"
                    : "Create a savings goal first"}
                </strong>

                <p>
                  {accounts.length ===
                  0
                    ? "You need an account before money can be deposited into savings."
                    : "Create a savings goal before making a savings deposit."}
                </p>

                <Link
                  to={
                    accounts.length ===
                    0
                      ? "/accounts"
                      : "/savings"
                  }
                  onClick={
                    closeDepositModal
                  }
                >
                  {accounts.length ===
                  0
                    ? "Add account"
                    : "Create savings goal"}
                </Link>
              </div>
            ) : (
              <form
                onSubmit={
                  handleDeposit
                }
              >
                <div className="dashboard-field">
                  <label htmlFor="dashboard-deposit-goal">
                    Savings goal
                  </label>

                  <select
                    id="dashboard-deposit-goal"
                    value={
                      depositForm.savings_goal_id ||
                      ""
                    }
                    onChange={(event) =>
                      setDepositForm({
                        ...depositForm,
                        savings_goal_id:
                          Number(
                            event.target
                              .value,
                          ),
                      })
                    }
                    required
                  >
                    <option value="">
                      Select goal
                    </option>

                    {savingsGoals.map(
                      (goal) => (
                        <option
                          key={goal.id}
                          value={goal.id}
                        >
                          {goal.name} —{" "}
                          {formatMoney(
                            goal.remaining,
                          )}{" "}
                          remaining
                        </option>
                      ),
                    )}
                  </select>
                </div>

                {selectedSavingsGoal && (
                  <div className="deposit-preview">
                    <span>
                      Current progress
                    </span>

                    <strong>
                      {formatMoney(
                        selectedSavingsGoal.saved,
                      )}{" "}
                      /{" "}
                      {formatMoney(
                        selectedSavingsGoal.target_amount,
                      )}
                    </strong>
                  </div>
                )}

                <div className="dashboard-field">
                  <label htmlFor="dashboard-deposit-account">
                    Source account
                  </label>

                  <select
                    id="dashboard-deposit-account"
                    value={
                      depositForm.account_id ||
                      ""
                    }
                    onChange={(event) =>
                      setDepositForm({
                        ...depositForm,
                        account_id:
                          Number(
                            event.target
                              .value,
                          ),
                      })
                    }
                    required
                  >
                    <option value="">
                      Select account
                    </option>

                    {accounts.map(
                      (account) => (
                        <option
                          key={account.id}
                          value={account.id}
                        >
                          {account.name} —{" "}
                          {formatMoney(
                            account.balance,
                            account.currency,
                          )}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                {selectedDepositAccount && (
                  <div className="deposit-account-balance">
                    Available balance:{" "}
                    <strong>
                      {formatMoney(
                        selectedDepositAccount.balance,
                        selectedDepositAccount.currency,
                      )}
                    </strong>
                  </div>
                )}

                <div className="dashboard-field">
                  <label htmlFor="dashboard-deposit-amount">
                    Amount
                  </label>

                  <input
                    id="dashboard-deposit-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={
                      depositForm.amount ||
                      ""
                    }
                    onChange={(event) =>
                      setDepositForm({
                        ...depositForm,
                        amount:
                          Number(
                            event.target
                              .value,
                          ),
                      })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="dashboard-field">
                  <label htmlFor="dashboard-deposit-date">
                    Deposit date
                  </label>

                  <input
                    id="dashboard-deposit-date"
                    type="date"
                    value={
                      depositForm.deposited_at
                    }
                    onChange={(event) =>
                      setDepositForm({
                        ...depositForm,
                        deposited_at:
                          event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="dashboard-field">
                  <label htmlFor="dashboard-deposit-reference">
                    Reference
                  </label>

                  <input
                    id="dashboard-deposit-reference"
                    type="text"
                    value={
                      depositForm.reference ??
                      ""
                    }
                    onChange={(event) =>
                      setDepositForm({
                        ...depositForm,
                        reference:
                          event.target.value,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>

                <div className="dashboard-field">
                  <label htmlFor="dashboard-deposit-description">
                    Description
                  </label>

                  <textarea
                    id="dashboard-deposit-description"
                    rows={3}
                    value={
                      depositForm.description ??
                      ""
                    }
                    onChange={(event) =>
                      setDepositForm({
                        ...depositForm,
                        description:
                          event.target.value,
                      })
                    }
                    placeholder="Add a note..."
                  />
                </div>

                <div className="dashboard-modal-actions">
                  <button
                    type="button"
                    className="dashboard-cancel"
                    onClick={
                      closeDepositModal
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="dashboard-submit"
                    disabled={
                      depositMutation.isPending
                    }
                  >
                    {depositMutation.isPending
                      ? "Depositing..."
                      : "Make deposit"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}