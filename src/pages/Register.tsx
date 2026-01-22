// Register.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { addVehicle } from "@/hooks/useFirestore";
import logo from "@/assets/ping-me-logo.png";
import { Phone, ArrowRight, ArrowLeft, User, Car, Loader2 } from "lucide-react";
import { ConfirmationResult } from "firebase/auth";

// 🔥 FIRESTORE IMPORTS (IMPORTANT)
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const Register = () => {
  const [step, setStep] = useState<"auth" | "details">("auth");
  const [method, setMethod] = useState<"google" | "phone" | null>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    vehicleNumber: "",
    vehicleModel: "",
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const { signInWithGoogle, sendOTP, verifyOTP, user } = useAuth();

  // ---------------- GOOGLE SIGNUP ----------------
  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Google Verified",
        description: "Please complete your profile.",
      });
      setStep("details");
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------- PHONE OTP ----------------
  const handlePhoneSendOtp = async () => {
    if (phone.length < 10) {
      toast({
        title: "Invalid Phone",
        description: "Enter a valid phone number",
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
      toast({ title: "OTP Sent" });
    } catch (error: any) {
      toast({
        title: "OTP Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerify = async () => {
    if (!confirmationResult) return;

    setLoading(true);
    try {
      await verifyOTP(confirmationResult, otp);
      toast({
        title: "Phone Verified",
        description: "Complete your profile",
      });
      setStep("details");
    } catch (error: any) {
      toast({
        title: "Invalid OTP",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------- COMPLETE REGISTRATION ----------------
  const handleCompleteRegistration = async () => {
    if (!formData.fullName || !formData.vehicleNumber) {
      toast({
        title: "Missing fields",
        description: "Name and vehicle number are required",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Auth Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // 🔥 CREATE / UPDATE USER DOCUMENT
      await setDoc(
        doc(db, "users", user.uid),
        {
          fullName: formData.fullName,
          age: formData.age ? Number(formData.age) : null,
          phone: user.phoneNumber || null,
          email: user.email || null,
          role: "user",
          isOnboarded: true,
          createdAt: serverTimestamp(),
        },
        { merge: true },
      );

      // ✅ ADD VEHICLE
      await addVehicle(user.uid, formData.vehicleNumber, formData.vehicleModel || "Unknown", "Car", "");

      toast({
        title: "Welcome to PingME 🎉",
        description: "Account created successfully",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ping-cream flex flex-col">
      <div id="recaptcha-container"></div>

      <header className="py-6 px-4">
        <Link to="/">
          <img src={logo} alt="PingME" className="h-12 mx-auto" />
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          <motion.div className="bg-white rounded-3xl p-8 shadow-xl">
            {step === "auth" && (
              <>
                <Button className="w-full mb-4" onClick={handleGoogleSignup} disabled={loading}>
                  Sign up with Google
                  {loading && <Loader2 className="ml-2 animate-spin" />}
                </Button>

                <Button variant="outline" className="w-full" onClick={() => setMethod("phone")}>
                  <Phone className="mr-2" /> Sign up with Phone
                </Button>
              </>
            )}

            {step === "details" && (
              <>
                <Label>Full Name</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />

                <Label className="mt-3">Age</Label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />

                <Label className="mt-3">Vehicle Number</Label>
                <Input
                  value={formData.vehicleNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleNumber: e.target.value.toUpperCase(),
                    })
                  }
                />

                <Label className="mt-3">Vehicle Model</Label>
                <Input
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                />

                <Button className="w-full mt-6" onClick={handleCompleteRegistration} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : "Complete Registration"}
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
