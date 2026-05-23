declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args);
  }
}

export const Pixel = {
  pageView() {
    fbq("track", "PageView");
  },
  viewContent() {
    fbq("track", "ViewContent", {
      content_name: "LAC Form",
      content_category: "Loan Against Car",
    });
  },
  initiateCheckout() {
    fbq("track", "InitiateCheckout", { content_name: "LAC Form" });
  },
  lead(segment: string, loanAmount: string) {
    const midpoints: Record<string, number> = {
      "Up to ₹1L": 75000,
      "₹1L–3L": 200000,
      "₹3L–5L": 400000,
      "₹5L–10L": 750000,
      "Above ₹10L": 1000000,
    };
    fbq("track", "Lead", {
      content_name: "LAC",
      value: midpoints[loanAmount] ?? 0,
      currency: "INR",
      status: segment,
    });
  },
};
