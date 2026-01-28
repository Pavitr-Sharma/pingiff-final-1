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
    <section className="bg-background py-8 md:py-12">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image */}
          <div className="flex flex-col items-center lg:items-start">
            <img
              src={productImage}
              alt="PingME Vehicle Contact Tag"
              className="w-full max-w-sm lg:max-w-md object-contain rounded-lg"
            />
            {/* <p className="text-center lg:text-left mt-3 text-muted-foreground text-sm">
              or call 7347340000
            </p> */}
          </div>

          {/* Features */}
          <div className="flex flex-col justify-center">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 leading-tight tracking-tight">
              Privacy And Security at its best, PingME Vehicle Contact Tag
            </h2>
            <div className="flex flex-col gap-5">
              {vehicleFeatures.map((feature, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="text-2xl flex-shrink-0 w-8">{feature.icon}</div>
                  <div>
                    <h3 className="text-base font-bold mb-0.5">
                      {index + 1}. {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
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
