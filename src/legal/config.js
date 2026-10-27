// Single place to edit legal identity details used on every legal page.
export const LEGAL = {
  entity: "Deemona Global Solutions",
  product: "Deemona Rasoi",
  address: "New Delhi 110075, India",
  site: "https://deemona-rasoi-frontend.onrender.com",
  // Set VITE_CONTACT_EMAIL in your frontend environment to change this.
  email: import.meta.env.VITE_CONTACT_EMAIL || "abhishek240575@gmail.com",
  officer: "Abhishek",
  officerTitle: "Grievance Officer & Data Protection Contact",
  updated: "27 October 2026",
};

export const LEGAL_LINKS = [
  ["terms", "Terms of Service"],
  ["privacy", "Privacy Policy"],
  ["acceptable-use", "Acceptable Use"],
  ["child-safety", "Child Safety"],
  ["cookies", "Cookies & Storage"],
  ["disclaimer", "Health & AI Disclaimer"],
  ["data-deletion", "Delete My Data"],
  ["grievance", "Grievance & Contact"],
];

export function legalHref(slug) {
  return "/?page=" + slug;
}

// Supports /?page=terms (always works) and /terms (needs an SPA rewrite).
export function getLegalSlug() {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search).get("page");
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
  const slug = q || path;
  return LEGAL_LINKS.some(([s]) => s === slug) ? slug : null;
}
