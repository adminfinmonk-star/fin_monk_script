/**
 * Finmonk LAC Lead Capture — Google Apps Script Backend
 *
 * Deploy as Web App:
 * 1. Copy this entire code into Apps Script editor (script.google.com)
 * 2. Set the configuration variables below (SHEET_ID, ALERT_EMAIL)
 * 3. Deploy → New deployment → Web app → Execute as (your account) → Who has access (Anyone)
 * 4. Copy the deployment URL and set as NEXT_PUBLIC_WEBHOOK_URL in .env.local
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION — UPDATE THESE VALUES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE";
const ALERT_EMAIL = "sales-team@finmonk.com";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    // Acquire lock to prevent concurrent write corruption
    lock.waitLock(10000);

    // Parse incoming JSON payload
    const data = JSON.parse(e.postData.contents);

    // Validate required fields (partial leads have empty name/phone — only timestamp required)
    if (!data.timestamp) {
      return errorResponse("Missing required fields", 400);
    }
    if (data.status !== "partial" && (!data.name || !data.phone)) {
      return errorResponse("Name and phone required for complete leads", 400);
    }

    // Open sheet
    const ss = SpreadsheetApp.openById(SHEET_ID);

    // Route to correct tab based on submission status
    const tabName = data.status === "partial" ? "Partial Leads" : "Leads";
    const sheet = ss.getSheetByName(tabName);

    if (!sheet) {
      return errorResponse(`Sheet tab "${tabName}" not found`, 500);
    }

    // Convert timestamp to IST
    const ist = Utilities.formatDate(
      new Date(data.timestamp),
      "Asia/Kolkata",
      "dd/MM/yyyy HH:mm:ss"
    );

    // Prepare row data — EXACT column order from spec
    const row = [
      ist,                                    // A: Timestamp (IST)
      data.name || "",                        // B: Name
      data.phone || "",                       // C: Phone
      data.city || "",                        // D: City
      data.product || "",                     // E: Product
      data.rcOwnership || "",                 // F: RC Ownership
      data.carBrand || "",                    // G: Car Brand
      data.carYear || "",                     // H: Car Year
      data.carValue || "",                    // I: Car Value
      data.loanAmount || "",                  // J: Loan Amount
      data.employment || "",                  // K: Employment
      data.income || "",                      // L: Income
      data.score || 0,                        // M: Score
      data.segment || "",                     // N: Segment
      (data.flags || []).join(", "),          // O: Flags
      data.consent_call === true ? "Yes" : "No",    // P: Consent Call
      data.consent_whatsapp === true ? "Yes" : "No", // Q: Consent WhatsApp
      data.utm_source || "",                  // R: UTM Source
      data.utm_medium || "",                  // S: UTM Medium
      data.utm_campaign || "",                // T: UTM Campaign
      data.utm_content || "",                 // U: UTM Content
      data.fbclid || "",                      // V: FB Click ID
      data.landing_url || "",                 // W: Landing URL
      data.status || "complete"               // X: Status
    ];

    // Append row to sheet
    sheet.appendRow(row);

    // Send email alert for HOT leads (complete submissions only)
    if (data.segment === "HOT" && data.status === "complete") {
      sendHotLeadAlert(data);
    }

    // Check for duplicate (optional — warn in logs)
    if (isDuplicate(sheet, data.phone)) {
      console.warn(`Duplicate phone detected: ${data.phone}`);
    }

    // Success response
    return successResponse("Lead recorded successfully");

  } catch (error) {
    console.error("Error in doPost:", error.toString());
    return errorResponse("Internal server error: " + error.toString(), 500);

  } finally {
    lock.releaseLock();
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Send email alert for HOT leads
 */
function sendHotLeadAlert(data) {
  try {
    const subject = `🔥 HOT Lead — ${data.name} (${data.city})`;
    const body = `
Name: ${data.name}
Phone: +91${data.phone}
City: ${data.city}
Car: ${data.carBrand} ${data.carYear}
Car Value: ${data.carValue}
Loan Amount: ${data.loanAmount}
Employment: ${data.employment}
Income: ${data.income}
Score: ${data.score}
Flags: ${(data.flags || []).join(", ")}
UTM Source: ${data.utm_source}
Timestamp: ${data.timestamp}
    `.trim();

    MailApp.sendEmail(ALERT_EMAIL, subject, body);
    console.log(`Email alert sent for: ${data.name}`);
  } catch (error) {
    console.error("Failed to send email alert:", error.toString());
  }
}

/**
 * Check if phone number already exists in sheet (duplicate detection)
 */
function isDuplicate(sheet, phone) {
  if (!phone) return false;

  try {
    const data = sheet.getDataRange().getValues();
    // Column C (index 2) contains phone numbers
    for (let i = 1; i < data.length; i++) {
      if (data[i][2] === phone) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Return success response
 */
function successResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: message }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Return error response
 */
function errorResponse(message, code) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "error", message: message, code: code || 500 }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OPTIONAL: Test function (run from editor to verify setup)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function testDoPost() {
  const testPayload = {
    product: "LAC",
    rcOwnership: "self",
    carBrand: "Maruti Suzuki",
    carYear: "2022 or newer",
    carValue: "₹3L–6L",
    loanAmount: "₹1L–3L",
    city: "Mumbai",
    employment: "salaried",
    income: "₹30K–60K",
    name: "Test User",
    phone: "9999999999",
    consent_call: true,
    consent_whatsapp: false,
    utm_source: "facebook",
    utm_medium: "cpc",
    utm_campaign: "LAC_May26_Mumbai",
    utm_content: "ad_001",
    utm_term: "",
    fbclid: "test_fbclid_123",
    landing_url: "https://finmonk.app/?utm_source=facebook",
    timestamp: new Date().toISOString(),
    flags: ["test"],
    score: 85,
    segment: "HOT",
    status: "complete"
  };

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testPayload)
    }
  };

  const result = doPost(mockEvent);
  Logger.log("Test result:", result.getContent());
}
