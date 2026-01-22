const stats = [
  { icon: "👥", value: "50,000+", label: "Happy Customers" },
  { icon: "🏍️", value: "1L+", label: "Vehicles Protected" },
  { icon: "⭐", value: "4.8", label: "Google Rating" },
  { icon: "🏢", value: "100+", label: "Cities Covered" },
];

const HomeStats = () => {
  return (
    <section className="bg-primary py-10">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 border-l border-foreground/10">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-extrabold leading-none text-foreground">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeStats;