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
  createTransfer,
  deleteTransfer,
  getTransfers,
  updateTransfer,
} from "../api/transfers";

import { getAccounts } from "../api/accounts";

import type {
  Transfer,
  TransferPayload,
} from "../types/transfer";

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

function formatDateTime(
  value?: string | null,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function dateInputValue(
  value: Date | string = new Date(),
) {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

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

interface TransferForm {
  from_account_id: string;
  to_account_id: string;
  amount: string;
  reference: string;
  description: string;
  transferred_at: string;
}

const emptyForm: TransferForm = {
  from_account_id: "",
  to_account_id: "",
  amount: "",
  reference: "",
  description: "",
  transferred_at: dateInputValue(),
};

export default function Transfers() {
  const queryClient =
    useQueryClient();

  const [showModal, setShowModal] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [selectedAccount, setSelectedAccount] =
    useState("");

  const [form, setForm] =
    useState<TransferForm>({
      ...emptyForm,
    });

  const [formError, setFormError] =
    useState("");

  const [editingTransferId, setEditingTransferId] =
    useState<number | null>(null);

  /*
  |--------------------------------------------------------------------------
  | TRANSFERS
  |--------------------------------------------------------------------------
  */

  const {
    data: transfers = [],
    isLoading: transfersLoading,
    isError: transfersError,
  } = useQuery({
    queryKey: ["transfers"],
    queryFn: getTransfers,
  });

  /*
  |--------------------------------------------------------------------------
  | ACCOUNTS
  |--------------------------------------------------------------------------
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
  | SELECTED ACCOUNTS
  |--------------------------------------------------------------------------
  */

  const sourceAccount = useMemo(
    () =>
      accounts.find(
        (account) =>
          account.id ===
          Number(
            form.from_account_id,
          ),
      ),
    [
      accounts,
      form.from_account_id,
    ],
  );

  const destinationAccount =
    useMemo(
      () =>
        accounts.find(
          (account) =>
            account.id ===
            Number(
              form.to_account_id,
            ),
        ),
      [
        accounts,
        form.to_account_id,
      ],
    );

  /*
  |--------------------------------------------------------------------------
  | FILTERING
  |--------------------------------------------------------------------------
  */

  const filteredTransfers =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase();

      return transfers.filter(
        (transfer) => {
          const from =
            transfer
              .from_account
              ?.name ?? "";

          const to =
            transfer
              .to_account
              ?.name ?? "";

          const description =
            transfer.description ??
            "";

          const reference =
            transfer.reference ??
            "";

          const matchesSearch =
            !term ||
            from
              .toLowerCase()
              .includes(term) ||
            to
              .toLowerCase()
              .includes(term) ||
            description
              .toLowerCase()
              .includes(term) ||
            reference
              .toLowerCase()
              .includes(term);

          const matchesAccount =
            !selectedAccount ||
            String(
              transfer.from_account_id,
            ) === selectedAccount ||
            String(
              transfer.to_account_id,
            ) === selectedAccount;

          return (
            matchesSearch &&
            matchesAccount
          );
        },
      );
    }, [
      transfers,
      search,
      selectedAccount,
    ]);

  /*
  |--------------------------------------------------------------------------
  | TRANSFER ANALYTICS
  |--------------------------------------------------------------------------
  */

  const totalTransferred =
    useMemo(
      () =>
        transfers.reduce(
          (sum, transfer) =>
            sum +
            Number(
              transfer.amount || 0,
            ),
          0,
        ),
      [transfers],
    );

  const filteredTotal =
    useMemo(
      () =>
        filteredTransfers.reduce(
          (sum, transfer) =>
            sum +
            Number(
              transfer.amount || 0,
            ),
          0,
        ),
      [filteredTransfers],
    );

  const averageTransfer =
    transfers.length > 0
      ? totalTransferred /
        transfers.length
      : 0;

  /*
  |--------------------------------------------------------------------------
  | CREATE / UPDATE
  |--------------------------------------------------------------------------
  */

  const saveMutation =
    useMutation({
      mutationFn: (
        payload: TransferPayload,
      ) =>
        editingTransferId
          ? updateTransfer(
              editingTransferId,
              payload,
            )
          : createTransfer(payload),

      onSuccess: () => {
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
            "transactions",
          ],
        });

        setShowModal(false);
        setEditingTransferId(null);

        setForm({
          ...emptyForm,
          transferred_at:
            dateInputValue(),
        });

        setFormError("");
      },

      onError: (error: any) => {
        const backendErrors =
          error?.response?.data
            ?.errors;

        const firstError =
          backendErrors
            ? Object.values(
                backendErrors,
              )
                .flat()
                .find(Boolean)
            : null;

        setFormError(
          typeof firstError ===
            "string"
            ? firstError
            : error?.response
                ?.data?.message ??
                error?.message ??
                "Unable to save this transfer.",
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
        deleteTransfer,

      onSuccess: () => {
        queryClient.invalidateQueries(
          {
            queryKey: [
              "transfers",
            ],
          },
        );

        queryClient.invalidateQueries(
          {
            queryKey: [
              "accounts",
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
              "transactions",
            ],
          },
        );
      },

      onError: (error: any) => {
        window.alert(
          error?.response
            ?.data
            ?.message ??
            "Unable to delete this transfer.",
        );
      },
    });

  /*
  |--------------------------------------------------------------------------
  | MODAL
  |--------------------------------------------------------------------------
  */

  const openModal = () => {
    setEditingTransferId(null);
    setFormError("");

    const firstAccount =
      accounts[0];

    const secondAccount =
      accounts.find(
        (account) =>
          account.id !==
          firstAccount?.id,
      );

    setForm({
      ...emptyForm,

      from_account_id:
        firstAccount
          ? String(
              firstAccount.id,
            )
          : "",

      to_account_id:
        secondAccount
          ? String(
              secondAccount.id,
            )
          : "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (
      saveMutation.isPending
    ) {
      return;
    }

    setShowModal(false);
    setEditingTransferId(null);

    setFormError("");

    setForm({
      ...emptyForm,
      transferred_at:
        dateInputValue(),
    });
  };

  const openEditModal = (
    transfer: Transfer,
  ) => {
    setFormError("");
    setEditingTransferId(
      transfer.id,
    );

    setForm({
      from_account_id:
        String(
          transfer.from_account_id,
        ),

      to_account_id:
        String(
          transfer.to_account_id,
        ),

      amount:
        String(
          transfer.amount,
        ),

      reference:
        transfer.reference ?? "",

      description:
        transfer.description ?? "",

      transferred_at:
        transfer.transferred_at
          ? dateInputValue(
              new Date(
                transfer.transferred_at,
              ),
            )
          : dateInputValue(),
    });

    setShowModal(true);
  };

  /*
  |--------------------------------------------------------------------------
  | VALIDATION + SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setFormError("");

    const fromId = Number(
      form.from_account_id,
    );

    const toId = Number(
      form.to_account_id,
    );

    const amount = Number(
      form.amount,
    );

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

    if (
      !amount ||
      amount <= 0
    ) {
      setFormError(
        "Please enter a valid transfer amount.",
      );

      return;
    }

    const editingTransfer =
      editingTransferId
        ? transfers.find(
            (transfer) =>
              transfer.id ===
              editingTransferId,
          )
        : null;

    const oldSourceAccountId =
      editingTransfer
        ?.from_account_id ?? null;

    const oldAmount =
      editingTransfer
        ? Number(
            editingTransfer.amount,
          )
        : 0;

    const availableSourceBalance =
      sourceAccount
        ? Number(
            sourceAccount.balance,
          ) +
          (oldSourceAccountId ===
          fromId
            ? oldAmount
            : 0)
        : 0;

    if (
      sourceAccount &&
      availableSourceBalance < amount
    ) {
      setFormError(
        "Insufficient balance in the source account.",
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Currency safeguard
    |--------------------------------------------------------------------------
    |
    | The current backend transfer flow moves an amount directly between
    | accounts. We should therefore prevent cross-currency transfers in
    | the UI until currency conversion is explicitly supported.
    |
    */

    if (
      sourceAccount &&
      destinationAccount &&
      sourceAccount.currency !==
        destinationAccount.currency
    ) {
      setFormError(
        `Cross-currency transfers are not supported yet. Both accounts must use the same currency (${sourceAccount.currency}).`,
      );

      return;
    }

    const payload: TransferPayload =
      {
        from_account_id:
          fromId,

        to_account_id:
          toId,

        amount,

        reference:
          form.reference.trim() ||
          undefined,

        description:
          form.description.trim() ||
          undefined,

        transferred_at:
          form.transferred_at,
      };

    saveMutation.mutate(
      payload,
    );
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const handleDelete = (
    transferId: number,
  ) => {
    const confirmed =
      window.confirm(
        "Delete this transfer? The backend will reverse the transfer and restore the account balances.",
      );

    if (!confirmed) {
      return;
    }

    deleteMutation.mutate(
      transferId,
    );
  };

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const isLoading =
    transfersLoading ||
    accountsLoading;

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <main className="transfers-page">
      {/* ================================================================
          HEADER
      ================================================================= */}

      <header className="transfers-header">
        <div>
          <p className="transfers-eyebrow">
            MONEY MOVEMENT
          </p>

          <h1>
            Transfers
          </h1>

          <p className="transfers-subtitle">
            Move money safely between your accounts
            and keep a clear audit trail.
          </p>
        </div>

        <button
          className="new-transfer-button"
          onClick={
            openModal
          }
          disabled={
            accounts.length < 2
          }
        >
          <span>
            ↔
          </span>

          New transfer
        </button>
      </header>

      {/* ================================================================
          SUMMARY
      ================================================================= */}

      <section className="transfer-summary">
        <article className="transfer-summary-card featured">
          <div>
            <span>
              Total transferred
            </span>

            <strong>
              {formatMoney(
                totalTransferred,
              )}
            </strong>

            <small>
              All recorded transfers
            </small>
          </div>

          <div className="transfer-summary-icon">
            ↔
          </div>
        </article>

        <article className="transfer-summary-card">
          <span>
            Transfers
          </span>

          <strong>
            {transfers.length}
          </strong>

          <small>
            Completed transfers
          </small>
        </article>

        <article className="transfer-summary-card">
          <span>
            Connected accounts
          </span>

          <strong>
            {accounts.length}
          </strong>

          <small>
            Accounts available
          </small>
        </article>

        <article className="transfer-summary-card transfer-average-card">
          <span>
            Average transfer
          </span>

          <strong>
            {formatMoney(
              averageTransfer,
            )}
          </strong>

          <small>
            Per completed transfer
          </small>
        </article>
      </section>

      {/* ================================================================
          WORKSPACE
      ================================================================= */}

      <section className="transfer-workspace">
        <div className="transfer-toolbar">
          <div>
            <h2>
              Transfer history
            </h2>

            <p>
              {filteredTransfers.length}{" "}
              transfer
              {filteredTransfers.length ===
              1
                ? ""
                : "s"}{" "}
              displayed
              {selectedAccount
                ? ` · ${formatMoney(
                    filteredTotal,
                  )} total`
                : ""}
            </p>
          </div>

          <div className="transfer-toolbar-actions">
            <select
              className="transfer-account-filter"
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
                (account) => (
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
          </div>
        </div>

        {isLoading ? (
          <div className="transfers-loading">
            <div className="transfer-spinner" />

            <p>
              Loading transfers...
            </p>
          </div>
        ) : transfersError ? (
          <div className="transfers-empty">
            <div className="empty-transfer-icon">
              !
            </div>

            <h3>
              Unable to load transfers
            </h3>

            <p>
              Please refresh the page and try again.
            </p>

            <button
              onClick={() =>
                queryClient.invalidateQueries(
                  {
                    queryKey: [
                      "transfers",
                    ],
                  },
                )
              }
            >
              Try again
            </button>
          </div>
        ) : filteredTransfers.length ===
          0 ? (
          <div className="transfers-empty">
            <div className="empty-transfer-icon">
              ↔
            </div>

            <h3>
              {search ||
              selectedAccount
                ? "No matching transfers"
                : "No transfers yet"}
            </h3>

            <p>
              {search ||
              selectedAccount
                ? "Try changing your search or account filter."
                : "Move money between your accounts to see your transfer history here."}
            </p>

            {accounts.length >=
              2 && (
              <button
                onClick={
                  openModal
                }
              >
                Make a transfer
              </button>
            )}
          </div>
        ) : (
          <div className="transfer-list">
            {filteredTransfers.map(
              (transfer) => {
                const fromName =
                  transfer
                    .from_account
                    ?.name ??
                  "Source account";

                const toName =
                  transfer
                    .to_account
                    ?.name ??
                  "Destination account";

                const currency =
                  transfer
                    .from_account
                    ?.currency ??
                  "NGN";

                return (
                  <article
                    className="transfer-row"
                    key={
                      transfer.id
                    }
                  >
                    <div className="transfer-flow-icon">
                      ↔
                    </div>

                    <div className="transfer-route">
                      <div>
                        <strong>
                          {
                            fromName
                          }
                        </strong>

                        <span>
                          →
                        </span>

                        <strong>
                          {
                            toName
                          }
                        </strong>
                      </div>

                      <small>
                        {transfer.description ??
                          transfer.reference ??
                          "Account transfer"}
                      </small>
                    </div>

                    <div className="transfer-date">
                      <strong>
                        {formatDate(
                          transfer.transferred_at,
                        )}
                      </strong>

                      <small>
                        {formatDateTime(
                          transfer.transferred_at,
                        )}
                      </small>
                    </div>

                    <div className="transfer-amount">
                      {formatMoney(
                        transfer.amount,
                        currency,
                      )}
                    </div>

                    <div className="transfer-actions">
                      <button
                        className="transfer-edit"
                        onClick={() =>
                          openEditModal(
                            transfer,
                          )
                        }
                        disabled={
                          deleteMutation.isPending ||
                          saveMutation.isPending
                        }
                        title="Edit transfer"
                        aria-label={`Edit transfer from ${fromName} to ${toName}`}
                      >
                        ✎
                      </button>

                      <button
                        className="transfer-delete"
                        onClick={() =>
                          handleDelete(
                            transfer.id,
                          )
                        }
                        disabled={
                          deleteMutation.isPending ||
                          saveMutation.isPending
                        }
                        title="Delete transfer"
                        aria-label={`Delete transfer from ${fromName} to ${toName}`}
                      >
                        ×
                      </button>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        )}
      </section>

      {/* ================================================================
          NOTICE
      ================================================================= */}

      {accounts.length <
        2 && (
        <div className="transfer-notice">
          <strong>
            Add at least two accounts
          </strong>

          <span>
            You need two accounts before you can make
            a transfer.
          </span>
        </div>
      )}

      {/* ================================================================
          MODAL
      ================================================================= */}

      {showModal && (
        <div
          className="transfer-modal-backdrop"
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
            className="transfer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transfer-modal-title"
          >
            <div className="transfer-modal-heading">
              <div>
                <p>
                  MONEY TRANSFER
                </p>

                <h2 id="transfer-modal-title">
                  Move money
                </h2>
              </div>

              <button
                className="transfer-modal-close"
                onClick={
                  closeModal
                }
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

            <form
              onSubmit={
                handleSubmit
              }
            >
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
                    onChange={(
                      event,
                    ) =>
                      setForm({
                        ...form,
                        from_account_id:
                          event
                            .target
                            .value,
                      })
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

                  {sourceAccount && (
                    <div className="account-transfer-balance">
                      Available:{" "}
                      <strong>
                        {formatMoney(
                          sourceAccount.balance,
                          sourceAccount.currency,
                        )}
                      </strong>
                    </div>
                  )}
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
                    onChange={(
                      event,
                    ) =>
                      setForm({
                        ...form,
                        to_account_id:
                          event
                            .target
                            .value,
                      })
                    }
                    required
                  >
                    <option value="">
                      Select destination
                    </option>

                    {accounts
                      .filter(
                        (
                          account,
                        ) =>
                          String(
                            account.id,
                          ) !==
                          form.from_account_id,
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
                            }
                          </option>
                        ),
                      )}
                  </select>

                  {destinationAccount && (
                    <div className="account-transfer-balance">
                      Current balance:{" "}
                      <strong>
                        {formatMoney(
                          destinationAccount.balance,
                          destinationAccount.currency,
                        )}
                      </strong>
                    </div>
                  )}
                </div>
              </div>

              {sourceAccount &&
                destinationAccount && (
                  <div className="transfer-preview">
                    <div>
                      <span>
                        Moving
                      </span>

                      <strong>
                        {form.amount
                          ? formatMoney(
                              Number(
                                form.amount,
                              ),
                              sourceAccount.currency,
                            )
                          : formatMoney(
                              0,
                              sourceAccount.currency,
                            )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Source after transfer
                      </span>

                      <strong>
                        {formatMoney(
                          Math.max(
                            0,
                            Number(
                              sourceAccount.balance,
                            ) +
                              (editingTransferId
                                ? Number(
                                    transfers.find(
                                      (item) =>
                                        item.id ===
                                        editingTransferId,
                                    )?.amount ??
                                      0,
                                  )
                                : 0) -
                              Number(
                                form.amount ||
                                  0,
                              ),
                          ),
                          sourceAccount.currency,
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Destination after transfer
                      </span>

                      <strong>
                        {formatMoney(
                          Number(
                            destinationAccount.balance,
                          ) +
                            Number(
                              form.amount ||
                                0,
                            ),
                          destinationAccount.currency,
                        )}
                      </strong>
                    </div>
                  </div>
                )}

              <div className="transfer-field">
                <label htmlFor="transfer-amount">
                  Amount
                </label>

                <input
                  id="transfer-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    form.amount
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      amount:
                        event
                          .target
                          .value,
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
                    onChange={(
                      event,
                    ) =>
                      setForm({
                        ...form,
                        transferred_at:
                          event
                            .target
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
                    onChange={(
                      event,
                    ) =>
                      setForm({
                        ...form,
                        reference:
                          event
                            .target
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
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      description:
                        event
                          .target
                          .value,
                    })
                  }
                  placeholder="Add a note..."
                />
              </div>

              <div className="transfer-modal-actions">
                <button
                  type="button"
                  className="transfer-cancel"
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
                  className="transfer-submit"
                  disabled={
                    saveMutation.isPending ||
                    accounts.length <
                      2
                  }
                >
                  {saveMutation.isPending
                    ? editingTransferId
                      ? "Saving changes..."
                      : "Transferring..."
                    : editingTransferId
                      ? "Save changes"
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