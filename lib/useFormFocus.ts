"use client";
import { useCallback } from "react";

export function useFormFocus() {
  const isMobile = useCallback(
    () => typeof window !== "undefined" && window.innerWidth <= 768,
    []
  );

  const scrollToForm = useCallback(
    (ref: React.RefObject<HTMLElement>) => {
      if (!isMobile() || !ref.current) return;
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [isMobile]
  );

  const focusFirstField = useCallback(
    (ref: React.RefObject<HTMLElement>) => {
      if (!isMobile() || !ref.current) return;
      const el = ref.current.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([tabindex="-1"]), select'
      );
      el?.focus({ preventScroll: true });
    },
    [isMobile]
  );

  return { scrollToForm, focusFirstField };
}
