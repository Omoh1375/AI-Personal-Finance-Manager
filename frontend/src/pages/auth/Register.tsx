import {
  type FormEvent,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

import "./Register.css";

/* ==========================================================================
   ICONS
   ========================================================================== */

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

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="4"
      />

      <path d="M4 20c1.8-4 4.3-6 8-6s6.2 2 8 6" />
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

function BrandMark() {
  return (
    <div
      className="register-brand-mark"
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

/* ==========================================================================
   REGISTER
   ========================================================================== */

export default function Register() {
  const navigate =
    useNavigate();

  const {
    register,
  } = useAuth();

  const [
    name,
    setName,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    passwordConfirmation,
    setPasswordConfirmation,
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
    agreeToTerms,
    setAgreeToTerms,
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

    const trimmedName =
      name.trim();

    const trimmedEmail =
      email.trim();

    if (!trimmedName) {
      setError(
        "Please enter your full name.",
      );

      return;
    }

    if (!trimmedEmail) {
      setError(
        "Please enter your email address.",
      );

      return;
    }

    if (!password) {
      setError(
        "Please create a password.",
      );

      return;
    }

    if (
      password !==
      passwordConfirmation
    ) {
      setError(
        "Passwords do not match.",
      );

      return;
    }

    if (
      password.length < 8
    ) {
      setError(
        "Your password must contain at least 8 characters.",
      );

      return;
    }

    if (!agreeToTerms) {
      setError(
        "Please agree to the Terms of Service and Privacy Policy.",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: trimmedName,
        email: trimmedEmail,
        password,
        password_confirmation:
          passwordConfirmation,
      });

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

                errors?: Record<
                  string,
                  string[]
                >;
              };
            };
          }
        )?.response?.data;

      const validationErrors =
        response?.errors;

      if (
        validationErrors
      ) {
        const firstError =
          Object.values(
            validationErrors,
          )
            .flat()
            .find(Boolean);

        setError(
          typeof firstError ===
            "string"
            ? firstError
            : response?.message ??
                "Unable to create your account.",
        );
      } else {
        setError(
          response?.message ??
            "Unable to create your account. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="register-page">
      {/* ================================================================
          LEFT VISUAL PANEL
      ================================================================= */}

      <section
        className="register-visual"
        aria-label="AI Personal Finance Manager"
      >
        <div
          className="register-overlay"
          aria-hidden="true"
        />
      </section>

      {/* ================================================================
          REGISTRATION PANEL
      ================================================================= */}

      <section className="register-panel">
        <div className="register-card">
          {/* Mobile brand */}

          <div className="register-mobile-brand">
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

          {/* Icon */}

          <div
            className="register-lock"
            aria-hidden="true"
          >
            <UserIcon />
          </div>

          {/* Heading */}

          <div className="register-heading">
            <span className="register-heading-eyebrow">
              GET STARTED
            </span>

            <h2>
              Create your account
            </h2>

            <p>
              Start managing your finances smarter
              today.
            </p>
          </div>

          {/* Error */}

          {error && (
            <div
              className="register-error"
              role="alert"
            >
              <span className="register-error-icon">
                !
              </span>

              <span>
                {error}
              </span>
            </div>
          )}

          {/* Form */}

          <form
            className="register-form"
            onSubmit={
              handleSubmit
            }
          >
            {/* Name */}

            <div className="register-field-group">
              <label htmlFor="name">
                Full name
              </label>

              <div className="register-field">
                <UserIcon />

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(
                    event,
                  ) =>
                    setName(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  autoFocus
                  required
                  disabled={
                    isSubmitting
                  }
                />
              </div>
            </div>

            {/* Email */}

            <div className="register-field-group">
              <label htmlFor="register-email">
                Email address
              </label>

              <div className="register-field">
                <MailIcon />

                <input
                  id="register-email"
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
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  disabled={
                    isSubmitting
                  }
                />
              </div>
            </div>

            {/* Password */}

            <div className="register-field-group">
              <label htmlFor="register-password">
                Password
              </label>

              <div className="register-field">
                <LockIcon />

                <input
                  id="register-password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(
                    event,
                  ) =>
                    setPassword(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                  disabled={
                    isSubmitting
                  }
                />

                <button
                  type="button"
                  className="register-icon-button"
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

            {/* Confirmation */}

            <div className="register-field-group">
              <label htmlFor="register-confirm-password">
                Confirm password
              </label>

              <div
                className={`register-field ${
                  passwordConfirmation &&
                  password !==
                    passwordConfirmation
                    ? "has-error"
                    : ""
                }`}
              >
                <LockIcon />

                <input
                  id="register-confirm-password"
                  name="password_confirmation"
                  type={
                    showConfirmation
                      ? "text"
                      : "password"
                  }
                  value={
                    passwordConfirmation
                  }
                  onChange={(
                    event,
                  ) =>
                    setPasswordConfirmation(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                  disabled={
                    isSubmitting
                  }
                />

                <button
                  type="button"
                  className="register-icon-button"
                  onClick={() =>
                    setShowConfirmation(
                      (
                        current,
                      ) =>
                        !current,
                    )
                  }
                  aria-label={
                    showConfirmation
                      ? "Hide password"
                      : "Show password"
                  }
                  aria-pressed={
                    showConfirmation
                  }
                  disabled={
                    isSubmitting
                  }
                >
                  <EyeIcon
                    hidden={
                      showConfirmation
                    }
                  />
                </button>
              </div>

              {passwordConfirmation &&
                password !==
                  passwordConfirmation && (
                  <span className="register-field-hint">
                    Passwords do not match.
                  </span>
                )}
            </div>

            {/* Terms */}

            <label className="terms-row">
              <input
                type="checkbox"
                checked={
                  agreeToTerms
                }
                onChange={(
                  event,
                ) =>
                  setAgreeToTerms(
                    event.target
                      .checked,
                  )
                }
                disabled={
                  isSubmitting
                }
                required
              />

              <span className="terms-check">
                {agreeToTerms
                  ? "✓"
                  : ""}
              </span>

              <span>
                I agree to the{" "}
                <a
                  href="#terms"
                  onClick={(
                    event,
                  ) =>
                    event.stopPropagation()
                  }
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#privacy"
                  onClick={(
                    event,
                  ) =>
                    event.stopPropagation()
                  }
                >
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            {/* Submit */}

            <button
              type="submit"
              className="register-button"
              disabled={
                isSubmitting ||
                !agreeToTerms
              }
            >
              {isSubmitting ? (
                <span className="register-loading">
                  <span className="register-spinner" />

                  Creating account...
                </span>
              ) : (
                <>
                  Create account

                  <span className="register-button-arrow">
                    →
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Login link */}

          <div className="register-divider">
            <span />

            <p>
              Already have an account?
            </p>

            <span />
          </div>

          <Link
            to="/login"
            className="back-login"
          >
            Sign in to your account
          </Link>

          <div className="register-security-note">
            <ShieldIcon />

            <span>
              Your account is protected with secure
              authentication.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
