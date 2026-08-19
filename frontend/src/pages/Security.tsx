import {
  useEffect,
  useState,
} from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  disableTwoFactor,
  enableTwoFactor,
  getSecurityStatus,
  regenerateRecoveryCodes,
  setupTwoFactor,
} from "../api/security";

import "./Security.css";

/* ==========================================================================
   ICONS
   ========================================================================== */

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

function KeyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="16"
        r="4"
      />

      <path d="m11 13 9-9" />

      <path d="m17 7 2 2" />

      <path d="m14 10 2 2" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="8"
        y="8"
        width="11"
        height="11"
        rx="2"
      />

      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

/* ==========================================================================
   QR CODE
   ========================================================================== */

function QrCode({
  value,
}: {
  value: string;
}) {
  const [
    qrImage,
    setQrImage,
  ] = useState("");

  const [
    qrError,
    setQrError,
  ] = useState("");

  useEffect(() => {
    let active = true;

    const createQr =
      async () => {
        try {
          setQrError("");

          const QRCode =
            await import(
              "qrcode"
            );

          const dataUrl =
            await QRCode.toDataURL(
              value,
              {
                width: 220,
                margin: 2,
                errorCorrectionLevel:
                  "M",
              },
            );

          if (active) {
            setQrImage(
              dataUrl,
            );
          }
        } catch {
          if (active) {
            setQrError(
              "Unable to generate the QR code. Use the manual setup key below.",
            );
          }
        }
      };

    void createQr();

    return () => {
      active = false;
    };
  }, [value]);

  if (qrError) {
    return (
      <div className="security-qr-fallback">
        <p>
          {qrError}
        </p>
      </div>
    );
  }

  if (!qrImage) {
    return (
      <div className="security-qr-loading">
        Generating QR code...
      </div>
    );
  }

  return (
    <div className="security-qr-wrapper">
      <img
        src={qrImage}
        alt="Two-factor authentication QR code"
      />
    </div>
  );
}

/* ==========================================================================
   SECURITY PAGE
   ========================================================================== */

export default function Security() {
  const queryClient =
    useQueryClient();

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "security-status",
    ],
    queryFn:
      getSecurityStatus,
  });

  const [
    setupData,
    setSetupData,
  ] = useState<{
    secret: string;
    qr_code_url: string;
  } | null>(null);

  const [
    confirmationCode,
    setConfirmationCode,
  ] = useState("");

  const [
    disableCode,
    setDisableCode,
  ] = useState("");

  const [
    recoveryCode,
    setRecoveryCode,
  ] = useState("");

  const [
    recoveryCodes,
    setRecoveryCodes,
  ] = useState<
    string[]
  >([]);

  const [
    copiedSecret,
    setCopiedSecret,
  ] = useState(false);

  const [
    copiedRecovery,
    setCopiedRecovery,
  ] = useState(false);

  const [
    actionMessage,
    setActionMessage,
  ] = useState("");

  const [
    actionError,
    setActionError,
  ] = useState("");

  /* ------------------------------------------------------------------------
     SETUP
  ------------------------------------------------------------------------ */

  const setupMutation =
    useMutation({
      mutationFn:
        setupTwoFactor,

      onSuccess: (
        response,
      ) => {
        setActionError("");
        setActionMessage("");

        setSetupData({
          secret:
            response.secret,
          qr_code_url:
            response.qr_code_url,
        });

        setConfirmationCode("");
      },

      onError: (
        error: any,
      ) => {
        setActionMessage("");

        setActionError(
          error?.response
            ?.data?.message ??
            "Unable to initialize two-factor authentication.",
        );
      },
    });

  /* ------------------------------------------------------------------------
     ENABLE
  ------------------------------------------------------------------------ */

  const enableMutation =
    useMutation({
      mutationFn:
        enableTwoFactor,

      onSuccess: (
        response,
      ) => {
        setActionError("");

        setActionMessage(
          response.message,
        );

        setRecoveryCodes(
          response.recovery_codes ??
            [],
        );

        setSetupData(null);
        setConfirmationCode("");

        queryClient.invalidateQueries({
          queryKey: [
            "security-status",
          ],
        });
      },

      onError: (
        error: any,
      ) => {
        setActionMessage("");

        setActionError(
          error?.response
            ?.data?.message ??
            "The authenticator code could not be verified.",
        );
      },
    });

  /* ------------------------------------------------------------------------
     DISABLE
  ------------------------------------------------------------------------ */

  const disableMutation =
    useMutation({
      mutationFn:
        disableTwoFactor,

      onSuccess: (
        response,
      ) => {
        setActionError("");

        setActionMessage(
          response.message,
        );

        setDisableCode("");
        setRecoveryCodes([]);

        queryClient.invalidateQueries({
          queryKey: [
            "security-status",
          ],
        });
      },

      onError: (
        error: any,
      ) => {
        setActionMessage("");

        setActionError(
          error?.response
            ?.data?.message ??
            "Unable to disable two-factor authentication.",
        );
      },
    });

  /* ------------------------------------------------------------------------
     RECOVERY CODES
  ------------------------------------------------------------------------ */

  const recoveryMutation =
    useMutation({
      mutationFn:
        regenerateRecoveryCodes,

      onSuccess: (
        response,
      ) => {
        setActionError("");

        setActionMessage(
          response.message,
        );

        setRecoveryCodes(
          response.recovery_codes ??
            [],
        );

        setRecoveryCode("");
      },

      onError: (
        error: any,
      ) => {
        setActionMessage("");

        setActionError(
          error?.response
            ?.data?.message ??
            "Unable to regenerate recovery codes.",
        );
      },
    });

  /* ------------------------------------------------------------------------
     HELPERS
  ------------------------------------------------------------------------ */

  const handleCopySecret =
    async () => {
      if (!setupData) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          setupData.secret,
        );

        setCopiedSecret(true);

        window.setTimeout(
          () =>
            setCopiedSecret(
              false,
            ),
          1600,
        );
      } catch {
        setCopiedSecret(false);
      }
    };

  const handleCopyRecoveryCodes =
    async () => {
      if (
        recoveryCodes.length ===
        0
      ) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          recoveryCodes.join(
            "\n",
          ),
        );

        setCopiedRecovery(
          true,
        );

        window.setTimeout(
          () =>
            setCopiedRecovery(
              false,
            ),
          1600,
        );
      } catch {
        setCopiedRecovery(false);
      }
    };

  const handleEnable =
    () => {
      if (
        confirmationCode.length !==
        6
      ) {
        setActionMessage("");

        setActionError(
          "Enter the 6-digit code shown in your authenticator app.",
        );

        return;
      }

      enableMutation.mutate(
        confirmationCode,
      );
    };

  const handleDisable =
    () => {
      if (
        disableCode.length !==
        6
      ) {
        setActionMessage("");

        setActionError(
          "Enter the current 6-digit authenticator code.",
        );

        return;
      }

      disableMutation.mutate(
        disableCode,
      );
    };

  const handleRecoveryCodes =
    () => {
      if (
        recoveryCode.length !==
        6
      ) {
        setActionMessage("");

        setActionError(
          "Enter your current 6-digit authenticator code.",
        );

        return;
      }

      recoveryMutation.mutate(
        recoveryCode,
      );
    };

  /* ------------------------------------------------------------------------
     LOADING
  ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------
     ERROR
  ------------------------------------------------------------------------ */

  if (
    isError ||
    !data
  ) {
    return (
      <main className="security-page">
        <div className="security-error">
          <div className="security-error-icon">
            !
          </div>

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

  const setupPending =
    setupMutation.isPending;

  const enablePending =
    enableMutation.isPending;

  const disablePending =
    disableMutation.isPending;

  const recoveryPending =
    recoveryMutation.isPending;

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

      {(actionMessage ||
        actionError) && (
        <section
          className={`security-alert ${
            actionError
              ? "error"
              : "success"
          }`}
        >
          <strong>
            {actionError
              ? "Action could not be completed"
              : "Security updated"}
          </strong>

          <span>
            {actionError ||
              actionMessage}
          </span>
        </section>
      )}

      <section className="security-layout">
        {/* ================================================================
            MAIN 2FA CARD
        ================================================================ */}

        <article className="security-card security-two-factor-card">
          <div className="security-card-header">
            <div className="security-card-icon two-factor">
              <ShieldIcon />
            </div>

            <div>
              <p className="security-card-kicker">
                TWO-FACTOR AUTHENTICATION
              </p>

              <h2>
                Authenticator app
              </h2>

              <p>
                Add an extra verification step when
                signing in to your account.
              </p>
            </div>
          </div>

          {/* --------------------------------------------------------------
              ENABLED STATE
          -------------------------------------------------------------- */}

          {data.two_factor_enabled ? (
            <>
              <div className="security-enabled-panel">
                <div className="security-enabled-icon">
                  ✓
                </div>

                <div>
                  <strong>
                    Two-factor authentication is active
                  </strong>

                  <span>
                    Your account requires a code from
                    your authenticator app when signing in.
                  </span>
                </div>
              </div>

              <div className="security-info-grid">
                <div>
                  <span>
                    Status
                  </span>

                  <strong className="security-positive">
                    Protected
                  </strong>
                </div>

                <div>
                  <span>
                    Recovery codes
                  </span>

                  <strong>
                    {data.has_recovery_codes
                      ? "Available"
                      : "Not configured"}
                  </strong>
                </div>

                <div>
                  <span>
                    Enabled
                  </span>

                  <strong>
                    {data.confirmed_at
                      ? new Intl.DateTimeFormat(
                          "en-NG",
                          {
                            day: "2-digit",
                            month:
                              "short",
                            year:
                              "numeric",
                          },
                        ).format(
                          new Date(
                            data.confirmed_at,
                          ),
                        )
                      : "Active"}
                  </strong>
                </div>
              </div>

              {/* Disable */}

              <div className="security-action-panel danger-panel">
                <div>
                  <h3>
                    Disable 2FA
                  </h3>

                  <p>
                    Enter a current authenticator
                    code to disable two-factor
                    authentication.
                  </p>
                </div>

                <div className="security-code-row">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={
                      disableCode
                    }
                    onChange={(
                      event,
                    ) =>
                      setDisableCode(
                        event.target.value.replace(
                          /\D/g,
                          "",
                        ),
                      )
                    }
                    placeholder="000000"
                    aria-label="Current authenticator code"
                  />

                  <button
                    type="button"
                    className="security-danger-button"
                    onClick={
                      handleDisable
                    }
                    disabled={
                      disablePending
                    }
                  >
                    {disablePending
                      ? "Disabling..."
                      : "Disable 2FA"}
                  </button>
                </div>
              </div>

              {/* Recovery codes */}

              <div className="security-action-panel">
                <div>
                  <h3>
                    Recovery codes
                  </h3>

                  <p>
                    Generate a new set of one-time
                    backup codes. Your previous codes
                    will stop working.
                  </p>
                </div>

                <div className="security-code-row">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={
                      recoveryCode
                    }
                    onChange={(
                      event,
                    ) =>
                      setRecoveryCode(
                        event.target.value.replace(
                          /\D/g,
                          "",
                        ),
                      )
                    }
                    placeholder="000000"
                    aria-label="Authenticator code for recovery codes"
                  />

                  <button
                    type="button"
                    className="security-secondary-button"
                    onClick={
                      handleRecoveryCodes
                    }
                    disabled={
                      recoveryPending
                    }
                  >
                    {recoveryPending
                      ? "Generating..."
                      : "Regenerate"}
                  </button>
                </div>
              </div>
            </>
          ) : setupData ? (
            /* ------------------------------------------------------------
               SETUP / QR STATE
            ------------------------------------------------------------ */

            <div className="security-setup">
              <div className="security-step">
                <span>
                  1
                </span>

                <div>
                  <strong>
                    Scan the QR code
                  </strong>

                  <p>
                    Open Google Authenticator, Microsoft
                    Authenticator, 1Password, or another
                    compatible authenticator app and scan
                    this code.
                  </p>
                </div>
              </div>

              <div className="security-qr-area">
                <QrCode
                  value={
                    setupData.qr_code_url
                  }
                />
              </div>

              <div className="security-manual">
                <div>
                  <span>
                    Can't scan the code?
                  </span>

                  <strong>
                    Enter this setup key manually
                  </strong>
                </div>

                <div className="security-secret-row">
                  <code>
                    {
                      setupData.secret
                    }
                  </code>

                  <button
                    type="button"
                    onClick={
                      handleCopySecret
                    }
                    title="Copy setup key"
                  >
                    <CopyIcon />

                    {copiedSecret
                      ? "Copied"
                      : "Copy"}
                  </button>
                </div>
              </div>

              <div className="security-step">
                <span>
                  2
                </span>

                <div>
                  <strong>
                    Verify your authenticator
                  </strong>

                  <p>
                    Enter the six-digit code currently
                    displayed by your authenticator app.
                  </p>
                </div>
              </div>

              <div className="security-confirm-box">
                <label htmlFor="security-setup-code">
                  Authentication code
                </label>

                <div className="security-code-input">
                  <KeyIcon />

                  <input
                    id="security-setup-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    value={
                      confirmationCode
                    }
                    onChange={(
                      event,
                    ) =>
                      setConfirmationCode(
                        event.target.value.replace(
                          /\D/g,
                          "",
                        ),
                      )
                    }
                    placeholder="000000"
                  />
                </div>

                <button
                  type="button"
                  className="security-primary-button"
                  onClick={
                    handleEnable
                  }
                  disabled={
                    enablePending
                  }
                >
                  {enablePending
                    ? "Verifying..."
                    : "Verify & enable 2FA"}
                </button>
              </div>

              <button
                type="button"
                className="security-cancel-button"
                onClick={() => {
                  setSetupData(null);
                  setConfirmationCode("");
                  setActionError("");
                }}
              >
                Cancel setup
              </button>
            </div>
          ) : (
            /* ------------------------------------------------------------
               DISABLED STATE
            ------------------------------------------------------------ */

            <div className="security-disabled-content">
              <div className="security-status-panel">
                <div className="security-disabled-icon">
                  <LockIcon />
                </div>

                <div>
                  <strong>
                    Two-factor authentication is
                    currently disabled.
                  </strong>

                  <span>
                    Enable it to protect your account with
                    a second verification step.
                  </span>
                </div>
              </div>

              <div className="security-benefits">
                <div>
                  <span>
                    01
                  </span>

                  <div>
                    <strong>
                      Prevent unauthorized access
                    </strong>

                    <p>
                      A password alone won't be enough
                      to access your account.
                    </p>
                  </div>
                </div>

                <div>
                  <span>
                    02
                  </span>

                  <div>
                    <strong>
                      Use your authenticator app
                    </strong>

                    <p>
                      Generate secure time-based
                      verification codes.
                    </p>
                  </div>
                </div>

                <div>
                  <span>
                    03
                  </span>

                  <div>
                    <strong>
                      Keep recovery codes safe
                    </strong>

                    <p>
                      Backup codes help you regain access
                      if you lose your authenticator.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="security-primary-button"
                onClick={() =>
                  setupMutation.mutate()
                }
                disabled={
                  setupPending
                }
              >
                {setupPending
                  ? "Preparing setup..."
                  : "Enable two-factor authentication"}
              </button>
            </div>
          )}
        </article>

        {/* ================================================================
            SECURITY OVERVIEW
        ================================================================ */}

        <aside className="security-side">
          <article className="security-side-card">
            <div className="security-side-icon">
              <ShieldIcon />
            </div>

            <span>
              ACCOUNT PROTECTION
            </span>

            <h3>
              Your security matters.
            </h3>

            <p>
              Two-factor authentication helps protect
              your financial information even if your
              password is compromised.
            </p>
          </article>

          <article className="security-side-card">
            <div className="security-side-icon secondary">
              <LockIcon />
            </div>

            <span>
              PASSWORD SECURITY
            </span>

            <h3>
              Use a strong password.
            </h3>

            <p>
              Avoid reusing your finance-manager
              password on other websites or services.
            </p>
          </article>
        </aside>
      </section>

      {/* ================================================================
          RECOVERY CODE MODAL
      ================================================================ */}

      {recoveryCodes.length > 0 && (
        <div
          className="security-modal-backdrop"
          role="presentation"
        >
          <div
            className="security-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="recovery-codes-title"
          >
            <div className="security-modal-icon">
              <KeyIcon />
            </div>

            <p className="security-modal-kicker">
              SAVE THESE CODES
            </p>

            <h2
              id="recovery-codes-title"
            >
              Recovery codes
            </h2>

            <p>
              Each code can be used once to access
              your account if you lose access to your
              authenticator app. Store them somewhere
              safe.
            </p>

            <div className="security-recovery-grid">
              {recoveryCodes.map(
                (
                  code,
                ) => (
                  <code
                    key={
                      code
                    }
                  >
                    {code}
                  </code>
                ),
              )}
            </div>

            <div className="security-modal-actions">
              <button
                type="button"
                className="security-secondary-button"
                onClick={
                  handleCopyRecoveryCodes
                }
              >
                <CopyIcon />

                {copiedRecovery
                  ? "Copied"
                  : "Copy codes"}
              </button>

              <button
                type="button"
                className="security-primary-button"
                onClick={() =>
                  setRecoveryCodes([])
                }
              >
                I've saved my codes
              </button>
            </div>

            <div className="security-modal-warning">
              <strong>
                Important:
              </strong>

              <span>
                These codes are shown only after they
                are generated. Save them before closing
                this window.
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}