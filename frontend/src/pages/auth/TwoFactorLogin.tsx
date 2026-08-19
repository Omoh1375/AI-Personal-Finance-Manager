import {
  useState,
  type FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  verifyTwoFactorLogin,
} from "../../api/auth";

import {
  useAuth,
} from "../../context/AuthContext";

import "./TwoFactorLogin.css";

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

export default function TwoFactorLogin() {
  const navigate =
    useNavigate();

  const {
    completeTwoFactorLogin,
  } = useAuth();

  const challengeToken =
    sessionStorage.getItem(
      "two_factor_challenge",
    );

  const [
    code,
    setCode,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    useRecoveryCode,
    setUseRecoveryCode,
  ] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (!challengeToken) {
      setError(
        "Your verification session has expired. Please sign in again.",
      );

      return;
    }

    if (
      useRecoveryCode
        ? !code.trim()
        : code.length !== 6
    ) {
      setError(
        useRecoveryCode
          ? "Enter a recovery code."
          : "Enter the 6-digit code from your authenticator app.",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        await verifyTwoFactorLogin(
          challengeToken,
          code.trim(),
        );

      completeTwoFactorLogin(
        response.user,
        response.token,
      );

      sessionStorage.removeItem(
        "two_factor_challenge",
      );

      navigate(
        "/dashboard",
        {
          replace: true,
        },
      );
    } catch (
      err: any
    ) {
      setError(
        err?.response?.data?.message ??
          "The verification code is invalid or has expired.",
      );
    } finally {
      setIsSubmitting(
        false,
      );
    }
  };

  const cancel =
    () => {
      sessionStorage.removeItem(
        "two_factor_challenge",
      );

      navigate(
        "/login",
        {
          replace: true,
        },
      );
    };

  return (
    <main className="two-factor-login-page">
      <section className="two-factor-login-card">
        <div className="two-factor-login-icon">
          <ShieldIcon />
        </div>

        <p className="two-factor-login-kicker">
          TWO-FACTOR AUTHENTICATION
        </p>

        <h1>
          Verify your identity
        </h1>

        <p className="two-factor-login-description">
          Open your authenticator app and enter the
          code shown for your account.
        </p>

        {error && (
          <div
            className="two-factor-login-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
        >
          <label htmlFor="login-2fa-code">
            {useRecoveryCode
              ? "Recovery code"
              : "Authentication code"}
          </label>

          <input
            id="login-2fa-code"
            type="text"
            inputMode={
              useRecoveryCode
                ? "text"
                : "numeric"
            }
            maxLength={
              useRecoveryCode
                ? 10
                : 6
            }
            autoComplete={
              useRecoveryCode
                ? "off"
                : "one-time-code"
            }
            autoFocus
            value={code}
            onChange={(
              event,
            ) =>
              setCode(
                useRecoveryCode
                  ? event.target.value
                      .toUpperCase()
                      .replace(
                        /[^A-Z0-9]/g,
                        "",
                      )
                  : event.target.value.replace(
                      /\D/g,
                      "",
                    ),
              )
            }
            placeholder={
              useRecoveryCode
                ? "XXXXXXXXXX"
                : "000000"
            }
            disabled={
              isSubmitting
            }
          />

          <button
            type="submit"
            disabled={
              isSubmitting
            }
          >
            {isSubmitting
              ? "Verifying..."
              : "Verify & continue"}
          </button>
        </form>

        <button
          type="button"
          className="two-factor-recovery-toggle"
          onClick={() => {
            setUseRecoveryCode(
              (
                current,
              ) =>
                !current,
            );

            setCode("");
            setError("");
          }}
          disabled={
            isSubmitting
          }
        >
          {useRecoveryCode
            ? "Use authenticator code instead"
            : "Use a recovery code"}
        </button>

        <button
          type="button"
          className="two-factor-back-button"
          onClick={cancel}
          disabled={
            isSubmitting
          }
        >
          ← Back to sign in
        </button>
      </section>
    </main>
  );
}