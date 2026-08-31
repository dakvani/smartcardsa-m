/**
 * Ready-made header banner designs. These render *behind the header block
 * only* (avatar + name + bio + socials) and are an alternative to uploading
 * a header image — or a backdrop layered under one.
 *
 * Each design is pure CSS so it costs nothing to render and never shifts
 * layout, which keeps public profiles fast on low-end mobiles.
 */
export type HeaderDesign =
  | "none"
  | "aurora"
  | "mesh"
  | "wave"
  | "grid"
  | "sunburst"
  | "confetti"
  | "stripes"
  | "glass"
  | "neon"
  | "dusk"
  | "topo"
  | "bokeh"
  | "strokes"
  | "stars"
  | "prism"
  | "tide"
  | "slash";

export interface HeaderDesignSpec {
  key: HeaderDesign;
  label: string;
  hint: string;
  /** Base layer style (gradient / colour field). */
  base: React.CSSProperties;
  /** Optional patterned layer painted over the base. */
  pattern?: React.CSSProperties;
  /** Optional clip-path for an unequal / shaped bottom edge (CSS clip-path). */
  clipPath?: string;
  /** Glass styles: blurred, translucent tint instead of an opaque gradient. */
  glass?: boolean;
}

export const HEADER_DESIGNS: HeaderDesignSpec[] = [
  {
    key: "none",
    label: "None",
    hint: "Keep the template theme behind the header.",
    base: {},
  },
  {
    key: "aurora",
    label: "Aurora",
    hint: "Soft northern-lights glow.",
    base: {
      backgroundImage:
        "radial-gradient(120% 90% at 15% 0%, #7c3aed 0%, transparent 60%), radial-gradient(100% 80% at 90% 10%, #06b6d4 0%, transparent 55%), linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)",
    },
    pattern: {
      backgroundImage:
        "radial-gradient(60% 40% at 50% 100%, rgba(255,255,255,0.18) 0%, transparent 70%)",
    },
  },
  {
    key: "mesh",
    label: "Mesh",
    hint: "Warm multi-point gradient mesh.",
    base: {
      backgroundImage:
        "radial-gradient(80% 70% at 0% 0%, #fb7185 0%, transparent 60%), radial-gradient(70% 70% at 100% 0%, #f59e0b 0%, transparent 55%), radial-gradient(90% 90% at 50% 120%, #6366f1 0%, transparent 60%), linear-gradient(180deg, #1e1b4b, #111827)",
    },
  },
  {
    key: "wave",
    label: "Wave crest",
    hint: "Layered ocean bands with a soft crest.",
    base: { backgroundImage: "linear-gradient(180deg, #0ea5e9 0%, #0369a1 55%, #082f49 100%)" },
    pattern: {
      backgroundImage:
        "radial-gradient(140% 60% at 50% 130%, rgba(255,255,255,0.35) 0%, transparent 60%), radial-gradient(120% 50% at 20% 140%, rgba(255,255,255,0.18) 0%, transparent 60%)",
    },
  },
  {
    key: "grid",
    label: "Tech grid",
    hint: "Blueprint grid over deep slate.",
    base: { backgroundImage: "linear-gradient(140deg, #111827 0%, #0b1220 60%, #052e2b 100%)" },
    pattern: {
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px)",
      backgroundSize: "26px 26px, 26px 26px",
    },
  },
  {
    key: "sunburst",
    label: "Sunburst",
    hint: "Radiating rays from the centre.",
    base: { backgroundImage: "linear-gradient(180deg, #f97316 0%, #db2777 100%)" },
    pattern: {
      backgroundImage:
        "repeating-conic-gradient(from 0deg at 50% 120%, rgba(255,255,255,0.20) 0deg 6deg, transparent 6deg 14deg)",
    },
  },
  {
    key: "confetti",
    label: "Confetti",
    hint: "Playful dot scatter on mint.",
    base: { backgroundImage: "linear-gradient(160deg, #10b981 0%, #0f766e 100%)" },
    pattern: {
      backgroundImage:
        "radial-gradient(rgba(255,255,255,0.55) 1.6px, transparent 1.8px), radial-gradient(rgba(255,255,255,0.28) 1.2px, transparent 1.4px)",
      backgroundSize: "34px 34px, 22px 22px",
      backgroundPosition: "0 0, 12px 16px",
    },
  },
  {
    key: "stripes",
    label: "Diagonal",
    hint: "Editorial diagonal stripes.",
    base: { backgroundImage: "linear-gradient(135deg, #1f2937 0%, #4c1d95 100%)" },
    pattern: {
      backgroundImage:
        "repeating-linear-gradient(135deg, rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 10px, transparent 10px, transparent 24px)",
    },
  },
];

export function headerDesignSpec(key: HeaderDesign | undefined): HeaderDesignSpec | undefined {
  if (!key || key === "none") return undefined;
  return HEADER_DESIGNS.find((d) => d.key === key);
}
