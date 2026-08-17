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
  ).format(new Date(value));
}

function getToday() {
  const date = new Date();

  return date
    .toISOString()
    .split("T")[0];
}

function getMonthStart() {
  const date = new Date();

  date.setDate(1);

  return date
    .toISOString()
    .split("T")[0];
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

function insightClass(
  type: string,
) {
  return `insight-card ${type}`;
}

export default function FinancialInsights() {
  const [from, setFrom] =
    useState(
      getMonthStart(),
    );

  const [to, setTo] =
    useState(getToday());

  const {
    data,
    isLoading,
    isError,
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
  });

  const insights =
    data?.insights ?? [];

  const generatedAt =
    data?.generated_at;

  const dangerCount =
    insights.filter(
      (item) =>
        item.type === "danger",
    ).length;

  const warningCount =
    insights.filter(
      (item) =>
        item.type === "warning",
    ).length;

  const successCount =
    insights.filter(
      (item) =>
        item.type === "success",
    ).length;

  const overallStatus =
    useMemo(() => {
      if (dangerCount > 0) {
        return {
          label: "Needs attention",
          className: "danger",
        };
      }

      if (warningCount > 0) {
        return {
          label: "Worth reviewing",
          className: "warning",
        };
      }

      return {
        label: "Looking healthy",
        className: "success",
      };
    }, [
      dangerCount,
      warningCount,
    ]);

  return (
    <main className="insights-page">
      <header className="insights-header">
        <div>
          <p className="insights-eyebrow">
            INTELLIGENT FINANCE
          </p>

          <h1>
            Financial Insights
          </h1>

          <p className="insights-subtitle">
            Understand what your money is telling
            you and act before small issues become
            big ones.
          </p>
        </div>
      </header>

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
      </section>

      {isLoading ? (
        <div className="insights-loading">
          <div className="insights-spinner" />

          <p>
            Analysing your finances...
          </p>
        </div>
      ) : isError ? (
        <div className="insights-error">
          <h2>
            Unable to generate insights
          </h2>

          <p>
            Please check your connection and
            try again.
          </p>

          <button
            onClick={() => refetch()}
          >
            Try again
          </button>
        </div>
      ) : (
        <>
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
                {formatDate(from)} and{" "}
                {formatDate(to)}.
              </p>
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
            </div>

            <div
              className={`health-status ${overallStatus.className}`}
            >
              {overallStatus.label}
            </div>
          </section>

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
                ) => (
                  <article
                    className={insightClass(
                      insight.type,
                    )}
                    key={`${insight.title}-${index}`}
                  >
                    <div className="insight-top">
                      <div
                        className="insight-icon"
                      >
                        {insightIcon(
                          insight.type,
                        )}
                      </div>

                      <span className="insight-type">
                        {insight.type}
                      </span>
                    </div>

                    <h3>
                      {insight.title}
                    </h3>

                    <p>
                      {insight.message}
                    </p>

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
                              width: `${Math.min(
                                100,
                                insight.percentage,
                              )}%`,
                            }}
                          />
                        </div>

                        <div className="goal-insight-money">
                          <span>
                            Saved{" "}
                            {new Intl.NumberFormat(
                              "en-NG",
                              {
                                style:
                                  "currency",
                                currency:
                                  "NGN",
                                maximumFractionDigits:
                                  2,
                              },
                            ).format(
                              Number(
                                insight.current_amount ??
                                  0,
                              ),
                            )}
                          </span>

                          <span>
                            Target{" "}
                            {new Intl.NumberFormat(
                              "en-NG",
                              {
                                style:
                                  "currency",
                                currency:
                                  "NGN",
                                maximumFractionDigits:
                                  2,
                              },
                            ).format(
                              Number(
                                insight.target_amount ??
                                  0,
                              ),
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    {typeof insight.remaining ===
                      "number" && (
                      <div className="insight-remaining">
                        Remaining:{" "}
                        <strong>
                          {new Intl.NumberFormat(
                            "en-NG",
                            {
                              style:
                                "currency",
                              currency:
                                "NGN",
                              maximumFractionDigits:
                                2,
                            },
                          ).format(
                            insight.remaining,
                          )}
                        </strong>
                      </div>
                    )}
                  </article>
                ),
              )
            )}
          </section>

          <section className="insights-footer-card">
            <div>
              <span>
                INSIGHT ENGINE
              </span>

              <h2>
                Generated from your real financial
                activity.
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