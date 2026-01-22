const whatWeDoFeatures = [
  {
    title: "Car / Bike Ping Tag",
    items: [
      "Masked calls, WhatsApp & SMS relays",
      "Emergency ping + backup contacts",
      "Vehicle entry / exit logs and audit",
      "Insurance & PUC reminders on autopilot",
    ],
  },
  {
    title: "Business Sampark Kit",
    items: [
      "White-labeled QR / NFC with your logo",
      "Staff roles, approvals, and bulk seats",
      "Analytics dashboard with service logs",
      "Dedicated success manager",
    ],
  },
  {
    title: "Society & Apartment Kit",
    items: [
      "Visitor QR pass for vehicle entry",
      "Guard app with license plate scan",
      "Emergency broadcasts to all residents",
      "Monthly parking slot reports",
    ],
  },
  {
    title: "Starter Pack For Shops",
    items: [
      "Customizable art + marketing standees",
      "Training and scripts for your team",
      "Counter-top boxes & POS display",
      "60 day money-back program",
    ],
  },
];

const HomeWhatWeDo = () => {
  return (
    <section className="bg-cream py-16">
      <div className="container">
        <p className="section-eyebrow">What We Do</p>
        <h2 className="section-title">
          Allow people to contact you in case of any issue with your parked vehicle.
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {whatWeDoFeatures.map((feature, index) => (
            <div key={index} className="feature-card-bordered">
              <h3 className="text-xl font-bold text-brown mb-4">
                {feature.title}
              </h3>
              <ul className="space-y-2">
                {feature.items.map((item, itemIndex) => (
                  <li 
                    key={itemIndex} 
                    className="text-sm text-muted-foreground pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-brown before:font-bold"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeWhatWeDo;