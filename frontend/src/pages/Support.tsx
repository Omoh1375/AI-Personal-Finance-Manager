import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useState,
  type FormEvent,
} from "react";

import {
  createSupportTicket,
  getSupportTickets,
  getSupportTicket,
  type CreateSupportTicketPayload,
  type SupportTicket,
} from "../api/support";

import "./Support.css";

/* ==========================================================================
   ICONS
   ========================================================================== */

function HeadsetIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />

      <path d="M4 13h3v6H5a1 1 0 0 1-1-1v-5Z" />

      <path d="M20 13h-3v6h2a1 1 0 0 0 1-1v-5Z" />

      <path d="M17 19c-1 1-2.3 2-4 2h-1" />
    </svg>
  );
}

function SearchIcon() {
  return (
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
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

/* ==========================================================================
   HELPERS
   ========================================================================== */

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
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(
    new Date(value),
  );
}

function formatCategory(
  category: string,
) {
  return category
    .replaceAll(
      "_",
      " ",
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

function formatStatus(
  status: SupportTicket["status"],
) {
  return status
    .replaceAll(
      "_",
      " ",
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function Support() {
  const queryClient =
    useQueryClient();

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [
    selectedTicket,
    setSelectedTicket,
  ] = useState<SupportTicket | null>(
    null,
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    form,
    setForm,
  ] =
    useState<CreateSupportTicketPayload>({
      subject: "",
      category: "account",
      priority: "normal",
      message: "",
    });

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  /* ------------------------------------------------------------------------
     TICKETS
  ------------------------------------------------------------------------ */

  const {
    data: tickets = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "support-tickets",
    ],
    queryFn:
      getSupportTickets,
  });

  /* ------------------------------------------------------------------------
     CREATE TICKET
  ------------------------------------------------------------------------ */

  const createMutation =
    useMutation({
      mutationFn:
        createSupportTicket,

      onSuccess: (
        ticket,
      ) => {
        queryClient.invalidateQueries({
          queryKey: [
            "support-tickets",
          ],
        });

        setShowCreateModal(
          false,
        );

        setForm({
          subject: "",
          category: "account",
          priority: "normal",
          message: "",
        });

        setFormError("");

        setSuccessMessage(
          `Support request ${ticket.ticket_number} has been submitted.`,
        );

        setSelectedTicket(
          ticket,
        );
      },

      onError: (
        error: any,
      ) => {
        const errors =
          error?.response
            ?.data?.errors;

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
                ?.data?.message ??
              "Unable to submit your support request.",
        );
      },
    });

  /* ------------------------------------------------------------------------
     SEARCH
  ------------------------------------------------------------------------ */

  const filteredTickets =
    tickets.filter(
      (ticket) => {
        const term =
          search
            .trim()
            .toLowerCase();

        if (!term) {
          return true;
        }

        return (
          ticket.ticket_number
            .toLowerCase()
            .includes(term) ||
          ticket.subject
            .toLowerCase()
            .includes(term) ||
          ticket.category
            .toLowerCase()
            .includes(term)
        );
      },
    );

  /* ------------------------------------------------------------------------
     DETAIL
  ------------------------------------------------------------------------ */

  const openTicket =
    async (
      ticket: SupportTicket,
    ) => {
      try {
        const fullTicket =
          await getSupportTicket(
            ticket.id,
          );

        setSelectedTicket(
          fullTicket,
        );

        setSuccessMessage("");
      } catch {
        setSelectedTicket(
          ticket,
        );
      }
    };

  /* ------------------------------------------------------------------------
     FORM
  ------------------------------------------------------------------------ */

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    if (
      form.subject.trim()
        .length < 5
    ) {
      setFormError(
        "Please enter a clear subject.",
      );

      return;
    }

    if (
      form.message.trim()
        .length < 10
    ) {
      setFormError(
        "Please provide some details about the issue.",
      );

      return;
    }

    createMutation.mutate({
      ...form,

      subject:
        form.subject.trim(),

      message:
        form.message.trim(),
    });
  };

  /* ------------------------------------------------------------------------
     LOADING
  ------------------------------------------------------------------------ */

  if (isLoading) {
    return (
      <main className="support-page">
        <div className="support-loading">
          <div className="support-spinner" />

          <p>
            Loading customer service...
          </p>
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------------------------
     ERROR
  ------------------------------------------------------------------------ */

  if (isError) {
    return (
      <main className="support-page">
        <div className="support-error">
          <h2>
            We couldn't load your support requests
          </h2>

          <p>
            Please check your connection and try again.
          </p>

          <button
            type="button"
            onClick={() =>
              refetch()
            }
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="support-page">
      {/* ================================================================
          HEADER
      ================================================================= */}

      <header className="support-header">
        <div>
          <p className="support-eyebrow">
            CUSTOMER SERVICE
          </p>

          <h1>
            How can we help?
          </h1>

          <p className="support-subtitle">
            Get help with your account, transactions,
            budgets, savings and security.
          </p>
        </div>

        <button
          type="button"
          className="support-create-button"
          onClick={() => {
            setFormError("");
            setSuccessMessage("");
            setShowCreateModal(
              true,
            );
          }}
        >
          <PlusIcon />

          Contact support
        </button>
      </header>

      {/* ================================================================
          SUCCESS
      ================================================================= */}

      {successMessage && (
        <div className="support-success">
          <strong>
            Request submitted
          </strong>

          <span>
            {successMessage}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
          >
            <CloseIcon />
          </button>
        </div>
      )}

      {/* ================================================================
          QUICK HELP
      ================================================================= */}

      <section className="support-quick-help">
        <div className="support-quick-heading">
          <div className="support-quick-icon">
            <HeadsetIcon />
          </div>

          <div>
            <span>
              QUICK HELP
            </span>

            <h2>
              Find help faster
            </h2>
          </div>
        </div>

        <div className="support-topic-grid">
          <article>
            <strong>
              Account & profile
            </strong>

            <span>
              Profile, email and account settings
            </span>
          </article>

          <article>
            <strong>
              Transactions
            </strong>

            <span>
              Income, expenses and transfers
            </span>
          </article>

          <article>
            <strong>
              Budgets & savings
            </strong>

            <span>
              Goals, deposits and budgeting
            </span>
          </article>

          <article>
            <strong>
              Security
            </strong>

            <span>
              Passwords and two-factor authentication
            </span>
          </article>
        </div>
      </section>

      {/* ================================================================
          TICKETS
      ================================================================= */}

      <section className="support-ticket-panel">
        <div className="support-ticket-toolbar">
          <div>
            <p>
              SUPPORT REQUESTS
            </p>

            <h2>
              Your tickets
            </h2>
          </div>

          <div className="support-search">
            <SearchIcon />

            <input
              type="search"
              placeholder="Search tickets..."
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

        {filteredTickets.length ===
        0 ? (
          <div className="support-empty">
            <div className="support-empty-icon">
              <HeadsetIcon />
            </div>

            <h3>
              {search
                ? "No matching tickets"
                : "No support requests yet"}
            </h3>

            <p>
              {search
                ? "Try a different search term."
                : "Need help with your account? Create your first support request."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={() =>
                  setShowCreateModal(
                    true,
                  )
                }
              >
                Create support request
              </button>
            )}
          </div>
        ) : (
          <div className="support-ticket-list">
            {filteredTickets.map(
              (
                ticket,
              ) => (
                <button
                  type="button"
                  className="support-ticket-row"
                  key={
                    ticket.id
                  }
                  onClick={() =>
                    openTicket(
                      ticket,
                    )
                  }
                >
                  <div className="support-ticket-number">
                    {ticket.ticket_number}
                  </div>

                  <div className="support-ticket-main">
                    <strong>
                      {ticket.subject}
                    </strong>

                    <span>
                      {formatCategory(
                        ticket.category,
                      )}
                      {" • "}
                      {formatDate(
                        ticket.created_at,
                      )}
                    </span>
                  </div>

                  <span
                    className={`support-priority ${ticket.priority}`}
                  >
                    {ticket.priority}
                  </span>

                  <span
                    className={`support-status ${ticket.status}`}
                  >
                    {formatStatus(
                      ticket.status,
                    )}
                  </span>

                  <ChevronIcon />
                </button>
              ),
            )}
          </div>
        )}
      </section>

      {/* ================================================================
          CREATE TICKET MODAL
      ================================================================= */}

      {showCreateModal && (
        <div className="support-modal-backdrop">
          <div
            className="support-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-modal-title"
          >
            <div className="support-modal-header">
              <div>
                <p>
                  CONTACT CUSTOMER SERVICE
                </p>

                <h2 id="support-modal-title">
                  Submit a support request
                </h2>

                <span>
                  Tell us what you need help with and
                  we'll take it from there.
                </span>
              </div>

              <button
                type="button"
                className="support-modal-close"
                onClick={() =>
                  setShowCreateModal(
                    false,
                  )
                }
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>

            {formError && (
              <div className="support-form-error">
                {formError}
              </div>
            )}

            <form
              onSubmit={
                handleSubmit
              }
            >
              <div className="support-field">
                <label htmlFor="support-subject">
                  Subject
                </label>

                <input
                  id="support-subject"
                  type="text"
                  value={
                    form.subject
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      subject:
                        event.target
                          .value,
                    })
                  }
                  placeholder="What do you need help with?"
                  maxLength={
                    150
                  }
                  required
                />
              </div>

              <div className="support-form-row">
                <div className="support-field">
                  <label htmlFor="support-category">
                    Category
                  </label>

                  <select
                    id="support-category"
                    value={
                      form.category
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm({
                        ...form,
                        category:
                          event.target
                            .value as CreateSupportTicketPayload["category"],
                      })
                    }
                  >
                    <option value="account">
                      Account
                    </option>

                    <option value="profile">
                      Profile
                    </option>

                    <option value="transactions">
                      Transactions
                    </option>

                    <option value="budgets">
                      Budgets
                    </option>

                    <option value="savings">
                      Savings
                    </option>

                    <option value="security">
                      Security
                    </option>

                    <option value="technical">
                      Technical
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>

                <div className="support-field">
                  <label htmlFor="support-priority">
                    Priority
                  </label>

                  <select
                    id="support-priority"
                    value={
                      form.priority
                    }
                    onChange={(
                      event,
                    ) =>
                      setForm({
                        ...form,
                        priority:
                          event.target
                            .value as CreateSupportTicketPayload["priority"],
                      })
                    }
                  >
                    <option value="low">
                      Low
                    </option>

                    <option value="normal">
                      Normal
                    </option>

                    <option value="high">
                      High
                    </option>

                    <option value="urgent">
                      Urgent
                    </option>
                  </select>
                </div>
              </div>

              <div className="support-field">
                <label htmlFor="support-message">
                  Describe your issue
                </label>

                <textarea
                  id="support-message"
                  rows={7}
                  value={
                    form.message
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      message:
                        event.target
                          .value,
                    })
                  }
                  placeholder="Please give us as much detail as possible..."
                  maxLength={
                    5000
                  }
                  required
                />

                <small>
                  {form.message.length}
                  /5000
                </small>
              </div>

              <div className="support-modal-actions">
                <button
                  type="button"
                  className="support-cancel-button"
                  onClick={() =>
                    setShowCreateModal(
                      false,
                    )
                  }
                  disabled={
                    createMutation.isPending
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="support-submit-button"
                  disabled={
                    createMutation.isPending
                  }
                >
                  {createMutation.isPending
                    ? "Submitting..."
                    : "Submit request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================
          TICKET DETAIL
      ================================================================= */}

      {selectedTicket && (
        <div className="support-modal-backdrop">
          <div className="support-detail-modal">
            <div className="support-detail-header">
              <button
                type="button"
                className="support-back-button"
                onClick={() =>
                  setSelectedTicket(
                    null,
                  )
                }
              >
                <ArrowLeftIcon />

                Back to tickets
              </button>

              <span
                className={`support-status ${selectedTicket.status}`}
              >
                {formatStatus(
                  selectedTicket.status,
                )}
              </span>
            </div>

            <p className="support-detail-number">
              {selectedTicket.ticket_number}
            </p>

            <h2>
              {selectedTicket.subject}
            </h2>

            <div className="support-detail-meta">
              <span>
                {formatCategory(
                  selectedTicket.category,
                )}
              </span>

              <span>
                Priority:{" "}
                {selectedTicket.priority}
              </span>

              <span>
                {formatDate(
                  selectedTicket.created_at,
                )}
              </span>
            </div>

            <section className="support-message-card">
              <span>
                YOUR REQUEST
              </span>

              <p>
                {selectedTicket.message}
              </p>
            </section>

            {selectedTicket.admin_response ? (
              <section className="support-response-card">
                <span>
                  CUSTOMER SERVICE RESPONSE
                </span>

                <p>
                  {
                    selectedTicket.admin_response
                  }
                </p>

                <small>
                  {formatDate(
                    selectedTicket.responded_at,
                  )}
                </small>
              </section>
            ) : (
              <div className="support-awaiting">
                <strong>
                  We're reviewing your request.
                </strong>

                <span>
                  A customer service response will
                  appear here when your ticket is updated.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}