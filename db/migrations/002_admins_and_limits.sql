CREATE TABLE IF NOT EXISTS public.admins (
  user_id text PRIMARY KEY REFERENCES public."user"(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.request_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL,
  count integer NOT NULL CHECK (count > 0)
);
