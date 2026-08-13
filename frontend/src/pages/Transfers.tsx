import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  createTransfer,
  deleteTransfer,
  getTransfers,
} from "../api/transfers";

import { getAccounts } from "../api/accounts";

import type { TransferPayload } from "../types/transfer";
import "./Transfers.css";

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

export default function Transfers() {
  const queryClient = useQueryClient();

  const [showModal, setShowModal] =
    useState(false);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    from_account_id: "",
    to_account_id: "",
    amount: "",
    reference: "",
    description: "",
    transferred_at: dateInputValue(),
  });

  const [formError, setFormError] =
    useState("");

  const {
    data: transfers = [],
    isLoading: transfersLoading,
    isError: transfersError,
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

  const createMutation = useMutation({
    mutationFn: (payload: TransferPayload) =>
      createTransfer(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transfers"],
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
          : error?.response?.data?.message ??
              "Unable to complete this transfer.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransfer,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transfers"],
      });

      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });

  const filteredTransfers = useMemo(() => {
    const term =
      search.trim().toLowerCase();

    if (!term) {
      return transfers;
    }

    return transfers.filter((transfer) => {
      const from =
        transfer.from_account?.name ??
        "";

      const to =
        transfer.to_account?.name ??
        "";

      const description =
        transfer.description ?? "";

      const reference =
        transfer.reference ?? "";

      return (
        from.toLowerCase().includes(term) ||
        to.toLowerCase().includes(term) ||
        description
          .toLowerCase()
          .includes(term) ||
        reference
          .toLowerCase()
          .includes(term)
      );
    });
  }, [transfers, search]);

  const totalTransferred = useMemo(() => {
    return transfers.reduce(
      (sum, transfer) =>
        sum +
        Number(transfer.amount || 0),
      0,
    );
  }, [transfers]);

  const closeModal = () => {
    setShowModal(false);

    setForm({
      from_account_id: "",
      to_account_id: "",
      amount: "",
      reference: "",
      description: "",
      transferred_at: dateInputValue(),
    });

    setFormError("");
  };

  const openModal = () => {
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setFormError("");

    const fromId = Number(
      form.from_account_id,
    );

    const toId = Number(
      form.to_account_id,
    );

    const amount = Number(form.amount);

    if (!fromId || !toId) {
      setFormError(
        "Please select both accounts.",
      );
      return;
    }

    if (fromId === toId) {
      setFormError(
        "Source and destination accounts must be different.",
      );
      return;
    }

    if (!amount || amount <= 0) {
      setFormError(
        "Please enter a valid transfer amount.",
      );
      return;
    }

    const sourceAccount = accounts.find(
      (account) => account.id === fromId,
    );

    if (
      sourceAccount &&
      Number(sourceAccount.balance) < amount
    ) {
      setFormError(
        "Insufficient balance in the source account.",
      );
      return;
    }

    createMutation.mutate({
      from_account_id: fromId,
      to_account_id: toId,
      amount,
      reference:
        form.reference || undefined,
      description:
        form.description || undefined,
      transferred_at:
        form.transferred_at,
    });
  };

  const handleDelete = (
    transferId: number,
  ) => {
    const confirmed = window.confirm(
      "Delete this transfer? The transfer will be reversed by the backend.",
    );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(transferId);
  };

  const isLoading =
    transfersLoading || accountsLoading;

  return (
    <main className="transfers-page">
      <header className="transfers-header">
        <div>
          <p className="transfers-eyebrow">
            MONEY MOVEMENT
          </p>

          <h1>Transfers</h1>

          <p className="transfers-subtitle">
            Move money safely between your accounts.
          </p>
        </div>

        <button
          className="new-transfer-button"
          onClick={openModal}
          disabled={accounts.length < 2}
        >
          <span>↔</span>
          New transfer
        </button>
      </header>

      <section className="transfer-summary">
        <article className="transfer-summary-card featured">
          <div>
            <span>Total transferred</span>

            <strong>
              {formatMoney(
                totalTransferred,
              )}
            </strong>
          </div>

          <div className="transfer-summary-icon">
            ↔
          </div>
        </article>

        <article className="transfer-summary-card">
          <span>Transfers</span>

          <strong>
            {transfers.length}
          </strong>

          <small>
            Completed transfers
          </small>
        </article>

        <article className="transfer-summary-card">
          <span>Connected accounts</span>

          <strong>
            {accounts.length}
          </strong>

          <small>
            Accounts available for transfers
          </small>
        </article>
      </section>

      <section className="transfer-workspace">
        <div className="transfer-toolbar">
          <div>
            <h2>Transfer history</h2>
            <p>
              Review money moved between accounts.
            </p>
          </div>

          <div className="transfer-search">
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
              placeholder="Search transfers..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
            />
          </div>
        </div>

        {isLoading ? (
          <div className="transfers-loading">
            <div className="transfer-spinner" />
            <p>Loading transfers...</p>
          </div>
        ) : transfersError ? (
          <div className="transfers-empty">
            <h3>
              Unable to load transfers
            </h3>

            <p>
              Please refresh and try again.
            </p>
          </div>
        ) : filteredTransfers.length ===
          0 ? (
          <div className="transfers-empty">
            <div className="empty-transfer-icon">
              ↔
            </div>

            <h3>
              No transfers yet
            </h3>

            <p>
              Move money between your accounts
              to see your transfer history here.
            </p>

            {accounts.length >= 2 && (
              <button
                onClick={openModal}
              >
                Make your first transfer
              </button>
            )}
          </div>
        ) : (
          <div className="transfer-list">
            {filteredTransfers.map(
              (transfer) => (
                <article
                  className="transfer-row"
                  key={transfer.id}
                >
                  <div className="transfer-flow-icon">
                    ↔
                  </div>

                  <div className="transfer-route">
                    <div>
                      <strong>
                        {transfer.from_account
                          ?.name ??
                          "Source account"}
                      </strong>

                      <span>→</span>

                      <strong>
                        {transfer.to_account
                          ?.name ??
                          "Destination account"}
                      </strong>
                    </div>

                    <small>
                      {transfer.description ??
                        transfer.reference ??
                        "Account transfer"}
                    </small>
                  </div>

                  <div className="transfer-date">
                    {formatDate(
                      transfer.transferred_at,
                    )}
                  </div>

                  <div className="transfer-amount">
                    {formatMoney(
                      transfer.amount,
                    )}
                  </div>

                  <button
                    className="transfer-delete"
                    onClick={() =>
                      handleDelete(
                        transfer.id,
                      )
                    }
                    disabled={
                      deleteMutation.isPending
                    }
                    title="Delete transfer"
                  >
                    ×
                  </button>
                </article>
              ),
            )}
          </div>
        )}
      </section>

      {accounts.length < 2 && (
        <div className="transfer-notice">
          <strong>
            Add at least two accounts
          </strong>

          <span>
            You need two accounts before you can
            make a transfer.
          </span>
        </div>
      )}

      {showModal && (
        <div
          className="transfer-modal-backdrop"
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
            className="transfer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transfer-modal-title"
          >
            <div className="transfer-modal-heading">
              <div>
                <p>MONEY TRANSFER</p>

                <h2 id="transfer-modal-title">
                  Move money
                </h2>
              </div>

              <button
                className="transfer-modal-close"
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {formError && (
              <div className="transfer-form-error">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="transfer-account-flow">
                <div className="transfer-field">
                  <label htmlFor="from-account">
                    From account
                  </label>

                  <select
                    id="from-account"
                    value={
                      form.from_account_id
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        from_account_id:
                          event.target.value,
                      })
                    }
                    required
                  >
                    <option value="">
                      Select source account
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

                <div className="flow-arrow">
                  →
                </div>

                <div className="transfer-field">
                  <label htmlFor="to-account">
                    To account
                  </label>

                  <select
                    id="to-account"
                    value={
                      form.to_account_id
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        to_account_id:
                          event.target.value,
                      })
                    }
                    required
                  >
                    <option value="">
                      Select destination
                    </option>

                    {accounts
                      .filter(
                        (account) =>
                          String(
                            account.id,
                          ) !==
                          form.from_account_id,
                      )
                      .map((account) => (
                        <option
                          key={account.id}
                          value={account.id}
                        >
                          {account.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="transfer-field">
                <label htmlFor="transfer-amount">
                  Amount
                </label>

                <input
                  id="transfer-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      amount:
                        event.target.value,
                    })
                  }
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="transfer-form-grid">
                <div className="transfer-field">
                  <label htmlFor="transfer-date">
                    Transfer date
                  </label>

                  <input
                    id="transfer-date"
                    type="date"
                    value={
                      form.transferred_at
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        transferred_at:
                          event.target
                            .value,
                      })
                    }
                    required
                  />
                </div>

                <div className="transfer-field">
                  <label htmlFor="transfer-reference">
                    Reference
                  </label>

                  <input
                    id="transfer-reference"
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
              </div>

              <div className="transfer-field">
                <label htmlFor="transfer-description">
                  Description
                </label>

                <textarea
                  id="transfer-description"
                  rows={3}
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description:
                        event.target.value,
                    })
                  }
                  placeholder="Add a note..."
                />
              </div>

              <div className="transfer-modal-actions">
                <button
                  type="button"
                  className="transfer-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="transfer-submit"
                  disabled={
                    createMutation.isPending ||
                    accounts.length < 2
                  }
                >
                  {createMutation.isPending
                    ? "Transferring..."
                    : "Complete transfer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}