
import { PageProps } from "@/config/types";
import HeroSection from "@/components/homepage/hero-section";
import { FeaturesSection } from "@/components/homepage/features-section";
import LastestArrival from "@/components/homepage/lastest-arrival";
import OurBrandSection from "@/components/homepage/our-brands-section";
export default async function Home(props: PageProps) {
  const searchParams = await props.searchParams;

  
  return (
    <div className="w-full min-h-screen bg-background">
      <HeroSection searchParams={searchParams} />
      <FeaturesSection />
      <LastestArrival />
      <OurBrandSection  />
    </div>
  );
}
