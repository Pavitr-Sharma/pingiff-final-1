import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/ping-me-logo.png";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
];

interface NavbarProps {
  showLogout?: boolean;
}

const Navbar = ({ showLogout = false }: NavbarProps) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (link: typeof navLinks[0]) => {
    if (link.label === "Home") {
      return location.pathname === "/" || location.pathname === "/home";
    }
    return location.pathname.startsWith(link.to);
  };

  return (
    <header className="bg-background/95 backdrop-blur-md border-b border-border-light sticky top-0 z-50 py-2">
      <div className="container">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center transition-transform hover:scale-105">
            <img src={logo} alt="PingME" className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 flex-wrap">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={`relative text-muted-foreground font-medium transition-colors hover:text-foreground
                  after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 
                  after:bg-primary after:transform after:scale-x-0 after:origin-center after:transition-transform
                  hover:after:scale-x-100
                  ${isActive(link) ? "text-foreground after:scale-x-100" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 rounded-full bg-foreground text-background font-semibold text-sm transition-all hover:opacity-90"
                >
                  Dashboard
                </Link>
                {showLogout && (
                  <button
                    onClick={logout}
                    className="px-5 py-2.5 rounded-full border-2 border-foreground text-foreground font-semibold text-sm transition-all hover:bg-foreground hover:text-background"
                  >
                    Logout
                  </button>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-full border-2 border-foreground text-foreground font-semibold text-sm transition-all hover:bg-foreground hover:text-background"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-full bg-foreground text-background font-semibold text-sm transition-all hover:opacity-90"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-medium transition-colors ${
                    isActive(link) ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 rounded-lg bg-foreground text-background font-semibold text-center"
                    >
                      Dashboard
                    </Link>
                    {showLogout && (
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="py-2.5 rounded-lg border-2 border-foreground text-foreground font-semibold"
                      >
                        Logout
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 rounded-lg border-2 border-foreground text-foreground font-semibold text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 rounded-lg bg-foreground text-background font-semibold text-center"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;