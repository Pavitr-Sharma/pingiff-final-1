import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/ping-me-logo.png";
import { Loader2, User, Mail, Lock, Eye, EyeOff, Phone, MapPin, ArrowLeft, CheckCircle2 } from "lucide-react";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh"
];

type RegistrationStep = "form" | "otp" | "creating";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    country: "India",
    state: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<RegistrationStep>("form");
  const [otpValue, setOtpValue] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUpWithEmail, user, userProfile, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && userProfile !== undefined) {
      if (userProfile?.isOnboarded) {
        navigate("/dashboard", { replace: true });
      } else if (userProfile) {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [user, userProfile, authLoading, navigate]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      toast({ title: "Error", description: "Please enter your full name.", variant: "destructive" });
      return false;
    }
    if (!formData.email.trim()) {
      toast({ title: "Error", description: "Please enter your email.", variant: "destructive" });
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast({ title: "Error", description: "Please enter a valid email address.", variant: "destructive" });
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      toast({ title: "Error", description: "Please enter your phone number.", variant: "destructive" });
      return false;
    }
    if (!formData.state) {
      toast({ title: "Error", description: "Please select your state.", variant: "destructive" });
      return false;
    }
    if (!formData.address.trim()) {
      toast({ title: "Error", description: "Please enter your address.", variant: "destructive" });
      return false;
    }
    if (formData.password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return false;
    }
    if (!agreeTerms) {
      toast({ title: "Error", description: "Please agree to the Terms and Privacy Policy.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const sendOTP = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { email: formData.email.trim(), action: "send" },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to send OTP");

      toast({
        title: "OTP Sent!",
        description: `Verification code sent to ${formData.email}`,
      });
      setStep("otp");
      setResendTimer(60);
    } catch (error: any) {
      console.error("Send OTP error:", error);
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Could not send verification code.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await sendOTP();
  };

  const verifyOTPAndCreateAccount = async () => {
    if (otpValue.length !== 6) {
      toast({ title: "Error", description: "Please enter the complete 6-digit code.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Verify OTP
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { email: formData.email.trim(), action: "verify", otp: otpValue },
      });

      if (error) throw error;
      if (!data?.success) {
        toast({
          title: "Invalid Code",
          description: data?.message || "The verification code is incorrect.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // OTP verified - create account
      setStep("creating");
      
      await signUpWithEmail(formData.email.trim(), formData.password, formData.fullName.trim(), {
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        country: formData.country,
        state: formData.state,
      });

      toast({
        title: "Account Created!",
        description: "Your email has been verified. Welcome to PingME!",
      });
    } catch (error: any) {
      console.error("Create account error:", error);
      let errorMessage = "Could not create account. Please try again.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak.";
      }
      
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setStep("otp");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    await sendOTP();
  };

  const goBackToForm = () => {
    setStep("form");
    setOtpValue("");
  };

  // OTP Verification Step
  if (step === "otp" || step === "creating") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="py-4 px-4">
          <Link to="/">
            <img src={logo} alt="PingME" className="h-10 mx-auto" />
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 pb-8">
          <div className="w-full max-w-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <AnimatePresence mode="wait">
                {step === "creating" ? (
                  <motion.div
                    key="creating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <h2 className="text-xl font-semibold">Creating Your Account...</h2>
                    <p className="text-muted-foreground text-sm">Please wait while we set up your profile</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <button
                      onClick={goBackToForm}
                      className="absolute left-4 top-4 p-2 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    
                    <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
                    <p className="text-muted-foreground text-sm mb-6">
                      We've sent a 6-digit code to<br />
                      <span className="font-medium text-foreground">{formData.email}</span>
                    </p>

                    <div className="flex justify-center mb-6">
                      <InputOTP
                        maxLength={6}
                        value={otpValue}
                        onChange={(value) => setOtpValue(value)}
                        disabled={loading}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="w-12 h-14 text-lg rounded-xl" />
                          <InputOTPSlot index={1} className="w-12 h-14 text-lg rounded-xl" />
                          <InputOTPSlot index={2} className="w-12 h-14 text-lg rounded-xl" />
                          <InputOTPSlot index={3} className="w-12 h-14 text-lg rounded-xl" />
                          <InputOTPSlot index={4} className="w-12 h-14 text-lg rounded-xl" />
                          <InputOTPSlot index={5} className="w-12 h-14 text-lg rounded-xl" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <Button
                      onClick={verifyOTPAndCreateAccount}
                      size="lg"
                      className="w-full h-12 rounded-full mb-4"
                      disabled={loading || otpValue.length !== 6}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Verify & Create Account"
                      )}
                    </Button>

                    <p className="text-sm text-muted-foreground">
                      Didn't receive the code?{" "}
                      <button
                        onClick={handleResendOTP}
                        disabled={resendTimer > 0 || loading}
                        className={`font-semibold ${resendTimer > 0 ? 'text-muted-foreground' : 'text-primary hover:underline'}`}
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                      </button>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Registration Form Step
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="py-4 px-4">
        <Link to="/">
          <img src={logo} alt="PingME" className="h-10 mx-auto" />
        </Link>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 pb-8 pt-2">
        <div className="w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-bold text-center mb-1">Sign Up</h1>
            <p className="text-muted-foreground text-center text-sm mb-6">Please provide the details below to create an account</p>

            <form onSubmit={handleFormSubmit} className="space-y-3">
              {/* Full Name */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="pl-10 h-12 rounded-full border-border bg-background"
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 h-12 rounded-full border-border bg-background"
                  disabled={loading}
                />
              </div>

              {/* Phone Number */}
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="pl-10 h-12 rounded-full border-border bg-background"
                  disabled={loading}
                />
              </div>

              {/* Country & State */}
              <div className="grid grid-cols-2 gap-3">
                <Select value={formData.country} disabled>
                  <SelectTrigger className="h-12 rounded-full border-border bg-background">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={formData.state} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                  disabled={loading}
                >
                  <SelectTrigger className="h-12 rounded-full border-border bg-background">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Address */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  name="address"
                  placeholder="Home Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="pl-10 h-12 rounded-full border-border bg-background"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="New Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 h-12 rounded-full border-border bg-background"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 h-12 rounded-full border-border bg-background"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-3 pt-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  className="mt-0.5 rounded-full"
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-tight">
                  I agree with the{" "}
                  <Link to="/terms" className="text-primary hover:underline font-medium">Terms and Conditions</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
                  {" "}of PingME
                </Label>
              </div>

              {/* Create Account Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 rounded-full mt-4"
                disabled={loading || authLoading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Continue"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Have an account?{" "}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Sign in
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
