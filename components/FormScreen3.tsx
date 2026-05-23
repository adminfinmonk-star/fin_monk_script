"use client";
import { CheckCircle2 } from "lucide-react";

interface Screen3Data {
  employment: string;
  income: string;
  name: string;
  phone: string;
  consent_call: boolean;
  consent_whatsapp: boolean;
  honeypot: string;
}

interface Props {
  data: Screen3Data;
  onChange: (data: Partial<Screen3Data>) => void;
  errors: Record<string, string>;
  shakeFields: Record<string, boolean>;
}

const EMPLOYMENT = [
  { key: "salaried", icon: "💼", label: "Salaried", sub: "Private / Govt" },
  { key: "business", icon: "🏪", label: "Business Owner", sub: "" },
  { key: "selfemployed", icon: "🧑‍💻", label: "Self-employed / Freelancer", sub: "" },
  { key: "unemployed", icon: "⏸️", label: "Not currently working", sub: "" },
];

const INCOME_OPTIONS = ["Below ₹15K", "₹15K–30K", "₹30K–60K", "Above ₹60K"];

export default function FormScreen3({ data, onChange, errors, shakeFields }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Field 6 — Employment */}
      <div>
        <label style={{ display: "block", fontFamily: "var(--font-dm)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 10 }}>
          Your current occupation
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {EMPLOYMENT.map((e) => (
            <div
              key={e.key}
              className={`option-card ${data.employment === e.key ? "selected" : ""} ${shakeFields.employment ? "shake" : ""}`}
              onClick={() => onChange({ employment: e.key })}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{e.icon}</span>
                <div>
                  <div style={{ fontFamily: "var(--font-dm)", fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{e.label}</div>
                  {e.sub && <div style={{ fontFamily: "var(--font-dm)", fontSize: 11, color: "var(--text-muted)" }}>{e.sub}</div>}
                </div>
              </div>
              {data.employment === e.key && (
                <div style={{ marginTop: 6, display: "flex", justifyContent: "flex-end" }}>
                  <CheckCircle2 size={14} color="var(--accent)" />
                </div>
              )}
            </div>
          ))}
        </div>
        {errors.employment && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4, fontFamily: "var(--font-dm)" }}>{errors.employment}</p>}
        {data.employment === "unemployed" && (
          <div className="inline-banner warning" style={{ marginTop: 10 }}>
            <span>⚠️</span>
            <span>Income verification may be required. Our team will explore options.</span>
          </div>
        )}
      </div>

      {/* Field 7 — Income */}
      <div>
        <label style={{ display: "block", fontFamily: "var(--font-dm)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 10 }}>
          Monthly income or business revenue
        </label>
        <div className={shakeFields.income ? "shake" : ""} style={{ display: "flex" }}>
          {INCOME_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`seg-btn ${data.income === opt ? "selected" : ""}`}
              onClick={() => onChange({ income: opt })}
            >
              {opt}
            </button>
          ))}
        </div>
        {errors.income && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4, fontFamily: "var(--font-dm)" }}>{errors.income}</p>}
        {data.income === "Below ₹15K" && (
          <div className="inline-banner info" style={{ marginTop: 10 }}>
            <span>ℹ️</span>
            <span>You may still qualify with some of our NBFC partners.</span>
          </div>
        )}
      </div>

      {/* Field 8 — Contact */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Name */}
        <div>
          <label style={{ display: "block", fontFamily: "var(--font-dm)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 6 }}>
            Full name
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Your full name"
            className={shakeFields.name ? "shake" : ""}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 8,
              border: errors.name ? "1.5px solid #ef4444" : "1.5px solid var(--border)",
              fontFamily: "var(--font-dm)",
              fontSize: 14,
              color: "var(--text-primary)",
              background: "var(--surface)",
              outline: "none",
              minHeight: 48,
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--border-focus)"; }}
            onBlur={(e) => { e.target.style.borderColor = errors.name ? "#ef4444" : "var(--border)"; }}
          />
          {errors.name && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4, fontFamily: "var(--font-dm)" }}>{errors.name}</p>}
        </div>

        {/* Phone */}
        <div>
          <label style={{ display: "block", fontFamily: "var(--font-dm)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 6 }}>
            Mobile number
          </label>
          <div style={{ display: "flex", border: errors.phone ? "1.5px solid #ef4444" : "1.5px solid var(--border)", borderRadius: 8, overflow: "hidden", background: "var(--surface)", minHeight: 48 }}>
            <div style={{
              padding: "12px 12px",
              background: "var(--surface-2)",
              borderRight: "1px solid var(--border)",
              fontFamily: "var(--font-dm)",
              fontSize: 14,
              color: "var(--text-secondary)",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
            }}>
              +91
            </div>
            <input
              type="tel"
              inputMode="numeric"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              placeholder="10-digit mobile number"
              className={shakeFields.phone ? "shake" : ""}
              maxLength={10}
              style={{
                flex: 1,
                padding: "12px 14px",
                border: "none",
                fontFamily: "var(--font-dm)",
                fontSize: 14,
                color: "var(--text-primary)",
                background: "transparent",
                outline: "none",
              }}
              onFocus={(e) => { (e.target.closest("div") as HTMLElement)!.style.borderColor = "var(--border-focus)"; }}
              onBlur={(e) => { (e.target.closest("div") as HTMLElement)!.style.borderColor = errors.phone ? "#ef4444" : "var(--border)"; }}
            />
          </div>
          {errors.phone && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4, fontFamily: "var(--font-dm)" }}>{errors.phone}</p>}
        </div>
      </div>

      {/* Honeypot */}
      <input
        name="website"
        type="text"
        value={data.honeypot}
        onChange={(e) => onChange({ honeypot: e.target.value })}
        style={{ display: "none", position: "absolute", left: -9999 }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {/* Consent checkboxes */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ display: "flex", gap: 10, cursor: "pointer", alignItems: "flex-start" }}>
          <input
            type="checkbox"
            className="consent-check"
            checked={data.consent_call}
            onChange={(e) => onChange({ consent_call: e.target.checked })}
          />
          <span style={{ fontFamily: "var(--font-dm)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
            I agree to be contacted by Finmonk and its lending partners via phone and SMS regarding my loan application.{" "}
            <span style={{ color: "var(--text-secondary)" }}>(Required to process your application)</span>
          </span>
        </label>
        {errors.consent_call && <p style={{ color: "#ef4444", fontSize: 12, marginTop: -8, fontFamily: "var(--font-dm)" }}>{errors.consent_call}</p>}

        <label style={{ display: "flex", gap: 10, cursor: "pointer", alignItems: "flex-start" }}>
          <input
            type="checkbox"
            className="consent-check"
            checked={data.consent_whatsapp}
            onChange={(e) => onChange({ consent_whatsapp: e.target.checked })}
          />
          <span style={{ fontFamily: "var(--font-dm)", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>
            I also agree to be contacted on WhatsApp. <span style={{ color: "var(--text-secondary)" }}>(Optional — for faster updates)</span>
          </span>
        </label>
      </div>

      <p style={{ fontFamily: "var(--font-dm)", fontSize: 11, color: "var(--text-muted)", textAlign: "center", margin: 0 }}>
        🔒 Your information is 100% secure and never shared without consent.
        By submitting, you agree to our Terms &amp; Privacy Policy.
      </p>
    </div>
  );
}
