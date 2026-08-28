/**
 * Per-button appearance ("style") stored on `links.style` (jsonb).
 * Lets each button override the template's text colour, button colour and
 * shadow independently, on top of the profile-wide card style.
 */

export type LinkShadow = "none" | "soft" | "hard" | "glow";

export interface LinkStyle {
  /** Text (and icon) colour, hex. */
  text?: string;
  /** Button background colour, hex. */
  bg?: string;
  /** Border colour, hex. */
  border?: string;
  /** Shadow preset. */
  shadow?: LinkShadow;
  /** Shadow colour, hex (used by soft / hard / glow). */
  shadowColor?: string;
}

export const LINK_SHADOWS: { value: LinkShadow; label: string }[] = [
  { value: "none", label: "No shadow" },
  { value: "soft", label: "Soft" },
  { value: "hard", label: "Hard" },
  { value: "glow", label: "Glow" },
];

export const emptyLinkStyle: LinkStyle = {};

/** Read a link's `style` jsonb defensively. */
export function parseLinkStyle(raw: unknown): LinkStyle {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as LinkStyle;
}

/** True when the button has any per-button override. */
export function hasLinkStyle(style: LinkStyle): boolean {
  return Boolean(style.text || style.bg || style.border || (style.shadow && style.shadow !== "none"));
}

function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return `rgba(0,0,0,${alpha})`;
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => parseInt(h, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function shadowValue(style: LinkStyle): string | undefined {
  const color = style.shadowColor || style.bg || "#000000";
  switch (style.shadow) {
    case "soft":
      return `0 10px 24px -8px ${hexToRgba(color, 0.55)}`;
    case "hard":
      return `4px 4px 0 0 ${hexToRgba(color, 1)}`;
    case "glow":
      return `0 0 22px 2px ${hexToRgba(color, 0.6)}`;
    default:
      return undefined;
  }
}

/** Inline CSS overrides for a button, derived from its per-button style. */
export function linkStyleCss(style: LinkStyle): React.CSSProperties {
  const css: React.CSSProperties = {};
  if (style.bg) css.background = style.bg;
  if (style.text) css.color = style.text;
  if (style.border) {
    css.borderColor = style.border;
    css.borderWidth = 1;
    css.borderStyle = "solid";
  }
  const shadow = shadowValue(style);
  if (shadow) css.boxShadow = shadow;
  return css;
}
