export function validateName(name: string): string {
  if (!name || name.trim().length < 3) return "Please enter your full name";
  if (!/^[a-zA-Z\s]+$/.test(name.trim())) return "Please enter your full name";
  return "";
}

export function validatePhone(phone: string): string {
  if (!/^[6-9]\d{9}$/.test(phone)) return "Enter a valid 10-digit mobile number";
  return "";
}

export function calculateEMI(loanAmountStr: string): number {
  const midpoints: Record<string, number> = {
    "Up to ₹1L": 75000,
    "₹1L–3L": 200000,
    "₹3L–5L": 400000,
    "₹5L–10L": 750000,
    "Above ₹10L": 1000000,
  };
  const P = midpoints[loanAmountStr] ?? 0;
  if (!P) return 0;
  const r = 16 / 1200;
  const n = 36;
  return Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function loanExceedsLTV(carValue: string, loanAmount: string): boolean {
  const carMid: Record<string, number> = {
    "Below ₹1.5L": 100000,
    "₹1.5L–3L": 225000,
    "₹3L–6L": 450000,
    "₹6L–10L": 800000,
    "Above ₹10L": 1200000,
  };
  const loanMid: Record<string, number> = {
    "Up to ₹1L": 100000,
    "₹1L–3L": 200000,
    "₹3L–5L": 400000,
    "₹5L–10L": 750000,
    "Above ₹10L": 1000000,
  };
  const cv = carMid[carValue] ?? 0;
  const la = loanMid[loanAmount] ?? 0;
  if (!cv || !la) return false;
  return la > cv * 0.8;
}
