import {
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  forgotPassword,
} from "../../api/auth";

import "./ForgotPassword.css";

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />

      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <span
      aria-hidden="true"
      className="forgot-password-arrow"
    >
      →
    </span>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 3 20 6v6c0 5-3.4 8.1-8 9-4.6-.9-8-4-8-9V6l8-3Z" />

      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function ForgotPassword() {
  const navigate =
    useNavigate();

  const [
    email,
    setEmail,
  ] = useState("");

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

    const normalizedEmail =
      email.trim();

    if (!normalizedEmail) {
      setError(
        "Please enter your email address.",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        await forgotPassword({
          email:
            normalizedEmail,
        });

      setSuccess(
        response.message,
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
              "We could not process your request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="forgot-password-page">
      <section className="forgot-password-visual">
        <div className="forgot-password-visual-content">
          <div className="forgot-password-brand">
            <div className="forgot-password-brand-mark">
              $
            </div>

            <div>
              <strong>
                AI Personal
              </strong>

              <span>
                Finance Manager
              </span>
            </div>
          </div>

          <div className="forgot-password-visual-copy">
            <span>
              ACCOUNT RECOVERY
            </span>

            <h1>
              Get back to managing
              your money.
            </h1>

            <p>
              Securely reset your password and
              continue tracking your finances,
              budgets and savings goals.
            </p>
          </div>

          <div className="forgot-password-visual-footer">
            Secure account recovery
          </div>
        </div>
      </section>

      <section className="forgot-password-panel">
        <div className="forgot-password-card">
          <div className="forgot-password-icon">
            <MailIcon />
          </div>

          <div className="forgot-password-heading">
            <span>
              PASSWORD RESET
            </span>

            <h1>
              Forgot your password?
            </h1>

            <p>
              Enter the email address associated
              with your account and we'll send you
              a secure password reset link.
            </p>
          </div>

          {error && (
            <div
              className="forgot-password-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="forgot-password-success"
              role="status"
            >
              <strong>
                Check your email
              </strong>

              <span>
                {success}
              </span>
            </div>
          )}

          {!success && (
            <form
              className="forgot-password-form"
              onSubmit={
                handleSubmit
              }
            >
              <div className="forgot-password-field-group">
                <label htmlFor="forgot-email">
                  Email address
                </label>

                <div className="forgot-password-field">
                  <MailIcon />

                  <input
                    id="forgot-email"
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
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    required
                    disabled={
                      isSubmitting
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                className="forgot-password-submit"
                disabled={
                  isSubmitting
                }
              >
                {isSubmitting ? (
                  <>
                    <span className="forgot-password-spinner" />

                    Sending...
                  </>
                ) : (
                  <>
                    Send reset link

                    <ArrowIcon />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="forgot-password-security">
            <ShieldIcon />

            <span>
              For your security, we never reveal
              whether an email is registered.
            </span>
          </div>

          <button
            type="button"
            className="forgot-password-back"
            onClick={() =>
              navigate("/login")
            }
          >
            ← Back to sign in
          </button>

          <p className="forgot-password-footer">
            Remember your password?{" "}
            <Link to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}