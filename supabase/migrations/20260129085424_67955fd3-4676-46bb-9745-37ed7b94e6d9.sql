-- Create table to store email verification OTPs
CREATE TABLE public.email_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX idx_email_otps_email ON public.email_otps(email);
CREATE INDEX idx_email_otps_expires ON public.email_otps(expires_at);

-- Enable RLS but allow public access for OTP operations (edge function uses service role)
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed as edge function uses service role key