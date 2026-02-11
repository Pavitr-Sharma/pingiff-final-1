import MainLayout from "@/layouts/MainLayout";
import { Shield, Phone, Bell, Eye, Zap, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import productCard from "@/assets/product-card.png";

const products = [
  {
    title: "Standard Car Card",
    price: "₹199",
    originalPrice: "₹299",
    image: productCard,
    features: [
      "Premium quality card with QR code",
      "Fits perfectly on car's front mirror",
      "Weatherproof and durable",
      "Lifetime QR code activation",
    ],
    popular: true,
  },
  {
    title: "Bike Tag",
    price: "₹149",
    originalPrice: "₹199",
    emoji: "🏍️",
    features: ["Compact design for bikes", "UV resistant material", "Easy installation", "Lifetime QR code activation"],
  },
  {
    title: "Laptop Tag",
    price: "₹99",
    originalPrice: "₹149",
    emoji: "💻",
    features: ["Sleek sticker design", "Perfect for laptops & tablets", "Easy to apply", "Lifetime QR code activation"],
  },
  {
    title: "Keychain Tag",
    price: "₹79",
    originalPrice: "₹99",
    emoji: "🔑",
    features: ["Durable metal keychain", "QR code engraved", "Water resistant", "Lifetime activation"],
  },
];

const Products = () => {
  return (
    <MainLayout>
      <div className="py-16">
        <div className="container">
          <p className="section-eyebrow">Our Products</p>
          <h1 className="section-title text-4xl">Choose the perfect PingME tag for your needs</h1>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div
                key={index}
                className={`bg-card rounded-2xl p-6 border transition-all hover:shadow-lg ${
                  product.popular ? "border-primary border-2" : "border-border"
                }`}
              >
                {product.popular && (
                  <span className="inline-block px-3 py-1 bg-success/10 text-success rounded-full text-xs font-semibold mb-4">
                    Best Seller
                  </span>
                )}

                <div className="aspect-square bg-secondary rounded-xl mb-4 flex items-center justify-center">
                  {product.image ? (
                    <img src={product.image} alt={product.title} className="max-w-[100%] max-h-[100%] object-contain" />
                  ) : (
                    <span className="text-6xl">{product.emoji}</span>
                  )}
                </div>

                <h3 className="font-bold text-lg mb-2">{product.title}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold">{product.price}</span>
                  <span className="text-muted-foreground line-through text-sm">{product.originalPrice}</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {product.features.map((feature, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-success">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link to={`/prebook?product=${product.title.toLowerCase().replace(/\s+/g, "-")}`}>
                  <Button className="w-full" variant={product.popular ? "default" : "outline"}>
                    Order Now
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Products;
