-- Site photos (outside projects) replaced from the admin panel. A missing row means the built-in photo.
CREATE TABLE IF NOT EXISTS public.site_photos (
  key text PRIMARY KEY CHECK (char_length(key) <= 60),
  url text NOT NULL CHECK (char_length(url) BETWEEN 1 AND 2048),
  updated_at timestamptz NOT NULL DEFAULT now()
);
