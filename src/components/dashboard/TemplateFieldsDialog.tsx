import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { FIELD_DEFS, type TemplateFieldKey, type TemplateFieldValues } from "@/lib/template-fields";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateName: string;
  /** All fields the template needs (prefilled ones included, so they can be edited). */
  fields: TemplateFieldKey[];
  /** Fields we could not prefill — highlighted as required. */
  missing: TemplateFieldKey[];
  initialValues: TemplateFieldValues;
  submitting?: boolean;
  onConfirm: (values: TemplateFieldValues) => void;
}

/**
 * Shown when a template's action buttons (call / WhatsApp / email / maps /
 * booking / shop) need data we could not infer from the user's profile.
 */
export function TemplateFieldsDialog({
  open,
  onOpenChange,
  templateName,
  fields,
  missing,
  initialValues,
  submitting = false,
  onConfirm,
}: Props) {
  const [values, setValues] = React.useState<TemplateFieldValues>(initialValues);

  React.useEffect(() => {
    if (open) setValues(initialValues);
  }, [open, initialValues]);

  const incomplete = missing.filter((k) => !(values[k] || "").trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" />
            Finish setting up “{templateName}”
          </DialogTitle>
          <DialogDescription>
            This design includes action buttons. Fill in your details so they work — you can change
            all of them later in the builder.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {fields.map((key) => {
            const def = FIELD_DEFS[key];
            const required = missing.includes(key);
            return (
              <div key={key}>
                <label className="block text-sm font-medium mb-1" htmlFor={`tf-${key}`}>
                  {def.label}
                  {required && <span className="text-destructive"> *</span>}
                </label>
                <input
                  id={`tf-${key}`}
                  value={values[key] ?? ""}
                  inputMode={def.inputMode}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                  placeholder={def.placeholder}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                />
                <p className="text-[11px] text-muted-foreground mt-1">{def.hint}</p>
              </div>
            );
          })}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(values)} disabled={submitting || incomplete.length > 0}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Apply design
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
