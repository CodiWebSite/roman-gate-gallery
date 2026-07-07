ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

UPDATE public.testimonials SET status = 'approved' WHERE published = true;

ALTER TABLE public.testimonials
  ADD CONSTRAINT testimonials_status_check
  CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.testimonials
  ADD CONSTRAINT testimonials_rating_check
  CHECK (rating >= 1 AND rating <= 5);

CREATE POLICY "Anyone can submit a pending testimonial"
ON public.testimonials
FOR INSERT
TO anon, authenticated
WITH CHECK (published = false AND status = 'pending' AND sort_order = 0);