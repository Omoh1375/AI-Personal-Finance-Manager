import {
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  resetPassword,
} from "../../api/auth";

import "./ResetPassword.css";

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
      />

      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon({
  hidden = false,
}: {
  hidden?: boolean;
}) {
  if (hidden) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="m3 3 18 18" />

        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />

        <path d="M9.9 4.7A10.9 10.9 0 0 1 12 4.5c5 0 8.7 4.2 10 7.5a13.5 13.5 0 0 1-3.2 4.7" />

        <path d="M6.2 6.3A13.2 13.2 0 0 0 2 12c1.3 3.3 5 7.5 10 7.5a10.6 10.6 0 0 0 4-.8" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />

      <circle
        cx="12"
        cy="12"
        r="3"
      />
    </svg>
  );
}

export default function ResetPassword() {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const token =
    searchParams.get(
      "token",
    ) ?? "";

  const initialEmail =
    searchParams.get(
      "email",
    ) ?? "";

  const [
    email,
    setEmail,
  ] = useState(
    initialEmail,
  );

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmation,
    setConfirmation,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmation,
    setShowConfirmation,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError(
        "This password reset link is invalid or incomplete.",
      );

      return;
    }

    if (!email.trim()) {
      setError(
        "Please enter your email address.",
      );

      return;
    }

    if (password.length < 8) {
      setError(
        "Your password must contain at least 8 characters.",
      );

      return;
    }

    if (
      password !==
      confirmation
    ) {
      setError(
        "Passwords do not match.",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        await resetPassword({
          token,
          email:
            email.trim(),
          password,
          password_confirmation:
            confirmation,
        });

      setSuccess(
        response.message,
      );

      window.setTimeout(
        () => {
          navigate(
            "/login",
            {
              replace: true,
            },
          );
        },
        1600,
      );
    } catch (
      err: unknown
    ) {
      const response =
        (
          err as {
            response?: {
              data?: {
                message?: string;

                errors?: Record<
                  string,
                  string[]
                >;
              };
            };
          }
        )?.response?.data;

      const firstError =
        response?.errors
          ? Object.values(
              response.errors,
            )
              .flat()
              .find(Boolean)
          : null;

      setError(
        typeof firstError ===
          "string"
          ? firstError
          : response?.message ??
              "Unable to reset your password. The link may have expired.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="reset-password-page">
      <section className="reset-password-visual">
        <div className="reset-password-visual-content">
          <div className="reset-password-brand">
            <div>
              $
            </div>

            <span>
              AI Personal Finance Manager
            </span>
          </div>

          <div className="reset-password-copy">
            <span>
              SECURE ACCOUNT RECOVERY
            </span>

            <h1>
              Create a new
              secure password.
            </h1>

            <p>
              Choose a password that keeps your
              financial information protected.
            </p>
          </div>
        </div>
      </section>

      <section className="reset-password-panel">
        <div className="reset-password-card">
          <div className="reset-password-icon">
            <LockIcon />
          </div>

          <div className="reset-password-heading">
            <span>
              PASSWORD RESET
            </span>

            <h1>
              Set a new password
            </h1>

            <p>
              Enter your email and choose a new
              password for your account.
            </p>
          </div>

          {error && (
            <div
              className="reset-password-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="reset-password-success"
              role="status"
            >
              {success}

              <small>
                Redirecting you to sign in...
              </small>
            </div>
          )}

          {!success && (
            <form
              className="reset-password-form"
              onSubmit={
                handleSubmit
              }
            >
              <div className="reset-password-field-group">
                <label htmlFor="reset-email">
                  Email address
                </label>

                <div className="reset-password-field">
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(
                      event,
                    ) =>
                      setEmail(
                        event.target
                          .value,
                      )
                    }
                    autoComplete="email"
                    required
                    disabled={
                      Boolean(
                        initialEmail,
                      ) ||
                      isSubmitting
                    }
                  />
                </div>
              </div>

              <div className="reset-password-field-group">
                <label htmlFor="reset-password">
                  New password
                </label>

                <div className="reset-password-field">
                  <LockIcon />

                  <input
                    id="reset-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      password
                    }
                    onChange={(
                      event,
                    ) =>
                      setPassword(
                        event.target
                          .value,
                      )
                    }
                    autoComplete="new-password"
                    required
                    disabled={
                      isSubmitting
                    }
                  />

                  <button
                    type="button"
                    className="reset-password-eye"
                    onClick={() =>
                      setShowPassword(
                        (
                          current,
                        ) =>
                          !current,
                      )
                    }
                  >
                    <EyeIcon
                      hidden={
                        showPassword
                      }
                    />
                  </button>
                </div>
              </div>

              <div className="reset-password-field-group">
                <label htmlFor="reset-confirmation">
                  Confirm new password
                </label>

                <div className="reset-password-field">
                  <LockIcon />

                  <input
                    id="reset-confirmation"
                    type={
                      showConfirmation
                        ? "text"
                        : "password"
                    }
                    value={
                      confirmation
                    }
                    onChange={(
                      event,
                    ) =>
                      setConfirmation(
                        event.target
                          .value,
                      )
                    }
                    autoComplete="new-password"
                    required
                    disabled={
                      isSubmitting
                    }
                  />

                  <button
                    type="button"
                    className="reset-password-eye"
                    onClick={() =>
                      setShowConfirmation(
                        (
                          current,
                        ) =>
                          !current,
                      )
                    }
                  >
                    <EyeIcon
                      hidden={
                        showConfirmation
                      }
                    />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="reset-password-submit"
                disabled={
                  isSubmitting
                }
              >
                {isSubmitting ? (
                  "Updating password..."
                ) : (
                  "Reset password"
                )}
              </button>
            </form>
          )}

          <Link
            to="/login"
            className="reset-password-back"
          >
            ← Back to sign in
          </Link>
        </div>
      </section>
    </main>
  );
}