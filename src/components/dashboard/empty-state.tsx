"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-6 py-16 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-md border border-border bg-muted text-primary">
        <UploadCloud className="h-6 w-6" />
      </div>
      <h3 className="font-display text-xl font-semibold">No projects yet</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Drop your first image to begin. Rasm will isolate silhouettes and details into editable
        SVG layers.
      </p>
      <Button asChild className="mt-6">
        <Link href="/studio">Open Studio</Link>
      </Button>
    </motion.div>
  );
}
