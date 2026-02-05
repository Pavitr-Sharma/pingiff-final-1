import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/layouts/MainLayout";
import LandingHero from "@/components/landing/LandingHero";

const Landing = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const allowAuthed = params.get("from") === "back";

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  // If authenticated, redirect to home
  if (user && !allowAuthed) {
    return <Navigate to="/home" replace />;
  }

  return (
    <MainLayout>
      <LandingHero />
    </MainLayout>
  );
};

export default Landing;