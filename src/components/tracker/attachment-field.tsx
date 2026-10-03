"use client";
import { useState } from "react";
import { FileText, Paperclip } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "as-builts";
const MAX_BYTES = 10 * 1024 * 1024;

/** Uploads straight to the private storage bucket; `value` is the stored object path. */
export function AttachmentField({
  id,
  label,
  folder,
  value,
  onChange,
  onBusy,
}: {
  id: string;
  label: string;
  folder: string;
  value: string;
  onChange: (path: string) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [error, setError] = useState<string>();
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setError(undefined);
    if (file.size > MAX_BYTES) return setError("File is larger than 10 MB.");
    setUploading(true);
    onBusy(true);
    const safe = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${folder}/${Date.now()}-${safe}`;
    const { error } = await createClient().storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined });
    setUploading(false);
    onBusy(false);
    if (error) return setError(error.message);
    onChange(path);
  };

  const open = async () => {
    const { data, error } = await createClient().storage.from(BUCKET).createSignedUrl(value, 60);
    if (error || !data) return setError(error?.message ?? "Couldn't open the file.");
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const fileName = value ? value.split("/").pop()!.replace(/^\d+-/, "") : "";

  return (
    <div className="sm:col-span-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-wrap items-center gap-3">
        <Input id={id} type="file" accept=".pdf,.png,.jpg,.jpeg,.dwg,.zip" className="h-auto max-w-xs py-1.5" disabled={uploading} onChange={(e) => upload(e.target.files?.[0])} />
        {uploading && <span className="text-xs text-muted-foreground">Uploading…</span>}
        {value && !uploading && (
          <span className="inline-flex items-center gap-2 text-xs">
            <button type="button" onClick={open} className="inline-flex items-center gap-1 text-primary hover:underline">
              <FileText className="h-3.5 w-3.5" /> {fileName}
            </button>
            <button type="button" onClick={() => onChange("")} className="text-muted-foreground hover:text-destructive">
              Remove
            </button>
          </span>
        )}
        {!value && !uploading && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Paperclip className="h-3.5 w-3.5" /> Not attached
          </span>
        )}
      </div>
      {error && <p role="alert" className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
