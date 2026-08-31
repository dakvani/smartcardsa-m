import { useEffect, useRef, type RefObject } from "react";
import { useMotionValue, useSpring, useInView, type MotionValue } from "framer-motion";
import { SCROLL_STORY_CONFIG } from "./scrollStoryConfig";

/**
 * Drives the scroll story from two sources:
 *  - the user's scroll position (authoritative while they scroll)
 *  - an autoplay clock that keeps the animation looping when nobody scrolls
 *
 * The clock only runs while the section is on screen and the tab is visible,
 * so it costs nothing elsewhere on the page.
 */
export function useStoryDriver(
  scrollYProgress: MotionValue<number>,
  sectionRef: RefObject<Element>,
  enabled = true,
) {
  const raw = useMotionValue(0);
  const inView = useInView(sectionRef, { amount: 0.05 });
  const lastScrollAt = useRef(0);
  const autoOffset = useRef(0);

  // Scroll always wins while it's moving.
  useEffect(() => {
    if (!enabled) return;
    return scrollYProgress.on("change", (v) => {
      lastScrollAt.current = performance.now();
      autoOffset.current = 0;
      raw.set(v);
    });
  }, [scrollYProgress, raw, enabled]);

  // Autoplay clock.
  useEffect(() => {
    if (!enabled || !inView) return;
    let frame = 0;
    let prev = performance.now();
    const { autoplayDuration, autoplayIdleMs } = SCROLL_STORY_CONFIG;

    const tick = (now: number) => {
      const dt = Math.min(now - prev, 64);
      prev = now;
      if (
        document.visibilityState === "visible" &&
        now - lastScrollAt.current > autoplayIdleMs
      ) {
        const base = scrollYProgress.get();
        autoOffset.current = (autoOffset.current + dt / autoplayDuration) % 1;
        const next = (base + autoOffset.current) % 1;
        raw.set(next);
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, enabled, raw, scrollYProgress]);

  return useSpring(raw, SCROLL_STORY_CONFIG.spring);
}
