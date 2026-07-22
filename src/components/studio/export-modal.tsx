"use client";

import { useState } from "react";
import { Download, FileCode2, FileJson2, Layers } from "lucide-react";
import { toast } from "sonner";
import {
  applyTuning,
  buildSvgFromLayers,
  exportAsDxf,
  generateCoordinateManifest,
} from "@/lib/vector-engine";
import { useStudioStore } from "@/store/studio-store";
import type { ExportFormat } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const FORMATS: Array<{
  id: ExportFormat;
  label: string;
  description: string;
  icon: typeof FileCode2;
}> = [
  {
    id: "svg",
    label: "Optimized SVG",
    description: "Clean paths with grouped ID tags",
    icon: FileCode2,
  },
  {
    id: "dxf",
    label: "DXF / CAD",
    description: "Layered paths for tooling pipelines",
    icon: Layers,
  },
  {
    id: "json",
    label: "JSON Manifest",
    description: "Coordinate data for manufacturing & game assets",
    icon: FileJson2,
  },
  {
    id: "ai",
    label: "AI Package",
    description: "Illustrator-friendly SVG bundle",
    icon: Download,
  },
];

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportModal() {
  const { layers, tuning } = useStudioStore();
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("svg");

  function handleExport() {
    if (!layers.length) {
      toast.error("No layers available to export.");
      return;
    }

    const tuned = applyTuning(layers, tuning);

    switch (format) {
      case "svg":
      case "ai":
        downloadBlob(
          format === "ai" ? "vectorpath-export.ai.svg" : "vectorpath-export.svg",
          buildSvgFromLayers(tuned),
          "image/svg+xml"
        );
        break;
      case "dxf":
        downloadBlob("vectorpath-export.dxf", exportAsDxf(tuned), "application/dxf");
        break;
      case "json":
        downloadBlob(
          "vectorpath-manifest.json",
          JSON.stringify(generateCoordinateManifest(tuned), null, 2),
          "application/json"
        );
        break;
    }

    toast.success(`Exported ${format.toUpperCase()} successfully`);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!layers.length}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Export Center</DialogTitle>
          <DialogDescription>
            Download production-ready vector assets for design, CAD, or manufacturing pipelines.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {FORMATS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setFormat(item.id)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  format === item.id
                    ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <Icon className="mb-3 h-5 w-5 text-primary" />
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>Download {format.toUpperCase()}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
