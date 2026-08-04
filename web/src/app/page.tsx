import { HomeHero } from "@/components/home/HomeHero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { PathCards } from "@/components/home/PathCards";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <PathCards />
      <HowItWorks />
    </>
  );
}
