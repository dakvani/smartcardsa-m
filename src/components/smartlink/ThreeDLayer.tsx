import { motion } from "framer-motion";
import type { ThreeDVariant } from "@/lib/smartlink-templates";
import { useDeferAnimation } from "@/hooks/use-defer-animation";

interface ThreeDLayerProps {
  variant: ThreeDVariant;
  speed?: number;
}

/**
 * Decorative CSS-3D object floating over a template background.
 * Deferred (in-view + idle + motion allowed) so it never costs anything on
 * first paint or on low-end devices.
 */
export function ThreeDLayer({ variant, speed = 1 }: ThreeDLayerProps) {
  const { ref, active } = useDeferAnimation<HTMLDivElement>(variant !== "tilt");
  const d = (base: number) => base / Math.max(0.25, speed);

  return (
    <div
      ref={ref}
      aria-hidden
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ perspective: 600 }}
    >
      {active && variant === "cube" && <Cube duration={d(9)} />}
      {active && variant === "prism" && <Prism duration={d(11)} />}
      {active && variant === "orbit" && <Orbit duration={d(10)} />}
      {active && variant === "rings" && <Rings duration={d(8)} />}
      {active && variant === "carousel" && <Carousel duration={d(14)} />}
    </div>
  );
}

const faceClass =
  "absolute inset-0 border border-white/40 bg-white/10 backdrop-blur-[1px] rounded-sm";

function Cube({ duration }: { duration: number }) {
  const s = 56;
  const half = s / 2;
  const faces = [
    `rotateY(0deg) translateZ(${half}px)`,
    `rotateY(90deg) translateZ(${half}px)`,
    `rotateY(180deg) translateZ(${half}px)`,
    `rotateY(-90deg) translateZ(${half}px)`,
    `rotateX(90deg) translateZ(${half}px)`,
    `rotateX(-90deg) translateZ(${half}px)`,
  ];
  return (
    <motion.div
      className="absolute right-5 top-16"
      style={{ width: s, height: s, transformStyle: "preserve-3d" }}
      animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {faces.map((t, i) => (
        <div key={i} className={faceClass} style={{ transform: t }} />
      ))}
    </motion.div>
  );
}

function Prism({ duration }: { duration: number }) {
  return (
    <motion.div
      className="absolute left-5 bottom-24"
      style={{ width: 64, height: 64, transformStyle: "preserve-3d" }}
      animate={{ rotateY: [0, 360], y: [0, -10, 0] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {[0, 120, 240].map((deg) => (
        <div
          key={deg}
          className="absolute inset-0 border border-white/35 bg-gradient-to-br from-white/25 to-transparent"
          style={{
            transform: `rotateY(${deg}deg) translateZ(28px)`,
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
          }}
        />
      ))}
    </motion.div>
  );
}

function Orbit({ duration }: { duration: number }) {
  return (
    <motion.div
      className="absolute left-1/2 top-20 -translate-x-1/2"
      style={{ width: 120, height: 120, transformStyle: "preserve-3d" }}
      animate={{ rotateZ: [0, 360] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      <div
        className="absolute inset-0 rounded-full border border-white/30"
        style={{ transform: "rotateX(72deg)" }}
      />
      {[0, 120, 240].map((deg) => (
        <div
          key={deg}
          className="absolute left-1/2 top-1/2 w-2.5 h-2.5 rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.7)]"
          style={{
            transform: `rotateX(72deg) rotate(${deg}deg) translateX(58px)`,
          }}
        />
      ))}
    </motion.div>
  );
}

function Rings({ duration }: { duration: number }) {
  return (
    <div className="absolute right-6 bottom-28" style={{ transformStyle: "preserve-3d" }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2 border-white/35"
          style={{
            width: 46 + i * 22,
            height: 46 + i * 22,
            left: -(23 + i * 11),
            top: -(23 + i * 11),
          }}
          animate={{ rotateX: [60, 300], rotateY: [0, 360] }}
          transition={{ duration: duration + i * 2, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

function Carousel({ duration }: { duration: number }) {
  const panels = [0, 60, 120, 180, 240, 300];
  return (
    <motion.div
      className="absolute left-1/2 bottom-24 -translate-x-1/2"
      style={{ width: 70, height: 46, transformStyle: "preserve-3d" }}
      animate={{ rotateY: [0, 360] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {panels.map((deg) => (
        <div
          key={deg}
          className="absolute inset-0 rounded-md border border-white/30 bg-white/10 backdrop-blur-[1px]"
          style={{ transform: `rotateY(${deg}deg) translateZ(62px)` }}
        />
      ))}
    </motion.div>
  );
}
