"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function MobileStickyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const scrollToForm = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="flex md:hidden"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 200,
            background: "var(--accent)",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 -4px 20px rgba(249,115,22,0.3)",
          }}
        >
          <button
            onClick={scrollToForm}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#fff",
              fontFamily: "var(--font-dm)",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              textAlign: "left",
              padding: 0,
            }}
          >
            🚗 Get up to ₹10L against your car — Apply Free →
          </button>
          <button
            onClick={() => setVisible(false)}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "50%",
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <X size={14} color="#fff" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
