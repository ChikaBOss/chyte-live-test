import PublicLayout from "@/components/PublicLayout";

import HeroSection from "@/components/HeroSection";
import TopVendorsSection from "@/components/TopVendorsSection";
import ChefsSection from "@/components/ChefsSection";
import FoodVendorsSection from "@/components/FoodVendorsSection";
import PharmacySection from "@/components/PharmacySection";
import HowItWorksSection from "@/components/HowItWorksSection";

export default function HomePage() {
  return (
    <PublicLayout>
      <main className="px-4 md:px-8">
        <HeroSection />
        <TopVendorsSection />
        <ChefsSection />
        <FoodVendorsSection />
        <PharmacySection />
        <HowItWorksSection />
      </main>
    </PublicLayout>
  );
}