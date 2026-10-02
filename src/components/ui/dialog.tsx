"use client";
import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = D.Root;

export function DialogContent({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <D.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-1.5rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border bg-card p-6 shadow-xl",
          className
        )}
      >
        <D.Title className="pr-8 text-lg font-semibold tracking-tight">{title}</D.Title>
        <D.Description className={description ? "mt-1 text-sm text-muted-foreground" : "sr-only"}>
          {description ?? title}
        </D.Description>
        {children}
        <D.Close className="absolute right-4 top-4 rounded-sm p-1 text-muted-foreground hover:bg-secondary" aria-label="Close">
          <X className="h-4 w-4" />
        </D.Close>
      </D.Content>
    </D.Portal>
  );
}
