"use client";
import { AlertTriangle } from "lucide-react";
import { calculateEMI, formatINR, loanExceedsLTV } from "@/lib/formUtils";

interface Screen2Data {
  carValue: string;
  loanAmount: string;
  city: string;
}

interface Props {
  data: Screen2Data;
  onChange: (data: Partial<Screen2Data>) => void;
  errors: Record<string, string>;
  shakeFields: Record<string, boolean>;
}

const CAR_VALUES = ["Below ₹1.5L", "₹1.5L–3L", "₹3L–6L", "₹6L–10L", "Above ₹10L"];
const LOAN_AMOUNTS = ["Up to ₹1L", "₹1L–3L", "₹3L–5L", "₹5L–10L", "Above ₹10L"];
const CITIES = [
  "Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Chennai",
  "Pune", "Ahmedabad", "Kolkata", "Jaipur", "Lucknow",
  "Chandigarh", "Surat", "Indore", "Nagpur", "Other",
];

function SegBtnGroup({
  options, value, onChange, error, shake,
}: { options: string[]; value: string; onChange: (v: string) => void; error?: string; shake?: boolean }) {
  return (
    <div>
      <div className={`${shake ? "shake" : ""}`} style={{ display: "flex", flexWrap: "wrap" }}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`seg-btn ${value === opt ? "selected" : ""}`}
            onClick={() => onChange(opt)}
            style={{ minWidth: 0, flex: "1 1 auto" }}
          >
            {opt}
          </button>
        ))}
      </div>
      {error && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4, fontFamily: "var(--font-dm)" }}>{error}</p>}
    </div>
  );
}

export default function FormScreen2({ data, onChange, errors, shakeFields }: Props) {
  const emi = data.loanAmount ? calculateEMI(data.loanAmount) : 0;
  const exceedsLTV = data.carValue && data.loanAmount ? loanExceedsLTV(data.carValue, data.loanAmount) : false;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Field 4 — Car Value */}
      <div>
        <label style={{ display: "block", fontFamily: "var(--font-dm)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 10 }}>
          Approximate current market value of your car
        </label>
        <SegBtnGroup
          options={CAR_VALUES}
          value={data.carValue}
          onChange={(v) => onChange({ carValue: v })}
          error={errors.carValue}
          shake={shakeFields.carValue}
        />
        {data.carValue === "Below ₹1.5L" && (
          <div className="inline-banner warning" style={{ marginTop: 10 }}>
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Loan amount may be limited. Our team will advise the best option for you.</span>
          </div>
        )}
        <p style={{ fontFamily: "var(--font-dm)", fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
          💡 Not sure? Check on CarDekho or OLX for a quick valuation.
        </p>
      </div>

      {/* Field 5 — Loan Amount */}
      <div>
        <label style={{ display: "block", fontFamily: "var(--font-dm)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 10 }}>
          How much loan are you looking for?
        </label>
        <SegBtnGroup
          options={LOAN_AMOUNTS}
          value={data.loanAmount}
          onChange={(v) => onChange({ loanAmount: v })}
          error={errors.loanAmount}
          shake={shakeFields.loanAmount}
        />
        {exceedsLTV && (
          <div className="inline-banner warning" style={{ marginTop: 10 }}>
            <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>Loan amount exceeds typical LTV limits. Our advisor will find the best possible amount for you.</span>
          </div>
        )}

        {/* EMI Preview */}
        {emi > 0 && (
          <div style={{
            marginTop: 14,
            background: "var(--accent-light)",
            border: "1.5px solid rgba(249,115,22,0.25)",
            borderRadius: 10,
            padding: "12px 16px",
          }}>
            <div style={{ fontFamily: "var(--font-dm)", fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>
              Estimated EMI
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 24, color: "var(--accent)" }}>
              {formatINR(emi)}/month*
            </div>
            <div style={{ fontFamily: "var(--font-dm)", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              Based on {data.loanAmount} over 36 months at 16% p.a. · *Subject to final approval
            </div>
          </div>
        )}
      </div>

      {/* Field 5B — City */}
      <div>
        <label style={{ display: "block", fontFamily: "var(--font-dm)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 6 }}>
          Your city
        </label>
        <select
          className={`custom-select ${shakeFields.city ? "shake" : ""}`}
          value={data.city}
          onChange={(e) => onChange({ city: e.target.value })}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 8,
            border: errors.city ? "1.5px solid #ef4444" : "1.5px solid var(--border)",
            fontFamily: "var(--font-dm)",
            fontSize: 14,
            color: data.city ? "var(--text-primary)" : "var(--text-muted)",
            background: "var(--surface)",
            outline: "none",
            minHeight: 48,
          }}
          onFocus={(e) => { e.target.style.borderColor = "var(--border-focus)"; }}
          onBlur={(e) => { e.target.style.borderColor = errors.city ? "#ef4444" : "var(--border)"; }}
        >
          <option value="">Select your city</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.city && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4, fontFamily: "var(--font-dm)" }}>{errors.city}</p>}
      </div>
    </div>
  );
}
