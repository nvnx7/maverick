import { HeroSection } from "@/components/home/HeroSection";
import { ProtocolSection } from "@/components/home/ProtocolSection";
import { MarketplacePreview } from "@/components/home/MarketplacePreview";
import { AudienceCards } from "@/components/home/AudienceCards";
import { TechStackSection } from "@/components/home/TechStackSection";
import { BottomCTA } from "@/components/home/BottomCTA";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProtocolSection />
      <MarketplacePreview />
      <AudienceCards />
      <TechStackSection />
      <BottomCTA />
    </>
  );
}

