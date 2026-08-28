import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Rocket, Eye } from "lucide-react";
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
  onConfirm: () => void;
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
  onConfirm,
}: SmartlinkPublishDialogProps) {
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
            {template ? ` "${template.name}"` : " this template"}. Nothing is live until you confirm.
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

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={publishing}>
            Keep editing
          </Button>
          <Button onClick={onConfirm} disabled={publishing || !template}>
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
