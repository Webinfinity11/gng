-- Brand logos in the home page carousel, managed from admin → საიტის ფოტოები.
CREATE TABLE IF NOT EXISTS public.partner_logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  url text NOT NULL CHECK (char_length(url) BETWEEN 1 AND 2048),
  width integer NOT NULL CHECK (width BETWEEN 1 AND 10000),
  height integer NOT NULL CHECK (height BETWEEN 1 AND 10000),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Start with the logos the site already shows.
INSERT INTO public.partner_logos (name, url, width, height, sort_order)
SELECT * FROM (VALUES
  ('Bellotti', '/images/partners/bellotti.webp', 749, 200, 0),
  ('Berkvens', '/images/partners/berkvens.webp', 826, 200, 1),
  ('Magti', '/images/partners/magti.webp', 700, 200, 2),
  ('Silk Road Group', '/images/partners/silk-road-group.webp', 927, 200, 3),
  ('NCC', '/images/partners/ncc.webp', 429, 200, 4),
  ('Capitol Construction', '/images/partners/capitol-construction.webp', 292, 200, 5),
  ('Braga', '/images/partners/braga.webp', 528, 200, 6),
  ('NINZ Firedoors', '/images/partners/ninz.webp', 580, 200, 7),
  ('Simetria', '/images/partners/simetria.webp', 841, 200, 8),
  ('SCAB Design', '/images/partners/scab-design.webp', 1248, 200, 9),
  ('NOM studio', '/images/partners/nom-studio.webp', 319, 200, 10),
  ('Domus', '/images/partners/domus.webp', 200, 200, 11)
) AS seed(name, url, width, height, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.partner_logos);
