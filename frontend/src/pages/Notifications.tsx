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
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
} from "../api/notifications";

import "./Notifications.css";

type NotificationFilter =
  | "all"
  | "unread";

type NotificationType =
  | "all"
  | "success"
  | "warning"
  | "danger"
  | "info";

function formatDate(
  value: string,
) {
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

function notificationIcon(
  type: string,
) {
  switch (type) {
    case "success":
      return "✓";

    case "warning":
      return "!";

    case "danger":
      return "×";

    default:
      return "i";
  }
}

function notificationLabel(
  type: string,
) {
  switch (type) {
    case "success":
      return "Positive";

    case "warning":
      return "Warning";

    case "danger":
      return "Critical";

    default:
      return "Information";
  }
}

export default function Notifications() {
  const queryClient =
    useQueryClient();

  const [
    activeFilter,
    setActiveFilter,
  ] =
    useState<NotificationFilter>(
      "all",
    );

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState<NotificationType>(
      "all",
    );

  const [search, setSearch] =
    useState("");

  const {
    data: allNotifications = [],
    isLoading: allLoading,
    isFetching: allFetching,
    isError: allError,
    refetch: refetchAll,
  } = useQuery({
    queryKey: [
      "notifications",
    ],

    queryFn:
      getNotifications,

    staleTime: 30_000,
  });

  const {
    data: unreadNotifications = [],
    isLoading: unreadLoading,
    isFetching:
      unreadFetching,
    refetch: refetchUnread,
  } = useQuery({
    queryKey: [
      "notifications",
      "unread",
    ],

    queryFn:
      getUnreadNotifications,

    staleTime: 30_000,
  });

  const readMutation =
    useMutation({
      mutationFn:
        markNotificationAsRead,

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "notifications",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "notifications",
            "unread",
          ],
        });
      },
    });

  const displayedNotifications =
    useMemo(() => {
      const source =
        activeFilter === "unread"
          ? unreadNotifications
          : allNotifications;

      const term =
        search
          .trim()
          .toLowerCase();

      return source.filter(
        (notification) => {
          const matchesSearch =
            !term ||
            notification.title
              .toLowerCase()
              .includes(term) ||
            notification.message
              .toLowerCase()
              .includes(term);

          const matchesType =
            typeFilter ===
              "all" ||
            notification.type ===
              typeFilter;

          return (
            matchesSearch &&
            matchesType
          );
        },
      );
    }, [
      activeFilter,
      typeFilter,
      unreadNotifications,
      allNotifications,
      search,
    ]);

  const unreadCount =
    unreadNotifications.length;

  const successCount =
    allNotifications.filter(
      (notification) =>
        notification.type ===
        "success",
    ).length;

  const warningCount =
    allNotifications.filter(
      (notification) =>
        notification.type ===
        "warning",
    ).length;

  const dangerCount =
    allNotifications.filter(
      (notification) =>
        notification.type ===
        "danger",
    ).length;

  const isRefreshing =
    allFetching ||
    unreadFetching;

  const handleRefresh =
    () => {
      refetchAll();
      refetchUnread();
    };

  return (
    <main className="notifications-page">
      {/* ================================================================
          HEADER
      ================================================================= */}

      <header className="notifications-header">
        <div>
          <p className="notifications-eyebrow">
            ACCOUNT ACTIVITY
          </p>

          <h1>
            Notifications
          </h1>

          <p className="notifications-subtitle">
            Stay informed about important changes
            in your financial life.
          </p>
        </div>

        <div className="notification-header-actions">
          <button
            className="notification-refresh"
            onClick={
              handleRefresh
            }
            disabled={
              isRefreshing
            }
            title="Refresh notifications"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M20 11a8 8 0 0 0-14.5-4.7L4 8" />
              <path d="M4 4v4h4" />
              <path d="M4 13a8 8 0 0 0 14.5 4.7L20 16" />
              <path d="M20 20v-4h-4" />
            </svg>
          </button>

          <div className="notification-header-count">
            <strong>
              {unreadCount}
            </strong>

            <span>
              unread
            </span>
          </div>
        </div>
      </header>

      {/* ================================================================
          SUMMARY
      ================================================================= */}

      <section className="notification-summary">
        <article>
          <span>
            Total
          </span>

          <strong>
            {allNotifications.length}
          </strong>

          <small>
            All notifications
          </small>
        </article>

        <article className="success">
          <span>
            Positive
          </span>

          <strong>
            {successCount}
          </strong>

          <small>
            Successful events
          </small>
        </article>

        <article className="warning">
          <span>
            Warnings
          </span>

          <strong>
            {warningCount}
          </strong>

          <small>
            Needs attention
          </small>
        </article>

        <article className="danger">
          <span>
            Critical
          </span>

          <strong>
            {dangerCount}
          </strong>

          <small>
            Important alerts
          </small>
        </article>
      </section>

      {/* ================================================================
          PANEL
      ================================================================= */}

      <section className="notifications-panel">
        <div className="notifications-toolbar">
          <div className="notification-tabs">
            <button
              className={
                activeFilter ===
                "all"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveFilter(
                  "all",
                )
              }
            >
              All
            </button>

            <button
              className={
                activeFilter ===
                "unread"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveFilter(
                  "unread",
                )
              }
            >
              Unread

              {unreadCount >
                0 && (
                <span>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="notification-toolbar-right">
            <select
              className="notification-type-filter"
              value={
                typeFilter
              }
              onChange={(
                event,
              ) =>
                setTypeFilter(
                  event.target
                    .value as NotificationType,
                )
              }
            >
              <option value="all">
                All types
              </option>

              <option value="success">
                Positive
              </option>

              <option value="warning">
                Warnings
              </option>

              <option value="danger">
                Critical
              </option>

              <option value="info">
                Information
              </option>
            </select>

            <div className="notification-search">
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
                placeholder="Search notifications..."
                value={
                  search
                }
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

        {/* ==============================================================
            CONTENT
        ============================================================== */}

        {allLoading ||
        (activeFilter ===
          "unread" &&
          unreadLoading) ? (
          <div className="notifications-loading">
            <div className="notifications-spinner" />

            <p>
              Loading notifications...
            </p>
          </div>
        ) : allError ? (
          <div className="notifications-error">
            <div className="notifications-error-icon">
              !
            </div>

            <h2>
              Unable to load notifications
            </h2>

            <p>
              Please check your connection and try
              again.
            </p>

            <button
              onClick={
                handleRefresh
              }
            >
              Try again
            </button>
          </div>
        ) : displayedNotifications.length ===
          0 ? (
          <div className="notifications-empty">
            <div className="notifications-empty-icon">
              ✓
            </div>

            <h3>
              {activeFilter ===
              "unread"
                ? "You're all caught up"
                : search ||
                    typeFilter !==
                      "all"
                  ? "No matching notifications"
                  : "No notifications yet"}
            </h3>

            <p>
              {activeFilter ===
              "unread"
                ? "There are no unread notifications waiting for you."
                : search ||
                    typeFilter !==
                      "all"
                  ? "Try changing your search or notification filter."
                  : "Important financial updates will appear here."}
            </p>

            {(search ||
              typeFilter !==
                "all") && (
              <button
                className="clear-notification-filters"
                onClick={() => {
                  setSearch("");
                  setTypeFilter(
                    "all",
                  );
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="notifications-list">
            {displayedNotifications.map(
              (
                notification,
              ) => (
                <article
                  className={`notification-row ${
                    notification.is_read
                      ? "read"
                      : "unread"
                  }`}
                  key={
                    notification.id
                  }
                >
                  <div
                    className={`notification-icon ${notification.type}`}
                  >
                    {notificationIcon(
                      notification.type,
                    )}
                  </div>

                  <div className="notification-content">
                    <div className="notification-title-row">
                      <div className="notification-title-group">
                        <h3>
                          {
                            notification.title
                          }
                        </h3>

                        <span
                          className={`notification-type-label ${notification.type}`}
                        >
                          {notificationLabel(
                            notification.type,
                          )}
                        </span>
                      </div>

                      {!notification.is_read && (
                        <span className="unread-dot" />
                      )}
                    </div>

                    <p>
                      {
                        notification.message
                      }
                    </p>

                    <small>
                      {formatDate(
                        notification.created_at,
                      )}
                    </small>
                  </div>

                  <div className="notification-action">
                    {notification.is_read ? (
                      <span className="read-label">
                        ✓ Read
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          readMutation.mutate(
                            notification.id,
                          )
                        }
                        disabled={
                          readMutation.isPending
                        }
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>
    </main>
  );
}