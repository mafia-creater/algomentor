import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeatureSection";
import StatsSection from "@/components/sections/StatsSection";
import WorkflowSection from "@/components/sections/WorkFlow";

export default function HomePage() {
  return (
    <main className="flex-grow">
      <HeroSection />
      
      <FeaturesSection />
      <WorkflowSection />
    </main>
  );
}