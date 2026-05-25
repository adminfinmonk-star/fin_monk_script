interface FunnelData {
  days: number;
  funnel: { screen1: number; screen2: number; screen3: number; submitted: number };
  conversionRates: { s1ToS2: string; s2ToS3: string; s3ToSubmit: string; overall: string };
  validationErrors: { field: string; count: number }[];
  abandoned: number;
  devices: { type: string; count: number }[];
  utmSources: { source: string; count: number }[];
  error?: string;
}

async function runHogQL(query: string): Promise<{ results: unknown[][] }> {
  const res = await fetch(
    `https://us.posthog.com/api/projects/${process.env.POSTHOG_PROJECT_ID}/query`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.POSTHOG_PERSONAL_API_KEY}`,
      },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error(`PostHog ${res.status}`);
  return res.json();
}

function safeCount(results: unknown[][], target: unknown): number {
  for (const row of results) {
    if (row[0] === target) return Number(row[1]) || 0;
  }
  return 0;
}

function pct(num: number, den: number): string {
  if (den === 0) return "—";
  return ((num / den) * 100).toFixed(1) + "%";
}

async function fetchAllQueries(days: number): Promise<FunnelData> {
  try {
    const [screenData, submitData, errorData, abandonData, deviceData, utmData] =
      await Promise.all([
        runHogQL(`SELECT properties.screen_number, count() as cnt FROM events WHERE event = 'form_screen_viewed' AND timestamp >= now() - INTERVAL ${days} DAY GROUP BY properties.screen_number ORDER BY properties.screen_number`),
        runHogQL(`SELECT count() as cnt FROM events WHERE event = 'form_submit_success' AND timestamp >= now() - INTERVAL ${days} DAY`),
        runHogQL(`SELECT properties.field_name, count() as cnt FROM events WHERE event = 'form_validation_error' AND timestamp >= now() - INTERVAL ${days} DAY GROUP BY properties.field_name ORDER BY cnt DESC LIMIT 10`),
        runHogQL(`SELECT count() as cnt FROM events WHERE event = 'form_abandoned' AND timestamp >= now() - INTERVAL ${days} DAY`),
        runHogQL(`SELECT properties.device_type, count() as cnt FROM events WHERE event = 'device_info' AND timestamp >= now() - INTERVAL ${days} DAY GROUP BY properties.device_type ORDER BY cnt DESC`),
        runHogQL(`SELECT properties.utm_source, count() as cnt FROM events WHERE event = 'session_utm' AND timestamp >= now() - INTERVAL ${days} DAY GROUP BY properties.utm_source ORDER BY cnt DESC LIMIT 10`),
      ]);

    const screen1 = safeCount(screenData.results, 1);
    const screen2 = safeCount(screenData.results, 2);
    const screen3 = safeCount(screenData.results, 3);
    const submitted = Number(submitData.results?.[0]?.[0]) || 0;
    const abandoned = Number(abandonData.results?.[0]?.[0]) || 0;

    return {
      days,
      funnel: { screen1, screen2, screen3, submitted },
      conversionRates: {
        s1ToS2: pct(screen2, screen1),
        s2ToS3: pct(screen3, screen2),
        s3ToSubmit: pct(submitted, screen3),
        overall: pct(submitted, screen1),
      },
      validationErrors: errorData.results.map((r) => ({
        field: String(r[0] ?? "unknown"),
        count: Number(r[1]) || 0,
      })),
      abandoned,
      devices: deviceData.results.map((r) => ({
        type: String(r[0] ?? "unknown"),
        count: Number(r[1]) || 0,
      })),
      utmSources: utmData.results.map((r) => ({
        source: String(r[0] ?? "(none)"),
        count: Number(r[1]) || 0,
      })),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      days,
      funnel: { screen1: 0, screen2: 0, screen3: 0, submitted: 0 },
      conversionRates: { s1ToS2: "—", s2ToS3: "—", s3ToSubmit: "—", overall: "—" },
      validationErrors: [],
      abandoned: 0,
      devices: [],
      utmSources: [],
      error: message,
    };
  }
}

interface PageProps {
  searchParams: { key?: string; days?: string };
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const { key, days: daysParam } = searchParams;

  if (!process.env.ANALYTICS_SECRET || key !== process.env.ANALYTICS_SECRET) {
    return (
      <div style={{ fontFamily: "sans-serif", padding: 40, color: "#ef4444" }}>
        Access denied. Add <code>?key=YOUR_SECRET</code> to the URL.
      </div>
    );
  }

  if (!process.env.POSTHOG_PERSONAL_API_KEY || !process.env.POSTHOG_PROJECT_ID) {
    return (
      <div style={{ fontFamily: "sans-serif", padding: 40, color: "#ef4444" }}>
        PostHog not configured. Set <code>POSTHOG_PERSONAL_API_KEY</code> and <code>POSTHOG_PROJECT_ID</code> in <code>.env.local</code>.
      </div>
    );
  }

  const rawDays = parseInt(daysParam || "7", 10);
  const days = isNaN(rawDays) ? 7 : Math.min(30, Math.max(7, rawDays));

  const data = await fetchAllQueries(days);
  const { funnel, conversionRates, validationErrors, abandoned, devices, utmSources } = data;

  const maxScreenCount = funnel.screen1 || 1;

  const funnelRows = [
    { label: "Screen 1 — Car Details", count: funnel.screen1, dropFromS1: null },
    { label: "Screen 2 — Loan & City", count: funnel.screen2, dropFromS1: funnel.screen1 > 0 ? (((funnel.screen1 - funnel.screen2) / funnel.screen1) * 100).toFixed(1) : null },
    { label: "Screen 3 — Personal Info", count: funnel.screen3, dropFromS1: funnel.screen1 > 0 ? (((funnel.screen1 - funnel.screen3) / funnel.screen1) * 100).toFixed(1) : null },
    { label: "Submitted", count: funnel.submitted, dropFromS1: funnel.screen1 > 0 ? (((funnel.screen1 - funnel.submitted) / funnel.screen1) * 100).toFixed(1) : null },
  ];

  const convCards = [
    { label: "Screen 1 → 2", value: conversionRates.s1ToS2 },
    { label: "Screen 2 → 3", value: conversionRates.s2ToS3 },
    { label: "Screen 3 → Submit", value: conversionRates.s3ToSubmit },
    { label: "Overall (S1 → Submit)", value: conversionRates.overall },
  ];

  const totalDevices = devices.reduce((s, d) => s + d.count, 0) || 1;

  return (
    <div style={{ fontFamily: "var(--font-dm, sans-serif)", maxWidth: 900, margin: "0 auto", padding: "32px 20px", color: "var(--text-primary, #0f172a)" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-jakarta, sans-serif)", fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>
          Funnel Analytics
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted, #94a3b8)", margin: 0 }}>
          Finmonk LAC · Meta Campaign · PostHog data
        </p>
      </div>

      {/* Error banner */}
      {data.error && (
        <div style={{ background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#92400e" }}>
          <strong>Could not load PostHog data:</strong> {data.error}
        </div>
      )}

      {/* Date range nav */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        {[7, 14, 30].map((d) => (
          <a
            key={d}
            href={`/analytics?key=${key}&days=${d}`}
            style={{
              padding: "6px 16px",
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              background: days === d ? "var(--accent, #f97316)" : "var(--border, #e2e8f0)",
              color: days === d ? "#fff" : "var(--text-secondary, #64748b)",
            }}
          >
            Last {d}d
          </a>
        ))}
      </div>

      {/* Funnel bars */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: "var(--font-jakarta, sans-serif)", fontSize: 16, fontWeight: 600, margin: "0 0 16px" }}>
          Form Funnel
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {funnelRows.map((row) => {
            const widthPct = maxScreenCount > 0 ? (row.count / maxScreenCount) * 100 : 0;
            return (
              <div key={row.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                  <span style={{ fontWeight: 500 }}>{row.label}</span>
                  <span style={{ color: "var(--text-muted, #94a3b8)" }}>
                    {row.count.toLocaleString()}
                    {row.dropFromS1 !== null && (
                      <span style={{ color: "#ef4444", marginLeft: 12 }}>▼ {row.dropFromS1}% from start</span>
                    )}
                  </span>
                </div>
                <div style={{ height: 20, borderRadius: 4, background: "var(--border, #e2e8f0)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${widthPct}%`, background: "var(--accent, #f97316)", borderRadius: 4, transition: "width 0.4s" }} />
                </div>
              </div>
            );
          })}
        </div>
        {abandoned > 0 && (
          <p style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)", marginTop: 12 }}>
            Form abandoned events: {abandoned} (note: this event may not be wired up yet)
          </p>
        )}
      </section>

      {/* Conversion rate cards */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: "var(--font-jakarta, sans-serif)", fontSize: 16, fontWeight: 600, margin: "0 0 16px" }}>
          Conversion Rates
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {convCards.map((card) => (
            <div key={card.label} style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e2e8f0)", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontFamily: "var(--font-jakarta, sans-serif)", fontSize: 32, fontWeight: 700, color: "var(--accent, #f97316)" }}>
                {card.value}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted, #94a3b8)", marginTop: 4 }}>{card.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "var(--font-jakarta, sans-serif)", fontSize: 16, fontWeight: 600, margin: "0 0 16px" }}>
            Top Validation Errors
          </h2>
          <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e2e8f0)", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--surface-2, #f8fafc)" }}>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: "var(--text-secondary, #64748b)" }}>Field</th>
                  <th style={{ textAlign: "right", padding: "10px 16px", fontWeight: 600, color: "var(--text-secondary, #64748b)" }}>Error Count</th>
                </tr>
              </thead>
              <tbody>
                {validationErrors.map((row, i) => (
                  <tr key={row.field} style={{ background: i === 0 ? "#fff7ed" : "transparent", borderTop: "1px solid var(--border, #e2e8f0)" }}>
                    <td style={{ padding: "10px 16px", fontWeight: i === 0 ? 600 : 400 }}>
                      <code style={{ background: "var(--border, #e2e8f0)", padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>{row.field}</code>
                    </td>
                    <td style={{ padding: "10px 16px", textAlign: "right", color: i === 0 ? "#ef4444" : "var(--text-primary, #0f172a)", fontWeight: i === 0 ? 600 : 400 }}>
                      {row.count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Device breakdown */}
      {devices.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "var(--font-jakarta, sans-serif)", fontSize: 16, fontWeight: 600, margin: "0 0 16px" }}>
            Device Breakdown
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {devices.map((d) => (
              <div key={d.type}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 500, textTransform: "capitalize" }}>{d.type}</span>
                  <span style={{ color: "var(--text-muted, #94a3b8)" }}>
                    {d.count.toLocaleString()} ({((d.count / totalDevices) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div style={{ height: 10, borderRadius: 4, background: "var(--border, #e2e8f0)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(d.count / totalDevices) * 100}%`, background: "#7C5CFC", borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* UTM sources */}
      {utmSources.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: "var(--font-jakarta, sans-serif)", fontSize: 16, fontWeight: 600, margin: "0 0 16px" }}>
            Traffic Sources (UTM)
          </h2>
          <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #e2e8f0)", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--surface-2, #f8fafc)" }}>
                  <th style={{ textAlign: "left", padding: "10px 16px", fontWeight: 600, color: "var(--text-secondary, #64748b)" }}>Source</th>
                  <th style={{ textAlign: "right", padding: "10px 16px", fontWeight: 600, color: "var(--text-secondary, #64748b)" }}>Sessions</th>
                </tr>
              </thead>
              <tbody>
                {utmSources.map((row) => (
                  <tr key={row.source} style={{ borderTop: "1px solid var(--border, #e2e8f0)" }}>
                    <td style={{ padding: "10px 16px" }}>{row.source}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right" }}>{row.count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p style={{ fontSize: 11, color: "var(--text-muted, #94a3b8)", borderTop: "1px solid var(--border, #e2e8f0)", paddingTop: 16 }}>
        Data from PostHog · Last {days} days · <a href={`/analytics?key=${key}&days=${days}`} style={{ color: "var(--accent, #f97316)" }}>Refresh</a>
      </p>
    </div>
  );
}
