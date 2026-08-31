import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AvatarCropper } from "@/components/dashboard/AvatarCropper";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  username: string;
  onUpload: (url: string | null) => void;
}

export function AvatarUpload({ userId, currentAvatarUrl, username, onUpload }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke the temporary object URL when the cropper closes.
  useEffect(() => () => { if (cropSrc) URL.revokeObjectURL(cropSrc); }, [cropSrc]);

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be less than 8MB");
      return;
    }
    setCropSrc(URL.createObjectURL(file));
  };

  const uploadBlob = async (blob: Blob) => {
    try {
      setUploading(true);
      const filePath = `${userId}/avatar-${Date.now()}.jpg`;

      // Delete old avatar if it lived in our bucket
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split("/avatars/")[1];
        if (oldPath) await supabase.storage.from("avatars").remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, { upsert: true, contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      onUpload(publicUrl);
      setCropSrc(null);
      toast.success("Avatar updated!");
    } catch (error: any) {
      toast.error("Failed to upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    if (currentAvatarUrl) {
      const oldPath = currentAvatarUrl.split("/avatars/")[1];
      if (oldPath) await supabase.storage.from("avatars").remove([oldPath]);
    }
    onUpload(null);
    toast.success("Avatar removed");
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="relative w-24 h-24 rounded-full bg-secondary cursor-pointer group overflow-hidden"
      >
        {currentAvatarUrl ? (
          <img 
            src={currentAvatarUrl} 
            alt={username} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl font-bold text-muted-foreground">
              {username[0]?.toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleSelect}
        className="hidden"
        disabled={uploading}
      />
      <div className="flex items-center gap-2">
        <p className="text-xs text-muted-foreground">Click to upload &amp; crop your photo</p>
        {currentAvatarUrl && <Button type="button" size="sm" variant="ghost" className="h-7 text-[11px] text-destructive" onClick={removeAvatar}><Trash2 className="h-3 w-3" /> Remove</Button>}
      </div>

      <AvatarCropper
        open={!!cropSrc}
        src={cropSrc}
        onCancel={() => setCropSrc(null)}
        onCropped={uploadBlob}
      />
    </div>
  );
}
