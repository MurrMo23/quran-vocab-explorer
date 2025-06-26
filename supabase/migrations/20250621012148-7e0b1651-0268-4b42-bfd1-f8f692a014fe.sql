
-- Insert admin@quranvocab.com user into user_roles table with admin role
-- First, let's find the user ID for admin@quranvocab.com
-- Then assign the admin role to that user

-- Since we can't directly query auth.users table in this migration,
-- we'll use a function to safely add the admin role
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Try to find the user by email in auth.users
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@quranvocab.com' 
    LIMIT 1;
    
    -- If user exists, add admin role
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (admin_user_id, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Admin role assigned to user: %', admin_user_id;
    ELSE
        RAISE NOTICE 'User admin@quranvocab.com not found in auth.users table';
    END IF;
END $$;
