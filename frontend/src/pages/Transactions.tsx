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

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  createTransfer,
  deleteTransfer,
  getTransfers,
} from "../api/transfers";

import {
  getCategories,
} from "../api/categories";

import {
  getAccounts,
} from "../api/accounts";

import type {
  CategoryType,
} from "../types/category";

import type {
  IncomePayload,
  ExpensePayload,
  Transaction,
} from "../types/transaction";

import type {
  Transfer,
  TransferPayload,
} from "../types/transfer";

import "./Transactions.css";

const getIncomes = async (): Promise<Transaction[]> => {
  const response = await fetch("/api/incomes", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to load incomes.");
  }

  const body = await response.json();
  return Array.isArray(body) ? body : body.data ?? [];
};

const getExpenses = async (): Promise<Transaction[]> => {
  const response = await fetch("/api/expenses", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to load expenses.");
  }

  const body = await response.json();
  return Array.isArray(body) ? body : body.data ?? [];
};

const createIncome = async (
  payload: IncomePayload,
): Promise<Transaction> => {
  const response = await fetch("/api/incomes", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to create income.");
  }

  const body = await response.json();
  return body?.data ?? body;
};

const updateIncome = async (
  id: number,
  payload: IncomePayload,
): Promise<Transaction> => {
  const response = await fetch(`/api/incomes/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to update income.");
  }

  const body = await response.json();
  return body?.data ?? body;
};

const createExpense = async (
  payload: ExpensePayload,
): Promise<Transaction> => {
  const response = await fetch("/api/expenses", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to create expense.");
  }

  const body = await response.json();
  return body?.data ?? body;
};

const updateExpense = async (
  id: number,
  payload: ExpensePayload,
): Promise<Transaction> => {
  const response = await fetch(`/api/expenses/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Unable to update expense.");
  }

  const body = await response.json();
  return body?.data ?? body;
};

const deleteIncome = async (id: number): Promise<void> => {
  const response = await fetch(`/api/incomes/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to delete income.");
  }
};

const deleteExpense = async (id: number): Promise<void> => {
  const response = await fetch(`/api/expenses/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to delete expense.");
  }
};

type TransactionView =
  | "all"
  | "income"
  | "expense"
  | "transfer";

interface UnifiedTransaction {
  id: string;
  numericId: number;

  kind:
    | "income"
    | "expense"
    | "transfer";

  title: string;
  subtitle: string;
  account: string;
  date: string;
  amount: number;

  reference?: string | null;

  original:
    | Transaction
    | Transfer;
}

interface TransactionForm {
  account_id: string;
  category_id: string;
  amount: string;
  reference: string;
  merchant: string;
  description: string;
  date: string;
  from_account_id: string;
  to_account_id: string;
}

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
  ).format(
    Number(value) || 0,
  );
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

function formatDateInput(
  date = new Date(),
) {
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

function getInitialView(
  pathname: string,
): TransactionView {
  if (pathname === "/income") {
    return "income";
  }

  if (
    pathname === "/expenses"
  ) {
    return "expense";
  }

  if (
    pathname === "/transfers"
  ) {
    return "transfer";
  }

  return "all";
}

function getViewLabel(
  view: TransactionView,
) {
  switch (view) {
    case "income":
      return "Income";

    case "expense":
      return "Expenses";

    case "transfer":
      return "Transfers";

    default:
      return "All";
  }
}

export default function Transactions() {
  const queryClient =
    useQueryClient();

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const [view, setView] =
    useState<TransactionView>(
      () =>
        getInitialView(
          location.pathname,
        ),
    );

  const [
    showModal,
    setShowModal,
  ] = useState(false);

  const [search, setSearch] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("");

  const [
    selectedAccount,
    setSelectedAccount,
  ] = useState("");

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    transactionForm,
    setTransactionForm,
  ] =
    useState<TransactionForm>({
      account_id: "",
      category_id: "",
      amount: "",
      reference: "",
      merchant: "",
      description: "",
      date: formatDateInput(),
      from_account_id: "",
      to_account_id: "",
    });

  const [editingTransaction, setEditingTransaction] =
    useState<UnifiedTransaction | null>(null);

  /*
  |--------------------------------------------------------------------------
  | DATA
  |--------------------------------------------------------------------------
  */

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
    data: transfers = [],
    isLoading: transfersLoading,
  } = useQuery({
    queryKey: ["transfers"],
    queryFn: getTransfers,
  });

  const {
    data: accounts = [],
    isLoading: accountsLoading,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const categoryType: CategoryType =
    view === "expense"
      ? "expense"
      : "income";

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: [
      "categories",
      categoryType,
    ],

    queryFn: () =>
      getCategories(
        categoryType,
      ),

    enabled:
      view === "income" ||
      view === "expense",
  });

  /*
  |--------------------------------------------------------------------------
  | ROUTE / TAB
  |--------------------------------------------------------------------------
  */

  const changeView = (
    nextView: TransactionView,
  ) => {
    setView(nextView);

    setSelectedCategory("");

    setSelectedAccount("");

    if (nextView === "income") {
      navigate("/income");
      return;
    }

    if (nextView === "expense") {
      navigate("/expenses");
      return;
    }

    if (
      nextView === "transfer"
    ) {
      navigate("/transfers");
      return;
    }

    navigate("/transactions");
  };

  /*
  |--------------------------------------------------------------------------
  | UNIFIED TRANSACTIONS
  |--------------------------------------------------------------------------
  */

  const unifiedTransactions =
    useMemo<
      UnifiedTransaction[]
    >(
      () => {
        const result: UnifiedTransaction[] =
          [];

        for (
          const transaction of incomes
        ) {
          result.push({
            id: `income-${transaction.id}`,

            numericId:
              transaction.id,

            kind: "income",

            title:
              transaction
                .category
                ?.name ??
              "Income",

            subtitle:
              transaction
                .description ??
              transaction
                .reference ??
              "Income received",

            account:
              transaction
                .account
                ?.name ??
              "Account",

            date:
              transaction.received_at ??
              "",

            amount: Number(
              transaction.amount,
            ),

            reference:
              transaction.reference,

            original:
              transaction,
          });
        }

        for (
          const transaction of expenses
        ) {
          result.push({
            id: `expense-${transaction.id}`,

            numericId:
              transaction.id,

            kind: "expense",

            title:
              transaction
                .category
                ?.name ??
              "Expense",

            subtitle:
              transaction.merchant ??
              transaction.description ??
              transaction.reference ??
              "Expense",

            account:
              transaction
                .account
                ?.name ??
              "Account",

            date:
              transaction.spent_at ??
              "",

            amount: Number(
              transaction.amount,
            ),

            reference:
              transaction.reference,

            original:
              transaction,
          });
        }

        for (
          const transfer of transfers
        ) {
          const fromAccount =
            transfer
              .from_account
              ?.name ??
            "Account";

          const toAccount =
            transfer
              .to_account
              ?.name ??
            "Account";

          result.push({
            id: `transfer-${transfer.id}`,

            numericId:
              transfer.id,

            kind: "transfer",

            title: "Transfer",

            subtitle:
              transfer.description ??
              `${fromAccount} → ${toAccount}`,

            account:
              `${fromAccount} → ${toAccount}`,

            date:
              transfer.transferred_at,

            amount: Number(
              transfer.amount,
            ),

            reference:
              transfer.reference,

            original:
              transfer,
          });
        }

        return result.sort(
          (a, b) =>
            new Date(
              b.date,
            ).getTime() -
            new Date(
              a.date,
            ).getTime(),
        );
      },
      [
        incomes,
        expenses,
        transfers,
      ],
    );

  /*
  |--------------------------------------------------------------------------
  | FILTERING
  |--------------------------------------------------------------------------
  */

  const filteredTransactions =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return unifiedTransactions.filter(
        (transaction) => {
          const matchesView =
            view === "all" ||
            transaction.kind ===
              view;

          const matchesSearch =
            !term ||
            transaction.title
              .toLowerCase()
              .includes(term) ||
            transaction.subtitle
              .toLowerCase()
              .includes(term) ||
            transaction.account
              .toLowerCase()
              .includes(term) ||
            (
              transaction.reference ??
              ""
            )
              .toLowerCase()
              .includes(term);

          let matchesCategory =
            true;

          if (
            selectedCategory &&
            transaction.kind !==
              "transfer"
          ) {
            matchesCategory =
              String(
                (
                  transaction.original as Transaction
                )
                  .category_id,
              ) ===
              selectedCategory;
          }

          let matchesAccount =
            true;

          if (selectedAccount) {
            if (
              transaction.kind ===
              "transfer"
            ) {
              const transfer =
                transaction.original as Transfer;

              matchesAccount =
                String(
                  transfer.from_account_id,
                ) ===
                  selectedAccount ||
                String(
                  transfer.to_account_id,
                ) ===
                  selectedAccount;
            } else {
              const item =
                transaction.original as Transaction;

              matchesAccount =
                String(
                  item.account_id,
                ) ===
                selectedAccount;
            }
          }

          return (
            matchesView &&
            matchesSearch &&
            matchesCategory &&
            matchesAccount
          );
        },
      );
    }, [
      unifiedTransactions,
      view,
      search,
      selectedCategory,
      selectedAccount,
    ]);

  /*
  |--------------------------------------------------------------------------
  | SUMMARY
  |--------------------------------------------------------------------------
  */

  const summary =
    useMemo(() => {
      const incomeTotal =
        filteredTransactions
          .filter(
            (item) =>
              item.kind ===
              "income",
          )
          .reduce(
            (sum, item) =>
              sum + item.amount,
            0,
          );

      const expenseTotal =
        filteredTransactions
          .filter(
            (item) =>
              item.kind ===
              "expense",
          )
          .reduce(
            (sum, item) =>
              sum + item.amount,
            0,
          );

      const transferTotal =
        filteredTransactions
          .filter(
            (item) =>
              item.kind ===
              "transfer",
          )
          .reduce(
            (sum, item) =>
              sum + item.amount,
            0,
          );

      return {
        count:
          filteredTransactions.length,

        incomeTotal,

        expenseTotal,

        transferTotal,
      };
    }, [
      filteredTransactions,
    ]);

  /*
  |--------------------------------------------------------------------------
  | REFRESH FINANCIAL DATA
  |--------------------------------------------------------------------------
  */

  const invalidateFinancialData =
    () => {
      queryClient.invalidateQueries({
        queryKey: [
          "incomes",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "expenses",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "transfers",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "accounts",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "dashboard",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "budgets",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "financial-insights",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "statements",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "notifications",
        ],
      });
    };

  /*
  |--------------------------------------------------------------------------
  | CREATE / UPDATE
  |--------------------------------------------------------------------------
  */

  const saveMutation =
    useMutation({
      mutationFn: async () => {
        const amount = Number(
          transactionForm.amount,
        );

        if (!amount || amount <= 0) {
          throw new Error(
            "Please enter a valid amount.",
          );
        }

        if (view === "transfer") {
          if (!transactionForm.from_account_id) {
            throw new Error(
              "Please select the source account.",
            );
          }

          if (!transactionForm.to_account_id) {
            throw new Error(
              "Please select the destination account.",
            );
          }

          if (
            transactionForm.from_account_id ===
            transactionForm.to_account_id
          ) {
            throw new Error(
              "Source and destination accounts must be different.",
            );
          }

          const fromAccount = accounts.find(
            (account) =>
              account.id ===
              Number(transactionForm.from_account_id),
          );

          const toAccount = accounts.find(
            (account) =>
              account.id ===
              Number(transactionForm.to_account_id),
          );

          if (
            fromAccount &&
            Number(fromAccount.balance) < amount &&
            !editingTransaction
          ) {
            throw new Error(
              "Insufficient balance in the source account.",
            );
          }

          if (
            fromAccount &&
            toAccount &&
            fromAccount.currency !== toAccount.currency
          ) {
            throw new Error(
              `Cross-currency transfers are not supported. Both accounts must use the same currency (${fromAccount.currency}).`,
            );
          }

          if (editingTransaction) {
            throw new Error(
              "Transfer editing is not available in this screen yet.",
            );
          }

          const payload: TransferPayload = {
            from_account_id: Number(
              transactionForm.from_account_id,
            ),
            to_account_id: Number(
              transactionForm.to_account_id,
            ),
            amount,
            reference:
              transactionForm.reference.trim() ||
              undefined,
            description:
              transactionForm.description.trim() ||
              undefined,
            transferred_at:
              transactionForm.date,
          };

          return createTransfer(payload);
        }

        if (!transactionForm.account_id) {
          throw new Error(
            "Please select an account.",
          );
        }

        if (!transactionForm.category_id) {
          throw new Error(
            "Please select a category.",
          );
        }

        if (view === "income") {
          const payload: IncomePayload = {
            account_id: Number(
              transactionForm.account_id,
            ),
            category_id: Number(
              transactionForm.category_id,
            ),
            amount,
            reference:
              transactionForm.reference.trim() ||
              undefined,
            description:
              transactionForm.description.trim() ||
              undefined,
            received_at:
              transactionForm.date,
          };

          return editingTransaction
            ? updateIncome(
                editingTransaction.numericId,
                payload,
              )
            : createIncome(payload);
        }

        const payload: ExpensePayload = {
          account_id: Number(
            transactionForm.account_id,
          ),
          category_id: Number(
            transactionForm.category_id,
          ),
          amount,
          reference:
            transactionForm.reference.trim() ||
            undefined,
          merchant:
            transactionForm.merchant.trim() ||
            undefined,
          description:
            transactionForm.description.trim() ||
            undefined,
          spent_at:
            transactionForm.date,
        };

        return editingTransaction
          ? updateExpense(
              editingTransaction.numericId,
              payload,
            )
          : createExpense(payload);
      },

      onSuccess: () => {
        invalidateFinancialData();
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
            : error?.response?.data?.message ??
                error?.message ??
                "Unable to save this transaction.",
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
      mutationFn: async ({
        id,
        kind,
      }: {
        id: number;

        kind:
          | "income"
          | "expense"
          | "transfer";
      }) => {
        if (
          kind === "income"
        ) {
          return deleteIncome(
            id,
          );
        }

        if (
          kind === "expense"
        ) {
          return deleteExpense(
            id,
          );
        }

        return deleteTransfer(
          id,
        );
      },

      onSuccess: () => {
        invalidateFinancialData();
      },

      onError: (
        error: any,
      ) => {
        window.alert(
          error?.response
            ?.data
            ?.message ??
            "Unable to delete this transaction.",
        );
      },
    });

  /*
  |--------------------------------------------------------------------------
  | MODAL
  |--------------------------------------------------------------------------
  */

  const closeModal = () => {
    if (saveMutation.isPending) {
      return;
    }

    setShowModal(false);
    setEditingTransaction(null);

    setFormError("");

    setTransactionForm({
      account_id: "",
      category_id: "",
      amount: "",
      reference: "",
      merchant: "",
      description: "",
      date: formatDateInput(),
      from_account_id: "",
      to_account_id: "",
    });
  };

  const openModal = () => {
    setEditingTransaction(null);
    setFormError("");

    setTransactionForm({
      account_id: "",
      category_id: "",
      amount: "",
      reference: "",
      merchant: "",
      description: "",
      date: formatDateInput(),
      from_account_id: "",
      to_account_id: "",
    });

    setShowModal(true);
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

    saveMutation.mutate();
  };

  /*
  |--------------------------------------------------------------------------
  | EDIT
  |--------------------------------------------------------------------------
  */

  const openEditModal = (
    transaction: UnifiedTransaction,
  ) => {
    if (transaction.kind === "transfer") {
      setFormError(
        "Transfer editing is not available here yet.",
      );
      return;
    }

    const item =
      transaction.original as Transaction;

    const nextView = transaction.kind;

    setView(nextView);
    setSelectedCategory("");
    setSelectedAccount("");
    setEditingTransaction(transaction);
    setFormError("");

    setTransactionForm({
      account_id: String(item.account_id),
      category_id: String(item.category_id),
      amount: String(item.amount ?? ""),
      reference: item.reference ?? "",
      merchant: item.merchant ?? "",
      description: item.description ?? "",
      date: formatDateInput(
        item.received_at
          ? new Date(item.received_at)
          : item.spent_at
            ? new Date(item.spent_at)
            : new Date(),
      ),
      from_account_id: "",
      to_account_id: "",
    });

    setShowModal(true);
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleDelete = (
    transaction: UnifiedTransaction,
  ) => {
    const confirmed =
      window.confirm(
        `Delete this ${transaction.kind} transaction "${transaction.title}"?`,
      );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate({
      id:
        transaction.numericId,

      kind:
        transaction.kind,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const isLoading =
    incomesLoading ||
    expensesLoading ||
    transfersLoading ||
    accountsLoading ||
    categoriesLoading;

  const showCategories =
    view === "income" ||
    view === "expense";

  const modalTitle =
    editingTransaction
      ? view === "income"
        ? "Edit income"
        : view === "expense"
          ? "Edit expense"
          : "Edit transaction"
      : view === "transfer"
        ? "New transfer"
        : view === "income"
          ? "Add income"
          : view === "expense"
            ? "Add expense"
            : "Add transaction";

  const modalLabel =
    editingTransaction
      ? view === "income"
        ? "EDIT MONEY IN"
        : "EDIT MONEY OUT"
      : view === "transfer"
        ? "ACCOUNT TRANSFER"
        : view === "income"
          ? "MONEY IN"
          : "MONEY OUT";

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <main className="transactions-page">
      {/* ================================================================
          HEADER
      ================================================================= */}

      <header className="transactions-header">
        <div>
          <p className="transactions-eyebrow">
            MONEY MOVEMENT
          </p>

          <h1>
            Transactions
          </h1>

          <p className="transactions-subtitle">
            Track every naira coming in, going out,
            and moving between your accounts.
          </p>
        </div>

        <button
          className="add-transaction-button"
          onClick={
            openModal
          }
        >
          <span>+</span>

          {view ===
          "transfer"
            ? "New transfer"
            : view ===
                "expense"
              ? "Add expense"
              : view ===
                  "income"
                ? "Add income"
                : "Add transaction"}
        </button>
      </header>

      {/* ================================================================
          SUMMARY
      ================================================================= */}

      <section className="transaction-summary">
        <article className="transaction-summary-card">
          <span>
            Visible transactions
          </span>

          <strong>
            {summary.count}
          </strong>

          <small>
            Current filters
          </small>
        </article>

        <article className="transaction-summary-card">
          <span>
            Money in
          </span>

          <strong className="summary-positive">
            +
            {formatMoney(
              summary.incomeTotal,
            )}
          </strong>

          <small>
            Income received
          </small>
        </article>

        <article className="transaction-summary-card">
          <span>
            Money out
          </span>

          <strong className="summary-negative">
            -
            {formatMoney(
              summary.expenseTotal,
            )}
          </strong>

          <small>
            Expenses recorded
          </small>
        </article>

        <article className="transaction-summary-card">
          <span>
            Transfers
          </span>

          <strong>
            {formatMoney(
              summary.transferTotal,
            )}
          </strong>

          <small>
            Account-to-account movement
          </small>
        </article>
      </section>

      {/* ================================================================
          WORKSPACE
      ================================================================= */}

      <section className="transactions-workspace">
        <div className="transaction-toolbar">
          <div className="transaction-tabs">
            <button
              className={
                view === "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeView(
                  "all",
                )
              }
            >
              <span className="tab-icon">
                ◉
              </span>

              All
            </button>

            <button
              className={
                view ===
                "income"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeView(
                  "income",
                )
              }
            >
              <span className="tab-icon income">
                ↑
              </span>

              Income
            </button>

            <button
              className={
                view ===
                "expense"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeView(
                  "expense",
                )
              }
            >
              <span className="tab-icon expense">
                ↓
              </span>

              Expenses
            </button>

            <button
              className={
                view ===
                "transfer"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeView(
                  "transfer",
                )
              }
            >
              <span className="tab-icon transfer">
                ↔
              </span>

              Transfers
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
                selectedAccount
              }
              onChange={(
                event,
              ) =>
                setSelectedAccount(
                  event.target
                    .value,
                )
              }
            >
              <option value="">
                All accounts
              </option>

              {accounts.map(
                (
                  account,
                ) => (
                  <option
                    key={
                      account.id
                    }
                    value={
                      account.id
                    }
                  >
                    {
                      account.name
                    }
                  </option>
                ),
              )}
            </select>

            {showCategories && (
              <select
                value={
                  selectedCategory
                }
                onChange={(
                  event,
                ) =>
                  setSelectedCategory(
                    event.target
                      .value,
                  )
                }
              >
                <option value="">
                  All categories
                </option>

                {categories.map(
                  (
                    category,
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
            )}
          </div>
        </div>

        {/* ==============================================================
            TABLE
        ============================================================== */}

        <div className="transaction-table">
          <div className="transaction-table-header">
            <span>
              Transaction
            </span>

            <span>
              Account
            </span>

            <span>
              Type
            </span>

            <span>
              Date
            </span>

            <span>
              Amount
            </span>

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
                {view ===
                "income"
                  ? "↑"
                  : view ===
                      "expense"
                    ? "↓"
                    : view ===
                        "transfer"
                      ? "↔"
                      : "◉"}
              </div>

              <h3>
                No{" "}
                {getViewLabel(
                  view,
                ).toLowerCase()}{" "}
                found
              </h3>

              <p>
                Try changing your filters or
                record a new transaction.
              </p>

              <button
                onClick={
                  openModal
                }
              >
                {view ===
                "transfer"
                  ? "New transfer"
                  : "Add transaction"}
              </button>
            </div>
          ) : (
            <div className="transaction-table-body">
              {filteredTransactions.map(
                (
                  transaction,
                ) => {
                  const isIncome =
                    transaction.kind ===
                    "income";

                  const isExpense =
                    transaction.kind ===
                    "expense";

                  return (
                    <div
                      className="transaction-row"
                      key={
                        transaction.id
                      }
                    >
                      <div className="transaction-name">
                        <div
                          className={
                            isIncome
                              ? "transaction-icon income"
                              : isExpense
                                ? "transaction-icon expense"
                                : "transaction-icon transfer"
                          }
                        >
                          {isIncome
                            ? "↑"
                            : isExpense
                              ? "↓"
                              : "↔"}
                        </div>

                        <div>
                          <strong>
                            {
                              transaction.title
                            }
                          </strong>

                          <small>
                            {
                              transaction.subtitle
                            }
                          </small>
                        </div>
                      </div>

                      <div className="transaction-account">
                        {
                          transaction.account
                        }
                      </div>

                      <div className="transaction-type-cell">
                        <span
                          className={
                            isIncome
                              ? "transaction-type income"
                              : isExpense
                                ? "transaction-type expense"
                                : "transaction-type transfer"
                          }
                        >
                          {isIncome
                            ? "Income"
                            : isExpense
                              ? "Expense"
                              : "Transfer"}
                        </span>
                      </div>

                      <div className="transaction-date">
                        {formatDate(
                          transaction.date,
                        )}
                      </div>

                      <div
                        className={
                          isIncome
                            ? "transaction-amount income"
                            : isExpense
                              ? "transaction-amount expense"
                              : "transaction-amount transfer"
                        }
                      >
                        {isIncome
                          ? "+"
                          : isExpense
                            ? "-"
                            : ""}

                        {formatMoney(
                          transaction.amount,
                        )}
                      </div>

                      <div className="transaction-actions">
                        {transaction.kind !== "transfer" && (
                          <button
                            className="transaction-edit-button"
                            onClick={() =>
                              openEditModal(
                                transaction,
                              )
                            }
                            disabled={
                              saveMutation.isPending ||
                              deleteMutation.isPending
                            }
                            title="Edit transaction"
                            aria-label="Edit transaction"
                          >
                            ✎
                          </button>
                        )}

                        <button
                          className="transaction-delete-button"
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

      {/* ================================================================
          CREATE MODAL
      ================================================================= */}

      {showModal && (
        <div
          className="transaction-modal-backdrop"
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
            className="transaction-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-modal-title"
          >
            <div className="modal-heading">
              <div>
                <p>
                  {modalLabel}
                </p>

                <h2 id="transaction-modal-title">
                  {modalTitle}
                </h2>
              </div>

              <button
                className="transaction-modal-close"
                onClick={
                  closeModal
                }
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

            <form
              onSubmit={
                handleSubmit
              }
            >
              {view ===
              "transfer" ? (
                <>
                  <div className="transaction-field full">
                    <label htmlFor="from-account">
                      From account
                    </label>

                    <select
                      id="from-account"
                      value={
                        transactionForm.from_account_id
                      }
                      onChange={(
                        event,
                      ) =>
                        setTransactionForm(
                          {
                            ...transactionForm,
                            from_account_id:
                              event
                                .target
                                .value,
                          },
                        )
                      }
                      required
                    >
                      <option value="">
                        Select source account
                      </option>

                      {accounts.map(
                        (
                          account,
                        ) => (
                          <option
                            key={
                              account.id
                            }
                            value={
                              account.id
                            }
                          >
                            {
                              account.name
                            }{" "}
                            —{" "}
                            {formatMoney(
                              account.balance,
                              account.currency,
                            )}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div className="transaction-field full">
                    <label htmlFor="to-account">
                      To account
                    </label>

                    <select
                      id="to-account"
                      value={
                        transactionForm.to_account_id
                      }
                      onChange={(
                        event,
                      ) =>
                        setTransactionForm(
                          {
                            ...transactionForm,
                            to_account_id:
                              event
                                .target
                                .value,
                          },
                        )
                      }
                      required
                    >
                      <option value="">
                        Select destination account
                      </option>

                      {accounts
                        .filter(
                          (
                            account,
                          ) =>
                            String(
                              account.id,
                            ) !==
                            transactionForm.from_account_id,
                        )
                        .map(
                          (
                            account,
                          ) => (
                            <option
                              key={
                                account.id
                              }
                              value={
                                account.id
                              }
                            >
                              {
                                account.name
                              }{" "}
                              —{" "}
                              {formatMoney(
                                account.balance,
                                account.currency,
                              )}
                            </option>
                          ),
                        )}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="transaction-field full">
                    <label htmlFor="transaction-account">
                      Account
                    </label>

                    <select
                      id="transaction-account"
                      value={
                        transactionForm.account_id
                      }
                      onChange={(
                        event,
                      ) =>
                        setTransactionForm(
                          {
                            ...transactionForm,
                            account_id:
                              event
                                .target
                                .value,
                          },
                        )
                      }
                      required
                    >
                      <option value="">
                        Select account
                      </option>

                      {accounts.map(
                        (
                          account,
                        ) => (
                          <option
                            key={
                              account.id
                            }
                            value={
                              account.id
                            }
                          >
                            {
                              account.name
                            }{" "}
                            —{" "}
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
                        transactionForm.category_id
                      }
                      onChange={(
                        event,
                      ) =>
                        setTransactionForm(
                          {
                            ...transactionForm,
                            category_id:
                              event
                                .target
                                .value,
                          },
                        )
                      }
                      required
                    >
                      <option value="">
                        Select category
                      </option>

                      {categories.map(
                        (
                          category,
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
                </>
              )}

              <div className="transaction-field">
                <label htmlFor="transaction-amount">
                  Amount
                </label>

                <input
                  id="transaction-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    transactionForm.amount
                  }
                  onChange={(
                    event,
                  ) =>
                    setTransactionForm(
                      {
                        ...transactionForm,
                        amount:
                          event
                            .target
                            .value,
                      },
                    )
                  }
                  placeholder="0.00"
                  required
                />
              </div>

              {view ===
                "expense" && (
                <div className="transaction-field full">
                  <label htmlFor="transaction-merchant">
                    Merchant
                  </label>

                  <input
                    id="transaction-merchant"
                    type="text"
                    value={
                      transactionForm.merchant
                    }
                    onChange={(
                      event,
                    ) =>
                      setTransactionForm(
                        {
                          ...transactionForm,
                          merchant:
                            event
                              .target
                              .value,
                        },
                      )
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
                  value={
                    transactionForm.date
                  }
                  onChange={(
                    event,
                  ) =>
                    setTransactionForm(
                      {
                        ...transactionForm,
                        date:
                          event
                            .target
                            .value,
                      },
                    )
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
                    transactionForm.reference
                  }
                  onChange={(
                    event,
                  ) =>
                    setTransactionForm(
                      {
                        ...transactionForm,
                        reference:
                          event
                            .target
                            .value,
                      },
                    )
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
                    transactionForm.description
                  }
                  onChange={(
                    event,
                  ) =>
                    setTransactionForm(
                      {
                        ...transactionForm,
                        description:
                          event
                            .target
                            .value,
                      },
                    )
                  }
                  placeholder="Add a note..."
                  rows={3}
                />
              </div>

              <div className="transaction-modal-actions">
                <button
                  type="button"
                  className="transaction-cancel"
                  onClick={
                    closeModal
                  }
                  disabled={
                    saveMutation.isPending
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={
                    view ===
                    "income"
                      ? "transaction-save income"
                      : view ===
                          "expense"
                        ? "transaction-save expense"
                        : "transaction-save transfer"
                  }
                  disabled={
                    saveMutation.isPending
                  }
                >
                  {saveMutation.isPending
                    ? editingTransaction
                      ? "Saving changes..."
                      : "Saving..."
                    : editingTransaction
                      ? "Save changes"
                      : view === "transfer"
                        ? "Complete transfer"
                        : view === "income"
                          ? "Add income"
                          : "Add expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}