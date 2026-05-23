"use client";
import { motion } from "framer-motion";

const STEPS = [
  { num: "01", title: "Fill the Form", sub: "2 minutes", desc: "Answer a few quick questions about your car and loan requirement." },
  { num: "02", title: "Quick Verification", sub: "Our team calls you in 2 hours", desc: "A Finmonk advisor will reach out to verify details and match you with the best lender." },
  { num: "03", title: "Cash in Account", sub: "Within 24–48 hrs", desc: "Loan disbursed to your account. Your car stays with you throughout the tenure." },
];

export default function HowItWorks() {
  const scrollToForm = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section style={{ background: "var(--surface)", padding: "80px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ fontFamily: "var(--font-jakarta)", fontWeight: 800, fontSize: "clamp(24px, 3vw, 36px)", color: "var(--text-primary)", margin: "0 0 10px" }}>
            How It Works
          </h2>
          <p style={{ fontFamily: "var(--font-dm)", fontSize: 16, color: "var(--text-secondary)" }}>
            From application to cash — in under 48 hours.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, position: "relative" }}>
          {STEPS.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.45 }}
              style={{
                background: "var(--surface)",
                border: "1.5px solid var(--border)",
                borderRadius: 16,
                padding: "28px 24px",
                position: "relative",
              }}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 36, color: "var(--accent)", marginBottom: 12 }}>
                {s.num}
              </div>
              <div style={{ fontFamily: "var(--font-jakarta)", fontWeight: 700, fontSize: 18, color: "var(--text-primary)", marginBottom: 4 }}>
                {s.title}
              </div>
              <div style={{ fontFamily: "var(--font-dm)", fontSize: 13, color: "var(--accent)", fontWeight: 600, marginBottom: 10 }}>
                {s.sub}
              </div>
              <p style={{ fontFamily: "var(--font-dm)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                {s.desc}
              </p>

              {/* Arrow connector (desktop only, hide last) */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block" style={{
                  position: "absolute",
                  right: -20,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 1,
                  fontSize: 20,
                  color: "var(--border)",
                }}>
                  →
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Secondary CTA */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <motion.button
            onClick={scrollToForm}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "16px 36px",
              fontFamily: "var(--font-dm)",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "var(--shadow-cta)",
            }}
          >
            Apply Now — It&apos;s Free →
          </motion.button>
        </div>
      </div>
    </section>
  );
}
