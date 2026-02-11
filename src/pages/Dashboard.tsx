import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, User, LogOut, Car, Bell, Settings, Loader2, X } from "lucide-react";
import VehicleCard from "@/components/vehicle/VehicleCard";
import logo from "@/assets/ping-me-logo.png";
import productCard from "@/assets/product-card.png";
import { useAuth } from "@/contexts/AuthContext";
import { useVehicles, useAlerts, addVehicle } from "@/hooks/useFirestore";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const Dashboard = () => {
  const { user, userProfile, logout } = useAuth();
  const { vehicles, loading: vehiclesLoading } = useVehicles(user?.uid);
  const vehicleIds = vehicles.map((v) => v.id);
  const { alerts } = useAlerts(vehicleIds);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Add vehicle form state
  const [newPlate, setNewPlate] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newType, setNewType] = useState<"Car" | "Bike">("Car");
  const [newColor, setNewColor] = useState("");
  const [addingVehicle, setAddingVehicle] = useState(false);

  const pendingAlerts = useMemo(() => alerts.filter((a) => a.status === "pending"), [alerts]);
  const pendingAlertCount = pendingAlerts.length;

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
      setNewType("Car");
    } catch (error: any) {
      toast({
        title: "Failed to Add Vehicle",
        description: error.message || "Please try again.",
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

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-muted-foreground font-medium hover:text-foreground transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-muted-foreground font-medium hover:text-foreground transition-colors">
              Products
            </Link>
            <Link to="/about" className="text-muted-foreground font-medium hover:text-foreground transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="text-muted-foreground font-medium hover:text-foreground transition-colors">
              Contact Us
            </Link>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-full border-2 border-foreground text-foreground font-semibold text-sm transition-all hover:bg-foreground hover:text-background"
            >
              Logout
            </button>
          </nav>
          <div className="flex items-center gap-2">
            {/* Notifications Sheet */}
            <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
              <SheetTrigger asChild>
                <button className="p-2 hover:bg-muted rounded-full transition-colors relative">
                  <Bell className="w-5 h-5" />
                  {pendingAlertCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                      {pendingAlertCount}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Notifications</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-3">
                  {pendingAlerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No pending notifications</p>
                    </div>
                  ) : (
                    pendingAlerts.map((alert) => {
                      const vehicle = vehicles.find((v) => v.id === alert.vehicleId);
                      return (
                        <div key={alert.id} className="p-3 rounded-xl border bg-destructive/5 border-destructive/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Bell className="w-4 h-4 text-destructive" />
                            <span className="font-medium text-sm">{vehicle?.plateNumber || "Unknown"}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.alertType}</p>
                          <p className="text-xs text-muted-foreground mt-1">{alert.timestamp.toLocaleString()}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </SheetContent>
            </Sheet>
            {/* Settings Sheet */}
            <Sheet open={showSettings} onOpenChange={setShowSettings}>
              <SheetTrigger asChild>
                <button className="p-2 hover:bg-muted rounded-full transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Settings</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div className="p-4 rounded-xl border border-border">
                    <h3 className="font-medium mb-2">Account</h3>
                    <p className="text-sm text-muted-foreground">{userProfile?.fullName || "User"}</p>
                    <p className="text-sm text-muted-foreground">{userProfile?.email || userProfile?.phoneNumber}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border">
                    <h3 className="font-medium mb-2">Vehicles</h3>
                    <p className="text-sm text-muted-foreground">
                      {vehicles.length} registered vehicle{vehicles.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="full"
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      setShowSettings(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
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
              <VehicleCard key={vehicle.id} vehicle={vehicle} alerts={alerts} index={index} />
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
            <DialogTrigger asChild>
              <button className="w-full bg-card p-4 rounded-2xl border border-border text-left hover:border-primary/50 hover:shadow-md transition-all flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Add Vehicle</h3>
                  <p className="text-muted-foreground text-sm">Register another vehicle to protect</p>
                </div>
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
            <div className="bg-primary/10 flex items-center justify-center py-3 md:py-6">
              <img src={productCard} alt="PingME Card" className="w-[300px] md:w-[400px] lg:w-[500px] object-contain" />
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">Standard Car Card</h3>
                  <p className="text-muted-foreground text-sm">With QR code for your vehicle</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold">₹499</span>
                  <p className="text-xs text-muted-foreground line-through">₹299</p>
                </div>
              </div>
              <Button size="full" asChild>
                <Link to="/prebook?product=standard-car-card">
                  <ShoppingCart className="w-4 h-4" />
                  Order Now
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Custom Products */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">Custom QR Products</h2>
          <div className="grid grid-cols-3 gap-4">
            <CustomProductCard emoji="💻" title="Laptop Tag" price="₹199" />
            <CustomProductCard emoji="🔑" title="Keychain" price="₹179" />
            <CustomProductCard emoji="👜" title="Bag Tag" price="₹189" />
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
  const slug = title.toLowerCase().replace(/\s+/g, "-");

  return (
    <Link
      to={`/prebook?product=${slug}`}
      className="bg-card p-4 rounded-xl border border-border text-center hover:border-primary/50 transition-colors cursor-pointer block"
    >
      <span className="text-2xl">{emoji}</span>
      <h4 className="font-medium text-sm mt-2">{title}</h4>
      <p className="text-primary font-bold text-sm">{price}</p>
    </Link>
  );
};

export default Dashboard;
