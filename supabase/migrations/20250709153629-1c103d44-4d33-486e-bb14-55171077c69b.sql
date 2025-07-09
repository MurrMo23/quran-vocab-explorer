-- Create storage policies for site branding uploads

-- Allow admins to upload files to site-branding folder in avatars bucket
CREATE POLICY "Admins can upload site branding files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid() IN (
    SELECT user_id FROM user_roles 
    WHERE role = 'admin'::app_role
  )
  AND name LIKE 'site-branding/%'
);

-- Allow admins to update site branding files  
CREATE POLICY "Admins can update site branding files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IN (
    SELECT user_id FROM user_roles 
    WHERE role = 'admin'::app_role
  )
  AND name LIKE 'site-branding/%'
);

-- Allow admins to delete site branding files
CREATE POLICY "Admins can delete site branding files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid() IN (
    SELECT user_id FROM user_roles 
    WHERE role = 'admin'::app_role
  )
  AND name LIKE 'site-branding/%'
);

-- Allow public access to site branding files for reading
CREATE POLICY "Public can view site branding files"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'avatars' 
  AND name LIKE 'site-branding/%'
);