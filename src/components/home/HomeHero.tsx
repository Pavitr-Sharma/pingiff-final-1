import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import heroPhoneImage from "@/assets/pingwebsite-2.png";

const HomeHero = () => {
  const { userProfile } = useAuth();

  return (
    <section className="bg-cream py-12 md:py-16">
      <div className="container">
        {/* Welcome Message */}
        {userProfile?.fullName && (
          <div className="mb-8 p-4 bg-primary/10 rounded-xl border border-primary/20">
            <p className="text-lg font-semibold">
              Welcome back, <span className="text-primary">{userProfile.fullName.split(" ")[0]}</span>! 👋
            </p>
          </div>
        )}
        
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <div className="flex flex-col gap-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-brown">
              SCAN - READY FUTURE - QR THAT SPARKS CONVERSATION
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
              Bring Your Brand To Life With Bold, Custom{" "}
              <span className="highlight-yellow">QR Decals</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              PingMe transforms windshields, shop fronts, helmets, and merch into interactive hubs 
              that route fans to whatever matters—profiles, offers, playlists, or support.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link to="/dashboard">
                <Button 
                  className="bg-[hsl(30,75%,26%)] hover:bg-[hsl(30,75%,20%)] text-white font-semibold px-6 py-3 rounded-lg btn-hover-lift"
                >
                  Shop Signature Kits
                </Button>
              </Link>
              <Button 
                variant="outline"
                className="border-2 border-[hsl(30,75%,26%)] text-[hsl(30,75%,26%)] hover:bg-[hsl(30,75%,26%)] hover:text-white font-semibold px-6 py-3 rounded-lg btn-hover-lift"
              >
                Preview A Live Ping
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="flex items-center justify-center">
            <div className="w-64 md:w-80 lg:w-96">
              <img 
                src={heroPhoneImage} 
                alt="PingME App Interface" 
                className="w-full h-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;