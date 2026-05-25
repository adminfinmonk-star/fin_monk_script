/**
 * PostHog Analytics Integration
 * Tracks user behavior through the Finmonk LAC form funnel
 */

import { LeadPayload } from "./disqualifyLogic";

export interface PostHogEvent {
  event: string;
  properties?: Record<string, any>;
}

/**
 * Initialize PostHog using official stub pattern.
 * The stub queues all calls made before the script loads, then replays them.
 */
export function initPostHog() {
  if (typeof window === "undefined") return;

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!posthogKey) {
    console.log("[PostHog] No key configured — events will log to console only");
    return;
  }

  // Official PostHog stub — queues calls before script loads
  // prettier-ignore
  // eslint-disable-next-line
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=(s.asset_host||"https://us-assets.i.posthog.com")+"/static/array.js";(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;void 0!==a?u=e[a]=[]:a="posthog";u.people=u.people||[];u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e};u.people.toString=function(){return u.toString(1)+" (stub)"};o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify alias setPersonProperties groupIdentify".split(" ");for(n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,(window as any).posthog||[]);

  (window as any).posthog.init(posthogKey, {
    api_host: "https://us.i.posthog.com",
    asset_host: "https://us-assets.i.posthog.com",
    person_profiles: "identified_only",
    loaded: function (posthog: any) {
      posthog.identify(getOrCreateSessionId());
    },
  });
}

/**
 * Get or create a persistent session ID
 */
function getOrCreateSessionId(): string {
  try {
    const existing = sessionStorage.getItem("finmonk_session_id");
    if (existing) return existing;

    const newId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem("finmonk_session_id", newId);
    return newId;
  } catch {
    return `session_${Date.now()}`;
  }
}

/**
 * Track a custom event
 */
export function track(event: string, properties?: Record<string, any>) {
  if (typeof window === "undefined") return;

  const posthog = (window as any).posthog;
  if (!posthog) {
    console.log(`[PostHog Event] ${event}`, properties);
    return;
  }

  posthog.capture(event, {
    timestamp: new Date().toISOString(),
    ...properties,
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FUNNEL TRACKING EVENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Page viewed
 */
export function trackPageView() {
  track("page_view", {
    url: typeof window !== "undefined" ? window.location.href : "",
    referrer: typeof document !== "undefined" ? document.referrer : "",
  });
}

/**
 * Form started (user entered Screen 1)
 */
export function trackFormStarted(source?: string) {
  track("form_started", {
    source: source || "organic",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Form screen viewed
 */
export function trackScreenView(screenNumber: number, screenName: string) {
  track("form_screen_viewed", {
    screen_number: screenNumber,
    screen_name: screenName,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Field interaction (user selects/fills a field)
 */
export function trackFieldInteraction(
  fieldName: string,
  fieldValue: any,
  screenNumber: number
) {
  track("form_field_interaction", {
    field_name: fieldName,
    field_value: fieldValue,
    screen_number: screenNumber,
  });
}

/**
 * Field validation error
 */
export function trackValidationError(fieldName: string, errorMessage: string) {
  track("form_validation_error", {
    field_name: fieldName,
    error_message: errorMessage,
  });
}

/**
 * Form submission (success)
 */
export function trackFormSubmitSuccess(payload: LeadPayload) {
  track("form_submit_success", {
    product: payload.product,
    employment: payload.employment,
    income_range: payload.income,
    car_value: payload.carValue,
    loan_amount: payload.loanAmount,
    city: payload.city,
    score: payload.score,
    segment: payload.segment,
    flags: payload.flags.join(","),
    utm_source: payload.utm_source,
    utm_campaign: payload.utm_campaign,
    status: payload.status,
  });
}

/**
 * Form submission error
 */
export function trackFormSubmitError(error: string, payload?: Partial<LeadPayload>) {
  track("form_submit_error", {
    error_message: error,
    error_type: error.includes("rate") ? "rate_limit" : "network",
    product: payload?.product || "unknown",
  });
}

/**
 * Partial lead submitted (after Screen 2)
 */
export function trackPartialLead(partialData: Partial<LeadPayload>) {
  track("partial_lead_submitted", {
    product: partialData.product,
    carBrand: partialData.carBrand,
    carYear: partialData.carYear,
    carValue: partialData.carValue,
    loanAmount: partialData.loanAmount,
    income: partialData.income,
    score: partialData.score,
    segment: partialData.segment,
  });
}

/**
 * Success screen viewed
 */
export function trackSuccessScreen(name: string, phone: string, segment: string) {
  track("success_screen_viewed", {
    lead_name: name,
    phone_masked: phone ? `***${phone.slice(-4)}` : "unknown",
    segment: segment,
  });
}

/**
 * WhatsApp CTA clicked
 */
export function trackWhatsAppClick(source: string, scenario: string) {
  track("whatsapp_cta_clicked", {
    source: source, // "success_screen" | "error_fallback" | "sticky_bar"
    scenario: scenario, // "success" | "error" | "mobile_sticky"
  });
}

/**
 * CTA button clicked
 */
export function trackCTAClick(buttonLocation: string, buttonText: string) {
  track("cta_button_clicked", {
    location: buttonLocation, // "hero" | "form" | "sticky_bar" | "how_it_works"
    button_text: buttonText,
  });
}

/**
 * Disqualification message shown (inline, non-blocking)
 */
export function trackDisqualificationMessage(
  fieldName: string,
  messageType: string
) {
  track("disqualification_message_shown", {
    field_name: fieldName,
    message_type: messageType, // "old_car" | "low_income" | "high_ltv" | etc
  });
}

/**
 * Mobile sticky bar engaged
 */
export function trackStickyBarEngagement(action: string) {
  track("sticky_bar_engagement", {
    action: action, // "shown" | "clicked" | "dismissed"
  });
}

/**
 * Trust bar interaction
 */
export function trackTrustBarInteraction(trustItem: string) {
  track("trust_bar_interaction", {
    item: trustItem, // "lender_partners" | "rating" | "etc"
  });
}

/**
 * Scroll depth milestone
 */
export function trackScrollDepth(percentage: number) {
  track("scroll_depth", {
    percentage: percentage, // 25, 50, 75, 100
  });
}

/**
 * Product selection
 * User selected LAC, UCL, or NCL at Screen 1
 */
export function trackProductSelected(product: string) {
  track("product_selected", {
    product: product, // "LAC" | "UCL" | "NCL"
  });
}

/**
 * If user selected non-LAC product, track as segment
 */
export function trackLeadSegmented(product: string) {
  track("lead_segmented", {
    product: product,
    reason: "non_lac_product_selected",
  });
}

/**
 * Form abandoned (user left without submitting)
 */
export function trackFormAbandonment(
  lastScreenReached: number,
  lastFieldFilled?: string
) {
  track("form_abandoned", {
    last_screen: lastScreenReached,
    last_field: lastFieldFilled,
  });
}

/**
 * Consent checkbox interaction
 */
export function trackConsentInteraction(consentType: string, checked: boolean) {
  track("consent_checkbox_toggled", {
    consent_type: consentType, // "call" | "whatsapp"
    checked: checked,
  });
}

/**
 * EMI preview viewed (auto-calculated)
 */
export function trackEMIPreviewViewed(loanAmount: string, monthlyEMI: number) {
  track("emi_preview_viewed", {
    loan_amount: loanAmount,
    monthly_emi: monthlyEMI,
  });
}

/**
 * Device/Platform info
 */
export function trackDeviceInfo() {
  if (typeof window === "undefined") return;

  track("device_info", {
    device_type: /mobile|android|iphone/i.test(navigator.userAgent)
      ? "mobile"
      : "desktop",
    viewport_width: window.innerWidth,
    user_agent: navigator.userAgent,
  });
}

/**
 * Session started with UTM parameters
 */
export function trackSessionWithUTM(utm: Record<string, string>) {
  track("session_utm", {
    utm_source: utm.utm_source || "",
    utm_medium: utm.utm_medium || "",
    utm_campaign: utm.utm_campaign || "",
    utm_content: utm.utm_content || "",
    fbclid: utm.fbclid || "",
  });
}
