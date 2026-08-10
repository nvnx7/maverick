import { AudienceCards } from "@/components/home/AudienceCards";
import { BottomCTA } from "@/components/home/BottomCTA";
import { HeroSection } from "@/components/home/HeroSection";
import { MarketplacePreview } from "@/components/home/MarketplacePreview";
import { ProtocolSection } from "@/components/home/ProtocolSection";
import { TechStackSection } from "@/components/home/TechStackSection";

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
