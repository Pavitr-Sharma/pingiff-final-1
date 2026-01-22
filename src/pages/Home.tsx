import MainLayout from "@/layouts/MainLayout";
import HomeHero from "@/components/home/HomeHero";
import HomeStats from "@/components/home/HomeStats";
import HomeVehicleTag from "@/components/home/HomeVehicleTag";
import HomeWhatWeDo from "@/components/home/HomeWhatWeDo";
import HomeContact from "@/components/home/HomeContact";
import HomeFAQ from "@/components/home/HomeFAQ";

const Home = () => {
  return (
    <MainLayout showLogout>
      <HomeHero />
      <HomeStats />
      <HomeVehicleTag />
      <HomeWhatWeDo />
      <HomeContact />
      <HomeFAQ />
    </MainLayout>
  );
};

export default Home;