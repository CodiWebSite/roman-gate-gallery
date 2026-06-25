ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'schema';
-- existing projects are 3D schemes; 'real' marks real photo works