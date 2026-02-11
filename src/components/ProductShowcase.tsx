import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import productCard from "@/assets/product-card.png";

const ProductShowcase = () => {
  const features = [
    "Premium quality card with QR code",
    "Fits perfectly on your car's front mirror",
    "No sticky residue - easy to install & remove",
    "Weatherproof and durable",
    "Lifetime QR code activation",
    "Instant notification to owner",
  ];

  return (
    <section id="product" className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The PingME Card
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A sleek, professional-looking card that hangs on your vehicle's mirror. 
            Anyone can scan it to contact you without knowing your number.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Product Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl transform -rotate-3" />
            <div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 transform rotate-1 shadow-2xl">
              <img 
                src={productCard} 
                alt="PingME QR Card" 
                className="w-full rounded-2xl shadow-lg"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <div className="inline-block px-4 py-1 bg-success/10 text-success rounded-full text-sm font-semibold mb-4">
                Best Seller
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                Standard Car Card
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">₹199</span>
                <span className="text-muted-foreground line-through">₹299</span>
                <span className="text-success font-semibold">Save ₹100</span>
              </div>
            </div>

            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-success/10 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <span className="text-foreground/80">{feature}</span>
                </li>
              ))}
            </ul>

            <Button size="xl" className="w-full sm:w-auto" asChild>
              <Link to="/prebook?product=standard-car-card">Order Now — ₹199</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
