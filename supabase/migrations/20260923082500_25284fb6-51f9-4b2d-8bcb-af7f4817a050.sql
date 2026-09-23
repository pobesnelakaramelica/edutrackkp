ALTER TABLE public.courses ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

DROP POLICY "Courses are viewable by everyone" ON public.courses;
DROP POLICY "Authenticated users can create courses" ON public.courses;
DROP POLICY "Authenticated users can update courses" ON public.courses;

CREATE POLICY "Signed-in users can view courses"
  ON public.courses FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create their own courses"
  ON public.courses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own courses"
  ON public.courses FOR UPDATE TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own courses"
  ON public.courses FOR DELETE TO authenticated
  USING (auth.uid() = created_by);