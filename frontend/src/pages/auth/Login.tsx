import type {
  FormEvent,
} from "react";
import {
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

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
    <div className="brand-mark" aria-hidden="true">
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

function LockBadge() {
  return (
    <div className="lock-badge" aria-hidden="true">
      <LockIcon />
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email: email.trim(),
        password,
      });

      if (!rememberMe) {
        // Keep the existing auth implementation intact.
        // Session persistence can be handled later when we add
        // a dedicated remember-me strategy.
      }

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          "Unable to sign in. Please check your credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual" aria-label="Finance manager introduction">
        <div className="visual-overlay" />

        <div className="visual-content">
          <div className="brand">
            <LogoMark />

            <div>
              <span>AI Personal</span>
              <span>Finance Manager</span>
            </div>
          </div>

          <div className="visual-copy">
            <h1>
              Take control of
              <br />
              your financial
              <br />
              future
            </h1>

            <p>
              Track your income, manage expenses,
              <br />
              set budgets and achieve your
              <br />
              financial goals with AI insights.
            </p>
          </div>

          <div className="benefits">
            <div className="benefit">
              <div className="benefit-icon dashboard-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 19V5" />
                  <path d="M4 19h16" />
                  <path d="m7 15 4-4 3 2 5-6" />
                </svg>
              </div>

              <div>
                <strong>Smart Dashboard</strong>
                <span>Real-time insights into your financial health</span>
              </div>
            </div>

            <div className="benefit">
              <div className="benefit-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3 20 6v6c0 5-3.4 8.1-8 9-4.6-.9-8-4-8-9V6l8-3Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>

              <div>
                <strong>Secure &amp; Private</strong>
                <span>Bank-level security to keep your data safe</span>
              </div>
            </div>

            <div className="benefit">
              <div className="benefit-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="8" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                </svg>
              </div>

              <div>
                <strong>Achieve Goals</strong>
                <span>Set goals. We&apos;ll help you achieve them</span>
              </div>
            </div>
          </div>

          <div className="visual-footer">
            <span>© 2026 AI Personal Finance Manager.</span>
            <span>All rights reserved.</span>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <LockBadge />

          <div className="login-heading">
            <h2>Welcome back</h2>
            <p>Sign in to continue to your account</p>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <div className="field-group">
              <label htmlFor="email">Email address</label>

              <div className="field">
                <MailIcon />

                <input
                  id="email"
                  name="email"
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

            <div className="field-group">
              <label htmlFor="password">Password</label>

              <div className="field">
                <LockIcon />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="icon-button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <EyeIcon hidden={showPassword} />
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                />

                <span className="custom-checkbox">
                  {rememberMe && "✓"}
                </span>

                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="text-link"
                onClick={() => {
                  // Password reset will be wired when the
                  // backend password-reset endpoint is added.
                }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="button-loading">
                  <span className="spinner" />
                  Signing in...
                </span>
              ) : (
                <>
                  <span className="sign-in-arrow">↪</span>
                  Sign in
                </>
              )}
            </button>
          </form>

          <div className="divider">
            <span />
            <p>or continue with</p>
            <span />
          </div>

          <div className="social-buttons">
            <button
              type="button"
              className="social-button"
              onClick={() => {
                // Google authentication will be connected
                // when the backend OAuth endpoint exists.
              }}
            >
              <span className="google-icon">G</span>
              Continue with Google
            </button>

            <button
              type="button"
              className="social-button"
              onClick={() => {
                // Apple authentication will be connected
                // when the backend OAuth endpoint exists.
              }}
            >
              <span className="apple-icon">●</span>
              Continue with Apple
            </button>
          </div>

          <p className="signup-text">
            Don&apos;t have an account?{" "}
            <Link to="/register">Sign up</Link>
          </p>
        </div>
      </section>
    </main>
  );
}