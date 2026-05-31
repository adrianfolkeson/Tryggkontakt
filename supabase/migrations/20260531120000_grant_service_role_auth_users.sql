-- Grant service_role SELECT on auth.users so create_first_circle
-- (and any future function that needs to validate user existence)
-- can do so on Supabase cloud. Local Supabase grants this
-- automatically; cloud does not, which caused production-only
-- "permission denied for table users" errors during circle creation.
grant select on auth.users to service_role;
