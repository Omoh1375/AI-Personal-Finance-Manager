import {
  useQuery,
} from "@tanstack/react-query";

import {
  getSecurityStatus,
} from "../api/security";

import "./Security.css";

export default function Security() {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["security-status"],
    queryFn: getSecurityStatus,
  });

  if (isLoading) {
    return (
      <main className="security-page">
        <div className="security-loading">
          <div className="security-spinner" />
          <p>
            Loading security settings...
          </p>
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="security-page">
        <div className="security-error">
          <h2>
            Unable to load security settings
          </h2>

          <p>
            Please refresh the page and try again.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="security-page">
      <header className="security-header">
        <div>
          <p className="security-eyebrow">
            ACCOUNT SECURITY
          </p>

          <h1>
            Security
          </h1>

          <p className="security-subtitle">
            Protect your account and manage your
            authentication settings.
          </p>
        </div>

        <div
          className={`security-status-badge ${
            data.two_factor_enabled
              ? "enabled"
              : "disabled"
          }`}
        >
          <span />

          {data.two_factor_enabled
            ? "2FA enabled"
            : "2FA not enabled"}
        </div>
      </header>

      <section className="security-card">
        <div className="security-card-icon two-factor">
          ✓
        </div>

        <div className="security-card-heading">
          <div>
            <p>
              TWO-FACTOR AUTHENTICATION
            </p>

            <h2>
              Authenticator app
            </h2>
          </div>
        </div>

        <p className="security-card-description">
          Two-factor authentication adds an extra
          layer of protection to your account.
        </p>

        <div className="security-two-factor-status">
          <strong>
            {data.two_factor_enabled
              ? "Two-factor authentication is enabled."
              : "Two-factor authentication is currently disabled."}
          </strong>

          <span>
            Recovery codes:{" "}
            {data.has_recovery_codes
              ? "Configured"
              : "Not configured"}
          </span>
        </div>
      </section>
    </main>
  );
}