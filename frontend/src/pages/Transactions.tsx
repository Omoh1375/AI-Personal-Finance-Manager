import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  useMemo,
  useState,
} from "react";
import {
  createExpense,
  createIncome,
  deleteExpense,
  deleteIncome,
  getExpenses,
  getIncomes,
} from "../api/transactions";
import { getCategories } from "../api/categories";

import type {
  CategoryType,
} from "../types/category";

import type {
  IncomePayload,
  ExpensePayload,
  Transaction,
  TransactionKind,
} from "../types/transaction";

import "./Transactions.css";

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

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateInput(date = new Date()) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTransactionDate(
  transaction: Transaction,
  kind: TransactionKind,
) {
  return kind === "income"
    ? transaction.received_at
    : transaction.spent_at;
}

export default function Transactions() {
  const queryClient = useQueryClient();

  const [kind, setKind] =
    useState<TransactionKind>("income");

  const [showModal, setShowModal] =
    useState(false);

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [formError, setFormError] =
    useState("");

  const [form, setForm] = useState({
    account_id: "",
    category_id: "",
    amount: "",
    reference: "",
    merchant: "",
    description: "",
    date: formatDateInput(),
  });

  const {
    data: incomes = [],
    isLoading: incomesLoading,
  } = useQuery({
    queryKey: ["incomes"],
    queryFn: getIncomes,
  });

  const {
    data: expenses = [],
    isLoading: expensesLoading,
  } = useQuery({
    queryKey: ["expenses"],
    queryFn: getExpenses,
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ["categories", kind],
    queryFn: () =>
      getCategories(
        kind as CategoryType,
      ),
  });

  const {
    data: accounts = [],
    isLoading: accountsLoading,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { getAccounts } =
        await import("../api/accounts");

      return getAccounts();
    },
  });

  const transactions =
    kind === "income"
      ? incomes
      : expenses;

  const isLoading =
    incomesLoading ||
    expensesLoading ||
    categoriesLoading ||
    accountsLoading;

  const filteredTransactions =
    useMemo(() => {
      const term =
        search.trim().toLowerCase();

      return transactions.filter(
        (transaction) => {
          const category =
            transaction.category?.name ??
            "";

          const account =
            transaction.account?.name ??
            "";

          const matchesSearch =
            !term ||
            category
              .toLowerCase()
              .includes(term) ||
            account
              .toLowerCase()
              .includes(term) ||
            (
              transaction.description ?? ""
            )
              .toLowerCase()
              .includes(term) ||
            (
              transaction.merchant ?? ""
            )
              .toLowerCase()
              .includes(term);

          const matchesCategory =
            !selectedCategory ||
            String(transaction.category_id) ===
              selectedCategory;

          return (
            matchesSearch &&
            matchesCategory
          );
        },
      );
    }, [
      transactions,
      search,
      selectedCategory,
    ]);

  const total = useMemo(() => {
    return transactions.reduce(
      (sum, transaction) =>
        sum +
        Number(transaction.amount || 0),
      0,
    );
  }, [transactions]);

  const average = transactions.length
    ? total / transactions.length
    : 0;

  const createMutation = useMutation({
    mutationFn: async () => {
      const amount =
        Number(form.amount);

      if (!form.account_id) {
        throw new Error(
          "Please select an account.",
        );
      }

      if (!form.category_id) {
        throw new Error(
          "Please select a category.",
        );
      }

      if (!amount || amount <= 0) {
        throw new Error(
          "Please enter a valid amount.",
        );
      }

      if (kind === "income") {
        const payload: IncomePayload = {
          account_id:
            Number(form.account_id),
          category_id:
            Number(form.category_id),
          amount,
          reference:
            form.reference || undefined,
          description:
            form.description || undefined,
          received_at:
            form.date,
        };

        return createIncome(payload);
      }

      const payload: ExpensePayload = {
        account_id:
          Number(form.account_id),
        category_id:
          Number(form.category_id),
        amount,
        reference:
          form.reference || undefined,
        merchant:
          form.merchant || undefined,
        description:
          form.description || undefined,
        spent_at:
          form.date,
      };

      return createExpense(payload);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["incomes"],
      });

      queryClient.invalidateQueries({
        queryKey: ["expenses"],
      });

      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      closeModal();
    },

    onError: (error: any) => {
      const backendErrors =
        error?.response?.data?.errors;

      const firstError = backendErrors
        ? Object.values(backendErrors)
            .flat()
            .find(Boolean)
        : null;

      setFormError(
        typeof firstError === "string"
          ? firstError
          : error?.message ??
              error?.response?.data?.message ??
              "Unable to save this transaction.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({
      id,
      kind: transactionKind,
    }: {
      id: number;
      kind: TransactionKind;
    }) => {
      if (
        transactionKind === "income"
      ) {
        return deleteIncome(id);
      }

      return deleteExpense(id);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["incomes"],
      });

      queryClient.invalidateQueries({
        queryKey: ["expenses"],
      });

      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });

  const closeModal = () => {
    setShowModal(false);

    setForm({
      account_id: "",
      category_id: "",
      amount: "",
      reference: "",
      merchant: "",
      description: "",
      date: formatDateInput(),
    });

    setFormError("");
  };

  const openModal = () => {
    setFormError("");

    setForm({
      account_id: "",
      category_id: "",
      amount: "",
      reference: "",
      merchant: "",
      description: "",
      date: formatDateInput(),
    });

    setShowModal(true);
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setFormError("");

    createMutation.mutate();
  };

  const handleDelete = (
    transaction: Transaction,
  ) => {
    const label =
      transaction.category?.name ??
      kind;

    const confirmed = window.confirm(
      `Delete this ${kind} transaction (${label})?`,
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate({
      id: transaction.id,
      kind,
    });
  };

  return (
    <main className="transactions-page">
      <header className="transactions-header">
        <div>
          <p className="transactions-eyebrow">
            MONEY MOVEMENT
          </p>

          <h1>Transactions</h1>

          <p className="transactions-subtitle">
            Track every naira coming in and going out.
          </p>
        </div>

        <button
          className="add-transaction-button"
          onClick={openModal}
        >
          <span>+</span>
          Add{" "}
          {kind === "income"
            ? "income"
            : "expense"}
        </button>
      </header>

      <section className="transaction-summary">
        <article className="transaction-summary-card">
          <span>
            {kind === "income"
              ? "Total income"
              : "Total expenses"}
          </span>

          <strong>
            {formatMoney(total)}
          </strong>

          <small>
            {transactions.length} transaction
            {transactions.length === 1
              ? ""
              : "s"}
          </small>
        </article>

        <article className="transaction-summary-card">
          <span>Average transaction</span>

          <strong>
            {formatMoney(average)}
          </strong>

          <small>
            Based on current records
          </small>
        </article>

        <article className="transaction-summary-card">
          <span>Categories used</span>

          <strong>
            {new Set(
              transactions.map(
                (transaction) =>
                  transaction.category_id,
              ),
            ).size}
          </strong>

          <small>
            Across your transactions
          </small>
        </article>
      </section>

      <section className="transactions-workspace">
        <div className="transaction-toolbar">
          <div className="transaction-tabs">
            <button
              className={
                kind === "income"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setKind("income");
                setSelectedCategory("");
              }}
            >
              <span className="tab-icon income">
                ↑
              </span>
              Income
            </button>

            <button
              className={
                kind === "expense"
                  ? "active"
                  : ""
              }
              onClick={() => {
                setKind("expense");
                setSelectedCategory("");
              }}
            >
              <span className="tab-icon expense">
                ↓
              </span>
              Expenses
            </button>
          </div>

          <div className="transaction-filters">
            <div className="search-box">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />
                <path d="m16 16 5 5" />
              </svg>

              <input
                type="search"
                placeholder="Search transactions..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(
                  event.target.value,
                )
              }
            >
              <option value="">
                All categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        <div className="transaction-table">
          <div className="transaction-table-header">
            <span>Transaction</span>
            <span>Account</span>
            <span>Date</span>
            <span>Amount</span>
            <span />
          </div>

          {isLoading ? (
            <div className="transactions-loading">
              <div className="transactions-spinner" />
              <p>
                Loading transactions...
              </p>
            </div>
          ) : filteredTransactions.length ===
            0 ? (
            <div className="transactions-empty">
              <div className="empty-transaction-icon">
                {kind === "income"
                  ? "↑"
                  : "↓"}
              </div>

              <h3>
                No{" "}
                {kind === "income"
                  ? "income"
                  : "expenses"}{" "}
                found
              </h3>

              <p>
                Start by recording your first{" "}
                {kind === "income"
                  ? "income"
                  : "expense"}{" "}
                transaction.
              </p>

              <button
                onClick={openModal}
              >
                Add{" "}
                {kind === "income"
                  ? "income"
                  : "expense"}
              </button>
            </div>
          ) : (
            <div className="transaction-table-body">
              {filteredTransactions.map(
                (transaction) => {
                  const date =
                    getTransactionDate(
                      transaction,
                      kind,
                    );

                  return (
                    <div
                      className="transaction-row"
                      key={transaction.id}
                    >
                      <div className="transaction-name">
                        <div
                          className={
                            kind === "income"
                              ? "transaction-icon income"
                              : "transaction-icon expense"
                          }
                        >
                          {kind ===
                          "income"
                            ? "↑"
                            : "↓"}
                        </div>

                        <div>
                          <strong>
                            {transaction
                              .category
                              ?.name ??
                              "Uncategorized"}
                          </strong>

                          <small>
                            {kind ===
                            "expense"
                              ? transaction
                                  .merchant ??
                                transaction
                                  .description ??
                                "Expense"
                              : transaction
                                  .description ??
                                transaction
                                  .reference ??
                                "Income"}
                          </small>
                        </div>
                      </div>

                      <div className="transaction-account">
                        {transaction
                          .account
                          ?.name ??
                          "Account"}
                      </div>

                      <div className="transaction-date">
                        {formatDate(date)}
                      </div>

                      <div
                        className={
                          kind === "income"
                            ? "transaction-amount income"
                            : "transaction-amount expense"
                        }
                      >
                        {kind === "income"
                          ? "+"
                          : "-"}
                        {formatMoney(
                          transaction.amount,
                        )}
                      </div>

                      <div className="transaction-actions">
                        <button
                          onClick={() =>
                            handleDelete(
                              transaction,
                            )
                          }
                          disabled={
                            deleteMutation.isPending
                          }
                          title="Delete transaction"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>
      </section>

      {showModal && (
        <div
          className="transaction-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div
            className="transaction-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-modal-title"
          >
            <div className="modal-heading">
              <div>
                <p>
                  {kind === "income"
                    ? "MONEY IN"
                    : "MONEY OUT"}
                </p>

                <h2 id="transaction-modal-title">
                  Add{" "}
                  {kind === "income"
                    ? "income"
                    : "expense"}
                </h2>
              </div>

              <button
                className="transaction-modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {formError && (
              <div className="transaction-form-error">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="transaction-form-grid">
                <div className="transaction-field full">
                  <label htmlFor="transaction-account">
                    Account
                  </label>

                  <select
                    id="transaction-account"
                    value={
                      form.account_id
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        account_id:
                          event.target
                            .value,
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

                <div className="transaction-field">
                  <label htmlFor="transaction-category">
                    Category
                  </label>

                  <select
                    id="transaction-category"
                    value={
                      form.category_id
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category_id:
                          event.target
                            .value,
                      })
                    }
                    required
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="transaction-field">
                  <label htmlFor="transaction-amount">
                    Amount
                  </label>

                  <input
                    id="transaction-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        amount:
                          event.target
                            .value,
                      })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                {kind === "expense" && (
                  <div className="transaction-field full">
                    <label htmlFor="transaction-merchant">
                      Merchant
                    </label>

                    <input
                      id="transaction-merchant"
                      type="text"
                      value={form.merchant}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          merchant:
                            event.target
                              .value,
                        })
                      }
                      placeholder="e.g. Shoprite"
                    />
                  </div>
                )}

                <div className="transaction-field">
                  <label htmlFor="transaction-date">
                    Date
                  </label>

                  <input
                    id="transaction-date"
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        date:
                          event.target
                            .value,
                      })
                    }
                    required
                  />
                </div>

                <div className="transaction-field">
                  <label htmlFor="transaction-reference">
                    Reference
                  </label>

                  <input
                    id="transaction-reference"
                    type="text"
                    value={
                      form.reference
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        reference:
                          event.target
                            .value,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>

                <div className="transaction-field full">
                  <label htmlFor="transaction-description">
                    Description
                  </label>

                  <textarea
                    id="transaction-description"
                    value={
                      form.description
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description:
                          event.target
                            .value,
                      })
                    }
                    placeholder="Add a note..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="transaction-modal-actions">
                <button
                  type="button"
                  className="transaction-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={
                    kind === "income"
                      ? "transaction-save income"
                      : "transaction-save expense"
                  }
                  disabled={
                    createMutation.isPending
                  }
                >
                  {createMutation.isPending
                    ? "Saving..."
                    : `Add ${
                        kind === "income"
                          ? "income"
                          : "expense"
                      }`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}