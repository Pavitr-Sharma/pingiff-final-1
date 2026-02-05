import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/ping-me-logo.png";
import { User, Car, ArrowRight, Check, ArrowLeft, Loader2 } from "lucide-react";
import { addVehicle } from "@/hooks/useFirestore";
import { useRedirectToLandingOnBack } from "@/hooks/useRedirectToLandingOnBack";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [model, setModel] = useState("");
  const [vehicleType, setVehicleType] = useState<"Car" | "Bike">("Car");
  const [color, setColor] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const { user, userProfile, updateUserProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useRedirectToLandingOnBack();

  // Pre-fill name if available from Google
  useEffect(() => {
    if (userProfile?.fullName) {
      setFullName(userProfile.fullName);
    } else if (user?.displayName) {
      setFullName(user.displayName);
    }
  }, [userProfile, user]);

  // Redirect if already onboarded
  useEffect(() => {
    if (!authLoading && userProfile?.isOnboarded) {
      navigate("/dashboard", { replace: true });
    }
  }, [userProfile, authLoading, navigate]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleProfileSubmit = () => {
    if (!fullName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name.",
        variant: "destructive"
      });
      return;
    }

    if (!age || parseInt(age) < 18) {
      toast({
        title: "Age Required",
        description: "Please enter a valid age (18+).",
        variant: "destructive"
      });
      return;
    }

    setStep(2);
  };

  const handleVehicleSubmit = async () => {
    if (!plateNumber.trim()) {
      toast({
        title: "Plate Number Required",
        description: "Please enter your vehicle plate number.",
        variant: "destructive"
      });
      return;
    }

    if (!model.trim()) {
      toast({
        title: "Model Required",
        description: "Please enter your vehicle model.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Session Expired",
        description: "Please login again.",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      // First add the vehicle
      await addVehicle(user.uid, plateNumber, model, vehicleType, color);

      // Then update user profile with name, age, and mark as onboarded
      await updateUserProfile({
        fullName: fullName.trim(),
        age: parseInt(age),
        isOnboarded: true
      });

      toast({
        title: "Welcome to PingME! 🎉",
        description: `Your vehicle ${plateNumber} has been registered.`,
      });

      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Header */}
      <header className="py-6 px-4">
        <img src={logo} alt="PingME" className="h-12 mx-auto" />
      </header>

      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                step > 1 ? 'bg-primary text-primary-foreground' : step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {step > 1 ? <Check className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <span className="text-sm font-medium hidden sm:inline">Profile</span>
            </div>
            <div className={`w-8 h-px transition-colors ${step > 1 ? 'bg-primary' : 'bg-border'}`} />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Car className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">Vehicle</span>
            </div>
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-card rounded-3xl p-8 shadow-xl border border-border"
          >
            {step === 1 && (
              <>
                <h1 className="text-2xl font-bold text-center mb-2">Complete Your Profile</h1>
                <p className="text-muted-foreground text-center mb-8">
                  Tell us about yourself
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter your age"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="mt-2"
                      min="18"
                      max="100"
                    />
                  </div>

                  <Button size="lg" className="w-full" onClick={handleProfileSubmit}>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <Button 
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => navigate("/?from=back", { replace: true })}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="text-2xl font-bold text-center mb-2">Register Your Vehicle</h1>
                <p className="text-muted-foreground text-center mb-8">
                  Add your primary vehicle
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="plateNumber">Plate Number *</Label>
                    <Input
                      id="plateNumber"
                      type="text"
                      placeholder="e.g., MH12AB1234"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="model">Vehicle Model *</Label>
                    <Input
                      id="model"
                      type="text"
                      placeholder="e.g., Honda Activa, Maruti Swift"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Vehicle Type *</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setVehicleType("Car")}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          vehicleType === "Car"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="text-2xl">🚗</span>
                        <p className="font-medium mt-1">Car</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVehicleType("Bike")}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          vehicleType === "Bike"
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="text-2xl">🏍️</span>
                        <p className="font-medium mt-1">Bike</p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="color">Vehicle Color (Optional)</Label>
                    <Input
                      id="color"
                      type="text"
                      placeholder="e.g., White, Black, Red"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full" 
                    onClick={handleVehicleSubmit} 
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Complete Setup
                        <Check className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <Button 
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => setStep(1)}
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;