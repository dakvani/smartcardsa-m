import { QRCodeSVG } from "qrcode.react";
import { ScanLine } from "lucide-react";

interface DesignedQrCodeProps {
  value: string;
  /** Accent color (hex) used for the QR modules and frame gradient. */
  accent?: string | null;
  /** Image shown in the QR center (usually the profile avatar). */
  logoUrl?: string | null;
  size?: number;
  /** Compact hides the caption pill for tight footers. */
  compact?: boolean;
}

const FALLBACK_LOGO = "/favicon.png";

/**
 * A designed QR code: gradient frame, accent-colored modules, a center
 * logo, soft glow and a "scan me" pill — replaces the plain black/white QR.
 */
export function DesignedQrCode({
  value,
  accent,
  logoUrl,
  size = 120,
  compact = false,
}: DesignedQrCodeProps) {
  const fg = accent || "#0F172A";
  const logoSize = Math.round(size * 0.24);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative rounded-2xl p-[2px] shadow-[0_8px_30px_-8px_rgba(0,0,0,0.45)]"
        style={{
          background: `linear-gradient(135deg, ${fg}, ${fg}55 45%, ${fg})`,
        }}
      >
        {/* corner ticks */}
        <span className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full" style={{ background: fg }} aria-hidden="true" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full" style={{ background: fg }} aria-hidden="true" />
        <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full" style={{ background: fg }} aria-hidden="true" />
        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full" style={{ background: fg }} aria-hidden="true" />

        <div className="rounded-[14px] bg-white p-2.5">
          <QRCodeSVG
            value={value}
            size={size}
            level="H"
            fgColor={fg}
            bgColor="#FFFFFF"
            imageSettings={{
              src: logoUrl || FALLBACK_LOGO,
              width: logoSize,
              height: logoSize,
              excavate: true,
            }}
          />
        </div>
      </div>

      {!compact && (
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm"
          style={{ background: `linear-gradient(135deg, ${fg}, ${fg}CC)` }}
        >
          <ScanLine className="w-3 h-3" />
          Scan me
        </span>
      )}
    </div>
  );
}
