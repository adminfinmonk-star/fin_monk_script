# Google Apps Script Deployment Guide — Finmonk LAC Lead Capture

This guide walks you through deploying the Google Apps Script backend that receives form submissions and logs them to a Google Sheet.

---

## Step 1: Create a Google Sheet for Lead Storage

1. **Go to Google Drive** → [drive.google.com](https://drive.google.com)
2. **Create a new spreadsheet** → Right-click → New → Google Sheets
3. **Name it:** `Finmonk LAC Leads`
4. **Create two sheet tabs:**
   - Tab 1: `Leads` (complete submissions)
   - Tab 2: `Partial Leads` (abandoned/incomplete forms)

5. **In each sheet, add header row (Row 1):**

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U | V | W | X |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Timestamp | Name | Phone | City | Product | RC Ownership | Car Brand | Car Year | Car Value | Loan Amount | Employment | Income | Score | Segment | Flags | Consent Call | Consent WhatsApp | UTM Source | UTM Medium | UTM Campaign | UTM Content | FB Click ID | Landing URL | Status |

**Copy the exact headers** so the script maps data correctly.

6. **Get your Sheet ID:**
   - Open the sheet
   - Copy the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
   - Save the `SHEET_ID` — you'll need it in Step 3

---

## Step 2: Open Google Apps Script Editor

1. **Go to** [script.google.com](https://script.google.com)
2. **Create a new project** → Click "New project"
3. **Name it:** `Finmonk LAC Lead Webhook`
4. **In the editor**, clear any default code and paste the complete code from `appscript-Code.gs`

---

## Step 3: Configure the Script

In the Google Apps Script editor, find these lines at the top and update them:

```javascript
const SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE";
const ALERT_EMAIL = "sales-team@finmonk.com";
```

**Replace:**
- `YOUR_GOOGLE_SHEET_ID_HERE` → Paste the Sheet ID from Step 1.6
- `sales-team@finmonk.com` → Email where HOT lead alerts should go (any Gmail/Workspace email)

**Save:** Ctrl+S

---

## Step 4: Test the Script (Optional but Recommended)

1. In the Apps Script editor, find the `testDoPost()` function
2. Click **Select function** dropdown (top-left) → Choose `testDoPost`
3. Click the **Run** button (▶️)
4. **Authorize** the script:
   - Click "Review permissions"
   - Sign in with your Google account
   - Click "Allow" for all permissions requested
   - You'll see a confirmation message

5. **Check your Google Sheet:**
   - Open the sheet from Step 1
   - You should see a test row in the `Leads` tab with `Test User` and phone `9999999999`

---

## Step 5: Deploy as Web App

1. **In the Apps Script editor**, click **Deploy** (top-right) → **New deployment**
2. **Type:** Select "Web app" from the dropdown
3. **Execute as:** Select your email/account
4. **Who has access:** Select "Anyone" (required for form submissions)
5. Click **Deploy**
6. **Copy the deployment URL** that appears in the dialog

**Example URL:**
```
https://script.google.com/macros/d/{DEPLOYMENT_ID}/userweb
```

**Save this URL** — you'll need it in Step 6.

---

## Step 6: Connect Your Frontend Form

In your Next.js app, update the `LeadForm` component to post data to the Google Apps Script endpoint.

### In your `.env.local` file, add:

```env
NEXT_PUBLIC_WEBHOOK_URL=https://script.google.com/macros/d/{YOUR_DEPLOYMENT_ID}/userweb
```

Replace `{YOUR_DEPLOYMENT_ID}` with the ID from your deployment URL (Step 5).

### In your `LeadForm.tsx` component, when submitting the form:

```typescript
const submitLead = async (formData) => {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        product: "LAC", // or your product code
        employment: formData.employment,
        income: formData.income,
        loanAmount: formData.loanAmount,
        rcOwnership: formData.rcOwnership,
        carBrand: formData.carBrand,
        carYear: formData.carYear,
        carValue: formData.carValue,
        consent_call: formData.consentCall,
        consent_whatsapp: formData.consentWhatsApp,
        utm_source: utm.source,
        utm_medium: utm.medium,
        utm_campaign: utm.campaign,
        utm_content: utm.content,
        fbclid: utm.fbclid,
        landing_url: window.location.href,
        timestamp: new Date().toISOString(),
        status: "complete", // or "partial" if abandonment tracking
        flags: [], // e.g., ["high-intent"], ["fraud-risk"]
        score: calculateScore(formData), // 0-100 scoring
        segment: classifySegment(formData), // "HOT", "WARM", "COLD"
      }),
    });

    console.log("Lead submitted successfully");
  } catch (error) {
    console.error("Failed to submit lead:", error);
  }
};
```

---

## Step 7: Verify Live Submission

1. **Start your Next.js app:** `npm run dev`
2. **Fill out the form** at `http://localhost:3000`
3. **Submit**
4. **Check your Google Sheet** → New row should appear in `Leads` tab within seconds
5. **If segment is "HOT"** → You'll receive an email alert at `ALERT_EMAIL`

---

## Troubleshooting

### Issue: "CORS error" or form won't submit
- **Solution:** Make sure `mode: "no-cors"` is set in the fetch request
- Google Apps Script endpoints require CORS handling; `no-cors` mode bypasses client-side CORS checks

### Issue: Data not appearing in sheet
- **Verify:**
  1. Sheet ID is correct in the Apps Script (no extra spaces)
  2. Tab names match exactly: "Leads" or "Partial Leads"
  3. Headers are in the correct order (A–X)
  4. Check Apps Script logs: View → Logs to see any errors

### Issue: Email alerts not working
- **Verify:**
  1. `ALERT_EMAIL` is a valid Gmail/Workspace email
  2. Your Google Account has permission to send emails
  3. Form segment is exactly `"HOT"` and status is `"complete"`

### Issue: Deployment URL not working
- **Solution:** Redeploy
  1. Click **Deploy** (top-right) → **All deployments** (gear icon)
  2. Click the trash icon to delete old deployment
  3. Deploy again with "New deployment"

---

## What the Script Does

✅ **Receives POST requests** from your form
✅ **Validates** required fields (name, phone, timestamp)
✅ **Converts timestamps** to IST (Indian Standard Time)
✅ **Routes data** to correct sheet tab (Leads vs. Partial Leads)
✅ **Detects duplicates** (logs warning if phone already exists)
✅ **Sends email alerts** for HOT leads
✅ **Returns JSON** response (success/error)

---

## Maintenance & Monitoring

- **Daily:** Check Google Sheet for new leads
- **Weekly:** Review "Partial Leads" tab for abandonment patterns
- **Monthly:** Clean up test rows, archive old data
- **On deployment:** Update `NEXT_PUBLIC_WEBHOOK_URL` if you redeploy the script

---

## Production Checklist

- [ ] Sheet ID configured in Apps Script
- [ ] Alert email set to your sales team
- [ ] Deployment URL copied
- [ ] `.env.local` updated with deployment URL
- [ ] Form tested with real submission
- [ ] Email alert received for test "HOT" lead
- [ ] Historical test rows deleted from sheet
- [ ] Deployment URL kept private (only in `.env.local`)

---

**Questions?** Check the Apps Script logs: View → Logs (Ctrl+Shift+I)
