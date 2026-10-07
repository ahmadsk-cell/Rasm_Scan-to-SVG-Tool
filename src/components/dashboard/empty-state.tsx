"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
      <p className="text-sm text-foreground">Library is empty</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        Import an image in Studio to build the first vector.
      </p>
      <Button asChild className="mt-4" size="sm">
        <Link href="/studio">Open Studio</Link>
      </Button>
    </div>
  );
}
