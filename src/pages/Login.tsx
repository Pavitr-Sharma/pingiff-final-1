import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/ping-me-logo.png";
import { Mail, Phone, ArrowRight, ArrowLeft } from "lucide-react";
import { ConfirmationResult } from "firebase/auth";

const Login = () => {
  const [method, setMethod] = useState<"google" | "phone" | null>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signInWithGoogle, sendOTP, verifyOTP, userProfile } = useAuth();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Welcome!",
        description: "Successfully signed in with Google.",
      });
      // Navigate based on onboarding status
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Login Failed",
        description: error.message || "Could not sign in with Google.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSendOtp = async () => {
    if (phone.length < 10) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid phone number with country code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      const result = await sendOTP(formattedPhone, "recaptcha-container");
      setConfirmationResult(result);
      setShowOtp(true);
      toast({
        title: "OTP Sent",
        description: "A verification code has been sent to your phone.",
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Please check your phone number and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerify = async () => {
    if (otp.length < 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    if (!confirmationResult) {
      toast({
        title: "Error",
        description: "Please request a new OTP.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(confirmationResult, otp);
      toast({
        title: "Logged In!",
        description: "Welcome to PingME.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Recaptcha Container (invisible) */}
      <div id="recaptcha-container"></div>

      {/* Header */}
      <header className="py-6 px-4">
        <Link to="/">
          <img src={logo} alt="PingME" className="h-12 mx-auto" />
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-3xl p-8 shadow-xl border border-border"
          >
            <h1 className="text-2xl font-bold text-center mb-2">Welcome Back</h1>
            <p className="text-muted-foreground text-center mb-8">
              Login to access your dashboard
            </p>

            {!method && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <Button
                  variant="outline"
                  size="full"
                  className="justify-start gap-4"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <Mail className="w-5 h-5" />
                  Continue with Google
                  {loading && (
                    <span className="ml-auto w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="full"
                  className="justify-start gap-4"
                  onClick={() => setMethod("phone")}
                >
                  <Phone className="w-5 h-5" />
                  Continue with Phone
                </Button>
              </motion.div>
            )}

            {method === "phone" && !showOtp && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Include country code (e.g., +91 for India)
                  </p>
                </div>
                <Button size="full" onClick={handlePhoneSendOtp} disabled={loading}>
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="full"
                  onClick={() => setMethod(null)}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to options
                </Button>
              </motion.div>
            )}

            {method === "phone" && showOtp && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="mt-2 text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>
                <Button size="full" onClick={handlePhoneVerify} disabled={loading}>
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify & Login
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="full"
                  onClick={() => {
                    setShowOtp(false);
                    setOtp("");
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change phone number
                </Button>
              </motion.div>
            )}

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-foreground font-semibold hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
