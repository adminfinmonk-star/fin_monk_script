import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const payload = await req.json();

  const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ status: "error", message: "Webhook URL not configured" }, { status: 500 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
      redirect: "follow", // follow Apps Script 302 redirect server-side
    });

    clearTimeout(timeout);

    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      // Apps Script returned non-JSON (HTML error page) — still treat as success if 200
      return NextResponse.json({ status: res.ok ? "ok" : "error", raw: text.slice(0, 200) });
    }
  } catch {
    clearTimeout(timeout);
    return NextResponse.json({ status: "error", message: "Upstream request failed" }, { status: 502 });
  }
}
