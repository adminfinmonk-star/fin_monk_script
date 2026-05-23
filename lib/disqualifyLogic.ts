export type LeadSegment = "HOT" | "WARM" | "COLD" | "JUNK";

export interface LeadPayload {
  product: "LAC" | "UCL" | "NCL";
  rcOwnership: "self" | "family" | "active_loan";
  carBrand: string;
  carYear: string;
  carValue: string;
  loanAmount: string;
  city: string;
  employment: "salaried" | "business" | "selfemployed" | "unemployed";
  income: string;
  name: string;
  phone: string;
  consent_call: boolean;
  consent_whatsapp: boolean;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  fbclid: string;
  landing_url: string;
  timestamp: string;
  flags: string[];
  score: number;
  segment: LeadSegment;
  status: "complete" | "partial";
}

const METRO_CITIES = ["Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Chennai", "Pune"];

export function calculateScore(data: Partial<LeadPayload>): number {
  let score = 0;

  // Car year (max 30)
  if (data.carYear === "2022 or newer") score += 30;
  else if (data.carYear === "2019 – 2021") score += 20;
  else if (data.carYear === "2016 – 2018") score += 10;

  // Income (max 25)
  if (data.income === "Above ₹60K") score += 25;
  else if (data.income === "₹30K–60K") score += 20;
  else if (data.income === "₹15K–30K") score += 10;

  // Employment (max 25)
  if (data.employment === "business") score += 25;
  else if (data.employment === "salaried") score += 20;
  else if (data.employment === "selfemployed") score += 15;

  // Car value (max 15)
  if (data.carValue === "Above ₹10L") score += 15;
  else if (data.carValue === "₹6L–10L") score += 12;
  else if (data.carValue === "₹3L–6L") score += 8;

  // RC ownership (max 5)
  if (data.rcOwnership === "self") score += 5;
  else if (data.rcOwnership === "family") score += 3;

  // City metro bonus (max 5)
  if (data.city && METRO_CITIES.includes(data.city)) score += 5;

  return score;
}

export function getSegment(score: number): LeadSegment {
  if (score >= 75) return "HOT";
  if (score >= 50) return "WARM";
  if (score >= 25) return "COLD";
  return "JUNK";
}

export function buildFlags(data: Partial<LeadPayload>): string[] {
  const flags: string[] = [];

  if (
    data.carYear === "2010 – 2012" ||
    data.carYear === "Before 2010" ||
    data.carYear === "2013 – 2015"
  ) flags.push("old_car");

  if (data.income === "Below ₹15K") flags.push("low_income");
  if (data.rcOwnership === "family") flags.push("family_rc");
  if (data.rcOwnership === "active_loan") flags.push("active_loan");
  if (data.employment === "unemployed") flags.push("unemployed");
  if (data.city && !METRO_CITIES.includes(data.city) && data.city !== "Other")
    flags.push("non_metro");

  return flags;
}
