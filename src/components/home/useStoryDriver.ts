import { useEffect, useRef, type RefObject } from "react";
import { useMotionValue, useSpring, useInView, type MotionValue } from "framer-motion";
import { SCROLL_STORY_CONFIG } from "./scrollStoryConfig";

/**
 * Drives the scroll story from two sources:
 *  - the user's scroll position (authoritative while they scroll)
 *  - an autoplay clock that keeps the animation playing when nobody scrolls
 *
 * The clock ping-pongs between 0 and 1 (no hard rewind) and only runs while
 * the section is on screen and the tab is visible, so it costs nothing else.
 */
export function useStoryDriver(
  scrollYProgress: MotionValue<number>,
  sectionRef: RefObject<Element>,
  enabled = true,
) {
  const raw = useMotionValue(0);
  const inView = useInView(sectionRef, { amount: 0.05 });
  const lastScrollAt = useRef(0);
  const dir = useRef(1);

  // Scroll always wins while it's moving.
  useEffect(() => {
    if (!enabled) return;
    return scrollYProgress.on("change", (v) => {
      lastScrollAt.current = performance.now();
      dir.current = 1;
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
        let next = raw.get() + (dir.current * dt) / autoplayDuration;
        if (next >= 1) {
          next = 1;
          dir.current = -1;
        } else if (next <= 0) {
          next = 0;
          dir.current = 1;
        }
        raw.set(next);
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, enabled, raw]);

  return useSpring(raw, SCROLL_STORY_CONFIG.spring);
}
