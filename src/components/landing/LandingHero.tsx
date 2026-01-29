import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Shield, Zap, FileText, ArrowRight, Check } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Privacy First",
    description: "Masked numbers keep your contacts private",
  },
  {
    icon: Zap,
    title: "Instant Alerts",
    description: "Real-time notifications for every scan",
  },
  {
    icon: FileText,
    title: "Secure Docs",
    description: "Encrypted document sharing",
  },
];

const trustIndicators = ["No phone number exposed", "Works on any vehicle", "Setup in 60 seconds"];

const LandingHero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate("/home");
    return null;
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-cream overflow-auto flex">
      <div className="container flex py-6 md:py-8 lg:py-10">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-14 items-center w-full">
          {/* Left Column - Hero Content - Shows FIRST on mobile */}
          <section className="order-1 lg:order-1 space-y-4 lg:space-y-8">
            {/* Badge */}

            {/* Headline */}
            <div className="space-y-3 lg:space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-[3.5rem] font-extrabold leading-[1.28] tracking-tight text-foreground">
                Connect securely
                <br />
                <span className="text-[0.95em]">
                  with{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10">PingMe</span>
                    <span className="absolute -bottom-1 left-0 w-full h-3 bg-primary/40 -z-0 rounded-sm"></span>
                  </span>
                </span>
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg">
                Privacy-first contact sharing for modern professionals. No phone numbers exposed, just secure
                connections.
              </p>
            </div>

            {/* Trust Indicators - Hidden on mobile for compact view */}
            <div className="hidden md:flex flex-wrap gap-4">
              {trustIndicators.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item}</span>
                </div>
              ))}
            </div>

            {/* Benefits Grid - Hidden on mobile for compact view */}
            <div className="hidden md:grid sm:grid-cols-3 gap-4 pt-2">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="group p-4 rounded-xl bg-background/60 border border-border/50 hover:border-primary/30 hover:bg-background transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center mb-3 group-hover:bg-primary/25 transition-colors">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-1">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Right Column - Registration Card - Shows SECOND on mobile */}
          <section className="order-2 lg:order-2">
            <div className="relative bg-background rounded-2xl lg:rounded-3xl p-6 md:p-8 lg:p-10 shadow-xl border-2 border-primary/20 overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

              <div className="relative z-10 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">Get Started</h2>
                  <p className="text-muted-foreground">Create your PingMe account in seconds</p>
                </div>

                {/* Value Props */}
                <div className="space-y-3 py-4 border-y border-border/50">
                  {["Free QR code for your vehicle", "Instant alert notifications", "Anonymous chat with scanners"].map(
                    (item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{item}</span>
                      </div>
                    ),
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-4">
                  <Link to="/register" className="block">
                    <Button size="full" className="group text-base font-bold">
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>

                  <p className="text-center text-muted-foreground text-sm">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-bold text-foreground hover:text-primary transition-colors underline underline-offset-4"
                    >
                      Login
                    </Link>
                  </p>
                </div>

                {/* Trust Badge */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Secure & Private • No spam ever</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LandingHero;
