-- Add ads_enabled setting to site_settings table with default value
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES ('ads_enabled', 'false')
ON CONFLICT (setting_key) DO NOTHING;