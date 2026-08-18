import {
  useQuery,
} from "@tanstack/react-query";

import {
  useMemo,
  useState,
} from "react";

import {
  getFinancialInsights,
} from "../api/insights";

import type {
  FinancialInsight,
} from "../types/insights";

import "./FinancialInsights.css";

function formatMoney(
  value: number | string,
  currency = "NGN",
) {
  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    },
  ).format(
    Number(value) || 0,
  );
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(value),
  );
}

function getToday() {
  const date = new Date();

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthStart() {
  const date = new Date();

  date.setDate(1);

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function insightIcon(
  type: string,
) {
  switch (type) {
    case "success":
      return "✓";

    case "warning":
      return "!";

    case "danger":
      return "×";

    default:
      return "i";
  }
}

function insightLabel(
  type: string,
) {
  switch (type) {
    case "success":
      return "Healthy";

    case "warning":
      return "Needs attention";

    case "danger":
      return "Critical";

    default:
      return "Information";
  }
}

function insightClass(
  type: string,
) {
  return `insights-card ${type}`;
}

function getHealthDescription(
  status: string,
) {
  switch (status) {
    case "danger":
      return "One or more areas need immediate attention.";

    case "warning":
      return "Your finances are generally okay, but there are areas worth reviewing.";

    default:
      return "Your recent financial activity is showing healthy patterns.";
  }
}

export default function FinancialInsights() {
  const [from, setFrom] =
    useState(
      getMonthStart(),
    );

  const [to, setTo] =
    useState(
      getToday(),
    );

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      "financial-insights",
      from,
      to,
    ],

    queryFn: () =>
      getFinancialInsights({
        from,
        to,
      }),

    enabled:
      Boolean(from) &&
      Boolean(to) &&
      from <= to,

    staleTime: 60_000,
  });

  const insights =
    data?.insights ?? [];

  const generatedAt =
    data?.generated_at;

  const dangerCount =
    insights.filter(
      (item) =>
        item.type ===
        "danger",
    ).length;

  const warningCount =
    insights.filter(
      (item) =>
        item.type ===
        "warning",
    ).length;

  const successCount =
    insights.filter(
      (item) =>
        item.type ===
        "success",
    ).length;

  const infoCount =
    insights.filter(
      (item) =>
        item.type ===
        "info",
    ).length;

  const overallStatus =
    useMemo(() => {
      if (dangerCount > 0) {
        return {
          label:
            "Needs attention",
          className:
            "danger",
        };
      }

      if (warningCount > 0) {
        return {
          label:
            "Worth reviewing",
          className:
            "warning",
        };
      }

      return {
        label:
          "Looking healthy",
        className:
          "success",
      };
    }, [
      dangerCount,
      warningCount,
    ]);

  const healthDescription =
    getHealthDescription(
      overallStatus.className,
    );

  return (
    <main className="insights-page">
      {/* ================================================================
          HEADER
      ================================================================= */}

      <header className="insights-header">
        <div>
          <p className="insights-eyebrow">
            INTELLIGENT FINANCE
          </p>

          <h1>
            Financial Insights
          </h1>

          <p className="insights-subtitle">
            Understand what your money is telling you
            and act before small issues become big ones.
          </p>
        </div>

        <div className="insights-header-status">
          <span>
            {isFetching
              ? "Updating..."
              : "Analysis ready"}
          </span>
        </div>
      </header>

      {/* ================================================================
          CONTROLS
      ================================================================= */}

      <section className="insights-controls">
        <div className="insight-date-field">
          <label htmlFor="insights-from">
            From
          </label>

          <input
            id="insights-from"
            type="date"
            value={from}
            onChange={(event) =>
              setFrom(
                event.target.value,
              )
            }
          />
        </div>

        <div className="insight-date-field">
          <label htmlFor="insights-to">
            To
          </label>

          <input
            id="insights-to"
            type="date"
            value={to}
            onChange={(event) =>
              setTo(
                event.target.value,
              )
            }
          />
        </div>

        <button
          className="insights-refresh"
          onClick={() =>
            refetch()
          }
          disabled={
            isFetching ||
            from > to
          }
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M20 11a8 8 0 0 0-14.5-4.7L4 8" />
            <path d="M4 4v4h4" />
            <path d="M4 13a8 8 0 0 0 14.5 4.7L20 16" />
            <path d="M20 20v-4h-4" />
          </svg>

          Refresh insights
        </button>
      </section>

      {from > to && (
        <div className="insights-date-error">
          The "From" date cannot be later than the "To"
          date.
        </div>
      )}

      {/* ================================================================
          LOADING
      ================================================================= */}

      {isLoading ? (
        <div className="insights-loading">
          <div className="insights-spinner" />

          <p>
            Analysing your finances...
          </p>
        </div>
      ) : isError ? (
        <div className="insights-error">
          <div className="insights-error-icon">
            !
          </div>

          <h2>
            Unable to generate insights
          </h2>

          <p>
            Please check your connection and try again.
          </p>

          <button
            onClick={() =>
              refetch()
            }
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {/* ============================================================
              HEALTH SUMMARY
          ============================================================ */}

          <section className="insights-health">
            <div className="insights-health-main">
              <span>
                CURRENT FINANCIAL PICTURE
              </span>

              <h2>
                {overallStatus.label}
              </h2>

              <p>
                Based on activity between{" "}
                {formatDate(from)}{" "}
                and{" "}
                {formatDate(to)}.
              </p>

              <small>
                {healthDescription}
              </small>
            </div>

            <div className="insights-health-counts">
              <div>
                <strong>
                  {insights.length}
                </strong>

                <span>
                  Insights
                </span>
              </div>

              <div>
                <strong className="success-text">
                  {successCount}
                </strong>

                <span>
                  Healthy
                </span>
              </div>

              <div>
                <strong className="warning-text">
                  {warningCount}
                </strong>

                <span>
                  Warnings
                </span>
              </div>

              <div>
                <strong className="danger-text">
                  {dangerCount}
                </strong>

                <span>
                  Critical
                </span>
              </div>

              <div>
                <strong className="info-text">
                  {infoCount}
                </strong>

                <span>
                  Info
                </span>
              </div>
            </div>

            <div
              className={`health-status ${overallStatus.className}`}
            >
              {overallStatus.label}
            </div>
          </section>

          {/* ============================================================
              INSIGHT CARDS
          ============================================================ */}

          <section className="insights-grid">
            {insights.length ===
            0 ? (
              <div className="insights-empty">
                <div className="insights-empty-icon">
                  ✦
                </div>

                <h3>
                  Nothing to report yet
                </h3>

                <p>
                  Continue recording your income,
                  expenses, savings and goals to
                  generate useful financial insights.
                </p>
              </div>
            ) : (
              insights.map(
                (
                  insight: FinancialInsight,
                  index,
                ) => {
                  const progress =
                    typeof insight.percentage ===
                    "number"
                      ? Math.max(
                          0,
                          Math.min(
                            100,
                            insight.percentage,
                          ),
                        )
                      : 0;

                  /*
                  |--------------------------------------------------------------------------
                  | Currency
                  |--------------------------------------------------------------------------
                  |
                  | Some insight payloads may not contain a currency yet.
                  | NGN remains the safe fallback.
                  |
                  */

                  const insightCurrency =
                    (
                      insight as FinancialInsight & {
                        currency?: string;
                      }
                    ).currency ??
                    "NGN";

                  return (
                    <article
                      className={insightClass(
                        insight.type,
                      )}
                      key={`${insight.title}-${index}`}
                    >
                      <div className="insight-top">
                        <div className="insight-icon">
                          {insightIcon(
                            insight.type,
                          )}
                        </div>

                        <span className="insight-type">
                          {insightLabel(
                            insight.type,
                          )}
                        </span>
                      </div>

                      <h3>
                        {insight.title}
                      </h3>

                      <p>
                        {insight.message}
                      </p>

                      {/* SAVINGS RATE */}

                      {typeof insight.rate ===
                        "number" && (
                        <div className="insight-metric">
                          <strong>
                            {insight.rate.toFixed(
                              1,
                            )}
                            %
                          </strong>

                          <span>
                            savings rate
                          </span>
                        </div>
                      )}

                      {/* GOAL PROGRESS */}

                      {typeof insight.percentage ===
                        "number" && (
                        <div className="goal-insight-progress">
                          <div className="goal-insight-values">
                            <span>
                              Progress
                            </span>

                            <strong>
                              {insight.percentage.toFixed(
                                1,
                              )}
                              %
                            </strong>
                          </div>

                          <div className="goal-insight-track">
                            <div
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </div>

                          <div className="goal-insight-money">
                            <span>
                              Saved{" "}
                              {formatMoney(
                                Number(
                                  insight.current_amount ??
                                    0,
                                ),
                                insightCurrency,
                              )}
                            </span>

                            <span>
                              Target{" "}
                              {formatMoney(
                                Number(
                                  insight.target_amount ??
                                    0,
                                ),
                                insightCurrency,
                              )}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* REMAINING */}

                      {typeof insight.remaining ===
                        "number" && (
                        <div className="insight-remaining">
                          Remaining:{" "}
                          <strong>
                            {formatMoney(
                              insight.remaining,
                              insightCurrency,
                            )}
                          </strong>
                        </div>
                      )}
                    </article>
                  );
                },
              )
            )}
          </section>

          {/* ============================================================
              FOOTER
          ============================================================ */}

          <section className="insights-footer-card">
            <div>
              <span>
                INSIGHT ENGINE
              </span>

              <h2>
                Generated from your real financial activity.
              </h2>

              <p>
                These observations are calculated from
                the transactions, savings activity and
                goals recorded in your account.
              </p>
            </div>

            {generatedAt && (
              <small>
                Updated{" "}
                {formatDate(
                  generatedAt,
                )}
              </small>
            )}
          </section>
        </>
      )}
    </main>
  );
}