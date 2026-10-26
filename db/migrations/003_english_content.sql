-- Optional English versions of administrator-managed copy. Empty values fall
-- back to the Georgian text on the English site.
ALTER TABLE public.hero
  ADD COLUMN IF NOT EXISTS title_en text NOT NULL DEFAULT '' CHECK (char_length(title_en) <= 200),
  ADD COLUMN IF NOT EXISTS description_en text NOT NULL DEFAULT '' CHECK (char_length(description_en) <= 2000),
  ADD COLUMN IF NOT EXISTS button_label_en text NOT NULL DEFAULT '' CHECK (char_length(button_label_en) <= 80);

ALTER TABLE public.contact_settings
  ADD COLUMN IF NOT EXISTS address_en text NOT NULL DEFAULT '' CHECK (char_length(address_en) <= 500);

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS title_en text NOT NULL DEFAULT '' CHECK (char_length(title_en) <= 200),
  ADD COLUMN IF NOT EXISTS location_en text NOT NULL DEFAULT '' CHECK (char_length(location_en) <= 200);
