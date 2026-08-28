import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CardStyle } from "@/lib/template-card-style";
import type { ButtonShape, FontFamily, TemplateLayout } from "@/lib/smartlink-templates";

interface Props {
  value?: CardStyle;
  onChange: (next: CardStyle) => void;
}

type DetailKey = "stats" | "facts";

export function TemplateDesignEditor({ value = {}, onChange }: Props) {
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
              <SelectItem value="sans">Sans</SelectItem>
              <SelectItem value="serif">Serif</SelectItem>
              <SelectItem value="mono">Mono</SelectItem>
              <SelectItem value="display">Display</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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