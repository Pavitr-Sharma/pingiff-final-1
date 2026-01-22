import productImage from "@/assets/product-card.png";

const vehicleFeatures = [
  {
    icon: "🔒",
    title: "Private Contact",
    description: "Receive masked calls, SMS, and WhatsApp alerts instantly.",
  },
  {
    icon: "💬",
    title: "WhatsApp Update",
    description: "Get real-time WhatsApp notifications when someone scans your QR.",
  },
  {
    icon: "📤",
    title: "Upload Files",
    description: "Add RC, insurance, and PUC documents secured with OTP.",
  },
  {
    icon: "⭐",
    title: "Emergency Call",
    description: "Add backup emergency contacts directly inside the tag.",
  },
];

const HomeVehicleTag = () => {
  return (
    <section className="bg-background py-16">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Image */}
          <div className="flex flex-col items-center">
            <img 
              src={productImage} 
              alt="PingME Vehicle Contact Tag" 
              className="w-full max-w-md object-contain rounded-lg"
            />
            <p className="text-center mt-4 text-foreground">
              or call 7347340000
            </p>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-tight tracking-tight">
              Privacy And Security at its best, PingME Vehicle Contact Tag
            </h2>
            <div className="flex flex-col gap-8">
              {vehicleFeatures.map((feature, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="text-3xl flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">
                      {index + 1}. {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeVehicleTag;