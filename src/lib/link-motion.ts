/**
 * Per-link movement styles ("motion") that users pick in the builder and that
 * play on the public profile. Stored in `links.motion`.
 *
 * `slide-action` is special: instead of animating the button it renders a
 * slide-to-confirm control (slide right to call / message / open).
 */
import type { Transition, TargetAndTransition } from "framer-motion";

export const LINK_MOTIONS = [
  { value: "none", label: "No movement" },
  { value: "pulse", label: "Pulse" },
  { value: "bounce", label: "Bounce" },
  { value: "slide-right", label: "Slide right" },
  { value: "slide-left", label: "Slide left" },
  { value: "slide-up", label: "Slide up" },
  { value: "shake", label: "Shake" },
  { value: "wiggle", label: "Wiggle" },
  { value: "float", label: "Float" },
  { value: "glow", label: "Glow" },
  { value: "pop", label: "Pop" },
  { value: "tilt", label: "Tilt" },
  { value: "slide-action", label: "Slide to action" },
] as const;

export type LinkMotion = (typeof LINK_MOTIONS)[number]["value"];

export const isLinkMotion = (v: unknown): v is LinkMotion =>
  typeof v === "string" && LINK_MOTIONS.some((m) => m.value === v);

export const normalizeMotion = (v: unknown): LinkMotion => (isLinkMotion(v) ? v : "none");

export const motionLabel = (v: unknown): string =>
  LINK_MOTIONS.find((m) => m.value === normalizeMotion(v))?.label ?? "No movement";

const loop = (duration: number, delay = 0): Transition => ({
  duration,
  repeat: Infinity,
  repeatType: "loop",
  ease: "easeInOut",
  delay,
});

/**
 * Framer-motion props for a link button's idle movement.
 * Returns `null` when the link should not move (none / slide-action / reduced motion).
 */
export function linkMotionProps(
  motion: unknown,
  reduced = false
): { animate: TargetAndTransition; transition: Transition } | null {
  const m = normalizeMotion(motion);
  if (reduced || m === "none" || m === "slide-action") return null;

  switch (m) {
    case "pulse":
      return { animate: { scale: [1, 1.035, 1] }, transition: loop(1.8) };
    case "bounce":
      return { animate: { y: [0, -6, 0] }, transition: loop(1.4) };
    case "slide-right":
      return { animate: { x: [0, 8, 0] }, transition: loop(1.6) };
    case "slide-left":
      return { animate: { x: [0, -8, 0] }, transition: loop(1.6) };
    case "slide-up":
      return { animate: { y: [0, -10, 0] }, transition: loop(2) };
    case "shake":
      return { animate: { x: [0, -4, 4, -3, 3, 0] }, transition: loop(0.9) };
    case "wiggle":
      return { animate: { rotate: [0, -2.5, 2.5, -1.5, 0] }, transition: loop(1.6) };
    case "float":
      return { animate: { y: [0, -5, 0], scale: [1, 1.01, 1] }, transition: loop(3) };
    case "glow":
      return {
        animate: {
          boxShadow: [
            "0 0 0px rgba(255,255,255,0.0)",
            "0 0 22px rgba(255,255,255,0.35)",
            "0 0 0px rgba(255,255,255,0.0)",
          ],
        },
        transition: loop(2.2),
      };
    case "pop":
      return { animate: { scale: [1, 1.06, 0.98, 1] }, transition: loop(2.4) };
    case "tilt":
      return { animate: { rotateZ: [0, 1.5, -1.5, 0] }, transition: loop(2.6) };
    default:
      return null;
  }
}

/** Verb shown on a slide-to-action control, based on the link's URL. */
export function slideActionLabel(url: string, title?: string): string {
  const u = (url || "").toLowerCase();
  if (u.startsWith("tel:")) return "Slide to call";
  if (u.startsWith("mailto:")) return "Slide to email";
  if (u.includes("wa.me") || u.includes("whatsapp")) return "Slide to chat";
  if (u.includes("maps.")) return "Slide for directions";
  return title ? `Slide to open` : "Slide to open";
}
