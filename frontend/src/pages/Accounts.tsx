import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  createAccount,
  deleteAccount,
  getAccounts,
  updateAccount,
} from "../api/accounts";
import type {
  Account,
  AccountPayload,
  AccountType,
} from "../types/account";
import "./Accounts.css";

const accountTypes: {
  value: AccountType;
  label: string;
}[] = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Account" },
  { value: "credit_card", label: "Credit Card" },
  { value: "mobile_wallet", label: "Mobile Wallet" },
  { value: "crypto", label: "Crypto" },
];

const currencies = ["NGN", "USD", "GBP", "EUR"];

function money(
  amount: number | string,
  currency: string,
) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function accountLabel(type: AccountType) {
  return (
    accountTypes.find((item) => item.value === type)
      ?.label ?? type
  );
}

function AccountIcon({
  type,
}: {
  type: AccountType;
}) {
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

  if (type === "credit_card") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
        <path d="M7 15h4" />
      </svg>
    );
  }

  if (type === "mobile_wallet") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="6" y="3" width="12" height="18" rx="2" />
        <path d="M9 17h6" />
        <path d="M10 7h4" />
      </svg>
    );
  }

  if (type === "crypto") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M10 7v10M14 7v10" />
        <path d="M8 9h5a2 2 0 0 1 0 4H8m0 0h6a2 2 0 0 1 0 4H8" />
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

const initialForm: AccountPayload = {
  name: "",
  type: "cash",
  balance: 0,
  currency: "NGN",
  icon: "wallet",
  color: "#0D9278",
};

export default function Accounts() {
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] =
    useState<Account | null>(null);

  const [form, setForm] =
    useState<AccountPayload>(initialForm);

  const [formError, setFormError] = useState("");

  const {
    data: accounts = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: AccountPayload) => {
      if (editingAccount) {
        return updateAccount({
          id: editingAccount.id,
          payload,
        });
      }

      return createAccount(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      closeModal();
    },
    onError: (error: any) => {
      const responseErrors =
        error?.response?.data?.errors;

      const firstError = responseErrors
        ? Object.values(responseErrors)
            .flat()
            .find(Boolean)
        : null;

      setFormError(
        typeof firstError === "string"
          ? firstError
          : error?.response?.data?.message ??
              "Unable to save this account.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });

  const totalBalance = useMemo(() => {
    return accounts.reduce(
      (total, account) =>
        total + Number(account.balance || 0),
      0,
    );
  }, [accounts]);

  const openCreateModal = () => {
    setEditingAccount(null);
    setForm(initialForm);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);

    setForm({
      name: account.name,
      type: account.type,
      balance: Number(account.balance),
      currency: account.currency,
      icon: account.icon ?? "wallet",
      color: account.color ?? "#0D9278",
    });

    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAccount(null);
    setForm(initialForm);
    setFormError("");
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setFormError("");

    if (!form.name.trim()) {
      setFormError("Please enter an account name.");
      return;
    }

    if (Number(form.balance) < 0) {
      setFormError(
        "Account balance cannot be negative.",
      );
      return;
    }

    saveMutation.mutate({
      ...form,
      name: form.name.trim(),
      balance: Number(form.balance),
    });
  };

  const handleDelete = (account: Account) => {
    if (account.is_default) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${account.name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(account.id);
  };

  if (isLoading) {
    return (
      <main className="accounts-page">
        <div className="accounts-loading">
          <div className="accounts-spinner" />
          <p>Loading your accounts...</p>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="accounts-page">
        <div className="accounts-error">
          <h2>Unable to load accounts</h2>
          <p>
            Please check your connection and try again.
          </p>

          <button
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["accounts"],
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
    <main className="accounts-page">
      <header className="accounts-header">
        <div>
          <p className="accounts-eyebrow">
            FINANCIAL ACCOUNTS
          </p>

          <h1>Your accounts</h1>

          <p className="accounts-subtitle">
            Keep your cash, bank accounts and wallets
            organized in one place.
          </p>
        </div>

        <button
          className="add-account-button"
          onClick={openCreateModal}
        >
          <span>+</span>
          Add account
        </button>
      </header>

      <section className="accounts-overview">
        <div className="overview-card total">
          <div>
            <span>Total balance</span>
            <strong>
              {money(totalBalance, "NGN")}
            </strong>
          </div>

          <div className="overview-icon">
            ₦
          </div>
        </div>

        <div className="overview-card">
          <div>
            <span>Accounts</span>
            <strong>{accounts.length}</strong>
          </div>

          <div className="overview-mini-icon">
            ◉
          </div>
        </div>

        <div className="overview-card">
          <div>
            <span>Default account</span>
            <strong>
              {accounts.find(
                (account) => account.is_default,
              )?.name ?? "Not set"}
            </strong>
          </div>
        </div>
      </section>

      <section className="accounts-section">
        <div className="accounts-section-heading">
          <div>
            <h2>All accounts</h2>
            <p>
              {accounts.length} account
              {accounts.length === 1 ? "" : "s"} connected
            </p>
          </div>
        </div>

        {accounts.length === 0 ? (
          <div className="accounts-empty">
            <div className="empty-account-icon">
              +
            </div>

            <h3>Create your first account</h3>

            <p>
              Add a bank account, wallet or cash account
              to start tracking your finances.
            </p>

            <button onClick={openCreateModal}>
              Add account
            </button>
          </div>
        ) : (
          <div className="accounts-list">
            {accounts.map((account) => (
              <article
                className="account-full-card"
                key={account.id}
              >
                <div
                  className="full-account-icon"
                  style={{
                    backgroundColor:
                      account.color
                        ? `${account.color}18`
                        : "#eaf6f3",
                    color:
                      account.color ??
                      "#0d9278",
                  }}
                >
                  <AccountIcon
                    type={account.type}
                  />
                </div>

                <div className="account-main">
                  <div className="account-title-row">
                    <h3>{account.name}</h3>

                    {account.is_default && (
                      <span className="default-badge">
                        Default
                      </span>
                    )}
                  </div>

                  <p>
                    {accountLabel(account.type)}
                  </p>
                </div>

                <div className="account-balance">
                  <span>Balance</span>

                  <strong>
                    {money(
                      account.balance,
                      account.currency,
                    )}
                  </strong>
                </div>

                <div className="account-actions">
                  <button
                    onClick={() =>
                      openEditModal(account)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="danger"
                    disabled={account.is_default}
                    onClick={() =>
                      handleDelete(account)
                    }
                    title={
                      account.is_default
                        ? "Default accounts cannot be deleted"
                        : "Delete account"
                    }
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {showModal && (
        <div
          className="account-modal-backdrop"
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
            className="account-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-modal-title"
          >
            <div className="modal-header">
              <div>
                <p>ACCOUNT</p>
                <h2 id="account-modal-title">
                  {editingAccount
                    ? "Edit account"
                    : "Add account"}
                </h2>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {formError && (
              <div className="account-form-error">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="account-name">
                  Account name
                </label>

                <input
                  id="account-name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  placeholder="e.g. GTBank"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="account-type">
                    Account type
                  </label>

                  <select
                    id="account-type"
                    value={form.type}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        type: event.target
                          .value as AccountType,
                      })
                    }
                  >
                    {accountTypes.map(
                      (type) => (
                        <option
                          key={type.value}
                          value={type.value}
                        >
                          {type.label}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="account-currency">
                    Currency
                  </label>

                  <select
                    id="account-currency"
                    value={form.currency}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        currency:
                          event.target.value,
                      })
                    }
                  >
                    {currencies.map(
                      (currency) => (
                        <option
                          key={currency}
                          value={currency}
                        >
                          {currency}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="account-balance">
                  Opening balance
                </label>

                <input
                  id="account-balance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.balance}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      balance:
                        Number(
                          event.target.value,
                        ),
                    })
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-account-button"
                  disabled={
                    saveMutation.isPending
                  }
                >
                  {saveMutation.isPending
                    ? "Saving..."
                    : editingAccount
                      ? "Save changes"
                      : "Create account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}