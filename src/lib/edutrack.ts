import { supabase } from "@/integrations/supabase/client";

export type Course = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  duration_weeks: number | null;
  created_at: string;
  created_by: string | null;
};

export type EnrollmentStatus = "Active" | "Completed" | "Paused";

export type Enrollment = {
  id: string;
  user_id: string;
  course_id: string | null;
  student_name: string;
  student_email: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  courses: Course | null;
};

export const COURSE_CATEGORIES = [
  "Web Development",
  "Data Science",
  "UI/UX Design",
  "Cloud & DevOps",
  "Business & Marketing",
] as const;

export const coursesQuery = {
  queryKey: ["courses"],
  queryFn: async (): Promise<Course[]> => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Course[];
  },
};

export const enrollmentsQuery = {
  queryKey: ["enrollments"],
  queryFn: async (): Promise<Enrollment[]> => {
    const { data, error } = await supabase
      .from("enrollments")
      .select("*, courses(*)")
      .order("enrolled_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Enrollment[];
  },
};

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
