import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CardStyle } from "@/lib/template-card-style";
import { FONT_FAMILIES, FONT_LABELS, fontClassFor, type ButtonShape, type FontFamily, type TemplateLayout } from "@/lib/smartlink-templates";
import { LINK_MOTIONS } from "@/lib/link-motion";
import { LINK_SHADOWS, parseLinkStyle, type LinkShadow, type LinkStyle } from "@/lib/link-style";

export interface DesignButton {
  id: string;
  title: string;
  url: string;
  /** Movement style for this button (links.motion). */
  motion?: string | null;
  /** Per-button colours / shadow (links.style). */
  style?: unknown;
}

interface Props {
  value?: CardStyle;
  onChange: (next: CardStyle) => void;
  /** Profile buttons (links), managed inline alongside the element design. */
  buttons?: DesignButton[];
  onAddButton?: () => void;
  onUpdateButton?: (id: string, patch: { title?: string; url?: string; motion?: string | null; style?: LinkStyle }) => void;
  onDeleteButton?: (id: string) => void;
  onMoveButton?: (id: string, direction: -1 | 1) => void;
}


type DetailKey = "stats" | "facts";

export function TemplateDesignEditor({
  value = {},
  onChange,
  buttons,
  onAddButton,
  onUpdateButton,
  onDeleteButton,
  onMoveButton,
}: Props) {
  const update = (patch: Partial<CardStyle>) => onChange({ ...value, ...patch });
  const layout = value.layout ?? "classic";
  const detailKey: DetailKey | null = layout === "social" ? "stats" : layout === "biodata" ? "facts" : null;
  const details = detailKey ? value[detailKey] ?? [] : [];


  const updateDetail = (index: number, patch: { label?: string; value?: string }) => {
    if (!detailKey) return;
    update({ [detailKey]: details.map((item, i) => i === index ? { ...item, ...patch } : item) });
  };
  const moveDetail = (index: number, direction: -1 | 1) => {
    if (!detailKey) return;
    const target = index + direction;
    if (target < 0 || target >= details.length) return;
    const next = [...details];
    [next[index], next[target]] = [next[target], next[index]];
    update({ [detailKey]: next });
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card/50 p-3">
      <div>
        <h4 className="text-sm font-semibold">Template element design</h4>
        <p className="text-[11px] text-muted-foreground">These settings apply to the editor preview and public page.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Layout</Label>
          <Select value={layout} onValueChange={(v) => update({ layout: v as TemplateLayout })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="classic">Classic links</SelectItem>
              <SelectItem value="social">Social profile</SelectItem>
              <SelectItem value="biodata">Biodata</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Button shape</Label>
          <Select value={value.buttonShape ?? "pill"} onValueChange={(v) => update({ buttonShape: v as ButtonShape })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pill">Pill</SelectItem>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="shadow-hard">Hard shadow</SelectItem>
              <SelectItem value="torn">Torn edge</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Typography</Label>
          <Select value={value.font ?? "sans"} onValueChange={(v) => update({ font: v as FontFamily })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((f) => (
                <SelectItem key={f} value={f}>
                  <span className={fontClassFor(f)}>{FONT_LABELS[f]}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Button style</Label>
          <Select value={value.buttonBg ?? "bg-white text-neutral-900"} onValueChange={(buttonBg) => update({ buttonBg })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bg-white text-neutral-900">Light solid</SelectItem>
              <SelectItem value="bg-neutral-900 text-white">Dark solid</SelectItem>
              <SelectItem value="bg-white/20 text-white backdrop-blur border border-white/40">Glass</SelectItem>
              <SelectItem value="bg-transparent text-white border border-white/70">Light outline</SelectItem>
              <SelectItem value="bg-transparent text-emerald-200 border border-emerald-300/60">Accent outline</SelectItem>
              <SelectItem value="bg-amber-100 text-neutral-900">Warm</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">3D decoration</Label>
          <Select
            value={value.threeD ? value.threeDVariant ?? "tilt" : "none"}
            onValueChange={(variant) => update({ threeD: variant !== "none", threeDVariant: variant === "none" ? undefined : variant as CardStyle["threeDVariant"] })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="tilt">Tilt</SelectItem>
              <SelectItem value="cube">Cube</SelectItem>
              <SelectItem value="orbit">Orbit</SelectItem>
              <SelectItem value="prism">Prism</SelectItem>
              <SelectItem value="rings">Rings</SelectItem>
              <SelectItem value="carousel">Carousel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {buttons && (
        <div className="space-y-2 border-t border-border/60 pt-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <Label className="text-xs">Buttons</Label>
              <p className="text-[11px] text-muted-foreground">Add, rename, reorder or remove the template buttons.</p>
            </div>
            {onAddButton && (
              <Button type="button" size="sm" variant="outline" className="h-7 text-[11px]" onClick={onAddButton}>
                <Plus className="h-3 w-3" /> Add
              </Button>
            )}
          </div>
          {buttons.length === 0 && (
            <p className="text-[11px] text-muted-foreground">No buttons yet — add your first one.</p>
          )}
          {buttons.map((b, index) => (
            <ButtonRow
              key={b.id}
              button={b}
              index={index}
              total={buttons.length}
              onUpdate={onUpdateButton}
              onDelete={onDeleteButton}
              onMove={onMoveButton}
            />
          ))}

        </div>
      )}


      {detailKey && (
        <div className="space-y-2 border-t border-border/60 pt-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs">{detailKey === "stats" ? "Profile stats" : "Biodata rows"}</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-[11px]"
              onClick={() => update({ [detailKey]: [...details, { label: "Label", value: "Value" }] })}
            >
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
          {details.map((item, index) => (
            <div key={`${detailKey}-${index}`} className="grid grid-cols-[1fr_1fr_auto] items-center gap-1.5">
              <Input className="h-8 text-xs" value={item.label} onChange={(e) => updateDetail(index, { label: e.target.value })} aria-label={`${detailKey} label ${index + 1}`} />
              <Input className="h-8 text-xs" value={item.value} onChange={(e) => updateDetail(index, { value: e.target.value })} aria-label={`${detailKey} value ${index + 1}`} />
              <div className="flex">
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveDetail(index, -1)} disabled={index === 0} aria-label="Move up"><ArrowUp className="h-3 w-3" /></Button>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => moveDetail(index, 1)} disabled={index === details.length - 1} aria-label="Move down"><ArrowDown className="h-3 w-3" /></Button>
                <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => update({ [detailKey]: details.filter((_, i) => i !== index) })} aria-label="Delete row"><Trash2 className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
/**
 * One editable button row: label + URL inline, with an expandable panel for
 * this button's own animation and colours (text, button, border, shadow).
 */
function ButtonRow({
  button,
  index,
  total,
  onUpdate,
  onDelete,
  onMove,
}: {
  button: DesignButton;
  index: number;
  total: number;
  onUpdate?: (id: string, patch: { title?: string; url?: string; motion?: string | null; style?: LinkStyle }) => void;
  onDelete?: (id: string) => void;
  onMove?: (id: string, direction: -1 | 1) => void;
}) {
  const [open, setOpen] = useState(false);
  const style = parseLinkStyle(button.style);
  const patchStyle = (patch: Partial<LinkStyle>) => onUpdate?.(button.id, { style: { ...style, ...patch } });

  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-1.5 space-y-1.5">
      <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-1.5">
        <Input
          className="h-8 text-xs"
          value={button.title}
          placeholder="Label"
          aria-label={`Button label ${index + 1}`}
          onChange={(e) => onUpdate?.(button.id, { title: e.target.value })}
        />
        <Input
          className="h-8 text-xs"
          value={button.url}
          placeholder="https://…"
          aria-label={`Button URL ${index + 1}`}
          onChange={(e) => onUpdate?.(button.id, { url: e.target.value })}
        />
        <div className="flex">
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7" disabled={index === 0} onClick={() => onMove?.(button.id, -1)} aria-label="Move button up"><ArrowUp className="h-3 w-3" /></Button>
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7" disabled={index === total - 1} onClick={() => onMove?.(button.id, 1)} aria-label="Move button down"><ArrowDown className="h-3 w-3" /></Button>
          <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDelete?.(button.id)} aria-label="Delete button"><Trash2 className="h-3 w-3" /></Button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-md px-1 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Animation &amp; colors for this button</span>
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <div className="space-y-2 rounded-md bg-secondary/40 p-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-[11px]">Animation</Label>
              <Select
                value={button.motion ?? "none"}
                onValueChange={(motion) => onUpdate?.(button.id, { motion })}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LINK_MOTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Shadow</Label>
              <Select
                value={style.shadow ?? "none"}
                onValueChange={(shadow) => patchStyle({ shadow: shadow as LinkShadow })}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LINK_SHADOWS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <ColorField label="Text" value={style.text} fallback="#ffffff" onChange={(text) => patchStyle({ text })} />
            <ColorField label="Button" value={style.bg} fallback="#111827" onChange={(bg) => patchStyle({ bg })} />
            <ColorField label="Border" value={style.border} fallback="#ffffff" onChange={(border) => patchStyle({ border })} />
            <ColorField label="Shadow" value={style.shadowColor} fallback="#000000" onChange={(shadowColor) => patchStyle({ shadowColor })} />
          </div>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 text-[11px]"
            onClick={() => onUpdate?.(button.id, { style: {} })}
          >
            Reset to template colors
          </Button>
        </div>
      )}
    </div>
  );
}

/** Small colour swatch + clear control used by the per-button style panel. */
function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value?: string;
  fallback: string;
  onChange: (value?: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px]">{label}</Label>
      <div className="flex items-center gap-1">
        <input
          type="color"
          aria-label={`${label} color`}
          value={value || fallback}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-input bg-background"
        />
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="flex-1 truncate rounded-md border border-input px-1.5 py-1 text-[10px] text-muted-foreground hover:text-foreground"
        >
          {value ? "Clear" : "Auto"}
        </button>
      </div>
    </div>
  );
}
