"use client";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface Screen1Data {
  product: string;
  rcOwnership: string;
  carBrand: string;
  carYear: string;
}

interface Props {
  data: Screen1Data;
  onChange: (data: Partial<Screen1Data>) => void;
  errors: Record<string, string>;
  shakeFields: Record<string, boolean>;
}

const PRODUCTS = [
  { key: "LAC", icon: "🔑", title: "Loan Against My Car", sub: "I already own a car" },
  { key: "UCL", icon: "🚗", title: "Used Car Loan", sub: "I want to buy a car" },
  { key: "NCL", icon: "✨", title: "New Car Loan", sub: "" },
];

const RC_OPTIONS = [
  { key: "self", label: "Yes, RC is in my name" },
  { key: "family", label: "It's in a family member's name" },
  { key: "active_loan", label: "Loan is still running on this car" },
];

const CAR_BRANDS = [
  "Maruti Suzuki", "Hyundai", "Tata", "Honda", "Toyota",
  "Mahindra", "Kia", "MG", "Renault", "Volkswagen",
  "Ford", "Skoda", "Nissan", "Other",
];

const CAR_YEARS = [
  { val: "2022 or newer", label: "2022 or newer" },
  { val: "2019 – 2021", label: "2019 – 2021" },
  { val: "2016 – 2018", label: "2016 – 2018" },
  { val: "2013 – 2015", label: "2013 – 2015" },
  { val: "2010 – 2012", label: "2010 – 2012" },
  { val: "Before 2010", label: "Before 2010 ⚠️" },
];

export default function FormScreen1({ data, onChange, errors, shakeFields }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Field 1 — Product */}
      <div>
        <label style={{ display: "block", fontFamily: "var(--font-dm)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 10 }}>
          What are you looking for?
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PRODUCTS.map((p) => (
            <div
              key={p.key}
              className={`product-card ${data.product === p.key ? "selected" : ""} ${shakeFields.product ? "shake" : ""}`}
              onClick={() => onChange({ product: p.key })}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22 }}>{p.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-dm)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
                    {p.title}
                  </div>
                  {p.sub && (
                    <div style={{ fontFamily: "var(--font-dm)", fontSize: 12, color: "var(--text-muted)" }}>
                      {p.sub}
                    </div>
                  )}
                </div>
                {data.product === p.key && (
                  <CheckCircle2 size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
                )}
              </div>
            </div>
          ))}
        </div>
        {errors.product && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4, fontFamily: "var(--font-dm)" }}>{errors.product}</p>}

        {/* Non-LAC message */}
        {(data.product === "UCL" || data.product === "NCL") && (
          <div className="inline-banner info" style={{ marginTop: 10 }}>
            <span>ℹ️</span>
            <span>You&apos;re looking for a car purchase loan — we&apos;ll route you correctly. Click Continue to proceed.</span>
          </div>
        )}
      </div>

      {/* Only show rest if LAC selected */}
      {data.product === "LAC" && (
        <>
          {/* Field 2 — RC Ownership */}
          <div>
            <label style={{ display: "block", fontFamily: "var(--font-dm)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 10 }}>
              Is the car registered in your name?
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {RC_OPTIONS.map((opt) => (
                <div
                  key={opt.key}
                  className={`option-card ${data.rcOwnership === opt.key ? "selected" : ""} ${shakeFields.rcOwnership ? "shake" : ""}`}
                  onClick={() => onChange({ rcOwnership: opt.key })}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <span style={{ fontFamily: "var(--font-dm)", fontSize: 14, color: "var(--text-primary)" }}>
                    {opt.label}
                  </span>
                  {data.rcOwnership === opt.key && (
                    <CheckCircle2 size={16} color="var(--accent)" />
                  )}
                </div>
              ))}
            </div>
            {errors.rcOwnership && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4, fontFamily: "var(--font-dm)" }}>{errors.rcOwnership}</p>}

            {data.rcOwnership === "family" && (
              <div className="inline-banner warning" style={{ marginTop: 10 }}>
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>Most lenders require RC in your name. Our team will help you explore options.</span>
              </div>
            )}
            {data.rcOwnership === "active_loan" && (
              <div className="inline-banner info" style={{ marginTop: 10 }}>
                <span>ℹ️</span>
                <span>We have NBFC partners who offer top-up loans. You still may be eligible.</span>
              </div>
            )}
          </div>

          {/* Field 3 — Car Details */}
          <div>
            <label style={{ display: "block", fontFamily: "var(--font-dm)", fontWeight: 600, fontSize: 14, color: "var(--text-primary)", marginBottom: 10 }}>
              Car details
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontFamily: "var(--font-dm)", fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Car brand</label>
                <select
                  className={`custom-select ${shakeFields.carBrand ? "shake" : ""}`}
                  value={data.carBrand}
                  onChange={(e) => onChange({ carBrand: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: errors.carBrand ? "1.5px solid #ef4444" : "1.5px solid var(--border)",
                    fontFamily: "var(--font-dm)",
                    fontSize: 14,
                    color: data.carBrand ? "var(--text-primary)" : "var(--text-muted)",
                    background: "var(--surface)",
                    outline: "none",
                    minHeight: 48,
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--border-focus)"; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.carBrand ? "#ef4444" : "var(--border)"; }}
                >
                  <option value="">Select brand</option>
                  {CAR_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                {errors.carBrand && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4, fontFamily: "var(--font-dm)" }}>{errors.carBrand}</p>}
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-dm)", fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Year</label>
                <select
                  className={`custom-select ${shakeFields.carYear ? "shake" : ""}`}
                  value={data.carYear}
                  onChange={(e) => onChange({ carYear: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: errors.carYear ? "1.5px solid #ef4444" : "1.5px solid var(--border)",
                    fontFamily: "var(--font-dm)",
                    fontSize: 14,
                    color: data.carYear ? "var(--text-primary)" : "var(--text-muted)",
                    background: "var(--surface)",
                    outline: "none",
                    minHeight: 48,
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--border-focus)"; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.carYear ? "#ef4444" : "var(--border)"; }}
                >
                  <option value="">Select year</option>
                  {CAR_YEARS.map((y) => <option key={y.val} value={y.val}>{y.label}</option>)}
                </select>
                {errors.carYear && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4, fontFamily: "var(--font-dm)" }}>{errors.carYear}</p>}
              </div>
            </div>
            {data.carYear === "Before 2010" && (
              <div className="inline-banner warning" style={{ marginTop: 10 }}>
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>Cars older than 2012 may have limited lender options. We&apos;ll still try.</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
