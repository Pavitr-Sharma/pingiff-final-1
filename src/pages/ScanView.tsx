import { useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  Loader2,
  CheckCircle,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/ping-me-logo.png";
import { useToast } from "@/hooks/use-toast";
import { useVehicleByQrUuid, sendAlert } from "@/hooks/useFirestore";
import AnonymousChat from "@/components/chat/AnonymousChat";

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
  const [showChat, setShowChat] = useState(false);

  const { vehicle, loading, error } = useVehicleByQrUuid(qrUuid);

  // Mask plate number for privacy (show only first and last parts)
  const maskPlateNumber = (plate: string) => {
    if (plate.length <= 6) return plate;
    const parts = plate.split(" ");
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1]?.slice(0, 2)}XXXX`;
    }
    return plate.slice(0, 4) + "XXXX";
  };

  const handleAlert = async (alertType: string, label: string) => {
    if (!vehicle) return;

    setLoadingAlert(alertType);
    try {
      await sendAlert(vehicle.id, alertType);
      setAlertsSent((prev) => [...prev, alertType]);
      toast({
        title: "Alert Sent!",
        description: `The owner has been notified: "${label}"`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to Send Alert",
        description: "Please try again.",
        variant: "destructive",
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
      <div className="min-h-screen bg-ping-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-ping-yellow animate-spin" />
          <p className="text-ping-brown">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-ping-cream flex flex-col">
        <header className="bg-ping-yellow py-3 px-4 flex items-center justify-center shadow-md">
          <img src={logo} alt="PingME" className="h-9" />
        </header>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-ping-ink">Vehicle Not Found</h1>
            <p className="text-ping-brown mb-6">This QR code is invalid or the vehicle is no longer registered.</p>
            <Link to="/">
              <Button className="bg-ping-yellow text-ping-ink hover:bg-ping-yellow/90">Go to Homepage</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show chat view
  if (showChat) {
    return (
      <div className="min-h-screen bg-ping-cream flex flex-col">
        <header className="bg-ping-yellow py-3 px-4 flex items-center justify-between shadow-md">
          <img src={logo} alt="PingME" className="h-9" />
          <button
            onClick={() => setShowChat(false)}
            className="px-4 py-2 bg-ping-ink/10 rounded-full text-sm font-medium text-ping-ink hover:bg-ping-ink/20 transition-colors"
          >
            Back to Alerts
          </button>
        </header>
        <div className="flex-1 p-4">
          <AnonymousChat
            vehicleId={vehicle.id}
            vehiclePlate={maskPlateNumber(vehicle.plateNumber)}
            isOwner={false}
            onClose={() => setShowChat(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ping-cream flex flex-col">
      {/* Header */}
      <header className="bg-ping-yellow py-3 px-4 flex items-center justify-between shadow-md">
        <img src={logo} alt="PingME" className="h-9" />
        <button className="p-2 hover:bg-ping-ink/10 rounded-full transition-colors">
          <Bell className="w-5 h-5 text-ping-ink" />
        </button>
      </header>

      {/* Vehicle Info Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-4 pt-6 pb-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-ping-yellow/30">
          <p className="text-sm text-ping-brown text-center uppercase tracking-wider">
            {vehicle.color} {vehicle.type} - {vehicle.model}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-center mt-1 text-ping-ink">
            {maskPlateNumber(vehicle.plateNumber)}
          </h1>
        </div>
      </motion.div>

      {/* Instructions */}
      <p className="text-center text-ping-brown text-sm px-4 mb-4">
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
              variant="outline"
              className={`w-full justify-start gap-4 py-4 h-auto border-2 border-ping-ink/10 hover:border-ping-yellow hover:bg-ping-yellow/10 text-left ${
                alertsSent.includes(alert.id) ? "opacity-60 bg-green-50 border-green-200" : ""
              }`}
              onClick={() => handleAlert(alert.id, alert.label)}
              disabled={loadingAlert === alert.id || alertsSent.includes(alert.id)}
            >
              <span className="flex-shrink-0 text-ping-ink">{alert.icon}</span>
              <span className="flex-1 text-ping-ink text-sm">{alert.label}</span>
              {loadingAlert === alert.id && <Loader2 className="w-5 h-5 animate-spin text-ping-yellow" />}
              {alertsSent.includes(alert.id) && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Sent
                </span>
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Bottom Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="sticky bottom-0 bg-white border-t-2 border-ping-yellow/30 px-4 py-4 space-y-3 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
      >
        {/* Chat Button */}
        <button
          onClick={() => setShowChat(true)}
          className="w-full py-4 bg-ping-yellow text-ping-ink rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 hover:brightness-95 active:scale-[0.98] shadow-lg"
        >
          <MessageCircle className="w-5 h-5" />
          CHAT WITH OWNER
        </button>

        {/* Call Owner */}
        {/* <button
          onClick={handleCall}
          className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200 hover:brightness-110 active:scale-[0.98] shadow-lg"
        >
          <Phone className="w-5 h-5" />
          CALL OWNER
        </button> */}

        <p className="text-center text-xs text-ping-brown">Privacy-protected contact. No credentials shared.</p>
        <p className="text-center text-xs text-ping-brown/70">© 2026 PingME™</p>
      </motion.div>
    </div>
  );
};

export default ScanView;
