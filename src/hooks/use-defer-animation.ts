import { useEffect, useRef, useState } from "react";

/**
 * Decides whether a decorative animation layer should actually render.
 *
 * Heavy animated / 3D backgrounds are only mounted when:
 *  - the element is (near) the viewport,
 *  - the user has not asked for reduced motion,
 *  - the browser is idle (so first paint is never blocked),
 *  - the device is not obviously low-end.
 *
 * Returns a ref to attach to the container plus the decision flags.
 */
export function useDeferAnimation<T extends HTMLElement = HTMLDivElement>(enabled = true) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const [idle, setIdle] = useState(false);

  const reduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const lowPower = (() => {
    if (typeof navigator === "undefined") return false;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const cores = nav.hardwareConcurrency ?? 8;
    const mem = nav.deviceMemory ?? 8;
    return cores <= 4 || mem <= 2;
  })();

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setInView(e.isIntersecting)),
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(() => setIdle(true));
      return () => (window as any).cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(() => setIdle(true), 300);
    return () => window.clearTimeout(t);
  }, [enabled]);

  const active = enabled && inView && idle && !reduced;

  return { ref, active, reduced, lowPower, inView };
}
