import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/ping-me-logo.png";
import { User, Car, ArrowRight, Check } from "lucide-react";
import { addVehicle } from "@/hooks/useFirestore";

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
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const handleProfileSubmit = async () => {
    if (!fullName.trim() || !age) {
      toast({
        title: "Required Fields",
        description: "Please fill in your name and age.",
        variant: "destructive"
      });
      return;
    }

    setStep(2);
  };

  const handleVehicleSubmit = async () => {
    if (!plateNumber.trim() || !model.trim()) {
      toast({
        title: "Required Fields",
        description: "Please fill in your vehicle details.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please login again to continue.",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      // Add vehicle first (the main action)
      await addVehicle(user.uid, plateNumber, model, vehicleType, color);

      // Update user profile (mark as onboarded)
      await updateUserProfile({
        fullName,
        isOnboarded: true
      });

      toast({
        title: "Welcome to PingME!",
        description: "Your profile and vehicle have been registered.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error('Vehicle registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary' : 'bg-muted'}`}>
                {step > 1 ? <Check className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <span className="text-sm font-medium">Profile</span>
            </div>
            <div className="w-8 h-px bg-border" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}>
                <Car className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Vehicle</span>
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
                  Tell us a bit about yourself
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="mt-2"
                      min="18"
                      max="100"
                    />
                  </div>

                  <Button size="full" onClick={handleProfileSubmit}>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="text-2xl font-bold text-center mb-2">Register Your Vehicle</h1>
                <p className="text-muted-foreground text-center mb-8">
                  Add your primary vehicle details
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="plateNumber">Plate Number</Label>
                    <Input
                      id="plateNumber"
                      type="text"
                      placeholder="UP53 DJ1234"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="model">Vehicle Model</Label>
                    <Input
                      id="model"
                      type="text"
                      placeholder="Honda Activa"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Vehicle Type</Label>
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
                      placeholder="White"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <Button size="full" onClick={handleVehicleSubmit} disabled={loading}>
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        Complete Setup
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </Button>

                  <Button variant="ghost" size="full" onClick={() => setStep(1)}>
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
