import Navbar from "@/components/Navbar";
import FooterNew from "@/components/FooterNew";

interface MainLayoutProps {
  children: React.ReactNode;
  showLogout?: boolean;
}

const MainLayout = ({ children, showLogout = false }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar showLogout={showLogout} />
      <main className="flex-1">{children}</main>
      <FooterNew />
    </div>
  );
};

export default MainLayout;