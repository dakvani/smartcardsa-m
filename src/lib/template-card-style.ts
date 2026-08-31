/**
 * A template is more than a background image: it also carries the *design of
 * its elements* (button shape, button colour, fonts, text colours, layout,
 * stats/facts blocks). That design is stored on the profile as `card_style`
 * so the public profile renders the template faithfully and the builder can
 * edit it.
 */
import {
  shapeClassFor,
  fontClassFor,
  type TemplateProfile,
  type ButtonShape,
  type FontFamily,
  type TemplateLayout,
  type ThreeDVariant,
} from "@/lib/smartlink-templates";

export interface CardStyle {
  /** Template handle this style came from (informational). */
  template?: string;
  buttonShape?: ButtonShape;
  buttonBg?: string;
  font?: FontFamily;
  nameColor?: string;
  bioColor?: string;
  socialColor?: string;
  socialOrder?: string[];
  bgTint?: string;
  /** Pro: image shown behind the header block only (avatar + name + bio). */
  headerBg?: string;
  /** 0-90: darkness of the scrim over the header image, for text contrast. */
  headerOverlay?: number;
  layout?: TemplateLayout;
  threeD?: boolean;
  threeDVariant?: ThreeDVariant;
  stats?: { label: string; value: string }[];
  facts?: { label: string; value: string }[];
}

export const emptyCardStyle: CardStyle = {};

/** Read a profile's `card_style` jsonb defensively. */
export function parseCardStyle(raw: unknown): CardStyle {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as CardStyle;
}

/** Element design extracted from a template, ready to store on the profile. */
export function cardStyleFromTemplate(t: TemplateProfile): CardStyle {
  return {
    template: t.username,
    buttonShape: t.buttonShape,
    buttonBg: t.buttonBg,
    font: t.font,
    nameColor: t.nameColor,
    bioColor: t.bioColor,
    socialColor: t.socialColor,
    socialOrder: [...t.socials],
    bgTint: t.bgTint,
    layout: t.layout ?? "classic",
    threeD: !!t.threeD,
    threeDVariant: t.threeDVariant,
    stats: t.stats,
    facts: t.facts,
  };
}

/** Tailwind classes for a public-profile link button under this card style. */
export function buttonClassFor(style: CardStyle, featured = false): string {
  const shape = style.buttonShape ? shapeClassFor(style.buttonShape) : "rounded-2xl";
  const bg =
    style.buttonBg ||
    (featured
      ? "bg-primary-foreground/30 backdrop-blur border border-primary-foreground/20 text-primary-foreground"
      : "bg-primary-foreground/20 backdrop-blur text-primary-foreground");
  return `${shape} ${bg}`;
}

/** Tailwind classes for the display name / headings. */
export function headingClassFor(style: CardStyle): string {
  return [style.font ? fontClassFor(style.font) : "font-bold", style.nameColor || "text-primary-foreground"]
    .join(" ");
}

export function bioClassFor(style: CardStyle): string {
  return style.bioColor || "text-primary-foreground/70";
}
