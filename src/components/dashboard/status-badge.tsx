import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/types";

const MAP: Record<
  ProjectStatus,
  { label: string; variant: "success" | "warning" | "destructive" | "muted" }
> = {
  completed: { label: "Completed", variant: "success" },
  processing: { label: "Processing", variant: "warning" },
  failed: { label: "Failed", variant: "destructive" },
  draft: { label: "Draft", variant: "muted" },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const meta = MAP[status];
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
