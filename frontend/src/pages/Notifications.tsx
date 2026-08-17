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
  ).format(new Date(value));
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

export default function Notifications() {
  const queryClient =
    useQueryClient();

  const [
    activeFilter,
    setActiveFilter,
  ] = useState<
    "all" | "unread"
  >("all");

  const [search, setSearch] =
    useState("");

  const {
    data: allNotifications = [],
    isLoading: allLoading,
    isError: allError,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  const {
    data: unreadNotifications = [],
    isLoading: unreadLoading,
  } = useQuery({
    queryKey: [
      "notifications",
      "unread",
    ],
    queryFn:
      getUnreadNotifications,
  });

  const readMutation =
    useMutation({
      mutationFn:
        markNotificationAsRead,

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["notifications"],
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

      if (!term) {
        return source;
      }

      return source.filter(
        (notification) =>
          notification.title
            .toLowerCase()
            .includes(term) ||
          notification.message
            .toLowerCase()
            .includes(term),
      );
    }, [
      activeFilter,
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

  return (
    <main className="notifications-page">
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

        <div className="notification-header-count">
          <strong>
            {unreadCount}
          </strong>

          <span>
            unread
          </span>
        </div>
      </header>

      <section className="notification-summary">
        <article>
          <span>
            Total
          </span>

          <strong>
            {allNotifications.length}
          </strong>
        </article>

        <article className="success">
          <span>
            Positive
          </span>

          <strong>
            {successCount}
          </strong>
        </article>

        <article className="warning">
          <span>
            Warnings
          </span>

          <strong>
            {warningCount}
          </strong>
        </article>

        <article className="danger">
          <span>
            Critical
          </span>

          <strong>
            {dangerCount}
          </strong>
        </article>
      </section>

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

              {unreadCount > 0 && (
                <span>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

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
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
            />
          </div>
        </div>

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
            <h2>
              Unable to load notifications
            </h2>

            <p>
              Please check your connection and try
              again.
            </p>
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
                : search
                  ? "No matching notifications"
                  : "No notifications yet"}
            </h3>

            <p>
              {activeFilter ===
              "unread"
                ? "There are no unread notifications waiting for you."
                : "Important financial updates will appear here."}
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {displayedNotifications.map(
              (notification) => (
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
                      <h3>
                        {
                          notification.title
                        }
                      </h3>

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
                        Read
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