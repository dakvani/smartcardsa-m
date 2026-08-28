import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Rocket, Eye, Pencil } from "lucide-react";
import { TemplatePhoneCard } from "@/components/smartlink/TemplatePhoneCard";
import type { TemplateProfile } from "@/lib/smartlink-templates";

interface SmartlinkPublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: TemplateProfile | null;
  /** Live values from the user's profile, previewed on top of the template. */
  overrides?: { name?: string; bio?: string; username?: string };
  publishing?: boolean;
  confirmLabel?: string;
  /** How many links the user already has — drives the "keep my links" option. */
  existingLinkCount?: number;
  onConfirm: (keepExistingLinks: boolean) => void;
  /**
   * Load the template and all of its elements (links, socials, avatar) into
   * the editor so they can be edited, deleted or added to before publishing.
   */
  onKeepEditing?: (keepExistingLinks: boolean) => void;
}

/**
 * Live preview step shown before a SmartLink template goes live, so the user
 * can confirm the public appearance of their page before publishing it.
 */
export function SmartlinkPublishDialog({
  open,
  onOpenChange,
  template,
  overrides,
  publishing = false,
  confirmLabel = "Publish live",
  existingLinkCount = 0,
  onConfirm,
  onKeepEditing,
}: SmartlinkPublishDialogProps) {
  const [keepLinks, setKeepLinks] = useState(true);

  // Default to keeping links whenever the dialog re-opens for a template.
  useEffect(() => {
    if (open) setKeepLinks(true);
  }, [open, template?.username]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            Preview before publishing
          </DialogTitle>
          <DialogDescription>
            This is exactly how your public page will look with
            {template ? ` "${template.name}"` : " this template"}. Nothing is live until you confirm — or
            open it in the builder to edit its links, socials and text first.
          </DialogDescription>
        </DialogHeader>

        {template && (
          <div className="mx-auto w-full max-w-[220px]">
            <TemplatePhoneCard
              template={template}
              size="full"
              overrides={{
                name: overrides?.name || template.name,
                bio: overrides?.bio || template.bio,
                username: overrides?.username || template.username,
              }}
            />
          </div>
        )}

        {existingLinkCount > 0 && (
          <label className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3 text-left cursor-pointer">
            <Checkbox
              checked={keepLinks}
              onCheckedChange={(v) => setKeepLinks(v === true)}
              disabled={publishing}
              className="mt-0.5"
            />
            <span className="text-sm">
              <span className="font-medium">Keep my existing links</span>
              <span className="block text-xs text-muted-foreground">
                {keepLinks
                  ? `Your ${existingLinkCount} current button${existingLinkCount === 1 ? "" : "s"} stay, and the template's buttons are added below them.`
                  : `Your ${existingLinkCount} current button${existingLinkCount === 1 ? "" : "s"} will be replaced by the template's buttons.`}
              </span>
            </span>
          </label>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => (onKeepEditing ? onKeepEditing(keepLinks) : onOpenChange(false))}
            disabled={publishing}
          >
            <Pencil className="w-4 h-4" />
            {onKeepEditing ? "Edit in builder" : "Keep editing"}
          </Button>
          <Button onClick={() => onConfirm(keepLinks)} disabled={publishing || !template}>
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
