import { NextRequest, NextResponse } from "next/server";

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
    }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PostHog API ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

function safeCount(results: unknown[][], targetValue: unknown): number {
  for (const row of results) {
    if (row[0] === targetValue) return Number(row[1]) || 0;
  }
  return 0;
}

function pct(num: number, den: number): string {
  if (den === 0) return "—";
  return ((num / den) * 100).toFixed(1) + "%";
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const key = searchParams.get("key");
  if (!process.env.ANALYTICS_SECRET || key !== process.env.ANALYTICS_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.POSTHOG_PERSONAL_API_KEY || !process.env.POSTHOG_PROJECT_ID) {
    return NextResponse.json(
      { error: "PostHog not configured. Set POSTHOG_PERSONAL_API_KEY and POSTHOG_PROJECT_ID in .env.local." },
      { status: 500 }
    );
  }

  const rawDays = parseInt(searchParams.get("days") || "7", 10);
  const days = isNaN(rawDays) ? 7 : Math.min(30, Math.max(7, rawDays));

  const screenQuery = `
    SELECT properties.screen_number, count() as cnt
    FROM events
    WHERE event = 'form_screen_viewed'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY properties.screen_number
    ORDER BY properties.screen_number ASC
  `;

  const submitQuery = `
    SELECT count() as cnt
    FROM events
    WHERE event = 'form_submit_success'
      AND timestamp >= now() - INTERVAL ${days} DAY
  `;

  const errorQuery = `
    SELECT properties.field_name, count() as cnt
    FROM events
    WHERE event = 'form_validation_error'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY properties.field_name
    ORDER BY cnt DESC
    LIMIT 10
  `;

  const abandonQuery = `
    SELECT count() as cnt
    FROM events
    WHERE event = 'form_abandoned'
      AND timestamp >= now() - INTERVAL ${days} DAY
  `;

  const deviceQuery = `
    SELECT properties.device_type, count() as cnt
    FROM events
    WHERE event = 'device_info'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY properties.device_type
    ORDER BY cnt DESC
  `;

  const utmQuery = `
    SELECT properties.utm_source, count() as cnt
    FROM events
    WHERE event = 'session_utm'
      AND timestamp >= now() - INTERVAL ${days} DAY
    GROUP BY properties.utm_source
    ORDER BY cnt DESC
    LIMIT 10
  `;

  try {
    const [screenData, submitData, errorData, abandonData, deviceData, utmData] =
      await Promise.all([
        runHogQL(screenQuery),
        runHogQL(submitQuery),
        runHogQL(errorQuery),
        runHogQL(abandonQuery),
        runHogQL(deviceQuery),
        runHogQL(utmQuery),
      ]);

    const screen1 = safeCount(screenData.results, 1);
    const screen2 = safeCount(screenData.results, 2);
    const screen3 = safeCount(screenData.results, 3);
    const submitted = Number(submitData.results?.[0]?.[0]) || 0;
    const abandoned = Number(abandonData.results?.[0]?.[0]) || 0;

    const validationErrors = errorData.results.map((row) => ({
      field: String(row[0] ?? "unknown"),
      count: Number(row[1]) || 0,
    }));

    const devices = deviceData.results.map((row) => ({
      type: String(row[0] ?? "unknown"),
      count: Number(row[1]) || 0,
    }));

    const utmSources = utmData.results.map((row) => ({
      source: String(row[0] ?? "(none)"),
      count: Number(row[1]) || 0,
    }));

    const response = NextResponse.json({
      days,
      funnel: { screen1, screen2, screen3, submitted },
      conversionRates: {
        s1ToS2: pct(screen2, screen1),
        s2ToS3: pct(screen3, screen2),
        s3ToSubmit: pct(submitted, screen3),
        overall: pct(submitted, screen1),
      },
      validationErrors,
      abandoned,
      devices,
      utmSources,
    });

    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
