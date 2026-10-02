"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Two-step delete: first click asks, second click confirms. */
export function DeleteButton({ onConfirm, pending, noun }: { onConfirm: () => void; pending: boolean; noun: string }) {
  const [ask, setAsk] = useState(false);
  if (!ask)
    return (
      <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setAsk(true)}>
        <Trash2 className="h-4 w-4" /> Delete {noun}
      </Button>
    );
  return (
    <span className="flex items-center gap-2">
      <Button type="button" variant="destructive" disabled={pending} onClick={onConfirm}>
        {pending ? "Deleting…" : `Delete ${noun} permanently`}
      </Button>
      <Button type="button" variant="ghost" onClick={() => setAsk(false)}>Cancel</Button>
    </span>
  );
}
