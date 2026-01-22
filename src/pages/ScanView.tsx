import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Car, 
  Ban, 
  HelpCircle, 
  AlertTriangle, 
  Unlock, 
  Truck, 
  Flame, 
  AlertCircle,
  Phone,
  Bell,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/ping-me-logo.png";
import { useToast } from "@/hooks/use-toast";
import { useVehicleByQrUuid, sendAlert } from "@/hooks/useFirestore";

interface AlertButton {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const alertButtons: AlertButton[] = [
  { id: "parked-wrong", label: "Vehicle is parked wrong", icon: <Car className="w-5 h-5" /> },
  { id: "blocking", label: "Vehicle is blocking the road", icon: <Ban className="w-5 h-5" /> },
  { id: "lost", label: "Vehicle seems to be lost or abandoned", icon: <HelpCircle className="w-5 h-5" /> },
  { id: "hit", label: "Vehicle seems to be hit by something", icon: <AlertTriangle className="w-5 h-5" /> },
  { id: "unlocked", label: "Vehicle is unlocked", icon: <Unlock className="w-5 h-5" /> },
  { id: "tow", label: "Vehicle is about to tow away", icon: <Truck className="w-5 h-5" /> },
  { id: "fire", label: "Vehicle is set on fire & other threat", icon: <Flame className="w-5 h-5" /> },
  { id: "accident", label: "Vehicle is accidented", icon: <AlertCircle className="w-5 h-5" /> },
];

const ScanView = () => {
  const { qrUuid } = useParams<{ qrUuid: string }>();
  const { toast } = useToast();
  const [loadingAlert, setLoadingAlert] = useState<string | null>(null);
  const [alertsSent, setAlertsSent] = useState<string[]>([]);
  
  const { vehicle, loading, error } = useVehicleByQrUuid(qrUuid);

  // Mask plate number for privacy (show only first and last parts)
  const maskPlateNumber = (plate: string) => {
    if (plate.length <= 6) return plate;
    const parts = plate.split(' ');
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1]?.slice(0, 2)}XXXX`;
    }
    return plate.slice(0, 4) + 'XXXX';
  };

  const handleAlert = async (alertId: string, label: string) => {
    if (!vehicle) return;
    
    setLoadingAlert(alertId);
    try {
      await sendAlert(vehicle.id, alertId);
      setAlertsSent([...alertsSent, alertId]);
      toast({
        title: "Alert Sent!",
        description: `The owner has been notified: "${label}"`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to Send Alert",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingAlert(null);
    }
  };

  const handleCall = () => {
    // Placeholder for masked calling service
    toast({
      title: "Connecting...",
      description: "Initiating privacy-protected call to owner.",
    });
    // In production, this would trigger a Cloud Function for masked calling
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-secondary flex flex-col">
        <header className="bg-primary py-3 px-4 flex items-center justify-center shadow-md">
          <img src={logo} alt="PingME" className="h-9" />
        </header>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Vehicle Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This QR code is invalid or the vehicle is no longer registered.
            </p>
            <Link to="/">
              <Button>Go to Homepage</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Header */}
      <header className="bg-primary py-3 px-4 flex items-center justify-between shadow-md">
        <img src={logo} alt="PingME" className="h-9" />
        <button className="p-2 hover:bg-foreground/10 rounded-full transition-colors">
          <Bell className="w-5 h-5 text-foreground" />
        </button>
      </header>

      {/* Vehicle Info Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 pt-6 pb-4"
      >
        <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
          <p className="text-sm text-muted-foreground text-center uppercase tracking-wider">
            {vehicle.color} {vehicle.type} - {vehicle.model}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-center mt-1">
            {maskPlateNumber(vehicle.plateNumber)}
          </h1>
        </div>
      </motion.div>

      {/* Instructions */}
      <p className="text-center text-muted-foreground text-sm px-4 mb-4">
        Tap the buttons below to send notification to the owner.
      </p>

      {/* Alert Buttons */}
      <div className="flex-1 px-4 pb-6 space-y-3 overflow-y-auto">
        {alertButtons.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Button
              variant="alert"
              size="full"
              className={`gap-4 ${alertsSent.includes(alert.id) ? 'opacity-60' : ''}`}
              onClick={() => handleAlert(alert.id, alert.label)}
              disabled={loadingAlert === alert.id || alertsSent.includes(alert.id)}
            >
              <span className="flex-shrink-0">{alert.icon}</span>
              <span className="flex-1">{alert.label}</span>
              {loadingAlert === alert.id && (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
              {alertsSent.includes(alert.id) && (
                <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">Sent</span>
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Call Owner Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="sticky bottom-0 bg-card border-t border-border px-4 py-4 space-y-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
      >
        <button
          onClick={handleCall}
          className="w-full py-4 bg-success text-success-foreground rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg"
        >
          <Phone className="w-5 h-5" />
          CALL OWNER
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Privacy-protected voice contact. No number sharing.
        </p>
        <p className="text-center text-xs text-muted-foreground/70">
          © 2026 PingME™
        </p>
      </motion.div>
    </div>
  );
};

export default ScanView;
