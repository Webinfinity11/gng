-- PostgreSQL application content schema. Authentication is installed separately.
-- Defaults intentionally leave missing company/project facts empty.

CREATE TABLE IF NOT EXISTS public.hero (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  eyebrow text NOT NULL DEFAULT '' CHECK (char_length(eyebrow) <= 120),
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 200),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 2000),
  image_url text NOT NULL DEFAULT '' CHECK (char_length(image_url) <= 2048),
  button_label text NOT NULL DEFAULT '' CHECK (char_length(button_label) <= 80),
  button_href text NOT NULL DEFAULT '' CHECK (char_length(button_href) <= 2048),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  phone text NOT NULL DEFAULT '' CHECK (char_length(phone) <= 80),
  email text NOT NULL DEFAULT '' CHECK (char_length(email) <= 254),
  address text NOT NULL DEFAULT '' CHECK (char_length(address) <= 500),
  map_url text NOT NULL DEFAULT '' CHECK (char_length(map_url) <= 2048),
  instagram text NOT NULL DEFAULT '' CHECK (char_length(instagram) <= 2048),
  facebook text NOT NULL DEFAULT '' CHECK (char_length(facebook) <= 2048),
  linkedin text NOT NULL DEFAULT '' CHECK (char_length(linkedin) <= 2048),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (
    char_length(slug) BETWEEN 1 AND 160
    AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 200),
  summary text NOT NULL DEFAULT '' CHECK (char_length(summary) <= 500),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 20000),
  category text NOT NULL DEFAULT '' CHECK (char_length(category) <= 120),
  location text NOT NULL DEFAULT '' CHECK (char_length(location) <= 200),
  year integer CHECK (year BETWEEN 1900 AND 2100),
  cover_url text NOT NULL DEFAULT '' CHECK (char_length(cover_url) <= 2048),
  images jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (
    CASE WHEN jsonb_typeof(images) = 'array' THEN
      jsonb_array_length(images) <= 30
      AND NOT jsonb_path_exists(images, 'strict $[*] ? (@.type() != "string")')
    ELSE false END
  ),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order BETWEEN 0 AND 100000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_public_order_idx
  ON public.projects (sort_order, created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS projects_featured_order_idx
  ON public.projects (sort_order, created_at DESC) WHERE status = 'published' AND featured;

CREATE TABLE IF NOT EXISTS public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  phone text NOT NULL DEFAULT '' CHECK (char_length(phone) <= 40),
  message text NOT NULL CHECK (char_length(btrim(message)) BETWEEN 10 AND 5000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inquiries_created_at_idx
  ON public.inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_unread_idx
  ON public.inquiries (created_at DESC) WHERE status = 'new';

CREATE OR REPLACE FUNCTION public.gng_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS hero_updated_at ON public.hero;
CREATE TRIGGER hero_updated_at BEFORE UPDATE ON public.hero
  FOR EACH ROW EXECUTE FUNCTION public.gng_set_updated_at();
DROP TRIGGER IF EXISTS contact_settings_updated_at ON public.contact_settings;
CREATE TRIGGER contact_settings_updated_at BEFORE UPDATE ON public.contact_settings
  FOR EACH ROW EXECUTE FUNCTION public.gng_set_updated_at();
DROP TRIGGER IF EXISTS projects_updated_at ON public.projects;
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.gng_set_updated_at();
