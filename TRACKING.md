# Finmonk Analytics — PostHog + Microsoft Clarity

## Overview

This document outlines all analytics events tracked in the Finmonk LAC lead capture form. Analytics helps us understand:

- **Funnel conversion rates** — where do users drop off?
- **Lead quality** — which segments convert best?
- **UX issues** — which fields cause errors or hesitation?
- **User behavior** — how do people interact with the form?
- **Attribution** — which campaigns drive best quality leads?

---

## Environment Variables Required

```env
# .env.local

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_your_project_key

# Microsoft Clarity
NEXT_PUBLIC_CLARITY_ID=your_clarity_id
```

Get these from:

- **PostHog:** app.posthog.com → Project settings
- **Clarity:** clarity.microsoft.com → Project ID

---

## Event Taxonomy

### Page Level

| Event | When | Properties | Dashboard Use |
| --- | --- | --- | --- |
| `page_view` | Page loads | `url`, `referrer` | Traffic source, entry page |
| `device_info` | Page loads | `device_type`, `viewport_width`, `user_agent` | Mobile vs desktop split |
| `session_utm` | Page loads + UTM present | `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `fbclid` | Campaign performance, attribution |

### Funnel Events (Track in Order)

| Event | When | Properties | Funnel Stage |
| --- | --- | --- | --- |
| `form_started` | User enters Screen 1 | `source` (utm_source or "organic") | Stage 1: Awareness → Engagement |
| `form_screen_viewed` | User views any screen | `screen_number`, `screen_name` | Track which screens users reach |
| `form_field_interaction` | User selects/fills any field | `field_name`, `field_value`, `screen_number` | Micro-conversions, field engagement |
| `form_validation_error` | Field fails validation | `field_name`, `error_message` | UX friction points |
| `disqualification_message_shown` | Inline warning appears | `field_name`, `message_type` | User concern flags |
| `partial_lead_submitted` | After Screen 2 complete | `product`, `carBrand`, `carYear`, `score`, `segment` | Retargeting audience, drop-off recovery |
| `form_submit_success` | Form submitted successfully | All LeadPayload fields | Stage 4: Conversion |
| `form_submit_error` | Form submission fails | `error_message`, `error_type`, `product` | Error debugging, failure rate |
| `form_abandoned` | User leaves without submitting | `last_screen`, `last_field` | Drop-off analysis |

### Conversion Events

| Event | When | Properties |
| --- | --- | --- |
| `success_screen_viewed` | After successful submit | `lead_name`, `phone_masked`, `segment` |
| `whatsapp_cta_clicked` | User clicks WhatsApp CTA | `source` (success_screen, error_fallback), `scenario` |

### Engagement Events

| Event | When | Properties |
| --- | --- | --- |
| `cta_button_clicked` | User clicks primary CTA | `location` (hero, form, sticky_bar, how_it_works), `button_text` |
| `sticky_bar_engagement` | Mobile sticky bar interaction | `action` (shown, clicked, dismissed) |
| `trust_bar_interaction` | User interacts with trust item | `item` (lender_partners, rating, etc) |
| `scroll_depth` | User scrolls milestone | `percentage` (25, 50, 75, 100) |

### Product Segmentation

| Event              | When                     | Properties                |
| ------------------ | ------------------------ | ------------------------- |
| `product_selected` | User picks LAC/UCL/NCL   | `product` (LAC, UCL, NCL) |
| `lead_segmented`   | Non-LAC product selected | `product`, `reason`       |

### Field-Level Events

| Event | When | Properties |
| --- | --- | --- |
| `emi_preview_viewed` | EMI calculation displays | `loan_amount`, `monthly_emi` |
| `consent_checkbox_toggled` | User checks/unchecks consent | `consent_type` (call, whatsapp), `checked` |

---

## Funnel Flow Diagram

```
page_view
  ↓
session_utm (if params present)
  ↓
form_started
  ↓
form_screen_viewed (Screen 1)
  ├→ form_field_interaction (product selection)
  ├→ form_field_interaction (RC ownership)
  └→ form_field_interaction (car details)
  ↓
form_screen_viewed (Screen 2)
  ├→ form_field_interaction (car value)
  ├→ emi_preview_viewed
  ├→ form_field_interaction (loan amount)
  └→ form_field_interaction (city)
  ├→ partial_lead_submitted ← RETARGETING SIGNAL
  ↓
form_screen_viewed (Screen 3)
  ├→ form_field_interaction (employment)
  ├→ form_field_interaction (income)
  ├→ consent_checkbox_toggled
  └→ form_field_interaction (name, phone)
  ↓
form_submit_success / form_submit_error
  ↓
success_screen_viewed
  └→ whatsapp_cta_clicked (optional)
```

---

## Where to Add Tracking in Components

### LeadForm.tsx

```typescript
import {
  trackFormStarted,
  trackScreenView,
  trackFormSubmitSuccess,
  trackPartialLead,
} from "@/lib/posthog";

export default function LeadForm() {
  useEffect(() => {
    // User entered form
    trackFormStarted();
  }, []);

  // When transitioning between screens:
  const handleNextScreen = () => {
    if (currentScreen === 2) {
      // Track partial lead after Screen 2
      trackPartialLead({ ...formData });
    }
    trackScreenView(currentScreen + 1, getScreenName(currentScreen + 1));
    setCurrentScreen((prev) => prev + 1);
  };

  // On submit:
  const handleSubmit = async () => {
    try {
      await submitLead(payload);
      trackFormSubmitSuccess(payload);
    } catch (e) {
      trackFormSubmitError(e.message, payload);
    }
  };
}
```

### FormScreen1.tsx (Car Details)

```typescript
import { trackFieldInteraction, trackValidationError } from "@/lib/posthog";

export default function FormScreen1() {
  const handleProductSelect = (product: string) => {
    trackFieldInteraction("product_type", product, 1);
    setSelectedProduct(product);
  };

  const handleRCOwnershipSelect = (ownership: string) => {
    trackFieldInteraction("rc_ownership", ownership, 1);
    setRCOwnership(ownership);
  };

  const handleCarBrandSelect = (brand: string) => {
    trackFieldInteraction("car_brand", brand, 1);
    setCarBrand(brand);
  };

  const handleValidationError = (field: string, message: string) => {
    trackValidationError(field, message);
    setErrors((prev) => ({ ...prev, [field]: message }));
  };
}
```

### FormScreen2.tsx (Loan Details)

```typescript
import {
  trackFieldInteraction,
  trackEMIPreviewViewed,
  trackDisqualificationMessage,
} from "@/lib/posthog";

export default function FormScreen2() {
  const handleCarValueSelect = (value: string) => {
    trackFieldInteraction("car_value", value, 2);
    setCarValue(value);
  };

  const handleLoanAmountSelect = (amount: string) => {
    trackFieldInteraction("loan_amount", amount, 2);
    setLoanAmount(amount);

    // Calculate and track EMI
    const emi = calculateEMI(amount);
    trackEMIPreviewViewed(amount, emi);
  };

  const handleCitySelect = (city: string) => {
    trackFieldInteraction("city", city, 2);
    setCity(city);
  };

  // Track disqualification warnings
  useEffect(() => {
    if (loanAmount > carValue * 0.8) {
      trackDisqualificationMessage("loan_amount", "high_ltv");
    }
  }, [loanAmount, carValue]);
}
```

### FormScreen3.tsx (Contact + Consent)

```typescript
import {
  trackFieldInteraction,
  trackConsentInteraction,
  trackValidationError,
} from "@/lib/posthog";

export default function FormScreen3() {
  const handleNameChange = (name: string) => {
    if (name.length >= 3) {
      trackFieldInteraction("name", name, 3);
    }
  };

  const handlePhoneChange = (phone: string) => {
    if (phone.length === 10) {
      trackFieldInteraction("phone", phone, 3);
    }
  };

  const handleConsentToggle = (type: "call" | "whatsapp", checked: boolean) => {
    trackConsentInteraction(type, checked);
    setConsent((prev) => ({ ...prev, [type]: checked }));
  };
}
```

### SuccessScreen.tsx

```typescript
import {
  trackSuccessScreen,
  trackWhatsAppClick
} from '@/lib/posthog';

export default function SuccessScreen({ name, phone, segment }: Props) {
  useEffect(() => {
    trackSuccessScreen(name, phone, segment);
  }, []);

  const handleWhatsAppClick = () => {
    trackWhatsAppClick('success_screen', 'success');
    // Then open WhatsApp link
    window.open(whatsappUrl);
  };

  return (
    <div>
      {/* Success UI */}
      <button onClick={handleWhatsAppClick}>WhatsApp us instead →</button>
    </div>
  );
}
```

### Navbar.tsx

```typescript
import { trackCTAClick } from '@/lib/posthog';

export default function Navbar() {
  const handleApplyNowClick = () => {
    trackCTAClick('navbar', 'Apply Now →');
    // Smooth scroll to form
    scrollToForm();
  };

  return (
    <nav>
      <button onClick={handleApplyNowClick}>Apply Now →</button>
    </nav>
  );
}
```

### HowItWorks.tsx

```typescript
import { trackCTAClick } from '@/lib/posthog';

export default function HowItWorks() {
  const handleApplyClick = () => {
    trackCTAClick('how_it_works', 'Apply Now — It\'s Free →');
    scrollToForm();
  };

  return (
    <section>
      {/* How it works UI */}
      <button onClick={handleApplyClick}>Apply Now — It's Free →</button>
    </section>
  );
}
```

### Mobile sticky bar (if implemented in page.tsx)

```typescript
import { trackStickyBarEngagement, trackCTAClick } from "@/lib/posthog";

// When sticky bar appears:
trackStickyBarEngagement("shown");

// When user clicks CTA:
const handleStickyBarClick = () => {
  trackCTAClick("sticky_bar", "Get up to ₹10L against your car");
  trackStickyBarEngagement("clicked");
  scrollToForm();
};

// When user dismisses:
const handleStickyBarClose = () => {
  trackStickyBarEngagement("dismissed");
  setStickyBarVisible(false);
};
```

---

## Key Metrics to Monitor

### Conversion Funnel

1. **Landing → Form Started:** Conversion rate
2. **Form Started → Screen 2:** Abandonment at Screen 1
3. **Screen 2 → Screen 3:** Abandonment at Screen 2
4. **Screen 3 → Submission:** Validation error rate
5. **Submission → Success:** Error recovery rate

### Quality Metrics

- Average lead score by campaign
- HOT vs WARM vs COLD lead distribution
- Segment breakdown: Employment, Income, Car Age

### Engagement Metrics

- Average scroll depth
- EMI preview views (loan intent signal)
- Disqualification warning acknowledgments
- Consent checkbox check rate

### Error Analysis

- Top validation errors by field
- Highest drop-off fields
- Error-to-success recovery ratio

### Attribution

- Best performing utm_campaign
- Best performing utm_content (ad creative)
- Cost per lead by source
- Lead quality (segment) by source

---

## PostHog Dashboard Recommendations

### Create These Insights:

1. **Funnel:** form_started → form_submit_success
   - Add breakdown by `utm_campaign`
   - Add breakdown by `device_type`

2. **Retention:** Users who viewed page yesterday vs submitted today
   - Measure 24-hour lead completion

3. **Trends:** form_submit_success over time
   - Breakdown by `segment` (HOT, WARM, COLD)

4. **Cohort:** Users with `utm_source=facebook`
   - Measure their conversion rate vs others

### Create These Dashboards:

1. **Daily Lead Report**
   - Total leads (complete + partial)
   - HOT leads count
   - Average lead score
   - Top 5 campaigns by volume

2. **Funnel Health**
   - Drop-off by screen
   - Validation error rate by field
   - Error recovery rate

3. **Campaign Performance**
   - Leads by utm_campaign
   - Average segment by campaign
   - Cost per lead (integrate with ad spend)

---

## Microsoft Clarity Insights

Clarity provides additional insights beyond PostHog:

- **Session Recordings:** Watch real users fill the form (privacy-compliant)
- **Heatmaps:** See which fields get clicked, scrolled, rage-clicked
- **Dead clicks:** Identify non-interactive elements users click on
- **User feedback:** In-page surveys (optional)

Use Clarity to:

- Identify UX friction (fields users struggle with)
- Spot scroll blockers
- Validate that CTA buttons are noticed
- Check mobile responsiveness in real sessions

---

## Data Privacy & Compliance

- **No PII in events:** Never log full names, phone numbers, PAN, or email
- **Phone masking:** `phone_masked` shows last 4 digits only
- **Session IDs:** Anonymous session identifiers, not user identifiers
- **Retention:** PostHog default 90-day retention; adjust as needed
- **GDPR:** PostHog & Clarity both GDPR-compliant; review their DPAs

---

## Next Steps

1. Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_CLARITY_ID` to `.env.local`
2. Add tracking calls to all components (use examples above)
3. Set up PostHog dashboards (see recommendations)
4. Review first week of data
5. Identify top 3 drop-off points → prioritize fixes
6. A/B test field order or messaging to improve conversion

Based on the code in lib/posthog.ts, here are all the events currently being tracked:

Form Funnel Events

- form_started — user interacts with first field
- form_screen_viewed — user navigates to a screen (properties: screen_number, screen_name)
- form_field_interaction — user selects/fills a field (properties: field_name, field_value, screen_number)
- form_validation_error — field validation fails (properties: field_name, error_message)
- partial_lead_submitted — after step 1 (now captures name/phone)
- form_submit_success — final submission (properties: product, employment, income, car value, loan amount, city, score, segment, flags, UTM params, status)
- form_submit_error — submission failed (properties: error message, error type, product)
- form_abandoned — NEVER CALLED (defined but not wired up — the hook isn't set)
- success_screen_viewed — user sees success page (properties: lead name masked, phone masked, segment)

Product & Qualification Events

- product_selected — user picks LAC/UCL/NCL
- lead_segmented — non-LAC product routed (properties: product, segment)
- emi_preview_viewed — user views EMI calculation

User Info Events

- device_info — on page load (properties: device_type, user agent, viewport)
- session_utm — on page load (properties: utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid, landing URL)
- page_view — page visited (properties: URL, referrer)

Engagement Events

- consent_checkbox_toggled — user checks/unchecks consent
- sticky_bar_dismissed — mobile sticky bar closed
- trust_bar_interaction — partner logo marquee engaged
- cta_clicked — "Apply Now" button clicked
- whatsapp_cta_clicked — WhatsApp CTA clicked (properties: source, scenario)

Meta Pixel Events (lib/pixel.ts)

- PageView — page load
- ViewContent — form viewed
- InitiateCheckout — first form interaction
- Lead — form submission (with segment value and loan amount)

---

Problem: No Form Flow Data in PostHog

None of the form events are firing. PostHog shows zero form\_\* events despite 200+ page views. This means:

1. form_started never fires (first field interaction not being tracked)
2. form_screen_viewed never fires
3. Validation errors not logged
4. Partial lead not submitted

Why? The events fire on <LeadForm /> mount and field interactions, which require the form to actually be displayed and interacted with. Since mobile users weren't scrolling to the form before your layout flip, they never triggered any form events.

After your mobile layout changes go live, you should start seeing form events. Track these metrics once users start interacting:

- Step 1 completion rate (form_started → partial_lead_submitted after name/phone/consent)
- Step 2 completion rate (car details validation)
- Step 3 completion rate (loan details validation)
- form_submit_success count vs form views
- Top validation errors by field

Want me to update the analytics dashboard to show these form-specific funnels once data starts flowing?
