import { HeroSection } from "@/components/home/HeroSection";
import { ProtocolSection } from "@/components/home/ProtocolSection";
import { AudienceCards } from "@/components/home/AudienceCards";
import { BottomCTA } from "@/components/home/BottomCTA";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProtocolSection />
      <AudienceCards />
      <BottomCTA />
    </>
  );
}
