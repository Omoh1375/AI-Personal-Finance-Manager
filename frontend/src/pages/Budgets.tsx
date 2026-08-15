import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { getCategories } from "../api/categories";
import {
  createBudget,
  deleteBudget,
  getBudgets,
} from "../api/budgets";

import type { Category } from "../types/category";
import type {
  BudgetPayload,
  BudgetStatus,
} from "../types/budget";

import "./Budgets.css";

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
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

function getMonthEnd() {
  const date = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  );

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function statusClass(
  status: BudgetStatus,
) {
  switch (status) {
    case "Exceeded":
      return "budget-status exceeded";

    case "Near Limit":
      return "budget-status near-limit";

    default:
      return "budget-status on-track";
  }
}

function progressClass(
  status: BudgetStatus,
) {
  switch (status) {
    case "Exceeded":
      return "budget-progress-fill exceeded";

    case "Near Limit":
      return "budget-progress-fill near-limit";

    default:
      return "budget-progress-fill on-track";
  }
}

export default function Budgets() {
  const queryClient = useQueryClient();

  const [showModal, setShowModal] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [formError, setFormError] =
    useState("");

  const [form, setForm] =
    useState<BudgetPayload>({
      category_id: 0,
      amount: 0,
      start_date: getToday(),
      end_date: getMonthEnd(),
      is_active: true,
    });

  const {
    data: budgets = [],
    isLoading: budgetsLoading,
    isError: budgetsError,
  } = useQuery({
    queryKey: ["budgets"],
    queryFn: getBudgets,
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ["categories", "expense"],
    queryFn: () => getCategories("expense"),
  });

  const createMutation = useMutation({
    mutationFn: (payload: BudgetPayload) =>
      createBudget(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["budgets"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      closeModal();
    },

    onError: (error: any) => {
      const errors =
        error?.response?.data?.errors;

      const firstError = errors
        ? Object.values(errors)
            .flat()
            .find(Boolean)
        : null;

      setFormError(
        typeof firstError === "string"
          ? firstError
          : error?.response?.data?.message ??
              error?.message ??
              "Unable to create budget.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBudget,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["budgets"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });

  const activeBudgets = useMemo(
    () =>
      budgets.filter(
        (budget) => budget.is_active,
      ),
    [budgets],
  );

  const totalBudgeted = useMemo(
    () =>
      activeBudgets.reduce(
        (sum, budget) =>
          sum + Number(budget.budget),
        0,
      ),
    [activeBudgets],
  );

  const totalSpent = useMemo(
    () =>
      activeBudgets.reduce(
        (sum, budget) =>
          sum + Number(budget.spent),
        0,
      ),
    [activeBudgets],
  );

  const totalRemaining = useMemo(
    () =>
      activeBudgets.reduce(
        (sum, budget) =>
          sum + Number(budget.remaining),
        0,
      ),
    [activeBudgets],
  );

  const overallProgress =
    totalBudgeted > 0
      ? Math.min(
          100,
          (totalSpent / totalBudgeted) * 100,
        )
      : 0;

  const filteredBudgets = useMemo(() => {
    const term =
      search.trim().toLowerCase();

    return budgets.filter((budget) => {
      const matchesSearch =
        !term ||
        budget.category
          .toLowerCase()
          .includes(term);

      const matchesStatus =
        !statusFilter ||
        budget.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    budgets,
    search,
    statusFilter,
  ]);

  const openModal = () => {
    setFormError("");

    setForm({
      category_id: 0,
      amount: 0,
      start_date: getToday(),
      end_date: getMonthEnd(),
      is_active: true,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormError("");
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setFormError("");

    if (!form.category_id) {
      setFormError(
        "Please select a category.",
      );
      return;
    }

    if (
      !form.amount ||
      Number(form.amount) < 1
    ) {
      setFormError(
        "Budget amount must be at least ₦1.",
      );
      return;
    }

    if (
      !form.start_date ||
      !form.end_date
    ) {
      setFormError(
        "Please select both dates.",
      );
      return;
    }

    if (
      new Date(form.end_date) <
      new Date(form.start_date)
    ) {
      setFormError(
        "End date cannot be before start date.",
      );
      return;
    }

    createMutation.mutate({
      category_id:
        Number(form.category_id),
      amount: Number(form.amount),
      start_date: form.start_date,
      end_date: form.end_date,
      is_active:
        form.is_active ?? true,
    });
  };

  const handleDelete = (
    budgetId: number,
    category: string,
  ) => {
    const confirmed = window.confirm(
      `Delete the ${category} budget? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(budgetId);
  };

  if (budgetsLoading) {
    return (
      <main className="budgets-page">
        <div className="budgets-loading">
          <div className="budgets-spinner" />
          <p>
            Loading your budgets...
          </p>
        </div>
      </main>
    );
  }

  if (budgetsError) {
    return (
      <main className="budgets-page">
        <div className="budgets-error">
          <h2>
            Unable to load budgets
          </h2>

          <p>
            Please check your connection and
            try again.
          </p>

          <button
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["budgets"],
              })
            }
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="budgets-page">
      <header className="budgets-header">
        <div>
          <p className="budgets-eyebrow">
            FINANCIAL PLANNING
          </p>

          <h1>Budgets</h1>

          <p className="budgets-subtitle">
            Set spending limits and stay in control
            of your money.
          </p>
        </div>

        <button
          className="add-budget-button"
          onClick={openModal}
        >
          <span>+</span>
          Create budget
        </button>
      </header>

      <section className="budget-summary">
        <article className="budget-summary-card featured">
          <div>
            <span>Total budgeted</span>

            <strong>
              {formatMoney(
                totalBudgeted,
              )}
            </strong>

            <small>
              Across {activeBudgets.length} active
              budget
              {activeBudgets.length === 1
                ? ""
                : "s"}
            </small>
          </div>

          <div className="summary-icon">
            ₦
          </div>
        </article>

        <article className="budget-summary-card">
          <span>Total spent</span>

          <strong>
            {formatMoney(totalSpent)}
          </strong>

          <small>
            {overallProgress.toFixed(1)}% of
            active budgets
          </small>
        </article>

        <article className="budget-summary-card">
          <span>Remaining</span>

          <strong>
            {formatMoney(totalRemaining)}
          </strong>

          <small>
            Available across active budgets
          </small>
        </article>
      </section>

      <section className="budget-overall-card">
        <div className="overall-heading">
          <div>
            <h2>
              Overall budget progress
            </h2>

            <p>
              Spending across all active budgets
            </p>
          </div>

          <strong>
            {overallProgress.toFixed(1)}%
          </strong>
        </div>

        <div className="overall-progress">
          <div
            className="overall-progress-fill"
            style={{
              width: `${Math.min(
                overallProgress,
                100,
              )}%`,
            }}
          />
        </div>

        <div className="overall-labels">
          <span>
            Spent{" "}
            {formatMoney(totalSpent)}
          </span>

          <span>
            Budget{" "}
            {formatMoney(totalBudgeted)}
          </span>
        </div>
      </section>

      <section className="budgets-workspace">
        <div className="budgets-toolbar">
          <div>
            <h2>Your budgets</h2>

            <p>
              Track spending against each category
              limit.
            </p>
          </div>

          <div className="budget-filters">
            <div className="budget-search">
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
                placeholder="Search budgets..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
            >
              <option value="">
                All statuses
              </option>

              <option value="On Track">
                On Track
              </option>

              <option value="Near Limit">
                Near Limit
              </option>

              <option value="Exceeded">
                Exceeded
              </option>
            </select>
          </div>
        </div>

        {filteredBudgets.length === 0 ? (
          <div className="budgets-empty">
            <div className="empty-budget-icon">
              ₦
            </div>

            <h3>
              {budgets.length === 0
                ? "Create your first budget"
                : "No budgets match your filters"}
            </h3>

            <p>
              {budgets.length === 0
                ? "Set a category spending limit and start managing your money with intention."
                : "Try another search term or status filter."}
            </p>

            {budgets.length === 0 && (
              <button onClick={openModal}>
                Create budget
              </button>
            )}
          </div>
        ) : (
          <div className="budgets-grid">
            {filteredBudgets.map(
              (budget) => {
                const percentage = Math.min(
                  100,
                  Math.max(
                    0,
                    Number(
                      budget.progress,
                    ),
                  ),
                );

                return (
                  <article
                    className="budget-card"
                    key={budget.id}
                  >
                    <div className="budget-card-header">
                      <div className="budget-category-icon">
                        ₦
                      </div>

                      <div className="budget-card-title">
                        <h3>
                          {budget.category}
                        </h3>

                        <span>
                          {formatDate(
                            budget.start_date,
                          )}{" "}
                          –{" "}
                          {formatDate(
                            budget.end_date,
                          )}
                        </span>
                      </div>

                      <span
                        className={statusClass(
                          budget.status,
                        )}
                      >
                        {budget.status}
                      </span>
                    </div>

                    <div className="budget-card-amounts">
                      <div>
                        <span>Spent</span>

                        <strong>
                          {formatMoney(
                            budget.spent,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Budget</span>

                        <strong>
                          {formatMoney(
                            budget.budget,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Remaining</span>

                        <strong>
                          {formatMoney(
                            budget.remaining,
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="budget-progress">
                      <div
                        className={progressClass(
                          budget.status,
                        )}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <div className="budget-progress-footer">
                      <span>
                        {Number(
                          budget.progress,
                        ).toFixed(1)}
                        % used
                      </span>

                      <span>
                        {budget.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <div className="budget-card-footer">
                      <span>
                        {budget.status ===
                        "Exceeded"
                          ? "You've exceeded this budget."
                          : budget.status ===
                              "Near Limit"
                            ? "You're getting close to the limit."
                            : "You're on track with this budget."}
                      </span>

                      <button
                        onClick={() =>
                          handleDelete(
                            budget.id,
                            budget.category,
                          )
                        }
                        disabled={
                          deleteMutation.isPending
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>

      {showModal && (
        <div
          className="budget-modal-backdrop"
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
            className="budget-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="budget-modal-title"
          >
            <div className="budget-modal-header">
              <div>
                <p>BUDGET PLANNER</p>

                <h2 id="budget-modal-title">
                  Create budget
                </h2>
              </div>

              <button
                className="budget-modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {formError && (
              <div className="budget-form-error">
                {formError}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
            >
              <div className="budget-field">
                <label htmlFor="budget-category">
                  Expense category
                </label>

                <select
                  id="budget-category"
                  value={
                    form.category_id || ""
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category_id:
                        Number(
                          event.target.value,
                        ),
                    })
                  }
                  disabled={
                    categoriesLoading
                  }
                  required
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories..."
                      : "Select category"}
                  </option>

                  {categories.map(
                    (category: Category) => (
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

              <div className="budget-field">
                <label htmlFor="budget-amount">
                  Budget amount
                </label>

                <input
                  id="budget-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={
                    form.amount || ""
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      amount:
                        Number(
                          event.target.value,
                        ),
                    })
                  }
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="budget-form-row">
                <div className="budget-field">
                  <label htmlFor="budget-start">
                    Start date
                  </label>

                  <input
                    id="budget-start"
                    type="date"
                    value={
                      form.start_date
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        start_date:
                          event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="budget-field">
                  <label htmlFor="budget-end">
                    End date
                  </label>

                  <input
                    id="budget-end"
                    type="date"
                    value={
                      form.end_date
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        end_date:
                          event.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <label className="budget-active-row">
                <input
                  type="checkbox"
                  checked={
                    form.is_active ?? true
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      is_active:
                        event.target
                          .checked,
                    })
                  }
                />

                <span>
                  Keep this budget active
                </span>
              </label>

              <div className="budget-modal-actions">
                <button
                  type="button"
                  className="budget-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="budget-submit"
                  disabled={
                    createMutation.isPending ||
                    categoriesLoading
                  }
                >
                  {createMutation.isPending
                    ? "Creating..."
                    : "Create budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}