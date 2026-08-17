import {
  useQuery,
} from "@tanstack/react-query";

import { useMemo, useState } from "react";

import {
  getAccounts,
} from "../api/accounts";

import {
  getCategorySpending,
  getFinancialSummary,
  getStatement,
} from "../api/reports";

import "./Reports.css";

function formatMoney(
  value: number | string,
  currency = "NGN",
) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
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

function getToday() {
  const date = new Date();

  return date.toISOString().split("T")[0];
}

function getMonthStart() {
  const date = new Date();

  date.setDate(1);

  return date.toISOString().split("T")[0];
}

function getTransactionLabel(
  type: string,
) {
  switch (type) {
    case "income":
      return "Income";

    case "expense":
      return "Expense";

    case "transfer_in":
      return "Transfer in";

    case "transfer_out":
      return "Transfer out";

    case "saving":
      return "Savings";

    case "refund":
      return "Refund";

    case "adjustment":
      return "Adjustment";

    default:
      return type
        .replaceAll("_", " ")
        .replace(
          /\b\w/g,
          (letter) =>
            letter.toUpperCase(),
        );
  }
}

function getTypeClass(
  type: string,
) {
  switch (type) {
    case "income":
    case "refund":
    case "transfer_in":
      return "credit";

    case "expense":
    case "saving":
    case "transfer_out":
      return "debit";

    default:
      return "neutral";
  }
}

export default function Reports() {
  const [activeTab, setActiveTab] =
    useState<
      "overview" | "statement" | "category"
    >("overview");

  const [from, setFrom] =
    useState(getMonthStart());

  const [to, setTo] =
    useState(getToday());

  const [
    selectedAccountId,
    setSelectedAccountId,
  ] = useState<number>(0);

  const {
    data: accounts = [],
    isLoading: accountsLoading,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const accountId =
    selectedAccountId ||
    accounts[0]?.id ||
    0;

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useQuery({
    queryKey: [
      "financial-summary",
      from,
      to,
    ],
    queryFn: () =>
      getFinancialSummary({
        from,
        to,
      }),
    enabled:
      Boolean(from) &&
      Boolean(to) &&
      from <= to,
  });

  const {
    data: statement,
    isLoading: statementLoading,
    isError: statementError,
  } = useQuery({
    queryKey: [
      "statement",
      accountId,
      from,
      to,
    ],
    queryFn: () =>
      getStatement({
        account_id: accountId,
        from,
        to,
      }),
    enabled:
      activeTab === "statement" &&
      accountId > 0 &&
      Boolean(from) &&
      Boolean(to) &&
      from <= to,
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useQuery({
    queryKey: [
      "category-spending",
      from,
      to,
    ],
    queryFn: () =>
      getCategorySpending({
        from,
        to,
      }),
    enabled:
      activeTab === "category" &&
      Boolean(from) &&
      Boolean(to) &&
      from <= to,
  });

  const totalCategorySpend =
    useMemo(
      () =>
        categories.reduce(
          (sum, item) =>
            sum +
            Number(
              item.amount || 0,
            ),
          0,
        ),
      [categories],
    );

  const netSavings =
    Number(
      summary?.summary?.net_savings ??
        0,
    );

  const summaryCurrency =
    accounts[0]?.currency ||
    "NGN";

  return (
    <main className="reports-page">
      <header className="reports-header">
        <div>
          <p className="reports-eyebrow">
            REPORTING & ANALYTICS
          </p>

          <h1>
            Reports & Statements
          </h1>

          <p className="reports-subtitle">
            Understand your financial activity,
            spending patterns, and account history.
          </p>
        </div>
      </header>

      <section className="reports-controls">
        <div className="report-date-field">
          <label htmlFor="report-from">
            From
          </label>

          <input
            id="report-from"
            type="date"
            value={from}
            onChange={(event) =>
              setFrom(event.target.value)
            }
          />
        </div>

        <div className="report-date-field">
          <label htmlFor="report-to">
            To
          </label>

          <input
            id="report-to"
            type="date"
            value={to}
            onChange={(event) =>
              setTo(event.target.value)
            }
          />
        </div>

        {activeTab ===
          "statement" && (
          <div className="report-date-field account-selector">
            <label htmlFor="statement-account">
              Account
            </label>

            <select
              id="statement-account"
              value={accountId || ""}
              onChange={(event) =>
                setSelectedAccountId(
                  Number(
                    event.target.value,
                  ),
                )
              }
              disabled={
                accountsLoading
              }
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
                    {account.name}
                  </option>
                ),
              )}
            </select>
          </div>
        )}
      </section>

      <nav className="reports-tabs">
        <button
          className={
            activeTab === "overview"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("overview")
          }
        >
          Overview
        </button>

        <button
          className={
            activeTab === "statement"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("statement")
          }
        >
          Statement
        </button>

        <button
          className={
            activeTab === "category"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("category")
          }
        >
          Category spending
        </button>
      </nav>

      {activeTab ===
        "overview" && (
        <section className="report-section">
          {summaryLoading ? (
            <div className="report-loading">
              Loading financial report...
            </div>
          ) : summaryError ? (
            <div className="report-error">
              Unable to load the financial report.
            </div>
          ) : (
            <>
              <div className="report-summary-grid">
                <article className="report-summary-card income">
                  <span>
                    Income
                  </span>

                  <strong>
                    {formatMoney(
                      summary?.summary
                        ?.income ?? 0,
                      summaryCurrency,
                    )}
                  </strong>

                  <small>
                    Selected period
                  </small>
                </article>

                <article className="report-summary-card expense">
                  <span>
                    Expenses
                  </span>

                  <strong>
                    {formatMoney(
                      summary?.summary
                        ?.expenses ?? 0,
                      summaryCurrency,
                    )}
                  </strong>

                  <small>
                    Selected period
                  </small>
                </article>

                <article className="report-summary-card savings">
                  <span>
                    Net savings
                  </span>

                  <strong
                    className={
                      netSavings >= 0
                        ? "positive"
                        : "negative"
                    }
                  >
                    {netSavings >=
                    0
                      ? "+"
                      : "-"}

                    {formatMoney(
                      Math.abs(
                        netSavings,
                      ),
                      summaryCurrency,
                    )}
                  </strong>

                  <small>
                    Income minus expenses
                  </small>
                </article>
              </div>

              <div className="report-main-grid">
                <section className="report-panel">
                  <div className="report-panel-heading">
                    <div>
                      <h2>
                        Accounts
                      </h2>

                      <p>
                        Balances across your accounts
                      </p>
                    </div>
                  </div>

                  <div className="report-account-list">
                    {(
                      summary?.accounts ??
                      []
                    ).map(
                      (account) => (
                        <div
                          className="report-account-row"
                          key={account.id}
                        >
                          <div className="report-account-avatar">
                            {account.name
                              .charAt(
                                0,
                              )
                              .toUpperCase()}
                          </div>

                          <div className="report-account-main">
                            <strong>
                              {
                                account.name
                              }
                            </strong>

                            <span>
                              Current balance
                            </span>
                          </div>

                          <strong>
                            {formatMoney(
                              account.balance,
                              summaryCurrency,
                            )}
                          </strong>
                        </div>
                      ),
                    )}
                  </div>
                </section>

                <section className="report-panel">
                  <div className="report-panel-heading">
                    <div>
                      <h2>
                        Top categories
                      </h2>

                      <p>
                        Highest spending categories
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setActiveTab(
                          "category",
                        )
                      }
                    >
                      View all
                    </button>
                  </div>

                  <div className="category-list">
                    {(
                      summary?.top_categories ??
                      []
                    ).map(
                      (
                        item,
                        index,
                      ) => {
                        const amount =
                          Number(
                            item.total ??
                              0,
                          );

                        const total =
                          Number(
                            summary?.summary
                              ?.expenses ??
                              0,
                          );

                        const percentage =
                          total > 0
                            ? Math.min(
                                100,
                                (amount /
                                  total) *
                                  100,
                              )
                            : 0;

                        return (
                          <div
                            className="category-row"
                            key={
                              item.category_id
                            }
                          >
                            <div className="category-index">
                              {index +
                                1}
                            </div>

                            <div className="category-main">
                              <div className="category-row-heading">
                                <strong>
                                  {item
                                    .category
                                    ?.name ??
                                    "Uncategorized"}
                                </strong>

                                <span>
                                  {formatMoney(
                                    amount,
                                    summaryCurrency,
                                  )}
                                </span>
                              </div>

                              <div className="category-track">
                                <div
                                  style={{
                                    width: `${percentage}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      },
                    )}

                    {(
                      summary?.top_categories ??
                      []
                    ).length ===
                      0 && (
                      <div className="report-empty">
                        No spending data for
                        this period.
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </>
          )}
        </section>
      )}

      {activeTab ===
        "statement" && (
        <section className="report-section">
          {!accountId ? (
            <div className="report-empty-large">
              <h2>
                Select an account
              </h2>

              <p>
                Choose an account to generate
                its statement.
              </p>
            </div>
          ) : statementLoading ? (
            <div className="report-loading">
              Generating statement...
            </div>
          ) : statementError ? (
            <div className="report-error">
              Unable to generate this statement.
            </div>
          ) : statement ? (
            <>
              <div className="statement-header-card">
                <div>
                  <span>
                    ACCOUNT STATEMENT
                  </span>

                  <h2>
                    {statement.account.name}
                  </h2>

                  <p>
                    {formatDate(
                      statement.period.from,
                    )}{" "}
                    —{" "}
                    {formatDate(
                      statement.period.to,
                    )}
                  </p>
                </div>

                <strong>
                  {formatMoney(
                    statement.closing_balance,
                    statement.account.currency,
                  )}
                </strong>
              </div>

              <div className="statement-summary">
                <article>
                  <span>
                    Opening balance
                  </span>

                  <strong>
                    {formatMoney(
                      statement.opening_balance,
                      statement.account.currency,
                    )}
                  </strong>
                </article>

                <article>
                  <span>
                    Total credits
                  </span>

                  <strong className="positive">
                    +
                    {formatMoney(
                      statement.total_credits,
                      statement.account.currency,
                    )}
                  </strong>
                </article>

                <article>
                  <span>
                    Total debits
                  </span>

                  <strong className="negative">
                    -
                    {formatMoney(
                      statement.total_debits,
                      statement.account.currency,
                    )}
                  </strong>
                </article>

                <article>
                  <span>
                    Closing balance
                  </span>

                  <strong>
                    {formatMoney(
                      statement.closing_balance,
                      statement.account.currency,
                    )}
                  </strong>
                </article>
              </div>

              <div className="statement-table-panel">
                <div className="report-panel-heading">
                  <div>
                    <h2>
                      Transactions
                    </h2>

                    <p>
                      {statement.transactions.length}{" "}
                      transaction
                      {statement.transactions.length ===
                      1
                        ? ""
                        : "s"}{" "}
                      in this period
                    </p>
                  </div>
                </div>

                {statement.transactions.length ===
                0 ? (
                  <div className="report-empty">
                    No transactions found for this
                    period.
                  </div>
                ) : (
                  <div className="statement-table-wrapper">
                    <table className="statement-table">
                      <thead>
                        <tr>
                          <th>
                            Date
                          </th>

                          <th>
                            Transaction
                          </th>

                          <th>
                            Reference
                          </th>

                          <th>
                            Type
                          </th>

                          <th>
                            Amount
                          </th>

                          <th>
                            Balance
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {statement.transactions.map(
                          (
                            transaction,
                          ) => (
                            <tr
                              key={
                                transaction.id
                              }
                            >
                              <td>
                                {formatDate(
                                  transaction.transaction_date,
                                )}
                              </td>

                              <td>
                                <strong>
                                  {transaction.description ??
                                    getTransactionLabel(
                                      transaction.type,
                                    )}
                                </strong>
                              </td>

                              <td>
                                {transaction.reference ??
                                  "—"}
                              </td>

                              <td>
                                <span
                                  className={`statement-type ${getTypeClass(
                                    transaction.type,
                                  )}`}
                                >
                                  {getTransactionLabel(
                                    transaction.type,
                                  )}
                                </span>
                              </td>

                              <td
                                className={
                                  getTypeClass(
                                    transaction.type,
                                  ) ===
                                  "debit"
                                    ? "table-debit"
                                    : getTypeClass(
                                          transaction.type,
                                        ) ===
                                        "credit"
                                      ? "table-credit"
                                      : ""
                                }
                              >
                                {getTypeClass(
                                  transaction.type,
                                ) ===
                                "debit"
                                  ? "-"
                                  : getTypeClass(
                                        transaction.type,
                                      ) ===
                                      "credit"
                                    ? "+"
                                    : ""}

                                {formatMoney(
                                  transaction.amount,
                                  statement
                                    .account
                                    .currency,
                                )}
                              </td>

                              <td>
                                {formatMoney(
                                  transaction.balance_after,
                                  statement
                                    .account
                                    .currency,
                                )}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </section>
      )}

      {activeTab ===
        "category" && (
        <section className="report-section">
          {categoriesLoading ? (
            <div className="report-loading">
              Analysing spending...
            </div>
          ) : categoriesError ? (
            <div className="report-error">
              Unable to load category spending.
            </div>
          ) : (
            <div className="category-report-panel">
              <div className="category-report-header">
                <div>
                  <p>
                    SPENDING ANALYSIS
                  </p>

                  <h2>
                    Category spending
                  </h2>

                  <span>
                    {formatDate(from)}{" "}
                    —{" "}
                    {formatDate(to)}
                  </span>
                </div>

                <strong>
                  {formatMoney(
                    totalCategorySpend,
                    summaryCurrency,
                  )}
                </strong>
              </div>

              <div className="category-report-list">
                {categories.length ===
                0 ? (
                  <div className="report-empty-large">
                    <h2>
                      No spending data
                    </h2>

                    <p>
                      There are no recorded expenses
                      in the selected period.
                    </p>
                  </div>
                ) : (
                  categories.map(
                    (
                      category,
                      index,
                    ) => (
                      <article
                        className="category-report-row"
                        key={
                          category.category_id
                        }
                      >
                        <div className="category-report-number">
                          {String(
                            index + 1,
                          ).padStart(
                            2,
                            "0",
                          )}
                        </div>

                        <div className="category-report-main">
                          <div className="category-report-title">
                            <strong>
                              {category.category ??
                                "Uncategorized"}
                            </strong>

                            <span>
                              {
                                category.percentage
                              }
                              %
                            </span>
                          </div>

                          <div className="category-track large">
                            <div
                              style={{
                                width: `${Math.min(
                                  100,
                                  Number(
                                    category.percentage,
                                  ),
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        <strong className="category-report-amount">
                          {formatMoney(
                            category.amount,
                            summaryCurrency,
                          )}
                        </strong>
                      </article>
                    ),
                  )
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}