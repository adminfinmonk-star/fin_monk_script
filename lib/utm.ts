const STORAGE_KEY = "finmonk_utm";

export interface UTMData {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  fbclid: string;
  landing_url: string;
}

export function captureUTM(): UTMData {
  if (typeof window === "undefined") return emptyUTM();

  const params = new URLSearchParams(window.location.search);
  const data: UTMData = {
    utm_source: params.get("utm_source") ?? "",
    utm_medium: params.get("utm_medium") ?? "",
    utm_campaign: params.get("utm_campaign") ?? "",
    utm_content: params.get("utm_content") ?? "",
    utm_term: params.get("utm_term") ?? "",
    fbclid: params.get("fbclid") ?? "",
    landing_url: window.location.href,
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}

  return data;
}

export function getStoredUTM(): UTMData {
  if (typeof window === "undefined") return emptyUTM();
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : emptyUTM();
  } catch {
    return emptyUTM();
  }
}

export function getCapturedUTM(): UTMData | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function hasProductParam(product: string): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("product") === product;
}

function emptyUTM(): UTMData {
  return {
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
    utm_term: "",
    fbclid: "",
    landing_url: "",
  };
}
