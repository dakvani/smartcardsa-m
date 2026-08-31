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
  | "slash"
  | "ribbon"
  | "arches"
  | "bubbles"
  | "origami"
  | "layers"
  | "sunflare"
  | "spotlight"
  | "lensflare"
  | "halo"
  | "radiance";

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
  {
    key: "glass",
    label: "Glass frost",
    hint: "Translucent frosted glass — pairs with the overlay slider.",
    glass: true,
    base: {
      backgroundImage:
        "linear-gradient(150deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 45%, rgba(15,23,42,0.25) 100%)",
      backdropFilter: "blur(14px) saturate(1.4)",
      WebkitBackdropFilter: "blur(14px) saturate(1.4)",
    },
    pattern: {
      backgroundImage:
        "linear-gradient(115deg, rgba(255,255,255,0.28) 0%, transparent 30%), radial-gradient(70% 60% at 80% 0%, rgba(255,255,255,0.20) 0%, transparent 60%)",
    },
  },
  {
    key: "neon",
    label: "Neon pulse",
    hint: "Electric glow bands on deep black.",
    base: { backgroundImage: "linear-gradient(160deg, #020617 0%, #0f0520 60%, #000 100%)" },
    pattern: {
      backgroundImage:
        "radial-gradient(70% 90% at 10% 100%, rgba(217,70,239,0.5) 0%, transparent 55%), radial-gradient(70% 90% at 90% 0%, rgba(34,211,238,0.5) 0%, transparent 55%), radial-gradient(40% 40% at 50% 50%, rgba(163,230,53,0.25) 0%, transparent 70%)",
    },
    clipPath: "polygon(0 0, 100% 0, 100% 82%, 0 100%)",
  },
  {
    key: "dusk",
    label: "Dusk curve",
    hint: "Warm sunset with a sweeping curved base.",
    base: {
      backgroundImage:
        "linear-gradient(180deg, #312e81 0%, #7c2d12 55%, #f59e0b 100%)",
    },
    pattern: {
      backgroundImage:
        "radial-gradient(50% 45% at 50% 100%, rgba(253,186,116,0.55) 0%, transparent 70%), radial-gradient(3px 3px at 20% 20%, rgba(255,255,255,0.8) 50%, transparent 60%), radial-gradient(2px 2px at 70% 15%, rgba(255,255,255,0.7) 50%, transparent 60%), radial-gradient(2px 2px at 45% 30%, rgba(255,255,255,0.6) 50%, transparent 60%)",
      backgroundSize: "auto, 140px 90px, 180px 120px, 220px 150px",
    },
    clipPath: "ellipse(130% 100% at 50% 0%)",
  },
  {
    key: "topo",
    label: "Topographic",
    hint: "Contour-line art over forest green.",
    base: { backgroundImage: "linear-gradient(160deg, #052e16 0%, #14532d 60%, #166534 100%)" },
    pattern: {
      backgroundImage:
        "repeating-radial-gradient(circle at 30% 40%, transparent 0px, transparent 14px, rgba(255,255,255,0.10) 14px, rgba(255,255,255,0.10) 15px), repeating-radial-gradient(circle at 80% 90%, transparent 0px, transparent 18px, rgba(255,255,255,0.08) 18px, rgba(255,255,255,0.08) 19px)",
    },
    clipPath: "polygon(0 0, 100% 0, 100% 88%, 62% 100%, 30% 90%, 0 97%)",
  },
  {
    key: "bokeh",
    label: "Bokeh art",
    hint: "Soft out-of-focus light circles.",
    base: { backgroundImage: "linear-gradient(160deg, #1e293b 0%, #334155 60%, #0f172a 100%)" },
    pattern: {
      backgroundImage:
        "radial-gradient(28px 28px at 18% 30%, rgba(251,191,36,0.55) 0%, transparent 70%), radial-gradient(40px 40px at 75% 20%, rgba(244,114,182,0.45) 0%, transparent 70%), radial-gradient(22px 22px at 55% 65%, rgba(96,165,250,0.5) 0%, transparent 70%), radial-gradient(34px 34px at 88% 70%, rgba(52,211,153,0.4) 0%, transparent 70%), radial-gradient(18px 18px at 35% 85%, rgba(251,146,60,0.45) 0%, transparent 70%)",
    },
  },
  {
    key: "strokes",
    label: "Paint strokes",
    hint: "Bold brush-stroke art bands.",
    base: { backgroundImage: "linear-gradient(150deg, #fafaf9 0%, #f5f5f4 100%)" },
    pattern: {
      backgroundImage:
        "linear-gradient(100deg, transparent 55%, rgba(220,38,38,0.75) 56%, rgba(220,38,38,0.75) 66%, transparent 67%), linear-gradient(80deg, transparent 20%, rgba(37,99,235,0.7) 21%, rgba(37,99,235,0.7) 30%, transparent 31%), radial-gradient(60% 50% at 85% 85%, rgba(245,158,11,0.6) 0%, transparent 60%)",
    },
    clipPath: "polygon(0 0, 100% 0, 100% 90%, 0 78%)",
  },
  {
    key: "stars",
    label: "Starfield",
    hint: "Night sky with scattered stars.",
    base: { backgroundImage: "linear-gradient(180deg, #020617 0%, #1e1b4b 70%, #312e81 100%)" },
    pattern: {
      backgroundImage:
        "radial-gradient(2px 2px at 15% 25%, #fff 50%, transparent 60%), radial-gradient(1.5px 1.5px at 40% 12%, rgba(255,255,255,0.9) 50%, transparent 60%), radial-gradient(2px 2px at 65% 30%, rgba(255,255,255,0.8) 50%, transparent 60%), radial-gradient(1.5px 1.5px at 85% 18%, #fff 50%, transparent 60%), radial-gradient(1.5px 1.5px at 25% 55%, rgba(255,255,255,0.7) 50%, transparent 60%), radial-gradient(2px 2px at 75% 60%, rgba(255,255,255,0.6) 50%, transparent 60%), radial-gradient(1.5px 1.5px at 50% 45%, rgba(255,255,255,0.8) 50%, transparent 60%)",
      backgroundSize: "200px 140px",
    },
    clipPath: "polygon(0 0, 100% 0, 100% 92%, 75% 100%, 45% 90%, 20% 100%, 0 92%)",
  },
  {
    key: "prism",
    label: "Prism glass",
    hint: "Iridescent translucent shards.",
    glass: true,
    base: {
      backgroundImage:
        "linear-gradient(135deg, rgba(165,243,252,0.35) 0%, rgba(196,181,253,0.3) 40%, rgba(251,207,232,0.35) 100%)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
    },
    pattern: {
      backgroundImage:
        "conic-gradient(from 200deg at 70% 30%, rgba(255,255,255,0.35) 0deg, transparent 60deg), linear-gradient(60deg, transparent 60%, rgba(255,255,255,0.25) 61%, transparent 70%)",
    },
    clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)",
  },
  {
    key: "tide",
    label: "Tide pools",
    hint: "Layered teal waves with foam.",
    base: { backgroundImage: "linear-gradient(180deg, #134e4a 0%, #0f766e 55%, #14b8a6 100%)" },
    pattern: {
      backgroundImage:
        "radial-gradient(120% 45% at 50% 115%, rgba(255,255,255,0.4) 0%, transparent 55%), radial-gradient(90% 35% at 15% 125%, rgba(255,255,255,0.25) 0%, transparent 55%), radial-gradient(90% 35% at 85% 125%, rgba(255,255,255,0.2) 0%, transparent 55%)",
    },
    clipPath: "polygon(0 0, 100% 0, 100% 90%, 80% 96%, 55% 88%, 30% 98%, 0 90%)",
  },
  {
    key: "slash",
    label: "Slash mono",
    hint: "Editorial black with a hard diagonal cut.",
    base: { backgroundImage: "linear-gradient(120deg, #09090b 0%, #27272a 70%, #3f3f46 100%)" },
    pattern: {
      backgroundImage:
        "linear-gradient(115deg, transparent 48%, rgba(250,204,21,0.85) 49%, rgba(250,204,21,0.85) 51%, transparent 52%), radial-gradient(50% 60% at 100% 0%, rgba(255,255,255,0.12) 0%, transparent 60%)",
    },
    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 80%)",
  },
  {
    key: "ribbon",
    label: "Ribbon waves",
    hint: "Flowing curved ribbons like a branded badge.",
    base: { backgroundImage: "linear-gradient(160deg, #eff6ff 0%, #dbeafe 100%)" },
    pattern: {
      backgroundImage:
        "radial-gradient(120% 90% at 10% 0%, #2563eb 0%, transparent 55%), radial-gradient(100% 80% at 95% 100%, #3b82f6 0%, transparent 50%), radial-gradient(80% 60% at 50% 110%, rgba(59,130,246,0.25) 0%, transparent 50%)",
    },
    clipPath: "polygon(0 0, 100% 0, 100% 100%, 72% 94%, 50% 100%, 28% 92%, 0 98%)",
  },
  {
    key: "arches",
    label: "Arches",
    hint: "Overlapping rounded arches.",
    base: { backgroundImage: "linear-gradient(180deg, #fdf4ff 0%, #fae8ff 100%)" },
    pattern: {
      backgroundImage:
        "radial-gradient(ellipse 80% 100% at 20% 100%, rgba(168,85,247,0.35) 0%, transparent 70%), radial-gradient(ellipse 80% 100% at 80% 100%, rgba(236,72,153,0.3) 0%, transparent 70%), radial-gradient(ellipse 60% 80% at 50% 100%, rgba(99,102,241,0.25) 0%, transparent 70%)",
    },
    clipPath: "polygon(0 0, 100% 0, 100% 90%, 85% 100%, 15% 100%, 0 90%)",
  },
  {
    key: "bubbles",
    label: "Bubbles",
    hint: "Scattered translucent circles.",
    base: { backgroundImage: "linear-gradient(160deg, #ecfeff 0%, #cffafe 100%)" },
    pattern: {
      backgroundImage:
        "radial-gradient(circle at 20% 30%, rgba(6,182,212,0.35) 0%, transparent 25%), radial-gradient(circle at 70% 20%, rgba(59,130,246,0.3) 0%, transparent 20%), radial-gradient(circle at 85% 70%, rgba(14,165,233,0.35) 0%, transparent 22%), radial-gradient(circle at 40% 80%, rgba(99,102,241,0.25) 0%, transparent 18%), radial-gradient(circle at 55% 55%, rgba(236,72,153,0.2) 0%, transparent 15%)",
    },
    clipPath: "polygon(0 0, 100% 0, 100% 100%, 92% 95%, 75% 100%, 50% 93%, 25% 100%, 8% 95%, 0 100%)",
  },
  {
    key: "origami",
    label: "Origami",
    hint: "Folded paper angular planes.",
    base: { backgroundImage: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)" },
    pattern: {
      backgroundImage:
        "linear-gradient(135deg, transparent 55%, rgba(217,119,6,0.25) 56%, rgba(217,119,6,0.25) 60%, transparent 61%), linear-gradient(45deg, transparent 30%, rgba(180,83,9,0.2) 31%, rgba(180,83,9,0.2) 35%, transparent 36%), linear-gradient(160deg, rgba(245,158,11,0.15) 0%, transparent 50%)",
    },
    clipPath: "polygon(0 0, 100% 0, 100% 85%, 70% 100%, 0 90%)",
  },
  {
    key: "layers",
    label: "Layered curves",
    hint: "Stacked curved colour bands.",
    base: { backgroundImage: "linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%)" },
    pattern: {
      backgroundImage:
        "radial-gradient(140% 90% at 50% 120%, rgba(34,197,94,0.35) 0%, transparent 55%), radial-gradient(120% 70% at 30% 130%, rgba(21,128,61,0.3) 0%, transparent 50%), radial-gradient(120% 70% at 70% 130%, rgba(16,185,129,0.25) 0%, transparent 50%)",
    },
    clipPath: "polygon(0 0, 100% 0, 100% 92%, 80% 100%, 60% 92%, 40% 100%, 20% 92%, 0 100%)",
  },
  {
    key: "sunflare",
    label: "Sun flare",
    hint: "Bright sunshine glow from the corner.",
    base: { backgroundImage: "linear-gradient(160deg, #fffbeb 0%, #fef3c7 100%)" },
    pattern: {
      backgroundImage:
        "radial-gradient(80% 80% at 15% 15%, rgba(251,191,36,0.7) 0%, rgba(245,158,11,0.35) 30%, transparent 65%), radial-gradient(60% 60% at 25% 25%, rgba(255,255,255,0.8) 0%, transparent 50%)",
    },
    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 88%)",
  },
  {
    key: "spotlight",
    label: "Spotlight",
    hint: "Focused beam of stage light.",
    base: { backgroundImage: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)" },
    pattern: {
      backgroundImage:
        "conic-gradient(from 270deg at 50% 120%, rgba(255,255,255,0.25) 0deg, rgba(255,255,255,0.05) 25deg, transparent 50deg, transparent 310deg, rgba(255,255,255,0.05) 335deg, rgba(255,255,255,0.25) 360deg)",
    },
    clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 92%, 0 100%)",
  },
  {
    key: "lensflare",
    label: "Lens flare",
    hint: "Camera lens light artifacts and orbs.",
    base: { backgroundImage: "linear-gradient(160deg, #0c4a6e 0%, #082f49 100%)" },
    pattern: {
      backgroundImage:
        "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(125,211,252,0.5) 8%, transparent 20%), radial-gradient(circle at 45% 35%, rgba(255,255,255,0.4) 0%, transparent 6%), radial-gradient(circle at 55% 32%, rgba(255,255,255,0.3) 0%, transparent 5%), radial-gradient(circle at 70% 28%, rgba(255,255,255,0.25) 0%, transparent 4%), linear-gradient(120deg, transparent 40%, rgba(125,211,252,0.15) 50%, transparent 60%)",
    },
    clipPath: "polygon(0 0, 100% 0, 100% 90%, 0 100%)",
  },
  {
    key: "halo",
    label: "Halo glow",
    hint: "Soft circular aura behind the header.",
    base: { backgroundImage: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)" },
    pattern: {
      backgroundImage:
        "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.45) 0%, rgba(168,85,247,0.25) 35%, transparent 70%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)",
    },
    clipPath: "polygon(0 0, 100% 0, 100% 100%, 85% 94%, 15% 94%, 0 100%)",
  },
  {
    key: "radiance",
    label: "Radiance",
    hint: "Warm rays emanating outward.",
    base: { backgroundImage: "linear-gradient(180deg, #431407 0%, #7c2d12 100%)" },
    pattern: {
      backgroundImage:
        "repeating-conic-gradient(from 0deg at 50% 100%, rgba(251,146,60,0.25) 0deg 4deg, transparent 4deg 10deg), radial-gradient(80% 60% at 50% 100%, rgba(234,88,12,0.5) 0%, transparent 60%)",
    },
    clipPath: "polygon(0 0, 100% 0, 100% 95%, 50% 100%, 0 95%)",
  },
];

export function headerDesignSpec(key: HeaderDesign | undefined): HeaderDesignSpec | undefined {
  if (!key || key === "none") return undefined;
  return HEADER_DESIGNS.find((d) => d.key === key);
}
