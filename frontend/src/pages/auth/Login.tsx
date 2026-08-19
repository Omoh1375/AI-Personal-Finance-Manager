import {
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

import "./Login.css";

/* ==========================================================================
   ICONS
   ========================================================================== */

function BrandMark() {
  return (
    <div
      className="login-brand-mark"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
      >
        <rect
          x="2"
          y="2"
          width="36"
          height="36"
          rx="11"
          fill="currentColor"
        />

        <path
          d="M11 27V20"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        <path
          d="M17 27V15"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        <path
          d="M23 27V10"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        <path
          d="m10 13 6-4 6 3 8-6"
          stroke="white"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M26 3h4v4"
          stroke="white"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

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

/* ==========================================================================
   LOGIN PAGE
   ========================================================================== */

export default function Login() {
  const navigate =
    useNavigate();

  const {
    login,
  } = useAuth();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    rememberMe,
    setRememberMe,
  ] = useState(true);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    error,
    setError,
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

    const normalizedEmail =
      email.trim();

    if (!normalizedEmail) {
      setError(
        "Please enter your email address.",
      );

      return;
    }

    if (!password) {
      setError(
        "Please enter your password.",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email:
          normalizedEmail,
        password,
      });

      /*
       * The current AuthContext handles token storage
       * and authenticated user state.
       *
       * Remember-me is kept in the UI for now and will
       * be wired into persistent-session handling when
       * that feature is added to the authentication flow.
       */
      void rememberMe;

      navigate(
        "/dashboard",
        {
          replace: true,
        },
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
              };
            };
          }
        )?.response?.data;

      setError(
        response?.message ??
          "Unable to sign in. Please check your credentials and try again.",
      );
    } finally {
      setIsSubmitting(
        false,
      );
    }
  };

  return (
    <main className="login-page">
      {/* ================================================================
          LEFT VISUAL
      ================================================================= */}

      <section
        className="login-visual"
        aria-label="AI Personal Finance Manager"
      />

      {/* ================================================================
          LOGIN PANEL
      ================================================================= */}

      <section className="login-panel">
        <div className="login-card">
          {/* Mobile brand */}

          <div className="login-mobile-brand">
            <BrandMark />

            <div>
              <strong>
                AI Personal
              </strong>

              <span>
                Finance Manager
              </span>
            </div>
          </div>

          {/* Login icon */}

          <div
            className="login-card-icon"
            aria-hidden="true"
          >
            <LockIcon />
          </div>

          {/* Heading */}

          <div className="login-heading">
            <span>
              WELCOME BACK
            </span>

            <h2>
              Sign in to your account
            </h2>

            <p>
              Continue managing your money,
              goals and financial progress.
            </p>
          </div>

          {/* Error */}

          {error && (
            <div
              className="login-error"
              role="alert"
            >
              <span className="login-error-icon">
                !
              </span>

              <div>
                <strong>
                  Sign in unsuccessful
                </strong>

                <p>
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Form */}

          <form
            className="login-form"
            onSubmit={
              handleSubmit
            }
          >
            {/* Email */}

            <div className="field-group">
              <label htmlFor="email">
                Email address
              </label>

              <div className="field">
                <MailIcon />

                <input
                  id="email"
                  name="email"
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

            {/* Password */}

            <div className="field-group">
              <div className="field-label-row">
                <label htmlFor="password">
                  Password
                </label>
              </div>

              <div className="field">
                <LockIcon />

                <input
                  id="password"
                  name="password"
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={
                    isSubmitting
                  }
                />

                <button
                  type="button"
                  className="icon-button"
                  onClick={() =>
                    setShowPassword(
                      (
                        current,
                      ) =>
                        !current,
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  aria-pressed={
                    showPassword
                  }
                  disabled={
                    isSubmitting
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

            {/* Options */}

            <div className="login-options">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={
                    rememberMe
                  }
                  onChange={(
                    event,
                  ) =>
                    setRememberMe(
                      event.target
                        .checked,
                    )
                  }
                  disabled={
                    isSubmitting
                  }
                />

                <span
                  className="custom-checkbox"
                  aria-hidden="true"
                >
                  {rememberMe
                    ? "✓"
                    : ""}
                </span>

                <span>
                  Remember me
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="text-link"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}

            <button
              type="submit"
              className="primary-button"
              disabled={
                isSubmitting
              }
            >
              {isSubmitting ? (
                <span className="button-loading">
                  <span className="spinner" />

                  Signing in...
                </span>
              ) : (
                <>
                  <span className="sign-in-arrow">
                    →
                  </span>

                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Security note */}

          <div className="login-security-note">
            <ShieldIcon />

            <span>
              Your account is protected with secure
              authentication.
            </span>
          </div>

          {/* Register */}

          <p className="signup-text">
            New to AI Personal Finance
            Manager?{" "}

            <Link to="/register">
              Create your account
            </Link>
          </p>

          {/* Footer */}

          <div className="login-footer-links">
            <span>
              Secure financial management
            </span>

            <span>
              •
            </span>

            <span>
              © 2026
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}