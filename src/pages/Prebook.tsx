import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createPrebooking } from "@/lib/prebookService";
import { Loader2, CheckCircle, ShoppingBag } from "lucide-react";

const productMap: Record<string, { title: string; price: string; emoji?: string }> = {
  "pingme-car-card": { title: "PingMe Car Card", price: "₹499" },
  "bike-tag": { title: "Bike Tag", price: "₹249", emoji: "🏍️" },
  "laptop-tag": { title: "Laptop Tag", price: "₹199", emoji: "💻" },
  "keychain-tag": { title: "Keychain Tag", price: "₹179", emoji: "🔑" },
};

const indianStates = [
  "Chandigarh",
  "New Delhi",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
];

const Prebook = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userProfile } = useAuth();

  const productSlug = searchParams.get("product") || "pingme-car-card";
  const product = productMap[productSlug] || productMap["pingme-car-card"];

  const [fullName, setFullName] = useState(userProfile?.fullName || "");
  const [email, setEmail] = useState(userProfile?.email || "");
  const [phone, setPhone] = useState(userProfile?.phoneNumber || "");
  const [address, setAddress] = useState(userProfile?.address || "");
  const [city, setCity] = useState("");
  const [state, setState] = useState(userProfile?.state || "");
  const [pincode, setPincode] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !state || !pincode.trim()) {
      toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await createPrebooking({
        productTitle: product.title,
        productPrice: product.price,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state,
        pincode: pincode.trim(),
        quantity,
        userId: user?.uid || undefined,
        status: "pending",
      });
      setSuccess(true);
      toast({ title: "Pre-booking Confirmed!", description: "We'll contact you soon with payment details." });
    } catch (error: any) {
      toast({ title: "Failed", description: error.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <MainLayout>
        <div className="container py-20 text-center max-w-md mx-auto">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Pre-booking Confirmed!</h1>
          <p className="text-muted-foreground mb-2">
            Your <strong>{product.title}</strong> (x{quantity}) has been pre-booked.
          </p>
          <p className="text-muted-foreground mb-6">
            We'll reach out to you shortly with payment and delivery details.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/products")}>Browse More</Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-12 max-w-lg mx-auto">
        {/* Product Summary */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-3xl">
            {product.emoji || <ShoppingBag className="w-7 h-7 text-primary" />}
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg">{product.title}</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold">{product.price}</span>
              <span className="text-muted-foreground text-sm">× {quantity}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 border rounded-xl">
            <button
              className="px-3 py-1 hover:bg-muted rounded-l-xl"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              −
            </button>
            <span className="px-2 font-medium">{quantity}</span>
            <button
              className="px-3 py-1 hover:bg-muted rounded-r-xl"
              onClick={() => setQuantity(Math.min(10, quantity + 1))}
            >
              +
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6">Pre-book Your Order</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="Arpit Pathak"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="address">Delivery Address *</Label>
            <Input
              id="address"
              placeholder="House number, Street, Locality"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                placeholder="160012"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="state">State *</Label>
            <select
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="mt-1 w-full h-11 rounded-xl border border-border bg-background px-3 text-sm"
            >
              <option value="">Select State</option>
              {indianStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" size="full" disabled={submitting} className="mt-6">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Pre-booking"}
          </Button>
        </form>
      </div>
    </MainLayout>
  );
};

export default Prebook;
