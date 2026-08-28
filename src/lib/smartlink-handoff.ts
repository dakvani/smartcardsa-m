/**
 * Handoff between the public SmartLink Bio builder (marketing page) and the
 * authenticated profile editor (dashboard).
 *
 * The visitor customises a template while logged out; when they hit
 * "Publish this bio" we stash the selection here, send them through
 * signup/login, and the dashboard picks it up and applies it to their
 * real profile so the very same design shows up in the editor.
 */
import { templates, type TemplateProfile } from "@/lib/smartlink-templates";

export const SMARTLINK_PENDING_KEY = "smartlink.pending.v2";

export interface PendingBio {
  /** Template identifier (its username slug in smartlink-templates). */
  template: string;
  name: string;
  bio: string;
  handle: string;
}

/** Visual patch applied to the user's profile row for a SmartLink template. */
export interface SmartlinkProfilePatch {
  theme_name: string;
  theme_gradient: string;
  gradient_direction: string;
  custom_bg_color: null;
  custom_accent_color: null;
  animation_type: null;
  custom_background_url: string;
  custom_background_type: "image";
}

/** Gradient fallback shown behind/around the template background image. */
const GRADIENTS: Record<string, string> = {
  "matthew.skates": "from-orange-500 via-amber-600 to-neutral-900",
  "timothy.teo": "from-orange-500 via-rose-600 to-neutral-900",
  "gabby.hoops": "from-slate-700 via-slate-900 to-black",
  "sara.designs": "from-rose-200 via-pink-100 to-amber-100",
  "omar.dev": "from-emerald-700 via-slate-900 to-black",
  "layla.sings": "from-fuchsia-600 via-purple-800 to-slate-900",
  "faisal.fit": "from-neutral-800 via-neutral-900 to-black",
  "noura.style": "from-stone-500 via-stone-800 to-neutral-900",
  "chef.yousef": "from-amber-600 via-orange-800 to-neutral-900",
  "reem.consults": "from-sky-700 via-slate-800 to-slate-900",
  "hana.tutor": "from-teal-600 via-cyan-800 to-slate-900",
  "khalid.realty": "from-amber-500 via-amber-700 to-neutral-900",
};

export const gradientForTemplate = (t: TemplateProfile): string =>
  GRADIENTS[t.username] ??
  (t.textOnDark === "dark"
    ? "from-gray-100 via-gray-200 to-gray-300"
    : "from-slate-800 via-slate-900 to-black");

/** Map a marketing template to the profile columns the editor understands. */
export const smartlinkTemplateToProfilePatch = (t: TemplateProfile): SmartlinkProfilePatch => ({
  theme_name: t.name,
  theme_gradient: gradientForTemplate(t),
  gradient_direction: "to-b",
  custom_bg_color: null,
  custom_accent_color: null,
  animation_type: null,
  custom_background_url: t.bgImage,
  custom_background_type: "image",
});

export const findSmartlinkTemplate = (username: string): TemplateProfile | undefined =>
  templates.find((t) => t.username === username);

export function savePendingBio(pending: PendingBio): void {
  try {
    window.localStorage.setItem(SMARTLINK_PENDING_KEY, JSON.stringify(pending));
  } catch {
    /* storage unavailable — handoff is best-effort */
  }
}

export function readPendingBio(): PendingBio | null {
  try {
    const raw = window.localStorage.getItem(SMARTLINK_PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingBio>;
    if (!parsed?.template || !findSmartlinkTemplate(parsed.template)) return null;
    return {
      template: parsed.template,
      name: typeof parsed.name === "string" ? parsed.name : "",
      bio: typeof parsed.bio === "string" ? parsed.bio : "",
      handle: typeof parsed.handle === "string" ? parsed.handle : "",
    };
  } catch {
    return null;
  }
}

export function clearPendingBio(): void {
  try {
    window.localStorage.removeItem(SMARTLINK_PENDING_KEY);
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------------ *
 * Plan-based access for SmartLink Bio templates
 * ------------------------------------------------------------------ */

export type TemplateTier = "free" | "pro";

/** Templates available on every plan; everything else needs a Pro tier. */
const FREE_TEMPLATES = new Set<string>([
  "matthew.skates",
  "timothy.teo",
  "gabby.hoops",
  "sara.designs",
  "omar.dev",
  "hana.tutor",
]);

export const smartlinkTemplateTier = (t: TemplateProfile): TemplateTier =>
  FREE_TEMPLATES.has(t.username) ? "free" : "pro";

/* ------------------------------------------------------------------ *
 * Rollback: remember the previously published look so a wrong publish
 * can be reverted in one click.
 * ------------------------------------------------------------------ */

export interface ThemeSnapshot {
  theme_name: string;
  theme_gradient: string;
  gradient_direction: string;
  custom_bg_color: string | null;
  custom_accent_color: string | null;
  animation_type: string | null;
  custom_background_url: string | null;
  custom_background_type: "image" | "video" | null;
  /** ISO timestamp of when this look was replaced. */
  saved_at: string;
}

const snapshotKey = (userId?: string) => `smartlink.previous-theme:${userId || "anon"}`;

export function saveThemeSnapshot(userId: string | undefined, snap: Omit<ThemeSnapshot, "saved_at">): void {
  try {
    window.localStorage.setItem(
      snapshotKey(userId),
      JSON.stringify({ ...snap, saved_at: new Date().toISOString() } satisfies ThemeSnapshot)
    );
  } catch { /* noop */ }
}

export function readThemeSnapshot(userId?: string): ThemeSnapshot | null {
  try {
    const raw = window.localStorage.getItem(snapshotKey(userId));
    return raw ? (JSON.parse(raw) as ThemeSnapshot) : null;
  } catch {
    return null;
  }
}

export function clearThemeSnapshot(userId?: string): void {
  try { window.localStorage.removeItem(snapshotKey(userId)); } catch { /* noop */ }
}

const PRO_PLANS = ["pro", "pro_plus", "business", "enterprise", "lifetime"];

/** Can this plan apply a template of the given tier? */
export const canUseTemplateTier = (tier: TemplateTier, plan?: string): boolean =>
  tier === "free" || PRO_PLANS.includes(plan || "free");

/* ------------------------------------------------------------------ *
 * Template content → editable editor elements
 *
 * A template is not just a look: it ships link buttons, socials and an
 * avatar. Importing it turns those into real, editable rows in the
 * dashboard so the user can rename, delete, reorder or add to them.
 * ------------------------------------------------------------------ */

/** Editor social keys (see SocialLinksEditor) a template icon maps to. */
const SOCIAL_KEY_MAP: Record<string, "instagram" | "twitter" | "youtube" | "facebook" | "linkedin" | "github" | "website"> = {
  instagram: "instagram",
  x: "twitter",
  youtube: "youtube",
  facebook: "facebook",
  linkedin: "linkedin",
  github: "github",
  website: "website",
};

export interface TemplateContent {
  /** Link buttons, in template order — inserted as editable rows. */
  links: { title: string; url: string; position: number }[];
  /** Values for the social inputs the editor supports. */
  social_links: Record<string, string>;
  avatar_url: string;
}

/** Everything from a template that becomes editable content in the editor. */
export function templateContent(t: TemplateProfile): TemplateContent {
  const handle = t.username.replace(/^@/, "");
  const social_links: Record<string, string> = {};
  for (const icon of t.socials) {
    const key = SOCIAL_KEY_MAP[icon];
    if (!key) continue;
    social_links[key] =
      key === "website" ? `https://${handle.replace(/[^a-z0-9]/gi, "")}.com` : handle;
  }
  return {
    links: t.links.map((title, i) => ({ title, url: "", position: i })),
    social_links,
    avatar_url: t.avatarImage,
  };
}
