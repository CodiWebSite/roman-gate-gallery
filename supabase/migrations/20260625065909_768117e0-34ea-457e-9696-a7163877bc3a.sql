CREATE TABLE public.project_sketches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.project_sketches TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_sketches TO authenticated;
GRANT ALL ON public.project_sketches TO service_role;

ALTER TABLE public.project_sketches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sketches are viewable by everyone"
  ON public.project_sketches FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert sketches"
  ON public.project_sketches FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sketches"
  ON public.project_sketches FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sketches"
  ON public.project_sketches FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_project_sketches_project_id ON public.project_sketches(project_id);

CREATE TRIGGER update_project_sketches_updated_at
  BEFORE UPDATE ON public.project_sketches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();