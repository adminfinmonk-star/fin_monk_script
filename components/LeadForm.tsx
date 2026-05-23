"use client";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import FormScreen1 from "./FormScreen1";
import FormScreen2 from "./FormScreen2";
import FormScreen3 from "./FormScreen3";
import SuccessScreen from "./SuccessScreen";
import { validateName, validatePhone } from "@/lib/formUtils";
import { calculateScore, getSegment, buildFlags, LeadPayload } from "@/lib/disqualifyLogic";
import { getStoredUTM, hasProductParam } from "@/lib/utm";
import { submitLead } from "@/lib/submitLead";
import { Pixel } from "@/lib/pixel";

interface FormData {
  product: string;
  rcOwnership: string;
  carBrand: string;
  carYear: string;
  carValue: string;
  loanAmount: string;
  city: string;
  employment: string;
  income: string;
  name: string;
  phone: string;
  consent_call: boolean;
  consent_whatsapp: boolean;
  honeypot: string;
}

const INITIAL: FormData = {
  product: "LAC",
  rcOwnership: "",
  carBrand: "",
  carYear: "",
  carValue: "",
  loanAmount: "",
  city: "",
  employment: "",
  income: "",
  name: "",
  phone: "",
  consent_call: false,
  consent_whatsapp: false,
  honeypot: "",
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function LeadForm() {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shakeFields, setShakeFields] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitOk, setSubmitOk] = useState(true);
  const [loading, setLoading] = useState(false);
  const interacted = useRef(false);
  const partialSent = useRef(false);

  useEffect(() => {
    if (hasProductParam("lac")) {
      setData((d) => ({ ...d, product: "LAC" }));
    }
  }, []);

  const update = (patch: Partial<FormData>) => {
    setData((d) => ({ ...d, ...patch }));
    if (!interacted.current) {
      interacted.current = true;
      Pixel.initiateCheckout();
    }
  };

  function triggerShake(fields: string[]) {
    const map: Record<string, boolean> = {};
    fields.forEach((f) => (map[f] = true));
    setShakeFields(map);
    setTimeout(() => setShakeFields({}), 350);
  }

  function validateScreen1(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!data.product) e.product = "Please select an option to continue";
    if (data.product === "LAC") {
      if (!data.rcOwnership) e.rcOwnership = "Please select an option to continue";
      if (!data.carBrand) e.carBrand = "Please select an option to continue";
      if (!data.carYear) e.carYear = "Please select an option to continue";
    }
    return e;
  }

  function validateScreen2(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!data.carValue) e.carValue = "Please select an option to continue";
    if (!data.loanAmount) e.loanAmount = "Please select an option to continue";
    if (!data.city) e.city = "Please select your city";
    return e;
  }

  function validateScreen3(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!data.employment) e.employment = "Please select an option to continue";
    if (!data.income) e.income = "Please select an option to continue";
    const nameErr = validateName(data.name);
    if (nameErr) e.name = nameErr;
    const phoneErr = validatePhone(data.phone);
    if (phoneErr) e.phone = phoneErr;
    if (!data.consent_call) e.consent_call = "Please agree to be contacted to continue";
    return e;
  }

  async function sendPartialLead() {
    if (partialSent.current) return;
    partialSent.current = true;
    const utm = getStoredUTM();
    const partial: LeadPayload = {
      product: data.product as LeadPayload["product"],
      rcOwnership: (data.rcOwnership || "self") as LeadPayload["rcOwnership"],
      carBrand: data.carBrand,
      carYear: data.carYear,
      carValue: data.carValue,
      loanAmount: data.loanAmount,
      city: data.city,
      employment: "salaried",
      income: "",
      name: "",
      phone: "",
      consent_call: false,
      consent_whatsapp: false,
      ...utm,
      timestamp: new Date().toISOString(),
      flags: buildFlags(data as Partial<LeadPayload>),
      score: 0,
      segment: "JUNK",
      status: "partial",
    };
    await submitLead(partial);
  }

  async function next() {
    if (step === 1) {
      const e = validateScreen1();
      if (Object.keys(e).length) { setErrors(e); triggerShake(Object.keys(e)); return; }
      setErrors({});
      // Non-LAC: submit immediately to different bucket
      if (data.product !== "LAC") {
        await handleNonLACSubmit();
        return;
      }
      setDir(1); setStep(2);
    } else if (step === 2) {
      const e = validateScreen2();
      if (Object.keys(e).length) { setErrors(e); triggerShake(Object.keys(e)); return; }
      setErrors({});
      sendPartialLead();
      setDir(1); setStep(3);
    }
  }

  async function handleNonLACSubmit() {
    const utm = getStoredUTM();
    const payload: LeadPayload = {
      product: data.product as LeadPayload["product"],
      rcOwnership: "self",
      carBrand: "", carYear: "", carValue: "", loanAmount: "", city: "",
      employment: "salaried", income: "", name: "", phone: "",
      consent_call: false, consent_whatsapp: false,
      ...utm,
      timestamp: new Date().toISOString(),
      flags: [],
      score: 0,
      segment: "COLD",
      status: "partial",
    };
    await submitLead(payload);
    setSubmitted(true);
    setSubmitOk(true);
  }

  async function handleSubmit() {
    if (data.honeypot) { setSubmitted(true); setSubmitOk(true); return; }
    const e = validateScreen3();
    if (Object.keys(e).length) { setErrors(e); triggerShake(Object.keys(e)); return; }
    setErrors({});
    setLoading(true);

    const utm = getStoredUTM();
    const flags = buildFlags(data as Partial<LeadPayload>);
    const score = calculateScore(data as Partial<LeadPayload>);
    const segment = getSegment(score);

    const payload: LeadPayload = {
      product: data.product as LeadPayload["product"],
      rcOwnership: data.rcOwnership as LeadPayload["rcOwnership"],
      carBrand: data.carBrand,
      carYear: data.carYear,
      carValue: data.carValue,
      loanAmount: data.loanAmount,
      city: data.city,
      employment: data.employment as LeadPayload["employment"],
      income: data.income,
      name: data.name.trim(),
      phone: data.phone,
      consent_call: data.consent_call,
      consent_whatsapp: data.consent_whatsapp,
      ...utm,
      timestamp: new Date().toISOString(),
      flags,
      score,
      segment,
      status: "complete",
    };

    const ok = await submitLead(payload);
    Pixel.lead(segment, data.loanAmount);
    setSubmitOk(ok);
    setSubmitted(true);
    setLoading(false);
  }

  function back() {
    setDir(-1);
    setStep((s) => Math.max(1, s - 1));
    setErrors({});
  }

  const ctaText = step === 3 ? "Check My Eligibility →" : "Continue →";

  if (submitted) {
    return (
      <div id="lead-form" style={{
        background: "var(--surface)",
        borderRadius: 20,
        padding: "clamp(24px, 4vw, 40px)",
        boxShadow: "var(--shadow-card)",
        borderTop: "4px solid var(--accent)",
      }}>
        <SuccessScreen name={data.name || "there"} phone={data.phone} submitOk={submitOk} />
      </div>
    );
  }

  return (
    <motion.div
      id="lead-form"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.15, type: "spring", stiffness: 120 }}
      style={{
        background: "var(--surface)",
        borderRadius: 20,
        padding: "clamp(24px, 4vw, 40px)",
        boxShadow: "var(--shadow-card)",
        borderTop: "4px solid var(--accent)",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--font-jakarta)", fontWeight: 700, fontSize: 20, color: "var(--text-primary)", margin: 0 }}>
          Check Your Eligibility
        </h2>
        <p style={{ fontFamily: "var(--font-dm)", fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
          Free · No credit score impact · 2 minutes
        </p>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-dm)", fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
          Step {step} of 3
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 4,
                background: s <= step ? "var(--accent)" : "var(--border)",
                transition: "background 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>

      {/* Form screens */}
      <div style={{ position: "relative", overflow: "hidden", minHeight: 200 }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            {step === 1 && <FormScreen1 data={data} onChange={update} errors={errors} shakeFields={shakeFields} />}
            {step === 2 && <FormScreen2 data={data} onChange={update} errors={errors} shakeFields={shakeFields} />}
            {step === 3 && <FormScreen3 data={data} onChange={update} errors={errors} shakeFields={shakeFields} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
        <motion.button
          onClick={step === 3 ? handleSubmit : next}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading || (step === 3 && !data.consent_call)}
          style={{
            width: "100%",
            background: (step === 3 && !data.consent_call) ? "rgba(249,115,22,0.45)" : "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: 16,
            fontFamily: "var(--font-dm)",
            fontWeight: 600,
            fontSize: 17,
            cursor: (step === 3 && !data.consent_call) ? "not-allowed" : "pointer",
            boxShadow: "var(--shadow-cta)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "background 0.2s",
          }}
        >
          {loading ? (
            <>
              <span style={{ fontSize: 14 }}>⏳</span>
              Checking eligibility...
            </>
          ) : (
            ctaText
          )}
        </motion.button>

        {step > 1 && (
          <button
            onClick={back}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              fontFamily: "var(--font-dm)",
              fontSize: 13,
              cursor: "pointer",
              padding: "4px 0",
            }}
          >
            ← Back
          </button>
        )}
      </div>

      {/* Trust pills */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
        {["No credit score impact", "Free service", "Response in 2 hours"].map((t) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <CheckCircle2 size={12} color="var(--success)" />
            <span style={{ fontFamily: "var(--font-dm)", fontSize: 11, color: "var(--text-muted)" }}>{t}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
