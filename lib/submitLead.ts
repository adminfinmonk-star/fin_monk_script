import { LeadPayload } from "./disqualifyLogic";

const RATE_LIMIT_KEY = "finmonk_last_submit";

function isRateLimited(): boolean {
  try {
    const last = localStorage.getItem(RATE_LIMIT_KEY);
    if (!last) return false;
    return Date.now() - parseInt(last) < 30000;
  } catch {
    return false;
  }
}

function markSubmitted() {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
  } catch {}
}

export async function submitLead(payload: LeadPayload): Promise<boolean> {
  if (payload.status !== "complete" && isRateLimited()) return true; // silently succeed for partials only

  console.log("[Finmonk Lead Payload]", JSON.stringify(payload, null, 2));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    // Call our own Next.js API route — avoids CORS/redirect issues with Apps Script
    const res = await fetch("/api/submit-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    markSubmitted();
    return res.ok;
  } catch {
    clearTimeout(timeout);
    console.log("[Finmonk Lead Payload — fallback]", JSON.stringify(payload, null, 2));
    markSubmitted();
    return false;
  }
}
