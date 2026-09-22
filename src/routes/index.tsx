import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, GraduationCap, Users, TrendingUp, UserPlus, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { coursesQuery, enrollmentsQuery, formatDate } from "@/lib/edutrack";
import { useAuth } from "@/lib/auth";
import heroImage from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | EduTrack Hub" },
      {
        name: "description",
        content:
          "Track courses, enrolled students, active learners and completion rates from the EduTrack Hub dashboard.",
      },
      { property: "og:title", content: "Dashboard | EduTrack Hub" },
      {
        property: "og:description",
        content: "Track courses, enrolled students and completion rates in one dashboard.",
      },
    ],
  }),
  component: Dashboard,
});

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string | number;
  icon: typeof BookOpen;
  loading: boolean;
}) {
  return (
    <div className="surface-card p-5 transition-shadow hover:shadow-lift">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <Icon className="size-4" />
        </span>
      </div>
      {loading ? (
        <Skeleton className="mt-4 h-8 w-20" />
      ) : (
        <p className="font-display mt-3 text-3xl font-semibold">{value}</p>
      )}
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const courses = useQuery(coursesQuery);
  const enrollments = useQuery(enrollmentsQuery);

  const list = enrollments.data ?? [];
  const active = list.filter((e) => e.status === "Active").length;
  const completed = list.filter((e) => e.status === "Completed").length;
  const completionRate = list.length ? Math.round((completed / list.length) * 100) : 0;
  const loading = courses.isLoading || enrollments.isLoading;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="gradient-hero shadow-lift relative overflow-hidden rounded-3xl">
        <img
          src={heroImage}
          alt=""
          width={1600}
          height={912}
          className="absolute inset-0 size-full object-cover opacity-35"
        />
        <div className="relative z-10 max-w-2xl px-6 py-14 sm:px-12 sm:py-20">
          <Badge
            variant="outline"
            className="border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground"
          >
            <Sparkles className="size-3" />
            EduTrack Hub
          </Badge>
          <h1 className="text-primary-foreground mt-4 text-4xl font-semibold sm:text-5xl">
            {user ? "Welcome back" : "Courses and students, beautifully organised"}
          </h1>
          <p className="text-primary-foreground/80 mt-4 text-base sm:text-lg">
            {user
              ? `Signed in as ${user.email}. Here's how your programmes are performing today.`
              : "Create courses, enroll students and follow their progress from one calm workspace."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/add-new">
                <UserPlus className="size-4" />
                Enroll New Student
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
            >
              <Link to="/add-new">
                <Plus className="size-4" />
                Add Course
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Courses" value={courses.data?.length ?? 0} icon={BookOpen} loading={loading} />
        <StatCard label="Total Enrolled Students" value={list.length} icon={Users} loading={loading} />
        <StatCard label="Active Students" value={active} icon={GraduationCap} loading={loading} />
        <StatCard label="Completion Rate" value={`${completionRate}%`} icon={TrendingUp} loading={loading} />
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Latest enrollments</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/directory">View directory</Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={Users}
            title={user ? "No students enrolled yet" : "Sign in to see your students"}
            description={
              user
                ? "Enroll your first student to start tracking progress across your courses."
                : "Create an account or log in to add courses and enroll students."
            }
            action={
              <Button asChild className="mt-2">
                <Link to={user ? "/add-new" : "/auth"}>{user ? "Enroll a student" : "Login / Register"}</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {list.slice(0, 3).map((e) => (
              <div key={e.id} className="surface-card p-5 transition-shadow hover:shadow-lift">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{e.student_name}</p>
                    <p className="text-sm text-muted-foreground">{e.student_email}</p>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{e.courses?.title ?? "Unassigned"}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(e.enrolled_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
