-- Enforce at-most-one "live" invite per (circle, email). "Live" =
-- pending or already accepted. Expired and revoked rows are terminal
-- and shouldn't block a fresh invite cycle.

create unique index circle_invite_one_live_per_email
  on public.circle_invite (circle_id, lower(invited_email))
  where status in ('pending', 'accepted');
