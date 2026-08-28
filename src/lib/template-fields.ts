/**
 * Templates ship action buttons (tap to call, WhatsApp, email, maps, booking,
 * shop). When a template is applied we try to fill those buttons with the
 * user's *own* data; whatever we cannot infer is asked for in a small popup
 * before the design is applied.
 */
import { linkAction, type TemplateProfile, type TemplateLinkAction } from "@/lib/smartlink-templates";

export const FIELD_KEYS = ["phone", "whatsapp", "email", "address", "booking_url", "shop_url"] as const;
export type TemplateFieldKey = (typeof FIELD_KEYS)[number];

export interface TemplateFieldDef {
  key: TemplateFieldKey;
  label: string;
  placeholder: string;
  hint: string;
  inputMode?: "tel" | "email" | "url" | "text";
}

export const FIELD_DEFS: Record<TemplateFieldKey, TemplateFieldDef> = {
  phone: {
    key: "phone",
    label: "Phone number",
    placeholder: "+966 55 123 4567",
    hint: "Used by the tap-to-call button",
    inputMode: "tel",
  },
  whatsapp: {
    key: "whatsapp",
    label: "WhatsApp number",
    placeholder: "+966 55 123 4567",
    hint: "Opens a WhatsApp chat with you",
    inputMode: "tel",
  },
  email: {
    key: "email",
    label: "Email address",
    placeholder: "you@example.com",
    hint: "Used by the email button",
    inputMode: "email",
  },
  address: {
    key: "address",
    label: "Address or place",
    placeholder: "Olaya St, Riyadh",
    hint: "Opens directions in Maps",
    inputMode: "text",
  },
  booking_url: {
    key: "booking_url",
    label: "Booking link",
    placeholder: "https://cal.com/you",
    hint: "Where the booking button sends visitors",
    inputMode: "url",
  },
  shop_url: {
    key: "shop_url",
    label: "Shop link",
    placeholder: "https://yourstore.com",
    hint: "Where the shop button sends visitors",
    inputMode: "url",
  },
};

const ACTION_FIELD: Partial<Record<TemplateLinkAction, TemplateFieldKey>> = {
  call: "phone",
  whatsapp: "whatsapp",
  email: "email",
  map: "address",
  booking: "booking_url",
  shop: "shop_url",
};

export const fieldForAction = (a: TemplateLinkAction): TemplateFieldKey | undefined => ACTION_FIELD[a];

/** Which personal fields this template's buttons need, in template order. */
export function templateFieldKeys(t: TemplateProfile): TemplateFieldKey[] {
  const keys: TemplateFieldKey[] = [];
  for (const l of t.links) {
    const k = fieldForAction(linkAction(l));
    if (k && !keys.includes(k)) keys.push(k);
  }
  return keys;
}

export type TemplateFieldValues = Partial<Record<TemplateFieldKey, string>>;

const digits = (v: string) => v.replace(/\D/g, "");

/** Turn a field value into the URL its button should open. */
export function urlForField(key: TemplateFieldKey, value: string): string {
  const v = (value || "").trim();
  if (!v) return "";
  switch (key) {
    case "phone":
      return `tel:+${digits(v)}`;
    case "whatsapp":
      return `https://wa.me/${digits(v)}`;
    case "email":
      return `mailto:${v}`;
    case "address":
      return `https://maps.google.com/?q=${encodeURIComponent(v)}`;
    case "booking_url":
    case "shop_url":
      return /^https?:\/\//i.test(v) ? v : `https://${v}`;
  }
}

/** Best-effort reverse: pull a value back out of an existing link URL. */
export function valueFromUrl(key: TemplateFieldKey, url: string): string {
  const u = (url || "").trim();
  if (!u) return "";
  switch (key) {
    case "phone":
      return u.startsWith("tel:") ? u.slice(4) : "";
    case "whatsapp":
      return u.includes("wa.me/") ? u.split("wa.me/")[1]?.split(/[?/]/)[0] ?? "" : "";
    case "email":
      return u.startsWith("mailto:") ? u.slice(7) : "";
    case "address":
      return u.includes("maps.") && u.includes("q=")
        ? decodeURIComponent(u.split("q=")[1]?.split("&")[0] ?? "")
        : "";
    case "booking_url":
    case "shop_url":
      return /^https?:\/\//i.test(u) ? u : "";
  }
}

/**
 * Prefill the template's fields from data the user already has: their current
 * links (tel:, wa.me, mailto:, maps) plus their account email.
 */
export function prefillFields(
  keys: TemplateFieldKey[],
  sources: { links?: { url?: string | null; title?: string | null }[]; email?: string | null }
): TemplateFieldValues {
  const values: TemplateFieldValues = {};
  for (const key of keys) {
    for (const l of sources.links ?? []) {
      const v = valueFromUrl(key, l.url || "");
      if (v) {
        values[key] = v;
        break;
      }
    }
    if (!values[key] && key === "email" && sources.email) values[key] = sources.email;
  }
  return values;
}

/** Fields still empty after prefilling — these need the popup. */
export const missingFields = (keys: TemplateFieldKey[], values: TemplateFieldValues): TemplateFieldKey[] =>
  keys.filter((k) => !(values[k] || "").trim());
