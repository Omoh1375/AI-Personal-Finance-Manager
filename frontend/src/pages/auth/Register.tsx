import {
  type FormEvent,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Register.css";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.8-4 4.3-6 8-6s6.2 2 8 6" />
    </svg>
  );
}

function EyeIcon({ hidden = false }: { hidden?: boolean }) {
  return hidden ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 3 18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 4.7A10.9 10.9 0 0 1 12 4.5c5 0 8.7 4.2 10 7.5a13.5 13.5 0 0 1-3.2 4.7" />
      <path d="M6.2 6.3A13.2 13.2 0 0 0 2 12c1.3 3.3 5 7.5 10 7.5a10.6 10.6 0 0 0 4-.8" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LogoMark() {
  return (
    <div className="register-brand-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32">
        <path d="M7 24V16" />
        <path d="M13 24V11" />
        <path d="M19 24V7" />
        <path d="M6 9l5-4 5 2 7-5" />
        <path d="M19 2h4v4" />
      </svg>
    </div>
  );
}

function SecurityIcon() {
  return (
    <div className="register-lock" aria-hidden="true">
      <LockIcon />
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmation, setShowConfirmation] =
    useState(false);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message;

      const validationErrors =
        err?.response?.data?.errors;

      if (validationErrors) {
        const firstError =
          Object.values(validationErrors)
            .flat()
            .find(Boolean);

        setError(
          typeof firstError === "string"
            ? firstError
            : message ??
                "Unable to create your account.",
        );
      } else {
        setError(
          message ??
            "Unable to create your account. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="register-page">
      <section
        className="register-visual"
        aria-label="Personal finance manager introduction"
      >
        <div className="register-overlay" />

        <div className="register-visual-content">
          <div className="register-brand">
            <LogoMark />

            <div>
              <span>AI Personal</span>
              <span>Finance Manager</span>
            </div>
          </div>

          <div className="register-copy">
            <span className="register-eyebrow">
              START YOUR FINANCIAL JOURNEY
            </span>

            <h1>
              Build better
              <br />
              financial
              <br />
              habits.
            </h1>

            <p>
              Organize your money, understand your
              spending and make smarter financial
              decisions with intelligent insights.
            </p>
          </div>

          <div className="register-points">
            <div>
              <strong>Track everything</strong>
              <span>
                Income, expenses, accounts and transfers
                in one place.
              </span>
            </div>

            <div>
              <strong>Plan with confidence</strong>
              <span>
                Set budgets and savings goals that keep
                you moving forward.
              </span>
            </div>

            <div>
              <strong>Understand your money</strong>
              <span>
                Get reports and intelligent financial
                insights from your data.
              </span>
            </div>
          </div>

          <div className="register-footer">
            © 2026 AI Personal Finance Manager. All
            rights reserved.
          </div>
        </div>
      </section>

      <section className="register-panel">
        <div className="register-card">
          <SecurityIcon />

          <div className="register-heading">
            <h2>Create your account</h2>

            <p>
              Start managing your finances smarter
              today.
            </p>
          </div>

          {error && (
            <div
              className="register-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <form
            className="register-form"
            onSubmit={handleSubmit}
          >
            <div className="register-field-group">
              <label htmlFor="name">
                Full name
              </label>

              <div className="register-field">
                <UserIcon />

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="register-field-group">
              <label htmlFor="register-email">
                Email address
              </label>

              <div className="register-field">
                <MailIcon />

                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="register-field-group">
              <label htmlFor="register-password">
                Password
              </label>

              <div className="register-field">
                <LockIcon />

                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Create a password"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="register-icon-button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current,
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <EyeIcon
                    hidden={showPassword}
                  />
                </button>
              </div>
            </div>

            <div className="register-field-group">
              <label htmlFor="register-confirm-password">
                Confirm password
              </label>

              <div className="register-field">
                <LockIcon />

                <input
                  id="register-confirm-password"
                  type={
                    showConfirmation
                      ? "text"
                      : "password"
                  }
                  value={passwordConfirmation}
                  onChange={(event) =>
                    setPasswordConfirmation(
                      event.target.value,
                    )
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="register-icon-button"
                  onClick={() =>
                    setShowConfirmation(
                      (current) => !current,
                    )
                  }
                  aria-label={
                    showConfirmation
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <EyeIcon
                    hidden={showConfirmation}
                  />
                </button>
              </div>
            </div>

            <label className="terms-row">
              <input
                type="checkbox"
                required
              />

              <span>
                I agree to the Terms of Service and
                Privacy Policy.
              </span>
            </label>

            <button
              type="submit"
              className="register-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="register-loading">
                  <span className="register-spinner" />
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="register-divider">
            <span />
            <p>Already have an account?</p>
            <span />
          </div>

          <Link
            to="/login"
            className="back-login"
          >
            Sign in to your account
          </Link>
        </div>
      </section>
    </main>
  );
}