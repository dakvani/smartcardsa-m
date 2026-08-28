import { useDeferAnimation } from "@/hooks/use-defer-animation";

interface Props {
  url: string;
  type: "image" | "video" | null | undefined;
  speed?: number;
  motionEnabled?: boolean;
  tintClass?: string;
}

export function DeferredProfileMedia({ url, type, speed = 1, motionEnabled = true, tintClass }: Props) {
  const isVideo = type === "video";
  const { ref, active } = useDeferAnimation<HTMLDivElement>(isVideo && motionEnabled);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {isVideo ? (
        active ? (
          <video
            src={url}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            className="h-full w-full object-cover"
            ref={(element) => { if (element) element.playbackRate = speed; }}
            onError={(event) => { event.currentTarget.style.display = "none"; }}
          />
        ) : null
      ) : (
        <img
          src={url}
          alt=""
          decoding="async"
          className="h-full w-full object-cover"
          onError={(event) => { event.currentTarget.style.display = "none"; }}
        />
      )}
      {tintClass && <div className={`absolute inset-0 ${tintClass}`} />}
      <div className="absolute inset-0 bg-black/35" />
    </div>
  );
}