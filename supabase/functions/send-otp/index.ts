import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendOTPRequest {
  email: string;
  action: "send" | "verify";
  otp?: string;
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration is missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const { email, action, otp }: SendOTPRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    if (action === "send") {
      // Generate OTP
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Delete any existing OTPs for this email
      await supabase
        .from("email_otps")
        .delete()
        .eq("email", email.toLowerCase());

      // Store OTP in database
      const { error: insertError } = await supabase
        .from("email_otps")
        .insert({
          email: email.toLowerCase(),
          otp_code: otpCode,
          expires_at: expiresAt.toISOString(),
          verified: false,
        });

      if (insertError) {
        console.error("Error storing OTP:", insertError);
        throw new Error("Failed to generate OTP");
      }

      // Send email via Resend
      const emailResponse = await resend.emails.send({
        from: "PingME <onboarding@resend.dev>",
        to: [email],
        subject: "Your PingME Verification Code",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <h1 style="color: #F79009; font-size: 24px; margin: 0 0 8px 0; text-align: center;">PingME</h1>
              <h2 style="color: #333; font-size: 20px; margin: 0 0 24px 0; text-align: center;">Email Verification</h2>
              <p style="color: #666; font-size: 14px; margin: 0 0 24px 0; text-align: center;">
                Use this code to verify your email address:
              </p>
              <div style="background: #F79009; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 12px; text-align: center; margin: 0 0 24px 0;">
                ${otpCode}
              </div>
              <p style="color: #999; font-size: 12px; margin: 0; text-align: center;">
                This code expires in 10 minutes.<br>
                If you didn't request this, please ignore this email.
              </p>
            </div>
          </body>
          </html>
        `,
      });

      console.log("OTP email sent successfully:", emailResponse);

      return new Response(
        JSON.stringify({ success: true, message: "OTP sent successfully" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else if (action === "verify") {
      if (!otp) {
        throw new Error("OTP is required for verification");
      }

      // Fetch OTP record
      const { data: otpRecord, error: fetchError } = await supabase
        .from("email_otps")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("otp_code", otp)
        .eq("verified", false)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching OTP:", fetchError);
        throw new Error("Failed to verify OTP");
      }

      if (!otpRecord) {
        return new Response(
          JSON.stringify({ success: false, message: "Invalid OTP code" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Check expiration
      if (new Date(otpRecord.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ success: false, message: "OTP has expired" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Mark as verified
      await supabase
        .from("email_otps")
        .update({ verified: true })
        .eq("id", otpRecord.id);

      return new Response(
        JSON.stringify({ success: true, message: "Email verified successfully" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    throw new Error("Invalid action");
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
