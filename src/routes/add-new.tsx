import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookPlus, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequireAuth } from "@/components/RequireAuth";
import { supabase } from "@/integrations/supabase/client";
import { COURSE_CATEGORIES, coursesQuery } from "@/lib/edutrack";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/add-new")({
  head: () => ({
    meta: [
      { title: "Add Course or Student | EduTrack Hub" },
      {
        name: "description",
        content: "Create a new course or enroll a student into an existing course in EduTrack Hub.",
      },
      { property: "og:title", content: "Add Course or Student | EduTrack Hub" },
      { property: "og:description", content: "Create courses and enroll students in EduTrack Hub." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <AddNew />
    </RequireAuth>
  ),
});

const courseSchema = z.object({
  title: z.string().trim().min(3, { message: "Title must be at least 3 characters" }).max(120),
  category: z.string().min(1, { message: "Pick a category" }),
  duration_weeks: z
    .number({ invalid_type_error: "Enter a number of weeks" })
    .int()
    .min(1, { message: "Duration must be at least 1 week" })
    .max(104, { message: "Duration must be 104 weeks or less" }),
  description: z.string().trim().max(1000).optional(),
});

const enrollSchema = z.object({
  student_name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100),
  student_email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
  course_id: z.string().uuid({ message: "Select a course" }),
  status: z.enum(["Active", "Completed"]),
});

type Errors = Record<string, string>;

function collect(error: z.ZodError): Errors {
  const out: Errors = {};
  for (const issue of error.issues) out[String(issue.path[0])] = issue.message;
  return out;
}

function AddNew() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Add new entry</h1>
      <p className="mt-2 text-muted-foreground">
        Create a course for your catalogue, or enroll a student into an existing course.
      </p>

      <Tabs defaultValue="course" className="mt-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="course">
            <BookPlus className="size-4" />
            Create New Course
          </TabsTrigger>
          <TabsTrigger value="student">
            <UserPlus className="size-4" />
            Enroll Student
          </TabsTrigger>
        </TabsList>

        <TabsContent value="course">
          <CourseForm />
        </TabsContent>
        <TabsContent value="student">
          <EnrollForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CourseForm() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: "", category: "", duration: "", description: "" });
  const [errors, setErrors] = useState<Errors>({});

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof courseSchema>) => {
      const { error } = await supabase.from("courses").insert(values);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Course created");
      setForm({ title: "", category: "", duration: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: Error) => toast.error(error.message || "Could not save the course"),
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = courseSchema.safeParse({
      title: form.title,
      category: form.category,
      duration_weeks: form.duration === "" ? Number.NaN : Number(form.duration),
      description: form.description,
    });
    if (!parsed.success) return setErrors(collect(parsed.error));
    setErrors({});
    mutation.mutate(parsed.data);
  }

  return (
    <form onSubmit={submit} className="surface-card mt-6 space-y-5 p-6">
      <div className="space-y-2">
        <Label htmlFor="title">Course title</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Modern Web Development"
        />
        {errors["title"] && <p className="text-sm text-destructive">{errors["title"]}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {COURSE_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors["category"] && <p className="text-sm text-destructive">{errors["category"]}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration (weeks)</Label>
          <Input
            id="duration"
            type="number"
            min={1}
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            placeholder="12"
          />
          {errors["duration_weeks"] && (
            <p className="text-sm text-destructive">{errors["duration_weeks"]}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="What will students learn in this course?"
        />
        {errors["description"] && <p className="text-sm text-destructive">{errors["description"]}</p>}
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
        Create course
      </Button>
    </form>
  );
}

function EnrollForm() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const courses = useQuery(coursesQuery);
  const [form, setForm] = useState({ name: "", email: "", courseId: "", status: "Active" });
  const [errors, setErrors] = useState<Errors>({});

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof enrollSchema>) => {
      const { error } = await supabase.from("enrollments").insert({ ...values, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Student enrolled");
      setForm({ name: "", email: "", courseId: "", status: "Active" });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
    onError: (error: Error) => toast.error(error.message || "Could not enroll the student"),
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = enrollSchema.safeParse({
      student_name: form.name,
      student_email: form.email,
      course_id: form.courseId,
      status: form.status,
    });
    if (!parsed.success) return setErrors(collect(parsed.error));
    setErrors({});
    mutation.mutate(parsed.data);
  }

  return (
    <form onSubmit={submit} className="surface-card mt-6 space-y-5 p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Student name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ada Lovelace"
          />
          {errors["student_name"] && <p className="text-sm text-destructive">{errors["student_name"]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="student-email">Student email</Label>
          <Input
            id="student-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="ada@school.edu"
          />
          {errors["student_email"] && (
            <p className="text-sm text-destructive">{errors["student_email"]}</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Course</Label>
          <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
            <SelectTrigger>
              <SelectValue placeholder={courses.isLoading ? "Loading courses…" : "Select a course"} />
            </SelectTrigger>
            <SelectContent>
              {(courses.data ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors["course_id"] && <p className="text-sm text-destructive">{errors["course_id"]}</p>}
          {!courses.isLoading && (courses.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">
              No courses yet — create one in the other tab first.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          {errors["status"] && <p className="text-sm text-destructive">{errors["status"]}</p>}
        </div>
      </div>

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
        Enroll student
      </Button>
    </form>
  );
}
