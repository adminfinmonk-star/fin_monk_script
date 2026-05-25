# Finmonk — Loan Against Car Lead Capture Form

## Claude Code Build Instructions

---

## Project Overview

Build a **high-conversion lead capture form** for **Finmonk**, a modern fintech lending platform. The product is **Loan Against Car (LAC)** — customers who already own a car can pledge it to get instant cash without selling it.

The goal of this page is one thing: **maximize qualified lead submissions**. Every design and UX decision must serve conversion. This is not a branding exercise — it is a performance marketing landing page.

The primary traffic source is **Meta (Facebook/Instagram) paid ads**. UTM parameters and Meta Pixel events must be implemented correctly from day one — the campaign cannot optimize without proper signals.

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + custom CSS variables
- **Animations:** Framer Motion
- **Form state:** React useState (no external form library needed)
- **Fonts:** Load via next/font from Google Fonts
- **Icons:** Lucide React
- **Deployment ready:** Vercel-compatible

---

## Brand Identity — Finmonk

**Company name:** Finmonk **Tagline:** _Your Car. Instant Cash._ **Sub-tagline:** _Keep driving. Get funded._

### Color Palette

Use these exact CSS variables throughout:

```css
:root {
  --primary: #1a1f36; /* Deep navy — trust, stability */
  --accent: #f97316; /* Vivid orange — energy, CTA */
  --accent-light: #fff7ed; /* Orange tint — soft highlights */
  --surface: #ffffff; /* Card backgrounds */
  --surface-2: #f8fafc; /* Page background */
  --text-primary: #0f172a; /* Headings */
  --text-secondary: #64748b; /* Body, labels */
  --text-muted: #94a3b8; /* Hints, placeholders */
  --success: #10b981; /* Green — trust signals */
  --border: #e2e8f0; /* Subtle borders */
  --border-focus: #f97316; /* Orange on focus */
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.08);
  --shadow-cta: 0 8px 32px rgba(249, 115, 22, 0.35);
}
```

### Typography

```
Display / Hero heading: "Clash Display" or "Plus Jakarta Sans" (bold weight)
Body / Labels: "DM Sans"
Numbers / Stats: "Space Mono" (monospace feel for financial credibility)
```

Load from Google Fonts via next/font.

### Logo

Render the Finmonk logo as text-based in the nav:

- "Fin" in `var(--primary)` bold
- "monk" in `var(--accent)` bold
- Small orange circle icon (●) before the text as a favicon/brand mark

---

## Page Structure

The page has **three sections**:

```
1. HERO SECTION          ← Left side trust + right side form (desktop)
                         ← Stacked on mobile (hero first, form below)

2. TRUST BAR             ← Social proof strip below hero

3. HOW IT WORKS          ← 3-step process (optional, below fold)
```

On mobile, the form should appear **immediately below the headline** — do not hide it or make the user scroll far to find it.

---

## Section 1 — Hero (Left Panel)

### Headline (H1)

```
Turn Your Car Into
Instant Cash
```

- "Instant Cash" should be in `var(--accent)` orange
- Font size: 56px desktop, 36px mobile
- Font weight: 800
- Line height: 1.1

### Sub-headline

```
Keep driving. Get up to ₹10 Lakhs against your car.
Approval in 24 hours — without selling your vehicle.
```

Font: DM Sans, 18px, `var(--text-secondary)`

### Trust Bullets (3 items, with checkmark icons in green)

```
✓  RC in your name? You're eligible today
✓  Salaried, self-employed, business owners — all welcome
✓  Car stays with you throughout the loan tenure
```

### Stats Row (3 numbers side by side)

```
₹10L          24 hrs         Best
Max Loan    Disbursal     Starting Rate
```

- Numbers in Space Mono, large, `var(--primary)`
- Labels in DM Sans, small, `var(--text-muted)`

### Background treatment (hero left panel)

- Deep navy `var(--primary)` background on desktop (left half)
- Subtle noise texture overlay (use CSS `background-image` with SVG noise or a very faint repeating dot pattern at 2% opacity)
- A faint outline illustration of a car (SVG, stroke-only, white at 6% opacity) positioned bottom-right of the left panel, decorative only

---

## Section 1 — Form (Right Panel)

### Form card styling

- White background, `var(--shadow-card)` shadow
- Border radius: 20px
- Padding: 40px desktop, 24px mobile
- On desktop: positioned as a sticky card on the right half of the hero
- On mobile: full width card below the hero text

### Form header

```
Check Your Eligibility
Free · No credit score impact · 2 minutes
```

- Header: Plus Jakarta Sans, 22px, bold, `var(--text-primary)`
- Sub: DM Sans, 13px, `var(--text-muted)`
- Add a thin orange top border (4px) on the card as a visual accent

### Progress indicator

Show a simple step indicator at the top of the form:

```
Step 1 of 3  ●●●○○○○○  [orange filled dots = completed]
```

The form has 3 "screens" that slide in — don't show all fields at once. Split into logical groups:

**Screen 1 — Your Car (Fields 1–3)**
**Screen 2 — Loan Details (Fields 4–5)**
**Screen 3 — Your Profile (Fields 6–7–8 + submit)**

> **Note on Screen 1 — Product field:** If the page is loaded with `?product=lac` in the URL (set by the Meta ad UTM or deep link), auto-select "Loan Against My Car" and skip directly to Field 2. This removes one step for the majority of Meta traffic, which is already LAC-targeted.

Animate between screens with a smooth horizontal slide (Framer Motion `AnimatePresence`).

---

## The 8 Form Fields — Exact Spec

Implement these in order, split across 3 screens as above.

### Field 1 — Product Confirmation

**Screen:** 1
**Label:** What are you looking for?
**Type:** Visual card select (NOT a dropdown — show cards with icons)

```
Card A: 🔑  Loan Against My Car
            (I already own a car)        ← Pre-select this one

Card B: 🚗  Used Car Loan
            (I want to buy a car)

Card C: ✨  New Car Loan
```

Cards should be full-width, horizontally scrollable on mobile. Selected state: orange border + light orange background + orange checkmark badge. Unselected: white with grey border.

If user selects Card B or C, show a message:

> "You're looking for a car purchase loan — we'll route you correctly." Then the CTA changes to "Continue →" which submits them to a different bucket. Only Card A (LAC) continues into the full form.

---

### Field 2 — Car Ownership Confirmation

**Screen:** 1
**Label:** Is the car registered in your name?
**Type:** 3 option card select (same card style as Field 1, but smaller)

```
○  Yes, RC is in my name        ← proceed
○  It's in a family member's name
○  Loan is still running on this car
```

If "family member's name" is selected: → Show inline message: _"Most lenders require RC in your name. Our team will help you explore options."_ → Allow them to continue but flag internally.

If "loan still running": → Show: _"We have NBFC partners who offer top-up loans. You still may be eligible."_ → Allow continue, flag as "active loan" segment.

---

### Field 3 — Car Details

**Screen:** 1
**Layout:** Two dropdowns side by side

**Dropdown A — Car Brand**
Label: Car brand
Options:

```
Maruti Suzuki, Hyundai, Tata, Honda, Toyota,
Mahindra, Kia, MG, Renault, Volkswagen,
Ford, Skoda, Nissan, Other
```

**Dropdown B — Year of Manufacture**
Label: Year
Options (grouped):

```
2022 or newer
2019 – 2021
2016 – 2018
2013 – 2015
2010 – 2012
Before 2010  ← show warning icon on this option
```

If "Before 2010" is selected: → Show inline warning: _"Cars older than 2012 may have limited lender options. We'll still try."_ → Allow continue but flag.

Dropdown styling:

- Custom styled select, not browser default
- Orange focus ring
- Show selected value in `var(--text-primary)`, placeholder in `var(--text-muted)`

---

### Field 4 — Car Market Value

**Screen:** 2
**Label:** Approximate current market value of your car
**Type:** Visual slider OR segmented button group (prefer segmented buttons for mobile)

```
[ Below ₹1.5L ] [ ₹1.5L–3L ] [ ₹3L–6L ] [ ₹6L–10L ] [ Above ₹10L ]
```

If "Below ₹1.5L" is selected: → Show: _"Loan amount may be limited. Our team will advise the best option for you."_

Show a helper note below:

> 💡 _Not sure? Check on CarDekho or OLX for a quick valuation._

---

### Field 5 — Loan Amount Needed

**Screen:** 2
**Label:** How much loan are you looking for?
**Type:** Segmented buttons (same style as Field 4)

```
[ Up to ₹1L ] [ ₹1L–3L ] [ ₹3L–5L ] [ ₹5L–10L ] [ Above ₹10L ]
```

**Smart cross-check logic (client-side):** If loan amount selected > 80% of car value selected → show:

> ⚠️ _"Loan amount exceeds typical LTV limits. Our advisor will find the best possible amount for you."_ Do NOT block them — just surface the message.

Below both fields, show a **dynamic EMI preview**:

```
Estimated EMI: ₹X,XXX/month*
Based on ₹[selected amount] over 36 months at 16% p.a.
*Subject to final approval
```

Update this in real time as they select. Use a simple formula: `EMI = P × r × (1+r)^n / ((1+r)^n - 1)` where r = 16/1200, n = 36.

This EMI preview is a **major conversion booster** — it makes the loan feel real and tangible.

---

### Field 5B — City

**Screen:** 2 (below loan amount, same screen)
**Label:** Your city
**Type:** Searchable dropdown

Top cities to list first:

```
Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai,
Pune, Ahmedabad, Kolkata, Jaipur, Lucknow,
Chandigarh, Surat, Indore, Nagpur, Other
```

This field is **required** — lenders have geographic coverage limits and the sales team needs this for lead routing. Add `city` to `LeadPayload`.

---

### Field 6 — Employment Type

**Screen:** 3
**Label:** Your current occupation
**Type:** Icon card select (2x2 grid)

```
💼  Salaried            🏪  Business Owner
    (Private / Govt)

🧑‍💻  Self-employed /    ⏸️  Not currently
    Freelancer              working
```

If "Not currently working": → Show: _"Income verification may be required. Our team will explore options."_ → Flag but allow continue.

---

### Field 7 — Monthly Income

**Screen:** 3
**Label:** Monthly income or business revenue
**Type:** Segmented buttons

```
[ Below ₹15K ] [ ₹15K–30K ] [ ₹30K–60K ] [ Above ₹60K ]
```

If "Below ₹15K": → Show: _"You may still qualify with some of our NBFC partners."_ → Flag as low-income segment.

---

### Field 8 — Contact Details

**Screen:** 3
**Layout:** Two fields

**Name field:**

- Label: Full name
- Placeholder: "Your full name"
- Validation: min 3 chars, letters only

**Phone field:**

- Label: Mobile number
- Placeholder: "10-digit mobile number"
- Prefix: "+91" shown as fixed left element inside the input
- Validation: exactly 10 digits, Indian mobile (start with 6/7/8/9)

**Consent checkboxes (below the contact fields):**

These are **legally required** under DPDP Act 2023 and TRAI regulations. Both must be **unchecked by default** and must be checked before the form can be submitted.

```
☐  I agree to be contacted by Finmonk and its lending partners
   via phone and SMS regarding my loan application.
   (Required to process your application)

☐  I also agree to be contacted on WhatsApp.
   (Optional — for faster updates)
```

- Font: 12px, `var(--text-muted)`
- The first checkbox is required — CTA stays disabled until checked
- The second (WhatsApp) is optional
- Store both as `consent_call: boolean` and `consent_whatsapp: boolean` in `LeadPayload`

Below the checkboxes, show:

```
🔒 Your information is 100% secure and never shared without consent.
   By submitting, you agree to our Terms & Privacy Policy.
```

Font: 11px, `var(--text-muted)`

**Honeypot field (anti-spam):**

Add a hidden input that humans never see or fill. If it has a value on submit, silently drop the lead (do not show an error — bots should not know they were caught):

```html
<input
  name="website"
  type="text"
  style="display:none; position:absolute; left:-9999px;"
  tabIndex={-1}
  autoComplete="off"
/>
```

Check this in the submit handler before sending to the backend.

---

## Submit Button (CTA)

This is the most important element on the page.

```
[ Check My Eligibility → ]
```

Styling:

- Full width
- Background: `var(--accent)` orange
- Text: white, DM Sans, 17px, font-weight 600
- Border radius: 12px
- Padding: 16px
- Box shadow: `var(--shadow-cta)` (orange glow)
- Hover: scale(1.02) + shadow intensifies (Framer Motion whileHover)
- Active: scale(0.98)
- Loading state: replace text with spinner + "Checking eligibility..."
- Disabled state (consent not checked): muted orange, `cursor: not-allowed`

**Below the CTA button:**

```
✓ No credit score impact    ✓ Free service    ✓ Response in 2 hours
```

Three inline trust pills, 12px, `var(--text-muted)`, with green checkmarks.

---

## Success State (After Submit)

Replace the form card with a success screen — do NOT redirect.

```
[Large green checkmark animation — draw-on SVG stroke animation]

You're on your way! 🎉

Hi [Name], your eligibility check is confirmed.

Our loan advisor will call you at +91 [XXXXXXXXXX]
within the next 2 hours.

━━━━━━━━━━━━━━━━━━━━━━━
📋  Keep these ready for the call:
    • RC copy of your car
    • Aadhaar + PAN card
    • Last 6 months bank statement
━━━━━━━━━━━━━━━━━━━━━━━

[WhatsApp us instead →]   ← opens wa.me/91XXXXXXXXXX with pre-filled message
```

The WhatsApp CTA should be a green button with WhatsApp icon.

**Pre-fill the WhatsApp message** to increase click-to-conversation rate:

```
https://wa.me/91XXXXXXXXXX?text=Hi+Finmonk%2C+I+just+applied+for+a+Loan+Against+My+Car.+My+name+is+[Name].
```

Replace `91XXXXXXXXXX` with the real number via env variable `NEXT_PUBLIC_WHATSAPP_NUMBER`. Never hardcode.

**Submit error fallback:** If the Apps Script endpoint fails or times out (>5 seconds), do NOT show an error. Show:

```
We're having a connectivity issue — but your information is saved.
WhatsApp us to confirm your application instantly.
[WhatsApp to Confirm →]
```

This recovers leads who would otherwise bounce on a network error.

---

## Section 2 — Trust Bar

Below the hero section, a full-width strip:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 🏦 10+ Lender Partners    ⚡ 24hr Disbursal    🔒 RBI Compliant
 ⭐ 4.8/5 Customer Rating   📋 Minimal Docs     🚗 Car Stays With You
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- Background: `var(--primary)` dark navy
- Text: white
- Icons: orange
- On mobile: horizontal scroll marquee (auto-scrolling, no pause)
- On desktop: 3 items per row, 2 rows OR 6 in a single row

---

## Section 3 — How It Works (Below Fold)

3-step horizontal flow:

```
  [1]                    [2]                    [3]
Fill the Form  →   Quick Verification  →   Cash in Account
2 minutes           Our team calls           Within 24–48 hrs
                    you in 2 hours           Car stays with you
```

- Step numbers: large, Space Mono font, orange
- Arrow connectors between steps (hide on mobile, show on desktop)
- Each step in a card with subtle border and white background

Add a secondary CTA at the bottom of this section:

```
[ Apply Now — It's Free → ]
```

Scrolls back up to the form (smooth scroll to form anchor).

---

## Navigation

Minimal sticky nav:

```
[● Finmonk]                              [Apply Now →]
```

- Left: Logo (text-based as described above)
- Right: Orange CTA button that smooth-scrolls to form
- Background: white with subtle bottom border
- Becomes solid white with shadow on scroll (use IntersectionObserver)
- On mobile: same layout, smaller text

---

## Mobile Optimizations (Critical)

- Form card must appear **within first scroll** on mobile — no need to scroll past hero
- All card selects must be tappable with min 48px touch targets
- Phone number input should trigger numeric keyboard (`inputMode="numeric"`)
- Sticky bottom bar on mobile (appears after 3 seconds):
  ```
  [🚗 Get up to ₹10L against your car — Apply Free →]
  ```
  Orange background, white text, fixed at bottom, dismiss on X button. This is a proven mobile conversion booster.

---

## Animations

Use Framer Motion for:

1. **Page load:** Hero text fades up with staggered delay (heading → subheading → bullets → stats)
2. **Form card:** Slides up from bottom on load with spring easing
3. **Form screen transitions:** Horizontal slide with fade (AnimatePresence, mode="wait")
4. **Card select hover:** Subtle lift (y: -2) + shadow increase
5. **Selected card:** Scale pulse (0.98 → 1.02 → 1.0) on selection
6. **CTA button:** Spring scale on hover, press feedback on click
7. **Success screen:** SVG checkmark draw-on animation, then content fades in
8. **Trust bar (mobile):** Auto-scrolling marquee via CSS animation

Do NOT add animations that delay form interaction. Keep load animations under 600ms total.

---

## Inline Validation Rules

Implement client-side validation with inline error messages (no alert popups):

| Field | Validation | Error message |
| --- | --- | --- |
| Name | Min 3 chars, letters + spaces only | "Please enter your full name" |
| Phone | 10 digits, starts with 6/7/8/9 | "Enter a valid 10-digit mobile number" |
| All select fields | Must have a selection | "Please select an option to continue" |
| City | Required | "Please select your city" |
| Consent | First checkbox required | "Please agree to be contacted to continue" |

Error state styling:

- Red border on the field: `border-color: #ef4444`
- Small red error text below: 12px, `#ef4444`
- Shake animation on the field (CSS keyframe, 300ms)

---

## Meta Pixel Integration

Meta Pixel must be initialized in `layout.tsx` using the `NEXT_PUBLIC_META_PIXEL_ID` env variable.

Fire these events at each stage:

| Event | When to fire | Parameters |
| --- | --- | --- |
| `PageView` | On page load (automatic via Pixel base code) | — |
| `ViewContent` | On page load, after Pixel init | `{ content_name: 'LAC Form', content_category: 'Loan Against Car' }` |
| `InitiateCheckout` | When user interacts with Screen 1 for the first time | `{ content_name: 'LAC Form' }` |
| `Lead` | On successful form submit | `{ content_name: 'LAC', value: estimatedLoanMidpoint, currency: 'INR', status: segment }` |

`InitiateCheckout` on first interaction gives Meta mid-funnel signal to optimize for high-intent users, not just page visitors. This is critical for campaign efficiency.

Use `window.fbq(...)` calls wrapped in a utility (`lib/pixel.ts`) that no-ops if Pixel is not loaded (prevents errors in dev).

---

## UTM & Attribution Capture

On page load, read the following parameters from the URL and store them in a `sessionStorage` key `finmonk_utm`. Include them in every `LeadPayload` submission.

```typescript
type UTMData = {
  utm_source: string;    // e.g. "facebook"
  utm_medium: string;    // e.g. "cpc"
  utm_campaign: string;  // e.g. "LAC_May26_Mumbai"
  utm_content: string;   // Meta ad creative ID
  utm_term: string;
  fbclid: string;        // Facebook click ID — critical for Meta CAPI attribution
  landing_url: string;   // Full page URL including all params
};
```

If a param is absent, store as empty string. Read from `sessionStorage` on submit so UTM data persists across Screen transitions.

---

## Performance Requirements

- Lighthouse score target: 90+ on mobile
- No layout shift (CLS < 0.1)
- Fonts preloaded via next/font
- Images: use next/image with proper sizing
- Form state: local useState only, no external dependencies for form
- Keep JS bundle lean — Framer Motion is fine, avoid heavy charting libraries

---

## File Structure

```
/app
  /page.tsx              ← Main landing page
  /layout.tsx            ← Root layout with fonts + Meta Pixel init
  /globals.css           ← CSS variables + base styles

/components
  /Hero.tsx              ← Left panel (headline, trust bullets, stats)
  /LeadForm.tsx          ← Right panel form with step logic
  /FormScreen1.tsx       ← Car details fields
  /FormScreen2.tsx       ← Loan details + city fields
  /FormScreen3.tsx       ← Profile + contact + consent fields
  /SuccessScreen.tsx     ← Post-submit success state
  /TrustBar.tsx          ← Social proof strip
  /HowItWorks.tsx        ← 3-step section
  /Navbar.tsx            ← Sticky navigation

/lib
  /formUtils.ts          ← Validation functions, EMI calculator
  /disqualifyLogic.ts    ← Field-level disqualification rules + lead scoring
  /pixel.ts              ← Meta Pixel event helpers (fbq wrapper)
  /utm.ts                ← UTM capture + sessionStorage helpers
  /submitLead.ts         ← Apps Script fetch with timeout + error handling
```

---

## Data Handling

On form submit, send the full payload to the Apps Script endpoint **and** `console.log` it as JSON.

```typescript
type LeadPayload = {
  // Form data
  product: "LAC" | "UCL" | "NCL";
  rcOwnership: "self" | "family" | "active_loan";
  carBrand: string;
  carYear: string;
  carValue: string;
  loanAmount: string;
  city: string;
  employment: "salaried" | "business" | "selfemployed" | "unemployed";
  income: string;
  name: string;
  phone: string;

  // Consent
  consent_call: boolean;
  consent_whatsapp: boolean;

  // Attribution
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  fbclid: string;
  landing_url: string;

  // Computed
  timestamp: string;       // ISO 8601 UTC — Apps Script converts to IST
  flags: string[];         // ['low_income', 'old_car', 'active_loan', etc.]
  score: number;           // Auto-calculated 0–100
  segment: "HOT" | "WARM" | "COLD" | "JUNK";
  status: "complete" | "partial";  // partial = submitted before Screen 3
};
```

---

## Lead Scoring — `disqualifyLogic.ts`

**Auto-calculate `score` and `segment`** based on these rules:

```typescript
// Score rules (max 100):

// Car year
// 2022 or newer   → +30
// 2019 – 2021     → +20
// 2016 – 2018     → +10
// before 2016     → +0

// Income
// Above ₹60K      → +25
// ₹30K – ₹60K     → +20
// ₹15K – ₹30K     → +10
// Below ₹15K      → +0

// Employment
// Business owner  → +25
// Salaried        → +20
// Self-employed   → +15
// Unemployed      → +0

// Car value
// Above ₹10L      → +15
// ₹6L – ₹10L      → +12
// ₹3L – ₹6L       → +8
// Below ₹3L       → +0

// RC ownership
// Self            → +5
// Family          → +3
// Active loan     → +0

// City (metro premium)
// Metro city      → +5  (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Pune)
// Other           → +0

// Segment mapping:
// 75–100 → HOT
// 50–74  → WARM
// 25–49  → COLD
// 0–24   → JUNK
```

**Metro cities list for city scoring:** `['Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune']`

Add a `flags` array that collects strings like `'old_car'`, `'low_income'`, `'family_rc'`, `'active_loan'`, `'loan_exceeds_ltv'`, `'non_metro'` based on selections. These flags will be used by the sales team to prepare for the call.

---

## Partial Lead Submission

After Screen 2 completes (before the user reaches Screen 3), fire a **partial lead** to the Apps Script endpoint with the data collected so far. Set `status: "partial"` and `phone: ""`.

This gives you:
- Retargeting data for Meta custom audiences (users who showed loan intent but didn't convert)
- A recoverable lead if the user drops off on Screen 3

The Apps Script should append partial leads to a separate tab ("Partial Leads") in the Sheet, not the main leads tab.

---

## Submission Rate Limiting (Anti-Spam)

In the submit handler, check `localStorage` for the key `finmonk_last_submit`. If the stored timestamp is less than 30 seconds ago, silently prevent the submit (show loading state briefly, then show success — do not tell the user they were rate-limited).

After a successful submit, store `Date.now()` in `finmonk_last_submit`.

---

## Apps Script Backend Specification

The backend is a **Google Apps Script Web App** deployed as a public POST endpoint.

### Environment variable

```
NEXT_PUBLIC_WEBHOOK_URL=https://script.google.com/macros/s/<DEPLOYMENT_ID>/exec
```

Never hardcode the Apps Script URL in source code.

### Frontend: `lib/submitLead.ts`

```typescript
export async function submitLead(payload: LeadPayload): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const res = await fetch(process.env.NEXT_PUBLIC_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    clearTimeout(timeout);
    return false; // caller shows WhatsApp fallback
  }
}
```

On `false` return → show WhatsApp fallback in `SuccessScreen`, not an error.

### Apps Script (`Code.gs`) — Required Behaviour

```javascript
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);

    // Route to correct tab
    const tabName = data.status === "partial" ? "Partial Leads" : "Leads";
    const sheet = ss.getSheetByName(tabName);

    // Convert timestamp to IST
    const ist = Utilities.formatDate(
      new Date(data.timestamp),
      "Asia/Kolkata",
      "dd/MM/yyyy HH:mm:ss"
    );

    // Append row — column order must match Sheet headers exactly
    sheet.appendRow([
      ist, data.name, data.phone, data.city,
      data.product, data.rcOwnership, data.carBrand, data.carYear,
      data.carValue, data.loanAmount, data.employment, data.income,
      data.score, data.segment, data.flags.join(", "),
      data.consent_call, data.consent_whatsapp,
      data.utm_source, data.utm_medium, data.utm_campaign,
      data.utm_content, data.fbclid, data.landing_url, data.status
    ]);

    // Email alert — only for HOT leads and complete submissions
    if (data.segment === "HOT" && data.status === "complete") {
      MailApp.sendEmail({
        to: ALERT_EMAIL,
        subject: `🔥 HOT Lead — ${data.name} (${data.city})`,
        body: `Score: ${data.score}\nPhone: +91${data.phone}\nCar: ${data.carBrand} ${data.carYear}\nLoan: ${data.loanAmount}\nFlags: ${data.flags.join(", ")}`
      });
    }

    // Duplicate detection — warn but don't block
    // (implement as a separate check against existing phone column)

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}
```

**Sheet tabs required:**
- `Leads` — complete submissions (all 24 columns as above)
- `Partial Leads` — Screen 1+2 completions with `status: "partial"`

**CORS:** Apps Script Web Apps handle OPTIONS preflight automatically when deployed as "Execute as: Me, Who has access: Anyone". No additional CORS headers needed.

---

## Regulatory Compliance (Mandatory)

Add these disclosures to the page footer:

```
Finmonk is a Loan Service Provider (LSP) and acts as a facilitator
between borrowers and RBI-regulated lenders. We do not lend directly.
Loan approval is subject to lender's credit assessment and eligibility criteria.
Interest rates and loan amounts shown are indicative and may vary.

*EMI calculations are approximate. Final terms are set by the lending partner.
```

Font: 11px, `var(--text-muted)`, footer background `var(--surface-2)`.

---

## DO NOT

- Do not use generic purple/gradient backgrounds — use the navy + orange palette specified
- Do not use Inter or Roboto — use the fonts specified
- Do not show all fields on one screen — use the 3-screen step flow
- Do not add social login or OTP at this stage — keep friction low
- Do not redirect on success — replace form card with success state in-place
- Do not add cookie banners or pop-ups beyond the mobile sticky bar
- Do not use any placeholder lorem ipsum text anywhere
- Do not make the CTA button grey or outline — it must be solid orange at all times
- Do not hardcode the Apps Script URL or WhatsApp number — use env variables
- Do not show raw error messages to leads — always recover to WhatsApp fallback

---

## Summary Checklist Before Marking Complete

- [ ] 3-screen step form with smooth transitions
- [ ] All 8 fields implemented with exact options (including City as Field 5B)
- [ ] Auto-skip product screen if `?product=lac` in URL
- [ ] Field-level disqualification messages (inline, not blocking)
- [ ] EMI preview updating in real-time on Screen 2
- [ ] Lead score + segment calculated on submit (recalibrated scoring)
- [ ] Partial lead submitted after Screen 2 (status: "partial")
- [ ] Honeypot anti-spam field implemented
- [ ] Submission rate limiting (30s cooldown in localStorage)
- [ ] DPDP-compliant consent checkboxes (unchecked by default, call consent required)
- [ ] Success screen with WhatsApp CTA (pre-filled message, env variable number)
- [ ] Submit error fallback → WhatsApp CTA (no raw errors shown)
- [ ] Mobile sticky bar
- [ ] Trust bar with marquee on mobile
- [ ] Navbar with smooth scroll CTA
- [ ] All animations implemented (load, transitions, CTA hover)
- [ ] Validation with shake animation on error
- [ ] Meta Pixel: PageView + ViewContent + InitiateCheckout + Lead events
- [ ] UTM + fbclid captured from URL and included in LeadPayload
- [ ] `lib/pixel.ts` — fbq wrapper that no-ops in dev
- [ ] `lib/utm.ts` — UTM capture to sessionStorage
- [ ] `lib/submitLead.ts` — fetch with 5s timeout + error handling
- [ ] Apps Script spec followed (LockService, IST timestamp, HOT-only email alert, dual tabs)
- [ ] Console.log of full LeadPayload on submit
- [ ] Finmonk branding (navy + orange, specified fonts)
- [ ] Regulatory footer copy included
- [ ] Lighthouse 90+ on mobile

---

_Built for Finmonk — fintech lending platform. Optimized for Meta traffic conversion._

---

## Backend Architecture Summary

```
Meta Ad Click
  → Landing Page (Vercel)
      → UTM + fbclid captured to sessionStorage on load
      → Meta Pixel: PageView + ViewContent fired
      → User starts form → InitiateCheckout fired
      → Screen 2 complete → Partial lead POST to Apps Script
      → Screen 3 submit → Full lead POST to Apps Script
                        → Meta Pixel: Lead event fired
                        → SuccessScreen shown in-place

Apps Script (Code.gs)
  ├── LockService (prevents concurrent write corruption)
  ├── Google Sheet "Leads" tab (complete submissions)
  ├── Google Sheet "Partial Leads" tab (Screen 1+2 drop-offs)
  └── Email alert to team (HOT leads only — avoids alert fatigue)
```

### Environment Variables (`.env.local`)

```
NEXT_PUBLIC_WEBHOOK_URL=https://script.google.com/macros/s/<ID>/exec
NEXT_PUBLIC_META_PIXEL_ID=<your_pixel_id>
NEXT_PUBLIC_WHATSAPP_NUMBER=919XXXXXXXXX
```
