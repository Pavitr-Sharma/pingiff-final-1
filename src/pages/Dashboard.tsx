import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  Plus,
  ShoppingCart,
  User,
  LogOut,
  Car,
  Bell,
  Settings,
  AlertCircle,
  Loader2,
  MessageCircle,
} from "lucide-react";
import VehicleQRCode from "@/components/qr/VehicleQRCode";
import logo from "@/assets/ping-me-logo.png";
import productCard from "@/assets/product-card.png";
import { useAuth } from "@/contexts/AuthContext";
import { useVehicles, useAlerts, addVehicle } from "@/hooks/useFirestore";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Dashboard = () => {
  const { user, userProfile, logout } = useAuth();
  const { vehicles, loading: vehiclesLoading } = useVehicles(user?.uid);
  const vehicleIds = vehicles.map((v) => v.id);
  const { alerts } = useAlerts(vehicleIds);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [showAddVehicle, setShowAddVehicle] = useState(false);

  // Add vehicle form state
  const [newPlate, setNewPlate] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newType, setNewType] = useState<"Car" | "Bike">("Car");
  const [newColor, setNewColor] = useState("");
  const [addingVehicle, setAddingVehicle] = useState(false);

  const pendingAlerts = alerts.filter((a) => a.status === "pending").length;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddVehicle = async () => {
    if (!newPlate.trim() || !newModel.trim()) {
      toast({
        title: "Required Fields",
        description: "Please fill in plate number and model.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    setAddingVehicle(true);
    try {
      await addVehicle(user.uid, newPlate, newModel, newType, newColor);
      toast({
        title: "Vehicle Added!",
        description: "Your vehicle has been registered successfully.",
      });
      setShowAddVehicle(false);
      setNewPlate("");
      setNewModel("");
      setNewColor("");
    } catch (error) {
      toast({
        title: "Failed to Add Vehicle",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingVehicle(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link to="/">
            <img src={logo} alt="PingME" className="h-10" />
          </Link>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              {pendingAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {pendingAlerts}
                </span>
              )}
            </button>
            <button className="p-2 hover:bg-muted rounded-full transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Welcome Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold">Welcome, {userProfile?.fullName?.split(" ")[0] || "User"}!</h1>
          <p className="text-muted-foreground">Manage your vehicle protection</p>
        </motion.div>

        {/* Vehicles */}
        {vehiclesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : vehicles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-2xl p-8 text-center border border-border mb-6"
          >
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">No Vehicles Registered</h3>
            <p className="text-muted-foreground mb-4">Add your first vehicle to get started.</p>
            <Button onClick={() => setShowAddVehicle(true)}>
              <Plus className="w-4 h-4" />
              Add Vehicle
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-4 mb-6">
            {vehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-lg border border-border"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Car className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">{vehicle.plateNumber}</h2>
                      <p className="text-muted-foreground text-sm">
                        {vehicle.color} {vehicle.model}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      vehicle.isActive ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {vehicle.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <QrCode className="w-4 h-4" />
                        View QR
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
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
            <DialogTrigger asChild>
              <button className="bg-card p-4 rounded-2xl border border-border text-left hover:border-primary/50 hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-sm">Add Vehicle</h3>
                <p className="text-muted-foreground text-xs">Register another vehicle</p>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="newPlate">Plate Number</Label>
                  <Input
                    id="newPlate"
                    placeholder="UP53 DJ1234"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="newModel">Vehicle Model</Label>
                  <Input
                    id="newModel"
                    placeholder="Honda Activa"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Vehicle Type</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setNewType("Car")}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        newType === "Car" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-xl">🚗</span>
                      <p className="font-medium text-sm mt-1">Car</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewType("Bike")}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        newType === "Bike" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-xl">🏍️</span>
                      <p className="font-medium text-sm mt-1">Bike</p>
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newColor">Color (Optional)</Label>
                  <Input
                    id="newColor"
                    placeholder="White"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <Button size="full" onClick={handleAddVehicle} disabled={addingVehicle}>
                  {addingVehicle ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Vehicle
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <button
            className="bg-card p-4 rounded-2xl border border-border text-left hover:border-primary/50 hover:shadow-md transition-all"
            onClick={() => toast({ title: "Coming Soon", description: "Alert history will be available soon!" })}
          >
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3 relative">
              <AlertCircle className="w-6 h-6" />
              {pendingAlerts > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {pendingAlerts}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm">Alerts</h3>
            <p className="text-muted-foreground text-xs">{pendingAlerts} pending alerts</p>
          </button>
        </div>

        {/* Order Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">Order Products</h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl overflow-hidden border border-border shadow-lg"
          >
            <div className="bg-primary/10 flex items-center justify-center py-6 md:py-8">
              <img src={productCard} alt="PingME Card" className="w-[220px] md:w-[280px] lg:w-[320px] object-contain" />
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">Standard Car Card</h3>
                  <p className="text-muted-foreground text-sm">With QR code for your vehicle</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">₹199</span>
                  <p className="text-xs text-muted-foreground line-through">₹299</p>
                </div>
              </div>
              <Button
                size="full"
                onClick={() =>
                  toast({ title: "Coming Soon", description: "Payment integration will be available soon!" })
                }
              >
                <ShoppingCart className="w-4 h-4" />
                Order Now
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Custom Products */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">Custom QR Products</h2>
          <div className="grid grid-cols-3 gap-4">
            <CustomProductCard emoji="💻" title="Laptop Tag" price="₹99" />
            <CustomProductCard emoji="🔑" title="Keychain" price="₹79" />
            <CustomProductCard emoji="👜" title="Bag Tag" price="₹89" />
          </div>
        </div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-6 border border-border"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold">{userProfile?.fullName || "User"}</h3>
              <p className="text-muted-foreground text-sm">
                {userProfile?.phoneNumber || userProfile?.email || "No contact info"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="full"
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

const CustomProductCard = ({ emoji, title, price }: { emoji: string; title: string; price: string }) => {
  const { toast } = useToast();

  return (
    <div
      onClick={() => toast({ title: "Coming Soon", description: "Custom products will be available soon!" })}
      className="bg-card p-4 rounded-xl border border-border text-center hover:border-primary/50 transition-colors cursor-pointer"
    >
      <span className="text-2xl">{emoji}</span>
      <h4 className="font-medium text-sm mt-2">{title}</h4>
      <p className="text-primary font-bold text-sm">{price}</p>
    </div>
  );
};

export default Dashboard;
