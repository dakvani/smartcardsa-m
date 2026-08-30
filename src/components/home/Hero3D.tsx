import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Nfc, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { smoothScrollTo } from "./scrollStoryConfig";

/**
 * Hero3D — the opening landing screen.
 *
 * A pure CSS-3D scene (perspective + preserve-3d + translateZ layers) driven by
 * framer-motion springs. No WebGL, no canvas, no extra bundle weight: every
 * moving element is a compositor-friendly transform/opacity, so it stays at
 * 60fps from low-end Android up to desktop.
 *
 * Motion sources, in order of preference:
 *   desktop  → pointer parallax
 *   mobile   → slow autonomous orbit (pointer events never fire)
 *   reduced  → fully static, no animation loop at all
 */
export function Hero3D() {
  const prefersReduced = useReducedMotion();
  const sceneRef = useRef<HTMLDivElement>(null);
  const [interactive, setInteractive] = useState(false);

  // Only enable pointer tilt for real pointing devices (skips phones/tablets).
  useEffect(() => {
    if (prefersReduced) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => setInteractive(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [prefersReduced]);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 120, damping: 20, mass: 0.6 };
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-16, 16]), spring);
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [12, -12]), spring);
  const shift = useSpring(useTransform(px, [-0.5, 0.5], [-18, 18]), spring);

  useEffect(() => {
    if (!interactive) return;
    const el = sceneRef.current;
    if (!el) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = el.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      });
    };
    const onLeave = () => {
      px.set(0);
      py.set(0);
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [interactive, px, py]);

  // Mobile / non-pointer devices get a gentle autonomous orbit instead.
  const autoOrbit =
    !prefersReduced && !interactive
      ? {
          rotateY: [-10, 10, -10],
          rotateX: [6, -6, 6],
          transition: { duration: 14, repeat: Infinity, ease: "easeInOut" as const },
        }
      : undefined;

  return (
    <section
      className="relative isolate overflow-hidden text-white"
      aria-label="SmartCard — tap to share everything you are"
      style={{
        backgroundImage:
          "radial-gradient(120% 90% at 50% -10%, #1b1b4b 0%, #0a0a1a 55%, #05060f 100%)",
      }}
    >
      {/* Ambient depth — static blurs, no animation cost */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#4f46e5]/25 blur-[140px] sm:h-[640px] sm:w-[640px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[320px] w-[320px] rounded-full bg-[#7c3aed]/20 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(70%_60%_at_50%_40%,black,transparent)]" />
      </div>

      <div className="container mx-auto grid min-h-[92svh] grid-cols-1 items-center gap-10 px-4 pb-16 pt-28 lg:grid-cols-2 lg:gap-6 lg:pb-24 lg:pt-32">
        {/* Copy */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 max-w-xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#4f46e5]/40 bg-[#4f46e5]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a5b4fc]">
            <Sparkles className="h-3.5 w-3.5" />
            NFC cards + live bio profile
          </div>
          <h1 className="font-display text-4xl font-bold leading-[1.03] tracking-tight sm:text-6xl lg:text-7xl">
            Tap once.
            <br />
            <span className="bg-gradient-to-r from-[#818cf8] via-[#a78bfa] to-[#e0e7ff] bg-clip-text text-transparent">
              Share everything.
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/60 sm:text-lg">
            A programmable SmartCard paired with a profile you can rewrite any
            time. No app to install, no printing runs, no dead links.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 border-0 bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] px-7 text-white shadow-[0_10px_40px_-10px_#4f46e5] hover:opacity-95"
            >
              <Link to="/nfc-products">
                Shop SmartCards <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-white/20 bg-white/5 px-7 text-white backdrop-blur hover:bg-white/10 hover:text-white"
            >
              <Link to="/signup">Create your profile</Link>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => smoothScrollTo("how-it-works")}
            className="mt-8 text-[11px] uppercase tracking-[0.3em] text-white/40 transition-colors hover:text-white/80"
          >
            See how it works
          </button>
        </motion.div>

        {/* 3D scene */}
        <div
          ref={sceneRef}
          className="relative mx-auto flex w-full max-w-[520px] items-center justify-center py-6 lg:py-0"
          style={{ perspective: 1100 }}
        >
          <motion.div
            style={
              interactive
                ? { rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }
                : { transformStyle: "preserve-3d" }
            }
            animate={autoOrbit}
            className="relative aspect-[1.6/1] w-[86%] will-change-transform"
          >
            {/* Depth halo behind the card */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-[26px] bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] opacity-40 blur-2xl"
              style={{ transform: "translateZ(-80px) scale(1.05)" }}
            />

            {/* Back plate — parallax depth */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-[26px] border border-white/10 bg-white/[0.03]"
              style={{ transform: "translateZ(-40px) scale(1.08)" }}
            />

            {/* The card */}
            <div
              className="absolute inset-0 overflow-hidden rounded-[26px] border border-white/15 bg-[linear-gradient(135deg,#1e1b4b_0%,#312e81_45%,#4c1d95_100%)] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]"
              style={{ transform: "translateZ(0px)" }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.16)_48%,transparent_60%)]" />
              <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
                <div className="flex items-start justify-between">
                  <span className="font-display text-lg font-semibold tracking-tight">
                    SmartCard
                  </span>
                  <Nfc className="h-5 w-5 text-white/70" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">
                    @yourname
                  </div>
                  <div className="font-mono text-sm text-white/85">
                    smartcardsa.shop/u/you
                  </div>
                </div>
              </div>
              {/* Chip */}
              <div className="absolute right-5 top-1/2 grid h-8 w-10 -translate-y-1/2 grid-cols-3 gap-px rounded-[4px] border border-amber-700/50 bg-amber-200/85 p-[3px]">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-[1px] bg-amber-700/60" />
                ))}
              </div>
            </div>

            {/* Floating phone — sits in front on the Z axis */}
            <motion.div
              style={{ transform: "translateZ(90px)", x: shift }}
              className="absolute -bottom-16 -left-6 w-[104px] rounded-[18px] border border-white/15 bg-[#0d0d22]/90 p-1.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-sm sm:w-[124px]"
            >
              <div className="flex aspect-[9/18] flex-col gap-1.5 rounded-[13px] bg-gradient-to-b from-[#4f46e5]/35 via-[#0d0d22] to-[#7c3aed]/25 p-2.5">
                <div className="mx-auto mt-1 h-8 w-8 rounded-full bg-white/25" />
                <div className="mx-auto h-1.5 w-3/5 rounded bg-white/35" />
                <div className="mx-auto h-1 w-2/5 rounded bg-white/20" />
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-3.5 rounded bg-white/10" />
                ))}
              </div>
            </motion.div>

            {/* NFC ripples — CSS-only, paused for reduced motion */}
            {!prefersReduced && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                style={{ transform: "translateZ(40px)" }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="absolute h-24 w-24 rounded-full border border-[#a5b4fc]/40"
                    animate={{ scale: [1, 2.6], opacity: [0.5, 0] }}
                    transition={{
                      duration: 3.2,
                      delay: i * 1.05,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
