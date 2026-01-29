-- Allow public read access to check verification status
CREATE POLICY "Allow reading verification status"
ON public.email_otps
FOR SELECT
TO anon, authenticated
USING (true);