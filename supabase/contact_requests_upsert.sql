-- Optional: run in Supabase SQL Editor so the app can check if an email already exists.
-- The app inserts only for new emails; contact form blocks duplicate addresses.

-- Allow anonymous read (check existing email).
create policy "Allow anonymous select on contact_requests"
  on contact_requests
  for select
  to anon
  using (true);

-- Optional: one row per email (case-insensitive).
-- create unique index if not exists contact_requests_email_unique
--   on contact_requests (lower(trim(email)));
