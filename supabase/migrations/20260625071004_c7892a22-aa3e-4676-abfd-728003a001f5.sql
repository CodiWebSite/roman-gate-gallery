CREATE TABLE public.project_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.project_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_photos TO authenticated;
GRANT ALL ON public.project_photos TO service_role;

ALTER TABLE public.project_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photos are viewable by everyone" ON public.project_photos FOR SELECT USING (true);
CREATE POLICY "Admins can insert photos" ON public.project_photos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update photos" ON public.project_photos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete photos" ON public.project_photos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_project_photos_project ON public.project_photos(project_id);