"use client";
import { useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LeadForm from "@/components/LeadForm";
import TrustBar from "@/components/TrustBar";
import HowItWorks from "@/components/HowItWorks";
import MobileStickyBar from "@/components/MobileStickyBar";
import FinmonkLogo from "@/components/FinmonkLogo";
import { useFormFocus } from "@/lib/useFormFocus";

export default function Home() {
  const formPanelRef = useRef<HTMLDivElement>(null);
  const { scrollToForm } = useFormFocus();

  useEffect(() => {
    const t = setTimeout(() => scrollToForm(formPanelRef), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Navbar />
      <MobileStickyBar />

      <main style={{ paddingTop: 64 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            minHeight: "calc(100vh - 64px)",
          }}
          className="hero-grid"
        >
          {/* Left — Hero */}
          <div className="hero-panel">
            <Hero />
          </div>

          {/* Right — Form */}
          <div
            ref={formPanelRef}
            style={{
              background: "var(--surface-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "48px 32px",
            }}
            className="form-panel"
          >
            <div style={{ width: "100%", maxWidth: 480 }}>
              <LeadForm />
            </div>
          </div>
        </div>
      </main>

      <TrustBar />
      <HowItWorks />

      {/* Footer */}
      <footer style={{ background: "var(--surface-2)", borderTop: "1px solid var(--border)", padding: "32px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ marginBottom: 16 }}>
            <FinmonkLogo size={28} variant="color" showWordmark />
          </div>

          <p style={{ fontFamily: "var(--font-dm)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.8, margin: 0 }}>
            Finmonk is a Loan Service Provider (LSP) and acts as a facilitator between borrowers and RBI-regulated lenders.
            We do not lend directly. Loan approval is subject to lender&apos;s credit assessment and eligibility criteria.
            Interest rates and loan amounts shown are indicative and may vary.
            <br />
            *EMI calculations are approximate. Final terms are set by the lending partner.
          </p>

          <p style={{ fontFamily: "var(--font-dm)", fontSize: 10, color: "var(--text-muted)", marginTop: 12 }}>
            © {new Date().getFullYear()} Finmonk. All rights reserved.
          </p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-panel { min-height: 280px !important; order: 2; }
          .form-panel { padding: 28px 16px !important; order: 1; }
        }
      `}</style>
    </>
  );
}
