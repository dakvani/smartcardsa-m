import { detectLinkType } from "@/lib/link-types";

// vCard 3.0 requires CRLF line endings per RFC 2426.
export const CRLF = "\r\n";

export const escapeVcf = (s: string) =>
  (s || "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

/** Fold long vCard lines at 75 octets per RFC 2426. */
export const foldLine = (line: string): string => {
  if (line.length <= 75) return line;
  const parts: string[] = [line.slice(0, 75)];
  let i = 75;
  while (i < line.length) {
    parts.push(" " + line.slice(i, i + 74));
    i += 74;
  }
  return parts.join(CRLF);
};

export const normalizePhone = (raw: string): string => {
  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/[^\d]/g, "");
  return (hasPlus ? "+" : "") + digits;
};

export const extractWhatsAppNumber = (url: string): string => {
  const m = url.match(/wa\.me\/(\+?[\d]+)/i) || url.match(/phone=(\+?[\d]+)/i);
  const raw = m ? m[1] : url;
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? `+${digits}` : "";
};

export interface VcardProfile {
  username: string;
  title?: string | null;
  bio?: string | null;
  social_links?: unknown;
}

export interface VcardLink {
  title: string;
  url: string;
  visible?: boolean;
}

export interface ContactDetails {
  displayName: string;
  phones: string[];
  whatsapps: string[];
  emails: string[];
  websites: string[];
  socialUrls: string[];
}

export function extractContactDetails(profile: VcardProfile, links: VcardLink[]): ContactDetails {
  const activeLinks = (links || []).filter((l) => l.visible !== false);

  const phones = activeLinks
    .filter((l) => detectLinkType(l.url, l.title) === "phone")
    .map((l) => normalizePhone(l.url.replace(/^tel:/i, "")))
    .filter(Boolean);

  const whatsapps = activeLinks
    .filter((l) => detectLinkType(l.url, l.title) === "whatsapp")
    .map((l) => extractWhatsAppNumber(l.url))
    .filter(Boolean);

  const emails = activeLinks
    .filter((l) => detectLinkType(l.url, l.title) === "email")
    .map((l) => l.url.replace(/^mailto:/i, "").trim())
    .filter(Boolean);

  const websites = activeLinks
    .filter((l) => {
      const t = detectLinkType(l.url, l.title);
      return t === "website" || t === "custom";
    })
    .map((l) => l.url.trim())
    .filter(Boolean);

  const socials = (profile.social_links as Record<string, string | undefined> | null) || {};
  const socialUrls = Object.values(socials).filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );

  return {
    displayName: profile.title || profile.username,
    phones,
    whatsapps,
    emails,
    websites,
    socialUrls,
  };
}

export function buildVcard(profile: VcardProfile, links: VcardLink[], publicUrl: string): string {
  const d = extractContactDetails(profile, links);
  const bio = profile.bio || "";

  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    foldLine(`FN:${escapeVcf(d.displayName)}`),
    foldLine(`N:${escapeVcf(d.displayName)};;;;`),
  ];
  if (bio) lines.push(foldLine(`NOTE:${escapeVcf(bio)}`));
  d.phones.forEach((p) => lines.push(foldLine(`TEL;TYPE=CELL,VOICE:${p}`)));
  d.whatsapps.forEach((p) => lines.push(foldLine(`TEL;TYPE=CELL;X-SERVICE-TYPE=WhatsApp:${p}`)));
  d.emails.forEach((e) => lines.push(foldLine(`EMAIL;TYPE=INTERNET:${escapeVcf(e)}`)));
  d.websites.forEach((w) => lines.push(foldLine(`URL:${escapeVcf(w)}`)));
  d.socialUrls.forEach((s) => lines.push(foldLine(`URL:${escapeVcf(s)}`)));
  if (publicUrl) lines.push(foldLine(`URL:${escapeVcf(publicUrl)}`));
  lines.push(`REV:${new Date().toISOString()}`);
  lines.push("END:VCARD");

  return lines.join(CRLF) + CRLF;
}

/** Trigger a .vcf download / iOS contact-viewer open. */
export function downloadVcard(vcf: string, username: string) {
  const filename = `${(username || "contact").replace(/[^\w-]/g, "_")}.vcf`;
  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.rel = "noopener";
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
}
