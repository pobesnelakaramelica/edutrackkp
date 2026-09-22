import { Badge } from "@/components/ui/badge";
import type { EnrollmentStatus } from "@/lib/edutrack";
import { cn } from "@/lib/utils";

const styles: Record<EnrollmentStatus, string> = {
  Active: "bg-success/12 text-success border-success/25",
  Completed: "bg-primary/10 text-primary border-primary/20",
  Paused: "bg-warning/15 text-warning-foreground border-warning/35",
};

export function StatusBadge({ status, className }: { status: EnrollmentStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", styles[status], className)}>
      {status}
    </Badge>
  );
}
