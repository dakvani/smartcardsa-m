import { Suspense, lazy } from "react";
import type { AnimationConfig } from "./animations/types";
import { defaultConfig } from "./animations/types";
import { useDeferAnimation } from "@/hooks/use-defer-animation";

const AnimatedBackground = lazy(() =>
  import("./AnimatedBackground").then((m) => ({ default: m.AnimatedBackground }))
);

interface Props {
  animationType: string | null;
  config?: AnimationConfig;
  className?: string;
}

/**
 * Renders the animated background only when it is worth it: in view, after
 * idle, motion allowed, and scaled down on low-end devices. The animation
 * bundle itself is code-split so public profiles stay fast on mobile.
 */
export function LazyAnimatedBackground({ animationType, config = defaultConfig, className }: Props) {
  const { ref, active, lowPower } = useDeferAnimation<HTMLDivElement>(!!animationType);

  const effective: AnimationConfig = lowPower
    ? { speed: config.speed, intensity: Math.min(config.intensity, 0.6) }
    : config;

  return (
    <div ref={ref} className={className ?? "absolute inset-0 pointer-events-none"} aria-hidden>
      {active && animationType && (
        <Suspense fallback={null}>
          <AnimatedBackground animationType={animationType} config={effective} />
        </Suspense>
      )}
    </div>
  );
}
