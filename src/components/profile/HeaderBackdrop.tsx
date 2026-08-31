/**
 * Pro templates can put a design or image behind the *header block only* — the
 * avatar, name, bio and socials — leaving the rest of the page on the template
 * theme. When `headerBleed` is on, the banner runs full width to the top and
 * both edges of the profile, rounded only at the bottom.
 */
import type { ReactNode } from "react";
import type { CardStyle } from "@/lib/template-card-style";
import { headerDesignSpec } from "@/lib/header-designs";

interface Props {
  style: CardStyle;
  children: ReactNode;
  /** Tighter padding/rounding for the builder mini preview. */
  scale?: "full" | "mini";
}

export function HeaderBackdrop({ style, children, scale = "full" }: Props) {
  const design = headerDesignSpec(style.headerDesign);
  if (!style.headerBg && !design) return <>{children}</>;

  const mini = scale === "mini";
  const overlay = Math.min(90, Math.max(0, style.headerOverlay ?? 35)) / 100;
  const bleed = style.headerBleed !== false;

  const shape = bleed
    ? mini
      ? "-mx-4 -mt-10 px-4 pt-12 pb-4 rounded-b-3xl"
      : "-mx-4 -mt-8 sm:-mt-12 px-4 pt-10 sm:pt-14 pb-5 sm:pb-6 rounded-b-[2rem]"
    : mini
    ? "rounded-2xl p-3"
    : "rounded-3xl p-4 sm:p-5";

  return (
    <div
      className={`relative z-10 overflow-hidden ${shape} ${
        bleed ? "mb-4 shadow-xl" : "ring-1 ring-primary-foreground/15 shadow-lg"
      }`}
    >
      {design && (
        <>
          <div className="absolute inset-0" style={design.base} aria-hidden="true" />
          {design.pattern && (
            <div className="absolute inset-0" style={design.pattern} aria-hidden="true" />
          )}
        </>
      )}
      {style.headerBg && (
        <img
          src={style.headerBg}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {(style.headerBg || overlay > 0) && (
        <div className="absolute inset-0 bg-black" style={{ opacity: overlay }} aria-hidden="true" />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
