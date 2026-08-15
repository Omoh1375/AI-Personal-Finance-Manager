import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { getAccounts } from "../api/accounts";
import {
  createSavingsDeposit,
  createSavingsGoal,
  deleteSavingsGoal,
  deleteSavingsDeposit,
  getSavingsDeposits,
  getSavingsGoals,
} from "../api/savings";

import type {
  SavingsDepositPayload,
  SavingsGoalPayload,
} from "../types/savings";

import "./Savings.css";

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

function dateInputValue() {
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

function futureDate() {
  const date = new Date();

  date.setMonth(date.getMonth() + 3);

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function statusClass(status: string) {
  switch (status) {
    case "Completed":
      return "savings-status completed";

    case "Almost There":
      return "savings-status almost";

    default:
      return "savings-status progress";
  }
}

export default function Savings() {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] =
    useState<"goals" | "history">("goals");

  const [showGoalModal, setShowGoalModal] =
    useState(false);

  const [showDepositModal, setShowDepositModal] =
    useState(false);

  const [selectedGoalId, setSelectedGoalId] =
    useState<number | null>(null);

  const [search, setSearch] =
    useState("");

  const [goalError, setGoalError] =
    useState("");

  const [depositError, setDepositError] =
    useState("");

  const [goalForm, setGoalForm] =
    useState<SavingsGoalPayload>({
      account_id: 0,
      name: "",
      target_amount: 0,
      target_date: futureDate(),
      description: "",
      is_completed: false,
    });

  const [depositForm, setDepositForm] =
    useState<SavingsDepositPayload>({
      savings_goal_id: 0,
      account_id: 0,
      amount: 0,
      reference: "",
      description: "",
      deposited_at: dateInputValue(),
    });

  const {
    data: goals = [],
    isLoading: goalsLoading,
    isError: goalsError,
  } = useQuery({
    queryKey: ["savings-goals"],
    queryFn: getSavingsGoals,
  });

  const {
    data: deposits = [],
    isLoading: depositsLoading,
    isError: depositsError,
  } = useQuery({
    queryKey: ["savings-deposits"],
    queryFn: getSavingsDeposits,
  });

  const {
    data: accounts = [],
    isLoading: accountsLoading,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const createGoalMutation = useMutation({
    mutationFn: createSavingsGoal,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["savings-goals"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      closeGoalModal();
    },

    onError: (error: any) => {
      const errors =
        error?.response?.data?.errors;

      const firstError = errors
        ? Object.values(errors)
            .flat()
            .find(Boolean)
        : null;

      setGoalError(
        typeof firstError === "string"
          ? firstError
          : error?.response?.data?.message ??
              error?.message ??
              "Unable to create savings goal.",
      );
    },
  });

  const createDepositMutation = useMutation({
    mutationFn: createSavingsDeposit,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["savings-goals"],
      });

      queryClient.invalidateQueries({
        queryKey: ["savings-deposits"],
      });

      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      closeDepositModal();
    },

    onError: (error: any) => {
      const errors =
        error?.response?.data?.errors;

      const firstError = errors
        ? Object.values(errors)
            .flat()
            .find(Boolean)
        : null;

      setDepositError(
        typeof firstError === "string"
          ? firstError
          : error?.response?.data?.message ??
              error?.message ??
              "Unable to make savings deposit.",
      );
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: deleteSavingsGoal,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["savings-goals"],
      });
    },
  });

  const deleteDepositMutation = useMutation({
    mutationFn: deleteSavingsDeposit,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["savings-goals"],
      });

      queryClient.invalidateQueries({
        queryKey: ["savings-deposits"],
      });

      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });

  const totalTarget = useMemo(
    () =>
      goals.reduce(
        (sum, goal) =>
          sum + Number(goal.target_amount),
        0,
      ),
    [goals],
  );

  const totalSaved = useMemo(
    () =>
      goals.reduce(
        (sum, goal) =>
          sum + Number(goal.saved),
        0,
      ),
    [goals],
  );

  const totalRemaining = useMemo(
    () =>
      goals.reduce(
        (sum, goal) =>
          sum + Number(goal.remaining),
        0,
      ),
    [goals],
  );

  const overallProgress =
    totalTarget > 0
      ? Math.min(
          100,
          (totalSaved / totalTarget) * 100,
        )
      : 0;

  const filteredGoals = useMemo(() => {
    const term =
      search.trim().toLowerCase();

    if (!term) {
      return goals;
    }

    return goals.filter((goal) =>
      goal.name
        .toLowerCase()
        .includes(term),
    );
  }, [goals, search]);

  const selectedGoal = goals.find(
    (goal) =>
      goal.id === selectedGoalId,
  );

  const selectedAccount = accounts.find(
    (account) =>
      account.id ===
      Number(depositForm.account_id),
  );

  const isLoading =
    goalsLoading ||
    depositsLoading ||
    accountsLoading;

  const openGoalModal = () => {
    setGoalError("");

    setGoalForm({
      account_id:
        accounts[0]?.id ?? 0,
      name: "",
      target_amount: 0,
      target_date: futureDate(),
      description: "",
      is_completed: false,
    });

    setShowGoalModal(true);
  };

  const closeGoalModal = () => {
    setShowGoalModal(false);
    setGoalError("");
  };

  const openDepositModal = (
    goalId: number,
  ) => {
    setSelectedGoalId(goalId);

    setDepositError("");

    setDepositForm({
      savings_goal_id: goalId,
      account_id:
        accounts[0]?.id ?? 0,
      amount: 0,
      reference: "",
      description: "",
      deposited_at: dateInputValue(),
    });

    setShowDepositModal(true);
  };

  const closeDepositModal = () => {
    setShowDepositModal(false);
    setSelectedGoalId(null);
    setDepositError("");
  };

  const handleCreateGoal = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setGoalError("");

    if (!goalForm.account_id) {
      setGoalError(
        "Please select the account associated with this savings goal.",
      );
      return;
    }

    if (!goalForm.name.trim()) {
      setGoalError(
        "Please enter a goal name.",
      );
      return;
    }

    if (
      !goalForm.target_amount ||
      goalForm.target_amount <= 0
    ) {
      setGoalError(
        "Target amount must be greater than zero.",
      );
      return;
    }

    if (!goalForm.target_date) {
      setGoalError(
        "Please select a target date.",
      );
      return;
    }

    createGoalMutation.mutate({
      ...goalForm,
      name: goalForm.name.trim(),
      target_amount: Number(
        goalForm.target_amount,
      ),
      description:
        goalForm.description?.trim() ||
        undefined,
    });
  };

  const handleDeposit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setDepositError("");

    if (!depositForm.account_id) {
      setDepositError(
        "Please select an account.",
      );
      return;
    }

    if (!depositForm.savings_goal_id) {
      setDepositError(
        "Please select a savings goal.",
      );
      return;
    }

    if (
      !depositForm.amount ||
      depositForm.amount <= 0
    ) {
      setDepositError(
        "Deposit amount must be greater than zero.",
      );
      return;
    }

    if (
      selectedAccount &&
      Number(selectedAccount.balance) <
        Number(depositForm.amount)
    ) {
      setDepositError(
        "The selected account does not have enough balance.",
      );
      return;
    }

    createDepositMutation.mutate({
      ...depositForm,
      amount: Number(
        depositForm.amount,
      ),
      reference:
        depositForm.reference?.trim() ||
        undefined,
      description:
        depositForm.description?.trim() ||
        undefined,
    });
  };

  const handleDeleteGoal = (
    goalId: number,
    goalName: string,
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${goalName}"? This will remove the savings goal and its associated deposits.`,
      );

    if (!confirmed) {
      return;
    }

    deleteGoalMutation.mutate(goalId);
  };

  const handleDeleteDeposit = (
    depositId: number,
  ) => {
    const confirmed =
      window.confirm(
        "Delete this savings deposit? The amount will be returned to the account.",
      );

    if (!confirmed) {
      return;
    }

    deleteDepositMutation.mutate(
      depositId,
    );
  };

  if (isLoading) {
    return (
      <main className="savings-page">
        <div className="savings-loading">
          <div className="savings-spinner" />
          <p>
            Loading your savings...
          </p>
        </div>
      </main>
    );
  }

  if (goalsError || depositsError) {
    return (
      <main className="savings-page">
        <div className="savings-error">
          <h2>
            Unable to load savings
          </h2>

          <p>
            Please check your connection and
            try again.
          </p>

          <button
            onClick={() => {
              queryClient.invalidateQueries({
                queryKey: ["savings-goals"],
              });

              queryClient.invalidateQueries({
                queryKey: ["savings-deposits"],
              });
            }}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="savings-page">
      <header className="savings-header">
        <div>
          <p className="savings-eyebrow">
            SAVINGS PLANNER
          </p>

          <h1>Savings Goals</h1>

          <p className="savings-subtitle">
            Turn your plans into real financial
            milestones.
          </p>
        </div>

        <button
          className="create-goal-button"
          onClick={openGoalModal}
          disabled={accounts.length === 0}
        >
          <span>+</span>
          Create goal
        </button>
      </header>

      <section className="savings-summary">
        <article className="savings-summary-card featured">
          <div>
            <span>Total target</span>

            <strong>
              {formatMoney(totalTarget)}
            </strong>

            <small>
              Across {goals.length} goal
              {goals.length === 1
                ? ""
                : "s"}
            </small>
          </div>

          <div className="savings-summary-icon">
            ◎
          </div>
        </article>

        <article className="savings-summary-card">
          <span>Total saved</span>

          <strong>
            {formatMoney(totalSaved)}
          </strong>

          <small>
            {overallProgress.toFixed(1)}% of
            total target
          </small>
        </article>

        <article className="savings-summary-card">
          <span>Remaining</span>

          <strong>
            {formatMoney(totalRemaining)}
          </strong>

          <small>
            Still needed to reach your goals
          </small>
        </article>
      </section>

      <section className="savings-progress-card">
        <div className="savings-progress-heading">
          <div>
            <h2>
              Overall savings progress
            </h2>

            <p>
              Progress across all your goals
            </p>
          </div>

          <strong>
            {overallProgress.toFixed(1)}%
          </strong>
        </div>

        <div className="savings-progress-track">
          <div
            className="savings-progress-fill"
            style={{
              width: `${overallProgress}%`,
            }}
          />
        </div>

        <div className="savings-progress-labels">
          <span>
            Saved {formatMoney(totalSaved)}
          </span>

          <span>
            Target {formatMoney(totalTarget)}
          </span>
        </div>
      </section>

      <section className="savings-workspace">
        <div className="savings-toolbar">
          <div className="savings-tabs">
            <button
              className={
                activeTab === "goals"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("goals")
              }
            >
              Goals
            </button>

            <button
              className={
                activeTab === "history"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("history")
              }
            >
              Deposit history
            </button>
          </div>

          {activeTab === "goals" ? (
            <div className="savings-search">
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
                placeholder="Search goals..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
              />
            </div>
          ) : null}
        </div>

        {activeTab === "goals" ? (
          filteredGoals.length === 0 ? (
            <div className="savings-empty">
              <div className="empty-savings-icon">
                ◎
              </div>

              <h3>
                {goals.length === 0
                  ? "Create your first savings goal"
                  : "No matching goals"}
              </h3>

              <p>
                {goals.length === 0
                  ? "Choose something important to you and start building towards it."
                  : "Try another search term."}
              </p>

              {goals.length === 0 && (
                <button
                  onClick={openGoalModal}
                  disabled={
                    accounts.length === 0
                  }
                >
                  Create savings goal
                </button>
              )}
            </div>
          ) : (
            <div className="savings-goals-grid">
              {filteredGoals.map(
                (goal) => {
                  const progress =
                    Math.min(
                      100,
                      Math.max(
                        0,
                        Number(
                          goal.progress,
                        ),
                      ),
                    );

                  return (
                    <article
                      className="savings-goal-card"
                      key={goal.id}
                    >
                      <div className="goal-card-header">
                        <div className="goal-icon">
                          ◎
                        </div>

                        <div className="goal-title">
                          <h3>
                            {goal.name}
                          </h3>

                          <span>
                            Target date{" "}
                            {formatDate(
                              goal.target_date,
                            )}
                          </span>
                        </div>

                        <span
                          className={statusClass(
                            goal.status,
                          )}
                        >
                          {goal.status}
                        </span>
                      </div>

                      <div className="goal-card-values">
                        <div>
                          <span>Saved</span>

                          <strong>
                            {formatMoney(
                              goal.saved,
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Target</span>

                          <strong>
                            {formatMoney(
                              goal.target_amount,
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Remaining</span>

                          <strong>
                            {formatMoney(
                              goal.remaining,
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className="goal-progress-track">
                        <div
                          className="goal-progress-fill"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>

                      <div className="goal-progress-labels">
                        <span>
                          {Number(
                            goal.progress,
                          ).toFixed(1)}
                          % complete
                        </span>

                        <span>
                          {goal.account ??
                            "No account"}
                        </span>
                      </div>

                      {goal.description && (
                        <p className="goal-description">
                          {goal.description}
                        </p>
                      )}

                      <div className="goal-card-actions">
                        {goal.status !==
                          "Completed" && (
                          <button
                            className="deposit-button"
                            onClick={() =>
                              openDepositModal(
                                goal.id,
                              )
                            }
                            disabled={
                              accounts.length ===
                              0
                            }
                          >
                            + Deposit
                          </button>
                        )}

                        <button
                          className="delete-goal-button"
                          onClick={() =>
                            handleDeleteGoal(
                              goal.id,
                              goal.name,
                            )
                          }
                          disabled={
                            deleteGoalMutation.isPending
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
          )
        ) : deposits.length === 0 ? (
          <div className="savings-empty">
            <div className="empty-savings-icon">
              ₦
            </div>

            <h3>
              No deposits yet
            </h3>

            <p>
              Your savings contributions will
              appear here.
            </p>
          </div>
        ) : (
          <div className="deposit-history">
            {deposits.map((deposit) => (
              <article
                className="deposit-history-row"
                key={deposit.id}
              >
                <div className="deposit-history-icon">
                  ↑
                </div>

                <div className="deposit-history-main">
                  <strong>
                    {deposit.goal?.name ??
                      "Savings goal"}
                  </strong>

                  <span>
                    From{" "}
                    {deposit.account?.name ??
                      "Account"}
                  </span>

                  {deposit.description && (
                    <small>
                      {deposit.description}
                    </small>
                  )}
                </div>

                <div className="deposit-history-date">
                  {formatDate(
                    deposit.deposited_at,
                  )}
                </div>

                <div className="deposit-history-amount">
                  +
                  {formatMoney(
                    deposit.amount,
                  )}
                </div>

                <button
                  className="delete-deposit-button"
                  onClick={() =>
                    handleDeleteDeposit(
                      deposit.id,
                    )
                  }
                  disabled={
                    deleteDepositMutation.isPending
                  }
                >
                  ×
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {showGoalModal && (
        <div
          className="savings-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeGoalModal();
            }
          }}
        >
          <div
            className="savings-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="goal-modal-title"
          >
            <div className="savings-modal-heading">
              <div>
                <p>SAVINGS GOAL</p>

                <h2 id="goal-modal-title">
                  Create goal
                </h2>
              </div>

              <button
                className="savings-modal-close"
                onClick={closeGoalModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {goalError && (
              <div className="savings-form-error">
                {goalError}
              </div>
            )}

            <form
              onSubmit={handleCreateGoal}
            >
              <div className="savings-field">
                <label htmlFor="goal-account">
                  Account
                </label>

                <select
                  id="goal-account"
                  value={
                    goalForm.account_id || ""
                  }
                  onChange={(event) =>
                    setGoalForm({
                      ...goalForm,
                      account_id:
                        Number(
                          event.target.value,
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

              <div className="savings-field">
                <label htmlFor="goal-name">
                  Goal name
                </label>

                <input
                  id="goal-name"
                  type="text"
                  value={goalForm.name}
                  onChange={(event) =>
                    setGoalForm({
                      ...goalForm,
                      name: event.target
                        .value,
                    })
                  }
                  placeholder="e.g. New laptop"
                  required
                />
              </div>

              <div className="savings-field">
                <label htmlFor="goal-target">
                  Target amount
                </label>

                <input
                  id="goal-target"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    goalForm.target_amount ||
                    ""
                  }
                  onChange={(event) =>
                    setGoalForm({
                      ...goalForm,
                      target_amount:
                        Number(
                          event.target.value,
                        ),
                    })
                  }
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="savings-field">
                <label htmlFor="goal-date">
                  Target date
                </label>

                <input
                  id="goal-date"
                  type="date"
                  value={
                    goalForm.target_date
                  }
                  onChange={(event) =>
                    setGoalForm({
                      ...goalForm,
                      target_date:
                        event.target
                          .value,
                    })
                  }
                  required
                />
              </div>

              <div className="savings-field">
                <label htmlFor="goal-description">
                  Description
                </label>

                <textarea
                  id="goal-description"
                  rows={3}
                  value={
                    goalForm.description ??
                    ""
                  }
                  onChange={(event) =>
                    setGoalForm({
                      ...goalForm,
                      description:
                        event.target.value,
                    })
                  }
                  placeholder="What are you saving for?"
                />
              </div>

              <div className="savings-modal-actions">
                <button
                  type="button"
                  className="savings-cancel"
                  onClick={closeGoalModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="savings-submit"
                  disabled={
                    createGoalMutation.isPending ||
                    accounts.length === 0
                  }
                >
                  {createGoalMutation.isPending
                    ? "Creating..."
                    : "Create goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDepositModal &&
        selectedGoal && (
          <div
            className="savings-modal-backdrop"
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
              className="savings-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="deposit-modal-title"
            >
              <div className="savings-modal-heading">
                <div>
                  <p>
                    SAVINGS CONTRIBUTION
                  </p>

                  <h2 id="deposit-modal-title">
                    Deposit into{" "}
                    {selectedGoal.name}
                  </h2>
                </div>

                <button
                  className="savings-modal-close"
                  onClick={
                    closeDepositModal
                  }
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {depositError && (
                <div className="savings-form-error">
                  {depositError}
                </div>
              )}

              <div className="selected-goal-preview">
                <span>
                  Goal progress
                </span>

                <strong>
                  {formatMoney(
                    selectedGoal.saved,
                  )}{" "}
                  /{" "}
                  {formatMoney(
                    selectedGoal.target_amount,
                  )}
                </strong>
              </div>

              <form
                onSubmit={handleDeposit}
              >
                <div className="savings-field">
                  <label htmlFor="deposit-account">
                    Source account
                  </label>

                  <select
                    id="deposit-account"
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

                {selectedAccount && (
                  <div className="selected-account-balance">
                    Available balance:{" "}
                    <strong>
                      {formatMoney(
                        selectedAccount.balance,
                        selectedAccount.currency,
                      )}
                    </strong>
                  </div>
                )}

                <div className="savings-field">
                  <label htmlFor="deposit-amount">
                    Deposit amount
                  </label>

                  <input
                    id="deposit-amount"
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

                <div className="savings-field">
                  <label htmlFor="deposit-date">
                    Deposit date
                  </label>

                  <input
                    id="deposit-date"
                    type="date"
                    value={
                      depositForm.deposited_at
                    }
                    onChange={(event) =>
                      setDepositForm({
                        ...depositForm,
                        deposited_at:
                          event.target
                            .value,
                      })
                    }
                    required
                  />
                </div>

                <div className="savings-field">
                  <label htmlFor="deposit-reference">
                    Reference
                  </label>

                  <input
                    id="deposit-reference"
                    type="text"
                    value={
                      depositForm.reference ??
                      ""
                    }
                    onChange={(event) =>
                      setDepositForm({
                        ...depositForm,
                        reference:
                          event.target
                            .value,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>

                <div className="savings-field">
                  <label htmlFor="deposit-description">
                    Description
                  </label>

                  <textarea
                    id="deposit-description"
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

                <div className="savings-modal-actions">
                  <button
                    type="button"
                    className="savings-cancel"
                    onClick={
                      closeDepositModal
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="savings-submit"
                    disabled={
                      createDepositMutation.isPending ||
                      accounts.length === 0
                    }
                  >
                    {createDepositMutation.isPending
                      ? "Depositing..."
                      : "Make deposit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </main>
  );
}