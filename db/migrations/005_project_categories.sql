-- Administrator-managed project categories. Deleting a category leaves its
-- projects uncategorised instead of removing them.
CREATE TABLE IF NOT EXISTS public.project_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 80),
  name_en text NOT NULL DEFAULT '' CHECK (char_length(name_en) <= 80),
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order BETWEEN 0 AND 100000),
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.project_categories (id, name, name_en, sort_order) VALUES
  ('5c47e000-0000-4000-8000-000000000001', 'სასტუმროები', 'Hotels', 0),
  ('5c47e000-0000-4000-8000-000000000002', 'ოფისები', 'Offices', 1),
  ('5c47e000-0000-4000-8000-000000000003', 'კერძო შეკვეთა', 'Private order', 2),
  ('5c47e000-0000-4000-8000-000000000004', 'საჯარო სივრცეები', 'Public places', 3)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.project_categories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS projects_category_idx ON public.projects (category_id);

-- File existing hotel and office projects; everything else is left for the administrator.
UPDATE public.projects SET category_id = '5c47e000-0000-4000-8000-000000000001'
  WHERE category_id IS NULL AND title_en ~* '(hotel|marriott|moxy|radisson|holiday inn|best western)';
UPDATE public.projects SET category_id = '5c47e000-0000-4000-8000-000000000002'
  WHERE category_id IS NULL AND title_en ~* 'office';
