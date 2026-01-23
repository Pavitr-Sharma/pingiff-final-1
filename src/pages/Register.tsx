import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { clearRecaptcha } from "@/lib/firebase";
import logo from "@/assets/ping-me-logo.png";
import { Phone, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { ConfirmationResult } from "firebase/auth";

const Register = () => {
  const [method, setMethod] = useState<"google" | "phone" | null>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { signInWithGoogle, sendOTP, verifyOTP, user, userProfile, loading: authLoading } = useAuth();

  // Cleanup recaptcha on unmount
  useEffect(() => {
    return () => {
      clearRecaptcha();
    };
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && userProfile !== undefined) {
      if (userProfile?.isOnboarded) {
        navigate("/dashboard", { replace: true });
      } else if (userProfile) {
        // User exists but not onboarded - go to onboarding
        navigate("/onboarding", { replace: true });
      }
    }
  }, [user, userProfile, authLoading, navigate]);

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Account Created!",
        description: "Please complete your profile to continue.",
      });
      // Navigation will happen via useEffect
    } catch (error: any) {
      console.error(error);
      if (error.code !== 'auth/redirect-cancelled-by-user') {
        toast({
          title: "Signup Failed",
          description: error.message || "Could not sign up with Google.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSendOtp = async () => {
    const cleanPhone = phone.replace(/\s/g, '');
    
    if (cleanPhone.length < 10) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid phone number with country code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = cleanPhone.startsWith("+") ? cleanPhone : `+91${cleanPhone}`;
      const result = await sendOTP(formattedPhone, "recaptcha-container");
      setConfirmationResult(result);
      setShowOtp(true);
      toast({
        title: "OTP Sent!",
        description: `Verification code sent to ${formattedPhone}`,
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
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    if (!confirmationResult) {
      toast({
        title: "Session Expired",
        description: "Please request a new OTP.",
        variant: "destructive",
      });
      setShowOtp(false);
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(confirmationResult, otp);
      toast({
        title: "Phone Verified!",
        description: "Please complete your profile to continue.",
      });
      // Navigation will happen via useEffect when user state updates
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

  const resetPhoneAuth = () => {
    setShowOtp(false);
    setOtp("");
    setConfirmationResult(null);
    clearRecaptcha();
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Recaptcha Container */}
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
            <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
            <p className="text-muted-foreground text-center mb-8">Join PingME to protect your vehicle</p>

            {!method && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <Button
                  size="lg"
                  className="w-full justify-center gap-3"
                  onClick={handleGoogleSignup}
                  disabled={loading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign up with Google
                  {loading && <Loader2 className="w-5 h-5 animate-spin ml-2" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-center gap-3"
                  onClick={() => setMethod("phone")}
                >
                  <Phone className="w-5 h-5" />
                  Sign up with Phone
                </Button>
              </motion.div>
            )}

            {method === "phone" && !showOtp && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
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
                  <p className="text-xs text-muted-foreground mt-1">Include country code (e.g., +91 for India)</p>
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handlePhoneSendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setMethod(null)}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to options
                </Button>
              </motion.div>
            )}

            {method === "phone" && showOtp && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="mt-2 text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handlePhoneVerify}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Verify & Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={resetPhoneAuth}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Change phone number
                </Button>
              </motion.div>
            )}

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-foreground hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;