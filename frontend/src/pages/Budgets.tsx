import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { getCategories } from "../api/categories";

import {
  createBudget,
  deleteBudget,
  getBudgets,
  updateBudget,
} from "../api/budgets";

import type { Category } from "../types/category";

import type {
  BudgetPayload,
  BudgetStatus,
} from "../types/budget";

import "./Budgets.css";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function formatMoney(
  value: number | string,
  currency = "NGN",
) {
  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    },
  ).format(Number(value) || 0);
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(value));
}

function getToday() {
  const date = new Date();

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthEnd() {
  const now = new Date();

  const date = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  );

  const year =
    date.getFullYear();

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

function getStatusMessage(
  status: BudgetStatus,
  spent: number,
  budget: number,
) {
  const difference =
    spent - budget;

  if (status === "Exceeded") {
    return `${formatMoney(
      difference,
    )} over budget`;
  }

  if (status === "Near Limit") {
    return "You're getting close to the limit.";
  }

  return "You're on track with this budget.";
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function Budgets() {
  const queryClient =
    useQueryClient();

  const [showModal, setShowModal] =
    useState(false);

  const [editingBudgetId, setEditingBudgetId] =
    useState<number | null>(null);

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  const [
    activityFilter,
    setActivityFilter,
  ] = useState<
    "" | "active" | "inactive"
  >("");

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

  /*
  |--------------------------------------------------------------------------
  | BUDGETS
  |--------------------------------------------------------------------------
  */

  const {
    data: budgets = [],
    isLoading: budgetsLoading,
    isError: budgetsError,
  } = useQuery({
    queryKey: ["budgets"],
    queryFn: getBudgets,
  });

  /*
  |--------------------------------------------------------------------------
  | CATEGORIES
  |--------------------------------------------------------------------------
  */

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: [
      "categories",
      "expense",
    ],

    queryFn: () =>
      getCategories(
        "expense",
      ),
  });

  /*
  |--------------------------------------------------------------------------
  | CREATE
  |--------------------------------------------------------------------------
  */

  const createMutation =
    useMutation({
      mutationFn: (
        payload: BudgetPayload,
      ) =>
        createBudget(payload),

      onSuccess: () => {
        queryClient.invalidateQueries(
          {
            queryKey: [
              "budgets",
            ],
          },
        );

        queryClient.invalidateQueries(
          {
            queryKey: [
              "dashboard",
            ],
          },
        );

        queryClient.invalidateQueries(
          {
            queryKey: [
              "financial-insights",
            ],
          },
        );

        queryClient.invalidateQueries(
          {
            queryKey: [
              "notifications",
            ],
          },
        );

        closeModal();
      },

      onError: (
        error: any,
      ) => {
        const errors =
          error?.response?.data
            ?.errors;

        const firstError =
          errors
            ? Object.values(
                errors,
              )
                .flat()
                .find(Boolean)
            : null;

        setFormError(
          typeof firstError ===
            "string"
            ? firstError
            : error?.response
                ?.data
                ?.message ??
              error?.message ??
              "Unable to create budget.",
        );
      },
    });

  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

  const updateMutation =
    useMutation({
      mutationFn: ({
        id,
        payload,
      }: {
        id: number;
        payload: BudgetPayload;
      }) =>
        updateBudget(
          id,
          payload,
        ),

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["budgets"],
        });

        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        });

        queryClient.invalidateQueries({
          queryKey: ["financial-insights"],
        });

        queryClient.invalidateQueries({
          queryKey: ["notifications"],
        });

        closeModal();
      },

      onError: (error: any) => {
        const errors =
          error?.response?.data?.errors;

        const firstError =
          errors
            ? Object.values(errors)
                .flat()
                .find(Boolean)
            : null;

        setFormError(
          typeof firstError === "string"
            ? firstError
            : error?.response?.data?.message ??
                error?.message ??
                "Unable to update budget.",
        );
      },
    });

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const deleteMutation =
    useMutation({
      mutationFn:
        deleteBudget,

      onSuccess: () => {
        queryClient.invalidateQueries(
          {
            queryKey: [
              "budgets",
            ],
          },
        );

        queryClient.invalidateQueries(
          {
            queryKey: [
              "dashboard",
            ],
          },
        );

        queryClient.invalidateQueries(
          {
            queryKey: [
              "financial-insights",
            ],
          },
        );

        queryClient.invalidateQueries(
          {
            queryKey: [
              "notifications",
            ],
          },
        );
      },
    });

  /*
  |--------------------------------------------------------------------------
  | ACTIVE / INACTIVE
  |--------------------------------------------------------------------------
  */

  const activeBudgets =
    useMemo(
      () =>
        budgets.filter(
          (budget) =>
            budget.is_active,
        ),
      [budgets],
    );
  /*
  |--------------------------------------------------------------------------
  | SUMMARY
  |--------------------------------------------------------------------------
  */

  const totalBudgeted =
    useMemo(
      () =>
        activeBudgets.reduce(
          (sum, budget) =>
            sum +
            Number(
              budget.budget,
            ),
          0,
        ),
      [activeBudgets],
    );

  const totalSpent =
    useMemo(
      () =>
        activeBudgets.reduce(
          (sum, budget) =>
            sum +
            Number(
              budget.spent,
            ),
          0,
        ),
      [activeBudgets],
    );

  const totalRemaining =
    useMemo(
      () =>
        activeBudgets.reduce(
          (sum, budget) =>
            sum +
            Number(
              budget.remaining,
            ),
          0,
        ),
      [activeBudgets],
    );

  const totalOverBudget =
    useMemo(
      () =>
        activeBudgets.reduce(
          (sum, budget) =>
            sum +
            Math.max(
              0,
              Number(
                budget.spent,
              ) -
                Number(
                  budget.budget,
                ),
            ),
          0,
        ),
      [activeBudgets],
    );

  const overallProgress =
    totalBudgeted > 0
      ? (totalSpent /
          totalBudgeted) *
        100
      : 0;

  const overallProgressSafe =
    Math.min(
      100,
      Math.max(
        0,
        overallProgress,
      ),
    );

  /*
  |--------------------------------------------------------------------------
  | FILTERING
  |--------------------------------------------------------------------------
  */

  const filteredBudgets =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return budgets.filter(
        (budget) => {
          const matchesSearch =
            !term ||
            budget.category
              .toLowerCase()
              .includes(term);

          const matchesStatus =
            !statusFilter ||
            budget.status ===
              statusFilter;

          const matchesActivity =
            activityFilter === "" ||
            (activityFilter ===
              "active" &&
              budget.is_active) ||
            (activityFilter ===
              "inactive" &&
              !budget.is_active);

          return (
            matchesSearch &&
            matchesStatus &&
            matchesActivity
          );
        },
      );
    }, [
      budgets,
      search,
      statusFilter,
      activityFilter,
    ]);

  /*
  |--------------------------------------------------------------------------
  | MODAL
  |--------------------------------------------------------------------------
  */

  const openModal = () => {
    if (
      createMutation.isPending ||
      updateMutation.isPending
    ) {
      return;
    }

    setEditingBudgetId(null);
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

  const openEditModal = (
    budget: {
      id: number;
      category_id?: number;
      category: string;
      budget: number;
      start_date: string;
      end_date: string;
      is_active: boolean;
    },
  ) => {
    setFormError("");

    setEditingBudgetId(
      budget.id,
    );

    setForm({
      category_id:
        Number(
          budget.category_id ?? 0,
        ),

      amount:
        Number(budget.budget),

      start_date:
        budget.start_date,

      end_date:
        budget.end_date,

      is_active:
        budget.is_active,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (
      createMutation.isPending ||
      updateMutation.isPending
    ) {
      return;
    }

    setShowModal(false);

    setEditingBudgetId(null);

    setFormError("");
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
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

    const startDate =
      new Date(
        form.start_date,
      );

    const endDate =
      new Date(
        form.end_date,
      );

    if (endDate < startDate) {
      setFormError(
        "End date cannot be before start date.",
      );

      return;
    }

    const payload: BudgetPayload = {
      category_id:
        Number(
          form.category_id,
        ),

      amount:
        Number(form.amount),

      start_date:
        form.start_date,

      end_date:
        form.end_date,

      is_active:
        form.is_active ?? true,
    };

    if (editingBudgetId !== null) {
      updateMutation.mutate({
        id: editingBudgetId,
        payload,
      });

      return;
    }

    createMutation.mutate(
      payload,
    );
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleDelete = (
    budgetId: number,
    category: string,
  ) => {
    const confirmed =
      window.confirm(
        `Delete the ${category} budget? This cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(
      budgetId,
    );
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (budgetsError) {
    return (
      <main className="budgets-page">
        <div className="budgets-error">
          <h2>
            Unable to load budgets
          </h2>

          <p>
            Please check your connection and try
            again.
          </p>

          <button
            onClick={() =>
              queryClient.invalidateQueries(
                {
                  queryKey: [
                    "budgets",
                  ],
                },
              )
            }
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <main className="budgets-page">
      {/* ================================================================
          HEADER
      ================================================================= */}

      <header className="budgets-header">
        <div>
          <p className="budgets-eyebrow">
            FINANCIAL PLANNING
          </p>

          <h1>
            Budgets
          </h1>

          <p className="budgets-subtitle">
            Set spending limits and stay in control
            of your money.
          </p>
        </div>

        <button
          className="add-budget-button"
          onClick={
            openModal
          }
        >
          <span>+</span>

          Create budget
        </button>
      </header>

      {/* ================================================================
          SUMMARY
      ================================================================= */}

      <section className="budget-summary">
        <article className="budget-summary-card featured">
          <div>
            <span>
              Total budgeted
            </span>

            <strong>
              {formatMoney(
                totalBudgeted,
              )}
            </strong>

            <small>
              Across{" "}
              {activeBudgets.length}{" "}
              active budget
              {activeBudgets.length ===
              1
                ? ""
                : "s"}
            </small>
          </div>

          <div className="summary-icon">
            ₦
          </div>
        </article>

        <article className="budget-summary-card">
          <span>
            Total spent
          </span>

          <strong>
            {formatMoney(
              totalSpent,
            )}
          </strong>

          <small>
            {overallProgressSafe.toFixed(
              1,
            )}
            % of active budgets
          </small>
        </article>

        <article className="budget-summary-card">
          <span>
            Remaining
          </span>

          <strong>
            {formatMoney(
              totalRemaining,
            )}
          </strong>

          <small>
            Available across active budgets
          </small>
        </article>

        <article className="budget-summary-card warning-summary">
          <span>
            Over budget
          </span>

          <strong>
            {formatMoney(
              totalOverBudget,
            )}
          </strong>

          <small>
            Combined excess across active budgets
          </small>
        </article>
      </section>

      {/* ================================================================
          OVERALL PROGRESS
      ================================================================= */}

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
            {overallProgressSafe.toFixed(
              1,
            )}
            %
          </strong>
        </div>

        <div className="overall-progress">
          <div
            className={`overall-progress-fill ${
              overallProgress >= 100
                ? "danger"
                : overallProgress >=
                    80
                  ? "warning"
                  : ""
            }`}
            style={{
              width: `${overallProgressSafe}%`,
            }}
          />
        </div>

        <div className="overall-labels">
          <span>
            Spent{" "}
            {formatMoney(
              totalSpent,
            )}
          </span>

          <span>
            Budget{" "}
            {formatMoney(
              totalBudgeted,
            )}
          </span>
        </div>
      </section>

      {/* ================================================================
          WORKSPACE
      ================================================================= */}

      <section className="budgets-workspace">
        <div className="budgets-toolbar">
          <div>
            <h2>
              Your budgets
            </h2>

            <p>
              {filteredBudgets.length}{" "}
              of{" "}
              {budgets.length} budget
              {budgets.length ===
              1
                ? ""
                : "s"}{" "}
              displayed
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
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target
                      .value,
                  )
                }
              />
            </div>

            <select
              value={
                activityFilter
              }
              onChange={(
                event,
              ) =>
                setActivityFilter(
                  event.target
                    .value as
                    | ""
                    | "active"
                    | "inactive",
                )
              }
            >
              <option value="">
                All activity
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

            <select
              value={
                statusFilter
              }
              onChange={(
                event,
              ) =>
                setStatusFilter(
                  event.target
                    .value,
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

        {filteredBudgets.length ===
        0 ? (
          <div className="budgets-empty">
            <div className="empty-budget-icon">
              ₦
            </div>

            <h3>
              {budgets.length ===
              0
                ? "Create your first budget"
                : "No budgets match your filters"}
            </h3>

            <p>
              {budgets.length ===
              0
                ? "Set a category spending limit and start managing your money with intention."
                : "Try another search term or change your activity/status filters."}
            </p>

            {budgets.length ===
            0 ? (
              <button
                onClick={
                  openModal
                }
              >
                Create budget
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearch("");

                  setStatusFilter("");

                  setActivityFilter(
                    "",
                  );
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="budgets-grid">
            {filteredBudgets.map(
              (budget) => {
                const budgetAmount =
                  Number(
                    budget.budget,
                  );

                const spentAmount =
                  Number(
                    budget.spent,
                  );

                const remainingAmount =
                  Number(
                    budget.remaining,
                  );

                const percentage =
                  Math.max(
                    0,
                    Number(
                      budget.progress,
                    ),
                  );

                const progressWidth =
                  Math.min(
                    100,
                    percentage,
                  );

                const overBudget =
                  Math.max(
                    0,
                    spentAmount -
                      budgetAmount,
                  );

                return (
                  <article
                    className={`budget-card ${
                      budget.is_active
                        ? ""
                        : "inactive"
                    }`}
                    key={
                      budget.id
                    }
                  >
                    <div className="budget-card-header">
                      <div className="budget-category-icon">
                        ₦
                      </div>

                      <div className="budget-card-title">
                        <h3>
                          {
                            budget.category
                          }
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
                        {
                          budget.status
                        }
                      </span>
                    </div>

                    <div className="budget-card-amounts">
                      <div>
                        <span>
                          Spent
                        </span>

                        <strong>
                          {formatMoney(
                            spentAmount,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Budget
                        </span>

                        <strong>
                          {formatMoney(
                            budgetAmount,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Remaining
                        </span>

                        <strong
                          className={
                            remainingAmount <=
                            0
                              ? "danger-value"
                              : ""
                          }
                        >
                          {remainingAmount >
                          0
                            ? formatMoney(
                                remainingAmount,
                              )
                            : formatMoney(
                                0,
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
                          width: `${progressWidth}%`,
                        }}
                      />
                    </div>

                    <div className="budget-progress-footer">
                      <span>
                        {Number(
                          budget.progress,
                        ).toFixed(
                          1,
                        )}
                        % used
                      </span>

                      <span
                        className={
                          budget.is_active
                            ? "active-label"
                            : "inactive-label"
                        }
                      >
                        {budget.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <div
                      className={`budget-card-footer ${
                        budget.status ===
                        "Exceeded"
                          ? "exceeded-footer"
                          : budget.status ===
                              "Near Limit"
                            ? "warning-footer"
                            : ""
                      }`}
                    >
                      <span>
                        {getStatusMessage(
                          budget.status,
                          spentAmount,
                          budgetAmount,
                        )}

                        {budget.status ===
                          "Exceeded" &&
                          overBudget >
                            0 && (
                            <>
                              {" "}
                              ({formatMoney(
                                overBudget,
                              )}{" "}
                              excess)
                            </>
                          )}
                      </span>

                      <div className="budget-card-actions">
                        <button
                          className="budget-edit-button"
                          type="button"
                          onClick={() =>
                            openEditModal(
                              budget,
                            )
                          }
                          disabled={
                            deleteMutation.isPending ||
                            updateMutation.isPending
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="budget-delete-button"
                          type="button"
                          onClick={() =>
                            handleDelete(
                              budget.id,
                              budget.category,
                            )
                          }
                          disabled={
                            deleteMutation.isPending ||
                            updateMutation.isPending
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>

      {/* ================================================================
          CREATE MODAL
      ================================================================= */}

      {showModal && (
        <div
          className="budget-modal-backdrop"
          onMouseDown={(
            event,
          ) => {
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
                <p>
                  BUDGET PLANNER
                </p>

                <h2 id="budget-modal-title">
                  {editingBudgetId !== null
                    ? "Edit budget"
                    : "Create budget"}
                </h2>
              </div>

              <button
                className="budget-modal-close"
                onClick={
                  closeModal
                }
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
              onSubmit={
                handleSubmit
              }
            >
              <div className="budget-field">
                <label htmlFor="budget-category">
                  Expense category
                </label>

                <select
                  id="budget-category"
                  value={
                    form.category_id ||
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      category_id:
                        Number(
                          event
                            .target
                            .value,
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
                    (
                      category: Category,
                    ) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
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
                    form.amount ||
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      amount:
                        Number(
                          event
                            .target
                            .value,
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
                    onChange={(
                      event,
                    ) =>
                      setForm({
                        ...form,
                        start_date:
                          event
                            .target
                            .value,
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
                    onChange={(
                      event,
                    ) =>
                      setForm({
                        ...form,
                        end_date:
                          event
                            .target
                            .value,
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
                    form.is_active ??
                    true
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      is_active:
                        event
                          .target
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
                  onClick={
                    closeModal
                  }
                  disabled={
                    createMutation.isPending ||
                    updateMutation.isPending
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="budget-submit"
                  disabled={
                    createMutation.isPending ||
                    updateMutation.isPending ||
                    categoriesLoading
                  }
                >
                  {createMutation.isPending ||
                  updateMutation.isPending
                    ? editingBudgetId !== null
                      ? "Saving..."
                      : "Creating..."
                    : editingBudgetId !== null
                      ? "Save changes"
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