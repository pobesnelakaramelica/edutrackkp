import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock, Mail, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequireAuth } from "@/components/RequireAuth";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";
import {
  enrollmentsQuery,
  formatDate,
  type Enrollment,
  type EnrollmentStatus,
} from "@/lib/edutrack";

export const Route = createFileRoute("/directory")({
  head: () => ({
    meta: [
      { title: "Student Directory | EduTrack Hub" },
      {
        name: "description",
        content: "Search enrolled students, filter by status and review full enrollment details.",
      },
      { property: "og:title", content: "Student Directory | EduTrack Hub" },
      {
        property: "og:description",
        content: "Search enrolled students and review full enrollment details.",
      },
    ],
  }),
  component: () => (
    <RequireAuth>
      <Directory />
    </RequireAuth>
  ),
});

function Directory() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery(enrollmentsQuery);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState<Enrollment | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? []).filter((e) => {
      const matchesTerm =
        !term ||
        e.student_name.toLowerCase().includes(term) ||
        (e.courses?.title ?? "").toLowerCase().includes(term);
      const matchesStatus = status === "All" || e.status === status;
      return matchesTerm && matchesStatus;
    });
  }, [data, search, status]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: EnrollmentStatus }) => {
      const { error } = await supabase.from("enrollments").update({ status: next }).eq("id", id);
      if (error) throw error;
      return next;
    },
    onSuccess: (next) => {
      toast.success(`Status updated to ${next}`);
      setSelected((prev) => (prev ? { ...prev, status: next } : prev));
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
    onError: (error: Error) => toast.error(error.message || "Could not update the status"),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Student directory</h1>
      <p className="mt-2 text-muted-foreground">
        Browse every enrollment you manage and open a card for the full profile.
      </p>

      <div className="surface-card mt-6 flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or course title"
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={Users}
            title="We couldn't load your students"
            description="Something went wrong while fetching enrollments. Please try again."
            action={
              <Button
                className="mt-2"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["enrollments"] })}
              >
                Retry
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={(data ?? []).length === 0 ? "No students enrolled yet" : "No matches found"}
            description={
              (data ?? []).length === 0
                ? "Enroll your first student and they will appear here."
                : "Try a different search term or clear the status filter."
            }
            action={
              (data ?? []).length === 0 ? (
                <Button asChild className="mt-2">
                  <Link to="/add-new">Enroll a student</Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setSearch("");
                    setStatus("All");
                  }}
                >
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelected(e)}
                className="surface-card hover:shadow-lift focus-visible:ring-ring cursor-pointer p-5 text-left transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:outline-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{e.student_name}</p>
                  <StatusBadge status={e.status} />
                </div>
                <Badge variant="secondary" className="mt-3">
                  {e.courses?.title ?? "Unassigned"}
                </Badge>
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="size-3.5" />
                  <span className="truncate">{e.student_email}</span>
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  Enrolled {formatDate(e.enrolled_at)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.student_name}</DialogTitle>
                <DialogDescription>{selected.student_email}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={selected.status} />
                  <Badge variant="secondary">{selected.courses?.title ?? "Unassigned"}</Badge>
                  {selected.courses?.category && (
                    <Badge variant="outline">{selected.courses.category}</Badge>
                  )}
                </div>

                {selected.courses?.description && (
                  <p className="text-sm text-muted-foreground">{selected.courses.description}</p>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted p-3">
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="size-3.5" />
                      Course duration
                    </p>
                    <p className="mt-1 font-medium">
                      {selected.courses?.duration_weeks
                        ? `${selected.courses.duration_weeks} weeks`
                        : "Not set"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      Enrolled on
                    </p>
                    <p className="mt-1 font-medium">{formatDate(selected.enrolled_at)}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Change status</p>
                  <div className="flex flex-wrap gap-2">
                    {(["Active", "Paused", "Completed"] as EnrollmentStatus[]).map((option) => (
                      <Button
                        key={option}
                        size="sm"
                        variant={selected.status === option ? "default" : "outline"}
                        disabled={updateStatus.isPending || selected.status === option}
                        onClick={() => updateStatus.mutate({ id: selected.id, next: option })}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
