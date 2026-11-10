-- Optional English project description. Empty falls back to the Georgian text on /en.
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS description_en text NOT NULL DEFAULT '' CHECK (char_length(description_en) <= 20000);
