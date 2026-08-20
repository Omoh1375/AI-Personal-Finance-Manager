import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotificationPreferences, updateNotificationPreferences, type NotificationPreferences } from "../api/notificationPreferences";
import "./NotificationSettings.css";

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 20 6v6c0 5-3.4 8.1-8 9-4.6-.9-8-4-8-9V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h15a1 1 0 0 1 1 1v10H5a1 1 0 0 1-1-1V7Z" />
      <path d="M4 7V6a2 2 0 0 1 2-2h12" />
      <path d="M16 12h4" />
    </svg>
  );
}

function BudgetIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9h8M8 13h5M8 16h3" />
    </svg>
  );
}

function SavingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v5l3 2" />
    </svg>
  );
}

function PreferenceRow({
  title,
  description,
  icon,
  enabled,
  locked = false,
  onChange,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  enabled: boolean;
  locked?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <div className={`notification-preference-row ${locked ? "locked" : ""}`}>
      <div className="notification-preference-icon">{icon}</div>

      <div className="notification-preference-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <div className="notification-preference-control">
        {locked ? (
          <span className="notification-locked-badge">
            Always on
          </span>
        ) : (
          <button
            type="button"
            className={`notification-toggle ${enabled ? "on" : ""}`}
            onClick={() => onChange?.(!enabled)}
            aria-label={`${title}: ${enabled ? "enabled" : "disabled"}`}
            aria-pressed={enabled}
          >
            <span />
          </button>
        )}
      </div>
    </div>
  );
}

const DEFAULTS: NotificationPreferences = {
  email_notifications: true,
  financial_activity: true,
  budget_alerts: true,
  savings_alerts: true,
  security_alerts: true,
};

export default function NotificationSettings() {
  const queryClient = useQueryClient();

  const [preferences, setPreferences] = useState(DEFAULTS);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: getNotificationPreferences,
  });

  useEffect(() => {
    if (data) {
      setPreferences({
        email_notifications: data.email_notifications,
        financial_activity: data.financial_activity,
        budget_alerts: data.budget_alerts,
        savings_alerts: data.savings_alerts,
        security_alerts: true,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: (updated) => {
      const next = {
        email_notifications: updated.email_notifications,
        financial_activity: updated.financial_activity,
        budget_alerts: updated.budget_alerts,
        savings_alerts: updated.savings_alerts,
        security_alerts: true,
      };

      setPreferences(next);
      queryClient.setQueryData(["notification-preferences"], {
        ...updated,
        security_alerts: true,
      });
      setMessage("Notification preferences saved successfully.");
      setError("");
    },
    onError: (err: any) => {
      setError(
        err?.response?.data?.message ??
          "Unable to save notification preferences.",
      );
      setMessage("");
    },
  });

  const updatePreference = (
    key: keyof Pick<
      NotificationPreferences,
      | "email_notifications"
      | "financial_activity"
      | "budget_alerts"
      | "savings_alerts"
    >,
    value: boolean,
  ) => {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));

    setMessage("");
    setError("");

    mutation.mutate({
      ...preferences,
      [key]: value,
    });
  };

  if (isLoading) {
    return (
      <main className="notification-settings-page">
        <div className="notification-settings-loading">
          <div className="notification-settings-spinner" />
          <p>Loading notification settings...</p>
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="notification-settings-page">
        <div className="notification-settings-error">
          <h2>Unable to load notification settings</h2>
          <p>Please refresh the page and try again.</p>
          <button type="button" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="notification-settings-page">
      <header className="notification-settings-header">
        <div>
          <p className="notification-settings-eyebrow">
            NOTIFICATION SETTINGS
          </p>
          <h1>Stay informed</h1>
          <p className="notification-settings-subtitle">
            Choose which financial updates you want to receive by email.
            You will continue to receive important security alerts.
          </p>
        </div>

        <div className="notification-settings-header-icon">
          <BellIcon />
        </div>
      </header>

      {(message || error) && (
        <div className={`notification-settings-feedback ${error ? "error" : "success"}`}>
          <strong>{error ? "Something went wrong" : "Saved"}</strong>
          <span>{error || message}</span>
        </div>
      )}

      <section className="notification-settings-card">
        <div className="notification-settings-card-heading">
          <div>
            <p>EMAIL DELIVERY</p>
            <h2>Notification preferences</h2>
            <span>These settings control normal application emails.</span>
          </div>
          <MailIcon />
        </div>

        <div className="notification-preference-list">
          <PreferenceRow
            title="Email notifications"
            description="Master switch for normal financial email notifications."
            icon={<MailIcon />}
            enabled={preferences.email_notifications}
            onChange={(value) =>
              updatePreference("email_notifications", value)
            }
          />

          <PreferenceRow
            title="Financial activity"
            description="Receive emails about important transactions and account activity."
            icon={<WalletIcon />}
            enabled={preferences.financial_activity}
            onChange={(value) =>
              updatePreference("financial_activity", value)
            }
          />

          <PreferenceRow
            title="Budget alerts"
            description="Get notified when budgets approach or exceed their limits."
            icon={<BudgetIcon />}
            enabled={preferences.budget_alerts}
            onChange={(value) =>
              updatePreference("budget_alerts", value)
            }
          />

          <PreferenceRow
            title="Savings alerts"
            description="Receive updates about savings goals and milestones."
            icon={<SavingsIcon />}
            enabled={preferences.savings_alerts}
            onChange={(value) =>
              updatePreference("savings_alerts", value)
            }
          />

          <PreferenceRow
            title="Security alerts"
            description="Password, 2FA, recovery-code and other important security changes."
            icon={<ShieldIcon />}
            enabled
            locked
          />
        </div>
      </section>

      <section className="notification-security-note">
        <ShieldIcon />
        <div>
          <strong>Security notifications cannot be disabled.</strong>
          <span>
            This helps protect your account by notifying you when important
            authentication or security settings change.
          </span>
        </div>
      </section>

      <button
        type="button"
        className="notification-settings-refresh"
        onClick={() => refetch()}
        disabled={mutation.isPending}
      >
        Refresh settings
      </button>
    </main>
  );
}