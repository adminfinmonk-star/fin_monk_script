"use client";
import { motion, Easing } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import FinmonkLogo from "./FinmonkLogo";

const ease: Easing = "easeOut";
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease } },
});

export default function Hero() {
  return (
    <div
      className="hero-noise"
      style={{
        background: "var(--primary)",
        padding: "80px 48px 60px",
        position: "relative",
        overflow: "hidden",
        height: "100%",
        minHeight: 600,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* Decorative car SVG */}
      <svg
        viewBox="0 0 340 160"
        fill="none"
        style={{
          position: "absolute",
          bottom: -10,
          right: -20,
          width: 320,
          opacity: 0.06,
          pointerEvents: "none",
        }}
      >
        <path
          d="M20 110 L60 60 L120 40 L220 40 L280 60 L320 110 L320 130 L20 130 Z"
          stroke="white" strokeWidth="3" fill="none"
        />
        <circle cx="80" cy="130" r="22" stroke="white" strokeWidth="3" fill="none" />
        <circle cx="260" cy="130" r="22" stroke="white" strokeWidth="3" fill="none" />
        <path d="M60 80 L120 65 L220 65 L270 80" stroke="white" strokeWidth="2" fill="none" />
        <rect x="100" y="50" width="140" height="30" rx="4" stroke="white" strokeWidth="2" fill="none" />
      </svg>

      {/* Logo mark on dark bg */}
      <div style={{ marginBottom: 28 }}>
        <FinmonkLogo size={28} variant="white" showWordmark={false} />
      </div>

      {/* Headline */}
      <motion.h1
        {...fadeUp(0)}
        style={{
          fontFamily: "var(--font-jakarta)",
          fontWeight: 800,
          fontSize: "clamp(32px, 4vw, 54px)",
          lineHeight: 1.1,
          color: "#ffffff",
          marginBottom: 20,
          maxWidth: 480,
        }}
      >
        Turn Your Car Into{" "}
        <span style={{ color: "var(--accent)" }}>Instant Cash</span>
      </motion.h1>

      {/* Sub-headline */}
      <motion.p
        {...fadeUp(0.1)}
        style={{
          fontFamily: "var(--font-dm)",
          fontSize: 18,
          color: "rgba(255,255,255,0.72)",
          marginBottom: 32,
          maxWidth: 420,
          lineHeight: 1.6,
        }}
      >
        Keep driving. Get up to ₹10 Lakhs against your car.
        Approval in 24 hours — without selling your vehicle.
      </motion.p>

      {/* Trust bullets */}
      <motion.ul
        {...fadeUp(0.2)}
        style={{ listStyle: "none", padding: 0, margin: "0 0 40px", display: "flex", flexDirection: "column", gap: 12 }}
      >
        {[
          "RC in your name? You're eligible today",
          "Salaried, self-employed, business owners — all welcome",
          "Car stays with you throughout the loan tenure",
        ].map((bullet) => (
          <li key={bullet} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-dm)", fontSize: 15, color: "rgba(255,255,255,0.85)" }}>
              {bullet}
            </span>
          </li>
        ))}
      </motion.ul>

      {/* Stats row */}
      <motion.div
        {...fadeUp(0.3)}
        style={{ display: "flex", gap: 32 }}
      >
        {[
          { val: "₹20L", label: "Max Loan" },
          { val: "24 hrs", label: "Disbursal" },
          { val: "Best", label: "Intrest Rate" },
        ].map(({ val, label }) => (
          <div key={label}>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 26, color: "#ffffff" }}>
              {val}
            </div>
            <div style={{ fontFamily: "var(--font-dm)", fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              {label}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
