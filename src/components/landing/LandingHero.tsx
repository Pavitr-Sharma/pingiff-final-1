import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const benefits = [
  { icon: "🔒", title: "Privacy First", description: "Masked numbers keep your contacts private" },
  { icon: "⚡", title: "Instant Alerts", description: "Real-time notifications for every scan" },
  { icon: "📁", title: "Secure Docs", description: "Encrypted document sharing" },
];

const LandingHero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If authenticated, redirect to home
  if (user) {
    navigate("/home");
    return null;
  }

  return (
    <main className="min-h-[calc(100vh-80px)] py-8 md:py-12">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Hero Content */}
          <section className="order-2 lg:order-1">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold leading-tight mb-5 tracking-tight">
                Connect securely with <span className="highlight-underline">PingMe</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Privacy-first contact sharing for modern professionals. No phone numbers exposed, just secure connections.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <div className="text-4xl">{benefit.icon}</div>
                  <h3 className="text-lg font-bold tracking-tight">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Registration Card */}
          <section className="order-1 lg:order-2 lg:sticky lg:top-24 self-start">
            <div 
              className="backdrop-blur-md rounded-2xl p-8 transition-all duration-200 hover:shadow-xl"
              style={{
                border: '2px solid rgba(255, 215, 0, 0.2)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 215, 0, 0.1) inset',
              }}
            >
              <h2 className="text-2xl font-bold mb-2">Get Started</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Create your PingMe account in seconds
              </p>

              <div className="flex flex-col gap-4">
                <Link to="/register">
                  <Button size="lg" className="w-full font-semibold">
                    Create Account
                  </Button>
                </Link>
                
                <p className="text-center text-muted-foreground text-sm">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="font-semibold text-foreground relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-primary after:to-yellow-400 after:transform after:scale-x-0 after:transition-transform hover:after:scale-x-100"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LandingHero;