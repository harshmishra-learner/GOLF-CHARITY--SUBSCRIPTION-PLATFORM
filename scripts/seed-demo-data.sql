-- Demo Data Seeder
-- Run this in your Supabase SQL editor to populate with sample data for testing

-- Create a demo admin user (you need to sign up first in auth, then get user ID)
-- For testing, you can manually create a user in auth.users table with a known email
-- Then set is_admin = true

-- Example: Insert admin user manually after creating auth account
-- INSERT INTO public.users (id, email, full_name, is_admin, subscription_status, subscription_tier)
-- VALUES
--   ('your-admin-uuid-here', 'admin@demo.com', 'Demo Admin', TRUE, 'active', 'yearly')
-- ON CONFLICT (id) DO UPDATE SET is_admin = TRUE;

-- Create sample scores for testing (requires user_id from your test user)
-- This will be useful to test draw engine

-- Notes:
-- 1. First create a user through the signup page
-- 2. Get their user_id from the users table
-- 3. Replace 'USER_ID_HERE' with actual user ID in the INSERT below

-- INSERT INTO golf_scores (user_id, score, played_date)
-- VALUES
--   ('USER_ID_HERE', 28, '2025-03-15'),
--   ('USER_ID_HERE', 32, '2025-03-10'),
--   ('USER_ID_HERE', 25, '2025-03-05'),
--   ('USER_ID_HERE', 30, '2025-02-28'),
--   ('USER_ID_HERE', 27, '2025-02-20');

-- To test the draw engine:
-- 1. Have at least 2-3 users with 5 scores each
-- 2. Create a draw via admin panel
-- 3. Run simulation
-- 4. Publish the draw
