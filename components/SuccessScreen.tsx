"use client";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

interface Props {
  name: string;
  phone: string;
  submitOk: boolean;
}

export default function SuccessScreen({ name, phone, submitOk }: Props) {
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919000000000";
  const waMsg = encodeURIComponent(
    `Hi Finmonk, I just applied for a Loan Against My Car. My name is ${name}.`
  );
  const waUrl = `https://wa.me/${waNumber}?text=${waMsg}`;
  const maskedPhone = phone.slice(0, 2) + "XXXXXXXX";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ textAlign: "center", padding: "8px 0" }}
    >
      {/* Animated checkmark */}
      <motion.div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <motion.circle
            cx="36" cy="36" r="32"
            stroke="var(--success)"
            strokeWidth="3"
            fill="rgba(16,185,129,0.08)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <motion.path
            d="M20 36 L31 47 L52 25"
            stroke="var(--success)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {submitOk ? (
          <>
            <h2 style={{ fontFamily: "var(--font-jakarta)", fontWeight: 800, fontSize: 22, color: "var(--text-primary)", margin: "0 0 8px" }}>
              You&apos;re on your way! 🎉
            </h2>
            <p style={{ fontFamily: "var(--font-dm)", fontSize: 15, color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.5 }}>
              Hi {name}, your eligibility check is confirmed.<br />
              Our loan advisor will call you at +91 {maskedPhone} within the next 2 hours.
            </p>
          </>
        ) : (
          <>
            <h2 style={{ fontFamily: "var(--font-jakarta)", fontWeight: 800, fontSize: 20, color: "var(--text-primary)", margin: "0 0 8px" }}>
              Almost there!
            </h2>
            <p style={{ fontFamily: "var(--font-dm)", fontSize: 14, color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.5 }}>
              We had a connectivity issue — your info is saved. WhatsApp us to confirm your application instantly.
            </p>
          </>
        )}

        {/* Docs checklist */}
        <div style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "14px 18px",
          marginBottom: 20,
          textAlign: "left",
        }}>
          <p style={{ fontFamily: "var(--font-dm)", fontWeight: 600, fontSize: 13, color: "var(--text-primary)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            📋 Keep these ready for the call:
          </p>
          {["RC copy of your car", "Aadhaar + PAN card", "Last 6 months bank statement"].map((item) => (
            <p key={item} style={{ fontFamily: "var(--font-dm)", fontSize: 13, color: "var(--text-secondary)", margin: "4px 0", paddingLeft: 4 }}>
              • {item}
            </p>
          ))}
        </div>

        {/* WhatsApp CTA */}
        <motion.a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            background: "#25D366",
            color: "#fff",
            borderRadius: 12,
            padding: "14px 20px",
            fontFamily: "var(--font-dm)",
            fontWeight: 600,
            fontSize: 15,
            textDecoration: "none",
            boxShadow: "0 4px 20px rgba(37,211,102,0.3)",
          }}
        >
          <MessageCircle size={20} />
          WhatsApp us instead →
        </motion.a>
      </motion.div>
    </motion.div>
  );
}
