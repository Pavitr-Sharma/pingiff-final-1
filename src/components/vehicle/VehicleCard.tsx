import { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  QrCode,
  Bell,
  MessageCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import VehicleQRCode from "@/components/qr/VehicleQRCode";
import AnonymousChat from "@/components/chat/AnonymousChat";
import { Alert } from "@/hooks/useFirestore";

interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  type: "Car" | "Bike";
  color?: string;
  qrUuid: string;
  isActive: boolean;
}

interface ActiveChat {
  sessionId: string;
  expiresAt: number;
  scannerName?: string;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  alerts: Alert[];
  index: number;
}

const alertLabels: Record<string, string> = {
  "parked-wrong": "Vehicle parked wrong",
  "blocking": "Blocking the road",
  "lost": "Seems lost/abandoned",
  "hit": "Hit by something",
  "unlocked": "Vehicle is unlocked",
  "tow": "About to be towed",
  "fire": "Fire/threat detected",
  "accident": "Vehicle accidented",
};

const VehicleCard = ({ vehicle, alerts, index }: VehicleCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [showChat, setShowChat] = useState(false);
  
  const vehicleAlerts = alerts.filter((a) => a.vehicleId === vehicle.id);
  const pendingAlerts = vehicleAlerts.filter((a) => a.status === "pending");

  // Listen for active chats on this vehicle
  useEffect(() => {
    const vehicleChatRef = ref(realtimeDb, `vehicleChats/${vehicle.id}`);

    const unsubscribe = onValue(vehicleChatRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const now = Date.now();

        if (data.isActive && data.expiresAt > now) {
          setActiveChat({
            sessionId: data.sessionId,
            expiresAt: data.expiresAt,
            scannerName: data.scannerName,
          });
        } else {
          setActiveChat(null);
        }
      } else {
        setActiveChat(null);
      }
    });

    return () => off(vehicleChatRef);
  }, [vehicle.id]);

  const getTimeRemaining = () => {
    if (!activeChat) return 0;
    return Math.max(0, Math.ceil((activeChat.expiresAt - Date.now()) / 60000));
  };

  if (showChat && activeChat) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden"
      >
        <div className="h-[450px]">
          <AnonymousChat
            vehicleId={vehicle.id}
            vehiclePlate={vehicle.plateNumber}
            isOwner={true}
            onClose={() => setShowChat(false)}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden"
    >
      {/* Vehicle Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{vehicle.plateNumber}</h2>
              <p className="text-muted-foreground text-sm">
                {vehicle.color} {vehicle.model}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                vehicle.isActive
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {vehicle.isActive ? "Active" : "Inactive"}
            </span>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <QrCode className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>QR Code for {vehicle.plateNumber}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <VehicleQRCode
                    qrUuid={vehicle.qrUuid}
                    plateNumber={vehicle.plateNumber}
                    vehicleModel={`${vehicle.color || ""} ${vehicle.model}`}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-border bg-secondary/50">
        {/* Alerts Indicator */}
        <div className="flex items-center gap-2">
          <Bell className={`w-4 h-4 ${pendingAlerts.length > 0 ? "text-destructive" : "text-muted-foreground"}`} />
          <span className={`text-sm font-medium ${pendingAlerts.length > 0 ? "text-destructive" : "text-muted-foreground"}`}>
            {pendingAlerts.length} Alert{pendingAlerts.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="w-px h-4 bg-border" />

        {/* Chat Indicator */}
        {activeChat ? (
          <button
            onClick={() => setShowChat(true)}
            className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">
              {activeChat.scannerName || "Someone"} wants to chat
            </span>
            <div className="flex items-center gap-1 ml-1">
              <Clock className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-primary">{getTimeRemaining()}m</span>
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">No active chat</span>
          </div>
        )}

        <div className="flex-1" />

        {/* Expand Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 hover:bg-muted rounded-full transition-colors"
        >
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Expandable Alerts Section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Recent Alerts
              </h4>

              {vehicleAlerts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No alerts yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {vehicleAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-xl border ${
                        alert.status === "pending"
                          ? "bg-destructive/5 border-destructive/20"
                          : "bg-muted border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle
                            className={`w-4 h-4 ${
                              alert.status === "pending" ? "text-destructive" : "text-muted-foreground"
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {alertLabels[alert.alertType] || alert.alertType}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            alert.status === "pending"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.timestamp.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VehicleCard;
