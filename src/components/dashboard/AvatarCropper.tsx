/**
 * Circular avatar cropper: drag to move, pinch/slider to zoom, so the face
 * lands exactly inside the circle. Available on every plan.
 */
import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Loader2, RotateCcw, RotateCw } from "lucide-react";

interface Props {
  open: boolean;
  /** Object URL / data URL of the picked image. */
  src: string | null;
  onCancel: () => void;
  onCropped: (blob: Blob) => void | Promise<void>;
  /** Output edge size in px. */
  size?: number;
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Render the selected crop area (with rotation) into a square canvas. */
export async function cropImageToBlob(src: string, area: Area, rotation = 0, size = 512): Promise<Blob> {
  const image = await loadImage(src);
  const rad = (rotation * Math.PI) / 180;

  // Rotate the source onto an intermediate canvas first.
  const box = Math.ceil(
    Math.abs(image.width * Math.cos(rad)) + Math.abs(image.height * Math.sin(rad))
  );
  const boxH = Math.ceil(
    Math.abs(image.width * Math.sin(rad)) + Math.abs(image.height * Math.cos(rad))
  );
  const rotated = document.createElement("canvas");
  rotated.width = box;
  rotated.height = boxH;
  const rctx = rotated.getContext("2d");
  if (!rctx) throw new Error("Canvas not supported");
  rctx.translate(box / 2, boxH / 2);
  rctx.rotate(rad);
  rctx.drawImage(image, -image.width / 2, -image.height / 2);

  const out = document.createElement("canvas");
  out.width = size;
  out.height = size;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(rotated, area.x, area.y, area.width, area.height, 0, 0, size, size);

  return new Promise((resolve, reject) => {
    out.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not export image"))), "image/jpeg", 0.92);
  });
}

export function AvatarCropper({ open, src, onCancel, onCropped, size = 512 }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [area, setArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), []);

  const reset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleSave = async () => {
    if (!src || !area) return;
    setSaving(true);
    try {
      const blob = await cropImageToBlob(src, area, rotation, size);
      await onCropped(blob);
      reset();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onCancel(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Position your photo</DialogTitle>
          <DialogDescription>Drag to move, zoom and rotate until your face sits inside the circle.</DialogDescription>
        </DialogHeader>

        <div className="relative h-64 w-full overflow-hidden rounded-xl bg-muted">
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              showGrid={false}
              restrictPosition
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
          )}
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Zoom</Label>
            <Slider value={[zoom]} min={1} max={4} step={0.01} onValueChange={([v]) => setZoom(v)} aria-label="Zoom" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs flex-1">Rotate</Label>
            <Button type="button" size="icon" variant="outline" className="h-8 w-8" aria-label="Rotate left" onClick={() => setRotation((r) => (r - 90 + 360) % 360)}>
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" size="icon" variant="outline" className="h-8 w-8" aria-label="Rotate right" onClick={() => setRotation((r) => (r + 90) % 360)}>
              <RotateCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="ghost" onClick={() => { reset(); onCancel(); }}>Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={saving || !area}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
