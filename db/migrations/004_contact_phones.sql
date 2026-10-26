-- Several contact numbers. The first is the main number used in the header.
ALTER TABLE public.contact_settings
  ADD COLUMN IF NOT EXISTS phones jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (
    CASE WHEN jsonb_typeof(phones) = 'array' THEN
      jsonb_array_length(phones) <= 5
      AND NOT jsonb_path_exists(phones, 'strict $[*] ? (@.type() != "string")')
    ELSE false END
  );

UPDATE public.contact_settings
  SET phones = jsonb_build_array(phone)
  WHERE phones = '[]'::jsonb AND btrim(phone) <> '';
