const ITEMS = [
  { icon: "🏦", label: "10+ Lender Partners" },
  { icon: "⚡", label: "24hr Disbursal" },
  { icon: "🔒", label: "RBI Compliant" },
  { icon: "⭐", label: "4.8/5 Customer Rating" },
  { icon: "📋", label: "Minimal Docs" },
  { icon: "🚗", label: "Car Stays With You" },
];

export default function TrustBar() {
  return (
    <div style={{ background: "var(--primary)", overflow: "hidden" }}>
      {/* Desktop */}
      <div className="hidden md:flex" style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px", justifyContent: "space-around", flexWrap: "wrap", gap: 16 }}>
        {ITEMS.map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, filter: "brightness(1.3)" }}>{item.icon}</span>
            <span style={{ fontFamily: "var(--font-dm)", fontSize: 14, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile marquee */}
      <div className="flex md:hidden" style={{ padding: "16px 0", overflow: "hidden" }}>
        <div className="marquee-track" style={{ display: "flex", gap: 32, whiteSpace: "nowrap", paddingLeft: 24 }}>
          {[...ITEMS, ...ITEMS].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ fontFamily: "var(--font-dm)", fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
