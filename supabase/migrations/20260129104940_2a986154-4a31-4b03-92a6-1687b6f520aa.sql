-- Drop the overly permissive SELECT policy that exposes OTP codes to anyone
DROP POLICY IF EXISTS "Allow reading verification status" ON public.email_otps;

-- Create a new restrictive policy that only allows server-side access (via service role)
-- Since OTP verification should only happen server-side in edge functions,
-- we deny all direct SELECT access from clients
CREATE POLICY "Deny public read access to OTP codes"
ON public.email_otps
FOR SELECT
USING (false);

-- Note: Edge functions use the service role key which bypasses RLS,
-- so they can still read/write OTPs for verification purposes